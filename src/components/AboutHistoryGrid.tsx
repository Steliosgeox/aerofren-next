'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap/client';
import styles from './AboutHistoryGrid.module.css';

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

// Content sections with Greek text
const CONTENT_SECTIONS = [
    {
        id: 'founder',
        focusText: 'Aerofren: Μια Ιστορία Εξειδίκευσης και Εμπιστοσύνης από το 1980',
        description: 'Η διαδρομή της Aerofren ξεκίνησε το 1980 από τον αείμνηστο Βασίλειο Κουτελίδη, ο οποίος μετέφερε στην Ελλάδα την πολύτιμη τεχνογνωσία που απέκτησε στη Γερμανία πάνω στα συστήματα αερόφρενων φορτηγών – μια εξειδίκευση που χάρισε και το όνομα στην επιχείρηση.',
    },
    {
        id: 'evolution',
        focusText: 'Εξέλιξη και Ανάπτυξη',
        description: 'Με την πάροδο των ετών, η Aerofren εξελίχθηκε δυναμικά, εντάσσοντας στο δυναμικό της ένα ευρύ φάσμα προϊόντων πεπιεσμένου αέρα και προηγμένων συστημάτων επεξεργασίας νερού. Σήμερα, η επιχείρηση συνεχίζει την επιτυχημένη πορεία της υπό τη διεύθυνση της κόρης του, Κατερίνας Κουτελίδου, παραμένοντας πιστή στις αξίες της ποιότητας και της αξιοπιστίας.',
    },
    {
        id: 'location',
        focusText: 'Νέος χώρος, ίδιο μεράκι',
        description: 'Στον νέο, καλαίσθητο χώρο μας στο Μοσχάτο (Χρυσοστόμου Σμύρνης 26), προσφέρουμε εξειδικευμένες λύσεις με προϊόντα κορυφαίων πιστοποιημένων οίκων του εξωτερικού, διαθέσιμα άμεσα ή κατόπιν παραγγελίας.',
    },
    {
        id: 'tribute',
        focusText: 'Τιμή στον ιδρυτή',
        description: 'Λειτουργούμε με το ίδιο μεράκι και την αγάπη που μας κληροδότησε ο ιδρυτής μας, στον οποίο είναι αφιερωμένη η καθημερινή μας προσπάθεια. Το κείμενο αυτό αποτελεί έναν ελάχιστο φόρο τιμής στη μνήμη και το έργο του Βασιλείου Κουτελίδη.',
    },
];

/**
 * AboutHistoryGrid Component
 *
 * Premium scroll-driven grid animation for Aerofren About page.
 * Uses GSAP ScrollTrigger directly without SmoothScrollProvider.
 *
 * Features:
 * - Split layout: text left (50%), grid animation right (50% sticky)
 * - 3 image layers + 1 scaler hero image
 * - Each text section triggers a layer reveal animation
 * - Theme-aware (dark/dim/light)
 * - Reduced motion support
 */
export default function AboutHistoryGrid() {
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const progressCircleRef = useRef<SVGCircleElement>(null);

    useEffect(() => {
        // Guard: SSR check
        if (typeof window === 'undefined') return;

        // Guard: Reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            console.log('[AboutHistoryGrid] Reduced motion preference detected - skipping animations');
            return;
        }

        const container = containerRef.current;
        const progressLine = progressRef.current;
        const progressCircle = progressCircleRef.current;

        if (!container) {
            console.warn('[AboutHistoryGrid] Container not found');
            return;
        }

        const layers = container.querySelectorAll(`.${styles.layer}`);
        const scalerImg = container.querySelector(`.${styles.scalerImage}`);
        const sections = container.querySelectorAll(`.${styles.scrollSection}`);
        const focusTexts = container.querySelectorAll(`.${styles.focusText}`);
        const descriptions = container.querySelectorAll(`.${styles.description}`);

        if (layers.length === 0) {
            console.warn('[AboutHistoryGrid] No layers found');
            return;
        }

        // Create GSAP context for proper cleanup
        const ctx = gsap.context(() => {
            // ============================================
            // Progress Indicator Animation
            // ============================================
            if (progressLine) {
                gsap.to(progressLine, {
                    scaleY: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: container,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 0.3,
                    },
                });
            }

            if (progressCircle) {
                gsap.to(progressCircle, {
                    strokeDashoffset: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: container,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 0.3,
                    },
                });
            }

            // ============================================
            // Layer Reveal Animations
            // ============================================
            const layerConfigs = [
                { layer: layers[0], sectionIndex: 0 }, // Layer 1 reveals on section 1
                { layer: layers[1], sectionIndex: 1 }, // Layer 2 reveals on section 2
                { layer: layers[2], sectionIndex: 2 }, // Layer 3 reveals on section 3
            ];

            layerConfigs.forEach((config) => {
                if (!config.layer || !sections[config.sectionIndex]) return;

                const section = sections[config.sectionIndex];

                gsap.fromTo(
                    config.layer,
                    {
                        opacity: 0,
                        scale: 0.5,
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 80%',
                            end: 'top 40%',
                            scrub: 1,
                        },
                    }
                );
            });

            // ============================================
            // Scaler Image Animation (The Floating Package)
            // ============================================
            if (scalerImg) {
                // Entrance with scale and slight rotation
                gsap.fromTo(
                    scalerImg,
                    {
                        scale: 1.8,
                        rotation: -5,
                        y: 50,
                    },
                    {
                        scale: 1,
                        rotation: 0,
                        y: 0,
                        duration: 1.2,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: sections[1] || sections[0],
                            start: 'top 80%',
                            end: 'top 30%',
                            scrub: 1.5,
                        },
                    }
                );

                // Continuous parallax floating effect
                gsap.to(scalerImg, {
                    y: -120,
                    rotation: 10,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: container,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 1.5,
                    },
                });
            }

            // ============================================
            // Text Focus Animations
            // ============================================
            focusTexts.forEach((text) => {
                gsap.fromTo(
                    text,
                    {
                        opacity: 0,
                        scale: 0.9,
                        y: 40,
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: text,
                            start: 'top 90%',
                            end: 'top 60%',
                            scrub: 1,
                        },
                    }
                );
            });

            descriptions.forEach((desc) => {
                gsap.fromTo(
                    desc,
                    {
                        opacity: 0,
                        y: 30,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: desc,
                            start: 'top 90%',
                            end: 'top 60%',
                            scrub: 1,
                        },
                    }
                );
            });

            console.log('[AboutHistoryGrid] GSAP animations initialized successfully');
        }, container);

        // Cleanup on unmount
        return () => {
            ctx.revert();
        };
    }, []);

    return (
        <div className={styles.wrap} ref={containerRef}>
            {/* Mobile Progress Widget */}
            <div className={styles.mobileProgress}>
                <svg viewBox="0 0 100 100">
                    <circle className={styles.trackCircle} cx="50" cy="50" r="40" />
                    <circle
                        ref={progressCircleRef}
                        className={styles.progressCircle}
                        cx="50"
                        cy="50"
                        r="40"
                        pathLength={1}
                    />
                </svg>
            </div>

            {/* Visuals Container - Sticky Right Panel */}
            <div className={styles.stickyVisual}>
                <div className={styles.desktopProgress} ref={progressRef}></div>

                {/* Grid of images */}
                <div className={styles.grid}>
                    {/* Layer 1: Background/Outer */}
                    <div className={styles.layer}>
                        {LAYER_1_IMAGES.map((src) => (
                            <div key={src}>
                                <Image
                                    src={src}
                                    alt=""
                                    width={640}
                                    height={640}
                                    sizes="(max-width: 1024px) 33vw, 16vw"
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
                                    width={640}
                                    height={640}
                                    sizes="(max-width: 1024px) 33vw, 16vw"
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
                                    width={640}
                                    height={640}
                                    sizes="(max-width: 1024px) 33vw, 16vw"
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
                            width={900}
                            height={1125}
                            sizes="(max-width: 1024px) 33vw, 20vw"
                        />
                    </div>
                </div>
            </div>

            {/* Scroll Content - Left Panel */}
            <div className={styles.content}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.brandName}>AEROFREN</h1>
                        <span className={styles.titleLarge}>Ιστορία.</span>
                    </div>
                </header>

                {CONTENT_SECTIONS.map((section) => (
                    <section key={section.id} className={styles.scrollSection}>
                        <p className={styles.focusText}>{section.focusText}</p>
                        <p className={styles.description}>{section.description}</p>
                    </section>
                ))}

                <div className={styles.closingSection}>
                    <div className={styles.closer}>
                        <strong>Στοιχεία Επικοινωνίας</strong>
                        <div className={styles.contactInfo}>
                            <p>Χρυσοστόμου Σμύρνης 26, Μοσχάτο</p>
                            <p>Εξειδίκευση: Επεξεργασία Νερού & Πεπιεσμένος Αέρας</p>
                            <p>
                                <a href="tel:+302103461645">+30 210 3461645</a>
                            </p>
                            <p>
                                <a href="mailto:info@aerofren.gr">info@aerofren.gr</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
