"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import type { AdminCategory } from "@/data/types";

interface AdminCategoryCardProps {
  category: AdminCategory;
  index: number;
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
}

export function AdminCategoryCard({ category, index, onEdit, onDelete }: AdminCategoryCardProps) {
  const hasProducts = category.assignedProductIds.length > 0;

  return (
    <div
      className={`group relative grid min-h-[30rem] grid-rows-[auto_auto_1fr_auto] overflow-hidden border text-left transition-[transform,border-color,box-shadow,background] duration-300 border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_74%,transparent)] hover:-translate-y-[2px] hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_82%,transparent)] hover:shadow-[0_16px_34px_rgba(0,0,0,0.16)] ${!category.visible ? "opacity-60" : ""}`}
    >
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-accent)_10%,transparent),transparent_18%,color-mix(in_srgb,var(--theme-bg-solid)_12%,transparent)_100%)] opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.55),transparent)]" />

      {/* Hidden badge */}
      {!category.visible && (
        <div className="absolute left-0 top-0 z-20 flex items-center gap-1.5 border-r border-b border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_80%,transparent)] px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-amber-400">
            Κρυφή
          </span>
        </div>
      )}

      {/* Header row */}
      <div className="relative flex items-start justify-between px-5 pb-4 pt-5">
        <div className="grid gap-2">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
            {category.tagEl}
          </p>
          <p className="text-[0.78rem] text-[var(--theme-text-muted)]">
            #{String(index + 1).padStart(2, "0")}
          </p>
        </div>

        {/* Admin action buttons — fade in on hover */}
        <div className="flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            aria-label={`Επεξεργασία: ${category.nameEl}`}
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className="inline-flex h-10 w-10 items-center justify-center border border-[color-mix(in_srgb,var(--theme-accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_72%,transparent)] text-[var(--theme-accent)] transition-[border-color,background,transform] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_48%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-accent)_14%,transparent)] hover:scale-[1.06] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Διαγραφή: ${category.nameEl}`}
            onClick={(e) => { e.stopPropagation(); onDelete(category); }}
            className="inline-flex h-10 w-10 items-center justify-center border border-[color-mix(in_srgb,#ef4444_20%,transparent)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_72%,transparent)] text-red-400 transition-[border-color,background,transform] duration-200 hover:border-[color-mix(in_srgb,#ef4444_44%,transparent)] hover:bg-[color-mix(in_srgb,#ef4444_12%,transparent)] hover:scale-[1.06] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Image row — click triggers edit */}
      <button
        type="button"
        aria-label={`Επεξεργασία ${category.nameEl}`}
        onClick={() => onEdit(category)}
        className="relative cursor-pointer px-5 text-left focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)]"
      >
        <div className="border border-[color-mix(in_srgb,var(--theme-glass-border)_92%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-glass-bg)_52%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_94%,transparent))]">
          <div className="grid h-[16rem] place-items-center p-6">
            <div className="relative h-full w-full max-w-[14rem]">
              {category.image ? (
                <Image
                  alt={category.nameEl}
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                  src={category.image}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--theme-text-muted)]">
                    Χωρίς εικόνα
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Content row */}
      <button
        type="button"
        aria-label={`Επεξεργασία ${category.nameEl}`}
        onClick={() => onEdit(category)}
        className="grid cursor-pointer content-start gap-3 px-5 pb-6 pt-5 text-left focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)]"
      >
        <h3 className="max-w-[16ch] text-[1.45rem] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--theme-text)]">
          {category.nameEl}
        </h3>
        <p className="max-w-[34ch] text-sm leading-7 text-[var(--theme-text-muted)]">
          {category.summaryEl}
        </p>
      </button>

      {/* Footer row */}
      <div className="relative mt-4 flex items-center justify-between border-t border-[var(--theme-glass-border)] px-5 py-4">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--theme-text-muted)]">
          {category.ctaLabel}
        </span>
        <div className="flex items-center gap-3">
          {hasProducts && (
            <span className="inline-flex items-center gap-1.5 border border-[color-mix(in_srgb,var(--theme-accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--theme-accent)_10%,transparent)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[var(--theme-accent)]">
              {category.assignedProductIds.length} προϊόντα
            </span>
          )}
          <span className="h-2 w-2 bg-[var(--theme-accent)] transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
}
