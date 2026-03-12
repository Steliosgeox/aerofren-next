"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageSquareText, Phone } from "lucide-react";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { ProductDetailRail } from "@/components/catalog/ProductDetailRail";
import { catalogCategories } from "@/data/catalog-taxonomy";
import {
  productShowcaseItems,
  type ProductShowcaseItem,
} from "@/data/product-showcase";
import {
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_HREF,
  PRODUCT_COUNT,
} from "@/lib/constants/aerofren";

export function ProductsPageContent() {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductShowcaseItem | null>(null);

  return (
    <div
      className="min-h-screen overflow-x-clip bg-[var(--theme-bg-solid)] text-[var(--theme-text)]"
      style={{
        backgroundImage:
          "radial-gradient(circle at top left, color-mix(in srgb, var(--theme-accent) 16%, transparent), transparent 32%), radial-gradient(circle at 82% 16%, color-mix(in srgb, var(--theme-accent) 10%, transparent), transparent 26%)",
      }}
    >
      <section className="relative overflow-hidden border-b border-[var(--theme-glass-border)] pt-24">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute inset-x-6 top-8 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.65),transparent)]" />
          <div className="absolute bottom-8 right-6 top-8 w-px bg-[linear-gradient(180deg,transparent,rgba(var(--theme-accent-rgb),0.25),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-12">
          <Breadcrumbs items={[{ label: "Προϊόντα", href: "/products" }]} />

          <div className="grid gap-8 py-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,24rem)] lg:items-end">
            <div className="grid gap-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-[var(--theme-accent)]">
                Βιομηχανικός Εξοπλισμός
              </p>
              <h1 className="max-w-[12ch] text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.92] tracking-[-0.05em]">
                Προϊόντα για Δίκτυα Αέρα &amp; Νερού
              </h1>
              <p className="max-w-[56ch] text-base leading-8 text-[var(--theme-text-muted)] md:text-lg">
                Ο κόμβος `/products` λειτουργεί ως κεντρική σελίδα πλοήγησης.
                Από εδώ μεταβαίνετε στις indexable κατηγορίες και στις επιμέρους
                landing pages που καλύπτουν το σύνολο του καταλόγου.
              </p>
              <p className="max-w-[56ch] text-sm leading-8 text-[var(--theme-text-muted)]">
                Για τη γενική γκάμα μιλάμε για πάνω από {PRODUCT_COUNT} προϊόντα.
                Παρακάτω βλέπετε τις 7 βασικές canonical κατηγορίες και ένα
                curated showcase επιλεγμένων λύσεων.
              </p>
            </div>

            <div className="grid gap-4 border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_76%,transparent)] p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[var(--theme-text-muted)]">
                Τρόπος εξυπηρέτησης
              </p>
              <div className="grid grid-cols-2 gap-4 border-y border-[var(--theme-glass-border)] py-4">
                <div>
                  <p className="text-[2rem] font-semibold tracking-[-0.04em] text-[var(--theme-text)]">
                    {PRODUCT_COUNT}
                  </p>
                  <p className="text-sm text-[var(--theme-text-muted)]">
                    ευρύτερη γκάμα
                  </p>
                </div>
                <div>
                  <p className="text-[2rem] font-semibold tracking-[-0.04em] text-[var(--theme-text)]">
                    {catalogCategories.length}
                  </p>
                  <p className="text-sm text-[var(--theme-text-muted)]">
                    canonical κατηγορίες
                  </p>
                </div>
              </div>
              <div className="grid gap-3 text-sm leading-6 text-[var(--theme-text-muted)]">
                <p>
                  Για επιβεβαίωση διαθεσιμότητας, τεχνική αξιολόγηση και σωστή
                  δρομολόγηση παραγγελίας, επιλέξτε την πιο σχετική κατηγορία και
                  επικοινωνήστε μαζί μας άμεσα.
                </p>
                <div className="flex flex-wrap gap-3">
                  <TrackedLink
                    className="inline-flex min-h-11 items-center gap-2 border border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--theme-text)] transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_46%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-accent)_14%,transparent)]"
                    eventName="phone_click"
                    eventParams={{ location: "products_hero", page_type: "products_hub" }}
                    href={BUSINESS_PHONE_HREF}
                  >
                    <Phone className="h-4 w-4 text-[var(--theme-accent)]" />
                    {BUSINESS_PHONE_DISPLAY}
                  </TrackedLink>
                  <TrackedLink
                    className="inline-flex min-h-11 items-center gap-2 border border-[var(--theme-glass-border)] px-4 py-2 text-sm font-semibold text-[var(--theme-text)] transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_32%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)]"
                    eventName="chat_signup_click"
                    eventParams={{ location: "products_hero", page_type: "products_hub" }}
                    href="/signup"
                  >
                    <MessageSquareText className="h-4 w-4 text-[var(--theme-accent)]" />
                    Chat με λογαριασμό
                  </TrackedLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.25),transparent)]" />

        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[var(--theme-accent)]">
              Canonical SEO Structure
            </p>
            <h2 className="mt-2 text-[clamp(1.8rem,3.4vw,3rem)] font-semibold tracking-[-0.04em]">
              Κατηγορίες Προϊόντων
            </h2>
          </div>
          <p className="max-w-[42ch] text-sm leading-7 text-[var(--theme-text-muted)]">
            Οι παρακάτω κατηγορίες διαθέτουν δικές τους σελίδες και λειτουργούν
            ως η βασική εσωτερική αρχιτεκτονική του καταλόγου για πλοήγηση και SEO.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {catalogCategories.map((category) => (
            <TrackedLink
              className="group relative grid min-h-[29rem] grid-rows-[auto_auto_1fr_auto] overflow-hidden border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_74%,transparent)] text-left transition-[transform,border-color,box-shadow,background] duration-300 hover:-translate-y-[2px] hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_82%,transparent)] hover:shadow-[0_16px_34px_rgba(0,0,0,0.16)]"
              eventName="category_cta_click"
              eventParams={{
                location: "products_category_grid",
                page_type: "products_hub",
                category_slug: category.slug,
              }}
              href={`/products/${category.slug}`}
              key={category.slug}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-accent)_10%,transparent),transparent_18%,color-mix(in_srgb,var(--theme-bg-solid)_12%,transparent)_100%)] opacity-80" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.55),transparent)]" />

              <div className="relative flex items-start justify-between px-5 pb-4 pt-5">
                <div className="grid gap-2">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
                    {category.subcategories.length} υποκατηγορίες
                  </p>
                  <p className="text-[0.78rem] text-[var(--theme-text-muted)]">
                    /products/{category.slug}
                  </p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center border border-[color-mix(in_srgb,var(--theme-accent)_18%,transparent)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_62%,transparent)] text-[var(--theme-accent)] transition-transform duration-300 group-hover:-translate-y-[1px] group-hover:translate-x-[1px]">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>

              <div className="relative px-5">
                <div className="border border-[color-mix(in_srgb,var(--theme-glass-border)_92%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-glass-bg)_52%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_94%,transparent))]">
                  <div className="relative h-[16rem]">
                    <Image
                      alt={category.nameEl}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                      src={category.image}
                    />
                  </div>
                </div>
              </div>

              <div className="grid content-start gap-3 px-5 pb-6 pt-5">
                <h3 className="max-w-[16ch] text-[1.45rem] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--theme-text)]">
                  {category.nameEl}
                </h3>
                <p className="max-w-[34ch] text-sm leading-7 text-[var(--theme-text-muted)]">
                  {category.summaryEl}
                </p>
              </div>

              <div className="relative mt-4 flex items-center justify-between border-t border-[var(--theme-glass-border)] px-5 py-4">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--theme-text-muted)]">
                  Δείτε τη landing page
                </span>
                <span className="h-2 w-2 bg-[var(--theme-accent)] transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </TrackedLink>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[var(--theme-accent)]">
              Curated Showcase
            </p>
            <h2 className="mt-2 text-[clamp(1.8rem,3.4vw,3rem)] font-semibold tracking-[-0.04em]">
              Επιλεγμένα Προϊόντα σε Προβολή
            </h2>
          </div>
          <p className="max-w-[42ch] text-sm leading-7 text-[var(--theme-text-muted)]">
            Το παρακάτω showcase λειτουργεί υποστηρικτικά για το brand και το
            sales flow, χωρίς να αντικαθιστά τις κατηγορικές landing pages.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {productShowcaseItems.map((product, index) => {
            const isActive = selectedProduct?.id === product.id;

            return (
              <button
                aria-label={product.nameEl}
                aria-pressed={isActive}
                className={`group relative grid min-h-[30rem] grid-rows-[auto_auto_1fr_auto] overflow-hidden border text-left transition-[transform,border-color,box-shadow,background] duration-300 ${
                  isActive
                    ? "border-[color-mix(in_srgb,var(--theme-accent)_42%,transparent)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_88%,transparent)] shadow-[0_18px_38px_rgba(0,0,0,0.22)]"
                    : "border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_74%,transparent)] hover:-translate-y-[2px] hover:border-[color-mix(in_srgb,var(--theme-accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_82%,transparent)] hover:shadow-[0_16px_34px_rgba(0,0,0,0.16)]"
                }`}
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                type="button"
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-accent)_10%,transparent),transparent_18%,color-mix(in_srgb,var(--theme-bg-solid)_12%,transparent)_100%)] opacity-80" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--theme-accent-rgb),0.55),transparent)]" />

                <div className="relative flex items-start justify-between px-5 pb-4 pt-5">
                  <div className="grid gap-2">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
                      {product.tagEl}
                    </p>
                    <p className="text-[0.78rem] text-[var(--theme-text-muted)]">
                      #{String(index + 1).padStart(2, "0")}
                    </p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center border border-[color-mix(in_srgb,var(--theme-accent)_18%,transparent)] bg-[color-mix(in_srgb,var(--theme-bg-solid)_62%,transparent)] text-[var(--theme-accent)] transition-transform duration-300 group-hover:-translate-y-[1px] group-hover:translate-x-[1px]">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <div className="relative px-5">
                  <div className="border border-[color-mix(in_srgb,var(--theme-glass-border)_92%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-glass-bg)_52%,transparent),color-mix(in_srgb,var(--theme-bg-solid)_94%,transparent))]">
                    <div className="grid h-[16rem] place-items-center p-6">
                      <div className="relative h-full w-full max-w-[14rem]">
                        <Image
                          alt={product.nameEl}
                          className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                          fill
                          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                          src={product.image}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid content-start gap-3 px-5 pb-6 pt-5">
                  <h3 className="max-w-[16ch] text-[1.45rem] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--theme-text)]">
                    {product.nameEl}
                  </h3>
                  <p className="max-w-[34ch] text-sm leading-7 text-[var(--theme-text-muted)]">
                    {product.summaryEl}
                  </p>
                </div>

                <div className="relative mt-4 flex items-center justify-between border-t border-[var(--theme-glass-border)] px-5 py-4">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--theme-text-muted)]">
                    Άνοιγμα προβολής
                  </span>
                  <span className="h-2 w-2 bg-[var(--theme-accent)] transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 border border-[var(--theme-glass-border)] bg-[color-mix(in_srgb,var(--theme-glass-bg)_72%,transparent)] p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[var(--theme-accent)]">
              Συμβουλευτική Υποστήριξη
            </p>
            <p className="mt-2 max-w-[44ch] text-sm leading-7 text-[var(--theme-text-muted)]">
              Η εξειδικευμένη ομάδα μας είναι έτοιμη να ακούσει τις ανάγκες σας
              και να σας κατευθύνει στη σωστή category ή subcategory landing page.
            </p>
          </div>
          <TrackedLink
            className="inline-flex min-h-12 items-center justify-center border border-[color-mix(in_srgb,var(--theme-accent)_26%,transparent)] bg-[color-mix(in_srgb,var(--theme-accent)_12%,transparent)] px-5 text-sm font-semibold text-[var(--theme-text)] transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_44%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-accent)_18%,transparent)]"
            eventName="phone_click"
            eventParams={{ location: "products_support_cta", page_type: "products_hub" }}
            href={BUSINESS_PHONE_HREF}
          >
            {BUSINESS_PHONE_DISPLAY}
          </TrackedLink>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-[var(--theme-glass-border)] px-5 text-sm font-semibold text-[var(--theme-text)] transition-[border-color,background] duration-200 hover:border-[color-mix(in_srgb,var(--theme-accent)_32%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_92%,transparent)]"
            href="/contact"
          >
            Φόρμα επικοινωνίας
            <ArrowRight className="h-4 w-4 text-[var(--theme-accent)]" />
          </Link>
        </div>
      </section>

      <ProductDetailRail
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </div>
  );
}
