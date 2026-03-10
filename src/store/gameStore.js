import { create } from 'zustand';
import {
    generateSolvableBoard,
    isSolved,
    moveTile,
    canMove,
    moveByDirection,
    getMovableTiles,
    countCorrectTiles,
} from '../lib/puzzleLogic';
import { playMoveSound, playInvalidSound, playVictorySound, playHintSound, playUndoSound, playStarSound, setMuted, isMuted } from '../lib/audioManager';
import { fetchLeaderboard as apiFetchLeaderboard, submitScore, clearLeaderboardApi } from '../lib/leaderboardApi';

// Difficulty settings: how many random shuffles to perform
const DIFFICULTY_SHUFFLES = {
    easy: 15,
    medium: 40,
    hard: 100,
};

// Load leaderboard and bests from localStorage
function loadLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem('puzzle_leaderboard')) || [];
    } catch { return []; }
}

function saveLeaderboard(lb) {
    localStorage.setItem('puzzle_leaderboard', JSON.stringify(lb));
}

function loadBest() {
    try {
        return JSON.parse(localStorage.getItem('puzzle_best')) || { time: null, moves: null };
    } catch { return { time: null, moves: null }; }
}

function saveBest(best) {
    localStorage.setItem('puzzle_best', JSON.stringify(best));
}

function loadDifficulty() {
    try {
        return localStorage.getItem('puzzle_difficulty') || 'medium';
    } catch { return 'medium'; }
}

function loadPlayerName() {
    try {
        return localStorage.getItem('puzzle_player_name') || '';
    } catch { return ''; }
}

// Create worker
let solverWorker = null;
function getWorker() {
    if (!solverWorker) {
        solverWorker = new Worker(new URL('../workers/solverWorker.js', import.meta.url), { type: 'module' });
    }
    return solverWorker;
}

/**
 * Calculate star rating based on move efficiency
 * Compares player moves to optimal solution length
 */
function calculateStarRating(playerMoves, optimalMoves) {
    if (!optimalMoves || optimalMoves === 0) return 3;
    const ratio = playerMoves / optimalMoves;
    if (ratio <= 1.2) return 3;     // Within 20% of optimal
    if (ratio <= 2.0) return 2;     // Within 2x optimal
    return 1;                         // More than 2x optimal
}

/**
 * Calculate performance grade
 */
function calculateGrade(playerMoves, optimalMoves, timeMs) {
    if (!optimalMoves) return 'A';
    const ratio = playerMoves / optimalMoves;
    const timePenalty = timeMs > 120000 ? 1 : timeMs > 60000 ? 0.5 : 0;
    const adjustedRatio = ratio + timePenalty;

    if (adjustedRatio <= 1.1) return 'S';
    if (adjustedRatio <= 1.5) return 'A';
    if (adjustedRatio <= 2.5) return 'B';
    return 'C';
}

/**
 * Generate share text
 */
function generateShareText(moves, timeMs, stars, grade, difficulty) {
    const timeStr = formatTimeCompact(timeMs);
    const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    return `🧩 8-Puzzle ${difficulty.toUpperCase()}\n${starStr} Grade: ${grade}\n⏱️ ${timeStr} | 🔢 ${moves} moves\nCan you beat my score?\n#8Puzzle #BrainGame`;
}

function formatTimeCompact(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const useGameStore = create((set, get) => ({
    // Board state
    board: generateSolvableBoard(),
    moves: 0,
    timerMs: 0,
    timerRunning: false,
    timerStarted: false,
    gameWon: false,
    isNewBest: false,

    // Difficulty
    difficulty: loadDifficulty(),

    // Hints
    hintsLeft: 3,
    hintTile: null,
    isSolving: false,
    solveMoves: [],

    // Invalid shake tracking
    shakeTile: null,

    // Audio
    muted: false,

    // Undo history
    moveHistory: [],
    canUndo: false,

    // Correct tiles tracking
    correctTiles: 0,

    // Victory details
    starRating: 0,
    grade: 'C',
    optimalMoves: null,
    shareText: '',

    // Leaderboard & best
    leaderboard: loadLeaderboard(),
    best: loadBest(),
    leaderboardLoading: false,

    // Player name
    playerName: loadPlayerName(),

    // Timer interval ref
    _timerInterval: null,

    // ── Actions ──

    setDifficulty: (diff) => {
        localStorage.setItem('puzzle_difficulty', diff);
        set({ difficulty: diff });
    },

    shuffle: () => {
        const state = get();
        if (state._timerInterval) clearInterval(state._timerInterval);
        const newBoard = generateSolvableBoard(DIFFICULTY_SHUFFLES[state.difficulty] || 40);
        set({
            board: newBoard,
            moves: 0,
            timerMs: 0,
            timerRunning: false,
            timerStarted: false,
            gameWon: false,
            isNewBest: false,
            hintsLeft: 3,
            hintTile: null,
            isSolving: false,
            solveMoves: [],
            shakeTile: null,
            _timerInterval: null,
            moveHistory: [],
            canUndo: false,
            correctTiles: countCorrectTiles(newBoard),
            starRating: 0,
            grade: 'C',
            optimalMoves: null,
            shareText: '',
        });
    },

    restart: () => {
        const state = get();
        if (state._timerInterval) clearInterval(state._timerInterval);
        set({
            board: state.board,
            moves: 0,
            timerMs: 0,
            timerRunning: false,
            timerStarted: false,
            gameWon: false,
            isNewBest: false,
            hintsLeft: 3,
            hintTile: null,
            isSolving: false,
            solveMoves: [],
            shakeTile: null,
            _timerInterval: null,
            moveHistory: [],
            canUndo: false,
            correctTiles: countCorrectTiles(state.board),
            starRating: 0,
            grade: 'C',
            optimalMoves: null,
            shareText: '',
        });
    },

    startTimer: () => {
        const state = get();
        if (state.timerStarted) return;

        const startTime = performance.now();
        const interval = setInterval(() => {
            set({ timerMs: performance.now() - startTime });
        }, 10);

        set({
            timerStarted: true,
            timerRunning: true,
            _timerInterval: interval,
        });
    },

    stopTimer: () => {
        const state = get();
        if (state._timerInterval) {
            clearInterval(state._timerInterval);
        }
        set({ timerRunning: false, _timerInterval: null });
    },

    handleMove: (tileIndex) => {
        const state = get();
        if (state.gameWon || state.isSolving) return;

        if (!canMove(state.board, tileIndex)) {
            playInvalidSound();
            set({ shakeTile: tileIndex });
            setTimeout(() => set({ shakeTile: null }), 400);
            return;
        }

        // Start timer on first valid move
        if (!state.timerStarted) {
            get().startTimer();
        }

        playMoveSound();
        const newBoard = moveTile(state.board, tileIndex);
        const newMoves = state.moves + 1;

        // Push to undo history
        const newHistory = [...state.moveHistory, { board: state.board, moves: state.moves }];

        set({
            board: newBoard,
            moves: newMoves,
            hintTile: null,
            moveHistory: newHistory,
            canUndo: true,
            correctTiles: countCorrectTiles(newBoard),
        });

        // Check win
        if (isSolved(newBoard)) {
            get().handleWin(newMoves);
        }
    },

    handleDirectionMove: (direction) => {
        const state = get();
        if (state.gameWon || state.isSolving) return;

        const result = moveByDirection(state.board, direction);
        if (!result.moved) {
            playInvalidSound();
            return;
        }

        if (!state.timerStarted) {
            get().startTimer();
        }

        playMoveSound();
        const newMoves = state.moves + 1;

        // Push to undo history
        const newHistory = [...state.moveHistory, { board: state.board, moves: state.moves }];

        set({
            board: result.board,
            moves: newMoves,
            hintTile: null,
            moveHistory: newHistory,
            canUndo: true,
            correctTiles: countCorrectTiles(result.board),
        });

        if (isSolved(result.board)) {
            get().handleWin(newMoves);
        }
    },

    undo: () => {
        const state = get();
        if (!state.canUndo || state.moveHistory.length === 0 || state.gameWon || state.isSolving) return;

        playUndoSound();
        const history = [...state.moveHistory];
        const prev = history.pop();

        set({
            board: prev.board,
            moves: prev.moves,
            moveHistory: history,
            canUndo: history.length > 0,
            hintTile: null,
            correctTiles: countCorrectTiles(prev.board),
        });
    },

    handleWin: (totalMoves) => {
        const state = get();
        get().stopTimer();
        playVictorySound();

        const best = { ...state.best };
        let isNewBest = false;

        if (best.time === null || state.timerMs < best.time) {
            best.time = state.timerMs;
            isNewBest = true;
        }
        if (best.moves === null || totalMoves < best.moves) {
            best.moves = totalMoves;
            isNewBest = true;
        }
        saveBest(best);

        // Calculate star rating via solver
        const worker = getWorker();
        worker.postMessage({ type: 'solve', board: state.board });

        // Default ratings (will be updated if solver responds)
        let stars = calculateStarRating(totalMoves, totalMoves);
        let grade = calculateGrade(totalMoves, totalMoves, state.timerMs);

        // Add to leaderboard
        const entry = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            time: state.timerMs,
            steps: totalMoves,
            difficulty: state.difficulty,
            stars,
            grade,
        };
        const lb = [...state.leaderboard, entry]
            .sort((a, b) => a.time - b.time)
            .slice(0, 20);
        saveLeaderboard(lb);

        const shareText = generateShareText(totalMoves, state.timerMs, stars, grade, state.difficulty);

        // Play star sound with delay
        setTimeout(() => playStarSound(stars), 800);

        set({
            gameWon: true,
            isNewBest,
            best,
            leaderboard: lb,
            starRating: stars,
            grade,
            optimalMoves: null,
            shareText,
            correctTiles: 8,
        });
    },

    requestHint: () => {
        const state = get();
        if (state.hintsLeft <= 0 || state.gameWon || state.isSolving) return;

        playHintSound();
        const worker = getWorker();
        worker.postMessage({ type: 'hint', board: state.board });
        worker.onmessage = (e) => {
            if (e.data.type === 'hint' && e.data.nextMove !== null) {
                set({ hintTile: e.data.nextMove, hintsLeft: state.hintsLeft - 1 });
                // Clear hint after 3s
                setTimeout(() => {
                    set((s) => (s.hintTile === e.data.nextMove ? { hintTile: null } : {}));
                }, 3000);
            }
        };
    },

    autoSolve: () => {
        const state = get();
        if (state.isSolving || state.gameWon) return;

        set({ isSolving: true });
        const worker = getWorker();
        worker.postMessage({ type: 'solve', board: state.board });
        worker.onmessage = (e) => {
            if (e.data.type === 'solution' && e.data.moves) {
                const moves = e.data.moves;
                let i = 0;

                function stepSolve() {
                    if (i >= moves.length) {
                        const currentState = get();
                        currentState.stopTimer();
                        playVictorySound();
                        set({ gameWon: true, isSolving: false, isNewBest: false, correctTiles: 8, starRating: 0, grade: '-' });
                        return;
                    }

                    const currentBoard = get().board;
                    const tileIdx = moves[i];
                    playMoveSound();
                    const newBoard = moveTile(currentBoard, tileIdx);
                    set({
                        board: newBoard,
                        moves: get().moves + 1,
                        correctTiles: countCorrectTiles(newBoard),
                    });
                    i++;
                    setTimeout(stepSolve, 300);
                }

                // Start timer if not started
                if (!get().timerStarted) {
                    get().startTimer();
                }
                stepSolve();
            }
        };
    },

    toggleMute: () => {
        const state = get();
        const newMuted = !state.muted;
        setMuted(newMuted);
        set({ muted: newMuted });
    },

    clearLeaderboard: async () => {
        await clearLeaderboardApi();
        localStorage.removeItem('puzzle_leaderboard');
        set({ leaderboard: [] });
    },

    dismissVictory: () => {
        set({ gameWon: false, isNewBest: false });
    },

    setPlayerName: (name) => {
        localStorage.setItem('puzzle_player_name', name);
        set({ playerName: name });
    },

    submitToLeaderboard: async (name) => {
        const state = get();
        const entry = {
            name: name.trim(),
            time: state.timerMs,
            steps: state.moves,
            difficulty: state.difficulty,
            stars: state.starRating,
            grade: state.grade,
            date: new Date().toLocaleDateString(),
        };

        // Save name for next time
        localStorage.setItem('puzzle_player_name', name.trim());
        set({ playerName: name.trim() });

        const result = await submitScore(entry);

        // Refresh leaderboard after submission
        try {
            const fresh = await apiFetchLeaderboard();
            set({ leaderboard: fresh });
        } catch {
            // Use local data as fallback
            const lb = [...state.leaderboard, { ...entry, id: Date.now() }]
                .sort((a, b) => a.time - b.time)
                .slice(0, 50);
            saveLeaderboard(lb);
            set({ leaderboard: lb });
        }

        return result;
    },

    fetchLeaderboardFromApi: async () => {
        set({ leaderboardLoading: true });
        try {
            const data = await apiFetchLeaderboard();
            set({ leaderboard: data, leaderboardLoading: false });
        } catch {
            set({ leaderboardLoading: false });
        }
    },

    copyShareText: async () => {
        const state = get();
        try {
            await navigator.clipboard.writeText(state.shareText);
            return true;
        } catch {
            return false;
        }
    },
}));

export default useGameStore;
