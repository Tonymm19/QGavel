#!/bin/bash
# =============================================================================
# QGavel EC2 Deployment Script
# =============================================================================
# This script deploys QGavel to an EC2 instance
# Run this from your local machine after EC2 is created
#
# Usage: ./deploy-to-ec2.sh <EC2_PUBLIC_IP>
# Example: ./deploy-to-ec2.sh 54.123.45.67
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if IP address is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide the EC2 public IP address${NC}"
    echo "Usage: ./deploy-to-ec2.sh <EC2_PUBLIC_IP>"
    exit 1
fi

EC2_IP=$1
EC2_USER="ec2-user"
KEY_FILE="$(dirname "$0")/qgavel-key.pem"
PROJECT_DIR="$(dirname "$0")/.."

echo -e "${GREEN}=== QGavel Deployment Script ===${NC}"
echo "EC2 IP: $EC2_IP"
echo "Key File: $KEY_FILE"
echo ""

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo -e "${RED}Error: SSH key file not found: $KEY_FILE${NC}"
    exit 1
fi

# Step 1: Test SSH connection
echo -e "${YELLOW}Step 1: Testing SSH connection...${NC}"
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 $EC2_USER@$EC2_IP "echo 'SSH connection successful!'" || {
    echo -e "${RED}Failed to connect to EC2. Make sure:${NC}"
    echo "  1. The instance is running"
    echo "  2. Security group allows SSH from your IP"
    echo "  3. The key file is correct"
    exit 1
}

# Step 2: Create project directory on EC2
echo -e "${YELLOW}Step 2: Creating project directory...${NC}"
ssh -i "$KEY_FILE" $EC2_USER@$EC2_IP "mkdir -p ~/qgavel"

# Step 3: Copy project files to EC2
echo -e "${YELLOW}Step 3: Copying project files to EC2...${NC}"
echo "This may take a few minutes..."

# Create a temporary directory with only needed files
TEMP_DIR=$(mktemp -d)
echo "Creating deployment package..."

# Copy essential files
cp -r "$PROJECT_DIR/config" "$TEMP_DIR/"
cp -r "$PROJECT_DIR/court_rules" "$TEMP_DIR/"
cp -r "$PROJECT_DIR/frontend" "$TEMP_DIR/"
cp -r "$PROJECT_DIR/docker" "$TEMP_DIR/"
cp -r "$PROJECT_DIR/templates" "$TEMP_DIR/" 2>/dev/null || true
cp -r "$PROJECT_DIR/static" "$TEMP_DIR/" 2>/dev/null || true
cp "$PROJECT_DIR/Dockerfile" "$TEMP_DIR/"
cp "$PROJECT_DIR/docker-compose.prod.yml" "$TEMP_DIR/"
cp "$PROJECT_DIR/requirements.txt" "$TEMP_DIR/"
cp "$PROJECT_DIR/manage.py" "$TEMP_DIR/"

# Copy production environment file
cp "$(dirname "$0")/.env.production" "$TEMP_DIR/.env"

# Remove unnecessary files
rm -rf "$TEMP_DIR/frontend/node_modules" 2>/dev/null || true
rm -rf "$TEMP_DIR/*/__pycache__" 2>/dev/null || true
find "$TEMP_DIR" -name "*.pyc" -delete 2>/dev/null || true

# Sync files to EC2
rsync -avz --progress -e "ssh -i $KEY_FILE" "$TEMP_DIR/" $EC2_USER@$EC2_IP:~/qgavel/

# Cleanup temp directory
rm -rf "$TEMP_DIR"

# Step 4: Copy Nginx configuration
echo -e "${YELLOW}Step 4: Copying Nginx configuration...${NC}"
scp -i "$KEY_FILE" "$(dirname "$0")/nginx-qgavel.conf" $EC2_USER@$EC2_IP:~/nginx-qgavel.conf

# Step 5: Run deployment on EC2
echo -e "${YELLOW}Step 5: Running deployment on EC2...${NC}"
ssh -i "$KEY_FILE" $EC2_USER@$EC2_IP << 'REMOTE_SCRIPT'
#!/bin/bash
set -e

echo "=== Starting deployment on EC2 ==="

# Navigate to project directory
cd ~/qgavel

# Rename docker-compose file
mv docker-compose.prod.yml docker-compose.yml 2>/dev/null || true

# Build and start containers
echo "Building Docker images..."
sudo docker-compose build

echo "Starting containers..."
sudo docker-compose up -d

# Wait for containers to be healthy
echo "Waiting for containers to start..."
sleep 10

# Check container status
echo "Container status:"
sudo docker-compose ps

# Copy Nginx config
echo "Configuring Nginx..."
sudo cp ~/nginx-qgavel.conf /etc/nginx/conf.d/qgavel.conf

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

echo "=== Deployment complete! ==="
REMOTE_SCRIPT

# Step 6: Set up SSL with Let's Encrypt
echo -e "${YELLOW}Step 6: Setting up SSL certificate...${NC}"
echo "You need to run this command on the EC2 server:"
echo ""
echo -e "${GREEN}ssh -i $KEY_FILE $EC2_USER@$EC2_IP${NC}"
echo -e "${GREEN}sudo certbot --nginx -d qgavel.com -d www.qgavel.com${NC}"
echo ""

# Final status
echo -e "${GREEN}=== Deployment Summary ===${NC}"
echo "✅ Project files copied"
echo "✅ Docker containers built and running"
echo "✅ Nginx configured"
echo ""
echo "Next steps:"
echo "1. Point qgavel.com DNS to: $EC2_IP"
echo "2. Wait for DNS propagation (5-30 minutes)"
echo "3. Run SSL setup: sudo certbot --nginx -d qgavel.com -d www.qgavel.com"
echo "4. Test: https://qgavel.com"
echo ""
echo -e "${GREEN}QGavel is almost live! 🚀${NC}"

