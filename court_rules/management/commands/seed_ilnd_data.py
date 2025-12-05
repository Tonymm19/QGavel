"""
N.D. Illinois focused seed data with 8 judges and comprehensive procedures.
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
    Organization,
    Rule,
    RuleSourceType,
    User,
    UserRole,
)


class Command(BaseCommand):
    help = "Seed N.D. Illinois data with 8 judges and comprehensive procedures."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting N.D. Illinois data seeding..."))
        
        with transaction.atomic():
            # Clear existing data
            self.stdout.write("Clearing existing data...")
            Deadline.objects.all().delete()
            Case.objects.all().delete()
            JudgeProcedure.objects.all().delete()
            Judge.objects.all().delete()
            Rule.objects.all().delete()
            Court.objects.all().delete()
            User.objects.all().delete()
            Organization.objects.all().delete()
            
            # Create organization
            demo_org, _ = Organization.objects.get_or_create(
                name="Demo Law Firm",
                defaults={
                    "address_line1": "123 N Michigan Ave",
                    "address_line2": "Suite 1800",
                    "city": "Chicago",
                    "state": "IL",
                    "zip_code": "60601",
                    "phone": "312-555-0100",
                },
            )
            self.stdout.write(self.style.SUCCESS("✓ Created organization"))
            
            # Create users
            lawyer1, _ = User.objects.get_or_create(
                email="demo.lawyer@example.com",
                defaults={
                    "first_name": "Sarah",
                    "last_name": "Chen",
                    "organization": demo_org,
                    "phone": "312-555-0101",
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
                    "first_name": "John",
                    "last_name": "Mitchell",
                    "organization": demo_org,
                    "phone": "312-555-0102",
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
                    "first_name": "Maria",
                    "last_name": "Santos",
                    "organization": demo_org,
                    "phone": "312-555-0103",
                    "role": UserRole.PARALEGAL,
                    "timezone": "America/Chicago",
                },
            )
            if not paralegal.has_usable_password():
                paralegal.set_password("changeme123")
                paralegal.save(update_fields=["password"])

            self.stdout.write(self.style.SUCCESS("✓ Created 3 users"))

            # Create N.D. Illinois court
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

            self.stdout.write(self.style.SUCCESS("✓ Created N.D. Illinois court"))

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

            # Create 8 N.D. Illinois judges
            judges_data = [
                {
                    "full_name": "Hon. Rebecca R. Pallmeyer",
                    "courtroom": "Courtroom 2525",
                    "chambers_url": "https://www.ilnd.uscourts.gov/judges/pallmeyer",
                    "contact_email": "pallmeyer_chambers@ilnd.uscourts.gov",
                    "contact_phone": "312-435-7600",
                },
                {
                    "full_name": "Hon. John F. Kness",
                    "courtroom": "Courtroom 1519",
                    "chambers_url": "https://www.ilnd.uscourts.gov/judges/kness",
                    "contact_email": "kness_chambers@ilnd.uscourts.gov",
                    "contact_phone": "312-435-7620",
                },
                {
                    "full_name": "Hon. Matthew F. Kennelly",
                    "courtroom": "Courtroom 2525",
                    "chambers_url": "https://www.ilnd.uscourts.gov/judges/kennelly",
                    "contact_email": "kennelly_chambers@ilnd.uscourts.gov",
                    "contact_phone": "312-435-5590",
                },
                {
                    "full_name": "Hon. Virginia M. Kendall",
                    "courtroom": "Courtroom 2241",
                    "chambers_url": "https://www.ilnd.uscourts.gov/judges/kendall",
                    "contact_email": "kendall_chambers@ilnd.uscourts.gov",
                    "contact_phone": "312-435-5618",
                },
                {
                    "full_name": "Hon. John Robert Blakey",
                    "courtroom": "Courtroom 1241",
                    "chambers_url": "https://www.ilnd.uscourts.gov/judges/blakey",
                    "contact_email": "blakey_chambers@ilnd.uscourts.gov",
                    "contact_phone": "312-435-5670",
                },
                {
                    "full_name": "Hon. Andrea R. Wood",
                    "courtroom": "Courtroom 1703",
                    "chambers_url": "https://www.ilnd.uscourts.gov/judges/wood",
                    "contact_email": "wood_chambers@ilnd.uscourts.gov",
                    "contact_phone": "312-435-6860",
                },
                {
                    "full_name": "Hon. Steven C. Seeger",
                    "courtroom": "Courtroom 2525",
                    "chambers_url": "https://www.ilnd.uscourts.gov/judges/seeger",
                    "contact_email": "seeger_chambers@ilnd.uscourts.gov",
                    "contact_phone": "312-435-7660",
                },
                {
                    "full_name": "Hon. Thomas M. Durkin",
                    "courtroom": "Courtroom 1903",
                    "chambers_url": "https://www.ilnd.uscourts.gov/judges/durkin",
                    "contact_email": "durkin_chambers@ilnd.uscourts.gov",
                    "contact_phone": "312-435-5564",
                },
            ]

            judges = []
            for judge_data in judges_data:
                judge, created = Judge.objects.get_or_create(
                    full_name=judge_data["full_name"],
                    defaults={
                        "court": court_ilnd,
                        "courtroom": judge_data["courtroom"],
                        "chambers_url": judge_data["chambers_url"],
                        "contact_email": judge_data["contact_email"],
                        "contact_phone": judge_data["contact_phone"],
                        "holiday_calendar": holiday_calendar,
                    },
                )
                judges.append(judge)

            self.stdout.write(self.style.SUCCESS(f"✓ Created {len(judges)} N.D. Illinois judges"))

            # Create Judge Procedures - comprehensive set for each judge
            procedures_data = [
                # Judge Pallmeyer (2 procedures)
                {
                    "judge": judges[0],
                    "title": "Standing Order on Motion Practice",
                    "version": "2025.1",
                    "effective_date": datetime(2025, 1, 1).date(),
                    "content_text": "All dispositive motions must be filed at least 21 days before the scheduled trial date. Motions must include a notice of presentment in compliance with Local Rule 5.3. Opening briefs limited to 15 pages, opposition due within 21 days, reply due within 14 days. No sur-replies without leave of court.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 15},
                },
                {
                    "judge": judges[0],
                    "title": "Discovery Dispute Procedures",
                    "version": "2025.1",
                    "effective_date": datetime(2025, 1, 1).date(),
                    "content_text": "Parties must confer in good faith before filing any discovery motion. A joint statement describing the dispute must be filed within 2 business days of the conference. Statement limited to 3 pages per side. Court will rule based on the joint statement without oral argument unless specifically requested.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 3},
                },
                
                # Judge Kness (2 procedures)
                {
                    "judge": judges[1],
                    "title": "Case Management Requirements",
                    "version": "2024.3",
                    "effective_date": datetime(2024, 9, 1).date(),
                    "content_text": "Parties must submit a joint case management plan no later than 14 days before the initial scheduling conference. The plan must address discovery scope, ESI protocols, anticipated motion practice, and proposed trial date. Include a detailed discovery plan with specific timelines for fact discovery, expert discovery, and dispositive motions.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 10},
                },
                {
                    "judge": judges[1],
                    "title": "Expert Witness Disclosure Requirements",
                    "version": "2024.3",
                    "effective_date": datetime(2024, 9, 1).date(),
                    "content_text": "Expert reports must comply with Fed. R. Civ. P. 26(a)(2)(B) and include all materials considered by the expert. Reports must include detailed explanation of methodology, all data relied upon, and complete list of prior testimony. Supplemental reports are due 30 days before expert depositions. Rebuttal expert reports due 30 days after opposing party's expert disclosure.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": None},
                },
                
                # Judge Kennelly (3 procedures)
                {
                    "judge": judges[2],
                    "title": "Pretrial and Trial Procedures",
                    "version": "2025.1",
                    "effective_date": datetime(2025, 1, 15).date(),
                    "content_text": "Final pretrial conference will be held 21 days before trial. Proposed jury instructions and verdict forms due 14 days before pretrial conference. Motions in limine due 28 days before trial, responses due 14 days later. Trial briefs due 7 days before trial. Voir dire will be conducted primarily by the Court with limited attorney participation.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 20},
                },
                {
                    "judge": judges[2],
                    "title": "Electronic Discovery Protocol",
                    "version": "2025.1",
                    "effective_date": datetime(2025, 1, 15).date(),
                    "content_text": "Parties must meet and confer regarding ESI within 30 days of case filing. ESI protocol must address preservation, collection methodology, search terms, file formats, and privilege log procedures. Use of technology-assisted review (TAR) is encouraged. ESI protocol order must be submitted within 60 days of case filing.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 15},
                },
                {
                    "judge": judges[2],
                    "title": "Summary Judgment Practice",
                    "version": "2025.1",
                    "effective_date": datetime(2025, 1, 15).date(),
                    "content_text": "Summary judgment motions limited to 15 pages. Statement of material facts limited to 80 numbered paragraphs. Each fact must cite to specific page and line numbers in the record. Responses to statements of fact must respond paragraph-by-paragraph. Additional statements of fact in response limited to 40 paragraphs. Local Rule 56.1 strictly enforced.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 15},
                },
                
                # Judge Kendall (2 procedures)
                {
                    "judge": judges[3],
                    "title": "Settlement Conference Procedures",
                    "version": "2024.4",
                    "effective_date": datetime(2024, 10, 1).date(),
                    "content_text": "Settlement conference statements must be filed under seal 7 days before the conference. Statements must include case summary, liability issues, damages calculation, settlement history, and settlement authority. Parties with full settlement authority must attend in person or by video. Mediator must be mutually agreed upon or court-appointed from approved roster.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 5},
                },
                {
                    "judge": judges[3],
                    "title": "Class Action Procedures",
                    "version": "2024.4",
                    "effective_date": datetime(2024, 10, 1).date(),
                    "content_text": "Class certification motions must be filed within 120 days of answer unless otherwise ordered. Motion must include detailed analysis under Fed. R. Civ. P. 23, proposed class definition, proposed notice plan, and expert reports supporting class certification. Discovery on class certification issues may proceed before ruling on motion to dismiss.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 25},
                },
                
                # Judge Blakey (2 procedures)
                {
                    "judge": judges[4],
                    "title": "Daubert Motion Practice",
                    "version": "2024.2",
                    "effective_date": datetime(2024, 6, 1).date(),
                    "content_text": "Daubert motions must be filed within 30 days of close of expert discovery. Motions limited to 15 pages. Responses due 21 days after service. Replies due 14 days after response. Court will hold evidentiary hearing if necessary. Expert's qualifications, methodology, and reliability must be specifically addressed. Conclusory objections will not be considered.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 15},
                },
                {
                    "judge": judges[4],
                    "title": "Scheduling Order Guidelines",
                    "version": "2024.2",
                    "effective_date": datetime(2024, 6, 1).date(),
                    "content_text": "Initial scheduling conference held within 120 days of filing. Fact discovery closes 9 months from scheduling order. Expert discovery closes 3 months after fact discovery. Dispositive motions due 30 days after close of expert discovery. Trial date set 12-15 months from filing. Amendments to scheduling order granted only for good cause shown.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 10},
                },
                
                # Judge Wood (2 procedures)
                {
                    "judge": judges[5],
                    "title": "Magistrate Judge Referral Procedures",
                    "version": "2025.2",
                    "effective_date": datetime(2025, 2, 1).date(),
                    "content_text": "All non-dispositive pretrial matters referred to Magistrate Judge. Discovery disputes, scheduling matters, and non-dispositive motions will be heard by Magistrate Judge. Objections to Magistrate Judge orders must be filed within 14 days and must specifically identify alleged errors. Dispositive motions heard by District Judge.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 5},
                },
                {
                    "judge": judges[5],
                    "title": "Pro Se Litigant Procedures",
                    "version": "2025.2",
                    "effective_date": datetime(2025, 2, 1).date(),
                    "content_text": "Pro se litigants must comply with all Federal Rules and Local Rules. Court will construe pro se pleadings liberally but will not act as advocate. Pro se litigants are responsible for serving all parties and filing certificates of service. Extension requests must show good cause. Failure to comply with court orders may result in dismissal.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 8},
                },
                
                # Judge Seeger (3 procedures)
                {
                    "judge": judges[6],
                    "title": "Motion Hearing Procedures",
                    "version": "2025.1",
                    "effective_date": datetime(2025, 1, 1).date(),
                    "content_text": "Oral argument on motions only by court order. Parties may request oral argument in motion or response. Request must explain why oral argument is necessary. Most motions decided on papers alone. If oral argument granted, each side limited to 20 minutes. Demonstrative exhibits must be exchanged 3 days before hearing.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 10},
                },
                {
                    "judge": judges[6],
                    "title": "Courtesy Copy Requirements",
                    "version": "2025.1",
                    "effective_date": datetime(2025, 1, 1).date(),
                    "content_text": "Courtesy copies required for all dispositive motions, trial briefs, and proposed orders. Deliver to chambers within 24 hours of electronic filing. Include cover letter identifying case name and number. Bind documents with binder clips only. Do not provide courtesy copies of routine procedural motions or discovery correspondence.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": None},
                },
                {
                    "judge": judges[6],
                    "title": "Status Report Requirements",
                    "version": "2025.1",
                    "effective_date": datetime(2025, 1, 1).date(),
                    "content_text": "Joint status reports due every 90 days unless otherwise ordered. Reports must update case progress, discovery status, anticipated motions, and settlement discussions. Report must propose next status conference date. Failure to file timely status reports may result in case dismissal or sanctions. Single party may file if joint report not possible.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 3},
                },
                
                # Judge Durkin (2 procedures)
                {
                    "judge": judges[7],
                    "title": "Amended Pleading Standards",
                    "version": "2024.3",
                    "effective_date": datetime(2024, 9, 1).date(),
                    "content_text": "Motions to amend pleadings must comply with Fed. R. Civ. P. 15 and Local Rule 15.1. Proposed amended pleading must be attached as exhibit. Motion must explain reasons for amendment, prejudice to opposing party, and whether amendment would be futile. Amendments as of right available within 21 days of responsive pleading. Later amendments require leave of court or consent.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 10},
                },
                {
                    "judge": judges[7],
                    "title": "Protective Order and Confidentiality",
                    "version": "2024.3",
                    "effective_date": datetime(2024, 9, 1).date(),
                    "content_text": "Agreed protective orders must comply with court's model protective order. Designations of confidentiality must be made in good faith. Overdesignation subject to sanctions. Confidential material must be used solely for litigation. Motion to seal must demonstrate good cause and identify specific information requiring protection. Blanket sealing not permitted.",
                    "filing_format": {"preferred_format": "single_pdf", "page_limit": 8},
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

            # Create N.D. Illinois Court Rules (8 comprehensive pages)
            rules_data = [
                # FRCP Rules
                {
                    "source_type": RuleSourceType.FRCP,
                    "citation": "Fed. R. Civ. P. 26(a)(1)",
                    "jurisdiction": "Federal",
                    "version": "2024",
                    "effective_date": datetime(2024, 12, 1).date(),
                    "text": "Initial Disclosure Requirements. Without awaiting a discovery request, a party must provide to the other parties: (A) the name and contact information of each individual likely to have discoverable information; (B) a copy or description of all documents, electronically stored information, and tangible things in possession, custody, or control; (C) a computation of each category of damages claimed; and (D) copies of insurance agreements under which an insurance business may be liable.",
                    "url": "https://www.uscourts.gov/rules-policies/current-rules-practice-procedure/federal-rules-civil-procedure",
                },
                {
                    "source_type": RuleSourceType.FRCP,
                    "citation": "Fed. R. Civ. P. 56",
                    "jurisdiction": "Federal",
                    "version": "2024",
                    "effective_date": datetime(2024, 12, 1).date(),
                    "text": "Summary Judgment. The court shall grant summary judgment if the movant shows that there is no genuine dispute as to any material fact and the movant is entitled to judgment as a matter of law. A party asserting that a fact cannot be or is genuinely disputed must support the assertion by citing to particular parts of materials in the record, or showing that materials cited do not establish the absence or presence of a genuine dispute.",
                    "url": "https://www.uscourts.gov/rules-policies/current-rules-practice-procedure/federal-rules-civil-procedure",
                },
                
                # N.D. Illinois Local Rules - Motion Practice
                {
                    "source_type": RuleSourceType.LOCAL_RULE,
                    "citation": "N.D. Ill. L.R. 7.1 - Motion Practice",
                    "jurisdiction": "N.D. Ill.",
                    "version": "2024-01",
                    "effective_date": datetime(2024, 1, 1).date(),
                    "text": "Motions and Responses. Motions must include a memorandum of law not exceeding 15 pages without prior leave of court. The memorandum must contain a statement of issues, relevant facts, and argument with citation to authorities. Response due within 21 days of service. Reply memorandum limited to 7 pages, due within 14 days of response. No sur-reply without leave of court. Motions presenting new issues within 21 days of trial require leave of court.",
                    "url": "https://www.ilnd.uscourts.gov/home/rules-and-procedures/local-rules/",
                },
                {
                    "source_type": RuleSourceType.LOCAL_RULE,
                    "citation": "N.D. Ill. L.R. 16.1 - Case Management Procedures",
                    "jurisdiction": "N.D. Ill.",
                    "version": "2024-01",
                    "effective_date": datetime(2024, 1, 1).date(),
                    "text": "Scheduling Conferences and Orders. Initial status conference must be held within 120 days of filing complaint. Parties must file joint status report 7 days before conference addressing: case summary, jurisdiction, related cases, discovery plan with specific timelines, anticipated motions, ADR prospects, and proposed trial date. Discovery deadline typically set 9-12 months from filing. Amendments to scheduling order only upon showing of good cause and diligence.",
                    "url": "https://www.ilnd.uscourts.gov/home/rules-and-procedures/local-rules/",
                },
                {
                    "source_type": RuleSourceType.LOCAL_RULE,
                    "citation": "N.D. Ill. L.R. 56.1 - Summary Judgment Procedures",
                    "jurisdiction": "N.D. Ill.",
                    "version": "2024-01",
                    "effective_date": datetime(2024, 1, 1).date(),
                    "text": "Statements of Material Facts. Movant must file statement of material facts as to which there is no genuine issue, with each fact in separately numbered paragraph citing specific supporting material. Non-movant must file response admitting or denying each paragraph with citations to supporting material. Any additional facts must be in separately numbered paragraphs. All material facts set forth in movant's statement will be deemed admitted unless controverted by statement of non-movant. Failure to file L.R. 56.1 statement may result in denial of motion or entry of judgment.",
                    "url": "https://www.ilnd.uscourts.gov/home/rules-and-procedures/local-rules/",
                },
                {
                    "source_type": RuleSourceType.LOCAL_RULE,
                    "citation": "N.D. Ill. L.R. 37.1 - Discovery Disputes",
                    "jurisdiction": "N.D. Ill.",
                    "version": "2024-01",
                    "effective_date": datetime(2024, 1, 1).date(),
                    "text": "Resolution of Discovery Disputes. Before filing discovery motion, moving party must confer in good faith with opposing counsel to resolve dispute. Certificate of compliance required. Discovery motions must quote in full each interrogatory, request, answer, response, or objection at issue. Court may impose sanctions for failure to comply with meet and confer requirement. Discovery disputes may be resolved by telephone conference at court's discretion.",
                    "url": "https://www.ilnd.uscourts.gov/home/rules-and-procedures/local-rules/",
                },
                {
                    "source_type": RuleSourceType.LOCAL_RULE,
                    "citation": "N.D. Ill. L.R. 5.3 - Electronic Filing Requirements",
                    "jurisdiction": "N.D. Ill.",
                    "version": "2024-01",
                    "effective_date": datetime(2024, 1, 1).date(),
                    "text": "CM/ECF Electronic Filing. All documents must be filed electronically through CM/ECF unless specifically exempted. Documents must be in PDF format, text-searchable when possible. Maximum file size 50 MB per document. Filers responsible for ensuring documents are complete and legible. Electronic filing must be completed before midnight Central Time to be considered timely. Technical failures must be reported immediately to CM/ECF Help Desk. Privacy policy requires redaction of personal identifiers.",
                    "url": "https://www.ilnd.uscourts.gov/home/rules-and-procedures/local-rules/",
                },
                {
                    "source_type": RuleSourceType.LOCAL_RULE,
                    "citation": "N.D. Ill. L.R. 23.1 - Class Actions",
                    "jurisdiction": "N.D. Ill.",
                    "version": "2024-01",
                    "effective_date": datetime(2024, 1, 1).date(),
                    "text": "Class Action Procedures. Class certification motion must be filed within 90 days after answer unless otherwise ordered by court. Motion must include: proposed class definition, analysis under Fed. R. Civ. P. 23(a) and (b), identification of class representatives and counsel, proposed notice plan and form of notice, plan for claims administration, and supporting declarations and expert reports. Court may order discovery on class certification issues. Proposed settlement agreements must be filed with motion for preliminary approval.",
                    "url": "https://www.ilnd.uscourts.gov/home/rules-and-procedures/local-rules/",
                },
            ]

            created_rules = 0
            for rule_data in rules_data:
                citation = rule_data["citation"]
                _, created = Rule.objects.get_or_create(
                    citation=citation,
                    defaults=rule_data,
                )
                if created:
                    created_rules += 1

            self.stdout.write(self.style.SUCCESS(f"✓ Created {created_rules} court rules"))

            # Create Cases (4 cases in N.D. Illinois)
            cases_data = [
                {
                    "internal_case_id": "ILND-2025-0001",
                    "case_number": "1:25-cv-00001",
                    "caption": "TechCorp Inc. v. DataSystems LLC",
                    "practice_area": "Intellectual Property",
                    "court": court_ilnd,
                    "organization": demo_org,
                    "filing_date": datetime(2025, 1, 15).date(),
                    "status": CaseStatus.OPEN,
                    "stage": "Discovery",
                    "lead_attorney": lawyer1,
                    "confidentiality_level": "Confidential",
                    "legal_hold": True,
                    "timezone": "America/Chicago",
                },
                {
                    "internal_case_id": "ILND-2025-0002",
                    "case_number": "1:25-cv-00089",
                    "caption": "Global Manufacturing Co. v. Precision Parts Inc.",
                    "practice_area": "Commercial Litigation",
                    "court": court_ilnd,
                    "organization": demo_org,
                    "filing_date": datetime(2025, 2, 1).date(),
                    "status": CaseStatus.OPEN,
                    "stage": "Pleadings",
                    "lead_attorney": lawyer2,
                    "confidentiality_level": "Confidential",
                    "legal_hold": True,
                    "timezone": "America/Chicago",
                },
                {
                    "internal_case_id": "ILND-2024-0156",
                    "case_number": "1:24-cv-08234",
                    "caption": "Wilson v. MegaCorp Industries",
                    "practice_area": "Employment",
                    "court": court_ilnd,
                    "organization": demo_org,
                    "filing_date": datetime(2024, 10, 15).date(),
                    "status": CaseStatus.OPEN,
                    "stage": "Motion Practice",
                    "lead_attorney": lawyer1,
                    "confidentiality_level": "Public",
                    "legal_hold": False,
                    "timezone": "America/Chicago",
                },
                {
                    "internal_case_id": "ILND-2024-0201",
                    "case_number": "1:24-cv-09876",
                    "caption": "Smith Enterprises v. Johnson & Associates",
                    "practice_area": "Contract Dispute",
                    "court": court_ilnd,
                    "organization": demo_org,
                    "filing_date": datetime(2024, 12, 1).date(),
                    "status": CaseStatus.OPEN,
                    "stage": "Discovery",
                    "lead_attorney": lawyer2,
                    "confidentiality_level": "Attorneys Eyes Only",
                    "legal_hold": True,
                    "timezone": "America/Chicago",
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

            # Create Deadlines (20 deadlines)
            deadlines_created = 0
            deadline_configs = [
                # Case 1 deadlines (5)
                {"case": created_cases[0], "days": 14, "priority": 1, "status": DeadlineStatus.OPEN, 
                 "rationale": "Opposition to Motion for Summary Judgment due per L.R. 7.1", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[0], "days": 3, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Court-ordered status report due", "trigger": DeadlineTriggerType.COURT_ORDER},
                {"case": created_cases[0], "days": 30, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "Expert witness disclosure deadline per L.R. 26.1", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[0], "days": 45, "priority": 3, "status": DeadlineStatus.OPEN,
                 "rationale": "Fact discovery cutoff per scheduling order", "trigger": DeadlineTriggerType.COURT_ORDER},
                {"case": created_cases[0], "days": 7, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "L.R. 56.1 statement of facts due", "trigger": DeadlineTriggerType.RULE},
                
                # Case 2 deadlines (5)
                {"case": created_cases[1], "days": 21, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "Answer to Complaint due per Fed. R. Civ. P. 12", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[1], "days": 60, "priority": 3, "status": DeadlineStatus.OPEN,
                 "rationale": "Initial disclosures due per Fed. R. Civ. P. 26(a)(1)", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[1], "days": 90, "priority": 3, "status": DeadlineStatus.OPEN,
                 "rationale": "Joint case management plan due per L.R. 16.1", "trigger": DeadlineTriggerType.COURT_ORDER},
                {"case": created_cases[1], "days": 7, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Response to Motion to Dismiss due per L.R. 7.1", "trigger": DeadlineTriggerType.COURT_ORDER},
                {"case": created_cases[1], "days": 14, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "Reply brief due per L.R. 7.1", "trigger": DeadlineTriggerType.RULE},
                
                # Case 3 deadlines (5)
                {"case": created_cases[2], "days": 28, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Motions in limine due per pretrial order", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[2], "days": 21, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "Joint pretrial order due", "trigger": DeadlineTriggerType.COURT_ORDER},
                {"case": created_cases[2], "days": 14, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Pretrial submissions due (jury instructions, witness lists)", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[2], "days": 7, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Settlement conference statement due (under seal)", "trigger": DeadlineTriggerType.COURT_ORDER},
                {"case": created_cases[2], "days": 35, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "Daubert motions due per judge's procedures", "trigger": DeadlineTriggerType.RULE},
                
                # Case 4 deadlines (5)
                {"case": created_cases[3], "days": 2, "priority": 1, "status": DeadlineStatus.OPEN,
                 "rationale": "Joint statement on discovery dispute due per L.R. 37.1", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[3], "days": 30, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "ESI protocol order due per judge's procedures", "trigger": DeadlineTriggerType.COURT_ORDER},
                {"case": created_cases[3], "days": 60, "priority": 3, "status": DeadlineStatus.OPEN,
                 "rationale": "Complete document production per discovery plan", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[3], "days": 21, "priority": 2, "status": DeadlineStatus.OPEN,
                 "rationale": "Reply brief in support of motion due per L.R. 7.1", "trigger": DeadlineTriggerType.RULE},
                {"case": created_cases[3], "days": 90, "priority": 3, "status": DeadlineStatus.OPEN,
                 "rationale": "Joint status report due per scheduling order", "trigger": DeadlineTriggerType.COURT_ORDER},
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
        self.stdout.write(self.style.SUCCESS("\n" + "="*70))
        self.stdout.write(self.style.SUCCESS("N.D. ILLINOIS DATA SEEDED SUCCESSFULLY!"))
        self.stdout.write(self.style.SUCCESS("="*70))
        self.stdout.write(self.style.WARNING("\nUser Accounts (all with password: changeme123):"))
        self.stdout.write("  • demo.lawyer@example.com (Lawyer - Sarah Chen)")
        self.stdout.write("  • john.mitchell@example.com (Lawyer - John Mitchell)")
        self.stdout.write("  • maria.santos@example.com (Paralegal - Maria Santos)")
        self.stdout.write(self.style.WARNING("\nData Summary:"))
        self.stdout.write(f"  • 3 Users")
        self.stdout.write(f"  • 1 Court (N.D. Illinois only)")
        self.stdout.write(f"  • 8 N.D. Illinois Judges")
        self.stdout.write(f"  • {created_procedures} Judge Procedures (comprehensive)")
        self.stdout.write(f"  • {created_rules} Court Rules (N.D. Illinois focus)")
        self.stdout.write(f"  • 4 Cases (all N.D. Illinois)")
        self.stdout.write(f"  • {deadlines_created} Deadlines")
        self.stdout.write(self.style.SUCCESS("\n✓ Ready for testing with N.D. Illinois data only!"))

