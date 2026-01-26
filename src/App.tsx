import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './lib/api';
import type { Agent, Weapon } from './types';
import { FALLBACK_AGENTS } from './constants';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AgentControlPanel from './components/agent/AgentControlPanel';
import AgentPoolGrid from './components/agent/AgentPoolGrid';
import AgentRevealSection from './components/agent/AgentRevealSection';
import WeaponRandomizer from './components/weapon/WeaponRandomizer';
import StatisticsSection from './components/stats/StatisticsSection';

/**
 * VALORANT AGENT RANDOMIZER
 * * A tool for selecting team compositions randomly with granular control.
 * Uses the official Valorant API for up-to-date agent data.
 */

export default function App() {
  // --- State ---
  const [agents, setAgents] = useState<Agent[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'agent' | 'weapon' | 'statistics'>('agent');
  
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
          
          revealTimeoutRef.current = setTimeout(revealNext, 1000);
        } else {
          // All done
          if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
          setIsRolling(false);
          api.logPick(gameMode, finalSelection);
        }
      };

      revealNext();
    }, 1500);
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

  return (
    <div className="min-h-screen bg-[#0F1923] text-white font-sans selection:bg-[#FF4655] selection:text-white flex flex-col items-center">
      
      <Header />
      
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isRolling={isRolling} 
      />

      <main className="flex-1 w-full max-w-6xl p-4 md:p-8 flex flex-col gap-8">
        
        {currentView === 'agent' ? (
          <>
            {/* --- Top Section: Config (AGENT) --- */}
            <section className="bg-[#1c252e] border border-gray-700 rounded-lg p-6 shadow-xl relative">
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    {/* Crosshair icon was used here originally as a big background, we can leave it or import it just for this. 
                        Wait, I removed Crosshair import. Use RoleIcon or just remove it? 
                        In original code: <Crosshair size={200} />
                        I'll re-import Crosshair for this one usage or remove it. 
                        Let's re-import Crosshair from lucide-react.
                    */}
                    <img src="https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-a607-4385319db771/displayicon.png" className="w-48 h-48 opacity-20" alt="" />
                  </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <AgentControlPanel 
                  playerCount={playerCount}
                  setPlayerCount={setPlayerCount}
                  gameMode={gameMode}
                  setGameMode={setGameMode}
                  selectedRoles={selectedRoles}
                  toggleRole={toggleRole}
                  isRolling={isRolling}
                  startRandomizer={startRandomizer}
                  resetApp={resetApp}
                  isValidConfig={isValidConfig}
                  loading={loading}
                />

                <AgentPoolGrid 
                  agents={agents}
                  loading={loading}
                  selectedRoles={selectedRoles}
                  excludedAgentIds={excludedAgentIds}
                  toggleAgentExclusion={toggleAgentExclusion}
                  isRolling={isRolling}
                  poolSize={pool.length}
                />
              </div>
            </section>

            <AgentRevealSection 
              playerCount={playerCount}
              rollResults={rollResults}
              finalizedCount={finalizedCount}
              isRolling={isRolling}
              playerNames={playerNames}
              updatePlayerName={updatePlayerName}
              resultsRef={resultsRef}
            />

          </>
        ) : currentView === 'weapon' ? (
           /* --- WEAPON PICKER VIEW --- */
           <WeaponRandomizer 
              weapons={weapons} 
              isRolling={isRolling} 
              setIsRolling={setIsRolling} 
           />
        ) : (
           /* --- STATISTICS VIEW --- */
           <StatisticsSection />
        )}

      </main>

      <Footer />

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
