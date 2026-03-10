import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, RotateCcw, Lightbulb, Zap, Home, Undo2, Settings2 } from 'lucide-react';
import { useState } from 'react';
import useGameStore from '../store/gameStore';

const DIFFS = [
    { key: 'easy', label: 'Easy', color: '#10B981' },
    { key: 'medium', label: 'Medium', color: '#F59E0B' },
    { key: 'hard', label: 'Hard', color: '#F43F5E' },
];

export default function ControlsPanel() {
    const shuffle = useGameStore((s) => s.shuffle);
    const restart = useGameStore((s) => s.restart);
    const requestHint = useGameStore((s) => s.requestHint);
    const autoSolve = useGameStore((s) => s.autoSolve);
    const undo = useGameStore((s) => s.undo);
    const hintsLeft = useGameStore((s) => s.hintsLeft);
    const isSolving = useGameStore((s) => s.isSolving);
    const gameWon = useGameStore((s) => s.gameWon);
    const canUndo = useGameStore((s) => s.canUndo);
    const difficulty = useGameStore((s) => s.difficulty);
    const setDifficulty = useGameStore((s) => s.setDifficulty);
    const navigate = useNavigate();
    const [showDiff, setShowDiff] = useState(false);

    const dis = isSolving || gameWon;

    return (
        <motion.div
            className="glass-panel"
            style={{ padding: '1.25rem 1.5rem' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
        >
            {/* Difficulty */}
            <div style={{ marginBottom: '0.75rem' }}>
                <motion.button
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.4rem 0.75rem', borderRadius: 9,
                        fontSize: '0.6875rem', fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.03)',
                        color: '#71717A', cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        width: '100%', justifyContent: 'center',
                    }}
                    onClick={() => setShowDiff(!showDiff)}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                    whileTap={{ scale: 0.97 }}
                >
                    <motion.div
                        animate={{ rotate: showDiff ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Settings2 size={12} />
                    </motion.div>
                    Difficulty: {DIFFS.find(d => d.key === difficulty)?.label}
                </motion.button>

                <AnimatePresence>
                    {showDiff && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ display: 'flex', gap: '0.375rem', overflow: 'hidden' }}
                        >
                            {DIFFS.map((d, i) => (
                                <motion.button
                                    key={d.key}
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    style={{
                                        flex: 1, padding: '0.4rem',
                                        borderRadius: 8, fontSize: '0.6875rem',
                                        fontWeight: 600, cursor: 'pointer',
                                        border: difficulty === d.key
                                            ? `1px solid ${d.color}40`
                                            : '1px solid rgba(255,255,255,0.05)',
                                        background: difficulty === d.key
                                            ? `${d.color}12` : 'rgba(255,255,255,0.02)',
                                        color: difficulty === d.key ? d.color : '#3f3f46',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onClick={() => {
                                        setDifficulty(d.key);
                                        setShowDiff(false);
                                        shuffle();
                                    }}
                                >
                                    {d.label}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Button grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.375rem',
                marginBottom: '0.5rem',
            }}>
                <CtrlBtn icon={<Shuffle size={14} />} label="Shuffle" onClick={shuffle} disabled={isSolving} />
                <CtrlBtn icon={<RotateCcw size={14} />} label="Restart" onClick={restart} disabled={isSolving} />
                <CtrlBtn icon={<Lightbulb size={14} />} label={`Hint (${hintsLeft})`}
                    onClick={requestHint} disabled={dis || hintsLeft <= 0} accent />
                <CtrlBtn icon={<Undo2 size={14} />} label="Undo" onClick={undo} disabled={dis || !canUndo} />
                <CtrlBtn icon={<Home size={14} />} label="Home"
                    onClick={() => navigate('/')} style={{ gridColumn: 'span 2' }} />
            </div>

            {/* Auto-Solve */}
            <motion.button
                className="btn-gradient"
                style={{
                    width: '100%', padding: '0.7rem 1rem',
                    fontSize: '0.8125rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: dis ? 0.35 : 1,
                    cursor: dis ? 'not-allowed' : 'pointer',
                }}
                onClick={autoSolve}
                disabled={dis}
                whileHover={dis ? {} : { scale: 1.03, boxShadow: '0 12px 40px rgba(124,58,237,0.3), 0 0 60px rgba(6,182,212,0.08)' }}
                whileTap={dis ? {} : { scale: 0.97 }}
            >
                <motion.div
                    animate={isSolving ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Zap size={15} />
                </motion.div>
                <span>Auto-Solve</span>
            </motion.button>
        </motion.div>
    );
}

function CtrlBtn({ icon, label, onClick, disabled, accent, style = {} }) {
    return (
        <motion.button
            className="btn-ghost"
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.375rem', padding: '0.5rem',
                fontSize: '0.75rem',
                opacity: disabled ? 0.3 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                borderColor: accent ? 'rgba(6,182,212,0.12)' : undefined,
                width: '100%',
                ...style,
            }}
            onClick={onClick}
            disabled={disabled}
            whileHover={disabled ? {} : { scale: 1.04, y: -1 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
        >
            {icon}
            <span>{label}</span>
        </motion.button>
    );
}
