import React, { useEffect, useRef } from "react";

export type ConfettiBurstProps = {
    fire: boolean;
    durationMs?: number;
    particles?: number;
};

const ConfettiBurst: React.FC<ConfettiBurstProps> = ({
    fire,
    durationMs = 1500,
    particles = 160,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !fire) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        if (prefersReducedMotion) return;

        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;

        const rand = (min: number, max: number) => Math.random() * (max - min) + min;
        const colors = ["#ef4444", "#f59e0b", "#facc15", "#84cc16", "#22c55e", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

        type Particle = { x: number; y: number; vx: number; vy: number; w: number; h: number; color: string; rot: number; vr: number; life: number; ttl: number; };
        const parts: Particle[] = [];
        const cx = width / 2;

        for (let i = 0; i < particles; i++) {
            const angle = rand(-Math.PI / 3, -2 * Math.PI / 3);
            const speed = rand(3, 8);
            parts.push({
                x: cx + rand(-60, 60),
                y: height * 0.3,
                vx: Math.cos(angle) * speed + rand(-1, 1),
                vy: Math.sin(angle) * speed + rand(-1, 1),
                w: rand(4, 7),
                h: rand(8, 14),
                color: colors[Math.floor(rand(0, colors.length))],
                rot: rand(0, Math.PI * 2),
                vr: rand(-0.2, 0.2),
                life: 0,
                ttl: durationMs,
            });
        }

        const gravity = 0.15, drag = 0.995, wind = () => Math.sin(Date.now() / 500) * 0.02;
        let start = performance.now();

        const draw = (t: number) => {
            const elapsed = t - start;
            ctx.clearRect(0, 0, width, height);

            for (const p of parts) {
                p.vx += wind(); p.vy += gravity;
                p.vx *= drag; p.vy *= drag;
                p.x += p.vx; p.y += p.vy;
                p.rot += p.vr; p.life = elapsed;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            }

            if (elapsed < durationMs) rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);
        timeoutRef.current = window.setTimeout(() => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }, durationMs + 250) as unknown as number;

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
            rafRef.current = null;
            timeoutRef.current = null;
            ctx.clearRect(0, 0, width, height);
        };
    }, [fire, durationMs, particles]);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            aria-hidden="true"
        />
    );
};

export default ConfettiBurst;
