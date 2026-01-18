"use client";

import { useState, useEffect, useRef } from "react";
import { gsap, ScrollToPlugin } from "@/lib/gsap";

// Ensure ScrollToPlugin is registered
gsap.registerPlugin(ScrollToPlugin);

/**
 * BackToTop Component
 * 
 * A premium floating "Back to Top" button with:
 * - 3 theme variants (light/dark/dim) using glassmorphism
 * - GSAP ScrollToPlugin for smooth scrolling
 * - Animated show/hide based on scroll position
 * - Hover expand animation with text reveal
 */
export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const tweenRef = useRef<gsap.core.Tween | null>(null);

    // Track scroll position and show/hide button - THROTTLED
    useEffect(() => {
        const SCROLL_THRESHOLD = 300;
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const shouldShow = window.scrollY > SCROLL_THRESHOLD;
                    setIsVisible(shouldShow);
                    ticking = false;
                });
                ticking = true;
            }
        };

        // Initial check
        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Animate button visibility with GSAP
    useEffect(() => {
        if (!buttonRef.current) return;

        // Kill any existing tween before starting a new one
        if (tweenRef.current) {
            tweenRef.current.kill();
        }

        if (isVisible) {
            // Show animation
            tweenRef.current = gsap.to(buttonRef.current, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.4,
                ease: "back.out(1.7)"
            });
        } else {
            // Hide animation
            tweenRef.current = gsap.to(buttonRef.current, {
                opacity: 0,
                scale: 0.8,
                y: 20,
                duration: 0.3,
                ease: "power2.in",
            });
        }

        return () => {
            if (tweenRef.current) {
                tweenRef.current.kill();
                tweenRef.current = null;
            }
        };
    }, [isVisible]);

    // Scroll to top with GSAP
    const handleClick = () => {
        gsap.to(window, {
            scrollTo: { y: 0, autoKill: true },
            duration: 1.0,
            ease: "power2.inOut",
        });
    };

    return (
        <>
            <style jsx global>{`
                /* ========================================
                 * BACK TO TOP - Container
                 * ======================================== */
                .back-to-top-wrapper {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 9999;
                }

                /* ========================================
                 * Base Button Styles (Dark Theme Default)
                 * ======================================== */
                .back-to-top-button {
                    /* Size & Shape */
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: none;
                    
                    /* Dark Theme Colors */
                    background: linear-gradient(135deg, rgb(18, 22, 30) 0%, rgb(25, 32, 45) 100%);
                    
                    /* Layout */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    /* Glassmorphism */
                    backdrop-filter: blur(8px) saturate(150%);
                    -webkit-backdrop-filter: blur(8px) saturate(150%);
                    
                    /* Shadow & Glow - Cyan for Dark Theme */
                    box-shadow: 
                        0px 0px 0px 4px rgba(0, 200, 255, 0.2),
                        0px 4px 16px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    
                    /* Interactions */
                    cursor: pointer;
                    overflow: hidden;
                    position: relative;
                    
                    /* Transitions */
                    transition: 
                        width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Arrow Icon */
                .back-to-top-icon {
                    width: 14px;
                    height: 14px;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .back-to-top-icon path {
                    fill: #ffffff;
                    transition: fill 0.3s ease;
                }

                /* "Back to Top" Text - Hidden by Default */
                .back-to-top-button::before {
                    content: "Back to Top";
                    position: absolute;
                    bottom: -20px;
                    color: #ffffff;
                    font-size: 0px;
                    font-weight: 600;
                    font-family: "DM Sans", system-ui, sans-serif;
                    white-space: nowrap;
                    opacity: 0;
                    transition: 
                        font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.3s ease;
                }

                /* ========================================
                 * Hover State
                 * ======================================== */
                .back-to-top-button:hover {
                    width: 140px;
                    border-radius: 50px;
                    background: linear-gradient(135deg, #0099cc 0%, #00ddff 100%);
                    box-shadow: 
                        0px 0px 0px 4px rgba(0, 221, 255, 0.3),
                        0px 8px 24px rgba(0, 200, 255, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }

                .back-to-top-button:hover .back-to-top-icon {
                    transform: translateY(-200%);
                }

                .back-to-top-button:hover::before {
                    font-size: 13px;
                    bottom: unset;
                    opacity: 1;
                }

                /* Focus State for Accessibility */
                .back-to-top-button:focus-visible {
                    outline: 2px solid #00ddff;
                    outline-offset: 4px;
                }

                /* ========================================
                 * LIGHT THEME
                 * ======================================== */
                [data-theme="light"] .back-to-top-button {
                    background: linear-gradient(135deg, rgb(227, 203, 255) 0%, rgb(252, 235, 252) 100%);
                    box-shadow: 
                        0px 0px 0px 4px rgba(180, 160, 255, 0.25),
                        0px 4px 16px rgba(122, 24, 229, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8);
                }

                [data-theme="light"] .back-to-top-icon path {
                    fill: #7a18e5;
                }

                [data-theme="light"] .back-to-top-button::before {
                    color: #7a18e5;
                }

                [data-theme="light"] .back-to-top-button:hover {
                    background: #7a18e5;
                    box-shadow: 
                        0px 0px 0px 4px rgba(122, 24, 229, 0.3),
                        0px 8px 24px rgba(122, 24, 229, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }

                [data-theme="light"] .back-to-top-button:hover .back-to-top-icon path {
                    fill: #ffffff;
                }

                [data-theme="light"] .back-to-top-button:hover::before {
                    color: #ffffff;
                }

                [data-theme="light"] .back-to-top-button:focus-visible {
                    outline-color: #7a18e5;
                }

                /* ========================================
                 * DIM THEME (Purple/Pink Accents)
                 * ======================================== */
                [data-theme="dim"] .back-to-top-button {
                    background: linear-gradient(135deg, rgb(20, 20, 20) 0%, rgb(30, 25, 35) 100%);
                    box-shadow: 
                        0px 0px 0px 4px rgba(180, 160, 255, 0.25),
                        0px 4px 16px rgba(0, 0, 0, 0.5),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
                }

                [data-theme="dim"] .back-to-top-icon path {
                    fill: #ffffff;
                }

                [data-theme="dim"] .back-to-top-button::before {
                    color: #ffffff;
                }

                [data-theme="dim"] .back-to-top-button:hover {
                    background: linear-gradient(135deg, rgb(160, 140, 230) 0%, rgb(181, 160, 255) 100%);
                    box-shadow: 
                        0px 0px 0px 4px rgba(181, 160, 255, 0.4),
                        0px 8px 24px rgba(181, 160, 255, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.3);
                }

                [data-theme="dim"] .back-to-top-button:focus-visible {
                    outline-color: rgb(181, 160, 255);
                }

                /* ========================================
                 * Mobile Responsiveness
                 * ======================================== */
                @media (max-width: 768px) {
                    .back-to-top-wrapper {
                        bottom: 20px;
                    }

                    .back-to-top-button {
                        width: 46px;
                        height: 46px;
                    }

                    .back-to-top-icon {
                        width: 12px;
                        height: 12px;
                    }

                    .back-to-top-button:hover {
                        width: 120px;
                    }

                    .back-to-top-button:hover::before {
                        font-size: 12px;
                    }
                }

                /* ========================================
                 * Reduced Motion Preference
                 * ======================================== */
                @media (prefers-reduced-motion: reduce) {
                    .back-to-top-button,
                    .back-to-top-icon,
                    .back-to-top-button::before {
                        transition: none;
                    }
                }
            `}</style>

            <div 
                className="back-to-top-wrapper"
                style={{ pointerEvents: isVisible ? "auto" : "none" }}
            >
                <button
                    ref={buttonRef}
                    className="back-to-top-button"
                    onClick={handleClick}
                    aria-label="Back to top"
                    type="button"
                    style={{ 
                        opacity: 0, 
                        transform: "scale(0.8) translateY(20px)" 
                    }}
                >
                    <svg className="back-to-top-icon" viewBox="0 0 384 512">
                        <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
                    </svg>
                </button>
            </div>
        </>
    );
}

export default BackToTop;
