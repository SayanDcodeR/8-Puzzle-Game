# 🧩 8-Puzzle Game

A **premium sliding puzzle game** built with React, featuring an AI-powered A* solver, stunning glassmorphism UI, Framer Motion animations, and a full-stack leaderboard backed by MongoDB.

> **Think. Slide. Solve.**

---

## ✨ Features

- **Classic 8-Puzzle Gameplay** — Slide numbered tiles on a 3×3 grid to arrange them in order
- **Three Difficulty Levels** — Easy, Medium, and Hard (controlled by shuffle depth)
- **AI Solver (A\*)** — Watch the puzzle solve itself using A* pathfinding, running in a Web Worker for smooth performance
- **Hint System** — Get a nudge in the right direction when you're stuck
- **Undo Support** — Take back your last move
- **Move & Time Tracking** — Tracks your moves and elapsed time in real-time
- **Star Rating & Grading** — Performance graded on move efficiency (⭐–⭐⭐⭐) and letter grade (S/A/B/C)
- **Keyboard & Swipe Controls** — Navigate via arrow keys or touch gestures
- **Sound Effects** — Immersive audio feedback powered by Howler.js
- **Confetti Celebration** — Canvas confetti on victory 🎉
- **Share Results** — Copy a shareable summary of your solve to the clipboard
- **PWA Support** — Installable as a Progressive Web App with offline service worker
- **Leaderboard** — Global leaderboard with sorting by time or steps, filterable by difficulty

---

## 🛠️ Tech Stack

| Layer        | Technology                                                   |
|-------------|--------------------------------------------------------------|
| **Frontend** | React 19, Vite 6, Tailwind CSS 4                            |
| **Animations** | Framer Motion 11                                          |
| **State**    | Zustand 5                                                    |
| **Icons**    | Lucide React                                                 |
| **Audio**    | Howler.js                                                    |
| **Routing**  | React Router DOM 7                                           |
| **Backend**  | Express 4, Mongoose 8                                        |
| **Database** | MongoDB (Atlas or local) with `mongodb-memory-server` fallback |

---

## 📁 Project Structure

```
8 Puzzle Game/
├── public/
│   ├── favicon.svg
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
├── server/
│   ├── models/
│   │   └── LeaderboardEntry.js
│   ├── server.js              # Express API server
│   ├── .env                   # MongoDB connection config
│   └── package.json
├── src/
│   ├── components/
│   │   ├── ConfirmModal.jsx
│   │   ├── ControlsPanel.jsx
│   │   ├── GameBoard.jsx
│   │   ├── Header.jsx
│   │   ├── KeyboardTooltip.jsx
│   │   ├── ParticleBackground.jsx
│   │   ├── StatsPanel.jsx
│   │   ├── Tile.jsx
│   │   └── VictoryModal.jsx
│   ├── lib/
│   │   ├── audioManager.js    # Sound effects manager
│   │   ├── leaderboardApi.js  # API client for leaderboard
│   │   └── puzzleLogic.js     # Core puzzle utilities
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LeaderboardPage.jsx
│   │   └── PlayPage.jsx
│   ├── store/
│   │   └── gameStore.js       # Zustand global store
│   ├── workers/
│   │   └── solverWorker.js    # A* solver Web Worker
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Start the Leaderboard Server

```bash
cd server
npm run dev
```

> The server starts on `http://localhost:5000`. By default it uses **mongodb-memory-server** (in-memory database) — no MongoDB installation required! Data resets on server restart. Set `MONGODB_URI` in `server/.env` for persistence.

### 4. Start the Frontend Dev Server

In a new terminal:

```bash
npm run dev
```

> Opens on `http://localhost:5173` with Vite's HMR. API requests to `/api/*` are automatically proxied to the backend.

### 5. Build for Production

```bash
npm run build
npm run preview
```

---

## 🎮 How to Play

1. **Objective** — Arrange tiles 1–8 in order with the blank in the bottom-right corner
2. **Click** a tile adjacent to the blank space, or use **Arrow Keys** / **swipe** to slide tiles
3. Track your **moves** and **time** — fewer moves and faster times earn more stars
4. Stuck? Use the **Hint** button for guidance, or let the **AI Solver** show you the optimal path
5. After winning, **submit your score** to the leaderboard with your name

---

## 🌐 API Endpoints

| Method   | Endpoint             | Description                |
|----------|----------------------|----------------------------|
| `GET`    | `/api/leaderboard`   | Fetch top 50 scores        |
| `POST`   | `/api/leaderboard`   | Submit a new score         |
| `DELETE` | `/api/leaderboard`   | Clear all leaderboard data |
| `GET`    | `/api/health`        | Server health check        |

### Query Parameters (GET /api/leaderboard)

- `sortBy` — `time` (default) or `steps`
- `difficulty` — `easy`, `medium`, `hard`, or `all`

---

## ⚙️ Environment Variables

Create a `server/.env` file:

```env
# MongoDB connection string (optional — defaults to in-memory DB)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/puzzle-leaderboard

# Server port (optional — defaults to 5000)
PORT=5000
```

---

## 📜 License

This project is open-source. Feel free to fork, modify, and share.