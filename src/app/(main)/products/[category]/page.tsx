import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import {
  getCategoryBySlug,
  getCategoryStaticParams,
} from "@/data/catalog-taxonomy";
import { ItemListSchema } from "@/lib/schema/ItemListSchema";
import {
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_HREF,
  PRODUCT_COUNT,
  SITE_URL,
} from "@/lib/constants/aerofren";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export function generateStaticParams() {
  return getCategoryStaticParams();
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryData = getCategoryBySlug(category);

  if (!categoryData) {
    return {
      title: "Κατηγορία προϊόντων | AEROFREN",
    };
  }

  const canonical = `${SITE_URL}/products/${categoryData.slug}`;

  return {
    title: categoryData.seoTitle,
    description: categoryData.seoDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: categoryData.seoTitle,
      description: categoryData.seoDescription,
      url: canonical,
      siteName: "AEROFREN",
      locale: "el_GR",
      type: "website",
      images: [
        {
          url: categoryData.image,
          width: 1200,
          height: 630,
          alt: categoryData.nameEl,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: categoryData.seoTitle,
      description: categoryData.seoDescription,
      images: [categoryData.image],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = getCategoryBySlug(category);

  if (!categoryData) {
    notFound();
  }

  const nonce = (await headers()).get("x-nonce");
  const canonical = `${SITE_URL}/products/${categoryData.slug}`;

  return (
    <main className="min-h-screen bg-[var(--theme-bg-solid)] pb-16 pt-24 text-[var(--theme-text)]">
      <ItemListSchema
        description={categoryData.seoDescription}
        items={categoryData.subcategories.map((subcategory) => ({
          name: subcategory.nameEl,
          url: `${SITE_URL}${subcategory.canonicalPath}`,
          description: subcategory.summaryEl,
          image: `${SITE_URL}${subcategory.image}`,
        }))}
        name={categoryData.nameEl}
        nonce={nonce}
        url={canonical}
      />

      <div className="mx-auto max-w-7xl px-6">
        <Breadcrumbs
          items={[
            { label: "Προϊόντα", href: "/products" },
            {
              label: categoryData.nameEl,
              href: `/products/${categoryData.slug}`,
            },
          ]}
          nonce={nonce}
        />

        <section className="grid gap-8 border-b border-[var(--theme-glass-border)] pb-10 pt-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,32rem)]">
          <div className="grid content-start gap-5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-[var(--theme-accent)]">
              SEO Κατηγορία Προϊόντων
            </p>
            <h1 className="max-w-[12ch] text-[clamp(2.6rem,6vw,5rem)] font-semibold leading-[0.94] tracking-[-0.05em]">
              {categoryData.nameEl}
            </h1>
            <p className="max-w-[58ch] text-base leading-8 text-[var(--theme-text-muted)] md:text-lg">
              {categoryData.summaryEl}
            </p>
            <p className="max-w-[58ch] text-sm leading-8 text-[var(--theme-text-muted)]">
              {categoryData.introEl}
            </p>

            <div className="grid gap-3 pt-2 md:grid-cols-3">
              {categoryData.benefitsEl.map((benefit) => (
                <div
                  className="border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_74%,transparent)] p-4 text-sm leading-7 text-[var(--theme-text-muted)]"
                  key={benefit}
                >
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_78%,transparent)] p-4">
            <div className="relative overflow-hidden border border-[color-mix(in_srgb,var(--theme-accent)_14%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-glass-bg)_58%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_92%,transparent))]">
              <div className="absolute inset-x-6 top-5 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.55),transparent)]" />
              <div className="relative h-[22rem]">
                <Image
                  alt={categoryData.nameEl}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 32rem"
                  src={categoryData.image}
                />
              </div>
            </div>

            <div className="grid gap-4 border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_72%,transparent)] p-5">
              <div className="grid grid-cols-2 gap-4 border-b border-[var(--theme-glass-border)] pb-4">
                <div>
                  <p className="text-[1.9rem] font-semibold tracking-[-0.04em]">
                    {categoryData.subcategories.length}
                  </p>
                  <p className="text-sm text-[var(--theme-text-muted)]">
                    υποκατηγορίες
                  </p>
                </div>
                <div>
                  <p className="text-[1.9rem] font-semibold tracking-[-0.04em]">
                    {PRODUCT_COUNT}
                  </p>
                  <p className="text-sm text-[var(--theme-text-muted)]">
                    ευρύτερη γκάμα
                  </p>
                </div>
              </div>
              <p className="text-sm leading-7 text-[var(--theme-text-muted)]">
                Επιλέξτε σχετική υποκατηγορία για πιο στοχευμένο περιεχόμενο και
                επικοινωνήστε μαζί μας για τεχνική επιβεβαίωση, διαθεσιμότητα και
                δρομολόγηση παραγγελίας.
              </p>
              <div className="flex flex-wrap gap-3">
                <TrackedLink
                  className="inline-flex min-h-11 items-center gap-2 border border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] px-4 py-2 text-sm font-semibold transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_44%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-accent)_14%,transparent)]"
                  eventName="phone_click"
                  eventParams={{
                    location: "category_hero",
                    page_type: "category",
                    category_slug: categoryData.slug,
                  }}
                  href={BUSINESS_PHONE_HREF}
                >
                  <Phone className="h-4 w-4 text-[var(--theme-accent)]" />
                  {BUSINESS_PHONE_DISPLAY}
                </TrackedLink>
                <Link
                  className="inline-flex min-h-11 items-center gap-2 border border-[var(--theme-glass-border)] px-4 py-2 text-sm font-semibold transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_32%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)]"
                  href="/contact"
                >
                  Φόρμα επικοινωνίας
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
                Landing Pages
              </p>
              <h2 className="mt-2 text-[clamp(1.9rem,3vw,3rem)] font-semibold tracking-[-0.04em]">
                Υποκατηγορίες της {categoryData.nameEl}
              </h2>
            </div>
            <p className="max-w-[44ch] text-sm leading-7 text-[var(--theme-text-muted)]">
              Κάθε υποκατηγορία διαθέτει δική της indexable σελίδα με αναλυτική
              περιγραφή, συχνές ερωτήσεις και άμεση πρόσβαση στην ομάδα μας.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categoryData.subcategories.map((subcategory) => (
              <TrackedLink
                className="group grid overflow-hidden border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_76%,transparent)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-[2px] hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:shadow-[0_18px_34px_rgba(0,0,0,0.16)]"
                eventName="subcategory_cta_click"
                eventParams={{
                  location: "category_subcategory_grid",
                  page_type: "category",
                  category_slug: categoryData.slug,
                  subcategory_slug: subcategory.slug,
                }}
                href={subcategory.canonicalPath}
                key={subcategory.slug}
              >
                <div className="relative h-64 overflow-hidden border-b border-[var(--theme-glass-border)]">
                  <Image
                    alt={subcategory.nameEl}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                    src={subcategory.image}
                  />
                </div>
                <div className="grid gap-3 p-5">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-[var(--theme-accent)]">
                    {subcategory.tagEl}
                  </p>
                  <h3 className="text-[1.35rem] font-semibold leading-[1.02] tracking-[-0.04em]">
                    {subcategory.nameEl}
                  </h3>
                  <p className="text-sm leading-7 text-[var(--theme-text-muted)]">
                    {subcategory.summaryEl}
                  </p>
                  <ul className="grid gap-2 pt-1 text-sm leading-6 text-[var(--theme-text-muted)]">
                    {subcategory.highlightsEl.map((highlight) => (
                      <li className="flex gap-2" key={highlight}>
                        <span className="mt-2 h-1.5 w-1.5 bg-[var(--theme-accent)]" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--theme-text)]">
                    Δείτε τη landing page
                    <ArrowRight className="h-4 w-4 text-[var(--theme-accent)] transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </TrackedLink>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--theme-glass-border)] py-10">
          <div className="mb-6">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
              Συχνές Ερωτήσεις
            </p>
            <h2 className="mt-2 text-[clamp(1.8rem,3vw,2.6rem)] font-semibold tracking-[-0.04em]">
              Τι ρωτούν συχνότερα για την κατηγορία
            </h2>
          </div>

          <div className="grid gap-4">
            {categoryData.faqsEl.map((item) => (
              <article
                className="border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] p-5"
                key={item.question}
              >
                <h3 className="text-lg font-semibold text-[var(--theme-text)]">
                  {item.question}
                </h3>
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
