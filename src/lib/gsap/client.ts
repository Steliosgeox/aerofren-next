"use client";

/**
 * GSAP Client Integration
 * 
 * Single source of truth for GSAP configuration.
 * All plugins are now FREE and available on npm.
 * 
 * Plugins are registered at import time to ensure availability.
 */

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "./SplitText";

// Phase 1: Premium Animation Plugins
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { CustomEase } from "gsap/CustomEase";
import { CustomBounce } from "gsap/CustomBounce";

// Phase 2: Interactive & Gesture Plugins
// Import using "gsap/all" to avoid Windows file casing issues
import { Draggable, InertiaPlugin, Observer, MotionPathPlugin } from "gsap/all";

// ============================================
// Plugin Registration (at import time)
// ============================================

// Register plugins immediately when this module loads
if (typeof window !== "undefined") {
    gsap.registerPlugin(
        ScrollTrigger,
        ScrollToPlugin,
        ScrollSmoother,
        SplitText,
        // Phase 1: Animation plugins
        ScrambleTextPlugin,
        CustomEase,
        CustomBounce,
        // Phase 2: Interactive plugins
        Draggable,
        InertiaPlugin,
        Observer,
        // Phase 3: Premium animation plugins
        MotionPathPlugin
    );

    // ============================================
    // Custom Easing Curves
    // ============================================

    // "Hydraulic" - Industrial pneumatic cylinder feel
    // Fast start, slight overshoot, smooth settle
    CustomEase.create("hydraulic", "M0,0 C0.2,0 0.2,1.1 0.4,1 0.5,0.97 0.7,1 1,1");

    // "Gauge" - Pressure gauge needle settling
    // Quick move, bouncy settle like a mechanical gauge
    CustomBounce.create("gauge", { strength: 0.3, squash: 2, squashID: "gauge-squash" });

    // Global defaults: Apple-style timing
    gsap.defaults({
        ease: "power3.out",
        duration: 0.8,
    });

    // Suppress null target warnings
    gsap.config({ nullTargetWarn: false });

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (prefersReducedMotion.matches) {
        gsap.globalTimeline.timeScale(0);
        ScrollTrigger.config({ limitCallbacks: true });
    }

    // Listen for changes to reduced motion preference
    prefersReducedMotion.addEventListener("change", (e) => {
        if (e.matches) {
            gsap.globalTimeline.timeScale(0);
        } else {
            gsap.globalTimeline.timeScale(1);
        }
    });
}

// ============================================
// Animation Constants
// ============================================

export const DURATION = {
    fast: 0.4,
    normal: 0.6,
    slow: 0.8,
    xslow: 1.2,
} as const;

export const EASE = {
    smooth: "power3.out",
    smoothInOut: "power3.inOut",
    emphasis: "power4.out",
    bounce: "back.out(1.4)",
    elastic: "elastic.out(1, 0.3)",
    // Phase 1: Custom eases
    hydraulic: "hydraulic",
    gauge: "gauge",
} as const;

export const STAGGER = {
    fast: 0.06,
    normal: 0.1,
    slow: 0.15,
} as const;

// ============================================
// ScrambleText Character Sets
// ============================================

export const SCRAMBLE_CHARS = {
    // Industrial/technical feel
    technical: "!<>-_\\/[]{}—=+*^?#_AEROFN",
    // Greek-friendly
    greek: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
    // Numeric/data
    numeric: "0123456789!@#$%^&*()",
    // Default balanced
    default: "upperCase",
} as const;

// ============================================
// Exports
// ============================================

export {
    gsap,
    useGSAP,
    ScrollTrigger,
    ScrollToPlugin,
    ScrollSmoother,
    SplitText,
    // Phase 1 exports
    ScrambleTextPlugin,
    CustomEase,
    CustomBounce,
    // Phase 2 exports
    Draggable,
    InertiaPlugin,
    Observer,
    // Phase 3 exports
    MotionPathPlugin,
};
