# Jam Masjid - Linux Distribution

🕌 **Jam Masjid** adalah aplikasi jam digital modern yang dirancang khusus untuk masjid, dilengkapi dengan fitur waktu shalat, pengumuman, dan panel administrasi yang komprehensif.

## 📦 Linux Release

### Supported Distributions
- Ubuntu 18.04 LTS atau lebih baru
- Debian 10 (Buster) atau lebih baru  
- Linux Mint 19 atau lebih baru
- Elementary OS 5.1 atau lebih baru

### System Requirements
- **RAM**: 512MB minimum (1GB direkomendasikan)
- **Storage**: 100MB minimum
- **CPU**: x64 architecture
- **Network**: Koneksi internet untuk API waktu shalat
- **Node.js**: 18.x atau lebih baru

## 🚀 Quick Installation

### Method 1: Automated Installer (Recommended)

```bash
# Download release package
wget https://github.com/your-repo/jam-masjid/releases/latest/download/jam-masjid-linux.tar.gz

# Extract dan install
tar -xzf jam-masjid-linux.tar.gz
cd jam-masjid-*
sudo ./install.sh
```

### Method 2: Build from Source

```bash
# Clone repository
git clone https://github.com/your-repo/jam-masjid.git
cd jam-masjid

# Install dependencies
npm install

# Build Linux package
npm run build:linux

# Install built package
cd dist/release
tar -xzf jam-masjid-linux.tar.gz
cd jam-masjid-*
sudo ./install.sh
```

## 🔧 Manual Installation

Jika Anda ingin install secara manual:

### 1. Install Dependencies

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl wget nginx ufw

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs
```

### 2. Extract Application

```bash
# Extract ke system directory
sudo tar -xzf jam-masjid-linux.tar.gz -C /opt/
sudo mv /opt/jam-masjid-* /opt/jam-masjid

# Create system user
sudo useradd --system --shell /bin/false --home-dir /opt/jam-masjid jammasjid
sudo chown -R jammasjid:jammasjid /opt/jam-masjid
```

### 3. Setup Service

```bash
# Create systemd service
sudo tee /etc/systemd/system/jam-masjid.service > /dev/null << EOF
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

# Enable dan start service
sudo systemctl daemon-reload
sudo systemctl enable jam-masjid
sudo systemctl start jam-masjid
```

### 4. Configure Nginx (Optional)

```bash
# Create nginx configuration
sudo tee /etc/nginx/sites-available/jam-masjid > /dev/null << EOF
server {
    listen 80;
    server_name localhost;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/jam-masjid /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

## 📱 Access Application

Setelah instalasi berhasil:

- **Main Application**: http://localhost
- **Admin Panel**: http://localhost/admin
- **Health Check**: http://localhost/api/health

### Default Admin Login
- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ **PENTING**: Segera ganti password default setelah login pertama!

## 🛠️ Management Commands

Setelah instalasi, gunakan command berikut:

```bash
# Start service
sudo jam-masjid start

# Stop service  
sudo jam-masjid stop

# Restart service
sudo jam-masjid restart

# Check status
sudo jam-masjid status

# View logs
sudo jam-masjid logs

# Create backup
sudo jam-masjid backup

# Uninstall (hati-hati!)
sudo jam-masjid uninstall
```

## 📂 Directory Structure

```
/opt/jam-masjid/              # Main application
├── server.js                # Production server
├── .next/                   # Built Next.js files
├── public/                  # Static assets
├── data/                    # Application data
│   ├── config.json         # Configuration
│   ├── announcements.json  # Pengumuman
│   └── transactions.json   # Data keuangan
├── logs/                    # Log files
│   ├── access.log          # Access logs
│   └── error.log           # Error logs
└── backups/                 # Data backups
    └── backup-YYYYMMDD-HHMMSS.tar.gz
```

## 🔧 Configuration

### Environment Variables

Edit file service untuk mengubah environment:

```bash
sudo nano /etc/systemd/system/jam-masjid.service
```

Variabel yang tersedia:
- `PORT=3000` - Port aplikasi
- `HOST=0.0.0.0` - Host binding
- `NODE_ENV=production` - Environment mode

Setelah edit, reload service:
```bash
sudo systemctl daemon-reload
sudo systemctl restart jam-masjid
```

### Application Configuration

Configuration disimpan di `/opt/jam-masjid/data/config.json`:

```json
{
  "mosque": {
    "name": "Masjid Al-Ikhlas",
    "city": "Jakarta",
    "timezone": "Asia/Jakarta"
  },
  "display": {
    "theme": "light",
    "language": "id",
    "showSeconds": true
  },
  "prayer": {
    "calculationMethod": "mwl",
    "adjustments": {
      "fajr": 0,
      "dhuhr": 0,
      "asr": 0,
      "maghrib": 0,
      "isha": 0
    }
  }
}
```

## 🔄 Update Process

### Method 1: Full Reinstall
```bash
# Backup current data
sudo jam-masjid backup

# Stop service
sudo jam-masjid stop

# Download new version
wget https://github.com/your-repo/jam-masjid/releases/latest/download/jam-masjid-linux.tar.gz

# Install new version
tar -xzf jam-masjid-linux.tar.gz
cd jam-masjid-*
sudo ./install.sh

# Service akan otomatis restart
```

### Method 2: Manual Update
```bash
# Backup data
sudo jam-masjid backup

# Stop service
sudo systemctl stop jam-masjid

# Backup current installation
sudo cp -r /opt/jam-masjid /opt/jam-masjid.backup

# Extract new version
sudo tar -xzf jam-masjid-linux.tar.gz -C /tmp/
sudo cp -r /tmp/jam-masjid-*/* /opt/jam-masjid/

# Restore data from backup
sudo cp -r /opt/jam-masjid.backup/data/* /opt/jam-masjid/data/

# Fix permissions
sudo chown -R jammasjid:jammasjid /opt/jam-masjid

# Start service
sudo systemctl start jam-masjid
```

## 🔒 Security

### Firewall Configuration
```bash
# Enable UFW
sudo ufw enable

# Allow SSH (jika remote)
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny direct access ke app port
sudo ufw deny 3000/tcp
```

### SSL/HTTPS Setup

Untuk production dengan SSL:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal sudah disetup otomatis
```

### Data Protection

- Data disimpan di `/opt/jam-masjid/data/`
- Backup otomatis dapat disetup dengan cron
- File permission sudah dikonfigurasi untuk security

## 🐛 Troubleshooting

### Service Issues

**Service tidak start:**
```bash
# Check service status
sudo systemctl status jam-masjid

# Check logs  
sudo journalctl -u jam-masjid -f

# Check application logs
sudo tail -f /opt/jam-masjid/logs/error.log
```

**Port sudah digunakan:**
```bash
# Check what's using port 3000
sudo netstat -tlnp | grep :3000

# Kill process jika diperlukan
sudo kill -9 <PID>

# Atau ganti port di service file
sudo nano /etc/systemd/system/jam-masjid.service
```

### Permission Issues

```bash
# Fix permissions
sudo chown -R jammasjid:jammasjid /opt/jam-masjid
sudo chmod +x /opt/jam-masjid/server.js
```

### Memory Issues

```bash
# Check memory usage
free -h
sudo systemctl status jam-masjid

# Restart service untuk clear memory
sudo systemctl restart jam-masjid
```

### Network Issues

```bash
# Check if app responds locally
curl http://localhost:3000

# Check nginx status
sudo systemctl status nginx

# Test nginx config
sudo nginx -t
```

## 📊 Monitoring

### Log Monitoring

```bash
# Real-time application logs
sudo tail -f /opt/jam-masjid/logs/error.log

# System service logs
sudo journalctl -u jam-masjid -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Check

```bash
# Check application health
curl http://localhost/api/health

# Check all services
sudo jam-masjid status
```

### Performance Monitoring

Install monitoring tools (optional):
```bash
sudo apt install htop iotop nethogs
```

## 🆘 Support

### Common Issues

1. **Service not starting** - Check logs dengan `journalctl -u jam-masjid`
2. **Permission denied** - Run `sudo chown -R jammasjid:jammasjid /opt/jam-masjid`
3. **Port conflict** - Change port in service file
4. **Memory issues** - Restart service atau increase RAM

### Getting Help

- **Documentation**: [docs.jammasjid.app](https://docs.jammasjid.app)
- **Issues**: [GitHub Issues](https://github.com/your-repo/jam-masjid/issues)
- **Community**: [Discord/Telegram]

### Backup & Recovery

```bash
# Create manual backup
sudo tar -czf /tmp/jam-masjid-backup-$(date +%Y%m%d).tar.gz \
    -C /opt/jam-masjid data/

# Restore from backup
sudo tar -xzf /tmp/jam-masjid-backup-20240529.tar.gz \
    -C /opt/jam-masjid/
sudo chown -R jammasjid:jammasjid /opt/jam-masjid/data
sudo systemctl restart jam-masjid
```

---

## 📝 Build Information

- **Version**: 1.0.0
- **Platform**: Linux x64
- **Node.js**: 18.x minimum
- **Build Date**: 2024-05-29
- **Distribution**: Ubuntu/Debian

---

Untuk informasi lebih lanjut, kunjungi [dokumentasi lengkap](https://docs.jammasjid.app) atau buat [issue baru](https://github.com/your-repo/jam-masjid/issues) jika mengalami masalah. 