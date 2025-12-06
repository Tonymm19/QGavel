# Models Timestamp Status

## Models that HAVE timestamps (created_at/updated_at):
- ✅ Organization (new)
- ✅ User
- ✅ UserAccessGrant (new)
- ✅ Court (just added)
- ✅ HolidayCalendar (just added)
- ✅ JudgeProcedure (has created_at)
- ✅ Case
- ✅ CaseNote
- ✅ Document
- ✅ Deadline
- ✅ DeadlineReminder
- ✅ Alert
- ✅ CalendarEvent
- ✅ NotificationLog
- ✅ AuditLog
- ✅ RetrievalRun

## Models that NEED timestamps added:
- ❌ Holiday
- ❌ Judge
- ❌ JudgeAssociation
- ❌ CaseRelationship
- ❌ CaseTeam (has added_at only)
- ❌ Contact
- ❌ ContactAddress
- ❌ CaseContact
- ❌ CaseTag
- ❌ CaseTagAssignment
- ❌ CasePermission
- ❌ DocChunk
- ❌ Rule
- ❌ RuleCrossRef
- ❌ DeadlineDependency
- ❌ DocketEntry
- ❌ Filing
- ❌ FilingExhibit
- ❌ FilingServiceContact
- ❌ Hearing
- ❌ HearingFollowUp
- ❌ UserNotificationSubscription

## Models that need Organization foreign key (for multi-tenancy):
- Case
- Deadline
- Contact
- Document
- Alert
- CalendarEvent
- (Most user-generated content)



