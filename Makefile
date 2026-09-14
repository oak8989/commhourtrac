.PHONY: help setup start stop restart logs build update backup restore clean test health

# Default target
help:
	@echo "VolunteerHub - Production Management"
	@echo ""
	@echo "Usage:"
	@echo "  make setup      - Run first-time setup"
	@echo "  make start      - Start all services"
	@echo "  make stop       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - View logs (Ctrl+C to exit)"
	@echo "  make build      - Rebuild containers"
	@echo "  make update     - Update to latest version"
	@echo "  make backup     - Create backup"
	@echo "  make restore    - Restore from backup"
	@echo "  make clean      - Remove all containers and volumes"
	@echo "  make test       - Test email configuration"
	@echo "  make health     - Check service health"
	@echo ""

# First-time setup
setup:
	@chmod +x setup.sh
	@./setup.sh

# Start services
start:
	@echo "🚀 Starting services..."
	@docker-compose up -d
	@echo "✅ Services started"
	@echo "🌐 Access: http://localhost:3001"

# Stop services
stop:
	@echo "🛑 Stopping services..."
	@docker-compose down
	@echo "✅ Services stopped"

# Restart services
restart:
	@echo "🔄 Restarting services..."
	@docker-compose restart
	@echo "✅ Services restarted"

# View logs
logs:
	@docker-compose logs -f

# Build containers
build:
	@echo "🏗️  Building containers..."
	@docker-compose build --no-cache
	@echo "✅ Build complete"

# Update application
update:
	@echo "📥 Pulling latest changes..."
	@git pull origin main
	@echo "🏗️  Rebuilding containers..."
	@docker-compose down
	@docker-compose build --no-cache
	@docker-compose up -d
	@echo "✅ Update complete"

# Create backup
backup:
	@chmod +x backup.sh
	@./backup.sh

# Restore from backup
restore:
	@echo "📦 Available backups:"
	@ls -lh backups/ 2>/dev/null || echo "No backups found"
	@echo ""
	@read -p "Enter backup date (YYYYMMDD_HHMMSS): " BACKUP_DATE; \
	echo "Restoring backup $$BACKUP_DATE..."; \
	docker-compose down; \
	docker-compose up -d app redis; \
	docker-compose cp backups/app-backup-$$BACKUP_DATE.tar.gz app:/tmp/; \
	docker-compose exec app tar xzf /tmp/app-backup-$$BACKUP_DATE.tar.gz -C /; \
	docker-compose cp backups/redis-backup-$$BACKUP_DATE.rdb redis:/data/dump.rdb; \
	docker-compose restart redis; \
	cp backups/env-backup-$$BACKUP_DATE .env; \
	docker-compose restart; \
	echo "✅ Restore complete"

# Clean everything
clean:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (yes/no): " CONFIRM; \
	if [ "$$CONFIRM" = "yes" ]; then \
		docker-compose down -v; \
		rm -rf backups/*; \
		echo "✅ Cleanup complete"; \
	else \
		echo "❌ Cancelled"; \
	fi

# Test email
test:
	@read -p "Enter email address: " EMAIL; \
	curl -X POST http://localhost:3001/api/email/test \
		-H "Content-Type: application/json" \
		-d "{\"to\": \"$$EMAIL\", \"orgName\": \"VolunteerHub\"}"

# Check health
health:
	@echo "🔍 Checking service health..."
	@echo ""
	@echo "📊 Container Status:"
	@docker-compose ps
	@echo ""
	@echo "🏥 Application Health:"
	@curl -s http://localhost:3001/api/email/health | jq || echo "Application not responding"
	@echo ""
	@echo "💾 Redis Health:"
	@docker-compose exec -T redis redis-cli -a ${REDIS_PASSWORD:-volunteerhub_redis_password} ping || echo "Redis not responding"
	@echo ""
	@echo "💿 Disk Usage:"
	@docker system df

# Development mode
dev:
	@echo "🔧 Starting in development mode..."
	@docker-compose --profile development up -d
	@echo "📧 MailHog UI: http://localhost:8025"
	@echo "🌐 Application: http://localhost:3001"

# Production mode with SSL
production:
	@echo "🔒 Starting in production mode with SSL..."
	@docker-compose --profile production up -d
	@echo "🌐 Application: https://localhost"

# View resource usage
stats:
	@docker stats

# Shell into app container
shell:
	@docker-compose exec app sh

# Reset database (WARNING: Deletes all data)
reset:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (yes/no): " CONFIRM; \
	if [ "$$CONFIRM" = "yes" ]; then \
		docker-compose down -v; \
		docker-compose up -d; \
		echo "✅ Reset complete"; \
	else \
		echo "❌ Cancelled"; \
	fi
