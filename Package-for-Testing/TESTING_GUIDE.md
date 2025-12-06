<!--
 Precedentum Application - Testing Guide
 For Tony Stark and Bruce Wayne
-->

# Precedentum Application Testing Guide

## Welcome Testers! 👨‍💻

This guide will walk you through comprehensive testing of the Precedentum application.

---

## Test Environment

- **Frontend URL**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/

---

## Test Accounts

### Admin Access (Full Permissions):
- **Email**: `tony@ignitia-ai.com` or `bruce@ignitia-ai.com`
- **Password**: `admin123`

### Lawyer Access (Limited Permissions):
- **Email**: `demo.lawyer@example.com`
- **Password**: `changeme123`

---

## Testing Checklist Overview

Use this high-level checklist to track your progress:

- [ ] Installation & Setup
- [ ] User Authentication
- [ ] Dashboard
- [ ] Judge Profiles
- [ ] Cases Management
- [ ] Deadlines Management
- [ ] Rules & Procedures
- [ ] User Management (Admin)
- [ ] Performance & Browser Compatibility
- [ ] Mobile Responsiveness

---

# Detailed Test Scenarios

## 1. Installation & Setup Testing

### Test 1.1: Initial Setup
**Objective**: Verify setup script works correctly

**Steps**:
1. Run setup script (`setup_mac.sh` or `setup_windows.bat`)
2. Note any errors or warnings
3. Verify servers start successfully
4. Check browser opens automatically

**Expected Result**:
- ✅ Setup completes without errors
- ✅ Both servers running (8000 and 5173)
- ✅ Application opens in browser

**Record**:
- Time taken: ___________
- Errors encountered: ___________
- Notes: ___________

---

### Test 1.2: Server Restart
**Objective**: Verify servers can be stopped and restarted

**Steps**:
1. Stop servers using `stop_servers.sh` or `stop_servers.bat`
2. Verify servers are stopped (ports released)
3. Restart using `start_servers.sh` or `start_servers.bat`
4. Verify application loads correctly

**Expected Result**:
- ✅ Servers stop cleanly
- ✅ Servers restart without errors
- ✅ No data loss

**Record**:
- Issues: ___________

---

## 2. User Authentication Testing

### Test 2.1: Admin Login
**Objective**: Verify admin can log in successfully

**Steps**:
1. Navigate to http://localhost:5173
2. Enter email: `tony@ignitia-ai.com`
3. Enter password: `admin123`
4. Click "Sign in"

**Expected Result**:
- ✅ Successful login
- ✅ Redirected to dashboard
- ✅ User name displayed in header

**Record**:
- Success: ☐ Yes ☐ No
- Issues: ___________

---

### Test 2.2: Demo Lawyer Login
**Objective**: Verify lawyer account works

**Steps**:
1. Log out if logged in
2. Enter email: `demo.lawyer@example.com`
3. Enter password: `changeme123`
4. Click "Sign in"

**Expected Result**:
- ✅ Successful login
- ✅ Limited menu options (no admin features)

**Record**:
- Success: ☐ Yes ☐ No
- Differences from admin: ___________

---

### Test 2.3: Invalid Credentials
**Objective**: Verify error handling for bad credentials

**Steps**:
1. Log out
2. Enter invalid email
3. Enter invalid password
4. Click "Sign in"

**Expected Result**:
- ✅ Error message displayed
- ✅ No access granted
- ✅ Clear error explanation

**Record**:
- Error message shown: ___________

---

### Test 2.4: Logout
**Objective**: Verify logout functionality

**Steps**:
1. Log in with any account
2. Find and click logout button
3. Verify redirected to login page
4. Try accessing protected pages directly

**Expected Result**:
- ✅ Successfully logged out
- ✅ Cannot access protected pages
- ✅ Redirected to login

**Record**:
- Success: ☐ Yes ☐ No

---

## 3. Dashboard Testing

### Test 3.1: Dashboard Load
**Objective**: Verify dashboard displays correctly

**Steps**:
1. Log in as admin
2. Observe dashboard page
3. Check for all widgets/metrics
4. Note load time

**Expected Result**:
- ✅ Dashboard loads within 3 seconds
- ✅ All metrics displayed
- ✅ No console errors

**Record**:
- Load time: ___________
- Missing elements: ___________

---

### Test 3.2: Dashboard Data
**Objective**: Verify dashboard shows correct data

**Steps**:
1. Note numbers on dashboard
2. Compare with actual data (if known)
3. Check for reasonable values

**Expected Result**:
- ✅ Numbers make sense
- ✅ No zero or negative values where inappropriate
- ✅ Charts/graphs display correctly

**Record**:
- Data accuracy: ☐ Good ☐ Issues
- Notes: ___________

---

## 4. Judge Profiles Testing

### Test 4.1: View Judge List
**Objective**: Verify judges list displays

**Steps**:
1. Navigate to "Judge Profiles" from menu
2. Verify list of judges appears
3. Count number of judges shown

**Expected Result**:
- ✅ 8 judges displayed
- ✅ Each judge shows name, court, photo area
- ✅ Professional appearance

**Record**:
- Number shown: ___________
- Layout issues: ___________

---

### Test 4.2: Judge Details - Chamber Staff
**Objective**: Verify chamber staff information displays correctly

**Steps**:
1. Find Judge "Hon. Rebecca R. Pallmeyer"
2. Check "Chamber Staff" section
3. Verify display order and information

**Expected Result**:
- ✅ Sections in order: Court Reporter, Courtroom Deputy, Executive Law Clerk, Judicial Assistant, Law Clerks
- ✅ Court Reporter: Hannah Jagler with phone/room (if added)
- ✅ Courtroom Deputy: Christina Presslak with phone/room
- ✅ Headings larger than data
- ✅ No duplicate "Room" text
- ✅ No unnecessary icons

**Record**:
- Display correct: ☐ Yes ☐ No
- Issues found: ___________

---

### Test 4.3: Multiple Judges
**Objective**: Verify all judges display consistently

**Steps**:
1. Scroll through all 8 judges
2. Check consistency of formatting
3. Look for any display issues

**Expected Result**:
- ✅ All judges have same layout
- ✅ All headings same size
- ✅ All data same size
- ✅ Professional, consistent appearance

**Record**:
- Consistency: ☐ Good ☐ Issues
- Variations noted: ___________

---

## 5. Cases Management Testing

### Test 5.1: View Cases List
**Objective**: Verify cases display correctly

**Steps**:
1. Navigate to "Cases" from menu
2. Observe list of cases
3. Note number of cases

**Expected Result**:
- ✅ Cases list loads
- ✅ Each case shows caption, number, status
- ✅ Cases are readable and organized

**Record**:
- Number of cases: ___________
- Layout: ☐ Good ☐ Needs work

---

### Test 5.2: Case Filtering/Search
**Objective**: Verify cases can be filtered

**Steps**:
1. Look for search or filter options
2. Try filtering by status
3. Try searching for specific case

**Expected Result**:
- ✅ Filters work correctly
- ✅ Search returns relevant results
- ✅ Easy to use

**Record**:
- Filters available: ___________
- Functionality: ☐ Works ☐ Broken

---

### Test 5.3: Case Details
**Objective**: Verify individual case information

**Steps**:
1. Click on a case
2. Review case details page
3. Check all information displayed

**Expected Result**:
- ✅ Case details page loads
- ✅ All information visible
- ✅ Professional presentation

**Record**:
- Details complete: ☐ Yes ☐ No
- Missing: ___________

---

## 6. Deadlines Management Testing

### Test 6.1: View Deadlines
**Objective**: Verify deadlines list works

**Steps**:
1. Navigate to "Deadlines"
2. View list of deadlines
3. Check sorting and organization

**Expected Result**:
- ✅ Deadlines displayed
- ✅ Shows due dates, case info
- ✅ Clear and organized

**Record**:
- Number of deadlines: ___________
- Organization: ☐ Clear ☐ Confusing

---

### Test 6.2: Deadline Filtering
**Objective**: Verify deadline filters

**Steps**:
1. Look for filter options
2. Filter by status (open, done, etc.)
3. Filter by date range

**Expected Result**:
- ✅ Filters available
- ✅ Filters work correctly
- ✅ Results update immediately

**Record**:
- Filters working: ☐ Yes ☐ No
- Issues: ___________

---

### Test 6.3: Deadline Details
**Objective**: Verify deadline information is complete

**Steps**:
1. Click on a deadline
2. Review all information
3. Check for computation rationale

**Expected Result**:
- ✅ All details shown
- ✅ Computation explanation visible
- ✅ Related case information linked

**Record**:
- Complete: ☐ Yes ☐ No
- Notes: ___________

---

## 7. Rules & Procedures Testing

### Test 7.1: Browse Court Rules
**Objective**: Verify rules display correctly

**Steps**:
1. Navigate to "Rules" section
2. Browse available rules
3. Click on a rule to view details

**Expected Result**:
- ✅ Rules list displayed
- ✅ Rules organized by type/jurisdiction
- ✅ Rule text readable

**Record**:
- Number of rules: ___________
- Readability: ☐ Good ☐ Poor

---

### Test 7.2: Search Rules
**Objective**: Verify rule search functionality

**Steps**:
1. Use search feature
2. Search for specific term (e.g., "summary judgment")
3. Review results

**Expected Result**:
- ✅ Search returns relevant results
- ✅ Results are highlighted or clear
- ✅ Fast response time

**Record**:
- Search works: ☐ Yes ☐ No
- Speed: ___________

---

## 8. User Management Testing (Admin Only)

### Test 8.1: Access Admin Panel
**Objective**: Verify admin can access Django admin

**Steps**:
1. Log in as admin
2. Navigate to http://localhost:8000/admin/
3. Explore admin interface

**Expected Result**:
- ✅ Admin panel loads
- ✅ Can see all models
- ✅ Interface is organized

**Record**:
- Access: ☐ Yes ☐ No
- Organization: ☐ Clear ☐ Cluttered

---

### Test 8.2: Edit Judge Information
**Objective**: Verify admin can edit judge data

**Steps**:
1. Go to admin panel
2. Navigate to Judges
3. Edit a judge's information
4. Save changes
5. Verify changes appear in frontend

**Expected Result**:
- ✅ Can edit judge information
- ✅ Changes save successfully
- ✅ Changes reflect in frontend immediately

**Record**:
- Edit successful: ☐ Yes ☐ No
- Time to reflect: ___________

---

### Test 8.3: View Other Models
**Objective**: Explore admin capabilities

**Steps**:
1. Browse different models (Cases, Deadlines, Users)
2. Check if data makes sense
3. Try viewing different records

**Expected Result**:
- ✅ All models accessible
- ✅ Data displayed correctly
- ✅ No errors

**Record**:
- Models explored: ___________
- Issues: ___________

---

## 9. Performance Testing

### Test 9.1: Page Load Times
**Objective**: Measure application performance

**Steps**:
1. Clear browser cache
2. Load each major page
3. Note load times

**Pages to test**:
- Dashboard: _______ seconds
- Judge Profiles: _______ seconds
- Cases: _______ seconds
- Deadlines: _______ seconds
- Rules: _______ seconds

**Expected Result**:
- ✅ All pages load under 3 seconds
- ✅ No freezing or hanging
- ✅ Smooth transitions

**Record**:
- Acceptable: ☐ Yes ☐ No
- Slowest page: ___________

---

### Test 9.2: Large Data Sets
**Objective**: Test with many records

**Steps**:
1. Navigate to pages with lists
2. Scroll through long lists
3. Try filtering/searching

**Expected Result**:
- ✅ Handles 100+ items smoothly
- ✅ Scroll is smooth
- ✅ No crashes

**Record**:
- Performance: ☐ Good ☐ Slow ☐ Crashes

---

## 10. Browser Compatibility

### Test 10.1: Test Multiple Browsers
**Objective**: Verify cross-browser compatibility

**Browsers to test**:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari (Mac)
- [ ] Edge (Windows)

**For each browser, check**:
1. Login works
2. Pages display correctly
3. No visual glitches
4. All features function

**Record**:
```
Chrome:     ☐ Works ☐ Issues: ___________
Firefox:    ☐ Works ☐ Issues: ___________
Safari:     ☐ Works ☐ Issues: ___________
Edge:       ☐ Works ☐ Issues: ___________
```

---

### Test 10.2: Browser Console
**Objective**: Check for JavaScript errors

**Steps**:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Navigate through application
4. Note any errors or warnings

**Expected Result**:
- ✅ No red errors
- ✅ Minimal warnings
- ✅ Clean console

**Record**:
- Errors found: ___________
- Severity: ☐ Critical ☐ Minor ☐ None

---

## 11. Mobile Responsiveness

### Test 11.1: Mobile Browser
**Objective**: Test on mobile devices or mobile view

**Steps**:
1. Open browser dev tools
2. Toggle device toolbar (mobile view)
3. Test various screen sizes
4. Navigate through application

**Expected Result**:
- ✅ Layouts adjust for mobile
- ✅ Text is readable
- ✅ Buttons are tappable
- ✅ No horizontal scrolling

**Record**:
- Responsive: ☐ Yes ☐ No
- Issues: ___________

---

## 12. Error Handling

### Test 12.1: Network Interruption
**Objective**: Test behavior when network fails

**Steps**:
1. Disconnect from internet
2. Try to perform actions
3. Reconnect
4. Verify recovery

**Expected Result**:
- ✅ Graceful error messages
- ✅ No crashes
- ✅ Recovers when reconnected

**Record**:
- Behavior: ___________

---

### Test 12.2: Invalid Inputs
**Objective**: Test form validation

**Steps**:
1. Find forms (login, search, etc.)
2. Enter invalid data
3. Try to submit

**Expected Result**:
- ✅ Validation errors shown
- ✅ Clear error messages
- ✅ Prevents invalid submission

**Record**:
- Validation works: ☐ Yes ☐ No

---

## 13. Critical User Flows

### Test 13.1: Complete Workflow
**Objective**: Test a complete user journey

**Scenario**: Lawyer reviewing deadlines for a case

**Steps**:
1. Log in as lawyer
2. View dashboard
3. Find a case with deadlines
4. Review deadline details
5. Check related court rules
6. Verify judge procedures
7. Log out

**Expected Result**:
- ✅ Smooth flow through all steps
- ✅ All information accessible
- ✅ No broken links or errors

**Record**:
- Flow works: ☐ Yes ☐ No
- Friction points: ___________

---

## Test Summary Report

### Overall Assessment

**Installation**:
- Difficulty: ☐ Easy ☐ Medium ☐ Hard
- Time taken: ___________

**User Interface**:
- Rating: ☐ Excellent ☐ Good ☐ Fair ☐ Poor
- Most confusing: ___________
- Best feature: ___________

**Functionality**:
- Works as expected: ☐ Mostly ☐ Partially ☐ No
- Critical bugs: ___________
- Minor issues: ___________

**Performance**:
- Speed: ☐ Fast ☐ Acceptable ☐ Slow
- Stability: ☐ Stable ☐ Some crashes ☐ Unstable

**Would you use this?**:
☐ Yes, as is
☐ Yes, with improvements
☐ No, needs major work

---

## Bugs Found

Use this template for each bug:

```
BUG #___
Title: ___________
Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
Steps to reproduce:
1. ___________
2. ___________
3. ___________

Expected: ___________
Actual: ___________
Browser: ___________
Screenshots: ___________
```

---

## Feature Requests / Suggestions

List any features or improvements you'd like to see:

1. ___________
2. ___________
3. ___________

---

## Final Notes

**Best aspects**:
- ___________
- ___________

**Needs improvement**:
- ___________
- ___________

**Deal-breakers** (if any):
- ___________

**Additional comments**:
___________

---

## Submission

**Tested by**: ___________
**Date**: ___________
**Time spent testing**: ___________
**Environment**: ☐ macOS ☐ Windows ☐ Both

**Please save this document with your results and send to**:
piyush@ignitia-ai.com

**Thank you for your thorough testing!** 🙏

