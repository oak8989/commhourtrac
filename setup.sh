#!/bin/bash

# ============================================
# VolunteerHub First-Time Setup Script
# ============================================

set -e

echo "🚀 VolunteerHub Production Setup"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file from template...${NC}"
    cp .env.production .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env file with your configuration before continuing!${NC}"
    echo -e "${YELLOW}   - SMTP credentials for email delivery${NC}"
    echo -e "${YELLOW}   - Redis password${NC}"
    echo -e "${YELLOW}   - CORS origin (your domain)${NC}"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

# Generate secure passwords if not set
echo -e "${BLUE}🔐 Generating secure passwords...${NC}"

if [ -z "$REDIS_PASSWORD" ] || [ "$REDIS_PASSWORD" = "your-secure-redis-password-here" ]; then
    export REDIS_PASSWORD=$(openssl rand -base64 32)
    echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> .env
    echo -e "${GREEN}✓ Generated Redis password${NC}"
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose detected${NC}"
echo ""

# Pull images
echo -e "${BLUE}📦 Pulling Docker images...${NC}"
docker-compose pull
echo -e "${GREEN}✓ Images pulled successfully${NC}"
echo ""

# Start services
echo -e "${BLUE}🏗️  Starting services...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to initialize...${NC}"
sleep 10

# Check if app is running
echo -e "${BLUE}🔍 Checking application health...${NC}"
for i in {1..30}; do
    if curl -f http://localhost:3001/api/email/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Application is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Application failed to start. Check logs with: docker-compose logs app${NC}"
        exit 1
    fi
    echo -n "."
    sleep 2
done
echo ""

# Check Redis
echo -e "${BLUE}🔍 Checking Redis...${NC}"
if docker-compose exec -T redis redis-cli -a $REDIS_PASSWORD ping | grep -q PONG; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}❌ Redis is not responding${NC}"
    exit 1
fi
echo ""

# Test email configuration
echo -e "${BLUE}📧 Testing email configuration...${NC}"
read -p "Enter your email address to receive a test email: " TEST_EMAIL

if [ -z "$TEST_EMAIL" ]; then
    echo -e "${YELLOW}⚠️  Skipping email test${NC}"
else
    RESPONSE=$(curl -s -X POST http://localhost:3001/api/email/test \
        -H "Content-Type: application/json" \
        -d "{\"to\": \"$TEST_EMAIL\", \"orgName\": \"VolunteerHub\"}")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ Test email sent successfully!${NC}"
        echo -e "${GREEN}  Check your inbox at: $TEST_EMAIL${NC}"
    else
        echo -e "${RED}❌ Email test failed${NC}"
        echo -e "${YELLOW}  Response: $RESPONSE${NC}"
        echo -e "${YELLOW}  Check your SMTP configuration in .env file${NC}"
    fi
fi
echo ""

# Display access information
echo "================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================"
echo ""
echo -e "${BLUE}🌐 Access your application:${NC}"
echo "   URL: http://localhost:3001"
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose ps
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Backup data:      docker-compose exec app tar czf /backup/app-backup.tar.gz /app/data"
echo ""
echo -e "${BLUE}🔧 Admin Access:${NC}"
echo "   Navigate to the application and use the 'Admin Login' button"
echo "   Default credentials will be shown on first visit"
echo ""
echo -e "${YELLOW}⚠️  Security Reminders:${NC}"
echo "   1. Change default admin password immediately"
echo "   2. Configure proper CORS origin in .env"
echo "   3. Set up SSL certificate for production"
echo "   4. Regular backups recommended"
echo ""
echo -e "${GREEN}🎉 VolunteerHub is ready to use!${NC}"
