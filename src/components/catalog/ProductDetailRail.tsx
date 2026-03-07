"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { ArrowUpRight, Mail, Phone, UserRound, X } from "lucide-react";

import type { ProductShowcaseItem } from "@/data/product-showcase";

interface ProductDetailRailProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductShowcaseItem | null;
}

export function ProductDetailRail({
  isOpen,
  onClose,
  product,
}: ProductDetailRailProps) {
  const lenis = useLenis();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.dataset.productWindowOpen = "true";
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    lenis?.stop();
    window.dispatchEvent(new CustomEvent("product-window-toggle", { detail: { open: true } }));

    return () => {
      delete body.dataset.productWindowOpen;
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
      lenis?.start();
      window.dispatchEvent(new CustomEvent("product-window-toggle", { detail: { open: false } }));
    };
  }, [isOpen, lenis]);

  if (!isOpen || !product) {
    return null;
  }

  return (
    <div
      aria-labelledby={`product-rail-title-${product.id}`}
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 md:p-6 xl:p-10"
      role="dialog"
    >
      <button
        aria-label="Παρασκήνιο λεπτομερειών προϊόντος"
        className="absolute inset-0 cursor-pointer bg-[color-mix(in_srgb,var(--theme-bg-solid)_58%,transparent)] backdrop-blur-[10px]"
        onClick={onClose}
        type="button"
      />

      <aside
        className="product-detail-window relative flex h-[min(90dvh,52rem)] w-full max-w-[78rem] flex-col overflow-hidden border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_92%,transparent)] text-[var(--theme-text)] shadow-[0_34px_120px_rgba(0,0,0,0.42)]"
        onTouchMoveCapture={(event) => event.stopPropagation()}
        onWheelCapture={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.7),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(var(--theme-accent-rgb),0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(var(--theme-accent-rgb),0.08),transparent_20%)] opacity-80" />

        <header className="relative z-10 flex items-start justify-between gap-4 border-b border-[var(--theme-glass-border)] px-5 py-4 md:px-7 md:py-5">
          <div className="grid gap-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
              Παράθυρο προϊόντος
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--theme-text-muted)]">
              <span className="inline-flex items-center border border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--theme-accent)]">
                {product.tagEl}
              </span>
              <span className="text-[0.85rem]">Άμεση καθοδήγηση από την ομάδα AEROFREN</span>
            </div>
          </div>

          <button
            aria-label="Κλείσιμο"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_68%,transparent)] text-[var(--theme-text)] transition-[border-color,transform,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_38%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)] hover:scale-[1.03]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(24rem,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative overflow-hidden border-b border-[var(--theme-glass-border)] bg-[linear-gradient(155deg,color-mix(in_srgb,var(--theme-glass-bg)_78%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_92%,transparent))] lg:border-b-0 lg:border-r">
            <div className="grid h-full min-h-[18rem] place-items-center p-6 md:p-8">
              <div className="relative flex h-full w-full max-w-[32rem] items-center justify-center border border-[color-mix(in_srgb,var(--theme-glass-border)_90%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-glass-bg)_52%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_94%,transparent))] px-6 py-8">
                <div className="absolute inset-x-6 top-6 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.45),transparent)]" />
                <div className="relative h-full min-h-[18rem] w-full max-w-[24rem]">
                  <Image
                    alt={product.nameEl}
                    className="object-contain"
                    fill
                    sizes="(max-width: 1024px) 100vw, 36rem"
                    src={product.image}
                  />
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,16,31,0.08),rgba(6,16,31,0.02)_35%,rgba(6,16,31,0.32))]" />
          </div>

          <div className="relative min-h-0 overflow-auto overscroll-contain">
            <div className="border-b border-[var(--theme-glass-border)] px-6 pb-6 pt-6 md:px-8">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">
                Τεχνική ενημέρωση
              </p>
              <h2
                className="mt-3 max-w-[12ch] text-[clamp(2.15rem,4vw,4.2rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-[var(--theme-text)]"
                id={`product-rail-title-${product.id}`}
              >
                {product.nameEl}
              </h2>
              <p className="mt-5 max-w-[34ch] text-[1rem] leading-8 text-[var(--theme-text-muted)] md:text-[1.06rem]">
                {product.summaryEl}
              </p>
            </div>

            <div className="grid gap-6 px-6 py-6 md:px-8">
              <section className="grid gap-3 border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
                  Σημεία που αξίζουν προσοχή
                </p>
                <ul className="grid gap-4">
                  {product.highlightsEl.map((highlight) => (
                    <li
                      className="grid grid-cols-[0.9rem_1fr] items-start gap-3"
                      key={highlight}
                    >
                      <span className="mt-[0.45rem] h-[0.46rem] w-[0.46rem] bg-[var(--theme-accent)]" />
                      <span className="text-[0.98rem] leading-7 text-[var(--theme-text)]">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="grid gap-4 border border-[color-mix(in_srgb,var(--theme-accent)_18%,transparent)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_90%,transparent))] p-4">
                <div className="grid gap-2">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--theme-accent)]">
                    Πώς προχωρά η εξυπηρέτηση
                  </p>
                  <p className="text-[0.98rem] leading-7 text-[var(--theme-text)]">
                    Για αγορά ή διαθεσιμότητα, η ομάδα μας σας εξυπηρετεί άμεσα
                    τηλεφωνικά ή μέσω email. Αν δημιουργήσετε λογαριασμό,
                    αποκτάτε ταχύτερη εξυπηρέτηση μέσα από το chat.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <a
                    className="group inline-flex min-h-16 flex-col items-start justify-between gap-4 border border-[color-mix(in_srgb,var(--theme-accent)_26%,transparent)] bg-[color-mix(in_srgb,var(--theme-accent)_14%,transparent)] px-4 py-4 text-left transition-[transform,border-color,background] duration-200 hover:-translate-y-[1px] hover:border-[color-mix(in_srgb,var(--theme-accent)_42%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)]"
                    href="tel:2103461645"
                  >
                    <span className="inline-flex items-start gap-3">
                      <Phone className="h-4 w-4 text-[var(--theme-accent)]" />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--theme-text)]">
                          Κλήση
                        </span>
                        <span className="block text-xs text-[var(--theme-text-muted)]">
                          Άμεση επικοινωνία με την ομάδα μας
                        </span>
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[var(--theme-accent)] transition-transform duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
                  </a>

                  <a
                    className="group inline-flex min-h-16 flex-col items-start justify-between gap-4 border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_74%,transparent)] px-4 py-4 text-left transition-[transform,border-color,background] duration-200 hover:-translate-y-[1px] hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)]"
                    href="mailto:info@aerofren.gr"
                  >
                    <span className="inline-flex items-start gap-3">
                      <Mail className="h-4 w-4 text-[var(--theme-accent)]" />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--theme-text)]">
                          Email
                        </span>
                        <span className="block text-xs text-[var(--theme-text-muted)]">
                          Στείλτε μας το αίτημά σας αναλυτικά
                        </span>
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[var(--theme-accent)] transition-transform duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
                  </a>

                  <Link
                    className="group inline-flex min-h-16 flex-col items-start justify-between gap-4 border border-[var(--theme-glass-border)] bg-transparent px-4 py-4 text-left transition-[transform,border-color,background] duration-200 hover:-translate-y-[1px] hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_58%,transparent)]"
                    href="/signup"
                  >
                    <span className="inline-flex items-start gap-3">
                      <UserRound className="h-4 w-4 text-[var(--theme-accent)]" />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--theme-text)]">
                          Σύνδεση / Δημιουργία λογαριασμού
                        </span>
                        <span className="block text-xs text-[var(--theme-text-muted)]">
                          Για ταχύτερη εξυπηρέτηση μέσω chat
                        </span>
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[var(--theme-accent)] transition-transform duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>

        <style>{`
          .product-detail-window {
            animation: windowIn 0.34s cubic-bezier(0.2, 0.9, 0.24, 1);
          }

          @keyframes windowIn {
            from {
              opacity: 0;
              transform: translate3d(0, 1.2rem, 0) scale(0.985);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @media (max-width: 767px) {
            .product-detail-window {
              height: min(92dvh, 52rem);
            }
          }
        `}</style>
      </aside>
    </div>
  );
}
