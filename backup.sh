#!/bin/bash

# ============================================
# VolunteerHub Backup Script
# ============================================

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔒 Creating backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application data
echo "📦 Backing up application data..."
docker-compose exec -T app tar czf /tmp/app-backup-$DATE.tar.gz /app/data 2>/dev/null || echo "No app data to backup"
docker-compose cp app:/tmp/app-backup-$DATE.tar.gz $BACKUP_DIR/ 2>/dev/null || echo "No app backup created"

# Backup Redis
echo "💾 Backing up Redis..."
docker-compose exec -T redis redis-cli -a ${REDIS_PASSWORD:-volunteerhub_redis_password} BGSAVE
sleep 2
docker-compose cp redis:/data/dump.rdb $BACKUP_DIR/redis-backup-$DATE.rdb 2>/dev/null || echo "No Redis backup created"

# Backup environment
echo "⚙️  Backing up environment..."
cp .env $BACKUP_DIR/env-backup-$DATE

# Backup logs (last 7 days)
echo "📝 Backing up logs..."
docker-compose logs --tail=10000 > $BACKUP_DIR/logs-$DATE.txt 2>/dev/null || echo "No logs to backup"

# Clean up old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -type f -mtime +7 -delete

# Show backup size
echo ""
echo "✅ Backup complete!"
echo "📊 Backup size: $(du -sh $BACKUP_DIR | cut -f1)"
echo "📁 Backup location: $BACKUP_DIR"
echo ""
ls -lh $BACKUP_DIR | tail -n 10
