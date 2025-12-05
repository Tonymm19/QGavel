# QGavel Testing Checklist

**Version:** 1.0  
**Last Updated:** December 2025  
**Purpose:** Comprehensive testing guide for QGavel testers

---

## 📋 For Testers: How to Use This Checklist

1. Go through each section in order
2. Check off items as you test them (✅ or ❌)
3. Note any issues in the "Notes" column
4. Submit your completed checklist to the QGavel team

**Testing URL:** https://qgavel.com  
**Your Login:** (provided separately)  
**Support Email:** support@qgavel.com

---

## 1. Login & Authentication

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 1.1 | Go to https://qgavel.com | Login page loads | | |
| 1.2 | Page loads with HTTPS (lock icon) | Secure connection shown | | |
| 1.3 | Enter correct email and password | Login successful, see Dashboard | | |
| 1.4 | Enter wrong password | Error message shown | | |
| 1.5 | Click "Forgot Password" | Password reset page loads | | |
| 1.6 | Click Logout | Logged out, return to login | | |
| 1.7 | Try to access Dashboard without login | Redirected to login page | | |

**Section 1 Issues Found:**
```
(Write any issues here)
```

---

## 2. Dashboard

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 2.1 | Dashboard loads after login | Main dashboard visible | | |
| 2.2 | Sidebar navigation visible | All menu items shown | | |
| 2.3 | Upcoming deadlines section visible | Shows next 7 days | | |
| 2.4 | Recent cases section visible | Shows recent cases | | |
| 2.5 | User name shown in top right | Your name displayed | | |
| 2.6 | Page loads in under 3 seconds | Fast loading | | |

**Section 2 Issues Found:**
```
(Write any issues here)
```

---

## 3. Judges & Procedures

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 3.1 | Click "Judges" in sidebar | Judges list page loads | | |
| 3.2 | See list of judges | 8 N.D. Illinois judges shown | | |
| 3.3 | Click on a judge name | Judge profile opens | | |
| 3.4 | Judge profile shows basic info | Name, courtroom, contact visible | | |
| 3.5 | Judge profile shows procedures | Procedures section visible | | |
| 3.6 | Judge profile shows chamber staff | Staff listed (if available) | | |
| 3.7 | Search for a judge by name | Search results appear | | |
| 3.8 | Click back to judges list | Returns to list | | |

**Judges to Test:**
- [ ] Judge 1: _____________
- [ ] Judge 2: _____________
- [ ] Judge 3: _____________

**Section 3 Issues Found:**
```
(Write any issues here)
```

---

## 4. Cases

### 4.1 Viewing Cases

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 4.1.1 | Click "Cases" in sidebar | Cases list page loads | | |
| 4.1.2 | See list of existing cases | Cases displayed in table | | |
| 4.1.3 | Click on a case | Case details page opens | | |
| 4.1.4 | Case shows all information | Caption, number, judge, etc. | | |

### 4.2 Creating a Case

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 4.2.1 | Click "+ New Case" button | New case form opens | | |
| 4.2.2 | Fill in case number | Field accepts input | | |
| 4.2.3 | Fill in caption | Field accepts input | | |
| 4.2.4 | Select a court | Dropdown works | | |
| 4.2.5 | Select a judge | Dropdown shows judges | | |
| 4.2.6 | Click "Create Case" | Case created successfully | | |
| 4.2.7 | New case appears in list | Case visible in cases list | | |

**Test Case Created:**
- Case Number: _______________
- Caption: _______________

### 4.3 Editing a Case

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 4.3.1 | Open a case and click "Edit" | Edit form opens | | |
| 4.3.2 | Change the caption | Field updates | | |
| 4.3.3 | Click "Save" | Changes saved | | |
| 4.3.4 | Changes visible on case page | Updated info shown | | |

**Section 4 Issues Found:**
```
(Write any issues here)
```

---

## 5. Deadlines

### 5.1 Viewing Deadlines

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 5.1.1 | Click "Deadlines" in sidebar | Deadlines page loads | | |
| 5.1.2 | See list of deadlines | Deadlines displayed | | |
| 5.1.3 | Deadlines show due dates | Dates visible | | |
| 5.1.4 | Deadlines show priority colors | Color coding visible | | |
| 5.1.5 | Click on a deadline | Deadline details shown | | |

### 5.2 Creating a Deadline

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 5.2.1 | Open a case | Case page loads | | |
| 5.2.2 | Click "+ Add Deadline" | Deadline form opens | | |
| 5.2.3 | Fill in title | Field accepts input | | |
| 5.2.4 | Select due date | Date picker works | | |
| 5.2.5 | Select deadline type | Dropdown works | | |
| 5.2.6 | Click "Create Deadline" | Deadline created | | |
| 5.2.7 | Deadline appears on case | Visible in case deadlines | | |
| 5.2.8 | Deadline appears in main list | Visible in Deadlines page | | |

**Test Deadline Created:**
- Title: _______________
- Due Date: _______________

### 5.3 Managing Deadlines

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 5.3.1 | Mark a deadline complete | Status changes to complete | | |
| 5.3.2 | Edit a deadline | Edit form opens | | |
| 5.3.3 | Change due date | Date updates | | |
| 5.3.4 | Save changes | Changes saved | | |
| 5.3.5 | Delete a deadline | Deadline removed (with confirm) | | |

**Section 5 Issues Found:**
```
(Write any issues here)
```

---

## 6. Calendar Export

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 6.1 | Find "Export to Calendar" button | Button visible | | |
| 6.2 | Click export button | Download dialog or file downloads | | |
| 6.3 | File downloads as .ics | Correct file type | | |
| 6.4 | Open .ics file in calendar app | Events appear correctly | | |
| 6.5 | Deadline info matches QGavel | Dates, titles correct | | |

**Calendar App Tested:** _______________ (e.g., Outlook, Google, Apple)

**Section 6 Issues Found:**
```
(Write any issues here)
```

---

## 7. Search & Navigation

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 7.1 | Use search bar | Search field works | | |
| 7.2 | Search for a judge | Results appear | | |
| 7.3 | Search for a case | Results appear | | |
| 7.4 | Click search result | Goes to correct page | | |
| 7.5 | Navigate using sidebar | All links work | | |
| 7.6 | Browser back button works | Returns to previous page | | |

**Section 7 Issues Found:**
```
(Write any issues here)
```

---

## 8. Performance & Usability

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 8.1 | Pages load quickly | Under 3 seconds | | |
| 8.2 | No broken images | All images display | | |
| 8.3 | No JavaScript errors | Console has no red errors | | |
| 8.4 | Text is readable | Font size appropriate | | |
| 8.5 | Buttons are clickable | All buttons respond | | |
| 8.6 | Forms show validation errors | Errors displayed clearly | | |
| 8.7 | Mobile-friendly (if testing on phone) | Layout adapts | | |

**Browser Used:** _______________ (e.g., Chrome, Safari, Firefox)  
**Device Used:** _______________ (e.g., Windows laptop, Mac, iPhone)

**Section 8 Issues Found:**
```
(Write any issues here)
```

---

## 9. Error Handling

| # | Test | Expected Result | ✅/❌ | Notes |
|---|------|-----------------|-------|-------|
| 9.1 | Submit empty required field | Error message shown | | |
| 9.2 | Enter invalid date | Error message shown | | |
| 9.3 | Go to non-existent page | 404 page shown (not crash) | | |
| 9.4 | Session timeout (wait 30+ min) | Graceful logout, can re-login | | |

**Section 9 Issues Found:**
```
(Write any issues here)
```

---

## 10. Overall Feedback

### What Worked Well?
```
(Write what you liked about QGavel)




```

### What Was Confusing?
```
(Write anything that was unclear or hard to use)




```

### Bugs Found (Summary)
```
(List the most important bugs you found)

1.
2.
3.
```

### Feature Suggestions
```
(What features would make QGavel better?)

1.
2.
3.
```

### Overall Rating

How would you rate your experience? (Circle one)

⭐ Poor | ⭐⭐ Fair | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Very Good | ⭐⭐⭐⭐⭐ Excellent

### Would You Recommend QGavel?

☐ Yes, definitely  
☐ Yes, with improvements  
☐ Maybe  
☐ No  

---

## Tester Information

**Name:** _______________  
**Email:** _______________  
**Date Tested:** _______________  
**Time Spent Testing:** _______________ (approximate)

---

## How to Submit This Checklist

1. Save this file with your responses
2. Email to: support@qgavel.com
3. Subject: "QGavel Testing Feedback - [Your Name]"

**Thank you for helping us improve QGavel!** 🙏

---

*Questions? Contact support@qgavel.com*

