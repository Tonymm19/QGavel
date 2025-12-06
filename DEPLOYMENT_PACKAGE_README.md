# Precedentum Application - Testing Package

## Welcome Tony and Bruce! 👋

This package contains the complete Precedentum application for testing on your local machines.

---

## What's Inside

This is a **Django (Backend) + React (Frontend)** application for federal court compliance and deadline tracking.

**Key Features:**
- Judge profiles and chamber staff information
- Case management
- Deadline tracking
- Court rules and procedures
- User management

---

## System Requirements

### Minimum Requirements:
- **OS**: macOS 10.15+ or Windows 10+
- **RAM**: 8 GB minimum
- **Storage**: 2 GB free space
- **Internet**: Required for initial setup

### Software Prerequisites:
- **Python 3.11+** (will be installed if missing)
- **Node.js 18+** (will be installed if missing)
- **PostgreSQL 14+** (will be installed if missing)
- **Git** (optional, for version control)

---

## Quick Start Options

Choose the installation method that works best for you:

### Option 1: Automated Setup (Recommended) ⚡
Run the automated setup script that handles everything:
- **macOS**: Run `setup_mac.sh`
- **Windows**: Run `setup_windows.bat`

### Option 2: Manual Setup 🛠️
Follow the step-by-step manual installation guide:
- See `MANUAL_SETUP_GUIDE.md`

### Option 3: Docker Setup 🐳 (Advanced)
Use Docker for containerized deployment:
- See `DOCKER_SETUP_GUIDE.md`

---

## Automated Setup Instructions

### For macOS Users:

1. **Extract the package** to your desired location
2. **Open Terminal** and navigate to the package folder:
   ```bash
   cd /path/to/Precedentum-1
   ```
3. **Make the script executable**:
   ```bash
   chmod +x setup_mac.sh
   ```
4. **Run the setup script**:
   ```bash
   ./setup_mac.sh
   ```
5. **Follow the on-screen prompts**

The script will:
- ✅ Check and install Python, Node.js, PostgreSQL
- ✅ Create Python virtual environment
- ✅ Install all dependencies
- ✅ Set up the database
- ✅ Load sample data
- ✅ Start both servers
- ✅ Open the application in your browser

### For Windows Users:

1. **Extract the package** to your desired location
2. **Open Command Prompt or PowerShell** as Administrator
3. **Navigate to the package folder**:
   ```cmd
   cd C:\path\to\Precedentum-1
   ```
4. **Run the setup script**:
   ```cmd
   setup_windows.bat
   ```
5. **Follow the on-screen prompts**

The script will:
- ✅ Check and install Python, Node.js, PostgreSQL
- ✅ Create Python virtual environment
- ✅ Install all dependencies
- ✅ Set up the database
- ✅ Load sample data
- ✅ Start both servers
- ✅ Open the application in your browser

---

## What to Expect After Setup

Once setup is complete, you'll have:

1. **Backend Server** running on: http://localhost:8000
2. **Frontend Application** running on: http://localhost:5173
3. **Django Admin** available at: http://localhost:8000/admin/

The application will automatically open in your default browser.

---

## Test Login Credentials

Use these accounts to test different user roles:

### Super Admin (Full Access):
- **Email**: `tony@ignitia-ai.com`
- **Password**: `admin123`

OR

- **Email**: `bruce@ignitia-ai.com`
- **Password**: `admin123`

### Demo Lawyer Account:
- **Email**: `demo.lawyer@example.com`
- **Password**: `changeme123`

---

## Testing Guide

Please refer to `TESTING_GUIDE.md` for:
- ✅ What features to test
- ✅ Step-by-step testing scenarios
- ✅ Known issues and workarounds
- ✅ How to report bugs
- ✅ Feedback form

---

## Common Issues and Solutions

### Issue: "Port already in use"
**Solution**: Another application is using ports 8000 or 5173
```bash
# macOS/Linux - Find and kill process
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows - Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: "Module not found" or "Package not installed"
**Solution**: Reinstall dependencies
```bash
# Backend
cd /path/to/Precedentum-1
source .venv/bin/activate  # macOS
.venv\Scripts\activate     # Windows
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Issue: "Database connection failed"
**Solution**: Ensure PostgreSQL is running
```bash
# macOS (Homebrew)
brew services start postgresql

# Windows
# Start PostgreSQL service from Services app
```

### Issue: "Cannot connect to server"
**Solution**: Restart the servers
```bash
# Stop servers: Press Ctrl+C in terminal windows
# Then run: ./start_servers.sh (macOS) or start_servers.bat (Windows)
```

---

## Stopping the Application

To stop the servers:

1. Find the terminal windows running the servers
2. Press `Ctrl+C` in each terminal window
3. Or run: `./stop_servers.sh` (macOS) or `stop_servers.bat` (Windows)

---

## Restarting the Application

After stopping, to restart:

**macOS**:
```bash
./start_servers.sh
```

**Windows**:
```cmd
start_servers.bat
```

---

## Getting Help

### Documentation Included:
- `MANUAL_SETUP_GUIDE.md` - Detailed manual installation
- `TESTING_GUIDE.md` - Complete testing scenarios
- `TROUBLESHOOTING.md` - Common issues and solutions
- `API_DOCUMENTATION.md` - API endpoints reference
- `FEEDBACK_TEMPLATE.md` - How to provide feedback

### Contact:
- **Piyush Mittal**: piyush@ignitia-ai.com
- **Project Issues**: Document in `FEEDBACK_TEMPLATE.md`

---

## What We're Testing

### Critical Features:
1. ✅ User authentication and login
2. ✅ Judge profiles display
3. ✅ Case management
4. ✅ Deadline tracking
5. ✅ Court rules browsing
6. ✅ User management (admin)

### Performance Testing:
- Page load times
- Search functionality
- Data filtering
- Large dataset handling

### Compatibility Testing:
- Different browsers (Chrome, Firefox, Safari, Edge)
- Different screen sizes
- Mobile responsiveness

---

## Feedback Required

Please test and provide feedback on:

1. **Installation Experience**
   - Was setup smooth?
   - Any errors encountered?
   - Time taken to complete setup?

2. **User Interface**
   - Is it intuitive?
   - Any confusing elements?
   - Suggestions for improvement?

3. **Functionality**
   - What works well?
   - What breaks or errors out?
   - Missing features?

4. **Performance**
   - Is it fast enough?
   - Any lag or delays?
   - Browser compatibility?

5. **Overall Experience**
   - Would you use this application?
   - What would make it better?
   - Any deal-breakers?

---

## Package Contents

```
Precedentum-1/
├── README.md (this file)
├── TESTING_GUIDE.md
├── MANUAL_SETUP_GUIDE.md
├── TROUBLESHOOTING.md
├── FEEDBACK_TEMPLATE.md
├── setup_mac.sh (automated setup for macOS)
├── setup_windows.bat (automated setup for Windows)
├── start_servers.sh (restart servers macOS)
├── start_servers.bat (restart servers Windows)
├── stop_servers.sh (stop servers macOS)
├── stop_servers.bat (stop servers Windows)
├── requirements.txt (Python dependencies)
├── env.example (environment configuration)
├── manage.py (Django management)
├── config/ (Django settings)
├── court_rules/ (Backend app)
├── frontend/ (React application)
└── docs/ (Additional documentation)
```

---

## Security Note

⚠️ **Important**: This is a development/testing package with default credentials and settings. Do NOT use in production without:
- Changing all default passwords
- Updating security keys
- Configuring proper database security
- Setting up SSL/HTTPS
- Reviewing all security settings

---

## Next Steps After Testing

1. Complete the testing scenarios in `TESTING_GUIDE.md`
2. Fill out `FEEDBACK_TEMPLATE.md`
3. Send feedback to Piyush
4. Optional: Schedule a walkthrough call to discuss findings

---

## Thank You! 🙏

Your testing and feedback are invaluable for making Precedentum better. We appreciate your time and effort!

**Happy Testing!**

---

**Version**: 1.0.0 (Testing Release)
**Date**: November 25, 2025
**Package Prepared By**: Piyush Mittal
**Testers**: Tony Stark & Bruce Wayne




