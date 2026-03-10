// A* Solver Web Worker
// Uses Manhattan Distance + Linear Conflict heuristic

const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const SIZE = 3;

// Precompute goal positions for each value
const goalPos = new Array(9);
for (let i = 0; i < 9; i++) {
    if (GOAL[i] === 0) continue;
    goalPos[GOAL[i]] = { row: Math.floor(i / SIZE), col: i % SIZE };
}

function manhattanDistance(board) {
    let dist = 0;
    for (let i = 0; i < 9; i++) {
        const val = board[i];
        if (val === 0) continue;
        const goal = goalPos[val];
        const row = Math.floor(i / SIZE);
        const col = i % SIZE;
        dist += Math.abs(row - goal.row) + Math.abs(col - goal.col);
    }
    return dist;
}

function linearConflict(board) {
    let conflict = 0;

    // Row conflicts
    for (let row = 0; row < SIZE; row++) {
        for (let i = 0; i < SIZE; i++) {
            const idx1 = row * SIZE + i;
            const val1 = board[idx1];
            if (val1 === 0) continue;
            const goalRow1 = goalPos[val1].row;
            if (goalRow1 !== row) continue;

            for (let j = i + 1; j < SIZE; j++) {
                const idx2 = row * SIZE + j;
                const val2 = board[idx2];
                if (val2 === 0) continue;
                const goalRow2 = goalPos[val2].row;
                if (goalRow2 !== row) continue;
                if (goalPos[val1].col > goalPos[val2].col) conflict++;
            }
        }
    }

    // Column conflicts
    for (let col = 0; col < SIZE; col++) {
        for (let i = 0; i < SIZE; i++) {
            const idx1 = i * SIZE + col;
            const val1 = board[idx1];
            if (val1 === 0) continue;
            const goalCol1 = goalPos[val1].col;
            if (goalCol1 !== col) continue;

            for (let j = i + 1; j < SIZE; j++) {
                const idx2 = j * SIZE + col;
                const val2 = board[idx2];
                if (val2 === 0) continue;
                const goalCol2 = goalPos[val2].col;
                if (goalCol2 !== col) continue;
                if (goalPos[val1].row > goalPos[val2].row) conflict++;
            }
        }
    }

    return conflict * 2;
}

function heuristic(board) {
    return manhattanDistance(board) + linearConflict(board);
}

function getNeighbors(board) {
    const emptyIdx = board.indexOf(0);
    const row = Math.floor(emptyIdx / SIZE);
    const col = emptyIdx % SIZE;
    const neighbors = [];
    const dirs = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    for (const [dr, dc] of dirs) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
            const newIdx = nr * SIZE + nc;
            const newBoard = [...board];
            newBoard[emptyIdx] = newBoard[newIdx];
            newBoard[newIdx] = 0;
            neighbors.push({ board: newBoard, movedTileIdx: newIdx });
        }
    }

    return neighbors;
}

function boardKey(board) {
    return board.join(',');
}

function isSolved(board) {
    for (let i = 0; i < 9; i++) {
        if (board[i] !== GOAL[i]) return false;
    }
    return true;
}

function solve(board) {
    if (isSolved(board)) return [];

    const startKey = boardKey(board);
    const gScore = new Map();
    gScore.set(startKey, 0);

    // Min-heap using array (simple priority queue)
    const openSet = [];
    const cameFrom = new Map();
    const h = heuristic(board);

    openSet.push({ board, f: h, g: 0 });

    const closedSet = new Set();
    let iterations = 0;
    const MAX_ITERATIONS = 500000;

    while (openSet.length > 0 && iterations < MAX_ITERATIONS) {
        iterations++;

        // Find node with lowest f
        let bestIdx = 0;
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < openSet[bestIdx].f) bestIdx = i;
        }
        const current = openSet.splice(bestIdx, 1)[0];
        const currentKey = boardKey(current.board);

        if (isSolved(current.board)) {
            // Reconstruct path
            const path = [];
            let key = currentKey;
            while (cameFrom.has(key)) {
                const { from, movedTileIdx } = cameFrom.get(key);
                path.unshift(movedTileIdx);
                key = from;
            }
            return path;
        }

        closedSet.add(currentKey);

        for (const neighbor of getNeighbors(current.board)) {
            const nKey = boardKey(neighbor.board);
            if (closedSet.has(nKey)) continue;

            const tentativeG = current.g + 1;
            const existingG = gScore.get(nKey);

            if (existingG === undefined || tentativeG < existingG) {
                gScore.set(nKey, tentativeG);
                cameFrom.set(nKey, { from: currentKey, movedTileIdx: neighbor.movedTileIdx });
                const f = tentativeG + heuristic(neighbor.board);
                openSet.push({ board: neighbor.board, f, g: tentativeG });
            }
        }
    }

    return null; // No solution found within limits
}

self.addEventListener('message', (e) => {
    const { type, board } = e.data;

    if (type === 'solve') {
        const solution = solve(board);
        self.postMessage({ type: 'solution', moves: solution });
    } else if (type === 'hint') {
        const solution = solve(board);
        if (solution && solution.length > 0) {
            self.postMessage({ type: 'hint', nextMove: solution[0] });
        } else {
            self.postMessage({ type: 'hint', nextMove: null });
        }
    }
});
