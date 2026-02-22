"use client";

import { Phone } from "lucide-react";

export function ContactCallToAction() {
  return (
    <section className="relative py-10 pb-16 z-10" aria-labelledby="contact-cta-title">
      <div className="max-w-3xl mx-auto px-6">
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[var(--theme-accent)] via-[color-mix(in_srgb,var(--theme-accent)_70%,transparent)] to-[var(--theme-accent-hover)] p-8 md:p-10 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-black/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-60 motion-safe:animate-pulse motion-reduce:animate-none"
          />

          <h2
            id="contact-cta-title"
            className="relative text-2xl md:text-3xl font-bold text-white mb-3 [text-shadow:0_1px_10px_rgba(0,0,0,0.25)]"
          >
            Προτιμάτε να μιλήσετε απευθείας;
          </h2>
          <p className="relative text-lg text-white mb-6 [text-shadow:0_1px_6px_rgba(0,0,0,0.2)]">
            Η τεχνική μας ομάδα είναι διαθέσιμη για να απαντήσει σε κάθε σας ερώτηση.
          </p>
          <a
            href="tel:+302103461645"
            aria-label="Καλέστε την AEROFREN στο 210 3461645"
            className="relative inline-flex items-center justify-center h-12 px-8 bg-[var(--theme-accent)] text-white font-semibold rounded-lg hover:bg-[var(--theme-accent-hover)] transition-[transform,box-shadow,background-color] shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-accent)]"
          >
            <Phone className="w-5 h-5 mr-2" />
            Καλέστε: 210 3461645
          </a>
        </div>
      </div>
    </section>
  );
}
