import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import ParticleBackground from './components/ParticleBackground';
import LandingPage from './pages/LandingPage';
import PlayPage from './pages/PlayPage';
import LeaderboardPage from './pages/LeaderboardPage';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 16,
        scale: 0.995,
        filter: 'blur(4px)',
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
    },
    exit: {
        opacity: 0,
        y: -12,
        scale: 0.995,
        filter: 'blur(4px)',
    },
};

const pageTransition = {
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1],
};

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
            >
                <Routes location={location}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/play" element={<PlayPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ParticleBackground />
            <Header />
            <AnimatedRoutes />
        </BrowserRouter>
    );
}
