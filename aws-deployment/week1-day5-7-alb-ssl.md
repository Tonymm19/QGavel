# Week 1, Day 5-7: Application Load Balancer & SSL Certificate

**Time:** 2 hours  
**Cost Impact:** $20/month (ALB) + $0.50/month (Route 53) = $20.50/month starts here!  
**Goal:** Create load balancer with SSL for qgavel.com

---

## Prerequisites

Before starting:
- ✅ Completed Day 3-4 (VPC and security groups created)
- ✅ Have your domain: qgavel.com
- ✅ Know your VPC ID and subnet IDs
- ✅ Know your ALB security group ID

---

## Architecture We're Building

```
Internet
    ↓
Route 53 DNS (qgavel.com) [$0.50/month]
    ↓
Application Load Balancer [$20/month]
├── Listener: HTTP:80 → Redirect to HTTPS
├── Listener: HTTPS:443 → Forward to targets
└── SSL Certificate (FREE from ACM!)
    ↓
Target Groups (empty for now)
├── Backend-TG (port 8000)
└── Frontend-TG (port 80)
```

---

## Step 1: Request SSL Certificate (30 minutes)

### 1.1 Request Certificate from AWS Certificate Manager

**IMPORTANT:** Do this first - takes 5-30 minutes to validate!

1. **Go to AWS Certificate Manager:**
   - AWS Console → Search for "ACM" or "Certificate Manager"
   - **Make sure you're in us-east-1 region!** (top right)

2. **Request Certificate:**
   - Click "Request certificate"
   - Choose "Request a public certificate"
   - Click "Next"

3. **Domain Names:**
   ```
   Fully qualified domain name: qgavel.com
   
   Click "Add another name to this certificate"
   Add: *.qgavel.com
   ```
   
   This covers:
   - qgavel.com
   - www.qgavel.com
   - api.qgavel.com
   - Any other subdomain

4. **Validation Method:**
   - Select **"DNS validation"** (easier if using Route 53)
   - Click "Request"

5. **Certificate Created:**
   - Status will show "Pending validation"
   - Click on the certificate ID
   - Note the certificate ARN (starts with arn:aws:acm:...)

### 1.2 Set Up Route 53 Hosted Zone

**If qgavel.com is NOT already in Route 53:**

1. **Create Hosted Zone:**
   - AWS Console → Search for "Route 53"
   - Click "Hosted zones"
   - Click "Create hosted zone"
   
   ```
   Domain name: qgavel.com
   Type: Public hosted zone
   ```
   
   - Click "Create hosted zone"
   - **COST:** $0.50/month starts now

2. **Note the Nameservers:**
   - You'll see 4 nameservers like:
     ```
     ns-123.awsdns-12.com
     ns-456.awsdns-45.net
     ns-789.awsdns-78.org
     ns-012.awsdns-01.co.uk
     ```
   - **Copy all 4!**

3. **Update Domain Registrar:**
   - Go to where you bought qgavel.com (GoDaddy, Namecheap, etc.)
   - Find "Nameserver" or "DNS" settings
   - Replace existing nameservers with the 4 AWS nameservers
   - Save changes
   - **Note:** DNS propagation takes 5-60 minutes

### 1.3 Validate SSL Certificate

**If using Route 53 (recommended):**

1. **In ACM Console:**
   - Click on your pending certificate
   - Under "Domains", you'll see validation records
   - Click "Create records in Route 53"
   - Click "Create records"
   - AWS automatically adds DNS records for validation

2. **Wait for Validation:**
   - Refresh the page every few minutes
   - Status will change from "Pending" → "Issued"
   - Usually takes 5-30 minutes
   - **You can continue to next steps while waiting!**

✅ **Certificate is being validated!**

---

## Step 2: Create Target Groups (15 minutes)

**Target groups define where the ALB sends traffic**

### 2.1 Create Backend Target Group

```bash
# Create backend target group (for Django on port 8000)
aws elbv2 create-target-group \
  --name precedentum-backend-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id YOUR_VPC_ID \
  --health-check-enabled \
  --health-check-path /admin/ \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --target-type instance

# Save the Target Group ARN!
# Will look like: arn:aws:elasticloadbalancing:us-east-1:...
```

### 2.2 Create Frontend Target Group

```bash
# Create frontend target group (for React on port 80)
aws elbv2 create-target-group \
  --name precedentum-frontend-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id YOUR_VPC_ID \
  --health-check-enabled \
  --health-check-path / \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --target-type instance

# Save the Target Group ARN!
```

### 2.3 Verify Target Groups

```bash
# List target groups
aws elbv2 describe-target-groups \
  --names precedentum-backend-tg precedentum-frontend-tg \
  --query 'TargetGroups[*].[TargetGroupName,TargetGroupArn,Port]' \
  --output table
```

Update `aws-deployment/vpc-info.txt`:
```
Target Groups:
Backend TG ARN: arn:aws:elasticloadbalancing:...
Frontend TG ARN: arn:aws:elasticloadbalancing:...
```

---

## Step 3: Create Application Load Balancer (30 minutes)

### 3.1 Create ALB

```bash
# Create the load balancer
aws elbv2 create-load-balancer \
  --name precedentum-alb \
  --subnets YOUR_SUBNET_1_ID YOUR_SUBNET_2_ID \
  --security-groups YOUR_ALB_SG_ID \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --tags Key=Project,Value=Precedentum Key=Environment,Value=Production

# Save the Load Balancer ARN and DNS name!
# DNS will look like: precedentum-alb-123456789.us-east-1.elb.amazonaws.com
```

**💰 COST ALERT:** $20/month starts as soon as ALB is created!

### 3.2 Get ALB DNS Name

```bash
# Get the DNS name
aws elbv2 describe-load-balancers \
  --names precedentum-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text

# Save this! You'll use it to create DNS record
```

---

## Step 4: Configure ALB Listeners (20 minutes)

### 4.1 Wait for SSL Certificate

**Before creating HTTPS listener, check certificate status:**

```bash
# Check certificate status
aws acm list-certificates --query 'CertificateSummaryList[*].[DomainName,Status]' --output table

# Should show: qgavel.com | ISSUED
```

**If still "Pending validation":**
- Wait a few more minutes
- Check Route 53 has the validation records
- DNS changes can take up to 30 minutes

### 4.2 Create HTTP Listener (Redirect to HTTPS)

```bash
# Create HTTP listener that redirects to HTTPS
aws elbv2 create-listener \
  --load-balancer-arn YOUR_ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,Host=#{host},Path=/#{path},Query=#{query},StatusCode=HTTP_301}'
```

### 4.3 Create HTTPS Listener (Main Listener)

**Get your certificate ARN first:**

```bash
# Get certificate ARN for qgavel.com
aws acm list-certificates \
  --query 'CertificateSummaryList[?DomainName==`qgavel.com`].CertificateArn' \
  --output text
```

**Create HTTPS listener:**

```bash
# Create HTTPS listener forwarding to frontend
aws elbv2 create-listener \
  --load-balancer-arn YOUR_ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=YOUR_CERTIFICATE_ARN \
  --default-actions Type=forward,TargetGroupArn=YOUR_FRONTEND_TG_ARN
```

### 4.4 Add Rule for Backend API

**Forward /api/ and /admin/ to backend target group:**

```bash
# First, get the listener ARN
aws elbv2 describe-listeners \
  --load-balancer-arn YOUR_ALB_ARN \
  --query 'Listeners[?Port==`443`].ListenerArn' \
  --output text

# Create rule for /api/*
aws elbv2 create-rule \
  --listener-arn YOUR_HTTPS_LISTENER_ARN \
  --priority 1 \
  --conditions Field=path-pattern,Values='/api/*' \
  --actions Type=forward,TargetGroupArn=YOUR_BACKEND_TG_ARN

# Create rule for /admin/*
aws elbv2 create-rule \
  --listener-arn YOUR_HTTPS_LISTENER_ARN \
  --priority 2 \
  --conditions Field=path-pattern,Values='/admin/*' \
  --actions Type=forward,TargetGroupArn=YOUR_BACKEND_TG_ARN
```

✅ **ALB is configured!**

Traffic flow:
- `http://qgavel.com/*` → Redirects to HTTPS
- `https://qgavel.com/` → Frontend target group
- `https://qgavel.com/api/*` → Backend target group
- `https://qgavel.com/admin/*` → Backend target group

---

## Step 5: Create DNS Record for qgavel.com (15 minutes)

### 5.1 Point Domain to ALB

1. **In Route 53 Console:**
   - Go to Hosted zones
   - Click on qgavel.com
   - Click "Create record"

2. **Create A Record:**
   ```
   Record name: (leave empty for qgavel.com)
   Record type: A
   Alias: YES (toggle on)
   Route traffic to: Alias to Application Load Balancer
   Region: us-east-1
   Load balancer: precedentum-alb-xxxxx
   ```
   
   - Click "Create records"

3. **Create www Record (optional but recommended):**
   - Click "Create record" again
   ```
   Record name: www
   Record type: A
   Alias: YES
   Route traffic to: Alias to Application Load Balancer
   Region: us-east-1
   Load balancer: precedentum-alb-xxxxx
   ```
   
   - Click "Create records"

### 5.2 Test DNS Resolution

```bash
# Wait 2-3 minutes for DNS to propagate
# Then test:

# Check qgavel.com
dig qgavel.com

# Should show:
# qgavel.com. 60 IN A x.x.x.x (ALB IP)

# Or use nslookup:
nslookup qgavel.com

# Should show ALB IP addresses
```

✅ **DNS is configured!**

---

## Step 6: Test the Load Balancer (10 minutes)

### 6.1 Test HTTP → HTTPS Redirect

```bash
# Should redirect to HTTPS
curl -I http://qgavel.com

# Should show:
# HTTP/1.1 301 Moved Permanently
# Location: https://qgavel.com/
```

### 6.2 Test HTTPS (will show error for now - that's OK!)

```bash
# Try HTTPS
curl https://qgavel.com

# Will show "503 Service Unavailable" - This is EXPECTED!
# Why? No EC2 instances registered in target groups yet
# We'll add them in Week 2
```

### 6.3 Verify SSL Certificate

**In browser:**
1. Go to: https://qgavel.com
2. You'll see 503 error (expected - no backend yet)
3. Click the padlock icon in address bar
4. Should show valid SSL certificate for qgavel.com
5. Issued by: Amazon

✅ **SSL is working!**

---

## Step 7: Document Your Setup (5 minutes)

Create file: `aws-deployment/alb-info.txt`

```
Application Load Balancer
=========================

ALB Name: precedentum-alb
ALB ARN: arn:aws:elasticloadbalancing:...
ALB DNS: precedentum-alb-xxxxx.us-east-1.elb.amazonaws.com

Listeners:
- HTTP:80 → Redirect to HTTPS:443
- HTTPS:443 → Forward to target groups

Target Groups:
- Backend TG: precedentum-backend-tg (port 8000)
  Routes: /api/*, /admin/*
- Frontend TG: precedentum-frontend-tg (port 80)
  Routes: /* (default)

SSL Certificate:
- Domain: qgavel.com, *.qgavel.com
- ARN: arn:aws:acm:...
- Status: Issued
- Validation: DNS (Route 53)

DNS:
- Hosted Zone: qgavel.com (Route 53)
- A Record: qgavel.com → ALB
- A Record: www.qgavel.com → ALB

Traffic Flow:
http://qgavel.com → Redirect → https://qgavel.com
https://qgavel.com/ → Frontend TG (empty)
https://qgavel.com/api/* → Backend TG (empty)
https://qgavel.com/admin/* → Backend TG (empty)

Current Status:
✅ ALB created
✅ SSL certificate issued
✅ DNS configured
⏳ No targets registered yet (Week 2)

Cost:
💰 ALB: $20/month
💰 Route 53: $0.50/month
💰 Total: $20.50/month
```

---

## Day 5-7 Completion Checklist

- [ ] SSL certificate requested for qgavel.com
- [ ] Route 53 hosted zone created
- [ ] Domain nameservers updated at registrar
- [ ] SSL certificate validated and issued
- [ ] Backend target group created (port 8000)
- [ ] Frontend target group created (port 80)
- [ ] Application Load Balancer created
- [ ] HTTP listener created (redirects to HTTPS)
- [ ] HTTPS listener created (with SSL)
- [ ] Listener rules created for /api/ and /admin/
- [ ] DNS A records created (qgavel.com → ALB)
- [ ] HTTP redirect tested (301 to HTTPS)
- [ ] HTTPS SSL certificate verified in browser
- [ ] 503 error confirmed (expected - no targets yet!)
- [ ] ALB info documented

**Current Cost:** $20.50/month (ALB + Route 53)

---

## Troubleshooting

### Problem: SSL certificate stuck in "Pending validation"
**Solution:**
- Check Route 53 has the validation CNAME records
- Make sure nameservers are updated at registrar
- Wait up to 30 minutes for DNS propagation
- Try: `dig _xxxxx.qgavel.com` to verify validation record exists

### Problem: Can't access https://qgavel.com
**Solution:**
- Check DNS: `dig qgavel.com` should return ALB IP
- 503 error is EXPECTED (no EC2 targets yet)
- 502/504 errors mean ALB is trying to reach targets
- If no response, check security groups allow 443

### Problem: Certificate validation fails
**Solution:**
- Make sure you're using DNS validation (not email)
- Verify Route 53 hosted zone has validation records
- Check domain ownership

### Problem: www.qgavel.com doesn't work
**Solution:**
- Create separate A record for www subdomain
- Point to same ALB

---

## Cost Review

**Current Monthly Costs:**

| Service | Cost |
|---------|------|
| VPC & Networking | $0 (free) |
| Security Groups | $0 (free) |
| Application Load Balancer | $20.00 |
| Route 53 Hosted Zone | $0.50 |
| SSL Certificate (ACM) | $0 (free!) |
| **TOTAL** | **$20.50/month** |

**What's FREE in Week 1:**
✅ VPC creation
✅ Subnets
✅ Internet Gateway
✅ Security Groups
✅ SSL certificate
✅ Route table management

**What COSTS money:**
💰 ALB ($20/month) - starts when created
💰 Route 53 ($0.50/month) - starts when hosted zone created

---

## Next Steps

✅ **Week 1 Complete!**

**What you've built:**
- Secure VPC network
- Application Load Balancer with SSL
- DNS configured for qgavel.com
- Ready for EC2 instances

**Coming in Week 2:**
- Create RDS PostgreSQL database (FREE with free tier!)
- Launch EC2 instance (FREE with free tier!)
- Deploy Django + React apps
- Register EC2 with target groups
- Load sample data

**Your app will be live at:** https://qgavel.com

---

**Time spent this week:** ~6 hours  
**Money spent:** $20.50/month  
**Progress:** 100% of Week 1 complete! 🎉🎉🎉

**Congratulations!** Your foundation is solid. Week 2 is when we make it come alive!



