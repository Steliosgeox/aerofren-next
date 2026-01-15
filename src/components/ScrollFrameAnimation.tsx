"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap/client";

/**
 * ScrollFrameAnimation Component
 * 
 * Canvas-based scroll-controlled frame animation.
 * Displays pre-rendered frames based on scroll position.
 * 
 * Features:
 * - 118 frames for smooth animation
 * - Scroll-linked playback (forward on scroll down, reverse on scroll up)
 * - Canvas rendering for optimal performance
 * - Preloading with loading state
 * - Covers Hero + Stats sections
 */

// Frame configuration
const FRAME_COUNT = 118;

// Frame delays follow pattern: every 3rd frame starting from 1 has 0.041s
// Pattern: 0.042(0), 0.041(1), 0.042(2), 0.042(3), 0.041(4), 0.042(5)...
// Indices 1, 4, 7, 10, 13... (i % 3 === 1) use 0.041s, all others use 0.042s
const getFramePath = (index: number): string => {
    const paddedIndex = index.toString().padStart(3, "0");
    const delay = index % 3 === 1 ? "0.041s" : "0.042s";
    return `/frames/frame_${paddedIndex}_delay-${delay}.webp`;
};

export default function ScrollFrameAnimation() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const currentFrameRef = useRef(0);

    // Preload all frames
    useEffect(() => {
        let loadedCount = 0;
        const images: HTMLImageElement[] = [];

        // Create all image elements
        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();

            // Use the correct path directly
            img.src = getFramePath(i);

            img.onload = () => {
                loadedCount++;
                setLoadProgress((loadedCount / FRAME_COUNT) * 100);

                if (loadedCount === FRAME_COUNT) {
                    setIsLoaded(true);
                }
            };

            img.onerror = () => {
                // Log error but continue loading
                console.warn(`Failed to load frame ${i}`);
                loadedCount++;
                setLoadProgress((loadedCount / FRAME_COUNT) * 100);

                if (loadedCount === FRAME_COUNT) {
                    setIsLoaded(true);
                }
            };

            images.push(img);
        }

        imagesRef.current = images;
    }, []);

    // Draw frame to canvas with cover-fit behavior
    const drawFrame = useCallback((frameIndex: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const img = imagesRef.current[frameIndex];

        if (!canvas || !ctx || !img || !img.complete) return;

        // Calculate cover-fit dimensions
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspect > canvasAspect) {
            // Image is wider - fit to height
            drawHeight = canvas.height;
            drawWidth = img.width * (canvas.height / img.height);
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            // Image is taller - fit to width
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

    // Setup ScrollTrigger for frame animation
    useEffect(() => {
        if (!isLoaded) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Draw first frame immediately
        drawFrame(0);

        // Create animation object for GSAP to tween
        const frameObj = { frame: 0 };

        // Create ScrollTrigger animation
        const tween = gsap.to(frameObj, {
            frame: FRAME_COUNT - 1,
            snap: "frame", // Snap to integer frame values
            ease: "none",
            scrollTrigger: {
                trigger: "body", // Use body as trigger for global scroll
                start: "top top",
                end: "+=200%", // Animation spans 200vh (Hero + Stats sections)
                scrub: 0.5, // 0.5s smooth interpolation
                onUpdate: (self) => {
                    const newFrame = Math.round(frameObj.frame);
                    if (newFrame !== currentFrameRef.current) {
                        currentFrameRef.current = newFrame;
                        drawFrame(newFrame);
                    }
                },
            },
        });

        return () => {
            tween.kill();
        };
    }, [isLoaded, drawFrame]);

    return (
        <>
            <div
                ref={containerRef}
                className="scroll-frame-container"
                aria-hidden="true"
            >
                {/* Loading indicator */}
                {!isLoaded && (
                    <div className="scroll-frame-loading">
                        <div
                            className="scroll-frame-loading-bar"
                            style={{ width: `${loadProgress}%` }}
                        />
                    </div>
                )}

                {/* Canvas for frame rendering */}
                <canvas
                    ref={canvasRef}
                    className="scroll-frame-canvas"
                />

                {/* Subtle vignette overlay */}
                <div className="scroll-frame-overlay" />
            </div>

            <style jsx global>{`
        /* Container - fixed position, behind content */
        .scroll-frame-container {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        /* Canvas - full viewport */
        .scroll-frame-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Loading indicator */
        .scroll-frame-loading {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
          z-index: 10;
        }

        .scroll-frame-loading-bar {
          height: 100%;
          background: linear-gradient(90deg, #5cb8ff, #0066cc);
          transition: width 0.1s ease-out;
        }

        /* Vignette overlay for depth */
        .scroll-frame-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 50%,
            rgba(0, 0, 0, 0.3) 100%
          );
          pointer-events: none;
        }

        /* Hide on reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .scroll-frame-container {
            display: none;
          }
        }
      `}</style>
        </>
    );
}
