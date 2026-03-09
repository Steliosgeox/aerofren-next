"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { gsap, ScrollTrigger } from "@/lib/gsap/client";
import {
    getDynamicViewportHeight,
    VIEWPORT_HEIGHT_CSS_VAR,
} from "@/lib/viewport";

const CELL_W = 640;
const CELL_H = 360;
const COLS = 10;
const TOTAL_FRAMES = 118;

function drawFrame(
    ctx: CanvasRenderingContext2D,
    sprite: HTMLImageElement,
    progress: number,
    w: number,
    h: number,
) {
    const frame = Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1);
    const col = frame % COLS;
    const row = Math.floor(frame / COLS);
    const sourceAspect = CELL_W / CELL_H;
    const canvasAspect = w / h;
    let drawW = w;
    let drawH = h;
    let offsetX = 0;
    let offsetY = 0;
    if (canvasAspect > sourceAspect) {
        drawW = w;
        drawH = w / sourceAspect;
        offsetY = (h - drawH) / 2;
    } else {
        drawH = h;
        drawW = h * sourceAspect;
        offsetX = (w - drawW) / 2;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(
        sprite,
        col * CELL_W,
        row * CELL_H,
        CELL_W,
        CELL_H,
        offsetX,
        offsetY,
        drawW,
        drawH,
    );
}

export default function AeroTransitionSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const spriteRef = useRef<HTMLImageElement | null>(null);
    const progressRef = useRef(0);
    const { resolvedTheme } = useTheme();
    const [reduceMotion, setReduceMotion] = useState(false);
    const isMounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false,
    );
    const [loadedSpriteSrc, setLoadedSpriteSrc] = useState<string | null>(null);
    const [failedSpriteSrc, setFailedSpriteSrc] = useState<string | null>(null);
    const themeSuffix =
        resolvedTheme === "dark"
            ? "dark"
            : resolvedTheme === "dim"
                ? "dim"
                : "light";
    const spriteSrc = `/videos/sprites/sprite_hero_${themeSuffix}.webp`;
    const hasSpriteError =
        failedSpriteSrc === spriteSrc && loadedSpriteSrc !== spriteSrc;
    const viewportHeight = `var(${VIEWPORT_HEIGHT_CSS_VAR}, 100vh)`;

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

        const sprite = new Image();
        sprite.src = spriteSrc;
        sprite.onload = () => {
            spriteRef.current = sprite;
            setLoadedSpriteSrc(spriteSrc);
            // Draw initial frame
            const canvas = canvasRef.current;
            if (canvas && sprite) {
                const ctx = canvas.getContext("2d");
                if (ctx)
                    drawFrame(
                        ctx,
                        sprite,
                        progressRef.current,
                        canvas.width,
                        canvas.height,
                    );
            }
            ScrollTrigger.refresh();
        };
        sprite.onerror = () => {
            spriteRef.current = null;
            setFailedSpriteSrc(spriteSrc);
        };

        return () => {
            sprite.onload = null;
            sprite.onerror = null;
        };
    }, [isMounted, reduceMotion, spriteSrc]);

    useEffect(() => {
        if (!isMounted || reduceMotion) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = getDynamicViewportHeight();

            // Redraw current frame after resize
            if (spriteRef.current) {
                const ctx = canvas.getContext("2d");
                if (ctx)
                    drawFrame(
                        ctx,
                        spriteRef.current,
                        progressRef.current,
                        canvas.width,
                        canvas.height,
                    );
            }
        };

        resize();
        window.addEventListener("resize", resize, { passive: true });
        window.visualViewport?.addEventListener?.("resize", resize, {
            passive: true,
        });
        ScrollTrigger.refresh();

        return () => {
            window.removeEventListener("resize", resize);
            window.visualViewport?.removeEventListener?.("resize", resize);
        };
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
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.4,
                },
            });

            tl.to(
                ctxObj,
                {
                    progress: 1,
                    duration: 1,
                    ease: "none",
                    onUpdate: () => {
                        progressRef.current = ctxObj.progress;
                        if (spriteRef.current) {
                            drawFrame(
                                ctx,
                                spriteRef.current,
                                ctxObj.progress,
                                canvas.width,
                                canvas.height
                            );
                        }
                    },
                },
                0
            );

            tl.fromTo(
                canvas,
                { opacity: 0 },
                { opacity: 1, duration: 0.15, ease: "none" },
                0
            ).to(
                canvas,
                { opacity: 0, duration: 0.15, ease: "none" },
                0.85
            );
        }, section);

        return () => ctxSt.revert();
    }, [isMounted, reduceMotion, resolvedTheme]);

    if (!isMounted)
        return (
            <div
                className="w-full pointer-events-none"
                data-aero-transition-placeholder="true"
                style={{
                    minHeight: `calc(${viewportHeight} * 2.5)`,
                    marginTop: `calc(${viewportHeight} * -1)`,
                }}
            />
        );

    if (reduceMotion) {
        return (
            <section
                className="relative w-full overflow-hidden z-0 pointer-events-none"
                style={{
                    minHeight: viewportHeight,
                    marginTop: `calc(${viewportHeight} * -1)`,
                }}
                data-aero-transition="reduced-motion"
            >
                <div
                    className="w-full h-full flex items-center justify-center opacity-0"
                    style={{ minHeight: viewportHeight }}
                >
                    <p className="text-[var(--theme-text-muted)] text-sm uppercase tracking-widest">
                        Animations Disabled
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={sectionRef}
            className="relative w-full z-0 pointer-events-none"
            style={{
                height: `calc(${viewportHeight} * 2.5)`,
                marginTop: `calc(${viewportHeight} * -1)`,
            }}
            data-aero-transition="active"
        >
            <div
                className="sticky top-0 w-full overflow-hidden"
                style={{ height: viewportHeight }}
            >
                {/* Canvas background layer */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    data-aero-transition-canvas="true"
                />

                {hasSpriteError && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <div className="rounded-full border border-red-400/30 bg-black/50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-red-200">
                            Sprite Load Error
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
