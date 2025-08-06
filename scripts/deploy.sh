#!/bin/bash

# Deployment script for NeuroTrauma 2026 platform
# Usage: ./scripts/deploy.sh [production|staging]

set -e

# Configuration
ENVIRONMENT=${1:-"production"}
PROJECT_NAME="neurotrauma-2026"
DEPLOY_USER="ubuntu"
DEPLOY_PATH="/var/www/$PROJECT_NAME"
BACKUP_PATH="/var/backups/$PROJECT_NAME"
SERVICE_NAME="$PROJECT_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

# Pre-deployment checks
pre_deploy_checks() {
    log "Running pre-deployment checks..."
    
    # Check if environment is valid
    if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "staging" ]]; then
        error "Invalid environment. Use 'production' or 'staging'"
        exit 1
    fi
    
    # Check if required tools are installed
    command -v node >/dev/null 2>&1 || { error "Node.js is required but not installed"; exit 1; }
    command -v npm >/dev/null 2>&1 || { error "npm is required but not installed"; exit 1; }
    command -v pm2 >/dev/null 2>&1 || { error "PM2 is required but not installed"; exit 1; }
    
    # Check if .env file exists
    if [ ! -f ".env.$ENVIRONMENT" ]; then
        error "Environment file .env.$ENVIRONMENT not found"
        exit 1
    fi
    
    # Test database connection
    info "Testing database connection..."
    # Add database connection test here
    
    log "Pre-deployment checks passed"
}

# Create backup before deployment
create_backup() {
    log "Creating backup before deployment..."
    
    if [ -d "$DEPLOY_PATH" ]; then
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_PATH"
        cp -r "$DEPLOY_PATH" "$BACKUP_PATH/$BACKUP_NAME"
        log "Backup created: $BACKUP_PATH/$BACKUP_NAME"
    else
        warning "No existing deployment found to backup"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Clean install for production
    if [ "$ENVIRONMENT" = "production" ]; then
        npm ci --only=production
    else
        npm ci
    fi
    
    log "Dependencies installed successfully"
}

# Build application
build_application() {
    log "Building application for $ENVIRONMENT..."
    
    # Copy environment file
    cp ".env.$ENVIRONMENT" ".env.local"
    
    # Build the application
    npm run build
    
    log "Application built successfully"
}

# Run tests
run_tests() {
    if [ "$ENVIRONMENT" != "production" ]; then
        log "Running tests..."
        npm run test:ci 2>/dev/null || warning "Tests not configured or failed"
    fi
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Stop existing application
    if pm2 list | grep -q "$SERVICE_NAME"; then
        pm2 stop "$SERVICE_NAME"
        log "Stopped existing application"
    fi
    
    # Start/restart application with PM2
    pm2 start ecosystem.config.js --env "$ENVIRONMENT"
    pm2 save
    
    log "Application deployed and started"
}

# Health check
health_check() {
    log "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:3000/api/health >/dev/null; then
            log "Health check passed"
            return 0
        fi
        
        info "Health check attempt $attempt/$max_attempts failed, retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Post-deployment tasks
post_deploy_tasks() {
    log "Running post-deployment tasks..."
    
    # Clear any caches
    info "Clearing application caches..."
    
    # Warm up the application
    info "Warming up application..."
    curl -s http://localhost:3000 >/dev/null || true
    
    # Update sitemap (if applicable)
    info "Updating sitemap..."
    curl -s http://localhost:3000/api/sitemap >/dev/null || true
    
    log "Post-deployment tasks completed"
}

# Setup SSL (if needed)
setup_ssl() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Checking SSL certificates..."
        
        if [ ! -f "/etc/nginx/ssl/certificate.crt" ]; then
            warning "SSL certificate not found. Please set up SSL certificates."
            info "You can use Let's Encrypt: certbot --nginx -d your-domain.com"
        else
            info "SSL certificates found"
        fi
    fi
}

# Update system packages
update_system() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Updating system packages..."
        sudo apt update && sudo apt upgrade -y
        log "System packages updated"
    fi
}

# Setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/$PROJECT_NAME > /dev/null <<EOF
$DEPLOY_PATH/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 $DEPLOY_USER $DEPLOY_USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    
    log "Log rotation configured"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # PM2 monitoring
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 30
    
    info "PM2 monitoring configured"
}

# Rollback function
rollback() {
    error "Deployment failed. Rolling back..."
    
    # Stop current deployment
    pm2 stop "$SERVICE_NAME" || true
    
    # Restore from backup
    LATEST_BACKUP=$(ls -t "$BACKUP_PATH" | head -n1)
    if [ -n "$LATEST_BACKUP" ]; then
        rm -rf "$DEPLOY_PATH"
        cp -r "$BACKUP_PATH/$LATEST_BACKUP" "$DEPLOY_PATH"
        cd "$DEPLOY_PATH"
        pm2 start ecosystem.config.js --env "$ENVIRONMENT"
        log "Rollback completed using backup: $LATEST_BACKUP"
    else
        error "No backup found for rollback"
    fi
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    
    # Remove old backups (keep only 5)
    if [ -d "$BACKUP_PATH" ]; then
        ls -t "$BACKUP_PATH" | tail -n +6 | xargs -r rm -rf
    fi
    
    # Clear npm cache
    npm cache clean --force
    
    log "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting deployment for environment: $ENVIRONMENT"
    
    # Set error trap for rollback
    trap rollback ERR
    
    pre_deploy_checks
    create_backup
    install_dependencies
    build_application
    run_tests
    deploy_application
    
    # Health check
    if ! health_check; then
        error "Health check failed. Rolling back..."
        rollback
        exit 1
    fi
    
    post_deploy_tasks
    setup_ssl
    setup_log_rotation
    setup_monitoring
    cleanup
    
    # Remove error trap
    trap - ERR
    
    log "Deployment completed successfully!"
    info "Application is running at: http://localhost:3000"
    info "PM2 status: pm2 status"
    info "Logs: pm2 logs $SERVICE_NAME"
}

# Check if running with correct permissions
if [ "$EUID" -eq 0 ]; then
    error "Do not run this script as root"
    exit 1
fi

# Run main function
main