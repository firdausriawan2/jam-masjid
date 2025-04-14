'use client';

interface MosqueSchedule {
  prayer: string;
  time: string;
  muadzin: string;
  imam: string;
}

const schedules: MosqueSchedule[] = [
  {
    prayer: 'Subuh',
    time: '04:30',
    muadzin: 'Ust. Ahmad',
    imam: 'Ust. Abdullah'
  },
  {
    prayer: 'Dzuhur',
    time: '12:00',
    muadzin: 'Ust. Mahmud',
    imam: 'Ust. Hasan'
  },
  {
    prayer: 'Ashar',
    time: '15:15',
    muadzin: 'Ust. Mahmud',
    imam: 'Ust. Ibrahim'
  },
  {
    prayer: 'Maghrib',
    time: '18:00',
    muadzin: 'Ust. Ahmad',
    imam: 'Ust. Abdullah'
  },
  {
    prayer: 'Isya',
    time: '19:15',
    muadzin: 'Ust. Ahmad',
    imam: 'Ust. Hasan'
  }
];

export default function MosqueInfo() {
  return (
    <div className="grid grid-cols-5 gap-6">
      {schedules.map((schedule) => (
        <div 
          key={schedule.prayer} 
          className="group bg-gradient-to-br from-black/50 via-black/40 to-transparent p-6 rounded-xl text-center 
                   hover:from-black/60 hover:via-black/50 hover:to-black/20 transition-all duration-500 ease-in-out
                   border border-white/10 hover:border-white/20 backdrop-blur-lg
                   transform hover:-translate-y-1 hover:shadow-2xl shadow-lg"
        >
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-white to-emerald-200 text-transparent bg-clip-text drop-shadow">
            {schedule.prayer}
          </h3>
          <p className="text-3xl font-mono mb-4 group-hover:scale-110 transition-transform duration-500 text-white drop-shadow-lg">
            {schedule.time}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center space-x-2 text-emerald-200/80 hover:text-emerald-200/100 transition-colors duration-300">
              <span className="text-emerald-400/70 font-medium">Muadzin:</span>
              <span>{schedule.muadzin}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-emerald-200/80 hover:text-emerald-200/100 transition-colors duration-300">
              <span className="text-emerald-400/70 font-medium">Imam:</span>
              <span>{schedule.imam}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 