# 🧪 API Testing Guide

A beginner-friendly guide to test all the new authentication and access control APIs.

---

## 📝 Prerequisites

1. Make sure Django server is running:
   ```bash
   cd /Users/pmittal/Downloads/Precedentum-1
   source .venv/bin/activate
   python manage.py runserver
   ```

2. Open a new terminal for testing (keep server running in the first terminal)

---

## 🔐 Step 1: Authenticate as Super Admin

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@precedentum.com", "password": "SuperAdmin123!"}' | python3 -m json.tool
```

**Expected Response:**
```json
{
    "token": "your-token-here",
    "user_id": "...",
    "email": "admin@precedentum.com",
    "first_name": "Platform",
    "last_name": "Administrator",
    "full_name": "Platform Administrator",
    "organization_id": "...",
    "organization_name": "Precedentum Platform",
    "role": "super_admin"
}
```

**What happened?** You logged in as the Super Admin and received an authentication token.

**Copy the token value** - you'll use it in the next steps. Replace `YOUR_TOKEN_HERE` below with your actual token.

---

## 🏢 Step 2: List Organizations

```bash
TOKEN="YOUR_TOKEN_HERE"

curl http://127.0.0.1:8000/api/v1/admin/organizations/ \
  -H "Authorization: Token $TOKEN" | python3 -m json.tool
```

**What you'll see:** All organizations in the system (Demo Law Firm, Smith & Associates, Precedentum Platform)

**What this means:** Super Admins can see all organizations. Regular users would only see their own organization.

---

## 🏢 Step 3: Create a New Organization

```bash
TOKEN="YOUR_TOKEN_HERE"

curl -X POST http://127.0.0.1:8000/api/v1/admin/organizations/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Johnson Legal Group",
    "address_line1": "789 Market Street",
    "city": "Chicago",
    "state": "IL",
    "zip_code": "60603",
    "phone": "3125553000"
  }' | python3 -m json.tool
```

**What happened?** You created a new law firm organization.

**Copy the `id` field** - this is the organization ID you'll use when creating users.

---

## 👤 Step 4: Create a Site Admin for the New Organization

```bash
TOKEN="YOUR_TOKEN_HERE"
ORG_ID="PASTE_ORGANIZATION_ID_HERE"

curl -X POST http://127.0.0.1:8000/api/v1/admin/users/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@johnsonlegal.com\",
    \"first_name\": \"Michael\",
    \"last_name\": \"Johnson\",
    \"organization\": \"$ORG_ID\",
    \"phone\": \"3125553001\",
    \"role\": \"firm_admin\",
    \"timezone\": \"America/Chicago\",
    \"password\": \"MichaelJ123!\",
    \"confirm_password\": \"MichaelJ123!\"
  }" | python3 -m json.tool
```

**What happened?** You created a Site Admin who can manage users within Johnson Legal Group.

---

## 🔐 Step 5: Login as the Site Admin

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@johnsonlegal.com", "password": "MichaelJ123!"}' | python3 -m json.tool
```

**Copy the new token** - this is Michael's token (Site Admin).

---

## 👤 Step 6: Site Admin Creates Users in Their Organization

```bash
MICHAEL_TOKEN="PASTE_MICHAELS_TOKEN_HERE"

# Create a Managing Lawyer
curl -X POST http://127.0.0.1:8000/api/v1/admin/users/ \
  -H "Authorization: Token $MICHAEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "senior.lawyer@johnsonlegal.com",
    "first_name": "Emily",
    "last_name": "Davis",
    "phone": "3125553002",
    "role": "managing_lawyer",
    "timezone": "America/Chicago",
    "password": "EmilyD123!",
    "confirm_password": "EmilyD123!"
  }' | python3 -m json.tool
```

**What happened?** Michael (Site Admin) created a Managing Lawyer in his organization. Notice he didn't need to specify `organization` - it was automatically set to his organization.

---

## 👤 Step 7: Site Admin Creates a Lawyer

```bash
MICHAEL_TOKEN="PASTE_MICHAELS_TOKEN_HERE"

curl -X POST http://127.0.0.1:8000/api/v1/admin/users/ \
  -H "Authorization: Token $MICHAEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lawyer@johnsonlegal.com",
    "first_name": "David",
    "last_name": "Lee",
    "phone": "3125553003",
    "role": "lawyer",
    "timezone": "America/Chicago",
    "password": "DavidL123!",
    "confirm_password": "DavidL123!"
  }' | python3 -m json.tool
```

---

## 📊 Step 8: Site Admin Lists Users (Should Only See Their Org)

```bash
MICHAEL_TOKEN="PASTE_MICHAELS_TOKEN_HERE"

curl http://127.0.0.1:8000/api/v1/admin/users/ \
  -H "Authorization: Token $MICHAEL_TOKEN" | python3 -m json.tool
```

**What you'll see:** Only users from Johnson Legal Group (Michael, Emily, David).

**What this means:** Site Admins can only see users in their own organization. They cannot see users from other organizations.

---

## 🔗 Step 9: Grant Access (Emily Can See David's Data)

```bash
MICHAEL_TOKEN="PASTE_MICHAELS_TOKEN_HERE"
EMILY_ID="PASTE_EMILY_USER_ID_HERE"
DAVID_ID="PASTE_DAVID_USER_ID_HERE"

curl -X POST http://127.0.0.1:8000/api/v1/admin/access-grants/ \
  -H "Authorization: Token $MICHAEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"granted_to\": \"$EMILY_ID\",
    \"can_access_user\": \"$DAVID_ID\"
  }" | python3 -m json.tool
```

**What happened?** Michael granted Emily (Managing Lawyer) permission to see David's (Lawyer) cases and deadlines.

---

## 📋 Step 10: List Access Grants

```bash
MICHAEL_TOKEN="PASTE_MICHAELS_TOKEN_HERE"

curl http://127.0.0.1:8000/api/v1/admin/access-grants/ \
  -H "Authorization: Token $MICHAEL_TOKEN" | python3 -m json.tool
```

**What you'll see:** The access grant showing Emily can access David's data.

---

## 🔐 Step 11: Test Data Isolation with Cases

```bash
# First, login as Demo Law Firm lawyer (Sarah)
SARAH_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "demo.lawyer@example.com", "password": "NewPassword456!"}')

SARAH_TOKEN=$(echo "$SARAH_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

# Sarah lists cases (should only see Demo Law Firm cases)
curl http://127.0.0.1:8000/api/v1/cases/ \
  -H "Authorization: Token $SARAH_TOKEN" | python3 -m json.tool
```

**What you'll see:** Sarah only sees 2 cases from Demo Law Firm.

**What this means:** Multi-tenancy is working! Users can only see data from their own organization.

---

## 🛡️ Step 12: Super Admin Sees All Data

```bash
SUPER_TOKEN="YOUR_ORIGINAL_SUPER_ADMIN_TOKEN_HERE"

curl http://127.0.0.1:8000/api/v1/cases/ \
  -H "Authorization: Token $SUPER_TOKEN" | python3 -m json.tool
```

**What you'll see:** Super Admin sees ALL 4 cases across all organizations.

**What this means:** Super Admins have unrestricted access to all data.

---

## 🔒 Step 13: Change Password

```bash
SARAH_TOKEN="PASTE_SARAH_TOKEN_HERE"

curl -X POST http://127.0.0.1:8000/api/v1/admin/users/change-password/ \
  -H "Authorization: Token $SARAH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "NewPassword456!",
    "new_password": "AnotherPassword789!",
    "confirm_password": "AnotherPassword789!"
  }' | python3 -m json.tool
```

**What happened?** Sarah changed her password. She can now login with the new password.

---

## 🎯 Summary of What You Tested

✅ **Authentication** - Login with email + password  
✅ **Organization Management** - Create and list organizations  
✅ **User Management** - Create users with different roles  
✅ **Role Restrictions** - Site Admins can only manage their org  
✅ **Access Grants** - Grant permission to view other users' data  
✅ **Multi-Tenancy** - Users only see their organization's data  
✅ **Super Admin Access** - Super Admins see all data  
✅ **Password Change** - Users can change their own password  

---

## 🆘 Troubleshooting

### "Invalid email or password"
- Check you're using the correct email and password
- Passwords are case-sensitive
- Make sure the user was created successfully

### "You do not have permission"
- Check you're using the correct token for the user
- Some actions require Super Admin or Site Admin roles

### "This field is required"
- Make sure all required fields are included in your JSON
- Check for typos in field names

### Server not responding
- Make sure Django server is running: `python manage.py runserver`
- Check the terminal running the server for error messages

---

## 📚 Useful Commands

### Check server is running:
```bash
curl http://127.0.0.1:8000/api/v1/
```

### Pretty print JSON response:
```bash
curl YOUR_COMMAND_HERE | python3 -m json.tool
```

### Save response to a variable:
```bash
RESPONSE=$(curl -s YOUR_COMMAND_HERE)
echo "$RESPONSE" | python3 -m json.tool
```

---

**Happy Testing!** 🎉

If you have any questions, refer to `SESSION_2_COMPLETE.md` for a complete summary of all features.



