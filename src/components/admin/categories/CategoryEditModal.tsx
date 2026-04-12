"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, Eye, EyeOff } from "lucide-react";
import { useLenis } from "lenis/react";
import type { AdminCategory } from "@/data/types";
import { productShowcaseItems } from "@/data/product-showcase";

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  category: AdminCategory | null;
  onSave: (data: CategoryFormData) => Promise<void>;
}

export interface CategoryFormData {
  slug: string;
  nameEl: string;
  tagEl: string;
  summaryEl: string;
  highlightsEl: [string, string, string];
  image: string;
  order: number;
  visible: boolean;
  ctaLabel: string;
  assignedProductIds: string[];
}

const DEFAULT_FORM: CategoryFormData = {
  slug: "",
  nameEl: "",
  tagEl: "",
  summaryEl: "",
  highlightsEl: ["", "", ""],
  image: "",
  order: 0,
  visible: true,
  ctaLabel: "Περισσότερες Λεπτομέρειες",
  assignedProductIds: [],
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const INPUT_CLASS =
  "w-full border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] px-3 py-2.5 text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] transition-[border-color,background] duration-200 focus:border-[color-mix(in_srgb,var(--theme-accent)_52%,transparent)] focus:bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)] focus:outline-none";

const LABEL_CLASS =
  "block text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--theme-text-muted)] mb-1.5";

export function CategoryEditModal({
  isOpen,
  onClose,
  mode,
  category,
  onSave,
}: CategoryEditModalProps) {
  const lenis = useLenis();
  const [form, setForm] = useState<CategoryFormData>(DEFAULT_FORM);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Populate form when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && category) {
      setForm({
        slug: category.slug,
        nameEl: category.nameEl,
        tagEl: category.tagEl,
        summaryEl: category.summaryEl,
        highlightsEl: [...category.highlightsEl] as [string, string, string],
        image: category.image,
        order: category.order,
        visible: category.visible,
        ctaLabel: category.ctaLabel,
        assignedProductIds: [...category.assignedProductIds],
      });
      setSlugManuallyEdited(true);
    } else {
      setForm(DEFAULT_FORM);
      setSlugManuallyEdited(false);
    }
    setErrors({});
    setSaveError(null);
  }, [isOpen, mode, category]);

  // Escape key + scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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

  const setField = useCallback(<K extends keyof CategoryFormData>(key: K, value: CategoryFormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-generate slug from nameEl on create
      if (key === "nameEl" && !slugManuallyEdited && mode === "create") {
        next.slug = slugify(value as string);
      }
      return next;
    });
    setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  }, [slugManuallyEdited, mode]);

  const setHighlight = useCallback((idx: 0 | 1 | 2, value: string) => {
    setForm((prev) => {
      const h = [...prev.highlightsEl] as [string, string, string];
      h[idx] = value;
      return { ...prev, highlightsEl: h };
    });
    setErrors((prev) => { const e = { ...prev }; delete e.highlightsEl; return e; });
  }, []);

  const toggleProduct = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      assignedProductIds: prev.assignedProductIds.includes(id)
        ? prev.assignedProductIds.filter((p) => p !== id)
        : [...prev.assignedProductIds, id],
    }));
  }, []);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.slug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
      e.slug = "Μόνο πεζά γράμματα, αριθμοί και παύλες";
    }
    if (form.slug.length < 3) e.slug = "Τουλάχιστον 3 χαρακτήρες";
    if (!form.nameEl.trim()) e.nameEl = "Απαιτείται τίτλος";
    if (!form.tagEl.trim()) e.tagEl = "Απαιτείται ετικέτα";
    if (!form.summaryEl.trim()) e.summaryEl = "Απαιτείται σύνοψη";
    if (!form.image.trim()) e.image = "Απαιτείται εικόνα";
    if (form.highlightsEl.some((h) => !h.trim())) {
      e.highlightsEl = "Συμπληρώστε και τα 3 σημεία";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(form);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Σφάλμα αποθήκευσης");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      aria-label={mode === "create" ? "Νέα Κατηγορία" : `Επεξεργασία: ${category?.nameEl}`}
      role="dialog"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 md:p-6 xl:p-10"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Κλείσιμο"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-[color-mix(in_srgb,var(--theme-bg-solid)_58%,transparent)] backdrop-blur-[10px]"
      />

      {/* Panel */}
      <aside
        className="category-edit-window relative flex h-[min(90dvh,52rem)] w-full max-w-[78rem] flex-col overflow-hidden border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_92%,transparent)] text-[var(--theme-text)] shadow-[0_34px_120px_rgba(0,0,0,0.42)]"
        onWheelCapture={(e) => e.stopPropagation()}
        onTouchMoveCapture={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.7),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(var(--theme-accent-rgb),0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(var(--theme-accent-rgb),0.08),transparent_20%)] opacity-80 pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 flex items-start justify-between gap-4 border-b border-[var(--theme-glass-border)] px-5 py-4 md:px-7 md:py-5">
          <div className="grid gap-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
              {mode === "create" ? "Νέα Κατηγορία" : "Επεξεργασία Κατηγορίας"}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--theme-text-muted)]">
              {form.tagEl && (
                <span className="inline-flex items-center border border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--theme-accent)]">
                  {form.tagEl}
                </span>
              )}
              <span className="text-[0.85rem]">
                {mode === "create" ? "Δημιουργία νέας κατηγορίας στον κατάλογο AEROFREN" : "Άμεση επεξεργασία κατηγορίας καταλόγου"}
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-label="Κλείσιμο"
            onClick={onClose}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_68%,transparent)] text-[var(--theme-text)] transition-[border-color,transform,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_38%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)] hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)]"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Body: two columns */}
        <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(24rem,0.9fr)_minmax(0,1.1fr)]">
          {/* Left — live image preview */}
          <div className="relative overflow-hidden border-b border-[var(--theme-glass-border)] bg-[linear-gradient(155deg,color-mix(in_srgb,var(--theme-glass-bg)_78%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_92%,transparent))] lg:border-b-0 lg:border-r">
            <div className="grid h-full min-h-[18rem] place-items-center p-6 md:p-8">
              <div className="relative flex h-full w-full max-w-[32rem] items-center justify-center border border-[color-mix(in_srgb,var(--theme-glass-border)_90%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-glass-bg)_52%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_94%,transparent))] px-6 py-8">
                <div className="absolute inset-x-6 top-6 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.45),transparent)]" />
                <div className="relative h-full min-h-[18rem] w-full max-w-[24rem]">
                  {form.image ? (
                    <Image
                      key={form.image}
                      alt={form.nameEl || "Εικόνα κατηγορίας"}
                      className="object-contain"
                      fill
                      sizes="(max-width: 1024px) 100vw, 36rem"
                      src={form.image}
                      onError={() => {/* silently ignore broken previews */}}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="grid gap-2 text-center">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[var(--theme-text-muted)]">
                          Προεπισκόπηση
                        </p>
                        <p className="text-[0.75rem] text-[var(--theme-text-muted)] opacity-60">
                          Εισάγετε διαδρομή εικόνας
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,16,31,0.08),rgba(6,16,31,0.02)_35%,rgba(6,16,31,0.32))]" />
          </div>

          {/* Right — scrollable form */}
          <div className="relative min-h-0 overflow-auto overscroll-contain">
            <div className="border-b border-[var(--theme-glass-border)] px-6 pb-6 pt-6 md:px-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">
                {mode === "create" ? "Συμπληρώστε τα στοιχεία" : "Τεχνικά στοιχεία"}
              </p>
              <h2 className="mt-3 text-[clamp(1.6rem,3vw,2.8rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-[var(--theme-text)]">
                {form.nameEl || (mode === "create" ? "Νέα Κατηγορία" : "—")}
              </h2>
            </div>

            <div className="grid gap-5 px-6 py-6 md:px-8">
              {/* Row: nameEl + tagEl */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor="ce-nameEl">Τίτλος κατηγορίας</label>
                  <input
                    id="ce-nameEl"
                    type="text"
                    className={INPUT_CLASS}
                    value={form.nameEl}
                    onChange={(e) => setField("nameEl", e.target.value)}
                    placeholder="ΣΩΛΗΝΕΣ ΙΝΟΧ ΘΕΡΜΟΥ ΑΕΡΑ"
                  />
                  {errors.nameEl && <p className="mt-1 text-[0.68rem] text-red-400">{errors.nameEl}</p>}
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="ce-tagEl">Ετικέτα (tag)</label>
                  <input
                    id="ce-tagEl"
                    type="text"
                    className={INPUT_CLASS}
                    value={form.tagEl}
                    onChange={(e) => setField("tagEl", e.target.value)}
                    placeholder="Θερμική Αντοχή"
                  />
                  {errors.tagEl && <p className="mt-1 text-[0.68rem] text-red-400">{errors.tagEl}</p>}
                </div>
              </div>

              {/* Row: slug + order */}
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <label className={LABEL_CLASS} htmlFor="ce-slug">
                    Slug{" "}
                    <span className="normal-case tracking-normal text-[var(--theme-text-muted)] opacity-70">
                      (URL: /products/κατηγορία)
                    </span>
                  </label>
                  <input
                    id="ce-slug"
                    type="text"
                    className={INPUT_CLASS}
                    value={form.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setField("slug", slugify(e.target.value));
                    }}
                    placeholder="push-in-fittings"
                  />
                  {errors.slug && <p className="mt-1 text-[0.68rem] text-red-400">{errors.slug}</p>}
                </div>
                <div className="w-24">
                  <label className={LABEL_CLASS} htmlFor="ce-order">Σειρά</label>
                  <input
                    id="ce-order"
                    type="number"
                    min={0}
                    className={INPUT_CLASS}
                    value={form.order}
                    onChange={(e) => setField("order", parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              </div>

              {/* summaryEl */}
              <div>
                <label className={LABEL_CLASS} htmlFor="ce-summaryEl">Σύνοψη</label>
                <textarea
                  id="ce-summaryEl"
                  rows={3}
                  className={`${INPUT_CLASS} resize-none`}
                  value={form.summaryEl}
                  onChange={(e) => setField("summaryEl", e.target.value)}
                  placeholder="Σύντομη περιγραφή κατηγορίας..."
                />
                {errors.summaryEl && <p className="mt-1 text-[0.68rem] text-red-400">{errors.summaryEl}</p>}
              </div>

              {/* Image path */}
              <div>
                <label className={LABEL_CLASS} htmlFor="ce-image">
                  Διαδρομή εικόνας{" "}
                  <span className="normal-case tracking-normal text-[var(--theme-text-muted)] opacity-70">
                    (π.χ. /images/new-categories/ΟΝΟΜΑ.webp)
                  </span>
                </label>
                <input
                  id="ce-image"
                  type="text"
                  className={INPUT_CLASS}
                  value={form.image}
                  onChange={(e) => setField("image", e.target.value)}
                  placeholder="/images/new-categories/ΣΩΛΗΝΕΣ_ΙΝΟΧ_ΘΕΡΜΟΥ_ΑΕΡΑ.webp"
                />
                {errors.image && <p className="mt-1 text-[0.68rem] text-red-400">{errors.image}</p>}
              </div>

              {/* Highlights */}
              <div>
                <p className={LABEL_CLASS}>Σημεία (3 highlights)</p>
                <div className="grid gap-2">
                  {([0, 1, 2] as const).map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      className={INPUT_CLASS}
                      value={form.highlightsEl[idx]}
                      onChange={(e) => setHighlight(idx, e.target.value)}
                      placeholder={`Σημείο ${idx + 1}`}
                      aria-label={`Σημείο ${idx + 1}`}
                    />
                  ))}
                </div>
                {errors.highlightsEl && <p className="mt-1 text-[0.68rem] text-red-400">{errors.highlightsEl}</p>}
              </div>

              {/* CTA Label */}
              <div>
                <label className={LABEL_CLASS} htmlFor="ce-ctaLabel">Κείμενο κουμπιού (CTA)</label>
                <input
                  id="ce-ctaLabel"
                  type="text"
                  className={INPUT_CLASS}
                  value={form.ctaLabel}
                  onChange={(e) => setField("ctaLabel", e.target.value)}
                  placeholder="Περισσότερες Λεπτομέρειες"
                />
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center justify-between border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_50%,transparent)] px-4 py-3">
                <div className="grid gap-0.5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--theme-text-muted)]">
                    Ορατότητα
                  </p>
                  <p className="text-[0.8rem] text-[var(--theme-text)]">
                    {form.visible ? "Ορατή στον κατάλογο" : "Κρυφή από τον κατάλογο"}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.visible}
                  onClick={() => setField("visible", !form.visible)}
                  className={`relative inline-flex h-6 w-11 items-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)] ${form.visible ? "bg-[var(--theme-accent)]" : "bg-[var(--theme-glass-border)]"}`}
                >
                  <span className={`inline-block h-4 w-4 bg-white transition-transform duration-200 ${form.visible ? "translate-x-6" : "translate-x-1"}`} />
                  <span className="sr-only">{form.visible ? "Ορατή" : "Κρυφή"}</span>
                </button>
                {form.visible ? (
                  <Eye className="ml-3 h-4 w-4 text-[var(--theme-accent)]" />
                ) : (
                  <EyeOff className="ml-3 h-4 w-4 text-[var(--theme-text-muted)]" />
                )}
              </div>

              {/* Product Assignment */}
              <div>
                <div className="border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)]">
                  <div className="border-b border-[var(--theme-glass-border)] px-4 py-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
                      Αντιστοίχιση Προϊόντων
                    </p>
                    <p className="mt-0.5 text-[0.75rem] text-[var(--theme-text-muted)]">
                      Επιλέξτε τα προϊόντα που ανήκουν σε αυτή την κατηγορία
                    </p>
                  </div>
                  <ul className="max-h-48 overflow-auto overscroll-contain divide-y divide-[var(--theme-glass-border)]">
                    {productShowcaseItems.map((item) => {
                      const checked = form.assignedProductIds.includes(item.id);
                      return (
                        <li key={item.id}>
                          <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_80%,transparent)]">
                            <span
                              role="checkbox"
                              aria-checked={checked}
                              className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border transition-colors duration-150 ${checked ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]" : "border-[var(--theme-glass-border)]"}`}
                            >
                              {checked && (
                                <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M1 4l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() => toggleProduct(item.id)}
                            />
                            <span className="text-[0.82rem] text-[var(--theme-text)]">{item.nameEl}</span>
                            <span className="ml-auto text-[0.68rem] text-[var(--theme-text-muted)]">{item.tagEl}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {form.assignedProductIds.length > 0 && (
                  <p className="mt-1.5 text-[0.68rem] font-semibold tracking-[0.1em] text-[var(--theme-accent)]">
                    {form.assignedProductIds.length} προϊόντα αντιστοιχισμένα
                  </p>
                )}
              </div>

              {/* Error message */}
              {saveError && (
                <div className="border border-[color-mix(in_srgb,#ef4444_28%,transparent)] bg-[color-mix(in_srgb,#ef4444_8%,transparent)] px-4 py-3">
                  <p className="text-[0.82rem] text-red-400">{saveError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 border-t border-[var(--theme-glass-border)] pt-5">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="inline-flex min-h-12 items-center gap-2 border border-[color-mix(in_srgb,var(--theme-accent)_44%,transparent)] bg-[color-mix(in_srgb,var(--theme-accent)_18%,transparent)] px-6 text-sm font-semibold text-[var(--theme-text)] transition-[border-color,background,opacity] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_64%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-accent)_26%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-accent)]"
                >
                  {isSaving ? "Αποθήκευση..." : "Αποθήκευση"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="inline-flex min-h-12 items-center gap-2 border border-[var(--theme-glass-border)] px-6 text-sm font-semibold text-[var(--theme-text)] transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_80%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-glass-border)]"
                >
                  Ακύρωση
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        .category-edit-window {
          animation: categoryWindowIn 0.34s cubic-bezier(0.2, 0.9, 0.24, 1);
        }
        @keyframes categoryWindowIn {
          from { opacity: 0; transform: translate3d(0, 1.2rem, 0) scale(0.985); }
          to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @media (max-width: 767px) {
          .category-edit-window { height: min(92dvh, 52rem); }
        }
      `}</style>
    </div>
  );
}
