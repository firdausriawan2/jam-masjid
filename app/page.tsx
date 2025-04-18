'use client';

import { useEffect, useState } from 'react';
import { configService } from './services/ConfigService';
import { PrayerTimeService } from './services/PrayerTimeService';
import { useKajian } from './hooks/useKajian';
import Countdown from './components/Countdown';
import Clock from './components/Clock';
import Image from 'next/image';
import { useRef } from 'react';

interface PrayerTime {
  name: string;
  time: string;
}

interface City {
  id: string;
  lokasi: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [recentlyTriggered, setRecentlyTriggered] = useState<string[]>([]);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime>({ name: '', time: '' });
  const [cityInfo, setCityInfo] = useState<City>({ id: '1301', lokasi: 'Jakarta' });
  const [isLoading, setIsLoading] = useState(true);
  const { announcements, loadAnnouncements } = useKajian();

  // Fungsi untuk sinkronisasi waktu - bisa diganti dengan panggilan ke server waktu
  const synchronizeTime = () => {
    // Di implementasi nyata, ini bisa berupa panggilan ke server NTP
    // Untuk sekarang, kita hanya menggunakan waktu lokal
    return new Date();
  };

  // Handle prayer time check and navigation
  const handlePrayerTime = (matchingPrayer: PrayerTime): void => {
    try {
      // Simpan status ke localStorage untuk persistensi jika tab ditutup/refresh
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastTriggeredPrayer', JSON.stringify({
          name: matchingPrayer.name,
          time: matchingPrayer.time,
          timestamp: new Date().getTime()
        }));
        
        sessionStorage.setItem('currentPrayer', JSON.stringify({
          name: matchingPrayer.name,
          time: matchingPrayer.time
        }));
        
        window.location.href = '/prayer';
      }
    } catch (error) {
      console.error('Error handling prayer time:', error);
    }
  };

  // Load waktu shalat dari API
  useEffect(() => {
    const loadPrayerTimes = async () => {
      setIsLoading(true);
      try {
        const prayerService = PrayerTimeService.getInstance();
        // Mendapatkan waktu shalat
        const times = await prayerService.getPrayerTimes();
        setPrayerTimes(times);
        
        // Mendapatkan info kota
        const cityData = await prayerService.getCurrentCityInfo();
        setCityInfo(cityData);
        
        // Mendapatkan waktu shalat berikutnya
        const next = await prayerService.getNextPrayer();
        setNextPrayer(next);
      } catch (error) {
        console.error('Error loading prayer times:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    setMounted(true);
    loadPrayerTimes();
    
    // Cek apakah ada waktu shalat yang baru saja terlewat saat refresh/buka app
    if (typeof window !== 'undefined') {
      const lastTriggered = localStorage.getItem('lastTriggeredPrayer');
      if (lastTriggered) {
        try {
          const parsed = JSON.parse(lastTriggered);
          // Jika terakhir dipicu kurang dari 5 menit yang lalu, tambahkan ke daftar yang baru dipicu
          if (new Date().getTime() - parsed.timestamp < 5 * 60 * 1000) {
            setRecentlyTriggered([parsed.name]);
          }
        } catch (e) {
          console.error('Error parsing lastTriggeredPrayer:', e);
        }
      }
    }
    
    // Update jadwal setiap hari pada tengah malam
    const midnightUpdate = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        loadPrayerTimes();
      }
    }, 60000); // Cek setiap menit
    
    return () => clearInterval(midnightUpdate);
  }, []);

  // Load data masjid dan kajian
  useEffect(() => {
    const loadMosqueData = async () => {
      try {
        const config = await configService;
        const configData = await config.getConfig();
        const prayerService = PrayerTimeService.getInstance();
        const cityData = await prayerService.getCityById(configData.mosque.cityCode);
        setCityInfo({ 
          id: configData.mosque.cityCode, 
          lokasi: cityData.lokasi || 'Jakarta'
        });
        
        // Load kajian data
        await loadAnnouncements();
      } catch (error) {
        console.error('Error loading mosque data:', error);
        setCityInfo({ 
          id: '1301', 
          lokasi: 'Jakarta' 
        });
      }
    };
    
    loadMosqueData();
  }, [loadAnnouncements]);

  // Penanganan waktu shalat utama
  useEffect(() => {
    if (!mounted || prayerTimes.length === 0) return;
    
    // Hitung interval optimal untuk pengecekan berikutnya
    const calculateOptimalInterval = () => {
    const now = new Date();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    
      // Konversi semua waktu shalat ke menit
    const prayerTimesInMinutes = prayerTimes.map(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      return {
        name: prayer.name,
        time: prayer.time,
        minutes: hours * 60 + minutes
      };
    });

      // Cari waktu shalat berikutnya
      let nextPrayerTime = prayerTimesInMinutes.find(prayer => 
        prayer.minutes > currentTimeMinutes
      );
      
      // Jika tidak ada, ambil yang pertama untuk besok
      if (!nextPrayerTime) {
        nextPrayerTime = prayerTimesInMinutes[0];
        // Tambahkan 24 jam (dalam menit)
        nextPrayerTime.minutes += 24 * 60;
      }
      
      // Hitung selisih dalam menit
      const minutesUntilNextPrayer = nextPrayerTime.minutes - currentTimeMinutes;
      
      // Update state waktu shalat berikutnya
      setNextPrayer({ 
        name: nextPrayerTime.name, 
        time: nextPrayerTime.time 
      });
      
      // Jika kurang dari 10 menit lagi, periksa setiap 10 detik
      // Jika kurang dari 1 jam, periksa setiap 30 detik
      // Jika lebih dari itu, periksa setiap menit
      if (minutesUntilNextPrayer <= 10) {
        return 10 * 1000; // 10 detik
      } else if (minutesUntilNextPrayer <= 60) {
        return 30 * 1000; // 30 detik
      } else {
        return 60 * 1000; // 1 menit
      }
    };

    const checkPrayerTime = () => {
      const now = synchronizeTime();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Periksa waktu shalat dengan jendela toleransi
      prayerTimes.forEach(prayer => {
        const [prayerHours, prayerMinutes] = prayer.time.split(':').map(Number);
        const prayerTimeMinutes = prayerHours * 60 + prayerMinutes;
        
        // Jendela toleransi 1 menit pada waktu adzan
        const isWithinWindow = Math.abs(currentTimeMinutes - prayerTimeMinutes) <= 1;
        const isExactMatch = currentTime === prayer.time;
        
        // Periksa apakah sudah dipicu baru-baru ini
        const wasRecentlyTriggered = recentlyTriggered.includes(prayer.name);
        
        if ((isWithinWindow || isExactMatch) && !wasRecentlyTriggered) {
          console.log(`Waktu sholat ${prayer.name} telah tiba:`, currentTime);
          
          // Tambahkan ke daftar yang baru dipicu
          setRecentlyTriggered((prev: string[]) => [...prev, prayer.name]);
          
          // Hapus dari daftar yang baru dipicu setelah 5 menit
          setTimeout(() => {
            setRecentlyTriggered((prev: string[]) => prev.filter(name => name !== prayer.name));
          }, 5 * 60 * 1000);
          
          handlePrayerTime(prayer);
        }
      });
      
      // Atur interval dinamis untuk pengecekan berikutnya
      const optimalInterval = calculateOptimalInterval();
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      
      checkIntervalRef.current = setInterval(checkPrayerTime, optimalInterval);
    };

    // Panggil pengecekan awal
    checkPrayerTime();
    
    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [mounted, recentlyTriggered, prayerTimes]);

  // Formatting tanggal Indonesia
  const formatDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const now = new Date();
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    return `${day}, ${date} ${month} ${year}`;
  };

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-[#2D3B35]">
      {/* Header Bar - Fixed height di berbagai ukuran layar */}
      <header className="bg-[#2D3B35] border-b border-[#E6D5C9]/10 h-20 flex-shrink-0">
        <div className="container h-full mx-auto px-4 flex items-center justify-between relative">
          {/* Left - Date */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#E6D5C9] animate-pulse"></div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-medium text-[#E6D5C9]">{formatDate()}</h2>
            </div>
            <h2 className="text-sm md:text-base lg:text-lg text-[#E6D5C9]/70 ml-3">{cityInfo.lokasi}</h2>
          </div>

          {/* Center - Title - Absolute positioning untuk memastikan posisi yang konsisten */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center top-1/2 -translate-y-1/2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-arabic text-[#E6D5C9]">
              ساعة المسجد
            </h1>
          </div>

          {/* Right - Clock */}
          <div className="bg-[#1F2A24]/80 backdrop-blur px-4 py-2 rounded-lg border border-[#E6D5C9]/10">
            <Clock />
          </div>
        </div>
      </header>

      {/* Main Content - Flexbox dengan auto height */}
      <div className="flex-1 flex overflow-hidden">
        <div className="container mx-auto p-4 flex flex-1">
          <div className="grid grid-cols-[1fr_1.618fr] gap-4 w-full h-full">
        {/* Left Panel */}
            <div className="space-y-3 flex flex-col">
          <div className="bg-[#1F2A24]/80 backdrop-blur-sm rounded-lg p-3 border border-[#E6D5C9]/10">
            <h3 className="text-sm md:text-base lg:text-lg font-medium mb-2 text-[#E6D5C9] flex items-center gap-2">
              <span className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-[#E6D5C9] animate-pulse"></span>
              Muazzin
            </h3>
            <div className="bg-[#2D3B35]/80 rounded-lg p-3 border border-[#E6D5C9]/10">
              <p className="text-lg md:text-xl lg:text-2xl font-semibold text-[#E6D5C9]">Ust. Ahmad</p>
              <p className="text-xs md:text-sm text-[#E6D5C9]/70">Selatpanjang - Riau</p>
            </div>
          </div>

          <div className="bg-[#1F2A24]/80 backdrop-blur-sm rounded-lg p-3 border border-[#E6D5C9]/10">
            <h3 className="text-sm md:text-base lg:text-lg font-medium mb-2 text-[#E6D5C9] flex items-center gap-2">
              <span className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-[#E6D5C9] animate-pulse"></span>
              Imam
            </h3>
            <div className="bg-[#2D3B35]/80 rounded-lg p-3 border border-[#E6D5C9]/10">
              <p className="text-lg md:text-xl lg:text-2xl font-semibold text-[#E6D5C9]">Ust. Abdullah</p>
              <p className="text-xs md:text-sm text-[#E6D5C9]/70">Selatpanjang - Riau</p>
            </div>
          </div>

              <div className="bg-[#1F2A24]/80 backdrop-blur-sm rounded-lg p-3 border border-[#E6D5C9]/10 flex-1 flex flex-col justify-between">
                {/* Countdown Section */}
            <Countdown nextPrayerTime={nextPrayer.time} nextPrayerName={nextPrayer.name} />
                
                {/* Info Masjid Section */}
                <div className="mt-3 border-t border-[#E6D5C9]/10 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#E6D5C9] animate-pulse"></div>
                    <h3 className="text-sm md:text-base font-medium text-[#E6D5C9]">
                      Info Kegiatan Masjid
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {announcements.slice(0, 2).map((kajian) => (
                      <div 
                        key={kajian.id} 
                        className="bg-[#2D3B35]/80 rounded-lg p-2.5 border border-[#E6D5C9]/20 hover:border-[#E6D5C9]/30 transition-colors"
                      >
                        <p className="text-sm md:text-base text-[#E6D5C9] font-medium">
                          {kajian.text}
                        </p>
                        <p className="text-xs md:text-sm text-[#E6D5C9]/70 mt-1">
                          {kajian.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF9D]/70"></span>
                            <span className="text-xs text-[#E6D5C9]/70">{kajian.ustadz}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-[#E6D5C9]/30"></div>
                          <div className="flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF9D]/70"></span>
                            <span className="text-xs text-[#E6D5C9]/70">{kajian.schedule}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
          </div>
        </div>

            {/* Makkah Image - Menggunakan relative dan overflow hidden */}
            <div className="relative rounded-lg overflow-hidden border border-[#E6D5C9]/10 h-full">
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F2A24] via-[#1F2A24]/60 to-transparent z-10"></div>
          <Image 
            src="/makkah.jpg" 
            alt="Makkah Live" 
            width={1200} 
            height={742} 
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 z-20 bg-gradient-to-t from-[#1F2A24] to-transparent">
            <p className="text-base md:text-lg lg:text-xl font-medium text-[#E6D5C9]">Masjidil Haram</p>
            <p className="text-xs md:text-sm text-[#E6D5C9]/70">Live from Makkah</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Times - Fixed height footer */}
      <footer className="h-24 flex-shrink-0 container mx-auto px-4 py-2">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-[#E6D5C9]/70 animate-pulse">Memuat jadwal shalat...</p>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-2 h-full">
          {prayerTimes.map((prayer) => (
            <div 
              key={prayer.name} 
              className={`${
                prayer.name === nextPrayer.name 
                  ? 'bg-[#E6D5C9]/10 border-[#E6D5C9]/30 shadow-[0_0_15px_rgba(230,213,201,0.1)]' 
                  : 'bg-[#1F2A24]/80 border-[#E6D5C9]/10 hover:bg-[#1F2A24]'
                } rounded-lg p-2 text-center border backdrop-blur-sm transition-all duration-300 flex flex-col justify-center`}
            >
              <h3 className={`text-xs md:text-sm font-medium mb-1 ${
                prayer.name === nextPrayer.name 
                  ? 'text-[#E6D5C9]' 
                  : 'text-[#E6D5C9]/70'
              }`}>
                {prayer.name}
              </h3>
              <p className={`text-lg md:text-xl lg:text-2xl font-mono font-bold ${
                prayer.name === nextPrayer.name
                  ? 'text-[#E6D5C9]'
                  : 'text-[#E6D5C9]/90'
              }`}>
                {prayer.time}
              </p>
            </div>
          ))}
        </div>
        )}
      </footer>
    </main>
  );
}
