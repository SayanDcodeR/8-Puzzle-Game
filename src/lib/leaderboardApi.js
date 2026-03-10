const API_BASE = '/api';

/**
 * Fetch leaderboard entries from the API
 * Falls back to localStorage if API is unavailable
 */
export async function fetchLeaderboard(sortBy = 'time', difficulty = 'all') {
    try {
        const params = new URLSearchParams({ sortBy, difficulty });
        const res = await fetch(`${API_BASE}/leaderboard?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Normalize _id to id for frontend compatibility
        return data.map(entry => ({
            ...entry,
            id: entry._id || entry.id,
        }));
    } catch (err) {
        console.warn('API unavailable, falling back to localStorage:', err.message);
        return loadLocalLeaderboard();
    }
}

/**
 * Submit a score to the API
 * Falls back to localStorage if API is unavailable
 */
export async function submitScore(entry) {
    try {
        const res = await fetch(`${API_BASE}/leaderboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { success: true, entry: { ...data, id: data._id || data.id } };
    } catch (err) {
        console.warn('API unavailable, saving to localStorage:', err.message);
        saveLocalScore(entry);
        return { success: true, fallback: true };
    }
}

/**
 * Clear all leaderboard entries via API
 */
export async function clearLeaderboardApi() {
    try {
        const res = await fetch(`${API_BASE}/leaderboard`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return { success: true };
    } catch (err) {
        console.warn('API unavailable, clearing localStorage:', err.message);
        localStorage.removeItem('puzzle_leaderboard');
        return { success: true, fallback: true };
    }
}

// ── localStorage fallback helpers ──

function loadLocalLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem('puzzle_leaderboard')) || [];
    } catch {
        return [];
    }
}

function saveLocalScore(entry) {
    const lb = loadLocalLeaderboard();
    lb.push({ ...entry, id: Date.now() });
    lb.sort((a, b) => a.time - b.time);
    const trimmed = lb.slice(0, 50);
    localStorage.setItem('puzzle_leaderboard', JSON.stringify(trimmed));
}
