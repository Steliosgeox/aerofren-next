import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import {
  getCategoryBySlug,
  getSubcategoryBySlug,
  getSubcategoryStaticParams,
} from "@/data/catalog-taxonomy";
import { FaqSchema } from "@/lib/schema/FaqSchema";
import {
  BUSINESS_EMAIL,
  BUSINESS_EMAIL_HREF,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_HREF,
  SITE_URL,
} from "@/lib/constants/aerofren";

interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

export function generateStaticParams() {
  return getSubcategoryStaticParams();
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { category, subcategory } = await params;
  const categoryData = getCategoryBySlug(category);
  const subcategoryData = getSubcategoryBySlug(subcategory);

  if (
    !categoryData ||
    !subcategoryData ||
    subcategoryData.parentCategorySlug !== categoryData.slug
  ) {
    return {
      title: "Υποκατηγορία προϊόντων | AEROFREN",
    };
  }

  const canonical = `${SITE_URL}${subcategoryData.canonicalPath}`;

  return {
    title: subcategoryData.seoTitle,
    description: subcategoryData.seoDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: subcategoryData.seoTitle,
      description: subcategoryData.seoDescription,
      url: canonical,
      siteName: "AEROFREN",
      locale: "el_GR",
      type: "website",
      images: [
        {
          url: subcategoryData.image,
          width: 1200,
          height: 630,
          alt: subcategoryData.nameEl,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: subcategoryData.seoTitle,
      description: subcategoryData.seoDescription,
      images: [subcategoryData.image],
    },
  };
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { category, subcategory } = await params;
  const categoryData = getCategoryBySlug(category);
  const subcategoryData = getSubcategoryBySlug(subcategory);

  if (
    !categoryData ||
    !subcategoryData ||
    subcategoryData.parentCategorySlug !== categoryData.slug
  ) {
    notFound();
  }

  const nonce = (await headers()).get("x-nonce");
  const descriptionParagraphs = subcategoryData.descriptionEl.split("\n\n");
  const siblingLinks = categoryData.subcategories.filter(
    (item) => item.slug !== subcategoryData.slug,
  );

  return (
    <main className="min-h-screen bg-[var(--theme-bg-solid)] pb-16 pt-24 text-[var(--theme-text)]">
      <FaqSchema items={subcategoryData.faqsEl} nonce={nonce} />

      <div className="mx-auto max-w-7xl px-6">
        <Breadcrumbs
          items={[
            { label: "Προϊόντα", href: "/products" },
            {
              label: categoryData.nameEl,
              href: `/products/${categoryData.slug}`,
            },
            {
              label: subcategoryData.nameEl,
              href: subcategoryData.canonicalPath,
            },
          ]}
          nonce={nonce}
        />

        <section className="grid gap-8 border-b border-[var(--theme-glass-border)] pb-10 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,34rem)]">
          <div className="grid content-start gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex border border-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--theme-accent)_10%,transparent)] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--theme-accent)]">
                {subcategoryData.tagEl}
              </span>
              <TrackedLink
                className="inline-flex items-center gap-2 text-sm text-[var(--theme-text-muted)] transition-colors hover:text-[var(--theme-text)]"
                eventName="category_cta_click"
                eventParams={{
                  location: "subcategory_back_link",
                  page_type: "subcategory",
                  category_slug: categoryData.slug,
                }}
                href={`/products/${categoryData.slug}`}
              >
                <ArrowLeft className="h-4 w-4" />
                Επιστροφή στην κατηγορία
              </TrackedLink>
            </div>

            <h1 className="max-w-[12ch] text-[clamp(2.5rem,6vw,4.8rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
              {subcategoryData.nameEl}
            </h1>
            <p className="max-w-[56ch] text-base leading-8 text-[var(--theme-text-muted)] md:text-lg">
              {subcategoryData.summaryEl}
            </p>

            <div className="grid gap-4 border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_74%,transparent)] p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
                Άμεση Επικοινωνία
              </p>
              <p className="text-sm leading-7 text-[var(--theme-text-muted)]">
                Αν χρειάζεστε τεχνική επιβεβαίωση, διαθεσιμότητα ή βοήθεια για
                σωστή ένταξη της λύσης στο έργο σας, η ομάδα μας είναι διαθέσιμη
                τηλεφωνικά και μέσω email.
              </p>
              <div className="flex flex-wrap gap-3">
                <TrackedLink
                  className="inline-flex min-h-11 items-center gap-2 border border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] px-4 py-2 text-sm font-semibold transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_44%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-accent)_14%,transparent)]"
                  eventName="phone_click"
                  eventParams={{
                    location: "subcategory_hero",
                    page_type: "subcategory",
                    category_slug: categoryData.slug,
                    subcategory_slug: subcategoryData.slug,
                  }}
                  href={BUSINESS_PHONE_HREF}
                >
                  <Phone className="h-4 w-4 text-[var(--theme-accent)]" />
                  {BUSINESS_PHONE_DISPLAY}
                </TrackedLink>
                <TrackedLink
                  className="inline-flex min-h-11 items-center gap-2 border border-[var(--theme-glass-border)] px-4 py-2 text-sm font-semibold transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_32%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)]"
                  eventName="email_click"
                  eventParams={{
                    location: "subcategory_hero",
                    page_type: "subcategory",
                    category_slug: categoryData.slug,
                    subcategory_slug: subcategoryData.slug,
                  }}
                  href={BUSINESS_EMAIL_HREF}
                >
                  <Mail className="h-4 w-4 text-[var(--theme-accent)]" />
                  {BUSINESS_EMAIL}
                </TrackedLink>
                <Link
                  className="inline-flex min-h-11 items-center border border-[var(--theme-glass-border)] px-4 py-2 text-sm font-semibold transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_32%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)]"
                  href="/contact"
                >
                  Φόρμα επικοινωνίας
                </Link>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border border-[var(--theme-glass-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-glass-bg)_54%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_92%,transparent))]">
            <div className="absolute inset-x-6 top-5 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.55),transparent)]" />
            <div className="relative h-[24rem] md:h-[30rem]">
              <Image
                alt={subcategoryData.nameEl}
                className="object-contain p-8"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 34rem"
                src={subcategoryData.image}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
          <div className="grid gap-6">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
                Αναλυτική Περιγραφή
              </p>
              <div className="mt-4 grid gap-5 text-base leading-8 text-[var(--theme-text-muted)]">
                {descriptionParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] p-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
                  Κύρια Σημεία
                </p>
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-[var(--theme-text-muted)]">
                  {subcategoryData.highlightsEl.map((highlight) => (
                    <li className="flex gap-3" key={highlight}>
                      <span className="mt-2 h-1.5 w-1.5 bg-[var(--theme-accent)]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] p-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
                  Ενδεικτικές Εφαρμογές
                </p>
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-[var(--theme-text-muted)]">
                  {subcategoryData.applicationsEl.map((application) => (
                    <li className="flex gap-3" key={application}>
                      <span className="mt-2 h-1.5 w-1.5 bg-[var(--theme-accent)]" />
                      <span>{application}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>

          <aside className="grid content-start gap-4">
            <div className="border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_76%,transparent)] p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
                Σχετική Κατηγορία
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                {categoryData.nameEl}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--theme-text-muted)]">
                Δείτε τη βασική landing page της κατηγορίας για να συγκρίνετε
                σχετικές λύσεις και να πλοηγηθείτε σε περισσότερες επιλογές.
              </p>
              <TrackedLink
                className="mt-4 inline-flex min-h-11 items-center border border-[var(--theme-glass-border)] px-4 py-2 text-sm font-semibold transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_32%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)]"
                eventName="category_cta_click"
                eventParams={{
                  location: "subcategory_related_category",
                  page_type: "subcategory",
                  category_slug: categoryData.slug,
                }}
                href={`/products/${categoryData.slug}`}
              >
                Δείτε την κατηγορία
              </TrackedLink>
            </div>

            {siblingLinks.length > 0 ? (
              <div className="border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_76%,transparent)] p-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
                  Σχετικές Υποκατηγορίες
                </p>
                <div className="mt-4 grid gap-3">
                  {siblingLinks.map((item) => (
                    <TrackedLink
                      className="border border-[var(--theme-glass-border)] px-4 py-3 text-sm leading-6 text-[var(--theme-text-muted)] transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_90%,transparent)] hover:text-[var(--theme-text)]"
                      eventName="subcategory_cta_click"
                      eventParams={{
                        location: "subcategory_related_links",
                        page_type: "subcategory",
                        category_slug: categoryData.slug,
                        subcategory_slug: item.slug,
                      }}
                      href={item.canonicalPath}
                      key={item.slug}
                    >
                      {item.nameEl}
                    </TrackedLink>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </section>

        <section className="border-t border-[var(--theme-glass-border)] py-10">
          <div className="mb-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
              Συχνές Ερωτήσεις
            </p>
            <h2 className="mt-2 text-[clamp(1.8rem,3vw,2.6rem)] font-semibold tracking-[-0.04em]">
              Τι ρωτούν συχνά για το {subcategoryData.nameEl}
            </h2>
          </div>

          <div className="grid gap-4">
            {subcategoryData.faqsEl.map((item) => (
              <article
                className="border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] p-5"
                key={item.question}
              >
                <h3 className="text-lg font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--theme-text-muted)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
