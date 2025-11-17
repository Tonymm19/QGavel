# Precedentum Deadline & Reminder Management Application

## 1. Objectives & Overview
The Precedentum application helps legal professionals (lawyers, paralegals) manage **court deadlines, reminders, and case tracking**.  
Initially a prototype with mock data, it evolved into a full‑stack web app with live backend API, authentication, and a polished React/Vite frontend.  

The main goal was to provide:
- A browser‑based tool for tracking deadlines tied to cases and judges.
- Automated or manual scheduling of reminders.
- A clear audit trail for compliance and collaboration.

---

## 2. Requirements & Features

### Core User Stories
- **Authentication**: Secure login for lawyers (JWT token).
- **Deadline Management**:
  - View, create, edit, snooze, mark deadlines complete.
  - Assign deadlines to cases and owners.
- **Reminders**:
  - Schedule, view, delete reminders for upcoming deadlines.
  - Display reminder counts on the tracker.
- **Audit Logging**:
  - Track all deadline state changes (create, update, complete).
  - View audit trail in a modal per deadline.
- **Filtering & Bulk Actions**:
  - Filter deadlines by status, priority, case, owner.
  - Bulk mark selected deadlines complete.
- **UI/UX**:
  - Tabs for Dashboard, Deadlines, Rules, Judge Profiles.
  - Responsive design with modals for editing, creating, or listing reminders.
  - Interactive charts, badges, and feedback banners.
- **Admin & Data Seeding**:
  - Admin portal to manage data.
  - Seeder script for demo judge, case, deadlines, reminders.

---

## 3. Architecture & Technology Stack

### Backend
- **Framework**: Django + Django REST Framework (DRF)
- **Authentication**: Token-based (Simple JWT)
- **Database**: PostgreSQL (local dev + import of ILND demo dataset)
- **Endpoints**:
  - `/api/v1/auth/token/` – Login
  - `/api/v1/deadlines/` – List, create, update deadlines
  - `/api/v1/deadline-reminders/` – List, create, delete reminders
  - `/api/v1/users/` – List of assignable owners
  - `/api/v1/audit-log/` – View deadline history
- **Services**:
  - `audit.py` for capturing before/after state of deadlines.

### Frontend
- **Framework**: React + Vite + TypeScript
- **State Management**: React Context API
- **Routing**: Tab‑based navigation
- **Data Flow**:
  - AuthContext handles login & token storage
  - DataContext fetches deadlines, reminders, users
- **Components**:
  - `DeadlineTracker.tsx` (main list with filters & bulk actions)
  - `NewDeadlineModal.tsx`
  - `DeadlineEditModal.tsx`
  - `DeadlineReminderListModal.tsx`
  - `ReminderModal.tsx`
  - `AuditLogModal.tsx`

---

## 4. Implementation Details

### Data Model (Key Fields)
- **User**: email, full_name, role
- **Case**: caption, judge
- **Deadline**: case, owner, due_at, snooze_until, status, priority
- **DeadlineReminder**: deadline, notify_at, method
- **AuditLog**: action, acting_user, before, after, timestamp

### Key Patterns
- **API‑Driven UI**: React fetches data from DRF endpoints; no mock data.
- **Validation**:
  - Future‑date validation for snoozes and reminders.
- **Audit Hooks**:
  - On every create/update, the backend records an entry with before/after diff.

### Security
- All API routes require token authentication.
- Deadline create/update captures acting user automatically.

---

## 5. Milestones & Progress

### Completed
- ✅ Converted PRD to Django models and initial migrations.
- ✅ Stood up DRF endpoints (judges, cases, deadlines, rules, reminders, users).
- ✅ Integrated React frontend with API & JWT login.
- ✅ Implemented reminder creation, listing, deletion.
- ✅ Added deadline editing, snoozing, completion, and owner assignment.
- ✅ Added filters, bulk complete, reminder badges.
- ✅ Added audit logging & history modal.
- ✅ Added seeder for demo data and login.
- ✅ Fixed local npm install issues & hot‑reload dev server.
- ✅ Built automated backend tests for deadline & reminder flows.
- ✅ Hardened production build assets (multi-stage Dockerfiles, Gunicorn entrypoint with `collectstatic`).
- ✅ Authored `.env.production.example` and documented deployment workflow in `DEPLOYMENT.md`.
- ✅ Validated production docker-compose stack end-to-end (build, up, migrate, seed, smoke test prep).
- ✅ Added manual smoke-test checklist covering dashboard, deadlines, reminders, and system resiliency.
- ✅ Resolved production React runtime mismatch (duplicate React instance caused `useState` dispatcher failure) by removing the legacy bundle from the build path and stubbing `lucide-react` dependencies; confirmed clean preview build.
- ✅ Integrated Illinois Northern District (ILND) Rules POC schema: created unmanaged Django ORM models mapping to imported tables, pointed `INSTALLED_APPS` at `CourtRulesConfig`, and switched settings to PostgreSQL.
- ✅ Imported ILND demo dataset via `schema.sql` + `demo_data.sql` and verified availability through Django ORM counts.
- ✅ Registered ILND models in the Django admin and exposed read-only DRF endpoints under `/api/v1/ilnd/*` (courts, rule nodes, judges, judge procedures, requirements, compliance checks, change events); validated token auth with `curl` using demo credentials.

### Next Steps
- 🤖 Wire up `claude_extractor.py` as a Django domain service, expose compliance/requirement extraction endpoints, and add unit + integration tests around the workflow.
- 📦 Document ILND admin usage and `/api/v1/ilnd/*` endpoints for the team, then plan how (or if) this data surfaces in the UI.
- 🧪 Run end-to-end smoke tests (backend + legacy frontend) against the single React bundle to confirm no regressions after the ILND import.
- 🚀 Promote containers to managed staging/production environment (ECS/Kubernetes/Fly/etc.) using GHCR images.
- 🔐 Wire secrets management for production (`DJANGO_SECRET_KEY`, Postgres/Redis creds, JWT lifetimes) via cloud vault or hosting env vars.
- 📈 Introduce monitoring/alerting (app logs, uptime checks, DB metrics) and finalize backup cadence for Postgres.
- 🤝 Execute PRD follow-ups: architecture review, advisory board kickoff, pilot firm onboarding, and funding conversations.
- 🎨 Preserve the legacy React UI as the primary frontend; keep the fresh Vite scaffold checked in for future experiments but out of the production build pipeline.

### Session Progress – 2025-10-17
- Identified duplicate React runtime by inspecting Vite build artifacts; removed the stale `frontend/` directory and added temporary icon stubs to eliminate second React copy.
- Scaffolded `frontend-new/` from Vite for controlled testing while retaining the legacy UI as the production entry point.
- Adopted PostgreSQL locally, configured credentials in `config/settings/base.py`, and updated `CourtRulesConfig` to load ILND POC models on app ready.
- Imported ILND demo schema/data, linked unmanaged models to raw tables (`db_table`), and validated row counts via Django shell.
- Added admin registrations + DRF serializers/viewsets for ILND data, routed `/api/v1/ilnd/*`, and verified token retrieval with `curl`.
- Registered a new SSH key, then committed and pushed the ILND integration work to `origin/main`.

### Session Progress – 2025-11-17
- ✅ Fixed backend authentication to accept email instead of username (custom `obtain_auth_token_email` view).
- ✅ Fixed POC model database column mappings (`db_column` for ForeignKey fields).
- ✅ Fixed frontend AuthContext to send `email` instead of `username` in login payload.
- ✅ Verified full application functionality: backend API, frontend UI, authentication, all features working.
- ✅ Analyzed Bolt.new frontend code for potential integration (located in `/frontend-bolt-review/`).
- ✅ Identified Bolt.new strengths: Beautiful, vibrant UI with lucide-react icons, modern Tailwind styling.
- ✅ Identified Bolt.new limitations: Supabase-based backend (incompatible), different data schema.
- ✅ Created comprehensive integration analysis documents (BOLT_INTEGRATION_ANALYSIS.md, BOLT_QUICK_SUMMARY.md).
- ✅ User decision: **Visual Upgrade Only** approach - extract UI/styling, keep all existing functionality.
- 🔄 **IN PROGRESS**: Installing lucide-react icon library (resolving React 19 compatibility).

---

## 6. Open Questions & Future Considerations
- Multi‑user roles and permissions beyond basic lawyer role.
- Integration with external court data sources (PACER).
- Calendar sync (Google/Outlook) for deadlines and reminders.
- Scaling: move from SQLite to Postgres in staging/production.
- CI/CD pipeline for automated testing & deployment.
- Potential AI features: auto‑classification of rules, judge preferences.

---

## 7. How to Run Locally (Summary)
```bash
# Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev   # for development
npm run build # for production bundle
```

Login with demo credentials:
- Email: demo.lawyer@example.com
- Password: changeme123
