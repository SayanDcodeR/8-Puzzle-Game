import { motion } from 'framer-motion';
import { memo, useCallback, useRef } from 'react';
import { isTileCorrect } from '../lib/puzzleLogic';

const springTransition = {
    type: 'spring',
    stiffness: 380,
    damping: 28,
    mass: 0.7,
};

const Tile = memo(function Tile({ value, index, board, onMove, isHint, isShaking, boardSize }) {
    if (value === 0) return null;

    const row = Math.floor(index / 3);
    const col = index % 3;
    const tileSize = boardSize / 3;
    const gap = 5;
    const correct = isTileCorrect(board, index);
    const buttonRef = useRef(null);

    // Per-tile gradient using value as seed
    const hue = 215 + (value * 14);
    const tileGradient = `linear-gradient(145deg, hsl(${hue}, 12%, 28%), hsl(${hue}, 12%, 16%))`;

    // Ripple effect on click
    const handleClick = useCallback((e) => {
        e.preventDefault();
        onMove(index);

        // Create ripple
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            buttonRef.current.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }
    }, [index, onMove]);

    return (
        <motion.button
            ref={buttonRef}
            layout
            layoutId={`tile-${value}`}
            className={`tile ${correct ? 'tile-correct' : ''} ${isHint ? 'hint-pulse' : ''} ${isShaking ? 'invalid-shake' : ''}`}
            style={{
                position: 'absolute',
                width: tileSize - gap * 2,
                height: tileSize - gap * 2,
                left: col * tileSize + gap,
                top: row * tileSize + gap,
                fontSize: tileSize * 0.34,
                zIndex: 2,
                background: tileGradient,
                boxShadow: correct
                    ? `0 6px 20px rgba(0,0,0,0.35), 0 0 20px rgba(16,185,129,0.1), inset 0 1px 0 rgba(255,255,255,0.08)`
                    : `0 6px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
            transition={springTransition}
            whileTap={{ scale: 0.88, transition: { duration: 0.1 } }}
            whileHover={{
                scale: 1.06,
                y: -3,
                boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 0 25px rgba(6,182,212,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
            onPointerDown={handleClick}
            aria-label={`Tile ${value}${correct ? ' (correct)' : ''}`}
        >
            <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.05 * value }}
                style={{ position: 'relative', zIndex: 2 }}
            >
                {value}
            </motion.span>
        </motion.button>
    );
});

export default Tile;
