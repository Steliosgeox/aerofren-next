"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/data/types";
import { gsap, useGSAP, DURATION, EASE } from "@/lib/gsap";

interface CategoryCardProps {
  category: Category;
  variant?: "default" | "compact" | "list";
}

/**
 * CategoryCard - Premium industrial design
 * 
 * Design principles:
 * - Glass-like card with subtle depth
 * - Clean product image presentation
 * - Professional typography hierarchy
 * - GSAP hover micro-interactions
 */
export function CategoryCard({ category, variant = "default" }: CategoryCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // GSAP hover effects for default variant
  useGSAP(() => {
    if (variant !== "default" || !cardRef.current) return;

    const card = cardRef.current;
    const imageContainer = imageRef.current;

    const handleEnter = () => {
      if (imageContainer) {
        gsap.to(imageContainer, {
          scale: 1.03,
          duration: DURATION.fast,
          ease: EASE.smooth,
        });
      }
    };

    const handleLeave = () => {
      if (imageContainer) {
        gsap.to(imageContainer, {
          scale: 1,
          duration: DURATION.fast,
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

  // Compact variant for sidebar/navigation
  if (variant === "compact") {
    return (
      <Link
        href={`/products/${category.slug}`}
        className="group flex items-center gap-3 p-3 bg-[var(--theme-glass-bg)] transition-colors hover:bg-[var(--theme-glass-bg)]"
        style={{ borderRadius: "var(--radius-md)" }}
      >
        <div
          className="w-10 h-10 overflow-hidden bg-[var(--theme-glass-bg)] shrink-0"
          style={{ borderRadius: "var(--radius-sm)" }}
        >
          <Image
            src={category.image}
            alt={category.nameEl}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-[var(--theme-text)] text-sm group-hover:text-[var(--theme-accent)] transition-colors truncate">
            {category.nameEl}
          </h3>
          <p className="text-xs text-[var(--theme-text-muted)]">
            {category.productCount.toLocaleString("el-GR")} προϊόντα
          </p>
        </div>
      </Link>
    );
  }

  // List variant
  if (variant === "list") {
    return (
      <Link
        href={`/products/${category.slug}`}
        className="group flex gap-4 p-4 bg-[var(--theme-glass-bg)] border border-[var(--theme-glass-border)] hover:border-[var(--theme-accent)] transition-all"
        style={{
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          className="w-20 h-20 overflow-hidden bg-[var(--theme-glass-bg)] shrink-0"
          style={{ borderRadius: "var(--radius-md)" }}
        >
          <Image
            src={category.image}
            alt={category.nameEl}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--theme-accent)] mb-1 group-hover:underline">
            {category.nameEl}
          </h3>
          <p className="text-sm text-[var(--theme-text-muted)] line-clamp-2 mb-2">
            {category.descriptionEl}
          </p>
          <p className="text-xs text-[var(--theme-text-muted)]">
            {category.productCount.toLocaleString("el-GR")} προϊόντα
          </p>
        </div>
      </Link>
    );
  }

  // Default variant - Premium glass card
  return (
    <Link
      ref={cardRef}
      href={`/products/${category.slug}`}
      className="group block bg-[var(--theme-glass-bg)] overflow-hidden transition-all duration-300"
      style={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--theme-glass-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Title section */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ borderBottom: "1px solid var(--theme-glass-border)" }}
      >
        <h3
          className="font-semibold text-[var(--theme-accent)] leading-snug group-hover:text-[var(--theme-accent-hover)] transition-colors"
          style={{
            fontSize: "15px",
            letterSpacing: "-0.01em",
          }}
        >
          {category.nameEl}
        </h3>
        {category.descriptionEl && (
          <p
            className="text-[var(--theme-text-muted)] mt-1 line-clamp-2"
            style={{ fontSize: "12px", lineHeight: "1.5" }}
          >
            {category.descriptionEl}
          </p>
        )}
      </div>

      {/* Product Image with glass treatment */}
      <div
        ref={imageRef}
        className="relative aspect-[4/3] overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, color-mix(in srgb, var(--theme-glass-bg) 75%, transparent) 0%, color-mix(in srgb, var(--theme-bg-solid) 70%, transparent) 100%)",
          willChange: "transform",
        }}
      >
        {/* Subtle top highlight */}
        <div
          className="absolute inset-x-0 top-0 h-16 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 100% at 50% 0%, color-mix(in srgb, var(--theme-glass-bg) 70%, transparent) 0%, transparent 70%)",
          }}
        />

        <Image
          src={category.image}
          alt={category.nameEl}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-4 drop-shadow-md"
        />
      </div>

      {/* Item count footer */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: "var(--theme-glass-bg)",
          borderTop: "1px solid var(--theme-glass-border)",
        }}
      >
        <p
          className="text-[var(--theme-text-muted)]"
          style={{ fontSize: "13px" }}
        >
          {category.productCount.toLocaleString("el-GR")} προϊόντα
        </p>
        <span
          className="text-[var(--theme-accent)] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ fontSize: "13px" }}
        >
          Δείτε όλα →
        </span>
      </div>

      {/* Hover effects via CSS */}
      <style jsx>{`
        a:hover {
          box-shadow: var(--shadow-lg) !important;
          border-color: color-mix(in srgb, var(--theme-accent) 35%, transparent) !important;
          transform: translateY(-4px);
        }
      `}</style>
    </Link>
  );
}

/**
 * FeaturedCategoryCard - Larger homepage variant
 */
export function FeaturedCategoryCard({ category }: { category: Category }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const imageContainer = imageRef.current;

    const handleEnter = () => {
      if (imageContainer) {
        gsap.to(imageContainer, {
          scale: 1.04,
          y: -2,
          duration: DURATION.normal,
          ease: EASE.smooth,
        });
      }
    };

    const handleLeave = () => {
      if (imageContainer) {
        gsap.to(imageContainer, {
          scale: 1,
          y: 0,
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

  return (
    <Link
      ref={cardRef}
      href={`/products/${category.slug}`}
      className="group block bg-[var(--theme-glass-bg)] overflow-hidden transition-all duration-300"
      style={{
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--theme-glass-border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Title section */}
      <div className="px-5 pt-5 pb-4">
        <h3
          className="font-bold text-[var(--theme-accent)] leading-tight group-hover:text-[var(--theme-accent-hover)] transition-colors"
          style={{
            fontSize: "18px",
            letterSpacing: "-0.015em",
          }}
        >
          {category.nameEl}
        </h3>
        <p
          className="text-[var(--theme-text-muted)] mt-2 line-clamp-2"
          style={{ fontSize: "14px", lineHeight: "1.5" }}
        >
          {category.descriptionEl}
        </p>
      </div>

      {/* Large Product Image */}
      <div
        ref={imageRef}
        className="relative aspect-square mx-4 overflow-hidden"
        style={{
          borderRadius: "var(--radius-lg)",
          background:
            "linear-gradient(145deg, color-mix(in srgb, var(--theme-glass-bg) 75%, transparent) 0%, color-mix(in srgb, var(--theme-bg-solid) 70%, transparent) 100%)",
          willChange: "transform",
        }}
      >
        {/* Top highlight */}
        <div
          className="absolute inset-x-0 top-0 h-24 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 100% at 50% 0%, color-mix(in srgb, var(--theme-glass-bg) 75%, transparent) 0%, transparent 70%)",
          }}
        />

        <Image
          src={category.image}
          alt={category.nameEl}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-6 drop-shadow-lg"
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-4 flex items-center justify-between">
        <p
          className="text-[var(--theme-text-muted)]"
          style={{ fontSize: "14px" }}
        >
          {category.productCount.toLocaleString("el-GR")} προϊόντα
        </p>
        <span
          className="text-[var(--theme-accent)] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ fontSize: "14px" }}
        >
          Δείτε όλα →
        </span>
      </div>

      {/* Hover effects */}
      <style jsx>{`
        a:hover {
          box-shadow: var(--shadow-xl) !important;
          border-color: color-mix(in srgb, var(--theme-accent) 30%, transparent) !important;
          transform: translateY(-6px);
        }
      `}</style>
    </Link>
  );
}
