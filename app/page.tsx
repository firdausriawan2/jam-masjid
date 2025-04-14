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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-600">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg">Senin, 06 November 2023</h2>
            <span className="text-slate-300">|</span>
            <h2 className="text-lg">22 Rabiul Akhir, 1445</h2>
          </div>
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold text-right font-arabic text-emerald-600">
              ساعة المسجد
            </h1>
            <Clock />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-8 gap-6">
          {/* Left Side - Muadzin & Imam Info */}
          <div className="col-span-3 space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-medium mb-4 text-slate-500">Muazzin</h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xl font-semibold text-emerald-600">Ust. Ahmad</p>
                <p className="text-sm text-slate-500 mt-1">Selatpanjang - Riau</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-medium mb-4 text-slate-500">Imam</h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xl font-semibold text-emerald-600">Ust. Abdullah</p>
                <p className="text-sm text-slate-500 mt-1">Selatpanjang - Riau</p>
              </div>
            </div>
            <Countdown nextPrayerTime={nextPrayer.time} nextPrayerName={nextPrayer.name} />
          </div>

          {/* Center - Makkah Image */}
          <div className="col-span-5">
            <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 aspect-[1.618/1] hover:shadow-lg transition-shadow duration-300">
              <Image 
                src="/makkah.jpg" 
                alt="Makkah Live" 
                width={1200} 
                height={742} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Prayer Times */}
        <div className="mt-8">
          <div className="grid grid-cols-6 gap-4">
            {prayerTimes.map((prayer) => (
              <div 
                key={prayer.name} 
                className={`${
                  prayer.name === nextPrayer.name 
                    ? 'bg-emerald-50 border-emerald-200 shadow-md' 
                    : 'bg-white border-slate-200'
                } rounded-xl p-5 text-center border transition-all duration-300 hover:shadow-sm`}
              >
                <h3 className={`text-base font-medium mb-2 ${
                  prayer.name === nextPrayer.name 
                    ? 'text-emerald-600' 
                    : 'text-slate-500'
                }`}>
                  {prayer.name}
                </h3>
                <p className={`text-3xl font-mono font-bold ${
                  prayer.name === nextPrayer.name
                    ? 'text-emerald-600'
                    : 'text-slate-600'
                }`}>
                  {prayer.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
