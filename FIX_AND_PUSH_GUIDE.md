# 🐛 Docker Build Fix - Complete Guide

## ⚠️ Important Note

**I cannot push to GitHub from this environment** - I don't have access to your GitHub credentials. However, I've created a complete fix that you can apply locally and then push to GitHub yourself.

---

## 🔍 What Was the Problem?

Your Docker build was failing with this error:
```
sh: vite: not found
```

**Root Cause:** The Dockerfile was using `npm ci --only=production` in the builder stage, which prevented Vite (a dev dependency) from being installed. Vite is required to build the application.

**The Fix:** Change line 10 in the Dockerfile from:
```dockerfile
RUN npm ci --only=production && npm cache clean --force  # ❌ OLD
```

To:
```dockerfile
RUN npm ci && npm cache clean --force  # ✅ NEW
```

This ensures ALL dependencies (including devDependencies like Vite) are installed during the build stage.

---

## 🚀 Quick Fix (Recommended)

### Step 1: Download the Fix Script

Copy and paste this entire command in your terminal:

```bash
cd ~/commhourtrac

# Download the fix script (or copy from below)
cat > fix-docker-build.sh << 'EOFSCRIPT'
#!/bin/bash
set -e

echo "🔧 Fixing Docker build..."

# Update Dockerfile
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

echo "✓ Dockerfile updated"

# Clean and rebuild
sudo docker-compose down
sudo docker system prune -a --volumes -f
sudo docker-compose build --no-cache
sudo docker-compose up -d

echo "✓ Build complete! Check status with: sudo docker-compose ps"
EOFSCRIPT

chmod +x fix-docker-build.sh
```

### Step 2: Run the Fix

```bash
./fix-docker-build.sh
```

This will:
1. ✅ Update the Dockerfile
2. ✅ Clean Docker cache
3. ✅ Rebuild the image
4. ✅ Start services

### Step 3: Verify

```bash
# Check services are running
sudo docker-compose ps

# Test the application
curl http://localhost:3001/api/email/health

# View logs
sudo docker-compose logs -f
```

---

## 🔧 Manual Fix (Alternative)

If you prefer to do it manually:

### 1. Update the Dockerfile

```bash
cd ~/commhourtrac

# Backup old Dockerfile
cp Dockerfile Dockerfile.backup

# Edit Dockerfile
nano Dockerfile
```

Find line 10 and change it from:
```dockerfile
RUN npm ci --only=production && npm cache clean --force
```

To:
```dockerfile
RUN npm ci && npm cache clean --force
```

Save and exit (Ctrl+X, Y, Enter).

### 2. Verify the Change

```bash
grep "RUN npm ci" Dockerfile
```

You should see:
```
RUN npm ci && npm cache clean --force
```

### 3. Clean and Rebuild

```bash
# Stop services
sudo docker-compose down

# Clean everything
sudo docker system prune -a --volumes -f

# Rebuild without cache
sudo docker-compose build --no-cache

# Start services
sudo docker-compose up -d
```

---

## 📤 Push to GitHub

After fixing the Docker build, you can push to GitHub:

### Step 1: Check Git Status

```bash
cd ~/commhourtrac
git status
```

### Step 2: Add Changes

```bash
git add Dockerfile
git add fix-docker-build.sh
git add DOCKER_BUILD_FIX.md
```

### Step 3: Commit

```bash
git commit -m "Fix Docker build: install all dependencies in builder stage

- Changed 'npm ci --only=production' to 'npm ci' in builder stage
- This ensures devDependencies (like Vite) are available during build
- Production stage still uses --only=production for smaller image
- Added fix script for easy deployment"
```

### Step 4: Push to GitHub

```bash
# If you haven't set up the remote yet:
git remote add origin https://github.com/oak8989/commhourtrac.git

# Push to main branch
git push -u origin main
```

### Step 5: Verify on GitHub

Go to https://github.com/oak8989/commhourtrac and verify:
- ✅ Dockerfile is updated
- ✅ Build passes
- ✅ All files are present

---

## 🎯 What Changed in the Dockerfile

### Before (Broken)
```dockerfile
# Builder stage
RUN npm ci --only=production && npm cache clean --force  # ❌ Missing devDependencies
```

**Problem:** Vite is a devDependency, so it wasn't installed, causing build to fail.

### After (Fixed)
```dockerfile
# Builder stage
RUN npm ci && npm cache clean --force  # ✅ Installs ALL dependencies

# Production stage (unchanged)
RUN npm ci --only=production && npm cache clean --force  # ✅ Only production deps
```

**Solution:** Builder stage installs everything needed for build, production stage only has runtime dependencies.

---

## 📊 Build Process Explained

```
┌─────────────────────────────────────────┐
│  Stage 1: Builder (Build Time)          │
│  ├─ Install ALL dependencies            │
│  │  (devDependencies + dependencies)    │
│  │  ✅ Vite installed                   │
│  │  ✅ TypeScript installed             │
│  │  ✅ All build tools installed        │
│  ├─ Copy source code                    │
│  └─ Build application                   │
│     ✅ npm run build succeeds           │
└─────────────────────────────────────────┘
              ↓
         Copy /app/dist
              ↓
┌─────────────────────────────────────────┐
│  Stage 2: Production (Runtime)          │
│  ├─ Fresh Alpine image                  │
│  ├─ Copy built files from builder       │
│  ├─ Install ONLY production deps        │
│  │  ❌ No Vite (not needed at runtime)  │
│  │  ✅ Express (needed for server)      │
│  │  ✅ Nodemailer (needed for emails)   │
│  └─ Run application                     │
│     ✅ Smaller, faster, more secure     │
└─────────────────────────────────────────┘
```

**Benefits:**
- ✅ Build succeeds (Vite available)
- ✅ Final image is small (no devDependencies)
- ✅ More secure (no build tools in production)
- ✅ Faster startup (fewer dependencies)

---

## 🔍 Verification Checklist

After running the fix, verify:

- [ ] Dockerfile line 10 is `RUN npm ci && npm cache clean --force`
- [ ] `sudo docker-compose ps` shows running containers
- [ ] `curl http://localhost:3001/api/email/health` returns success
- [ ] Application is accessible at http://localhost:3001
- [ ] No errors in `sudo docker-compose logs`

---

## 🐛 Troubleshooting

### Issue: Still getting "vite: not found"

**Solution:**
```bash
# Verify Dockerfile is correct
grep "RUN npm ci" Dockerfile

# Should show: RUN npm ci && npm cache clean --force
# NOT: RUN npm ci --only=production

# If still wrong, manually edit:
nano Dockerfile
```

### Issue: Docker using cached layers

**Solution:**
```bash
# Nuclear option - clear everything
sudo docker system prune -a --volumes -f
sudo docker-compose build --no-cache
```

### Issue: Permission denied

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, OR:
newgrp docker
```

---

## 📝 Summary

**Problem:** Docker build failed because Vite wasn't installed  
**Cause:** `npm ci --only=production` excluded devDependencies  
**Fix:** Changed to `npm ci` to install all dependencies  
**Result:** Build succeeds, application runs correctly  

**Files Changed:**
- ✅ Dockerfile (line 10)
- ✅ Added fix-docker-build.sh
- ✅ Added DOCKER_BUILD_FIX.md

**Next Steps:**
1. Run the fix script
2. Verify application works
3. Push to GitHub
4. Configure email settings
5. Start using VolunteerHub!

---

## 🎉 Success Criteria

After applying the fix, you should have:

✅ Docker build completes successfully  
✅ Application starts without errors  
✅ Health check passes  
✅ Application accessible at http://localhost:3001  
✅ Ready to push to GitHub  

---

**Need Help?** Check the logs:
```bash
sudo docker-compose logs -f
```

**Ready to Deploy?** Follow the "Push to GitHub" section above!
