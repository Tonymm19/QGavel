"""
Custom permission classes for role-based access control.
"""

from rest_framework import permissions

from court_rules.models import UserRole


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission to only allow Super Admins (Type 1).
    """
    
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.role == UserRole.SUPER_ADMIN
        )


class IsSuperAdminOrFirmAdmin(permissions.BasePermission):
    """
    Permission to allow Super Admins (Type 1) or Site Admins (Type 2).
    """
    
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.role in [UserRole.SUPER_ADMIN, UserRole.FIRM_ADMIN]
        )


class CanManageUsers(permissions.BasePermission):
    """
    Permission to check if user can manage other users based on role hierarchy.
    
    - Super Admins (Type 1) can manage all user types (1-5)
    - Site Admins (Type 2) can manage types 2-5
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super Admins and Site Admins can manage users
        return request.user.role in [UserRole.SUPER_ADMIN, UserRole.FIRM_ADMIN]
    
    def has_object_permission(self, request, view, obj):
        """
        Check if the requesting user can manage the target user (obj).
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super Admins can manage anyone
        if request.user.role == UserRole.SUPER_ADMIN:
            return True
        
        # Site Admins can manage users types 2-5, but not other Super Admins
        if request.user.role == UserRole.FIRM_ADMIN:
            # Can't manage Super Admins
            if obj.role == UserRole.SUPER_ADMIN:
                return False
            # Can only manage users in their organization
            return request.user.organization == obj.organization
        
        return False


class CanGrantAccess(permissions.BasePermission):
    """
    Permission to check if user can grant access to other users.
    
    Only Super Admins (Type 1) and Site Admins (Type 2) can grant access.
    """
    
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.role in [UserRole.SUPER_ADMIN, UserRole.FIRM_ADMIN]
        )


class CanViewOrganization(permissions.BasePermission):
    """
    Permission to view organization data.
    
    - Super Admins can view all organizations
    - All other users can only view their own organization
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Super Admins can view any organization
        if request.user.role == UserRole.SUPER_ADMIN:
            return True
        
        # Users can only view their own organization
        return request.user.organization == obj


class CanManageOrganization(permissions.BasePermission):
    """
    Permission to create/edit organization data.
    
    Only Super Admins can create/edit organizations.
    """
    
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.role == UserRole.SUPER_ADMIN
        )


class IsSameOrganization(permissions.BasePermission):
    """
    Permission to ensure data access is limited to same organization (multi-tenancy).
    
    Super Admins can access all organizations.
    Other users can only access data from their organization.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Super Admins can access any organization's data
        if request.user.role == UserRole.SUPER_ADMIN:
            return True
        
        # Check if object has organization attribute
        if not hasattr(obj, 'organization'):
            return True  # Allow if no organization field
        
        # Users can only access data from their organization
        return request.user.organization == obj.organization


class CanAccessUserData(permissions.BasePermission):
    """
    Permission to check if a user can access another user's data (cases, deadlines, etc.)
    
    Based on UserAccessGrant and role hierarchy:
    - Users can always see their own data
    - Type 3 (Managing Lawyer) can see Type 3, 4, 5 if granted
    - Type 4 (Lawyer) can see Type 4, 5 if granted
    - Type 5 (Paralegal) can see Type 5 if granted
    - Super Admins can see all data in all organizations
    - Site Admins can see all data in their organization
    """
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        if not user or not user.is_authenticated:
            return False
        
        # Super Admins can see everything
        if user.role == UserRole.SUPER_ADMIN:
            return True
        
        # Site Admins can see all data in their organization
        if user.role == UserRole.FIRM_ADMIN:
            if hasattr(obj, 'organization'):
                return user.organization == obj.organization
            if hasattr(obj, 'lead_attorney'):  # For Case model
                return user.organization == obj.lead_attorney.organization
            if hasattr(obj, 'owner'):  # For Deadline model
                return user.organization == obj.owner.organization
            return True
        
        # Check if user owns the data
        if hasattr(obj, 'lead_attorney') and obj.lead_attorney == user:
            return True
        if hasattr(obj, 'owner') and obj.owner == user:
            return True
        if hasattr(obj, 'created_by') and obj.created_by == user:
            return True
        
        # Check if user has been granted access via UserAccessGrant
        from court_rules.models import UserAccessGrant
        
        # Find the owner of the data
        data_owner = None
        if hasattr(obj, 'lead_attorney'):
            data_owner = obj.lead_attorney
        elif hasattr(obj, 'owner'):
            data_owner = obj.owner
        elif hasattr(obj, 'created_by'):
            data_owner = obj.created_by
        
        if data_owner:
            # Check if there's an active access grant
            grant_exists = UserAccessGrant.objects.filter(
                granted_to=user,
                can_access_user=data_owner,
                is_active=True,
                organization=user.organization,
            ).exists()
            
            if grant_exists:
                return True
        
        return False


class CanViewSubscription(permissions.BasePermission):
    """
    Permission to view subscription data.
    
    - Super Admins can view all subscriptions
    - Firm Admins can only view their own organization's subscription
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Super Admins can view any subscription
        if request.user.role == UserRole.SUPER_ADMIN:
            return True
        
        # Firm Admins can only view their own organization's subscription
        if request.user.role == UserRole.FIRM_ADMIN:
            return request.user.organization == obj.organization
        
        return False


class CanManageSubscription(permissions.BasePermission):
    """
    Permission to create/modify subscription data.
    
    Only Super Admins can create/modify subscriptions.
    """
    
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.role == UserRole.SUPER_ADMIN
        )


class CanViewBillingRecord(permissions.BasePermission):
    """
    Permission to view billing records.
    
    - Super Admins can view all billing records
    - Firm Admins can only view their own organization's billing records
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Super Admins can view any billing record
        if request.user.role == UserRole.SUPER_ADMIN:
            return True
        
        # Firm Admins can only view their own organization's billing records
        if request.user.role == UserRole.FIRM_ADMIN:
            return request.user.organization == obj.subscription.organization
        
        return False


class CanManageBillingRecord(permissions.BasePermission):
    """
    Permission to create/modify billing records.
    
    Only Super Admins can create/modify billing records.
    """
    
    def has_permission(self, request, view):
        return (
            request.user 
            and request.user.is_authenticated 
            and request.user.role == UserRole.SUPER_ADMIN
        )


