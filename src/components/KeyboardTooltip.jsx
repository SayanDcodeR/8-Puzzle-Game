import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

const shortcuts = [
    { key: '↑ ↓ ← →', action: 'Move tiles' },
    { key: 'H', action: 'Hint' },
    { key: 'R', action: 'Restart' },
    { key: 'S', action: 'Shuffle' },
    { key: 'Ctrl+Z', action: 'Undo' },
];

export default function KeyboardTooltip() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const shown = sessionStorage.getItem('keyboard_tooltip_shown');
        if (!shown) {
            setVisible(true);
            sessionStorage.setItem('keyboard_tooltip_shown', 'true');
            const timer = setTimeout(() => setVisible(false), 8000);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        left: '50%',
                        zIndex: 50,
                        padding: '1rem 1.5rem',
                        cursor: 'pointer',
                        maxWidth: 560,
                        width: 'calc(100% - 2rem)',
                        background: 'rgba(16,16,20,0.75)',
                        backdropFilter: 'blur(24px) saturate(1.3)',
                        WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '1rem',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(6,182,212,0.03)',
                    }}
                    initial={{ opacity: 0, y: 30, x: '-50%', scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                    exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={() => setVisible(false)}
                >
                    {/* Top accent */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '20%',
                        right: '20%',
                        height: 1,
                        background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)',
                    }} />

                    {/* Close button */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: 10,
                            right: 12,
                            padding: 4,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                    >
                        <X size={12} color="#3f3f46" />
                    </motion.div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                    }}>
                        <motion.div
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Keyboard size={15} style={{ color: '#06B6D4' }} />
                        </motion.div>
                        <p style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: '#71717A',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                        }}>
                            Keyboard Shortcuts
                        </p>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '0.875rem',
                        flexWrap: 'wrap',
                    }}>
                        {shortcuts.map((s, i) => (
                            <motion.div
                                key={s.key}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + i * 0.06 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                }}
                            >
                                <kbd style={{
                                    padding: '0.1875rem 0.5rem',
                                    borderRadius: 7,
                                    fontSize: '0.6875rem',
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 600,
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: '#FAFAFA',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                }}>
                                    {s.key}
                                </kbd>
                                <span style={{ fontSize: '0.75rem', color: '#52525B' }}>{s.action}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Auto-dismiss progress bar */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '1rem',
                            right: '1rem',
                            height: 2,
                            borderRadius: 1,
                            background: 'rgba(6,182,212,0.2)',
                            transformOrigin: 'left',
                        }}
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 8, ease: 'linear' }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
