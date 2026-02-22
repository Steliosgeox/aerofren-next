"use client";

import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";

export function ContactHero() {
  return (
    <section className="relative pt-24 pb-4 overflow-hidden z-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-12 right-[6%] h-36 w-36 rounded-full bg-[color-mix(in_srgb,var(--theme-accent)_22%,transparent)] blur-2xl opacity-35 motion-safe:animate-pulse motion-reduce:animate-none" />
        <div className="absolute top-20 left-[6%] h-px w-44 bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--theme-accent)_65%,transparent)] to-transparent" />
        <div className="absolute top-32 right-[14%] h-px w-56 bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--theme-accent)_45%,transparent)] to-transparent opacity-80" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6">
        <Breadcrumbs items={[{ label: "Επικοινωνία", href: "/contact" }]} />

        <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--contact-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--contact-surface)_78%,transparent)] px-5 py-4 shadow-[0_14px_36px_rgba(0,12,24,0.22)]">
            <h1 className="text-2xl md:text-4xl font-extrabold text-[var(--contact-text)] tracking-tight">
              ΕΠΙΚΟΙΝΩΝΗΣΤΕ{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-hover)] drop-shadow-sm">
                ΜΑΖΙ ΜΑΣ
              </span>
            </h1>
            <p className="text-sm text-[var(--contact-muted)] mt-2 max-w-lg">
              Είμαστε εδώ για να σας εξυπηρετήσουμε. Επικοινωνήστε μαζί μας για
              προσφορές, τεχνικές πληροφορίες ή οποιαδήποτε απορία.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
