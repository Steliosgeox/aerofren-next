"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useLenis } from "lenis/react";
import type { AdminCategory } from "@/data/types";

interface CategoryDeleteModalProps {
  isOpen: boolean;
  category: AdminCategory | null;
  onClose: () => void;
  onConfirm: (category: AdminCategory) => Promise<void>;
}

export function CategoryDeleteModal({
  isOpen,
  category,
  onClose,
  onConfirm,
}: CategoryDeleteModalProps) {
  const lenis = useLenis();
  const [confirmSlug, setConfirmSlug] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const slugMatch = confirmSlug === category?.slug;

  useEffect(() => {
    if (!isOpen) { setConfirmSlug(""); setDeleteError(null); return; }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape" && !isDeleting) onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const { body, documentElement } = document;
    const prevBody = body.style.overflow;
    const prevHtml = documentElement.style.overflow;
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      body.style.overflow = prevBody;
      documentElement.style.overflow = prevHtml;
      lenis?.start();
    };
  }, [isOpen, lenis]);

  const handleDelete = async () => {
    if (!category || !slugMatch || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onConfirm(category);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Σφάλμα διαγραφής");
      setIsDeleting(false);
    }
  };

  if (!isOpen || !category) return null;

  const hasProducts = category.assignedProductIds.length > 0;

  return (
    <div
      aria-modal="true"
      aria-label="Επιβεβαίωση Διαγραφής"
      role="dialog"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Ακύρωση"
        onClick={() => !isDeleting && onClose()}
        className="absolute inset-0 cursor-pointer bg-[color-mix(in_srgb,var(--theme-bg-solid)_68%,transparent)] backdrop-blur-[10px]"
      />

      {/* Panel */}
      <aside
        className="category-delete-window relative w-full max-w-[32rem] overflow-hidden border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_94%,transparent)] text-[var(--theme-text)] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
        onWheelCapture={(e) => e.stopPropagation()}
      >
        {/* Top accent line — amber for danger */}
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,158,11,0.7),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.06),transparent_30%)] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between gap-4 border-b border-[var(--theme-glass-border)] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[color-mix(in_srgb,#f59e0b_26%,transparent)] bg-[color-mix(in_srgb,#f59e0b_10%,transparent)] text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-amber-400">
                Μόνιμη ενέργεια
              </p>
              <h2 className="text-[1.1rem] font-semibold tracking-[-0.03em] text-[var(--theme-text)]">
                Διαγραφή Κατηγορίας
              </h2>
            </div>
          </div>
          <button
            type="button"
            aria-label="Κλείσιμο"
            onClick={() => !isDeleting && onClose()}
            disabled={isDeleting}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_60%,transparent)] text-[var(--theme-text)] transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_80%,transparent)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-glass-border)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="relative z-10 grid gap-5 px-6 py-6">
          {/* Category name */}
          <div className="border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_64%,transparent)] px-4 py-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              Κατηγορία προς διαγραφή
            </p>
            <p className="mt-1 text-[1rem] font-semibold tracking-[-0.02em] text-[var(--theme-text)]">
              {category.nameEl}
            </p>
            <p className="mt-0.5 font-mono text-[0.72rem] text-[var(--theme-text-muted)]">
              slug: {category.slug}
            </p>
          </div>

          {/* Impact warning */}
          <div className="grid gap-2 text-[0.85rem] leading-7 text-[var(--theme-text-muted)]">
            <p>
              Η διαγραφή είναι <strong className="text-[var(--theme-text)]">μόνιμη και μη αναστρέψιμη</strong>. Η κατηγορία θα αφαιρεθεί από τη βάση δεδομένων.
            </p>
            {hasProducts && (
              <div className="flex items-start gap-2 border border-[color-mix(in_srgb,#f59e0b_22%,transparent)] bg-[color-mix(in_srgb,#f59e0b_8%,transparent)] px-3 py-2.5 text-[0.82rem] text-amber-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Αυτή η κατηγορία έχει{" "}
                  <strong>{category.assignedProductIds.length} αντιστοιχισμένα προϊόντα</strong>.
                  Οι αντιστοιχίσεις θα χαθούν.
                </span>
              </div>
            )}
          </div>

          {/* Confirmation input */}
          <div>
            <label
              htmlFor="cd-confirm"
              className="block text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--theme-text-muted)] mb-1.5"
            >
              Πληκτρολογήστε <span className="font-mono text-[var(--theme-text)]">{category.slug}</span> για επιβεβαίωση
            </label>
            <input
              id="cd-confirm"
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="w-full border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] px-3 py-2.5 font-mono text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] transition-[border-color] duration-200 focus:border-[color-mix(in_srgb,#ef4444_50%,transparent)] focus:outline-none"
              value={confirmSlug}
              onChange={(e) => setConfirmSlug(e.target.value)}
              placeholder={category.slug}
              disabled={isDeleting}
              onKeyDown={(e) => { if (e.key === "Enter" && slugMatch) handleDelete(); }}
            />
          </div>

          {/* Error */}
          {deleteError && (
            <div className="border border-[color-mix(in_srgb,#ef4444_28%,transparent)] bg-[color-mix(in_srgb,#ef4444_8%,transparent)] px-4 py-3">
              <p className="text-[0.82rem] text-red-400">{deleteError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleDelete}
              disabled={!slugMatch || isDeleting}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-[color-mix(in_srgb,#ef4444_36%,transparent)] bg-[color-mix(in_srgb,#ef4444_14%,transparent)] px-5 text-sm font-semibold text-red-400 transition-[border-color,background,opacity] duration-200 hover:border-[color-mix(in_srgb,#ef4444_56%,transparent)] hover:bg-[color-mix(in_srgb,#ef4444_20%,transparent)] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
            >
              {isDeleting ? "Διαγραφή..." : "Διαγραφή"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--theme-glass-border)] px-5 text-sm font-semibold text-[var(--theme-text)] transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_80%,transparent)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-glass-border)]"
            >
              Ακύρωση
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        .category-delete-window {
          animation: deleteWindowIn 0.28s cubic-bezier(0.2, 0.9, 0.24, 1);
        }
        @keyframes deleteWindowIn {
          from { opacity: 0; transform: translate3d(0, 0.8rem, 0) scale(0.97); }
          to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
      `}</style>
    </div>
  );
}
