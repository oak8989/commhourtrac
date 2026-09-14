# 🚀 IMMEDIATE FIX - Copy & Paste This

## Quick Fix Command

**Copy this ENTIRE block and paste it into your terminal:**

```bash
cd ~/commhourtrac && \
cat > Dockerfile << 'EOF' && \
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
sudo docker-compose down && \
sudo docker system prune -a --volumes -f && \
sudo docker-compose build --no-cache && \
sudo docker-compose up -d && \
sudo docker-compose ps
```

---

## What This Does

1. ✅ Updates Dockerfile with correct `npm ci` command
2. ✅ Stops all containers
3. ✅ Cleans Docker cache completely
4. ✅ Rebuilds image from scratch
5. ✅ Starts services
6. ✅ Shows status

---

## After Running

You should see output like:
```
NAME                  STATUS              PORTS
commhourtrac-app      Up 5 seconds        0.0.0.0:3001->3001/tcp
commhourtrac-redis    Up 5 seconds        6379/tcp
```

Test the application:
```bash
curl http://localhost:3001/api/email/health
```

---

## Push to GitHub

After the build succeeds, push to GitHub:

```bash
cd ~/commhourtrac && \
git add Dockerfile && \
git commit -m "Fix Docker build: install all dependencies in builder stage" && \
git push origin main
```

---

## If It Still Fails

Run this diagnostic:
```bash
echo "=== Dockerfile line 10 ===" && \
grep "RUN npm ci" Dockerfile && \
echo "" && \
echo "=== Docker status ===" && \
sudo docker-compose ps && \
echo "" && \
echo "=== Recent logs ===" && \
sudo docker-compose logs --tail=20 app
```

---

## Need Help?

Check the detailed guide: [FIX_AND_PUSH_GUIDE.md](FIX_AND_PUSH_GUIDE.md)
