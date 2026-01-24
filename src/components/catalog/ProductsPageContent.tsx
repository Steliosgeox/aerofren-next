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
        <div ref={pageRef} className="min-h-screen" style={{ background: "var(--theme-bg-solid)" }}>
            {/* Header */}
            <section className="bg-[var(--theme-glass-bg)] border-b border-[var(--theme-glass-border)] pt-24 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    <Breadcrumbs items={[{ label: "Προϊόντα", href: "/products" }]} />

                    <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div data-anim="page-header" className="opacity-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-[var(--theme-text)]">
                                Κατάλογος Προϊόντων
                            </h1>
                            <p className="text-[var(--theme-text-muted)] mt-1">
                                {totalProducts.toLocaleString("el-GR")}+ προϊόντα σε {categories.length} κατηγορίες
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div data-anim="search-bar" className="w-full md:w-96 opacity-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--theme-text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Αναζήτηση προϊόντων..."
                                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--theme-glass-bg)] border border-[var(--theme-glass-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent transition-all"
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
            <section data-anim="cta-section" className="py-12 bg-[var(--theme-glass-bg)] border-t border-[var(--theme-glass-border)] opacity-0">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-xl font-bold text-[var(--theme-text)] mb-3">
                        Χρειάζεστε βοήθεια;
                    </h2>
                    <p className="text-[var(--theme-text-muted)] mb-6">
                        Επικοινωνήστε μαζί μας για εξατομικευμένες λύσεις.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="tel:2103461645"
                            className="inline-flex items-center justify-center h-11 px-6 bg-[var(--theme-accent)] text-[var(--theme-text-inverse)] font-medium rounded-xl hover:bg-[var(--theme-accent-hover)] transition-colors"
                        >
                            📞 210 3461645
                        </a>
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center h-11 px-6 bg-[var(--theme-glass-bg)] border border-[var(--theme-glass-border)] text-[var(--theme-text)] font-medium rounded-xl hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] transition-colors"
                        >
                            Στείλτε μήνυμα
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
