'use client';

import styles from './AboutPhilosophy.module.css';

/**
 * AboutPhilosophy Component
 * 
 * 1:1 EXACT replica of MÅNE Studio scroll-driven animation
 * Adapted for AEROFREN with theme compliance
 * 
 * STRUCTURE: Matches original HTML exactly
 * - Mobile Progress Widget
 * - Sticky Visual (position: fixed, right panel)
 *   - Desktop Progress
 *   - 6 Shape Containers linked to view-timeline
 * - Content (left panel)
 *   - Header with brand name and title
 *   - 6 Scroll Sections with focus text + description
 *   - Closing Section
 */
export default function AboutPhilosophy() {
    return (
        <div className={styles.wrap}>
            {/* Mobile Progress Widget */}
            <div className={styles.mobileProgress}>
                <svg viewBox="0 0 100 100">
                    <circle className={styles.trackCircle} cx="50" cy="50" r="40" />
                    <circle className={styles.progressCircle} cx="50" cy="50" r="40" pathLength={1} />
                </svg>
            </div>

            {/* Visuals Container */}
            <div className={styles.stickyVisual}>
                <div className={styles.desktopProgress}></div>

                <div className={`${styles.shapeContainer} ${styles.shape1}`}>
                    <div className={styles.circleOutline}></div>
                </div>

                <div className={`${styles.shapeContainer} ${styles.shape2}`}>
                    <div className={styles.stoneBlock}></div>
                </div>

                <div className={`${styles.shapeContainer} ${styles.shape3}`}>
                    <div className={styles.gridLines}>
                        <div className={styles.gridBox}></div>
                        <div className={styles.gridBox}></div>
                        <div className={styles.gridBox}></div>
                        <div className={styles.gridBox}></div>
                    </div>
                </div>

                <div className={`${styles.shapeContainer} ${styles.shape4}`}>
                    <div className={styles.balance}>
                        <div className={`${styles.bCircle} ${styles.b1}`}></div>
                        <div className={`${styles.bCircle} ${styles.b2}`}></div>
                    </div>
                </div>

                <div className={`${styles.shapeContainer} ${styles.shape5}`}>
                    <div className={styles.lightOrb}></div>
                </div>

                <div className={`${styles.shapeContainer} ${styles.shape6}`}>
                    <div className={styles.endLine}></div>
                </div>
            </div>

            {/* Scroll Content */}
            <div className={styles.content}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.brandName}>AEROFREN</h1>
                        <span className={styles.titleLarge}>Engineering<br />Excellence.</span>
                    </div>
                </header>

                <section className={`${styles.scrollSection} ${styles.s1}`}>
                    <p className={styles.focusText}>We don't just supply parts. We deliver precision.</p>
                    <p className={styles.description}>Since 1990, AEROFREN has been the trusted B2B partner for professionals who demand nothing less than perfection in pneumatic and hydraulic components.</p>
                </section>

                <section className={`${styles.scrollSection} ${styles.s2}`}>
                    <p className={styles.focusText}>Components that endure decades of service.</p>
                    <p className={styles.description}>Premium brass fittings. Industrial-grade valves. Certified hoses. We source materials engineered to perform under pressure, year after year.</p>
                </section>

                <section className={`${styles.scrollSection} ${styles.s3}`}>
                    <p className={styles.focusText}>Systematic approach. Seamless integration.</p>
                    <p className={styles.description}>From pneumatic cylinders to complete air treatment systems, our catalog is designed to work together flawlessly, reducing complexity in your installations.</p>
                </section>

                <section className={`${styles.scrollSection} ${styles.s4}`}>
                    <p className={styles.focusText}>Products that work silently in the background.</p>
                    <p className={styles.description}>The best components are the ones you forget about. Our fittings and valves operate with quiet confidence, keeping your systems running without interruption.</p>
                </section>

                <section className={`${styles.scrollSection} ${styles.s5}`}>
                    <p className={styles.focusText}>Expertise as the driving force.</p>
                    <p className={styles.description}>35+ years of technical knowledge at your service. We don't just sell products—we provide solutions, guidance, and support that make a difference.</p>
                </section>

                <section className={`${styles.scrollSection} ${styles.s6}`}>
                    <p className={styles.focusText}>Built for professionals. By professionals.</p>
                    <p className={styles.description}>Every installer, engineer, and industrial client we serve becomes a partner. Your success is the measure of our quality.</p>
                </section>

                <div className={styles.closingSection}>
                    <div className={styles.closer}>
                        <strong>Let's build something together.</strong>
                        info@aerofren.gr<br />
                        Moschato, Athens, Greece<br />
                        +30 210 XXX XXXX
                    </div>
                </div>
            </div>
        </div>
    );
}
