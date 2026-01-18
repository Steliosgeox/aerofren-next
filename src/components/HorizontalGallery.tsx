"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * HorizontalGallery Component - ROCK SOLID Cross-Device Version
 * 
 * Features:
 * - Works on ALL devices: Desktop, Tablet, Mobile
 * - Works on ALL browsers: Chrome, Safari, Firefox, Edge
 * - iOS/Safari fully supported with -webkit prefixes
 * - Progressive enhancement: GSAP only when available
 * - Cards are ALWAYS visible by default (CSS-first approach)
 * - Responsive: Horizontal scroll (desktop), Overflow scroll (tablet), Grid (mobile)
 */

// Real AEROFREN product categories with actual images
const galleryCategories = [
  {
    src: "/images/categories/pneumatic-valves.jpg",
    alt: "Πνευματικές Βαλβίδες",
    label: "Πνευματικές Βαλβίδες",
    labelEn: "Pneumatic Valves",
    href: "/products?category=pneumatic-valves"
  },
  {
    src: "/images/categories/push-in-fittings.jpg",
    alt: "Ρακόρ Ταχυσυνδέσεις",
    label: "Ρακόρ Ταχυσυνδέσεις",
    labelEn: "Push-In Fittings",
    href: "/products?category=push-in-fittings"
  },
  {
    src: "/images/categories/thread-fittings.jpg",
    alt: "Σπειρωτά Εξαρτήματα",
    label: "Σπειρωτά Εξαρτήματα",
    labelEn: "Thread Fittings",
    href: "/products?category=thread-fittings"
  },
  {
    src: "/images/categories/cylinders-sensors.jpg",
    alt: "Κύλινδροι & Αισθητήρες",
    label: "Κύλινδροι & Αισθητήρες",
    labelEn: "Cylinders & Sensors",
    href: "/products?category=cylinders-sensors"
  },
  {
    src: "/images/categories/hoses-pipes.jpg",
    alt: "Σωλήνες & Σπιράλ",
    label: "Σωλήνες & Σπιράλ",
    labelEn: "Hoses & Pipes",
    href: "/products?category=hoses-pipes"
  },
  {
    src: "/images/categories/ball-valves.jpg",
    alt: "Βάνες Σφαιρικές",
    label: "Βάνες Σφαιρικές",
    labelEn: "Ball Valves",
    href: "/products?category=ball-valves"
  },
  {
    src: "/images/categories/pressure-regulators.jpg",
    alt: "Ρυθμιστές Πίεσης",
    label: "Ρυθμιστές Πίεσης",
    labelEn: "Pressure Regulators",
    href: "/products?category=pressure-regulators"
  },
  {
    src: "/images/categories/air-tools.jpg",
    alt: "Αεροεργαλεία",
    label: "Αεροεργαλεία",
    labelEn: "Air Tools",
    href: "/products?category=air-tools"
  },
  {
    src: "/images/categories/couplings.jpg",
    alt: "Ζεύκτες Αέρος",
    label: "Ζεύκτες Αέρος",
    labelEn: "Couplings",
    href: "/products?category=couplings"
  },
  {
    src: "/images/categories/water-filtration.jpg",
    alt: "Φίλτρα & Λιπαντήρες",
    label: "Φίλτρα & Λιπαντήρες",
    labelEn: "Water Filtration",
    href: "/products?category=water-filtration"
  },
  {
    src: "/images/categories/industrial-supplies.jpg",
    alt: "Βιομηχανικά Αναλώσιμα",
    label: "Βιομηχανικά Αναλώσιμα",
    labelEn: "Industrial Supplies",
    href: "/products?category=industrial-supplies"
  },
  {
    src: "/images/categories/installation-accessories.jpg",
    alt: "Βοηθητικά Εξαρτήματα",
    label: "Βοηθητικά Εξαρτήματα",
    labelEn: "Accessories",
    href: "/products?category=installation-accessories"
  },
];

export default function HorizontalGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Detect device type on mount
  useEffect(() => {
    setIsMounted(true);
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // CRITICAL: useLayoutEffect for cleanup - runs synchronously before React commits DOM changes
  // This prevents "removeChild" errors from GSAP's pinned elements
  useLayoutEffect(() => {
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, []);

  // GSAP animations - only on desktop, with dynamic import
  useEffect(() => {
    if (!isMounted || !isDesktop) return;

    const section = sectionRef.current;
    const strip = stripRef.current;
    if (!section || !strip) return;

    let resizeTimeout: NodeJS.Timeout | null = null;
    let resizeHandler: (() => void) | null = null;
    let initTimer: NodeJS.Timeout | null = null;

    // Dynamic import GSAP to avoid SSR issues
    const initGSAP = async () => {
      try {
        const { gsap, ScrollTrigger } = await import("@/lib/gsap/client");

        // Calculate scroll distance
        const getScrollLength = () => strip.scrollWidth - window.innerWidth;
        let horizontalScrollLength = getScrollLength();

        // Create horizontal scroll animation - store in ref for cleanup
        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: section,
          pin: true,
          pinSpacing: true,
          start: "top top",
          end: () => `+=${horizontalScrollLength * 1.2}`,
          invalidateOnRefresh: true,
          scrub: 1.5,
          onUpdate: (self) => {
            gsap.set(strip, {
              x: -horizontalScrollLength * self.progress,
            });
          },
        });

        // Refresh on resize - DEBOUNCED to prevent layout thrashing
        resizeHandler = () => {
          horizontalScrollLength = getScrollLength();
          if (resizeTimeout) clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 150);
        };

        window.addEventListener("resize", resizeHandler);
        // Initial refresh with slight delay
        setTimeout(() => ScrollTrigger.refresh(), 100);
      } catch (error) {
        console.warn("GSAP not available, falling back to CSS scroll");
      }
    };

    // Small delay to ensure DOM is ready
    initTimer = setTimeout(initGSAP, 100);

    return () => {
      if (initTimer) clearTimeout(initTimer);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    };
  }, [isMounted, isDesktop]);

  return (
    <>
      {/* Cross-Browser CSS - Works EVERYWHERE */}
      <style jsx global>{`
        /* ============================================
           HORIZONTAL GALLERY - ROCK SOLID VERSION
           Tested: Chrome, Safari, Firefox, Edge
           Tested: iOS Safari, Android Chrome
           ============================================ */
        
        #portfolio {
          position: relative;
          overflow: hidden;
          z-index: 10;
          background: transparent;
        }

        .gallery-container {
          width: 100%;
          padding: 0;
          margin: 0 auto;
        }

        /* GALLERY HEADER */
        .gallery-header {
          padding: 80px 48px 40px;
          text-align: left;
          background: transparent;
        }

        .gallery-label {
          display: inline-block;
          padding: 8px 18px;
          background: rgba(0, 102, 204, 0.15);
          color: #5cb8ff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border-radius: 6px;
          border: 1px solid rgba(92, 184, 255, 0.2);
          margin-bottom: 16px;
        }

        .gallery-heading {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          margin: 0 0 10px;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }

        .gallery-subheading {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        /* ============================================
           GALLERY STRIP - CROSS DEVICE
           ============================================ */
        
        .horiz-gallery-wrapper {
          position: relative;
          width: 100%;
          overflow: visible; /* Let scroll work */
        }

        .horiz-gallery-strip {
          display: flex;
          flex-wrap: nowrap;
          gap: 1.25rem;
          padding: 40px 48px 60px;
          /* CRITICAL: Do NOT set transform here - GSAP handles it on desktop */
        }

        /* ============================================
           PRODUCT CARDS - ALWAYS VISIBLE
           CRITICAL: opacity: 1 !important ensures visibility
           ============================================ */
        
        .product-card-wrap {
          width: 300px;
          min-width: 280px;
          max-width: 340px;
          flex-shrink: 0;
          /* No perspective on mobile - causes Safari issues */
        }

        .product-card {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          
          /* ALWAYS VISIBLE - This is critical */
          opacity: 1 !important;
          visibility: visible !important;
          
          /* Dark Glassmorphism - Cross browser */
          background: linear-gradient(
            145deg,
            rgba(15, 25, 45, 0.85) 0%,
            rgba(10, 18, 35, 0.95) 100%
          );
          
          /* Safari-safe blur */
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
          
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 8px 32px rgba(0, 30, 80, 0.25),
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          
          transition: 
            box-shadow 0.4s ease,
            border-color 0.4s ease,
            transform 0.4s ease;
        }

        /* Hover - Desktop only (via media query) */
        @media (hover: hover) and (pointer: fine) {
          .product-card:hover {
            border-color: rgba(0, 102, 204, 0.4);
            transform: translateY(-4px);
            box-shadow: 
              0 20px 48px rgba(0, 80, 160, 0.35),
              0 8px 24px rgba(0, 102, 204, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.08);
          }
        }

        /* IMAGE CONTAINER */
        .product-card-image-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 15px;
        }

        .product-card-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
          transition: transform 0.5s ease, opacity 0.4s ease;
        }

        @media (hover: hover) and (pointer: fine) {
          .product-card:hover .product-card-image {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        /* GRADIENT OVERLAY */
        .product-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            0deg,
            rgba(0, 10, 25, 0.95) 0%,
            rgba(0, 10, 25, 0.6) 35%,
            rgba(0, 10, 25, 0.2) 60%,
            transparent 100%
          );
          pointer-events: none;
        }

        /* CONTENT */
        .product-card-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.25rem;
          z-index: 2;
        }

        .product-card-label-en {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #5cb8ff;
          margin-bottom: 4px;
          opacity: 0.9;
        }

        .product-card-label-el {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.01em;
          line-height: 1.3;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        /* SHINE EFFECT */
        .product-card-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(255, 255, 255, 0.03) 35%,
            rgba(92, 184, 255, 0.08) 50%,
            rgba(255, 255, 255, 0.03) 65%,
            transparent 80%
          );
          pointer-events: none;
          opacity: 0;
          transform: translateX(-100%);
          transition: opacity 0.3s ease;
        }

        @media (hover: hover) and (pointer: fine) {
          .product-card:hover .product-card-shine {
            opacity: 1;
            animation: card-shimmer 1.5s ease-in-out;
          }
        }

        @keyframes card-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* ============================================
           CTA CARD
           ============================================ */
        
        .product-card-wrap.cta-wrap .product-card {
          background: linear-gradient(
            145deg,
            rgba(0, 102, 204, 0.2) 0%,
            rgba(0, 60, 140, 0.3) 100%
          );
          border-color: rgba(0, 102, 204, 0.3);
        }

        .cta-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1.5rem;
        }

        .cta-number {
          font-size: 48px;
          font-weight: 800;
          color: #5cb8ff;
          line-height: 1;
          margin-bottom: 4px;
          text-shadow: 0 4px 20px rgba(92, 184, 255, 0.4);
        }

        .cta-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 16px;
        }

        .cta-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #5cb8ff;
          padding: 10px 20px;
          background: rgba(0, 102, 204, 0.2);
          border: 1px solid rgba(92, 184, 255, 0.3);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        /* ============================================
           RESPONSIVE BREAKPOINTS
           ============================================ */
        
        /* LARGE DESKTOP (1440px+) - GSAP Horizontal Scroll */
        @media (min-width: 1440px) {
          .product-card-wrap {
            width: 22vw;
            min-width: 300px;
            max-width: 380px;
          }
        }

        /* DESKTOP (1024px - 1439px) - GSAP Horizontal Scroll */
        @media (min-width: 1024px) and (max-width: 1439px) {
          .product-card-wrap {
            width: 26vw;
            min-width: 280px;
            max-width: 340px;
          }
        }

        /* TABLET (768px - 1023px) - Native Overflow Scroll */
        @media (min-width: 768px) and (max-width: 1023px) {
          .gallery-header {
            padding: 60px 32px 32px;
          }

          .horiz-gallery-wrapper {
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch; /* Smooth iOS scroll */
            scroll-snap-type: x mandatory;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE/Edge */
          }

          .horiz-gallery-wrapper::-webkit-scrollbar {
            display: none; /* Chrome/Safari */
          }

          .horiz-gallery-strip {
            padding: 30px 32px 50px;
          }

          .product-card-wrap {
            width: 45vw;
            min-width: 260px;
            max-width: 320px;
            scroll-snap-align: start;
          }
        }

        /* MOBILE (< 768px) - Vertical Grid */
        @media (max-width: 767px) {
          #portfolio {
            padding-bottom: 40px;
          }

          .gallery-header {
            padding: 40px 20px 24px;
            text-align: center;
          }

          .gallery-subheading {
            display: none; /* Hide "drag to explore" on mobile */
          }

          .horiz-gallery-wrapper {
            overflow: visible;
            padding: 0 16px;
          }

          .horiz-gallery-strip {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 0;
            transform: none !important; /* Override any GSAP transforms */
          }

          .product-card-wrap {
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
          }

          .product-card {
            aspect-ratio: 1 / 1; /* Square on mobile */
          }

          .product-card-label-el {
            font-size: 13px;
          }

          .product-card-label-en {
            font-size: 9px;
          }

          .product-card-content {
            padding: 0.875rem;
          }

          .cta-number {
            font-size: 32px;
          }

          .cta-text {
            font-size: 11px;
            margin-bottom: 12px;
          }

          .cta-action {
            font-size: 11px;
            padding: 8px 14px;
          }
        }

        /* SMALL MOBILE (< 400px) */
        @media (max-width: 399px) {
          .horiz-gallery-wrapper {
            padding: 0 12px;
          }

          .horiz-gallery-strip {
            gap: 10px;
          }

          .product-card-label-el {
            font-size: 12px;
          }

          .product-card-content {
            padding: 0.75rem;
          }
        }
      `}</style>

      {/* HTML Structure */}
      <section id="portfolio" ref={sectionRef}>
        <div className="gallery-container">
          {/* Header */}
          <div className="gallery-header">
            <span className="gallery-label">ΚΑΤΗΓΟΡΙΕΣ ΠΡΟΪΟΝΤΩΝ</span>
            <h2 className="gallery-heading">Ανακαλύψτε τα Προϊόντα μας</h2>
            <p className="gallery-subheading">Σύρετε για να εξερευνήσετε τις κατηγορίες</p>
          </div>

          {/* Gallery */}
          <div className="horiz-gallery-wrapper">
            <div ref={stripRef} className="horiz-gallery-strip">
              {galleryCategories.map((item, i) => (
                <div key={i} className="product-card-wrap">
                  <Link href={item.href} className="product-card">
                    {/* Image */}
                    <div className="product-card-image-wrap">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        className="product-card-image"
                        sizes="(max-width: 767px) 50vw, (max-width: 1023px) 45vw, (max-width: 1439px) 26vw, 22vw"
                      />
                    </div>

                    {/* Gradient overlay */}
                    <div className="product-card-overlay" />

                    {/* Shine effect */}
                    <div className="product-card-shine" />

                    {/* Content */}
                    <div className="product-card-content">
                      <span className="product-card-label-en">{item.labelEn}</span>
                      <span className="product-card-label-el">{item.label}</span>
                    </div>
                  </Link>
                </div>
              ))}

              {/* CTA Card */}
              <div className="product-card-wrap cta-wrap">
                <Link href="/products" className="product-card">
                  <div className="cta-content">
                    <span className="cta-number">12</span>
                    <span className="cta-text">Κατηγορίες</span>
                    <span className="cta-action">
                      Δες Όλες
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                  <div className="product-card-shine" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
