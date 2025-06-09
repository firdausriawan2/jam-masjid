# Jam Masjid v1.0.0 - Linux Release

## 📦 Package Contents

### Main Distribution
- `jam-masjid-linux-v1.0.0.tar.gz` - Complete application package
- `jam-masjid-installer-v1.0.0.tar.gz` - Installer only

### Checksums
- `SHA256SUMS.txt` - SHA256 checksums
- `MD5SUMS.txt` - MD5 checksums

## 🚀 Quick Installation

### Ubuntu/Debian (Recommended)
```bash
# Download and extract
wget https://github.com/your-repo/jam-masjid/releases/download/v1.0.0/jam-masjid-linux-v1.0.0.tar.gz
tar -xzf jam-masjid-linux-v1.0.0.tar.gz
cd jam-masjid-1.0.0

# Install with automated installer
sudo ./install.sh
```

### Manual Installation
```bash
# Extract to system directory
sudo tar -xzf jam-masjid-linux-v1.0.0.tar.gz -C /opt/
sudo mv /opt/jam-masjid-1.0.0 /opt/jam-masjid

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create systemd service
sudo cp /opt/jam-masjid/jam-masjid.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable jam-masjid
sudo systemctl start jam-masjid
```

## 🔧 System Requirements

- **OS**: Ubuntu 18.04+ / Debian 10+
- **RAM**: 512MB minimum (1GB recommended)
- **Disk**: 100MB minimum
- **Node.js**: 18.x or higher
- **Network**: Internet connection for prayer time API

## 📱 Access Points

- **Main Application**: http://localhost
- **Admin Panel**: http://localhost/admin
- **Default Admin**: username: `admin`, password: `admin123`

## 🛠️ Management Commands

After installation, use these commands:

```bash
jam-masjid start      # Start the service
jam-masjid stop       # Stop the service
jam-masjid restart    # Restart the service
jam-masjid status     # Check service status
jam-masjid logs       # View application logs
jam-masjid backup     # Create data backup
jam-masjid uninstall  # Remove application
```

## 📂 Important Directories

- **Application**: `/opt/jam-masjid`
- **Data**: `/opt/jam-masjid/data`
- **Logs**: `/opt/jam-masjid/logs`
- **Backups**: `/opt/jam-masjid/backups`
- **Service**: `/etc/systemd/system/jam-masjid.service`

## ⚠️ Security Notes

1. **Change default admin password** immediately after first login
2. **Configure firewall** to allow only necessary ports
3. **Regular backups** are recommended
4. **Keep system updated** for security patches

## 🔄 Update Process

To update to a newer version:

```bash
# Stop service
sudo jam-masjid stop

# Backup current data
sudo jam-masjid backup

# Download and install new version
# (Follow installation steps with new package)

# Start service
sudo jam-masjid start
```

## 🐛 Troubleshooting

### Service won't start
```bash
# Check service status
sudo systemctl status jam-masjid

# Check logs
sudo journalctl -u jam-masjid -f

# Check application logs
sudo tail -f /opt/jam-masjid/logs/error.log
```

### Port already in use
```bash
# Check what's using port 3000
sudo netstat -tlnp | grep :3000

# Change port in service file
sudo nano /etc/systemd/system/jam-masjid.service
# Edit Environment=PORT=3001
sudo systemctl daemon-reload
sudo systemctl restart jam-masjid
```

## 📞 Support

For issues and support:
- GitHub Issues: [Create an issue](https://github.com/your-repo/jam-masjid/issues)
- Documentation: [Visit docs](https://docs.jammasjid.app)

---
**Build Date**: 2025-05-29  
**Build Version**: 1.0.0  
**Platform**: Linux x64
