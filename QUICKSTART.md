# 🚀 VolunteerHub - Quick Start Guide

Get up and running in **5 minutes**!

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (2.0+)
- An email account for sending notifications (Gmail, SendGrid, etc.)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd volunteerhub
```

### 2. Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

The setup script will:
- ✅ Create configuration files
- ✅ Generate secure passwords
- ✅ Start all services
- ✅ Test email configuration
- ✅ Verify system health

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:3001
```

## First-Time Login

1. Click **"Admin Login"** on the landing page
2. Use the default credentials shown on the first visit:
   - **Email:** `admin@volunteerhub.org`
   - **Password:** `admin123`
3. **⚠️ IMPORTANT:** Change the default password immediately!

## Configuration

### Email Setup

Edit the `.env` file with your email credentials:

```bash
nano .env
```

**Gmail Example:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password  # Use App Password, not regular password
SMTP_FROM=noreply@yourdomain.com
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification if not already enabled
3. Generate a new App Password
4. Copy the 16-character password

### Test Email

```bash
# Using Makefile
make test

# Or manually
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "orgName": "VolunteerHub"}'
```

## Common Commands

### Using Makefile (Recommended)

```bash
# View all commands
make help

# Start services
make start

# Stop services
make stop

# View logs
make logs

# Create backup
make backup

# Check health
make health
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

## What's Next?

### 1. Customize Your Organization

Go to **Admin → Settings → Branding** to:
- Set organization name
- Upload logo
- Choose theme colors
- Configure contact information

### 2. Create Events

Go to **Admin → Events → New Event** to:
- Create volunteer events
- Set capacity and fees
- Configure waivers
- Manage registrations

### 3. Invite Members

Go to **Admin → Members → Add Member** to:
- Add volunteers manually
- Or share the registration link

### 4. Track Impact

Go to **Admin → Impact** to see:
- Total volunteer hours
- Community value
- Event statistics
- Medal distribution

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Restart services
docker-compose restart

# Reset everything (WARNING: Deletes data)
docker-compose down -v
./setup.sh
```

### Email Not Working

1. Verify SMTP credentials in `.env`
2. For Gmail, ensure you're using an App Password
3. Test connection:
   ```bash
   make test
   ```

### Can't Access Application

1. Check if services are running:
   ```bash
   docker-compose ps
   ```

2. Check port availability:
   ```bash
   sudo lsof -i :3001
   ```

3. Restart services:
   ```bash
   make restart
   ```

## Production Deployment

For production deployment with SSL, see [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)

**Quick Production Setup:**

1. Get SSL certificate:
   ```bash
   mkdir -p nginx/ssl
   # Add your certificates to nginx/ssl/cert.pem and nginx/ssl/key.pem
   ```

2. Update CORS in `.env`:
   ```bash
   CORS_ORIGIN=https://yourdomain.com
   ```

3. Start with production profile:
   ```bash
   docker-compose --profile production up -d
   ```

## Backup & Restore

### Create Backup

```bash
make backup
```

Backups are stored in `./backups/` directory.

### Restore Backup

```bash
make restore
```

## Support

- **Documentation:** [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)
- **Issues:** Check logs with `make logs`
- **Health Check:** `make health`

## Next Steps

1. ✅ Change default admin password
2. ✅ Configure email settings
3. ✅ Customize branding
4. ✅ Create first event
5. ✅ Invite volunteers
6. ✅ Set up backups
7. ✅ Configure SSL (production)

---

**Need Help?** Run `make help` for all available commands or check [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for detailed documentation.

🎉 **You're all set! Start managing your volunteers now!**
