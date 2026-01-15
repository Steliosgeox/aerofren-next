"use client";

/**
 * GSAP Animation Presets
 * 
 * Reusable animation utilities for consistent motion across the site.
 * Apple-style: clean entrances, controlled scroll reveals, tasteful hover depth.
 */

import { gsap, ScrollTrigger, DURATION, EASE, STAGGER } from "./client";

// ============================================
// Entrance Animations
// ============================================

/**
 * Reveal element with fade + y translate
 */
export function revealUp(
    element: gsap.TweenTarget,
    options: {
        y?: number;
        duration?: number;
        delay?: number;
        ease?: string;
    } = {}
) {
    const { y = 40, duration = DURATION.normal, delay = 0, ease = EASE.smooth } = options;

    return gsap.fromTo(
        element,
        { opacity: 0, y },
        { opacity: 1, y: 0, duration, delay, ease }
    );
}

/**
 * Simple fade entrance
 */
export function revealFade(
    element: gsap.TweenTarget,
    options: {
        duration?: number;
        delay?: number;
        ease?: string;
    } = {}
) {
    const { duration = DURATION.normal, delay = 0, ease = EASE.smooth } = options;

    return gsap.fromTo(
        element,
        { opacity: 0 },
        { opacity: 1, duration, delay, ease }
    );
}

/**
 * Stagger reveal for multiple elements
 */
export function staggerReveal(
    elements: gsap.TweenTarget,
    options: {
        y?: number;
        duration?: number;
        delay?: number;
        stagger?: number;
        ease?: string;
    } = {}
) {
    const {
        y = 30,
        duration = DURATION.normal,
        delay = 0,
        stagger = STAGGER.normal,
        ease = EASE.smooth,
    } = options;

    return gsap.fromTo(
        elements,
        { opacity: 0, y },
        { opacity: 1, y: 0, duration, delay, stagger, ease }
    );
}

/**
 * Scale entrance
 */
export function revealScale(
    element: gsap.TweenTarget,
    options: {
        scale?: number;
        duration?: number;
        delay?: number;
        ease?: string;
    } = {}
) {
    const { scale = 0.95, duration = DURATION.slow, delay = 0, ease = EASE.smooth } = options;

    return gsap.fromTo(
        element,
        { opacity: 0, scale },
        { opacity: 1, scale: 1, duration, delay, ease }
    );
}

// ============================================
// Scroll Animations
// ============================================

/**
 * Create scroll-triggered reveal
 */
export function scrollReveal(
    element: gsap.DOMTarget,
    options: {
        y?: number;
        duration?: number;
        start?: string;
        scrub?: boolean | number;
    } = {}
) {
    const { y = 40, duration = DURATION.normal, start = "top 85%", scrub = false } = options;

    gsap.fromTo(
        element,
        { opacity: 0, y },
        {
            opacity: 1,
            y: 0,
            duration,
            ease: EASE.smooth,
            scrollTrigger: {
                trigger: element,
                start,
                scrub,
                toggleActions: "play none none none",
            },
        }
    );
}

/**
 * Scroll-triggered stagger for lists/grids
 */
export function scrollStagger(
    container: gsap.DOMTarget,
    items: string,
    options: {
        y?: number;
        stagger?: number;
        start?: string;
    } = {}
) {
    const { y = 30, stagger = STAGGER.normal, start = "top 80%" } = options;

    gsap.fromTo(
        items,
        { opacity: 0, y },
        {
            opacity: 1,
            y: 0,
            duration: DURATION.normal,
            stagger,
            ease: EASE.smooth,
            scrollTrigger: {
                trigger: container,
                start,
                toggleActions: "play none none none",
            },
        }
    );
}

/**
 * Parallax layer effect
 */
export function parallaxLayer(
    element: gsap.DOMTarget,
    speed: number = 0.3,
    options: {
        start?: string;
        end?: string;
    } = {}
) {
    const { start = "top bottom", end = "bottom top" } = options;
    const y = speed * 100;

    gsap.fromTo(
        element,
        { y: -y },
        {
            y,
            ease: "none",
            scrollTrigger: {
                trigger: element,
                start,
                end,
                scrub: 1,
            },
        }
    );
}

// ============================================
// Hover & Micro-interactions
// ============================================

/**
 * Hover lift effect for cards
 */
export function hoverLift(element: HTMLElement, lift: number = -4) {
    const enter = () => {
        gsap.to(element, {
            y: lift,
            duration: DURATION.fast,
            ease: EASE.smooth,
        });
    };

    const leave = () => {
        gsap.to(element, {
            y: 0,
            duration: DURATION.fast,
            ease: EASE.smooth,
        });
    };

    element.addEventListener("mouseenter", enter);
    element.addEventListener("mouseleave", leave);

    // Return cleanup function
    return () => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("mouseleave", leave);
    };
}

/**
 * Button press feedback
 */
export function buttonPress(element: HTMLElement) {
    const down = () => {
        gsap.to(element, {
            scale: 0.97,
            duration: 0.1,
            ease: "power2.out",
        });
    };

    const up = () => {
        gsap.to(element, {
            scale: 1,
            duration: 0.2,
            ease: EASE.bounce,
        });
    };

    element.addEventListener("mousedown", down);
    element.addEventListener("mouseup", up);
    element.addEventListener("mouseleave", up);

    return () => {
        element.removeEventListener("mousedown", down);
        element.removeEventListener("mouseup", up);
        element.removeEventListener("mouseleave", up);
    };
}

// ============================================
// Count-up Animation
// ============================================

/**
 * Animate number count-up
 */
export function countUp(
    element: HTMLElement,
    target: number,
    options: {
        duration?: number;
        suffix?: string;
        locale?: string;
    } = {}
) {
    const { duration = DURATION.xslow, suffix = "", locale = "el-GR" } = options;
    const obj = { value: 0 };

    return gsap.to(obj, {
        value: target,
        duration,
        ease: EASE.smooth,
        onUpdate: () => {
            if (target >= 1000) {
                element.textContent = Math.round(obj.value).toLocaleString(locale) + suffix;
            } else {
                element.textContent = Math.round(obj.value) + suffix;
            }
        },
    });
}

// ============================================
// Timeline Helpers
// ============================================

/**
 * Create menu open/close timeline
 */
export function menuTimeline(container: HTMLElement, items: string) {
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.smooth } });

    tl.fromTo(
        container,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: DURATION.fast }
    ).fromTo(
        items,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: DURATION.fast, stagger: STAGGER.fast },
        "-=0.2"
    );

    return tl;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Set initial hidden state for elements that will be revealed
 */
export function setHidden(elements: gsap.TweenTarget) {
    gsap.set(elements, { opacity: 0 });
}

/**
 * Kill all ScrollTriggers for cleanup
 */
export function killScrollTriggers(scope?: Element) {
    ScrollTrigger.getAll().forEach((st) => {
        if (!scope || (st.trigger && scope.contains(st.trigger as Node))) {
            st.kill();
        }
    });
}
