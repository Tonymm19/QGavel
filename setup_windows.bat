@echo off
REM Precedentum Application - Windows Setup Script
REM This script automates the installation and setup process

echo ==========================================
echo Precedentum Application Setup for Windows
echo ==========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script requires administrator privileges
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo Step 1: Checking prerequisites...
echo.

REM Check for Python
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Python not found. Please install Python 3.11 or later from:
    echo https://www.python.org/downloads/
    echo.
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
) else (
    echo [OK] Python is installed
    python --version
)

REM Check for Node.js
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Node.js not found. Please install Node.js 18+ from:
    echo https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [OK] Node.js is installed
    node --version
)

REM Check for PostgreSQL
psql --version >nul 2>&1
if %errorLevel% neq 0 (
    echo PostgreSQL not found. Please install PostgreSQL 14+ from:
    echo https://www.postgresql.org/download/windows/
    echo.
    echo After installation, restart this script
    pause
    exit /b 1
) else (
    echo [OK] PostgreSQL is installed
    psql --version
)

echo.
echo Step 2: Setting up Python virtual environment...
echo.

REM Create virtual environment if it doesn't exist
if not exist ".venv" (
    python -m venv .venv
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)

REM Activate virtual environment
call .venv\Scripts\activate.bat
echo [OK] Virtual environment activated

echo.
echo Step 3: Installing Python dependencies...
echo.

python -m pip install --upgrade pip
pip install -r requirements.txt
if %errorLevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo [OK] Python dependencies installed

echo.
echo Step 4: Setting up database...
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    copy env.example .env
    echo [OK] Environment file created
) else (
    echo [OK] Environment file already exists
)

REM Create database (may fail if already exists, that's okay)
createdb precedentum_poc 2>nul
if %errorLevel% neq 0 (
    echo Note: Database may already exist, continuing...
)

REM Run migrations
python manage.py migrate
if %errorLevel% neq 0 (
    echo ERROR: Database migration failed
    echo Please ensure PostgreSQL is running and accessible
    pause
    exit /b 1
)
echo [OK] Database migrations completed

echo.
echo Step 5: Loading sample data...
echo.

python manage.py seed_ilnd_data
if %errorLevel% neq 0 (
    echo Warning: Sample data may have already been loaded
)
echo [OK] Sample data loaded

echo.
echo Step 6: Installing frontend dependencies...
echo.

cd frontend
call npm install
if %errorLevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
cd ..

echo.
echo ==========================================
echo Setup Complete! 
echo ==========================================
echo.
echo Your application is ready to run!
echo.
echo To start the servers, run:
echo   start_servers.bat
echo.
echo Or start them manually:
echo   Terminal 1: .venv\Scripts\activate ^&^& python manage.py runserver
echo   Terminal 2: cd frontend ^&^& npm run dev
echo.
echo Login credentials:
echo   Admin: tony@ignitia-ai.com / admin123
echo   Demo: demo.lawyer@example.com / changeme123
echo.
echo Access the application at:
echo   Frontend: http://localhost:5173
echo   Backend: http://localhost:8000
echo   Admin: http://localhost:8000/admin/
echo.
echo For testing instructions, see: TESTING_GUIDE.md
echo.

set /p STARTSERVERS="Would you like to start the servers now? (Y/N): "
if /i "%STARTSERVERS%"=="Y" (
    call start_servers.bat
)

pause




