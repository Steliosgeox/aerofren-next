'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { gsap, useGSAP, EASE, ScrollTrigger } from '@/lib/gsap';
import CinematicBackgroundLine from './CinematicBackgroundLine';
import VideoBackground, { VideoBackgroundHandle } from './VideoBackground';

/* ============================================================
   CONTENT DATA
   All Greek text preserved from both AboutHistoryGrid and
   AboutPhilosophy — zero content loss.
   ============================================================ */

const HISTORY_SECTIONS = [
  {
    id: 'founding',
    sectionNum: '01',
    year: '1980',
    tag: 'Ίδρυση',
    heading: 'Μια Πορεία\nΕξειδίκευσης\nκαι Αξιοπιστίας',
    body: 'Η διαδρομή της Aerofren ξεκίνησε το 1980 από τον ιδρυτή της Βασίλειο Κουτελίδη, μεταφέροντας στην Ελλάδα την πολύτιμη τεχνογνωσία που εξέλισσε στη Γερμανία πάνω στα συστήματα αερόφρενων επαγγελματικών οχημάτων.',
    align: 'left',
  },
  {
    id: 'evolution',
    sectionNum: '02',
    year: '2000+',
    tag: 'Εξέλιξη',
    heading: 'Σταθερή\nΑνάπτυξη',
    body: 'Με την πάροδο των ετών, η Aerofren εξελίχθηκε σε έναν ολοκληρωμένο B2B προμηθευτή, εντάσσοντας στο δυναμικό της ένα ευρύ φάσμα προϊόντων πεπιεσμένου αέρα. Σήμερα, η επιχείρηση συνεχίζει την επιτυχημένη πορεία της υπό τη διεύθυνση της Κατερίνας Κουτελίδου.',
    align: 'right',
  },
  {
    id: 'location',
    sectionNum: '03',
    year: 'Σήμερα',
    tag: 'Χώρος',
    heading: 'Σύγχρονες\nΕγκαταστάσεις',
    body: 'Στον νέο, πλήρως ανανεωμένο χώρο μας στο Μοσχάτο (Χρυσοστόμου Σμύρνης 26), προσφέρουμε εξειδικευμένες λύσεις με προϊόντα κορυφαίων πιστοποιημένων οίκων του εξωτερικού, επιτυγχάνοντας άμεση εξυπηρέτηση.',
    align: 'left',
  },
  {
    id: 'tribute',
    sectionNum: '04',
    year: 'Πάντα',
    tag: 'Αρχές',
    heading: 'Αμετάβλητες\nΑξίες',
    body: 'Λειτουργούμε με τον ίδιο επαγγελματισμό και τη συνέπεια που μας κληροδότησε ο ιδρυτής μας. Η δική του δέσμευση στην ποιότητα αποτελεί τον ακρογωνιαίο λίθο για την καθημερινή μας προσπάθεια.',
    align: 'right',
  },
] as const;

const PHILOSOPHY_SECTIONS = [
  {
    id: 'precision',
    sectionNum: '05',
    tag: 'Αποστολή',
    heading: 'Δεν εμπορευόμαστε\nαπλώς εξαρτήματα.',
    accent: 'Παρέχουμε σωστές λύσεις.',
    body: 'Από το 1980, η AEROFREN αποτελεί τον πλέον αξιόπιστο συνεργάτη για τους ελεύθερους επαγγελματίες και τη βιομηχανία στον τομέα των πνευματικών συστημάτων.',
    align: 'left',
  },
  {
    id: 'durability',
    sectionNum: '06',
    tag: 'Ποιότητα',
    heading: 'Εξαρτήματα με\nαντοχή στο χρόνο.',
    accent: 'Σταθερή απόδοση.',
    body: 'Υψηλής ποιότητας ρακόρ ορείχαλκου. Πιστοποιημένες βαλβίδες και σωληνώσεις. Υλικά κατασκευασμένα για να αποδίδουν άριστα κάτω από απαιτητικές συνθήκες εργασίας.',
    align: 'right',
  },
  {
    id: 'systematic',
    sectionNum: '07',
    tag: 'Εφαρμογή',
    heading: 'Συστηματική\nΠροσέγγιση.',
    accent: 'Εύκολη προσαρμογή.',
    body: 'Ο εκτενής κατάλογός μας είναι δομημένος με τέτοιο τρόπο ώστε να βρίσκετε άμεσα το κατάλληλο εξάρτημα, μειώνοντας την πολυπλοκότητα στην εγκατάσταση.',
    align: 'left',
  },
  {
    id: 'silent',
    sectionNum: '08',
    tag: 'Αξιοπιστία',
    heading: 'Λειτουργία\nχωρίς προβλήματα.',
    accent: 'Απόλυτη σιγουριά.',
    body: 'Η πραγματική ποιότητα φαίνεται στην απροβλημάτιστη λειτουργία. Τα εξαρτήματα που διαθέτουμε προσφέρουν ακριβώς αυτό: ξεγνοιασιά μετά την τοποθέτηση.',
    align: 'right',
  },
  {
    id: 'expertise',
    sectionNum: '09',
    tag: 'Τεχνογνωσία',
    heading: 'Με κινητήριο δύναμη\nτην εμπειρία.',
    accent: '40+ χρόνια στο πλευρό σας.',
    body: 'Δεν εκτελούμε απλώς παραγγελίες. Προσφέρουμε τεχνική καθοδήγηση και ουσιαστική υποστήριξη που κάνουν την πραγματική διαφορά στο τελικό αποτέλεσμα.',
    align: 'left',
  },
  {
    id: 'professionals',
    sectionNum: '10',
    tag: 'Συνεργασία',
    heading: 'Από επαγγελματίες,\nγια επαγγελματίες.',
    accent: 'Αμοιβαία εμπιστοσύνη.',
    body: 'Κάθε κατασκευαστής, μηχανικός και τεχνικός που μας εμπιστεύεται αντιμετωπίζεται ως σταθερός συνεργάτης. Η δική σας επιτυχία διασφαλίζει τη δική μας πορεία.',
    align: 'right',
  },
] as const;

/* ============================================================
   COMPONENT
   ============================================================ */

export default function AboutCinematicPage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoBgRef = useRef<VideoBackgroundHandle>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ----------------------------------------------------------
     GSAP SCROLL ANIMATIONS
     All reveals: text scrubs in as section enters viewport
     ---------------------------------------------------------- */
  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (prefersReducedMotion) return;

      /* ── HELPER: cinematic cascade per about-section ──────────── */
      const buildSectionTl = (section: Element) => {
        const tl = gsap.timeline({ paused: true });
        const num = section.querySelector<HTMLElement>('.about-section-num');
        const tag = section.querySelector<HTMLElement>('.about-tag');
        const heading = section.querySelector<HTMLElement>('.about-heading');
        const accent = section.querySelector<HTMLElement>('.about-accent');
        const body = section.querySelector<HTMLElement>('.about-body');

        /* 1. Ghost number — emerges from blur + tiny scale */
        if (num) tl.fromTo(num,
          { opacity: 0, scale: 0.5, filter: 'blur(24px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 2.0, ease: 'power4.out' },
          0
        );

        /* 2. Tag pill — skew-stamp (like a badge being pressed) */
        if (tag) tl.fromTo(tag,
          { opacity: 0, x: -18, skewX: -10 },
          { opacity: 1, x: 0, skewX: 0, duration: 0.7, ease: 'power3.out' },
          0.25
        );

        /* 3. Heading — clip-path blade wipe DOWN + blur-to-sharp */
        if (heading) tl.fromTo(heading,
          { opacity: 0, clipPath: 'inset(0% 0% 100% 0%)', filter: 'blur(14px)', y: 20 },
          { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)', y: 0, duration: 1.15, ease: 'power4.out' },
          0.35
        );

        /* 4. Accent line — horizontal left-to-right reveal */
        if (accent) tl.fromTo(accent,
          { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)', filter: 'blur(6px)' },
          { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' },
          0.7
        );

        /* 5. Body text — soft upward blur-fade */
        if (body) tl.fromTo(body,
          { opacity: 0, y: 22, filter: 'blur(5px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' },
          0.85
        );

        return tl;
      };

      /* ── SECTION REVEALS — triggers at 52% so effect is fully visible ── */
      gsap.utils.toArray<HTMLElement>('.about-section').forEach((section) => {
        const tl = buildSectionTl(section);
        ScrollTrigger.create({
          trigger: section,
          start: 'top 52%',
          onEnter: () => tl.play(),
          onLeave: () => tl.reverse(),
          onEnterBack: () => tl.play(),
          onLeaveBack: () => tl.reverse(),
        });
      });

      /* ── HERO ELEMENTS — blur-stagger on load ────────────────────────── */
      gsap.fromTo(
        '.about-hero-content > *',
        { opacity: 0, y: 60, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.5,
          stagger: 0.14,
          ease: EASE.smooth,
          delay: 0.3,
        }
      );

      /* ── DIVIDER ─────────────────────────────────────────────────────── */
      const dividerTl = gsap.timeline({ paused: true })
        .fromTo(
          '.about-divider-inner',
          { opacity: 0, y: 50, scale: 0.92, filter: 'blur(12px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.6, ease: 'power4.out' }
        );
      ScrollTrigger.create({
        trigger: '.about-divider',
        start: 'top 55%',
        onEnter: () => dividerTl.play(),
        onLeave: () => dividerTl.reverse(),
        onEnterBack: () => dividerTl.play(),
        onLeaveBack: () => dividerTl.reverse(),
      });
      /* Canvas scrub — submerge (above → underwater) */
      const submergeProgress = { v: 0 };
      gsap.to(submergeProgress, {
        v: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#dive-trigger',
          start: 'top 65%',
          end: '+=700',
          scrub: 0.4,
          onEnter: () => {
            videoBgRef.current?.drawSubmergeFrame(0);
            videoBgRef.current?.setLayer('submerge');
          },
          onLeaveBack: () => videoBgRef.current?.setLayer('above'),
          onLeave: () => videoBgRef.current?.setLayer('underwater'),
          onEnterBack: () => {
            videoBgRef.current?.drawSubmergeFrame(1);
            videoBgRef.current?.setLayer('submerge');
          },
        },
        onUpdate() {
          videoBgRef.current?.drawSubmergeFrame(submergeProgress.v);
        },
      });

      /* Canvas scrub — resurface (underwater → above) */
      const resuraceProgress = { v: 0 };
      gsap.to(resuraceProgress, {
        v: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#resurface-trigger',
          start: 'top 65%',
          end: '+=700',
          scrub: 0.4,
          onEnter: () => {
            videoBgRef.current?.drawResurfaceFrame(0);
            videoBgRef.current?.setLayer('resurface');
          },
          onLeaveBack: () => videoBgRef.current?.setLayer('underwater'),
          onLeave: () => videoBgRef.current?.setLayer('above'),
          onEnterBack: () => {
            videoBgRef.current?.drawResurfaceFrame(1);
            videoBgRef.current?.setLayer('resurface');
          },
        },
        onUpdate() {
          videoBgRef.current?.drawResurfaceFrame(resuraceProgress.v);
        },
      });
    },
    { scope: wrapRef }
  );

  return (
    <div
      ref={wrapRef}
      className="about-wrap"
      style={{
        position: 'relative',
        background: 'transparent',
        color: '#ffffff',
        overflowX: 'hidden',
        fontFamily: 'var(--font-dm-sans), var(--font-tt-norms), system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ── FIXED VIDEO BACKGROUND (z=0, behind everything) ─────────────── */}
      <VideoBackground ref={videoBgRef} />

      {/* ── SVG BACKGROUND THREAD (z=11, above videos) ────────────────── */}
      <CinematicBackgroundLine />

      {/* ── SCROLL TO TOP (z=20, above everything) ──────────────────────── */}
      <button
        aria-label="Πίσω στην αρχή"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
          right: '1.25rem',
          zIndex: 20,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.25)',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: showTop ? 1 : 0,
          transform: showTop ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 350ms ease, transform 350ms ease, background 200ms ease, border-color 200ms ease',
          pointerEvents: showTop ? 'auto' : 'none',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.55)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)';
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 13 L8 3" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M3 7 L8 2 L13 7" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </button>

      {/* ════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          padding: 'calc(100px + 4vh) clamp(1.5rem, 6vw, 8rem) 4vh',
        }}
      >
        <div
          className="about-hero-content"
          style={{ textAlign: 'center', maxWidth: '900px' }}
        >
          <p style={{
            fontSize: '0.7rem',
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color: '#ffffff',
            fontWeight: 500,
            marginBottom: '2.5rem',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            opacity: 0,
          }}>
            AEROFREN — Απο το 1980
          </p>

          <h1
            style={{
              fontSize: 'clamp(4rem, 11vw, 10rem)',
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              margin: '0 0 2rem',
              color: '#ffffff',
              fontFamily: 'var(--font-playfair), Georgia, serif',
              textShadow: '0 4px 60px rgba(0,0,0,0.6)',
              opacity: 0,
            }}
          >
            Η Ιστορία<br />
            <span style={{
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#ffffff',
            }}>
              μας.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              fontWeight: 300,
              lineHeight: 1.85,
              color: '#ffffff',
              maxWidth: '560px',
              margin: '0 auto',
              opacity: 0,
            }}
          >
            Τέσσερις δεκαετίες αφοσίωσης στην τεχνική αρτιότητα, την ποιότητα
            και τον σεβασμό στον συνεργάτη, που αποτελούν τις σταθερές αξίες μας.
          </p>

          {/* Dive Deeper animated scroll cue */}
          <div style={{
            marginTop: '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6rem',
            opacity: 0,
          }}>
            <span style={{
              fontSize: '0.6rem',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#ffffff',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontWeight: 500,
            }}>
              Περιηγηθείτε
            </span>
            <svg
              width="18"
              height="32"
              viewBox="0 0 18 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ animation: 'diveBounce 2s ease-in-out infinite' }}
            >
              <path d="M9 0 L9 24" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
              <path d="M2 18 L9 26 L16 18" stroke="#ffffff" strokeWidth="1.2" fill="none" />
            </svg>
            <style>{`
              @keyframes diveBounce {
                0%, 100% { transform: translateY(0); opacity: 0.6; }
                50%       { transform: translateY(7px); opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      </section>

      {/* ── DIVE TRIGGER: scroll past this to start submerge canvas ─── */}
      <div id="dive-trigger" style={{ height: 0, pointerEvents: 'none' }} />

      {/* ════════════════════════════════════════════
          HISTORY SECTIONS (01 – 04)
          ════════════════════════════════════════════ */}
      {HISTORY_SECTIONS.map((sec) => {
        const isRight = sec.align === 'right';
        return (
          <section
            key={sec.id}
            className="about-section"
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              padding: '10vh clamp(1.5rem, 6vw, 8rem)',
              color: '#ffffff',
            }}
          >
            {/* Giant background section number */}
            <span
              className="about-section-num"
              style={{
                position: 'absolute',
                fontSize: 'clamp(12rem, 30vw, 28rem)',
                fontWeight: 900,
                letterSpacing: '-0.06em',
                lineHeight: 1,
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.08)',
                pointerEvents: 'none',
                userSelect: 'none',
                top: '50%',
                transform: 'translateY(-50%)',
                ...(isRight ? { right: 'clamp(1.5rem, 4vw, 6rem)' } : { left: 'clamp(1.5rem, 4vw, 6rem)' }),
                zIndex: 0,
                opacity: 0,
              }}
            >
              {sec.sectionNum}
            </span>

            {/* Text block */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                maxWidth: 'clamp(280px, 44vw, 580px)',
                ...(isRight ? { marginLeft: 'auto' } : {}),
              }}
            >
              {/* Tag + year */}
              <div
                className="about-tag"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  opacity: 0,
                }}
              >
                <span style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: 'var(--theme-accent)',
                  background: 'color-mix(in srgb, var(--theme-accent) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--theme-accent) 25%, transparent)',
                  padding: '5px 12px',
                  borderRadius: '999px',
                }}>
                  {sec.tag}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.2em',
                  color: '#ffffff',
                  fontWeight: 500,
                }}>
                  {sec.year}
                </span>
              </div>

              {/* Heading */}
              <h2
                className="about-heading"
                style={{
                  fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
                  fontWeight: 800,
                  lineHeight: 1.0,
                  letterSpacing: '-0.03em',
                  color: 'var(--theme-text)',
                  margin: '0 0 1.5rem',
                  whiteSpace: 'pre-line',
                  opacity: 0,
                }}
              >
                {sec.heading}
              </h2>

              {/* Body */}
              <p
                className="about-body"
                style={{
                  fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
                  fontWeight: 300,
                  lineHeight: 1.9,
                  color: '#ffffff',
                  borderLeft: '2px solid color-mix(in srgb, var(--theme-accent) 40%, transparent)',
                  paddingLeft: '1.25rem',
                  maxWidth: '520px',
                  opacity: 0,
                }}
              >
                {sec.body}
              </p>
            </div>
          </section>
        );
      })}

      {/* ── RESURFACE TRIGGER: scroll past this to start resurface canvas ── */}
      <div id="resurface-trigger" style={{ height: 0, pointerEvents: 'none' }} />

      {/* ════════════════════════════════════════════
          PHILOSOPHY DIVIDER
          ════════════════════════════════════════════ */}
      <div
        className="about-divider"
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          padding: '0 clamp(1.5rem, 6vw, 8rem)',
          overflow: 'hidden',
        }}
      >
        {/* Background label */}
        <span style={{
          position: 'absolute',
          fontSize: 'clamp(6rem, 20vw, 18rem)',
          fontWeight: 900,
          letterSpacing: '-0.06em',
          color: 'transparent',
          WebkitTextStroke: '1px color-mix(in srgb, var(--theme-accent) 8%, transparent)',
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}>
          ΤΕΧΝΙΚΗ
        </span>

        <div
          className="about-divider-inner"
          style={{
            textAlign: 'center',
            position: 'relative',
            opacity: 0,
          }}
        >
          <div style={{
            width: '40px',
            height: '1px',
            background: 'var(--theme-accent)',
            margin: '0 auto 1.5rem',
            opacity: 0.6,
          }} />
          <p style={{
            fontSize: '0.7rem',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: 'var(--theme-accent)',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}>
            Τεχνική Φιλοσοφία
          </p>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: 'var(--theme-text)',
            margin: 0,
          }}>
            Τεχνική Αριστεία.
          </h2>
          <div style={{
            width: '40px',
            height: '1px',
            background: 'var(--theme-accent)',
            margin: '1.5rem auto 0',
            opacity: 0.6,
          }} />
        </div>
      </div>

      {/* ════════════════════════════════════════════
          PHILOSOPHY SECTIONS (05 – 10)
          ════════════════════════════════════════════ */}
      {PHILOSOPHY_SECTIONS.map((sec) => {
        const isRight = sec.align === 'right';
        return (
          <section
            key={sec.id}
            className="about-section"
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2,
              padding: '10vh clamp(1.5rem, 6vw, 8rem)',
              color: '#ffffff',
            }}
          >
            {/* Background section number */}
            <span
              className="about-section-num"
              style={{
                position: 'absolute',
                fontSize: 'clamp(12rem, 30vw, 28rem)',
                fontWeight: 900,
                letterSpacing: '-0.06em',
                lineHeight: 1,
                color: 'transparent',
                WebkitTextStroke: '1px color-mix(in srgb, var(--theme-accent) 10%, transparent)',
                pointerEvents: 'none',
                userSelect: 'none',
                top: '50%',
                transform: 'translateY(-50%)',
                ...(isRight ? { right: 'clamp(1.5rem, 4vw, 6rem)' } : { left: 'clamp(1.5rem, 4vw, 6rem)' }),
                zIndex: 0,
                opacity: 0,
              }}
            >
              {sec.sectionNum}
            </span>

            <div
              style={{
                position: 'relative',
                zIndex: 2,
                maxWidth: 'clamp(280px, 44vw, 580px)',
                ...(isRight ? { marginLeft: 'auto' } : {}),
              }}
            >
              {/* Tag */}
              <div
                className="about-tag"
                style={{
                  marginBottom: '1.5rem',
                  opacity: 0,
                }}
              >
                <span style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: '#ffffff',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}>
                  {sec.tag}
                </span>
              </div>

              {/* Heading */}
              <h2
                className="about-heading"
                style={{
                  fontSize: 'clamp(2.6rem, 5vw, 4.8rem)',
                  fontWeight: 700,
                  lineHeight: 1.02,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                  margin: '0 0 0.5rem',
                  whiteSpace: 'pre-line',
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  textShadow: '0 2px 30px rgba(0,0,0,0.5)',
                  opacity: 0,
                }}
              >
                {sec.heading}
              </h2>

              {/* Accent line — colored gradient statement */}
              <p
                className="about-accent"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  fontWeight: 600,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  margin: '0 0 1.8rem',
                  fontStyle: 'italic',
                  color: '#ffffff',
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  opacity: 0,
                }}
              >
                {sec.accent}
              </p>

              {/* Body */}
              <p
                className="about-body"
                style={{
                  fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
                  fontWeight: 300,
                  lineHeight: 1.9,
                  color: '#ffffff',
                  borderLeft: '2px solid color-mix(in srgb, var(--theme-accent) 40%, transparent)',
                  paddingLeft: '1.25rem',
                  maxWidth: '520px',
                  opacity: 0,
                }}
              >
                {sec.body}
              </p>
            </div>
          </section>
        );
      })}

      {/* ════════════════════════════════════════════
          CLOSING / CONTACT
          ════════════════════════════════════════════ */}
      <section
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          padding: '0 clamp(1.5rem, 6vw, 8rem)',
          borderTop: '1px solid color-mix(in srgb, var(--theme-accent) 12%, transparent)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '0.7rem',
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color: '#ffffff',
            fontWeight: 500,
            marginBottom: '2rem',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}>
            Ας χτίσουμε κάτι μαζί.
          </p>

          <h2 style={{
            fontSize: 'clamp(3rem, 7vw, 6rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 0.95,
            color: '#ffffff',
            margin: '0 0 2.5rem',
            fontFamily: 'var(--font-playfair), Georgia, serif',
            textShadow: '0 4px 40px rgba(0,0,0,0.5)',
          }}>
            Στοιχεία<br />
            <span style={{
              fontStyle: 'italic',
              fontWeight: 400,
              color: '#ffffff',
            }}>
              Επικοινωνίας.
            </span>
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '2.5rem',
            fontSize: 'clamp(0.95rem, 1.4vw, 1.1rem)',
            fontWeight: 300,
            color: '#ffffff',
            lineHeight: 1.8,
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}>
            <span>Χρυσοστόμου Σμύρνης 26, Μοσχάτο</span>
            <span style={{ color: '#ffffff', fontSize: '0.9em' }}>Εξειδίκευση: Επεξεργασία Νερού &amp; Πεπιεσμένος Αέρας</span>
            <a
              href="tel:+302103461645"
              style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 500, letterSpacing: '0.04em' }}
            >
              +30 210 3461645
            </a>
            <a
              href="mailto:aerofren@gmail.com"
              style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 400 }}
            >
              aerofren@gmail.com
            </a>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="tel:+302103461645"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '14px 30px',
                background: 'rgba(255,255,255,0.92)',
                color: '#0a0a0a',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                transition: 'background 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#ffffff'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.92)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; }}
            >
              Τηλεφωνήστε μας
            </a>
            <Link
              href="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '14px 30px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 500,
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                transition: 'border-color 0.2s ease, background 0.2s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.3)'; }}
            >
              Φόρμα Επικοινωνίας
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          RESPONSIVE OVERRIDES
          ════════════════════════════════════════════ */}
      <style jsx>{`
        @media (max-width: 768px) {
          .about-wrap .about-section-num {
            font-size: clamp(6rem, 25vw, 14rem) !important;
            opacity: 0.06 !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .about-wrap .about-heading,
          .about-wrap .about-body,
          .about-wrap .about-accent,
          .about-wrap .about-tag,
          .about-wrap .about-section-num,
          .about-wrap .about-hero-content > *,
          .about-wrap .about-divider-inner {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
