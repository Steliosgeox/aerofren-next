"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * LenisProvider
 *
 * Replaces GSAP ScrollSmoother with Lenis smooth scrolling.
 * Uses native scroll (no DOM wrapper transform) — eliminates the full-page GPU composite layer.
 *
 * ScrollTrigger is kept alive via the inner ScrollTriggerSync component which calls
 * ScrollTrigger.update() on every Lenis tick.
 */

function ScrollTriggerSync() {
  useLenis(() => {
    ScrollTrigger.update();
  });
  return null;
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <ReactLenis
      root
      options={{
        // lerp: 1 = instant (no smoothing) for reduced-motion users
        lerp: prefersReducedMotion ? 1 : 0.08,
        duration: prefersReducedMotion ? 0 : 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        syncTouch: false,
        orientation: "vertical",
        gestureOrientation: "vertical",
      }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
