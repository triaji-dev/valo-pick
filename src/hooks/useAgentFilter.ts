import { useState, useCallback } from 'react';
import type { Agent } from '../types';

export const useAgentFilter = (agents: Agent[], playerCount: number) => {
  const [excludedAgentIds, setExcludedAgentIds] = useState<Set<string>>(new Set());

  const getPool = useCallback(() => {
    return agents.filter(agent => !excludedAgentIds.has(agent.uuid));
  }, [agents, excludedAgentIds]);

  const pool = getPool();
  const isValidConfig = pool.length >= playerCount;

  const handleRoleClick = (role: string) => {
    const roleAgents = agents.filter(a => a.role?.displayName === role);
    const totalInRole = roleAgents.length;
    const bannedInRole = roleAgents.filter(a => excludedAgentIds.has(a.uuid)).length;
    
    const isAllBanned = bannedInRole === totalInRole;
    
    setExcludedAgentIds(prev => {
        const next = new Set(prev);
        roleAgents.forEach(a => {
            if (isAllBanned) {
               next.delete(a.uuid);
            } else {
               next.add(a.uuid);
            }
        });
        return next;
    });
  };

  const toggleAgentExclusion = (uuid: string) => {
    setExcludedAgentIds(prev => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  };

  const resetFilter = () => {
    setExcludedAgentIds(new Set());
  };

  return {
    excludedAgentIds,
    setExcludedAgentIds,
    pool,
    isValidConfig,
    handleRoleClick,
    toggleAgentExclusion,
    resetFilter
  };
};
