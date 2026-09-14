# ⚙️ Complete Setup Guide

Comprehensive setup and configuration instructions for VolunteerHub.

## 📋 Table of Contents

- [First-Time Setup](#first-time-setup)
- [Environment Configuration](#environment-configuration)
- [Email Configuration](#email-configuration)
- [Initial Application Setup](#initial-application-setup)
- [Branding & Customization](#branding--customization)
- [User Management](#user-management)
- [Event Management](#event-management)
- [Security Configuration](#security-configuration)
- [Production Configuration](#production-configuration)
- [Verification & Testing](#verification--testing)
- [Next Steps](#next-steps)

---

## First-Time Setup

### Automated Setup (Recommended)

```bash
# Run setup script
chmod +x setup.sh
./setup.sh
```

The script will:
1. ✅ Create `.env` file from template
2. ✅ Generate secure passwords
3. ✅ Start all services
4. ✅ Test email configuration
5. ✅ Verify system health

### Manual Setup

```bash
# 1. Copy environment template
cp .env.production .env

# 2. Edit configuration
nano .env

# 3. Start services
docker-compose up -d

# 4. Verify installation
docker-compose ps
curl http://localhost:3001/api/email/health
```

---

## Environment Configuration

### Environment File Location

```
volunteerhub/
└── .env
```

### Required Variables

```bash
# ============================================
# Application Settings
# ============================================
NODE_ENV=production
PORT=3001

# ============================================
# Email Configuration (Required)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false

# ============================================
# Redis Configuration
# ============================================
REDIS_PASSWORD=your-secure-redis-password

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=50

# ============================================
# CORS Configuration
# ============================================
CORS_ORIGIN=https://yourdomain.com
```

### Optional Variables

```bash
# Postal Email Server (Self-hosted)
POSTAL_DB_PASSWORD=your-postal-db-password
POSTAL_DB_ROOT_PASSWORD=your-postal-root-password
POSTAL_RABBITMQ_PASSWORD=your-postal-rabbitmq-password
POSTAL_SMTP_HOSTNAME=mail.yourdomain.com
```

### Generate Secure Passwords

```bash
# Generate Redis password
openssl rand -base64 32

# Generate admin password
openssl rand -base64 16
```

---

## Email Configuration

### Gmail Setup

#### Step 1: Enable 2-Factor Authentication

1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow setup instructions

#### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" from app dropdown
3. Select "Other (Custom name)"
4. Enter "VolunteerHub"
5. Click "Generate"
6. Copy the 16-character password

#### Step 3: Configure .env

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop  # 16-char App Password
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
```

### SendGrid Setup

#### Step 1: Create Account

1. Sign up at https://sendgrid.com
2. Verify your domain
3. Complete sender authentication

#### Step 2: Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Select "Full Access"
4. Name it "VolunteerHub"
5. Copy the API key

#### Step 3: Configure .env

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key-here
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
```

### Mailgun Setup

#### Step 1: Create Account

1. Sign up at https://mailgun.com
2. Add your domain
3. Verify DNS records

#### Step 2: Get SMTP Credentials

1. Go to Domains → Your Domain
2. Click "SMTP Credentials"
3. Create new credentials
4. Copy username and password

#### Step 3: Configure .env

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
```

### AWS SES Setup

#### Step 1: Create Account

1. Sign up for AWS
2. Go to SES console
3. Verify your domain

#### Step 2: Create SMTP Credentials

1. Go to SES → SMTP Settings
2. Click "Create My SMTP Credentials"
3. Create IAM user
4. Download credentials

#### Step 3: Configure .env

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
```

### Test Email Configuration

```bash
# Using Makefile
make test

# Manual test
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "orgName": "VolunteerHub"}'

# Check email status
curl http://localhost:3001/api/email/health
```

---

## Initial Application Setup

### First Login

1. Open http://localhost:3001
2. Click "Admin Login"
3. Enter default credentials:
   - **Email:** `admin@volunteerhub.org`
   - **Password:** `admin123`

⚠️ **CRITICAL:** Change password immediately!

### Change Admin Password

1. Click "My Profile" in sidebar
2. Scroll to "Change Password"
3. Enter current password: `admin123`
4. Enter new password (min 6 characters)
5. Confirm new password
6. Click "Update Password"

### Configure Organization

Go to **Admin → Settings → Organization**

```bash
Organization Name: Your Organization Name
Tagline: Your tagline here
Mission: Your mission statement
Contact Email: contact@yourdomain.com
Contact Phone: (555) 123-4567
Address: 123 Main St, City, State ZIP
EIN: 12-3456789
Dollar Value per Hour: 29
```

---

## Branding & Customization

### Logo Setup

Go to **Admin → Settings → Branding**

#### Option 1: Preset Emojis
- 🌿 (Leaf)
- 🤝 (Handshake)
- 🌍 (Globe)
- ❤️ (Heart)
- 🏠 (House)
- ⭐ (Star)

#### Option 2: Upload Custom Logo
1. Click "Choose File"
2. Select image (PNG, JPG, SVG)
3. Preview appears automatically
4. Click "Save Settings"

**Recommended Logo Specs:**
- Format: PNG or SVG
- Size: 200x200px
- Background: Transparent
- Max file size: 2MB

### Theme Colors

#### Option 1: Preset Colors
- Forest Green: `#1a5c3a`
- Ocean Blue: `#2563eb`
- Royal Purple: `#7c3aed`
- Crimson Red: `#dc2626`
- Sunset Orange: `#ea580c`
- Teal: `#0891b2`

#### Option 2: Custom Color
1. Click color picker
2. Choose your color
3. Or enter hex code (e.g., `#ff5733`)
4. Preview updates in real-time
5. Click "Save Settings"

### Live Preview

All changes show in real-time:
- Navigation bar
- Buttons
- Links
- Accent colors
- Impact band

---

## User Management

### Add First Member

Go to **Admin → Members → Add Member**

```bash
Name: John Doe
Email: john@example.com
Phone: (555) 123-4567
Title: Volunteer
Role: Member
```

**Note:** A random password will be generated and shown after creation.

### Member Roles

**Admin:**
- Full system access
- Manage all users
- Configure settings
- View all data
- Delete accounts

**Member:**
- View events
- Register for events
- Check in/out
- View own hours
- Edit own profile

### Member Groups

Create groups for organization:
- Leadership
- Mentors
- Trail Leads
- General
- Event Coordinators

Assign members to groups for:
- Private events
- Targeted communications
- Role-based access

---

## Event Management

### Create First Event

Go to **Admin → Events → New Event**

```bash
Title: Community Garden Cleanup
Description: Join us for a morning of beautifying our community garden.
Location: Riverside Community Garden
Start Date: 2024-03-15 09:00
End Date: 2024-03-15 13:00
Capacity: 20
Fee: 0 (or set fee for paid events)
Visibility: Public
Recurring: Weekly/Monthly (optional)
Require Waiver: Yes/No
```

### Event Types

**Public Events:**
- Visible to all members
- Anyone can register
- Show on landing page

**Private Events:**
- Invite specific groups
- Only invited members see it
- Example: Leadership meetings

**Recurring Events:**
- Weekly: Every week
- Monthly: Every month
- Auto-generates future instances

### Event Fees

**Free Events:**
- Set fee to $0
- No payment required

**Paid Events:**
- Set fee amount (e.g., $25)
- Payment collected on registration
- Receipt generated automatically
- Refund on cancellation

### Waiver Management

**Create Waiver:**
1. Go to **Admin → Settings → Waivers**
2. Enter waiver text
3. Save settings

**Require Waiver:**
1. Edit event
2. Check "Require Waiver"
3. Members must sign before registering

---

## Security Configuration

### Change Default Passwords

**Admin Account:**
```bash
1. Login as admin
2. Go to My Profile
3. Change password
4. Use strong password (12+ characters)
```

**Redis Password:**
```bash
# Generate new password
openssl rand -base64 32

# Update .env
REDIS_PASSWORD=new-secure-password

# Restart services
docker-compose restart redis
```

### Configure CORS

Edit `.env`:
```bash
# Development
CORS_ORIGIN=http://localhost:3001

# Production
CORS_ORIGIN=https://yourdomain.com
```

### Rate Limiting

Edit `.env`:
```bash
# 50 requests per 15 minutes
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=50

# Adjust based on traffic
# High traffic: RATE_LIMIT_MAX=100
# Low traffic: RATE_LIMIT_MAX=20
```

### SSL/HTTPS (Production)

See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md#sslhttps-setup) for:
- Let's Encrypt setup
- Self-signed certificates
- Cloudflare integration

---

## Production Configuration

### Environment Variables

```bash
NODE_ENV=production
PORT=3001

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Redis
REDIS_PASSWORD=your-secure-password

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=50
```

### Resource Limits

Edit `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
    reservations:
      cpus: '1.0'
      memory: 512M
```

### Logging

```bash
# View logs
docker-compose logs -f

# Log rotation (already configured)
# Max size: 10MB
# Max files: 3
```

### Backup Configuration

```bash
# Automated backup (cron)
0 2 * * * /path/to/volunteerhub/backup.sh

# Manual backup
make backup
```

---

## Verification & Testing

### Health Checks

```bash
# Application health
curl http://localhost:3001/api/email/health

# Redis health
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Service status
docker-compose ps
```

### Email Test

```bash
# Send test email
make test

# Or manually
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "orgName": "VolunteerHub"}'

# Check inbox
# Email should arrive within 1-3 minutes
```

### Functional Tests

**Test 1: User Registration**
1. Go to landing page
2. Click "Get Started"
3. Register new member
4. Check email for welcome message

**Test 2: Event Registration**
1. Login as member
2. Browse events
3. Register for event
4. Check email for confirmation

**Test 3: Check-in/Check-out**
1. Login as member
2. Go to Home
3. Click "Check In"
4. Wait 1 minute
5. Click "Check Out"
6. Verify hours logged

**Test 4: Password Reset**
1. Go to login page
2. Click "Forgot Password?"
3. Enter email
4. Check email for reset link
5. Click link
6. Set new password
7. Login with new password

### Performance Tests

```bash
# Load test (requires Apache Bench)
ab -n 1000 -c 10 http://localhost:3001/

# Monitor resources
docker stats

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/
```

---

## Next Steps

### Immediate Actions

1. ✅ **Change admin password** - Security critical
2. ✅ **Configure email** - Enable notifications
3. ✅ **Set branding** - Customize appearance
4. ✅ **Create first event** - Start managing volunteers
5. ✅ **Add members** - Build your team

### Short-term (Week 1)

- [ ] Create 5-10 events
- [ ] Invite 10-20 members
- [ ] Configure waivers
- [ ] Test all features
- [ ] Train administrators

### Medium-term (Month 1)

- [ ] Set up automated backups
- [ ] Configure SSL certificate
- [ ] Monitor email delivery
- [ ] Gather user feedback
- [ ] Optimize performance

### Long-term (Month 3+)

- [ ] Scale infrastructure
- [ ] Advanced reporting
- [ ] Custom integrations
- [ ] Mobile app consideration
- [ ] Multi-site deployment

---

## Setup Checklist

### Pre-Setup
- [ ] Prerequisites installed
- [ ] Repository cloned
- [ ] Docker running

### Installation
- [ ] Environment configured
- [ ] Services started
- [ ] Application accessible

### Configuration
- [ ] Email configured
- [ ] Email tested
- [ ] Admin password changed
- [ ] Organization info set
- [ ] Branding applied

### Verification
- [ ] Health checks pass
- [ ] Email delivery works
- [ ] User registration works
- [ ] Event creation works
- [ ] Check-in/out works

### Documentation
- [ ] Read [QUICKSTART.md](QUICKSTART.md)
- [ ] Read [INSTALL.md](INSTALL.md)
- [ ] Read [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)
- [ ] Reviewed security best practices

---

## Troubleshooting

### Common Issues

**Email not sending:**
- Check SMTP credentials
- Verify App Password for Gmail
- Test with `make test`
- Check logs: `docker-compose logs app`

**Can't login:**
- Verify credentials
- Check user status in database
- Reset password via email

**Application slow:**
- Check resource usage: `docker stats`
- Clear Redis cache
- Review logs for errors

**Backup failed:**
- Check disk space
- Verify permissions
- Review backup logs

### Getting Help

1. Check logs: `docker-compose logs -f`
2. Review [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)
3. Check [INSTALL.md](INSTALL.md#troubleshooting)
4. Run health check: `make health`

---

## Support Resources

### Documentation
- [Quick Start](QUICKSTART.md)
- [Installation](INSTALL.md)
- [Production Setup](PRODUCTION_SETUP.md)
- [Email Server](EMAIL_SERVER.md)

### Commands
```bash
make help       # Show all commands
make health     # Check health
make logs       # View logs
make test       # Test email
make backup     # Create backup
```

### Contacts
- **Documentation:** See INDEX.md
- **Issues:** Check logs and documentation
- **Emergencies:** `docker-compose restart`

---

**Setup Complete?** → Continue to [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)

**Need Help?** → Check [Troubleshooting](#troubleshooting) or review [INSTALL.md](INSTALL.md)
