"""
Email utility functions for sending various notification emails.
"""

from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags


def send_password_reset_email(user, reset_url, expiry_hours=24):
    """
    Send password reset email to user.
    
    Args:
        user: User instance
        reset_url: Full URL for password reset
        expiry_hours: Hours until reset link expires (default: 24)
    """
    subject = 'Reset Your Precedentum Password'
    
    html_message = render_to_string('emails/password_reset_email.html', {
        'user': user,
        'reset_url': reset_url,
        'expiry_hours': expiry_hours,
        'organization_name': user.organization.name if user.organization else 'Precedentum',
    })
    
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_welcome_email(user, created_by, login_url='http://localhost:5173'):
    """
    Send welcome email to newly created user.
    
    Args:
        user: User instance
        created_by: User who created this account
        login_url: URL for login page (default: localhost)
    """
    # Map role to display name
    role_display_map = {
        'super_admin': 'Super Administrator',
        'firm_admin': 'Site Administrator',
        'managing_lawyer': 'Managing Lawyer',
        'lawyer': 'Lawyer',
        'paralegal': 'Paralegal',
    }
    role_display = role_display_map.get(user.role, user.role.replace('_', ' ').title())
    
    subject = f'Welcome to Precedentum - Your Account is Ready'
    
    html_message = render_to_string('emails/welcome_email.html', {
        'user': user,
        'role_display': role_display,
        'login_url': login_url,
        'created_by_name': created_by.full_name if created_by else 'Administrator',
    })
    
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_access_grant_notification(grant, dashboard_url='http://localhost:5173'):
    """
    Send notification when user is granted access to another user's data.
    
    Args:
        grant: UserAccessGrant instance
        dashboard_url: URL for dashboard (default: localhost)
    """
    from datetime import datetime
    
    subject = f'New Access Granted - Precedentum'
    
    html_message = render_to_string('emails/access_grant_notification.html', {
        'recipient': grant.granted_to,
        'target_user': grant.can_access_user,
        'granted_by': grant.granted_by,
        'organization': grant.organization,
        'grant_date': grant.created_at.strftime('%B %d, %Y'),
        'dashboard_url': dashboard_url,
    })
    
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[grant.granted_to.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_access_revoked_notification(recipient_email, recipient_name, target_user_name, organization_name):
    """
    Send notification when access is revoked.
    
    Args:
        recipient_email: Email of user whose access was revoked
        recipient_name: Name of user
        target_user_name: Name of user they can no longer access
        organization_name: Organization name
    """
    subject = 'Access Revoked - Precedentum'
    
    message = f"""
Hello {recipient_name},

Your access to view {target_user_name}'s data has been revoked.

If you have questions about this change, please contact your administrator.

---
Precedentum - Federal Court Compliance Platform
{organization_name}

This is an automated message. Please do not reply to this email.
    """.strip()
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient_email],
        fail_silently=False,
    )



