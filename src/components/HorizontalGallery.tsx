"use client";

import { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger, Draggable, InertiaPlugin, Observer } from "@/lib/gsap/client";

/**
 * HorizontalGallery Component
 * 
 * EXACT implementation from the user's example code.
 * Uses ScrollSmoother + ScrollTrigger for smooth horizontal scrolling.
 * Cards are 33vw with 2rem padding, images are 1:1 aspect ratio.
 */

// Gallery items - using /gallery/*.svg images
const galleryImages = [
  { src: "/gallery/1.svg", alt: "Category 1", label: "Κατηγορία 1", labelEn: "Category 1" },
  { src: "/gallery/2.svg", alt: "Category 2", label: "Κατηγορία 2", labelEn: "Category 2" },
  { src: "/gallery/3.svg", alt: "Category 3", label: "Κατηγορία 3", labelEn: "Category 3" },
  { src: "/gallery/4.svg", alt: "Category 4", label: "Κατηγορία 4", labelEn: "Category 4" },
  { src: "/gallery/5.svg", alt: "Category 5", label: "Κατηγορία 5", labelEn: "Category 5" },
  { src: "/gallery/6.svg", alt: "Category 6", label: "Κατηγορία 6", labelEn: "Category 6" },
  { src: "/gallery/7.svg", alt: "Category 7", label: "Κατηγορία 7", labelEn: "Category 7" },
  { src: "/gallery/8.svg", alt: "Category 8", label: "Κατηγορία 8", labelEn: "Category 8" },
];

export default function HorizontalGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return;

    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const strip = stripRef.current;

    if (!section || !wrapper || !strip) return;

    // Capture references for use in closure
    const wrapperEl = wrapper;
    const stripEl = strip;

    // Give browser time to render and calculate widths
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
      // SCROLL-LINKED ANIMATION (Original behavior)
      // Pin section and translate strip on scroll
      // ============================================
      const scrollTrigger = ScrollTrigger.create({
        trigger: section,
        pin: section,
        pinSpacing: true,
        start: "top top",
        end: () => `+=${pinWrapWidth}`,
        invalidateOnRefresh: true,
        scrub: true,
        onUpdate: (self) => {
          // Sync strip position with scroll progress
          gsap.set(stripEl, {
            x: -horizontalScrollLength * self.progress,
          });
        },
      });

      // ============================================
      // DRAGGABLE + INERTIA (Desktop: Click & Drag)
      // Physics-based momentum for satisfying deceleration
      // ============================================
      const isMobile = window.innerWidth < 768;

      if (!isMobile) {
        draggableInstance = Draggable.create(stripEl, {
          type: "x",
          bounds: {
            minX: -horizontalScrollLength,
            maxX: 0,
          },
          inertia: true, // Physics-based momentum on release
          edgeResistance: 0.85, // Resistance at edges
          throwResistance: 2000, // How quickly it slows down
          cursor: "grab",
          activeCursor: "grabbing",
          onDrag: function () {
            // Sync ScrollTrigger progress with drag position
            const progress = -this.x / horizontalScrollLength;
            scrollTrigger.scroll(scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress);
          },
          onThrowUpdate: function () {
            // Sync during inertia throw
            const progress = -this.x / horizontalScrollLength;
            scrollTrigger.scroll(scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress);
          },
        });

        // Add visual feedback class
        stripEl.style.cursor = "grab";
        stripEl.classList.add("draggable-strip");
      }

      // ============================================
      // OBSERVER (Mobile: Natural Swipe Gestures)
      // Smooth touch-driven horizontal scrolling
      // ============================================
      if (isMobile) {
        let velocityX = 0;
        let targetX = 0;
        let currentX = 0;

        observerInstance = Observer.create({
          target: wrapper,
          type: "touch,pointer",
          dragMinimum: 5,
          onChangeX: (self) => {
            // Accumulate velocity for momentum
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
              duration: 0.4,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
          onDragEnd: () => {
            // Apply momentum on release
            const momentumX = velocityX * 0.3;
            targetX = gsap.utils.clamp(
              -horizontalScrollLength,
              0,
              currentX + momentumX
            );
            currentX = targetX;

            gsap.to(stripEl, {
              x: currentX,
              duration: 1.2,
              ease: "power3.out",
              overwrite: "auto",
              onUpdate: () => {
                // Sync scroll position
                const progress = -gsap.getProperty(stripEl, "x") / horizontalScrollLength;
                scrollTrigger.scroll(scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress);
              },
            });
          },
        });
      }

      ScrollTrigger.addEventListener("refreshInit", refresh);

      // Force a refresh after setup
      ScrollTrigger.refresh();

      // Return cleanup that captures all instances
      return () => {
        scrollTrigger.kill();
        if (draggableInstance) {
          draggableInstance.forEach(d => d.kill());
        }
        if (observerInstance) {
          observerInstance.kill();
        }
      };
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <>
      {/* CSS - Exact match to user's example */}
      <style jsx global>{`
        /* Base reset for horizontal gallery section */
        #portfolio {
          position: relative;
          overflow: hidden;
          text-align: center;
          z-index: 10; /* Prevent other sections from overlapping */
        }

        .container-fluid {
          width: 100%;
          padding-right: 0;
          padding-left: 0;
          margin-right: auto;
          margin-left: auto;
        }

        /* Horizontal gallery structure - EXACT from user's example */
        .horiz-gallery-strip,
        .horiz-gallery-wrapper {
          display: flex;
          flex-wrap: nowrap;
          will-change: transform;
          position: relative;
          background: transparent;
        }

        .horiz-gallery-wrapper {
          min-height: 100vh;
          align-items: center;
        }

        /* Draggable gallery - cursor feedback */
        .horiz-gallery-strip.draggable-strip {
          cursor: grab;
          user-select: none;
          -webkit-user-select: none;
        }

        .horiz-gallery-strip.draggable-strip:active {
          cursor: grabbing;
        }

        /* Smooth transform performance */
        .horiz-gallery-strip {
          transform: translateX(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Cards - 33vw with 2rem padding, EXACT from user's example */
        .project-wrap {
          width: 33vw;
          padding: 2rem;
          box-sizing: content-box;
          flex-shrink: 0;
        }

        .project-wrap img,
        .project-wrap .project-image-container {
          width: 100%;
          aspect-ratio: 1/1;
          object-fit: cover;
          border-radius: 16px;
          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.1) 0%,
            rgba(255,255,255,0.03) 50%,
            rgba(0,0,0,0.05) 100%
          );
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .project-wrap:hover img,
        .project-wrap:hover .project-image-container {
          transform: scale(1.02);
          box-shadow: 0 20px 60px rgba(0,102,204,0.3);
        }

        /* Label overlay */
        .project-label {
          position: absolute;
          bottom: 3rem;
          left: 2rem;
          right: 2rem;
          padding: 1.5rem;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .project-label-en {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #5cb8ff;
          margin-bottom: 4px;
        }

        .project-label-el {
          display: block;
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.02em;
        }

        /* Project card container */
        .project-card {
          position: relative;
          width: 100%;
        }

        /* Gallery header */
        .gallery-header {
          padding: 120px 48px 60px;
          text-align: left;
          background: transparent;
        }

        .gallery-label {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(0,102,204,0.15);
          color: #5cb8ff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .gallery-heading {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          margin: 0 0 12px;
        }

        .gallery-subheading {
          font-size: 15px;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }

        /* CTA Card */
        .project-cta .cta-card {
          width: 100%;
          aspect-ratio: 1/1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            145deg,
            rgba(0,102,204,0.2) 0%,
            rgba(0,102,204,0.05) 100%
          );
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0,102,204,0.3);
          border-radius: 16px;
          transition: all 0.4s ease;
        }

        .project-cta:hover .cta-card {
          border-color: rgba(0,102,204,0.6);
          background: linear-gradient(
            145deg,
            rgba(0,102,204,0.3) 0%,
            rgba(0,102,204,0.1) 100%
          );
          transform: scale(1.02);
        }

        .cta-number {
          font-size: 64px;
          font-weight: 800;
          color: #5cb8ff;
          line-height: 1;
        }

        .cta-text {
          font-size: 18px;
          color: rgba(255,255,255,0.6);
          margin-top: 8px;
        }

        .cta-action {
          font-size: 14px;
          font-weight: 600;
          color: #5cb8ff;
          margin-top: 24px;
          padding: 12px 24px;
          background: rgba(0,102,204,0.2);
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .project-cta:hover .cta-action {
          background: rgba(0,102,204,0.4);
        }

        /* Mobile fallback */
        @media (max-width: 768px) {
          .horiz-gallery-wrapper {
            flex-direction: column;
            align-items: stretch;
          }
          
          .horiz-gallery-strip {
            flex-wrap: wrap;
            transform: none !important;
          }

          .project-wrap {
            width: calc(50% - 1rem);
            padding: 0.5rem;
          }

          .gallery-header {
            padding: 60px 24px 40px;
          }
        }
      `}</style>

      {/* HTML structure - EXACT match to user's example */}
      <section id="portfolio" ref={sectionRef}>
        <div className="container-fluid">
          {/* Header */}
          <div className="gallery-header">
            <span className="gallery-label">ΚΑΤΗΓΟΡΙΕΣ ΠΡΟΪΟΝΤΩΝ</span>
            <h2 className="gallery-heading">Ανακαλύψτε τα Προϊόντα μας</h2>
            <p className="gallery-subheading">Σύρετε για να εξερευνήσετε τις κατηγορίες</p>
          </div>

          {/* Horizontal Gallery - wrapper gets pinned, strip moves horizontally */}
          <div ref={wrapperRef} className="horiz-gallery-wrapper">
            <div ref={stripRef} className="horiz-gallery-strip">
              {galleryImages.map((item, i) => (
                <div key={i} className="project-wrap">
                  <Link href="/products" className="project-card">
                    <div className="project-image-container">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        width={400}
                        height={400}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="project-label">
                      <span className="project-label-en">{item.labelEn}</span>
                      <span className="project-label-el">{item.label}</span>
                    </div>
                  </Link>
                </div>
              ))}

              {/* CTA Card at the end */}
              <div className="project-wrap project-cta">
                <Link href="/products" className="project-card">
                  <div className="cta-card">
                    <span className="cta-number">12</span>
                    <span className="cta-text">Κατηγορίες</span>
                    <span className="cta-action">Δες Όλες →</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
