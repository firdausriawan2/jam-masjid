#!/bin/bash

# Jam Masjid Installer for Ubuntu/Debian
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="jam-masjid"
APP_VERSION="1.0.0"
SERVICE_USER="jammasjid"
INSTALL_DIR="/opt/jam-masjid"
SERVICE_FILE="/etc/systemd/system/jam-masjid.service"
PORT="3000"

# Logging function
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

info() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "Script ini harus dijalankan dengan sudo/root privileges"
    fi
}

# Check OS compatibility
check_os() {
    if [[ ! -f /etc/debian_version ]] && [[ ! -f /etc/lsb-release ]]; then
        error "OS ini tidak didukung. Installer ini hanya untuk Ubuntu/Debian."
    fi
    
    log "OS compatible: $(lsb_release -d | cut -f2 2>/dev/null || cat /etc/debian_version)"
}

# Check system requirements
check_requirements() {
    info "Memeriksa system requirements..."
    
    # Check available memory (minimum 512MB)
    MEMORY_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    MEMORY_MB=$((MEMORY_KB / 1024))
    
    if [[ $MEMORY_MB -lt 512 ]]; then
        warn "Memory tersedia: ${MEMORY_MB}MB. Disarankan minimal 512MB."
    else
        log "Memory tersedia: ${MEMORY_MB}MB ✓"
    fi
    
    # Check disk space (minimum 100MB)
    DISK_AVAILABLE=$(df / | tail -1 | awk '{print $4}')
    DISK_MB=$((DISK_AVAILABLE / 1024))
    
    if [[ $DISK_MB -lt 100 ]]; then
        error "Disk space tidak cukup. Tersedia: ${DISK_MB}MB, dibutuhkan minimal 100MB."
    else
        log "Disk space tersedia: ${DISK_MB}MB ✓"
    fi
}

# Install dependencies
install_dependencies() {
    info "Menginstall dependencies..."
    
    # Update package list
    apt-get update -qq
    
    # Install Node.js 18.x
    if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
        log "Menginstall Node.js 18.x..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    else
        log "Node.js sudah terinstall: $(node -v) ✓"
    fi
    
    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        log "Menginstall PM2..."
        npm install -g pm2
    else
        log "PM2 sudah terinstall: $(pm2 -v) ✓"
    fi
    
    # Install other dependencies
    apt-get install -y curl wget unzip nginx ufw fail2ban
    
    log "Dependencies berhasil diinstall ✓"
}

# Create system user
create_user() {
    info "Membuat system user..."
    
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd --system --shell /bin/false --home-dir $INSTALL_DIR --create-home $SERVICE_USER
        log "User '$SERVICE_USER' berhasil dibuat ✓"
    else
        log "User '$SERVICE_USER' sudah ada ✓"
    fi
}

# Install application
install_application() {
    info "Menginstall aplikasi Jam Masjid..."
    
    # Create installation directory
    mkdir -p $INSTALL_DIR
    
    # Copy application files
    if [[ -f "./jam-masjid-linux.tar.gz" ]]; then
        log "Mengekstrak aplikasi..."
        tar -xzf "./jam-masjid-linux.tar.gz" -C $INSTALL_DIR --strip-components=1
    else
        error "File jam-masjid-linux.tar.gz tidak ditemukan!"
    fi
    
    # Set permissions
    chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
    chmod +x $INSTALL_DIR/server.js
    
    # Create data directories
    mkdir -p $INSTALL_DIR/{data,logs,backups}
    chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR/{data,logs,backups}
    
    log "Aplikasi berhasil diinstall di $INSTALL_DIR ✓"
}

# Create systemd service
create_service() {
    info "Membuat systemd service..."
    
    cat > $SERVICE_FILE << EOF
[Unit]
Description=Jam Masjid - Digital Clock for Mosque
Documentation=https://github.com/your-repo/jam-masjid
After=network.target
Wants=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
StartLimitInterval=60s
StartLimitBurst=3

# Environment variables
Environment=NODE_ENV=production
Environment=PORT=$PORT
Environment=HOST=0.0.0.0

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$INSTALL_DIR/data $INSTALL_DIR/logs $INSTALL_DIR/backups
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_BIND_SERVICE

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=jam-masjid

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable jam-masjid
    
    log "Systemd service berhasil dibuat ✓"
}

# Configure nginx reverse proxy
configure_nginx() {
    info "Mengkonfigurasi Nginx reverse proxy..."
    
    cat > /etc/nginx/sites-available/jam-masjid << EOF
server {
    listen 80;
    server_name localhost;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Main application
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_redirect off;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:$PORT;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/jam-masjid /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    nginx -t
    
    log "Nginx berhasil dikonfigurasi ✓"
}

# Configure firewall
configure_firewall() {
    info "Mengkonfigurasi firewall..."
    
    # Enable UFW
    ufw --force enable
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Deny direct access to app port
    ufw deny $PORT
    
    log "Firewall berhasil dikonfigurasi ✓"
}

# Create startup script
create_startup_script() {
    info "Membuat startup script..."
    
    cat > $INSTALL_DIR/start.sh << 'EOF'
#!/bin/bash
cd /opt/jam-masjid
exec /usr/bin/node server.js
EOF

    chmod +x $INSTALL_DIR/start.sh
    chown $SERVICE_USER:$SERVICE_USER $INSTALL_DIR/start.sh
    
    log "Startup script berhasil dibuat ✓"
}

# Start services
start_services() {
    info "Memulai services..."
    
    # Start and enable jam-masjid service
    systemctl start jam-masjid
    systemctl enable jam-masjid
    
    # Restart nginx
    systemctl restart nginx
    systemctl enable nginx
    
    # Check service status
    if systemctl is-active --quiet jam-masjid; then
        log "Service jam-masjid berjalan ✓"
    else
        error "Service jam-masjid gagal start! Cek: journalctl -u jam-masjid"
    fi
    
    if systemctl is-active --quiet nginx; then
        log "Service nginx berjalan ✓"
    else
        error "Service nginx gagal start! Cek: journalctl -u nginx"
    fi
}

# Create management script
create_management_script() {
    info "Membuat management script..."
    
    cat > /usr/local/bin/jam-masjid << 'EOF'
#!/bin/bash

case "$1" in
    start)
        echo "Starting Jam Masjid..."
        systemctl start jam-masjid nginx
        ;;
    stop)
        echo "Stopping Jam Masjid..."
        systemctl stop jam-masjid
        ;;
    restart)
        echo "Restarting Jam Masjid..."
        systemctl restart jam-masjid nginx
        ;;
    status)
        echo "=== Jam Masjid Status ==="
        systemctl status jam-masjid --no-pager -l
        echo ""
        echo "=== Nginx Status ==="
        systemctl status nginx --no-pager -l
        ;;
    logs)
        echo "=== Jam Masjid Logs ==="
        journalctl -u jam-masjid -f
        ;;
    backup)
        echo "Creating backup..."
        tar -czf "/opt/jam-masjid/backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz" \
            -C /opt/jam-masjid data/
        echo "Backup created in /opt/jam-masjid/backups/"
        ;;
    update)
        echo "Update feature coming soon..."
        ;;
    uninstall)
        echo "WARNING: This will remove Jam Masjid completely!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            systemctl stop jam-masjid
            systemctl disable jam-masjid
            rm -f /etc/systemd/system/jam-masjid.service
            rm -f /etc/nginx/sites-enabled/jam-masjid
            rm -f /etc/nginx/sites-available/jam-masjid
            rm -rf /opt/jam-masjid
            userdel jammasjid 2>/dev/null || true
            systemctl daemon-reload
            systemctl restart nginx
            echo "Jam Masjid uninstalled."
        fi
        ;;
    *)
        echo "Usage: jam-masjid {start|stop|restart|status|logs|backup|update|uninstall}"
        exit 1
        ;;
esac
EOF

    chmod +x /usr/local/bin/jam-masjid
    
    log "Management script berhasil dibuat di /usr/local/bin/jam-masjid ✓"
}

# Main installation function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║              🕌 JAM MASJID INSTALLER 🕌              ║"
    echo "║                   Version 1.0.0                     ║"
    echo "║              Installer untuk Ubuntu/Debian          ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    log "Memulai instalasi Jam Masjid..."
    
    check_root
    check_os
    check_requirements
    install_dependencies
    create_user
    install_application
    create_service
    configure_nginx
    configure_firewall
    create_startup_script
    start_services
    create_management_script
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                 ✅ INSTALASI BERHASIL! ✅             ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
    echo ""
    log "Jam Masjid berhasil diinstall!"
    log "Aplikasi dapat diakses di: http://localhost"
    log "Panel admin: http://localhost/admin"
    echo ""
    echo -e "${YELLOW}Commands yang tersedia:${NC}"
    echo "  jam-masjid start    - Start service"
    echo "  jam-masjid stop     - Stop service"
    echo "  jam-masjid restart  - Restart service"
    echo "  jam-masjid status   - Check status"
    echo "  jam-masjid logs     - View logs"
    echo "  jam-masjid backup   - Create backup"
    echo "  jam-masjid uninstall - Remove aplikasi"
    echo ""
    echo -e "${YELLOW}File penting:${NC}"
    echo "  Config: /opt/jam-masjid/data/"
    echo "  Logs: /opt/jam-masjid/logs/"
    echo "  Backup: /opt/jam-masjid/backups/"
    echo ""
    warn "PENTING: Ganti password admin default setelah login pertama!"
    echo ""
}

# Run main function
main "$@" 