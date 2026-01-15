"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { categories, getSubcategoryBySlug } from "@/data/categories";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { CategorySidebar } from "@/components/catalog/CategorySidebar";
import { QuoteModal } from "@/components/QuoteModal";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageCircle, ArrowRight, Package } from "lucide-react";

// Generate sample products based on subcategory
function generateSampleProducts(subcategoryName: string, count: number = 8) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${subcategoryName}-${i + 1}`,
    sku: `SKU-${String(i + 1).padStart(4, "0")}`,
    name: `${subcategoryName} - Τύπος ${i + 1}`,
    description: "Υψηλής ποιότητας προϊόν για επαγγελματική χρήση.",
    image: "/images/hero-fittings.jpg", // Placeholder
  }));
}

export default function SubcategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const subcategorySlug = params.subcategory as string;

  const [quoteModal, setQuoteModal] = useState<{
    isOpen: boolean;
    productName?: string;
    productSku?: string;
  }>({ isOpen: false });

  const result = getSubcategoryBySlug(categorySlug, subcategorySlug);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Η υποκατηγορία δεν βρέθηκε
          </h1>
          <a href="/products" className="text-[#0066cc] hover:underline">
            Επιστροφή στον κατάλογο
          </a>
        </div>
      </div>
    );
  }

  const { category, subcategory } = result;
  const sampleProducts = generateSampleProducts(subcategory.nameEl);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 pt-28 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image
            src={subcategory.image}
            alt={subcategory.nameEl}
            fill
            className="object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Breadcrumbs
            items={[
              { label: "Προϊόντα", href: "/products" },
              { label: category.nameEl, href: `/products/${category.slug}` },
              {
                label: subcategory.nameEl,
                href: `/products/${category.slug}/${subcategory.slug}`,
              },
            ]}
          />

          <div className="mt-4">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              {subcategory.nameEl}
            </h1>
            <p className="text-slate-300">
              {subcategory.productCount.toLocaleString("el-GR")} προϊόντα σε αυτή την κατηγορία
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-72 shrink-0">
              <CategorySidebar currentCategory={category.slug} />
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Info Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                <Package className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">
                    Η AEROFREN δεν διαθέτει ηλεκτρονικό κατάστημα.
                  </p>
                  <p className="text-sm text-amber-700">
                    Για τιμές και παραγγελίες επικοινωνήστε μαζί μας ή στείλτε
                    αίτημα προσφοράς.
                  </p>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sampleProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-[#0066cc] transition-all group"
                  >
                    {/* Product Image */}
                    <div className="relative h-40 bg-slate-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <span className="text-xs text-slate-500 font-mono">
                        {product.sku}
                      </span>
                      <h3 className="font-semibold text-slate-900 mt-1 line-clamp-2 group-hover:text-[#0066cc] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Quote Button */}
                      <Button
                        className="w-full mt-4"
                        variant="outline"
                        onClick={() =>
                          setQuoteModal({
                            isOpen: true,
                            productName: product.name,
                            productSku: product.sku,
                          })
                        }
                      >
                        Ζητήστε Τιμή
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Placeholder */}
              <div className="mt-8 text-center">
                <p className="text-slate-500 mb-4">
                  Εμφανίζονται {sampleProducts.length} από{" "}
                  {subcategory.productCount.toLocaleString("el-GR")} προϊόντα
                </p>
                <Button variant="outline" size="lg">
                  Επικοινωνήστε για τον πλήρη κατάλογο
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Contact CTA */}
              <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Χρειάζεστε Βοήθεια με την Επιλογή;
                </h3>
                <p className="text-slate-600 mb-6">
                  Η τεχνική μας ομάδα είναι έτοιμη να σας καθοδηγήσει στην επιλογή
                  των κατάλληλων προϊόντων για την εφαρμογή σας.
                </p>

                <div className="grid sm:grid-cols-3 gap-4">
                  <a
                    href="tel:2103461645"
                    className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-[#0066cc]/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0066cc]/10 flex items-center justify-center text-[#0066cc] group-hover:bg-[#0066cc] group-hover:text-white transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">
                        Τηλέφωνο
                      </span>
                      <span className="font-semibold text-slate-900">
                        210 3461645
                      </span>
                    </div>
                  </a>

                  <a
                    href="mailto:info@aerofren.gr"
                    className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-[#0066cc]/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0066cc]/10 flex items-center justify-center text-[#0066cc] group-hover:bg-[#0066cc] group-hover:text-white transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Email</span>
                      <span className="font-semibold text-slate-900">
                        info@aerofren.gr
                      </span>
                    </div>
                  </a>

                  <button
                    onClick={() => setQuoteModal({ isOpen: true })}
                    className="flex items-center gap-3 p-4 rounded-xl bg-[#0066cc] text-white hover:bg-[#0066cc]/90 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs text-white/80 block">
                        Online
                      </span>
                      <span className="font-semibold">Ζητήστε Προσφορά</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Modal */}
      <QuoteModal
        isOpen={quoteModal.isOpen}
        onClose={() => setQuoteModal({ isOpen: false })}
        productName={quoteModal.productName}
        productSku={quoteModal.productSku}
        categoryName={`${category.nameEl} > ${subcategory.nameEl}`}
      />
    </div>
  );
}
