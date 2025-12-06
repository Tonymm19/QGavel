# Week 1 Quick Reference Card

**Keep this handy while working through Week 1!**

---

## 📋 Essential Information

### **Your Details:**
```
Domain: qgavel.com
AWS Region: us-east-1
Project: Precedentum
Environment: Production
```

### **Week 1 Goals:**
- [ ] Day 1-2: Secure AWS account
- [ ] Day 3-4: Build VPC network
- [ ] Day 5-7: Deploy load balancer with SSL

---

## 🔑 Important IDs (Fill in as you go!)

### **Account Info:**
```
AWS Account ID: ___________________
IAM Admin User: precedentum-admin
Your IP Address: ___________________
```

### **Network Resources:**
```
VPC ID:          vpc-_________________
Subnet 1 ID:     subnet-_____________
Subnet 2 ID:     subnet-_____________
IGW ID:          igw-_________________
```

### **Security Groups:**
```
ALB-SG ID:       sg-_________________
EC2-SG ID:       sg-_________________
RDS-SG ID:       sg-_________________
```

### **Load Balancer:**
```
ALB ARN:         arn:aws:elasticloadbalancing:...
ALB DNS:         precedentum-alb-________.us-east-1.elb.amazonaws.com
Backend TG ARN:  arn:aws:elasticloadbalancing:...
Frontend TG ARN: arn:aws:elasticloadbalancing:...
```

### **SSL & DNS:**
```
Certificate ARN: arn:aws:acm:...
Route 53 Zone:   qgavel.com
Nameserver 1:    ns-___.awsdns-__.com
Nameserver 2:    ns-___.awsdns-__.net
Nameserver 3:    ns-___.awsdns-__.org
Nameserver 4:    ns-___.awsdns-__.co.uk
```

---

## 💰 Cost Tracker

| Day | Service | Cost | Running Total |
|-----|---------|------|---------------|
| 1-2 | IAM, MFA, CLI | $0 | $0 |
| 3-4 | VPC, Subnets, SGs | $0 | $0 |
| 5 | SSL Certificate | $0 | $0 |
| 5 | Route 53 Zone | $0.50/mo | $0.50/mo |
| 6 | ALB | $20/mo | $20.50/mo |
| 7 | DNS Records | $0 | $20.50/mo |

**Expected Monthly Cost:** $20.50

---

## 🔧 Essential Commands

### **Get Your IP:**
```bash
curl https://checkip.amazonaws.com
```

### **Check AWS CLI:**
```bash
aws sts get-caller-identity
```

### **List VPCs:**
```bash
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,CidrBlock]' --output table
```

### **List Security Groups:**
```bash
aws ec2 describe-security-groups --query 'SecurityGroups[*].[GroupName,GroupId]' --output table
```

### **Check SSL Certificate:**
```bash
aws acm list-certificates --query 'CertificateSummaryList[*].[DomainName,Status]' --output table
```

### **Test DNS:**
```bash
dig qgavel.com
nslookup qgavel.com
```

### **Test HTTPS:**
```bash
curl -I https://qgavel.com
```

---

## ✅ Daily Checklists

### **Day 1-2:**
- [ ] MFA on root account
- [ ] IAM admin user created
- [ ] MFA on admin user
- [ ] AWS CLI installed
- [ ] CLI configured
- [ ] Billing alerts set
- [ ] Free tier verified

### **Day 3-4:**
- [ ] VPC created
- [ ] 2 subnets created
- [ ] Internet gateway attached
- [ ] ALB security group
- [ ] EC2 security group
- [ ] RDS security group
- [ ] All IDs saved

### **Day 5-7:**
- [ ] SSL certificate requested
- [ ] Route 53 zone created
- [ ] Nameservers updated
- [ ] Certificate validated
- [ ] Target groups created
- [ ] ALB created
- [ ] Listeners configured
- [ ] DNS records created
- [ ] HTTPS tested

---

## 🚨 Quick Troubleshooting

### **Can't log into AWS:**
- Check MFA code is current
- Verify password
- Use incognito mode

### **CLI not working:**
```bash
aws configure
# Re-enter access keys
```

### **Wrong region:**
```bash
# Always use us-east-1
export AWS_DEFAULT_REGION=us-east-1
```

### **Security group rule fails:**
```bash
# Make sure using VPC ID, not subnet ID
# Verify source security group exists
```

### **SSL certificate stuck:**
- Wait 30 minutes
- Check Route 53 has CNAME records
- Verify nameservers at registrar

### **Can't access qgavel.com:**
- 503 is EXPECTED (no EC2 yet)
- Check DNS propagation
- Verify certificate in browser

---

## 📞 Emergency Contacts

### **AWS Support:**
- Dashboard: https://console.aws.amazon.com
- Billing: https://console.aws.amazon.com/billing/
- Free Tier: https://console.aws.amazon.com/billing/home#/freetier

### **Helpful Links:**
- VPC Console: https://console.aws.amazon.com/vpc/
- EC2 Console: https://console.aws.amazon.com/ec2/
- ACM Console: https://console.aws.amazon.com/acm/
- Route 53: https://console.aws.amazon.com/route53/

---

## 💾 Files to Keep Safe

### **Never commit to Git:**
- `aws-credentials-SECURE.txt`
- Access keys
- Passwords
- MFA recovery codes

### **OK to commit:**
- `vpc-info.txt`
- `alb-info.txt`
- `network-diagram.txt`
- These guide files

---

## 🎯 Week 1 Success Metrics

At end of Week 1, verify:

```bash
# 1. VPC exists
aws ec2 describe-vpcs --filters "Name=tag:Project,Values=Precedentum"

# 2. Security groups exist
aws ec2 describe-security-groups --filters "Name=vpc-id,Values=YOUR_VPC_ID"

# 3. ALB is active
aws elbv2 describe-load-balancers --names precedentum-alb

# 4. SSL certificate issued
aws acm list-certificates

# 5. DNS resolves
dig qgavel.com

# 6. HTTPS accessible (503 OK for now)
curl -I https://qgavel.com
```

All should return success!

---

## 📊 Progress Tracker

```
Week 1 Progress:

[▱▱▱▱▱▱▱] Day 1-2: Account Setup (0%)
[▱▱▱▱▱▱▱] Day 3-4: Networking (0%)
[▱▱▱▱▱▱▱] Day 5-7: ALB & SSL (0%)

Overall: 0% Complete
```

Update as you go!

---

## 🚀 Next Steps After Week 1

**Week 2 Preview:**
- Create RDS PostgreSQL (FREE)
- Launch EC2 t3.micro (FREE)
- Install Django + React
- Load your data
- Register EC2 with ALB
- Go live!

**Estimated total FREE tier cost: $20.50/month**

---

## 💪 Motivational Reminders

- Take breaks!
- Save IDs immediately
- Use checklists
- Read error messages
- Ask questions
- You're learning valuable skills!

**You've got this!** 🎉

---

**Document Version:** Week 1 v1.0  
**Last Updated:** [Today's date]  
**Status:** Ready to use!



