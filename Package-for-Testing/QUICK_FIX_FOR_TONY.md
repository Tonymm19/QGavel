# Quick Fix Guide for Tony

Hey Tony! If you're seeing these issues, here's how to fix them:

## Issue 1: No Data Showing ❌

### What You See:
- Empty lists everywhere
- No judges, cases, deadlines

### The Fix:
Open Command Prompt **as Administrator** in your Precedentum folder and run:

```bash
# Activate virtual environment
.venv\Scripts\activate

# Load the sample data
python load_sample_data.py
```

**That's it!** Refresh your browser and you should see 8 judges with all their chamber staff.

---

## Issue 2: Can't Create Cases - "Method POST Not Allowed" ❌

### What You See:
- Click "New Case"
- Fill out form
- Error: "Method 'POST' not allowed"

### The Fix:
This is already fixed in the code! Just restart your backend server:

1. Go to the terminal where the backend is running
2. Press `Ctrl+C` to stop it
3. Run it again:
```bash
python manage.py runserver
```

**Done!** Try creating a case again - it should work now.

---

## Issue 3: Can't Log In ❌

### What You See:
- Try to login with tony@ignitia-ai.com
- Get "Invalid credentials" error

### The Fix:
You need to create your user account first:

1. **Go to Django Admin:**
   ```
   http://localhost:8000/admin/
   ```

2. **Log in** with the superuser you created during setup

3. **Add yourself as a user:**
   - Click "Users" in left sidebar
   - Click "Add User" (top right)
   - Fill in:
     - Email: `tony@ignitia-ai.com`
     - First Name: `Tony`
     - Last Name: Your last name
     - Password: `admin123`
     - Confirm Password: `admin123`
     - Organization: Create one if needed (e.g., "Ignitia AI")
     - Role: Select "Super Admin"
     - Check "Is Active" ✓
   - Click "Save"

4. **Now log in to the frontend:**
   ```
   http://localhost:5173
   ```
   - Email: tony@ignitia-ai.com
   - Password: admin123

---

## All-in-One Fix Script

If you want to fix everything at once, run these commands in order:

```bash
# 1. Activate virtual environment
.venv\Scripts\activate

# 2. Make sure database is up to date
python manage.py migrate

# 3. Load sample data
python load_sample_data.py

# 4. Restart backend server
# (press Ctrl+C in the backend terminal first, then run:)
python manage.py runserver
```

---

## Still Having Issues?

Check the full **TROUBLESHOOTING.md** file for more detailed solutions.

Or email: piyush@ignitia-ai.com with:
- Screenshot of the error
- What you were trying to do
- Your operating system (Windows/Mac)

---

## What You Should See When It's Working ✅

- **Dashboard**: Shows statistics (even if zeros at first)
- **Judge Profiles**: 8 judges listed with chamber staff
- **Cases**: Empty list initially, but you can click "New Case" and create one
- **Deadlines**: Empty initially
- **Rules Search**: Search functionality works

---

**You're almost there! These fixes should get you up and running.** 🚀

If you have any questions, don't hesitate to reach out!

- Piyush




