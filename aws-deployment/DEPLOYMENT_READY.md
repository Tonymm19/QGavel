# 🚀 QGavel Deployment - Ready to Go!

**Last Updated:** December 3, 2025  
**Status:** ✅ All preparation complete - waiting for AWS to unlock EC2

---

## 📋 What's Been Prepared

### ✅ **Docker Configuration**
- `Dockerfile` - Django backend (production-ready with Gunicorn)
- `frontend/Dockerfile` - React frontend (production build with Nginx)
- `docker-compose.prod.yml` - Production compose file
- `docker/entrypoint.sh` - Production entrypoint script

### ✅ **Nginx Configuration**
- `aws-deployment/nginx-qgavel.conf` - Full Nginx config with:
  - HTTP to HTTPS redirect
  - SSL/TLS configuration (Let's Encrypt ready)
  - Reverse proxy to Django (port 8000)
  - Reverse proxy to React (port 3000)
  - Gzip compression
  - Security headers

### ✅ **Environment Files**
- `aws-deployment/.env.production` - Production environment variables
- `frontend/.env.production` - Frontend production config
- All sensitive data (RDS credentials, secrets) configured

### ✅ **Deployment Scripts**
- `aws-deployment/deploy-to-ec2.sh` - One-command deployment script
- `aws-deployment/ec2-user-data.sh` - EC2 bootstrap script

### ✅ **Frontend Fixes**
- All hardcoded `localhost:8000` URLs replaced with centralized API config
- `frontend/src/config/api.ts` - Centralized API endpoint configuration
- Production builds will use relative URLs (`/api/v1`)

### ✅ **SSH Key**
- `aws-deployment/qgavel-key.pem` - SSH key for EC2 access (created)

---

## 🎯 When AWS Unlocks EC2 - Quick Deploy Steps

### **Step 1: Create EC2 Instance (5 minutes)**

```bash
# Run this command (replace AMI ID if needed)
aws ec2 run-instances \
  --image-id ami-0fa3fe0fa7920f68e \
  --instance-type t2.micro \
  --key-name qgavel-key \
  --subnet-id subnet-0495730d1d72094e2 \
  --security-group-ids sg-0c2f12f49c1a95a4e \
  --user-data file://aws-deployment/ec2-user-data.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=qgavel-server}]'
```

### **Step 2: Get EC2 Public IP (1 minute)**

```bash
# Wait for instance to be running, then get IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=qgavel-server" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

### **Step 3: Wait for EC2 Setup (3-5 minutes)**

The user-data script automatically installs:
- Docker
- Docker Compose
- Nginx
- Certbot (for SSL)
- Git

### **Step 4: Deploy Application (10 minutes)**

```bash
# From the project root directory
cd aws-deployment
./deploy-to-ec2.sh <EC2_PUBLIC_IP>
```

### **Step 5: Update DNS (2 minutes)**

In Route 53, update the A record for qgavel.com:
- Type: A
- Value: <EC2_PUBLIC_IP>

### **Step 6: Set Up SSL (5 minutes)**

```bash
# SSH into EC2
ssh -i aws-deployment/qgavel-key.pem ec2-user@<EC2_PUBLIC_IP>

# Run Certbot
sudo certbot --nginx -d qgavel.com -d www.qgavel.com
```

### **Step 7: Test! (5 minutes)**

1. Open https://qgavel.com
2. Login with: admin@qgavel.com / QGavel2024Admin!
3. Test the application

---

## 📁 Files Ready for Deployment

```
aws-deployment/
├── qgavel-key.pem          # SSH key (SECURE - don't commit!)
├── .env.production         # Environment variables (SECURE!)
├── nginx-qgavel.conf       # Nginx configuration
├── deploy-to-ec2.sh        # Deployment script
├── ec2-user-data.sh        # EC2 bootstrap script
├── vpc-info.txt            # Network IDs reference
├── rds-info-SECURE.txt     # Database credentials (SECURE!)
└── DEPLOYMENT_READY.md     # This file

frontend/
├── Dockerfile              # Production Docker build
├── nginx.conf              # Frontend Nginx config
├── .env.production         # Frontend env vars
└── src/config/api.ts       # Centralized API config
```

---

## 🔐 Security Checklist

Before deploying, verify:

- [ ] `.env.production` has strong `DJANGO_SECRET_KEY`
- [ ] RDS password is secure
- [ ] SSH key (`qgavel-key.pem`) is protected (chmod 400)
- [ ] Security groups only allow necessary traffic
- [ ] SSL certificate will be installed

---

## 💰 Expected Costs

| Resource | Monthly Cost |
|----------|-------------|
| EC2 t2.micro | $0 (free tier) |
| RDS db.t3.micro | $0 (free tier) |
| Route 53 | $0.50 |
| Data transfer | ~$1-2 |
| **Total** | **~$2/month** |

After free tier (12 months): ~$25-30/month

---

## 🆘 Troubleshooting

### If deployment fails:

```bash
# SSH into EC2
ssh -i aws-deployment/qgavel-key.pem ec2-user@<IP>

# Check Docker containers
sudo docker-compose ps
sudo docker-compose logs

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check user-data script log
cat /var/log/user-data.log
```

### If SSL fails:

```bash
# Make sure DNS is pointing to EC2
dig qgavel.com

# Retry Certbot
sudo certbot --nginx -d qgavel.com -d www.qgavel.com --force-renewal
```

---

## ✅ Summary

**Everything is ready!** As soon as AWS unlocks EC2:

1. Run the EC2 creation command
2. Run `./deploy-to-ec2.sh <IP>`
3. Update DNS
4. Set up SSL
5. **QGavel is LIVE!** 🎉

**Estimated time to live:** 30-45 minutes after AWS unlocks

