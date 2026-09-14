# VolunteerHub - Production Deployment Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 10GB disk space
- Domain name (optional, for SSL)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/oak8989/commhourtrac.git
cd commhourtrac

# 2. Run the setup script
chmod +x setup.sh
./setup.sh

# 3. Access the application
# Open http://localhost:3001 in your browser
```

The setup script will:
- ✅ Create configuration files
- ✅ Generate secure passwords
- ✅ Start all services
- ✅ Test email configuration
- ✅ Verify system health

---

## 📋 Manual Setup (Step-by-Step)

### 1. Environment Configuration

```bash
# Copy production environment template
cp .env.production .env

# Edit .env with your settings
nano .env
```

**Required Configuration:**

```bash
# Email (Choose ONE provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Gmail: Use App Password, not regular password
SMTP_FROM=noreply@yourdomain.com

# Redis (Auto-generated if empty)
REDIS_PASSWORD=your-secure-password

# CORS (Your domain)
CORS_ORIGIN=https://yourdomain.com
```

### 2. Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Verify Installation

```bash
# Test application health
curl http://localhost:3001/api/email/health

# Test email delivery
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "orgName": "VolunteerHub"}'
```

---

## 📧 Email Configuration

### Gmail Setup

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "VolunteerHub" as name
   - Copy the 16-character password

3. **Configure .env**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcdefghijklmnop  # 16-char App Password
   SMTP_FROM=noreply@yourdomain.com
   SMTP_SECURE=false
   ```

### SendGrid Setup

1. **Create SendGrid Account**
   - Sign up at https://sendgrid.com
   - Verify your domain

2. **Create API Key**
   - Go to Settings → API Keys
   - Create API Key with "Full Access"
   - Copy the API key

3. **Configure .env**
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.your-api-key-here
   SMTP_FROM=noreply@yourdomain.com
   ```

### Mailgun Setup

1. **Create Mailgun Account**
   - Sign up at https://mailgun.com
   - Add and verify your domain

2. **Get SMTP Credentials**
   - Go to Domains → Your Domain → SMTP Credentials
   - Create new credentials

3. **Configure .env**
   ```bash
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=your-mailgun-username
   SMTP_PASS=your-mailgun-password
   SMTP_FROM=noreply@yourdomain.com
   ```

### Test Email Delivery

```bash
# Send test email
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "orgName": "VolunteerHub"}'

# Check email status
curl http://localhost:3001/api/email/health
```

---

## 🔒 SSL/HTTPS Setup (Production)

### Option 1: Let's Encrypt (Recommended)

1. **Install Certbot**
   ```bash
   sudo apt-get install certbot
   ```

2. **Generate Certificate**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. **Copy Certificates**
   ```bash
   mkdir -p nginx/ssl
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
   ```

4. **Enable Nginx Profile**
   ```bash
   # Edit docker-compose.yml, remove 'profiles: [production]' from nginx service
   # Or use:
   docker-compose --profile production up -d
   ```

### Option 2: Self-Signed Certificate (Development)

```bash
# Generate self-signed certificate
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/CN=localhost"

# Enable nginx
docker-compose --profile production up -d
```

### Option 3: Cloudflare (Easiest)

1. **Add your domain to Cloudflare**
2. **Enable SSL/TLS**
3. **Point DNS to your server**
4. **No certificate management needed**

---

## 💾 Backup & Restore

### Backup

```bash
# Create backup directory
mkdir -p backups

# Backup application data
docker-compose exec app tar czf /tmp/app-backup.tar.gz /app/data

# Copy backup to host
docker-compose cp app:/tmp/app-backup.tar.gz ./backups/app-backup-$(date +%Y%m%d).tar.gz

# Backup Redis
docker-compose exec redis redis-cli -a $REDIS_PASSWORD BGSAVE
docker-compose cp redis:/data/dump.rdb ./backups/redis-backup-$(date +%Y%m%d).rdb

# Backup environment
cp .env ./backups/env-backup-$(date +%Y%m%d)
```

### Automated Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/volunteerhub/backup.sh
```

Create `backup.sh`:
```bash
#!/bin/bash
cd /path/to/volunteerhub
mkdir -p backups
docker-compose exec app tar czf /tmp/app-backup.tar.gz /app/data
docker-compose cp app:/tmp/app-backup.tar.gz ./backups/app-backup-$(date +%Y%m%d).tar.gz
docker-compose exec redis redis-cli -a $REDIS_PASSWORD BGSAVE
docker-compose cp redis:/data/dump.rdb ./backups/redis-backup-$(date +%Y%m%d).rdb
# Keep only last 7 days
find backups -type f -mtime +7 -delete
```

### Restore

```bash
# Stop services
docker-compose down

# Restore application data
docker-compose up -d app
docker-compose cp ./backups/app-backup-YYYYMMDD.tar.gz app:/tmp/
docker-compose exec app tar xzf /tmp/app-backup-YYYYMMDD.tar.gz -C /

# Restore Redis
docker-compose up -d redis
docker-compose cp ./backups/redis-backup-YYYYMMDD.rdb redis:/data/dump.rdb
docker-compose restart redis

# Restore environment
cp ./backups/env-backup-YYYYMMDD .env

# Restart all services
docker-compose restart
```

---

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 app
```

### Health Checks

```bash
# Application health
curl http://localhost:3001/api/email/health

# Redis health
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Service status
docker-compose ps
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Volume usage
docker volume ls
```

### Monitoring Tools

**Prometheus + Grafana (Advanced)**

```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## 🔧 Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:3001/api/email/health
```

### Update Dependencies

```bash
# Update Node.js packages
docker-compose exec app npm update

# Restart services
docker-compose restart
```

### Database Migration

```bash
# If using PostgreSQL (future)
docker-compose exec app npm run migrate
```

### Clear Cache

```bash
# Clear Redis cache
docker-compose exec redis redis-cli -a $REDIS_PASSWORD FLUSHALL

# Clear application cache
docker-compose exec app rm -rf /app/cache/*
```

---

## 🚨 Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues:
# 1. Port already in use
sudo lsof -i :3001
# Solution: Change PORT in .env or stop conflicting service

# 2. Missing environment variables
docker-compose config
# Solution: Check .env file exists and has all required variables

# 3. Insufficient memory
docker stats
# Solution: Increase Docker memory limit
```

### Email Not Sending

```bash
# Test SMTP connection
docker-compose exec app telnet smtp.gmail.com 587

# Check email logs
docker-compose logs app | grep -i email

# Verify credentials
docker-compose exec app node -e "
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  transporter.verify().then(console.log).catch(console.error);
"
```

### Redis Connection Issues

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli -a $REDIS_PASSWORD ping

# Check Redis logs
docker-compose logs redis

# Reset Redis password
docker-compose down -v  # WARNING: Deletes all data
# Edit .env with new REDIS_PASSWORD
docker-compose up -d
```

### High Memory Usage

```bash
# Check memory usage
docker stats

# Limit memory in docker-compose.yml
# Already configured with 512M limit

# Clear cache
docker-compose exec redis redis-cli -a $REDIS_PASSWORD FLUSHALL
```

### Disk Space Issues

```bash
# Check disk usage
docker system df

# Clean up unused images
docker image prune -a

# Clean up unused volumes
docker volume prune

# Clean up build cache
docker builder prune
```

---

## 🔐 Security Best Practices

### 1. Change Default Credentials
```bash
# After first login, change admin password immediately
# Navigate to Admin → Profile → Change Password
```

### 2. Use Strong Passwords
```bash
# Generate strong password
openssl rand -base64 32
```

### 3. Enable HTTPS
- Use Let's Encrypt for free SSL certificates
- Redirect all HTTP to HTTPS
- Enable HSTS headers

### 4. Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 80/tcp   # HTTP (redirects to HTTPS)
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 5. Regular Updates
```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade

# Update Docker images
docker-compose pull
docker-compose up -d
```

### 6. Backup Regularly
- Daily automated backups
- Store backups off-site
- Test restore procedure monthly

### 7. Monitor Logs
```bash
# Set up log monitoring
docker-compose logs -f | grep -i "error\|warning"
```

### 8. Rate Limiting
- Already configured in nginx.conf
- Adjust RATE_LIMIT_MAX in .env based on traffic

### 9. CORS Configuration
```bash
# Set specific domain, not *
CORS_ORIGIN=https://yourdomain.com
```

### 10. Email Security
- Use App Passwords, not regular passwords
- Enable 2FA on email accounts
- Use dedicated email account for application

---

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale app instances
docker-compose up -d --scale app=3

# Add load balancer (nginx)
# Already configured in nginx.conf
```

### Vertical Scaling

```bash
# Increase resources in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
```

### Database Scaling

For high-traffic deployments, consider:
- PostgreSQL with read replicas
- Redis Cluster
- Separate database server

---

## 🆘 Support

### Logs
```bash
docker-compose logs -f
```

### Health Check
```bash
curl http://localhost:3001/api/email/health
```

### Reset Everything
```bash
# WARNING: Deletes all data
docker-compose down -v
rm -rf backups/*
./setup.sh
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## ✅ Production Checklist

- [ ] Environment variables configured
- [ ] SMTP credentials tested
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Default passwords changed
- [ ] CORS origin set correctly
- [ ] Rate limiting configured
- [ ] Logs reviewed
- [ ] Load testing completed
- [ ] Documentation reviewed

---

**Need Help?** Check the troubleshooting section or review the logs with `docker-compose logs -f`.
