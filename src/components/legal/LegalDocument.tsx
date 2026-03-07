import Link from "next/link";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";

type LegalSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
};

type LegalDocumentProps = {
  path: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: readonly LegalSection[];
};

export function LegalDocument({ path, title, subtitle, lastUpdated, sections }: LegalDocumentProps) {
  return (
    <div className="min-h-screen text-[var(--theme-text)]">
      <section className="relative pt-24 pb-4 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <Breadcrumbs items={[{ label: title, href: path }]} />
          <div className="mt-4 space-y-3">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--theme-text)]">
              {title}
            </h1>
            <p className="max-w-3xl text-sm md:text-base text-[var(--theme-text-muted)]">
              {subtitle}
            </p>
            <p className="inline-flex items-center rounded-full border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_80%,transparent)] px-3 py-1 text-xs text-[var(--theme-text-muted)]">
              Τελευταία ενημέρωση: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-8 pb-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
            <aside className="lg:sticky lg:top-28 h-fit rounded-xl border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_84%,transparent)] p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--theme-text-muted)] mb-3">Περιεχόμενα</p>
              <nav className="space-y-1.5">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-md px-2.5 py-2 text-sm text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_94%,transparent)] transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="space-y-4">
              {sections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 rounded-xl border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_84%,transparent)] p-5 md:p-6"
                >
                  <h2 className="text-xl md:text-2xl font-bold text-[var(--theme-text)] mb-3">
                    {section.title}
                  </h2>
                  <div className="space-y-3 text-sm md:text-base leading-7 text-[var(--theme-text-muted)]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}

              <article className="rounded-xl border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_84%,transparent)] p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-[var(--theme-text)] mb-3">Επικοινωνία</h2>
                <p className="text-sm md:text-base leading-7 text-[var(--theme-text-muted)]">
                  Για απορίες σχετικά με την παρούσα πολιτική ή τους όρους χρήσης μπορείτε να επικοινωνήσετε στο{" "}
                  <a className="text-[var(--theme-accent)] hover:text-[var(--theme-accent-hover)]" href="mailto:aerofren@gmail.com">
                    aerofren@gmail.com
                  </a>{" "}
                  ή στο{" "}
                  <a className="text-[var(--theme-accent)] hover:text-[var(--theme-accent-hover)]" href="tel:2103461645">
                    210 3461645
                  </a>
                  . Μπορείτε επίσης να μεταβείτε στη σελίδα{" "}
                  <Link href="/contact" className="text-[var(--theme-accent)] hover:text-[var(--theme-accent-hover)]" prefetch={false}>
                    Επικοινωνίας
                  </Link>
                  .
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
