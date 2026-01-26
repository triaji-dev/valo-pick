import { RotateCcw, RefreshCw, Play, AlertTriangle } from 'lucide-react';
import { ROLES } from '../../constants';

interface AgentControlPanelProps {
  playerCount: number;
  setPlayerCount: (n: number) => void;
  gameMode: 'full' | 'balance';
  setGameMode: (m: 'full' | 'balance') => void;
  selectedRoles: string[];
  toggleRole: (role: string) => void;
  isRolling: boolean;
  startRandomizer: () => void;
  resetApp: () => void;
  isValidConfig: boolean;
  loading: boolean;
}

export default function AgentControlPanel({
  playerCount,
  setPlayerCount,
  gameMode,
  setGameMode,
  selectedRoles,
  toggleRole,
  isRolling,
  startRandomizer,
  resetApp,
  isValidConfig,
  loading,
}: AgentControlPanelProps) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      
      {/* Player Count */}
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 block">Squad Size</label>
        <div className="flex bg-[#0F1923] p-1 rounded border border-gray-700">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => !isRolling && setPlayerCount(num)}
              disabled={isRolling}
              className={`flex-1 py-2 text-sm font-bold transition-all ${
                playerCount === num 
                  ? 'bg-[#FF4655] text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              } ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Game Mode Selection */}
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 block">Mode</label>
        <div className="flex bg-[#0F1923] p-1 rounded border border-gray-700">
          <button
            onClick={() => !isRolling && playerCount >= 4 && setGameMode('balance')}
            disabled={isRolling || playerCount < 4}
            className={`flex-1 py-2 text-xs font-bold uppercase transition-all relative group ${
              gameMode === 'balance'
                ? 'bg-[#FF4655] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            } ${isRolling || playerCount < 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Balance
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-gray-200 text-[10px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case font-medium border border-gray-600">
              {playerCount < 4 ? "Requires Squad Size 4+" : "1 Duelist, 1 Initiator, 1 Controller, 1 Sentinel guaranteed"}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-600"></div>
            </div>
          </button>
          <button
            onClick={() => !isRolling && setGameMode('full')}
            disabled={isRolling}
            className={`flex-1 py-2 text-xs font-bold uppercase transition-all relative group ${
              gameMode === 'full'
                ? 'bg-[#FF4655] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            } ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Full Random
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-gray-200 text-[10px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case font-medium border border-gray-600">
              Random agents from the pool
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-600"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Role Filter */}
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 block">Role Filter</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(ROLES).map(role => {
            const isActive = selectedRoles.includes(role);
            const config = ROLES[role];
            const Icon = config.icon;
            return (
              <button
                key={role}
                onClick={() => !isRolling && toggleRole(role)}
                disabled={isRolling}
                className={`flex items-center gap-2 px-3 py-2 rounded border transition-all text-sm font-medium ${
                  isActive 
                    ? `${config.bg} ${config.border} ${config.color} border-opacity-100` 
                    : 'bg-[#0F1923] border-gray-700 text-gray-500 hover:border-gray-500'
                } ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon size={16} />
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto pt-4">
        <button
          onClick={startRandomizer}
          disabled={!isValidConfig || isRolling || loading}
          className={`w-full py-4 text-lg font-black uppercase tracking-widest transition-all clip-path-polygon relative group overflow-hidden ${
            !isValidConfig 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : isRolling 
                ? 'bg-[#FF4655] text-white cursor-wait'
                : 'bg-[#FF4655] hover:bg-[#ff2b3d] text-white shadow-[0_0_20px_rgba(255,70,85,0.4)]'
          }`}
          style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isRolling ? <RefreshCw className="animate-spin" /> : <Play fill="currentColor" />}
            {isRolling ? 'Decrypting...' : 'Lock In'}
          </span>
        </button>
        {!isValidConfig && (
          <div className="flex items-center gap-2 mt-3 text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-900/50">
            <AlertTriangle size={14} />
            <span>Not enough agents selected for squad size.</span>
          </div>
        )}
      </div>
      
      {/* Reset Button */}
      <button
        onClick={resetApp}
        disabled={isRolling}
        className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-all border border-gray-700 hover:bg-white/5 text-gray-400 hover:text-white flex items-center justify-center gap-2 ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <RotateCcw size={14} />
        Reset Config
      </button>
    </div>
  );
}
