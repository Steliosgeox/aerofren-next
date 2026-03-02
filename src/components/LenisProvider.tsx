"use client";

import { useEffect, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

/**
 * LenisProvider
 *
 * Replaces GSAP ScrollSmoother with Lenis smooth scrolling.
 * Uses native scroll (no DOM wrapper transform) — eliminates the full-page GPU composite layer.
 *
 * GSAP Integration (frame-perfect):
 * - autoRaf: false         — Lenis's own RAF is disabled
 * - gsap.ticker.add()     — GSAP drives Lenis, ensuring they share the same animation frame
 * - lenis.on('scroll')    — ScrollTrigger is notified immediately after each Lenis scroll update
 * - gsap.ticker.lagSmoothing(0) — prevents GSAP from skipping frames under load (would cause jumps)
 *
 * This eliminates the scroll-position desync that caused ScrollAnimation
 * to pin too early while HorizontalGallery was still active.
 */

/**
 * GsapSync — inner component that lives inside ReactLenis so it can access
 * the Lenis instance via useLenis(). Wires Lenis into GSAP's ticker.
 */
function GsapSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Drive Lenis from GSAP's ticker — frame-perfect sync with ScrollTrigger
    const update = (time: number) => lenis.raf(time * 1000);

    // Notify ScrollTrigger on every Lenis scroll event so trigger positions stay accurate
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(update);

    // Critical: prevents GSAP from "catching up" by skipping frames (causes position jumps)
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  return null;
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <ReactLenis
      root
      options={{
        // CRITICAL: disable Lenis's own RAF — GSAP's ticker drives it instead
        autoRaf: false,
        lerp: prefersReducedMotion ? 1 : 0.08,
        duration: prefersReducedMotion ? 0 : 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        syncTouch: false,
        orientation: "vertical",
        gestureOrientation: "vertical",
      }}
    >
      <GsapSync />
      {children}
    </ReactLenis>
  );
}
