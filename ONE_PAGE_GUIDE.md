# 📘 VolunteerHub - Complete One-Page Guide

**Everything you need to know to install, setup, and run VolunteerHub**

---

## 🚀 5-Minute Quick Start

```bash
# 1. Clone repository
git clone <your-repo-url>
cd volunteerhub

# 2. Run automated setup
chmod +x setup.sh
./setup.sh

# 3. Access application
# Open http://localhost:3001
```

**First Login:**
- Email: `admin@volunteerhub.org`
- Password: `admin123`
- ⚠️ **Change password immediately!**

---

## 📋 Prerequisites

### Required
- **Docker 20.10+** and **Docker Compose 2.0+**
- **2GB RAM** minimum
- **10GB disk** space
- **Email account** (Gmail, SendGrid, Mailgun, etc.)

### Optional
- Domain name (for production SSL)
- SSL certificate (for HTTPS)

---

## 🔧 Installation Methods

### Method 1: Docker (Recommended)

```bash
# Install Docker (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Clone and setup
git clone <your-repo-url>
cd volunteerhub
./setup.sh
```

### Method 2: Manual Installation

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Redis
sudo apt-get install -y redis-server

# Clone repository
git clone <your-repo-url>
cd volunteerhub

# Install dependencies
npm install
cd server && npm install && cd ..

# Configure
cp .env.production .env
nano .env

# Build and run
npm run build
npm run preview &
cd server && npm start &
```

---

## ⚙️ Configuration

### Environment File (.env)

```bash
# Email Configuration (Required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=noreply@yourdomain.com

# Redis Password
REDIS_PASSWORD=your-secure-password

# CORS Origin
CORS_ORIGIN=http://localhost:3001
```

### Gmail Setup

1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use 16-character App Password in `.env`

### SendGrid Setup

1. Sign up: https://sendgrid.com
2. Create API Key: Settings → API Keys
3. Use API key as password in `.env`

---

## 📧 Email Testing

```bash
# Test email delivery
make test

# Or manually
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "orgName": "VolunteerHub"}'

# Check health
curl http://localhost:3001/api/email/health
```

---

## 🎨 Customization

### Branding (Admin → Settings → Branding)

**Logo Options:**
- Preset emojis: 🌿 🤝 🌍 ❤️ 🏠 ⭐
- Upload custom image (PNG, JPG, SVG)

**Theme Colors:**
- Preset: Forest Green, Ocean Blue, Royal Purple, etc.
- Custom: Color picker or hex code

**Organization Info:**
- Name, tagline, mission
- Contact information
- EIN (Tax ID)

---

## 👥 User Management

### Add Members (Admin → Members → Add Member)

```bash
Name: John Doe
Email: john@example.com
Phone: (555) 123-4567
Role: Member
```

### Roles

**Admin:**
- Full system access
- Manage users and settings
- View all data

**Member:**
- View and register for events
- Check in/out
- View own hours

---

## 📅 Event Management

### Create Event (Admin → Events → New Event)

```bash
Title: Community Garden Cleanup
Description: Join us for beautifying our garden
Location: Riverside Community Garden
Date: 2024-03-15 09:00 - 13:00
Capacity: 20
Fee: $0 (or set amount)
Visibility: Public/Private
Waiver Required: Yes/No
```

### Event Types

- **Public**: Visible to all members
- **Private**: Invite specific groups
- **Recurring**: Weekly/Monthly auto-generation

---

## ⏱️ Attendance Tracking

### Member Check-in

1. Login to member portal
2. Go to Home
3. Click "Check In" (when event is live)
4. Timer starts automatically
5. Click "Check Out" when done
6. Hours logged automatically

### Admin Check-in

1. Go to Admin → Events
2. Select event
3. Click attendance icon
4. Check in members manually
5. Record walk-ins

---

## 🏅 Achievement System

### Medal Thresholds (Admin → Settings → Awards)

```bash
Bronze:   10 hours  🥉
Silver:   25 hours  🥈
Gold:     50 hours  🥇
Platinum: 100 hours 💎
Diamond:  250 hours ⭐
```

### Auto-Unlock

- Medals unlock automatically as hours accrue
- Notification sent to member
- Email notification sent
- Activity logged

---

## 💾 Backup & Restore

### Create Backup

```bash
# Automated
make backup

# Manual
./backup.sh
```

### Restore Backup

```bash
make restore
```

### Automated Backups (Cron)

```bash
# Daily at 2 AM
0 2 * * * /path/to/volunteerhub/backup.sh
```

---

## 🔒 Security

### Critical Actions

1. **Change admin password** immediately after first login
2. **Use strong passwords** (12+ characters)
3. **Enable HTTPS** in production
4. **Configure CORS** properly
5. **Regular backups**

### Security Features

- ✅ Rate limiting (50 req/15min)
- ✅ CORS protection
- ✅ Input validation
- ✅ Secure password tokens
- ✅ Non-root containers
- ✅ SSL/TLS support

---

## 🏭 Production Deployment

### SSL Setup

```bash
# Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem

# Start with production profile
docker-compose --profile production up -d
```

### Environment for Production

```bash
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 📊 Monitoring

### Health Checks

```bash
# Application
curl http://localhost:3001/api/email/health

# Redis
docker-compose exec redis redis-cli ping

# Services
docker-compose ps
```

### Logs

```bash
# All logs
docker-compose logs -f

# Application only
docker-compose logs -f app

# Email server
docker-compose logs app | grep -i email
```

### Resources

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

---

## 🛠️ Common Commands

```bash
# Setup & Start
make setup          # First-time setup
make start          # Start services
make stop           # Stop services
make restart        # Restart services

# Monitoring
make logs           # View logs
make health         # Check health
make stats          # Resource usage

# Maintenance
make backup         # Create backup
make restore        # Restore backup
make update         # Update application

# Testing
make test           # Test email

# Help
make help           # Show all commands
```

---

## 🐛 Troubleshooting

### Email Not Sending

```bash
# Test SMTP connection
docker-compose exec app telnet smtp.gmail.com 587

# Check logs
docker-compose logs app | grep -i email

# Verify credentials
docker-compose exec app env | grep SMTP
```

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Restart
docker-compose restart

# Reset (WARNING: Deletes data)
docker-compose down -v
./setup.sh
```

### Can't Access Application

```bash
# Check services
docker-compose ps

# Check port
sudo lsof -i :3001

# Test locally
curl http://localhost:3001
```

---

## 📚 Documentation Reference

### Quick Start
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute guide

### Installation
- **[INSTALL.md](INSTALL.md)** - All installation methods

### Setup
- **[SETUP.md](SETUP.md)** - Complete configuration

### Production
- **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Production deployment

### Email
- **[EMAIL_SERVER.md](EMAIL_SERVER.md)** - Email system details

### Customization
- **[COLOR_AND_LOGO_CUSTOMIZATION.md](COLOR_AND_LOGO_CUSTOMIZATION.md)** - Branding

### Technical
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Architecture
- **[server/README.md](server/README.md)** - API docs

### Full Index
- **[INDEX.md](INDEX.md)** - All documentation

---

## ✅ Pre-Deployment Checklist

### Installation
- [ ] Prerequisites installed
- [ ] Repository cloned
- [ ] Services started
- [ ] Application accessible

### Configuration
- [ ] Email configured
- [ ] Email tested
- [ ] Admin password changed
- [ ] Organization info set
- [ ] Branding applied

### Security
- [ ] Default passwords changed
- [ ] CORS configured
- [ ] Rate limiting set
- [ ] SSL configured (production)

### Testing
- [ ] Email delivery works
- [ ] User registration works
- [ ] Event creation works
- [ ] Check-in/out works
- [ ] Password reset works

### Documentation
- [ ] Read QUICKSTART.md
- [ ] Read INSTALL.md
- [ ] Read SETUP.md
- [ ] Read PRODUCTION_SETUP.md

---

## 📞 Support

### Quick Help
```bash
make help       # Show commands
make health     # Check status
make logs       # View logs
```

### Documentation
- **[INDEX.md](INDEX.md)** - Start here
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start
- **[INSTALL.md](INSTALL.md)** - Installation
- **[SETUP.md](SETUP.md)** - Setup
- **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Production

### Common Issues
1. **Email not working?** → Check SMTP credentials, test with `make test`
2. **Can't login?** → Verify credentials, reset password via email
3. **Slow performance?** → Check resources with `docker stats`
4. **Backup failed?** → Check disk space, review logs

---

## 🎯 Success Criteria

Your VolunteerHub is successfully deployed when:

✅ Application accessible at http://localhost:3001  
✅ Admin can login and change password  
✅ Email configuration tested and working  
✅ At least one event created  
✅ At least one member added  
✅ Check-in/out working  
✅ Backups configured  

---

## 🌟 You're Ready!

**Next Steps:**
1. Change admin password
2. Configure email
3. Customize branding
4. Create events
5. Add members
6. Start volunteering!

---

**Need Help?**
- Check [Troubleshooting](#troubleshooting)
- Review [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)
- Run `make help` for commands

**Happy Volunteering!** 🎉

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Production Ready
