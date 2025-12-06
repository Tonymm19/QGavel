#!/bin/bash

# Precedentum - Stop Servers Script for macOS/Linux

echo "Stopping Precedentum Application servers..."
echo ""

# Kill backend
if [ -f "/tmp/precedentum_backend.pid" ]; then
    BACKEND_PID=$(cat /tmp/precedentum_backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null
        echo "✓ Backend server stopped (PID: $BACKEND_PID)"
    else
        echo "Backend server not running"
    fi
    rm /tmp/precedentum_backend.pid
else
    # Try to find and kill by port
    BACKEND_PID=$(lsof -ti:8000)
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✓ Backend server stopped (found on port 8000)"
    fi
fi

# Kill frontend
if [ -f "/tmp/precedentum_frontend.pid" ]; then
    FRONTEND_PID=$(cat /tmp/precedentum_frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✓ Frontend server stopped (PID: $FRONTEND_PID)"
    else
        echo "Frontend server not running"
    fi
    rm /tmp/precedentum_frontend.pid
else
    # Try to find and kill by port
    FRONTEND_PID=$(lsof -ti:5173)
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✓ Frontend server stopped (found on port 5173)"
    fi
fi

echo ""
echo "All servers stopped."




