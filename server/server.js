import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import LeaderboardEntry from './models/LeaderboardEntry.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ─── Connect to MongoDB ───
async function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (uri) {
        // Use external MongoDB (Atlas or local)
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB:', uri.replace(/\/\/.*@/, '//<credentials>@'));
    } else {
        // Use in-memory MongoDB (zero-install development)
        console.log('⏳ Starting in-memory MongoDB...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        await mongoose.connect(memUri);
        console.log('✅ Connected to in-memory MongoDB');
        console.log('⚠️  Data will be lost when server restarts. Set MONGODB_URI in .env for persistence.');
    }
}

// ─── API Routes ───

// GET /api/leaderboard — Fetch all scores sorted by time (top 50)
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { sortBy = 'time', difficulty } = req.query;

        const filter = {};
        if (difficulty && difficulty !== 'all') {
            filter.difficulty = difficulty;
        }

        const sortField = sortBy === 'steps' ? { steps: 1 } : { time: 1 };

        const entries = await LeaderboardEntry.find(filter)
            .sort(sortField)
            .limit(50)
            .lean();

        res.json(entries);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// POST /api/leaderboard — Submit a new score
app.post('/api/leaderboard', async (req, res) => {
    try {
        const { name, time, steps, difficulty, stars, grade, date } = req.body;

        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Player name is required' });
        }
        if (!time || !steps || !difficulty) {
            return res.status(400).json({ error: 'Missing required fields: time, steps, difficulty' });
        }

        const entry = await LeaderboardEntry.create({
            name: name.trim().slice(0, 30),
            time,
            steps,
            difficulty,
            stars: stars || 1,
            grade: grade || 'C',
            date: date || new Date().toLocaleDateString(),
        });

        res.status(201).json(entry);
    } catch (err) {
        console.error('Error submitting score:', err);
        res.status(500).json({ error: 'Failed to submit score' });
    }
});

// DELETE /api/leaderboard — Clear all scores
app.delete('/api/leaderboard', async (req, res) => {
    try {
        await LeaderboardEntry.deleteMany({});
        res.json({ message: 'Leaderboard cleared' });
    } catch (err) {
        console.error('Error clearing leaderboard:', err);
        res.status(500).json({ error: 'Failed to clear leaderboard' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start Server ───
async function start() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`\n🚀 Leaderboard API running at http://localhost:${PORT}`);
            console.log(`   GET    /api/leaderboard`);
            console.log(`   POST   /api/leaderboard`);
            console.log(`   DELETE /api/leaderboard`);
            console.log(`   GET    /api/health\n`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
}

start();
