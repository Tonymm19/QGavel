# 📋 Versioning Requirements - One Page Quick Reference

## What We're Building
**Version tracking for Court Rules (Federal + District) and Judge Procedures**

---

## ✅ What We Already Know
- ✅ Auto-create new version when rules/procedures change
- ✅ Track what information changed
- ✅ Internal version numbering (automatic)

---

## ❓ Top 10 Questions We Need Answered

### 🔴 Critical (Must Answer Before Building)

**1. When a rule changes, what happens to existing cases?**
- Keep using old version?
- Auto-update to new version?
- Let user decide?

**2. Do rules have separate "Updated Date" and "Effective Date"?**
- Example: Entered Dec 1, 2025 but effective Jan 1, 2026

**3. Who can edit rules?**
- Super Admin only?
- Super Admin + Site Admin?
- Others?

**4. Do changes need approval or publish immediately?**

**5. Can regular users see version history or admin-only?**

---

### 🟡 Important (Should Answer Soon)

**6. Should users be notified when rules change?**
- Email? In-app alert? No notification?

**7. How much detail to save?**
- Full text of each version?
- Just "what changed" summary?
- Both?

**8. Can users compare versions side-by-side?**

---

### 🟢 Nice to Have (Can Decide Later)

**9. How long to keep version history?**
- Forever?
- Last X years?

**10. Should system track WHY something changed?**
- Optional reason field?
- Required?
- Not needed?

---

## 📥 Three Ways to Provide Requirements

### Option A: Full Questionnaire
**File:** `VERSIONING_REQUIREMENTS_QUESTIONNAIRE.md`
- 25 detailed questions
- Covers all scenarios
- Most thorough

### Option B: Summary Document  
**File:** `VERSIONING_REQUIREMENTS_SUMMARY.md`
- Organized by category
- Priority rankings
- Good balance

### Option C: Answer Top 10 Above
- Quickest approach
- Covers essentials
- Can add details later

---

## 🎯 If Unsure, We'll Use These Defaults

(You can change later!)

| Feature | Default |
|---------|---------|
| Effective Dates | Yes - track separately |
| Historical Lookup | Yes - users can view old versions |
| Who Can Edit | Super Admin + Site Admin |
| Approval Workflow | No - immediate publish |
| User Visibility | Yes - users can see history |
| Notifications | In-app alerts when rules change |
| Detail Level | Full text + change summary |
| Side-by-Side Compare | Yes |
| Retention | Forever |
| Why Changed | Optional field |

---

## ⏱️ Timeline

**Once we have answers:**
- Core versioning: 2 days
- Full features: 3-5 days  
- Testing: 1-2 days
- **Total: ~1 week**

---

## 🚀 Next Step

**Choose one:**
1. Answer Top 10 questions above → Quick start
2. Complete full questionnaire → Most comprehensive
3. Review summary doc → Balanced approach
4. Schedule call to discuss → Collaborative

**Then we start building!** 🎯

---

**Files Ready for Download:**
- `VERSIONING_ONE_PAGE.md` (this file)
- `VERSIONING_REQUIREMENTS_SUMMARY.md` (detailed summary)
- `VERSIONING_REQUIREMENTS_QUESTIONNAIRE.md` (complete questionnaire)



