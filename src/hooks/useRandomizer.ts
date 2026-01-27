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

  const startRandomizer = useCallback(() => {
    const effectivePool = gameMode === 'balance' ? agents : pool;
    if (effectivePool.length < playerCount || isRolling) return;

    setIsRolling(true);
    setFinalizedCount(0);
    setRollResults(Array(playerCount).fill(null));

    let revealedLocal = 0; 

    rollIntervalRef.current = setInterval(() => {
      const shuffledAnim = [...effectivePool];
      for (let i = shuffledAnim.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledAnim[i], shuffledAnim[j]] = [shuffledAnim[j], shuffledAnim[i]];
      }
      
      setRollResults(prev => {
         const next = [...prev];
         if (next.length !== playerCount) {
             return Array(playerCount).fill(null).map((_, i) => shuffledAnim[i % shuffledAnim.length]);
         }

         for (let i = 0; i < playerCount; i++) {
             if (i >= revealedLocal) {
                 next[i] = shuffledAnim[i % shuffledAnim.length];
             }
         }
         return next;
      });
    }, 80); 

    const finalSelection = generateAgentSelection(
        gameMode, 
        playerCount, 
        agents, 
        gameMode === 'balance' ? new Set() : excludedAgentIds
    );

    setTimeout(() => {
      const revealNext = () => {
        if (revealedLocal < playerCount) {
          const currentIndex = revealedLocal; 

          setRollResults(prev => {
            const next = [...prev];
            if (next[currentIndex] !== undefined && finalSelection[currentIndex]) {
                next[currentIndex] = finalSelection[currentIndex];
            }
            return next;
          });
          
          revealedLocal++; 
          setFinalizedCount(revealedLocal);
          
          revealTimeoutRef.current = setTimeout(revealNext, 1000);
        } else {
          if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
          setIsRolling(false);
          api.logPick(gameMode, finalSelection);
        }
      };

      revealNext();
    }, 1500);
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

  return {
    isRolling,
    setIsRolling, 
    rollResults,
    finalizedCount,
    setFinalizedCount,
    startRandomizer,
    resetRandomizer,
    setRollResults 
  };
};
