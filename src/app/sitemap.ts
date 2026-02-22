import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";

/**
 * Dynamic sitemap for AEROFREN
 * Generates URLs for all public pages including:
 * - Static pages (home, about, contact, products index)
 * - Dynamic category pages (12 categories)
 * - Dynamic subcategory pages (~66 subcategories)
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://aerofren.gr";
    const now = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.9,
        },
    ];

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${baseUrl}/products/${cat.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    // Subcategory pages
    const subcategoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) =>
        cat.subcategories.map((sub) => ({
            url: `${baseUrl}/products/${cat.slug}/${sub.slug}`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.6,
        }))
    );

    return [...staticPages, ...categoryPages, ...subcategoryPages];
}
