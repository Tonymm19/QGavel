# 📧 Email Setup Guide - Receive Real Emails

## Current Status: Console Backend (Development)

Right now, emails are **printed to the Django server console** instead of being sent to actual email addresses. This is perfect for development and testing!

---

## 🔍 Where to Find Emails in Development

### The emails ARE being sent - they're just going to your **Django server console**!

When you request a password reset:
1. The API returns: `{"success": true, "message": "Password reset instructions have been sent..."}`
2. The email is **printed to your Django server terminal**
3. Look for a large block of text starting with:
   ```
   Content-Type: multipart/alternative;
   Subject: Reset Your Precedentum Password
   From: Precedentum <noreply@precedentum.com>
   To: piyush@ignitia-ai.com
   ```
4. Scroll through the HTML to find the reset URL

---

## ✅ Quick Test - Get Your Reset Link Now

Run this in a new terminal:

```bash
cd /Users/pmittal/Downloads/Precedentum-1
source .venv/bin/activate

python manage.py shell << 'EOF'
from court_rules.models import User
from court_rules.utils.tokens import generate_password_reset_token

user = User.objects.get(email='piyush@ignitia-ai.com')
uid, token = generate_password_reset_token(user)
reset_url = f"http://localhost:5173/reset-password?uid={uid}&token={token}"

print("\n" + "="*80)
print("🔑 YOUR PASSWORD RESET LINK:")
print("="*80)
print(f"\n{reset_url}\n")
print("="*80)
print("\nThis link is valid for 24 hours.")
print("Copy it and paste it into your browser to reset your password.")
print("="*80 + "\n")
EOF
```

This will generate a fresh reset link you can use immediately!

---

## 🚀 Setup Real Email Delivery (SMTP)

If you want to receive emails in your actual inbox, follow these steps:

### Option A: Gmail (Easiest for Testing)

1. **Enable 2-Factor Authentication** on your Google account

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Precedentum"
   - Copy the 16-character password

3. **Update Settings:**

Create `config/settings/local.py`:

```python
from .development import *

# Email Configuration for Gmail
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'  # Your Gmail address
EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'  # Your app password
DEFAULT_FROM_EMAIL = 'Precedentum <your-email@gmail.com>'
```

4. **Run Django with Local Settings:**

```bash
export DJANGO_SETTINGS_MODULE=config.settings.local
python manage.py runserver
```

---

### Option B: SendGrid (Best for Production)

1. **Sign up for SendGrid** (free tier: 100 emails/day)
   - https://sendgrid.com/

2. **Get API Key:**
   - Settings → API Keys → Create API Key
   - Full Access or Mail Send access

3. **Update Settings:**

```python
# config/settings/production.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'  # Literally the string "apikey"
EMAIL_HOST_PASSWORD = 'YOUR_SENDGRID_API_KEY'
DEFAULT_FROM_EMAIL = 'Precedentum <noreply@yourdomain.com>'
```

---

### Option C: AWS SES (Best for Scale)

1. **Set up AWS SES:**
   - Verify your domain or email address
   - Request production access (starts in sandbox mode)

2. **Get SMTP Credentials:**
   - AWS Console → SES → SMTP Settings → Create SMTP Credentials

3. **Update Settings:**

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'email-smtp.us-east-1.amazonaws.com'  # Your region
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'YOUR_SMTP_USERNAME'
EMAIL_HOST_PASSWORD = 'YOUR_SMTP_PASSWORD'
DEFAULT_FROM_EMAIL = 'Precedentum <noreply@yourdomain.com>'
```

---

## 🔐 Best Practice: Use Environment Variables

**Never commit credentials to git!** Use environment variables:

1. **Update `.env` file:**

```bash
# .env
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=Precedentum <your-email@gmail.com>
```

2. **Update settings:**

```python
import os
from pathlib import Path

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'Precedentum <noreply@precedentum.com>')
```

3. **Load environment variables:**

Install python-decouple:
```bash
pip install python-decouple
```

Update settings:
```python
from decouple import config

EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
```

---

## 🧪 Test Email Delivery

After configuring SMTP, test it:

```bash
python manage.py shell
```

```python
from django.core.mail import send_mail

send_mail(
    subject='Test Email from Precedentum',
    message='This is a test email.',
    from_email='noreply@precedentum.com',
    recipient_list=['your-email@gmail.com'],
    fail_silently=False,
)
```

You should receive a real email in your inbox!

---

## 📊 Current Configuration Summary

**Environment:** Development  
**Email Backend:** Console (prints to terminal)  
**Perfect for:** Testing and development  

**To receive real emails:**
1. Choose an SMTP provider (Gmail, SendGrid, AWS SES)
2. Update `EMAIL_BACKEND` to `'django.core.mail.backends.smtp.EmailBackend'`
3. Add SMTP credentials
4. Test!

---

## ❓ FAQ

### Q: Why aren't emails going to my inbox?
**A:** You're using the console backend (development mode). Emails are printed to the Django server terminal, not sent to real inboxes.

### Q: How do I get the password reset link?
**A:** Look at your Django server terminal after requesting a reset, or run the test script above to generate a fresh link.

### Q: Is this secure for production?
**A:** The console backend is for **development only**. For production, use SMTP with proper credentials and SSL/TLS.

### Q: Can I test with real emails locally?
**A:** Yes! Follow Option A (Gmail) above to send real emails while developing locally.

### Q: What's the best SMTP service?
**A:** 
- **Gmail:** Easy for testing, free
- **SendGrid:** Great for production, generous free tier
- **AWS SES:** Best for scale, cheapest at volume

---

## 🎯 Recommended Setup

**For Development (Current):**
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```
✅ Currently configured - emails print to terminal

**For Production:**
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'  # or Gmail, AWS SES
# + SMTP credentials
```

---

**Need help setting up SMTP? Let me know which provider you'd like to use and I'll help you configure it!**



