/** Year AEROFREN was founded. Used in schema markup, copy, and footer. */
export const FOUNDING_YEAR = 1980;

/** Years of experience — auto-calculated from founding year */
export const YEARS_OF_EXPERIENCE = new Date().getFullYear() - FOUNDING_YEAR;

/** Approximate SKU count for copy and schema */
export const PRODUCT_COUNT = "120.000+";

/** Official business name */
export const BUSINESS_NAME = "AEROFREN";

/** Canonical website URL — no trailing slash */
export const SITE_URL = "https://aerofren.gr";

/** Schema @id for the Organization node — must be identical across all schemas */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** Schema @id for the Founder Person node */
export const FOUNDER_ID = `${SITE_URL}/#founder`;

/** Schema @id for the WebSite node */
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** The three resource guide slugs — single source for sitemap + generateStaticParams */
export const RESOURCE_GUIDE_SLUGS = [
  "odigos-epilogis-rakor",
  "plastica-vs-oreichalkos-vs-anoxeidoto",
  "sxediasmos-pneumatikoy-kyklomatos",
] as const;

export type ResourceGuideSlug = typeof RESOURCE_GUIDE_SLUGS[number];
