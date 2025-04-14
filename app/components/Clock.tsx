'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted || !time) {
    return null;
  }

  return (
    <div className="text-right">
      <h1 className="text-4xl font-mono font-bold tracking-wider text-emerald-600">
        {format(time, 'HH:mm:ss')}
      </h1>
    </div>
  );
} 