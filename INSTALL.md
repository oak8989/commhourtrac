# 🔧 Installation Guide

Complete installation instructions for VolunteerHub - all methods, all platforms.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
  - [Method 1: Docker (Recommended)](#method-1-docker-recommended)
  - [Method 2: Docker Compose (Production)](#method-2-docker-compose-production)
  - [Method 3: Manual Installation](#method-3-manual-installation)
  - [Method 4: Development Setup](#method-4-development-setup)
- [Platform-Specific Instructions](#platform-specific-instructions)
  - [Ubuntu/Debian](#ubuntudebian)
  - [CentOS/RHEL](#centosrhel)
  - [macOS](#macos)
  - [Windows](#windows)
- [Post-Installation](#post-installation)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## Prerequisites

### Hardware Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 2 GB
- Disk: 10 GB
- Network: 100 Mbps

**Recommended:**
- CPU: 4 cores
- RAM: 4 GB
- Disk: 20 GB
- Network: 1 Gbps

### Software Requirements

**Required:**
- Node.js 18+ (for manual installation)
- Docker 20.10+ (for Docker installation)
- Docker Compose 2.0+ (for Docker Compose)
- Git (for cloning repository)

**Optional:**
- Nginx (for production reverse proxy)
- Redis (included in Docker setup)
- SSL Certificate (for production HTTPS)

### Email Account

You'll need an email account for sending notifications:
- **Gmail** (with App Password)
- **SendGrid** (recommended for production)
- **Mailgun**
- **AWS SES**
- **Any SMTP server**

---

## Installation Methods

### Method 1: Docker (Recommended)

**Best for:** Quick setup, testing, small deployments

#### Step 1: Install Docker

**Ubuntu/Debian:**
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Verify installation
docker --version
```

**macOS:**
```bash
# Download Docker Desktop from https://docker.com/products/docker-desktop
# Or use Homebrew
brew install --cask docker
```

**Windows:**
```powershell
# Download Docker Desktop from https://docker.com/products/docker-desktop
# Or use Chocolatey
choco install docker-desktop
```

#### Step 2: Clone Repository

```bash
git clone https://github.com/oak8989/commhourtrac.git
cd commhourtrac
```

#### Step 3: Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Create `.env` file from template
- Generate secure passwords
- Pull Docker images
- Start services
- Test email configuration
- Verify system health

#### Step 4: Access Application

Open your browser:
```
http://localhost:3001
```

**Default Credentials:**
- Email: `admin@volunteerhub.org`
- Password: `admin123`

⚠️ **Change password immediately!**

---

### Method 2: Docker Compose (Production)

**Best for:** Production deployments, multiple services

#### Step 1: Install Docker & Docker Compose

```bash
# Install Docker (see Method 1)

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

#### Step 2: Clone Repository

```bash
git clone https://github.com/oak8989/commhourtrac.git
cd commhourtrac
```

#### Step 3: Configure Environment

```bash
# Copy production template
cp .env.production .env

# Edit configuration
nano .env
```

**Required Configuration:**
```bash
# Email (choose one provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Redis
REDIS_PASSWORD=your-secure-password

# CORS
CORS_ORIGIN=https://yourdomain.com
```

#### Step 4: Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Step 5: Verify Installation

```bash
# Test application
curl http://localhost:3001/api/email/health

# Test email
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "orgName": "VolunteerHub"}'
```

---

### Method 3: Manual Installation

**Best for:** Custom environments, no Docker

#### Step 1: Install Node.js

```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

#### Step 2: Install Redis

```bash
# Ubuntu/Debian
sudo apt-get install -y redis-server

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis

# Verify
redis-cli ping
```

#### Step 3: Clone Repository

```bash
git clone https://github.com/oak8989/commhourtrac.git
cd commhourtrac
```

#### Step 4: Install Dependencies

```bash
# Frontend
npm install

# Email server
cd server
npm install
cd ..
```

#### Step 5: Configure Environment

```bash
cp .env.production .env
nano .env
```

#### Step 6: Build Application

```bash
npm run build
```

#### Step 7: Start Services

**Terminal 1 - Frontend:**
```bash
npm run preview
```

**Terminal 2 - Email Server:**
```bash
cd server
npm start
```

#### Step 8: Access Application

```
http://localhost:3001
```

---

### Method 4: Development Setup

**Best for:** Developers, testing, customization

#### Step 1: Install Dependencies

```bash
# Frontend
npm install

# Email server
cd server
npm install
cd ..
```

#### Step 2: Configure Development Environment

```bash
cp .env.development .env
```

#### Step 3: Start Development Servers

**Terminal 1 - Frontend (with hot reload):**
```bash
npm run dev
```

**Terminal 2 - Email Server (with auto-restart):**
```bash
cd server
npm run dev
```

#### Step 4: Access Application

```
Frontend: http://localhost:5173
Email API: http://localhost:3001
```

---

## Platform-Specific Instructions

### Ubuntu/Debian

#### Complete Installation Script

```bash
#!/bin/bash
# install-ubuntu.sh

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Install Git
sudo apt-get install -y git

echo "✅ Installation complete! Please log out and log back in."
```

### CentOS/RHEL

```bash
#!/bin/bash
# install-centos.sh

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Install Git
sudo yum install -y git

echo "✅ Installation complete! Please log out and log back in."
```

### macOS

```bash
#!/bin/bash
# install-macos.sh

# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker
brew install --cask docker

# Install Git
brew install git

# Start Docker
open -a Docker

echo "✅ Installation complete! Docker Desktop is starting..."
```

### Windows

```powershell
# install-windows.ps1

# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Docker
choco install docker-desktop -y

# Install Git
choco install git -y

Write-Host "✅ Installation complete! Please restart your computer."
```

---

## Post-Installation

### 1. Verify Installation

```bash
# Check services
docker-compose ps

# Test application
curl http://localhost:3001/api/email/health

# Check logs
docker-compose logs -f
```

### 2. Configure Email

Edit `.env` with your SMTP credentials:

```bash
nano .env
```

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Use the 16-character password in `.env`

### 3. Test Email

```bash
make test
# Or manually:
curl -X POST http://localhost:3001/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "orgName": "VolunteerHub"}'
```

### 4. First Login

1. Open http://localhost:3001
2. Click "Admin Login"
3. Use default credentials:
   - Email: `admin@volunteerhub.org`
   - Password: `admin123`
4. **Change password immediately!**

### 5. Customize Application

Go to **Admin → Settings → Branding** to:
- Set organization name
- Upload logo
- Choose theme colors
- Configure contact info

---

## Troubleshooting

### Docker Issues

**Problem:** Docker won't start
```bash
# Check Docker service
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Check logs
sudo journalctl -u docker
```

**Problem:** Permission denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in
# Or run:
newgrp docker
```

**Problem:** Port already in use
```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>

# Or change port in .env
PORT=3002
```

### Email Issues

**Problem:** Email not sending
```bash
# Test SMTP connection
docker-compose exec app telnet smtp.gmail.com 587

# Check email logs
docker-compose logs app | grep -i email

# Verify credentials
docker-compose exec app env | grep SMTP
```

**Problem:** Gmail authentication failed
- Ensure 2-Factor Authentication is enabled
- Use App Password (not regular password)
- Check App Password is 16 characters

### Application Issues

**Problem:** Application won't start
```bash
# Check logs
docker-compose logs app

# Restart services
docker-compose restart

# Reset everything (WARNING: Deletes data)
docker-compose down -v
./setup.sh
```

**Problem:** High memory usage
```bash
# Check memory
docker stats

# Clear Redis cache
docker-compose exec redis redis-cli -a $REDIS_PASSWORD FLUSHALL
```

### Network Issues

**Problem:** Can't access application
```bash
# Check if service is running
docker-compose ps

# Check port binding
sudo netstat -tulpn | grep 3001

# Test locally
curl http://localhost:3001
```

**Problem:** CORS errors
```bash
# Update CORS_ORIGIN in .env
CORS_ORIGIN=http://localhost:3001

# Restart services
docker-compose restart
```

---

## Next Steps

After successful installation:

1. **[SETUP.md](SETUP.md)** - Complete configuration guide
2. **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Production deployment
3. **[COLOR_AND_LOGO_CUSTOMIZATION.md](COLOR_AND_LOGO_CUSTOMIZATION.md)** - Branding
4. **[EMAIL_SERVER.md](EMAIL_SERVER.md)** - Email configuration

---

## Installation Checklist

Before proceeding to setup:

- [ ] Prerequisites installed (Docker/Node.js)
- [ ] Repository cloned
- [ ] Environment configured (`.env` file)
- [ ] Services started
- [ ] Application accessible at http://localhost:3001
- [ ] Email configuration tested
- [ ] Default admin password changed

---

## Support

### Documentation
- [Quick Start](QUICKSTART.md)
- [Setup Guide](SETUP.md)
- [Production Deployment](PRODUCTION_SETUP.md)

### Common Commands
```bash
make help       # Show all commands
make start      # Start services
make stop       # Stop services
make logs       # View logs
make health     # Check health
```

### Getting Help
1. Check [Troubleshooting](#troubleshooting) section
2. Review logs: `docker-compose logs -f`
3. Check health: `make health`
4. Read [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)

---

**Installation Complete?** → Continue to [SETUP.md](SETUP.md)

**Need Help?** → Check [Troubleshooting](#troubleshooting) or [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)
