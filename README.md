# 🕌 ساعة المسجد

Aplikasi jam masjid digital yang modern dan responsif dengan sistem **database-less** menggunakan Next.js 15, TypeScript, dan Tailwind CSS.

## ✨ Fitur Utama

### 🕐 **Waktu Shalat Otomatis**
- Integrasi dengan MyQuran API v2 untuk jadwal shalat akurat
- Auto-refresh jadwal setiap tengah malam
- Sistem notifikasi adzan dengan countdown real-time
- Toleransi waktu 1 menit untuk akurasi
- Fallback data offline jika API tidak tersedia

### 📱 **Interface Modern**
- Design responsif untuk berbagai ukuran layar
- Dark theme dengan warna hijau Islamic
- Live streaming Masjidil Haram (opsional)
- Animasi smooth dan loading states

### 🔧 **Admin Panel**
- Konfigurasi informasi masjid
- Manajemen pengumuman/kajian
- Sistem autentikasi sederhana
- Update real-time tanpa refresh

### 💾 **Database-less Architecture**
- Data disimpan di `localStorage` + file JSON
- Tidak memerlukan database server
- Backup otomatis ke file sistem
- Sync data antar tab browser

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd jam-masjid

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Buka browser di http://localhost:3000
```

### Build untuk Production

```bash
npm run build
npm start
```

## 📁 Struktur Project

```
jam-masjid/
├── app/
│   ├── components/          # Komponen UI reusable
│   ├── services/           # Business logic & API calls
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── admin/              # Admin panel pages
│   ├── prayer/             # Halaman adzan
│   └── api/                # API routes
├── public/
│   └── data/               # File JSON untuk data storage
├── components/             # Global UI components
└── lib/                    # Utility functions
```

## 🔧 Konfigurasi

### Data Masjid
Edit file `public/data/mosque-config.json`:

```json
{
  "mosque": {
    "name": "Nama Masjid",
    "location": "Lokasi Masjid", 
    "cityCode": "0506",
    "liveStream": {
      "url": "https://youtube.com/embed/...",
      "title": "Live Stream Title",
      "autoplay": true,
      "muted": false
    }
  },
  "settings": {
    "announcements": [...],
    "prayerTimeAdjustments": {...}
  }
}
```

### City Code
Dapatkan city code dari [MyQuran API](https://api.myquran.com/v2/sholat/kota/cari/[nama-kota])

## 🛠️ Teknologi

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **API**: MyQuran API v2
- **Storage**: localStorage + JSON files
- **Authentication**: Cookie-based

## 📊 Fitur Teknis

### Error Handling
- ✅ Retry mechanism (3 attempts) untuk API calls
- ✅ Fallback ke data offline jika API gagal
- ✅ Graceful degradation untuk semua fitur
- ✅ Network status detection

### Performance
- ✅ Dynamic interval checking untuk efisiensi
- ✅ Lazy loading untuk komponen berat
- ✅ Optimized bundle size
- ✅ Static generation untuk halaman statis

### Security
- ✅ Input validation dengan Zod
- ✅ XSS protection
- ✅ Secure cookie handling
- ✅ Environment variable protection

## 🔐 Admin Access

1. Buka `/admin/login`
2. Default credentials (ubah di production):
   - Username: `admin`
   - Password: `admin123`

## 📱 Responsive Design

- **Desktop**: Layout 2 kolom dengan live stream
- **Tablet**: Layout adaptif dengan grid responsif  
- **Mobile**: Layout 1 kolom dengan navigasi touch-friendly

## 🌐 API Integration

### MyQuran API v2
- **Endpoint**: `https://api.myquran.com/v2/sholat/`
- **Features**: Jadwal shalat, pencarian kota
- **Fallback**: Data statis jika API down

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy ke Vercel
```

### Manual Server
```bash
npm run build
npm start
# Aplikasi berjalan di port 3000
```

## 🔄 Update & Maintenance

### Update Jadwal Shalat
- Otomatis update setiap tengah malam
- Manual refresh melalui admin panel
- Fallback ke data lokal jika API gagal

### Backup Data
- Data tersimpan di `public/data/`
- Backup otomatis ke localStorage
- Export/import melalui admin panel

## 🐛 Troubleshooting

### API Tidak Tersedia
- Aplikasi akan menggunakan data fallback
- Indikator "Offline" muncul di header
- Data terakhir tetap tersimpan

### Waktu Tidak Akurat
- Cek koneksi internet
- Verifikasi city code di config
- Restart aplikasi jika perlu

## 📄 License

MIT License - Bebas digunakan untuk keperluan masjid dan dakwah.

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📞 Support

Untuk pertanyaan dan dukungan, silakan buat issue di repository ini.

---

**Dibuat dengan ❤️ untuk kemudahan ibadah umat Islam**
