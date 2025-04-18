'use client';

import PrayerDisplay from '../components/PrayerDisplay';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PrayerInfo {
  name: string;
  time: string;
  muadzin: string;
}

export default function PrayerPage() {
  const [mounted, setMounted] = useState(false);
  const [prayerInfo, setPrayerInfo] = useState<PrayerInfo>({ 
    name: '', 
    time: '', 
    muadzin: 'Ust. Ahmad' 
  });
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    try {
      if (typeof window !== 'undefined') {
        // Coba ambil dari sessionStorage terlebih dahulu
        const storedPrayer = sessionStorage.getItem('currentPrayer');
        
        if (storedPrayer) {
          const prayer = JSON.parse(storedPrayer);
          setPrayerInfo(prev => ({ ...prev, ...prayer }));
        } else {
          // Jika tidak ada di sessionStorage, coba cek di localStorage
          // sebagai fallback untuk kasus refresh halaman
          const lastTriggered = localStorage.getItem('lastTriggeredPrayer');
          
          if (lastTriggered) {
            const parsed = JSON.parse(lastTriggered);
            // Jika terakhir dipicu kurang dari 10 menit yang lalu, gunakan data tersebut
            if (new Date().getTime() - parsed.timestamp < 10 * 60 * 1000) {
              setPrayerInfo(prev => ({ 
                ...prev, 
                name: parsed.name, 
                time: parsed.time 
              }));
              
              // Simpan kembali ke sessionStorage agar konsisten
              sessionStorage.setItem('currentPrayer', JSON.stringify({
                name: parsed.name,
                time: parsed.time
              }));
            } else {
              // Waktu adzan sudah lewat terlalu lama, kembali ke halaman utama
              router.replace('/');
            }
          } else {
            // Tidak ada data tersimpan sama sekali, kembali ke halaman utama
            router.replace('/');
          }
        }
      }
    } catch (error) {
      console.error('Error reading prayer info:', error);
      // Fallback to home page if there's an error
      if (typeof window !== 'undefined') {
        router.replace('/');
      }
    }
  }, [router]);

  // Clear sessionStorage when component unmounts
  useEffect(() => {
    return () => {
      try {
        if (mounted && typeof window !== 'undefined') {
          sessionStorage.removeItem('currentPrayer');
          
          // Kita tidak menghapus localStorage karena kita ingin
          // melacak waktu shalat yang terakhir dipicu untuk mencegah pemicu ganda
        }
      } catch (error) {
        console.error('Error clearing prayer info:', error);
      }
    };
  }, [mounted]);

  // Event handler saat iqomah selesai
  const handleIqomahComplete = () => {
    if (typeof window !== 'undefined') {
      // Hapus status "baru dipicu" untuk memungkinkan adzan berikutnya
      localStorage.removeItem('lastTriggeredPrayer');
    }
  };

  if (!mounted || !prayerInfo.name) {
    return (
      <div className="min-h-screen bg-[#2D3B35] flex items-center justify-center">
        <div className="animate-pulse text-[#E6D5C9]">Memuat...</div>
      </div>
    ); 
  }

  return (
    <PrayerDisplay
      prayerName={prayerInfo.name}
      prayerTime={prayerInfo.time}
      muadzin={prayerInfo.muadzin}
      adzanDuration={60} // 1 menit untuk adzan | hitungan detik
      iqomahDuration={300} // 5 menit untuk iqomah
      onIqomahComplete={handleIqomahComplete}
    />
  );
} 