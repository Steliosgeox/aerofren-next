"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, useGSAP, DURATION, EASE } from "@/lib/gsap";

/**
 * ProductHeroCard
 * 
 * Premium glass card for product display.
 * Apple-like depth with layered glass, soft shadows, and GSAP hover effects.
 * 
 * Variants:
 * - "hero": Large, homepage featured (aspect-square, full effects)
 * - "grid": Category tiles (aspect-4/3, lighter effects)
 */

interface ProductHeroCardProps {
    title: string;
    subtitle?: string;
    image: string;
    href: string;
    itemCount?: number;
    variant?: "hero" | "grid";
    className?: string;
}

export function ProductHeroCard({
    title,
    subtitle,
    image,
    href,
    itemCount,
    variant = "grid",
    className = "",
}: ProductHeroCardProps) {
    const cardRef = useRef<HTMLAnchorElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    // GSAP hover effects
    useGSAP(() => {
        if (!cardRef.current || !imageRef.current) return;

        const card = cardRef.current;
        const imageContainer = imageRef.current;
        const glow = glowRef.current;

        const handleEnter = () => {
            gsap.to(imageContainer, {
                scale: 1.04,
                y: -3,
                duration: DURATION.normal,
                ease: EASE.smooth,
            });
            if (glow) {
                gsap.to(glow, {
                    opacity: 1,
                    duration: DURATION.normal,
                    ease: EASE.smooth,
                });
            }
        };

        const handleLeave = () => {
            gsap.to(imageContainer, {
                scale: 1,
                y: 0,
                duration: DURATION.normal,
                ease: EASE.smooth,
            });
            if (glow) {
                gsap.to(glow, {
                    opacity: 0,
                    duration: DURATION.normal,
                    ease: EASE.smooth,
                });
            }
        };

        card.addEventListener("mouseenter", handleEnter);
        card.addEventListener("mouseleave", handleLeave);

        return () => {
            card.removeEventListener("mouseenter", handleEnter);
            card.removeEventListener("mouseleave", handleLeave);
        };
    }, { scope: cardRef });

    const isHero = variant === "hero";

    return (
        <Link
            ref={cardRef}
            href={href}
            className={`
        group relative block overflow-hidden
        ${isHero ? "aspect-square" : "aspect-[4/3]"}
        ${className}
      `}
            style={{
                background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid rgba(0, 40, 100, 0.06)",
                boxShadow: "var(--shadow-sm)",
                transition: "box-shadow 400ms cubic-bezier(0.4, 0, 0.2, 1), border-color 400ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        >
            {/* Top highlight gradient */}
            <div
                className="absolute inset-x-0 top-0 h-32 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.9) 0%, transparent 70%)",
                }}
            />

            {/* Hover glow effect */}
            <div
                ref={glowRef}
                className="absolute inset-0 pointer-events-none opacity-0"
                style={{
                    background: "radial-gradient(circle at 50% 30%, rgba(0, 102, 204, 0.08) 0%, transparent 60%)",
                }}
            />

            {/* Image container */}
            <div
                ref={imageRef}
                className={`
          relative w-full h-full flex items-center justify-center
          ${isHero ? "p-8" : "p-6"}
        `}
                style={{ willChange: "transform" }}
            >
                <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-contain drop-shadow-lg"
                        sizes={isHero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                    />
                </div>
            </div>

            {/* Content overlay */}
            <div
                className={`
          absolute inset-x-0 bottom-0
          ${isHero ? "p-6" : "p-4"}
        `}
                style={{
                    background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
                }}
            >
                <h3
                    className={`
            font-semibold text-slate-900
            ${isHero ? "text-xl" : "text-base"}
          `}
                    style={{
                        letterSpacing: "-0.015em",
                    }}
                >
                    {title}
                </h3>

                {subtitle && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {subtitle}
                    </p>
                )}

                {typeof itemCount === "number" && (
                    <span
                        className="text-xs font-medium text-slate-400 mt-2 block"
                        style={{ letterSpacing: "0.02em" }}
                    >
                        {itemCount.toLocaleString("el-GR")} προϊόντα
                    </span>
                )}
            </div>

            {/* Bottom edge highlight */}
            <div
                className="absolute inset-x-0 bottom-0 h-px"
                style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(0, 102, 204, 0.1) 50%, transparent 100%)",
                }}
            />

            {/* Hover border effect - handled by CSS */}
            <style jsx>{`
        a:hover {
          box-shadow: 
            0 20px 48px rgba(0, 40, 100, 0.12),
            0 8px 24px rgba(0, 40, 100, 0.08) !important;
          border-color: rgba(0, 102, 204, 0.15) !important;
        }
      `}</style>
        </Link>
    );
}

/**
 * ProductHeroCardSkeleton
 * Loading placeholder for ProductHeroCard
 */
export function ProductHeroCardSkeleton({ variant = "grid" }: { variant?: "hero" | "grid" }) {
    const isHero = variant === "hero";

    return (
        <div
            className={`
        relative overflow-hidden animate-pulse
        ${isHero ? "aspect-square" : "aspect-[4/3]"}
      `}
            style={{
                background: "linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)",
                borderRadius: "var(--radius-lg)",
            }}
        >
            <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
        </div>
    );
}
