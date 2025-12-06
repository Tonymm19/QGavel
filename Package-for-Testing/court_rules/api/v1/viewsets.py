from django.contrib.auth import authenticate
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from rest_framework import mixins, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from court_rules.models import (
    AuditAction,
    AuditLog,
    Case,
    Deadline,
    DeadlineReminder,
    Judge,
    Organization,
    Rule,
    User,
    UserAccessGrant,
    Subscription,
    SubscriptionHistory,
    BillingRecord,
)
from court_rules.poc_models import (
    PocChangeEvent,
    PocComplianceCheck,
    PocCourt,
    PocJudge,
    PocJudgeProcNode,
    PocRequirement,
    PocRuleNode,
)
from court_rules.services.audit import format_deadline_snapshot, record_audit_event
from court_rules.utils.email import send_password_reset_email, send_welcome_email, send_access_grant_notification
from court_rules.utils.tokens import generate_password_reset_token, validate_password_reset_token
from court_rules.api.v1.serializers import (
    AuditLogSerializer,
    BillingRecordCreateSerializer,
    BillingRecordSerializer,
    BillingRecordUpdateSerializer,
    CaseSerializer,
    DeadlineCreateSerializer,
    DeadlineReminderSerializer,
    DeadlineSerializer,
    JudgeSerializer,
    OrganizationSerializer,
    PocChangeEventSerializer,
    PocComplianceCheckSerializer,
    PocCourtSerializer,
    PocJudgeProcNodeSerializer,
    PocJudgeSerializer,
    PocRequirementSerializer,
    PocRuleNodeSerializer,
    RuleSerializer,
    SubscriptionHistorySerializer,
    SubscriptionSerializer,
    UserAccessGrantSerializer,
    UserCreateSerializer,
    UserPasswordChangeSerializer,
    UserPasswordResetSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from court_rules.api.v1.permissions import (
    CanGrantAccess,
    CanManageBillingRecord,
    CanManageOrganization,
    CanManageSubscription,
    CanManageUsers,
    CanViewBillingRecord,
    CanViewOrganization,
    CanViewSubscription,
    IsSuperAdmin,
    IsSuperAdminOrFirmAdmin,
)


class JudgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Judge.objects.select_related('court', 'holiday_calendar').order_by('full_name')
    serializer_class = JudgeSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['court']


class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.select_related('court', 'lead_attorney', 'organization').order_by('-filing_date', 'caption')
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options', 'post', 'patch', 'delete']
    filterset_fields = ['status', 'court', 'lead_attorney']
    
    def get_queryset(self):
        """
        Filter cases based on user's organization and access grants.
        - Super Admins see all cases
        - Site Admins see all cases in their organization
        - Other users see cases they own or have been granted access to
        """
        user = self.request.user
        
        # Super Admins see everything
        if user.role == 'super_admin':
            return Case.objects.select_related('court', 'lead_attorney', 'organization').order_by('-filing_date', 'caption')
        
        # Site Admins see all cases in their organization
        if user.role == 'firm_admin':
            return Case.objects.select_related('court', 'lead_attorney', 'organization').filter(
                organization=user.organization
            ).order_by('-filing_date', 'caption')
        
        # Other users see cases they own or have been granted access to
        from court_rules.models import UserAccessGrant
        
        # Get list of users this user can access
        accessible_users = UserAccessGrant.objects.filter(
            granted_to=user,
            is_active=True
        ).values_list('can_access_user', flat=True)
        
        # Include the user themselves and users they have access to
        accessible_user_ids = list(accessible_users) + [user.id]
        
        return Case.objects.select_related('court', 'lead_attorney', 'organization').filter(
            Q(lead_attorney__id__in=accessible_user_ids) | Q(lead_attorney=user),
            organization=user.organization
        ).order_by('-filing_date', 'caption')


class DeadlineViewSet(mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.ReadOnlyModelViewSet):
    queryset = (
        Deadline.objects.select_related(
            'case',
            'case__organization',
            'holiday_calendar',
            'owner',
            'created_by',
            'updated_by',
        )
        .order_by('due_at')
    )
    serializer_class = DeadlineSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options', 'patch', 'post']
    filterset_fields = ['case', 'status', 'owner']
    
    def get_queryset(self):
        """
        Filter deadlines based on user's organization and access grants.
        - Super Admins see all deadlines
        - Site Admins see all deadlines in their organization
        - Other users see deadlines they own or for cases they have access to
        """
        user = self.request.user
        
        # Super Admins see everything
        if user.role == 'super_admin':
            return (
                Deadline.objects.select_related(
                    'case',
                    'case__organization',
                    'holiday_calendar',
                    'owner',
                    'created_by',
                    'updated_by',
                )
                .order_by('due_at')
            )
        
        # Site Admins see all deadlines in their organization
        if user.role == 'firm_admin':
            return (
                Deadline.objects.select_related(
                    'case',
                    'case__organization',
                    'holiday_calendar',
                    'owner',
                    'created_by',
                    'updated_by',
                )
                .filter(case__organization=user.organization)
                .order_by('due_at')
            )
        
        # Other users see deadlines they own or for cases they have access to
        from court_rules.models import UserAccessGrant
        
        # Get list of users this user can access
        accessible_users = UserAccessGrant.objects.filter(
            granted_to=user,
            is_active=True
        ).values_list('can_access_user', flat=True)
        
        # Include the user themselves and users they have access to
        accessible_user_ids = list(accessible_users) + [user.id]
        
        return (
            Deadline.objects.select_related(
                'case',
                'case__organization',
                'holiday_calendar',
                'owner',
                'created_by',
                'updated_by',
            )
            .filter(
                Q(owner__id__in=accessible_user_ids) | Q(owner=user),
                case__organization=user.organization
            )
            .order_by('due_at')
        )

    def perform_update(self, serializer):
        deadline = self.get_object()
        before_snapshot = format_deadline_snapshot(deadline)
        instance = serializer.save(updated_by=self.request.user)
        after_snapshot = format_deadline_snapshot(instance)
        record_audit_event(
            actor=self.request.user,
            entity_table='deadlines',
            entity_id=instance.id,
            action=AuditAction.UPDATE,
            before=before_snapshot,
            after=after_snapshot,
        )

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        record_audit_event(
            actor=self.request.user,
            entity_table='deadlines',
            entity_id=instance.id,
            action=AuditAction.CREATE,
            after=format_deadline_snapshot(instance),
        )

    def get_serializer_class(self):
        if self.request.method.lower() == 'post':
            return DeadlineCreateSerializer
        return super().get_serializer_class()


class RuleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rule.objects.select_related('superseded_by').order_by('citation')
    serializer_class = RuleSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['source_type', 'jurisdiction']


class DeadlineReminderViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = DeadlineReminder.objects.select_related('deadline', 'deadline__case').order_by('notify_at')
    serializer_class = DeadlineReminderSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['deadline', 'channel', 'sent']
    http_method_names = ['get', 'post', 'delete', 'head', 'options']


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['entity_table', 'entity_id', 'action']


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.order_by('first_name', 'last_name')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']


class PocCourtViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PocCourt.objects.order_by('code')
    serializer_class = PocCourtSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']


class PocRuleNodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PocRuleNode.objects.select_related('court', 'parent').order_by('court__code', 'rule_code', 'ordinal')
    serializer_class = PocRuleNodeSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['court__code', 'rule_code', 'node_type', 'parent']


class PocJudgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PocJudge.objects.select_related('court').order_by('display_name')
    serializer_class = PocJudgeSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['court__code']


class PocJudgeProcNodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PocJudgeProcNode.objects.select_related('judge', 'parent').order_by('judge__display_name', 'ordinal')
    serializer_class = PocJudgeProcNodeSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['judge', 'node_type', 'parent']


class PocRequirementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PocRequirement.objects.order_by('requirement_type', 'source_type')
    serializer_class = PocRequirementSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['source_type', 'source_id', 'requirement_type']


class PocComplianceCheckViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PocComplianceCheck.objects.select_related('judge').order_by('-check_date')
    serializer_class = PocComplianceCheckSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['court_code', 'overall_status', 'judge']


class PocChangeEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PocChangeEvent.objects.order_by('-detected_at')
    serializer_class = PocChangeEventSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']
    filterset_fields = ['entity_kind', 'entity_id', 'change_type']


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Organization (Customer/Law Firm) management.
    
    - Super Admins can create/view/edit/delete all organizations
    - Other users can only view their own organization
    """
    
    queryset = Organization.objects.filter(is_active=True).order_by('name')
    serializer_class = OrganizationSerializer
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    
    def get_permissions(self):
        """
        Customize permissions based on action.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, CanManageOrganization]
        else:
            permission_classes = [IsAuthenticated, CanViewOrganization]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter organizations based on user role.
        - Super Admins see all organizations
        - Other users see only their organization
        """
        user = self.request.user
        
        if user.role == 'super_admin':
            return Organization.objects.filter(is_active=True).order_by('name')
        
        # Other users can only see their own organization
        return Organization.objects.filter(id=user.organization.id, is_active=True)
    
    def perform_destroy(self, instance):
        """Soft delete: Mark organization as inactive instead of deleting."""
        instance.is_active = False
        instance.save()


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User Management (by Super Admin and Site Admin).
    
    - Super Admins can create/manage all user types (1-5) for all organizations
    - Site Admins can create/manage user types (2-5) for their organization only
    - Regular users cannot access this ViewSet
    """
    
    queryset = User.objects.select_related('organization').filter(is_active=True).order_by('first_name', 'last_name')
    permission_classes = [IsAuthenticated, CanManageUsers]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_queryset(self):
        """
        Filter users based on requesting user's role.
        - Super Admins see all users
        - Site Admins see users in their organization only (types 2-5)
        """
        user = self.request.user
        
        if user.role == 'super_admin':
            return User.objects.select_related('organization').filter(is_active=True).order_by('first_name', 'last_name')
        
        # Site Admins see users in their organization (excluding other Super Admins)
        if user.role == 'firm_admin':
            return User.objects.select_related('organization').filter(
                organization=user.organization,
                is_active=True
            ).exclude(role='super_admin').order_by('first_name', 'last_name')
        
        return User.objects.none()
    
    def perform_create(self, serializer):
        """
        Create user and set created_by field.
        Also validate role restrictions for Site Admins.
        Check license limits for the organization.
        Send welcome email to new user.
        """
        from court_rules.models import UserRole
        from rest_framework.exceptions import ValidationError
        
        user = self.request.user
        role = serializer.validated_data.get('role')
        target_organization = serializer.validated_data.get('organization')
        
        # Site Admins cannot create Super Admins or other Site Admins
        if user.role == UserRole.FIRM_ADMIN:
            if role in [UserRole.SUPER_ADMIN, UserRole.FIRM_ADMIN]:
                return Response(
                    {"error": "Site Admins cannot create Super Admin or Site Admin users."},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Force organization to be the Site Admin's organization
            target_organization = user.organization
            serializer.validated_data['organization'] = target_organization
        
        # Check license limit for non-Super Admin organizations
        if target_organization and role != UserRole.SUPER_ADMIN:
            try:
                subscription = target_organization.subscription
                if not subscription.can_add_user():
                    active_count = subscription.get_active_user_count()
                    raise ValidationError({
                        'organization': f"You've reached your user limit ({active_count}/{subscription.licensed_users}). Contact support to add more licenses."
                    })
            except Subscription.DoesNotExist:
                # If no subscription exists, allow creation (for backwards compatibility)
                pass
        
        new_user = serializer.save(created_by=user)
        
        # Send welcome email
        try:
            send_welcome_email(new_user, user, login_url='http://localhost:5173')
        except Exception as e:
            # Log error but don't fail user creation
            print(f"Error sending welcome email: {e}")
    
    def perform_destroy(self, instance):
        """Soft delete: Mark user as inactive instead of deleting."""
        instance.is_active = False
        instance.save()
    
    @action(detail=False, methods=['post'], url_path='change-password', permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """
        Allow authenticated user to change their own password.
        Requires old_password, new_password, and confirm_password.
        """
        serializer = UserPasswordChangeSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                "success": True,
                "message": "Password changed successfully."
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='reset-password', permission_classes=[AllowAny])
    def reset_password(self, request):
        """
        Initiate password reset via email.
        """
        serializer = UserPasswordResetSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Check if user exists
            try:
                user = User.objects.get(email=email, is_active=True)
                
                # Generate password reset token
                uid, token = generate_password_reset_token(user)
                
                # Build reset URL (frontend will handle the actual reset)
                # Format: http://localhost:5173/reset-password?uid=...&token=...
                frontend_url = request.build_absolute_uri('/').rstrip('/')
                # Replace backend port with frontend port
                frontend_url = frontend_url.replace(':8000', ':5173')
                reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"
                
                # Send password reset email
                try:
                    send_password_reset_email(user, reset_url, expiry_hours=24)
                except Exception as e:
                    # Log error but don't expose it to user
                    print(f"Error sending password reset email: {e}")
                
                return Response({
                    "success": True,
                    "message": f"Password reset instructions have been sent to {email}."
                })
            except User.DoesNotExist:
                # For security, return same response even if user doesn't exist
                pass
            
            return Response({
                "success": True,
                "message": f"If an account with {email} exists, password reset instructions have been sent."
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='confirm-reset-password', permission_classes=[AllowAny])
    def confirm_reset_password(self, request):
        """
        Complete password reset with token validation.
        
        Expected payload:
        {
            "uid": "base64-encoded-user-id",
            "token": "reset-token",
            "new_password": "NewPassword123!",
            "confirm_password": "NewPassword123!"
        }
        """
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        # Validate required fields
        if not all([uid, token, new_password, confirm_password]):
            return Response({
                "success": False,
                "message": "All fields are required."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate passwords match
        if new_password != confirm_password:
            return Response({
                "success": False,
                "message": "Passwords do not match."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate password strength (basic)
        if len(new_password) < 8:
            return Response({
                "success": False,
                "message": "Password must be at least 8 characters long."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate token and get user
        user = validate_password_reset_token(uid, token)
        
        if not user:
            return Response({
                "success": False,
                "message": "Invalid or expired password reset link."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Reset password
        user.set_password(new_password)
        user.save()
        
        return Response({
            "success": True,
            "message": "Password has been reset successfully. You can now log in with your new password."
        })


class UserAccessGrantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing UserAccessGrants (who can see whose data).
    
    - Super Admins and Site Admins can create/manage access grants
    - Type 1 & 2 can grant Type 3, 4, 5 access to a Type 3's data
    - Type 1 & 2 can grant Type 4, 5 access to a Type 4's data
    - Type 1 & 2 can grant Type 5 access to a Type 5's data
    """
    
    queryset = UserAccessGrant.objects.select_related(
        'organization', 'granted_by', 'granted_to', 'can_access_user'
    ).filter(is_active=True).order_by('-created_at')
    serializer_class = UserAccessGrantSerializer
    permission_classes = [IsAuthenticated, CanGrantAccess]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    
    def get_queryset(self):
        """
        Filter access grants based on user role.
        - Super Admins see all grants
        - Site Admins see grants in their organization only
        """
        user = self.request.user
        
        if user.role == 'super_admin':
            return UserAccessGrant.objects.select_related(
                'organization', 'granted_by', 'granted_to', 'can_access_user'
            ).filter(is_active=True).order_by('-created_at')
        
        # Site Admins see grants in their organization
        return UserAccessGrant.objects.select_related(
            'organization', 'granted_by', 'granted_to', 'can_access_user'
        ).filter(organization=user.organization, is_active=True).order_by('-created_at')
    
    def perform_create(self, serializer):
        """
        Create access grant and set granted_by and organization.
        Send notification email to recipient.
        """
        user = self.request.user
        grant = serializer.save(granted_by=user, organization=user.organization)
        
        # Send notification email
        try:
            send_access_grant_notification(grant, dashboard_url='http://localhost:5173')
        except Exception as e:
            # Log error but don't fail grant creation
            print(f"Error sending access grant notification: {e}")
    
    def perform_destroy(self, instance):
        """Soft delete: Mark access grant as inactive instead of deleting."""
        instance.is_active = False
        instance.save()
    
    @action(detail=False, methods=['get'], url_path='for-user/(?P<user_id>[^/.]+)')
    def for_user(self, request, user_id=None):
        """
        Get all access grants for a specific user (granted_to).
        Returns list of users this user can access.
        """
        try:
            target_user = User.objects.get(id=user_id)
            
            # Check if requesting user can view this
            if request.user.role not in ['super_admin', 'firm_admin']:
                if request.user != target_user:
                    return Response(
                        {"error": "You don't have permission to view this user's access grants."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            grants = UserAccessGrant.objects.filter(
                granted_to=target_user,
                is_active=True
            ).select_related('can_access_user')
            
            serializer = self.get_serializer(grants, many=True)
            return Response(serializer.data)
        
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def obtain_auth_token_email(request):
    """
    Custom authentication view that accepts email instead of username.
    
    Expects JSON with:
    - email: User's email address
    - password: User's password
    
    Returns:
    - token: Authentication token
    - user_id: User's UUID
    - email: User's email
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Please provide both email and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Authenticate using email as username (since EMAIL_FIELD is the USERNAME_FIELD)
    user = authenticate(request, username=email, password=password)
    
    if user:
        # Get or create token for the user
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.full_name,
            'organization_id': str(user.organization.id) if user.organization else None,
            'organization_name': user.organization.name if user.organization else None,
            'role': user.role,
        })
    
    return Response(
        {'error': 'Invalid email or password'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metrics(request):
    """
    Get dashboard metrics and statistics.
    
    Returns:
    - upcoming_deadlines: Count of deadlines in next 7/30/60 days
    - overdue_deadlines: Count of overdue deadlines
    - cases_by_status: Cases grouped by status
    - cases_by_court: Cases grouped by court
    - recent_activity: Recent updates to cases, rules, and judge procedures
    - deadline_timeline: Deadlines for chart visualization (next 60 days)
    - activity_trend: Daily activity counts for last 30 days
    """
    user = request.user
    now = timezone.now()
    
    # Get user's accessible data based on organization and access grants
    if user.role == 'super_admin':
        cases = Case.objects.all()
        deadlines = Deadline.objects.all()
    else:
        # Get cases user has access to (their org + granted access)
        accessible_user_ids = [user.id]
        if user.organization:
            # Add access grants
            grants = UserAccessGrant.objects.filter(
                granted_to=user,
                is_active=True
            ).values_list('can_access_user_id', flat=True)
            accessible_user_ids.extend(grants)
        
        cases = Case.objects.filter(
            Q(organization=user.organization) |
            Q(lead_attorney_id__in=accessible_user_ids)
        )
        deadlines = Deadline.objects.filter(case__in=cases)
    
    # Upcoming deadlines counts
    seven_days = now + timedelta(days=7)
    thirty_days = now + timedelta(days=30)
    sixty_days = now + timedelta(days=60)
    
    upcoming_7_days = deadlines.filter(due_at__gte=now, due_at__lte=seven_days, status='open').count()
    upcoming_30_days = deadlines.filter(due_at__gte=now, due_at__lte=thirty_days, status='open').count()
    upcoming_60_days = deadlines.filter(due_at__gte=now, due_at__lte=sixty_days, status='open').count()
    
    # Overdue deadlines
    overdue_count = deadlines.filter(due_at__lt=now, status='open').count()
    
    # Cases by status
    cases_by_status = list(
        cases.values('status')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    
    # Cases by court
    cases_by_court = list(
        cases.values('court__name')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    
    # Deadline timeline (next 60 days for chart)
    deadline_timeline = []
    for deadline in deadlines.filter(due_at__gte=now, due_at__lte=sixty_days).order_by('due_at')[:50]:
        deadline_timeline.append({
            'id': str(deadline.id),
            'title': str(deadline),  # Use the __str__ method
            'due_date': deadline.due_at.isoformat(),
            'status': deadline.status,
            'case_name': deadline.case.caption if deadline.case else None,
        })
    
    # Activity trend (last 30 days)
    thirty_days_ago = now - timedelta(days=30)
    activity_by_day = []
    
    for i in range(30):
        day = thirty_days_ago + timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        # Count activities for this day
        cases_count = cases.filter(created_at__gte=day_start, created_at__lt=day_end).count()
        deadlines_count = deadlines.filter(created_at__gte=day_start, created_at__lt=day_end).count()
        
        activity_by_day.append({
            'date': day.strftime('%Y-%m-%d'),
            'cases': cases_count,
            'deadlines': deadlines_count,
            'total': cases_count + deadlines_count,
        })
    
    # Recent activity feed
    recent_activity = []
    
    # Recent cases (last 10)
    for case in cases.order_by('-created_at')[:10]:
        recent_activity.append({
            'type': 'case',
            'title': f"New case: {case.caption}",
            'date': case.created_at.isoformat(),
            'id': str(case.id),
        })
    
    # Recent deadlines (last 10)
    for deadline in deadlines.order_by('-created_at')[:10]:
        recent_activity.append({
            'type': 'deadline',
            'title': f"Deadline: {deadline.trigger_type} - {deadline.case.caption}",
            'date': deadline.created_at.isoformat(),
            'id': str(deadline.id),
        })
    
    # Recently updated rules (last 10)
    try:
        from court_rules.poc_models import PocChangeEvent, PocRuleNode, PocJudgeProcNode
        
        # Get recent rule changes
        recent_rule_changes = PocChangeEvent.objects.filter(
            entity_kind='rule_node'
        ).select_related().order_by('-detected_at')[:10]
        
        for change in recent_rule_changes:
            try:
                rule = PocRuleNode.objects.get(id=change.entity_id)
                title = f"Rule {change.change_type}: {rule.rule_code} - {rule.heading[:50] if rule.heading else 'Court Rule'}"
            except PocRuleNode.DoesNotExist:
                title = f"Rule {change.change_type}: ID {change.entity_id}"
            
            recent_activity.append({
                'type': 'rule',
                'title': title,
                'date': change.detected_at.isoformat(),
                'id': str(change.entity_id),
            })
        
        # Recently updated judge procedures (last 10)
        recent_proc_changes = PocChangeEvent.objects.filter(
            entity_kind='judge_proc_node'
        ).select_related().order_by('-detected_at')[:10]
        
        for change in recent_proc_changes:
            try:
                proc = PocJudgeProcNode.objects.select_related('judge').get(id=change.entity_id)
                title = f"Procedure {change.change_type}: {proc.judge.display_name} - {proc.heading[:50] if proc.heading else 'Procedure'}"
            except PocJudgeProcNode.DoesNotExist:
                title = f"Procedure {change.change_type}: ID {change.entity_id}"
            
            recent_activity.append({
                'type': 'procedure',
                'title': title,
                'date': change.detected_at.isoformat(),
                'id': str(change.entity_id),
            })
    except Exception as e:
        # If there's any error with POC models, just skip this section
        pass
    
    # Sort all activities by date (most recent first) and limit to 20
    recent_activity.sort(key=lambda x: x['date'], reverse=True)
    recent_activity = recent_activity[:20]
    
    return Response({
        'upcoming_deadlines': {
            'next_7_days': upcoming_7_days,
            'next_30_days': upcoming_30_days,
            'next_60_days': upcoming_60_days,
        },
        'overdue_deadlines': overdue_count,
        'total_active_cases': cases.filter(status='active').count(),
        'cases_by_status': cases_by_status,
        'cases_by_court': cases_by_court,
        'deadline_timeline': deadline_timeline,
        'activity_trend': activity_by_day,
        'recent_activity': recent_activity,
    })


# =============================================================================
# Subscription Management ViewSets
# =============================================================================

class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing subscriptions.
    
    - Super Admins: Can view and manage all subscriptions
    - Firm Admins: Can view their own organization's subscription only
    """
    queryset = Subscription.objects.select_related('organization').all()
    serializer_class = SubscriptionSerializer
    
    def get_permissions(self):
        """
        Instantiate and return the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [CanManageSubscription]
        else:
            permission_classes = [CanViewSubscription]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter subscriptions based on user role."""
        user = self.request.user
        
        # Super Admins see all subscriptions
        if user.role == 'super_admin':
            return self.queryset
        
        # Firm Admins see only their organization's subscription
        if user.role == 'firm_admin':
            return self.queryset.filter(organization=user.organization)
        
        # Other users should not access subscriptions
        return Subscription.objects.none()
    
    def perform_create(self, serializer):
        """Create subscription and log the event."""
        subscription = serializer.save()
        
        # Create initial history record
        SubscriptionHistory.objects.create(
            subscription=subscription,
            change_type='contract_change',
            old_value='',
            new_value=f'Initial subscription created with {subscription.licensed_users} licenses at ${subscription.monthly_rate}/month',
            changed_by=self.request.user,
            reason='Initial subscription setup',
            effective_date=subscription.contract_start_date,
        )
    
    def perform_update(self, serializer):
        """Update subscription and track changes."""
        old_instance = self.get_object()
        updated_subscription = serializer.save()
        
        # Track license changes
        if old_instance.licensed_users != updated_subscription.licensed_users:
            SubscriptionHistory.objects.create(
                subscription=updated_subscription,
                change_type='license_change',
                old_value=str(old_instance.licensed_users),
                new_value=str(updated_subscription.licensed_users),
                changed_by=self.request.user,
                reason=f'License count changed from {old_instance.licensed_users} to {updated_subscription.licensed_users}',
                effective_date=timezone.now().date(),
            )
        
        # Track price changes
        if old_instance.monthly_rate != updated_subscription.monthly_rate:
            SubscriptionHistory.objects.create(
                subscription=updated_subscription,
                change_type='price_change',
                old_value=str(old_instance.monthly_rate),
                new_value=str(updated_subscription.monthly_rate),
                changed_by=self.request.user,
                reason=f'Monthly rate changed from ${old_instance.monthly_rate} to ${updated_subscription.monthly_rate}',
                effective_date=timezone.now().date(),
            )
        
        # Track status changes
        if old_instance.status != updated_subscription.status:
            SubscriptionHistory.objects.create(
                subscription=updated_subscription,
                change_type='status_change',
                old_value=old_instance.status,
                new_value=updated_subscription.status,
                changed_by=self.request.user,
                reason=f'Status changed from {old_instance.status} to {updated_subscription.status}',
                effective_date=timezone.now().date(),
            )


class SubscriptionHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing subscription history.
    Read-only access to historical changes.
    """
    queryset = SubscriptionHistory.objects.select_related('subscription__organization', 'changed_by').all()
    serializer_class = SubscriptionHistorySerializer
    permission_classes = [CanViewSubscription]
    
    def get_queryset(self):
        """Filter history based on user role."""
        user = self.request.user
        
        # Super Admins see all history
        if user.role == 'super_admin':
            return self.queryset
        
        # Firm Admins see only their organization's history
        if user.role == 'firm_admin':
            return self.queryset.filter(subscription__organization=user.organization)
        
        return SubscriptionHistory.objects.none()


class BillingRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing billing records.
    
    - Super Admins: Can view and manage all billing records
    - Firm Admins: Can view their own organization's billing records
    """
    queryset = BillingRecord.objects.select_related('subscription__organization').all()
    serializer_class = BillingRecordSerializer
    
    def get_permissions(self):
        """Define permissions based on action."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [CanManageBillingRecord]
        else:
            permission_classes = [CanViewBillingRecord]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return BillingRecordCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BillingRecordUpdateSerializer
        return BillingRecordSerializer
    
    def get_queryset(self):
        """Filter billing records based on user role."""
        user = self.request.user
        
        # Super Admins see all billing records
        if user.role == 'super_admin':
            # Allow filtering by organization_id
            organization_id = self.request.query_params.get('organization_id')
            if organization_id:
                return self.queryset.filter(subscription__organization__id=organization_id)
            return self.queryset
        
        # Firm Admins see only their organization's billing records
        if user.role == 'firm_admin':
            return self.queryset.filter(subscription__organization=user.organization)
        
        return BillingRecord.objects.none()
    
    def perform_create(self, serializer):
        """Create billing record with calculated balance."""
        billing_record = serializer.save()
        billing_record.calculate_balance()
        billing_record.save()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def billing_dashboard(request):
    """
    API endpoint for billing dashboard metrics.
    
    Returns:
    - Total revenue (current month)
    - Outstanding balance
    - Overdue payments
    - Payment status breakdown
    """
    user = request.user
    
    # Filter billing records based on user role
    if user.role == 'super_admin':
        billing_records = BillingRecord.objects.all()
    elif user.role == 'firm_admin':
        billing_records = BillingRecord.objects.filter(subscription__organization=user.organization)
    else:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    # Current month revenue
    current_month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_month_revenue = billing_records.filter(
        billing_period_start__gte=current_month_start
    ).aggregate(
        total=Count('id'),
        billed=Count('amount_billed'),
    )
    
    # Outstanding balance
    total_outstanding = sum(record.balance_due for record in billing_records if record.balance_due > 0)
    
    # Overdue payments
    today = timezone.now().date()
    overdue_records = billing_records.filter(
        payment_status__in=['pending', 'partially_paid'],
        payment_due_date__lt=today
    )
    
    overdue_list = []
    for record in overdue_records[:10]:  # Top 10 overdue
        overdue_list.append({
            'id': str(record.id),
            'organization': record.subscription.organization.name,
            'amount_due': float(record.balance_due),
            'due_date': record.payment_due_date.isoformat() if record.payment_due_date else None,
            'billing_period': f"{record.billing_period_start} to {record.billing_period_end}",
        })
    
    # Payment status breakdown
    status_breakdown = {}
    for choice_value, choice_label in BillingRecord._meta.get_field('payment_status').choices:
        count = billing_records.filter(payment_status=choice_value).count()
        if count > 0:
            status_breakdown[choice_label] = count
    
    return Response({
        'current_month_records': current_month_revenue['total'],
        'total_outstanding': float(total_outstanding),
        'overdue_count': overdue_records.count(),
        'overdue_records': overdue_list,
        'payment_status_breakdown': status_breakdown,
    })
