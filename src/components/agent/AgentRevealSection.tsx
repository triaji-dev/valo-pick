import type { LegacyRef } from 'react';
import { Users } from 'lucide-react';
import type { Agent } from '../../types';
import RoleIcon from '../ui/RoleIcon';

interface AgentRevealSectionProps {
  playerCount: number;
  rollResults: (Agent | null)[];
  finalizedCount: number;
  isRolling: boolean;
  isRestoring?: boolean;
  playerNames: string[];
  updatePlayerName: (index: number, name: string) => void;
  resultsRef: LegacyRef<HTMLElement>;
  gameMode: 'full' | 'balance';
  setGameMode: (m: 'full' | 'balance') => void;
  resetApp: () => void;
}

export default function AgentRevealSection({
  playerCount,
  rollResults,
  finalizedCount,
  isRolling,
  isRestoring = false,
  playerNames,
  updatePlayerName,
  resultsRef,
  gameMode,
  setGameMode,
  resetApp,
}: AgentRevealSectionProps) {
  const progress = playerCount > 0 ? (finalizedCount / playerCount) * 100 : 0;
  const isFinished = finalizedCount === playerCount && !isRolling && !isRestoring;

  const handleTryBalance = () => {
    setGameMode('balance');
    resetApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section ref={resultsRef} className="flex-1 flex flex-col justify-center items-center min-h-[300px] scroll-mt-32 w-full">
      {/* Reveal Progress Bar */}
      <div className="w-full max-w-6xl mb-8 space-y-2 px-4 md:px-0">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF4655]">Status // Sequence</span>
            <span className="text-xl font-black uppercase italic tracking-tighter text-white">
              {isRolling ? gameMode === 'full' ? "Chaotically Processing..." : "Balancing Squad..." : finalizedCount === playerCount ? gameMode === 'full' ? "Chaos Squad" : "Balanced Squad" : "Lockdown Progress"}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-gray-500 uppercase">{finalizedCount} / {playerCount} Agents Ready</span>
            <span className="text-2xl font-black italic text-white leading-none">{Math.round(progress)}%</span>
          </div>
        </div>
        
        <div className="h-1.5 w-full bg-[#1c252e] rounded-full overflow-hidden border border-gray-800 relative">
          <div 
            className="h-full bg-[#FF4655] transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 blur-sm" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full">
        {Array.from({ length: playerCount }).map((_, idx) => {
          const agent = rollResults[idx];
          const isFinalized = idx < finalizedCount;
          const isEmpty = !agent && !isRolling && !isRestoring;

          return (
            <div key={idx} className="flex flex-col gap-2 w-full">
              <div className="relative group">
                <div className="absolute inset-0 bg-[#FF4655] opacity-0 group-focus-within:opacity-10 transition-opacity skew-x-12 rounded-sm" />
                <input
                  type="text"
                  value={playerNames[idx]}
                  onChange={(e) => updatePlayerName(idx, e.target.value)}
                  placeholder={`PLAYER ${idx + 1}`}
                  disabled={isRolling || isRestoring}
                  className="relative w-full bg-transparent border-b border-gray-700 text-[10px] font-black text-gray-400 focus:text-white tracking-[0.2em] py-2 text-center focus:outline-none focus:border-[#FF4655] placeholder:text-gray-700 uppercase transition-all font-mono"
                />
              </div>

              <div 
                className={`group relative w-full border-2 transition-all duration-300 transform flex flex-row md:block h-28 md:h-auto md:aspect-[3/4] ${
                isEmpty 
                  ? 'bg-[#1c252e] border-gray-800 border-dashed opacity-50' 
                  : isRestoring 
                    ? 'bg-[#1c252e] border-[#FF4655]/50 animate-pulse shadow-[0_0_15px_rgba(255,70,85,0.2)]'
                  : `bg-transparent md:bg-[#1c252e] ${isFinalized 
                    ? 'border-[#FF4655] scale-100 md:scale-105 shadow-[0_0_30px_rgba(255,70,85,0.2)] z-10' 
                    : 'border-white/20'}`
              }`}
              style={{
                clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
              }}
            >
              {agent ? (
                <>
                  {/* Image Container */}
                  <div className="relative w-1/3 md:w-full h-full md:h-full flex-shrink-0 overflow-hidden md:absolute md:inset-0 bg-[#1c252e]">
                     <img 
                       src={agent.fullPortrait || agent.displayIcon} 
                       alt={agent.displayName}
                       className={`w-[140%] h-[140%] object-cover object-top transition-all duration-300 hover:scale-110 ${isFinalized ? 'scale-100 opacity-100' : 'scale-110 opacity-80 blur-sm'} -translate-y-5`}
                     />
                     {!isFinalized && isRolling && (
                       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan" />
                     )}
                     {/* Mobile Only Gradient Overlay for Text Readability if needed, though side-by-side relies on bg */}
                  </div>

                  {/* Text Container */}
                  <div className={`relative md:absolute md:bottom-0 inset-x-0 bg-[#1c252e] md:bg-transparent md:bg-gradient-to-t md:from-black md:via-black/90 md:to-transparent p-4 transition-all duration-500 flex flex-col justify-center md:block flex-1 ${isFinalized ? 'translate-y-0 opacity-100' : 'translate-y-0 md:translate-y-full opacity-100 md:opacity-0'}`}>
                    <div className="flex items-center md:items-end justify-between">
                      <div className="text-left">
                        <h3 className="text-2xl font-black uppercase italic leading-none text-white tracking-tighter">
                          {agent.displayName}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-gray-300">
                          <RoleIcon role={agent.role?.displayName} />
                          <span className="text-xs font-bold uppercase tracking-wider">{agent.role?.displayName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
                  <Users size={48} className="mb-2 opacity-50" />
                  <span className="text-xs font-mono uppercase text-center">Waiting<br className="md:hidden"/> for Lock In</span>
                </div>
              )}
            </div>
            </div>
          );
        })}
      </div>

      {/* Balance Mode CTA */}
      {isFinished && gameMode === 'full' && playerCount>4 && (
        <div className="mt-12 w-full max-w-lg animate-tactical-in">
           <div className="relative group cursor-pointer" onClick={handleTryBalance}>
              {/* Animated Border Background */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF4655] to-purple-600 rounded opacity-50 group-hover:opacity-100 transition duration-500 blur-sm animate-pulse" />
              
              <div className="relative flex items-center justify-between bg-[#0F1923] p-4 border border-gray-700 group-hover:border-[#FF4655] transition-all">
                 <div className="flex items-center gap-4">
                    <div className="bg-[#FF4655]/10 p-2 rounded">
                       <Users size={18} className="text-[#FF4655]" />
                    </div>
                    <div>
                       <p className="text-sm font-black text-white uppercase italic tracking-tighter">Too chaotic? Try "Balance Mode"</p>
                       <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mt-1">For even role distribution.</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FF4655] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#b52733] transition-colors">
                    Switch Now
                 </div>
              </div>
           </div>
        </div>
      )}
    </section>
  );
}
