import { useState, useEffect } from 'react';
import type { Agent, Weapon } from '../types';
import { FALLBACK_AGENTS } from '../constants';

export const useValorantData = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
        const data = await response.json();
        if (data.status === 200) {
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

  return { agents, weapons, loading };
};
