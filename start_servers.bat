@echo off
REM Precedentum - Start Servers Script for Windows

echo Starting Precedentum Application...
echo.

REM Check if virtual environment exists
if not exist ".venv" (
    echo Error: Virtual environment not found
    echo Please run setup_windows.bat first
    pause
    exit /b 1
)

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo Error: Frontend dependencies not installed
    echo Please run: cd frontend ^&^& npm install
    pause
    exit /b 1
)

echo [OK] Starting Django backend server on http://localhost:8000
echo [OK] Starting React frontend server on http://localhost:5173
echo.

REM Start backend in new window
start "Precedentum Backend" cmd /k "call .venv\Scripts\activate.bat && python manage.py runserver"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "Precedentum Frontend" cmd /k "cd frontend && npm run dev"

REM Wait for servers to start
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo Servers Started Successfully!
echo ==========================================
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo Admin: http://localhost:8000/admin/
echo.
echo Login:
echo   tony@ignitia-ai.com / admin123
echo   demo.lawyer@example.com / changeme123
echo.
echo Two terminal windows have been opened for the servers.
echo Close those windows to stop the servers.
echo.
echo To stop servers: run stop_servers.bat
echo.

REM Open browser
timeout /t 3 /nobreak >nul
start http://localhost:5173

pause




