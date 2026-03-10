import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let particles = [];
        const PARTICLE_COUNT = 60;
        const CONNECTION_DISTANCE = 140;
        const mouse = { x: -1000, y: -1000, radius: 200 };
        let time = 0;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticle(x, y) {
            const palette = [
                { r: 6, g: 182, b: 212 },     // cyan
                { r: 139, g: 92, b: 246 },     // violet
                { r: 16, g: 185, b: 129 },     // emerald
                { r: 124, g: 58, b: 237 },     // purple
                { r: 59, g: 130, b: 246 },      // blue
            ];
            const c = palette[Math.floor(Math.random() * palette.length)];
            return {
                x: x ?? Math.random() * canvas.width,
                y: y ?? Math.random() * canvas.height,
                baseX: x ?? Math.random() * canvas.width,
                baseY: y ?? Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2.5 + 0.5,
                opacity: Math.random() * 0.6 + 0.15,
                ...c,
                pulseSpeed: Math.random() * 0.015 + 0.005,
                pulsePhase: Math.random() * Math.PI * 2,
            };
        }

        function init() {
            resize();
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(createParticle());
            }
        }

        function drawGradientMesh() {
            const t = time * 0.0003;

            // Animated gradient orbs
            const orbs = [
                {
                    x: canvas.width * (0.3 + Math.sin(t * 0.7) * 0.15),
                    y: canvas.height * (0.3 + Math.cos(t * 0.5) * 0.15),
                    r: canvas.width * 0.35,
                    color: [124, 58, 237],
                    opacity: 0.04,
                },
                {
                    x: canvas.width * (0.7 + Math.cos(t * 0.6) * 0.15),
                    y: canvas.height * (0.6 + Math.sin(t * 0.8) * 0.15),
                    r: canvas.width * 0.3,
                    color: [6, 182, 212],
                    opacity: 0.03,
                },
                {
                    x: canvas.width * (0.5 + Math.sin(t * 0.9) * 0.2),
                    y: canvas.height * (0.8 + Math.cos(t * 0.4) * 0.1),
                    r: canvas.width * 0.25,
                    color: [16, 185, 129],
                    opacity: 0.025,
                },
            ];

            for (const orb of orbs) {
                const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
                gradient.addColorStop(0, `rgba(${orb.color.join(',')}, ${orb.opacity})`);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }

        function animate() {
            time = performance.now();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw animated gradient mesh
            drawGradientMesh();

            const t = time * 0.001;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Mouse repulsion
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    p.x += dx * force * 0.02;
                    p.y += dy * force * 0.02;
                }

                // Move
                p.x += p.vx;
                p.y += p.vy;

                // Soft bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                p.x = Math.max(0, Math.min(canvas.width, p.x));
                p.y = Math.max(0, Math.min(canvas.height, p.y));

                // Pulse
                const pulse = Math.sin(t * p.pulseSpeed * 60 + p.pulsePhase) * 0.35 + 0.65;
                const alpha = p.opacity * pulse;

                // Glow (outer)
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha * 0.08})`;
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
                ctx.fill();

                // Connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const cdx = p.x - p2.x;
                    const cdy = p.y - p2.y;
                    const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                    if (cdist < CONNECTION_DISTANCE) {
                        const lineAlpha = (1 - cdist / CONNECTION_DISTANCE) * 0.06;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${lineAlpha})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            // Mouse glow cursor
            if (mouse.x > 0 && mouse.y > 0) {
                const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
                gradient.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
                gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(mouse.x - 150, mouse.y - 150, 300, 300);
            }

            animId = requestAnimationFrame(animate);
        }

        function handleMouseMove(e) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }

        function handleMouseLeave() {
            mouse.x = -1000;
            mouse.y = -1000;
        }

        init();
        animate();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
}
