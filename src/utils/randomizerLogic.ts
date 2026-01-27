import type { Agent } from '../types';

export const generateAgentSelection = (
  gameMode: 'full' | 'balance',
  playerCount: number,
  agents: Agent[],
  excludedAgentIds: Set<string>
): Agent[] => {
  let finalPool: Agent[] = [];

  const getPool = () => {
    return agents.filter(agent => !excludedAgentIds.has(agent.uuid));
  };

  if (gameMode === 'balance' && playerCount >= 2) {
    const REQUIRED_ROLES = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];

    const roleBuckets: Record<string, Agent[]> = {
      Duelist: [], Initiator: [], Controller: [], Sentinel: []
    };

    agents.forEach(a => {
      if (a.role?.displayName && REQUIRED_ROLES.includes(a.role.displayName)) {
        roleBuckets[a.role.displayName].push(a);
      }
    });

    if (playerCount < 4) {
      const availableRoles = REQUIRED_ROLES.filter(role => {
        return agents.some(a => a.role?.displayName === role && !excludedAgentIds.has(a.uuid));
      });
      const poolRoles = availableRoles.length > 0 ? availableRoles : REQUIRED_ROLES;

      const shuffledRoles = [...poolRoles];
      for (let i = shuffledRoles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledRoles[i], shuffledRoles[j]] = [shuffledRoles[j], shuffledRoles[i]];
      }
      const chosenRoles: string[] = [];
      for (let i = 0; i < playerCount; i++) {
        chosenRoles.push(shuffledRoles[i % shuffledRoles.length]);
      }

      const pickedAgents: Agent[] = [];

      chosenRoles.forEach(role => {
        const allAgentsInRole = roleBuckets[role];
        if (allAgentsInRole.length > 0) {
          const validCandidates = allAgentsInRole.filter(a => !excludedAgentIds.has(a.uuid));

          let pick: Agent;
          if (validCandidates.length > 0) {
            pick = validCandidates[Math.floor(Math.random() * validCandidates.length)];
          } else {
            pick = allAgentsInRole[Math.floor(Math.random() * allAgentsInRole.length)];
          }
          pickedAgents.push(pick);
        }
      });

      finalPool = pickedAgents;

    } else {
      const forcedPicks: Agent[] = [];
      const usedAgentIds = new Set<string>();

      REQUIRED_ROLES.forEach(role => {
        const allAgentsInRole = roleBuckets[role];

        if (allAgentsInRole.length > 0) {
          const validCandidates = allAgentsInRole.filter(a => !excludedAgentIds.has(a.uuid));

          let pick: Agent;

          if (validCandidates.length > 0) {
            pick = validCandidates[Math.floor(Math.random() * validCandidates.length)];
          } else {
            pick = allAgentsInRole[Math.floor(Math.random() * allAgentsInRole.length)];
          }

          forcedPicks.push(pick);
          usedAgentIds.add(pick.uuid);
        }
      });

      const remainingSlots = Math.max(0, playerCount - forcedPicks.length);

      const uniqueAgents = Array.from(new Map(agents.map(a => [a.uuid, a])).values());
      const poolForFillers = uniqueAgents.filter(a => !excludedAgentIds.has(a.uuid) && !usedAgentIds.has(a.uuid));

      for (let i = poolForFillers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [poolForFillers[i], poolForFillers[j]] = [poolForFillers[j], poolForFillers[i]];
      }

      const fillers = poolForFillers.slice(0, remainingSlots);
      finalPool = [...forcedPicks, ...fillers];
    }

    for (let i = finalPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]];
    }

  } else {
    // Full Random Logic
    const uniquePool = Array.from(new Map(getPool().map(item => [item.uuid, item])).values());

    finalPool = [...uniquePool];
    for (let i = finalPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]];
    }
    finalPool = finalPool.slice(0, playerCount);
  }

  // Final shuffle to mix order
  for (let i = finalPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]];
  }

  return finalPool.slice(0, playerCount);
};
