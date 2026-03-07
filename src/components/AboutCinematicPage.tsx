'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { gsap, useGSAP, EASE } from '@/lib/gsap';
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
    heading: 'Μια Ιστορία\nΕξειδίκευσης\nκαι Εμπιστοσύνης',
    body: 'Η διαδρομή της Aerofren ξεκίνησε το 1980 από τον αείμνηστο Βασίλειο Κουτελίδη, ο οποίος μετέφερε στην Ελλάδα την πολύτιμη τεχνογνωσία που απέκτησε στη Γερμανία πάνω στα συστήματα αερόφρενων φορτηγών – μια εξειδίκευση που χάρισε και το όνομα στην επιχείρηση.',
    align: 'left',
  },
  {
    id: 'evolution',
    sectionNum: '02',
    year: '2000+',
    tag: 'Εξέλιξη',
    heading: 'Εξέλιξη\nκαι Ανάπτυξη',
    body: 'Με την πάροδο των ετών, η Aerofren εξελίχθηκε δυναμικά, εντάσσοντας στο δυναμικό της ένα ευρύ φάσμα προϊόντων πεπιεσμένου αέρα και προηγμένων συστημάτων επεξεργασίας νερού. Σήμερα, η επιχείρηση συνεχίζει την επιτυχημένη πορεία της υπό τη διεύθυνση της κόρης του, Κατερίνας Κουτελίδου.',
    align: 'right',
  },
  {
    id: 'location',
    sectionNum: '03',
    year: 'Σήμερα',
    tag: 'Χώρος',
    heading: 'Νέος χώρος,\nίδιο μεράκι',
    body: 'Στον νέο, καλαίσθητο χώρο μας στο Μοσχάτο (Χρυσοστόμου Σμύρνης 26), προσφέρουμε εξειδικευμένες λύσεις με προϊόντα κορυφαίων πιστοποιημένων οίκων του εξωτερικού, διαθέσιμα άμεσα ή κατόπιν παραγγελίας.',
    align: 'left',
  },
  {
    id: 'tribute',
    sectionNum: '04',
    year: 'Πάντα',
    tag: 'Τιμή',
    heading: 'Τιμή\nστον Ιδρυτή',
    body: 'Λειτουργούμε με το ίδιο μεράκι και την αγάπη που μας κληροδότησε ο ιδρυτής μας, στον οποίο είναι αφιερωμένη η καθημερινή μας προσπάθεια. Αυτό αποτελεί έναν ελάχιστο φόρο τιμής στη μνήμη και το έργο του Βασιλείου Κουτελίδη.',
    align: 'right',
  },
] as const;

const PHILOSOPHY_SECTIONS = [
  {
    id: 'precision',
    sectionNum: '05',
    tag: 'Αποστολή',
    heading: 'Δεν προμηθεύουμε\nαπλώς εξαρτήματα.',
    accent: 'Παραδίδουμε ακρίβεια.',
    body: 'Από το 1980, η AEROFREN είναι ο αξιόπιστος B2B συνεργάτης για επαγγελματίες που απαιτούν τελειότητα στα πνευματικά και υδραυλικά εξαρτήματα.',
    align: 'left',
  },
  {
    id: 'durability',
    sectionNum: '06',
    tag: 'Ποιότητα',
    heading: 'Εξαρτήματα που\nαντέχουν δεκαετίες.',
    accent: 'Χρόνο με τον χρόνο.',
    body: 'Premium ρακόρ ορείχαλκου. Βαλβίδες βιομηχανικών προδιαγραφών. Πιστοποιημένοι σωλήνες. Υλικά σχεδιασμένα να αποδίδουν υπό πίεση.',
    align: 'right',
  },
  {
    id: 'systematic',
    sectionNum: '07',
    tag: 'Σύστημα',
    heading: 'Συστηματική\nπροσέγγιση.',
    accent: 'Απρόσκοπτη ενσωμάτωση.',
    body: 'Από πνευματικούς κυλίνδρους έως ολοκληρωμένα συστήματα επεξεργασίας αέρα, ο κατάλογός μας μειώνει την πολυπλοκότητα στις εγκαταστάσεις σας.',
    align: 'left',
  },
  {
    id: 'silent',
    sectionNum: '08',
    tag: 'Αξιοπιστία',
    heading: 'Προϊόντα που\nδουλεύουν αθόρυβα.',
    accent: 'Στο παρασκήνιο.',
    body: 'Τα καλύτερα εξαρτήματα είναι εκείνα που ξεχνάς ότι υπάρχουν. Τα ρακόρ και οι βαλβίδες μας λειτουργούν με απόλυτη αξιοπιστία.',
    align: 'right',
  },
  {
    id: 'expertise',
    sectionNum: '09',
    tag: 'Τεχνογνωσία',
    heading: 'Η τεχνογνωσία\nείναι ο μοχλός.',
    accent: '35+ χρόνια στη διάθεσή σας.',
    body: 'Δεν πουλάμε απλώς προϊόντα — προσφέρουμε λύσεις, καθοδήγηση και υποστήριξη που κάνουν τη διαφορά.',
    align: 'left',
  },
  {
    id: 'professionals',
    sectionNum: '10',
    tag: 'Συνεργασία',
    heading: 'Φτιαγμένα για\nεπαγγελματίες.',
    accent: 'Από επαγγελματίες.',
    body: 'Κάθε εγκαταστάτης, μηχανικός και βιομηχανικός πελάτης που εξυπηρετούμε γίνεται συνεργάτης. Η επιτυχία σας είναι το μέτρο της ποιότητάς μας.',
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

      /* Section number ghost — atmospheric fade in */
      gsap.utils.toArray<HTMLElement>('.about-section-num').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: el.closest('.about-section') ?? el,
              start: 'top 85%',
              end: 'top 35%',
              scrub: 1,
            },
          }
        );
      });

      /* Tag pill — snaps in */
      gsap.utils.toArray<HTMLElement>('.about-tag').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.85, x: -10 },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            ease: EASE.smooth,
            scrollTrigger: {
              trigger: el.closest('.about-section') ?? el,
              start: 'top 80%',
              end: 'top 50%',
              scrub: 0.8,
            },
          }
        );
      });

      /* Heading — wipes up */
      gsap.utils.toArray<HTMLElement>('.about-heading').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 70 },
          {
            opacity: 1,
            y: 0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el.closest('.about-section') ?? el,
              start: 'top 78%',
              end: 'top 42%',
              scrub: 1.2,
            },
          }
        );
      });

      /* Accent line (philosophy) */
      gsap.utils.toArray<HTMLElement>('.about-accent').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el.closest('.about-section') ?? el,
              start: 'top 74%',
              end: 'top 40%',
              scrub: 1,
            },
          }
        );
      });

      /* Body text */
      gsap.utils.toArray<HTMLElement>('.about-body').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el.closest('.about-section') ?? el,
              start: 'top 72%',
              end: 'top 38%',
              scrub: 0.9,
            },
          }
        );
      });

      /* Hero elements — stagger on load */
      gsap.fromTo(
        '.about-hero-content > *',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          stagger: 0.12,
          ease: EASE.smooth,
          delay: 0.2,
        }
      );

      /* Divider text */
      gsap.fromTo(
        '.about-divider-inner',
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-divider',
            start: 'top 70%',
            end: 'top 40%',
            scrub: 1,
          },
        }
      );
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
          padding: '0 clamp(1.5rem, 6vw, 8rem)',
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
            color: 'rgba(255,255,255,0.55)',
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
              color: 'rgba(255,255,255,0.82)',
            }}>
              μας.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              fontWeight: 300,
              lineHeight: 1.85,
              color: 'var(--theme-text-muted)',
              maxWidth: '560px',
              margin: '0 auto',
              opacity: 0,
            }}
          >
            Τεσσερις δεκαετίες αφοσίωσης στην τεχνική ακρίβεια, στην ποιότητα
            και στις ανθρώπινες αξίες που κληροδότησε ο ιδρυτής μας.
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
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontWeight: 500,
            }}>
              Κατέβα βαθύτερα
            </span>
            <svg
              width="18"
              height="32"
              viewBox="0 0 18 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ animation: 'diveBounce 2s ease-in-out infinite' }}
            >
              <path d="M9 0 L9 24" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
              <path d="M2 18 L9 26 L16 18" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none" />
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
                  color: 'var(--theme-text-muted)',
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
                  color: 'var(--theme-text-muted)',
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
                  color: 'rgba(255,255,255,0.5)',
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
                  color: 'rgba(255,255,255,0.7)',
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
                  color: 'var(--theme-text-muted)',
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
            color: 'rgba(255,255,255,0.45)',
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
              color: 'rgba(255,255,255,0.8)',
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
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.8,
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}>
            <span>Χρυσοστόμου Σμύρνης 26, Μοσχάτο</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9em' }}>Εξειδίκευση: Επεξεργασία Νερού &amp; Πεπιεσμένος Αέρας</span>
            <a
              href="tel:+302103461645"
              style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 500, letterSpacing: '0.04em' }}
            >
              +30 210 3461645
            </a>
            <a
              href="mailto:info@aerofren.gr"
              style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 400 }}
            >
              info@aerofren.gr
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
