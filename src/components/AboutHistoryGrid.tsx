'use client';

/**
 * AboutHistoryGrid  (complete redesign — "Industrial Thread" / Deep Navy Noir)
 *
 * TrickyKnot-style scrollytelling:
 *   — CinematicBackgroundLine SVG sits behind all content (z-index 1)
 *   — Sections alternate text alignment LEFT ↔ RIGHT, opposite the SVG wave
 *   — Content sections are z-index 2 (above the SVG)
 *   — GSAP ScrollTrigger drives all text reveals (native scroll — no Lenis on /about)
 *
 * Preserved content (from original AboutHistoryGrid + AboutPhilosophy):
 *   — All four history sections
 *   — Philosophy quote ("Δεν προμηθεύουμε απλώς εξαρτήματα. Παραδίδουμε ακρίβεια.")
 *   — Tribute to founder
 *   — Contact info (Μοσχάτο, phone, email)
 */

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap, useGSAP } from '@/lib/gsap';
import CinematicBackgroundLine from './CinematicBackgroundLine';

// ── Product images used in the Location section ──────────────────────────────
const PRODUCT_IMAGES = [
  { src: '/images/scroll-new/l1_cylinder_pneu_1768534522489.png',    alt: 'Πνευματικός Κύλινδρος' },
  { src: '/images/scroll-new/l1_filter_regulator_1768534537093.png', alt: 'Φίλτρο Ρυθμιστής' },
  { src: '/images/scroll-new/l1_solenoid_valve_1768534552843.png',   alt: 'Ηλεκτροβαλβίδα' },
  { src: '/images/scroll-new/l2_push_in_fittings_1768534635577.png', alt: 'Push-in Ρακόρ' },
  { src: '/images/scroll-new/l2_brass_fittings_1768534649826.png',   alt: 'Ρακόρ Ορείχαλκου' },
  { src: '/images/scroll-new/l2_digital_sensor_1768534663754.png',   alt: 'Ψηφιακός Αισθητήρας' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────

export default function AboutHistoryGrid() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || typeof window === 'undefined') return;

      // Respect reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // ── Text section reveals ───────────────────────────────────────────────
      root.querySelectorAll<HTMLElement>('.ab-reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 64 },
          {
            opacity: 1,
            y: 0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              end: 'top 52%',
              scrub: 1.2,
            },
          }
        );
      });

      // ── Hero ambient year number — subtle upward parallax ─────────────────
      const yearEl = root.querySelector<HTMLElement>('.ab-hero-year');
      const heroEl = root.querySelector<HTMLElement>('.ab-hero');
      if (yearEl && heroEl) {
        gsap.to(yearEl, {
          y: -200,
          ease: 'none',
          scrollTrigger: {
            trigger: heroEl,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // ── Product cards staggered float-in ──────────────────────────────────
      const cards = root.querySelectorAll<HTMLElement>('.ab-product-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, scale: 0.82, y: 40 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            ease: 'power2.out',
            stagger: 0.08,
            scrollTrigger: {
              trigger: cards[0].parentElement,
              start: 'top 80%',
              end: 'top 40%',
              scrub: 1,
            },
          }
        );
      }
    },
    { scope: rootRef }
  );

  return (
    <div className="ab-root" ref={rootRef}>
      {/* ── CINEMATIC SVG THREAD (z-index 1, behind content) ─────────────── */}
      <CinematicBackgroundLine />

      {/* ════════════════════════════════════════════════════════════════════
          HERO  ─  text LEFT, SVG line swings RIGHT at y≈900-1800
          ════════════════════════════════════════════════════════════════════ */}
      <section className="ab-hero ab-section-hero">
        {/* Ghost year — massive ambient number */}
        <div className="ab-hero-year" aria-hidden="true">1980</div>

        <div className="ab-hero-content">
          <span className="ab-eyebrow ab-reveal">AEROFREN</span>
          <h1 className="ab-h1 ab-reveal">
            Η Ιστορία<br />
            <em>μας.</em>
          </h1>
          <p className="ab-hero-founders ab-reveal">
            Βασίλειο Κουτελίδης
            <span className="ab-dash" aria-hidden="true">—</span>
            Κατερίνα Κουτελίδου
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="ab-scroll-hint" aria-hidden="true">
          <span>scroll</span>
          <div className="ab-scroll-bar" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          01 / FOUNDER  ─  text LEFT, SVG line is on the right
          ════════════════════════════════════════════════════════════════════ */}
      <section className="ab-section ab-section--left">
        <div className="ab-text-block ab-reveal">
          <span className="ab-label">01 / Ιδρυτής</span>
          <h2 className="ab-h2">
            Μια ιστορία εξειδίκευσης<br />
            <span className="ab-gradient-text">από το 1980.</span>
          </h2>
          <p className="ab-body">
            Η διαδρομή της Aerofren ξεκίνησε το 1980 από τον αείμνηστο{' '}
            <strong>Βασίλειο Κουτελίδη</strong>, ο οποίος μετέφερε στην Ελλάδα
            την πολύτιμη τεχνογνωσία που απέκτησε στη Γερμανία πάνω στα
            συστήματα αερόφρενων φορτηγών — μια εξειδίκευση που χάρισε και το
            όνομα στην επιχείρηση.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          02 / EVOLUTION  ─  text RIGHT, SVG line swings LEFT (x≈180-240)
          ════════════════════════════════════════════════════════════════════ */}
      <section className="ab-section ab-section--right">
        <div className="ab-text-block ab-reveal">
          <span className="ab-label">02 / Εξέλιξη</span>
          <h2 className="ab-h2">
            Εξέλιξη &amp;<br />
            <span className="ab-gradient-text">Ανάπτυξη.</span>
          </h2>
          <p className="ab-body">
            Με την πάροδο των ετών, η Aerofren εξελίχθηκε δυναμικά,
            εντάσσοντας ένα ευρύ φάσμα προϊόντων πεπιεσμένου αέρα και
            προηγμένων συστημάτων επεξεργασίας νερού. Σήμερα, η επιχείρηση
            συνεχίζει την πορεία της υπό τη διεύθυνση της κόρης του ιδρυτή,{' '}
            <strong>Κατερίνας Κουτελίδου</strong>, πιστή στις αξίες ποιότητας
            και αξιοπιστίας.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          03 / LOCATION  ─  products LEFT + text RIGHT, SVG back on right
          ════════════════════════════════════════════════════════════════════ */}
      <section className="ab-location">
        {/* Product image grid */}
        <div className="ab-product-grid">
          {PRODUCT_IMAGES.map((img) => (
            <div key={img.src} className="ab-product-card">
              <Image
                src={img.src}
                alt={img.alt}
                width={280}
                height={280}
                sizes="(max-width: 640px) 30vw, 140px"
              />
            </div>
          ))}
        </div>

        {/* Section text */}
        <div className="ab-text-block ab-reveal">
          <span className="ab-label">03 / Τοποθεσία</span>
          <h2 className="ab-h2">
            Νέος χώρος,<br />
            <span className="ab-gradient-text">ίδιο μεράκι.</span>
          </h2>
          <p className="ab-body">
            Στον νέο, καλαίσθητο χώρο μας στο{' '}
            <strong>Μοσχάτο</strong> (Χρυσοστόμου Σμύρνης 26), προσφέρουμε
            εξειδικευμένες λύσεις με προϊόντα κορυφαίων πιστοποιημένων οίκων
            του εξωτερικού, διαθέσιμα άμεσα ή κατόπιν παραγγελίας.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          PHILOSOPHY QUOTE  ─  full-width centered pull quote
          ════════════════════════════════════════════════════════════════════ */}
      <section className="ab-philosophy">
        <blockquote className="ab-quote ab-reveal">
          <span className="ab-qmark ab-qmark--open" aria-hidden="true">&ldquo;</span>
          Δεν προμηθεύουμε απλώς εξαρτήματα.
          <br />
          <em>Παραδίδουμε ακρίβεια.</em>
          <span className="ab-qmark ab-qmark--close" aria-hidden="true">&rdquo;</span>
        </blockquote>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          04 / TRIBUTE  ─  text LEFT, SVG swings right again
          ════════════════════════════════════════════════════════════════════ */}
      <section className="ab-section ab-section--left">
        <div className="ab-text-block ab-reveal">
          <span className="ab-label">04 / Φόρος Τιμής</span>
          <h2 className="ab-h2">
            Αφιερωμένο στον<br />
            <span className="ab-gradient-text">ιδρυτή μας.</span>
          </h2>
          <p className="ab-body">
            Λειτουργούμε με το ίδιο μεράκι και την αγάπη που μας κληροδότησε
            ο ιδρυτής μας. Το κείμενο αυτό αποτελεί έναν ελάχιστο φόρο τιμής
            στη μνήμη και το έργο του{' '}
            <strong>Βασιλείου Κουτελίδη</strong> — η καθημερινή μας
            προσπάθεια είναι αφιερωμένη σε εκείνον.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CONTACT  ─  centered closing
          ════════════════════════════════════════════════════════════════════ */}
      <section className="ab-contact">
        <div className="ab-contact-inner ab-reveal">
          <span className="ab-label">Επικοινωνία</span>
          <h2 className="ab-h2 ab-contact-h2">Ας συνεργαστούμε.</h2>

          <div className="ab-contact-grid">
            <div className="ab-contact-item">
              <span className="ab-contact-key">Διεύθυνση</span>
              <span>Χρυσοστόμου Σμύρνης 26<br />Μοσχάτο, Αθήνα</span>
            </div>
            <div className="ab-contact-item">
              <span className="ab-contact-key">Τηλέφωνο</span>
              <a href="tel:+302103461645">+30 210 3461645</a>
            </div>
            <div className="ab-contact-item">
              <span className="ab-contact-key">Email</span>
              <a href="mailto:info@aerofren.gr">info@aerofren.gr</a>
            </div>
          </div>

          <div className="ab-contact-ctas">
            <Link href="/contact" className="ab-btn-primary">
              Φόρμα Επικοινωνίας
            </Link>
            <a href="tel:+302103461645" className="ab-btn-ghost">
              📞 210 3461645
            </a>
          </div>
        </div>
      </section>

      {/* ── Scoped styles ─────────────────────────────────────────────────── */}
      <style jsx>{`
        /* ═══════════════════════════════════════════
           ROOT WRAPPER
           Must be position: relative so the absolute
           CinematicBackgroundLine fills it correctly
           ═══════════════════════════════════════════ */
        .ab-root {
          position: relative;
          overflow: hidden;
          background: var(--theme-bg-solid);
        }

        /* ═══════════════════════════════════════════
           HERO
           ═══════════════════════════════════════════ */
        .ab-hero {
          position: relative;
          z-index: 2;
          min-height: 100svh;
          display: flex;
          align-items: center;
          padding: clamp(100px, 12vw, 180px) 8vw clamp(80px, 10vw, 140px);
          overflow: hidden;
        }

        /* Ghost year — massive ambient number, right-anchored */
        .ab-hero-year {
          position: absolute;
          right: -1%;
          top: 50%;
          transform: translateY(-50%);
          font-size: clamp(120px, 18vw, 320px);
          font-weight: 900;
          color: var(--theme-text);
          opacity: 0.028;
          line-height: 1;
          letter-spacing: -0.06em;
          user-select: none;
          pointer-events: none;
          will-change: transform;
          z-index: 0;
        }

        .ab-hero-content {
          position: relative;
          z-index: 2;
          max-width: 660px;
        }

        /* Eyebrow / brand label */
        .ab-eyebrow {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: var(--theme-accent);
          margin-bottom: 28px;
          padding: 7px 14px;
          border: 1px solid color-mix(in srgb, var(--theme-accent) 28%, transparent);
          border-radius: 4px;
          background: color-mix(in srgb, var(--theme-accent) 7%, transparent);
        }

        /* H1 */
        .ab-h1 {
          font-size: clamp(3.2rem, 7vw, 7.2rem);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.04em;
          color: var(--theme-text);
          margin: 0 0 28px 0;
        }

        .ab-h1 em {
          font-style: normal;
          background: linear-gradient(
            135deg,
            var(--theme-accent) 0%,
            color-mix(in srgb, var(--theme-accent) 65%, #fff 35%) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Founders' names */
        .ab-hero-founders {
          font-size: clamp(0.8rem, 1.3vw, 0.95rem);
          color: var(--theme-text-muted);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .ab-dash {
          display: inline-block;
          margin: 0 14px;
          color: var(--theme-accent);
          opacity: 0.55;
        }

        /* Scroll hint — bottom-left of hero */
        .ab-scroll-hint {
          position: absolute;
          bottom: 44px;
          left: 8vw;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          z-index: 2;
        }

        .ab-scroll-hint span {
          font-size: 9px;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: var(--theme-text-muted);
          opacity: 0.55;
        }

        .ab-scroll-bar {
          width: 1px;
          height: 52px;
          background: linear-gradient(to bottom, var(--theme-accent), transparent);
          animation: ab-scroll-pulse 2.2s ease-in-out infinite;
        }

        @keyframes ab-scroll-pulse {
          0%, 100% { opacity: 0.25; transform: scaleY(1); }
          50%       { opacity: 1;    transform: scaleY(1.08); }
        }

        /* ═══════════════════════════════════════════
           CONTENT SECTIONS  (LEFT / RIGHT layout)
           ═══════════════════════════════════════════ */
        .ab-section {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          min-height: 100svh;
          padding: clamp(80px, 10vw, 160px) 8vw;
        }

        .ab-section--left  { justify-content: flex-start; }
        .ab-section--right { justify-content: flex-end;   }

        .ab-text-block {
          max-width: min(500px, 90vw);
        }

        /* Section micro-label */
        .ab-label {
          display: block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: var(--theme-accent);
          opacity: 0.75;
          margin-bottom: 20px;
        }

        /* H2 */
        .ab-h2 {
          font-size: clamp(1.9rem, 3.2vw, 3.1rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: var(--theme-text);
          margin: 0 0 24px 0;
        }

        /* Gradient accent text inside headings */
        .ab-gradient-text {
          background: linear-gradient(
            135deg,
            var(--theme-accent) 0%,
            color-mix(in srgb, var(--theme-accent) 65%, #fff 35%) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Body copy */
        .ab-body {
          font-size: clamp(0.92rem, 1.25vw, 1.04rem);
          line-height: 1.88;
          color: var(--theme-text-muted);
          max-width: 56ch;
        }

        .ab-body strong {
          color: var(--theme-text);
          font-weight: 600;
        }

        /* ═══════════════════════════════════════════
           LOCATION SECTION  (products + text grid)
           ═══════════════════════════════════════════ */
        .ab-location {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(40px, 6vw, 100px);
          align-items: center;
          min-height: 100svh;
          padding: clamp(80px, 10vw, 160px) 8vw;
        }

        /* 3-col product grid */
        .ab-product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .ab-product-card {
          aspect-ratio: 1;
          background: color-mix(in srgb, var(--theme-accent) 5%, var(--theme-bg-solid) 95%);
          border: 1px solid color-mix(in srgb, var(--theme-accent) 14%, transparent);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px;
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }

        .ab-product-card:hover {
          border-color: color-mix(in srgb, var(--theme-accent) 32%, transparent);
          background: color-mix(in srgb, var(--theme-accent) 10%, var(--theme-bg-solid) 90%);
          transform: translateY(-4px);
        }

        .ab-product-card img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(
            0 6px 20px color-mix(in srgb, var(--theme-accent) 18%, transparent)
          );
        }

        /* ═══════════════════════════════════════════
           PHILOSOPHY  (large centered pull-quote)
           ═══════════════════════════════════════════ */
        .ab-philosophy {
          position: relative;
          z-index: 2;
          min-height: 80svh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(80px, 10vw, 140px) 8vw;
          text-align: center;
        }

        .ab-quote {
          position: relative;
          font-size: clamp(1.7rem, 3.3vw, 3.6rem);
          font-weight: 700;
          line-height: 1.35;
          letter-spacing: -0.02em;
          color: var(--theme-text);
          max-width: 880px;
          margin: 0;
        }

        .ab-quote em {
          font-style: normal;
          background: linear-gradient(
            135deg,
            var(--theme-accent) 0%,
            color-mix(in srgb, var(--theme-accent) 65%, #fff 35%) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Decorative quote marks */
        .ab-qmark {
          position: absolute;
          font-size: clamp(6rem, 12vw, 13rem);
          line-height: 1;
          color: var(--theme-accent);
          opacity: 0.06;
          font-family: Georgia, 'Times New Roman', serif;
          pointer-events: none;
          user-select: none;
        }

        .ab-qmark--open  { top: -2.5rem;  left: -1.5rem; }
        .ab-qmark--close { bottom: -5.5rem; right: -1.5rem; top: auto; }

        /* ═══════════════════════════════════════════
           CONTACT  (centered closing)
           ═══════════════════════════════════════════ */
        .ab-contact {
          position: relative;
          z-index: 2;
          min-height: 80svh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(80px, 10vw, 140px) 8vw;
        }

        .ab-contact-inner {
          max-width: 680px;
          width: 100%;
          text-align: center;
        }

        .ab-contact-h2 {
          font-size: clamp(2.2rem, 3.8vw, 4rem);
          margin-bottom: 56px;
        }

        .ab-contact-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin-bottom: 44px;
          text-align: center;
        }

        .ab-contact-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ab-contact-key {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: var(--theme-accent);
          opacity: 0.75;
        }

        .ab-contact-item span:not(.ab-contact-key),
        .ab-contact-item a {
          font-size: 0.92rem;
          line-height: 1.65;
          color: var(--theme-text-muted);
          text-decoration: none;
          transition: color 0.22s ease;
        }

        .ab-contact-item a:hover { color: var(--theme-accent); }

        .ab-contact-ctas {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Primary CTA */
        .ab-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          background: var(--theme-accent);
          color: #000;
          font-size: 13px;
          font-weight: 700;
          border-radius: 9px;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }

        .ab-btn-primary:hover {
          background: var(--theme-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 28px color-mix(in srgb, var(--theme-accent) 36%, transparent);
        }

        /* Ghost CTA */
        .ab-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          background: transparent;
          color: var(--theme-text);
          font-size: 13px;
          font-weight: 600;
          border-radius: 9px;
          border: 1px solid color-mix(in srgb, var(--theme-text) 18%, transparent);
          text-decoration: none;
          transition: background 0.25s ease, border-color 0.25s ease;
        }

        .ab-btn-ghost:hover {
          background: color-mix(in srgb, var(--theme-text) 7%, transparent);
          border-color: color-mix(in srgb, var(--theme-text) 38%, transparent);
        }

        /* ═══════════════════════════════════════════
           REVEAL animation base state
           (GSAP overrides these on scroll)
           ═══════════════════════════════════════════ */
        .ab-reveal {
          will-change: transform, opacity;
        }

        /* ═══════════════════════════════════════════
           RESPONSIVE
           ═══════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .ab-location {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .ab-section--right { justify-content: flex-start; }

          .ab-contact-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            text-align: left;
          }

          .ab-contact-ctas { justify-content: flex-start; }
        }

        @media (max-width: 640px) {
          .ab-hero { padding: 90px 6vw 72px; }

          .ab-section {
            padding: 80px 6vw;
            min-height: auto;
          }

          .ab-location { padding: 80px 6vw; }

          .ab-philosophy {
            padding: 72px 6vw;
            min-height: 60svh;
          }

          .ab-contact { padding: 72px 6vw; }

          .ab-scroll-hint { display: none; }

          .ab-qmark { font-size: 5rem; }

          .ab-contact-ctas { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
