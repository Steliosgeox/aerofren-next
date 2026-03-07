import type { MetadataRoute } from "next";
import { RESOURCE_GUIDE_SLUGS } from "@/lib/constants/aerofren";

/**
 * Dynamic sitemap for AEROFREN
 * Generates URLs for all public pages including:
 * - Static pages (home, about, contact, products)
 * - Resource guide detail pages
 */
const CATALOG_LAST_UPDATED = new Date("2026-02-27");  // Update when catalog changes
const SITE_LAUNCHED = new Date("2025-01-01");         // Approximate launch date

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://aerofren.gr";

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: CATALOG_LAST_UPDATED,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: SITE_LAUNCHED,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: SITE_LAUNCHED,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date("2026-02-22"),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date("2026-02-22"),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: CATALOG_LAST_UPDATED,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/glossary`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/resources`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        ...RESOURCE_GUIDE_SLUGS.map((slug) => ({
            url: `${baseUrl}/resources/${slug}`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        })),
        {
            url: `${baseUrl}/alternatives`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/industries`,
            lastModified: new Date("2026-02-27"),
            changeFrequency: "monthly",
            priority: 0.7,
        },
    ];

    return staticPages;
}
