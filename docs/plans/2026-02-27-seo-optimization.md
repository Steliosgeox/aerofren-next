# AEROFREN SEO Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make aerofren.gr one of the most SEO-optimized B2B industrial websites on Google by implementing JSON-LD schema markup, technical fixes, Core Web Vitals optimization, and new content pages.

**Architecture:** Three-phase approach — Phase 1 fixes technical gaps and adds schema to all 84+ existing pages; Phase 2 creates new content pages (FAQ, Glossary, Resources, Alternatives, Industries); Phase 3 adds GEO authority signals. All schema is implemented as reusable TypeScript utilities in `src/lib/schema/` and injected via Next.js's built-in `<Script>` or inline `<script type="application/ld+json">` tags.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, `next/image`, `next/dynamic`

---

## Pre-Flight Check

Before starting, run these from `aerofren-next/`:

```bash
npm run build    # Must pass with 0 errors
npm run dev      # Start dev server on http://localhost:3000
```

---

## PHASE 1: Technical Foundation + Schema + Core Web Vitals

---

### Task 1: Save design doc + create schema lib directory

**Files:**
- Create: `docs/plans/2026-02-27-seo-design.md` (this file — already done)
- Create: `src/lib/schema/.gitkeep` (to establish directory)

**Step 1: Create schema directory**

```bash
mkdir -p src/lib/schema
```

**Step 2: Commit**

```bash
git add docs/plans/
git commit -m "docs: add SEO optimization design doc and plan"
```

---

### Task 2: Fix homepage title (English → Greek)

**Files:**
- Modify: `src/app/(main)/page.tsx`

**Context:** The homepage metadata has an English title which contradicts the `el_GR` locale strategy. All other pages use Greek.

**Step 1: Open the file and locate the metadata export**

Read `src/app/(main)/page.tsx`. Find:
```typescript
export const metadata = {
  title: "AEROFREN | Industrial Water & Air Systems",
  ...
};
```

**Step 2: Replace with Greek title + add canonical**

Change the metadata export to:
```typescript
export const metadata: Metadata = {
  title: "AEROFREN – Εξαρτήματα Νερού & Αέρα | B2B Προμηθευτής",
  description: "Ηγέτης στα εξαρτήματα νερού και αέρα από το 1980. Καινοτόμες λύσεις για τον βιομηχανικό τομέα. 10.000+ προϊόντα, παρουσία από το 1980.",
  alternates: {
    canonical: "https://aerofren.gr",
  },
};
```

Add `import type { Metadata } from "next";` at the top if not present.

**Step 3: Verify**

```bash
npm run build
```
Expected: Build succeeds with 0 errors.

**Step 4: Commit**

```bash
git add src/app/(main)/page.tsx
git commit -m "fix(seo): homepage title Greek + canonical URL"
```

---

### Task 3: Add hreflang + verify lang="el" in root layout

**Files:**
- Modify: `src/app/layout.tsx`

**Context:** The site serves Greek content but has no language signals for Google's bilingual indexation. `<html lang="el">` tells crawlers the primary language. hreflang tags tell Google which URL serves which locale.

**Step 1: Read the current layout.tsx**

Open `src/app/layout.tsx`. Find the `<html>` tag and `<head>` section.

**Step 2: Ensure `lang="el"` on the html element**

The `<html>` tag should be:
```tsx
<html lang="el" suppressHydrationWarning>
```

**Step 3: Add hreflang alternate links**

In the `metadata` export in `layout.tsx`, add the `alternates` field:
```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://aerofren.gr"),
  // ... existing fields ...
  alternates: {
    languages: {
      "el": "https://aerofren.gr",
      "en": "https://aerofren.gr",
      "x-default": "https://aerofren.gr",
    },
  },
};
```

> Note: Since this is a single-page bilingual strategy (not separate routes), both `el` and `en` point to the same base URL. This tells Google the site serves both locales.

**Step 4: Verify**

```bash
npm run build
# Then in browser DevTools on localhost:3000, view page source
# Look for: <link rel="alternate" hreflang="el" href="https://aerofren.gr"/>
```

**Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(seo): add hreflang tags and verify lang=el on html element"
```

---

### Task 4: Add canonical URLs to all existing pages

**Files:**
- Modify: `src/app/(main)/products/page.tsx`
- Modify: `src/app/(main)/products/[category]/page.tsx`
- Modify: `src/app/(main)/products/[category]/[subcategory]/page.tsx`
- Modify: `src/app/(about)/about/page.tsx`
- Modify: `src/app/(main)/contact/page.tsx`
- Modify: `src/app/(main)/privacy/page.tsx`
- Modify: `src/app/(main)/terms/page.tsx`

**Context:** Without canonical tags, Google may treat filter-param URLs (e.g., `/products?sort=price`) as duplicate pages and split ranking authority. Canonical tags concentrate authority on the clean URL.

**Step 1: Update products/page.tsx**

Add to the metadata export:
```typescript
alternates: {
  canonical: "https://aerofren.gr/products",
},
```

**Step 2: Update products/[category]/page.tsx**

In the `generateMetadata` function, add canonical using the slug:
```typescript
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  return {
    title: `${category.nameEl} | AEROFREN`,
    description: category.descriptionEl,
    alternates: {
      canonical: `https://aerofren.gr/products/${categorySlug}`,
    },
    openGraph: {
      title: `${category.nameEl} | AEROFREN`,
      description: category.descriptionEl,
      images: [category.image],
    },
  };
}
```

**Step 3: Update products/[category]/[subcategory]/page.tsx**

```typescript
alternates: {
  canonical: `https://aerofren.gr/products/${catSlug}/${subSlug}`,
},
```

**Step 4: Update all remaining static pages** with their respective canonical URLs:
- about: `"https://aerofren.gr/about"`
- contact: `"https://aerofren.gr/contact"`
- privacy: `"https://aerofren.gr/privacy"`
- terms: `"https://aerofren.gr/terms"`

**Step 5: Verify**

```bash
npm run build
```
Expected: Build succeeds with 0 errors. Check `<link rel="canonical">` in page source.

**Step 6: Commit**

```bash
git add src/app/
git commit -m "feat(seo): add canonical URLs to all existing pages"
```

---

### Task 5: Create Organization + WholesaleStore schema component

**Files:**
- Create: `src/lib/schema/OrganizationSchema.tsx`

**Context:** Zero JSON-LD schema exists currently. The Organization schema creates a Google Knowledge Panel for AEROFREN and establishes the brand as a trusted entity. The WholesaleStore type signals B2B wholesale to the search engine.

**Step 1: Create the file**

```tsx
// src/lib/schema/OrganizationSchema.tsx
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "WholesaleStore"],
        "@id": "https://aerofren.gr/#organization",
        "name": "AEROFREN",
        "url": "https://aerofren.gr",
        "logo": {
          "@type": "ImageObject",
          "url": "https://aerofren.gr/images/logo-light.webp",
          "width": 200,
          "height": 60,
        },
        "description": "B2B προμηθευτής πνευματικών εξαρτημάτων και συστημάτων νερού. B2B supplier of pneumatic and water system components.",
        "foundingDate": "1980",
        "telephone": "+302103461645",
        "email": "info@aerofren.gr",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Χρυσοστόμου Σμύρνης 26",
          "addressLocality": "Μοσχάτο",
          "addressRegion": "Αττική",
          "postalCode": "18344",
          "addressCountry": "GR",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "37.9371",
          "longitude": "23.6903",
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "09:00",
            "closes": "17:00",
          },
        ],
        "areaServed": [
          { "@type": "Country", "name": "Greece" },
          { "@type": "Continent", "name": "Europe" },
        ],
        "knowsAbout": [
          "Pneumatic Systems",
          "Water Fittings",
          "Industrial Components",
          "Push-in Fittings",
          "Compression Fittings",
          "Flow Control Valves",
          "Air Preparation Units",
        ],
        "numberOfEmployees": {
          "@type": "QuantitativeValue",
          "value": "10-50",
        },
        "sameAs": [
          "https://www.linkedin.com/company/aerofren",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
npm run build
```
Expected: 0 errors.

**Step 3: Commit**

```bash
git add src/lib/schema/OrganizationSchema.tsx
git commit -m "feat(schema): add Organization+WholesaleStore JSON-LD component"
```

---

### Task 6: Create WebSite schema with Sitelinks SearchAction

**Files:**
- Create: `src/lib/schema/WebsiteSchema.tsx`

**Context:** The WebSite schema with `SearchAction` unlocks the **Sitelinks Search Box** in Google — users can search the site directly from the Google SERP without visiting first.

**Step 1: Create the file**

```tsx
// src/lib/schema/WebsiteSchema.tsx
export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://aerofren.gr/#website",
    "name": "AEROFREN",
    "url": "https://aerofren.gr",
    "inLanguage": ["el", "en"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://aerofren.gr/products?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    "publisher": {
      "@id": "https://aerofren.gr/#organization",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Step 2: Commit**

```bash
git add src/lib/schema/WebsiteSchema.tsx
git commit -m "feat(schema): add WebSite+SearchAction JSON-LD for sitelinks search box"
```

---

### Task 7: Inject Organization + WebSite schemas into root layout

**Files:**
- Modify: `src/app/layout.tsx`

**Context:** Root layout renders on every page. Injecting Organization and WebSite schemas here ensures Google receives them on the very first crawl of any page.

**Step 1: Import the schema components**

At the top of `layout.tsx`:
```typescript
import { OrganizationSchema } from "@/lib/schema/OrganizationSchema";
import { WebsiteSchema } from "@/lib/schema/WebsiteSchema";
```

**Step 2: Add schemas to the `<body>` (or `<head>` equivalent)**

In the return JSX, add them inside `<body>` before the children:
```tsx
<body>
  <OrganizationSchema />
  <WebsiteSchema />
  {children}
</body>
```

> Note: Next.js App Router doesn't support adding `<script>` to `<head>` via direct JSX in layout. Placing JSON-LD `<script>` tags in `<body>` is valid per Google's spec and works identically for crawling.

**Step 3: Verify**

```bash
npm run dev
# Visit http://localhost:3000
# View page source, search for "application/ld+json"
# Should see Organization and WebSite schemas
```

**Step 4: Run build**

```bash
npm run build
```

**Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(schema): inject Organization and WebSite schemas into root layout"
```

---

### Task 8: Create BreadcrumbList schema utility

**Files:**
- Create: `src/lib/schema/breadcrumb.ts`

**Context:** Breadcrumbs appear in Google SERP URLs when BreadcrumbList schema is present. Currently, Breadcrumbs.tsx renders visual breadcrumbs but has no schema — Google can't read them.

**Step 1: Create the utility**

```typescript
// src/lib/schema/breadcrumb.ts

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url,
    })),
  };
}
```

**Step 2: Commit**

```bash
git add src/lib/schema/breadcrumb.ts
git commit -m "feat(schema): add BreadcrumbList schema builder utility"
```

---

### Task 9: Inject BreadcrumbList schema into Breadcrumbs component

**Files:**
- Modify: `src/components/catalog/Breadcrumbs.tsx`

**Context:** The existing `Breadcrumbs.tsx` renders visual breadcrumb links. We add a parallel JSON-LD `<script>` output using our new utility.

**Step 1: Read the current Breadcrumbs.tsx**

Open `src/components/catalog/Breadcrumbs.tsx` to understand its props interface.

**Step 2: Import the utility and add schema output**

At the top of the file, add:
```typescript
import { buildBreadcrumbSchema, type BreadcrumbItem } from "@/lib/schema/breadcrumb";
```

**Step 3: Modify the component return**

The component likely receives breadcrumb items as props. Add schema injection to the return:
```tsx
// At the end of the component, alongside the visual breadcrumbs:
const schemaItems: BreadcrumbItem[] = breadcrumbs.map((crumb) => ({
  name: crumb.label,          // adjust field names to match existing props
  url: `https://aerofren.gr${crumb.href}`,
}));

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(schemaItems)) }}
    />
    {/* existing visual breadcrumb JSX */}
  </>
);
```

> Adapt `crumb.label` and `crumb.href` to whatever fields actually exist in the current breadcrumb items interface.

**Step 4: Verify**

```bash
npm run dev
# Visit http://localhost:3000/products/push-in-fittings
# View source: search for "BreadcrumbList"
# Should see: {"@type":"BreadcrumbList","itemListElement":[...]}
```

**Step 5: Commit**

```bash
git add src/components/catalog/Breadcrumbs.tsx
git commit -m "feat(schema): inject BreadcrumbList JSON-LD into Breadcrumbs component"
```

---

### Task 10: Add ItemList schema to category pages

**Files:**
- Modify: `src/app/(main)/products/[category]/page.tsx`
- Create: `src/lib/schema/ItemListSchema.tsx`

**Context:** ItemList schema on category pages tells Google the page contains a list of related items (subcategories). This signals content depth and enables list-type rich results.

**Step 1: Create ItemListSchema component**

```tsx
// src/lib/schema/ItemListSchema.tsx
interface ItemListSchemaProps {
  name: string;
  description: string;
  url: string;
  items: Array<{
    name: string;
    url: string;
    description?: string;
    image?: string;
  }>;
}

export function ItemListSchema({ name, description, url, items }: ItemListSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": name,
    "description": description,
    "url": url,
    "numberOfItems": items.length,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "url": item.url,
      "description": item.description,
      "image": item.image,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Step 2: Inject into category page**

In `src/app/(main)/products/[category]/page.tsx`, import and render `<ItemListSchema>` in the page JSX, passing the category's subcategories as items:
```tsx
import { ItemListSchema } from "@/lib/schema/ItemListSchema";

// In the page component JSX:
<ItemListSchema
  name={category.nameEl}
  description={category.descriptionEl}
  url={`https://aerofren.gr/products/${categorySlug}`}
  items={subcategories.map((sub) => ({
    name: sub.nameEl,
    url: `https://aerofren.gr/products/${categorySlug}/${sub.slug}`,
    description: sub.descriptionEl,
    image: sub.image,
  }))}
/>
```

**Step 3: Build + verify**

```bash
npm run build
# Visit a category page, check source for "ItemList"
```

**Step 4: Commit**

```bash
git add src/lib/schema/ItemListSchema.tsx src/app/(main)/products/[category]/page.tsx
git commit -m "feat(schema): add ItemList JSON-LD to category pages"
```

---

### Task 11: Add Person (Founder) schema to About page

**Files:**
- Create: `src/lib/schema/PersonSchema.tsx`
- Modify: `src/app/(about)/about/page.tsx`

**Context:** Founder schema boosts E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) — a key Google ranking signal for B2B sites.

**Step 1: Create PersonSchema component**

```tsx
// src/lib/schema/PersonSchema.tsx
export function FounderPersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Βασίλειος Κουτελίδης",
    "alternateName": "Vassilios Koutelidis",
    "jobTitle": "Ιδρυτής",
    "description": "Ίδρυσε την AEROFREN το 1980 και καθόρισε την πορεία της στον κλάδο πνευματικών συστημάτων και εξαρτημάτων νερού.",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://aerofren.gr/#organization",
      "name": "AEROFREN",
    },
    "knowsAbout": [
      "Pneumatic Systems",
      "Industrial Fittings",
      "Water Systems",
      "B2B Distribution",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Step 2: Inject into About page**

In `src/app/(about)/about/page.tsx`:
```tsx
import { FounderPersonSchema } from "@/lib/schema/PersonSchema";

// In page JSX:
<FounderPersonSchema />
```

Also update the metadata in about/page.tsx to add canonical:
```typescript
export const metadata: Metadata = {
  title: "Η Ιστορία μας | AEROFREN",
  description: "Ανακαλύψτε την ιστορία της AEROFREN από το 1980...",
  alternates: {
    canonical: "https://aerofren.gr/about",
  },
};
```

**Step 3: Commit**

```bash
git add src/lib/schema/PersonSchema.tsx src/app/(about)/about/page.tsx
git commit -m "feat(schema): add Person/Founder schema to About page for E-E-A-T"
```

---

### Task 12: Update sitemap with dynamic lastModified

**Files:**
- Modify: `src/app/sitemap.ts`

**Context:** A static `lastModified: new Date()` on every build makes Google think everything changed every time you deploy. Dynamic dates based on actual content updates improve crawl efficiency.

**Step 1: Read current sitemap.ts**

Open `src/app/sitemap.ts` and review the current structure.

**Step 2: Set meaningful lastModified values**

Replace static `new Date()` with specific dates for static pages, and use a "last product update" timestamp for dynamic pages:

```typescript
const CATALOG_LAST_UPDATED = new Date("2026-02-27");  // Update when catalog changes
const SITE_LAUNCHED = new Date("2025-01-01");         // Approximate launch date

// Static pages
const staticPages = [
  { url: `${baseUrl}/`, lastModified: CATALOG_LAST_UPDATED, changeFrequency: "weekly", priority: 1.0 },
  { url: `${baseUrl}/about`, lastModified: SITE_LAUNCHED, changeFrequency: "monthly", priority: 0.7 },
  { url: `${baseUrl}/contact`, lastModified: SITE_LAUNCHED, changeFrequency: "monthly", priority: 0.6 },
  { url: `${baseUrl}/products`, lastModified: CATALOG_LAST_UPDATED, changeFrequency: "weekly", priority: 0.9 },
  { url: `${baseUrl}/privacy`, lastModified: new Date("2026-02-22"), changeFrequency: "yearly", priority: 0.3 },
  { url: `${baseUrl}/terms`, lastModified: new Date("2026-02-22"), changeFrequency: "yearly", priority: 0.3 },
];

// Category and subcategory pages use CATALOG_LAST_UPDATED
```

**Step 3: Build + verify sitemap**

```bash
npm run build && npm run start
# Visit http://localhost:3000/sitemap.xml
# Verify lastModified dates are correct (not all "2026-02-27")
```

**Step 4: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "fix(seo): sitemap uses meaningful lastModified dates instead of new Date()"
```

---

### Task 13: Core Web Vitals — Dynamic import NexusHero

**Files:**
- Modify: The file that imports/renders `NexusHero.tsx` (likely `src/app/(main)/page.tsx` or a HomePage component)

**Context:** Three.js is GPU-intensive. Blocking the initial page load with Three.js initialization causes poor LCP (Largest Contentful Paint). Dynamic import with `ssr: false` defers it until after hydration.

**Step 1: Find where NexusHero is imported**

Search the codebase for `import.*NexusHero` or `<NexusHero`.

**Step 2: Replace static import with dynamic import**

```typescript
// Remove the static import:
// import { NexusHero } from "@/components/NexusHero";

// Add dynamic import:
import dynamic from "next/dynamic";

const NexusHero = dynamic(
  () => import("@/components/NexusHero").then((mod) => mod.NexusHero),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center"
        aria-label="Loading hero"
      >
        {/* Static fallback — shows instantly, prevents layout shift */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">AEROFREN</h1>
          <p className="text-slate-300 mt-2">Εξαρτήματα Νερού & Αέρα</p>
        </div>
      </div>
    ),
  }
);
```

> The `loading` fallback prevents CLS (Cumulative Layout Shift) by maintaining the same dimensions as the Three.js canvas.

**Step 3: Run Lighthouse before/after**

```bash
npm run build && npm run start
# In Chrome: DevTools > Lighthouse > run on http://localhost:3000
# Note LCP score before and after this change
```

**Step 4: Commit**

```bash
git add <files changed>
git commit -m "perf: dynamic import NexusHero (Three.js) to improve LCP"
```

---

### Task 14: Core Web Vitals — Lazy-load ScrollFrameAnimation

**Files:**
- Modify: `src/components/ScrollFrameAnimation.tsx` or its parent component

**Context:** Loading 118 WebP frames on page load is expensive. Only the first frame needs to be loaded initially — the rest load as the user scrolls.

**Step 1: Find where ScrollFrameAnimation renders**

Search for `ScrollFrameAnimation` usage.

**Step 2: Wrap with dynamic import + Intersection Observer**

Replace the import:
```typescript
import dynamic from "next/dynamic";

const ScrollFrameAnimation = dynamic(
  () => import("@/components/ScrollFrameAnimation"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-slate-900" aria-hidden="true" />
    ),
  }
);
```

**Step 3: Inside ScrollFrameAnimation.tsx, preload only frame 1**

At the top of the component, ensure only the first frame is in the initial load:
```typescript
// Preload first frame only
const FIRST_FRAME = "/frames/frame_001.webp"; // adjust path as needed

// All other frames load lazily as scroll progresses
```

If the component already uses an array of frame paths, ensure frames 2-118 are loaded lazily (e.g., via `requestIdleCallback` or after Intersection Observer triggers).

**Step 4: Build + verify**

```bash
npm run build
# Check Network tab in Chrome DevTools on initial load
# Should see only 1 frame loaded initially, not 118
```

**Step 5: Commit**

```bash
git add src/components/ScrollFrameAnimation.tsx
git commit -m "perf: lazy-load ScrollFrameAnimation frames to improve LCP/INP"
```

---

### Task 15: Core Web Vitals — Font preloading + image priority

**Files:**
- Modify: `src/app/layout.tsx`
- Audit: All category and subcategory page components

**Context:** Fonts that aren't preloaded cause Flash of Unstyled Text (FOUT) which contributes to CLS. Above-fold images without `priority` prop delay LCP.

**Step 1: Check what fonts are used**

Look at `src/styles/fonts.css` or `src/app/layout.tsx` for font imports.

**Step 2: Add font preloading to layout.tsx**

In the `<head>` section (via Next.js metadata or direct in layout JSX):
```tsx
// If using next/font (preferred):
import { Inter } from "next/font/google";  // or whatever font is used
// next/font handles preloading automatically

// If using CSS @font-face, add to layout metadata:
export const metadata: Metadata = {
  // ...existing
};

// And in layout JSX:
<link
  rel="preload"
  as="font"
  type="font/woff2"
  href="/fonts/your-font.woff2"
  crossOrigin="anonymous"
/>
```

> Adapt to whatever font loading strategy the project currently uses.

**Step 3: Audit hero/above-fold images**

Check the homepage and top of category pages for `<Image>` components. Ensure above-fold images have `priority`:
```tsx
<Image
  src="/images/hero-fittings.jpg"
  alt="AEROFREN - Εξαρτήματα Νερού & Αέρα"
  width={1200}
  height={630}
  priority  // Add this for above-fold images
/>
```

**Step 4: Build + commit**

```bash
npm run build
git add src/app/layout.tsx
git commit -m "perf: add font preloading and image priority props for LCP"
```

---

### Phase 1 Checkpoint

After Task 15, run a full verification:

```bash
# 1. Build succeeds
cd aerofren-next && npm run build

# 2. Check sitemap
npm run start &
curl http://localhost:3000/sitemap.xml | grep -c "<url>"
# Should show 84+ URLs

# 3. Check robots
curl http://localhost:3000/robots.txt

# 4. Verify schema in HTML
curl -s http://localhost:3000 | grep -c "application/ld+json"
# Should show at least 2 (Organization + WebSite)

curl -s http://localhost:3000/products/push-in-fittings | grep -c "application/ld+json"
# Should show 3+ (Organization + WebSite + BreadcrumbList + ItemList)
```

Then validate at: https://search.google.com/test/rich-results

---

## PHASE 2: New Content Pages

---

### Task 16: Create FAQPage schema builder

**Files:**
- Create: `src/lib/schema/FaqSchema.tsx`

**Step 1: Create the schema component**

```tsx
// src/lib/schema/FaqSchema.tsx
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSchemaProps {
  items: FaqItem[];
}

export function FaqSchema({ items }: FaqSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Step 2: Commit**

```bash
git add src/lib/schema/FaqSchema.tsx
git commit -m "feat(schema): add FAQPage schema builder component"
```

---

### Task 17: Create FAQ Hub page `/faq`

**Files:**
- Create: `src/app/(main)/faq/page.tsx`

**Context:** FAQ pages with `FAQPage` schema unlock expandable FAQ results directly in Google SERPs and are primary GEO citation sources. This bilingual (Greek primary) page targets both Greek and English FAQ queries.

**Step 1: Create the page**

```tsx
// src/app/(main)/faq/page.tsx
import type { Metadata } from "next";
import { FaqSchema } from "@/lib/schema/FaqSchema";

export const metadata: Metadata = {
  title: "Συχνές Ερωτήσεις | AEROFREN",
  description: "Απαντήσεις στις πιο συχνές ερωτήσεις για πνευματικά εξαρτήματα, ρακόρ, βαλβίδες και συστήματα νερού. FAQ for pneumatic fittings, valves, and water systems.",
  alternates: {
    canonical: "https://aerofren.gr/faq",
  },
};

const faqItems = [
  // GREEK SECTION
  {
    question: "Τι είναι τα push-in ρακόρ και πού χρησιμοποιούνται;",
    answer: "Τα push-in ρακόρ (ή ταχυσύνδεσμοι) είναι εξαρτήματα σύνδεσης σωλήνων που επιτρέπουν γρήγορη εγκατάσταση χωρίς εργαλεία — απλά ωθείτε τον σωλήνα μέσα. Χρησιμοποιούνται εκτενώς σε πνευματικά συστήματα, αυτοματισμούς, και βιομηχανικές εφαρμογές. Η AEROFREN διαθέτει πλαστικά, ορείχαλκα, και ανοξείδωτα push-in ρακόρ για πίεση έως 16 bar.",
  },
  {
    question: "Ποια η διαφορά μεταξύ ορείχαλκου και ανοξείδωτου ρακόρ;",
    answer: "Τα ορείχαλκα ρακόρ είναι οικονομικά, ανθεκτικά στην πίεση και κατάλληλα για γενική χρήση. Τα ανοξείδωτα (inox) ρακόρ έχουν ανώτερη αντίσταση στη διάβρωση και υψηλές θερμοκρασίες — ιδανικά για τρόφιμα, ποτά, χημικά, και παράκτιες εγκαταστάσεις. Η AEROFREN διαθέτει και τα δύο υλικά σε πλήρη γκάμα μεγεθών.",
  },
  {
    question: "Τι πίεση αντέχουν τα πνευματικά εξαρτήματα της AEROFREN;",
    answer: "Η τυπική γκάμα λειτουργεί σε πίεση 0-16 bar. Ορισμένες κατηγορίες (υψηλής πίεσης ρυθμιστές, ειδικοί κύλινδροι) φτάνουν έως 40 bar. Κάθε προϊόν φέρει τη μέγιστη επιτρεπόμενη πίεση λειτουργίας (MAP) στα τεχνικά χαρακτηριστικά του.",
  },
  {
    question: "Η AEROFREN εξυπηρετεί μόνο επαγγελματίες ή και ιδιώτες;",
    answer: "Η AEROFREN είναι αποκλειστικά B2B (business-to-business) προμηθευτής. Εξυπηρετούμε επαγγελματίες, εταιρείες, τεχνικούς, και κατασκευαστές. Για αγορά απαιτείται επαγγελματικό προφίλ.",
  },
  {
    question: "Ποιες μάρκες διαθέτει η AEROFREN;",
    answer: "Η AEROFREN αντιπροσωπεύει ή είναι συμβατή με τις κορυφαίες μάρκες πνευματικών συστημάτων παγκοσμίως. Διαθέτουμε εξαρτήματα συμβατά με SMC, Festo, Parker Hannifin, και άλλους κατασκευαστές, καθώς και premium ανεξάρτητες γκάμες.",
  },
  {
    question: "Πού βρίσκεται η AEROFREN και πώς μπορώ να επικοινωνήσω;",
    answer: "Τα κεντρικά γραφεία και αποθήκη βρίσκονται στη διεύθυνση Χρυσοστόμου Σμύρνης 26, Μοσχάτο, Αθήνα (ΤΚ 18344). Τηλέφωνο: 210 3461645. Δευτέρα–Παρασκευή 09:00–17:00.",
  },
  {
    question: "Τι είναι η FRL μονάδα σε πνευματικό σύστημα;",
    answer: "FRL σημαίνει Filter-Regulator-Lubricator (Φίλτρο-Ρυθμιστής-Λιπαντήρας). Είναι η βασική μονάδα προετοιμασίας αέρα που εγκαθίσταται στην είσοδο κάθε πνευματικού συστήματος: καθαρίζει τον αέρα, ρυθμίζει την πίεση, και λιπαίνει τα κινούμενα μέρη για μεγαλύτερη διάρκεια ζωής.",
  },
  {
    question: "Ποιος είναι ο χρόνος παράδοσης;",
    answer: "Τα διαθέσιμα προϊόντα παραδίδονται σε 1-3 εργάσιμες ημέρες στην Αττική. Εξωτερικός νομοί: 2-5 εργάσιμες. Για παραγγελίες εκτός αποθέματος ή ειδικές προδιαγραφές, επικοινωνήστε για ενημέρωση.",
  },
  // ENGLISH SECTION
  {
    question: "What is a push-in fitting and how does it work?",
    answer: "A push-in fitting (also called a push-to-connect or instant fitting) is a tube connector that requires no tools — you simply push the tube into the fitting body and a collet grips it securely. To release, press the release button and pull. Push-in fittings are used extensively in pneumatic systems, automation, and industrial plumbing. AEROFREN offers plastic, brass, and stainless steel push-in fittings for pressures up to 16 bar.",
  },
  {
    question: "What is the difference between push-in and compression fittings?",
    answer: "Push-in (push-to-connect) fittings use an internal collet mechanism for tool-free installation — ideal for pneumatics and automation. Compression fittings use a ferrule compressed by a nut against the tube, creating a leak-proof seal — ideal for hydraulics, high-pressure, and permanent installations. Compression fittings are generally stronger but take longer to install.",
  },
  {
    question: "What is an FRL unit in pneumatics?",
    answer: "An FRL unit (Filter-Regulator-Lubricator) is the air preparation assembly installed at the inlet of a pneumatic system. The Filter removes moisture and particulates, the Regulator controls supply pressure, and the Lubricator adds a fine oil mist to protect downstream actuators and valves. AEROFREN supplies complete FRL units and individual components from leading manufacturers.",
  },
  {
    question: "Do you ship internationally?",
    answer: "AEROFREN primarily serves the Greek market and EU buyers. For international orders, please contact us directly at info@aerofren.gr with your requirements and we will provide a quotation including shipping.",
  },
];

export default function FaqPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <FaqSchema items={faqItems} />

      <h1 className="text-3xl font-bold mb-2">Συχνές Ερωτήσεις</h1>
      <p className="text-muted-foreground mb-8">
        Frequently Asked Questions — Απαντήσεις στις πιο συχνές ερωτήσεις
      </p>

      {/* Greek Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-primary">🇬🇷 Ελληνικά</h2>
        <div className="space-y-6">
          {faqItems.filter((_, i) => i < 8).map((item, i) => (
            <div key={i} className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* English Section */}
      <section>
        <h2 className="text-xl font-semibold mb-6 text-primary">🇬🇧 English</h2>
        <div className="space-y-6">
          {faqItems.filter((_, i) => i >= 8).map((item, i) => (
            <div key={i} className="border-b pb-6">
              <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm text-muted-foreground mt-12">
        Τελευταία ενημέρωση: Φεβρουάριος 2026 · Last updated: February 2026
      </p>
    </main>
  );
}
```

**Step 2: Build + verify**

```bash
npm run build
# Visit http://localhost:3000/faq
# View source: search for "FAQPage"
# Should see FAQPage JSON-LD with all questions
```

**Step 3: Add to sitemap**

In `src/app/sitemap.ts`, add to staticPages:
```typescript
{ url: `${baseUrl}/faq`, lastModified: new Date("2026-02-27"), changeFrequency: "monthly", priority: 0.8 },
```

**Step 4: Commit**

```bash
git add src/app/(main)/faq/ src/app/sitemap.ts
git commit -m "feat(content): add bilingual FAQ hub page with FAQPage schema"
```

---

### Task 18: Create Technical Glossary page `/glossary`

**Files:**
- Create: `src/app/(main)/glossary/page.tsx`
- Create: `src/lib/schema/GlossarySchema.tsx`

**Context:** Glossary pages with `DefinedTermSet` schema are featured snippet magnets — Google shows definition cards for "τι είναι [term]" and "what is [term]" queries. 50+ terms = 50+ potential featured snippets.

**Step 1: Create GlossarySchema component**

```tsx
// src/lib/schema/GlossarySchema.tsx
interface GlossaryTerm {
  name: string;
  description: string;
  alternateName?: string;
}

export function GlossarySchema({ terms }: { terms: GlossaryTerm[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "AEROFREN Γλωσσάριο Πνευματικών & Υδραυλικών",
    "description": "Τεχνικοί ορισμοί για πνευματικά συστήματα, εξαρτήματα σύνδεσης, βαλβίδες, και συστήματα νερού.",
    "url": "https://aerofren.gr/glossary",
    "hasDefinedTerm": terms.map((term) => ({
      "@type": "DefinedTerm",
      "name": term.name,
      "description": term.description,
      "alternateName": term.alternateName,
      "inDefinedTermSet": "https://aerofren.gr/glossary",
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Step 2: Create glossary page with 30+ terms**

```tsx
// src/app/(main)/glossary/page.tsx
import type { Metadata } from "next";
import { GlossarySchema } from "@/lib/schema/GlossarySchema";

export const metadata: Metadata = {
  title: "Γλωσσάριο Πνευματικών Εξαρτημάτων | AEROFREN",
  description: "Πλήρες γλωσσάριο τεχνικών όρων για πνευματικά συστήματα, ρακόρ, βαλβίδες. Technical glossary for pneumatic fittings, valves, and industrial systems.",
  alternates: { canonical: "https://aerofren.gr/glossary" },
};

const terms = [
  { name: "Ρακόρ (Fitting)", alternateName: "Fitting", description: "Εξάρτημα σύνδεσης δύο ή περισσότερων σωλήνων ή αγωγών. Υπάρχουν διάφοροι τύποι: push-in, σπειρωτά, συμπίεσης (compression)." },
  { name: "Push-in Ρακόρ", alternateName: "Push-to-Connect Fitting", description: "Εξάρτημα σύνδεσης σωλήνα χωρίς εργαλεία. Ο σωλήνας εισάγεται απευθείας και κλειδώνει με εσωτερικό συνδετήρα (collet). Για αποσύνδεση πατάμε το δακτύλιο απελευθέρωσης." },
  { name: "Compression Fitting", alternateName: "Ρακόρ Συμπίεσης", description: "Εξάρτημα που χρησιμοποιεί δακτύλιο (ferrule) συμπιεσμένο από παξιμάδι για στεγανή σύνδεση. Ιδανικό για υψηλές πιέσεις και μόνιμες εγκαταστάσεις." },
  { name: "FRL Unit", alternateName: "Μονάδα Προετοιμασίας Αέρα", description: "Σύνολο Filter-Regulator-Lubricator. Φίλτρο αέρα, ρυθμιστής πίεσης, και λιπαντήρας σε ένα σύστημα. Εγκαθίσταται στην είσοδο πνευματικού συστήματος." },
  { name: "Βαλβίδα Ελέγχου Ροής", alternateName: "Flow Control Valve", description: "Βαλβίδα που ρυθμίζει την ταχύτητα ροής αέρα σε πνευματικό κύκλωμα, ελέγχοντας έτσι την ταχύτητα ενός κυλίνδρου ή άλλου ενεργοποιητή." },
  { name: "Πνευματικός Κύλινδρος", alternateName: "Pneumatic Cylinder / Actuator", description: "Ενεργοποιητής που μετατρέπει την πίεση αέρα σε γραμμική κίνηση. Διαθέτει έμβολο (piston) που κινείται εντός κυλινδρικού σώματος." },
  { name: "Ρυθμιστής Πίεσης", alternateName: "Pressure Regulator", description: "Συσκευή που διατηρεί σταθερή πίεση εξόδου ανεξάρτητα από διακυμάνσεις στην είσοδο. Απαραίτητος για την προστασία ευαίσθητων εξαρτημάτων." },
  { name: "Ταχυσύνδεσμος", alternateName: "Quick Connect / Quick Coupler", description: "Εξάρτημα που επιτρέπει γρήγορη σύνδεση/αποσύνδεση εύκαμπτων σωλήνων υπό πίεση. Χρησιμοποιείται σε αεροσυμπιεστές, πνευματικά εργαλεία." },
  { name: "Σωλήνας Πολυαιθυλενίου (PU/PA)", alternateName: "Polyurethane / Polyamide Tube", description: "Εύκαμπτος σωλήνας πνευματικών εφαρμογών από polyurethane (PU) ή polyamide (PA/nylon). Διατίθεται σε διάφορες διαμέτρους και χρώματα." },
  { name: "Πίεση Λειτουργίας (MAP)", alternateName: "Maximum Allowable Pressure", description: "Η μέγιστη ασφαλής πίεση λειτουργίας ενός εξαρτήματος. Πάντα να μην υπερβαίνετε το MAP που αναγράφεται στα τεχνικά χαρακτηριστικά." },
  { name: "Solenoid Valve", alternateName: "Ηλεκτροβαλβίδα", description: "Ηλεκτρομαγνητικά ελεγχόμενη βαλβίδα που ανοίγει/κλείνει με ηλεκτρικό σήμα. Χρησιμοποιείται για αυτοματισμό κυκλωμάτων αέρα ή νερού." },
  { name: "Air Preparation Unit", alternateName: "Μονάδα Προετοιμασίας Αέρα", description: "Γενικός όρος για εξαρτήματα που βελτιώνουν την ποιότητα πεπιεσμένου αέρα: φίλτρα, ρυθμιστές πίεσης, λιπαντήρες, αφυγραντήρες." },
  // Add more terms as needed for full 50+
];

export default function GlossaryPage() {
  const sortedTerms = [...terms].sort((a, b) => a.name.localeCompare(b.name, "el"));

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <GlossarySchema terms={terms} />

      <h1 className="text-3xl font-bold mb-2">Γλωσσάριο Τεχνικών Όρων</h1>
      <p className="text-muted-foreground mb-8">
        Technical Glossary — Ορισμοί εξαρτημάτων πνευματικών συστημάτων & νερού
      </p>

      <div className="grid gap-6">
        {sortedTerms.map((term, i) => (
          <div key={i} id={term.name.toLowerCase().replace(/\s+/g, "-")} className="border-b pb-4">
            <dt className="font-semibold text-lg">{term.name}</dt>
            {term.alternateName && (
              <span className="text-sm text-primary">{term.alternateName}</span>
            )}
            <dd className="mt-1 text-muted-foreground leading-relaxed">{term.description}</dd>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mt-12">
        Τελευταία ενημέρωση: Φεβρουάριος 2026
      </p>
    </main>
  );
}
```

**Step 3: Add to sitemap + commit**

```bash
# Add to sitemap.ts:
# { url: `${baseUrl}/glossary`, lastModified: new Date("2026-02-27"), changeFrequency: "monthly", priority: 0.8 },

git add src/app/(main)/glossary/ src/lib/schema/GlossarySchema.tsx src/app/sitemap.ts
git commit -m "feat(content): add Technical Glossary page with DefinedTermSet schema"
```

---

### Task 19: Create Resources (Industry Guides) pages

**Files:**
- Create: `src/app/(main)/resources/page.tsx`
- Create: `src/app/(main)/resources/[guide]/page.tsx`
- Create: `src/lib/schema/ArticleSchema.tsx`

**Context:** Long-form technical guides capture "how to" and "guide" keyword queries and unlock Google's HowTo rich cards. They also signal E-E-A-T (expertise) to Google's quality algorithms.

**Step 1: Create ArticleSchema**

```tsx
// src/lib/schema/ArticleSchema.tsx
interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  authorName?: string;
}

export function ArticleSchema({ title, description, url, datePublished, dateModified, authorName = "AEROFREN" }: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": title,
    "description": description,
    "url": url,
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@type": "Organization",
      "@id": "https://aerofren.gr/#organization",
      "name": authorName,
    },
    "publisher": {
      "@id": "https://aerofren.gr/#organization",
    },
    "inLanguage": ["el", "en"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Step 2: Create resources index page**

```tsx
// src/app/(main)/resources/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Τεχνικοί Οδηγοί & Resources | AEROFREN",
  description: "Τεχνικοί οδηγοί επιλογής πνευματικών εξαρτημάτων, σχεδίασης κυκλωμάτων, και σύγκρισης υλικών. Industrial guides for pneumatic system design.",
  alternates: { canonical: "https://aerofren.gr/resources" },
};

const guides = [
  { slug: "odigos-epilogis-rakor", title: "Οδηγός Επιλογής Πνευματικών Ρακόρ", description: "Πώς να επιλέξετε το σωστό τύπο ρακόρ για την εφαρμογή σας.", readTime: "5 λεπτά" },
  { slug: "plastica-vs-oreichalkos-vs-anoxeidoto", title: "Πλαστικά vs Ορείχαλκος vs Ανοξείδωτο: Πλήρης Σύγκριση", description: "Συγκριτικός πίνακας υλικών ρακόρ για να επιλέξετε το κατάλληλο.", readTime: "7 λεπτά" },
  { slug: "sxediasmos-pneumatikoy-kyklomatos", title: "Πώς να Σχεδιάσετε ένα Πνευματικό Κύκλωμα", description: "Βήμα-βήμα οδηγός για αρχάριους και έμπειρους τεχνικούς.", readTime: "10 λεπτά" },
];

export default function ResourcesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Τεχνικοί Οδηγοί</h1>
      <p className="text-muted-foreground mb-8">Technical Resources & Industry Guides</p>
      <div className="grid gap-6">
        {guides.map((guide) => (
          <Link key={guide.slug} href={`/resources/${guide.slug}`} className="border rounded-lg p-6 hover:border-primary transition-colors">
            <h2 className="font-semibold text-xl mb-2">{guide.title}</h2>
            <p className="text-muted-foreground mb-3">{guide.description}</p>
            <span className="text-sm text-primary">Ανάγνωση: {guide.readTime}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

**Step 3: Create guide detail page**

The `[guide]` dynamic page renders individual guide content. Create `src/app/(main)/resources/[guide]/page.tsx` with `generateStaticParams` for the 3 initial guides and rich `Article` schema markup on each.

**Step 4: Add to sitemap + commit**

```bash
# Add resources and guide URLs to sitemap.ts

git add src/app/(main)/resources/ src/lib/schema/ArticleSchema.tsx src/app/sitemap.ts
git commit -m "feat(content): add Industry Guides/Resources pages with TechArticle schema"
```

---

### Task 20: Create Competitor Alternatives page

**Files:**
- Create: `src/app/(main)/alternatives/page.tsx`

**Context:** "Alternative to SMC/Festo/Parker" queries come from high-intent buyers already in the decision stage. This page captures that traffic by answering their comparison questions directly.

**Step 1: Create the page**

```tsx
// src/app/(main)/alternatives/page.tsx
import type { Metadata } from "next";
import { FaqSchema } from "@/lib/schema/FaqSchema";

export const metadata: Metadata = {
  title: "Εναλλακτικό SMC, Festo, Parker στην Ελλάδα | AEROFREN",
  description: "Ψάχνετε εναλλακτικό προμηθευτή SMC, Festo, ή Parker στην Ελλάδα; Η AEROFREN προσφέρει συμβατά πνευματικά εξαρτήματα με παρουσία από το 1980. Greek alternatives to SMC Festo Parker pneumatic components.",
  alternates: { canonical: "https://aerofren.gr/alternatives" },
};

const alternativeFaqs = [
  {
    question: "Ψάχνετε εναλλακτικό στα εξαρτήματα SMC στην Ελλάδα;",
    answer: "Η AEROFREN είναι ο κορυφαίος B2B προμηθευτής πνευματικών εξαρτημάτων στην Ελλάδα με παρουσία από το 1980. Διαθέτουμε πλήρη γκάμα συμβατών εξαρτημάτων με τα standards SMC, συμπεριλαμβανομένων push-in ρακόρ, ταχυσύνδεσμων, βαλβίδων ελέγχου, FRL μονάδων και κυλίνδρων. Επικοινωνήστε για τεχνική υποστήριξη και τιμοδότηση.",
  },
  {
    question: "Υπάρχει εναλλακτικό Festo supplier στην Αθήνα;",
    answer: "Ναι. Η AEROFREN στο Μοσχάτο Αθηνών διαθέτει εξαρτήματα συμβατά με Festo standards: σωλήνες PA/PU, push-in ρακόρ, ηλεκτροβαλβίδες, και μονάδες επεξεργασίας αέρα. Στόκ άνω των 120.000 προϊόντων, παράδοση 1-3 εργάσιμες Αττική.",
  },
  {
    question: "Looking for Parker Hannifin alternatives in Greece?",
    answer: "AEROFREN is Greece's leading B2B pneumatic and fluid control components supplier. We carry Parker-compatible fittings, tubing, valves, and air preparation units. Operating since 1980 with 10,000+ products in stock, we are the preferred local alternative to international brands for Greek and European industrial buyers.",
  },
  {
    question: "What are the advantages of buying from AEROFREN vs international brands?",
    answer: "AEROFREN offers: (1) Local stock with 1-3 day delivery across Greece, (2) Greek-language technical support, (3) Competitive B2B pricing vs imported brand pricing, (4) operation since 1980, (5) Compatible components meeting the same technical standards as SMC, Festo, Parker, and other major brands.",
  },
  {
    question: "Ποια είναι τα πλεονεκτήματα της AEROFREN έναντι διεθνών προμηθευτών;",
    answer: "Η AEROFREN προσφέρει: (1) Τοπικό στόκ με παράδοση 1-3 ημέρες σε όλη την Ελλάδα, (2) Ελληνόφωνη τεχνική υποστήριξη, (3) Ανταγωνιστικές τιμές B2B, (4) παρουσία στην αγορά από το 1980, (5) Συμβατά εξαρτήματα που πληρούν τα ίδια τεχνικά standards με SMC, Festo, Parker.",
  },
];

export default function AlternativesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <FaqSchema items={alternativeFaqs} />

      <h1 className="text-3xl font-bold mb-2">
        Εναλλακτικός Προμηθευτής SMC, Festo & Parker στην Ελλάδα
      </h1>
      <p className="text-muted-foreground mb-8">
        Greek Alternative Supplier for International Pneumatic Brands
      </p>

      <div className="bg-primary/10 rounded-lg p-6 mb-10">
        <p className="text-lg font-medium">
          Η AEROFREN είναι ο κορυφαίος B2B προμηθευτής πνευματικών εξαρτημάτων στην Ελλάδα —
          με 10.000+ προϊόντα στόκ, παράδοση 1-3 ημέρες, και παρουσία από το 1980.
        </p>
      </div>

      <div className="space-y-6">
        {alternativeFaqs.map((item, i) => (
          <div key={i} className="border-b pb-6">
            <h2 className="font-semibold text-lg mb-2">{item.question}</h2>
            <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mt-12">
        Τελευταία ενημέρωση: Φεβρουάριος 2026
      </p>
    </main>
  );
}
```

**Step 2: Add to sitemap + commit**

```bash
git add src/app/(main)/alternatives/ src/app/sitemap.ts
git commit -m "feat(content): add Competitor Alternatives page targeting SMC/Festo/Parker buyers"
```

---

### Task 21: Create Industries Served page

**Files:**
- Create: `src/app/(main)/industries/page.tsx`

**Context:** Industry-specific landing pages capture vertical searches ("πνευματικά αγροτικός τομέας", "industrial fittings food grade Greece") and demonstrate expertise in specific sectors.

**Step 1: Create page**

```tsx
// src/app/(main)/industries/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Κλάδοι που Εξυπηρετούμε | AEROFREN",
  description: "AEROFREN εξυπηρετεί βιομηχανία, αγροτικό τομέα, τρόφιμα & ποτά, κατασκευές, ναυτιλία. Industrial pneumatic and water systems for every sector.",
  alternates: { canonical: "https://aerofren.gr/industries" },
};

const industries = [
  {
    name: "Βιομηχανία & Αυτοματισμός",
    nameEn: "Manufacturing & Automation",
    description: "Πνευματικά εξαρτήματα για γραμμές παραγωγής, ρομποτικά συστήματα, και βιομηχανικούς αυτοματισμούς.",
    products: ["Push-in ρακόρ", "Κύλινδροι", "Ηλεκτροβαλβίδες", "FRL μονάδες"],
  },
  {
    name: "Αγροτικός Τομέας",
    nameEn: "Agriculture",
    description: "Εξαρτήματα άρδευσης, υδροδότησης, και πνευματικών συστημάτων για αγροτικές εγκαταστάσεις.",
    products: ["Σωλήνες PE", "Ρακόρ νερού", "Βαλβίδες", "Συνδετήρες"],
  },
  {
    name: "Τρόφιμα & Ποτά",
    nameEn: "Food & Beverage",
    description: "Food-grade πνευματικά εξαρτήματα από ανοξείδωτο ατσάλι και εγκεκριμένα υλικά για βιομηχανίες τροφίμων.",
    products: ["Inox ρακόρ", "Food-grade σωλήνες", "Βαλβίδες inox"],
  },
  {
    name: "Κατασκευές",
    nameEn: "Construction",
    description: "Εξαρτήματα για πνευματικά εργαλεία, συστήματα αέρα, και υδραυλικές εγκαταστάσεις σε κατασκευαστικά έργα.",
    products: ["Ταχυσύνδεσμοι", "Σωλήνες υψηλής πίεσης", "Ρυθμιστές πίεσης"],
  },
  {
    name: "Ναυτιλία & Offshore",
    nameEn: "Marine & Offshore",
    description: "Ανθεκτικά εξαρτήματα για θαλάσσιες εφαρμογές με αντίσταση στη διάβρωση από αλατόνερο.",
    products: ["Marine-grade inox", "Ρακόρ ανθεκτικά σε αλάτι"],
  },
];

export default function IndustriesPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Κλάδοι που Εξυπηρετούμε</h1>
      <p className="text-muted-foreground mb-8">Industries We Serve</p>

      <div className="grid md:grid-cols-2 gap-6">
        {industries.map((industry, i) => (
          <div key={i} className="border rounded-lg p-6">
            <h2 className="font-semibold text-xl mb-1">{industry.name}</h2>
            <p className="text-sm text-primary mb-3">{industry.nameEn}</p>
            <p className="text-muted-foreground mb-4">{industry.description}</p>
            <ul className="text-sm space-y-1">
              {industry.products.map((p, j) => (
                <li key={j} className="flex items-center gap-2">
                  <span className="text-primary">→</span> {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
```

**Step 2: Add to sitemap + commit**

```bash
git add src/app/(main)/industries/ src/app/sitemap.ts
git commit -m "feat(content): add Industries Served page for vertical keyword coverage"
```

---

### Task 22: Add navigation links for new pages

**Files:**
- Modify: Navigation component (find it — likely `src/components/Navigation.tsx` or `src/components/layout/Header.tsx`)
- Modify: Footer component

**Context:** New pages must be internally linked to pass PageRank and be discovered by Googlebot. Google won't index orphan pages reliably.

**Step 1: Find the navigation component**

Search for `href="/about"` or `href="/products"` to find where nav links are defined.

**Step 2: Add new pages to footer navigation** (footer is safer than primary nav for new links):

```tsx
// Footer links to add:
{ label: "Συχνές Ερωτήσεις", href: "/faq" },
{ label: "Γλωσσάριο", href: "/glossary" },
{ label: "Τεχνικοί Οδηγοί", href: "/resources" },
{ label: "Κλάδοι", href: "/industries" },
```

**Step 3: Add to sitemap verification**

```bash
npm run build
curl http://localhost:3000/sitemap.xml | grep -E "faq|glossary|resources|alternatives|industries"
# Should show all 5+ new URLs
```

**Step 4: Commit**

```bash
git add <navigation/footer files>
git commit -m "feat(nav): add new SEO pages to footer navigation for internal linking"
```

---

## PHASE 3: GEO + Final Polish

---

### Task 23: Add "Last updated" timestamps to content pages

**Files:**
- Modify: All new content pages + category page template

**Step 1: Add to FAQ, Glossary, Resources, Alternatives pages**

Each page already has a "Τελευταία ενημέρωση" line from Tasks 17-21. Verify they all have it.

**Step 2: Add to category pages**

In `src/app/(main)/products/[category]/page.tsx`, add to the page JSX:
```tsx
<p className="text-xs text-muted-foreground mt-8">
  Τελευταία ενημέρωση καταλόγου: Φεβρουάριος 2026
</p>
```

**Step 3: Commit**

```bash
git add src/app/
git commit -m "feat(geo): add last-updated timestamps to all content pages for GEO signals"
```

---

### Task 24: Final build + complete verification

**Step 1: Clean build**

```bash
cd aerofren-next
npm run build
# Expected: ✓ Compiled successfully with 0 errors
# Expected: All routes generated (should show 90+ routes)
```

**Step 2: Schema audit**

```bash
npm run start &

# Check homepage schemas
curl -s http://localhost:3000 | grep -o '"@type"' | wc -l
# Should show 5+ (Organization, WholesaleStore, WebSite, etc.)

# Check a category page
curl -s "http://localhost:3000/products/push-in-fittings" | grep -o '"@type"' | wc -l
# Should show 8+ (all schemas + BreadcrumbList + ItemList)

# Check FAQ page
curl -s http://localhost:3000/faq | grep "FAQPage"
# Should return match
```

**Step 3: Validate via Google Rich Results Test**

Go to https://search.google.com/test/rich-results and test:
- `http://localhost:3000` (need public URL or use ngrok)
- Or after deployment: `https://aerofren.gr`

Expected valid results: Organization, BreadcrumbList, WebSite, FAQPage

**Step 4: Sitemap count**

```bash
curl http://localhost:3000/sitemap.xml | grep -c "<url>"
# Should show 90+ (84 existing + 6+ new pages)
```

**Step 5: Final commit**

```bash
git add .
git commit -m "feat(seo): complete Phase 1+2 SEO optimization — schema, CWV, new content pages"
```

---

## Keyword Clusters to Monitor in GSC

After deployment, track these in Google Search Console > Performance > Queries:

| Cluster | Example Queries | Expected Timeline |
|---------|----------------|-------------------|
| Homepage | `εξαρτήματα πνευματικών`, `b2b προμηθευτής Μοσχάτο` | 4-8 weeks |
| Category | `push-in ρακόρ`, `βαλβίδες ελέγχου ροής` | 6-12 weeks |
| FAQ | `τι είναι push-in ρακόρ`, `what is FRL unit` | 4-8 weeks |
| Competitor | `εναλλακτικό SMC Ελλάδα`, `Festo alternative Greece` | 8-16 weeks |
| Local | `πνευματικά εξαρτήματα Μοσχάτο`, `ρακόρ χονδρική Αθήνα` | 4-8 weeks |

---

## Rich Results to Watch in GSC

GSC > Search Appearance:
- **FAQ Results** — from `/faq` and `/alternatives` FAQPage schema
- **Breadcrumbs** — from BreadcrumbList on all category/subcategory pages
- **Sitelinks Search Box** — from WebSite SearchAction schema
- **Organization Knowledge Panel** — from Organization schema (takes 4-12 weeks)
