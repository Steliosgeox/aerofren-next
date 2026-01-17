'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap/client';
import styles from './ScrollAnimation.module.css';

// Layer 1: Background/Outer elements (6 images)
const LAYER_1_IMAGES = [
    '/images/scroll-new/l1_cylinder_pneu_1768534522489.png',
    '/images/scroll-new/l1_filter_regulator_1768534537093.png',
    '/images/scroll-new/l1_solenoid_valve_1768534552843.png',
    '/images/scroll-new/l1_air_hoses_1768534582221.png',
    '/images/scroll-new/l1_ball_valve_1768534596693.png',
    '/images/scroll-new/l1_air_tool_1768534611483.png',
];

// Layer 2: Midground/Inner elements (6 images)
const LAYER_2_IMAGES = [
    '/images/scroll-new/l2_push_in_fittings_1768534635577.png',
    '/images/scroll-new/l2_brass_fittings_1768534649826.png',
    '/images/scroll-new/l2_digital_sensor_1768534663754.png',
    '/images/scroll-new/l2_flow_control_1768534690849.png',
    '/images/scroll-new/l2_silencer_1768534704874.png',
    '/images/scroll-new/l2_quick_coupler_1768534717862.png',
];

// Layer 3: Foreground/Center Vertical elements (2 images)
const LAYER_3_IMAGES = [
    '/images/scroll-new/l3_mini_valve_1768534745937.png',
    '/images/scroll-new/l3_gauge_macro_1768534760443.png',
];

const SCALER_IMAGE = '/images/scroll-new/scaler_hero_1768534781568.png';

/**
 * ScrollAnimation Component
 * 
 * Premium scroll-driven grid animation using GSAP ScrollTrigger.
 * Shows a 5x3 grid of product images that scale and fade in as user scrolls.
 * Uses GSAP instead of Motion library for better browser support.
 */
export default function ScrollAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Guard: SSR check
        if (typeof window === 'undefined') return;

        // Guard: Reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            console.log('[ScrollAnimation] Reduced motion preference detected - skipping animations');
            return;
        }

        const container = containerRef.current;
        const section = sectionRef.current;
        if (!container || !section) {
            console.warn('[ScrollAnimation] Container or section not found');
            return;
        }

        const layers = container.querySelectorAll(`.${styles.layer}`);
        const scaler = container.querySelector(`.${styles.scaler}`);
        const scalerImg = container.querySelector(`.${styles.scalerImage}`);

        if (layers.length === 0) {
            console.warn('[ScrollAnimation] No layers found');
            return;
        }

        // Mark layers as animated (triggers CSS to set initial hidden state)
        layers.forEach(layer => {
            (layer as HTMLElement).setAttribute('data-animated', 'true');
        });

        // Create scroll-triggered timeline
        const ctx = gsap.context(() => {
            // Main timeline PINNED to scroll section - section stays fixed while animating
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                },
            });

            // Stagger offsets for each layer (outer reveals first)
            const layerStartTimes = [0, 0.2, 0.4];

            // Animate each layer
            layers.forEach((layer, index) => {
                const htmlLayer = layer as HTMLElement;
                const startTime = layerStartTimes[index] || 0;

                // Fade and scale in
                tl.fromTo(htmlLayer,
                    {
                        opacity: 0,
                        scale: 0.5,
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.3,
                        ease: 'power2.out',
                    },
                    startTime
                );
            });

            // Scaler image animation: starts large, shrinks to fit grid cell
            if (scalerImg) {
                // Get the grid cell size for the scaler
                const scalerEl = scaler as HTMLElement;

                tl.fromTo(scalerImg,
                    {
                        scale: 2.5, // Start larger than normal
                    },
                    {
                        scale: 1, // Shrink to fit
                        duration: 0.5,
                        ease: 'power2.inOut',
                    },
                    0 // Start at beginning
                );
            }

            console.log('[ScrollAnimation] GSAP animations initialized successfully');
        }, container);

        // Cleanup on unmount
        return () => {
            ctx.revert();
        };
    }, []);

    return (
        <div className={styles.contentWrap} ref={containerRef}>
            {/* Intro Header */}
            <div className={styles.header}>
                <h2 className={styles.title}>
                    ΤΕΧΝΟΛΟΓΙΑ<br />ΑΙΧΜΗΣ.
                </h2>
                <div className={styles.subtitle}>
                    ΠΛΟΗΓΗΘΕΙΤΕ ΣΤΟΝ ΠΙΟ ΕΞΕΙΔΙΚΕΥΜΕΝΟ ΚΑΤΑΛΟΓΟ
                </div>
            </div>

            {/* Scroll Section */}
            <section className={styles.scrollSection} ref={sectionRef}>
                <div className={styles.content}>
                    {/* Grid of images */}
                    <div className={styles.grid}>
                        {/* Layer 1: Background/Outer */}
                        <div className={styles.layer}>
                            {LAYER_1_IMAGES.map((src, i) => (
                                <div key={`l1-${i}`}>
                                    <img src={src} alt="" loading="eager" decoding="async" />
                                </div>
                            ))}
                        </div>

                        {/* Layer 2: Midground */}
                        <div className={styles.layer}>
                            {LAYER_2_IMAGES.map((src, i) => (
                                <div key={`l2-${i}`}>
                                    <img src={src} alt="" loading="eager" decoding="async" />
                                </div>
                            ))}
                        </div>

                        {/* Layer 3: Foreground */}
                        <div className={styles.layer}>
                            {LAYER_3_IMAGES.map((src, i) => (
                                <div key={`l3-${i}`}>
                                    <img src={src} alt="" loading="eager" />
                                </div>
                            ))}
                        </div>

                        {/* Scaler - Center Hero */}
                        <div className={styles.scaler}>
                            <img
                                src={SCALER_IMAGE}
                                alt="Aerofren Hero"
                                className={styles.scalerImage}
                                loading="eager"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Text Overlay Section 1 */}
            <div className={styles.finSection}>
                <h3 className={styles.finTitle}>ΜΕΓΙΣΤΗ ΑΠΟΔΟΣΗ</h3>
                <p className={styles.finText}>
                    Εξαρτήματα σχεδιασμένα για τις πιο απαιτητικές<br />
                    βιομηχανικές εφαρμογές.
                </p>
            </div>

            {/* Text Overlay Section 2 */}
            <div className={styles.finSection}>
                <h3 className={styles.finTitle}>ΚΕΝΤΡΟ ΕΞΕΙΔΙΚΕΥΣΗΣ</h3>
                <p className={styles.finText}>
                    35+ χρόνια εμπειρίας στην υποστήριξη<br />
                    της ελληνικής βιομηχανίας.
                </p>
            </div>
        </div>
    );
}
