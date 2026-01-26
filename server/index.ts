import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Routes

// 1. Log a Pick
app.post('/api/picks', async (req: Request, res: Response) => {
  try {
    const { mode, picked_agents } = req.body;
    
    // Validate input (basic)
    if (!picked_agents || !Array.isArray(picked_agents)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const query = `
      INSERT INTO agent_picks (mode, picked_agents)
      VALUES ($1, $2)
      RETURNING *;
    `;
    
    const values = [mode || 'unknown', JSON.stringify(picked_agents)];
    const result = await pool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error saving pick:', err);
    res.status(500).json({ error: 'Failed to save pick' });
  }
});

// 2. Get Pick History
app.get('/api/picks', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const query = `
      SELECT * FROM agent_picks
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const result = await pool.query(query, [limit, offset]);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching picks:', err);
    res.status(500).json({ error: 'Failed to fetch picks' });
  }
});

// 3. Delete a Pick
app.delete('/api/picks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM agent_picks WHERE id = $1 RETURNING id;';
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pick not found' });
    }
    
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting pick:', err);
    res.status(500).json({ error: 'Failed to delete pick' });
  }
});

// 3. Get Aggregated Stats (Recap)
// We can do this in SQL or JS. Doing in SQL is more efficient.
app.get('/api/stats/recap', async (req: Request, res: Response) => {
  try {
    // This query flattens the JSONB array and counts occurrences of each agent
    const query = `
      SELECT 
        agent->>'displayName' as agent_name,
        agent->'role'->>'displayName' as agent_role, 
        agent->>'displayIcon' as agent_icon,
        count(*) as pick_count
      FROM agent_picks,
      jsonb_array_elements(picked_agents) as agent
      GROUP BY agent_name, agent_role, agent_icon
      ORDER BY pick_count DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err: any) {
     // Fallback: server-side processing if SQL function not available (though jsonb_array_elements is standard pg)
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
