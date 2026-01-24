import { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategoryBySlug } from "@/data/categories";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { SubcategoryCard } from "@/components/catalog/SubcategoryCard";
import { CategorySidebar } from "@/components/catalog/CategorySidebar";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight } from "lucide-react";
import Image from "next/image";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: "Κατηγορία δεν βρέθηκε | AEROFREN",
    };
  }

  return {
    title: `${category.nameEl} | AEROFREN`,
    description: category.descriptionEl,
    openGraph: {
      title: `${category.nameEl} | AEROFREN`,
      description: category.descriptionEl,
      images: [category.image],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--theme-bg-solid)" }}>
      {/* Hero Section */}
      <section className="relative bg-[var(--theme-bg-solid)] text-[var(--theme-text)] py-16 pt-28 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src={category.image}
            alt={category.nameEl}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-bg-solid)] to-[color-mix(in_srgb,var(--theme-bg-solid)_60%,transparent)]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Breadcrumbs
            items={[
              { label: "Προϊόντα", href: "/products" },
              { label: category.nameEl, href: `/products/${category.slug}` },
            ]}
          />

          <div className="mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div
                className="inline-flex items-center justify-center w-16 h-16 bg-[var(--theme-accent)] rounded-2xl shadow-lg mb-4"
              >
                <span className="text-white text-2xl font-bold">
                  {category.nameEl.charAt(0)}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                {category.nameEl}
              </h1>

              <p className="text-lg text-[var(--theme-text-muted)] max-w-2xl">
                {category.descriptionEl}
              </p>

              <div className="flex items-center gap-4 mt-6">
                <span className="px-4 py-2 rounded-full bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] backdrop-blur-sm text-sm font-semibold">
                  {category.productCount.toLocaleString("el-GR")} προϊόντα
                </span>
                <span className="px-4 py-2 rounded-full bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] backdrop-blur-sm text-sm font-semibold">
                  {category.subcategories.length} υποκατηγορίες
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent-hover)]"
              >
                <Phone className="w-4 h-4 mr-2" />
                Ζητήστε τιμή
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-72 shrink-0">
              <CategorySidebar currentCategory={category.slug} />
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--theme-text)]">
                    Υποκατηγορίες
                  </h2>
                  <p className="text-[var(--theme-text-muted)]">
                    Επιλέξτε υποκατηγορία για να δείτε τα προϊόντα
                  </p>
                </div>
              </div>

              {/* Subcategories Grid */}
              <ProductGrid columns={3}>
                {category.subcategories.map((subcategory) => (
                  <SubcategoryCard
                    key={subcategory.id}
                    subcategory={subcategory}
                    categorySlug={category.slug}
                  />
                ))}
              </ProductGrid>

              {/* Empty State */}
              {category.subcategories.length === 0 && (
                <div className="text-center py-16 bg-[var(--theme-glass-bg)] rounded-2xl border border-[var(--theme-glass-border)]">
                  <p className="text-[var(--theme-text-muted)] mb-4">
                    Δεν υπάρχουν διαθέσιμες υποκατηγορίες.
                  </p>
                  <Button asChild>
                    <a href="/contact">
                      Επικοινωνήστε μαζί μας
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              )}

              {/* CTA Box */}
              <div className="mt-12 bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-hover)] rounded-2xl p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Χρειάζεστε προσφορά;
                    </h3>
                    <p className="text-white/80">
                      Στείλτε μας τη λίστα σας και λάβετε προσφορά εντός 24 ωρών.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href="tel:2103461645"
                      className="inline-flex items-center justify-center h-12 px-6 bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] text-white font-bold rounded-xl border border-[color-mix(in_srgb,var(--theme-accent)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_95%,transparent)] transition-colors"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      210 3461645
                    </a>
                    <a
                      href="/contact"
                      className="inline-flex items-center justify-center h-12 px-6 bg-[color-mix(in_srgb,var(--theme-glass-bg)_85%,transparent)] backdrop-blur-sm text-white font-bold rounded-xl border border-[color-mix(in_srgb,var(--theme-accent)_20%,transparent)] hover:bg-[color-mix(in_srgb,var(--theme-glass-bg)_95%,transparent)] transition-colors"
                    >
                      Φόρμα επικοινωνίας
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
