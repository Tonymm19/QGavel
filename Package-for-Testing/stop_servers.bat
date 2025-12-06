@echo off
REM Precedentum - Stop Servers Script for Windows

echo Stopping Precedentum Application servers...
echo.

REM Kill processes on port 8000 (backend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    if %errorLevel% == 0 (
        echo [OK] Backend server stopped
    )
)

REM Kill processes on port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
    if %errorLevel% == 0 (
        echo [OK] Frontend server stopped
    )
)

echo.
echo All servers stopped.
echo.
pause

