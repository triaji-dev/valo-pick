import { X, Lock } from 'lucide-react';
import type { Agent } from '../../types';
import RoleIcon from '../ui/RoleIcon';

interface AgentPoolGridProps {
  agents: Agent[];
  loading: boolean;
  excludedAgentIds: Set<string>;
  lockedAgentIds: Set<string>;
  toggleAgentExclusion: (uuid: string) => void;
  isRolling: boolean;
  poolSize: number;
  gameMode: 'full' | 'balance';
}

export default function AgentPoolGrid({
  agents,
  loading,
  excludedAgentIds,
  lockedAgentIds,
  toggleAgentExclusion,
  isRolling,
  poolSize,
  gameMode,
}: AgentPoolGridProps) {
  return (
    <div className="lg:col-span-8 bg-[#0F1923] rounded border border-gray-800 p-4">
      <div className="flex justify-between items-center mb-4">
         <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">
           Agent Pool ({poolSize})
         </label>
         <div className="text-[10px] text-gray-600 font-mono">
           {gameMode !== 'balance' && (
             "CLICK TO BAN/UNBAN"
           )}
         </div>
      </div>
      
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[#FF4655] animate-pulse">
            Loading Agent Database...
          </div>
        ) : (
          <div className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 transition-all duration-300 ${gameMode === 'balance' ? 'opacity-20 grayscale-50 pointer-events-none' : ''}`}>
            {agents
              .sort((a,b) => a.displayName.localeCompare(b.displayName))
              .map(agent => {
                const isExcluded = excludedAgentIds.has(agent.uuid);
                const isLocked = lockedAgentIds.has(agent.uuid);
                const isAvailable = !isExcluded && !isLocked;

                return (
                  <button
                    key={agent.uuid}
                    onClick={() => !isRolling && !isLocked && toggleAgentExclusion(agent.uuid)}
                    disabled={isRolling || gameMode === 'balance' || isLocked}
                    title={isLocked ? `${agent.displayName} (Locked)` : agent.displayName}
                    className={`relative aspect-square rounded overflow-hidden border transition-all group ${
                      isLocked
                        ? 'border-emerald-500 opacity-80 cursor-not-allowed'
                        : isAvailable 
                          ? 'border-gray-600 opacity-100 hover:border-[#FF4655]' 
                          : 'border-gray-800 opacity-30 grayscale'
                    }`}
                  >
                    <img 
                      src={agent.displayIcon} 
                      alt={agent.displayName}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    />
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/60">
                        <Lock className="text-emerald-400 w-5 h-5" />
                      </div>
                    )}
                    {isExcluded && !isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <X className="text-red-500 w-8 h-8" />
                      </div>
                    )}
                    
                    <div className={`absolute bottom-0 right-0 p-0.5 bg-black/80 ${!isAvailable && 'hidden'}`}>
                       <RoleIcon role={agent.role?.displayName} className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
