import { Crosshair } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full bg-[#111] border-b border-gray-800 p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF4655] flex items-center justify-center transform -skew-x-12 rounded-sm">
            <Crosshair className="text-white w-6 h-6 transform skew-x-12" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase">Valo<span className="text-[#FF4655]">Pick</span></h1>
        </div>
        <div className="text-xs text-gray-500 font-mono hidden sm:block">
          PROTOCOL_V7.02 // TACTICAL_PICKER
        </div>
      </div>
    </header>
  );
}
