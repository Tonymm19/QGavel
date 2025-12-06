# 📘 Precedentum - User Setup Guide

**Version:** 1.0  
**Date:** November 17, 2025  
**For:** User Testing & Feedback

---

## 🎯 **WHAT IS PRECEDENTUM?**

Precedentum is a deadline management system for legal professionals that helps you:
- ✅ Track court deadlines automatically
- 📋 Manage federal rules and judge-specific procedures
- 👨‍⚖️ Access judge profiles and contact information
- ⏰ Set automated reminders for critical dates
- 📊 Visualize deadline priorities and urgency

---

## 💻 **SYSTEM REQUIREMENTS**

### **Minimum Requirements:**
- **Operating System:** Windows 10/11, macOS 11+, or Linux
- **RAM:** 4GB (8GB recommended)
- **Disk Space:** 2GB free
- **Browser:** Chrome, Firefox, Safari, or Edge (latest version)
- **Internet:** Required for initial setup only

---

## 📦 **INSTALLATION STEPS**

### **Step 1: Prerequisites**

You need to install these tools first:

#### **A. Python 3.11 or higher**

**Mac:**
```bash
# Check if Python is installed
python3 --version

# If not installed, download from: https://www.python.org/downloads/
# Or install via Homebrew:
brew install python@3.11
```

**Windows:**
```bash
# Download Python from: https://www.python.org/downloads/
# Make sure to check "Add Python to PATH" during installation
```

#### **B. Node.js 18+ and npm**

**Mac:**
```bash
# Check if Node is installed
node --version

# If not installed:
brew install node
```

**Windows:**
```bash
# Download Node.js from: https://nodejs.org/
# Choose the LTS (Long Term Support) version
```

#### **C. PostgreSQL 14+**

**Mac:**
```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL
brew services start postgresql@16
```

**Windows:**
```bash
# Download PostgreSQL from: https://www.postgresql.org/download/windows/
# Use default settings during installation
```

---

### **Step 2: Extract the Application**

1. Extract the `Precedentum.zip` file to a location on your computer
2. Open Terminal (Mac) or Command Prompt (Windows)
3. Navigate to the extracted folder:

```bash
cd path/to/Precedentum-1
```

---

### **Step 3: Database Setup**

1. **Create the database:**

```bash
# Mac/Linux:
createdb precedentum_db

# Windows (in psql):
CREATE DATABASE precedentum_db;
```

2. **Update database settings:**

Open `.env` file and update if needed:
```
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/precedentum_db
```

---

### **Step 4: Backend Setup**

```bash
# 1. Create a Python virtual environment
python3 -m venv .venv

# 2. Activate the virtual environment
# Mac/Linux:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Run database migrations
python manage.py migrate

# 5. Load demo data
python manage.py seed_user_demo_data
```

**Expected output:**
```
✓ Created 3 users
✓ Created 2 courts
✓ Created 4 judges
✓ Created 8 Judge Procedures
✓ Created 8 Rules
✓ Created 4 Cases
✓ Created 16 Deadlines
```

---

### **Step 5: Frontend Setup**

Open a **NEW** terminal window and:

```bash
# 1. Navigate to frontend folder
cd path/to/Precedentum-1/frontend

# 2. Install dependencies
npm install

# 3. Build the frontend (optional, for faster loading)
npm run build
```

---

## 🚀 **RUNNING THE APPLICATION**

You need **TWO terminal windows** running simultaneously:

### **Terminal 1: Backend Server**

```bash
cd path/to/Precedentum-1
source .venv/bin/activate  # Mac/Linux
# or .venv\Scripts\activate  # Windows

python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### **Terminal 2: Frontend Server**

```bash
cd path/to/Precedentum-1/frontend
npm run dev
```

**Expected output:**
```
VITE ready in XXXms
Local: http://localhost:5173/
```

---

## 🔐 **LOGGING IN**

1. Open your browser and go to: **http://localhost:5173**

2. Use one of these test accounts:

| Email | Password | Role | Name |
|-------|----------|------|------|
| demo.lawyer@example.com | changeme123 | Lawyer | Sarah Chen |
| john.mitchell@example.com | changeme123 | Lawyer | John Mitchell |
| maria.santos@example.com | changeme123 | Paralegal | Maria Santos |

---

## 📊 **WHAT'S INCLUDED IN THE DEMO**

The demo database includes:

### **Cases (4)**
1. TechCorp Inc. v. DataSystems LLC (IP - Discovery)
2. Global Manufacturing Co. v. Precision Parts Inc. (Commercial - Pleadings)
3. Wilson v. MegaCorp Industries (Employment - Motion Practice)
4. Smith Enterprises v. Johnson & Associates (Contract - Discovery)

### **Judges (4)**
- Hon. Rebecca R. Pallmeyer (N.D. Ill.)
- Hon. John F. Kness (N.D. Ill.)
- Hon. Virginia A. Phillips (C.D. Cal.)
- Hon. Gary Klausner (C.D. Cal.)

### **Rules & Procedures (16 total)**
- 8 Judge-specific procedures
- 8 Court rules (FRCP, Local Rules, etc.)

### **Deadlines (16)**
- Various priorities (High/Medium/Low)
- Different types (Rule-based, Court Orders)
- Spread across all 4 cases

---

## 🎨 **APPLICATION FEATURES TO TEST**

### **1. Dashboard** (Home page)
- View summary statistics
- See upcoming deadlines
- Quick access to create new deadlines

### **2. Deadline Tracker**
- Filter deadlines by status, priority, case, owner
- Mark deadlines as complete
- Edit deadline details
- Schedule reminders
- View audit history

### **3. Judge Profiles**
- View judge contact information
- See courtroom assignments
- Access chambers procedures

### **4. Rules & Research**
- Search federal and local rules
- Filter by jurisdiction and source
- View judge-specific procedures

---

## 🐛 **TROUBLESHOOTING**

### **Problem: Database connection error**
**Solution:**
```bash
# Make sure PostgreSQL is running
# Mac:
brew services list
brew services start postgresql@16

# Windows: Check Windows Services for PostgreSQL
```

### **Problem: Frontend won't load**
**Solution:**
```bash
# Make sure both backend AND frontend are running
# Check terminal outputs for errors
# Try hard refresh in browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### **Problem: "Module not found" errors**
**Solution:**
```bash
# Backend:
source .venv/bin/activate
pip install -r requirements.txt

# Frontend:
cd frontend
npm install
```

### **Problem: Port already in use**
**Solution:**
```bash
# Backend (if 8000 is in use):
python manage.py runserver 8001

# Frontend (if 5173 is in use):
npm run dev -- --port 5174
```

---

## 📝 **PROVIDING FEEDBACK**

### **What We Need From You:**

1. **UI/UX Feedback**
   - Is the interface intuitive?
   - Are colors and styling appealing?
   - Is navigation clear?

2. **Feature Feedback**
   - Which features are most useful?
   - What's missing that you need?
   - Any features that seem confusing?

3. **Data & Workflow**
   - Does the deadline tracking make sense?
   - Is the judge information helpful?
   - Are the rules searchable enough?

4. **Bugs & Issues**
   - Any errors you encounter
   - Features that don't work as expected
   - Performance issues

### **How to Provide Feedback:**

Please document:
- **What you did:** Step-by-step actions
- **What happened:** Actual result
- **What you expected:** Desired result
- **Screenshots:** If applicable
- **Your role:** Which test account you used

---

## 🛑 **STOPPING THE APPLICATION**

1. **Stop Frontend:** In Terminal 2, press `Ctrl+C`
2. **Stop Backend:** In Terminal 1, press `Ctrl+C`
3. **Stop PostgreSQL (if needed):**
   ```bash
   # Mac:
   brew services stop postgresql@16
   ```

---

## 📞 **SUPPORT**

If you encounter issues during setup:

1. Check the **Troubleshooting** section above
2. Verify all prerequisites are installed correctly
3. Make sure both terminal windows are running
4. Try restarting both servers

---

## 📚 **ADDITIONAL RESOURCES**

- **Django Documentation:** https://docs.djangoproject.com/
- **React Documentation:** https://react.dev/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/

---

## ✅ **QUICK START CHECKLIST**

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Application extracted
- [ ] Database created
- [ ] `.env` file configured
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Database migrated (`python manage.py migrate`)
- [ ] Demo data loaded (`python manage.py seed_user_demo_data`)
- [ ] Backend server running (Terminal 1)
- [ ] Frontend server running (Terminal 2)
- [ ] Logged in successfully
- [ ] Explored all features

---

## 🎉 **YOU'RE READY!**

Once you see the beautiful login screen and can log in successfully, you're all set to explore and provide feedback!

**Thank you for testing Precedentum!** 🙏

Your feedback is invaluable in making this tool better for legal professionals.

---

**Version:** 1.0  
**Last Updated:** November 17, 2025  
**Contact:** [Your contact information here]



