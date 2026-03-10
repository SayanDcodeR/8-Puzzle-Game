import { useEffect } from 'react';
import { motion } from 'framer-motion';
import GameBoard from '../components/GameBoard';
import StatsPanel from '../components/StatsPanel';
import ControlsPanel from '../components/ControlsPanel';
import VictoryModal from '../components/VictoryModal';
import KeyboardTooltip from '../components/KeyboardTooltip';
import useGameStore from '../store/gameStore';

export default function PlayPage() {
    const shuffle = useGameStore((s) => s.shuffle);
    const requestHint = useGameStore((s) => s.requestHint);
    const restart = useGameStore((s) => s.restart);
    const undo = useGameStore((s) => s.undo);

    // Keyboard shortcuts
    useEffect(() => {
        function handleKey(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            switch (e.key.toLowerCase()) {
                case 'h': requestHint(); break;
                case 'r': restart(); break;
                case 's': shuffle(); break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) { e.preventDefault(); undo(); }
                    break;
            }
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [shuffle, restart, requestHint, undo]);

    return (
        <div className="page-wrapper" style={{ paddingTop: '3.75rem' }}>
            <motion.div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem 1.5rem',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.75rem',
                    width: '100%',
                    maxWidth: 920,
                    flexWrap: 'wrap',
                }}>
                    {/* Board */}
                    <motion.div
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <GameBoard />
                    </motion.div>

                    {/* Side Panel */}
                    <motion.div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.875rem',
                            width: '100%',
                            maxWidth: 280,
                            minWidth: 240,
                        }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        <StatsPanel />
                        <ControlsPanel />
                    </motion.div>
                </div>
            </motion.div>

            <VictoryModal />
            <KeyboardTooltip />
        </div>
    );
}
