"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP, EASE, SplitText, SCRAMBLE_CHARS, ScrollTrigger } from "@/lib/gsap";
import HorizontalGallery from "@/components/HorizontalGallery";
import ScrollAnimation from "@/components/ScrollAnimation";
import { Button } from "@/components/ui/button";
import LiquidButton from "@/components/LiquidButton";
import { Target, Wrench, Building2 } from "lucide-react";

/**
 * AEROFREN Homepage - Premium Cinematic Scroll
 * 
 * Scroll-driven motion system:
 * - Hero: Pinned + scrubbed parallax background
 * - Stats: Enter from right with stagger
 * - Categories: Alternating left/right entrance
 * - Why section: Pinned feature reveal
 * - Contact: Scale entrance
 */

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // ============================================
  // HERO ENTRANCE: Premium welcome animation
  // Using SplitText for staggered character/word reveal
  // ============================================
  useGSAP(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const eyebrow = hero.querySelector("[data-hero-eyebrow]");
    const headline = hero.querySelector("[data-hero-headline]");
    const subtext = hero.querySelector("[data-hero-subtext]");
    const button = hero.querySelector("[data-hero-button]");

    // Create entrance timeline
    const entranceTl = gsap.timeline({
      defaults: { ease: EASE.smooth },
      delay: 0.3, // Small delay for page to settle
    });

    // 1. Eyebrow: ScrambleText for industrial/technical feel
    // Characters scramble like data calibrating before locking into place
    if (eyebrow) {
      gsap.set(eyebrow, { visibility: "visible" });

      entranceTl.to(eyebrow, {
        duration: 1.4,
        scrambleText: {
          text: "AEROFREN",
          chars: SCRAMBLE_CHARS.technical,
          revealDelay: 0.4,
          speed: 0.5,
          delimiter: "",
        },
        ease: "none", // ScrambleText handles its own reveal timing
      }, 0);
    }

    // 2. Headline: Words slide up with blur-to-sharp
    if (headline) {
      const headlineSplit = new SplitText(headline, { type: "words" });
      gsap.set(headline, { visibility: "visible" });
      gsap.set(headlineSplit.words, { opacity: 0, y: 30, filter: "blur(8px)" });

      entranceTl.to(headlineSplit.words, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.06,
        ease: EASE.hydraulic, // Industrial pneumatic feel
      }, 0.5);
    }

    // 3. Subtext: Gentle fade-in with slide-up
    if (subtext) {
      gsap.set(subtext, { visibility: "visible", opacity: 0, y: 20 });
      entranceTl.to(subtext, {
        opacity: 1,
        y: 0,
        duration: 0.5,
      }, 0.8);
    }

    // 4. Liquid Button: Scale in last
    if (button) {
      gsap.set(button, { visibility: "visible", opacity: 0, scale: 0.8 });
      entranceTl.to(button, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: EASE.emphasis,
      }, 1.0);
    }

  }, { scope: heroRef });

  // ============================================
  // STATS: Enter from right with stagger
  // ============================================
  useGSAP(() => {
    const stats = statsRef.current;
    if (!stats) return;

    const items = stats.querySelectorAll("[data-stat-item]");
    const heading = stats.querySelector("[data-section-heading]");

    // Heading slides from left
    if (heading) {
      gsap.fromTo(heading,
        { x: -80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          ease: EASE.smooth,
          scrollTrigger: {
            trigger: heading,
            start: "top 85%",
            end: "top 60%",
            scrub: 1,
          },
        }
      );
    }

    // Stats enter from right with stagger + gauge bounce
    // Using CustomBounce for mechanical pressure gauge settling effect
    gsap.fromTo(items,
      { x: 100, opacity: 0, scale: 0.9 },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.15,
        ease: EASE.gauge, // Gauge-needle settling bounce
        duration: 1.2,
        scrollTrigger: {
          trigger: stats,
          start: "top 75%",
          toggleActions: "play none none reverse", // Play on enter, reverse on leave-back
        },
        onComplete: function () {
          // After cards enter, scramble the stat values
          const values = stats.querySelectorAll("[data-stat-value]");
          values.forEach((value, index) => {
            const targetValue = value.getAttribute("data-value") || "";
            gsap.to(value, {
              duration: 1.0,
              delay: index * 0.1,
              scrambleText: {
                text: targetValue,
                chars: SCRAMBLE_CHARS.numeric,
                revealDelay: 0.3,
                speed: 0.6,
              },
            });
          });
        },
      }
    );

  }, { scope: statsRef });

  // ============================================
  // WHY SECTION: Pinned feature reveal
  // ============================================
  useGSAP(() => {
    const why = whyRef.current;
    if (!why) return;

    const heading = why.querySelector("[data-section-heading]");
    const image = why.querySelector("[data-why-image]");
    const features = why.querySelectorAll("[data-why-feature]");

    // Pinned timeline for feature reveal
    const whyTl = gsap.timeline({
      scrollTrigger: {
        trigger: why,
        start: "top 20%",
        end: "+=600",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    // Image parallax
    if (image) {
      whyTl.fromTo(image,
        { y: 40, scale: 0.95, opacity: 0.6 },
        { y: -20, scale: 1, opacity: 1, ease: "none" },
        0
      );
    }

    // Features stagger in from right
    features.forEach((feature, i) => {
      whyTl.fromTo(feature,
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, ease: "power2.out" },
        0.15 + i * 0.15
      );
    });

  }, { scope: whyRef });

  // ============================================
  // CONTACT: Scale entrance from center
  // ============================================
  useGSAP(() => {
    const contact = contactRef.current;
    if (!contact) return;

    const card = contact.querySelector("[data-contact-card]");

    if (card) {
      gsap.fromTo(card,
        { scale: 0.85, opacity: 0, y: 60 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          ease: EASE.smooth,
          scrollTrigger: {
            trigger: contact,
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
          },
        }
      );
    }

  }, { scope: contactRef });

  const stats = [
    { value: "35+", label: "Χρόνια Εμπειρίας" },
    { value: "10.000+", label: "Προϊόντα σε Stock" },
    { value: "500+", label: "Ενεργοί Συνεργάτες" },
    { value: "24ωρη", label: "Αποστολή" },
  ];

  const whyFeatures = [
    { icon: Target, title: "Άμεση Διαθεσιμότητα", desc: "Τεράστια απόθεμα στο Μοσχάτο" },
    { icon: Wrench, title: "Τεχνική Υποστήριξη", desc: "Σας καθοδηγούμε στην σωστή επιλογή" },
    { icon: Building2, title: "Τιμές B2B", desc: "Ειδικές τιμοκαταλόγους για επαγγελματίες" },
  ];

  return (
    <>
      {/* ============================================
          HERO SECTION - Pinned with parallax
          ============================================ */}
      <section ref={heroRef} className="hero">
        {/* Parallax background */}
        <div data-hero-bg className="hero__bg" />

        {/* Premium overlay for depth */}
        <div className="hero__overlay" />

        {/* Noise texture overlay */}
        <div className="hero__noise" />

        {/* Content wrapper */}
        <div className="hero__container hero__container--welcome">
          {/* Welcome: Centered text content */}
          <div data-hero-content className="hero__welcome">
            {/* Eyebrow - hidden until animation */}
            <span data-hero-eyebrow className="hero__eyebrow" style={{ visibility: "hidden" }}>
              AEROFREN
            </span>

            {/* Headline - hidden until animation */}
            <h1 data-hero-headline className="hero__headline" style={{ visibility: "hidden" }}>
              Καλώς ήρθατε στο AEROFREN
            </h1>

            {/* Subtext - hidden until animation */}
            <p data-hero-subtext className="hero__subtext" style={{ visibility: "hidden" }}>
              Συνδεθείτε για να συνεχίσετε και να έχετε άμεση υποστήριξη μέσω chat.
            </p>

            {/* Liquid Button - hidden until animation */}
            <div data-hero-button className="hero__button-wrapper" style={{ visibility: "hidden" }}>
              <LiquidButton text="Εξερευνήστε" href="/products" />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          STATS SECTION - Enter from right
          ============================================ */}
      < section ref={statsRef} className="stats" >
        <div className="stats__container">
          <h2 data-section-heading className="stats__heading">
            Αριθμοί που μιλούν
          </h2>
          <div className="stats__grid">
            {stats.map((stat, i) => (
              <div key={i} data-stat-item className="stats__item">
                <span
                  data-stat-value
                  data-value={stat.value}
                  className="stats__value"
                >
                  {stat.value}
                </span>
                <span className="stats__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* ============================================
          HORIZONTAL GALLERY - GSAP-driven scroll
          ============================================ */}
      < HorizontalGallery />

      {/* ============================================
          SCROLL ANIMATION - Premium grid reveal
          ============================================ */}
      <ScrollAnimation />

      {/* ============================================
          WHY SECTION - Pinned feature reveal
          ============================================ */}
      < section ref={whyRef} className="why" >
        <div className="why__container">
          <div className="why__left">
            <div data-why-image className="why__image">
              <Image
                src="/images/categories/thread-fittings.jpg"
                alt="Premium fittings"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="why__right">
            <h2 data-section-heading className="why__heading">
              Γιατί AEROFREN
            </h2>
            <div className="why__features">
              {whyFeatures.map((f, i) => {
                const IconComponent = f.icon;
                return (
                  <div key={i} data-why-feature className="why__feature">
                    <div className="why__feature-icon">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="why__feature-title">{f.title}</h4>
                      <p className="why__feature-desc">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section >

      {/* ============================================
          CONTACT - Scale entrance
          ============================================ */}
      < section ref={contactRef} className="contact" >
        <div className="contact__container">
          <div data-contact-card className="contact__card">
            <h2 className="contact__heading">Ζητήστε Προσφορά</h2>
            <p className="contact__text">
              Επικοινωνήστε μαζί μας για τιμές χονδρικής και ειδικές προσφορές.
            </p>
            <div className="contact__ctas">
              <Button asChild variant="glass-accent" size="hero">
                <a href="tel:2103461645">📞 210 3461645</a>
              </Button>
              <Button asChild variant="glass-secondary" size="hero">
                <Link href="/contact">Φόρμα Επικοινωνίας</Link>
              </Button>
            </div>
          </div>
        </div>
      </section >

      {/* ============================================
          INLINE STYLES (Scoped to this component)
          ============================================ */}
      < style jsx > {`
        /* ==== HERO ==== */
        .hero {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          isolation: isolate;
          /* Transparent to show global waves background */
          background: transparent;
          /* Vertically center content */
          display: flex;
          align-items: center;
        }

        .hero__bg {
          /* No longer needed - using global waves-background */
          display: none;
        }

        .hero__overlay {
          position: absolute;
          inset: 0;
          z-index: -1;
          /* Subtle glow without darkening - allows waves to show through */
          background: radial-gradient(1400px 700px at 20% 40%, rgba(0,100,200,0.15), transparent 60%);
          pointer-events: none;
        }

        .hero__noise {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }

        .hero__container {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 140px 48px 100px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          min-height: 100vh;
        }

        /* Welcome variant - centered layout, no top padding */
        .hero__container--welcome {
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding-top: 0;
          padding-bottom: 0;
        }

        .hero__welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          max-width: 800px;
        }

        .hero__eyebrow {
          display: inline-block;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.25em;
          color: #5cb8ff;
          text-transform: uppercase;
          text-shadow: 0 0 20px rgba(92, 184, 255, 0.5);
          perspective: 500px;
          position: relative;
          padding-bottom: 12px;
        }

        .hero__eyebrow::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #5cb8ff, transparent);
          animation: eyebrow-glow 2s ease-in-out infinite;
        }

        @keyframes eyebrow-glow {
          0%, 100% { opacity: 0.5; width: 60px; }
          50% { opacity: 1; width: 80px; }
        }

        .hero__headline {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #e0f0ff 50%, #5cb8ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          letter-spacing: -0.02em;
          filter: drop-shadow(0 4px 30px rgba(0, 0, 0, 0.3));
        }

        .hero__subtext {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          max-width: 600px;
        }

        .hero__button-wrapper {
          margin-top: 16px;
        }

        .hero__content {
          will-change: transform, opacity;
        }

        .hero__tag {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(0,102,204,0.15);
          color: #5cb8ff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          border-radius: 6px;
          margin-bottom: 24px;
        }

        .hero__title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: white;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }

        .hero__title--accent {
          color: #5cb8ff;
        }

        .hero__title--secondary {
          color: rgba(255,255,255,0.7);
          font-weight: 600;
        }

        .hero__subtitle {
          font-size: 18px;
          color: rgba(255,255,255,0.65);
          line-height: 1.6;
          max-width: 480px;
          margin-bottom: 32px;
        }

        .hero__ctas {
          display: flex;
          gap: 16px;
          margin-bottom: 40px;
        }

        .hero__quick-tags {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero__quick-tag {
          padding: 8px 16px;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s ease;
        }

        .hero__quick-tag:hover {
          background: rgba(255,255,255,0.1);
          color: white;
          border-color: rgba(255,255,255,0.2);
        }

        /* ==== HERO GLASS CARD ==== */
        .hero__card {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          max-width: 480px;
          perspective: 1000px;
          will-change: transform, opacity;
        }

        .hero__card-glass {
          position: absolute;
          inset: 0;
          /* CSS custom properties for GSAP animation */
          --glass-blur: 12px;
          --glass-bg-opacity: 0.04;
          --glass-border-opacity: 0.08;
          background: linear-gradient(
            145deg,
            rgba(255,255,255, var(--glass-bg-opacity)) 0%,
            rgba(255,255,255, calc(var(--glass-bg-opacity) * 0.25)) 50%,
            rgba(0,50,100, calc(var(--glass-bg-opacity) * 1.5)) 100%
          );
          backdrop-filter: blur(var(--glass-blur));
          -webkit-backdrop-filter: blur(var(--glass-blur));
          border-radius: 24px;
          border: 1px solid rgba(255,255,255, var(--glass-border-opacity));
          box-shadow:
            0 32px 64px rgba(0,0,0,0.4),
            0 16px 32px rgba(0,40,100,0.2),
            inset 0 1px 0 rgba(255,255,255,0.1);
          transition: box-shadow 0.1s ease;
        }

        .hero__card-highlight {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.12) 0%,
            rgba(255,255,255,0.04) 40%,
            transparent 100%
          );
          border-radius: 24px 24px 0 0;
          pointer-events: none;
          opacity: 0.4;
        }

        .hero__card-images {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero__card-img {
          position: absolute;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.3));
        }

        .hero__card-img--1 { top: 15%; left: 18%; }
        .hero__card-img--2 { top: 12%; right: 15%; }
        .hero__card-img--3 { bottom: 20%; left: 25%; }
        .hero__card-img--4 { bottom: 15%; right: 20%; }

        /* ==== STATS ==== */
        .stats {
          background: transparent;
          padding: 100px 48px;
        }

        .stats__container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .stats__heading {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #e0f0ff 50%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 48px;
          letter-spacing: -0.02em;
        }

        .stats__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .stats__item {
          text-align: center;
          padding: 32px;
          background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow:
            0 4px 16px rgba(0,0,0,0.15),
            inset 0 1px 0 rgba(255,255,255,0.05);
          will-change: transform, opacity;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stats__item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0, 102, 204, 0.5), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .stats__item:hover {
          border-color: rgba(0, 102, 204, 0.3);
          box-shadow:
            0 8px 32px rgba(0, 102, 204, 0.15),
            0 4px 16px rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.08);
          transform: translateY(-4px);
        }

        .stats__item:hover::before {
          opacity: 1;
        }

        .stats__value {
          display: block;
          font-size: 44px;
          font-weight: 800;
          background: linear-gradient(135deg, #5cb8ff 0%, #0066cc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
          filter: drop-shadow(0 2px 8px rgba(0, 102, 204, 0.3));
        }

        .stats__label {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          padding: 14px 28px;
          background: transparent;
          color: #0066cc;
          font-size: 15px;
          font-weight: 600;
          border-radius: 10px;
          border: 2px solid #0066cc;
          transition: all 0.25s ease;
        }

        .btn-outline:hover {
          background: #0066cc;
          color: white;
        }

        /* ==== WHY ==== */
        .why {
          position: relative;
          z-index: 1;
          background: transparent;
          padding: 100px 48px;
        }

        .why__container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .why__image {
          position: relative;
          aspect-ratio: 1;
          background: linear-gradient(145deg, #e2e8f0 0%, #cbd5e1 100%);
          border-radius: 20px;
          will-change: transform, opacity;
        }

        .why__heading {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #e0f0ff 50%, #5cb8ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 40px;
          letter-spacing: -0.02em;
        }

        .why__features {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .why__feature {
          display: flex;
          gap: 20px;
          padding: 24px;
          background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 4px 16px rgba(0,0,0,0.12),
            inset 0 1px 0 rgba(255,255,255,0.04);
          will-change: transform, opacity;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }

        .why__feature:hover {
          background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
          border-color: rgba(0, 102, 204, 0.25);
          box-shadow:
            0 12px 32px rgba(0, 102, 204, 0.12),
            0 4px 16px rgba(0,0,0,0.15),
            inset 0 1px 0 rgba(255,255,255,0.06);
          transform: translateX(8px);
        }

        .why__feature-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(92, 184, 255, 0.1));
          border-radius: 12px;
          border: 1px solid rgba(92, 184, 255, 0.2);
          color: #5cb8ff;
          box-shadow:
            0 4px 12px rgba(0, 102, 204, 0.15),
            inset 0 1px 0 rgba(255,255,255,0.05);
          transition: all 0.3s ease;
        }

        .why__feature:hover .why__feature-icon {
          background: linear-gradient(135deg, rgba(0, 102, 204, 0.3), rgba(92, 184, 255, 0.2));
          border-color: rgba(92, 184, 255, 0.4);
          box-shadow:
            0 8px 20px rgba(0, 102, 204, 0.25),
            inset 0 1px 0 rgba(255,255,255,0.08);
          transform: scale(1.05);
        }

        .why__feature-title {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }

        .why__feature-desc {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.5;
        }

        /* ==== CONTACT ==== */
        .contact {
          background: transparent;
          padding: 120px 48px;
        }

        .contact__container {
          max-width: 800px;
          margin: 0 auto;
        }

        .contact__card {
          text-align: center;
          padding: 64px;
          background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid transparent;
          will-change: transform, opacity;
          position: relative;
          overflow: hidden;
        }

        .contact__card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(0, 102, 204, 0.4), rgba(92, 184, 255, 0.2), rgba(0, 102, 204, 0.4));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: border-rotate 4s linear infinite;
        }

        .contact__card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(92, 184, 255, 0.6), transparent);
          animation: contact-shimmer 3s ease-in-out infinite;
        }

        @keyframes border-rotate {
          0% { background: linear-gradient(0deg, rgba(0, 102, 204, 0.4), rgba(92, 184, 255, 0.2), rgba(0, 102, 204, 0.4)); }
          25% { background: linear-gradient(90deg, rgba(0, 102, 204, 0.4), rgba(92, 184, 255, 0.2), rgba(0, 102, 204, 0.4)); }
          50% { background: linear-gradient(180deg, rgba(0, 102, 204, 0.4), rgba(92, 184, 255, 0.2), rgba(0, 102, 204, 0.4)); }
          75% { background: linear-gradient(270deg, rgba(0, 102, 204, 0.4), rgba(92, 184, 255, 0.2), rgba(0, 102, 204, 0.4)); }
          100% { background: linear-gradient(360deg, rgba(0, 102, 204, 0.4), rgba(92, 184, 255, 0.2), rgba(0, 102, 204, 0.4)); }
        }

        @keyframes contact-shimmer {
          0%, 100% { opacity: 0.4; width: 150px; }
          50% { opacity: 0.8; width: 250px; }
        }

        .contact__heading {
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #5cb8ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .contact__text {
          font-size: 18px;
          color: rgba(255,255,255,0.65);
          margin-bottom: 32px;
        }

        .contact__ctas {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        /* ==== RESPONSIVE ==== */
        @media (max-width: 1024px) {
          .hero__container {
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 120px 32px 80px;
          }

          .hero__card {
            max-width: 360px;
            margin: 0 auto;
          }

          .stats__grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .why__container {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }

        @media (max-width: 640px) {
          .hero__container {
            padding: 100px 24px 60px;
          }

          .hero__title {
            font-size: 2rem;
          }

          .hero__ctas {
            flex-direction: column;
          }

          .stats,
          .why,
          .contact {
            padding: 60px 24px;
          }

          .stats__grid {
            grid-template-columns: 1fr;
          }

          .contact__card {
            padding: 40px 24px;
          }

          .contact__ctas {
            flex-direction: column;
          }
        }

        /* ==== REDUCED MOTION ==== */
        @media (prefers-reduced-motion: reduce) {
          .hero__bg {
            animation: none !important;
            transform: none !important;
          }
        }

        /* ==== THEME-RESPONSIVE HERO ==== */
        /* Light theme: Dark text for visibility */
        /* Using :global() to escape styled-jsx scoping for data-theme selector */
        :global([data-theme="light"]) .hero__eyebrow {
          color: var(--theme-accent);
          text-shadow: none;
        }

        :global([data-theme="light"]) .hero__headline {
          color: var(--theme-text);
          text-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
        }

        :global([data-theme="light"]) .hero__subtext {
          color: var(--theme-text-muted);
        }

        :global([data-theme="light"]) .hero__title {
          color: var(--theme-text);
          text-shadow: 0 2px 4px rgba(255, 255, 255, 0.3);
        }

        :global([data-theme="light"]) .hero__title--accent {
          color: var(--theme-accent);
        }

        :global([data-theme="light"]) .hero__title--secondary {
          color: var(--theme-text-muted);
        }

        :global([data-theme="light"]) .hero__subtitle {
          color: var(--theme-text-muted);
        }

        :global([data-theme="light"]) .hero__tag {
          background: rgba(0, 102, 204, 0.12);
          color: var(--theme-accent);
        }

        /* Dim theme adjustments */
        :global([data-theme="dim"]) .hero__eyebrow {
          color: #ff48a9;
          text-shadow: 0 0 20px rgba(255, 72, 169, 0.5);
        }

        :global([data-theme="dim"]) .hero__headline {
          color: #d5dbe2;
        }
      `}</style >
    </>
  );
}
