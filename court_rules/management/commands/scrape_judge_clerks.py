"""
Management command to scrape clerk and staff information for ILND judges
"""
import requests
import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from court_rules.models import Judge


class Command(BaseCommand):
    help = 'Scrapes clerk and staff information from ILND judge chambers pages'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to scrape judge clerk information...'))

        judges = Judge.objects.all().order_by('full_name')
        
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
                
                # Parse the HTML
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Use regex to find staff information in the HTML
                # The pattern is: **Court Reporter**  Name  **Courtroom Deputy**  Name  Phone  Room  **Law Clerk**  Names
                updated = False
                staff_info = []
                
                html_text = response.text
                
                # Find Court Reporter section using regex
                court_reporter_match = re.search(r'\*\*Court Reporter\*\*\s*<br\s*/?>(.+?)(?=\*\*Courtroom Deputy\*\*|<hr|---)', html_text, re.DOTALL | re.IGNORECASE)
                if court_reporter_match:
                    reporter_html = court_reporter_match.group(1)
                    reporter_soup = BeautifulSoup(reporter_html, 'html.parser')
                    reporter_text = reporter_soup.get_text().strip()
                    reporter_lines = [line.strip() for line in reporter_text.split('\n') if line.strip() and line.strip() != '---']
                    if reporter_lines:
                        staff_info.append(f"Court Reporter: {reporter_lines[0]}")
                        for line in reporter_lines[1:3]:
                            if line:
                                staff_info.append(f"  {line}")
                
                # Find Courtroom Deputy section
                deputy_match = re.search(r'\*\*Courtroom Deputy\*\*\s*<br\s*/?>(.+?)(?=\*\*Law Clerk\*\*|<hr|---)', html_text, re.DOTALL | re.IGNORECASE)
                if deputy_match:
                    deputy_html = deputy_match.group(1)
                    deputy_soup = BeautifulSoup(deputy_html, 'html.parser')
                    deputy_text = deputy_soup.get_text().strip()
                    deputy_lines = [line.strip() for line in deputy_text.split('\n') if line.strip() and line.strip() != '---']
                    
                    if deputy_lines:
                        # First line is the name
                        judge.clerk_name = deputy_lines[0]
                        staff_info.append(f"Courtroom Deputy: {deputy_lines[0]}")
                        updated = True
                        self.stdout.write(f'   ✓ Found Courtroom Deputy: {deputy_lines[0]}')
                        
                        # Next lines are phone and room
                        for line in deputy_lines[1:]:
                            if re.match(r'^\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}', line):
                                judge.clerk_phone = line
                                staff_info.append(f"  Phone: {line}")
                                updated = True
                            elif 'Room' in line or re.match(r'^\d{3,5}$', line):
                                room = line.replace('Room', '').strip()
                                judge.clerk_room = room
                                staff_info.append(f"  Room: {room}")
                                updated = True
                
                # Find Law Clerk section
                clerk_match = re.search(r'\*\*Law Clerk\*\*\s*<br\s*/?>(.+?)(?=Northern District Logo|Court Telephone|©202)', html_text, re.DOTALL | re.IGNORECASE)
                if clerk_match:
                    clerk_html = clerk_match.group(1)
                    clerk_soup = BeautifulSoup(clerk_html, 'html.parser')
                    clerk_text = clerk_soup.get_text().strip()
                    clerk_lines = [line.strip() for line in clerk_text.split('\n') if line.strip() and line.strip() != '---']
                    
                    # Filter out non-names (typically names are 2-4 words, < 50 chars)
                    law_clerks = []
                    for line in clerk_lines[:10]:  # Limit to first 10 lines
                        if (2 < len(line) < 50 and 
                            not re.search(r'Northern District|Court Telephone|©|chevron|@|Room \d', line)):
                            law_clerks.append(line)
                    
                    if law_clerks:
                        judge.apprentices = '\n'.join(law_clerks)
                        updated = True
                        self.stdout.write(f'   ✓ Found {len(law_clerks)} Law Clerk(s): {", ".join(law_clerks)}')
                
                if staff_info:
                    judge.additional_staff = '\n'.join(staff_info)
                    updated = True
                
                if updated:
                    judge.save()
                    self.stdout.write(self.style.SUCCESS(f'   ✅ Updated {judge.full_name}'))
                else:
                    self.stdout.write(f'   ℹ️  No new information found (page may need manual review)')
                
            except requests.exceptions.RequestException as e:
                self.stdout.write(self.style.ERROR(f'   ❌ Error fetching page: {str(e)}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'   ❌ Error processing page: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Scraping complete!'))
        self.stdout.write(self.style.SUCCESS('\nNOTE: Some information may require manual review of judge pages.'))
        self.stdout.write(self.style.SUCCESS('The court website structure may not be consistent across all judge pages.'))

