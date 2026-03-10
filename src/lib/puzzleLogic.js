// 8-Puzzle Logic Utilities

const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 = empty

/**
 * Count inversions: pairs (i, j) where i < j but board[i] > board[j],
 * ignoring the empty tile (0).
 */
export function countInversions(board) {
    let inv = 0;
    const tiles = board.filter((t) => t !== 0);
    for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            if (tiles[i] > tiles[j]) inv++;
        }
    }
    return inv;
}

/**
 * A board is solvable for a 3x3 puzzle (odd width) if inversion count is even.
 */
export function isSolvable(board) {
    return countInversions(board) % 2 === 0;
}

/**
 * Check if the board is in the solved state.
 */
export function isSolved(board) {
    for (let i = 0; i < 9; i++) {
        if (board[i] !== GOAL[i]) return false;
    }
    return true;
}

/**
 * Get the index of the empty tile (0).
 */
export function getEmptyIndex(board) {
    return board.indexOf(0);
}

/**
 * Get indices of tiles adjacent to the empty space.
 */
export function getMovableTiles(board) {
    const emptyIdx = getEmptyIndex(board);
    const row = Math.floor(emptyIdx / 3);
    const col = emptyIdx % 3;
    const moves = [];

    if (row > 0) moves.push(emptyIdx - 3); // above
    if (row < 2) moves.push(emptyIdx + 3); // below
    if (col > 0) moves.push(emptyIdx - 1); // left
    if (col < 2) moves.push(emptyIdx + 1); // right

    return moves;
}

/**
 * Check if a tile at tileIndex can move (is adjacent to empty).
 */
export function canMove(board, tileIndex) {
    return getMovableTiles(board).includes(tileIndex);
}

/**
 * Move a tile (swap with empty). Returns new board array.
 */
export function moveTile(board, tileIndex) {
    const emptyIdx = getEmptyIndex(board);
    if (!canMove(board, tileIndex)) return board;
    const newBoard = [...board];
    newBoard[emptyIdx] = newBoard[tileIndex];
    newBoard[tileIndex] = 0;
    return newBoard;
}

/**
 * Move by direction: 'up' | 'down' | 'left' | 'right'
 * The direction refers to which way the TILE moves (not the blank).
 */
export function moveByDirection(board, direction) {
    const emptyIdx = getEmptyIndex(board);
    const row = Math.floor(emptyIdx / 3);
    const col = emptyIdx % 3;
    let tileIdx = -1;

    switch (direction) {
        case 'up': if (row < 2) tileIdx = emptyIdx + 3; break; // tile below moves up
        case 'down': if (row > 0) tileIdx = emptyIdx - 3; break; // tile above moves down
        case 'left': if (col < 2) tileIdx = emptyIdx + 1; break; // tile right moves left
        case 'right': if (col > 0) tileIdx = emptyIdx - 1; break; // tile left moves right
        default: break;
    }

    if (tileIdx === -1) return { board, moved: false, tileIdx: -1 };
    return { board: moveTile(board, tileIdx), moved: true, tileIdx };
}

/**
 * Generate a random solvable board.
 * shuffleMoves: number of random moves from solved state (controls difficulty)
 */
export function generateSolvableBoard(shuffleMoves = 40) {
    // Start from solved state and make random moves
    let board = [...GOAL];

    for (let i = 0; i < shuffleMoves; i++) {
        const movable = getMovableTiles(board);
        const randomTile = movable[Math.floor(Math.random() * movable.length)];
        board = moveTile(board, randomTile);
    }

    // If somehow ended at solved, add a few more moves
    if (isSolved(board)) {
        const movable = getMovableTiles(board);
        board = moveTile(board, movable[0]);
        const movable2 = getMovableTiles(board);
        board = moveTile(board, movable2[1] || movable2[0]);
    }

    return board;
}

/**
 * Count how many tiles are in their correct (goal) position.
 * Excludes the empty tile.
 */
export function countCorrectTiles(board) {
    let count = 0;
    for (let i = 0; i < 9; i++) {
        if (board[i] !== 0 && board[i] === GOAL[i]) {
            count++;
        }
    }
    return count;
}

/**
 * Check if a specific tile value is in its correct position.
 */
export function isTileCorrect(board, index) {
    return board[index] !== 0 && board[index] === GOAL[index];
}

/**
 * Get the direction of a swipe gesture.
 */
export function getSwipeDirection(dx, dy, threshold = 30) {
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < threshold && absDy < threshold) return null;

    if (absDx > absDy) {
        return dx > 0 ? 'right' : 'left';
    } else {
        return dy > 0 ? 'down' : 'up';
    }
}
