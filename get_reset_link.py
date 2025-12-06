#!/usr/bin/env python
"""
Quick script to generate a password reset link for any user.
Useful for development when using console email backend.

Usage:
    python get_reset_link.py email@example.com
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from court_rules.models import User
from court_rules.utils.tokens import generate_password_reset_token


def get_reset_link(email):
    """Generate a password reset link for a user."""
    try:
        user = User.objects.get(email=email, is_active=True)
    except User.DoesNotExist:
        print(f"❌ Error: No active user found with email '{email}'")
        return None
    
    # Generate token
    uid, token = generate_password_reset_token(user)
    
    # Build reset URL
    reset_url = f"http://localhost:5173/reset-password?uid={uid}&token={token}"
    
    return {
        'user': user,
        'reset_url': reset_url,
        'uid': uid,
        'token': token,
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python get_reset_link.py email@example.com")
        sys.exit(1)
    
    email = sys.argv[1]
    
    print("\n" + "="*80)
    print("🔑 PASSWORD RESET LINK GENERATOR")
    print("="*80)
    
    result = get_reset_link(email)
    
    if result:
        user = result['user']
        reset_url = result['reset_url']
        
        print(f"\n✓ User Found:")
        print(f"  Name: {user.full_name}")
        print(f"  Email: {user.email}")
        print(f"  Role: {user.get_role_display()}")
        print(f"  Organization: {user.organization.name if user.organization else 'N/A'}")
        
        print(f"\n🔗 Password Reset Link (valid for 24 hours):")
        print(f"\n{reset_url}\n")
        
        print("="*80)
        print("\n📋 Instructions:")
        print("1. Copy the link above")
        print("2. Paste it into your browser")
        print("3. Enter your new password")
        print("4. Log in with the new password")
        print("\n" + "="*80 + "\n")
    else:
        print("\n" + "="*80 + "\n")


if __name__ == '__main__':
    main()



