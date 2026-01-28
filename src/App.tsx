import { useState, useRef, useEffect } from 'react';
import type { PickLog } from './lib/api';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AgentRevealSection from './components/agent/AgentRevealSection';
import AgentControlPanel from './components/agent/AgentControlPanel';
import AgentPoolGrid from './components/agent/AgentPoolGrid';
import AgentWallpaper from './components/agent/AgentWallpaper';
import CinematicWallpaper from './components/agent/CinematicWallpaper';
import WeaponRandomizer from './components/weapon/WeaponRandomizer';
import StatisticsSection from './components/stats/StatisticsSection';

import { useValorantData } from './hooks/useValorantData';
import { useAgentFilter } from './hooks/useAgentFilter';
import { useRandomizer } from './hooks/useRandomizer';

export default function App() {
  const { agents, weapons, loading } = useValorantData();
  
  const [currentView, setCurrentView] = useState<'agent' | 'weapon' | 'statistics'>('agent');
  const [playerCount, setPlayerCount] = useState(5);
  const [gameMode, setGameMode] = useState<'full' | 'balance'>('full');
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '', '']);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const {
    excludedAgentIds,
    pool,
    isValidConfig,
    handleRoleClick,
    toggleAgentExclusion,
    resetFilter
  } = useAgentFilter(agents, playerCount);

  const {
    isRolling,
    setIsRolling,
    rollResults,
    finalizedCount,
    setFinalizedCount,
    startRandomizer,
    resetRandomizer,
    setRollResults
  } = useRandomizer({
    agents,
    pool,
    excludedAgentIds,
    playerCount,
    gameMode
  });

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((isRolling || isRestoring) && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isRolling, isRestoring]);

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleRestoreSquad = (log: PickLog) => {
    setIsRestoring(true);
    setCurrentView('agent');
    setPlayerCount(log.picked_agents.length);
    setGameMode(log.mode as 'full' | 'balance');
    setFinalizedCount(0);
    setRollResults(Array(log.picked_agents.length).fill(null));

    // Simulate loading delay
    setTimeout(() => {
        setRollResults(log.picked_agents);
        setFinalizedCount(log.picked_agents.length);
        setIsRestoring(false);
    }, 1500); 
  };

  const resetApp = () => {
    resetFilter();
    resetRandomizer();
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-white font-sans selection:bg-[#FF4655] selection:text-white flex flex-col items-center overflow-hidden">
      
      <Header />
      
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isRolling={isRolling} 
      />

      <main className="flex-1 w-full max-w-6xl p-4 md:p-8 flex flex-col gap-8">
        
        {currentView === 'agent' ? (
          <>
            <section className="bg-[#1c252e] border border-gray-700 rounded-lg p-6 shadow-xl relative">
              <div className="text-center space-y-2 mb-4">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Agent <span className="text-[#FF4655]">Randomizer</span></h2>
              </div>
              <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <img src="https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-a607-4385319db771/displayicon.png" className="w-48 h-48 opacity-20" alt="" />
                  </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <AgentControlPanel 
                  playerCount={playerCount}
                  setPlayerCount={setPlayerCount}
                  gameMode={gameMode}
                  setGameMode={setGameMode}
                  agents={agents}
                  excludedAgentIds={excludedAgentIds}
                  handleRoleClick={handleRoleClick}
                  isRolling={isRolling}
                  startRandomizer={startRandomizer}
                  resetApp={resetApp}
                  isValidConfig={gameMode === 'balance' ? true : isValidConfig}
                  loading={loading}
                />

                <AgentPoolGrid 
                  agents={agents}
                  loading={loading}
                  excludedAgentIds={excludedAgentIds}
                  toggleAgentExclusion={toggleAgentExclusion}
                  isRolling={isRolling}
                  poolSize={pool.length}
                  gameMode={gameMode}
                />
              </div>
            </section>

            <AgentRevealSection 
              playerCount={playerCount}
              rollResults={rollResults}
              finalizedCount={finalizedCount}
              isRolling={isRolling}
              isRestoring={isRestoring}
              playerNames={playerNames}
              updatePlayerName={updatePlayerName}
              resultsRef={resultsRef}
              gameMode={gameMode}
              setGameMode={setGameMode}
              resetApp={resetApp}
            />

            {((!isRolling && finalizedCount === playerCount) || isRolling || isRestoring) && playerCount > 0 && (
               <AgentWallpaper agents={rollResults} isRolling={isRolling} isRestoring={isRestoring} />
            )}

            {(!isRolling && finalizedCount === playerCount && playerCount > 0) || isRestoring ? (
                <CinematicWallpaper agents={rollResults} isRestoring={isRestoring} />
            ) : null}

          </>
        ) : currentView === 'weapon' ? (
           <WeaponRandomizer 
              weapons={weapons} 
              isRolling={isRolling} 
              setIsRolling={setIsRolling} 
           />
        ) : (
           <StatisticsSection onRestore={handleRestoreSquad} />
        )}

      </main>

      <Footer />

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
