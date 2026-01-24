"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { gsap, useGSAP, EASE, SCRAMBLE_CHARS } from "@/lib/gsap";
import { Button } from "@/components/ui/button";

const NexusHero = dynamic(() => import("@/components/NexusHero"), {
  ssr: false,
  loading: () => <div className="min-h-[70vh] w-full bg-[var(--theme-bg-solid)]" />,
});
const HorizontalGallery = dynamic(() => import("@/components/HorizontalGallery"), {
  ssr: false,
  loading: () => <div className="min-h-[40vh] w-full bg-[var(--theme-bg-solid)]" />,
});
const ScrollAnimation = dynamic(() => import("@/components/ScrollAnimation"), {
  ssr: false,
  loading: () => <div className="min-h-[30vh] w-full bg-[var(--theme-bg-solid)]" />,
});

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
  const statsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);
  const [contactInView, setContactInView] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [lowEndDevice, setLowEndDevice] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(media.matches);
    updateMotion();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updateMotion);
    } else {
      media.addListener(updateMotion);
    }

    const deviceMemory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const cpuCores = navigator.hardwareConcurrency ?? 4;
    setLowEndDevice(deviceMemory <= 4 || cpuCores <= 4);

    return () => {
      if (typeof media.addEventListener === "function") {
        media.removeEventListener("change", updateMotion);
      } else {
        media.removeListener(updateMotion);
      }
    };
  }, []);

  useEffect(() => {
    if (!reduceMotion) return;

    const statsEl = statsRef.current;
    if (statsEl) {
      const items = statsEl.querySelectorAll("[data-stat-item]");
      const heading = statsEl.querySelector("[data-section-heading]");
      if (heading) gsap.set(heading, { clearProps: "all" });
      items.forEach((item) => gsap.set(item, { clearProps: "all" }));
    }

    const contactCard = contactRef.current?.querySelector("[data-contact-card]");
    if (contactCard) {
      gsap.set(contactCard, { clearProps: "all" });
    }
  }, [reduceMotion]);

  useEffect(() => {
    const statsEl = statsRef.current;
    if (!statsEl || statsInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStatsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(statsEl);
    return () => observer.disconnect();
  }, [statsInView]);

  useEffect(() => {
    const contactEl = contactRef.current;
    if (!contactEl || contactInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setContactInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );

    observer.observe(contactEl);
    return () => observer.disconnect();
  }, [contactInView]);

  // ============================================
  // STATS: Enter from right with stagger
  // ============================================
  useGSAP(() => {
    if (!statsInView || reduceMotion) return;
    const stats = statsRef.current;
    if (!stats) return;

    const items = stats.querySelectorAll("[data-stat-item]");
    const heading = stats.querySelector("[data-section-heading]");
    const scrubValue = lowEndDevice ? false : 1;

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
            scrub: scrubValue,
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
          scrub: scrubValue,
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

  }, { scope: statsRef, dependencies: [statsInView, reduceMotion, lowEndDevice] });



  // ============================================
  // CONTACT: Scale entrance from center
  // ============================================
  useGSAP(() => {
    if (!contactInView || reduceMotion) return;
    const contact = contactRef.current;
    if (!contact) return;

    const card = contact.querySelector("[data-contact-card]");
    const scrubValue = lowEndDevice ? false : 1;

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
            scrub: scrubValue,
          },
        }
      );
    }

  }, { scope: contactRef, dependencies: [contactInView, reduceMotion, lowEndDevice] });

  const stats = [
    { value: "35+", label: "Χρόνια Εμπειρίας" },
    { value: "10.000+", label: "Προϊόντα σε Stock" },
    { value: "500+", label: "Ενεργοί Συνεργάτες" },
    { value: "24ωρη", label: "Αποστολή" },
  ];



  return (
    <>
      {/* ============================================
          HERO SECTION - Three.js Nexus Metaballs
          ============================================ */}
      <NexusHero />

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
          background: linear-gradient(135deg, var(--theme-text) 0%, var(--theme-accent) 50%, var(--theme-text-muted) 100%);
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
          background: var(--theme-glass-bg);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid var(--theme-glass-border);
          box-shadow:
            0 4px 16px rgba(0,0,0,0.15),
            inset 0 1px 0 var(--theme-glass-inset-light);
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
          background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-accent) 60%, transparent), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .stats__item:hover {
          border-color: color-mix(in srgb, var(--theme-accent) 35%, transparent);
          box-shadow:
            0 8px 32px color-mix(in srgb, var(--theme-accent) 25%, transparent),
            0 4px 16px rgba(0,0,0,0.2),
            inset 0 1px 0 var(--theme-glass-inset-light);
          transform: translateY(-4px);
        }

        .stats__item:hover::before {
          opacity: 1;
        }

        .stats__value {
          display: block;
          font-size: 44px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-accent-hover) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
          filter: drop-shadow(0 2px 8px color-mix(in srgb, var(--theme-accent) 35%, transparent));
        }

        .stats__label {
          font-size: 14px;
          color: var(--theme-text-muted);
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          padding: 14px 28px;
          background: transparent;
          color: var(--theme-accent);
          font-size: 15px;
          font-weight: 600;
          border-radius: 10px;
          border: 2px solid color-mix(in srgb, var(--theme-accent) 70%, transparent);
          transition: all 0.25s ease;
        }

        .btn-outline:hover {
          background: var(--theme-accent);
          color: #ffffff;
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
          background: linear-gradient(145deg,
            color-mix(in srgb, var(--theme-glass-bg) 70%, transparent) 0%,
            color-mix(in srgb, var(--theme-bg-solid) 60%, transparent) 100%);
          border-radius: 20px;
          will-change: transform, opacity;
        }

        .why__heading {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--theme-text) 0%, var(--theme-accent) 70%, var(--theme-accent-hover) 100%);
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
          background: var(--theme-glass-bg);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid var(--theme-glass-border);
          box-shadow:
            0 4px 16px rgba(0,0,0,0.12),
            inset 0 1px 0 var(--theme-glass-inset-light);
          will-change: transform, opacity;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }

        .why__feature:hover {
          background: var(--theme-glass-bg);
          border-color: color-mix(in srgb, var(--theme-accent) 30%, transparent);
          box-shadow:
            0 12px 32px color-mix(in srgb, var(--theme-accent) 20%, transparent),
            0 4px 16px rgba(0,0,0,0.15),
            inset 0 1px 0 var(--theme-glass-inset-light);
          transform: translateX(8px);
        }

        .why__feature-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, color-mix(in srgb, var(--theme-accent) 25%, transparent), color-mix(in srgb, var(--theme-accent) 10%, transparent));
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--theme-accent) 25%, transparent);
          color: var(--theme-accent);
          box-shadow:
            0 4px 12px color-mix(in srgb, var(--theme-accent) 20%, transparent),
            inset 0 1px 0 var(--theme-glass-inset-light);
          transition: all 0.3s ease;
        }

        .why__feature:hover .why__feature-icon {
          background: linear-gradient(135deg, color-mix(in srgb, var(--theme-accent) 35%, transparent), color-mix(in srgb, var(--theme-accent) 20%, transparent));
          border-color: color-mix(in srgb, var(--theme-accent) 45%, transparent);
          box-shadow:
            0 8px 20px color-mix(in srgb, var(--theme-accent) 30%, transparent),
            inset 0 1px 0 var(--theme-glass-inset-light);
          transform: scale(1.05);
        }

        .why__feature-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--theme-text);
          margin-bottom: 4px;
        }

        .why__feature-desc {
          font-size: 14px;
          color: var(--theme-text-muted);
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
          background: var(--theme-glass-bg);
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
          background: linear-gradient(135deg, color-mix(in srgb, var(--theme-accent) 40%, transparent), color-mix(in srgb, var(--theme-accent) 20%, transparent), color-mix(in srgb, var(--theme-accent) 40%, transparent));
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
          background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--theme-accent) 60%, transparent), transparent);
          animation: contact-shimmer 3s ease-in-out infinite;
        }

        @keyframes border-rotate {
          0% { background: linear-gradient(0deg, color-mix(in srgb, var(--theme-accent) 45%, transparent), color-mix(in srgb, var(--theme-accent-hover) 25%, transparent), color-mix(in srgb, var(--theme-accent) 45%, transparent)); }
          25% { background: linear-gradient(90deg, color-mix(in srgb, var(--theme-accent) 45%, transparent), color-mix(in srgb, var(--theme-accent-hover) 25%, transparent), color-mix(in srgb, var(--theme-accent) 45%, transparent)); }
          50% { background: linear-gradient(180deg, color-mix(in srgb, var(--theme-accent) 45%, transparent), color-mix(in srgb, var(--theme-accent-hover) 25%, transparent), color-mix(in srgb, var(--theme-accent) 45%, transparent)); }
          75% { background: linear-gradient(270deg, color-mix(in srgb, var(--theme-accent) 45%, transparent), color-mix(in srgb, var(--theme-accent-hover) 25%, transparent), color-mix(in srgb, var(--theme-accent) 45%, transparent)); }
          100% { background: linear-gradient(360deg, color-mix(in srgb, var(--theme-accent) 45%, transparent), color-mix(in srgb, var(--theme-accent-hover) 25%, transparent), color-mix(in srgb, var(--theme-accent) 45%, transparent)); }
        }

        @keyframes contact-shimmer {
          0%, 100% { opacity: 0.4; width: 150px; }
          50% { opacity: 0.8; width: 250px; }
        }

        .contact__heading {
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--theme-text) 0%, var(--theme-accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .contact__text {
          font-size: 18px;
          color: var(--theme-text-muted);
          margin-bottom: 32px;
        }

        .contact__ctas {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        /* ==== RESPONSIVE ==== */
        @media (max-width: 1024px) {
          .stats__grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .why__container {
            grid-template-columns: 1fr;
            gap: 48px;
          }
        }

        @media (max-width: 640px) {
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
      `}</style >
    </>
  );
}
