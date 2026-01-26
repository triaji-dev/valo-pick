import { useState, useEffect, useCallback, useRef } from 'react';
import { Users, CircleDot, Play, X, Shield, Sword, Crosshair, Zap, AlertTriangle, RefreshCw, RotateCcw, BarChart2 } from 'lucide-react';
import { api } from './lib/api';
import StatisticsView from './components/stats/StatisticsView';

/**
 * VALORANT AGENT RANDOMIZER
 * * A tool for selecting team compositions randomly with granular control.
 * Uses the official Valorant API for up-to-date agent data.
 */

// --- Types ---
interface AgentRole {
  displayName: string;
}

interface Agent {
  uuid: string;
  displayName: string;
  displayIcon: string;
  fullPortrait?: string;
  role?: AgentRole;
  isPlayableCharacter?: boolean; // Ensure we only get playable char
}

interface Weapon {
  uuid: string;
  displayName: string;
  displayIcon: string;
  category: string; // e.g., "EEquippableCategory::Rifle"
}

// --- Constants & Fallback Data ---
const ROLES: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  Duelist: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', icon: Sword },
  Initiator: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', icon: Zap },
  Controller: { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/50', icon: CircleDot },
  Sentinel: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', icon: Shield },
};

const FALLBACK_AGENTS: Agent[] = [
  { uuid: '1', displayName: 'Jett', role: { displayName: 'Duelist' }, displayIcon: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png' },
  { uuid: '2', displayName: 'Sage', role: { displayName: 'Sentinel' }, displayIcon: 'https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png' },
  { uuid: '3', displayName: 'Omen', role: { displayName: 'Controller' }, displayIcon: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png' },
  { uuid: '4', displayName: 'Sova', role: { displayName: 'Initiator' }, displayIcon: 'https://media.valorant-api.com/agents/ded3520f-4264-bfed-162d-b080e2af9527/displayicon.png' },
  { uuid: '5', displayName: 'Phoenix', role: { displayName: 'Duelist' }, displayIcon: 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png' },
];

export default function App() {
  // --- State ---
  const [agents, setAgents] = useState<Agent[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'agent' | 'weapon' | 'statistics'>('agent');
  // const [error, setError] = useState<string | null>(null);
  
  // Configuration
  const [playerCount, setPlayerCount] = useState(5);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Duelist', 'Initiator', 'Controller', 'Sentinel']);
  const [gameMode, setGameMode] = useState<'full' | 'balance'>('balance');
  const [excludedAgentIds, setExcludedAgentIds] = useState<Set<string>>(new Set());
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '', '']); // Store custom player names
  
  // Randomizer State
  const [isRolling, setIsRolling] = useState(false);
  const [rollResults, setRollResults] = useState<(Agent | null)[]>(Array(5).fill(null));
  const [finalizedCount, setFinalizedCount] = useState(0); // For staggered reveal
  
  // Animation Refs
  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
        const data = await response.json();
        if (data.status === 200) {
          // Filter out duplicates (sometimes API has duplicates for Sova usually)
          const uniqueAgents = data.data.filter((agent: Agent, index: number, self: Agent[]) => 
            index === self.findIndex((t) => (t.displayName === agent.displayName))
          );
          setAgents(uniqueAgents);
        } else {
          throw new Error('API Error');
        }
      } catch (err) {
        console.error("Failed to fetch agents, using fallback", err);
        setAgents(FALLBACK_AGENTS);
      } finally {
        setLoading(false);
      }
    };

    const fetchWeapons = async () => {
      try {
        const response = await fetch('https://valorant-api.com/v1/weapons');
        const data = await response.json();
        if (data.status === 200) {
           setWeapons(data.data);
        }
      } catch (err) {
         console.error("Failed to fetch weapons", err);
      }
    };

    Promise.all([fetchAgents(), fetchWeapons()]).finally(() => setLoading(false));
  }, []);

  // --- Filtering Logic ---
  const getPool = useCallback(() => {
    return agents.filter(agent => {
      const roleName = agent.role?.displayName;
      const isRoleSelected = roleName ? selectedRoles.includes(roleName) : false;
      const isExcluded = excludedAgentIds.has(agent.uuid);
      return isRoleSelected && !isExcluded;
    });
  }, [agents, selectedRoles, excludedAgentIds]);

  const pool = getPool();
  const isValidConfig = pool.length >= playerCount;

  // --- Handlers ---
  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleAgentExclusion = (uuid: string) => {
    setExcludedAgentIds(prev => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const resetApp = () => {
    setPlayerCount(5);
    setSelectedRoles(['Duelist', 'Initiator', 'Controller', 'Sentinel']);
    setGameMode('balance');
    setExcludedAgentIds(new Set());
    setPlayerNames(['', '', '', '', '']);
    setRollResults(Array(5).fill(null));
    setFinalizedCount(0);
    setIsRolling(false);
  };

  const startRandomizer = () => {
    if (!isValidConfig || isRolling) return;

    setIsRolling(true);
    setFinalizedCount(0);
    
    // Clear previous results visually immediately
    setRollResults(Array(playerCount).fill(null));

    // Start the "shuffling" animation
    let revealedLocal = 0; // Closure variable to coordinate interval and reveal loop

    rollIntervalRef.current = setInterval(() => {
      // Generate random temporary frame
      const currentPool = getPool();
      
      // Shuffle for animation frame
      const shuffledAnim = [...currentPool];
      for (let i = shuffledAnim.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledAnim[i], shuffledAnim[j]] = [shuffledAnim[j], shuffledAnim[i]];
      }
      
      setRollResults(prev => {
         const next = [...prev];
         // Only update slots that aren't revealed yet
         for (let i = 0; i < playerCount; i++) {
             if (i >= revealedLocal) {
                 next[i] = shuffledAnim[i % shuffledAnim.length];
             }
         }
         return next;
      });
    }, 80); // Fast cycle

    // Determine FINAL results immediately so we know where we are going
    let finalPool = [];
    
    if (gameMode === 'balance' && playerCount >= 4) {
       // --- BALANCE MODE LOGIC ---
       const REQUIRED_ROLES = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
       
       // 1. Bucket ALL agents by role (ignoring exclusions for now)
       const roleBuckets: Record<string, Agent[]> = {
         Duelist: [], Initiator: [], Controller: [], Sentinel: []
       };
       
       agents.forEach(a => {
         if (a.role?.displayName && REQUIRED_ROLES.includes(a.role.displayName)) {
           roleBuckets[a.role.displayName].push(a);
         }
       });

       // 2. Pick one from each role
       const forcedPicks: Agent[] = [];
       const usedAgentIds = new Set<string>();

       REQUIRED_ROLES.forEach(role => {
          const allAgentsInRole = roleBuckets[role];
          
          if (allAgentsInRole.length > 0) {
            // Try to find non-excluded agents first
            const validCandidates = allAgentsInRole.filter(a => !excludedAgentIds.has(a.uuid));
            
            let pick: Agent;
            
            if (validCandidates.length > 0) {
               // Normal case: Pick from non-excluded
               pick = validCandidates[Math.floor(Math.random() * validCandidates.length)];
            } else {
               // Fallback case: All agents of this role are excluded, but we MUST fulfill the role.
               // Pick from all agents in this role (Override ban)
               pick = allAgentsInRole[Math.floor(Math.random() * allAgentsInRole.length)];
            }
            
            forcedPicks.push(pick);
            usedAgentIds.add(pick.uuid);
          }
       });

       // 3. Fill the rest if size > 4
       const remainingSlots = Math.max(0, playerCount - forcedPicks.length);
       
       // For filling, we strictly respect exclusions unless we run out of agents (unlikely)
       // Deduplicate source agents first to ensure no subtle duplicates leak through
       const uniqueAgents = Array.from(new Map(agents.map(a => [a.uuid, a])).values());
       const poolForFillers = uniqueAgents.filter(a => !excludedAgentIds.has(a.uuid) && !usedAgentIds.has(a.uuid));
       
       // Shuffle remaining pool
       for (let i = poolForFillers.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [poolForFillers[i], poolForFillers[j]] = [poolForFillers[j], poolForFillers[i]];
       }
       
       const fillers = poolForFillers.slice(0, remainingSlots);
       finalPool = [...forcedPicks, ...fillers];

       // Shuffle the combined result so roles aren't always in first 4 slots
       for (let i = finalPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]];
       }

    } else {
      // --- FULL RANDOM LOGIC (Existing) ---
      // Explicitly dedupe by UUID first to be absolutely safe
      const uniquePool = Array.from(new Map(getPool().map(item => [item.uuid, item])).values());
      
      // Fisher-Yates shuffle
      finalPool = [...uniquePool];
      for (let i = finalPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]];
      }
      finalPool = finalPool.slice(0, playerCount);
    }
    for (let i = finalPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]];
    }
    const finalSelection = finalPool.slice(0, playerCount);

    // Stop shuffling and reveal one by one
    // Let the shuffle run for a bit, then start revealing
    setTimeout(() => {
      const revealNext = () => {
        if (revealedLocal < playerCount) {
          // Capture the current index to ensure the state updater uses the correct value
          // even if revealedLocal changes before the update processes.
          const currentIndex = revealedLocal; 

          // Lock in the current slot
          setRollResults(prev => {
            const next = [...prev];
            next[currentIndex] = finalSelection[currentIndex];
            return next;
          });
          
          revealedLocal++; // Allow interval to skip this index now
          setFinalizedCount(revealedLocal);
          
          revealTimeoutRef.current = setTimeout(revealNext, 500);
        } else {
          // All done
          if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
          setIsRolling(false);
          api.logPick(gameMode, finalSelection);
        }
      };

      revealNext();
    }, 800);


  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  // Scroll to results when rolling starts
  useEffect(() => {
    if (isRolling && resultsRef.current) {
      // Small delay to ensure layout is stable
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isRolling]);


  // --- Render Helpers ---
  const RoleIcon = ({ role, className = "w-4 h-4" }: { role?: string; className?: string }) => {
    const config = role && ROLES[role] ? ROLES[role] : { icon: Crosshair, color: 'text-gray-400', bg: '', border: '' };
    const Icon = config.icon;
    return <Icon className={`${className} ${config.color}`} />;
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-white font-sans selection:bg-[#FF4655] selection:text-white flex flex-col items-center">
      
      {/* Header */}
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

      {/* Navigation */}
      <nav className="w-full bg-[#1c252e] border-b border-gray-700">
        <div className="max-w-6xl mx-auto flex">
          <button
            onClick={() => !isRolling && setCurrentView('agent')}
            disabled={isRolling}
            className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
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
             className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
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
             className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
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

      <main className="flex-1 w-full max-w-6xl p-4 md:p-8 flex flex-col gap-8">
        
        {currentView === 'agent' ? (
          <>
            {/* --- Top Section: Config (AGENT) --- */}
        <section className="bg-[#1c252e] border border-gray-700 rounded-lg p-6 shadow-xl relative">
          {/* Decorative Background Elements - Wrapped to prevent tooltip clipping */}
          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Crosshair size={200} />
              </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Controls */}
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

            {/* Right: Agent Grid */}
            <div className="lg:col-span-8 bg-[#0F1923] rounded border border-gray-800 p-4">
              <div className="flex justify-between items-center mb-4">
                 <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                   Agent Pool ({pool.length})
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
                      const roleName = agent.role?.displayName;
                      const isRoleActive = roleName ? selectedRoles.includes(roleName) : false;
                      const isExcluded = excludedAgentIds.has(agent.uuid);
                      const isAvailable = isRoleActive && !isExcluded;

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
                          {/* Ban Overlay */}
                          {isExcluded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                              <X className="text-red-500 w-8 h-8" />
                            </div>
                          )}
                          {/* Role Indicator (Tiny) */}
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
        </section>

        {/* --- Bottom Section: Results --- */}
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


          </>
        ) : currentView === 'weapon' ? (
           /* --- WEAPON PICKER VIEW --- */
           <WeaponRandomizer weapons={weapons} isRolling={isRolling} setIsRolling={setIsRolling} />
        ) : (
           /* --- STATISTICS VIEW --- */
           <section className="bg-[#1c252e] border border-gray-700 rounded-lg p-6 shadow-xl">
             <div className="flex items-center gap-4 mb-6">
                <BarChart2 className="text-[#FF4655]" size={32} />
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Tactical <span className="text-[#FF4655]">Database</span></h2>
                  <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">History & Analytics Protocol</p>
                </div>
             </div>
             <StatisticsView />
           </section>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0F1923] border-t border-gray-800 p-6 mt-8 text-center text-gray-600 text-xs">
        <p>ValoRandom is an unofficial app and is not endorsed by Riot Games.</p>
        <p> Developed by <a href="https://github.com/triaji-dev" target="_blank" rel="noopener noreferrer" className='text-[#FF4655] hover:text-[#FF4655]/80 transition-colors'>triaji-dev</a>.</p>
      </footer>

      {/* Tailwind Custom Styles for Animation */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 0.15s linear infinite;
        }
      `}</style>
    </div>
  );
}

const WEAPON_CATEGORIES = {
  'Pistol': 'EEquippableCategory::Sidearm',
  'SMG': 'EEquippableCategory::SMG',
  'Shotgun': 'EEquippableCategory::Shotgun',
  'Rifle': 'EEquippableCategory::Rifle',
  'Sniper': 'EEquippableCategory::Sniper',
  'Heavy': 'EEquippableCategory::Heavy',
};

// --- Sub-Component: Weapon Randomizer ---
function WeaponRandomizer({ weapons, isRolling, setIsRolling }: { weapons: Weapon[], isRolling: boolean, setIsRolling: (v: boolean) => void }) {
    const [result, setResult] = useState<Weapon | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(Object.keys(WEAPON_CATEGORIES));

    const toggleCategory = (cat: string) => {
      setSelectedCategories(prev => 
        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
      );
    };

    const getFilteredWeapons = () => {
      return weapons.filter(w => {
        const catName = Object.keys(WEAPON_CATEGORIES).find(key => WEAPON_CATEGORIES[key as keyof typeof WEAPON_CATEGORIES] === w.category);
        return catName && selectedCategories.includes(catName);
      });
    };
  
    const handleRoll = () => {
      const pool = getFilteredWeapons();
      if (isRolling || pool.length === 0) return;
      
      setIsRolling(true);
      setResult(null);
  
      let ticks = 0;
      const interval = setInterval(() => {
        ticks++;
        const randomWeapon = pool[Math.floor(Math.random() * pool.length)];
        setResult(randomWeapon);
      }, 50);
  
      setTimeout(() => {
        clearInterval(interval);
        const finalWeapon = pool[Math.floor(Math.random() * pool.length)];
        setResult(finalWeapon);
        setIsRolling(false);
      }, 1500);
    };
  
    return (
      <div className="flex flex-col items-center gap-8 w-full">
         <div className="text-center space-y-2">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Weapon <span className="text-[#FF4655]">Randomizer</span></h2>
            <p className="text-gray-400 text-sm">Let the protocol decide.</p>
         </div>

         {/* Category Filter */}
         <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
            {Object.keys(WEAPON_CATEGORIES).map(cat => {
              const isActive = selectedCategories.includes(cat);
              // Find a representative weapon for icon
              let repWeapon;
              if (cat === 'Pistol') {
                 repWeapon = weapons.find(w => w.displayName === 'Classic');
              } else {
                 repWeapon = weapons.find(w => w.category === WEAPON_CATEGORIES[cat as keyof typeof WEAPON_CATEGORIES]);
              }
              
              return (
                <button
                  key={cat}
                  onClick={() => !isRolling && toggleCategory(cat)}
                  disabled={isRolling}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded border transition-all ${
                    isActive 
                      ? 'bg-[#FF4655] border-[#FF4655] text-white' 
                      : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                  } ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">{cat}</span>
                  {repWeapon && (
                     <img 
                        src={repWeapon.displayIcon} 
                        alt={cat} 
                        className={`h-6 w-auto object-contain transition-all ${isActive ? 'brightness-200 contrast-0' : 'opacity-50 grayscale'}`} 
                     />
                  )}
                </button>
              );
            })}
         </div>
  
         <div className="relative w-full max-w-lg aspect-video bg-[#1c252e] border-2 border-gray-700 flex items-center justify-center p-8 rounded-lg overflow-hidden group">
            {result ? (
               <div className="flex flex-col items-center relative z-10">
                  <img src={result.displayIcon} alt={result.displayName} className="w-full h-auto drop-shadow-2xl max-h-[200px] object-contain" />
                  <div className="mt-4 text-center">
                    <h3 className="text-2xl font-black uppercase text-white tracking-widest">{result.displayName}</h3>
                    <p className="text-xs text-[#FF4655] font-bold uppercase tracking-widest">{result.category.split('::').pop()}</p>
                  </div>
               </div>
            ) : (
                <div className="text-gray-600 flex flex-col items-center gap-2">
                   <Crosshair size={48} className="opacity-20" />
                   <span className="text-xs font-mono uppercase tracking-widest opacity-50">System Ready</span>
                </div>
            )}
             {/* Background Decoration */}
             <div className="absolute inset-0 bg-[#FF4655]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
         </div>
  
         <button
            onClick={handleRoll}
            disabled={isRolling || getFilteredWeapons().length === 0}
            className={`px-12 py-4 text-lg font-black uppercase tracking-widest transition-all clip-path-polygon relative overflow-hidden ${
              isRolling || getFilteredWeapons().length === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#FF4655] hover:bg-[#ff2b3d] text-white shadow-[0_0_20px_rgba(255,70,85,0.4)]'
            }`}
             style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
             {isRolling ? <RefreshCw className="animate-spin" /> : 'GENERATE WEAPON'}
         </button>
      </div>
    );
  }

