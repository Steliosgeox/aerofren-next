"use client";

import { forwardRef } from "react";
import Image from "next/image";

/**
 * WebPBackground Component
 * 
 * Premium animated WebP background for Hero & Stats sections.
 * Fixed position, fades out as user scrolls past Stats section.
 * 
 * Layer hierarchy:
 * - waves-background: z-index -1 (global, always visible)
 * - webp-background: z-index 0 (fades on scroll)
 * - content: z-index 1+ (hero, stats, etc.)
 */
const WebPBackground = forwardRef<HTMLDivElement>((_, ref) => {
    return (
        <>
            <div
                ref={ref}
                className="webp-bg-container"
                aria-hidden="true"
            >
                <Image
                    src="/webpfrontpage.webp"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    style={{ objectFit: 'cover' }}
                    quality={85}
                />
                {/* Subtle gradient overlay for depth */}
                <div className="webp-bg-overlay" />
            </div>

            <style jsx global>{`
        /* WebP Background Container */
        .webp-bg-container {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          will-change: opacity, transform;
          overflow: hidden;
        }

        /* Depth overlay - subtle vignette effect */
        .webp-bg-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 40%,
            rgba(0, 0, 0, 0.2) 100%
          );
          pointer-events: none;
        }

        /* Ensure Next.js Image fills container */
        .webp-bg-container img {
          object-fit: cover;
          object-position: center;
        }
      `}</style>
        </>
    );
});

WebPBackground.displayName = "WebPBackground";

export default WebPBackground;
