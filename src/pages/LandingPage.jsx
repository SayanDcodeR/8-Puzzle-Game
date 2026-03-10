import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Sparkles, Target, Zap, ArrowRight, Trophy, ChevronRight, Cpu, Gamepad2, Brain } from 'lucide-react';
import useGameStore from '../store/gameStore';

// ── Hero animated puzzle ──
const HERO_TILES = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const TILE_COLORS = {
    1: '#7c3aed', 2: '#6d28d9', 3: '#5b21b6',
    4: '#0891b2', 5: '#06b6d4', 6: '#22d3ee',
    7: '#059669', 8: '#10b981',
};

function HeroPuzzle({ mouseX, mouseY }) {
    const rotateX = useTransform(mouseY, [0, 1], [12, -12]);
    const rotateY = useTransform(mouseX, [0, 1], [-12, 12]);
    const springRotateX = useSpring(rotateX, { stiffness: 80, damping: 18 });
    const springRotateY = useSpring(rotateY, { stiffness: 80, damping: 18 });

    return (
        <motion.div
            style={{
                perspective: 1000,
                display: 'flex',
                justifyContent: 'center',
            }}
            initial={{ opacity: 0, scale: 0.6, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
            <motion.div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 6,
                    width: 'min(340px, 65vw)',
                    rotateX: springRotateX,
                    rotateY: springRotateY,
                    transformStyle: 'preserve-3d',
                }}
            >
                {HERO_TILES.map((value, i) => {
                    if (value === 0) return (
                        <motion.div
                            key="empty"
                            style={{
                                aspectRatio: '1',
                                borderRadius: 14,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.03)',
                            }}
                            animate={{
                                boxShadow: ['0 0 20px rgba(6,182,212,0.0)', '0 0 30px rgba(6,182,212,0.06)', '0 0 20px rgba(6,182,212,0.0)'],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    );
                    return (
                        <motion.div
                            key={value}
                            style={{
                                aspectRatio: '1',
                                borderRadius: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: 'clamp(1.25rem, 4vw, 2.25rem)',
                                color: 'rgba(255,255,255,0.9)',
                                background: `linear-gradient(145deg, ${TILE_COLORS[value]}35, ${TILE_COLORS[value]}15)`,
                                border: `1px solid ${TILE_COLORS[value]}25`,
                                backdropFilter: 'blur(8px)',
                                boxShadow: `0 8px 25px ${TILE_COLORS[value]}12, inset 0 1px 0 rgba(255,255,255,0.08)`,
                            }}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.06, duration: 0.5, type: 'spring', stiffness: 200, damping: 18 }}
                            whileHover={{
                                scale: 1.08,
                                z: 20,
                                boxShadow: `0 16px 45px ${TILE_COLORS[value]}25, inset 0 1px 0 rgba(255,255,255,0.12)`,
                                borderColor: `${TILE_COLORS[value]}50`,
                            }}
                        >
                            {value}
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}

// ── Typewriter text ──
function TypewriterText({ words, className, style }) {
    const [currentWord, setCurrentWord] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setCurrentWord((prev) => (prev + 1) % words.length);
                setVisible(true);
            }, 400);
        }, 3000);
        return () => clearInterval(interval);
    }, [words]);

    return (
        <motion.span
            className={className}
            style={style}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
            transition={{ duration: 0.3 }}
        >
            {words[currentWord]}
        </motion.span>
    );
}

// ── Animated counter ──
function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const inc = target / (duration * 60);
        const timer = setInterval(() => {
            start += inc;
            if (start >= target) { start = target; clearInterval(timer); }
            setCount(Math.floor(start));
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [inView, target, duration]);

    return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

// ── Section reveal ──
const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.12 } },
    viewport: { once: true, margin: '-80px' },
};

const staggerItem = {
    initial: { opacity: 0, y: 25 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function LandingPage() {
    const leaderboard = useGameStore((s) => s.leaderboard);
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    function handleMouseMove(e) {
        mouseX.set(e.clientX / window.innerWidth);
        mouseY.set(e.clientY / window.innerHeight);
    }

    return (
        <div className="page-wrapper" style={{ paddingTop: '4rem' }} onMouseMove={handleMouseMove}>
            {/* ── HERO ── */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '3rem 1.5rem 6rem',
                position: 'relative',
            }}>
                {/* AI badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.05, type: 'spring', stiffness: 200 }}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1.25rem',
                        borderRadius: 100,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#06B6D4',
                        background: 'rgba(6,182,212,0.06)',
                        border: '1px solid rgba(6,182,212,0.12)',
                        marginBottom: '2rem',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        boxShadow: '0 0 30px rgba(6,182,212,0.06)',
                    }}
                >
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    >
                        <Sparkles size={14} />
                    </motion.div>
                    AI-Powered Solver
                </motion.div>

                <HeroPuzzle mouseX={mouseX} mouseY={mouseY} />

                <div style={{ height: '2.5rem' }} />

                {/* Title with typewriter */}
                <motion.h1
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 'clamp(3rem, 9vw, 6.5rem)',
                        lineHeight: 0.95,
                        letterSpacing: '-0.045em',
                        marginBottom: '0.5rem',
                    }}
                >
                    Think.{' '}
                    <TypewriterText
                        words={['Slide.', 'Swipe.', 'Solve.', 'Shine.']}
                        className="gradient-text-animated"
                    />
                    <br />
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                    >
                        Conquer.
                    </motion.span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.8 }}
                    style={{
                        maxWidth: 520,
                        margin: '1.75rem auto 2.75rem',
                        fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',
                        color: '#71717A',
                        lineHeight: 1.75,
                    }}
                >
                    Can you beat the AI? Race against the clock, outsmart the algorithm, and prove you're faster than machine intelligence. Every move counts.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center' }}
                >
                    <Link to="/play" style={{ textDecoration: 'none' }}>
                        <motion.button
                            className="btn-gradient"
                            style={{
                                padding: '1rem 2.25rem',
                                fontSize: '1.0625rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Play Now
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <ArrowRight size={19} />
                            </motion.div>
                        </motion.button>
                    </Link>
                    <Link to="/leaderboard" style={{ textDecoration: 'none' }}>
                        <motion.button
                            className="btn-ghost"
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '1.0625rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            <Trophy size={17} /> Leaderboard
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: '2.5rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                    animate={{ y: [0, 8, 0], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div style={{
                        width: 24,
                        height: 40,
                        borderRadius: 12,
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'center',
                        paddingTop: 8,
                    }}>
                        <motion.div
                            style={{
                                width: 3,
                                height: 8,
                                borderRadius: 2,
                                background: 'rgba(255,255,255,0.3)',
                            }}
                            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* ── STATS ── */}
            <motion.section
                {...fadeUp}
                style={{ maxWidth: 860, margin: '0 auto', padding: '0 1.5rem 7rem' }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                    {[
                        { value: 100, suffix: 'ms', prefix: '<', label: 'AI Solve Time', color: '#06B6D4', icon: <Cpu size={20} /> },
                        { value: 3, suffix: '', prefix: '', label: 'Difficulty Modes', color: '#8B5CF6', icon: <Gamepad2 size={20} /> },
                        { value: 8, suffix: '', prefix: '', label: 'Tiles to Master', color: '#10B981', icon: <Brain size={20} /> },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className="glass-panel card-hover"
                            style={{ padding: '2rem 1.25rem', textAlign: 'center' }}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <motion.div
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    background: `${stat.color}10`,
                                    color: stat.color,
                                    border: `1px solid ${stat.color}18`,
                                }}
                                whileInView={{ animation: 'icon-bob 3s ease-in-out infinite' }}
                            >
                                {stat.icon}
                            </motion.div>
                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '2.5rem',
                                fontWeight: 800,
                                color: stat.color,
                                marginBottom: '0.375rem',
                                letterSpacing: '-0.03em',
                            }}>
                                <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: '#52525B', fontWeight: 500 }}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ── HOW IT WORKS ── */}
            <motion.section
                {...fadeUp}
                style={{ maxWidth: 1060, margin: '0 auto', padding: '0 1.5rem 7rem', textAlign: 'center' }}
            >
                <motion.p
                    style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        color: '#06B6D4',
                        marginBottom: '0.75rem',
                    }}
                >
                    Master the Challenge
                </motion.p>
                <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    marginBottom: '3.5rem',
                }}>
                    How It Works
                </h2>

                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="whileInView"
                    viewport={{ once: true, margin: '-80px' }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(275px, 1fr))',
                        gap: '1.5rem',
                    }}
                >
                    {[
                        {
                            icon: <Sparkles size={26} />,
                            title: 'Shuffle',
                            desc: 'Pick your poison — Easy, Medium, or Hard. Each board is guaranteed solvable. How fast can you crack it?',
                            color: '#8B5CF6',
                        },
                        {
                            icon: <Target size={26} />,
                            title: 'Slide',
                            desc: 'Drag, tap, or use arrow keys to slide tiles into place. Watch them glow green as you nail each position.',
                            color: '#06B6D4',
                        },
                        {
                            icon: <Zap size={26} />,
                            title: 'Solve',
                            desc: 'Stuck? Call in the AI. Watch A* solve it step-by-step in real time — or beat it to prove you\'re faster.',
                            color: '#10B981',
                        },
                    ].map((card) => (
                        <motion.div
                            key={card.title}
                            variants={staggerItem}
                            className="glass-panel card-hover"
                            style={{
                                padding: '2.5rem 2rem',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Top accent */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: '15%',
                                right: '15%',
                                height: 2,
                                background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
                                opacity: 0.5,
                            }} />



                            <motion.div
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem',
                                    background: `${card.color}10`,
                                    color: card.color,
                                    border: `1px solid ${card.color}18`,
                                }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                {card.icon}
                            </motion.div>
                            <h3 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.375rem',
                                fontWeight: 700,
                                marginBottom: '0.75rem',
                                letterSpacing: '-0.01em',
                            }}>
                                {card.title}
                            </h3>
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#52525B',
                                lineHeight: 1.75,
                            }}>
                                {card.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            {/* ── AI Section ── */}
            <motion.section
                {...fadeUp}
                style={{ maxWidth: 860, margin: '0 auto', padding: '0 1.5rem 7rem' }}
            >
                <div className="glass-panel-glow" style={{
                    padding: '3.5rem 2.5rem',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Animated gradient orb */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: '-40%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 350,
                            height: 350,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)',
                            pointerEvents: 'none',
                        }}
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.6, 1, 0.6],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    <motion.div
                        style={{
                            width: 68,
                            height: 68,
                            borderRadius: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            background: 'rgba(6,182,212,0.08)',
                            border: '1px solid rgba(6,182,212,0.12)',
                        }}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Zap size={30} style={{ color: '#06B6D4' }} />
                    </motion.div>
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        letterSpacing: '-0.02em',
                        position: 'relative',
                    }}>
                        A* Search Algorithm
                    </h2>
                    <p style={{
                        fontSize: '0.9375rem',
                        color: '#52525B',
                        lineHeight: 1.8,
                        maxWidth: 560,
                        margin: '0 auto 2.25rem',
                        position: 'relative',
                    }}>
                        The AI finds the optimal path in under 100ms. Think you can beat it? Challenge yourself to solve the puzzle with fewer moves than the machine.
                    </p>
                    <Link to="/play" style={{ textDecoration: 'none' }}>
                        <motion.button
                            className="btn-gradient"
                            style={{
                                padding: '0.875rem 2rem',
                                fontSize: '0.9375rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                position: 'relative',
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            Challenge the AI <ChevronRight size={16} />
                        </motion.button>
                    </Link>
                </div>
            </motion.section>

            {/* ── LEADERBOARD ── */}
            {leaderboard.length > 0 && (
                <motion.section
                    {...fadeUp}
                    style={{ maxWidth: 860, margin: '0 auto', padding: '0 1.5rem 6rem' }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem',
                    }}>
                        <h2 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            letterSpacing: '-0.02em',
                        }}>
                            <Trophy size={28} style={{ color: '#FBBF24' }} />
                            Top Scores
                        </h2>
                        <Link to="/leaderboard" style={{ textDecoration: 'none' }}>
                            <motion.button
                                className="btn-ghost"
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.8125rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                }}
                                whileHover={{ scale: 1.04, x: 3 }}
                            >
                                View All <ChevronRight size={14} />
                            </motion.button>
                        </Link>
                    </div>
                    <div className="glass-panel" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    {['Rank', 'Date', 'Time', 'Steps'].map((h) => (
                                        <th key={h} style={{
                                            padding: '0.875rem 1.25rem',
                                            textAlign: h === 'Time' || h === 'Steps' ? 'right' : 'left',
                                            fontSize: '0.625rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            color: '#3f3f46',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.slice(0, 3).map((entry, i) => (
                                    <motion.tr
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -15 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        style={{
                                            borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                                        }}
                                    >
                                        <td style={{ padding: '0.75rem 1.25rem', fontSize: '1.125rem' }}>
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                                        </td>
                                        <td style={{ padding: '0.75rem 1.25rem', color: '#52525B' }}>
                                            {entry.date}
                                        </td>
                                        <td style={{
                                            padding: '0.75rem 1.25rem',
                                            textAlign: 'right',
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-display)',
                                        }}>
                                            {formatTime(entry.time)}
                                        </td>
                                        <td style={{
                                            padding: '0.75rem 1.25rem',
                                            textAlign: 'right',
                                            fontWeight: 700,
                                            fontFamily: 'var(--font-display)',
                                        }}>
                                            {entry.steps}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>
            )}

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid rgba(255,255,255,0.03)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
            }}>
                <p style={{ fontSize: '0.8125rem', color: '#27272A', fontWeight: 400 }}>
                    Crafted with React, Framer Motion & A* Algorithm
                </p>
            </footer>
        </div>
    );
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
