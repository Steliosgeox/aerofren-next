"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import AeroTransitionSection from "@/components/AeroTransitionSection";
import { gsap, useGSAP, EASE, SplitText } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import {
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_HREF,
  FOUNDING_YEAR,
  PRODUCT_COUNT,
} from "@/lib/constants/aerofren";
import { trackLeadEvent } from "@/lib/analytics";

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

const STATS_DATA = [
  { value: String(FOUNDING_YEAR), label: "Έτος Ίδρυσης", speed: 0.8 },
  { value: PRODUCT_COUNT, label: "Προϊόντα σε Stock", speed: 1.5 },
  { value: "500+", label: "Ενεργοί Συνεργάτες", speed: 1.2 },
  { value: "24ωρη", label: "Αποστολή", speed: 1.8 },
] as const;

export default function HomePageClient() {
  const statsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);
  const [contactInView, setContactInView] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [lowEndDevice] = useState(() => {
    if (typeof window === "undefined") return false;
    const navigatorInfo = window.navigator as Navigator & { deviceMemory?: number };
    const deviceMemory = navigatorInfo.deviceMemory ?? 4;
    const cpuCores = navigatorInfo.hardwareConcurrency ?? 4;
    return deviceMemory <= 4 || cpuCores <= 4;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(media.matches);
    updateMotion();

    media.addEventListener("change", updateMotion);

    return () => {
      media.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (!reduceMotion) return;

    const statsEl = statsRef.current;
    if (statsEl) {
      const items = statsEl.querySelectorAll(".stats__node, .stats__node-value-fill, .stats__ambient-text, .stats__glow");
      if (items.length) {
        items.forEach((item) => gsap.set(item, { clearProps: "all" }));
      }
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
      { rootMargin: "600px 0px" }
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
  // STATS: Zero Gravity Parallax & Liquid Fill
  // ============================================
  useGSAP(() => {
    if (!statsInView || reduceMotion) return;
    const stats = statsRef.current;
    if (!stats) return;

    const nodes = stats.querySelectorAll(".stats__node");
    const fills = stats.querySelectorAll(".stats__node-value-fill");
    const ambientTexts = stats.querySelectorAll(".stats__ambient-text");

    // 1. Asymmetrical Parallax floating
    nodes.forEach((node, i) => {
      const speed = parseFloat(node.getAttribute("data-speed") || "1");
      const fill = fills[i];

      // Node floats upwards at varying speeds based on data-speed
      gsap.fromTo(node,
        { y: 150 * speed },
        {
          y: -150 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: stats,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        }
      );

      // Node liquid fill (clip-path animates in)
      if (fill) {
        gsap.fromTo(fill,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: node,
              start: "top 85%",
              end: "top 30%",
              scrub: 1, // slight smoothing on the fill
            }
          }
        );
      }
    });

    // 2. Ambient Text Reveal (Massive background text)
    if (ambientTexts.length) {
      ambientTexts.forEach((text) => {
        // use SplitText if available for character flip
        try {
          const split = new SplitText(text, { type: "chars" });
          gsap.fromTo(split.chars,
            { opacity: 0, rotateX: -90, y: 50 },
            {
              opacity: 0.04, // extremely subtle
              rotateX: 0,
              y: 0,
              duration: 1.5,
              stagger: 0.05,
              ease: "power4.out",
              scrollTrigger: {
                trigger: stats,
                start: "top 60%", // triggers when section is well in view
                toggleActions: "play none none reverse",
              }
            }
          );
        } catch {
          // Fallback if SplitText fails
          gsap.fromTo(text,
            { opacity: 0, y: 50 },
            { opacity: 0.04, y: 0, duration: 2, ease: "power3.out", scrollTrigger: { trigger: stats, start: "top 60%" } }
          );
        }
      });
    }

  }, { scope: statsRef, dependencies: [statsInView, reduceMotion] });

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

  return (
    <>
      {/* ============================================
          HERO SECTION - Three.js Nexus Metaballs
          ============================================ */}
      <NexusHero />

      {/* ============================================
          AERO TRANSITION - Sprite-driven scroll bridge
          ============================================ */}
      <AeroTransitionSection />

      {/* ============================================
          STATS SECTION - Zero Gravity Parallax
          ============================================ */}
      <section ref={statsRef} className="stats">

        {/* Ambient Glowing Background */}
        <div className="stats__ambient-bg">
          <div className="stats__ambient-text">ΑΡΙΘΜΟΙ</div>
          <div className="stats__ambient-text">ΠΟΥ ΜΙΛΟΥΝ</div>
        </div>

        <div className="stats__nodes-container">
          {STATS_DATA.map((stat, index) => (
            <div
              key={stat.label}
              className={`stats__node stats__node--${index + 1}`}
              data-speed={stat.speed}
              suppressHydrationWarning
            >
              {/* Aesthetic Glowing Orb */}
              <div className="stats__glow"></div>

              <div className="stats__node-content">
                <div className="stats__node-value-wrap">
                  {/* Hollow Base Text */}
                  <span className="stats__node-value-hollow" aria-hidden="true">
                    {stat.value}
                  </span>
                  {/* Liquid Gradient Fill */}
                  <span className="stats__node-value-fill">
                    {stat.value}
                  </span>
                </div>
                <div className="stats__node-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================
          HORIZONTAL GALLERY - GSAP-driven scroll
          ============================================ */}
      <HorizontalGallery />

      {/* ============================================
          SCROLL ANIMATION - Premium grid reveal
          ============================================ */}
      <ScrollAnimation />

      {/* ============================================
          CONTACT - Scale entrance
          ============================================ */}
      <section ref={contactRef} className="contact">
        <div className="contact__container">
          <div data-contact-card className="contact__card">
            <h2 className="contact__heading">Ζητήστε Προσφορά</h2>
            <p className="contact__text">
              Επικοινωνήστε μαζί μας για τιμές χονδρικής και ειδικές προσφορές.
            </p>
            <div className="contact__ctas">
              <Button asChild variant="glass-accent" size="hero">
                <a
                  href={BUSINESS_PHONE_HREF}
                  onClick={() =>
                    trackLeadEvent("phone_click", {
                      location: "home_contact_card",
                      page_type: "home",
                    })
                  }
                >
                  📞 {BUSINESS_PHONE_DISPLAY}
                </a>
              </Button>
              <Button asChild variant="glass-secondary" size="hero">
                <Link href="/contact">Φόρμα Επικοινωνίας</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          INLINE STYLES (Scoped to this component)
          ============================================ */}
      <style jsx>{`
        /* ==== STATS (Zero Gravity Parallax) ==== */
        .stats {
          position: relative;
          min-height: 150vh;
          background: transparent;
          overflow: hidden;
          padding: 0;
        }

        .stats__ambient-bg {
          position: sticky;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 0;
        }

        .stats__ambient-text {
          font-size: clamp(4rem, 15vw, 12rem);
          font-weight: 900;
          line-height: 0.9;
          color: var(--theme-text);
          text-align: center;
          white-space: nowrap;
          opacity: 0;
          will-change: transform, opacity;
          /* Optional outline texture for background text */
          -webkit-text-stroke: 1px color-mix(in srgb, var(--theme-text) 20%, transparent);
          color: transparent;
        }

        .stats__nodes-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          max-width: 1600px;
          margin: 0 auto;
          z-index: 1;
        }

        .stats__node {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: transform;
        }

        /* Asymmetric initial positioning */
        .stats__node--1 { top: 10%; left: 5%; }
        .stats__node--2 { top: 35%; right: 10%; }
        .stats__node--3 { top: 60%; left: 15%; }
        .stats__node--4 { top: 85%; right: 5%; }

        .stats__node-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stats__node-value-wrap {
          position: relative;
          display: inline-block;
          line-height: 1;
        }

        .stats__node-value-hollow {
          font-size: clamp(5rem, 10vw, 10rem);
          font-weight: 900;
          color: transparent;
          -webkit-text-stroke: 1.5px color-mix(in srgb, var(--theme-accent) 40%, transparent);
          letter-spacing: -0.04em;
        }

        .stats__node-value-fill {
          position: absolute;
          top: 0;
          left: 0;
          font-size: clamp(5rem, 10vw, 10rem);
          font-weight: 900;
          background: linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-accent-hover) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.04em;
          clip-path: inset(100% 0% 0% 0%);
          will-change: clip-path;
        }

        .stats__node-label {
          margin-top: 1.5rem;
          font-size: 13px;
          font-weight: 700;
          color: var(--theme-text);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          background: color-mix(in srgb, var(--theme-glass-bg) 60%, transparent);
          padding: 10px 20px;
          border-radius: 100px;
          border: 1px solid color-mix(in srgb, var(--theme-glass-border) 40%, transparent);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 30px rgba(0,0,0,0.1);
        }

        .stats__glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--theme-accent) 25%, transparent) 0%, transparent 60%);
          filter: blur(40px);
          z-index: 0;
          pointer-events: none;
          animation: pulse-glow 8s ease-in-out infinite alternate;
        }

        /* Stagger orb animations slightly for organic feel */
        .stats__node--2 .stats__glow { animation-delay: -2s; background: radial-gradient(circle, color-mix(in srgb, var(--theme-accent-hover) 20%, transparent) 0%, transparent 60%); }
        .stats__node--3 .stats__glow { animation-delay: -4s; }
        .stats__node--4 .stats__glow { animation-delay: -6s; background: radial-gradient(circle, color-mix(in srgb, var(--theme-accent-hover) 20%, transparent) 0%, transparent 60%); }

        @keyframes pulse-glow {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
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
          .stats {
            min-height: 200vh;
          }
          .stats__node--1 { top: 5%; left: 5%; }
          .stats__node--2 { top: 30%; right: 5%; left: auto; }
          .stats__node--3 { top: 55%; left: 5%; }
          .stats__node--4 { top: 80%; right: 5%; left: auto; }
        }

        @media (max-width: 640px) {
          .stats {
            min-height: 250vh;
          }
          .stats__ambient-text {
            font-size: clamp(3rem, 15vw, 8rem);
            white-space: normal;
            word-break: break-all;
            padding: 0 20px;
          }
          
          .stats__node--1 { top: 5%; left: 50%; transform: translateX(-50%); }
          .stats__node--2 { top: 30%; right: auto; left: 50%; transform: translateX(-50%); }
          .stats__node--3 { top: 55%; left: 50%; transform: translateX(-50%); }
          .stats__node--4 { top: 80%; right: auto; left: 50%; transform: translateX(-50%); }

          .stats__node-value-hollow, .stats__node-value-fill {
            font-size: 5rem;
          }

          .contact {
            padding: 80px 24px;
          }

          .contact__card {
            padding: 40px 24px;
          }

          .contact__ctas {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
