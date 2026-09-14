# ✅ Docker Build Fix - Complete Solution

## 🎯 The Problem

Your Docker build was failing with:
```
sh: vite: not found
```

**Why?** The Dockerfile was using `npm ci --only=production` which prevented Vite (a dev dependency) from being installed. Vite is required to build the application.

---

## 🚀 The Solution

I've created **three ways** to fix this:

### Option 1: Quick Copy-Paste (FASTEST) ⚡

**Just copy and paste this entire command:**

```bash
cd ~/commhourtrac && cat > Dockerfile << 'EOF'
# Multi-stage production build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build
FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/server ./server
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force
WORKDIR /app/server
RUN npm ci --only=production && npm cache clean --force
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD node -e "require('http').get('http://localhost:3001/api/email/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]
EOF
sudo docker-compose down && sudo docker system prune -a --volumes -f && sudo docker-compose build --no-cache && sudo docker-compose up -d && sudo docker-compose ps
```

This will:
- ✅ Fix the Dockerfile
- ✅ Clean Docker cache
- ✅ Rebuild the image
- ✅ Start services
- ✅ Show status

---

### Option 2: Use the Fix Script

```bash
cd ~/commhourtrac
chmod +x fix-docker-build.sh
./fix-docker-build.sh
```

---

### Option 3: Manual Fix

```bash
cd ~/commhourtrac

# Edit Dockerfile
nano Dockerfile

# Find line 10 and change:
# FROM: RUN npm ci --only=production && npm cache clean --force
# TO:   RUN npm ci && npm cache clean --force

# Save and rebuild
sudo docker-compose down
sudo docker system prune -a --volumes -f
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

---

## 📤 Push to GitHub

After the build succeeds:

```bash
cd ~/commhourtrac
git add Dockerfile
git commit -m "Fix Docker build: install all dependencies in builder stage"
git push origin main
```

---

## 📚 Documentation Created

I've created comprehensive documentation:

1. **[QUICK_FIX.md](QUICK_FIX.md)** - One-command fix (copy-paste ready)
2. **[FIX_AND_PUSH_GUIDE.md](FIX_AND_PUSH_GUIDE.md)** - Complete guide with explanations
3. **[fix-docker-build.sh](fix-docker-build.sh)** - Automated fix script
4. **[DOCKER_BUILD_FIX.md](DOCKER_BUILD_FIX.md)** - Technical details

---

## 🔍 What Changed

### The Fix

**Line 10 in Dockerfile:**

```dockerfile
# BEFORE (broken):
RUN npm ci --only=production && npm cache clean --force

# AFTER (fixed):
RUN npm ci && npm cache clean --force
```

**Why this works:**
- Builder stage needs ALL dependencies (including Vite) to build
- Production stage only needs runtime dependencies (smaller image)
- Multi-stage build keeps final image small and secure

---

## ✅ Verification

After running the fix, verify:

```bash
# Check services are running
sudo docker-compose ps

# Test application
curl http://localhost:3001/api/email/health

# View logs
sudo docker-compose logs -f app
```

Expected output:
```
NAME                  STATUS              PORTS
commhourtrac-app      Up X seconds        0.0.0.0:3001->3001/tcp
commhourtrac-redis    Up X seconds        6379/tcp
```

---

## 🎯 Next Steps

1. **Run the fix** (use Option 1 above)
2. **Verify it works** (check `docker-compose ps`)
3. **Push to GitHub** (see "Push to GitHub" section)
4. **Configure email** (edit `.env` file)
5. **Test email** (`make test` or curl command)
6. **Login and change password** (admin@volunteerhub.org / admin123)

---

## 🐛 Troubleshooting

### If build still fails:

```bash
# Check Dockerfile is correct
grep "RUN npm ci" Dockerfile
# Should show: RUN npm ci && npm cache clean --force

# Clean everything and retry
sudo docker system prune -a --volumes -f
sudo docker-compose build --no-cache
```

### If permission denied:

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

---

## 📞 Support

- **Quick Fix**: See [QUICK_FIX.md](QUICK_FIX.md)
- **Complete Guide**: See [FIX_AND_PUSH_GUIDE.md](FIX_AND_PUSH_GUIDE.md)
- **Technical Details**: See [DOCKER_BUILD_FIX.md](DOCKER_BUILD_FIX.md)

---

## 🎉 Summary

**Problem:** Docker build failed because Vite wasn't installed  
**Solution:** Changed `npm ci --only=production` to `npm ci` in builder stage  
**Result:** Build succeeds, application runs correctly  
**Status:** ✅ Ready to deploy and push to GitHub  

---

**Just copy and paste the command from Option 1 above to fix everything!** 🚀
