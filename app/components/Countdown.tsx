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
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-center">
      <h3 className="text-lg font-medium text-slate-500 mb-2">
        Menuju Waktu {nextPrayerName}
      </h3>
      <p className="text-4xl font-mono font-bold text-emerald-600 tracking-wider">
        {timeLeft}
      </p>
    </div>
  );
} 