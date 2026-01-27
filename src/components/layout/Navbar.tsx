import { BarChart2 } from 'lucide-react';

interface NavbarProps {
  currentView: 'agent' | 'weapon' | 'statistics';
  setCurrentView: (view: 'agent' | 'weapon' | 'statistics') => void;
  isRolling: boolean;
}

export default function Navbar({ currentView, setCurrentView, isRolling }: NavbarProps) {
  return (
    <nav className="w-full bg-[#1c252e] border-b border-gray-700">
      <div className="max-w-6xl mx-auto flex">
        <button
          onClick={() => !isRolling && setCurrentView('agent')}
          disabled={isRolling} 
          className={`px-8 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
            currentView === 'agent'
              ? 'border-[#FF4655] text-white bg-white/5'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Pick Agent
        </button>
        <button
           onClick={() => !isRolling && setCurrentView('weapon')}
           disabled={isRolling}
           className={`px-8 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
            currentView === 'weapon'
              ? 'border-[#FF4655] text-white bg-white/5'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Pick Weapon
        </button>
        <button
           onClick={() => !isRolling && setCurrentView('statistics')}
           disabled={isRolling}
           className={`px-8 py-4 text-xs md:text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
            currentView === 'statistics'
              ? 'border-[#FF4655] text-white bg-white/5'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
           <div className="flex items-center gap-2">
             <BarChart2 size={16} />
             Stats
           </div>
        </button>
      </div>
    </nav>
  );
}
