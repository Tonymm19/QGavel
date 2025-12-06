"""
Management command to fix chamber staff data for judges.
Migrates incorrectly mapped data to correct fields.
"""
import re
from django.core.management.base import BaseCommand
from court_rules.models import Judge


class Command(BaseCommand):
    help = 'Fix chamber staff field mappings for judges'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without actually making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be saved'))
        
        judges = Judge.objects.all()
        total_judges = judges.count()
        updated_count = 0
        
        self.stdout.write(f'Processing {total_judges} judges...\n')
        
        for judge in judges:
            changes_made = False
            changes_log = []
            
            # Fix Court Reporter data
            # If clerk_name exists but court_reporter_name doesn't, it might be misplaced
            if judge.clerk_name and not judge.court_reporter_name:
                # Check if clerk_name looks like it's actually a court reporter
                # (this is a heuristic - adjust as needed)
                if 'reporter' not in judge.clerk_name.lower():
                    # Parse additional_staff for court reporter info
                    if judge.additional_staff:
                        # Look for "Court Reporter: [Name]" pattern
                        reporter_match = re.search(
                            r'Court Reporter:\s*([^\n]+)',
                            judge.additional_staff,
                            re.IGNORECASE
                        )
                        if reporter_match:
                            reporter_name = reporter_match.group(1).strip()
                            judge.court_reporter_name = reporter_name
                            changes_made = True
                            changes_log.append(f'  → Set court_reporter_name to: {reporter_name}')
                            
                            # Clean up additional_staff
                            cleaned_staff = re.sub(
                                r'Court Reporter:\s*[^\n]+\n?',
                                '',
                                judge.additional_staff,
                                flags=re.IGNORECASE
                            ).strip()
                            judge.additional_staff = cleaned_staff
                            changes_log.append(f'  → Cleaned additional_staff')
            
            # If clerk_name contains what looks like court reporter data
            # (e.g., no typical deputy indicators), consider moving to courtroom deputy properly
            if judge.clerk_name and 'reporter' in judge.clerk_name.lower():
                # This is actually a court reporter in the wrong field
                if not judge.court_reporter_name:
                    judge.court_reporter_name = judge.clerk_name
                    judge.court_reporter_phone = judge.clerk_phone
                    judge.court_reporter_room = judge.clerk_room
                    changes_made = True
                    changes_log.append(f'  → Moved clerk_name to court_reporter_name: {judge.clerk_name}')
                    
                    # Clear the clerk fields
                    judge.clerk_name = ''
                    judge.clerk_phone = ''
                    judge.clerk_room = ''
                    changes_log.append(f'  → Cleared incorrect clerk fields')
            
            # Parse additional_staff for structured data
            if judge.additional_staff and not changes_made:
                lines = judge.additional_staff.split('\n')
                new_additional_staff_lines = []
                
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    
                    # Try to extract structured information
                    # Pattern: "Role: Name, Phone: XXX, Room: YYY"
                    if re.match(r'Court Reporter:', line, re.IGNORECASE):
                        if not judge.court_reporter_name:
                            # Extract name
                            match = re.search(r'Court Reporter:\s*([^,\n]+)', line, re.IGNORECASE)
                            if match:
                                judge.court_reporter_name = match.group(1).strip()
                                changes_made = True
                                changes_log.append(f'  → Set court_reporter_name: {judge.court_reporter_name}')
                            
                            # Extract phone if present
                            phone_match = re.search(r'Phone:\s*([^,\n]+)', line, re.IGNORECASE)
                            if phone_match:
                                judge.court_reporter_phone = phone_match.group(1).strip()
                                changes_log.append(f'  → Set court_reporter_phone')
                            
                            # Extract room if present
                            room_match = re.search(r'Room:\s*([^,\n]+)', line, re.IGNORECASE)
                            if room_match:
                                judge.court_reporter_room = room_match.group(1).strip()
                                changes_log.append(f'  → Set court_reporter_room')
                        continue  # Don't add to new_additional_staff_lines
                    
                    elif re.match(r'Courtroom Deputy:', line, re.IGNORECASE):
                        if not judge.clerk_name:
                            # Extract name
                            match = re.search(r'Courtroom Deputy:\s*([^,\n]+)', line, re.IGNORECASE)
                            if match:
                                judge.clerk_name = match.group(1).strip()
                                changes_made = True
                                changes_log.append(f'  → Set clerk_name: {judge.clerk_name}')
                            
                            # Extract phone if present
                            phone_match = re.search(r'Phone:\s*([^,\n]+)', line, re.IGNORECASE)
                            if phone_match:
                                judge.clerk_phone = phone_match.group(1).strip()
                                changes_log.append(f'  → Set clerk_phone')
                            
                            # Extract room if present
                            room_match = re.search(r'Room:\s*([^,\n]+)', line, re.IGNORECASE)
                            if room_match:
                                judge.clerk_room = room_match.group(1).strip()
                                changes_log.append(f'  → Set clerk_room')
                        continue  # Don't add to new_additional_staff_lines
                    
                    else:
                        # Keep unrecognized lines
                        new_additional_staff_lines.append(line)
                
                if changes_made:
                    judge.additional_staff = '\n'.join(new_additional_staff_lines)
            
            # Save changes
            if changes_made:
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'\n{judge.full_name}:'))
                for log_line in changes_log:
                    self.stdout.write(log_line)
                
                if not dry_run:
                    judge.save()
                    self.stdout.write(self.style.SUCCESS('  ✓ Saved'))
                else:
                    self.stdout.write(self.style.WARNING('  (not saved - dry run)'))
        
        # Summary
        self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
        self.stdout.write(self.style.SUCCESS(f'Processed {total_judges} judges'))
        self.stdout.write(self.style.SUCCESS(f'Updated {updated_count} judges'))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nThis was a DRY RUN. Run without --dry-run to apply changes.'))




