"""
Enhanced seed data for user testing with realistic court rules and judge procedures.
This creates double the amount of data compared to the basic seed script.
"""
import random
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from court_rules.models import (
    Case,
    CaseStatus,
    Court,
    Deadline,
    DeadlineBasis,
    DeadlineStatus,
    DeadlineTriggerType,
    HolidayCalendar,
    Judge,
    JudgeProcedure,
    Rule,
    RuleSourceType,
    User,
    UserRole,
)


class Command(BaseCommand):
    help = "Seed enhanced demo data for user testing with realistic rules and procedures."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting enhanced data seeding..."))
        
        with transaction.atomic():
            # Create users
            lawyer1, _ = User.objects.get_or_create(
                email="demo.lawyer@example.com",
                defaults={
                    "full_name": "Sarah Chen",
                    "role": UserRole.LAWYER,
                    "timezone": "America/Chicago",
                },
            )
            if not lawyer1.has_usable_password():
                lawyer1.set_password("changeme123")
                lawyer1.save(update_fields=["password"])

            lawyer2, _ = User.objects.get_or_create(
                email="john.mitchell@example.com",
                defaults={
                    "full_name": "John Mitchell",
                    "role": UserRole.LAWYER,
                    "timezone": "America/Chicago",
                },
            )
            if not lawyer2.has_usable_password():
                lawyer2.set_password("changeme123")
                lawyer2.save(update_fields=["password"])

            paralegal, _ = User.objects.get_or_create(
                email="maria.santos@example.com",
                defaults={
                    "full_name": "Maria Santos",
                    "role": UserRole.PARALEGAL,
                    "timezone": "America/Chicago",
                },
            )
            if not paralegal.has_usable_password():
                paralegal.set_password("changeme123")
                paralegal.save(update_fields=["password"])

            self.stdout.write(self.style.SUCCESS("✓ Created 3 users"))

            # Create courts
            court_ilnd, _ = Court.objects.get_or_create(
                name="United States District Court for the Northern District of Illinois",
                defaults={
                    "district": "Northern District of Illinois",
                    "division": "Eastern Division",
                    "location": "Chicago, IL",
                    "timezone": "America/Chicago",
                    "website_url": "https://www.ilnd.uscourts.gov",
                },
            )

            court_cdca, _ = Court.objects.get_or_create(
                name="United States District Court for the Central District of California",
                defaults={
                    "district": "Central District of California",
                    "division": "Western Division",
                    "location": "Los Angeles, CA",
                    "timezone": "America/Los_Angeles",
                    "website_url": "https://www.cacd.uscourts.gov",
                },
            )

            self.stdout.write(self.style.SUCCESS("✓ Created 2 courts"))

            # Create holiday calendar
            holiday_calendar, _ = HolidayCalendar.objects.get_or_create(
                name="Federal Holidays 2025",
                defaults={
                    "jurisdiction": "Federal",
                    "timezone": "America/Chicago",
                    "source_url": "https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/",
                },
            )

            self.stdout.write(self.style.SUCCESS("✓ Created holiday calendar"))

            # Create judges (4 judges, double from before)
            judge1, _ = Judge.objects.get_or_create(
                full_name="Hon. Rebecca R. Pallmeyer",
                defaults={
                    "court": court_ilnd,
                    "courtroom": "Courtroom 2525",
                    "chambers_url": "https://www.ilnd.uscourts.gov/judges/pallmeyer",
                    "contact_email": "pallmeyer_chambers@ilnd.uscourts.gov",
                    "contact_phone": "312-435-7600",
                    "holiday_calendar": holiday_calendar,
                },
            )

            judge2, _ = Judge.objects.get_or_create(
                full_name="Hon. John F. Kness",
                defaults={
                    "court": court_ilnd,
                    "courtroom": "Courtroom 1519",
                    "chambers_url": "https://www.ilnd.uscourts.gov/judges/kness",
                    "contact_email": "kness_chambers@ilnd.uscourts.gov",
                    "contact_phone": "312-435-7620",
                    "holiday_calendar": holiday_calendar,
                },
            )

            judge3, _ = Judge.objects.get_or_create(
                full_name="Hon. Virginia A. Phillips",
                defaults={
                    "court": court_cdca,
                    "courtroom": "Courtroom 1",
                    "chambers_url": "https://www.cacd.uscourts.gov/judges/phillips",
                    "contact_email": "phillips_chambers@cacd.uscourts.gov",
                    "contact_phone": "951-328-4450",
                    "holiday_calendar": holiday_calendar,
                },
            )

            judge4, _ = Judge.objects.get_or_create(
                full_name="Hon. Gary Klausner",
                defaults={
                    "court": court_cdca,
                    "courtroom": "Courtroom 6",
                    "chambers_url": "https://www.cacd.uscourts.gov/judges/klausner",
                    "contact_email": "klausner_chambers@cacd.uscourts.gov",
                    "contact_phone": "213-894-2370",
                    "holiday_calendar": holiday_calendar,
                },
            )

            self.stdout.write(self.style.SUCCESS("✓ Created 4 judges"))

            # Create Judge Procedures (8 procedures, double from before)
            procedures_data = [
                {
                    "judge": judge1,
                    "title": "Standing Order on Motion Practice",
                    "version": "2025.1",
                    "effective_date": datetime(2025, 1, 1).date(),
                    "content_text": "All dispositive motions must be filed at least 21 days before the scheduled trial date. Motions must include a notice of presentment in compliance with Local Rule 5.3.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 25},
                },
                {
                    "judge": judge1,
                    "title": "Discovery Dispute Procedures",
                    "version": "2025.1",
                    "effective_date": datetime(2025, 1, 1).date(),
                    "content_text": "Parties must confer in good faith before filing any discovery motion. A joint statement describing the dispute must be filed within 2 business days of the conference.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 10},
                },
                {
                    "judge": judge2,
                    "title": "Case Management Requirements",
                    "version": "2024.3",
                    "effective_date": datetime(2024, 9, 1).date(),
                    "content_text": "Parties must submit a joint case management plan no later than 14 days before the initial scheduling conference. The plan must address discovery scope, ESI protocols, and anticipated motion practice.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 15},
                },
                {
                    "judge": judge2,
                    "title": "Expert Witness Disclosure Requirements",
                    "version": "2024.3",
                    "effective_date": datetime(2024, 9, 1).date(),
                    "content_text": "Expert reports must comply with Fed. R. Civ. P. 26(a)(2)(B) and include all materials considered by the expert. Supplemental reports are due 30 days before expert depositions.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": None},
                },
                {
                    "judge": judge3,
                    "title": "Motion Filing and Briefing Schedule",
                    "version": "2025.2",
                    "effective_date": datetime(2025, 2, 1).date(),
                    "content_text": "Opening briefs limited to 25 pages. Opposition due 21 days after service. Reply due 14 days after opposition. No sur-replies without leave of court.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 25},
                },
                {
                    "judge": judge3,
                    "title": "Electronically Stored Information Protocol",
                    "version": "2025.2",
                    "effective_date": datetime(2025, 2, 1).date(),
                    "content_text": "Parties must meet and confer regarding ESI preservation and production within 30 days of case filing. ESI protocol order must be submitted within 60 days.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 10},
                },
                {
                    "judge": judge4,
                    "title": "Trial Management Order",
                    "version": "2024.4",
                    "effective_date": datetime(2024, 10, 1).date(),
                    "content_text": "Pretrial submissions due 14 days before trial. Joint pretrial order due 21 days before trial. Motions in limine due 28 days before trial.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 20},
                },
                {
                    "judge": judge4,
                    "title": "Settlement Conference Procedures",
                    "version": "2024.4",
                    "effective_date": datetime(2024, 10, 1).date(),
                    "content_text": "Settlement conference statements must be filed under seal 7 days before the conference. Parties with settlement authority must attend. Mediator must be mutually agreed upon or court-appointed.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 5},
                },
            ]

            created_procedures = 0
            for proc_data in procedures_data:
                judge = proc_data.pop("judge")
                title = proc_data.pop("title")
                version = proc_data.pop("version")
                _, created = JudgeProcedure.objects.get_or_create(
                    judge=judge,
                    title=title,
                    version=version,
                    defaults=proc_data,
                )
                if created:
                    created_procedures += 1

            self.stdout.write(self.style.SUCCESS(f"✓ Created {created_procedures} judge procedures"))

            # Create Rules (8 rules, double from before)
            rules_data = [
                {
                    "source_type": RuleSourceType.FRCP,
                    "citation": "Fed. R. Civ. P. 26(a)(1)",
                    "jurisdiction": "Federal",
                    "version": "2024",
                    "effective_date": datetime(2024, 12, 1).date(),
                    "text": "Initial disclosure requirements. Parties must provide names of individuals with discoverable information, copies of documents, computation of damages, and insurance agreements.",
                    "url": "https://www.uscourts.gov/rules-policies/current-rules-practice-procedure",
                },
                {
                    "source_type": RuleSourceType.FRCP,
                    "citation": "Fed. R. Civ. P. 56",
                    "jurisdiction": "Federal",
                    "version": "2024",
                    "effective_date": datetime(2024, 12, 1).date(),
                    "text": "Summary judgment standard. Court shall grant summary judgment if movant shows no genuine dispute as to any material fact and is entitled to judgment as a matter of law.",
                    "url": "https://www.uscourts.gov/rules-policies/current-rules-practice-procedure",
                },
                {
                    "source_type": RuleSourceType.LOCAL_RULE,
                    "citation": "N.D. Ill. L.R. 7.1",
                    "jurisdiction": "N.D. Ill.",
                    "version": "2024-01",
                    "effective_date": datetime(2024, 1, 1).date(),
                    "text": "Motion practice. Motions must include a memorandum of law not exceeding 15 pages. Response due within 21 days. Reply due within 14 days.",
                    "url": "https://www.ilnd.uscourts.gov/home/rules-and-procedures/",
                },
                {
                    "source_type": RuleSourceType.LOCAL_RULE,
                    "citation": "N.D. Ill. L.R. 16.1",
                    "jurisdiction": "N.D. Ill.",
                    "version": "2024-01",
                    "effective_date": datetime(2024, 1, 1).date(),
                    "text": "Case management procedures. Initial status conference must be held within 120 days of filing. Discovery deadline typically set 9-12 months from filing.",
                    "url": "https://www.ilnd.uscourts.gov/home/rules-and-procedures/",
                },
                {
                    "source_type": RuleSourceType.JUDGE_PROCEDURE,
                    "citation": "Pallmeyer Standing Order 2025-1",
                    "jurisdiction": "N.D. Ill.",
                    "version": "2025-01",
                    "effective_date": datetime(2025, 1, 1).date(),
                    "text": "Standing order detailing motion briefing schedule, courtesy copy requirements, and electronic filing procedures for Judge Pallmeyer's courtroom.",
                    "url": "https://www.ilnd.uscourts.gov/judges/pallmeyer",
                },
                {
                    "source_type": RuleSourceType.JUDGE_PROCEDURE,
                    "citation": "Kness Chambers Procedures",
                    "jurisdiction": "N.D. Ill.",
                    "version": "2024-02",
                    "effective_date": datetime(2024, 6, 1).date(),
                    "text": "Procedures for case management, discovery disputes, and pretrial conferences in Judge Kness's courtroom.",
                    "url": "https://www.ilnd.uscourts.gov/judges/kness",
                },
                {
                    "source_type": RuleSourceType.LOCAL_RULE,
                    "citation": "C.D. Cal. L.R. 7-3",
                    "jurisdiction": "C.D. Cal.",
                    "version": "2024-01",
                    "effective_date": datetime(2024, 1, 1).date(),
                    "text": "Motion briefing requirements. Memoranda of points and authorities shall not exceed 25 pages without leave of court.",
                    "url": "https://www.cacd.uscourts.gov/rules/local-rules",
                },
                {
                    "source_type": RuleSourceType.ECF_MANUAL,
                    "citation": "CM/ECF Administrative Procedures",
                    "jurisdiction": "Federal",
                    "version": "2024.2",
                    "effective_date": datetime(2024, 7, 1).date(),
                    "text": "Electronic filing procedures. Documents must be filed in PDF format. File size limit is 50MB per document. Technical support available 8am-5pm CT.",
                    "url": "https://www.uscourts.gov/court-records/electronic-filing-cmecf",
                },
            ]

            created_rules = 0
            for rule_data in rules_data:
                citation = rule_data.pop("citation")
                _, created = Rule.objects.get_or_create(
                    citation=citation,
                    defaults=rule_data,
                )
                if created:
                    created_rules += 1

            self.stdout.write(self.style.SUCCESS(f"✓ Created {created_rules} rules"))

            # Create Cases (4 cases, double from before)
            cases_data = [
                {
                    "internal_case_id": "DCB-2025-0001",
                    "case_number": "1:25-cv-00001",
                    "caption": "TechCorp Inc. v. DataSystems LLC",
                    "practice_area": "Intellectual Property",
                    "court": court_ilnd,
                    "filing_date": datetime(2025, 1, 15).date(),
                    "status": CaseStatus.OPEN,
                    "stage": "Discovery",
                    "lead_attorney": lawyer1,
                    "confidentiality_level": "Confidential",
                    "legal_hold": True,
                    "timezone": "America/Chicago",
                },
                {
                    "internal_case_id": "DCB-2025-0002",
                    "case_number": "1:25-cv-00089",
                    "caption": "Global Manufacturing Co. v. Precision Parts Inc.",
                    "practice_area": "Commercial Litigation",
                    "court": court_ilnd,
                    "filing_date": datetime(2025, 2, 1).date(),
                    "status": CaseStatus.OPEN,
                    "stage": "Pleadings",
                    "lead_attorney": lawyer2,
                    "confidentiality_level": "Confidential",
                    "legal_hold": True,
                    "timezone": "America/Chicago",
                },
                {
                    "internal_case_id": "DCB-2024-0156",
                    "case_number": "2:24-cv-08234",
                    "caption": "Wilson v. MegaCorp Industries",
                    "practice_area": "Employment",
                    "court": court_cdca,
                    "filing_date": datetime(2024, 10, 15).date(),
                    "status": CaseStatus.OPEN,
                    "stage": "Motion Practice",
                    "lead_attorney": lawyer1,
                    "confidentiality_level": "Public",
                    "legal_hold": False,
                    "timezone": "America/Los_Angeles",
                },
                {
                    "internal_case_id": "DCB-2024-0201",
                    "case_number": "2:24-cv-09876",
                    "caption": "Smith Enterprises v. Johnson & Associates",
                    "practice_area": "Contract Dispute",
                    "court": court_cdca,
                    "filing_date": datetime(2024, 12, 1).date(),
                    "status": CaseStatus.OPEN,
                    "stage": "Discovery",
                    "lead_attorney": lawyer2,
                    "confidentiality_level": "Attorneys Eyes Only",
                    "legal_hold": True,
                    "timezone": "America/Los_Angeles",
                },
            ]

            created_cases = []
            for case_data in cases_data:
                internal_id = case_data.pop("internal_case_id")
                case, created = Case.objects.get_or_create(
                    internal_case_id=internal_id,
                    defaults=case_data,
                )
                created_cases.append(case)

            self.stdout.write(self.style.SUCCESS(f"✓ Created {len(created_cases)} cases"))

            # Create Deadlines (16 deadlines, double from before)
            deadlines_created = 0
            deadline_configs = [
                # Case 1 deadlines
                {"case": created_cases[0], "days": 14, "priority": 1, "status": DeadlineStatus.OPEN, 
                 "rationale": "Opposition to Motion for Summary Judgment due", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[0], "days": 3, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Court-ordered status report due", "trigger": DeadlineTriggerType.COURT_ORDER},
                {"case": created_cases[0], "days": 30, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "Expert witness disclosure deadline", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[0], "days": 45, "priority": 3, "status": DeadlineStatus.OPEN,
                 "rationale": "Fact discovery cutoff", "trigger": DeadlineTriggerType.COURT_ORDER},
                
                # Case 2 deadlines
                {"case": created_cases[1], "days": 21, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "Answer to Complaint due", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[1], "days": 60, "priority": 3, "status": DeadlineStatus.OPEN,
                 "rationale": "Initial disclosures due per Fed. R. Civ. P. 26(a)(1)", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[1], "days": 90, "priority": 3, "status": DeadlineStatus.OPEN,
                 "rationale": "Joint case management plan due", "trigger": DeadlineTriggerType.COURT_ORDER},
                {"case": created_cases[1], "days": 7, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Response to Motion to Dismiss due", "trigger": DeadlineTriggerType.COURT_ORDER},
                
                # Case 3 deadlines
                {"case": created_cases[2], "days": 28, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Motions in limine due", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[2], "days": 21, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "Joint pretrial order due", "trigger": DeadlineTriggerType.COURT_ORDER},
                {"case": created_cases[2], "days": 14, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Pretrial submissions due", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[2], "days": 7, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Settlement conference statement due (under seal)", "trigger": DeadlineTriggerType.COURT_ORDER},
                
                # Case 4 deadlines
                {"case": created_cases[3], "days": 2, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Joint statement on discovery dispute due", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[3], "days": 30, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "ESI protocol order due", "trigger": DeadlineTriggerType.COURT_ORDER},
                {"case": created_cases[3], "days": 60, "priority": 3, "status": DeadlineStatus.OPEN,
                 "rationale": "Complete document production", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[3], "days": 21, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "Reply brief in support of motion due", "trigger": DeadlineTriggerType.RULE},
            ]

            all_rules = list(Rule.objects.all())
            for config in deadline_configs:
                case = config["case"]
                due_date = timezone.now() + timedelta(days=config["days"])
                
                _, created = Deadline.objects.get_or_create(
                    case=case,
                    computation_rationale=config["rationale"],
                    defaults={
                        "trigger_type": config["trigger"],
                        "trigger_source_type": "rule" if config["trigger"] == DeadlineTriggerType.RULE else "court_order",
                        "trigger_source_id": random.choice(all_rules).id if all_rules else None,
                        "basis": random.choice([DeadlineBasis.BUSINESS_DAYS, DeadlineBasis.CALENDAR_DAYS]),
                        "due_at": due_date,
                        "holiday_calendar": holiday_calendar,
                        "timezone": case.timezone,
                        "owner": case.lead_attorney,
                        "priority": config["priority"],
                        "status": config["status"],
                        "created_by": case.lead_attorney,
                        "updated_by": case.lead_attorney,
                    },
                )
                if created:
                    deadlines_created += 1

            self.stdout.write(self.style.SUCCESS(f"✓ Created {deadlines_created} deadlines"))

        # Final summary
        self.stdout.write(self.style.SUCCESS("\n" + "="*60))
        self.stdout.write(self.style.SUCCESS("ENHANCED DEMO DATA SEEDED SUCCESSFULLY!"))
        self.stdout.write(self.style.SUCCESS("="*60))
        self.stdout.write(self.style.WARNING("\nUser Accounts (all with password: changeme123):"))
        self.stdout.write("  • demo.lawyer@example.com (Lawyer - Sarah Chen)")
        self.stdout.write("  • john.mitchell@example.com (Lawyer - John Mitchell)")
        self.stdout.write("  • maria.santos@example.com (Paralegal - Maria Santos)")
        self.stdout.write(self.style.WARNING("\nData Summary:"))
        self.stdout.write(f"  • 3 Users")
        self.stdout.write(f"  • 2 Courts")
        self.stdout.write(f"  • 4 Judges")
        self.stdout.write(f"  • 8 Judge Procedures (2x previous)")
        self.stdout.write(f"  • 8 Rules (2x previous)")
        self.stdout.write(f"  • 4 Cases (2x previous)")
        self.stdout.write(f"  • {deadlines_created} Deadlines (2x previous)")
        self.stdout.write(self.style.SUCCESS("\n✓ Ready for user testing!"))



