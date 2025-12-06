"""
Management command to scrape Court Reporter phone and room information for ILND judges
"""
import requests
import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from court_rules.models import Judge


class Command(BaseCommand):
    help = 'Scrapes Court Reporter phone and room information from ILND judge chambers pages'

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
        
        self.stdout.write(self.style.SUCCESS('Starting to scrape Court Reporter details...'))

        judges = Judge.objects.all().order_by('full_name')
        updated_count = 0
        
        for judge in judges:
            if not judge.chambers_url:
                self.stdout.write(self.style.WARNING(f'⚠️  Skipping {judge.full_name} - No chambers URL'))
                continue
            
            self.stdout.write(f'\n📋 Processing: {judge.full_name}')
            self.stdout.write(f'   URL: {judge.chambers_url}')
            
            try:
                # Fetch the page
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
                response = requests.get(judge.chambers_url, headers=headers, timeout=10)
                response.raise_for_status()
                
                html_text = response.text
                updated = False
                
                # Find Court Reporter section using regex
                court_reporter_match = re.search(
                    r'\*\*Court Reporter\*\*\s*<br\s*/?>(.+?)(?=\*\*Courtroom Deputy\*\*|\*\*Law Clerk\*\*|<hr|---)',
                    html_text,
                    re.DOTALL | re.IGNORECASE
                )
                
                if court_reporter_match:
                    reporter_html = court_reporter_match.group(1)
                    reporter_soup = BeautifulSoup(reporter_html, 'html.parser')
                    reporter_text = reporter_soup.get_text().strip()
                    reporter_lines = [line.strip() for line in reporter_text.split('\n') if line.strip() and line.strip() != '---']
                    
                    if reporter_lines:
                        # First line is the name
                        name = reporter_lines[0]
                        
                        # Update only if name matches what we already have (for safety)
                        if judge.court_reporter_name and judge.court_reporter_name in name:
                            self.stdout.write(f'   ✓ Found Court Reporter: {name}')
                            
                            # Parse subsequent lines for phone and room
                            for line in reporter_lines[1:]:
                                # Check if it's a phone number
                                phone_pattern = r'(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})'
                                phone_match = re.search(phone_pattern, line)
                                if phone_match:
                                    phone = phone_match.group(1)
                                    judge.court_reporter_phone = phone
                                    updated = True
                                    self.stdout.write(f'     → Phone: {phone}')
                                
                                # Check if it's a room number
                                if 'Room' in line or re.match(r'^\d{3,5}[A-Z]?$', line):
                                    room = line.replace('Room', '').strip()
                                    if not room.startswith('Room'):
                                        room = f'Room {room}'
                                    judge.court_reporter_room = room
                                    updated = True
                                    self.stdout.write(f'     → Room: {room}')
                        else:
                            self.stdout.write(f'   ⚠️  Court Reporter name mismatch: Found "{name}", expected "{judge.court_reporter_name}"')
                
                if updated:
                    if not dry_run:
                        judge.save()
                        self.stdout.write(self.style.SUCCESS(f'   ✅ Updated {judge.full_name}'))
                        updated_count += 1
                    else:
                        self.stdout.write(self.style.WARNING(f'   (not saved - dry run)'))
                        updated_count += 1
                else:
                    self.stdout.write(f'   ℹ️  No Court Reporter contact info found')
                
            except requests.exceptions.RequestException as e:
                self.stdout.write(self.style.ERROR(f'   ❌ Error fetching page: {str(e)}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ❌ Error processing page: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n{"="*80}'))
        self.stdout.write(self.style.SUCCESS(f'Processed {judges.count()} judges'))
        self.stdout.write(self.style.SUCCESS(f'Updated {updated_count} judges with Court Reporter details'))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nThis was a DRY RUN. Run without --dry-run to apply changes.'))




