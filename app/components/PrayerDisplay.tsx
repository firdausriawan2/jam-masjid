'use client';

import { useEffect, useState } from 'react';

interface PrayerDisplayProps {
  prayerName: string;
  prayerTime: string;
  muadzin: string;
  adzanDuration: number; // dalam detik
  iqomahDuration: number; // dalam detik
}

export default function PrayerDisplay({ 
  prayerName, 
  prayerTime, 
  muadzin, 
  adzanDuration = 60, // default 1 menit
  iqomahDuration = 300 // default 5 menit 
}: PrayerDisplayProps) {
  const [showIqomah, setShowIqomah] = useState(false);
  const [iqomahCountdown, setIqomahCountdown] = useState(iqomahDuration);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Timer untuk beralih dari adzan ke iqomah
    const adzanTimer = setTimeout(() => {
      setShowIqomah(true);
    }, adzanDuration * 1000);

    return () => clearTimeout(adzanTimer);
  }, [adzanDuration]);

  useEffect(() => {
    if (!mounted) return;

    let countdownInterval: NodeJS.Timeout;

    if (showIqomah && iqomahCountdown > 0) {
      countdownInterval = setInterval(() => {
        setIqomahCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [showIqomah, iqomahCountdown, mounted]);

  if (!mounted) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  if (!showIqomah) {
    return (
      <main className="min-h-screen bg-[#009B4C] text-white">
        <div className="container mx-auto px-6 py-12 h-screen flex flex-col items-center justify-center">
          <div className="text-center space-y-16 animate-fade-in">
            <h1 className="text-6xl font-bold">SAAT ADZAN</h1>
            <h2 className="text-8xl font-bold mb-8">{prayerName}</h2>
            
            <div className="text-7xl font-mono font-bold tracking-wider">
              {prayerTime}
            </div>

            <div className="mt-12">
              <p className="text-2xl text-white/90 mb-2">Muadzin</p>
              <p className="text-4xl font-semibold">{muadzin}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#009B4C] text-white">
      <div className="container mx-auto px-6 h-screen flex flex-col items-center justify-center">
        <div className="text-center space-y-12 animate-fade-in">
          <h1 className="text-5xl font-bold tracking-wide">
            MENJELANG IQOMAH {prayerName}
          </h1>
          
          <div className="text-[10rem] font-mono font-bold tracking-wider">
            {formatTime(iqomahCountdown)}
          </div>

          <div className="border-2 border-white/30 rounded-full px-12 py-6 inline-block backdrop-blur-sm">
            <p className="text-3xl font-medium tracking-wide">
              LURUS DAN RAPATKAN SHAFF
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 