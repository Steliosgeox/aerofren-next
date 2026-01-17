"use client";

import { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger, Draggable, Observer } from "@/lib/gsap/client";

/**
 * HorizontalGallery Component - Premium Product Showcase
 * 
 * COMPLETE OVERHAUL:
 * - Proper card sizing: 22vw width (4+ cards visible on desktop)
 * - 4:3 aspect ratio for optimal product display
 * - Dark glassmorphism matching site theme
 * - Enhanced GSAP animations with premium hover effects
 * - Responsive: Desktop scroll, mobile grid
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return;

    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const strip = stripRef.current;
    const cards = cardsRef.current.filter(Boolean);

    if (!section || !wrapper || !strip) return;

    const stripEl = strip;

    // Check if mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) return; // Skip horizontal scroll on mobile

    // Give browser time to render
    const timer = setTimeout(() => {
      let pinWrapWidth = 0;
      let horizontalScrollLength = 0;
      let draggableInstance: Draggable[] | null = null;
      let observerInstance: Observer | null = null;

      function refresh() {
        pinWrapWidth = stripEl.scrollWidth;
        horizontalScrollLength = pinWrapWidth - window.innerWidth;
      }

      refresh();

      // ============================================
      // CARD ENTRANCE ANIMATION
      // Staggered reveal with premium easing
      // ============================================
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        }
      });

      entranceTl.fromTo(cards,
        {
          y: 80,
          opacity: 0,
          scale: 0.92,
          rotateX: 15,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
        }
      );

      // ============================================
      // HORIZONTAL SCROLL with SCRUB
      // Smooth pinned scrolling
      // ============================================
      const scrollTrigger = ScrollTrigger.create({
        trigger: section,
        pin: section,
        pinSpacing: true,
        start: "top top",
        end: () => `+=${horizontalScrollLength * 1.2}`, // Slightly longer for smooth feel
        invalidateOnRefresh: true,
        scrub: 1.5, // Smooth scrubbing
        onUpdate: (self) => {
          gsap.set(stripEl, {
            x: -horizontalScrollLength * self.progress,
          });
        },
      });

      // ============================================
      // IMAGE PARALLAX within cards
      // Subtle depth as cards scroll past
      // ============================================
      cards.forEach((card) => {
        const img = card.querySelector('.product-card-image');
        if (img) {
          gsap.to(img, {
            y: -30,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "left 120%",
              end: "right -20%",
              scrub: true,
              containerAnimation: scrollTrigger.animation,
            }
          });
        }
      });

      // ============================================
      // DRAGGABLE (Desktop)
      // ============================================
      if (window.innerWidth >= 768) {
        draggableInstance = Draggable.create(stripEl, {
          type: "x",
          bounds: {
            minX: -horizontalScrollLength,
            maxX: 0,
          },
          inertia: true,
          edgeResistance: 0.85,
          throwResistance: 2000,
          cursor: "grab",
          activeCursor: "grabbing",
          onDrag: function () {
            const progress = -this.x / horizontalScrollLength;
            scrollTrigger.scroll(scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress);
          },
          onThrowUpdate: function () {
            const progress = -this.x / horizontalScrollLength;
            scrollTrigger.scroll(scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress);
          },
        });

        stripEl.style.cursor = "grab";
        stripEl.classList.add("draggable-strip");
      }

      // ============================================
      // TOUCH OBSERVER (Tablet ~768-1024px)
      // ============================================
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        let velocityX = 0;
        let targetX = 0;
        let currentX = 0;

        observerInstance = Observer.create({
          target: wrapper,
          type: "touch,pointer",
          dragMinimum: 5,
          onChangeX: (self) => {
            velocityX = self.velocityX || 0;
            targetX = gsap.utils.clamp(
              -horizontalScrollLength,
              0,
              currentX + (self.deltaX || 0) * 2
            );
          },
          onDrag: () => {
            currentX = targetX;
            gsap.to(stripEl, {
              x: currentX,
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
          onDragEnd: () => {
            const momentumX = velocityX * 0.3;
            targetX = gsap.utils.clamp(
              -horizontalScrollLength,
              0,
              currentX + momentumX
            );
            currentX = targetX;

            gsap.to(stripEl, {
              x: currentX,
              duration: 1,
              ease: "power3.out",
              overwrite: "auto",
              onUpdate: () => {
                const progress = -gsap.getProperty(stripEl, "x") / horizontalScrollLength;
                scrollTrigger.scroll(scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress);
              },
            });
          },
        });
      }

      ScrollTrigger.addEventListener("refreshInit", refresh);
      ScrollTrigger.refresh();

      return () => {
        // Kill main triggers and timelines
        scrollTrigger.kill();
        entranceTl.kill();
        if (draggableInstance) {
          draggableInstance.forEach(d => d.kill());
        }
        if (observerInstance) {
          observerInstance.kill();
        }
      };
    }, 100);

    // Store cleanup reference
    let innerCleanup: (() => void) | null = null;

    // Get the inner cleanup when timer resolves
    const originalTimer = timer;

    return () => {
      clearTimeout(originalTimer);
      // Kill any ScrollTriggers created by this component
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === section ||
            cards.some(card => trigger.vars.trigger === card)) {
          trigger.kill();
        }
      });
    };
  }, []);

  // 3D Tilt hover effect handler
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateX = (mouseY / rect.height) * -8; // Subtle tilt
    const rotateY = (mouseX / rect.width) * 8;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 800,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <>
      {/* Premium Dark Theme Styles */}
      <style jsx global>{`
        /* ============================================
           HORIZONTAL GALLERY - PREMIUM OVERHAUL
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

        /* GALLERY HEADER - Dark Theme */
        .gallery-header {
          padding: 80px 48px 40px;
          text-align: left;
          background: transparent;
        }

        .gallery-label {
          display: inline-block;
          padding: 8px 18px;
          background: rgba(0, 102, 204, 0.15);
          color: var(--brand-accent, #5cb8ff);
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

        /* HORIZONTAL SCROLL STRUCTURE */
        .horiz-gallery-wrapper {
          display: flex;
          flex-wrap: nowrap;
          will-change: transform;
          position: relative;
          background: transparent;
          min-height: 50vh; /* Reduced from 100vh */
          align-items: center;
          padding: 20px 0 60px;
        }

        .horiz-gallery-strip {
          display: flex;
          flex-wrap: nowrap;
          will-change: transform;
          position: relative;
          background: transparent;
          gap: 1.25rem;
          padding: 0 48px;
          transform: translateX(0);
          backface-visibility: hidden;
        }

        .horiz-gallery-strip.draggable-strip {
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
        }

        .horiz-gallery-strip.draggable-strip:active {
          cursor: grabbing;
        }

        /* ============================================
           PRODUCT CARDS - PREMIUM DARK GLASS
           Width: 22vw (4+ visible on desktop)
           Aspect: 4:3 (shorter, more elegant)
           ============================================ */
        
        .product-card-wrap {
          width: 22vw;
          min-width: 260px;
          max-width: 340px;
          flex-shrink: 0;
          perspective: 1000px;
        }

        .product-card {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          transform-style: preserve-3d;
          will-change: transform;
          
          /* Dark Glassmorphism */
          background: linear-gradient(
            145deg,
            rgba(15, 25, 45, 0.85) 0%,
            rgba(10, 18, 35, 0.95) 100%
          );
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            0 8px 32px rgba(0, 30, 80, 0.25),
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          
          transition: 
            box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1),
            border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: radial-gradient(
            ellipse 80% 50% at 50% 0%,
            rgba(92, 184, 255, 0.06) 0%,
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .product-card:hover {
          border-color: rgba(0, 102, 204, 0.4);
          box-shadow: 
            0 20px 48px rgba(0, 80, 160, 0.35),
            0 8px 24px rgba(0, 102, 204, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .product-card:hover::before {
          opacity: 1;
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
          inset: -10px; /* Slightly larger for parallax room */
          width: calc(100% + 20px);
          height: calc(100% + 20px);
          object-fit: cover;
          opacity: 0.85;
          transition: transform 0.5s ease, opacity 0.4s ease;
          will-change: transform;
        }

        .product-card:hover .product-card-image {
          transform: scale(1.08);
          opacity: 1;
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
          color: var(--brand-accent, #5cb8ff);
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

        /* SHINE EFFECT - Animated shimmer on hover */
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

        .product-card:hover .product-card-shine {
          opacity: 1;
          animation: card-shimmer 1.5s ease-in-out;
        }

        @keyframes card-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* ============================================
           CTA CARD (View All)
           ============================================ */
        
        .product-card-wrap.cta-wrap .product-card {
          background: linear-gradient(
            145deg,
            rgba(0, 102, 204, 0.2) 0%,
            rgba(0, 60, 140, 0.3) 100%
          );
          border-color: rgba(0, 102, 204, 0.3);
        }

        .product-card-wrap.cta-wrap .product-card:hover {
          background: linear-gradient(
            145deg,
            rgba(0, 102, 204, 0.3) 0%,
            rgba(0, 60, 140, 0.4) 100%
          );
          border-color: rgba(92, 184, 255, 0.5);
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
          color: var(--brand-accent, #5cb8ff);
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
          color: var(--brand-accent, #5cb8ff);
          padding: 10px 20px;
          background: rgba(0, 102, 204, 0.2);
          border: 1px solid rgba(92, 184, 255, 0.3);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .product-card:hover .cta-action {
          background: rgba(0, 102, 204, 0.4);
          border-color: rgba(92, 184, 255, 0.5);
          transform: translateX(4px);
        }

        /* ============================================
           RESPONSIVE DESIGN
           ============================================ */
        
        /* Tablet */
        @media (min-width: 768px) and (max-width: 1199px) {
          .product-card-wrap {
            width: 35vw;
            min-width: 280px;
            max-width: 400px;
          }

          .gallery-header {
            padding: 60px 32px 32px;
          }

          .horiz-gallery-strip {
            padding: 0 32px;
          }
        }

        /* Mobile - Vertical Grid */
        @media (max-width: 767px) {
          #portfolio {
            padding-bottom: 40px;
          }

          .gallery-header {
            padding: 40px 20px 24px;
            text-align: center;
          }

          .horiz-gallery-wrapper {
            min-height: auto;
            padding: 0 20px 20px;
          }

          .horiz-gallery-strip {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 0;
            transform: none !important;
          }

          .product-card-wrap {
            width: 100%;
            min-width: 0;
            max-width: none;
          }

          .product-card {
            aspect-ratio: 1 / 1; /* Square on mobile */
          }

          .product-card-label-el {
            font-size: 14px;
          }

          .product-card-label-en {
            font-size: 9px;
          }

          .product-card-content {
            padding: 1rem;
          }

          .cta-number {
            font-size: 36px;
          }

          .cta-text {
            font-size: 12px;
          }

          .cta-action {
            font-size: 12px;
            padding: 8px 14px;
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

          {/* Horizontal Gallery */}
          <div ref={wrapperRef} className="horiz-gallery-wrapper">
            <div ref={stripRef} className="horiz-gallery-strip">
              {galleryCategories.map((item, i) => (
                <div
                  key={i}
                  className="product-card-wrap"
                  ref={(el) => { if (el) cardsRef.current[i] = el; }}
                >
                  <Link
                    href={item.href}
                    className="product-card"
                    onMouseMove={(e) => handleMouseMove(e, i)}
                    onMouseLeave={() => handleMouseLeave(i)}
                  >
                    {/* Image */}
                    <div className="product-card-image-wrap">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        className="product-card-image"
                        sizes="(max-width: 767px) 50vw, (max-width: 1199px) 35vw, 22vw"
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
              <div
                className="product-card-wrap cta-wrap"
                ref={(el) => { if (el) cardsRef.current[galleryCategories.length] = el; }}
              >
                <Link
                  href="/products"
                  className="product-card"
                  onMouseMove={(e) => handleMouseMove(e, galleryCategories.length)}
                  onMouseLeave={() => handleMouseLeave(galleryCategories.length)}
                >
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
