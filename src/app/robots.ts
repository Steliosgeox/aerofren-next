import type { MetadataRoute } from "next";

/**
 * Robots.txt configuration for AEROFREN
 * Blocks admin, API, and auth routes from crawlers.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/admin/", "/api/", "/login", "/signup"],
        },
        sitemap: "https://aerofren.gr/sitemap.xml",
    };
}
