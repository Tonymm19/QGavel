#!/bin/bash

# Precedentum Application - macOS Setup Script
# This script automates the installation and setup process

set -e  # Exit on error

echo "=========================================="
echo "Precedentum Application Setup for macOS"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}Error: This script is for macOS only${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"
echo ""

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}Homebrew not found. Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo -e "${GREEN}✓ Homebrew is installed${NC}"
fi

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Python 3 not found. Installing Python 3...${NC}"
    brew install python@3.11
else
    echo -e "${GREEN}✓ Python 3 is installed${NC}"
    python3 --version
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing Node.js...${NC}"
    brew install node
else
    echo -e "${GREEN}✓ Node.js is installed${NC}"
    node --version
fi

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL not found. Installing PostgreSQL...${NC}"
    brew install postgresql@14
    brew services start postgresql@14
    echo "Waiting for PostgreSQL to start..."
    sleep 5
else
    echo -e "${GREEN}✓ PostgreSQL is installed${NC}"
    # Ensure PostgreSQL is running
    brew services start postgresql@14 2>/dev/null || true
fi

echo ""
echo -e "${YELLOW}Step 2: Setting up Python virtual environment...${NC}"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
source .venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"

echo ""
echo -e "${YELLOW}Step 3: Installing Python dependencies...${NC}"
echo ""

pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

echo ""
echo -e "${YELLOW}Step 4: Setting up database...${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cp env.example .env
    echo -e "${GREEN}✓ Environment file created${NC}"
else
    echo -e "${GREEN}✓ Environment file already exists${NC}"
fi

# Create database
createdb precedentum_poc 2>/dev/null || echo "Database already exists or user doesn't have permission"

# Run migrations
python manage.py migrate
echo -e "${GREEN}✓ Database migrations completed${NC}"

echo ""
echo -e "${YELLOW}Step 5: Loading sample data...${NC}"
echo ""

# Load sample data
python manage.py seed_ilnd_data
echo -e "${GREEN}✓ Sample data loaded${NC}"

echo ""
echo -e "${YELLOW}Step 6: Installing frontend dependencies...${NC}"
echo ""

cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

cd ..

echo ""
echo -e "${GREEN}=========================================="
echo "Setup Complete! 🎉"
echo "==========================================${NC}"
echo ""
echo "Your application is ready to run!"
echo ""
echo "To start the servers, run:"
echo "  ./start_servers.sh"
echo ""
echo "Or start them manually:"
echo "  Terminal 1: source .venv/bin/activate && python manage.py runserver"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Login credentials:"
echo "  Admin: tony@ignitia-ai.com / admin123"
echo "  Demo: demo.lawyer@example.com / changeme123"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend: http://localhost:8000"
echo "  Admin: http://localhost:8000/admin/"
echo ""
echo "For testing instructions, see: TESTING_GUIDE.md"
echo ""

read -p "Would you like to start the servers now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./start_servers.sh
fi

