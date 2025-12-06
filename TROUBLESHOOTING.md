# Troubleshooting Guide for Precedentum Testing

## Problem 1: No Data Showing (Empty Screens)

### **Symptoms:**
- Application loads but shows empty lists
- No judges, cases, or deadlines visible
- Everything looks blank

### **Solution:**
Run the data loading script:

```bash
# Make sure you're in the project folder
cd path/to/Precedentum-1

# Windows users - activate virtual environment first:
.venv\Scripts\activate

# Mac/Linux users:
source .venv/bin/activate

# Then run the data loader:
python load_sample_data.py
```

This will load:
- 8 Illinois Northern District judges
- Chamber staff information
- Sample court rules
- Sample procedures

---

## Problem 2: Can't Create Cases - "Method POST Not Allowed"

### **Symptoms:**
- Click "New Case" button
- Fill out the form
- Get error: "Method 'POST' not allowed"

### **Solution:**
This has been fixed! Make sure you have the latest version of the code.

If you still see this error:
1. Stop the server (Ctrl+C in the terminal)
2. Restart the backend server:
   ```bash
   python manage.py runserver
   ```

---

## Problem 3: Can't Log In - User Not Found

### **Symptoms:**
- Try to log in with tony@ignitia-ai.com or bruce@ignitia-ai.com
- Get "Invalid credentials" error

### **Solution:**
You need to create your user account in Django Admin:

**Step 1:** Go to Django Admin panel:
```
http://localhost:8000/admin/
```

**Step 2:** Log in with the superuser credentials you created during setup

**Step 3:** Click on "Users" in the left sidebar

**Step 4:** Click "Add User" button (top right)

**Step 5:** Fill in the form:
- **Email**: tony@ignitia-ai.com (or your email)
- **First Name**: Tony
- **Last Name**: [Your Last Name]
- **Password**: admin123
- **Confirm Password**: admin123
- **Organization**: Create one or select existing
- **Role**: Select "Super Admin" for full access
- **Is Active**: Check this box ✓

**Step 6:** Click "Save"

**Step 7:** Now go back to the frontend and log in:
```
http://localhost:5173
```

---

## Problem 4: Database Connection Errors

### **Symptoms:**
- Error messages about "database connection failed"
- "could not connect to server"

### **Solution:**

**Make sure PostgreSQL is running:**

Windows:
```bash
# Check if PostgreSQL is running
sc query postgresql-x64-14

# If not running, start it:
net start postgresql-x64-14
```

Mac:
```bash
# Check if PostgreSQL is running:
pg_isready

# If not running, start it:
brew services start postgresql@14
```

**Check database exists:**
```bash
# Try to connect to the database:
psql -U postgres -d precedentum_poc

# If database doesn't exist, create it:
createdb precedentum_poc
```

---

## Problem 5: Port Already in Use

### **Symptoms:**
- "Port 8000 is already in use"
- "Port 5173 is already in use"

### **Solution:**

**Find and stop the process using the port:**

Windows:
```bash
# Find what's using port 8000:
netstat -ano | findstr :8000

# Kill the process (replace PID with the number from above):
taskkill /PID <PID> /F

# Same for port 5173:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

Mac/Linux:
```bash
# Find and kill process on port 8000:
lsof -ti:8000 | xargs kill -9

# Same for port 5173:
lsof -ti:5173 | xargs kill -9
```

---

## Problem 6: Frontend Won't Load - White Screen

### **Symptoms:**
- Browser shows white/blank screen
- Developer console shows errors

### **Solution:**

**Step 1:** Make sure backend is running:
```bash
# Should see something like:
# Starting development server at http://127.0.0.1:8000/
```

**Step 2:** Make sure frontend is running:
```bash
cd frontend
npm run dev

# Should see:
# VITE ready in XXX ms
# Local: http://localhost:5173
```

**Step 3:** Clear browser cache:
- Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- Select "Cached images and files"
- Clear and reload

**Step 4:** Check browser console for errors:
- Press F12 to open Developer Tools
- Look for red error messages
- Common issue: CORS errors → backend not running

---

## Problem 7: "Module Not Found" Errors

### **Symptoms:**
- `ModuleNotFoundError: No module named 'django'`
- Other import errors

### **Solution:**

**Make sure virtual environment is activated:**

Windows:
```bash
.venv\Scripts\activate

# You should see (.venv) before your prompt
```

Mac/Linux:
```bash
source .venv/bin/activate

# You should see (.venv) before your prompt
```

**Reinstall dependencies:**
```bash
pip install -r requirements.txt
```

---

## Problem 8: Migrations Not Applied

### **Symptoms:**
- `django.db.utils.ProgrammingError: relation does not exist`
- Database table errors

### **Solution:**

```bash
# Run migrations:
python manage.py migrate

# If that fails, try:
python manage.py makemigrations
python manage.py migrate
```

---

## Quick Health Check

Run these commands to verify everything is working:

```bash
# 1. Check Python version (should be 3.11+):
python --version

# 2. Check Node version (should be 18+):
node --version

# 3. Check PostgreSQL is running:
pg_isready
# or on Windows:
sc query postgresql-x64-14

# 4. Check if virtual environment is active:
# (should see .venv in your prompt)

# 5. Check if database exists:
python manage.py dbshell
# Type \q to exit if it connects successfully

# 6. Test the backend server:
curl http://localhost:8000/api/v1/judges/
# Should return JSON data (if data is loaded)
```

---

## Still Having Issues?

### **Get More Information:**

1. **Check backend logs:**
   - Look at the terminal where you ran `python manage.py runserver`
   - Copy any error messages

2. **Check frontend logs:**
   - Press F12 in your browser
   - Go to "Console" tab
   - Look for red errors
   - Copy the error messages

3. **Check database connection:**
   ```bash
   python manage.py dbshell
   ```
   If this works, database is fine.

4. **Contact Support:**
   - Email: piyush@ignitia-ai.com
   - Include:
     - Operating System (Windows/Mac/Linux)
     - Error messages (copy from terminals/console)
     - What step you're stuck on
     - Screenshots if possible

---

## Common Setup Mistakes

❌ **NOT running as Administrator** (Windows)
   - Right-click → "Run as administrator"

❌ **NOT in the virtual environment**
   - You should see `(.venv)` in your command prompt

❌ **Running from wrong directory**
   - Make sure you're in the main project folder
   - Should see `manage.py` when you run `ls` or `dir`

❌ **PostgreSQL not running**
   - Start the PostgreSQL service

❌ **Not running migrations before loading data**
   - Always run `python manage.py migrate` first

❌ **Ports blocked by firewall**
   - Allow ports 8000 and 5173 in your firewall

---

## Success Checklist

When everything is working, you should have:

✅ PostgreSQL service running
✅ Virtual environment activated `(.venv)` showing
✅ Database created and migrated
✅ Backend server running on http://localhost:8000
✅ Frontend server running on http://localhost:5173
✅ Sample data loaded (8 judges visible)
✅ User account created (can log in)
✅ No errors in browser console

---

**Need help? Don't hesitate to reach out!**

Email: piyush@ignitia-ai.com




