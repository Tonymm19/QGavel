#!/bin/bash

# Precedentum - Start Servers Script for macOS/Linux

echo "Starting Precedentum Application..."
echo ""

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Error: Virtual environment not found"
    echo "Please run setup_mac.sh first"
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Error: Frontend dependencies not installed"
    echo "Please run: cd frontend && npm install"
    exit 1
fi

echo "✓ Starting Django backend server on http://localhost:8000"
echo "✓ Starting React frontend server on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

# Start backend in background
source .venv/bin/activate
python manage.py runserver > /tmp/precedentum_backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Start frontend in background
cd frontend
npm run dev > /tmp/precedentum_frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

# Save PIDs to file for stop script
echo $BACKEND_PID > /tmp/precedentum_backend.pid
echo $FRONTEND_PID > /tmp/precedentum_frontend.pid

echo ""
echo "Servers are starting..."
echo "Waiting for servers to be ready..."
sleep 5

echo ""
echo "=========================================="
echo "Servers Started Successfully! 🎉"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"
echo "Admin: http://localhost:8000/admin/"
echo ""
echo "Login:"
echo "  tony@ignitia-ai.com / admin123"
echo "  demo.lawyer@example.com / changeme123"
echo ""
echo "Logs:"
echo "  Backend: /tmp/precedentum_backend.log"
echo "  Frontend: /tmp/precedentum_frontend.log"
echo ""
echo "To stop servers: ./stop_servers.sh"
echo ""

# Open browser (optional)
if command -v open &> /dev/null; then
    sleep 3
    open http://localhost:5173
fi

# Keep script running
echo "Press Ctrl+C to stop servers and exit"
trap "echo ''; echo 'Stopping servers...'; ./stop_servers.sh; exit" INT TERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID



