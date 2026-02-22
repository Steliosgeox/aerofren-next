"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { CONTACT_MAP_URL } from "@/components/contact/constants";

export function ContactMapCard() {
  return (
    <section className="relative py-10 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--contact-text)] mb-1">Επισκεφθείτε μας</h2>
          <p className="text-sm text-[var(--contact-muted)]">Χρυσοστόμου Σμύρνης 26, Μοσχάτο 18344, Αθήνα</p>
        </div>

        <div className="rounded-xl overflow-hidden border border-[var(--contact-border)] shadow-lg bg-[color-mix(in_srgb,var(--contact-surface)_88%,transparent)]">
          <div className="relative h-[300px] w-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--theme-accent)_24%,transparent),transparent_48%),radial-gradient(circle_at_78%_74%,color-mix(in_srgb,var(--theme-accent)_16%,transparent),transparent_52%),linear-gradient(180deg,color-mix(in_srgb,var(--contact-surface)_70%,transparent)_0%,color-mix(in_srgb,var(--contact-bg)_94%,transparent)_100%)]" />
            <div className="absolute inset-0 opacity-35 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--contact-border)_45%,transparent)_1px,transparent_1px),linear-gradient(0deg,color-mix(in_srgb,var(--contact-border)_45%,transparent)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-[color-mix(in_srgb,var(--theme-accent)_22%,transparent)] border border-[color-mix(in_srgb,var(--theme-accent)_45%,transparent)] p-4 shadow-lg shadow-black/30">
                <MapPin className="w-7 h-7 text-[var(--theme-accent)]" />
              </div>
            </div>

            <div className="absolute left-4 right-4 bottom-4 rounded-lg border border-[var(--contact-border)] bg-[color-mix(in_srgb,var(--contact-surface)_94%,transparent)] backdrop-blur-sm px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--contact-text)]">AEROFREN • Μοσχάτο</p>
                <p className="text-xs text-[var(--contact-muted)]">Χρυσοστόμου Σμύρνης 26, 18344 Αθήνα</p>
              </div>
              <a
                href={CONTACT_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent-hover)] transition-colors"
              >
                Άνοιγμα στους Χάρτες
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
