# 📋 Court Rules & Judge Procedures Versioning - Requirements Questionnaire

## Purpose
This document helps us gather requirements for implementing a versioning system for court rules and judge procedures in Precedentum. Please review each question and provide your input.

---

## ✅ What We Already Know

### Scope
- **What needs versioning:** Court Rules (Federal + District) and Judge Procedures
- **Trigger:** Automatically create new version when rules/procedures are changed
- **Version numbering:** Internal/automatic (users don't need to see version numbers)
- **What to track:** Changes to the information

---

## ❓ Questions for Users

### Section 1: Effective Dates & Historical Context

#### **Q1: How should the system handle rule changes for existing cases?**

**Scenario:** A court rule changes on January 15, 2026. You have an existing case with a deadline that was calculated before January 15 using the old rule.

**Options:**
- **A)** Continue using the OLD rule version (the one that was active when the deadline was created) - preserves original calculations
- **B)** Automatically update to use the NEW rule version - always uses current rules
- **C)** Alert the user that the rule changed and let them decide whether to recalculate - gives user control

**Your Answer:** _______

**Follow-up:** Should this behavior be different for:
- Cases filed before the rule change? _______
- Cases filed after the rule change? _______

---

#### **Q2: Should rules have separate "Updated Date" and "Effective Date"?**

**Example:** A rule is entered into the system on December 1, 2025, but the actual court rule states it's effective January 1, 2026.

**Options:**
- **A)** YES - Track both dates separately
  - Updated Date: When it was entered into the system
  - Effective Date: When the rule officially takes effect
- **B)** NO - Only track when it was entered into the system

**Your Answer:** _______

**If YES:** Should the system:
- Automatically switch to the new version on the effective date? _______
- Show warnings when viewing rules that haven't taken effect yet? _______

---

#### **Q3: Do users need to look up historical versions of rules?**

**Example Use Cases:**
- "Show me N.D. Illinois Local Rule 7.1 as it existed on March 15, 2024"
- "What did Judge Smith's motion briefing procedure say in July 2023?"
- "Compare the rule from 6 months ago to today's version"

**Options:**
- **A)** YES - Users need to look up past versions regularly
- **B)** SOMETIMES - Useful for audits/compliance but not daily work
- **C)** NO - Users only need current version, history is for reference only

**Your Answer:** _______

---

### Section 2: Who Can Make Changes & Approval Workflow

#### **Q4: Who should be able to create or edit court rules and judge procedures?**

**Options:**
- **A)** Super Admin only (platform administrator)
- **B)** Super Admin + Site Admin (firm administrators)
- **C)** Super Admin + Site Admin + Managing Lawyers
- **D)** Other: _______________________

**Your Answer:** _______

**Additional Question:** Should different user types have different permissions?
- Example: Site Admin can edit their organization's custom notes on rules, but only Super Admin can edit the official rule text
- Yes / No: _______
- If Yes, please describe: _______________________

---

#### **Q5: Do changes need approval before going live?**

**Workflow Options:**

**Option A - No Approval (Immediate):**
- Admin makes change → Immediately published → Users see it right away
- ✅ Faster updates
- ⚠️ No quality control check

**Option B - Approval Required:**
- Admin creates change → Marked as "Draft" or "Pending Review" → Another admin approves → Published
- ✅ Quality control, prevents mistakes
- ⚠️ Slower process

**Option C - Hybrid:**
- Super Admin changes are immediate
- Site Admin changes require approval

**Your Answer:** _______

**If approval required:** Who can approve?
- Any admin? _______
- Super Admin only? _______
- Requires 2 approvers? _______

---

### Section 3: User Visibility & Notifications

#### **Q6: Should regular users (Lawyers, Paralegals) see version history?**

**Options:**
- **A)** YES - All users can see complete version history
- **B)** LIMITED - Users can see that something changed, but not detailed history
- **C)** ADMIN ONLY - Only administrators can see version history
- **D)** ROLE-BASED - Managing Lawyers can see history, but Paralegals cannot

**Your Answer:** _______

---

#### **Q7: When a rule or judge procedure changes, should users be notified?**

**Options:**
- **A)** Email notification to all affected users
- **B)** In-app notification/alert (appears in the application)
- **C)** Email + In-app notification
- **D)** Dashboard alert (shows on main screen but not intrusive)
- **E)** No automatic notification - users check manually

**Your Answer:** _______

**If notifications are desired:**
- Should users be notified about ALL rule changes? _______
- Only rules relevant to their active cases? _______
- Only rules for courts they work with frequently? _______
- Should users be able to customize notification preferences? _______

---

#### **Q8: Should users be able to compare different versions side-by-side?**

**Example:** View "Version 3" and "Version 4" of a rule next to each other, with differences highlighted.

**Options:**
- **A)** YES - Full side-by-side comparison with highlighted changes
- **B)** YES - Simple "what changed" summary only
- **C)** NO - Just show the current version and when it was last updated
- **D)** ADMIN ONLY - Only administrators need comparison tools

**Your Answer:** _______

---

### Section 4: Change Details & Tracking

#### **Q9: What level of detail should be captured for "what changed"?**

**Options (can select multiple):**

**A) Full Text Snapshot**
- Save the entire rule/procedure text for each version
- ✅ Allows word-by-word comparison
- ✅ Can reconstruct exact historical state
- ⚠️ Uses more database storage

**B) Field-Level Tracking**
- Track which fields changed (e.g., "Title changed", "Content changed", "Deadline modified")
- ✅ Lightweight
- ⚠️ Can't see exact text that changed

**C) Change Summary (Manual)**
- Admin writes a summary when making changes
- Example: "Updated filing deadlines from 14 to 21 days"
- ✅ Human-readable explanation
- ⚠️ Relies on admin to write good summaries

**D) Automatic Diff**
- System automatically calculates what text was added/removed/changed
- Example: "23 words added, 15 words removed, 8 words modified"
- ✅ Precise and automatic
- ⚠️ Can be technical for non-tech users

**Your Answer (select all that apply):** _______

**Preference/Priority:** _______________________

---

#### **Q10: Should the system track WHY something changed?**

**Examples:**
- "Federal Rules of Civil Procedure amended effective Dec 1, 2025"
- "Judge Smith updated motion page limits per new court order"
- "Corrected typo in Rule 7.3"

**Options:**
- **A)** YES - Required field (admin must provide reason)
- **B)** YES - Optional field (admin can provide reason if they want)
- **C)** NO - Just track WHO changed it and WHEN

**Your Answer:** _______

---

### Section 5: Data Source & Updates

#### **Q11: How will court rules get updated in the system?**

**Options:**
- **A)** Manual entry - Admin types/pastes rule text into the system
- **B)** File import - Admin uploads documents (PDF, Word, etc.)
- **C)** API integration - System automatically checks external sources for updates
- **D)** Combination - Multiple methods available

**Your Answer:** _______

**Additional Questions:**
- Do you currently have court rules in a specific format? (PDF, Word, Database, etc.) _______
- How often do rules typically change? 
  - Federal rules: _______
  - District court rules: _______
  - Judge procedures: _______

---

#### **Q12: When importing bulk data (like we did with N.D. Illinois), how should versioning work?**

**Options:**
- **A)** Create Version 1 for all imported items
  - Every rule starts with a "baseline" version
  - All future changes are Version 2, 3, etc.
  
- **B)** Don't version initial imports
  - First import is just "current data"
  - Only start versioning when admins make changes later
  
- **C)** Import with effective dates
  - If importing historical data, create versions with proper dates
  - Example: Import 2023 rules with 2023 dates, 2024 rules with 2024 dates

**Your Answer:** _______

---

### Section 6: Performance & Storage

#### **Q13: How long should version history be retained?**

**Options:**
- **A)** Forever - Keep all versions indefinitely
  - ✅ Complete audit trail
  - ✅ Useful for long-term compliance
  - ⚠️ Uses more database storage (but disk is cheap)

- **B)** Time-based retention - Keep last X years
  - Example: Keep last 5 years of versions
  - ⚠️ Older versions are deleted

- **C)** Count-based retention - Keep last X versions
  - Example: Keep last 50 versions per rule
  - ⚠️ Older versions are deleted

- **D)** Smart retention - Keep all for recent period, archive older
  - Example: Keep all versions from last 2 years, then keep only quarterly snapshots for older data

**Your Answer:** _______

**Reasoning:** _______________________

---

### Section 7: Special Scenarios

#### **Q14: What should happen when a judge leaves or retires?**

**Options:**
- **A)** Archive judge and all procedures (read-only, available for historical reference)
- **B)** Delete judge but keep procedure versions
- **C)** Mark judge as "inactive" but keep all data active
- **D)** Other: _______________________

**Your Answer:** _______

---

#### **Q15: What if a rule is deleted or withdrawn?**

**Example:** A local rule is completely removed from the court's rules.

**Options:**
- **A)** Keep the rule in the system but mark as "Withdrawn" or "No Longer Effective"
  - Keep version history for compliance
  
- **B)** Actually delete the rule and all its versions
  
- **C)** Keep the rule but hide it from regular users (admins can still see it)

**Your Answer:** _______

---

#### **Q16: Should there be a "draft" mode for working on rule updates?**

**Scenario:** Admin wants to update multiple related rules but doesn't want users to see incomplete changes.

**Options:**
- **A)** YES - Admin can work on draft versions before publishing
- **B)** NO - Changes are immediate; admin should work offline if needed
- **C)** YES, but only for bulk imports/major updates

**Your Answer:** _______

---

### Section 8: Reporting & Analytics

#### **Q17: What kind of reports/views would be useful?**

**Select all that apply:**
- [ ] List of all rules that changed in the last 30/60/90 days
- [ ] Rules that changed between two specific dates
- [ ] Most frequently changed rules
- [ ] Rules that haven't been updated in X years (potentially outdated)
- [ ] All changes made by a specific admin
- [ ] Timeline view of changes (visual history)
- [ ] Export version history to PDF/Excel
- [ ] Other: _______________________

---

### Section 9: User Experience Preferences

#### **Q18: When viewing a rule, what information should be prominently displayed?**

**Current Version Display - Select priority (1 = Most Important, 5 = Less Important):**
- ___ Rule text (current version)
- ___ Last updated date
- ___ Who last updated it
- ___ Number of versions available
- ___ "What's new" or change summary
- ___ Effective date (if different from update date)
- ___ Link to version history

---

#### **Q19: Where should users access version history?**

**Options:**
- **A)** Button on each rule's detail page ("View History")
- **B)** Dedicated "Version History" section in main menu
- **C)** Both of the above
- **D)** Only available through admin panel

**Your Answer:** _______

---

### Section 10: Integration with Existing Features

#### **Q20: How should versioning integrate with deadline calculations?**

**Currently:** System shows rules and judge procedures for reference.

**Future:** If deadlines are auto-calculated based on rules:
- Should the system "lock" the rule version used for each deadline? _______
- Should users be warned if the rule has changed since deadline was created? _______
- Should there be a "recalculate with current rules" option? _______

**Your Answer:** _______________________

---

#### **Q21: Should case notes reference specific rule versions?**

**Example:** When a lawyer makes notes on a case, should they be able to link to "Rule 7.1 (as of March 2025)" rather than just "Rule 7.1"?

**Options:**
- **A)** YES - Link to specific version
- **B)** NO - Always link to current version
- **C)** USER CHOICE - Let user decide when creating the link

**Your Answer:** _______

---

## 📊 Additional Input

### Open-Ended Questions

**Q22: Are there any other versioning-related features or concerns not covered above?**

_______________________________________________________________________

_______________________________________________________________________

---

**Q23: What are the top 3 most important aspects of versioning for your workflow?**

1. _______________________________________________________________________

2. _______________________________________________________________________

3. _______________________________________________________________________

---

**Q24: What would make the versioning system most valuable to your team?**

_______________________________________________________________________

_______________________________________________________________________

---

**Q25: Any examples of how you currently handle rule changes in your practice?**

(This helps us understand your existing workflow)

_______________________________________________________________________

_______________________________________________________________________

---

## 🎯 Summary

Once you've answered these questions, we'll have a clear picture of:

✅ **How versioning should work** (automatic vs manual, approval workflows)  
✅ **What data to track** (full text, summaries, reasons for changes)  
✅ **Who can see what** (user permissions, notifications)  
✅ **How to display changes** (comparison views, history timelines)  
✅ **Integration with existing features** (cases, deadlines, documents)

---

## 📝 Instructions for Completion

1. **Review each question** - Some may seem technical, but they all impact user experience
2. **Mark "Not Sure" if uncertain** - We can implement a default and adjust later
3. **Add comments/notes** - Your context helps us build the right solution
4. **Prioritize** - Mark questions as "Critical" vs "Nice to Have" if helpful
5. **Return completed questionnaire** - We'll review and confirm requirements with you

---

## 📧 Contact

If you have questions about any of these items or need clarification on what they mean in practice, please let us know!

**Thank you for your time in helping us build the right solution!** 🎯

---

**Document Version:** 1.0  
**Date:** November 18, 2025  
**For:** Precedentum Court Rules & Judge Procedures Versioning System



