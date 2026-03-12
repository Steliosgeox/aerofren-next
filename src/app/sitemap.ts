import type { MetadataRoute } from "next";
import { catalogCategories } from "@/data/catalog-taxonomy";
import { RESOURCE_GUIDE_SLUGS, SITE_URL } from "@/lib/constants/aerofren";

/**
 * Dynamic sitemap for AEROFREN
 * Generates URLs for all public pages including:
 * - Static pages (home, about, contact, products)
 * - Resource guide detail pages
 */
const CATALOG_LAST_UPDATED = new Date("2026-02-27");  // Update when catalog changes
const SITE_LAUNCHED = new Date("2025-01-01");         // Approximate launch date

export default function sitemap(): MetadataRoute.Sitemap {
    const catalogPages: MetadataRoute.Sitemap = [
        ...catalogCategories.map((category) => ({
            url: `${SITE_URL}/products/${category.slug}`,
            lastModified: CATALOG_LAST_UPDATED,
            changeFrequency: "weekly" as const,
            priority: 0.85,
        })),
        ...catalogCategories.flatMap((category) =>
            category.subcategories.map((subcategory) => ({
                url: `${SITE_URL}${subcategory.canonicalPath}`,
                lastModified: CATALOG_LAST_UPDATED,
                changeFrequency: "weekly" as const,
                priority: 0.75,
            })),
        ),
    ];

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: CATALOG_LAST_UPDATED,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: SITE_LAUNCHED,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: SITE_LAUNCHED,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date("2026-02-22"),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: new Date("2026-02-22"),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/products`,
            lastModified: CATALOG_LAST_UPDATED,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/faq`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/glossary`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/resources`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        ...RESOURCE_GUIDE_SLUGS.map((slug) => ({
            url: `${SITE_URL}/resources/${slug}`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        })),
        {
            url: `${SITE_URL}/alternatives`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/industries`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly",
            priority: 0.7,
        },
    ];

    return [...staticPages, ...catalogPages];
}
