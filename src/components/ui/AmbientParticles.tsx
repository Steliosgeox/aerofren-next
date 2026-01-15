"use client";

import { useRef, useEffect } from "react";
import { gsap, MotionPathPlugin, useGSAP } from "@/lib/gsap/client";

/**
 * AmbientParticles Component
 * 
 * Premium floating particle system using GSAP MotionPathPlugin.
 * Particles drift along curved SVG paths for organic ambient feel.
 * 
 * Features:
 * - 8 particles on 3 curved paths
 * - Staggered infinite loop animations (70-110s)
 * - Performance optimized with IntersectionObserver
 * - Hidden on mobile for cleaner experience
 * - Respects prefers-reduced-motion (via global GSAP config)
 */

// Particle configuration - defines each particle's appearance and motion
const PARTICLE_CONFIG = [
    { pathId: 1, size: 6, opacity: 0.4, duration: 90, delay: 0 },
    { pathId: 2, size: 10, opacity: 0.3, duration: 75, delay: 8 },
    { pathId: 3, size: 4, opacity: 0.5, duration: 110, delay: 16 },
    { pathId: 1, size: 8, opacity: 0.35, duration: 85, delay: 24 },
    { pathId: 2, size: 5, opacity: 0.45, duration: 95, delay: 32 },
    { pathId: 3, size: 7, opacity: 0.3, duration: 80, delay: 40 },
    { pathId: 1, size: 9, opacity: 0.4, duration: 100, delay: 48 },
    { pathId: 2, size: 6, opacity: 0.35, duration: 70, delay: 56 },
];

// SVG path definitions - curved bezier paths spanning viewport
const MOTION_PATHS = {
    1: "M-100,150 C400,80 800,220 1500,100 C2000,50 2200,180 2500,120",
    2: "M-50,400 C300,500 700,350 1200,450 C1700,550 2000,380 2400,480",
    3: "M0,650 C250,750 600,580 1100,700 C1600,800 1900,620 2300,720",
};

export default function AmbientParticles() {
    const containerRef = useRef<HTMLDivElement>(null);
    const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
    const animationsRef = useRef<gsap.core.Tween[]>([]);

    useGSAP(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clear any existing animations
        animationsRef.current.forEach(anim => anim?.kill());
        animationsRef.current = [];

        // Create animations for each particle
        PARTICLE_CONFIG.forEach((config, index) => {
            const particle = particleRefs.current[index];
            if (!particle) return;

            const pathId = `#particle-path-${config.pathId}`;

            const anim = gsap.to(particle, {
                motionPath: {
                    path: pathId,
                    align: pathId,
                    alignOrigin: [0.5, 0.5],
                    autoRotate: false,
                },
                duration: config.duration,
                delay: config.delay,
                repeat: -1,
                ease: "none",
            });

            animationsRef.current.push(anim);
        });

        // Cleanup
        return () => {
            animationsRef.current.forEach(anim => anim?.kill());
        };
    }, { scope: containerRef });

    // IntersectionObserver for performance - pause when off-screen
    useEffect(() => {
        const container = containerRef.current;
        if (!container || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    animationsRef.current.forEach((anim) => {
                        if (anim) {
                            if (entry.isIntersecting) {
                                anim.resume();
                            } else {
                                anim.pause();
                            }
                        }
                    });
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <>
            <div
                ref={containerRef}
                className="ambient-particles"
                aria-hidden="true"
            >
                {/* Hidden SVG paths for MotionPath to follow */}
                <svg
                    className="ambient-paths"
                    viewBox="0 0 2400 900"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        <path id="particle-path-1" d={MOTION_PATHS[1]} fill="none" />
                        <path id="particle-path-2" d={MOTION_PATHS[2]} fill="none" />
                        <path id="particle-path-3" d={MOTION_PATHS[3]} fill="none" />
                    </defs>
                </svg>

                {/* Actual visible particles */}
                {PARTICLE_CONFIG.map((config, index) => (
                    <div
                        key={index}
                        ref={(el) => { particleRefs.current[index] = el; }}
                        className="particle"
                        style={{
                            width: config.size,
                            height: config.size,
                            opacity: config.opacity,
                        }}
                    />
                ))}
            </div>

            <style jsx global>{`
        /* Particle container - fixed, full viewport */
        .ambient-particles {
          position: fixed;
          inset: 0;
          z-index: -1; /* Behind everything except waves */
          pointer-events: none;
          overflow: hidden;
          contain: strict;
        }

        /* Hidden on mobile for performance */
        @media (max-width: 768px) {
          .ambient-particles {
            display: none;
          }
        }

        /* Hidden SVG paths */
        .ambient-paths {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          pointer-events: none;
        }

        /* Individual particle styling */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(92, 184, 255, 0.9) 0%,
            rgba(0, 102, 204, 0.6) 40%,
            rgba(0, 60, 120, 0.3) 70%,
            transparent 100%
          );
          filter: blur(1px);
          will-change: transform;
          box-shadow: 
            0 0 8px rgba(92, 184, 255, 0.4),
            0 0 16px rgba(0, 102, 204, 0.2);
        }

        /* Reduced motion - particles are static */
        @media (prefers-reduced-motion: reduce) {
          .ambient-particles {
            display: none;
          }
        }
      `}</style>
        </>
    );
}
