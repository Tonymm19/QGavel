# Week 1, Day 3-4: Network Infrastructure Setup

**Time:** 2 hours  
**Cost Impact:** $0 (VPC and networking are free!)  
**Goal:** Create secure VPC with subnets and security groups

---

## Prerequisites

Before starting:
- ✅ Completed Day 1-2 (AWS account secured, CLI configured)
- ✅ Logged in as `precedentum-admin` user
- ✅ AWS CLI working

---

## Architecture We're Building

```
Internet
    ↓
Internet Gateway (FREE)
    ↓
┌────────────────────────────────────────────┐
│ VPC: 10.0.0.0/16 (FREE)                   │
│                                            │
│  ┌──────────────────┐  ┌─────────────────┐│
│  │ Public Subnet    │  │ Public Subnet   ││
│  │ us-east-1a       │  │ us-east-1b      ││
│  │ 10.0.1.0/24      │  │ 10.0.2.0/24     ││
│  │                  │  │                 ││
│  │ (Future: EC2)    │  │ (Backup subnet) ││
│  └──────────────────┘  └─────────────────┘│
│                                            │
│  Security Groups:                          │
│  • ALB-SG (allows 80, 443)                │
│  • EC2-SG (allows ALB + SSH from you)     │
│  • RDS-SG (allows EC2 + you)              │
└────────────────────────────────────────────┘
```

---

## Step 1: Create VPC (20 minutes)

### 1.1 Create VPC via Console

1. **Go to VPC Dashboard:**
   - AWS Console → Search for "VPC"
   - Click "VPC Dashboard"

2. **Launch VPC Creation Wizard:**
   - Click "Create VPC"
   - Select **"VPC and more"** (this creates everything at once!)

3. **Configure VPC:**
   ```
   Name tag: precedentum-vpc
   
   IPv4 CIDR block: 10.0.0.0/16
   IPv6 CIDR block: No IPv6
   
   Tenancy: Default
   
   Number of Availability Zones: 2
   Number of public subnets: 2
   Number of private subnets: 0
   
   NAT gateways: None (saves $35/month!)
   VPC endpoints: None
   
   DNS hostnames: Enable
   DNS resolution: Enable
   ```

4. **Click "Create VPC"**
   - Wait 1-2 minutes for creation
   - Should create:
     - 1 VPC
     - 2 Public subnets
     - 1 Internet Gateway
     - 2 Route tables
     - Network ACLs

✅ **Verify:**
```bash
# List your VPCs
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,CidrBlock,Tags[?Key==`Name`].Value|[0]]' --output table

# Should show precedentum-vpc with 10.0.0.0/16
```

### 1.2 Note Down Important IDs

**Save these for later:**

```bash
# Get VPC ID
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=precedentum-vpc" --query 'Vpcs[0].VpcId' --output text

# Save this! Will look like: vpc-0123456789abcdef

# Get Subnet IDs
aws ec2 describe-subnets --filters "Name=vpc-id,Values=YOUR_VPC_ID" --query 'Subnets[*].[SubnetId,AvailabilityZone,CidrBlock]' --output table

# Save both subnet IDs! Will look like:
# subnet-abc123 | us-east-1a | 10.0.1.0/24
# subnet-def456 | us-east-1b | 10.0.2.0/24
```

Create file: `aws-deployment/vpc-info.txt`
```
VPC ID: vpc-xxxxx
Subnet 1 (us-east-1a): subnet-xxxxx
Subnet 2 (us-east-1b): subnet-xxxxx
Internet Gateway ID: igw-xxxxx
```

---

## Step 2: Create Security Groups (40 minutes)

### 2.1 ALB Security Group (Internet → Load Balancer)

**Purpose:** Allow HTTPS traffic from internet to load balancer

```bash
# Create ALB security group
aws ec2 create-security-group \
  --group-name precedentum-alb-sg \
  --description "Security group for Precedentum Application Load Balancer" \
  --vpc-id YOUR_VPC_ID

# Save the security group ID!
# Will return: sg-xxxxx

# Allow HTTPS (443) from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_ALB_SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Allow HTTP (80) from anywhere (will redirect to HTTPS)
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_ALB_SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0
```

✅ **Created:** ALB can receive HTTPS/HTTP from internet

### 2.2 EC2 Security Group (Load Balancer + SSH → EC2)

**Purpose:** Allow traffic from ALB and SSH from your IP only

```bash
# Create EC2 security group
aws ec2 create-security-group \
  --group-name precedentum-ec2-sg \
  --description "Security group for Precedentum EC2 instance" \
  --vpc-id YOUR_VPC_ID

# Save the security group ID!

# Allow port 80 from ALB only (for Nginx)
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_EC2_SG_ID \
  --protocol tcp \
  --port 80 \
  --source-group YOUR_ALB_SG_ID

# Allow SSH from YOUR IP only (for management)
# First, get your current IP:
curl -s https://checkip.amazonaws.com

# Then allow it:
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_EC2_SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP_ADDRESS/32

# Example: if your IP is 1.2.3.4, use: 1.2.3.4/32
```

✅ **Created:** EC2 accepts traffic from ALB and SSH from you

### 2.3 RDS Security Group (EC2 + You → Database)

**Purpose:** Allow PostgreSQL connections from EC2 and your laptop

```bash
# Create RDS security group
aws ec2 create-security-group \
  --group-name precedentum-rds-sg \
  --description "Security group for Precedentum RDS PostgreSQL" \
  --vpc-id YOUR_VPC_ID

# Save the security group ID!

# Allow PostgreSQL (5432) from EC2
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_RDS_SG_ID \
  --protocol tcp \
  --port 5432 \
  --source-group YOUR_EC2_SG_ID

# Allow PostgreSQL from YOUR IP (for admin access)
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_RDS_SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr YOUR_IP_ADDRESS/32
```

✅ **Created:** RDS accepts connections from EC2 and your laptop

### 2.4 Verify Security Groups

```bash
# List all security groups in your VPC
aws ec2 describe-security-groups \
  --filters "Name=vpc-id,Values=YOUR_VPC_ID" \
  --query 'SecurityGroups[*].[GroupName,GroupId,Description]' \
  --output table

# Should show:
# precedentum-alb-sg
# precedentum-ec2-sg
# precedentum-rds-sg
```

Update `aws-deployment/vpc-info.txt`:
```
VPC ID: vpc-xxxxx
Subnet 1 (us-east-1a): subnet-xxxxx
Subnet 2 (us-east-1b): subnet-xxxxx

Security Groups:
ALB-SG: sg-xxxxx (allows 80, 443 from internet)
EC2-SG: sg-xxxxx (allows 80 from ALB, 22 from YOUR_IP)
RDS-SG: sg-xxxxx (allows 5432 from EC2 and YOUR_IP)

Your IP: x.x.x.x
```

---

## Step 3: Test Network Connectivity (10 minutes)

### 3.1 Verify VPC Configuration

**Check Internet Gateway:**
```bash
# Should show IGW attached to your VPC
aws ec2 describe-internet-gateways \
  --filters "Name=attachment.vpc-id,Values=YOUR_VPC_ID" \
  --query 'InternetGateways[*].[InternetGatewayId,Attachments[0].State]' \
  --output table
```

**Check Route Tables:**
```bash
# Should show routes to IGW
aws ec2 describe-route-tables \
  --filters "Name=vpc-id,Values=YOUR_VPC_ID" \
  --query 'RouteTables[*].Routes[*].[DestinationCidrBlock,GatewayId]' \
  --output table

# Should see: 0.0.0.0/0 → igw-xxxxx
```

✅ **Verified:** Network is properly configured!

---

## Step 4: Create Network Diagram (10 minutes)

Document your network in: `aws-deployment/network-diagram.txt`

```
Precedentum Network Architecture
=================================

VPC: precedentum-vpc (10.0.0.0/16)
├── Internet Gateway: igw-xxxxx
│
├── Public Subnet 1 (us-east-1a): 10.0.1.0/24
│   └── Will host: EC2 instance
│
├── Public Subnet 2 (us-east-1b): 10.0.2.0/24
│   └── Backup/future use
│
├── Security Groups:
│   ├── ALB-SG (sg-xxxxx)
│   │   ├── Inbound: 443 from 0.0.0.0/0
│   │   └── Inbound: 80 from 0.0.0.0/0
│   │
│   ├── EC2-SG (sg-xxxxx)
│   │   ├── Inbound: 80 from ALB-SG
│   │   └── Inbound: 22 from YOUR_IP/32
│   │
│   └── RDS-SG (sg-xxxxx)
│       ├── Inbound: 5432 from EC2-SG
│       └── Inbound: 5432 from YOUR_IP/32
│
└── Route Tables:
    ├── Main route: 10.0.0.0/16 → local
    └── Internet route: 0.0.0.0/0 → igw-xxxxx

Traffic Flow:
Internet → ALB-SG:443 → ALB → EC2-SG:80 → EC2 → RDS-SG:5432 → RDS
```

---

## Step 5: Tag Everything (10 minutes)

**Add tags for organization:**

```bash
# Tag VPC
aws ec2 create-tags --resources YOUR_VPC_ID \
  --tags Key=Project,Value=Precedentum Key=Environment,Value=Production

# Tag Subnets
aws ec2 create-tags --resources YOUR_SUBNET_1_ID YOUR_SUBNET_2_ID \
  --tags Key=Project,Value=Precedentum Key=Environment,Value=Production

# Tag Security Groups
aws ec2 create-tags --resources YOUR_ALB_SG_ID YOUR_EC2_SG_ID YOUR_RDS_SG_ID \
  --tags Key=Project,Value=Precedentum Key=Environment,Value=Production
```

✅ **Tagged:** Easy to find Precedentum resources in AWS console!

---

## Day 3-4 Completion Checklist

- [ ] VPC created (10.0.0.0/16)
- [ ] 2 public subnets created (us-east-1a, us-east-1b)
- [ ] Internet Gateway attached
- [ ] Route tables configured
- [ ] ALB Security Group created (allows 80, 443)
- [ ] EC2 Security Group created (allows 80 from ALB, 22 from your IP)
- [ ] RDS Security Group created (allows 5432 from EC2 and your IP)
- [ ] All IDs documented in vpc-info.txt
- [ ] Network diagram created
- [ ] Everything tagged with Project=Precedentum

**Current Cost:** Still $0! (VPC and networking are free!)

---

## Troubleshooting

### Problem: VPC creation fails
**Solution:** 
- Make sure you're in us-east-1 region
- Check you haven't hit VPC limit (default is 5 per region)

### Problem: Can't create security group
**Solution:**
- Verify VPC ID is correct
- Make sure you're using the right region

### Problem: Can't SSH to future EC2
**Solution:**
- Your IP might have changed
- Update security group rule with new IP:
```bash
# Remove old rule
aws ec2 revoke-security-group-ingress --group-id YOUR_EC2_SG_ID --protocol tcp --port 22 --cidr OLD_IP/32

# Add new rule
aws ec2 authorize-security-group-ingress --group-id YOUR_EC2_SG_ID --protocol tcp --port 22 --cidr NEW_IP/32
```

---

## Next Steps

Once you complete this checklist:
✅ **You're ready for Day 5-7: Application Load Balancer & SSL!**

---

**Time spent:** ~2 hours  
**Money spent:** $0  
**Progress:** 67% of Week 1 complete! 🎉



