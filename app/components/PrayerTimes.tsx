'use client';

interface PrayerTime {
  name: string;
  time: string;
}

const prayerTimes: PrayerTime[] = [
  { name: 'Subuh', time: '04:30' },
  { name: 'Dzuhur', time: '12:00' },
  { name: 'Ashar', time: '15:15' },
  { name: 'Maghrib', time: '18:00' },
  { name: 'Isya', time: '19:15' },
];

export default function PrayerTimes() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {prayerTimes.map((prayer) => (
        <div key={prayer.name} className="bg-black/30 p-4 rounded-lg text-center">
          <h3 className="text-xl font-bold">{prayer.name}</h3>
          <p className="text-2xl">{prayer.time}</p>
        </div>
      ))}
    </div>
  );
} 