import Clock from './components/Clock';
import Countdown from './components/Countdown';
import Image from 'next/image';

export default function Home() {
  // Function to determine next prayer time
  const getNextPrayer = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayerTimes = [
      { name: 'SUBUH', time: '04:31', minutes: 4 * 60 + 31 },
      { name: 'SYURUQ', time: '05:50', minutes: 5 * 60 + 50 },
      { name: 'DZUHUR', time: '11:55', minutes: 11 * 60 + 55 },
      { name: 'ASHAR', time: '15:14', minutes: 15 * 60 + 14 },
      { name: 'MAGRIB', time: '17:55', minutes: 17 * 60 + 55 },
      { name: 'ISYA', time: '19:07', minutes: 19 * 60 + 7 }
    ];

    const nextPrayer = prayerTimes.find(prayer => prayer.minutes > currentTime) || prayerTimes[0];
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
                <p className="text-sm text-slate-500 mt-1">Selampanjang - Riau</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-medium mb-4 text-slate-500">Imam</h3>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xl font-semibold text-emerald-600">Ust. Abdullah</p>
                <p className="text-sm text-slate-500 mt-1">Selampanjang - Riau</p>
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
            {[
              { name: 'SUBUH', time: '04:31' },
              { name: 'SYURUQ', time: '05:50' },
              { name: 'DZUHUR', time: '11:55' },
              { name: 'ASHAR', time: '15:14' },
              { name: 'MAGRIB', time: '17:55' },
              { name: 'ISYA', time: '19:07' }
            ].map((prayer) => (
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
