#!/bin/bash

# Build Release Script for Jam Masjid
# Creates production-ready packages for Ubuntu/Debian

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="jam-masjid"
VERSION="1.0.0"
BUILD_DIR="./dist/build"
RELEASE_DIR="./dist/release"
LINUX_DIR="./dist/linux"

log() {
    echo -e "${GREEN}[BUILD]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Clean and create directories
setup_directories() {
    info "Setting up build directories..."
    
    rm -rf $BUILD_DIR $RELEASE_DIR
    mkdir -p $BUILD_DIR $RELEASE_DIR
    mkdir -p $BUILD_DIR/{standalone,package,files}
    
    log "Build directories created ✓"
}

# Install dependencies and build
build_application() {
    info "Building Next.js application..."
    
    # Install dependencies
    log "Installing dependencies..."
    npm ci --production=false
    
    # Generate version info
    log "Generating version info..."
    node scripts/generate-version.js
    
    # Build the application
    log "Building application..."
    npm run build
    
    # Check if standalone output exists
    if [[ ! -d ".next/standalone" ]]; then
        error "Standalone build failed! Check next.config.ts"
    fi
    
    log "Application built successfully ✓"
}

# Copy standalone files
copy_standalone() {
    info "Copying standalone files..."
    
    # Copy standalone server
    cp -r .next/standalone/* $BUILD_DIR/standalone/
    
    # Copy static files
    mkdir -p $BUILD_DIR/standalone/.next/static
    cp -r .next/static/* $BUILD_DIR/standalone/.next/static/
    
    # Copy public files
    if [[ -d "public" ]]; then
        cp -r public $BUILD_DIR/standalone/
    fi
    
    log "Standalone files copied ✓"
}

# Create production server.js
create_server() {
    info "Creating production server..."
    
    cat > $BUILD_DIR/standalone/server.js << 'EOF'
#!/usr/bin/env node

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Environment configuration
const dev = false;
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ 
  dev, 
  hostname, 
  port,
  dir: __dirname,
  conf: {
    output: 'standalone',
    distDir: '.next',
    experimental: {
      outputFileTracingRoot: __dirname,
    },
  }
});

const handle = app.getRequestHandler();

// Ensure data directories exist
const dataDir = path.join(__dirname, 'data');
const logsDir = path.join(__dirname, 'logs');
const backupsDir = path.join(__dirname, 'backups');

[dataDir, logsDir, backupsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize version info if not exists
const versionFile = path.join(__dirname, 'data', 'version.json');
if (!fs.existsSync(versionFile)) {
  const defaultVersion = {
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    gitHash: 'unknown',
    gitBranch: 'main'
  };
  fs.writeFileSync(versionFile, JSON.stringify(defaultVersion, null, 2));
}

// Start server
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
  .once('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  })
  .listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`> Data directory: ${dataDir}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
EOF

    chmod +x $BUILD_DIR/standalone/server.js
    
    log "Production server created ✓"
}

# Create package structure
create_package() {
    info "Creating package structure..."
    
    # Copy application files
    cp -r $BUILD_DIR/standalone/* $BUILD_DIR/package/
    
    # Copy installer script
    cp $LINUX_DIR/scripts/install.sh $BUILD_DIR/package/
    chmod +x $BUILD_DIR/package/install.sh
    
    # Create README
    cat > $BUILD_DIR/package/README.md << 'EOF'
# Jam Masjid - Digital Clock for Mosque

## Instalasi

### Ubuntu/Debian
```bash
sudo ./install.sh
```

### Manual Installation
1. Extract files to `/opt/jam-masjid`
2. Install Node.js 18+
3. Run: `node server.js`

## Akses Aplikasi
- Main: http://localhost
- Admin: http://localhost/admin

## Management Commands
```bash
jam-masjid start     # Start service
jam-masjid stop      # Stop service
jam-masjid restart   # Restart service
jam-masjid status    # Check status
jam-masjid logs      # View logs
jam-masjid backup    # Create backup
```

## Sistem Requirements
- Ubuntu 18.04+ / Debian 10+
- RAM: 512MB minimum
- Disk: 100MB minimum
- Node.js: 18.x

## Support
For issues and support, please visit our documentation.
EOF

    # Create version file
    cat > $BUILD_DIR/package/VERSION << EOF
{
  "name": "jam-masjid",
  "version": "$VERSION",
  "build_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "platform": "linux",
  "architecture": "x64",
  "node_version": "18.x",
  "description": "Digital Clock Application for Mosque"
}
EOF

    log "Package structure created ✓"
}

# Create release archives
create_archives() {
    info "Creating release archives..."
    
    cd $BUILD_DIR
    
    # Create main distribution archive
    log "Creating jam-masjid-linux.tar.gz..."
    tar -czf "../release/jam-masjid-linux-v${VERSION}.tar.gz" \
        -C package \
        --transform="s|^|jam-masjid-${VERSION}/|" \
        .
    
    # Create installer-only archive
    log "Creating installer.tar.gz..."
    tar -czf "../release/jam-masjid-installer-v${VERSION}.tar.gz" \
        -C package \
        install.sh README.md VERSION
    
    cd - > /dev/null
    
    # Create symlinks for easier access
    cd $RELEASE_DIR
    ln -sf "jam-masjid-linux-v${VERSION}.tar.gz" "jam-masjid-linux.tar.gz"
    ln -sf "jam-masjid-installer-v${VERSION}.tar.gz" "jam-masjid-installer.tar.gz"
    cd - > /dev/null
    
    log "Release archives created ✓"
}

# Create checksums
create_checksums() {
    info "Creating checksums..."
    
    cd $RELEASE_DIR
    
    # Create SHA256 checksums
    sha256sum *.tar.gz > SHA256SUMS.txt
    
    # Create MD5 checksums
    md5sum *.tar.gz > MD5SUMS.txt
    
    cd - > /dev/null
    
    log "Checksums created ✓"
}

# Create .deb package (optional)
create_deb_package() {
    info "Creating .deb package..."
    
    DEB_DIR="$BUILD_DIR/deb"
    mkdir -p $DEB_DIR/{DEBIAN,opt/jam-masjid,etc/systemd/system,usr/local/bin}
    
    # Copy application
    cp -r $BUILD_DIR/package/* $DEB_DIR/opt/jam-masjid/
    rm $DEB_DIR/opt/jam-masjid/install.sh  # Remove installer from deb
    
    # Create control file
    cat > $DEB_DIR/DEBIAN/control << EOF
Package: jam-masjid
Version: $VERSION
Section: misc
Priority: optional
Architecture: amd64
Depends: nodejs (>= 18.0.0), nginx
Maintainer: Jam Masjid Team <support@jammasjid.app>
Description: Digital Clock Application for Mosque
 A modern digital clock application specifically designed for mosques,
 featuring prayer times, announcements, and administrative panel.
 Includes automatic prayer time detection and customizable display.
EOF

    # Create postinst script
    cat > $DEB_DIR/DEBIAN/postinst << 'EOF'
#!/bin/bash
set -e

# Create user
if ! id jammasjid &>/dev/null; then
    useradd --system --shell /bin/false --home-dir /opt/jam-masjid jammasjid
fi

# Set permissions
chown -R jammasjid:jammasjid /opt/jam-masjid
chmod +x /opt/jam-masjid/server.js

# Create data directories
mkdir -p /opt/jam-masjid/{data,logs,backups}
chown -R jammasjid:jammasjid /opt/jam-masjid/{data,logs,backups}

# Enable and start service
systemctl daemon-reload
systemctl enable jam-masjid
systemctl start jam-masjid

echo "Jam Masjid installed successfully!"
echo "Access: http://localhost"
echo "Admin: http://localhost/admin"
EOF

    chmod 755 $DEB_DIR/DEBIAN/postinst
    
    # Create systemd service
    cat > $DEB_DIR/etc/systemd/system/jam-masjid.service << 'EOF'
[Unit]
Description=Jam Masjid - Digital Clock for Mosque
After=network.target
Wants=network.target

[Service]
Type=simple
User=jammasjid
Group=jammasjid
WorkingDirectory=/opt/jam-masjid
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOST=0.0.0.0

[Install]
WantedBy=multi-user.target
EOF

    # Build .deb package
    if command -v dpkg-deb &> /dev/null; then
        dpkg-deb --build $DEB_DIR $RELEASE_DIR/jam-masjid_${VERSION}_amd64.deb
        log ".deb package created ✓"
    else
        warn "dpkg-deb not found, skipping .deb creation"
    fi
}

# Generate release info
generate_release_info() {
    info "Generating release information..."
    
    cat > $RELEASE_DIR/RELEASE_INFO.md << EOF
# Jam Masjid v$VERSION - Linux Release

## 📦 Package Contents

### Main Distribution
- \`jam-masjid-linux-v${VERSION}.tar.gz\` - Complete application package
- \`jam-masjid-installer-v${VERSION}.tar.gz\` - Installer only

### Checksums
- \`SHA256SUMS.txt\` - SHA256 checksums
- \`MD5SUMS.txt\` - MD5 checksums

## 🚀 Quick Installation

### Ubuntu/Debian (Recommended)
\`\`\`bash
# Download and extract
wget https://github.com/your-repo/jam-masjid/releases/download/v${VERSION}/jam-masjid-linux-v${VERSION}.tar.gz
tar -xzf jam-masjid-linux-v${VERSION}.tar.gz
cd jam-masjid-${VERSION}

# Install with automated installer
sudo ./install.sh
\`\`\`

### Manual Installation
\`\`\`bash
# Extract to system directory
sudo tar -xzf jam-masjid-linux-v${VERSION}.tar.gz -C /opt/
sudo mv /opt/jam-masjid-${VERSION} /opt/jam-masjid

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create systemd service
sudo cp /opt/jam-masjid/jam-masjid.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable jam-masjid
sudo systemctl start jam-masjid
\`\`\`

## 🔧 System Requirements

- **OS**: Ubuntu 18.04+ / Debian 10+
- **RAM**: 512MB minimum (1GB recommended)
- **Disk**: 100MB minimum
- **Node.js**: 18.x or higher
- **Network**: Internet connection for prayer time API

## 📱 Access Points

- **Main Application**: http://localhost
- **Admin Panel**: http://localhost/admin
- **Default Admin**: username: \`admin\`, password: \`admin123\`

## 🛠️ Management Commands

After installation, use these commands:

\`\`\`bash
jam-masjid start      # Start the service
jam-masjid stop       # Stop the service
jam-masjid restart    # Restart the service
jam-masjid status     # Check service status
jam-masjid logs       # View application logs
jam-masjid backup     # Create data backup
jam-masjid uninstall  # Remove application
\`\`\`

## 📂 Important Directories

- **Application**: \`/opt/jam-masjid\`
- **Data**: \`/opt/jam-masjid/data\`
- **Logs**: \`/opt/jam-masjid/logs\`
- **Backups**: \`/opt/jam-masjid/backups\`
- **Service**: \`/etc/systemd/system/jam-masjid.service\`

## ⚠️ Security Notes

1. **Change default admin password** immediately after first login
2. **Configure firewall** to allow only necessary ports
3. **Regular backups** are recommended
4. **Keep system updated** for security patches

## 🔄 Update Process

To update to a newer version:

\`\`\`bash
# Stop service
sudo jam-masjid stop

# Backup current data
sudo jam-masjid backup

# Download and install new version
# (Follow installation steps with new package)

# Start service
sudo jam-masjid start
\`\`\`

## 🐛 Troubleshooting

### Service won't start
\`\`\`bash
# Check service status
sudo systemctl status jam-masjid

# Check logs
sudo journalctl -u jam-masjid -f

# Check application logs
sudo tail -f /opt/jam-masjid/logs/error.log
\`\`\`

### Port already in use
\`\`\`bash
# Check what's using port 3000
sudo netstat -tlnp | grep :3000

# Change port in service file
sudo nano /etc/systemd/system/jam-masjid.service
# Edit Environment=PORT=3001
sudo systemctl daemon-reload
sudo systemctl restart jam-masjid
\`\`\`

## 📞 Support

For issues and support:
- GitHub Issues: [Create an issue](https://github.com/your-repo/jam-masjid/issues)
- Documentation: [Visit docs](https://docs.jammasjid.app)

---
**Build Date**: $(date -u +%Y-%m-%d)  
**Build Version**: $VERSION  
**Platform**: Linux x64
EOF

    log "Release information generated ✓"
}

# Show release summary
show_summary() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                ✅ BUILD SUCCESSFUL! ✅                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
    echo ""
    log "Jam Masjid v$VERSION Linux packages created!"
    echo ""
    echo -e "${YELLOW}📦 Release files:${NC}"
    ls -la $RELEASE_DIR/
    echo ""
    echo -e "${YELLOW}📋 File sizes:${NC}"
    du -h $RELEASE_DIR/*.tar.gz
    echo ""
    echo -e "${YELLOW}🔒 Checksums:${NC}"
    echo "SHA256:"
    head -n 2 $RELEASE_DIR/SHA256SUMS.txt
    echo ""
    echo -e "${BLUE}📂 Release directory: $RELEASE_DIR${NC}"
    echo -e "${BLUE}📖 Read RELEASE_INFO.md for installation instructions${NC}"
    echo ""
}

# Main build process
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║           🏗️  JAM MASJID BUILD SYSTEM 🏗️            ║"
    echo "║                   Version $VERSION                     ║"
    echo "║              Building for Ubuntu/Debian             ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    setup_directories
    build_application
    copy_standalone
    create_server
    create_package
    create_archives
    create_checksums
    # create_deb_package  # Uncomment if you want .deb packages
    generate_release_info
    show_summary
}

# Check if running from project root
if [[ ! -f "package.json" ]]; then
    error "Please run this script from the project root directory"
fi

# Run main build process
main "$@" 