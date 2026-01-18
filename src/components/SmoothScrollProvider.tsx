"use client";

import { useRef, useLayoutEffect, ReactNode } from "react";
import { gsap, ScrollSmoother, ScrollTrigger } from "@/lib/gsap/client";

/**
 * SmoothScrollProvider Component
 * 
 * Wraps the entire application with GSAP ScrollSmoother for buttery smooth
 * inertia-style scrolling across all pages.
 * 
 * Features:
 * - Smooth 1.5s momentum scrolling
 * - Touch device support (light smoothing)
 * - Data-speed/data-lag parallax effects enabled
 * - Normalized scroll behavior across browsers
 * - Respects prefers-reduced-motion
 */

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const smootherRef = useRef<ScrollSmoother | null>(null);

  useLayoutEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Create ScrollSmoother instance
    // CRITICAL: normalizeScroll: false prevents GSAP from hijacking all scroll events
    // which was causing severe performance issues and conflicts with Next.js navigation
    smootherRef.current = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: prefersReducedMotion ? 0 : 1.2, // Reduced from 1.5 for snappier feel
      effects: !prefersReducedMotion, // Enable data-speed/data-lag attributes
      smoothTouch: 0.1, // Light touch smoothing for mobile
      normalizeScroll: false, // CRITICAL: false prevents scroll hijacking
      ignoreMobileResize: true, // Prevents layout thrashing on mobile
    });

    // Refresh ScrollTrigger after smoother is created
    ScrollTrigger.refresh();

    // Cleanup - CRITICAL: Must be SYNCHRONOUS (no requestAnimationFrame!)
    // Async cleanup causes multiple instances to coexist during navigation
    return () => {
      // FIRST: Kill all ScrollTriggers BEFORE killing smoother
      // This prevents orphaned callbacks from firing
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());

      // SECOND: Kill ScrollSmoother
      if (smootherRef.current) {
        smootherRef.current.paused(true);
        smootherRef.current.kill();
        smootherRef.current = null;
      }

      // THIRD: Clear all GSAP scroll-related caches
      ScrollTrigger.clearMatchMedia();
      ScrollTrigger.clearScrollMemory();

      // FOURTH: Reset scroll position for clean navigation
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }
    };
  }, []);

  return (
    <>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          {children}
        </div>
      </div>

      <style jsx global>{`
        /* ScrollSmoother wrapper structure */
        #smooth-wrapper {
          overflow: hidden;
          position: fixed;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1; /* Above fixed backgrounds (waves: -1, webp: 0) */
        }

        #smooth-content {
          overflow: visible;
          width: 100%;
        }

        /* Utility classes for parallax effects */
        [data-speed] {
          will-change: transform;
        }

        [data-lag] {
          will-change: transform;
        }
      `}</style>
    </>
  );
}
