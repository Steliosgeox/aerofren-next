'use client';

/**
 * VideoBackground
 *
 * Seamless loop technique — "always-opaque bottom" method:
 *
 *   Two videos per loop (top + bottom).
 *   - Bottom stays at opacity: 1 ALWAYS.
 *   - Top is the active player at opacity: 1.
 *   - Near loop end: cue bottom from 0, fade TOP out to 0.
 *   - Combined visible opacity = bottom(1) + top(0→1) = ALWAYS 1.0
 *   - Zero black gap. Works regardless of how well the source is looped.
 *
 * Previous bug: both videos crossfaded (opacity A: 1→0, B: 0→1).
 * CSS composite math: mid-crossfade combined opacity = 0.75 → black flash.
 * This fix eliminates that entirely.
 */

import { CSSProperties, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// ─── Sprite constants ─────────────────────────────────────────────────────────
const COLS = 8;
const CELL_W = 640;
const CELL_H = 360;
const TOTAL_FRAMES = 192;

// ─── Crossfade config ─────────────────────────────────────────────────────────
const XFADE_BEFORE_END_S = 0.6;  // seconds before end to trigger crossfade
const XFADE_MS = 700;  // crossfade duration in milliseconds

// ─── Types ────────────────────────────────────────────────────────────────────
export type VideoLayer = 'above' | 'submerge' | 'underwater' | 'resurface';

export interface VideoBackgroundHandle {
    setLayer: (layer: VideoLayer) => void;
    drawSubmergeFrame: (progress: number) => void;
    drawResurfaceFrame: (progress: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(sprite, col * CELL_W, row * CELL_H, CELL_W, CELL_H, 0, 0, w, h);
}

/**
 * makeSeamlessLoop — always-opaque-bottom implementation.
 *
 * - vidBottom: always opacity 1. Plays silently beneath.
 * - vidTop: opacity 1 when active. Fades to 0 at loop end, revealing the bottom.
 *
 * @param src      Video source URL (same for both)
 * @param vidTop   The top (active) video element — starts playing
 * @param vidBottom The bottom (standby) video element — always opacity 1
 * @returns cleanup function
 */
function makeSeamlessLoop(
    src: string,
    vidTop: HTMLVideoElement,
    vidBottom: HTMLVideoElement,
): () => void {
    let top = vidTop;
    let bottom = vidBottom;
    let fading = false;
    let swapId = -1;

    // Initial visual state
    top.style.zIndex = '2';
    top.style.opacity = '1';
    top.style.transition = 'none';
    bottom.style.zIndex = '1';
    bottom.style.opacity = '1'; // KEY: always 1
    bottom.style.transition = 'none';

    // Load and start top
    top.src = src;
    top.load();
    top.play().catch(() => { });

    // Pre-load bottom silently (not playing yet)
    bottom.src = src;
    bottom.load();

    let currentListener: (() => void) | null = null;

    const attachListener = (vid: HTMLVideoElement) => {
        const onUpdate = () => {
            if (!vid.duration || !isFinite(vid.duration) || fading) return;
            const remaining = vid.duration - vid.currentTime;
            if (remaining > XFADE_BEFORE_END_S) return;

            fading = true;
            vid.removeEventListener('timeupdate', onUpdate);
            currentListener = null;

            // Cue bottom from 0 and start playing
            bottom.currentTime = 0;
            bottom.play().catch(() => { });

            // Fade TOP out — bottom stays at 1 (fills the gap always)
            top.style.transition = `opacity ${XFADE_MS}ms ease-in-out`;
            top.style.opacity = '0';

            swapId = window.setTimeout(() => {
                // Swap roles
                const prevTop = top;
                const prevBottom = bottom;

                // prevTop becomes new bottom (stays loaded, will be cued next loop)
                prevTop.style.transition = 'none';
                prevTop.style.opacity = '1'; // reset to 1 so it's always-opaque when bottom
                prevTop.style.zIndex = '1';

                // prevBottom becomes new top
                prevBottom.style.transition = 'none';
                prevBottom.style.opacity = '1';
                prevBottom.style.zIndex = '2';

                top = prevBottom;
                bottom = prevTop;

                fading = false;

                // Attach listener to new top
                attachListener(top);
            }, XFADE_MS + 60);
        };

        currentListener = onUpdate;
        vid.addEventListener('timeupdate', onUpdate);
    };

    attachListener(top);

    return () => {
        clearTimeout(swapId);
        if (currentListener) {
            top.removeEventListener('timeupdate', currentListener);
            bottom.removeEventListener('timeupdate', currentListener);
        }
    };
}

// ─── Base styles ──────────────────────────────────────────────────────────────
const LAYER_WRAP: CSSProperties = {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    transition: 'opacity 400ms ease-in-out',
    willChange: 'opacity',
};

const VIDEO_BASE: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
};

const CANVAS_LAYER: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    transition: 'opacity 400ms ease-in-out',
    willChange: 'opacity',
    pointerEvents: 'none',
};

// ─── Component ────────────────────────────────────────────────────────────────
const VideoBackground = forwardRef<VideoBackgroundHandle>((_, ref) => {
    const aboveWrapRef = useRef<HTMLDivElement>(null);
    const underWrapRef = useRef<HTMLDivElement>(null);

    // Above water — two videos
    const aboveTop = useRef<HTMLVideoElement>(null);
    const aboveBottom = useRef<HTMLVideoElement>(null);
    // Underwater — two videos
    const underTop = useRef<HTMLVideoElement>(null);
    const underBottom = useRef<HTMLVideoElement>(null);

    // Canvas layers
    const canvasDownRef = useRef<HTMLCanvasElement>(null);
    const canvasUpRef = useRef<HTMLCanvasElement>(null);

    // Sprite refs
    const spriteDown = useRef<HTMLImageElement | null>(null);
    const spriteUp = useRef<HTMLImageElement | null>(null);

    // Track whether underwater has been started yet
    const underStarted = useRef(false);
    const underCleanup = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Preload sprites
        const imgDown = new Image();
        imgDown.src = '/videos/sprites/sprite_down.webp';
        imgDown.onload = () => { spriteDown.current = imgDown; };

        const imgUp = new Image();
        imgUp.src = '/videos/sprites/sprite_up.webp';
        imgUp.onload = () => { spriteUp.current = imgUp; };

        // Canvas resize
        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            for (const c of [canvasDownRef, canvasUpRef]) {
                if (c.current) { c.current.width = w; c.current.height = h; }
            }
        };
        resize();
        window.addEventListener('resize', resize, { passive: true });

        // Start above-water seamless loop immediately
        const ABOVE_SRC = '/about-us/frames/Above_Water_Dim_Loop.webm';
        const cleanupAbove = (aboveTop.current && aboveBottom.current)
            ? makeSeamlessLoop(ABOVE_SRC, aboveTop.current, aboveBottom.current)
            : () => { };

        return () => {
            window.removeEventListener('resize', resize);
            cleanupAbove();
            underCleanup.current?.();
        };
    }, []);

    useImperativeHandle(ref, () => ({
        setLayer(layer: VideoLayer) {
            // Outer wrapper visibility
            if (aboveWrapRef.current) {
                aboveWrapRef.current.style.opacity =
                    (layer === 'above') ? '1' : '0';
            }
            if (underWrapRef.current) {
                underWrapRef.current.style.opacity =
                    (layer === 'underwater') ? '1' : '0';
            }
            if (canvasDownRef.current) {
                canvasDownRef.current.style.opacity = (layer === 'submerge') ? '1' : '0';
            }
            if (canvasUpRef.current) {
                canvasUpRef.current.style.opacity = (layer === 'resurface') ? '1' : '0';
            }

            // Start underwater loop on first activation
            if (layer === 'underwater' && !underStarted.current) {
                underStarted.current = true;
                const UNDER_SRC = '/about-us/frames/Under_Water_Dim_loop.webm';
                if (underTop.current && underBottom.current) {
                    underCleanup.current = makeSeamlessLoop(
                        UNDER_SRC,
                        underTop.current,
                        underBottom.current,
                    );
                }
            }
        },

        drawSubmergeFrame(progress: number) {
            const canvas = canvasDownRef.current;
            const sprite = spriteDown.current;
            if (!canvas || !sprite) return;
            const ctx = canvas.getContext('2d');
            if (ctx) drawFrame(ctx, sprite, progress, canvas.width, canvas.height);
        },

        drawResurfaceFrame(progress: number) {
            const canvas = canvasUpRef.current;
            const sprite = spriteUp.current;
            if (!canvas || !sprite) return;
            const ctx = canvas.getContext('2d');
            if (ctx) drawFrame(ctx, sprite, progress, canvas.width, canvas.height);
        },
    }));

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                background: '#030d1a',
            }}
        >
            {/* ── Layer 1: Above-water (seamless loop via top/bottom pair) ── */}
            <div ref={aboveWrapRef} style={{ ...LAYER_WRAP, opacity: 1 }}>
                <video ref={aboveBottom} muted playsInline style={{ ...VIDEO_BASE, zIndex: 1 }} />
                <video ref={aboveTop} muted playsInline style={{ ...VIDEO_BASE, zIndex: 2 }} />
            </div>

            {/* ── Layer 2: Submerge canvas ── */}
            <canvas ref={canvasDownRef} style={{ ...CANVAS_LAYER, zIndex: 3 }} />

            {/* ── Layer 3: Underwater (seamless loop via top/bottom pair) ── */}
            <div ref={underWrapRef} style={{ ...LAYER_WRAP, zIndex: 2 }}>
                <video ref={underBottom} muted playsInline style={{ ...VIDEO_BASE, zIndex: 1 }} />
                <video ref={underTop} muted playsInline style={{ ...VIDEO_BASE, zIndex: 2 }} />
            </div>

            {/* ── Layer 4: Resurface canvas ── */}
            <canvas ref={canvasUpRef} style={{ ...CANVAS_LAYER, zIndex: 3 }} />

            {/* Film grain */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.09'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                    opacity: 0.5,
                    zIndex: 12,
                    pointerEvents: 'none',
                }}
            />

            {/* Cinematic vignette */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)',
                    zIndex: 13,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
});

VideoBackground.displayName = 'VideoBackground';
export default VideoBackground;
