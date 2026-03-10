import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowUpDown, Trash2, Star, Clock, Footprints, User, Loader2 } from 'lucide-react';
import useGameStore from '../store/gameStore';
import ConfirmModal from '../components/ConfirmModal';

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

const RANK_COLORS = ['#F59E0B', '#A1A1AA', '#CD7F32'];
const DIFFICULTY_COLORS = {
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#F43F5E',
};

export default function LeaderboardPage() {
    const leaderboard = useGameStore((s) => s.leaderboard);
    const leaderboardLoading = useGameStore((s) => s.leaderboardLoading);
    const clearLeaderboard = useGameStore((s) => s.clearLeaderboard);
    const fetchLeaderboardFromApi = useGameStore((s) => s.fetchLeaderboardFromApi);
    const [sortBy, setSortBy] = useState('time');
    const [filterDiff, setFilterDiff] = useState('all');
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Fetch from API on mount
    useEffect(() => {
        fetchLeaderboardFromApi();
    }, []);

    let filtered = filterDiff === 'all'
        ? [...leaderboard]
        : leaderboard.filter(e => e.difficulty === filterDiff);

    const sorted = filtered.sort((a, b) =>
        sortBy === 'steps' ? a.steps - b.steps : a.time - b.time
    );

    const top3 = sorted.slice(0, 3);
    const rest = sorted.slice(3);

    // Podium order: [2nd, 1st, 3rd] for visual placement
    const podiumOrder = top3.length >= 3
        ? [top3[1], top3[0], top3[2]]
        : top3;
    const podiumHeights = ['9rem', '11.5rem', '7.5rem'];
    const podiumIndices = top3.length >= 3 ? [1, 0, 2] : top3.map((_, i) => i);

    return (
        <div className="page-wrapper" style={{ paddingTop: '3.75rem' }}>
            <motion.div
                style={{
                    maxWidth: 900,
                    margin: '0 auto',
                    padding: '4rem 1.5rem',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                }}>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        letterSpacing: '-0.03em',
                    }}>
                        <motion.div
                            animate={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <Trophy size={34} style={{ color: '#FBBF24' }} />
                        </motion.div>
                        Leaderboard
                    </h1>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                    }}>
                        {/* Sort toggle */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: 3,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 10,
                        }}>
                            <PillBtn active={sortBy === 'time'} color="#06B6D4"
                                onClick={() => setSortBy('time')}>
                                <Clock size={10} /> Time
                            </PillBtn>
                            <PillBtn active={sortBy === 'steps'} color="#8B5CF6"
                                onClick={() => setSortBy('steps')}>
                                <Footprints size={10} /> Steps
                            </PillBtn>
                        </div>

                        {/* Difficulty filter */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: 3,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 10,
                        }}>
                            {['all', 'easy', 'medium', 'hard'].map(d => (
                                <PillBtn key={d} active={filterDiff === d}
                                    color={d === 'all' ? '#71717A' : DIFFICULTY_COLORS[d]}
                                    onClick={() => setFilterDiff(d)}>
                                    {d.charAt(0).toUpperCase() + d.slice(1)}
                                </PillBtn>
                            ))}
                        </div>

                        {leaderboard.length > 0 && (
                            <motion.button
                                className="btn-ghost"
                                style={{
                                    padding: '0.375rem 0.625rem',
                                    fontSize: '0.6875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    color: '#F43F5E',
                                    borderColor: 'rgba(244,63,94,0.15)',
                                }}
                                onClick={() => setConfirmOpen(true)}
                                whileHover={{ scale: 1.04, borderColor: 'rgba(244,63,94,0.3)' }}
                                whileTap={{ scale: 0.96 }}
                            >
                                <Trash2 size={11} /> Clear
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {leaderboardLoading ? (
                    <motion.div
                        className="glass-panel"
                        style={{ padding: '4rem 2rem', textAlign: 'center' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ display: 'inline-block', marginBottom: '1rem' }}
                        >
                            <Loader2 size={32} style={{ color: '#06B6D4' }} />
                        </motion.div>
                        <p style={{ fontSize: '0.875rem', color: '#52525B' }}>
                            Loading leaderboard...
                        </p>
                    </motion.div>
                ) : sorted.length === 0 ? (
                    /* Empty State */
                    <motion.div
                        className="glass-panel"
                        style={{ padding: '6rem 2rem', textAlign: 'center' }}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <motion.div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.04)',
                            }}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Trophy size={38} style={{ color: '#27272A' }} />
                        </motion.div>
                        <h3 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                        }}>
                            No Records Yet
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#3f3f46', maxWidth: 280, margin: '0 auto' }}>
                            Complete a puzzle to appear on the leaderboard!
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {/* ── PODIUM ── */}
                        {top3.length > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                gap: '0.75rem',
                                marginBottom: '2rem',
                                paddingTop: '1rem',
                            }}>
                                {podiumOrder.map((entry, i) => {
                                    const rank = podiumIndices[i];
                                    return (
                                        <motion.div
                                            key={entry.id || entry._id}
                                            className="glass-panel"
                                            style={{
                                                padding: '1.5rem 1rem 1.25rem',
                                                textAlign: 'center',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                flex: 1,
                                                maxWidth: 220,
                                                minHeight: podiumHeights[i],
                                            }}
                                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{
                                                delay: rank * 0.15 + 0.1,
                                                type: 'spring',
                                                stiffness: 200,
                                                damping: 18,
                                            }}
                                            whileHover={{
                                                y: -6,
                                                boxShadow: `0 20px 50px rgba(0,0,0,0.35), 0 0 30px ${RANK_COLORS[rank]}10`,
                                            }}
                                        >
                                            {/* Top accent */}
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: '12%',
                                                right: '12%',
                                                height: 2,
                                                background: RANK_COLORS[rank],
                                                opacity: 0.5,
                                                borderRadius: '0 0 2px 2px',
                                            }} />

                                            {/* Medal */}
                                            <motion.div
                                                style={{ fontSize: rank === 0 ? '2.5rem' : '2rem', marginBottom: '0.25rem' }}
                                                animate={rank === 0 ? { scale: [1, 1.1, 1] } : {}}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                {rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉'}
                                            </motion.div>

                                            {/* Player Name */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.25rem',
                                                marginBottom: '0.375rem',
                                            }}>
                                                <User size={12} style={{ color: '#71717A' }} />
                                                <span style={{
                                                    fontFamily: 'var(--font-display)',
                                                    fontSize: '0.9375rem',
                                                    fontWeight: 700,
                                                    color: '#E4E4E7',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: 140,
                                                }}>
                                                    {entry.name || 'Anonymous'}
                                                </span>
                                            </div>

                                            <div style={{
                                                fontFamily: 'var(--font-display)',
                                                fontSize: rank === 0 ? '1.625rem' : '1.375rem',
                                                fontWeight: 800,
                                                marginBottom: '0.25rem',
                                                letterSpacing: '0.01em',
                                            }}>
                                                {formatTime(entry.time)}
                                            </div>

                                            <div style={{
                                                fontSize: '0.8125rem',
                                                color: '#52525B',
                                                fontWeight: 500,
                                                marginBottom: '0.5rem',
                                            }}>
                                                {entry.steps} moves
                                            </div>

                                            {/* Stars */}
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                                                {[1, 2, 3].map(s => (
                                                    <Star key={s} size={14}
                                                        fill={s <= (entry.stars || 1) ? '#F59E0B' : 'none'}
                                                        color={s <= (entry.stars || 1) ? '#F59E0B' : '#1c1c1e'}
                                                        strokeWidth={1.5}
                                                    />
                                                ))}
                                            </div>

                                            {entry.difficulty && (
                                                <div style={{
                                                    fontSize: '0.5625rem',
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em',
                                                    color: DIFFICULTY_COLORS[entry.difficulty] || '#3f3f46',
                                                    marginTop: '0.5rem',
                                                }}>
                                                    {entry.difficulty}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── TABLE ── */}
                        {rest.length > 0 && (
                            <motion.div
                                className="glass-panel"
                                style={{ overflow: 'hidden' }}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <table style={{ width: '100%', fontSize: '0.8125rem', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Th>Rank</Th>
                                            <Th>Player</Th>
                                            <Th>Date</Th>
                                            <Th align="center">Diff</Th>
                                            <Th align="right"
                                                active={sortBy === 'time'} activeColor="#06B6D4">Time</Th>
                                            <Th align="right"
                                                active={sortBy === 'steps'} activeColor="#8B5CF6">Steps</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rest.map((entry, i) => (
                                            <motion.tr
                                                key={entry.id || entry._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.45 + i * 0.04 }}
                                                style={{
                                                    borderBottom: '1px solid rgba(255,255,255,0.025)',
                                                    transition: 'background 0.2s ease',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={tdStyle}>
                                                    <span style={{ color: '#3f3f46', fontWeight: 600, fontSize: '0.75rem' }}>
                                                        #{i + 4}
                                                    </span>
                                                </td>
                                                <td style={{ ...tdStyle, maxWidth: 120 }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.375rem',
                                                    }}>
                                                        <User size={12} style={{ color: '#52525B', flexShrink: 0 }} />
                                                        <span style={{
                                                            fontWeight: 600,
                                                            color: '#D4D4D8',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {entry.name || 'Anonymous'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ ...tdStyle, color: '#3f3f46' }}>
                                                    {entry.date}
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                    <span style={{
                                                        fontSize: '0.5625rem',
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em',
                                                        color: DIFFICULTY_COLORS[entry.difficulty] || '#3f3f46',
                                                    }}>
                                                        {entry.difficulty || '-'}
                                                    </span>
                                                </td>
                                                <td style={{
                                                    ...tdStyle, textAlign: 'right',
                                                    fontWeight: 700,
                                                    fontFamily: 'var(--font-display)',
                                                }}>
                                                    {formatTime(entry.time)}
                                                </td>
                                                <td style={{
                                                    ...tdStyle, textAlign: 'right',
                                                    fontWeight: 700,
                                                    fontFamily: 'var(--font-display)',
                                                }}>
                                                    {entry.steps}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </>
                )}
            </motion.div>

            <ConfirmModal
                open={confirmOpen}
                title="Clear Records?"
                message="This will permanently delete all your leaderboard records. This action cannot be undone."
                onConfirm={() => { clearLeaderboard(); setConfirmOpen(false); }}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
}

const tdStyle = { padding: '0.625rem 1rem' };

function Th({ children, align = 'left', active, activeColor }) {
    return (
        <th style={{
            padding: '0.75rem 1rem',
            textAlign: align,
            fontWeight: 600,
            fontSize: '0.5625rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: active ? activeColor : '#27272A',
            transition: 'color 0.3s ease',
        }}>
            {children}
        </th>
    );
}

function PillBtn({ active, color, onClick, children }) {
    return (
        <motion.button
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.3125rem 0.625rem',
                borderRadius: 8,
                fontSize: '0.625rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: active ? `${color}15` : 'transparent',
                color: active ? color : '#3f3f46',
                transition: 'all 0.25s ease',
            }}
            onClick={onClick}
            whileHover={{ backgroundColor: `${color}12` }}
            whileTap={{ scale: 0.95 }}
        >
            {children}
        </motion.button>
    );
}
