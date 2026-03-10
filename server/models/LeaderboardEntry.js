import mongoose from 'mongoose';

const leaderboardEntrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30,
    },
    time: {
        type: Number,
        required: true,
    },
    steps: {
        type: Number,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
    },
    stars: {
        type: Number,
        min: 0,
        max: 3,
        default: 1,
    },
    grade: {
        type: String,
        enum: ['S', 'A', 'B', 'C', '-'],
        default: 'C',
    },
    date: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

// Index for fast sorted queries
leaderboardEntrySchema.index({ time: 1 });
leaderboardEntrySchema.index({ steps: 1 });

const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);

export default LeaderboardEntry;
