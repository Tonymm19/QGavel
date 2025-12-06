"""
Management command to normalize/standardize data formats across the database
- Phone numbers: (999) 999-9999
- State codes: Valid US states only
- Zip codes: Valid US zip codes only
"""
import re
from django.core.management.base import BaseCommand
from court_rules.models import Judge, Organization, User


# Valid US state codes
VALID_US_STATES = {
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
}


def format_phone_number(phone):
    """
    Format phone number to (999) 999-9999
    Accepts various formats and returns standardized format
    """
    if not phone:
        return ''
    
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    
    # Check if we have exactly 10 digits
    if len(digits) == 10:
        return f'({digits[0:3]}) {digits[3:6]}-{digits[6:10]}'
    elif len(digits) == 11 and digits[0] == '1':
        # Handle numbers with country code
        return f'({digits[1:4]}) {digits[4:7]}-{digits[7:11]}'
    else:
        # Return original if we can't parse it
        return phone


def validate_state_code(state):
    """Check if state code is valid US state"""
    if not state:
        return True  # Empty is ok
    return state.upper() in VALID_US_STATES


def validate_zip_code(zip_code):
    """Check if zip code is valid US format (5 digits or 5+4)"""
    if not zip_code:
        return True  # Empty is ok
    
    # US zip codes are either 5 digits or 5+4 format
    return bool(re.match(r'^\d{5}(-\d{4})?$', zip_code))


class Command(BaseCommand):
    help = 'Normalize data formats: phone numbers, state codes, zip codes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('=== DRY RUN MODE - No changes will be saved ===\n'))
        else:
            self.stdout.write(self.style.SUCCESS('=== Normalizing Data ===\n'))
        
        changes = {
            'phone_numbers': 0,
            'states': 0,
            'zip_codes': 0,
        }
        
        # Normalize Judge phone numbers
        self.stdout.write('📞 Normalizing Judge phone numbers...')
        for judge in Judge.objects.all():
            updated = False
            
            # Contact phone
            if judge.contact_phone:
                formatted = format_phone_number(judge.contact_phone)
                if formatted != judge.contact_phone:
                    self.stdout.write(f'  {judge.full_name}: {judge.contact_phone} → {formatted}')
                    judge.contact_phone = formatted
                    updated = True
                    changes['phone_numbers'] += 1
            
            # Clerk phone
            if judge.clerk_phone:
                formatted = format_phone_number(judge.clerk_phone)
                if formatted != judge.clerk_phone:
                    self.stdout.write(f'  {judge.full_name} (clerk): {judge.clerk_phone} → {formatted}')
                    judge.clerk_phone = formatted
                    updated = True
                    changes['phone_numbers'] += 1
            
            # Update additional_staff field to normalize phone numbers in text
            if judge.additional_staff:
                original = judge.additional_staff
                # Find and replace phone numbers in the text
                phone_pattern = r'Phone:\s*([^\n]+)'
                matches = re.findall(phone_pattern, judge.additional_staff)
                for match in matches:
                    formatted = format_phone_number(match)
                    if formatted != match:
                        judge.additional_staff = judge.additional_staff.replace(match, formatted)
                        updated = True
                        changes['phone_numbers'] += 1
            
            if updated and not dry_run:
                judge.save()
        
        # Normalize Organization data
        self.stdout.write('\n🏢 Normalizing Organization data...')
        for org in Organization.objects.all():
            updated = False
            
            # Phone
            if org.phone:
                formatted = format_phone_number(org.phone)
                if formatted != org.phone:
                    self.stdout.write(f'  {org.name} phone: {org.phone} → {formatted}')
                    org.phone = formatted
                    updated = True
                    changes['phone_numbers'] += 1
            
            # State code
            if org.state and not validate_state_code(org.state):
                self.stdout.write(self.style.ERROR(f'  ⚠️  {org.name} has invalid state: {org.state}'))
                changes['states'] += 1
            elif org.state:
                org.state = org.state.upper()
                updated = True
            
            # Zip code
            if org.zip_code and not validate_zip_code(org.zip_code):
                self.stdout.write(self.style.ERROR(f'  ⚠️  {org.name} has invalid zip: {org.zip_code}'))
                changes['zip_codes'] += 1
            
            if updated and not dry_run:
                org.save()
        
        # Normalize User phone numbers
        self.stdout.write('\n👤 Normalizing User phone numbers...')
        for user in User.objects.all():
            if user.phone:
                formatted = format_phone_number(user.phone)
                if formatted != user.phone:
                    self.stdout.write(f'  {user.email}: {user.phone} → {formatted}')
                    user.phone = formatted
                    changes['phone_numbers'] += 1
                    if not dry_run:
                        user.save()
        
        # Summary
        self.stdout.write('\n' + '=' * 70)
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN COMPLETE - No changes were saved'))
        else:
            self.stdout.write(self.style.SUCCESS('NORMALIZATION COMPLETE'))
        self.stdout.write(f'  Phone numbers formatted: {changes["phone_numbers"]}')
        self.stdout.write(f'  Invalid state codes found: {changes["states"]}')
        self.stdout.write(f'  Invalid zip codes found: {changes["zip_codes"]}')
        self.stdout.write('=' * 70)


