# Manual Entry Guide - Court Reporter Contact Information

## Overview

This guide explains how to manually add Court Reporter phone numbers and room numbers through the Django admin panel.

---

## Access the Admin Panel

### 1. Navigate to Admin
Go to: **http://localhost:8000/admin/**

### 2. Login Credentials
Use one of these superuser accounts:
- Email: `bruce@ignitia-ai.com` (password you set)
- Email: `tony@ignitia-ai.com` (password you set)

If you don't know the passwords, you can reset them by running:
```bash
cd /Users/pmittal/Downloads/Precedentum-1
source .venv/bin/activate
python manage.py changepassword bruce@ignitia-ai.com
```

---

## Adding Court Reporter Information

### Step 1: Access Judges Section
1. After logging in, look for **"Court Rules"** section in the admin panel
2. Click on **"Judges"**
3. You'll see a list of all 8 judges

### Step 2: Edit a Judge
1. Click on the judge's name (e.g., "Hon. Rebecca R. Pallmeyer")
2. The edit page will open with organized sections

### Step 3: Expand Court Reporter Section
1. Look for the **"Court Reporter"** section (it may be collapsed)
2. Click to expand it
3. You'll see three fields:
   - **Court reporter name** (already filled, e.g., "Hannah Jagler")
   - **Court reporter phone** (empty - add here)
   - **Court reporter room** (empty - add here)

### Step 4: Enter Contact Information
1. **Phone Format**: Enter as `(312) 435-5637` or `312-435-5637`
2. **Room Format**: Enter as `Room 2504` or just `2504`

### Step 5: Save Changes
1. Scroll to the bottom
2. Click **"Save"** or **"Save and continue editing"**
3. The information will be immediately available in the frontend

---

## Current Judges and Their Court Reporters

Here's the list of all judges and their Court Reporter names (phone/room need to be added):

| Judge | Court Reporter Name |
|-------|-------------------|
| Hon. Andrea R. Wood | Brenda Varney |
| Hon. John F. Kness | Nancy LaBella |
| Hon. John Robert Blakey | Kathleen Sebastian |
| Hon. Matthew F. Kennelly | Carolyn Cox |
| Hon. Rebecca R. Pallmeyer | Hannah Jagler |
| Hon. Steven C. Seeger | No court reporter listed |
| Hon. Thomas M. Durkin | Elia Carrion |
| Hon. Virginia M. Kendall | Gayle McGuigan |

---

## Example: Adding Info for Hannah Jagler

1. Go to: http://localhost:8000/admin/court_rules/judge/
2. Find and click: "Hon. Rebecca R. Pallmeyer"
3. Expand: "Court Reporter" section
4. Fill in:
   - Court reporter phone: `(312) 435-5561` (example)
   - Court reporter room: `Room 2504` (example)
5. Click: "Save"

---

## Verification

After saving, you can verify the changes:

### Option 1: Admin Panel
- Stay on the judge's edit page
- The information should be saved in the Court Reporter fields

### Option 2: Frontend
- Navigate to: http://localhost:5173
- Go to "Judge Profiles"
- Find the judge
- Under "Chamber Staff" → "Court Reporter"
- You should now see:
  - Name
  - Phone (with phone icon)
  - Room (with location icon)

### Option 3: API
- Go to: http://localhost:8000/api/v1/judges/ (requires login)
- Look for the judge's `court_reporter_phone` and `court_reporter_room` fields

---

## Tips

1. **Consistent Formatting**: Use the same phone and room format for all judges for consistency
2. **Bulk Entry**: You can edit multiple judges in one session - just save each one individually
3. **Validation**: Django will automatically validate phone number formats
4. **Room Format**: If you enter just a number (e.g., "2504"), the frontend will display it as-is. If you enter "Room 2504", it will show "Room 2504"

---

## Need Help?

If you encounter any issues:
1. Check that both servers are running (backend on port 8000, frontend on port 5173)
2. Make sure you're logged in with a superuser account
3. Clear your browser cache if changes don't appear immediately
4. The frontend auto-refreshes when data changes

---

## Admin Panel Organization

The Judge edit page is organized into collapsible sections:

1. **Judge Information** - Name, court, courtroom, chambers URL
2. **Judge Contact** - Email and phone for the judge
3. **Court Reporter** ← Add phone/room here
4. **Courtroom Deputy** - Deputy contact information
5. **Executive Law Clerk** - Law clerk contact information
6. **Judicial Assistant** - Assistant contact information
7. **Law Clerks & Additional Staff** - Names of law clerks

This organization makes it easy to find and update specific staff information!




