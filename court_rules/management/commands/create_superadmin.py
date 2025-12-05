"""
Management command to create the first Super Admin user.

Usage:
    python manage.py create_superadmin

This command is designed to be run once during initial setup.
It will create a Super Admin user who can then create other users.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from court_rules.models import Organization, User, UserRole


class Command(BaseCommand):
    help = "Create the first Super Admin user for the system."

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email for the Super Admin account',
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Password for the Super Admin account',
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Super',
            help='First name for the Super Admin',
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='Admin',
            help='Last name for the Super Admin',
        )
        parser.add_argument(
            '--org-name',
            type=str,
            default='Precedentum Platform',
            help='Organization name for the Super Admin',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Creating Super Admin user..."))

        email = options.get('email')
        password = options.get('password')
        first_name = options.get('first_name')
        last_name = options.get('last_name')
        org_name = options.get('org_name')

        # Interactive mode if email/password not provided
        if not email:
            email = input("Enter Super Admin email: ").strip()
            if not email:
                self.stdout.write(self.style.ERROR("Email is required."))
                return

        if not password:
            import getpass
            password = getpass.getpass("Enter Super Admin password: ").strip()
            if not password:
                self.stdout.write(self.style.ERROR("Password is required."))
                return
            confirm_password = getpass.getpass("Confirm password: ").strip()
            if password != confirm_password:
                self.stdout.write(self.style.ERROR("Passwords do not match."))
                return

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f"User with email '{email}' already exists."))
            return

        with transaction.atomic():
            # Create platform organization
            platform_org, org_created = Organization.objects.get_or_create(
                name=org_name,
                defaults={
                    'address_line1': '',
                    'city': '',
                    'state': '',
                    'zip_code': '',
                    'phone': '',
                },
            )

            if org_created:
                self.stdout.write(self.style.SUCCESS(f"✓ Created organization: {org_name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Organization '{org_name}' already exists."))

            # Create Super Admin user
            super_admin = User.objects.create(
                email=email,
                first_name=first_name,
                last_name=last_name,
                organization=platform_org,
                phone='',
                role=UserRole.SUPER_ADMIN,
                is_staff=True,
                is_active=True,
                timezone='America/Chicago',
            )
            super_admin.set_password(password)
            super_admin.save()

            self.stdout.write(self.style.SUCCESS("=" * 70))
            self.stdout.write(self.style.SUCCESS("✓ SUPER ADMIN CREATED SUCCESSFULLY!"))
            self.stdout.write(self.style.SUCCESS("=" * 70))
            self.stdout.write(f"Email: {email}")
            self.stdout.write(f"Name: {super_admin.full_name}")
            self.stdout.write(f"Organization: {platform_org.name}")
            self.stdout.write(f"Role: Super Admin")
            self.stdout.write(self.style.SUCCESS("=" * 70))
            self.stdout.write(self.style.WARNING("\n⚠️  Please store these credentials securely!"))
            self.stdout.write(self.style.WARNING("This Super Admin can create all other user types.\n"))



