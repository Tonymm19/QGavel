#!/bin/bash
# QGavel EC2 Setup Script
# This script runs automatically when the EC2 instance first starts

# Log everything
exec > >(tee /var/log/user-data.log) 2>&1
echo "=== Starting QGavel EC2 Setup ==="
date

# Update system
echo "Updating system packages..."
dnf update -y

# Install Docker
echo "Installing Docker..."
dnf install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose
echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
echo "Installing Nginx..."
dnf install -y nginx
systemctl start nginx
systemctl enable nginx

# Install Certbot for SSL
echo "Installing Certbot..."
dnf install -y certbot python3-certbot-nginx

# Install Git
echo "Installing Git..."
dnf install -y git

# Create app directory
echo "Creating app directory..."
mkdir -p /home/ec2-user/qgavel
chown ec2-user:ec2-user /home/ec2-user/qgavel

# Create a placeholder nginx config (will be updated after SSL setup)
cat > /etc/nginx/conf.d/qgavel.conf << 'NGINX_CONF'
server {
    listen 80;
    server_name qgavel.com www.qgavel.com;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
    
    # Health check endpoint
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGINX_CONF

# Create a welcome page
cat > /usr/share/nginx/html/index.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>QGavel - Coming Soon</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
        }
        .container { 
            text-align: center; 
            padding: 40px;
        }
        h1 { 
            font-size: 3em; 
            margin-bottom: 10px;
        }
        p { 
            font-size: 1.2em; 
            opacity: 0.8;
        }
        .status {
            margin-top: 30px;
            padding: 15px 30px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>⚖️ QGavel</h1>
        <p>Court Deadline Management System</p>
        <div class="status">
            ✅ Server is running<br>
            🔧 Application deployment in progress...
        </div>
    </div>
</body>
</html>
HTML

# Restart Nginx with new config
systemctl restart nginx

# Create deployment script for later use
cat > /home/ec2-user/deploy.sh << 'DEPLOY'
#!/bin/bash
# QGavel Deployment Script
cd /home/ec2-user/qgavel
docker-compose pull
docker-compose up -d
echo "Deployment complete!"
DEPLOY
chmod +x /home/ec2-user/deploy.sh
chown ec2-user:ec2-user /home/ec2-user/deploy.sh

echo "=== QGavel EC2 Setup Complete ==="
date
echo "Server is ready for application deployment!"

