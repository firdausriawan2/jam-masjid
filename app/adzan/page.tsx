import Image from 'next/image';

export default function AdzanPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-600 to-emerald-700 text-white">
      <div className="container mx-auto px-6 py-12 h-screen flex flex-col items-center justify-center">
        {/* Main Content */}
        <div className="text-center space-y-8 animate-fade-in">
          <h1 className="text-6xl font-bold mb-4">SAAT ADZAN</h1>
          <h2 className="text-8xl font-bold font-arabic mb-8">MAGRIB</h2>
          
          <div className="text-5xl font-mono font-bold">
            17:55
          </div>

          {/* Muadzin Info */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
            <p className="text-xl text-white/80 mb-2">Muadzin</p>
            <p className="text-3xl font-semibold">Ust. Ahmad</p>
          </div>
        </div>
      </div>
    </main>
  );
}

// Add this CSS to your globals.css
// @keyframes fadeIn {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }
// .animate-fade-in {
//   animation: fadeIn 1s ease-in;
// } 