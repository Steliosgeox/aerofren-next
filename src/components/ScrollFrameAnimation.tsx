"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap/client";
import { debounce } from "@/lib/debounce";

/**
 * ScrollFrameAnimation Component
 *
 * Premium canvas-based scroll-controlled frame animation with:
 * - High-quality static background (shows initially)
 * - Canvas crossfade when water splash arrives
 * - Theme-responsive overlay for light theme visibility
 * - 118 frames for smooth scroll-linked playback
 * - Covers Hero section (100vh), then fades out to reveal waves
 * - GLOBAL IMAGE CACHE to prevent reloading on navigation
 */

// Frame configuration
const FRAME_COUNT = 118;
const SPLASH_FRAME = 25;  // Frame where water splash becomes prominent
const CROSSFADE_START_SCROLL = 0.1;  // 10vh - when to start showing canvas
const CROSSFADE_END_SCROLL = 0.2;    // 20vh - when canvas is fully visible

// Frame path generator
const getFramePath = (index: number): string => {
    const paddedIndex = index.toString().padStart(3, "0");
    const delay = index % 3 === 1 ? "0.041s" : "0.042s";
    return `/frames/frame_${paddedIndex}_delay-${delay}.webp`;
};

// ============================================
// GLOBAL IMAGE CACHE - Persists across navigations
// This prevents reloading 118 images on every route change
// ============================================
const INITIAL_BATCH = 15;
const BATCH_SIZE = 20;

interface FrameCache {
    images: (HTMLImageElement | null)[];
    loadedCount: number;
    initialLoaded: boolean;
    loadingBatches: Set<number>;
    subscribers: ((progress: number) => void)[];
}

const globalFrameCache: FrameCache = {
    images: new Array(FRAME_COUNT).fill(null),
    loadedCount: 0,
    initialLoaded: false,
    loadingBatches: new Set(),
    subscribers: [],
};

// Start fresh load
function loadFrameBatch(startIndex: number, endIndex: number, onComplete?: () => void) {
    let loadedInBatch = 0;
    const totalToLoad = endIndex - startIndex;
    let anyNew = false;

    for (let i = startIndex; i < endIndex; i++) {
        if (i >= FRAME_COUNT || globalFrameCache.images[i] !== null) {
            loadedInBatch++;
            if (loadedInBatch === totalToLoad && onComplete) onComplete();
            continue;
        }

        anyNew = true;
        const img = new Image();
        img.src = getFramePath(i);

        const handleLoad = () => {
            globalFrameCache.loadedCount++;
            loadedInBatch++;

            const progress = (globalFrameCache.loadedCount / FRAME_COUNT) * 100;
            globalFrameCache.subscribers.forEach(sub => sub(progress));

            if (loadedInBatch === totalToLoad && onComplete) {
                onComplete();
            }
        };

        img.onload = handleLoad;
        img.onerror = () => {
            console.warn(`Failed to load frame ${i}`);
            handleLoad();
        };

        globalFrameCache.images[i] = img;
    }

    if (!anyNew && onComplete) {
        onComplete();
    }
}

// Preload first batch once globally
function preloadInitialFrames(onProgress: (progress: number) => void, onComplete: () => void) {
    if (!globalFrameCache.subscribers.includes(onProgress)) {
        globalFrameCache.subscribers.push(onProgress);
    }

    // If already loaded, call complete immediately
    if (globalFrameCache.initialLoaded) {
        onProgress((globalFrameCache.loadedCount / FRAME_COUNT) * 100);
        onComplete();
        return;
    }

    loadFrameBatch(0, INITIAL_BATCH, () => {
        globalFrameCache.initialLoaded = true;
        onComplete();
    });
}

function triggerBatchForFrame(frameIndex: number) {
    const targetFrame = frameIndex + 30; // Buffer frames ahead
    if (targetFrame < INITIAL_BATCH) return;

    const maxTarget = Math.min(targetFrame, FRAME_COUNT);

    for (let current = INITIAL_BATCH; current < maxTarget; current += BATCH_SIZE) {
        const batchIndex = Math.floor((current - INITIAL_BATCH) / BATCH_SIZE);
        if (!globalFrameCache.loadingBatches.has(batchIndex)) {
            globalFrameCache.loadingBatches.add(batchIndex);
            const start = INITIAL_BATCH + batchIndex * BATCH_SIZE;
            const end = Math.min(start + BATCH_SIZE, FRAME_COUNT);
            loadFrameBatch(start, end);
        }
    }
}

export default function ScrollFrameAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const staticBgRef = useRef<HTMLDivElement>(null);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(globalFrameCache.initialLoaded);
    const [loadProgress, setLoadProgress] = useState(globalFrameCache.initialLoaded ? 100 : 0);
    const currentFrameRef = useRef(0);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const rafDrawRef = useRef<number>(0);
    const pendingFrameRef = useRef<number | null>(null);

    // Use global cache for frames - only loads once across all navigations
    useEffect(() => {
        preloadInitialFrames(
            (progress) => setLoadProgress(progress),
            () => setIsLoaded(true)
        );

        return () => {
            // Cleanup subscriber on unmount
            globalFrameCache.subscribers = globalFrameCache.subscribers.filter(sub => sub !== setLoadProgress);
        };
    }, []);

    // Draw frame to canvas with cover-fit (uses global cache)
    const drawFrame = useCallback((frameIndex: number) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        const img = globalFrameCache.images[frameIndex];

        if (!canvas || !ctx || !img || !img.complete) return;

        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspect > canvasAspect) {
            drawHeight = canvas.height;
            drawWidth = img.width * (canvas.height / img.height);
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            drawWidth = canvas.width;
            drawHeight = img.height * (canvas.width / img.width);
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }, []);

    // Setup canvas sizing - debounced to prevent layout thrashing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            ctxRef.current = canvas.getContext("2d");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawFrame(currentFrameRef.current);
        };

        // Debounce resize handler (100ms) to prevent excessive canvas redraws
        const debouncedResize = debounce(handleResize, 100);

        // Run immediately on mount
        handleResize();
        window.addEventListener("resize", debouncedResize, { passive: true });

        return () => {
            debouncedResize.cancel();
            window.removeEventListener("resize", debouncedResize);
        };
    }, [drawFrame]);

    // Setup all GSAP animations
    useEffect(() => {
        if (!isLoaded) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        const staticBg = staticBgRef.current;
        const canvasWrapper = canvasWrapperRef.current;
        if (!canvas || !container || !staticBg || !canvasWrapper) return;

        // Draw first frame
        drawFrame(0);

        const vh = window.innerHeight;

        // Single consolidated timeline - GPU optimized
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: `+=${vh}`,
                scrub: 1.5, // Higher = smoother, fewer GPU updates
                onUpdate: (self) => {
                    // GPU optimization: completely hide when scrolled past
                    const shouldHide = self.progress >= 0.99;
                    if (shouldHide !== (container.style.visibility === "hidden")) {
                        container.style.visibility = shouldHide ? "hidden" : "visible";
                    }

                    // Don't update frames if hidden
                    if (shouldHide) return;

                    // Skip every other frame for GPU relief (60 -> 30 effective frames)
                    const rawFrame = Math.round(self.progress * (FRAME_COUNT - 1));

                    // Lazy load upcoming batches of frames ahead of current scroll
                    triggerBatchForFrame(rawFrame);

                    const frame = Math.round(rawFrame / 2) * 2; // Snap to even frames

                    if (frame !== currentFrameRef.current) {
                        currentFrameRef.current = frame;
                        pendingFrameRef.current = frame;
                        if (!rafDrawRef.current) {
                            rafDrawRef.current = requestAnimationFrame(() => {
                                rafDrawRef.current = 0;
                                const nextFrame = pendingFrameRef.current;
                                if (typeof nextFrame === "number") {
                                    drawFrame(nextFrame);
                                }
                            });
                        }
                    }
                },
            },
        });

        // Position animations on timeline (0 to 1 = scroll progress)
        // Static background fades out (0% - 20% of scroll)
        tl.fromTo(staticBg, { opacity: 1 }, { opacity: 0, duration: 0.2 }, 0);
        // Canvas fades in (10% - 20% of scroll)
        tl.fromTo(canvasWrapper, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.1);
        // Container fades out at end (75% - 100% of scroll)
        tl.fromTo(container, { opacity: 1 }, { opacity: 0, duration: 0.25 }, 0.75);

        return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
            currentFrameRef.current = 0;
            pendingFrameRef.current = null;
            if (rafDrawRef.current) {
                cancelAnimationFrame(rafDrawRef.current);
                rafDrawRef.current = 0;
            }
        };
    }, [isLoaded, drawFrame]);

    return (
        <>
            <div
                ref={containerRef}
                className="scroll-frame-container"
                aria-hidden="true"
            >
                {/* Static background - shows initially */}
                <div ref={staticBgRef} className="scroll-frame-static">
                    <div className="scroll-frame-static-gradient" />
                </div>

                {/* Canvas wrapper - fades in when splash arrives */}
                <div ref={canvasWrapperRef} className="scroll-frame-canvas-wrapper">
                    <canvas ref={canvasRef} className="scroll-frame-canvas" />
                </div>

                {/* Loading indicator - simplified */}
                {!isLoaded && (
                    <div className="scroll-frame-loading">
                        <div className="scroll-frame-loading-track">
                            <div
                                className="scroll-frame-loading-bar"
                                style={{ width: `${loadProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
        /* Container - GPU optimized */
        .scroll-frame-container {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          contain: strict; /* GPU: Isolate compositing */
        }

        /* Static Background - single layer */
        .scroll-frame-static {
          position: absolute;
          inset: 0;
        }

        .scroll-frame-static-gradient {
          position: absolute;
          inset: 0;
          background-image: url('/images/BackgroundDark.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        [data-theme="light"] .scroll-frame-static-gradient {
          background-image: url('/images/BackgroundLight.webp');
        }

        [data-theme="dim"] .scroll-frame-static-gradient {
          background-image: url('/images/BackgroundDim.webp');
        }

        /* Canvas wrapper */
        .scroll-frame-canvas-wrapper {
          position: absolute;
          inset: 0;
          opacity: 0;
        }

        .scroll-frame-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Simple loading indicator - no blur */
        .scroll-frame-loading {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .scroll-frame-loading-track {
          width: 200px;
          height: 3px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
          overflow: hidden;
        }

        .scroll-frame-loading-bar {
          height: 100%;
          background: var(--theme-accent, #00bae2);
          border-radius: 2px;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .scroll-frame-container {
            display: none;
          }
        }
      `}</style>
        </>
    );
}


