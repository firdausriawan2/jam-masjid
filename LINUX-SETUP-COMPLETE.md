# 🐧 Jam Masjid - Linux Release Setup COMPLETE! ✅

Setup Linux release untuk aplikasi Jam Masjid telah berhasil diselesaikan dengan lengkap!

## 📦 Yang Telah Dibuat

### 1. Konfigurasi Build
- ✅ **next.config.ts** - Dikonfigurasi untuk standalone build
- ✅ **scripts/generate-version.js** - Script untuk generate version info
- ✅ **package.json** - Updated dengan script Linux build

### 2. Installer Scripts
- ✅ **dist/linux/scripts/install.sh** - Automated installer untuk Ubuntu/Debian
- ✅ **dist/linux/scripts/build-release.sh** - Build script untuk packaging

### 3. Package Release
- ✅ **jam-masjid-linux-v1.0.0.tar.gz** (21MB) - Complete application package
- ✅ **jam-masjid-installer-v1.0.0.tar.gz** (4.5KB) - Installer only
- ✅ **SHA256SUMS.txt** - Checksums untuk verifikasi
- ✅ **MD5SUMS.txt** - Checksums alternatif
- ✅ **RELEASE_INFO.md** - Dokumentasi instalasi lengkap

### 4. Dokumentasi
- ✅ **README-LINUX.md** - Panduan lengkap Linux distribution
- ✅ **LINUX-SETUP-COMPLETE.md** - Summary setup (file ini)

## 🚀 Cara Menggunakan

### Build Package Baru
```bash
# Full build dan packaging
npm run build:linux

# Atau step by step
npm run build           # Build Next.js standalone
npm run package:linux   # Create Linux packages
```

### Hasil Build
Build akan menghasilkan file-file di `dist/release/`:
- `jam-masjid-linux-v1.0.0.tar.gz` - Package lengkap aplikasi
- `jam-masjid-installer-v1.0.0.tar.gz` - Installer script saja
- `RELEASE_INFO.md` - Dokumentasi instalasi
- `SHA256SUMS.txt` & `MD5SUMS.txt` - Checksums

### Quick Install di Server Ubuntu/Debian
```bash
# Download dari release
wget jam-masjid-linux-v1.0.0.tar.gz

# Extract dan install
tar -xzf jam-masjid-linux-v1.0.0.tar.gz
cd jam-masjid-1.0.0
sudo ./install.sh
```

### Manual Install
```bash
# Extract ke system directory
sudo tar -xzf jam-masjid-linux-v1.0.0.tar.gz -C /opt/
sudo mv /opt/jam-masjid-1.0.0 /opt/jam-masjid

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs

# Set permissions
sudo useradd --system jammasjid
sudo chown -R jammasjid:jammasjid /opt/jam-masjid

# Create systemd service
sudo systemctl enable jam-masjid
sudo systemctl start jam-masjid
```

## 🔧 Features yang Disertakan

### Automated Installer (`install.sh`)
- ✅ System requirements check
- ✅ Dependency installation (Node.js, Nginx, UFW)
- ✅ System user creation
- ✅ Application installation
- ✅ Systemd service setup
- ✅ Nginx reverse proxy
- ✅ Firewall configuration
- ✅ Management script creation

### Management Commands
Setelah install, tersedia command:
```bash
jam-masjid start      # Start service
jam-masjid stop       # Stop service  
jam-masjid restart    # Restart service
jam-masjid status     # Check status
jam-masjid logs       # View logs
jam-masjid backup     # Create backup
jam-masjid uninstall  # Remove app
```

### Production Server
- ✅ Custom `server.js` untuk production
- ✅ Graceful shutdown handling
- ✅ Auto-create data directories
- ✅ Environment configuration
- ✅ Error handling & logging

### Security Features
- ✅ Dedicated system user (`jammasjid`)
- ✅ Restricted file permissions
- ✅ UFW firewall configuration
- ✅ Nginx security headers
- ✅ Process isolation

## 📂 Directory Structure

```
/opt/jam-masjid/              # Application root
├── server.js                # Production server
├── .next/                   # Built Next.js files
├── public/                  # Static assets
├── node_modules/            # Dependencies
├── package.json             # Package info
├── data/                    # Application data
│   ├── config.json         # Configuration
│   ├── announcements.json  # Pengumuman
│   └── transactions.json   # Data keuangan
├── logs/                    # Application logs
│   ├── access.log          # Access logs
│   └── error.log           # Error logs
└── backups/                 # Data backups
    └── backup-YYYYMMDD-HHMMSS.tar.gz
```

## 🌐 Deployment Options

### 1. Single Server
```bash
# Install di satu server dengan Nginx
sudo ./install.sh

# Access: http://localhost
# Admin: http://localhost/admin
```

### 2. Production dengan SSL
```bash
# Install aplikasi
sudo ./install.sh

# Setup SSL dengan Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Load Balanced (Future)
- Multiple app instances dengan PM2
- Nginx load balancer
- Shared database/storage

## 📊 System Requirements

### Minimum
- **OS**: Ubuntu 18.04+ / Debian 10+
- **RAM**: 512MB
- **Disk**: 100MB
- **CPU**: 1 vCPU x64
- **Network**: Internet untuk prayer times API

### Recommended
- **OS**: Ubuntu 20.04+ / Debian 11+
- **RAM**: 1GB
- **Disk**: 1GB
- **CPU**: 2 vCPU x64
- **Network**: Stable internet + CDN

## 🔄 Update Process

### Automated Update (Recommended)
```bash
# Backup current data
sudo jam-masjid backup

# Download new version
wget jam-masjid-linux-v1.1.0.tar.gz

# Stop service
sudo jam-masjid stop

# Install new version
tar -xzf jam-masjid-linux-v1.1.0.tar.gz
cd jam-masjid-1.1.0
sudo ./install.sh

# Service akan restart otomatis
```

### Manual Update
```bash
# Backup data
sudo jam-masjid backup

# Stop service
sudo systemctl stop jam-masjid

# Backup installation
sudo cp -r /opt/jam-masjid /opt/jam-masjid.backup

# Extract new version
sudo tar -xzf jam-masjid-linux-v1.1.0.tar.gz -C /tmp/
sudo cp -r /tmp/jam-masjid-1.1.0/* /opt/jam-masjid/

# Restore data
sudo cp -r /opt/jam-masjid.backup/data/* /opt/jam-masjid/data/

# Fix permissions & restart
sudo chown -R jammasjid:jammasjid /opt/jam-masjid
sudo systemctl start jam-masjid
```

## 🐛 Troubleshooting Quick Reference

### Service Issues
```bash
# Check status
sudo systemctl status jam-masjid

# View logs
sudo journalctl -u jam-masjid -f
sudo tail -f /opt/jam-masjid/logs/error.log

# Restart service
sudo systemctl restart jam-masjid
```

### Port Conflicts
```bash
# Check port usage
sudo netstat -tlnp | grep :3000

# Change port
sudo nano /etc/systemd/system/jam-masjid.service
# Edit: Environment=PORT=3001
sudo systemctl daemon-reload
sudo systemctl restart jam-masjid
```

### Permission Issues
```bash
# Fix permissions
sudo chown -R jammasjid:jammasjid /opt/jam-masjid
sudo chmod +x /opt/jam-masjid/server.js
```

### Memory Issues  
```bash
# Check memory
free -h
ps aux | grep node

# Restart to clear memory
sudo systemctl restart jam-masjid
```

## 📈 Monitoring & Maintenance

### Log Monitoring
```bash
# Real-time app logs
sudo tail -f /opt/jam-masjid/logs/error.log

# System service logs  
sudo journalctl -u jam-masjid -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
```

### Regular Maintenance
```bash
# Weekly backup (add to cron)
sudo jam-masjid backup

# Monthly log rotation
sudo logrotate /etc/logrotate.d/jam-masjid

# System updates
sudo apt update && sudo apt upgrade
```

### Health Checks
```bash
# Application health
curl http://localhost/api/health

# Service status
sudo jam-masjid status

# Resource usage
htop
df -h
```

## 🎯 Next Steps (Optional)

### Performance Optimization
- [ ] Setup PM2 cluster mode
- [ ] Redis caching
- [ ] CDN untuk static assets
- [ ] Database optimization

### Advanced Features
- [ ] Multi-mosque support
- [ ] Mobile app integration
- [ ] Analytics dashboard
- [ ] Backup automation

### Security Hardening
- [ ] SSL/TLS configuration
- [ ] Rate limiting
- [ ] DDoS protection
- [ ] Security scanning

## ✅ Conclusion

Jam Masjid Linux release setup telah selesai dengan lengkap! 

**File yang siap didistribusikan:**
- 📦 `dist/release/jam-masjid-linux-v1.0.0.tar.gz` (21MB)
- 🛠️ `dist/release/jam-masjid-installer-v1.0.0.tar.gz` (4.5KB)
- 📋 `dist/release/RELEASE_INFO.md`
- 🔒 `dist/release/SHA256SUMS.txt`

**Untuk deployment production:**
1. Upload file `jam-masjid-linux-v1.0.0.tar.gz` ke server
2. Extract: `tar -xzf jam-masjid-linux-v1.0.0.tar.gz`
3. Install: `sudo ./install.sh`
4. Access: `http://server-ip`
5. Login admin: `admin` / `admin123`

**Support & Documentation:**
- 📖 `README-LINUX.md` - Dokumentasi lengkap
- 🐛 GitHub Issues untuk bug reports
- 💬 Community support

---

🎉 **Selamat! Linux release untuk Jam Masjid sudah siap untuk production deployment!** 🎉 