'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap/client';
import styles from './ScrollAnimation.module.css';

// Layer 1: Background/Outer elements (6 images)
const LAYER_1_IMAGES = [
    '/images/Scroll-second/Add_background_to_spiral_picture_38425f93ea-ezgif.com-jpg-to-webp-converter.webp',
    '/images/Scroll-second/Add_background_to_spiral_picture_bfb0a65da2-ezgif.com-jpg-to-webp-converter.webp',
    '/images/Scroll-second/Add_background_to_spiral_picture_d733cbaf63-ezgif.com-jpg-to-webp-converter.webp',
    '/images/Scroll-second/Add_background_to_spiral_picture_3a83586b00-ezgif.com-jpg-to-webp-converter.webp',
    '/images/Scroll-second/Change_background_of_ball_valve_ae99b75fb4-ezgif.com-jpg-to-webp-converter.webp',
    '/images/Scroll-second/Beautiful_blue_background_81fbc00005-ezgif.com-jpg-to-webp-converter.webp',
];

// Layer 2: Midground/Inner elements (6 images)
const LAYER_2_IMAGES = [
    '/images/Scroll-second/Brass_fittings_blue_background_3576546b97-ezgif.com-jpg-to-webp-converter.webp',
    '/images/Scroll-second/Beautiful_blue_background_c399f712b1-ezgif.com-jpg-to-webp-converter.webp',
    '/images/Scroll-second/Beautiful_blue_background_29a2b57df9-ezgif.com-jpg-to-webp-converter.webp',
    '/images/Scroll-second/Beautiful_blue_background_835f5f2fe6-ezgif.com-jpg-to-webp-converter.webp',
    '/images/Scroll-second/Beautiful_blue_background_ce1a72e4ef-ezgif.com-jpg-to-webp-converter.webp',
    '/images/Scroll-second/Beautiful_blue_background_a7c70edb85-ezgif.com-jpg-to-webp-converter.webp',
];

// Layer 3: Foreground/Center Vertical elements (2 images)
const LAYER_3_IMAGES = [
    '/images/Scroll-second/Add_background_to_spiral_picture_5ed39697f1-ezgif.com-jpg-to-webp-converter.webp',
    '/images/Scroll-second/Beautiful_blue_background_3c191d233a-ezgif.com-jpg-to-webp-converter.webp',
];

const SCALER_IMAGE =
    '/images/Scroll-second/Beautiful_blue_background_1c5f461a95-ezgif.com-jpg-to-webp-converter.webp';

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
        const scalerImg = container.querySelector(`.${styles.scalerImage}`);

        if (layers.length === 0) {
            console.warn('[ScrollAnimation] No layers found');
            return;
        }

        // Delay initialization so HorizontalGallery's pin spacer is already in the DOM
        // before we register our ScrollTrigger. Gallery timeline:
        //   t=100ms  → gallery pin spacer created
        //   t=200ms  → ScrollTrigger.refresh() called by gallery
        //   t=350ms  → we register HERE, measuring the correct document position
        // Without this delay, we register at t=0ms (no spacer yet) and lock in a start
        // position that's ~4000px too early, causing the pin to fire mid-gallery.
        let ctx: ReturnType<typeof gsap.context> | null = null;

        const initTimer = setTimeout(() => {
            ctx = gsap.context(() => {
                // Main timeline PINNED to scroll section.
                // invalidateOnRefresh: true ensures subsequent resize-triggered refreshes
                // also recalculate the start position correctly.
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 1,
                        pin: true,
                        invalidateOnRefresh: true,
                    },
                });

                // Stagger offsets for each layer (outer reveals first)
                const layerStartTimes = [0, 0.2, 0.4];

                // Animate each layer
                layers.forEach((layer, index) => {
                    const htmlLayer = layer as HTMLElement;
                    const startTime = layerStartTimes[index] || 0;

                    tl.fromTo(htmlLayer,
                        { opacity: 0, scale: 0.5 },
                        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
                        startTime
                    );
                });

                // Scaler image animation: starts large, shrinks to fit grid cell
                if (scalerImg) {
                    tl.fromTo(scalerImg,
                        { scale: 2.5 },
                        { scale: 1, duration: 0.5, ease: 'power2.inOut' },
                        0
                    );
                }
            }, container);
        }, 350);

        // Cleanup on unmount — clear timer and revert GSAP context if it was created
        return () => {
            clearTimeout(initTimer);
            ctx?.revert();
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
                            {LAYER_1_IMAGES.map((src) => (
                                <div key={src}>
                                    <Image
                                        src={src}
                                        alt=""
                                        className={styles.gridImage}
                                        width={768}
                                        height={1376}
                                        sizes="(max-width: 900px) 33vw, 16vw"
                                        decoding="async"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Layer 2: Midground */}
                        <div className={styles.layer}>
                            {LAYER_2_IMAGES.map((src) => (
                                <div key={src}>
                                    <Image
                                        src={src}
                                        alt=""
                                        className={styles.gridImage}
                                        width={768}
                                        height={1376}
                                        sizes="(max-width: 900px) 33vw, 16vw"
                                        decoding="async"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Layer 3: Foreground */}
                        <div className={styles.layer}>
                            {LAYER_3_IMAGES.map((src) => (
                                <div key={src}>
                                    <Image
                                        src={src}
                                        alt=""
                                        className={styles.gridImage}
                                        width={768}
                                        height={1376}
                                        sizes="(max-width: 900px) 33vw, 16vw"
                                        decoding="async"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Scaler - Center Hero */}
                        <div className={styles.scaler}>
                            <Image
                                src={SCALER_IMAGE}
                                alt="AEROFREN — Κεντρικό προϊόν"
                                className={styles.scalerImage}
                                width={768}
                                height={1376}
                                sizes="(max-width: 900px) 33vw, 20vw"
                                decoding="async"
                                priority
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
                    45+ χρόνια εμπειρίας στην υποστήριξη<br />
                    της ελληνικής βιομηχανίας.
                </p>
            </div>
        </div>
    );
}
