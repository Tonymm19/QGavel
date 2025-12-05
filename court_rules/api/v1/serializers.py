from django.utils import timezone
from rest_framework import serializers

from court_rules.models import (
    Case,
    Deadline,
    DeadlineReminder,
    Judge,
    Organization,
    Rule,
    AuditLog,
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


class JudgeSerializer(serializers.ModelSerializer):
    court_name = serializers.SerializerMethodField()
    holiday_calendar_name = serializers.SerializerMethodField()

    class Meta:
        model = Judge
        fields = [
            'id',
            'full_name',
            'court',
            'court_name',
            'courtroom',
            'chambers_url',
            'contact_email',
            'contact_phone',
            # Court Reporter fields
            'court_reporter_name',
            'court_reporter_phone',
            'court_reporter_room',
            # Courtroom Deputy fields
            'clerk_name',
            'clerk_phone',
            'clerk_email',
            'clerk_room',
            # Executive Law Clerk fields
            'executive_law_clerk',
            'executive_law_clerk_phone',
            'executive_law_clerk_room',
            # Judicial Assistant fields
            'judicial_assistant',
            'judicial_assistant_phone',
            'judicial_assistant_room',
            # Law Clerks
            'apprentices',
            # Legacy field
            'additional_staff',
            'holiday_calendar',
            'holiday_calendar_name',
        ]
        read_only_fields = fields

    def get_court_name(self, obj):
        return obj.court.name if obj.court else None

    def get_holiday_calendar_name(self, obj):
        return obj.holiday_calendar.name if obj.holiday_calendar else None


class CaseSerializer(serializers.ModelSerializer):
    court_name = serializers.SerializerMethodField()
    lead_attorney_name = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id',
            'internal_case_id',
            'case_number',
            'caption',
            'practice_area',
            'court',
            'court_name',
            'filing_date',
            'status',
            'stage',
            'lead_attorney',
            'lead_attorney_name',
            'confidentiality_level',
            'legal_hold',
            'timezone',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_court_name(self, obj):
        return obj.court.name if obj.court else None

    def get_lead_attorney_name(self, obj):
        return obj.lead_attorney.full_name if obj.lead_attorney else None


class DeadlineSerializer(serializers.ModelSerializer):
    case_caption = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    updated_by_name = serializers.SerializerMethodField()
    holiday_calendar_name = serializers.SerializerMethodField()
    pending_reminders = serializers.SerializerMethodField()

    class Meta:
        model = Deadline
        fields = [
            'id',
            'case',
            'case_caption',
            'trigger_type',
            'trigger_source_type',
            'trigger_source_id',
            'basis',
            'holiday_calendar',
            'holiday_calendar_name',
            'due_at',
            'timezone',
            'owner',
            'owner_name',
            'priority',
            'status',
            'snooze_until',
            'extension_notes',
            'outcome',
            'computation_rationale',
            'created_by',
            'created_by_name',
            'updated_by',
            'updated_by_name',
            'created_at',
            'updated_at',
            'pending_reminders',
        ]
        read_only_fields = [
            'id',
            'case',
            'case_caption',
            'holiday_calendar',
            'holiday_calendar_name',
            'owner',
            'owner_name',
            'priority',
            'computation_rationale',
            'created_by',
            'created_by_name',
            'updated_by',
            'updated_by_name',
            'created_at',
            'updated_at',
        ]

    def get_case_caption(self, obj):
        return obj.case.caption if obj.case else None

    def get_owner_name(self, obj):
        return obj.owner.full_name if obj.owner else None

    def get_created_by_name(self, obj):
        return obj.created_by.full_name if obj.created_by else None

    def get_updated_by_name(self, obj):
        return obj.updated_by.full_name if obj.updated_by else None

    def get_holiday_calendar_name(self, obj):
        return obj.holiday_calendar.name if obj.holiday_calendar else None

    def validate_snooze_until(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError('Snooze until must be in the future.')
        return value

    def get_pending_reminders(self, obj):
        return obj.reminders.filter(sent=False).count()


class DeadlineReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeadlineReminder
        fields = [
            'id',
            'deadline',
            'notify_at',
            'channel',
            'sent',
            'sent_at',
        ]
        read_only_fields = ['id', 'sent', 'sent_at']

    def validate_notify_at(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError('notify_at must be in the future.')
        return value


class DeadlineCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deadline
        fields = [
            'id',
            'case',
            'trigger_type',
            'trigger_source_type',
            'trigger_source_id',
            'basis',
            'holiday_calendar',
            'due_at',
            'timezone',
            'owner',
            'priority',
            'status',
            'snooze_until',
            'extension_notes',
            'outcome',
            'computation_rationale',
        ]
        read_only_fields = ['id']

    def validate_due_at(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError('Due date must be in the future.')
        return value

    def validate(self, attrs):
        snooze_until = attrs.get('snooze_until')
        if snooze_until and snooze_until <= timezone.now():
            raise serializers.ValidationError({'snooze_until': 'Snooze until must be in the future.'})
        return attrs


class RuleSerializer(serializers.ModelSerializer):
    superseded_by_citation = serializers.SerializerMethodField()

    class Meta:
        model = Rule
        fields = [
            'id',
            'source_type',
            'citation',
            'jurisdiction',
            'version',
            'effective_date',
            'superseded_by',
            'superseded_by_citation',
            'text',
            'url',
            'created_at',
        ]
        read_only_fields = fields

    def get_superseded_by_citation(self, obj):
        return obj.superseded_by.citation if obj.superseded_by else None


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'actor_user',
            'actor_name',
            'entity_table',
            'entity_id',
            'action',
            'before',
            'after',
            'created_at',
        ]
        read_only_fields = fields

    def get_actor_name(self, obj):
        if obj.actor_user:
            return obj.actor_user.full_name or obj.actor_user.email
        return None


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    organization_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'organization',
            'organization_name',
            'phone',
            'role',
            'timezone',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_organization_name(self, obj):
        return obj.organization.name if obj.organization else None


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for Organization (Law Firm / Customer)."""
    
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            'id',
            'name',
            'address_line1',
            'address_line2',
            'city',
            'state',
            'zip_code',
            'phone',
            'is_active',
            'user_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user_count', 'created_at', 'updated_at']

    def get_user_count(self, obj):
        return obj.users.filter(is_active=True).count()

    def validate_state(self, value):
        """Validate US state code (2 letters)."""
        if value and len(value) != 2:
            raise serializers.ValidationError("State must be a 2-letter US state code.")
        return value.upper() if value else value

    def validate_phone(self, value):
        """Basic validation for US phone numbers."""
        if value:
            digits = ''.join(filter(str.isdigit, value))
            if len(digits) != 10:
                raise serializers.ValidationError("Phone number must have 10 digits.")
        return value


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users (by Super Admin or Site Admin)."""
    
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name',
            'organization',
            'phone',
            'role',
            'timezone',
            'password',
            'confirm_password',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user information (by Super Admin or Site Admin)."""
    
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'phone',
            'role',
            'timezone',
            'is_active',
        ]

    def validate_role(self, value):
        """Ensure role changes are valid."""
        user = self.instance
        request_user = self.context['request'].user
        
        # Super Admins can change any role
        if request_user.is_super_admin():
            return value
        
        # Site Admins cannot change users to Super Admin or Firm Admin
        if request_user.is_firm_admin():
            from court_rules.models import UserRole
            if value in [UserRole.SUPER_ADMIN, UserRole.FIRM_ADMIN]:
                raise serializers.ValidationError(
                    "Site Admins cannot assign Super Admin or Site Admin roles."
                )
        
        return value


class UserPasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset."""
    
    email = serializers.EmailField(required=True)


class UserPasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing user's own password."""
    
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class UserAccessGrantSerializer(serializers.ModelSerializer):
    """Serializer for UserAccessGrant (managing who can see whose data)."""
    
    granted_by_name = serializers.SerializerMethodField()
    granted_to_name = serializers.SerializerMethodField()
    can_access_user_name = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()

    class Meta:
        model = UserAccessGrant
        fields = [
            'id',
            'organization',
            'organization_name',
            'granted_by',
            'granted_by_name',
            'granted_to',
            'granted_to_name',
            'can_access_user',
            'can_access_user_name',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'organization', 'granted_by', 'created_at', 'updated_at']

    def get_granted_by_name(self, obj):
        return obj.granted_by.full_name if obj.granted_by else None

    def get_granted_to_name(self, obj):
        return obj.granted_to.full_name if obj.granted_to else None

    def get_can_access_user_name(self, obj):
        return obj.can_access_user.full_name if obj.can_access_user else None

    def get_organization_name(self, obj):
        return obj.organization.name if obj.organization else None

    def validate(self, attrs):
        """Validate access grant rules."""
        granted_to = attrs.get('granted_to')
        can_access_user = attrs.get('can_access_user')
        
        # Cannot grant access to self
        if granted_to == can_access_user:
            raise serializers.ValidationError("Users cannot be granted access to themselves.")
        
        # Validate role hierarchy
        from court_rules.models import UserRole
        
        # Type 3 (Managing Lawyer) can access Type 3, 4, 5
        if granted_to.role == UserRole.MANAGING_LAWYER:
            if can_access_user.role not in [UserRole.MANAGING_LAWYER, UserRole.LAWYER, UserRole.PARALEGAL]:
                raise serializers.ValidationError(
                    "Managing Lawyers can only access Managing Lawyers, Lawyers, or Paralegals."
                )
        
        # Type 4 (Lawyer) can access Type 4, 5
        elif granted_to.role == UserRole.LAWYER:
            if can_access_user.role not in [UserRole.LAWYER, UserRole.PARALEGAL]:
                raise serializers.ValidationError(
                    "Lawyers can only access Lawyers or Paralegals."
                )
        
        # Type 5 (Paralegal) can only access Type 5
        elif granted_to.role == UserRole.PARALEGAL:
            if can_access_user.role != UserRole.PARALEGAL:
                raise serializers.ValidationError(
                    "Paralegals can only access other Paralegals."
                )
        
        # Both users must be in same organization
        if granted_to.organization != can_access_user.organization:
            raise serializers.ValidationError(
                "Access can only be granted between users in the same organization."
            )
        
        return attrs


class PocCourtSerializer(serializers.ModelSerializer):
    class Meta:
        model = PocCourt
        fields = ['code', 'name', 'url']
        read_only_fields = fields


class PocRuleNodeSerializer(serializers.ModelSerializer):
    court_code = serializers.CharField(source='court.code', read_only=True)
    court_name = serializers.CharField(source='court.name', read_only=True)

    class Meta:
        model = PocRuleNode
        fields = [
            'id',
            'court',
            'court_code',
            'court_name',
            'rule_code',
            'node_type',
            'parent',
            'ordinal',
            'heading',
            'text',
            'source_url',
            'normalized_text_hash',
            'effective_from',
            'effective_to',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class PocJudgeSerializer(serializers.ModelSerializer):
    court_code = serializers.CharField(source='court.code', read_only=True)
    court_name = serializers.CharField(source='court.name', read_only=True)

    class Meta:
        model = PocJudge
        fields = [
            'id',
            'court',
            'court_code',
            'court_name',
            'display_name',
            'role',
            'courtroom',
            'chambers',
            'phone',
            'fax',
            'email',
            'created_at',
        ]
        read_only_fields = fields


class PocJudgeProcNodeSerializer(serializers.ModelSerializer):
    judge_name = serializers.CharField(source='judge.display_name', read_only=True)

    class Meta:
        model = PocJudgeProcNode
        fields = [
            'id',
            'judge',
            'judge_name',
            'node_type',
            'parent',
            'ordinal',
            'heading',
            'text',
            'source_url',
            'normalized_text_hash',
            'effective_from',
            'effective_to',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class PocRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PocRequirement
        fields = [
            'id',
            'source_type',
            'source_id',
            'requirement_type',
            'requirement_text',
            'confidence_score',
            'metadata',
            'created_at',
        ]
        read_only_fields = fields


class PocComplianceCheckSerializer(serializers.ModelSerializer):
    judge_name = serializers.CharField(source='judge.display_name', read_only=True)

    class Meta:
        model = PocComplianceCheck
        fields = [
            'id',
            'check_date',
            'court_code',
            'judge',
            'judge_name',
            'case_metadata',
            'overall_status',
            'violations',
            'created_at',
        ]
        read_only_fields = fields


class PocChangeEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = PocChangeEvent
        fields = [
            'id',
            'entity_kind',
            'entity_id',
            'change_type',
            'old_hash',
            'new_hash',
            'detected_at',
            'diff_text',
            'diff_metadata',
            'created_at',
        ]
        read_only_fields = fields


# =============================================================================
# Subscription Management Serializers
# =============================================================================

class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for Subscription model."""
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    active_user_count = serializers.SerializerMethodField()
    can_add_user = serializers.SerializerMethodField()
    is_at_limit = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            'id',
            'organization',
            'organization_name',
            'licensed_users',
            'active_user_count',
            'can_add_user',
            'is_at_limit',
            'monthly_rate',
            'billing_cycle_type',
            'billing_day',
            'contract_start_date',
            'contract_end_date',
            'status',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_active_user_count(self, obj):
        """Get count of active users."""
        return obj.get_active_user_count()

    def get_can_add_user(self, obj):
        """Check if organization can add more users."""
        return obj.can_add_user()

    def get_is_at_limit(self, obj):
        """Check if organization is at user limit."""
        return obj.is_at_user_limit()

    def validate(self, attrs):
        """Validate subscription data."""
        # Ensure billing_day is provided for anniversary billing
        if attrs.get('billing_cycle_type') == 'anniversary' and not attrs.get('billing_day'):
            raise serializers.ValidationError({
                'billing_day': 'Billing day is required for anniversary billing cycle.'
            })
        
        # Ensure licensed_users is at least 1
        if attrs.get('licensed_users', 0) < 1:
            raise serializers.ValidationError({
                'licensed_users': 'Licensed users must be at least 1.'
            })

        return attrs


class SubscriptionHistorySerializer(serializers.ModelSerializer):
    """Serializer for SubscriptionHistory model."""
    subscription_organization = serializers.CharField(source='subscription.organization.name', read_only=True)
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionHistory
        fields = [
            'id',
            'subscription',
            'subscription_organization',
            'change_type',
            'old_value',
            'new_value',
            'changed_by',
            'changed_by_name',
            'reason',
            'effective_date',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_changed_by_name(self, obj):
        """Get the full name of the user who made the change."""
        if obj.changed_by:
            return f"{obj.changed_by.first_name} {obj.changed_by.last_name}".strip()
        return None


class BillingRecordSerializer(serializers.ModelSerializer):
    """Serializer for BillingRecord model."""
    subscription_organization = serializers.CharField(source='subscription.organization.name', read_only=True)
    organization_id = serializers.UUIDField(source='subscription.organization.id', read_only=True)

    class Meta:
        model = BillingRecord
        fields = [
            'id',
            'subscription',
            'subscription_organization',
            'organization_id',
            'billing_period_start',
            'billing_period_end',
            'amount_billed',
            'amount_paid',
            'balance_due',
            'invoice_date',
            'payment_received_date',
            'payment_due_date',
            'payment_cleared_date',
            'reminder_sent_date',
            'custom_date_1',
            'custom_date_2',
            'custom_date_3',
            'payment_status',
            'invoice_number',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        """Validate billing record data."""
        # Ensure billing period start is before end
        if attrs.get('billing_period_start') and attrs.get('billing_period_end'):
            if attrs['billing_period_start'] >= attrs['billing_period_end']:
                raise serializers.ValidationError({
                    'billing_period_end': 'Billing period end must be after start date.'
                })

        # Calculate balance_due if not provided
        if 'amount_billed' in attrs and 'amount_paid' in attrs:
            attrs['balance_due'] = attrs['amount_billed'] - attrs['amount_paid']

        return attrs


class BillingRecordCreateSerializer(BillingRecordSerializer):
    """Serializer for creating billing records with auto-calculation."""
    
    class Meta(BillingRecordSerializer.Meta):
        fields = BillingRecordSerializer.Meta.fields
        read_only_fields = ['id', 'balance_due', 'created_at', 'updated_at']


class BillingRecordUpdateSerializer(BillingRecordSerializer):
    """Serializer for updating billing records with recalculation."""
    
    def update(self, instance, validated_data):
        """Update billing record and recalculate balance."""
        instance = super().update(instance, validated_data)
        instance.calculate_balance()
        instance.save()
        return instance
