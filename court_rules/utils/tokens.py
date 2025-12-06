"""
Token generation and validation for password resets.
"""

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from court_rules.models import User


class PasswordResetTokenGenerator(PasswordResetTokenGenerator):
    """
    Custom token generator for password resets.
    Token is valid for 24 hours by default.
    """
    
    def _make_hash_value(self, user, timestamp):
        """
        Hash the user's primary key, email, and timestamp.
        """
        return f"{user.pk}{user.email}{timestamp}{user.password}"


password_reset_token = PasswordResetTokenGenerator()


def generate_password_reset_token(user):
    """
    Generate a password reset token for the given user.
    
    Args:
        user: User instance
        
    Returns:
        Tuple of (uid, token) where uid is base64 encoded user ID
    """
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = password_reset_token.make_token(user)
    return uid, token


def validate_password_reset_token(uid, token):
    """
    Validate a password reset token and return the user if valid.
    
    Args:
        uid: Base64 encoded user ID
        token: Reset token
        
    Returns:
        User instance if valid, None otherwise
    """
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if password_reset_token.check_token(user, token):
            return user
        return None
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return None



