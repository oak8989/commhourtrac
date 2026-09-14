#!/bin/bash

# ============================================
# VolunteerHub - Docker Build Fix Script
# ============================================
# This script fixes the Docker build issue by updating the Dockerfile
# to install ALL dependencies (including devDependencies) in the builder stage
# ============================================

set -e

echo "🔧 VolunteerHub Docker Build Fix"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the commhourtrac directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 Updating Dockerfile...${NC}"

# Create the corrected Dockerfile
cat > Dockerfile << 'EOF'
# Multi-stage production build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built assets
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/server ./server
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Install production dependencies for frontend
RUN npm ci --only=production && npm cache clean --force

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production && npm cache clean --force
WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/email/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init as init system
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server/index.js"]
EOF

echo -e "${GREEN}✓ Dockerfile updated${NC}"
echo ""

# Verify the fix
echo -e "${YELLOW}🔍 Verifying Dockerfile...${NC}"
if grep -q "RUN npm ci && npm cache clean --force" Dockerfile; then
    echo -e "${GREEN}✓ Dockerfile contains correct npm ci command${NC}"
else
    echo -e "${RED}❌ Error: Dockerfile update failed${NC}"
    exit 1
fi

if grep -q "\-\-only=production" Dockerfile | head -1 | grep -q "builder"; then
    echo -e "${RED}❌ Error: Dockerfile still contains --only=production in builder stage${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Dockerfile does not have --only=production in builder stage${NC}"
fi

echo ""
echo -e "${YELLOW}🧹 Cleaning Docker cache...${NC}"

# Stop services
sudo docker-compose down 2>/dev/null || true

# Remove containers
sudo docker-compose rm -f 2>/dev/null || true

# Remove old images
sudo docker rmi commhourtrac-app 2>/dev/null || true

# Clean build cache
sudo docker builder prune -a -f 2>/dev/null || true

# Clean system
sudo docker system prune -f 2>/dev/null || true

echo -e "${GREEN}✓ Docker cache cleaned${NC}"
echo ""

echo -e "${YELLOW}🏗️  Rebuilding Docker image...${NC}"

# Rebuild without cache
sudo docker-compose build --no-cache

echo -e "${GREEN}✓ Docker image built successfully${NC}"
echo ""

echo -e "${YELLOW}🚀 Starting services...${NC}"

# Start services
sudo docker-compose up -d

# Wait for services to start
sleep 5

echo -e "${GREEN}✓ Services started${NC}"
echo ""

echo -e "${YELLOW}🔍 Checking service status...${NC}"
sudo docker-compose ps

echo ""
echo -e "${YELLOW}🏥 Testing application health...${NC}"

# Test health endpoint
if curl -f http://localhost:3001/api/email/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Application is healthy and running!${NC}"
    echo ""
    echo "================================"
    echo -e "${GREEN}✅ Fix Complete!${NC}"
    echo "================================"
    echo ""
    echo -e "🌐 Access your application at: ${GREEN}http://localhost:3001${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo "1. Configure email settings in .env file"
    echo "2. Test email delivery with: make test"
    echo "3. Login with default credentials:"
    echo "   Email: admin@volunteerhub.org"
    echo "   Password: admin123"
    echo "4. Change the default password immediately!"
    echo ""
else
    echo -e "${RED}❌ Application health check failed${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    sudo docker-compose logs app
    exit 1
fi
