'use client';

import { useEffect, useState } from 'react';

interface PrayerDisplayProps {
  prayerName: string;
  prayerTime: string;
  muadzin: string;
  adzanDuration: number; // dalam detik
  iqomahDuration: number; // dalam detik
  onIqomahComplete?: () => void; // Callback opsional saat iqomah selesai
}

export default function PrayerDisplay({ 
  prayerName, 
  prayerTime, 
  muadzin, 
  adzanDuration = 60, // default 1 menit
  iqomahDuration = 300, // default 5 menit 
  onIqomahComplete
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
        setIqomahCountdown((prev) => {
          // Ketika iqomah mencapai 0, panggil callback onIqomahComplete jika disediakan
          if (prev === 1 && onIqomahComplete) {
            onIqomahComplete();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (showIqomah && iqomahCountdown === 0 && onIqomahComplete) {
      // Pastikan callback dipanggil jika countdown mencapai 0
      onIqomahComplete();
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [showIqomah, iqomahCountdown, mounted, onIqomahComplete]);

  if (!mounted) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  if (!showIqomah) {
    return (
      <main className="min-h-screen bg-[#2D3B35] text-[#E6D5C9] flex flex-col">
        {/* Header - konsisten dengan page.tsx */}
        <header className="h-20 flex-shrink-0 bg-[#2D3B35] border-b border-[#E6D5C9]/10">
          <div className="container mx-auto h-full px-6 flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-arabic text-[#E6D5C9]">
              ساعة المسجد
            </h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-8 animate-fade-in w-full max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00FF9D] animate-pulse"></div>
              <h2 className="text-3xl md:text-4xl font-bold">SAAT ADZAN</h2>
            </div>
            
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-[#E6D5C9]">
              {prayerName}
            </h2>
            
            <div className="bg-[#1F2A24]/80 backdrop-blur rounded-lg py-6 px-4 border border-[#E6D5C9]/20 shadow-inner shadow-black/20 mb-8">
              <p className="text-5xl md:text-6xl lg:text-7xl font-mono font-bold tracking-wider text-[#00FF9D] drop-shadow-[0_0_2px_rgba(0,255,157,0.5)]">
                {prayerTime}
              </p>
            </div>

            <div className="bg-[#1F2A24]/80 backdrop-blur-sm rounded-lg p-4 border border-[#E6D5C9]/20">
              <p className="text-lg text-[#E6D5C9]/80 mb-2">Muadzin</p>
              <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#E6D5C9]">
                {muadzin}
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer - konsisten dengan page.tsx */}
        <footer className="h-16 flex-shrink-0 border-t border-[#E6D5C9]/10">
          <div className="container mx-auto h-full flex items-center justify-center">
            <p className="text-sm text-[#E6D5C9]/50">
              Masjid Jami&apos; Al-Ihsan
            </p>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#2D3B35] text-[#E6D5C9] flex flex-col">
      {/* Header - konsisten dengan page.tsx */}
      <header className="h-20 flex-shrink-0 bg-[#2D3B35] border-b border-[#E6D5C9]/10">
        <div className="container mx-auto h-full px-6 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-arabic text-[#E6D5C9]">
            ساعة المسجد
          </h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in w-full max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00FF9D] animate-pulse"></div>
            <h2 className="text-3xl md:text-4xl font-bold">MENJELANG IQOMAH {prayerName}</h2>
          </div>
          
          <div className="bg-[#1F2A24]/80 backdrop-blur rounded-lg py-8 px-4 border border-[#E6D5C9]/20 shadow-inner shadow-black/20 mb-8">
            <p className="text-6xl md:text-8xl lg:text-[10rem] font-mono font-bold tracking-wider text-[#00FF9D] drop-shadow-[0_0_2px_rgba(0,255,157,0.5)]">
              {formatTime(iqomahCountdown)}
            </p>
          </div>

          <div className="bg-[#1F2A24]/80 backdrop-blur-sm rounded-lg p-6 border border-[#E6D5C9]/20">
            <p className="text-xl md:text-2xl lg:text-3xl font-medium text-[#E6D5C9]">
              LURUS DAN RAPATKAN SHAFF
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer - konsisten dengan page.tsx */}
      <footer className="h-16 flex-shrink-0 border-t border-[#E6D5C9]/10">
        <div className="container mx-auto h-full flex items-center justify-center">
          <p className="text-sm text-[#E6D5C9]/50">
            Masjid Jami&apos; Al-Ihsan
          </p>
        </div>
      </footer>
    </main>
  );
} 