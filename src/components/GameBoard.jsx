import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'framer-motion';
import Tile from './Tile';
import useGameStore from '../store/gameStore';
import { getSwipeDirection } from '../lib/puzzleLogic';

export default function GameBoard() {
    const board = useGameStore((s) => s.board);
    const handleMove = useGameStore((s) => s.handleMove);
    const handleDirectionMove = useGameStore((s) => s.handleDirectionMove);
    const hintTile = useGameStore((s) => s.hintTile);
    const shakeTile = useGameStore((s) => s.shakeTile);
    const isSolving = useGameStore((s) => s.isSolving);
    const correctTiles = useGameStore((s) => s.correctTiles);

    const boardRef = useRef(null);
    const touchStart = useRef(null);
    const [boardSize, setBoardSize] = useState(360);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    // Responsive board
    useEffect(() => {
        function updateSize() {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const maxSize = Math.min(vw - 48, vh - 260, 440);
            setBoardSize(Math.max(260, maxSize));
        }
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Board tilt
    const handleBoardMouseMove = useCallback((e) => {
        if (!boardRef.current) return;
        const rect = boardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: y * -6, y: x * 6 });
    }, []);

    const handleBoardMouseLeave = useCallback(() => {
        setTilt({ x: 0, y: 0 });
    }, []);

    // Keyboard
    useEffect(() => {
        function handleKey(e) {
            const keyMap = {
                ArrowUp: 'up', ArrowDown: 'down',
                ArrowLeft: 'left', ArrowRight: 'right',
            };
            const dir = keyMap[e.key];
            if (dir) { e.preventDefault(); handleDirectionMove(dir); }
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleDirectionMove]);

    // Swipe
    const handlePointerDown = useCallback((e) => {
        if (e.target.closest('.tile')) return;
        touchStart.current = { x: e.clientX, y: e.clientY };
    }, []);
    const handlePointerUp = useCallback((e) => {
        if (!touchStart.current) return;
        const dx = e.clientX - touchStart.current.x;
        const dy = e.clientY - touchStart.current.y;
        const dir = getSwipeDirection(dx, dy);
        if (dir) handleDirectionMove(dir);
        touchStart.current = null;
    }, [handleDirectionMove]);

    const emptyIdx = board.indexOf(0);
    const emptyRow = Math.floor(emptyIdx / 3);
    const emptyCol = emptyIdx % 3;
    const cellSize = boardSize / 3;

    // Dynamic border glow based on progress
    const progress = correctTiles / 8;
    const borderColor = progress >= 1
        ? 'rgba(16,185,129,0.25)'
        : progress > 0.5
            ? `rgba(6,182,212,${0.05 + progress * 0.1})`
            : 'rgba(255,255,255,0.06)';

    return (
        <motion.div
            ref={boardRef}
            style={{
                position: 'relative',
                width: boardSize,
                height: boardSize,
                touchAction: 'none',
                userSelect: 'none',
                background: 'rgba(16,16,20,0.55)',
                backdropFilter: 'blur(24px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
                border: `1px solid ${borderColor}`,
                borderRadius: '1.25rem',
                boxShadow: `
                    0 30px 70px rgba(0,0,0,0.55),
                    0 0 0 1px rgba(255,255,255,0.03),
                    inset 0 1px 0 rgba(255,255,255,0.04),
                    0 0 80px rgba(6,182,212,${progress * 0.04})
                `,
                transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.12s ease-out, border-color 0.5s ease, box-shadow 0.5s ease',
                transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleBoardMouseMove}
            onMouseLeave={handleBoardMouseLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Grid lines */}
            <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                borderRadius: '1.25rem',
                opacity: 0.04,
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
                `,
                backgroundSize: `${cellSize}px ${cellSize}px`,
            }} />

            {/* Empty cell glow */}
            <motion.div
                style={{
                    position: 'absolute',
                    left: emptyCol * cellSize + cellSize * 0.15,
                    top: emptyRow * cellSize + cellSize * 0.15,
                    width: cellSize * 0.7,
                    height: cellSize * 0.7,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 1,
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.8, 0.4],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                layout
            />

            <LayoutGroup>
                {board.map((value, index) => (
                    <Tile
                        key={value || 'empty'}
                        value={value}
                        index={index}
                        board={board}
                        onMove={handleMove}
                        isHint={hintTile === index}
                        isShaking={shakeTile === index}
                        boardSize={boardSize}
                    />
                ))}
            </LayoutGroup>

            {/* Solving overlay */}
            <AnimatePresence>
                {isSolving && (
                    <motion.div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '1.25rem',
                            zIndex: 10,
                            background: 'rgba(5,5,7,0.75)',
                            backdropFilter: 'blur(8px)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            {/* Orbital spinner */}
                            <div style={{
                                position: 'relative',
                                width: 48,
                                height: 48,
                                margin: '0 auto 16px',
                            }}>
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        border: '2px solid transparent',
                                        borderTopColor: '#06B6D4',
                                        borderRadius: '50%',
                                    }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        inset: 6,
                                        border: '2px solid transparent',
                                        borderTopColor: '#8B5CF6',
                                        borderRadius: '50%',
                                    }}
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                />
                                <motion.div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: 6,
                                        height: 6,
                                        marginLeft: -3,
                                        marginTop: -3,
                                        borderRadius: '50%',
                                        background: '#06B6D4',
                                    }}
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            </div>
                            <motion.p
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    fontFamily: 'var(--font-display)',
                                    letterSpacing: '0.04em',
                                }}
                                className="gradient-text-animated"
                            >
                                AI SOLVING…
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
