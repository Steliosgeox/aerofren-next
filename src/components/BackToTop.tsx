"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { ArrowUp } from "lucide-react";

/**
 * BackToTop Component - Tailwind Refactored
 * 
 * Premium floating "Back to Top" with:
 * - Theme-aware glassmorphism (dark/light/dim)
 * - GSAP smooth scroll and animations
 * - Hover expand with text reveal
 * 
 * Lines reduced: 338 → ~150
 */
export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const tweenRef = useRef<gsap.core.Tween | null>(null);

    // Throttled scroll detection
    useEffect(() => {
        const SCROLL_THRESHOLD = 300;
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setIsVisible(window.scrollY > SCROLL_THRESHOLD);
                    ticking = false;
                });
                ticking = true;
            }
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // GSAP visibility animation
    useEffect(() => {
        if (!buttonRef.current) return;
        tweenRef.current?.kill();

        tweenRef.current = gsap.to(buttonRef.current, {
            opacity: isVisible ? 1 : 0,
            scale: isVisible ? 1 : 0.8,
            y: isVisible ? 0 : 20,
            duration: isVisible ? 0.4 : 0.3,
            ease: isVisible ? "back.out(1.7)" : "power2.in",
        });

        return () => {
            tweenRef.current?.kill();
            tweenRef.current = null;
        };
    }, [isVisible]);

    const handleClick = () => {
        gsap.to(window, {
            scrollTo: { y: 0, autoKill: true },
            duration: 1.0,
            ease: "power2.inOut",
        });
    };

    const styles = {
        button: "bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] border border-[var(--theme-glass-border)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--theme-accent)_20%,transparent),0_4px_16px_rgba(0,0,0,0.35),inset_0_1px_0_var(--theme-glass-inset-light)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_95%,transparent)] hover:border-[color-mix(in_srgb,var(--theme-accent)_35%,transparent)] hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--theme-accent)_30%,transparent),0_8px_24px_rgba(0,0,0,0.35)] focus-visible:outline-[color-mix(in_srgb,var(--theme-accent)_55%,transparent)]",
        icon: "text-[var(--theme-text)] group-hover:text-[var(--theme-text)]",
        text: "text-[var(--theme-text)]",
    };

    return (
        <div
            className="fixed bottom-6 md:bottom-5 left-1/2 -translate-x-1/2 z-[9999]"
            style={{ pointerEvents: isVisible ? "auto" : "none" }}
        >
            <button
                ref={buttonRef}
                onClick={handleClick}
                aria-label="Επιστροφή στην κορυφή"
                type="button"
                className={`
                    group
                    w-[50px] md:w-[46px] h-[50px] md:h-[46px]
                    rounded-full
                    flex items-center justify-center
                    backdrop-blur-lg
                    cursor-pointer
                    overflow-hidden
                    relative
                    transition-all duration-300 ease-out
                    hover:w-[140px] md:hover:w-[120px]
                    hover:rounded-[50px]
                    focus-visible:outline-2 focus-visible:outline-offset-4
                    motion-reduce:transition-none
                    ${styles.button}
                `}
                style={{ opacity: 0, transform: "scale(0.8) translateY(20px)" }}
            >
                {/* Arrow Icon */}
                <ArrowUp
                    className={`
                        w-3.5 h-3.5 md:w-3 md:h-3
                        transition-transform duration-300 ease-out
                        group-hover:-translate-y-[200%]
                        motion-reduce:transition-none
                        ${styles.icon}
                    `}
                />

                {/* Hover Text */}
                <span
                    className={`
                        absolute
                        text-[0px] opacity-0
                        font-semibold font-sans whitespace-nowrap
                        transition-all duration-300 ease-out
                        group-hover:text-[13px] md:group-hover:text-[12px]
                        group-hover:opacity-100
                        motion-reduce:transition-none
                        ${styles.text}
                    `}
                >
                    Επιστροφή στην κορυφή
                </span>
            </button>
        </div>
    );
}

export default BackToTop;
