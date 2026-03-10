import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star, Copy, Check, RotateCcw, User, Send, Loader2 } from 'lucide-react';
import useGameStore from '../store/gameStore';

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

const GRADE_STYLES = {
    S: { bg: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,179,8,0.08))', border: 'rgba(245,158,11,0.3)', text: '#F59E0B', glow: '0 0 30px rgba(245,158,11,0.15)' },
    A: { bg: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.08))', border: 'rgba(16,185,129,0.3)', text: '#10B981', glow: '0 0 25px rgba(16,185,129,0.1)' },
    B: { bg: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(34,211,238,0.08))', border: 'rgba(6,182,212,0.3)', text: '#06B6D4', glow: '0 0 25px rgba(6,182,212,0.1)' },
    C: { bg: 'linear-gradient(135deg, rgba(161,161,170,0.1), rgba(113,113,122,0.05))', border: 'rgba(161,161,170,0.2)', text: '#A1A1AA', glow: 'none' },
};

// Counting-up component
function CountUp({ target, duration = 1.2, format }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0;
        const inc = target / (duration * 60);
        const timer = setInterval(() => {
            start += inc;
            if (start >= target) { start = target; clearInterval(timer); }
            setVal(Math.floor(start));
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [target, duration]);
    return <>{format ? format(val) : val}</>;
}

export default function VictoryModal() {
    const gameWon = useGameStore((s) => s.gameWon);
    const timerMs = useGameStore((s) => s.timerMs);
    const moves = useGameStore((s) => s.moves);
    const isNewBest = useGameStore((s) => s.isNewBest);
    const isSolving = useGameStore((s) => s.isSolving);
    const shuffle = useGameStore((s) => s.shuffle);
    const dismissVictory = useGameStore((s) => s.dismissVictory);
    const starRating = useGameStore((s) => s.starRating);
    const grade = useGameStore((s) => s.grade);
    const copyShareText = useGameStore((s) => s.copyShareText);
    const playerName = useGameStore((s) => s.playerName);
    const submitToLeaderboard = useGameStore((s) => s.submitToLeaderboard);
    const confettiFired = useRef(false);
    const [copied, setCopied] = useState(false);
    const [showStars, setShowStars] = useState(false);
    const [showGrade, setShowGrade] = useState(false);
    const [showStats, setShowStats] = useState(false);

    // Name input & submission state
    const [nameInput, setNameInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const nameInputRef = useRef(null);

    // Initialize name from stored value
    useEffect(() => {
        if (gameWon && playerName) {
            setNameInput(playerName);
        }
    }, [gameWon, playerName]);

    useEffect(() => {
        if (gameWon && !isSolving && !confettiFired.current) {
            confettiFired.current = true;
            const fire = (opts) => confetti({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#F43F5E', '#FAFAFA'],
                gravity: 0.8,
                scalar: 1.2,
                ...opts,
            });
            fire({ angle: 55, origin: { x: 0.2 } });
            fire({ angle: 125, origin: { x: 0.8 } });
            setTimeout(() => fire({ spread: 120, origin: { x: 0.5, y: 0.5 }, particleCount: 60 }), 200);
            setTimeout(() => fire({ particleCount: 40, origin: { x: 0.5, y: 0.4 } }), 500);

            setTimeout(() => setShowStars(true), 500);
            setTimeout(() => setShowGrade(true), 1000);
            setTimeout(() => setShowStats(true), 1200);
        }
        if (!gameWon) {
            confettiFired.current = false;
            setShowStars(false);
            setShowGrade(false);
            setShowStats(false);
            setCopied(false);
            setSubmitted(false);
            setSubmitError('');
            setSubmitting(false);
        }
    }, [gameWon, isSolving]);

    async function handleCopy() {
        const ok = await copyShareText();
        if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    }

    async function handleSubmit() {
        if (!nameInput.trim()) {
            setSubmitError('Please enter your name');
            nameInputRef.current?.focus();
            return;
        }
        setSubmitting(true);
        setSubmitError('');
        try {
            await submitToLeaderboard(nameInput.trim());
            setSubmitted(true);
        } catch (err) {
            setSubmitError('Failed to submit. Try again.');
        } finally {
            setSubmitting(false);
        }
    }

    const gs = GRADE_STYLES[grade] || GRADE_STYLES.C;

    return (
        <AnimatePresence>
            {gameWon && !isSolving && (
                <motion.div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 50,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem',
                        background: 'rgba(5,5,7,0.9)',
                        backdropFilter: 'blur(20px)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <motion.div
                        style={{
                            padding: '2.75rem 2.25rem',
                            maxWidth: 440,
                            width: '100%',
                            textAlign: 'center',
                            background: 'rgba(16,16,20,0.7)',
                            backdropFilter: 'blur(30px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '1.5rem',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 80px rgba(6,182,212,0.04)',
                            position: 'relative',
                            overflow: 'hidden',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        }}
                        initial={{ scale: 0.7, opacity: 0, y: 30, filter: 'blur(10px)' }}
                        animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ scale: 0.8, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    >
                        {/* Glow accent at top */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '15%',
                            right: '15%',
                            height: 2,
                            background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), rgba(124,58,237,0.5), transparent)',
                        }} />

                        {/* Stars */}
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: '0.625rem',
                            marginBottom: '1rem', height: 52,
                        }}>
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, rotate: -60, opacity: 0 }}
                                    animate={showStars ? {
                                        scale: i <= starRating ? 1 : 0.7,
                                        rotate: 0,
                                        opacity: i <= starRating ? 1 : 0.15,
                                    } : {}}
                                    transition={{
                                        delay: i * 0.18,
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 12,
                                    }}
                                >
                                    <Star
                                        size={44}
                                        fill={i <= starRating ? '#F59E0B' : 'none'}
                                        color={i <= starRating ? '#F59E0B' : '#27272A'}
                                        strokeWidth={1.5}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        <motion.h2
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '2rem',
                                fontWeight: 800,
                                marginBottom: '0.5rem',
                                letterSpacing: '-0.03em',
                            }}
                        >
                            Puzzle Solved!
                        </motion.h2>

                        {/* Grade */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={showGrade ? { scale: 1, opacity: 1 } : {}}
                            transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1.25rem', borderRadius: 100,
                                fontSize: '0.875rem', fontWeight: 700,
                                background: gs.bg, border: `1px solid ${gs.border}`,
                                color: gs.text, boxShadow: gs.glow,
                                margin: '0.25rem 0 0.5rem',
                            }}
                        >
                            <span className="grade-badge" style={{ fontSize: '1.25rem' }}>{grade}</span>
                            Grade
                        </motion.div>

                        {isNewBest && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.0, type: 'spring' }}
                                style={{
                                    display: 'block', padding: '0.375rem 0',
                                    fontSize: '0.8125rem', fontWeight: 600, color: '#F59E0B',
                                }}
                            >
                                <motion.span
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    style={{ display: 'inline-block' }}
                                >🏆</motion.span>
                                {' '}New Personal Best!
                            </motion.div>
                        )}

                        {/* Stats with count-up */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={showStats ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4 }}
                            style={{ margin: '1.25rem 0' }}
                        >
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.625rem 0',
                            }}>
                                <span style={{ color: '#52525B', fontSize: '0.9375rem' }}>Time</span>
                                <span style={{
                                    fontSize: '1.375rem', fontWeight: 700,
                                    fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
                                }}>
                                    {showStats
                                        ? <CountUp target={timerMs} duration={1.5} format={formatTime} />
                                        : '00:00.00'
                                    }
                                </span>
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.625rem 0',
                            }}>
                                <span style={{ color: '#52525B', fontSize: '0.9375rem' }}>Moves</span>
                                <span style={{
                                    fontSize: '1.375rem', fontWeight: 700,
                                    fontFamily: 'var(--font-display)',
                                }}>
                                    {showStats ? <CountUp target={moves} duration={1.0} /> : '0'}
                                </span>
                            </div>
                        </motion.div>

                        {/* ── Player Name & Submit ── */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2 }}
                            style={{ marginBottom: '1rem' }}
                        >
                            {!submitted ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.625rem 0.875rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '0.75rem',
                                        transition: 'border-color 0.3s ease',
                                    }}>
                                        <User size={16} style={{ color: '#52525B', flexShrink: 0 }} />
                                        <input
                                            ref={nameInputRef}
                                            type="text"
                                            placeholder="Enter your name..."
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                            maxLength={30}
                                            style={{
                                                flex: 1,
                                                background: 'transparent',
                                                border: 'none',
                                                outline: 'none',
                                                color: '#FAFAFA',
                                                fontSize: '0.875rem',
                                                fontFamily: 'var(--font-body)',
                                            }}
                                        />
                                    </div>
                                    {submitError && (
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#F43F5E',
                                            textAlign: 'left',
                                            paddingLeft: '0.25rem',
                                        }}>
                                            {submitError}
                                        </div>
                                    )}
                                    <motion.button
                                        className="btn-gradient"
                                        style={{
                                            padding: '0.625rem 1.25rem',
                                            fontSize: '0.875rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            width: '100%',
                                            opacity: submitting ? 0.7 : 1,
                                        }}
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        whileHover={!submitting ? { scale: 1.02 } : {}}
                                        whileTap={!submitting ? { scale: 0.98 } : {}}
                                    >
                                        {submitting ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                >
                                                    <Loader2 size={15} />
                                                </motion.div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={15} />
                                                Submit to Leaderboard
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(16,185,129,0.08)',
                                        border: '1px solid rgba(16,185,129,0.2)',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.875rem',
                                        color: '#10B981',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <Check size={16} />
                                    Score submitted as "{nameInput}"!
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4 }}
                            style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                        >
                            <motion.button
                                className="btn-gradient"
                                style={{
                                    padding: '0.75rem 1.75rem', fontSize: '0.9375rem',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                }}
                                onClick={shuffle}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <RotateCcw size={15} /> Play Again
                            </motion.button>
                            <motion.button
                                className="btn-ghost"
                                style={{
                                    padding: '0.75rem 1rem', fontSize: '0.8125rem',
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                }}
                                onClick={handleCopy}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                            >
                                {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Share'}
                            </motion.button>
                            <motion.button
                                className="btn-ghost"
                                style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}
                                onClick={dismissVictory}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                            >
                                Close
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
