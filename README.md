# VolunteerHub 🌟

**Comprehensive Volunteer Management Platform**

A production-ready, white-labeled volunteer management system with real email notifications, event management, attendance tracking, and impact analytics.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Docker](https://img.shields.io/badge/docker-ready-green)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📚 Documentation

**👉 [Start Here - Complete Documentation Index](INDEX.md)**

### Quick Links
- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[INSTALL.md](INSTALL.md)** - Complete installation guide
- **[SETUP.md](SETUP.md)** - Full setup and configuration
- **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Production deployment

## ✨ Features

### 🎯 Core Functionality
- **Event Management** - Create public/private events with capacity tracking
- **Attendance Tracking** - One-tap check-in/out with QR code support
- **Member Management** - Complete user profiles with role-based access
- **Payment Processing** - Per-event fees with receipt generation
- **Achievement System** - Automatic medal awards based on hours

### 📧 Real Email System
- **SMTP Integration** - Real email delivery via Gmail, SendGrid, Mailgun, etc.
- **Email Templates** - Professional HTML emails for all notifications
- **Queue Management** - Reliable email delivery with retry logic
- **Health Monitoring** - Real-time SMTP connection status

### 🎨 White-Label Customization
- **Branding** - Custom logo, colors, organization name
- **Theme Colors** - Full color customization with live preview
- **Logo Upload** - Upload custom images or use preset emojis
- **Mission Statement** - Customizable about section

### 📊 Impact & Analytics
- **Hours Tracking** - Total volunteer hours with monthly trends
- **Community Value** - Estimated dollar value of volunteer work
- **Leaderboards** - Top volunteers with medal indicators
- **Event Breakdown** - Hours per event with visual charts

### 🔒 Security & Privacy
- **Role-Based Access** - Admin and member roles
- **Password Security** - Secure password reset with crypto tokens
- **Rate Limiting** - Protection against abuse
- **CORS Protection** - Configurable cross-origin restrictions

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- Email account (Gmail, SendGrid, etc.)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd volunteerhub

# Run setup
chmod +x setup.sh
./setup.sh

# Access application
# Open http://localhost:3001
```

That's it! The setup script handles everything.

### First Login

1. Click **"Admin Login"** on landing page
2. Use default credentials:
   - Email: `admin@volunteerhub.org`
   - Password: `admin123`
3. **Change password immediately!**

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Complete production deployment
- **[server/README.md](server/README.md)** - Email server documentation

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, start email server
cd server
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

## 🐳 Docker Commands

### Using Makefile (Recommended)

```bash
make help       # Show all commands
make start      # Start services
make stop       # Stop services
make logs       # View logs
make backup     # Create backup
make health     # Check health
make test       # Test email
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild
docker-compose build --no-cache
```

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Configure `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=noreply@yourdomain.com
```

### Other Providers

- **SendGrid**: Use API key as password
- **Mailgun**: Use SMTP credentials from dashboard
- **AWS SES**: Use SMTP credentials from AWS console

## 🔐 Security

### Default Credentials
- **Admin Email**: `admin@volunteerhub.org`
- **Admin Password**: `admin123`
- **⚠️ Change immediately after first login!**

### Security Features
- ✅ Cryptographically secure password reset tokens
- ✅ Rate limiting on all endpoints
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ XSS protection

## 💾 Backup & Restore

### Create Backup

```bash
make backup
```

### Restore Backup

```bash
make restore
```

### Automated Backups

Add to crontab:
```bash
0 2 * * * /path/to/volunteerhub/backup.sh
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3001/api/email/health
```

### View Logs

```bash
docker-compose logs -f app
```

### Resource Usage

```bash
docker stats
```

## 🎯 Use Cases

### Nonprofit Organizations
- Manage volunteer events
- Track volunteer hours
- Send thank-you emails
- Generate impact reports

### Community Groups
- Organize community service
- Coordinate volunteers
- Track participation
- Recognize top contributors

### Educational Institutions
- Manage student volunteers
- Track service hours
- Coordinate events
- Generate reports

### Corporate Social Responsibility
- Organize employee volunteering
- Track CSR hours
- Manage events
- Report impact

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React/Vite)  │
└────────┬────────┘
         │
┌────────▼────────┐
│   Backend API   │
│   (Express.js)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│Redis │  │ SMTP │
│Cache │  │Server│
└──────┘  └──────┘
```

## 📦 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Email**: Nodemailer with real SMTP
- **Cache**: Redis
- **Database**: localStorage (browser-based)
- **Containerization**: Docker, Docker Compose
- **Reverse Proxy**: Nginx (production)

## 🔄 Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
make update
```

## 🐛 Troubleshooting

### Common Issues

**Email not sending:**
- Check SMTP credentials in `.env`
- Verify App Password for Gmail
- Test with `make test`

**Can't access application:**
- Check if services are running: `docker-compose ps`
- Check port availability: `sudo lsof -i :3001`
- Restart: `make restart`

**High memory usage:**
- Clear Redis cache: `docker-compose exec redis redis-cli FLUSHALL`
- Check logs: `docker-compose logs app`

See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for detailed troubleshooting.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with React, Express, and Node.js
- Email delivery powered by Nodemailer
- UI components from Lucide Icons
- Styled with Tailwind CSS

## 📚 Complete Documentation

### 🚀 Getting Started
- **[INDEX.md](INDEX.md)** - Complete documentation index
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute quick start
- **[INSTALL.md](INSTALL.md)** - All installation methods
- **[SETUP.md](SETUP.md)** - Complete setup guide

### 🏗️ Installation & Deployment
- **[INSTALL.md](INSTALL.md)** - Installation methods (Docker, manual, dev)
- **[SETUP.md](SETUP.md)** - Configuration and first-time setup
- **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Production deployment
- **[DOCKER_SETUP_COMPLETE.md](DOCKER_SETUP_COMPLETE.md)** - Docker details

### 📧 Email System
- **[EMAIL_SERVER.md](EMAIL_SERVER.md)** - Email architecture and API
- **[server/README.md](server/README.md)** - Email server documentation

### 🎨 Customization
- **[COLOR_AND_LOGO_CUSTOMIZATION.md](COLOR_AND_LOGO_CUSTOMIZATION.md)** - Branding and theming
- **[PASSWORD_MANAGEMENT.md](PASSWORD_MANAGEMENT.md)** - Password features

### 🔧 Technical
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Technical implementation
- **[server/README.md](server/README.md)** - API documentation

### 🐛 Troubleshooting
- **[BUG_REPORT.md](BUG_REPORT.md)** - Known issues
- **[BUG_FIXES_APPLIED.md](BUG_FIXES_APPLIED.md)** - Applied fixes

## 📞 Support

### Documentation
- **[INDEX.md](INDEX.md)** - Start here for all docs
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[INSTALL.md](INSTALL.md)** - Installation help
- **[SETUP.md](SETUP.md)** - Setup assistance
- **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Production support

### Quick Commands
```bash
make help       # Show all commands
make setup      # Run setup
make start      # Start services
make logs       # View logs
make health     # Check health
make test       # Test email
```

## 🌟 Features Roadmap

- [ ] PostgreSQL database integration
- [ ] Multi-tenant support
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] API webhooks
- [ ] Custom email templates
- [ ] Volunteer scheduling
- [ ] GPS check-in

---

## 🎯 Quick Start

```bash
# 1. Clone repository
git clone <your-repo-url>
cd volunteerhub

# 2. Run setup
chmod +x setup.sh
./setup.sh

# 3. Access application
# Open http://localhost:3001
```

**Default Login:**
- Email: `admin@volunteerhub.org`
- Password: `admin123`

⚠️ **Change password immediately!**

---

**Made with ❤️ for volunteer organizations worldwide**

[📚 Documentation Index](INDEX.md) | [🚀 Quick Start](QUICKSTART.md) | [🔧 Installation](INSTALL.md) | [⚙️ Setup](SETUP.md) | [🏭 Production](PRODUCTION_SETUP.md)
