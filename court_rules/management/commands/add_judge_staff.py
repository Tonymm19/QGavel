"""
Management command to manually add clerk and staff information for judges
Usage: python manage.py add_judge_staff
"""
import re
from django.core.management.base import BaseCommand
from court_rules.models import Judge


def format_phone_number(phone):
    """Format phone number to (999) 999-9999"""
    if not phone:
        return ''
    digits = re.sub(r'\D', '', phone)
    if len(digits) == 10:
        return f'({digits[0:3]}) {digits[3:6]}-{digits[6:10]}'
    elif len(digits) == 11 and digits[0] == '1':
        return f'({digits[1:4]}) {digits[4:7]}-{digits[7:11]}'
    return phone


class Command(BaseCommand):
    help = 'Manually add clerk and staff information for a judge'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=== Add Judge Staff Information ===\n'))
        
        # Show list of judges
        judges = Judge.objects.all().order_by('full_name')
        self.stdout.write('Available judges:')
        for i, judge in enumerate(judges, 1):
            has_info = '✓' if judge.clerk_name else '✗'
            self.stdout.write(f'  {i}. {has_info} {judge.full_name}')
        
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write('Enter information (press Ctrl+C to exit)')
        self.stdout.write('=' * 70 + '\n')
        
        try:
            while True:
                # Get judge name
                judge_num = input('\nEnter judge number (or "list" to see list again): ').strip()
                
                if judge_num.lower() == 'list':
                    for i, judge in enumerate(judges, 1):
                        has_info = '✓' if judge.clerk_name else '✗'
                        self.stdout.write(f'  {i}. {has_info} {judge.full_name}')
                    continue
                
                if judge_num.lower() in ['exit', 'quit', 'q']:
                    break
                
                try:
                    judge_idx = int(judge_num) - 1
                    if 0 <= judge_idx < len(judges):
                        judge = judges[judge_idx]
                    else:
                        self.stdout.write(self.style.ERROR('Invalid judge number'))
                        continue
                except ValueError:
                    self.stdout.write(self.style.ERROR('Please enter a valid number'))
                    continue
                
                self.stdout.write(f'\n--- Adding information for: {judge.full_name} ---')
                
                # Get Court Reporter info
                self.stdout.write('\n📝 Court Reporter Information:')
                reporter_name = input('  Name (or press Enter to skip): ').strip()
                reporter_phone = ''
                reporter_room = ''
                if reporter_name:
                    phone_input = input('  Phone (optional): ').strip()
                    reporter_phone = format_phone_number(phone_input) if phone_input else ''
                    reporter_room = input('  Room (optional): ').strip()
                
                # Get Courtroom Deputy info (this is the main clerk)
                self.stdout.write('\n📝 Courtroom Deputy Information:')
                deputy_name = input('  Name (or "none" if not listed): ').strip()
                if deputy_name.lower() == 'none':
                    deputy_name = ''
                    deputy_phone = ''
                    deputy_room = ''
                else:
                    phone_input = input('  Phone: ').strip()
                    deputy_phone = format_phone_number(phone_input) if phone_input else ''
                    deputy_room = input('  Room: ').strip()
                
                # Get Executive Law Clerk (optional, only if exists)
                self.stdout.write('\n📝 Executive Law Clerk (optional):')
                executive_clerk = input('  Name (or press Enter to skip): ').strip()
                
                # Get Judicial Assistant (optional, only if exists)
                self.stdout.write('\n📝 Judicial Assistant (optional):')
                judicial_asst = input('  Name (or press Enter to skip): ').strip()
                
                # Get Law Clerks
                self.stdout.write('\n📝 Law Clerk Information:')
                self.stdout.write('  Enter law clerk names (one per line, press Enter twice when done, or type "none"):')
                law_clerks = []
                first_input = input('    ').strip()
                if first_input.lower() != 'none':
                    if first_input:
                        law_clerks.append(first_input)
                    while True:
                        clerk_name = input('    ').strip()
                        if not clerk_name:
                            break
                        law_clerks.append(clerk_name)
                
                # Build additional_staff field
                staff_lines = []
                
                # Court Reporter
                if reporter_name:
                    staff_lines.append(f"Court Reporter: {reporter_name}")
                    if reporter_phone:
                        staff_lines.append(f"  Phone: {reporter_phone}")
                    if reporter_room:
                        staff_lines.append(f"  Room: {reporter_room}")
                else:
                    staff_lines.append("Court Reporter: No court reporter listed")
                staff_lines.append("")  # Blank line
                
                # Courtroom Deputy
                if deputy_name:
                    staff_lines.append(f"Courtroom Deputy: {deputy_name}")
                    if deputy_phone:
                        staff_lines.append(f"  Phone: {deputy_phone}")
                    if deputy_room:
                        staff_lines.append(f"  Room: {deputy_room}")
                else:
                    staff_lines.append("Courtroom Deputy: No courtroom deputy listed")
                staff_lines.append("")  # Blank line
                
                # Law Clerk
                if law_clerks:
                    # Don't add to additional_staff, will be in apprentices field
                    pass
                else:
                    staff_lines.append("Law Clerk: No law clerk listed")
                
                # Update the judge
                judge.clerk_name = deputy_name
                judge.clerk_phone = deputy_phone
                judge.clerk_room = deputy_room
                judge.executive_law_clerk = executive_clerk
                judge.judicial_assistant = judicial_asst
                judge.apprentices = '\n'.join(law_clerks) if law_clerks else ''
                judge.additional_staff = '\n'.join(staff_lines)
                judge.save()
                
                # Show summary
                self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully updated {judge.full_name}'))
                if deputy_name:
                    self.stdout.write(f'   Courtroom Deputy: {deputy_name}')
                    if deputy_phone:
                        self.stdout.write(f'   Phone: {deputy_phone}')
                    if deputy_room:
                        self.stdout.write(f'   Room: {deputy_room}')
                else:
                    self.stdout.write(f'   Courtroom Deputy: Not listed')
                if executive_clerk:
                    self.stdout.write(f'   Executive Law Clerk: {executive_clerk}')
                if judicial_asst:
                    self.stdout.write(f'   Judicial Assistant: {judicial_asst}')
                if law_clerks:
                    self.stdout.write(f'   Law Clerks: {len(law_clerks)} - {", ".join(law_clerks)}')
                else:
                    self.stdout.write(f'   Law Clerks: Not listed')
                if reporter_name:
                    self.stdout.write(f'   Court Reporter: {reporter_name}')
                else:
                    self.stdout.write(f'   Court Reporter: Not listed')
        
        except KeyboardInterrupt:
            self.stdout.write('\n\n' + self.style.SUCCESS('Exiting...'))
        
        # Show final summary
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('Summary:'))
        judges_with_info = Judge.objects.exclude(clerk_name='').count()
        judges_without_info = Judge.objects.filter(clerk_name='').count()
        self.stdout.write(f'  Judges with staff info: {judges_with_info}')
        self.stdout.write(f'  Judges without staff info: {judges_without_info}')
        
        if judges_without_info > 0:
            self.stdout.write('\n  Judges still needing information:')
            for judge in Judge.objects.filter(clerk_name='').order_by('full_name'):
                self.stdout.write(f'    - {judge.full_name}')
        
        self.stdout.write('=' * 70)

