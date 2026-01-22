"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap/client";

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
interface FrameCache {
    images: HTMLImageElement[];
    loaded: boolean;
    loadedCount: number;
}

const globalFrameCache: FrameCache = {
    images: [],
    loaded: false,
    loadedCount: 0,
};

// Preload frames once globally
function preloadFramesGlobally(onProgress: (progress: number) => void, onComplete: () => void) {
    // If already loaded, call complete immediately
    if (globalFrameCache.loaded) {
        onProgress(100);
        onComplete();
        return;
    }

    // If already loading, just update callbacks
    if (globalFrameCache.images.length > 0) {
        onProgress((globalFrameCache.loadedCount / FRAME_COUNT) * 100);
        if (globalFrameCache.loadedCount === FRAME_COUNT) {
            globalFrameCache.loaded = true;
            onComplete();
        }
        return;
    }

    // Start fresh load
    for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = getFramePath(i);

        img.onload = () => {
            globalFrameCache.loadedCount++;
            onProgress((globalFrameCache.loadedCount / FRAME_COUNT) * 100);
            if (globalFrameCache.loadedCount === FRAME_COUNT) {
                globalFrameCache.loaded = true;
                onComplete();
            }
        };

        img.onerror = () => {
            console.warn(`Failed to load frame ${i}`);
            globalFrameCache.loadedCount++;
            onProgress((globalFrameCache.loadedCount / FRAME_COUNT) * 100);
            if (globalFrameCache.loadedCount === FRAME_COUNT) {
                globalFrameCache.loaded = true;
                onComplete();
            }
        };

        globalFrameCache.images.push(img);
    }
}

export default function ScrollFrameAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const staticBgRef = useRef<HTMLDivElement>(null);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(globalFrameCache.loaded);
    const [loadProgress, setLoadProgress] = useState(globalFrameCache.loaded ? 100 : 0);
    const currentFrameRef = useRef(0);

    // Use global cache for frames - only loads once across all navigations
    useEffect(() => {
        preloadFramesGlobally(
            (progress) => setLoadProgress(progress),
            () => setIsLoaded(true)
        );
    }, []);

    // Draw frame to canvas with cover-fit (uses global cache)
    const drawFrame = useCallback((frameIndex: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
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

    // Setup canvas sizing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawFrame(currentFrameRef.current);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
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

        // Single consolidated timeline - reduces 4 ScrollTriggers to 1
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: `+=${vh}`,
                scrub: 0.5, // Higher = fewer updates (was 0.2)
                onUpdate: (self) => {
                    const frame = Math.round(self.progress * (FRAME_COUNT - 1));
                    if (frame !== currentFrameRef.current) {
                        currentFrameRef.current = frame;
                        requestAnimationFrame(() => drawFrame(frame));
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
        };
    }, [isLoaded, drawFrame]);

    return (
        <>
            <div
                ref={containerRef}
                className="scroll-frame-container"
                aria-hidden="true"
            >
                {/* Premium static background - shows initially */}
                <div ref={staticBgRef} className="scroll-frame-static">
                    <div className="scroll-frame-static-gradient" />
                    <div className="scroll-frame-static-pattern" />
                </div>

                {/* Canvas wrapper - fades in when splash arrives */}
                <div ref={canvasWrapperRef} className="scroll-frame-canvas-wrapper">
                    <canvas ref={canvasRef} className="scroll-frame-canvas" />
                </div>

                {/* Theme-responsive overlay for light theme */}
                <div className="scroll-frame-theme-overlay" />

                {/* Vignette for depth */}
                <div className="scroll-frame-vignette" />

                {/* Loading indicator */}
                {!isLoaded && (
                    <div className="scroll-frame-loading">
                        <div className="scroll-frame-loading-track">
                            <div
                                className="scroll-frame-loading-bar"
                                style={{ width: `${loadProgress}%` }}
                            />
                        </div>
                        <span className="scroll-frame-loading-text">Loading Experience...</span>
                    </div>
                )}
            </div>

            <style jsx global>{`
        /* Container */
        .scroll-frame-container {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        /* Premium Static Background */
        .scroll-frame-static {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .scroll-frame-static-gradient {
          position: absolute;
          inset: 0;
          background-image: url('/images/BackgroundDark.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .scroll-frame-static-pattern {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.5;
        }

        /* Light theme background */
        [data-theme="light"] .scroll-frame-static-gradient {
          background-image: url('/images/BackgroundLight.webp');
        }

        /* Dim theme background */
        [data-theme="dim"] .scroll-frame-static-gradient {
          background-image: url('/images/BackgroundDim.webp');
        }

        [data-theme="light"] .scroll-frame-static-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230066cc' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          opacity: 0.8;
        }

        /* Canvas wrapper */
        .scroll-frame-canvas-wrapper {
          position: absolute;
          inset: 0;
          z-index: 2;
          opacity: 0;
        }

        .scroll-frame-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Theme-responsive overlay for light mode visibility */
        .scroll-frame-theme-overlay {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        [data-theme="light"] .scroll-frame-theme-overlay {
          opacity: 1;
          background: linear-gradient(
            135deg,
            rgba(6, 16, 31, 0.25) 0%,
            rgba(0, 40, 80, 0.2) 50%,
            rgba(6, 16, 31, 0.3) 100%
          );
        }

        /* Vignette for depth */
        .scroll-frame-vignette {
          position: absolute;
          inset: 0;
          z-index: 4;
          background: radial-gradient(
            ellipse 80% 80% at center,
            transparent 0%,
            transparent 40%,
            rgba(0, 0, 0, 0.4) 100%
          );
          pointer-events: none;
        }

        /* Premium loading indicator */
        .scroll-frame-loading {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          z-index: 10;
        }

        .scroll-frame-loading-track {
          width: 200px;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          backdrop-filter: blur(4px);
        }

        .scroll-frame-loading-bar {
          height: 100%;
          background: linear-gradient(90deg, #0066cc, #00bae2, #0066cc);
          background-size: 200% 100%;
          animation: loading-shimmer 1.5s ease infinite;
          border-radius: 2px;
        }

        @keyframes loading-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .scroll-frame-loading-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
        }

        [data-theme="light"] .scroll-frame-loading-text {
          color: rgba(0, 40, 80, 0.6);
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


