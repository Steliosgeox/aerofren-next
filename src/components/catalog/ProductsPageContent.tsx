"use client";

import { useRef } from "react";
import { gsap, useGSAP, DURATION, EASE, STAGGER } from "@/lib/gsap";
import { categories } from "@/data/categories";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Search } from "lucide-react";

/**
 * Animated Products Page
 * 
 * GSAP animations:
 * - Header fade in
 * - Category grid stagger
 * - CTA reveal on scroll
 */
export function ProductsPageContent({ totalProducts }: { totalProducts: number }) {
    const pageRef = useRef<HTMLDivElement>(null);

    // GSAP plugins registered at import time

    useGSAP(
        () => {
            // Header entrance
            gsap.fromTo(
                "[data-anim='page-header']",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: DURATION.normal, ease: EASE.smooth }
            );

            // Search bar
            gsap.fromTo(
                "[data-anim='search-bar']",
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: DURATION.normal, delay: 0.15, ease: EASE.smooth }
            );

            // Category cards stagger
            gsap.fromTo(
                "[data-anim='product-card']",
                { opacity: 0, y: 30, scale: 0.98 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: DURATION.normal,
                    stagger: STAGGER.fast,
                    ease: EASE.smooth,
                    delay: 0.25,
                }
            );

            // CTA section
            gsap.fromTo(
                "[data-anim='cta-section']",
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: DURATION.normal,
                    ease: EASE.smooth,
                    scrollTrigger: {
                        trigger: "[data-anim='cta-section']",
                        start: "top 85%",
                    },
                }
            );
        },
        { scope: pageRef }
    );

    return (
        <div ref={pageRef} className="min-h-screen bg-slate-50">
            {/* Header */}
            <section className="bg-white border-b border-slate-200 pt-24 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    <Breadcrumbs items={[{ label: "Προϊόντα", href: "/products" }]} />

                    <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div data-anim="page-header" className="opacity-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                                Κατάλογος Προϊόντων
                            </h1>
                            <p className="text-slate-500 mt-1">
                                {totalProducts.toLocaleString("el-GR")}+ προϊόντα σε {categories.length} κατηγορίες
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div data-anim="search-bar" className="w-full md:w-96 opacity-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Αναζήτηση προϊόντων..."
                                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <ProductGrid columns={4}>
                        {categories.map((category) => (
                            <div key={category.id} data-anim="product-card" className="opacity-0">
                                <CategoryCard category={category} />
                            </div>
                        ))}
                    </ProductGrid>
                </div>
            </section>

            {/* CTA */}
            <section data-anim="cta-section" className="py-12 bg-white border-t border-slate-200 opacity-0">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-xl font-bold text-slate-900 mb-3">
                        Χρειάζεστε βοήθεια;
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Επικοινωνήστε μαζί μας για εξατομικευμένες λύσεις.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="tel:2103461645"
                            className="inline-flex items-center justify-center h-11 px-6 bg-[#0066cc] text-white font-medium rounded-xl hover:bg-[#004999] transition-colors"
                        >
                            📞 210 3461645
                        </a>
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center h-11 px-6 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:border-[#0066cc] hover:text-[#0066cc] transition-colors"
                        >
                            Στείλτε Μήνυμα
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
