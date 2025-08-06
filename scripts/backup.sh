#!/bin/bash

# Backup script for NeuroTrauma 2026 platform
# Usage: ./scripts/backup.sh [database|files|full]

set -e

# Configuration
BACKUP_DIR="/var/backups/neurotrauma-2026"
DATE=$(date +%Y%m%d_%H%M%S)
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/neurotrauma"}
DATABASE_NAME="neurotrauma"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Create backup directory
create_backup_dir() {
    mkdir -p "$BACKUP_DIR/database"
    mkdir -p "$BACKUP_DIR/files"
    mkdir -p "$BACKUP_DIR/logs"
}

# Database backup
backup_database() {
    log "Starting database backup..."
    
    BACKUP_FILE="$BACKUP_DIR/database/mongodb_backup_$DATE.gz"
    
    if command -v mongodump &> /dev/null; then
        mongodump --uri="$MONGODB_URI" --archive="$BACKUP_FILE" --gzip
        log "Database backup completed: $BACKUP_FILE"
    else
        error "mongodump not found. Please install MongoDB tools."
        return 1
    fi
}

# Files backup
backup_files() {
    log "Starting files backup..."
    
    # Application files
    BACKUP_FILE="$BACKUP_DIR/files/app_files_$DATE.tar.gz"
    tar -czf "$BACKUP_FILE" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.git' \
        --exclude='logs' \
        --exclude='tmp' \
        /var/www/neurotrauma-2026 || true
    
    # Uploads directory
    if [ -d "/var/www/neurotrauma-2026/uploads" ]; then
        UPLOADS_BACKUP="$BACKUP_DIR/files/uploads_$DATE.tar.gz"
        tar -czf "$UPLOADS_BACKUP" /var/www/neurotrauma-2026/uploads
        log "Uploads backup completed: $UPLOADS_BACKUP"
    fi
    
    # SSL certificates
    if [ -d "/etc/nginx/ssl" ]; then
        SSL_BACKUP="$BACKUP_DIR/files/ssl_$DATE.tar.gz"
        tar -czf "$SSL_BACKUP" /etc/nginx/ssl
        log "SSL certificates backup completed: $SSL_BACKUP"
    fi
    
    log "Files backup completed: $BACKUP_FILE"
}

# Logs backup
backup_logs() {
    log "Starting logs backup..."
    
    LOGS_BACKUP="$BACKUP_DIR/logs/logs_$DATE.tar.gz"
    
    # Application logs
    if [ -d "/var/www/neurotrauma-2026/logs" ]; then
        tar -czf "$LOGS_BACKUP" /var/www/neurotrauma-2026/logs
    fi
    
    # Nginx logs
    if [ -d "/var/log/nginx" ]; then
        NGINX_LOGS="$BACKUP_DIR/logs/nginx_logs_$DATE.tar.gz"
        tar -czf "$NGINX_LOGS" /var/log/nginx
    fi
    
    log "Logs backup completed: $LOGS_BACKUP"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -type d -empty -delete
    
    log "Cleanup completed"
}

# Verify backup integrity
verify_backup() {
    local backup_file=$1
    
    if [ -f "$backup_file" ]; then
        if [ "${backup_file##*.}" = "gz" ]; then
            if gzip -t "$backup_file" 2>/dev/null; then
                log "Backup verification passed: $backup_file"
                return 0
            else
                error "Backup verification failed: $backup_file"
                return 1
            fi
        fi
    else
        error "Backup file not found: $backup_file"
        return 1
    fi
}

# Send notification (optional)
send_notification() {
    local status=$1
    local message=$2
    
    # Implement notification logic here (email, Slack, etc.)
    # Example: curl to webhook or send email
    log "Notification: $status - $message"
}

# Main backup function
main() {
    local backup_type=${1:-"full"}
    
    log "Starting backup process (Type: $backup_type)"
    
    create_backup_dir
    
    case $backup_type in
        "database")
            backup_database
            ;;
        "files")
            backup_files
            backup_logs
            ;;
        "full")
            backup_database
            backup_files
            backup_logs
            ;;
        *)
            error "Invalid backup type. Use: database, files, or full"
            exit 1
            ;;
    esac
    
    cleanup_old_backups
    
    # Calculate backup size
    BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    
    log "Backup process completed successfully"
    log "Total backup size: $BACKUP_SIZE"
    
    send_notification "SUCCESS" "Backup completed successfully. Size: $BACKUP_SIZE"
}

# Error handling
trap 'error "Backup script failed"; send_notification "FAILED" "Backup script encountered an error"; exit 1' ERR

# Check if running as root for system backups
if [ "$EUID" -ne 0 ] && [ "$1" != "database" ]; then
    warning "Some backups may require root privileges"
fi

# Run main function
main "$@"