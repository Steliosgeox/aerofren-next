"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { gsap } from "@/lib/gsap";

const CELL_W = 640;
const CELL_H = 360;
const COLS = 10;
const TOTAL_FRAMES = 118;

function drawFrame(
    ctx: CanvasRenderingContext2D,
    sprite: HTMLImageElement,
    progress: number,
    w: number,
    h: number
) {
    const frame = Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1);
    const col = frame % COLS;
    const row = Math.floor(frame / COLS);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(sprite, col * CELL_W, row * CELL_H, CELL_W, CELL_H, 0, 0, w, h);
}

export default function AeroTransitionSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const spriteRef = useRef<HTMLImageElement | null>(null);
    const progressRef = useRef(0);
    const { resolvedTheme } = useTheme();
    const [reduceMotion, setReduceMotion] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

    useEffect(() => {
        
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updateMotion = () => setReduceMotion(media.matches);
        updateMotion();

        media.addEventListener("change", updateMotion);
        return () => media.removeEventListener("change", updateMotion);
    }, []);

    // Update sprite based on theme
    useEffect(() => {
        if (!isMounted || reduceMotion) return;

        let themeSuffix = "light";
        if (resolvedTheme === "dark") themeSuffix = "dark";
        if (resolvedTheme === "dim") themeSuffix = "dim";

        const spriteSrc = `/videos/sprites/sprite_hero_${themeSuffix}.webp`;

        const sprite = new Image();
        sprite.src = spriteSrc;
        sprite.onload = () => {
            spriteRef.current = sprite;
            // Draw initial frame
            const canvas = canvasRef.current;
            if (canvas && sprite) {
                const ctx = canvas.getContext("2d");
                if (ctx) drawFrame(ctx, sprite, progressRef.current, canvas.width, canvas.height);
            }
        };
    }, [resolvedTheme, isMounted, reduceMotion]);

    useEffect(() => {
        if (!isMounted || reduceMotion) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Redraw current frame after resize
            if (spriteRef.current) {
                const ctx = canvas.getContext("2d");
                if (ctx) drawFrame(ctx, spriteRef.current, progressRef.current, canvas.width, canvas.height);
            }
        };

        resize();
        window.addEventListener("resize", resize, { passive: true });

        return () => window.removeEventListener("resize", resize);
    }, [isMounted, reduceMotion, resolvedTheme]);

    useEffect(() => {
        if (!isMounted || reduceMotion) return;

        const section = sectionRef.current;
        const canvas = canvasRef.current;
        if (!section || !canvas) return;

        // Initial opacity
        gsap.set(canvas, { opacity: 0 });

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const ctxObj = { progress: 0 };

        const ctxSt = gsap.context(() => {
            gsap.to(ctxObj, {
                progress: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.4,
                    onUpdate: (self) => {
                        progressRef.current = self.progress;
                        if (spriteRef.current) {
                            drawFrame(ctx, spriteRef.current, self.progress, canvas.width, canvas.height);
                        }
                    },
                    onEnter: () => gsap.to(canvas, { opacity: 1, duration: 0.5 }),
                    onLeave: () => gsap.to(canvas, { opacity: 0, duration: 0.5 }),
                    onEnterBack: () => gsap.to(canvas, { opacity: 1, duration: 0.5 }),
                    onLeaveBack: () => gsap.to(canvas, { opacity: 0, duration: 0.5 })
                }
            });
        }, section);

        return () => ctxSt.revert();
    }, [isMounted, reduceMotion, resolvedTheme]);

    if (!isMounted) return <div className="min-h-[250vh]" />;

    if (reduceMotion) {
        return (
            <section className="relative w-full overflow-hidden" style={{ minHeight: "100vh" }}>
                {/* Fallback for reduced motion: maybe just a static background or placeholder */}
                <div className="w-full h-full min-h-[100vh] bg-[var(--theme-bg-solid)] flex items-center justify-center">
                    <p className="text-[var(--theme-text-muted)] text-sm uppercase tracking-widest">
                        Animations Disabled
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section ref={sectionRef} className="relative w-full" style={{ height: "250vh" }}>
            <div className="sticky top-0 w-full h-[100vh] overflow-hidden">

                {/* Canvas background layer */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Minimal text label overlay */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-center">
                        {/* We can add aesthetic text if needed, or keep it minimal */}
                    </div>
                </div>

                {/* Top Fade Edge (Background color -> Transparent) */}
                <div className="absolute top-0 left-0 w-full h-32 z-20 pointer-events-none"
                    style={{ background: "linear-gradient(to bottom, var(--theme-bg-solid), transparent)" }} />

                {/* Bottom Fade Edge (Transparent -> Background color) */}
                <div className="absolute bottom-0 left-0 w-full h-40 z-20 pointer-events-none"
                    style={{ background: "linear-gradient(to top, var(--theme-bg-solid), transparent)" }} />

            </div>
        </section>
    );
}
