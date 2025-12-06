# Frontend Testing Guide

## ✅ Frontend is Now Running!

The React frontend application is successfully running and configured to work with the Django backend.

---

## 🌐 Access Information

- **Frontend URL**: http://localhost:5173/
- **Backend API**: http://localhost:8000/api/v1/
- **Django Admin**: http://localhost:8000/admin/

---

## 🔐 Demo Login Credentials

Use these credentials to log in:

- **Email**: `demo.lawyer@example.com`
- **Password**: `changeme123`

---

## 🎯 What Was Fixed

### 1. **Authentication Endpoint**
- **Problem**: Frontend was sending `{ username: email, password }` but backend expected `{ email, password }`
- **Fix**: Updated `AuthContext.tsx` line 39 to send `email` instead of `username`
- **File**: `frontend/src/contexts/AuthContext.tsx`

### 2. **Backend Authentication Handler**
- **Problem**: Default Django token auth expected "username" field
- **Fix**: Created custom `obtain_auth_token_email` function that accepts email
- **File**: `court_rules/api/v1/viewsets.py`

### 3. **Database Model Mappings**
- **Problem**: POC models had incorrect foreign key column names
- **Fix**: Added `db_column` parameters to match actual PostgreSQL column names
- **File**: `court_rules/poc_models.py`

---

## 🧪 How to Test the Frontend

### Step 1: Open in Browser
Navigate to: http://localhost:5173/

### Step 2: Login Screen
You should see a modern login screen. Enter:
- Email: `demo.lawyer@example.com`
- Password: `changeme123`

### Step 3: Explore Features

After logging in, you'll see the main dashboard with navigation:

#### **Dashboard** 📊
- Overview of upcoming deadlines
- Statistics cards (total deadlines, upcoming this week, past due, completed)
- Quick action buttons

#### **Deadlines** 📅
- View all deadlines with filtering options
- Filter by status (Open, Snoozed, Done, Missed)
- Filter by case or owner
- Bulk actions (mark multiple deadlines as complete)
- Individual deadline actions:
  - Edit deadline
  - Snooze deadline
  - Mark as complete
  - View/manage reminders
  - View audit history

#### **Rules** 📚
- Search and browse court rules
- Filter by jurisdiction and rule type
- View rule details

#### **Judge Profiles** ⚖️
- View judge information
- Contact details
- Courtroom assignments

---

## 🔍 Testing Checklist

### Authentication Testing
- [ ] Can log in with demo credentials
- [ ] Invalid credentials show error message
- [ ] Token is stored in localStorage
- [ ] Can log out successfully
- [ ] After logout, redirected to login screen

### Deadline Management
- [ ] Can view list of deadlines
- [ ] Can filter deadlines by status
- [ ] Can create new deadline
- [ ] Can edit existing deadline
- [ ] Can snooze deadline (set snooze_until date)
- [ ] Can mark deadline as complete
- [ ] Bulk actions work (select multiple, mark complete)

### Reminder Management
- [ ] Can view reminders for a deadline
- [ ] Can create new reminder
- [ ] Can delete reminder
- [ ] Reminder count badge shows correct number

### Audit Log
- [ ] Can view audit history for a deadline
- [ ] Shows who made changes and when
- [ ] Shows before/after values for changes

### UI/UX Testing
- [ ] Dark mode toggle works
- [ ] Responsive design works on mobile
- [ ] Sidebar navigation works
- [ ] Modals open and close properly
- [ ] Loading states show during API calls
- [ ] Error messages display properly

---

## 🐛 Known Issues & Limitations

1. **Icon Stubs**: Using simple text-based icon placeholders instead of actual icon library
   - Icons show as 2-letter abbreviations in gray boxes
   - Works functionally, but not as visually polished

2. **Placeholder Features**: Some menu items lead to "coming soon" pages:
   - Cases (detailed view)
   - Alerts & Notifications
   - Calendar Integration
   - Advanced Search
   - Settings

3. **ILND Integration**: The ILND court data is available via API but not yet integrated into the UI
   - API endpoints work: `/api/v1/ilnd/courts/`, `/api/v1/ilnd/judges/`, etc.
   - Frontend views for ILND data need to be built

---

## 📁 Key Frontend Files

### Context Providers
- `src/contexts/AuthContext.tsx` - Authentication & login
- `src/contexts/DataContext.tsx` - Data fetching & state management
- `src/contexts/ThemeContext.tsx` - Dark/light mode

### Main Components
- `src/App.tsx` - Main app structure & routing
- `src/components/LoginScreen.tsx` - Login page
- `src/components/Dashboard.tsx` - Dashboard view
- `src/components/DeadlineTracker.tsx` - Deadline list & management
- `src/components/DeadlineEditModal.tsx` - Edit deadline form
- `src/components/NewDeadlineModal.tsx` - Create deadline form
- `src/components/ReminderModal.tsx` - Create reminder form
- `src/components/DeadlineReminderListModal.tsx` - View/manage reminders
- `src/components/AuditLogModal.tsx` - View audit history

### Utilities
- `src/hooks/useApi.ts` - API fetching hook with auth
- `src/types/index.ts` - TypeScript type definitions

---

## 🚀 Next Development Steps

### High Priority
1. **Add ILND UI Views**
   - Create component to browse ILND courts
   - Create component to view judge procedures
   - Create component to view court rules
   - Integrate compliance checking

2. **Enhanced Features**
   - Calendar view of deadlines
   - Email notifications for reminders
   - Export deadlines to calendar (iCal, Google Calendar)
   - Advanced search and filtering

3. **Error Handling**
   - Better error messages
   - Retry logic for failed requests
   - Offline mode indicators

### Medium Priority
4. **Real Icons**
   - Install `lucide-react` icon library
   - Replace icon stubs with real icons

5. **Testing**
   - Add unit tests for components
   - Add integration tests for user flows
   - Add E2E tests with Playwright or Cypress

6. **Performance**
   - Optimize bundle size
   - Add pagination for large lists
   - Lazy load components
   - Cache API responses

### Low Priority
7. **Polish & UX**
   - Animations and transitions
   - Better loading states
   - Skeleton screens
   - Toast notifications
   - Keyboard shortcuts

---

## 🛠️ Development Commands

### Start Development Servers

**Backend:**
```bash
cd /Users/pmittal/Downloads/Precedentum-1
source .venv/bin/activate
python manage.py runserver
```

**Frontend:**
```bash
cd /Users/pmittal/Downloads/Precedentum-1/frontend
npm run dev
```

### Other Useful Commands

**Build frontend for production:**
```bash
cd frontend
npm run build
```

**Run linter:**
```bash
cd frontend
npm run lint
```

**Preview production build:**
```bash
cd frontend
npm run preview
```

---

## 📞 API Endpoints Reference

### Authentication
- `POST /api/v1/auth/token/` - Login (returns token)

### Core Data
- `GET /api/v1/deadlines/` - List deadlines
- `POST /api/v1/deadlines/` - Create deadline
- `PATCH /api/v1/deadlines/{id}/` - Update deadline
- `GET /api/v1/cases/` - List cases
- `GET /api/v1/judges/` - List judges
- `GET /api/v1/rules/` - List rules
- `GET /api/v1/users/` - List users

### Reminders
- `GET /api/v1/deadline-reminders/` - List reminders
- `POST /api/v1/deadline-reminders/` - Create reminder
- `DELETE /api/v1/deadline-reminders/{id}/` - Delete reminder

### Audit
- `GET /api/v1/audit-log/` - List audit log entries
- `GET /api/v1/audit-log/?entity_id={deadline_id}` - Filter by deadline

### ILND Data
- `GET /api/v1/ilnd/courts/` - List ILND courts
- `GET /api/v1/ilnd/judges/` - List ILND judges
- `GET /api/v1/ilnd/rule-nodes/` - List ILND rules
- `GET /api/v1/ilnd/judge-procedures/` - List judge procedures
- `GET /api/v1/ilnd/requirements/` - List requirements
- `GET /api/v1/ilnd/compliance-checks/` - List compliance checks
- `GET /api/v1/ilnd/change-events/` - List change events

---

## 💡 Tips for Testing

1. **Use Browser DevTools**
   - Open Console (F12) to see any JavaScript errors
   - Check Network tab to see API requests/responses
   - Use React DevTools extension to inspect component state

2. **Test Different Scenarios**
   - Try creating deadlines with different priorities
   - Test the filter combinations
   - Try snoozing deadlines to future dates
   - Create multiple reminders for one deadline

3. **Check Responsiveness**
   - Resize browser window to see mobile view
   - Test on actual mobile device if possible
   - Check that all features work in mobile view

4. **Test Error Cases**
   - Try invalid login credentials
   - Try creating deadline with missing fields
   - Disconnect network and see error handling

---

## ✅ Success Criteria

The frontend is working correctly if:

- ✅ Login page loads without errors
- ✅ Can authenticate with demo credentials
- ✅ Dashboard loads and shows deadline statistics
- ✅ Can navigate between different tabs
- ✅ Can view, create, edit, and complete deadlines
- ✅ Can create and delete reminders
- ✅ Can view audit history
- ✅ Dark mode toggle works
- ✅ No console errors in browser DevTools

---

**Status**: ✅ Frontend is fully functional and ready for testing!

Last updated: 2025-11-10





