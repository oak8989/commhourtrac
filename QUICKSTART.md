# VolunteerHub - Quick Start Guide

## 🚀 Getting Started

VolunteerHub is a comprehensive volunteer management platform with real email notifications.

### Prerequisites

- Node.js 18+ and npm
- SMTP email account (Gmail, Outlook, SendGrid, etc.)
- Docker (optional, for containerized deployment)

## 📦 Installation

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install email server dependencies
cd server
npm install
cd ..
```

### 2. Configure Email Server

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your SMTP credentials
nano .env
```

**Gmail Setup:**
1. Enable 2-factor authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `.env`

### 3. Start the Application

**Option A: Development Mode (Two Terminals)**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Email Server:
```bash
cd server
npm run dev
```

**Option B: Docker (Recommended for Production)**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application

- **Frontend**: http://localhost:5173 (dev) or http://localhost:3001 (production)
- **Email API**: http://localhost:3001/api/email/health

## 🔧 First-Time Setup

### 1. Access Admin Panel

1. Open the application in your browser
2. Click "Admin Login" or navigate to the login page
3. Use default credentials:
   - Email: `admin@volunteerhub.org`
   - Password: `admin123`

**⚠️ Important:** Change the default password immediately!

### 2. Configure Email Settings

1. Go to **Settings** → **Email**
2. Enter your SMTP configuration:
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - SMTP User: `your-email@gmail.com`
   - SMTP Password: `your-app-password`
   - From Email: `noreply@yourdomain.com`
3. Click **Test Connection** to verify
4. Send a test email to confirm

### 3. Customize Organization

1. Go to **Settings** → **Branding**
2. Update:
   - Organization name
   - Logo
   - Theme colors
   - Contact information

## 📧 Testing Email

### Send Test Email via API

```bash
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@gmail.com",
    "orgName": "VolunteerHub"
  }'
```

### Send Test Email via UI

1. Go to **Settings** → **Email**
2. Enter your email in the "Test Email" field
3. Click **Send Test Email**
4. Check your inbox!

## 🎯 Key Features

### For Volunteers

- **Browse Events**: View upcoming volunteer opportunities
- **Register**: Sign up for events with one click
- **Check In/Out**: Track volunteer hours
- **Earn Medals**: Get recognized for your contributions
- **View History**: See your volunteer journey

### For Administrators

- **Event Management**: Create and manage events
- **Member Management**: Add, edit, and organize volunteers
- **Attendance Tracking**: Monitor check-ins and hours
- **Email Notifications**: Automatic emails for all actions
- **Reports & Analytics**: Track impact and engagement
- **White Labeling**: Customize branding

## 📊 Email Notifications

The system automatically sends emails for:

1. **Welcome Email** - When a new member registers
2. **Registration Confirmation** - When signing up for an event
3. **Check-out Confirmation** - After logging volunteer hours
4. **Medal Achievement** - When earning a new medal
5. **Password Reset** - When requesting password reset
6. **Test Email** - For verifying SMTP configuration

## 🔒 Security Best Practices

1. **Change Default Password**: Update admin password immediately
2. **Use App Passwords**: For Gmail, use App Passwords (not regular password)
3. **Enable 2FA**: Use two-factor authentication on email accounts
4. **Environment Variables**: Never commit `.env` files to git
5. **HTTPS**: Use SSL/TLS in production
6. **Rate Limiting**: Built-in protection (50 emails/15min)

## 🐛 Troubleshooting

### Email Not Sending

1. Check SMTP configuration in Settings → Email
2. Verify credentials are correct
3. Test connection using "Test Connection" button
4. Check server logs: `docker-compose logs email-server`

### Can't Access Admin Panel

1. Verify you're using correct credentials
2. Check browser console for errors
3. Clear browser cache and cookies
4. Restart the application

### Frontend Not Connecting to Email Server

1. Verify email server is running: `curl http://localhost:3001/api/email/health`
2. Check CORS settings in `server/index.js`
3. Update `VITE_EMAIL_API_URL` in frontend environment

## 📚 Documentation

- **Email Server**: See `server/README.md` for detailed email server documentation
- **API Reference**: See `server/README.md#api-endpoints`
- **SMTP Providers**: See `server/README.md#smtp-provider-configuration`

## 🆘 Support

### Common Issues

**Gmail Authentication Failed**
- Solution: Use App Password, not regular password
- Guide: https://support.google.com/accounts/answer/185833

**Connection Timeout**
- Solution: Check firewall settings, try port 465 (SSL) instead of 587 (TLS)

**Rate Limit Exceeded**
- Solution: Wait 15 minutes or increase limit in `.env`

### Getting Help

1. Check server logs for error messages
2. Review the troubleshooting section in `server/README.md`
3. Test SMTP connection via API
4. Verify all environment variables are set correctly

## 🎉 You're All Set!

Your VolunteerHub instance is now running with real email notifications. Start by:

1. ✅ Configuring your SMTP settings
2. ✅ Sending a test email
3. ✅ Creating your first event
4. ✅ Inviting volunteers
5. ✅ Tracking their impact!

---

**Happy Volunteering! 🌟**
