import { useState, useRef, useEffect, useCallback } from 'react';
import type { Agent } from '../types';
import { api } from '../lib/api';
import { generateAgentSelection } from '../utils/randomizerLogic';

interface UseRandomizerProps {
  agents: Agent[];
  pool: Agent[];
  excludedAgentIds: Set<string>;
  playerCount: number;
  gameMode: 'full' | 'balance';
}

export const useRandomizer = ({
  agents,
  pool,
  excludedAgentIds,
  playerCount,
  gameMode,
}: UseRandomizerProps) => {
  const [isRolling, setIsRolling] = useState(false);
  const [rollResults, setRollResults] = useState<(Agent | null)[]>([]);
  const [finalizedCount, setFinalizedCount] = useState(0); 

  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFinalizedCount(0);
    setRollResults(prev => {
      if (prev.length !== playerCount) {
        return Array(playerCount).fill(null);
      }
      return prev;
    });
  }, [playerCount]);

  const startRandomizer = useCallback((
    lockedIndices: Set<number> = new Set(),
    bannedAgentIds: Set<string> = new Set(),
    currentResults: (Agent | null)[] = []
  ) => {
    const effectivePool = gameMode === 'balance' ? agents : pool;
    
    // Count how many non-locked slots need agents
    const lockedCount = lockedIndices.size;
    const slotsToFill = playerCount - lockedCount;
    
    // Filter out banned agents from pool
    const availablePool = effectivePool.filter(a => !bannedAgentIds.has(a.uuid));
    
    if (availablePool.length < slotsToFill || isRolling) return;

    setIsRolling(true);
    
    // Preserve locked agents, reset only unlocked slots
    const initialResults = Array(playerCount).fill(null).map((_, i) => {
      if (lockedIndices.has(i) && currentResults[i]) {
        return currentResults[i];
      }
      return null;
    });
    
    // Count finalized as locked count initially
    setFinalizedCount(lockedCount);
    setRollResults(initialResults);

    let revealedLocal = 0; 

    rollIntervalRef.current = setInterval(() => {
      const shuffledAnim = [...availablePool];
      for (let i = shuffledAnim.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledAnim[i], shuffledAnim[j]] = [shuffledAnim[j], shuffledAnim[i]];
      }
      
      setRollResults(prev => {
         const next = [...prev];
         if (next.length !== playerCount) {
             return Array(playerCount).fill(null).map((_, i) => {
               if (lockedIndices.has(i) && currentResults[i]) return currentResults[i];
               return shuffledAnim[i % shuffledAnim.length];
             });
         }

         let animIdx = 0;
         for (let i = 0; i < playerCount; i++) {
             // Skip locked agents - they keep their value
             if (lockedIndices.has(i)) continue;
             
             if (i >= revealedLocal) {
                 next[i] = shuffledAnim[animIdx % shuffledAnim.length];
             }
             animIdx++;
         }
         return next;
      });
    }, 80); 

    // Get locked agent IDs to exclude from selection
    const lockedAgentIds = new Set<string>();
    lockedIndices.forEach(i => {
      if (currentResults[i]) lockedAgentIds.add(currentResults[i]!.uuid);
    });
    
    // Combine excluded IDs: banned + locked + existing exclusions
    const combinedExclusions = new Set([...excludedAgentIds, ...bannedAgentIds, ...lockedAgentIds]);
    
    const finalSelection = generateAgentSelection(
        gameMode, 
        slotsToFill, 
        agents.filter(a => !lockedAgentIds.has(a.uuid)), 
        gameMode === 'balance' ? bannedAgentIds : combinedExclusions
    );

    setTimeout(() => {
      let selectionIdx = 0;
      
      const revealNext = () => {
        // Find next non-locked slot
        while (revealedLocal < playerCount && lockedIndices.has(revealedLocal)) {
          revealedLocal++;
        }
        
        if (revealedLocal < playerCount) {
          const currentIndex = revealedLocal; 

          setRollResults(prev => {
            const next = [...prev];
            if (next[currentIndex] !== undefined && finalSelection[selectionIdx]) {
                next[currentIndex] = finalSelection[selectionIdx];
            }
            return next;
          });
          
          revealedLocal++; 
          selectionIdx++;
          setFinalizedCount(lockedCount + selectionIdx);
          
          revealTimeoutRef.current = setTimeout(revealNext, 600);
        } else {
          if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
          setIsRolling(false);
          
          // Build final results for logging
          const finalResults: Agent[] = [];
          let fIdx = 0;
          for (let i = 0; i < playerCount; i++) {
            if (lockedIndices.has(i) && currentResults[i]) {
              finalResults.push(currentResults[i]!);
            } else if (finalSelection[fIdx]) {
              finalResults.push(finalSelection[fIdx]);
              fIdx++;
            }
          }
          api.logPick(gameMode, finalResults);
        }
      };

      revealNext();
    }, 1200);
  }, [agents, pool, excludedAgentIds, playerCount, gameMode, isRolling]);

  const resetRandomizer = useCallback(() => {
    setRollResults(Array(playerCount).fill(null));
    setFinalizedCount(0);
    setIsRolling(false);
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
  }, [playerCount]);

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  const rerollSingleAgent = useCallback((
    index: number, 
    lockedIndices: Set<number>,
    bannedAgentIds: Set<string>
  ) => {
    if (isRolling || lockedIndices.has(index)) return null;
    
    const effectivePool = gameMode === 'balance' ? agents : pool;
    
    // Get currently used agent IDs (excluding the one being rerolled)
    const usedAgentIds = new Set<string>();
    rollResults.forEach((agent, i) => {
      if (agent && i !== index) {
        usedAgentIds.add(agent.uuid);
      }
    });
    
    // Filter pool: exclude used agents and banned agents
    const availableAgents = effectivePool.filter(
      agent => !usedAgentIds.has(agent.uuid) && !bannedAgentIds.has(agent.uuid)
    );
    
    if (availableAgents.length === 0) return null;
    
    // Pick random agent from available pool
    const newAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
    
    setRollResults(prev => {
      const next = [...prev];
      next[index] = newAgent;
      return next;
    });
    
    return newAgent;
  }, [agents, pool, rollResults, gameMode, isRolling]);

  return {
    isRolling,
    setIsRolling, 
    rollResults,
    finalizedCount,
    setFinalizedCount,
    startRandomizer,
    resetRandomizer,
    setRollResults,
    rerollSingleAgent
  };
};
