// Basic API client for interacting with our Express backend

const API_BASE = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:3001/api';

export interface PickLog {
  id: string;
  created_at: string;
  mode: string;
  picked_agents: any[]; // JSON array
}

export interface AgentRecap {
  agent_name: string;
  agent_role: string;
  agent_icon: string;
  pick_count: number;
}

export const api = {
  // Log a new pick session
  logPick: async (mode: string, pickedAgents: any[]) => {
    try {
      const response = await fetch(`${API_BASE}/picks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode, picked_agents: pickedAgents }),
      });
      if (!response.ok) throw new Error('Failed to log pick server-side');
      return await response.json();
    } catch (err) {
      console.error("API Error (logPick):", err);
      // Fail silently so we don't block the UI
      return null;
    }
  },

  // Get pick history
  getHistory: async (limit = 20, offset = 0): Promise<PickLog[]> => {
    try {
      const response = await fetch(`${API_BASE}/picks?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      return await response.json();
    } catch (err) {
      console.error("API Error (getHistory):", err);
      return [];
    }
  },

  // Get aggregated stats
  getRecap: async (): Promise<AgentRecap[]> => {
    try {
      const response = await fetch(`${API_BASE}/stats/recap`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (err) {
      console.error("API Error (getRecap):", err);
      return [];
    }
  },

  // Delete a log
  deletePick: async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/picks/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (err) {
      console.error("API Error (deletePick):", err);
      return false;
    }
  }
};
