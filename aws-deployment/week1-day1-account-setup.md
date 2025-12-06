# Week 1, Day 1-2: AWS Account Setup & Security

**Time:** 2 hours  
**Cost Impact:** $0 (all free)  
**Goal:** Secure AWS account and set up billing alerts

---

## Step 1: Secure Your Root Account (15 minutes)

### 1.1 Enable MFA on Root Account

**Why:** Protect your AWS account from unauthorized access

**Steps:**

1. **Log into AWS Console:**
   - Go to: https://console.aws.amazon.com/
   - Sign in with your root account email and password

2. **Go to IAM Dashboard:**
   - In top-right, click your account name
   - Click "Security Credentials"
   - Or search for "IAM" in the search bar

3. **Enable MFA:**
   - Find "Multi-factor authentication (MFA)" section
   - Click "Activate MFA"
   - Choose MFA device type:
     - **Recommended:** Virtual MFA device (use Google Authenticator or Authy on phone)
     - Alternative: Hardware MFA device

4. **Set up Virtual MFA:**
   - Download Google Authenticator or Authy on your phone
   - Click "Virtual MFA device"
   - Scan QR code with your authenticator app
   - Enter two consecutive MFA codes
   - Click "Assign MFA"

5. **Save Recovery Codes:**
   - **CRITICAL:** Save the recovery codes somewhere safe!
   - If you lose your phone, you'll need these to access your account

✅ **Checkpoint:** Your root account now requires MFA to log in!

---

## Step 2: Create IAM Admin User (30 minutes)

**Why:** Never use root account for daily work - create an admin user instead

### 2.1 Create IAM User

1. **Go to IAM:**
   - Search for "IAM" in AWS Console
   - Click "Users" in left sidebar
   - Click "Create user"

2. **User Details:**
   - User name: `precedentum-admin`
   - ✅ Check "Provide user access to AWS Management Console"
   - Choose: "I want to create an IAM user"
   - Console password: Create custom password (save it!)
   - ✅ Uncheck "Users must create a new password at next sign-in"
   - Click "Next"

3. **Set Permissions:**
   - Select "Attach policies directly"
   - Search for and check: `AdministratorAccess`
   - Click "Next"

4. **Review and Create:**
   - Review settings
   - Click "Create user"

5. **Save Credentials:**
   - **IMPORTANT:** Save these somewhere secure:
     - Console sign-in URL: `https://YOUR-ACCOUNT-ID.signin.aws.amazon.com/console`
     - User name: `precedentum-admin`
     - Password: (the one you created)

### 2.2 Enable MFA for Admin User

1. **Sign in as Admin User:**
   - Sign out of root account
   - Use the console sign-in URL
   - Log in with `precedentum-admin` credentials

2. **Enable MFA:**
   - Click your username (top right)
   - Click "Security credentials"
   - Under "Multi-factor authentication (MFA)", click "Assign MFA device"
   - Follow same process as root account
   - Use the same authenticator app

✅ **Checkpoint:** You now have a secure admin user with MFA!

**From now on, NEVER use root account for daily work!**

---

## Step 3: Install AWS CLI (30 minutes)

**Why:** Manage AWS from command line (faster than console)

### 3.1 Install AWS CLI on Mac

```bash
# Check if already installed
aws --version

# If not installed:
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Verify installation
aws --version
# Should show: aws-cli/2.x.x
```

### 3.2 Create Access Keys for CLI

**In AWS Console (as precedentum-admin):**

1. Click your username (top right) → "Security credentials"
2. Scroll to "Access keys" section
3. Click "Create access key"
4. Select use case: "Command Line Interface (CLI)"
5. ✅ Check "I understand the above recommendation"
6. Click "Next"
7. Description tag: `precedentum-cli-access`
8. Click "Create access key"

**SAVE THESE IMMEDIATELY:**
- Access key ID: `AKIA...`
- Secret access key: `...` (only shown once!)

### 3.3 Configure AWS CLI

```bash
# Run configuration
aws configure

# Enter when prompted:
AWS Access Key ID: [paste your access key ID]
AWS Secret Access Key: [paste your secret access key]
Default region name: us-east-1
Default output format: json
```

### 3.4 Test AWS CLI

```bash
# Test connection
aws sts get-caller-identity

# Should return:
# {
#     "UserId": "AIDA...",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/precedentum-admin"
# }
```

✅ **Checkpoint:** AWS CLI is configured and working!

---

## Step 4: Set Up Billing Alerts (15 minutes)

**Why:** Avoid surprise AWS bills!

### 4.1 Enable Billing Alerts

1. **Go to Billing Console:**
   - Click your account name (top right)
   - Click "Billing and Cost Management"
   - Or go to: https://console.aws.amazon.com/billing/

2. **Enable CloudWatch Billing Alerts:**
   - In left sidebar, click "Billing preferences"
   - ✅ Check "Receive CloudWatch Billing Alerts"
   - Click "Save preferences"

### 4.2 Create Budget Alerts

1. **Go to Budgets:**
   - In left sidebar, click "Budgets"
   - Click "Create budget"

2. **Create Monthly Budget:**
   - Template: "Monthly cost budget"
   - Budget name: `precedentum-monthly-budget`
   - Budgeted amount: `$50` (gives you buffer above expected $20.50)
   - Click "Next"

3. **Set Alert Thresholds:**
   - Alert 1: 50% of budget ($25)
   - Alert 2: 80% of budget ($40)
   - Alert 3: 100% of budget ($50)
   - Email: (your email address)
   - Click "Next"

4. **Review and Create:**
   - Review settings
   - Click "Create budget"

### 4.3 Create Cost Anomaly Detection (Optional but Recommended)

1. **In Billing Console:**
   - Left sidebar → "Cost Anomaly Detection"
   - Click "Create monitor"
   - Monitor type: "AWS services"
   - Monitor name: `precedentum-anomaly-detection`
   - Alert threshold: `$10` (catches unusual spikes)
   - Email: (your email)
   - Click "Create monitor"

✅ **Checkpoint:** You'll get email alerts if costs exceed expectations!

---

## Step 5: Verify Free Tier Status (10 minutes)

**Make sure Free Tier is active for your account**

1. **Go to Free Tier Dashboard:**
   - https://console.aws.amazon.com/billing/home#/freetier

2. **Check Status:**
   - Should show "Free Tier eligible" for:
     - EC2: 750 hours/month (t2.micro or t3.micro)
     - RDS: 750 hours/month (db.t2.micro)
     - S3: 5GB storage
     - Data Transfer: 100GB out
   - Should show months remaining (11 or 12)

3. **If Not Showing:**
   - Free Tier is available for first 12 months from account creation
   - If your account is older than 12 months, some services won't be free
   - **Important:** Let me know if this is the case!

✅ **Checkpoint:** Free Tier is active!

---

## Step 6: Document Your Setup (10 minutes)

**Create a secure document with all your credentials**

Create file: `aws-credentials-SECURE.txt` (store somewhere SAFE, not in Git!)

```
===========================================
Precedentum AWS Account - CONFIDENTIAL
===========================================

AWS Account ID: [your 12-digit account ID]
Root Email: [your root email]
Root MFA Device: Google Authenticator on [device name]

IAM Admin User:
  Username: precedentum-admin
  Password: [your password]
  Console URL: https://[account-id].signin.aws.amazon.com/console
  MFA Device: Google Authenticator on [device name]

AWS CLI Access:
  Access Key ID: AKIA...
  Secret Access Key: [saved securely]
  Region: us-east-1

Domain:
  Name: qgavel.com
  Registrar: [where you bought it]

Budget Alerts:
  Email: [your email]
  Monthly limit: $50
  
Date Created: [today's date]
===========================================
```

**IMPORTANT:** 
- Never commit this file to Git
- Store in password manager or encrypted storage
- Back up somewhere safe

---

## Day 1-2 Completion Checklist

- [ ] Root account has MFA enabled
- [ ] IAM admin user created (precedentum-admin)
- [ ] Admin user has MFA enabled
- [ ] AWS CLI installed on laptop
- [ ] AWS CLI configured with access keys
- [ ] Test CLI command works
- [ ] Billing alerts created ($25, $40, $50)
- [ ] Cost anomaly detection enabled
- [ ] Free Tier status verified
- [ ] Credentials documented securely
- [ ] Never using root account for daily work!

**Current Cost:** $0 (everything so far is free!)

---

## Troubleshooting

### Problem: Can't enable MFA
**Solution:** Make sure you're using a compatible authenticator app (Google Authenticator, Authy, Microsoft Authenticator)

### Problem: AWS CLI not found after install
**Solution:** 
```bash
# Close and reopen terminal
# Or add to PATH:
export PATH=$PATH:/usr/local/bin
```

### Problem: Access key doesn't work
**Solution:** 
- Make sure you copied both access key ID and secret key correctly
- Try running `aws configure` again
- Verify the user has AdministratorAccess policy

### Problem: Billing alerts not showing
**Solution:**
- It can take 24 hours for billing data to populate
- Check again tomorrow

---

## Next Steps

Once you complete this checklist:
✅ **You're ready for Day 3-4: Network Infrastructure!**

---

**Time spent:** ~2 hours  
**Money spent:** $0  
**Progress:** 33% of Week 1 complete! 🎉



