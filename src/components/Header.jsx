import { Link, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Puzzle } from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';
import useGameStore from '../store/gameStore';

export default function Header() {
    const muted = useGameStore((s) => s.muted);
    const toggleMute = useGameStore((s) => s.toggleMute);
    const location = useLocation();

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 40,
                background: 'rgba(5,5,7,0.65)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
        >
            {/* Animated glow line along bottom */}
            <div style={{
                position: 'absolute',
                bottom: -1,
                left: 0,
                right: 0,
                height: 1,
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    width: '30%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4), rgba(124,58,237,0.4), transparent)',
                    animation: 'header-glow-sweep 4s ease-in-out infinite',
                }} />
            </div>

            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '0 1.5rem',
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                {/* Logo */}
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                }}>
                    <motion.div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 11,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                            boxShadow: '0 4px 20px rgba(124,58,237,0.3), 0 0 40px rgba(6,182,212,0.1)',
                        }}
                        whileHover={{ rotate: 180, scale: 1.12 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    >
                        <Puzzle size={18} color="white" />
                    </motion.div>
                    <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: '#FAFAFA',
                        letterSpacing: '-0.025em',
                    }}>
                        8-Puzzle
                    </span>
                </Link>

                {/* Nav */}
                <LayoutGroup>
                    <nav style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                    }}>
                        {[
                            { to: '/', label: 'Home' },
                            { to: '/play', label: 'Play' },
                            { to: '/leaderboard', label: 'Leaderboard' },
                        ].map(({ to, label }) => {
                            const active = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    style={{
                                        position: 'relative',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        padding: '0.5rem 1.125rem',
                                        borderRadius: 10,
                                        color: active ? '#FAFAFA' : '#52525B',
                                        transition: 'color 0.25s ease',
                                    }}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                borderRadius: 10,
                                                background: 'rgba(255,255,255,0.06)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                boxShadow: '0 0 20px rgba(6,182,212,0.05)',
                                            }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                                        />
                                    )}
                                    <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
                                </Link>
                            );
                        })}

                        <motion.button
                            onClick={toggleMute}
                            style={{
                                marginLeft: '0.75rem',
                                padding: '0.5rem',
                                borderRadius: 10,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 20px rgba(6,182,212,0.1)' }}
                            whileTap={{ scale: 0.88, rotate: 15 }}
                            aria-label={muted ? 'Unmute' : 'Mute'}
                        >
                            {muted ? (
                                <VolumeX size={18} color="#52525B" />
                            ) : (
                                <Volume2 size={18} color="#06B6D4" />
                            )}
                        </motion.button>
                    </nav>
                </LayoutGroup>
            </div>
        </header>
    );
}
