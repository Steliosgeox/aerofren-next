"use client";

import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";

export function ContactHero() {
  return (
    <section className="relative pt-24 pb-4 overflow-hidden z-10">
      <div className="relative max-w-7xl mx-auto px-6">
        <Breadcrumbs items={[{ label: "Επικοινωνία", href: "/contact" }]} />

        <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-[var(--contact-text)]">
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
