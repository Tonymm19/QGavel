# Comprehensive Testing Checklist

This document provides a complete testing checklist for the Precedentum application.

---

## 🎯 Test Environment Setup

### Prerequisites
- [ ] PostgreSQL is running
- [ ] Backend server is running on http://localhost:8000
- [ ] Frontend server is running on http://localhost:5173
- [ ] Demo data is seeded in database
- [ ] Browser DevTools are open (Console + Network tabs)

### Verification Commands
```bash
# Check PostgreSQL
pg_isready

# Check backend
curl http://localhost:8000/api/v1/

# Check frontend
curl http://localhost:5173/
```

---

## 1️⃣ Backend API Testing

### Authentication Endpoints

#### Test 1.1: Login with Valid Credentials
```bash
curl -X POST http://localhost:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"demo.lawyer@example.com","password":"changeme123"}'
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Response contains: `token`, `user_id`, `email`, `full_name`, `role`
- ✅ Token is a valid string

**Checklist:**
- [ ] Request succeeds
- [ ] Token returned
- [ ] User details correct

---

#### Test 1.2: Login with Invalid Credentials
```bash
curl -X POST http://localhost:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"wrongpass"}'
```

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error message returned

**Checklist:**
- [ ] Request fails appropriately
- [ ] Error message is clear

---

### Core Data Endpoints

#### Test 1.3: List Deadlines (Authenticated)
```bash
TOKEN="your_token_here"
curl -H "Authorization: Token $TOKEN" \
  http://localhost:8000/api/v1/deadlines/
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Returns paginated list of deadlines
- ✅ Each deadline has required fields

**Checklist:**
- [ ] Request succeeds
- [ ] Returns 4 demo deadlines
- [ ] Pagination works
- [ ] Data structure is correct

---

#### Test 1.4: List Deadlines (Unauthenticated)
```bash
curl http://localhost:8000/api/v1/deadlines/
```

**Expected Result:**
- ✅ Status: 401 Unauthorized
- ✅ Error message about authentication

**Checklist:**
- [ ] Request fails
- [ ] Proper error message

---

#### Test 1.5: List Cases
```bash
curl -H "Authorization: Token $TOKEN" \
  http://localhost:8000/api/v1/cases/
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Returns list of cases
- ✅ Case includes caption, case_number, status

**Checklist:**
- [ ] Request succeeds
- [ ] At least 1 case returned
- [ ] Data complete

---

#### Test 1.6: List Users
```bash
curl -H "Authorization: Token $TOKEN" \
  http://localhost:8000/api/v1/users/
```

**Expected Result:**
- ✅ Returns list of users
- ✅ Includes demo lawyer

**Checklist:**
- [ ] Request succeeds
- [ ] Demo lawyer in list

---

### ILND POC Data Endpoints

#### Test 1.7: List ILND Courts
```bash
curl -H "Authorization: Token $TOKEN" \
  http://localhost:8000/api/v1/ilnd/courts/
```

**Expected Result:**
- ✅ Returns ILND court data
- ✅ Court code: "ILND"
- ✅ Court name and URL present

**Checklist:**
- [ ] Request succeeds
- [ ] Court data correct

---

#### Test 1.8: List ILND Judges
```bash
curl -H "Authorization: Token $TOKEN" \
  http://localhost:8000/api/v1/ilnd/judges/
```

**Expected Result:**
- ✅ Returns 9 judges
- ✅ Each judge has display_name, court_code, contact info

**Checklist:**
- [ ] Request succeeds
- [ ] 9 judges returned
- [ ] Data complete

---

#### Test 1.9: List ILND Rule Nodes
```bash
curl -H "Authorization: Token $TOKEN" \
  http://localhost:8000/api/v1/ilnd/rule-nodes/
```

**Expected Result:**
- ✅ Returns 28 rule nodes
- ✅ Each rule has rule_code, heading, text
- ✅ Pagination works

**Checklist:**
- [ ] Request succeeds
- [ ] 28 rules returned
- [ ] Pagination functional

---

### Deadline Operations

#### Test 1.10: Create Deadline
```bash
curl -X POST http://localhost:8000/api/v1/deadlines/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "case": "case-uuid-here",
    "trigger_type": "user",
    "due_at": "2025-12-01T23:59:59Z",
    "timezone": "America/Chicago",
    "priority": 2,
    "status": "open"
  }'
```

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Deadline created with provided data
- ✅ Audit log entry created

**Checklist:**
- [ ] Deadline created successfully
- [ ] Returned data matches input
- [ ] Can view new deadline in list

---

#### Test 1.11: Update Deadline
```bash
curl -X PATCH http://localhost:8000/api/v1/deadlines/{deadline-id}/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done",
    "outcome": "Filed successfully"
  }'
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Deadline updated
- ✅ Audit log captures change

**Checklist:**
- [ ] Update succeeds
- [ ] Status changed to "done"
- [ ] Audit log shows before/after

---

### Reminder Operations

#### Test 1.12: Create Reminder
```bash
curl -X POST http://localhost:8000/api/v1/deadline-reminders/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deadline": "deadline-uuid-here",
    "notify_at": "2025-11-20T09:00:00Z",
    "channel": "email"
  }'
```

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Reminder created

**Checklist:**
- [ ] Reminder created
- [ ] Data correct

---

#### Test 1.13: Delete Reminder
```bash
curl -X DELETE http://localhost:8000/api/v1/deadline-reminders/{reminder-id}/ \
  -H "Authorization: Token $TOKEN"
```

**Expected Result:**
- ✅ Status: 204 No Content
- ✅ Reminder deleted

**Checklist:**
- [ ] Deletion succeeds
- [ ] Reminder no longer in list

---

### Audit Log

#### Test 1.14: View Audit Log
```bash
curl -H "Authorization: Token $TOKEN" \
  "http://localhost:8000/api/v1/audit-log/?entity_id={deadline-id}"
```

**Expected Result:**
- ✅ Returns audit entries for deadline
- ✅ Shows create, update actions
- ✅ Includes before/after snapshots

**Checklist:**
- [ ] Audit log retrieved
- [ ] Shows all changes
- [ ] Data complete

---

## 2️⃣ Frontend UI Testing

### Login Flow

#### Test 2.1: Access Login Page
1. Open http://localhost:5173/
2. Verify login screen appears

**Checklist:**
- [ ] Login page loads
- [ ] No console errors
- [ ] Form fields visible
- [ ] Submit button present

---

#### Test 2.2: Login with Valid Credentials
1. Enter email: `demo.lawyer@example.com`
2. Enter password: `changeme123`
3. Click "Sign In"

**Expected Result:**
- ✅ Redirect to dashboard
- ✅ Token stored in localStorage
- ✅ User name displayed in header

**Checklist:**
- [ ] Login succeeds
- [ ] Dashboard loads
- [ ] User name shows in UI
- [ ] Token in localStorage

---

#### Test 2.3: Login with Invalid Credentials
1. Enter wrong email/password
2. Click "Sign In"

**Expected Result:**
- ✅ Error message displayed
- ✅ Stays on login page
- ✅ No token stored

**Checklist:**
- [ ] Error message appears
- [ ] Not logged in
- [ ] Can retry

---

### Dashboard

#### Test 2.4: View Dashboard
After logging in, verify dashboard displays:

**Checklist:**
- [ ] Statistics cards visible
- [ ] Shows total deadlines
- [ ] Shows upcoming count
- [ ] Shows past due count
- [ ] Shows completed count
- [ ] Recent activity list
- [ ] No loading errors

---

### Deadline Management

#### Test 2.5: View Deadline List
1. Click "Deadlines" in sidebar

**Checklist:**
- [ ] List of deadlines loads
- [ ] Each deadline shows:
  - [ ] Case caption
  - [ ] Due date
  - [ ] Priority
  - [ ] Status
  - [ ] Owner
  - [ ] Reminder count
- [ ] Action buttons visible
- [ ] Filters available

---

#### Test 2.6: Filter Deadlines by Status
1. Go to Deadlines page
2. Click status filter dropdown
3. Select "Open"

**Expected Result:**
- ✅ Only open deadlines shown

**Checklist:**
- [ ] Filter works
- [ ] Results update immediately
- [ ] Can clear filter

---

#### Test 2.7: Create New Deadline
1. Click "New Deadline" button
2. Fill in form:
   - Select case
   - Set due date
   - Set priority
   - Add notes (optional)
3. Click "Create"

**Expected Result:**
- ✅ Modal opens
- ✅ Form validates
- ✅ Deadline created
- ✅ Modal closes
- ✅ List refreshes
- ✅ New deadline visible

**Checklist:**
- [ ] Modal opens
- [ ] Can fill form
- [ ] Validation works
- [ ] Creates successfully
- [ ] Appears in list

---

#### Test 2.8: Edit Existing Deadline
1. Find a deadline
2. Click "Edit" button
3. Change status to "Done"
4. Add outcome note
5. Click "Save"

**Expected Result:**
- ✅ Edit modal opens
- ✅ Pre-filled with current data
- ✅ Can modify fields
- ✅ Saves successfully
- ✅ Changes reflected in list

**Checklist:**
- [ ] Edit modal opens
- [ ] Data pre-populated
- [ ] Can save changes
- [ ] Updates visible

---

#### Test 2.9: Snooze Deadline
1. Find an open deadline
2. Click "Snooze" button
3. Select future date
4. Click "Snooze"

**Expected Result:**
- ✅ Status changes to "Snoozed"
- ✅ Snooze_until date set
- ✅ Shows when it will reopen

**Checklist:**
- [ ] Can snooze
- [ ] Status updates
- [ ] Date saved

---

#### Test 2.10: Mark Deadline Complete
1. Find open deadline
2. Click checkmark/complete button
3. Confirm

**Expected Result:**
- ✅ Status changes to "Done"
- ✅ Visual indicator changes
- ✅ Audit log updated

**Checklist:**
- [ ] Marks complete
- [ ] Status changes
- [ ] Visible in list

---

#### Test 2.11: Bulk Actions
1. Select multiple deadlines (checkboxes)
2. Click "Mark Complete" bulk action
3. Confirm

**Expected Result:**
- ✅ All selected deadlines marked complete
- ✅ List updates

**Checklist:**
- [ ] Can select multiple
- [ ] Bulk action works
- [ ] All update correctly

---

### Reminder Management

#### Test 2.12: View Reminders for Deadline
1. Find deadline with reminders (shows count badge)
2. Click reminder icon/count badge

**Expected Result:**
- ✅ Modal opens showing list of reminders
- ✅ Each reminder shows date and method

**Checklist:**
- [ ] Modal opens
- [ ] Reminders listed
- [ ] Data complete

---

#### Test 2.13: Create New Reminder
1. Open reminders modal for a deadline
2. Click "Add Reminder"
3. Select date/time
4. Select notification method (email, SMS, in-app)
5. Click "Create"

**Expected Result:**
- ✅ Reminder created
- ✅ Appears in list
- ✅ Count badge updates

**Checklist:**
- [ ] Can create reminder
- [ ] Validation works
- [ ] Saves successfully
- [ ] Count updates

---

#### Test 2.14: Delete Reminder
1. Open reminders list
2. Click delete icon on a reminder
3. Confirm deletion

**Expected Result:**
- ✅ Reminder deleted
- ✅ Removed from list
- ✅ Count badge decrements

**Checklist:**
- [ ] Can delete
- [ ] Removed from list
- [ ] Count correct

---

### Audit Log

#### Test 2.15: View Audit History
1. Find a deadline
2. Click "History" or audit icon
3. View audit log modal

**Expected Result:**
- ✅ Modal shows all changes
- ✅ Each entry shows:
  - [ ] Action type (create/update)
  - [ ] Timestamp
  - [ ] User who made change
  - [ ] Before/after values

**Checklist:**
- [ ] Modal opens
- [ ] History complete
- [ ] Data readable

---

### Rules Search

#### Test 2.16: Browse Rules
1. Click "Rules" in sidebar
2. View rules list

**Checklist:**
- [ ] Rules page loads
- [ ] Can browse rules
- [ ] Search box functional
- [ ] Filters work

---

### Judge Profiles

#### Test 2.17: View Judge Profiles
1. Click "Judge Profiles" in sidebar
2. Browse judge list

**Checklist:**
- [ ] Judges page loads
- [ ] List of judges shown
- [ ] Contact info visible
- [ ] Can search/filter

---

### Theme & UI

#### Test 2.18: Toggle Dark Mode
1. Click theme toggle (moon/sun icon)
2. Observe UI changes

**Expected Result:**
- ✅ Theme switches
- ✅ All components update
- ✅ Preference saved

**Checklist:**
- [ ] Dark mode works
- [ ] Light mode works
- [ ] Persists on reload

---

#### Test 2.19: Responsive Design
1. Resize browser to mobile width
2. Test navigation
3. Test modals

**Expected Result:**
- ✅ Mobile menu appears
- ✅ Sidebar becomes overlay
- ✅ Content adapts

**Checklist:**
- [ ] Mobile view works
- [ ] Navigation accessible
- [ ] All features functional

---

### Logout

#### Test 2.20: Logout
1. Click user menu
2. Click "Logout"

**Expected Result:**
- ✅ Logged out
- ✅ Redirected to login
- ✅ Token removed from localStorage
- ✅ Cannot access protected routes

**Checklist:**
- [ ] Logout succeeds
- [ ] Back to login screen
- [ ] Token cleared
- [ ] Session ended

---

## 3️⃣ Integration Testing

### End-to-End User Flows

#### Test 3.1: Complete Deadline Workflow
1. Login
2. Navigate to Deadlines
3. Create new deadline
4. Add reminder to deadline
5. Edit deadline
6. Mark deadline complete
7. View audit history
8. Logout

**Checklist:**
- [ ] Full flow completes
- [ ] No errors
- [ ] Data persists
- [ ] Audit trail complete

---

#### Test 3.2: Multi-Tab Testing
1. Open app in two browser tabs
2. Login in both
3. Create deadline in tab 1
4. Refresh in tab 2
5. Verify deadline appears

**Checklist:**
- [ ] Data syncs across tabs
- [ ] No conflicts
- [ ] Updates visible

---

## 4️⃣ Error Handling & Edge Cases

#### Test 4.1: Network Disconnection
1. Open DevTools
2. Go to Network tab
3. Set to "Offline"
4. Try to perform action

**Expected Result:**
- ✅ Error message shown
- ✅ UI doesn't break
- ✅ Can retry when online

**Checklist:**
- [ ] Graceful error handling
- [ ] User informed
- [ ] Can recover

---

#### Test 4.2: Session Expiration
1. Login
2. Manually delete token from localStorage
3. Try to perform action

**Expected Result:**
- ✅ Detects invalid session
- ✅ Redirects to login
- ✅ Clear error message

**Checklist:**
- [ ] Handles expired session
- [ ] Redirects properly
- [ ] Clean state

---

#### Test 4.3: Invalid Data Submission
1. Try to create deadline with missing required fields
2. Try to set due_date in the past
3. Try to create reminder in the past

**Expected Result:**
- ✅ Validation errors shown
- ✅ Specific field errors highlighted
- ✅ Cannot submit invalid data

**Checklist:**
- [ ] Form validation works
- [ ] Errors clear
- [ ] Cannot submit invalid

---

## 5️⃣ Performance Testing

#### Test 5.1: Initial Load Time
1. Clear browser cache
2. Open app
3. Measure load time

**Expected Result:**
- ✅ Loads in < 3 seconds
- ✅ No unnecessary requests

**Checklist:**
- [ ] Fast initial load
- [ ] Progressive enhancement
- [ ] No blocking resources

---

#### Test 5.2: API Response Times
Check Network tab for API calls:

**Expected Result:**
- ✅ Most API calls < 500ms
- ✅ No redundant calls
- ✅ Proper caching headers

**Checklist:**
- [ ] APIs respond quickly
- [ ] No duplicate requests
- [ ] Caching works

---

## 6️⃣ Security Testing

#### Test 6.1: Authentication Required
Try to access protected endpoints without token:

**Expected Result:**
- ✅ All protected routes require auth
- ✅ Proper 401 responses
- ✅ Redirect to login

**Checklist:**
- [ ] Cannot access without auth
- [ ] Proper error codes
- [ ] Secure by default

---

#### Test 6.2: XSS Protection
Try to inject JavaScript in form fields:

**Expected Result:**
- ✅ Input sanitized
- ✅ Scripts not executed
- ✅ Data escaped in display

**Checklist:**
- [ ] No XSS vulnerabilities
- [ ] Input sanitized
- [ ] Output escaped

---

## 📊 Test Summary Template

Use this to track your testing session:

### Test Session Details
- **Date**: ___________
- **Tester**: ___________
- **Environment**: Development / Staging / Production
- **Browser**: ___________
- **Browser Version**: ___________

### Results Summary
- **Total Tests**: ___
- **Passed**: ___
- **Failed**: ___
- **Blocked**: ___
- **Not Applicable**: ___

### Issues Found
| Test # | Issue Description | Severity | Status |
|--------|-------------------|----------|--------|
|        |                   |          |        |

### Notes
_Add any additional observations or recommendations here_

---

## ✅ Sign-Off

### Testing Complete
- [ ] All critical tests passed
- [ ] All blockers resolved
- [ ] Documentation updated
- [ ] Deployment approved

**Tester Signature**: ___________________
**Date**: ___________________

---

Last Updated: 2025-11-10





