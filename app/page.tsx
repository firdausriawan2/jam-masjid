'use client';

import Clock from './components/Clock';
import Countdown from './components/Countdown';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface PrayerTime {
  name: string;
  time: string;
}

const prayerTimes: PrayerTime[] = [
  { name: 'SUBUH', time: '21:36' },
  { name: 'SYURUQ', time: '05:50' },
  { name: 'DZUHUR', time: '11:55' },
  { name: 'ASHAR', time: '15:14' },
  { name: 'MAGRIB', time: '17:55' },
  { name: 'ISYA', time: '18:26' }
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Handle prayer time check and navigation
  const handlePrayerTime = (matchingPrayer: PrayerTime) => {
    try {
      if (typeof window !== 'undefined') {
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkPrayerTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      // Check if current time matches any prayer time
      const matchingPrayer = prayerTimes.find(prayer => prayer.time === currentTime);
      
      if (matchingPrayer) {
        console.log(`Waktu sholat ${matchingPrayer.name} telah tiba:`, currentTime);
        handlePrayerTime(matchingPrayer);
      }
    };

    // Check every second
    const timer = setInterval(checkPrayerTime, 1000);

    return () => clearInterval(timer);
  }, [mounted]);

  const getNextPrayer = () => {
    if (!mounted) return { name: '', time: '' };

    const now = new Date();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayerTimesInMinutes = prayerTimes.map(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      return {
        name: prayer.name,
        time: prayer.time,
        minutes: hours * 60 + minutes
      };
    });

    const nextPrayer = prayerTimesInMinutes.find(prayer => prayer.minutes > currentTimeMinutes) || prayerTimesInMinutes[0];
    return { name: nextPrayer.name, time: nextPrayer.time };
  };

  const nextPrayer = getNextPrayer();

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-[#2D3B35]">
      {/* Header Bar - Fixed height di berbagai ukuran layar */}
      <header className="bg-[#2D3B35] border-b border-[#E6D5C9]/10 h-20 flex-shrink-0">
        <div className="container h-full mx-auto px-4 flex items-center justify-between relative">
          {/* Left - Date */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#E6D5C9] animate-pulse"></div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-medium text-[#E6D5C9]">Senin, 06 November 2023</h2>
            </div>
            <h2 className="text-sm md:text-base lg:text-lg text-[#E6D5C9]/70 ml-3">22 Rabiul Akhir, 1445</h2>
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
                {/* Countdown Section - dibuat lebih ringkas */}
                <Countdown nextPrayerTime={nextPrayer.time} nextPrayerName={nextPrayer.name} />
                
                {/* Tambahan informasi untuk mengisi ruang kosong */}
                <div className="mt-3 border-t border-[#E6D5C9]/10 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#E6D5C9] animate-pulse"></div>
                    <h3 className="text-sm md:text-base font-medium text-[#E6D5C9]">
                      Info Masjid
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-[#2D3B35]/80 rounded-lg p-2.5 border border-[#E6D5C9]/20 hover:border-[#E6D5C9]/30 transition-colors">
                      <p className="text-sm md:text-base text-[#E6D5C9] font-medium">Kajian Ba&apos;da Magrib</p>
                      <p className="text-xs md:text-sm text-[#E6D5C9]/70 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF9D]/70"></span>
                        Ustadz Fulan • 18:30
                      </p>
                    </div>
                    <div className="bg-[#2D3B35]/80 rounded-lg p-2.5 border border-[#E6D5C9]/20 hover:border-[#E6D5C9]/30 transition-colors">
                      <p className="text-sm md:text-base text-[#E6D5C9] font-medium">Tahsin Al-Qur&apos;an</p>
                      <p className="text-xs md:text-sm text-[#E6D5C9]/70 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF9D]/70"></span>
                        Rabu, 08 Nov • 19:30
                      </p>
                    </div>
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
      </footer>
    </main>
  );
}
