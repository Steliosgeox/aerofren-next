"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./HorizontalGallery.module.css";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { catalogCategories } from "@/data/catalog-taxonomy";

const DESKTOP_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const galleryProducts = catalogCategories.map((category) => ({
  id: category.slug,
  nameEl: category.nameEl,
  image: category.image,
  href: `/products/${category.slug}`,
}));
const showcaseCount = galleryProducts.length;

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: () => void) => void;
  removeListener?: (listener: () => void) => void;
};

function attachMediaListener(mediaQuery: MediaQueryList, onChange: () => void) {
  const legacyMediaQuery = mediaQuery as LegacyMediaQueryList;

  if (typeof legacyMediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }

  if (
    typeof legacyMediaQuery.addListener === "function" &&
    typeof legacyMediaQuery.removeListener === "function"
  ) {
    legacyMediaQuery.addListener(onChange);
    return () => legacyMediaQuery.removeListener?.(onChange);
  }

  return () => {};
}

export default function HorizontalGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const desktopMedia = window.matchMedia(DESKTOP_QUERY);
    const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);

    const syncMediaState = () => {
      setIsDesktop(desktopMedia.matches);
      setReduceMotion(reducedMotionMedia.matches);
    };

    syncMediaState();

    const detachDesktopListener = attachMediaListener(desktopMedia, syncMediaState);
    const detachMotionListener = attachMediaListener(reducedMotionMedia, syncMediaState);

    return () => {
      detachDesktopListener();
      detachMotionListener();
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(Boolean(entry?.isIntersecting));
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isDesktop || reduceMotion) return;

    const section = sectionRef.current;
    const strip = stripRef.current;
    if (!section || !strip) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const initDesktopGallery = async () => {
      try {
        const { gsap } = await import("@/lib/gsap/client");

        if (cancelled) return;

        const ctx = gsap.context(() => {
          let hitTestingDisabled = false;

          const enableHitTesting = () => {
            if (!hitTestingDisabled) return;

            hitTestingDisabled = false;
            strip.classList.remove(styles.stripHitless);
          };

          const disableHitTesting = () => {
            if (hitTestingDisabled) return;

            hitTestingDisabled = true;
            strip.classList.add(styles.stripHitless);
          };

          const hitTestReset = gsap.delayedCall(0.12, enableHitTesting).pause();

          const getScrollLength = () =>
            Math.max(strip.scrollWidth - window.innerWidth, 0);

          strip.style.willChange = "transform";

          gsap.to(strip, {
            x: () => -getScrollLength(),
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: section,
              pin: true,
              pinSpacing: true,
              start: "top top",
              end: () => `+=${Math.max(getScrollLength() * 1.2, 1)}`,
              scrub: 1.15,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              fastScrollEnd: true,
              onUpdate: () => {
                disableHitTesting();
                hitTestReset.restart(true);
              },
              onScrubComplete: () => {
                hitTestReset.pause(0);
                enableHitTesting();
              },
              onRefreshInit: enableHitTesting,
              onLeave: enableHitTesting,
              onLeaveBack: enableHitTesting,
            },
          });

          return () => {
            hitTestReset.kill();
            enableHitTesting();
            strip.style.removeProperty("will-change");
          };
        }, section);

        cleanup = () => ctx.revert();
      } catch {
        // Keep the CSS-first layout when GSAP fails to load.
      }
    };

    void initDesktopGallery();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [isDesktop, reduceMotion]);

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className={`${styles.portfolio} ${isInView ? styles.isVisible : ""}`}
    >
      <div className={styles.galleryContainer}>
        <div className={styles.galleryHeader}>
          <span className={`${styles.galleryLabel} ${styles.headerReveal}`}>
            Κατάλογος Προϊόντων
          </span>
          <h2 className={`${styles.galleryHeading} ${styles.headerReveal}`}>
            Εξαρτήματα υψηλών προδιαγραφών
          </h2>
          <p className={`${styles.gallerySubheading} ${styles.headerReveal}`}>
            Σύρτε για να δείτε τις βασικές SEO κατηγορίες του καταλόγου
          </p>
        </div>

        <div className={`${styles.horizGalleryWrapper} ${styles.galleryReveal}`}>
          <div ref={stripRef} className={styles.horizGalleryStrip}>
            {galleryProducts.map((item) => (
              <div key={item.id} className={styles.productCardWrap}>
                <TrackedLink
                  href={item.href}
                  className={styles.productCard}
                  eventName="category_cta_click"
                  eventParams={{
                    location: "horizontal_gallery",
                    page_type: "home",
                    category_slug: item.id,
                  }}
                >
                  <div className={styles.productCardImageWrap}>
                    <Image
                      src={item.image}
                      alt={item.nameEl}
                      fill
                      className={styles.productCardImage}
                      sizes="(max-width: 767px) 50vw, (max-width: 1023px) 45vw, (max-width: 1439px) 26vw, 22vw"
                      decoding="async"
                    />
                  </div>
                  <div className={styles.productCardOverlay} />
                  <div className={styles.productCardShine} />
                  <div className={styles.productCardContent}>
                    <span className={styles.productCardLabel}>{item.nameEl}</span>
                  </div>
                </TrackedLink>
              </div>
            ))}

            <div className={`${styles.productCardWrap} ${styles.ctaWrap}`}>
              <TrackedLink
                href="/products"
                className={styles.productCard}
                eventName="category_cta_click"
                eventParams={{ location: "horizontal_gallery", page_type: "home" }}
              >
                <div className={styles.ctaContent}>
                  <span className={styles.ctaNumber}>{showcaseCount}</span>
                  <span className={styles.ctaText}>SEO Κατηγορίες</span>
                  <span className={styles.ctaAction}>
                    Δείτε τον κατάλογο
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
                <div className={styles.productCardShine} />
              </TrackedLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
