import type { LegacyRef } from 'react';
import { Users } from 'lucide-react';
import type { Agent } from '../../types';
import RoleIcon from '../ui/RoleIcon';

interface AgentRevealSectionProps {
  playerCount: number;
  rollResults: (Agent | null)[];
  finalizedCount: number;
  isRolling: boolean;
  playerNames: string[];
  updatePlayerName: (index: number, name: string) => void;
  resultsRef: LegacyRef<HTMLElement>;
}

export default function AgentRevealSection({
  playerCount,
  rollResults,
  finalizedCount,
  isRolling,
  playerNames,
  updatePlayerName,
  resultsRef,
}: AgentRevealSectionProps) {
  return (
    <section ref={resultsRef} className="flex-1 flex flex-col justify-center items-center min-h-[300px] scroll-mt-32">
      {/* Result Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
        {Array.from({ length: playerCount }).map((_, idx) => {
          const agent = rollResults[idx];
          const isFinalized = idx < finalizedCount;
          const isEmpty = !agent && !isRolling;

          return (
            <div key={idx} className="flex flex-col gap-2 w-full">
              {/* Player Label / Input */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#FF4655] opacity-0 group-focus-within:opacity-10 transition-opacity skew-x-12 rounded-sm" />
                <input
                  type="text"
                  value={playerNames[idx]}
                  onChange={(e) => updatePlayerName(idx, e.target.value)}
                  placeholder={`PLAYER ${idx + 1}`}
                  disabled={isRolling}
                  className="relative w-full bg-transparent border-b border-gray-700 text-[10px] font-black text-gray-400 focus:text-white tracking-[0.2em] py-2 text-center focus:outline-none focus:border-[#FF4655] placeholder:text-gray-700 uppercase transition-all font-mono"
                />
              </div>

              <div 
                className={`relative w-full aspect-[3/4] bg-[#1c252e] border-2 transition-all duration-300 transform ${
                isEmpty 
                  ? 'border-gray-800 border-dashed opacity-50' 
                  : isFinalized 
                    ? 'border-[#FF4655] scale-105 shadow-[0_0_30px_rgba(255,70,85,0.2)] z-10' 
                    : 'border-white/20'
              }`}
              style={{
                clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
              }}
            >
              {agent ? (
                <>
                  {/* Agent Image */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                     <img 
                       src={agent.fullPortrait || agent.displayIcon} 
                       alt={agent.displayName}
                       className={`w-[140%] h-[140%] object-cover object-top transition-all duration-300 ${isFinalized ? 'scale-100 opacity-100' : 'scale-110 opacity-80 blur-sm'}`}
                     />
                     {/* Scanline Effect during roll */}
                     {!isFinalized && isRolling && (
                       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan" />
                     )}
                  </div>

                  {/* Info Panel (Bottom) */}
                  <div className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 transition-all duration-500 ${isFinalized ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                    <div className="flex items-end justify-between">
                      <div>
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
                /* Empty State */
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
                  <Users size={48} className="mb-2 opacity-50" />
                  <span className="text-xs font-mono uppercase">Waiting for Lock In</span>
                </div>
              )}
            </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
