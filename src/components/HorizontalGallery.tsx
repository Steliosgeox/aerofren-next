"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  getProductShowcaseCount,
  productShowcaseNavigationItems,
} from "@/data/product-showcase";
import { debounce } from "@/lib/debounce";

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

const galleryProducts = productShowcaseNavigationItems;
const showcaseCount = getProductShowcaseCount();

export default function HorizontalGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    const debouncedCheckDesktop = debounce(checkDesktop, 100);
    checkDesktop();
    window.addEventListener("resize", debouncedCheckDesktop, { passive: true });
    return () => {
      debouncedCheckDesktop.cancel();
      window.removeEventListener("resize", debouncedCheckDesktop);
    };
  }, []);

  useLayoutEffect(() => {
    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isMounted || !isDesktop) return;

    const section = sectionRef.current;
    const strip = stripRef.current;
    if (!section || !strip) return;

    let resizeTimeout: NodeJS.Timeout | null = null;
    let resizeHandler: (() => void) | null = null;
    let initTimer: NodeJS.Timeout | null = null;

    const initGSAP = async () => {
      try {
        const { gsap, ScrollTrigger } = await import("@/lib/gsap/client");

        const getScrollLength = () => strip.scrollWidth - window.innerWidth;
        let horizontalScrollLength = getScrollLength();

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

        resizeHandler = () => {
          horizontalScrollLength = getScrollLength();
          if (resizeTimeout) clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 150);
        };

        window.addEventListener("resize", resizeHandler);
        setTimeout(() => ScrollTrigger.refresh(), 100);
      } catch {
        console.warn("GSAP not available, falling back to CSS scroll");
      }
    };

    initTimer = setTimeout(initGSAP, 100);

    return () => {
      if (initTimer) clearTimeout(initTimer);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, [isMounted, isDesktop]);

  // Elegant GSAP scroll entrance animation for the text & gallery container
  useEffect(() => {
    if (!isMounted) return;
    
    let textStRef: ScrollTrigger | null = null;
    let galleryStRef: ScrollTrigger | null = null;

    const initTextAnimation = async () => {
      try {
        const { gsap, ScrollTrigger } = await import("@/lib/gsap/client");
        
        // 1. Text stagger reveal for the header
        const headerElements = document.querySelectorAll('.gallery-label, .gallery-heading, .gallery-subheading');
        if (headerElements.length > 0) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: '.gallery-header',
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          });
          
          tl.fromTo(
            headerElements,
            { opacity: 0, y: 30, rotationX: 10, transformOrigin: 'top center' },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              duration: 1.2,
              stagger: 0.15,
              ease: 'power3.out',
            }
          );
          textStRef = tl.scrollTrigger ?? null;
        }

        // 2. Smooth fade line up for the gallery strip itself
        const strip = document.querySelector('.horiz-gallery-wrapper');
        if (strip) {
          const tl2 = gsap.timeline({
            scrollTrigger: {
              trigger: strip,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            }
          });
          
          tl2.fromTo(
            strip,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1.4,
              ease: 'power4.out',
            }
          );
          galleryStRef = tl2.scrollTrigger ?? null;
        }
      } catch (err) {
        console.warn('GSAP text animation fallback to CSS');
      }
    };
    
    // Give DOM a tick to paint
    const timer = setTimeout(initTextAnimation, 50);

    return () => {
      clearTimeout(timer);
      if (textStRef) textStRef.kill();
      if (galleryStRef) galleryStRef.kill();
    };
  }, [isMounted]);

  return (
    <>
      <style jsx global>{`
        #portfolio {
          position: relative;
          overflow: hidden;
          z-index: 10;
        }

        .gallery-container {
          width: 100%;
          padding: 0;
          margin: 0 auto;
        }

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

        .horiz-gallery-wrapper {
          position: relative;
          width: 100%;
          overflow: visible;
        }

        .horiz-gallery-strip {
          display: flex;
          flex-wrap: nowrap;
          gap: 1.25rem;
          padding: 40px 48px 60px;
        }

        .product-card-wrap {
          width: 300px;
          min-width: 280px;
          max-width: 340px;
          flex-shrink: 0;
        }

        .product-card {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          opacity: 1 !important;
          visibility: visible !important;
          background: linear-gradient(
            145deg,
            rgba(15, 25, 45, 0.85) 0%,
            rgba(10, 18, 35, 0.95) 100%
          );
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

        .product-card-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.25rem;
          z-index: 2;
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

        /* LARGE DESKTOP (1440px+) */
        @media (min-width: 1440px) {
          .product-card-wrap {
            width: 22vw;
            min-width: 300px;
            max-width: 380px;
          }
        }

        /* DESKTOP (1024px – 1439px) */
        @media (min-width: 1024px) and (max-width: 1439px) {
          .product-card-wrap {
            width: 26vw;
            min-width: 280px;
            max-width: 340px;
          }
        }

        /* TABLET (768px – 1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .gallery-header {
            padding: 60px 32px 32px;
          }

          .horiz-gallery-wrapper {
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .horiz-gallery-wrapper::-webkit-scrollbar {
            display: none;
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

        /* MOBILE (< 768px) */
        @media (max-width: 767px) {
          #portfolio {
            padding-bottom: 40px;
          }

          .gallery-header {
            padding: 40px 20px 24px;
            text-align: center;
          }

          .gallery-subheading {
            display: none;
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
            transform: none !important;
          }

          .product-card-wrap {
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
          }

          .product-card {
            aspect-ratio: 3 / 4;
          }

          .product-card-label-el {
            font-size: 13px;
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

      <section id="portfolio" ref={sectionRef}>
        <div className="gallery-container">
          <div className="gallery-header">
            <span className="gallery-label">Κατάλογος Προϊόντων</span>
            <h2 className="gallery-heading">Εξαρτήματα υψηλών προδιαγραφών</h2>
            <p className="gallery-subheading">Σύρτε για να δείτε όλα τα προϊόντα μας</p>
          </div>

          <div className="horiz-gallery-wrapper">
            <div ref={stripRef} className="horiz-gallery-strip">
              {galleryProducts.map((item) => (
                <div key={item.id} className="product-card-wrap">
                  <Link href={item.href} className="product-card">
                    <div className="product-card-image-wrap">
                      <Image
                        src={item.image}
                        alt={item.nameEl}
                        fill
                        className="product-card-image"
                        sizes="(max-width: 767px) 50vw, (max-width: 1023px) 45vw, (max-width: 1439px) 26vw, 22vw"
                      />
                    </div>
                    <div className="product-card-overlay" />
                    <div className="product-card-shine" />
                    <div className="product-card-content">
                      <span className="product-card-label-el">{item.nameEl}</span>
                    </div>
                  </Link>
                </div>
              ))}

              {/* CTA Card */}
              <div className="product-card-wrap cta-wrap">
                <Link href="/products" className="product-card">
                  <div className="cta-content">
                    <span className="cta-number">{showcaseCount}</span>
                    <span className="cta-text">Κατηγορίες Προϊόντων</span>
                    <span className="cta-action">
                      Δείτε τον κατάλογο
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
