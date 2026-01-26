# 🎲 Valo Pick - Tactical Agent Randomizer & Analytics

**Valo Pick** is a modern web application designed for Valorant players to generate random agent compositions with tactical balance logic, track pick history, and analyze pick statistics over time using a cloud database.

This project demonstrates a full-stack integration between a React Frontend (Vite) and an Express Backend with persistent storage on Neon (PostgreSQL).

---

## ✨ Key Features

### 1. Advanced Agent Randomizer
- **Random Mode**: Selects 5 unique agents purely at random.
- **Balance Mode**: Algorithms guarantee a viable team composition:
  - 1 Duelist
  - 1 Initiator
  - 1 Controller
  - 1 Sentinel
  - 1 Flex (Random unique fill)
- **Exclusion Filters**:
  - Click any agent icon to Ban/Exclude them from the pool.
  - Visual indicators for banned agents (grayscale + red border).
- **Cinematic Animation**:
  - "Continuous Shuffle" effect where unrevealed slots keep cycling.
  - "Sequential Reveal" (Lock In) animation for dramatic effect.
  - Race-condition safe state updates to ensure UI matches Database logs.

### 2. Analytics & History (Neon DB)
- **Log History**:
  - Records every locked-in session to the database.
  - **Infinite Scroll**: Auto-loads historical data in batches of 20 as you scroll.
  - **Inline Delete**: Remove specific history logs with a custom interactive confirmation UI (Check/Cancel).
- **Agent Recap**:
  - **Table View**: Detailed stats showing Pick Count, Role, and Agent Name (with Avatar). Sortable columns.
  - **Interactive Chart**: Dynamic bar chart visualizing top picks.
    - **Dynamic Height**: Chart grows vertically based on the number of agents.
    - **Custom Tooltips**: Hovering bars shows the Agent's Face and exact pick count.

### 3. Modern Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS (Dark/Gaming Theme).
- **Backend**: Express.js (TypeScript), running on port 3001.
- **Database**: Neon (Serverless PostgreSQL).
- **Icons**: Lucide React & Valorant API Assets.

---

## 🛠️ Architecture & Setup

### Database Schema (PostgreSQL)

Execute this SQL in your Neon SQL Editor to set up the required table:

```sql
CREATE TABLE IF NOT EXISTS agent_picks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  mode TEXT,
  picked_agents JSONB
);
```

### Environment Variables (.env)

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/neondb?sslmode=require
```

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development (Concurrent)**:
   Runs both React Client (Vite) and Express Server simultaneously.
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3001`

---

## 🤖 AI Replication Guide

For AI Agents looking to replicate or understand this project, here is the critical file structure and logic map:

### 1. `server/index.ts` (The Backend)
- **Role**: Express server handling API requests.
- **Key Endpoints**:
  - `POST /api/picks`: Saves a JSON array of selected agents.
  - `GET /api/picks`: Fetches history with Pagination (`limit` & `offset`).
  - `DELETE /api/picks/:id`: Hard deletes a log entry.
  - `GET /api/stats/recap`: Aggregates JSONB data using SQL to count agent picks.
    - *Query Tip*: Uses `jsonb_array_elements` to flatten the JSON array for counting.

### 2. `src/lib/api.ts` (The Bridge)
- **Role**: Typed API client.
- **Pattern**: Centralized `api` object containing async functions (`logPick`, `getHistory`, `deletePick`, `getRecap`).
- **Types**: Exports shared interfaces like `PickLog` and `AgentRecap`.

### 3. `src/App.tsx` (The Brain)
- **Role**: Main UI and Randomizer Logic.
- **Critical Logic**:
  - `startRandomizer()`: Handles the "Continuous Shuffle" animation.
  - **Race Condition Fix**: Uses a local variable `currentIndex` inside the reveal implementation to ensure state updates target the correct array index during rapid animation frames.
  - **Balance Logic**: Pre-buckets agents by role, forces 1 of each major role, then fills the 5th spot from the remaining pool (deduplicated).

### 4. `src/components/stats/` (The Data Viz)
- `HistoryTable.tsx`: Implements **IntersectionObserver** for infinite scrolling and per-row delete confirmation state.
- `RecapChart.tsx`: Uses `recharts` with a dynamic height calculation (`data.length * 50`) to ensure all bars are readable regardless of agent count.
