import { motion } from 'framer-motion';
import { Timer, Footprints, Crown, BarChart3 } from 'lucide-react';
import useGameStore from '../store/gameStore';

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

const DIFF = {
    easy: { label: 'Easy', color: '#10B981' },
    medium: { label: 'Medium', color: '#F59E0B' },
    hard: { label: 'Hard', color: '#F43F5E' },
};

export default function StatsPanel() {
    const timerMs = useGameStore((s) => s.timerMs);
    const moves = useGameStore((s) => s.moves);
    const best = useGameStore((s) => s.best);
    const correctTiles = useGameStore((s) => s.correctTiles);
    const difficulty = useGameStore((s) => s.difficulty);

    const progress = (correctTiles / 8) * 100;
    const d = DIFF[difficulty] || DIFF.medium;

    return (
        <motion.div
            className="glass-panel"
            style={{ padding: '1.25rem 1.5rem' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
        >
            {/* Header row */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '0.75rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                        <BarChart3 size={14} style={{ color: d.color }} />
                    </motion.div>
                    <span style={{
                        fontSize: '0.6875rem', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: d.color,
                    }}>
                        {d.label}
                    </span>
                </div>
                <motion.span
                    style={{
                        fontSize: '0.6875rem', fontWeight: 600,
                        color: correctTiles === 8 ? '#10B981' : '#3f3f46',
                    }}
                    key={correctTiles}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                    {correctTiles}/8 correct
                </motion.span>
            </div>

            {/* Progress bar */}
            <div className="progress-bar" style={{ height: 5, marginBottom: '1rem' }}>
                <motion.div
                    className="progress-bar-fill"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                    style={{
                        boxShadow: progress > 50 ? `0 0 10px rgba(6,182,212,${progress / 400})` : 'none',
                    }}
                />
            </div>

            {/* Time */}
            <StatItem
                icon={<Timer size={17} color="#22D3EE" />}
                label="Time"
                value={formatTime(timerMs)}
                mono
            />
            <div style={{ height: 10 }} />
            {/* Moves */}
            <StatItem
                icon={<Footprints size={17} color="#A78BFA" />}
                label="Moves"
                value={moves}
                animateKey={moves}
            />

            <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0.875rem 0' }} />

            <StatItem icon={<Crown size={15} color="#FBBF24" />} label="Best Time"
                value={best.time !== null ? formatTime(best.time) : '--:--.--'} mono small />
            <div style={{ height: 6 }} />
            <StatItem icon={<Crown size={15} color="#FBBF24" />} label="Best Moves"
                value={best.moves !== null ? best.moves : '--'} small />
        </motion.div>
    );
}

function StatItem({ icon, label, value, mono, small, animateKey }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '0.75rem',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {icon}
                <span style={{
                    fontSize: small ? '0.75rem' : '0.8125rem',
                    fontWeight: 500, color: '#52525B',
                }}>
                    {label}
                </span>
            </div>
            <motion.span
                key={animateKey ?? value}
                initial={animateKey ? { scale: 1.2, color: '#06B6D4' } : false}
                animate={{ scale: 1, color: '#FAFAFA' }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                style={{
                    fontSize: small ? '0.875rem' : '1.125rem',
                    fontWeight: 700,
                    fontFamily: mono ? 'var(--font-display)' : 'inherit',
                    letterSpacing: mono ? '0.02em' : 'normal',
                }}
            >
                {value}
            </motion.span>
        </div>
    );
}
