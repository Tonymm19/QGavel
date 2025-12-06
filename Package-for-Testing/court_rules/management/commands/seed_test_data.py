"""
Management command to seed comprehensive test data for Precedentum
Includes: Organizations, Users, Subscriptions, Cases, Billing Records
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal
from court_rules.models import (
    Organization, User, Subscription, SubscriptionHistory, BillingRecord,
    Case, Court, Contact, Deadline
)


class Command(BaseCommand):
    help = 'Seeds comprehensive test data including organizations, users, subscriptions, cases, and billing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting comprehensive data seeding...'))

        # Create courts first (if not exists)
        ilnd_court, _ = Court.objects.get_or_create(
            name='United States District Court for the Northern District of Illinois',
            defaults={
                'district': 'Northern District of Illinois',
                'location': 'Chicago, IL',
                'timezone': 'America/Chicago',
                'website_url': 'https://www.ilnd.uscourts.gov/',
            }
        )

        cdca_court, _ = Court.objects.get_or_create(
            name='United States District Court for the Central District of California',
            defaults={
                'district': 'Central District of California',
                'location': 'Los Angeles, CA',
                'timezone': 'America/Los_Angeles',
                'website_url': 'https://www.cacd.uscourts.gov/',
            }
        )

        sdny_court, _ = Court.objects.get_or_create(
            name='United States District Court for the Southern District of New York',
            defaults={
                'district': 'Southern District of New York',
                'location': 'New York, NY',
                'timezone': 'America/New_York',
                'website_url': 'https://www.nysd.uscourts.gov/',
            }
        )

        self.stdout.write('Courts created/verified')

        # 1. Create Organizations
        demo_org, _ = Organization.objects.get_or_create(
            name='Demo Law Firm',
            defaults={
                'address_line1': '123 Legal Street',
                'city': 'Chicago',
                'state': 'IL',
                'zip_code': '60601',
                'phone': '312-555-0100',
                'is_active': True,
            }
        )

        smith_org, _ = Organization.objects.get_or_create(
            name='Smith & Associates',
            defaults={
                'address_line1': '456 Justice Ave',
                'city': 'Los Angeles',
                'state': 'CA',
                'zip_code': '90012',
                'phone': '213-555-0200',
                'is_active': True,
            }
        )

        bruce_org, _ = Organization.objects.get_or_create(
            name='Bruce DeMedici Law Firm',
            defaults={
                'address_line1': '789 Liberty Plaza',
                'city': 'New York',
                'state': 'NY',
                'zip_code': '10004',
                'phone': '212-555-0300',
                'is_active': True,
            }
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Created 3 organizations'))

        # 2. Create Super Admin Users
        piyush, _ = User.objects.get_or_create(
            email='piyush@ignitia-ai.com',
            defaults={
                'first_name': 'Piyush',
                'last_name': 'Mittal',
                'role': 'super_admin',
                'phone': '555-0001',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        if _:
            piyush.set_password('admin123')
            piyush.save()

        tony, _ = User.objects.get_or_create(
            email='tony@ignitia-ai.com',
            defaults={
                'first_name': 'Tony',
                'last_name': 'Stark',
                'role': 'super_admin',
                'phone': '555-0002',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        if _:
            tony.set_password('admin123')
            tony.save()

        bruce_admin, _ = User.objects.get_or_create(
            email='bruce@ignitia-ai.com',
            defaults={
                'first_name': 'Bruce',
                'last_name': 'Wayne',
                'role': 'super_admin',
                'phone': '555-0003',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        if _:
            bruce_admin.set_password('admin123')
            bruce_admin.save()

        self.stdout.write(self.style.SUCCESS(f'✓ Created 3 super admin users'))

        # 3. Create Users for Demo Law Firm
        demo_admin, _ = User.objects.get_or_create(
            email='admin@demolawfirm.com',
            defaults={
                'first_name': 'John',
                'last_name': 'Demo',
                'organization': demo_org,
                'role': 'firm_admin',
                'phone': '312-555-0101',
                'is_active': True,
            }
        )
        if _:
            demo_admin.set_password('demo123')
            demo_admin.save()

        demo_lawyer1, _ = User.objects.get_or_create(
            email='sarah.johnson@demolawfirm.com',
            defaults={
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'organization': demo_org,
                'role': 'lawyer',
                'phone': '312-555-0102',
                'is_active': True,
            }
        )
        if _:
            demo_lawyer1.set_password('demo123')
            demo_lawyer1.save()

        # 4. Create Users for Smith & Associates
        smith_admin, _ = User.objects.get_or_create(
            email='robert.smith@smithassociates.com',
            defaults={
                'first_name': 'Robert',
                'last_name': 'Smith',
                'organization': smith_org,
                'role': 'firm_admin',
                'phone': '213-555-0201',
                'is_active': True,
            }
        )
        if _:
            smith_admin.set_password('demo123')
            smith_admin.save()

        smith_lawyer, _ = User.objects.get_or_create(
            email='emily.chen@smithassociates.com',
            defaults={
                'first_name': 'Emily',
                'last_name': 'Chen',
                'organization': smith_org,
                'role': 'lawyer',
                'phone': '213-555-0202',
                'is_active': True,
            }
        )
        if _:
            smith_lawyer.set_password('demo123')
            smith_lawyer.save()

        # 5. Create Users for Bruce DeMedici Law Firm
        bruce_managing, _ = User.objects.get_or_create(
            email='bruce.demedici@brucedemedici.com',
            defaults={
                'first_name': 'Bruce',
                'last_name': 'DeMedici',
                'organization': bruce_org,
                'role': 'firm_admin',
                'phone': '212-555-0301',
                'is_active': True,
            }
        )
        if _:
            bruce_managing.set_password('demo123')
            bruce_managing.save()

        bruce_lawyer, _ = User.objects.get_or_create(
            email='maria.gonzalez@brucedemedici.com',
            defaults={
                'first_name': 'Maria',
                'last_name': 'Gonzalez',
                'organization': bruce_org,
                'role': 'lawyer',
                'phone': '212-555-0302',
                'is_active': True,
            }
        )
        if _:
            bruce_lawyer.set_password('demo123')
            bruce_lawyer.save()

        bruce_paralegal, _ = User.objects.get_or_create(
            email='james.park@brucedemedici.com',
            defaults={
                'first_name': 'James',
                'last_name': 'Park',
                'organization': bruce_org,
                'role': 'paralegal',
                'phone': '212-555-0303',
                'is_active': True,
            }
        )
        if _:
            bruce_paralegal.set_password('demo123')
            bruce_paralegal.save()

        self.stdout.write(self.style.SUCCESS(f'✓ Created users for all organizations'))

        # 6. Create Subscriptions for all organizations (5 users each)
        demo_sub, created = Subscription.objects.get_or_create(
            organization=demo_org,
            defaults={
                'licensed_users': 5,
                'monthly_rate': Decimal('499.00'),
                'billing_cycle_type': 'monthly',
                'billing_day': 1,
                'contract_start_date': date.today() - timedelta(days=90),
                'contract_end_date': date.today() + timedelta(days=275),
                'status': 'active',
                'notes': 'Standard subscription - 5 users',
            }
        )
        if created:
            self.stdout.write(f'  ✓ Subscription created for {demo_org.name}')

        smith_sub, created = Subscription.objects.get_or_create(
            organization=smith_org,
            defaults={
                'licensed_users': 5,
                'monthly_rate': Decimal('499.00'),
                'billing_cycle_type': 'monthly',
                'billing_day': 15,
                'contract_start_date': date.today() - timedelta(days=60),
                'contract_end_date': date.today() + timedelta(days=305),
                'status': 'active',
                'notes': 'Standard subscription - 5 users',
            }
        )
        if created:
            self.stdout.write(f'  ✓ Subscription created for {smith_org.name}')

        bruce_sub, created = Subscription.objects.get_or_create(
            organization=bruce_org,
            defaults={
                'licensed_users': 5,
                'monthly_rate': Decimal('499.00'),
                'billing_cycle_type': 'monthly',
                'billing_day': 1,
                'contract_start_date': date.today(),
                'contract_end_date': date.today() + timedelta(days=365),
                'status': 'active',
                'notes': 'Standard subscription - 5 users',
            }
        )
        if created:
            self.stdout.write(f'  ✓ Subscription created for {bruce_org.name}')

        # 7. Create Billing Records
        # Demo Law Firm - 3 months of billing
        for i in range(3):
            month_offset = 2 - i  # 2, 1, 0 (oldest to newest)
            period_start = date.today().replace(day=1) - timedelta(days=30 * month_offset)
            period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            status = 'paid' if i < 2 else 'pending'
            amount_paid = Decimal('499.00') if i < 2 else Decimal('0.00')
            payment_date = period_start + timedelta(days=5) if i < 2 else None
            
            BillingRecord.objects.get_or_create(
                subscription=demo_sub,
                billing_period_start=period_start,
                defaults={
                    'billing_period_end': period_end,
                    'amount_billed': Decimal('499.00'),
                    'amount_paid': amount_paid,
                    'balance_due': Decimal('499.00') - amount_paid,
                    'invoice_date': period_start - timedelta(days=3),
                    'payment_received_date': payment_date,
                    'payment_due_date': period_start + timedelta(days=30),
                    'payment_status': status,
                    'invoice_number': f'INV-DEMO-{period_start.strftime("%Y%m")}',
                    'notes': f'Monthly billing for {period_start.strftime("%B %Y")}',
                }
            )

        # Smith & Associates - 2 months of billing
        for i in range(2):
            month_offset = 1 - i
            period_start = date.today().replace(day=15) - timedelta(days=30 * month_offset)
            period_end = (period_start + timedelta(days=32)).replace(day=15) - timedelta(days=1)
            
            status = 'paid' if i < 1 else 'pending'
            amount_paid = Decimal('499.00') if i < 1 else Decimal('0.00')
            payment_date = period_start + timedelta(days=7) if i < 1 else None
            
            BillingRecord.objects.get_or_create(
                subscription=smith_sub,
                billing_period_start=period_start,
                defaults={
                    'billing_period_end': period_end,
                    'amount_billed': Decimal('499.00'),
                    'amount_paid': amount_paid,
                    'balance_due': Decimal('499.00') - amount_paid,
                    'invoice_date': period_start - timedelta(days=5),
                    'payment_received_date': payment_date,
                    'payment_due_date': period_start + timedelta(days=30),
                    'payment_status': status,
                    'invoice_number': f'INV-SMITH-{period_start.strftime("%Y%m")}',
                    'notes': f'Monthly billing for {period_start.strftime("%B %Y")}',
                }
            )

        # Bruce DeMedici - 1 billing record (new customer)
        period_start = date.today().replace(day=1)
        period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        BillingRecord.objects.get_or_create(
            subscription=bruce_sub,
            billing_period_start=period_start,
            defaults={
                'billing_period_end': period_end,
                'amount_billed': Decimal('499.00'),
                'amount_paid': Decimal('0.00'),
                'balance_due': Decimal('499.00'),
                'invoice_date': period_start - timedelta(days=2),
                'payment_due_date': period_start + timedelta(days=30),
                'payment_status': 'pending',
                'invoice_number': f'INV-BRUCE-{period_start.strftime("%Y%m")}',
                'notes': f'First invoice - Monthly billing for {period_start.strftime("%B %Y")}',
            }
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Created billing records for all organizations'))

        # 8. Create Sample Cases
        cases_data = [
            {
                'org': demo_org,
                'court': ilnd_court,
                'attorney': demo_lawyer1,
                'caption': 'Johnson v. Tech Corp',
                'internal_id': 'DEMO-2024-001',
                'case_number': '2024-CV-12345',
                'status': 'open',
                'practice_area': 'Employment Law',
                'filing_date': (timezone.now() - timedelta(days=45)).date(),
            },
            {
                'org': demo_org,
                'court': ilnd_court,
                'attorney': demo_admin,
                'caption': 'Smith Enterprises v. Data Systems LLC',
                'internal_id': 'DEMO-2024-002',
                'case_number': '2024-CV-12346',
                'status': 'open',
                'practice_area': 'Contract Law',
                'filing_date': (timezone.now() - timedelta(days=30)).date(),
            },
            {
                'org': smith_org,
                'court': cdca_court,
                'attorney': smith_lawyer,
                'caption': 'Martinez v. Global Industries',
                'internal_id': 'SMITH-2024-001',
                'case_number': '2024-CV-54321',
                'status': 'open',
                'practice_area': 'Product Liability',
                'filing_date': (timezone.now() - timedelta(days=60)).date(),
            },
            {
                'org': smith_org,
                'court': cdca_court,
                'attorney': smith_lawyer,
                'caption': 'People v. Anderson',
                'internal_id': 'SMITH-2024-002',
                'case_number': '2024-CR-99001',
                'status': 'open',
                'practice_area': 'Criminal Defense',
                'filing_date': (timezone.now() - timedelta(days=90)).date(),
            },
            {
                'org': bruce_org,
                'court': sdny_court,
                'attorney': bruce_lawyer,
                'caption': 'Chen v. Metropolitan Bank',
                'internal_id': 'BRUCE-2024-001',
                'case_number': '2024-CV-77777',
                'status': 'open',
                'practice_area': 'Banking Law',
                'filing_date': (timezone.now() - timedelta(days=15)).date(),
            },
            {
                'org': bruce_org,
                'court': sdny_court,
                'attorney': bruce_lawyer,
                'caption': 'Rodriguez v. City of New York',
                'internal_id': 'BRUCE-2024-002',
                'case_number': '2024-CV-88888',
                'status': 'open',
                'practice_area': 'Civil Rights',
                'filing_date': (timezone.now() - timedelta(days=20)).date(),
            },
        ]

        created_cases = []
        for case_data in cases_data:
            case, created = Case.objects.get_or_create(
                internal_case_id=case_data['internal_id'],
                defaults={
                    'organization': case_data['org'],
                    'court': case_data['court'],
                    'lead_attorney': case_data['attorney'],
                    'caption': case_data['caption'],
                    'case_number': case_data['case_number'],
                    'status': case_data['status'],
                    'practice_area': case_data['practice_area'],
                    'filing_date': case_data['filing_date'],
                    'timezone': 'America/Chicago',
                }
            )
            if created:
                created_cases.append(case)

        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(created_cases)} sample cases'))

        # 9. Create Sample Deadlines
        deadlines_created = 0
        for case in created_cases:
            # Create 2 deadlines per case
            for i in range(2):
                days_ahead = (i + 1) * 15
                Deadline.objects.get_or_create(
                    case=case,
                    trigger_type='filing',
                    due_at=timezone.now() + timedelta(days=days_ahead),
                    defaults={
                        'basis': 'calendar_days',
                        'status': 'open',
                        'timezone': 'America/Chicago',
                        'priority': 3,
                        'computation_rationale': f'Filing deadline {i+1} based on FRCP 12(a)',
                        'extension_notes': '',
                    }
                )
                deadlines_created += 1

        self.stdout.write(self.style.SUCCESS(f'✓ Created {deadlines_created} sample deadlines'))

        self.stdout.write(self.style.SUCCESS('\n=== Data Seeding Complete ==='))
        self.stdout.write(self.style.SUCCESS(f'✓ Organizations: 3'))
        self.stdout.write(self.style.SUCCESS(f'✓ Users: 10 (3 super admins + 7 firm users)'))
        self.stdout.write(self.style.SUCCESS(f'✓ Subscriptions: 3 (5 users each)'))
        self.stdout.write(self.style.SUCCESS(f'✓ Billing Records: 6'))
        self.stdout.write(self.style.SUCCESS(f'✓ Cases: {len(created_cases)}'))
        self.stdout.write(self.style.SUCCESS(f'✓ Deadlines: {deadlines_created}'))
        self.stdout.write(self.style.SUCCESS('\nLogin credentials for all users: password = "demo123" or "admin123" for super admins'))

