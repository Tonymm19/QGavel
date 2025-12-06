# Week 1: AWS Foundation Setup - START HERE! 🚀

**Welcome to your AWS deployment journey!**

This guide will walk you through Week 1 step-by-step.

---

## 📋 Week 1 Overview

**Goal:** Build secure AWS infrastructure foundation  
**Time:** 6 hours (spread over 7 days)  
**Cost:** $20.50/month  
**Domain:** qgavel.com  

**What you'll build:**
- ✅ Secure AWS account with MFA
- ✅ VPC network with security groups
- ✅ Application Load Balancer with SSL
- ✅ DNS configured (qgavel.com)
- ✅ Ready for Week 2 deployment

---

## 📅 Daily Breakdown

| Days | Tasks | Time | Files | Cost |
|------|-------|------|-------|------|
| **Day 1-2** | Account Security & Setup | 2h | [week1-day1-account-setup.md](week1-day1-account-setup.md) | $0 |
| **Day 3-4** | VPC & Security Groups | 2h | [week1-day3-4-networking.md](week1-day3-4-networking.md) | $0 |
| **Day 5-7** | Load Balancer & SSL | 2h | [week1-day5-7-alb-ssl.md](week1-day5-7-alb-ssl.md) | $20.50/mo |

---

## 🎯 Quick Start

### **Prerequisites:**
- [x] AWS account (you have one!)
- [x] Domain: qgavel.com (you have it!)
- [ ] 6 hours available this week
- [ ] Mac with terminal access

### **Start Here:**

1. **Open terminal on your Mac**

2. **Create workspace folder:**
```bash
cd /Users/pmittal/Downloads/Precedentum-1/aws-deployment
ls

# You should see:
# WEEK1-START-HERE.md (this file)
# week1-day1-account-setup.md
# week1-day3-4-networking.md
# week1-day5-7-alb-ssl.md
```

3. **Start with Day 1-2:**
```bash
# Open the first guide
open week1-day1-account-setup.md

# Or read it in terminal
cat week1-day1-account-setup.md
```

4. **Follow each guide in order!**

---

## 📖 How to Use These Guides

### **Each guide includes:**
- ✅ Step-by-step instructions
- ✅ Exact commands to run
- ✅ Explanations for beginners
- ✅ Checkpoints to verify progress
- ✅ Troubleshooting section
- ✅ Completion checklist

### **Tips:**
- Read each section carefully
- Copy/paste commands (replace YOUR_XXX with actual values)
- Take breaks between days
- Save all IDs/ARNs as you go
- Use the checklists!

---

## 💰 Cost Tracking

### **Week 1 Costs:**

```
Day 1-2: $0
Day 3-4: $0
Day 5-7: $20.50/month starts when you create ALB

Total for Week 1: $20.50/month
```

### **What's Free:**
- AWS account creation
- IAM users
- MFA setup
- VPC & networking
- Security groups
- SSL certificate (ACM)
- Most Route 53 features

### **What Costs Money:**
- Application Load Balancer: $20/month
- Route 53 Hosted Zone: $0.50/month

**IMPORTANT:** You'll set up billing alerts in Day 1 to avoid surprises!

---

## ✅ Week 1 Success Checklist

By end of Week 1, you should have:

### **Security:**
- [ ] Root account secured with MFA
- [ ] IAM admin user created with MFA
- [ ] AWS CLI configured
- [ ] Billing alerts set ($25, $40, $50)

### **Networking:**
- [ ] VPC created (10.0.0.0/16)
- [ ] 2 public subnets created
- [ ] 3 security groups created (ALB, EC2, RDS)
- [ ] All IDs documented

### **Load Balancer:**
- [ ] SSL certificate issued for qgavel.com
- [ ] Route 53 hosting qgavel.com
- [ ] ALB created and configured
- [ ] HTTP redirects to HTTPS
- [ ] https://qgavel.com shows 503 (expected!)

### **Documentation:**
- [ ] vpc-info.txt created
- [ ] alb-info.txt created
- [ ] All credentials saved securely

---

## 📁 Files You'll Create

As you go through Week 1, you'll create these files:

```
aws-deployment/
├── WEEK1-START-HERE.md (this file)
├── week1-day1-account-setup.md
├── week1-day3-4-networking.md
├── week1-day5-7-alb-ssl.md
│
├── aws-credentials-SECURE.txt (NEVER commit to Git!)
├── vpc-info.txt
├── alb-info.txt
└── network-diagram.txt
```

**⚠️ IMPORTANT:** Never commit `aws-credentials-SECURE.txt` to Git!

---

## 🚨 Common Issues & Quick Fixes

### **"I don't know my AWS account ID"**
```bash
aws sts get-caller-identity --query Account --output text
```

### **"My IP changed, can't SSH"**
```bash
# Get your new IP
curl https://checkip.amazonaws.com

# Update security group
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_EC2_SG_ID \
  --protocol tcp --port 22 \
  --cidr YOUR_NEW_IP/32
```

### **"SSL certificate stuck in Pending"**
- Wait 30 minutes for DNS propagation
- Check Route 53 has validation records
- Verify nameservers updated at registrar

### **"Can't access https://qgavel.com"**
- 503 error is EXPECTED in Week 1 (no EC2 yet!)
- Verify SSL certificate shows in browser
- Check DNS: `dig qgavel.com`

---

## 🎓 Learning Objectives

By end of Week 1, you'll understand:

- ✅ AWS account security best practices
- ✅ How VPCs and subnets work
- ✅ Security groups vs network ACLs
- ✅ How load balancers distribute traffic
- ✅ SSL/TLS certificate management
- ✅ DNS and domain routing
- ✅ AWS resource tagging
- ✅ Cost management and billing

**This knowledge is valuable even outside this project!**

---

## 📞 Getting Help

### **If you get stuck:**

1. **Check the Troubleshooting section** in each guide
2. **Verify previous steps** were completed
3. **Check AWS Console** for visual confirmation
4. **Ask me!** I'm here to help

### **Useful AWS Documentation:**
- VPC: https://docs.aws.amazon.com/vpc/
- ALB: https://docs.aws.amazon.com/elasticloadbalancing/
- ACM: https://docs.aws.amazon.com/acm/
- Route 53: https://docs.aws.amazon.com/route53/

---

## 🎯 Your Schedule Suggestion

### **Flexible 7-Day Plan:**

**Monday (Day 1):** Account security (1 hour)
- Enable MFA
- Create IAM user
- Install AWS CLI

**Tuesday (Day 2):** Finish setup (1 hour)
- Configure CLI
- Set billing alerts
- Verify free tier

**Wednesday (Day 3):** Networking Part 1 (1 hour)
- Create VPC
- Create subnets
- Set up internet gateway

**Thursday (Day 4):** Networking Part 2 (1 hour)
- Create security groups
- Test connectivity
- Document everything

**Friday (Day 5):** SSL & DNS (1 hour)
- Request SSL certificate
- Set up Route 53
- Update nameservers

**Saturday (Day 6):** Load Balancer (45 min)
- Create ALB
- Create target groups
- Configure listeners

**Sunday (Day 7):** Finish & Test (15 min)
- Create DNS records
- Test SSL
- Verify Week 1 checklist

**Total: 6 hours spread over 7 days**

---

## 🚀 Ready to Start?

### **Step 1: Open Day 1-2 Guide**
```bash
cd /Users/pmittal/Downloads/Precedentum-1/aws-deployment
open week1-day1-account-setup.md
```

### **Step 2: Work Through It!**
- Follow each step
- Check off items
- Save IDs as you go

### **Step 3: Come Back Here**
After Day 1-2, return to this file and continue to Day 3-4!

---

## 🎉 Week 1 Completion

When you finish all three guides, you'll have:

- ✅ Professional AWS infrastructure
- ✅ Secure, production-ready network
- ✅ SSL-enabled load balancer
- ✅ Domain pointing to AWS
- ✅ Solid foundation for Week 2

**Week 2 Preview:**
- Create RDS database (FREE!)
- Launch EC2 instance (FREE!)
- Deploy your apps
- Load data
- Go live at https://qgavel.com!

---

## 💪 You've Got This!

Remember:
- Take your time
- Read carefully
- Save all IDs/ARNs
- Use the checklists
- Ask questions
- Have fun learning AWS!

**Let's build something awesome!** 🚀

---

**Current Status:** Week 1, Day 1
**Next Step:** Open [week1-day1-account-setup.md](week1-day1-account-setup.md)
**Time Needed Today:** 1-2 hours
**Cost Today:** $0

**GO!** 🏃‍♂️



