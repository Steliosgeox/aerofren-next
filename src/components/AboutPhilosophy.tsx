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
                        <span className={styles.titleLarge}>Τεχνική<br />Αριστεία.</span>
                    </div>
                </header>

                <section className={`${styles.scrollSection} ${styles.s1}`}>
                    <p className={styles.focusText}>Δεν προμηθεύουμε απλώς εξαρτήματα. Παραδίδουμε ακρίβεια.</p>
                    <p className={styles.description}>Από το 1990, η AEROFREN είναι ο αξιόπιστος B2B συνεργάτης για επαγγελματίες που απαιτούν τελειότητα στα πνευματικά και υδραυλικά εξαρτήματα.</p>
                </section>

                <section className={`${styles.scrollSection} ${styles.s2}`}>
                    <p className={styles.focusText}>Εξαρτήματα που αντέχουν δεκαετίες λειτουργίας.</p>
                    <p className={styles.description}>Premium ρακόρ ορείχαλκου. Βαλβίδες βιομηχανικών προδιαγραφών. Πιστοποιημένοι σωλήνες. Επιλέγουμε υλικά σχεδιασμένα να αποδίδουν υπό πίεση, χρόνο με τον χρόνο.</p>
                </section>

                <section className={`${styles.scrollSection} ${styles.s3}`}>
                    <p className={styles.focusText}>Συστηματική προσέγγιση. Απρόσκοπτη ενσωμάτωση.</p>
                    <p className={styles.description}>Από πνευματικούς κυλίνδρους έως ολοκληρωμένα συστήματα επεξεργασίας αέρα, ο κατάλογός μας είναι σχεδιασμένος για άψογη συνεργασία, μειώνοντας την πολυπλοκότητα στις εγκαταστάσεις σας.</p>
                </section>

                <section className={`${styles.scrollSection} ${styles.s4}`}>
                    <p className={styles.focusText}>Προϊόντα που δουλεύουν αθόρυβα στο παρασκήνιο.</p>
                    <p className={styles.description}>Τα καλύτερα εξαρτήματα είναι εκείνα που ξεχνάς ότι υπάρχουν. Τα ρακόρ και οι βαλβίδες μας λειτουργούν με απόλυτη αξιοπιστία, κρατώντας τα συστήματά σας σε συνεχή λειτουργία.</p>
                </section>

                <section className={`${styles.scrollSection} ${styles.s5}`}>
                    <p className={styles.focusText}>Η τεχνογνωσία είναι ο κινητήριος μοχλός.</p>
                    <p className={styles.description}>35+ χρόνια τεχνικής γνώσης στη διάθεσή σας. Δεν πουλάμε απλώς προϊόντα — προσφέρουμε λύσεις, καθοδήγηση και υποστήριξη που κάνουν τη διαφορά.</p>
                </section>

                <section className={`${styles.scrollSection} ${styles.s6}`}>
                    <p className={styles.focusText}>Φτιαγμένα για επαγγελματίες. Από επαγγελματίες.</p>
                    <p className={styles.description}>Κάθε εγκαταστάτης, μηχανικός και βιομηχανικός πελάτης που εξυπηρετούμε γίνεται συνεργάτης. Η επιτυχία σας είναι το μέτρο της ποιότητάς μας.</p>
                </section>

                <div className={styles.closingSection}>
                    <div className={styles.closer}>
                        <strong>Ας χτίσουμε κάτι μαζί.</strong>
                        info@aerofren.gr<br />
                        Μοσχάτο, Αθήνα<br />
                        +30 210 3461645
                    </div>
                </div>
            </div>
        </div>
    );
}
