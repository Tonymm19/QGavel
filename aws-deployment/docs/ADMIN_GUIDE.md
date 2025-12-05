# QGavel Administrator Guide

**Version:** 1.0  
**Last Updated:** December 2025  
**For:** System administrators and super users

---

## Table of Contents

1. [Admin Access](#1-admin-access)
2. [User Management](#2-user-management)
3. [Organization Management](#3-organization-management)
4. [Data Management](#4-data-management)
5. [System Monitoring](#5-system-monitoring)
6. [Backup & Recovery](#6-backup--recovery)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Admin Access

### 1.1 Django Admin Panel

**URL:** https://qgavel.com/admin/

**Login Credentials:**
- Email: admin@qgavel.com
- Password: (stored securely - see rds-info-SECURE.txt)

### 1.2 What You Can Do in Admin

| Section | Capabilities |
|---------|-------------|
| **Users** | Create, edit, delete users; reset passwords |
| **Organizations** | Manage law firms and organizations |
| **Cases** | View and edit all cases |
| **Judges** | Update judge information and procedures |
| **Deadlines** | View and manage all deadlines |
| **Subscriptions** | Manage billing and subscriptions |

### 1.3 Admin Best Practices

- ✅ Always log out when done
- ✅ Use strong passwords
- ✅ Limit admin access to trusted users only
- ✅ Review user activity regularly
- ❌ Never share admin credentials
- ❌ Don't make changes without understanding impact

---

## 2. User Management

### 2.1 Creating a New User

**Step 1:** Go to Admin Panel → Users → Add User

**Step 2:** Fill in required fields:

| Field | Description | Required |
|-------|-------------|----------|
| Email | User's email (used for login) | Yes |
| First Name | User's first name | Yes |
| Last Name | User's last name | Yes |
| Password | Temporary password | Yes |
| Organization | Assign to organization | No |
| Role | User, Staff, or Admin | Yes |
| Active | Whether account is enabled | Yes |

**Step 3:** Click "Save"

**Step 4:** Send user their login credentials

### 2.2 User Roles

| Role | Permissions |
|------|-------------|
| **User** | View judges, create/manage own cases and deadlines |
| **Staff** | User permissions + view all org cases |
| **Admin** | Full access to admin panel |
| **Superuser** | Complete system access |

### 2.3 Resetting a User's Password

**Option 1: Admin Panel**
1. Go to Users → Find user → Edit
2. Click "Reset Password"
3. Enter new temporary password
4. Save and notify user

**Option 2: User Self-Service**
1. User clicks "Forgot Password" on login page
2. System sends reset email
3. User creates new password

### 2.4 Deactivating a User

1. Go to Users → Find user → Edit
2. Uncheck "Active"
3. Save

> 💡 **Tip:** Deactivating is better than deleting - it preserves history.

### 2.5 Deleting a User

⚠️ **Warning:** This permanently removes the user and may affect related data.

1. Go to Users → Find user
2. Select checkbox
3. Choose "Delete selected users" from dropdown
4. Confirm deletion

---

## 3. Organization Management

### 3.1 Creating an Organization

1. Go to Admin → Organizations → Add
2. Fill in:
   - Name (e.g., "Smith & Associates LLP")
   - Contact Email
   - Address (optional)
   - Subscription Plan
3. Save

### 3.2 Assigning Users to Organizations

1. Go to Users → Edit user
2. Select Organization from dropdown
3. Save

### 3.3 Organization Subscriptions

| Plan | Features | User Limit |
|------|----------|------------|
| **Trial** | Full features, 14 days | 3 users |
| **Basic** | Core features | 5 users |
| **Professional** | All features | 15 users |
| **Enterprise** | All features + support | Unlimited |

---

## 4. Data Management

### 4.1 Managing Judges

**Adding a New Judge:**
1. Admin → Judges → Add
2. Fill in judge information
3. Add procedures (can add multiple)
4. Add chamber staff
5. Save

**Updating Judge Information:**
1. Admin → Judges → Select judge
2. Edit fields
3. Save

**Fields to maintain:**
- Name and title
- Courtroom number
- Phone and email
- Procedures (filing requirements)
- Chamber staff (clerks, assistants)

### 4.2 Managing Court Rules

1. Admin → Court Rules → Add/Edit
2. Enter rule text or link
3. Associate with court/judge
4. Save

### 4.3 Bulk Data Import

For large data imports, use Django management commands:

```bash
# SSH into server
ssh -i qgavel-key.pem ec2-user@<IP>

# Run import command
cd ~/qgavel
sudo docker-compose exec backend python manage.py import_judges judges.csv
```

### 4.4 Data Export

**Export from Admin:**
1. Go to any list view (Users, Cases, etc.)
2. Select items or "Select All"
3. Choose "Export to CSV" from actions
4. Download file

**Export from Database:**
```bash
# Create database dump
pg_dump -h qgavel-db.ce36wacgyaha.us-east-1.rds.amazonaws.com \
        -U qgaveladmin -d qgavel \
        -F c -f backup.dump
```

---

## 5. System Monitoring

### 5.1 Health Checks

**Application Health:**
```bash
curl https://qgavel.com/api/v1/health/
# Should return: {"status": "ok"}
```

**Database Health:**
```bash
# SSH into server
ssh -i qgavel-key.pem ec2-user@<IP>

# Check database connection
sudo docker-compose exec backend python manage.py check --database default
```

### 5.2 Viewing Logs

**Application Logs:**
```bash
ssh -i qgavel-key.pem ec2-user@<IP>
cd ~/qgavel
sudo docker-compose logs backend
sudo docker-compose logs frontend
```

**Nginx Logs:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 5.3 Performance Monitoring

**Check Container Status:**
```bash
sudo docker-compose ps
sudo docker stats
```

**Check Disk Space:**
```bash
df -h
```

**Check Memory:**
```bash
free -m
```

### 5.4 AWS CloudWatch (When Set Up)

Monitor these metrics:
- CPU utilization
- Memory usage
- Database connections
- Error rates
- Response times

---

## 6. Backup & Recovery

### 6.1 Automated Backups

**Already Configured:**
- RDS automated backups: Daily at 3-4 AM UTC
- Retention: 7 days
- Point-in-time recovery: Available

### 6.2 Manual Backup

**Create On-Demand Snapshot:**
```bash
aws rds create-db-snapshot \
  --db-instance-identifier qgavel-db \
  --db-snapshot-identifier qgavel-manual-$(date +%Y%m%d)
```

**List Available Snapshots:**
```bash
aws rds describe-db-snapshots \
  --db-instance-identifier qgavel-db \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime,Status]' \
  --output table
```

### 6.3 Recovery Procedure

**Restore from Snapshot:**

1. **Identify snapshot to restore:**
   ```bash
   aws rds describe-db-snapshots --db-instance-identifier qgavel-db
   ```

2. **Create new instance from snapshot:**
   ```bash
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier qgavel-db-restored \
     --db-snapshot-identifier <snapshot-id> \
     --db-instance-class db.t3.micro
   ```

3. **Update application to use new endpoint**

4. **Test thoroughly**

5. **Switch DNS if needed**

**Estimated Recovery Time:** 15-30 minutes

### 6.4 Local Backup (Extra Safety)

```bash
# Export database locally
pg_dump -h qgavel-db.ce36wacgyaha.us-east-1.rds.amazonaws.com \
        -U qgaveladmin -d qgavel \
        -F c -f qgavel-backup-$(date +%Y%m%d).dump

# Compress
gzip qgavel-backup-*.dump

# Upload to S3 (optional)
aws s3 cp qgavel-backup-*.dump.gz s3://your-backup-bucket/
```

---

## 7. Troubleshooting

### 7.1 Common Issues

#### Users Can't Log In

**Check:**
1. Is the user account active?
2. Is the password correct?
3. Is the email correct?
4. Check browser console for errors

**Fix:**
1. Reset password in admin
2. Check user's Active status
3. Clear browser cache

#### Application Won't Load

**Check:**
1. Is the server running?
   ```bash
   ssh -i qgavel-key.pem ec2-user@<IP>
   sudo docker-compose ps
   ```

2. Is Nginx running?
   ```bash
   sudo systemctl status nginx
   ```

3. Check logs:
   ```bash
   sudo docker-compose logs --tail=50
   ```

**Fix:**
1. Restart containers:
   ```bash
   sudo docker-compose restart
   ```

2. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

#### Database Connection Error

**Check:**
1. Is RDS running?
   ```bash
   aws rds describe-db-instances --db-instance-identifier qgavel-db
   ```

2. Can you connect directly?
   ```bash
   psql -h qgavel-db.ce36wacgyaha.us-east-1.rds.amazonaws.com \
        -U qgaveladmin -d qgavel
   ```

**Fix:**
1. Check security group allows connection
2. Verify credentials in .env file
3. Restart application containers

#### SSL Certificate Issues

**Check:**
```bash
sudo certbot certificates
```

**Renew if needed:**
```bash
sudo certbot renew
```

#### Slow Performance

**Check:**
1. Database CPU in CloudWatch
2. Container memory usage
3. Disk space

**Fix:**
1. Optimize slow queries
2. Increase instance size if needed
3. Clear old logs/data

### 7.2 Emergency Contacts

| Issue | Contact |
|-------|---------|
| Application bugs | Development team |
| AWS issues | AWS Support (via console) |
| Database issues | Check RDS console first |
| Security concerns | Immediately escalate |

### 7.3 Restart Procedures

**Restart Application Only:**
```bash
ssh -i qgavel-key.pem ec2-user@<IP>
cd ~/qgavel
sudo docker-compose restart
```

**Restart Everything:**
```bash
sudo docker-compose down
sudo docker-compose up -d
sudo systemctl restart nginx
```

**Full Server Reboot:**
```bash
sudo reboot
```
(Wait 2-3 minutes for server to come back)

---

## Quick Reference

### Important URLs

| Resource | URL |
|----------|-----|
| Application | https://qgavel.com |
| Admin Panel | https://qgavel.com/admin/ |
| API Health | https://qgavel.com/api/v1/health/ |

### Important Commands

```bash
# SSH to server
ssh -i aws-deployment/qgavel-key.pem ec2-user@<IP>

# View logs
sudo docker-compose logs -f

# Restart app
sudo docker-compose restart

# Check status
sudo docker-compose ps

# Create backup
aws rds create-db-snapshot --db-instance-identifier qgavel-db --db-snapshot-identifier manual-backup
```

### Important Files

| File | Location | Purpose |
|------|----------|---------|
| SSH Key | aws-deployment/qgavel-key.pem | Server access |
| DB Credentials | aws-deployment/rds-info-SECURE.txt | Database access |
| Environment | ~/qgavel/.env (on server) | App configuration |
| Nginx Config | /etc/nginx/conf.d/qgavel.conf | Web server |

---

*For additional help, contact the development team or AWS Support.*

