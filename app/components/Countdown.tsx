'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  nextPrayerTime: string;
  nextPrayerName: string;
}

export default function Countdown({ nextPrayerTime, nextPrayerName }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [hours, minutes] = nextPrayerTime.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0);

      if (prayerTime < now) {
        prayerTime.setDate(prayerTime.getDate() + 1);
      }

      const diff = prayerTime.getTime() - now.getTime();
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hoursLeft.toString().padStart(2, '0')}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [nextPrayerTime]);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-[#00FF9D] animate-pulse"></div>
        <h3 className="text-sm md:text-base font-medium text-[#E6D5C9]">
          Menuju Waktu <span className="font-semibold">{nextPrayerName}</span>
        </h3>
      </div>
      <div className="bg-[#1F2A24]/80 rounded-lg py-3 px-2 border border-[#E6D5C9]/20 shadow-inner shadow-black/20">
        <p className="text-xl md:text-2xl lg:text-3xl font-mono font-bold text-[#00FF9D] tracking-[0.15em] drop-shadow-[0_0_2px_rgba(0,255,157,0.5)]">
          {timeLeft}
        </p>
      </div>
    </div>
  );
} 