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
  { name: 'SUBUH', time: '04:31' },
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
    <main className="h-screen w-screen overflow-hidden bg-emerald-900 flex flex-col">
      {/* Header Bar */}
      <div className="bg-emerald-800/50 border-b border-emerald-700">
        <div className="container mx-auto py-4 px-8 flex items-center justify-between">
          {/* Left - Date */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <h2 className="text-2xl font-medium text-white">Senin, 06 November 2023</h2>
            </div>
            <h2 className="text-lg text-emerald-300 ml-3.5">22 Rabiul Akhir, 1445</h2>
          </div>

          {/* Center - Title */}
          <div className="absolute left-1/2 top-4 -translate-x-1/2 text-center">
            <h1 className="text-6xl font-bold font-arabic text-white mb-1 drop-shadow-glow">
              ساعة المسجد
            </h1>
            <div className="text-sm tracking-[0.2em] text-emerald-300 font-medium">
              SISTEM INFORMASI MASJID
            </div>
          </div>

          {/* Right - Clock */}
          <div className="bg-emerald-800/50 backdrop-blur px-6 py-3 rounded-xl border border-emerald-600/30">
            <Clock />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto p-8 grid grid-cols-[1fr_1.618fr] gap-8">
        {/* Left Panel */}
        <div className="space-y-4">
          <div className="bg-emerald-800/30 backdrop-blur-sm rounded-xl p-5 border border-emerald-700/30">
            <h3 className="text-lg font-medium mb-3 text-emerald-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Muazzin
            </h3>
            <div className="bg-emerald-800/30 rounded-lg p-4 border border-emerald-700/30">
              <p className="text-2xl font-semibold text-white">Ust. Ahmad</p>
              <p className="text-emerald-300">Selatpanjang - Riau</p>
            </div>
          </div>

          <div className="bg-emerald-800/30 backdrop-blur-sm rounded-xl p-5 border border-emerald-700/30">
            <h3 className="text-lg font-medium mb-3 text-emerald-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Imam
            </h3>
            <div className="bg-emerald-800/30 rounded-lg p-4 border border-emerald-700/30">
              <p className="text-2xl font-semibold text-white">Ust. Abdullah</p>
              <p className="text-emerald-300">Selatpanjang - Riau</p>
            </div>
          </div>

          <div className="bg-emerald-800/30 backdrop-blur-sm rounded-xl p-5 border border-emerald-700/30">
            <Countdown nextPrayerTime={nextPrayer.time} nextPrayerName={nextPrayer.name} />
          </div>
        </div>

        {/* Makkah Image */}
        <div className="relative rounded-xl overflow-hidden border border-emerald-700/30">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
          <Image 
            src="/makkah.jpg" 
            alt="Makkah Live" 
            width={1200} 
            height={742} 
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-xl font-medium">Masjidil Haram</p>
            <p className="text-emerald-200">Live from Makkah</p>
          </div>
        </div>
      </div>

      {/* Prayer Times */}
      <div className="container mx-auto px-8 pb-8">
        <div className="grid grid-cols-6 gap-4">
          {prayerTimes.map((prayer) => (
            <div 
              key={prayer.name} 
              className={`${
                prayer.name === nextPrayer.name 
                  ? 'bg-emerald-600/40 border-emerald-500 shadow-glow' 
                  : 'bg-emerald-800/30 border-emerald-700/30 hover:bg-emerald-700/40'
              } rounded-xl p-4 text-center border backdrop-blur-sm transition-all duration-300`}
            >
              <h3 className={`text-base font-medium mb-2 ${
                prayer.name === nextPrayer.name 
                  ? 'text-emerald-300' 
                  : 'text-emerald-400'
              }`}>
                {prayer.name}
              </h3>
              <p className={`text-2xl lg:text-3xl font-mono font-bold ${
                prayer.name === nextPrayer.name
                  ? 'text-white'
                  : 'text-emerald-100'
              }`}>
                {prayer.time}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
