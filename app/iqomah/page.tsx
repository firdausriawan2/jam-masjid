export default function IqomahPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-600 to-emerald-700 text-white">
      <div className="container mx-auto px-6 h-screen flex flex-col items-center justify-center">
        {/* Main Content */}
        <div className="text-center space-y-12 animate-fade-in">
          <h1 className="text-5xl font-bold tracking-wide">
            MENJELANG IQOMAH MAGRIB
          </h1>
          
          {/* Countdown Timer */}
          <div className="text-[10rem] font-mono font-bold tracking-wider">
            05:03
          </div>

          {/* Message Box */}
          <div className="border-2 border-white/30 rounded-full px-12 py-6 inline-block backdrop-blur-sm">
            <p className="text-3xl font-medium tracking-wide">
              LURUS DAN RAPATKAN SHAFF
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 