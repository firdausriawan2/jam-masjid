'use client';

import PrayerDisplay from '../components/PrayerDisplay';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    setMounted(true);

    try {
      if (typeof window !== 'undefined') {
        const storedPrayer = sessionStorage.getItem('currentPrayer');
        if (storedPrayer) {
          const prayer = JSON.parse(storedPrayer);
          setPrayerInfo(prev => ({ ...prev, ...prayer }));
        } else {
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Error reading prayer info:', error);
      // Fallback to home page if there's an error
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }, []);

  // Clear sessionStorage when component unmounts
  useEffect(() => {
    return () => {
      try {
        if (mounted && typeof window !== 'undefined') {
          sessionStorage.removeItem('currentPrayer');
        }
      } catch (error) {
        console.error('Error clearing prayer info:', error);
      }
    };
  }, [mounted]);

  if (!mounted || !prayerInfo.name) {
    return null; // or loading spinner
  }

  return (
    <PrayerDisplay
      prayerName={prayerInfo.name}
      prayerTime={prayerInfo.time}
      muadzin={prayerInfo.muadzin}
      adzanDuration={60} // 1 menit untuk adzan | hitungan detik
      iqomahDuration={300} // 5 menit untuk iqomah
    />
  );
} 