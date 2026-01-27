import { X } from 'lucide-react';
import type { Agent } from '../../types';
import RoleIcon from '../ui/RoleIcon';

interface AgentPoolGridProps {
  agents: Agent[];
  loading: boolean;
  excludedAgentIds: Set<string>;
  toggleAgentExclusion: (uuid: string) => void;
  isRolling: boolean;
  poolSize: number;
}

export default function AgentPoolGrid({
  agents,
  loading,
  excludedAgentIds,
  toggleAgentExclusion,
  isRolling,
  poolSize,
}: AgentPoolGridProps) {
  return (
    <div className="lg:col-span-8 bg-[#0F1923] rounded border border-gray-800 p-4">
      <div className="flex justify-between items-center mb-4">
         <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">
           Agent Pool ({poolSize})
         </label>
         <div className="text-[10px] text-gray-600 font-mono">
           CLICK TO BAN/UNBAN
         </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-40 text-[#FF4655] animate-pulse">
          Loading Agent Database...
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
          {agents
            .sort((a,b) => a.displayName.localeCompare(b.displayName))
            .map(agent => {
              const isExcluded = excludedAgentIds.has(agent.uuid);
              const isAvailable = !isExcluded;

              return (
                <button
                  key={agent.uuid}
                  onClick={() => !isRolling && toggleAgentExclusion(agent.uuid)}
                  disabled={isRolling}
                  title={agent.displayName}
                  className={`relative aspect-square rounded overflow-hidden border transition-all group ${
                    isAvailable 
                      ? 'border-gray-600 opacity-100 hover:border-[#FF4655]' 
                      : 'border-gray-800 opacity-30 grayscale'
                  }`}
                >
                  <img 
                    src={agent.displayIcon} 
                    alt={agent.displayName}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                  />
                  {isExcluded && (
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
  );
}
