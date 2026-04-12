"use client";

import { Plus } from "lucide-react";

interface AddCategoryCardProps {
  onAdd: () => void;
}

export function AddCategoryCard({ onAdd }: AddCategoryCardProps) {
  return (
    <button
      type="button"
      aria-label="Προσθήκη νέας κατηγορίας"
      onClick={onAdd}
      className="group relative flex min-h-[30rem] w-full flex-col items-center justify-center gap-6 border border-dashed border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_40%,transparent)] text-left transition-[border-color,background,transform] duration-300 hover:-translate-y-[2px] hover:border-[color-mix(in_srgb,var(--theme-accent)_38%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_60%,transparent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-inset"
    >
      {/* Subtle corner accents */}
      <div className="pointer-events-none absolute left-0 top-0 h-8 w-px bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-accent)_30%,transparent),transparent)]" />
      <div className="pointer-events-none absolute left-0 top-0 h-px w-8 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--theme-accent)_30%,transparent),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-8 w-px bg-[linear-gradient(0deg,color-mix(in_srgb,var(--theme-accent)_30%,transparent),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-px w-8 bg-[linear-gradient(270deg,color-mix(in_srgb,var(--theme-accent)_30%,transparent),transparent)]" />

      {/* Plus icon container */}
      <div className="inline-flex h-16 w-16 items-center justify-center border border-[color-mix(in_srgb,var(--theme-accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_60%,transparent)] text-[var(--theme-accent)] transition-[border-color,background,transform] duration-300 group-hover:border-[color-mix(in_srgb,var(--theme-accent)_48%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)] group-hover:scale-110">
        <Plus className="h-7 w-7" strokeWidth={1.5} />
      </div>

      <div className="grid gap-2 text-center">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-[var(--theme-accent)]">
          Νέα Κατηγορία
        </p>
        <p className="text-[0.8rem] leading-6 text-[var(--theme-text-muted)]">
          Προσθήκη στον κατάλογο
        </p>
      </div>
    </button>
  );
}
