"use client";

import { Phone } from "lucide-react";

export function ContactCallToAction() {
  return (
    <section className="relative py-10 pb-16 z-10">
      <div className="max-w-3xl mx-auto px-6">
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[var(--theme-accent)] via-[color-mix(in_srgb,var(--theme-accent)_70%,transparent)] to-[var(--theme-accent-hover)] p-8 md:p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] to-transparent animate-pulse" />

          <h2 className="relative text-2xl md:text-3xl font-bold text-white mb-3">
            Προτιμάτε να μιλήσετε απευθείας;
          </h2>
          <p className="relative text-lg text-white/85 mb-6">
            Η τεχνική μας ομάδα είναι διαθέσιμη για να απαντήσει σε κάθε σας ερώτηση.
          </p>
          <a
            href="tel:2103461645"
            className="relative inline-flex items-center justify-center h-12 px-8 bg-[var(--theme-accent)] text-white font-semibold rounded-lg hover:bg-[var(--theme-accent-hover)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Phone className="w-5 h-5 mr-2" />
            Καλέστε: 210 3461645
          </a>
        </div>
      </div>
    </section>
  );
}
