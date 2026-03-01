"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * useParallax
 *
 * Replicates GSAP ScrollSmoother's data-speed attribute behavior using ScrollTrigger.
 * Required for pages that relied on ScrollSmoother's `effects: true` for parallax.
 *
 * NOTE: Do NOT use this in HomePageClient — it already has manual ScrollTrigger parallax.
 *
 * Usage:
 *   const sectionRef = useRef<HTMLDivElement>(null)
 *   useParallax(sectionRef)
 *   // Elements inside sectionRef with [data-speed] will get parallax
 *
 * data-speed="1"   → no effect (neutral)
 * data-speed="1.5" → moves 1.5× faster (floats forward)
 * data-speed="0.5" → moves 0.5× slower (recedes)
 */
export function useParallax(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nodes = Array.from(
      container.querySelectorAll<HTMLElement>("[data-speed]")
    );
    if (!nodes.length) return;

    const triggers: ReturnType<typeof ScrollTrigger.create>[] = [];

    nodes.forEach((node) => {
      const speed = parseFloat(node.dataset.speed ?? "1");
      if (speed === 1) return;

      const range = 150 * Math.abs(speed - 1);

      const st = ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const y =
            gsap.utils.interpolate(-range, range, 1 - self.progress) *
            (speed - 1);
          gsap.set(node, { y, overwrite: "auto" });
        },
      });

      triggers.push(st);
    });

    return () => {
      triggers.forEach((t) => t.kill());
      nodes.forEach((node) => gsap.set(node, { clearProps: "y" }));
    };
  }, [containerRef]);
}
