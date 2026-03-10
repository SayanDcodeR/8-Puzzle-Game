import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 50,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem',
                        background: 'rgba(5,5,7,0.88)',
                        backdropFilter: 'blur(16px)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        style={{
                            padding: '2.5rem 2rem',
                            maxWidth: 400,
                            width: '100%',
                            textAlign: 'center',
                            background: 'rgba(16,16,20,0.75)',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(244,63,94,0.12)',
                            borderRadius: '1.25rem',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(244,63,94,0.04)',
                        }}
                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    >
                        {/* Warning icon */}
                        <motion.div
                            style={{
                                width: 56, height: 56, borderRadius: 16,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.25rem',
                                background: 'rgba(244,63,94,0.08)',
                                border: '1px solid rgba(244,63,94,0.15)',
                            }}
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                        >
                            <AlertTriangle size={26} style={{ color: '#F43F5E' }} />
                        </motion.div>

                        <h3 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.375rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                            letterSpacing: '-0.02em',
                        }}>
                            {title}
                        </h3>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#52525B',
                            lineHeight: 1.7,
                            marginBottom: '1.75rem',
                        }}>
                            {message}
                        </p>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <motion.button
                                style={{
                                    padding: '0.625rem 1.75rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #F43F5E, #E11D48)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    cursor: 'pointer',
                                }}
                                onClick={onConfirm}
                                whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(244,63,94,0.3)' }}
                                whileTap={{ scale: 0.96 }}
                            >
                                Confirm
                            </motion.button>
                            <motion.button
                                className="btn-ghost"
                                style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}
                                onClick={onCancel}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Cancel
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
