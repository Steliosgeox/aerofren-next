# SEO Implementation Audit & Refactor Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix every code quality, schema validity, SSR correctness, and content consistency issue identified across two independent code reviews of the SEO implementation (commits b3ec91b → ecd3229).

**Architecture:** All fixes are surgical. No visual changes, no feature additions. YAGNI. The changes fall into three layers: (1) shared constants to eliminate duplication, (2) server-component correctness for schema injection, (3) schema.org spec compliance.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict mode, schema.org JSON-LD

---

## Issue Registry

| ID | Severity | File | Problem | Status |
|----|----------|------|---------|--------|
| C-01 | CRITICAL | `Breadcrumbs.tsx:1` | `"use client"` causes BreadcrumbList JSON-LD to be client-only — invisible to Googlebot SSR crawl | Open |
| C-02 | CRITICAL | All schema components | `<script>` tags missing `nonce` prop — will be blocked by CSP if nonce enforcement is active | Open |
| I-01 | IMPORTANT | `OrganizationSchema.tsx:7` | `"WholesaleStore"` is not a valid schema.org type — causes Search Console errors | Open |
| I-02 | IMPORTANT | `OrganizationSchema.tsx:44` | `"Continent"` is not a valid schema.org type for `areaServed` | Open |
| I-03 | IMPORTANT | `OrganizationSchema.tsx:57` | `QuantitativeValue.value: "10-50"` — must be `minValue`/`maxValue` numbers, not a string range | Open |
| I-04 | IMPORTANT | `ItemListSchema.tsx:27-28` | `description` and `image` are not valid schema.org properties on `ListItem` | Open |
| I-05 | IMPORTANT | `PersonSchema.tsx` | `Person` node has no `@id` — cannot be referenced by other schemas in the graph | Open |
| I-06 | IMPORTANT | `sitemap.ts` | Individual `/resources/[guide]` pages missing — only `/resources` index is listed | Open |
| I-07 | IMPORTANT | `industries/page.tsx` | Page has zero JSON-LD schema — only new content page with no structured data | Open |
| I-08 | IMPORTANT | `glossary/page.tsx:39` | Passes unsorted `terms` to `GlossarySchema` but sorted `sortedTerms` to UI — inconsistency | Open |
| I-09 | IMPORTANT | Multiple files | Founding year/experience inconsistency: schema says 1980, footer says 1989, copy says "35+" | Open |
| M-01 | MINOR | `faq/page.tsx:80,93` | Filter boundary `i < 8` is a hardcoded magic number — breaks silently if new Greek FAQs added | Open |
| M-02 | MINOR | `faq/page.tsx:81,94` | `key={i}` on filtered array — both first items get `key=0`, duplicate React keys | Open |
| M-03 | MINOR | `glossary/page.tsx:48` | `key={i}` on sorted array — should use stable term name | Open |
| M-04 | MINOR | `industries/page.tsx:50,56` | `key={i}` and nested `key={j}` — index keys throughout | Open |
| M-05 | MINOR | All new content pages | Missing `openGraph` metadata — pages won't preview on social media/Slack/LinkedIn | Open |
| M-06 | MINOR | `PersonSchema.tsx:9` | Description says "35+ χρόνια" — founded 1980 = 46+ years in 2026, factually wrong | Open |
| M-07 | MINOR | `WebsiteSchema.tsx` | Bare object without `@graph` — inconsistent with `OrganizationSchema` which uses `@graph` | Open |
| M-08 | MINOR | `WebsiteSchema.tsx:16` | `query-input` property deprecated by Google in February 2024 — harmless but dead code | Open |

---

## Root Cause Analysis

### Why C-01 exists
`Breadcrumbs.tsx` was originally a client component for interactivity. The SEO implementation added JSON-LD injection without auditing whether the component had server-component prerequisites. The `"use client"` directive is not needed — `Link`, `ChevronRight`, and `Home` from lucide-react are all renderable server-side.

### Why C-02 exists
The `OrganizationSchema` and `WebsiteSchema` components were designed as pure functional components returning `<script>` JSX. The nonce plumbing exists in `layout.tsx` (line 91) but was not threaded through because the schema components were written as zero-prop components. Every schema component needs to accept `nonce?: string | null` and pass it through.

### Why I-01/I-02/I-03 exist
The schema types were written from memory rather than validated against the current schema.org type hierarchy. `WholesaleStore` doesn't exist (the valid parent is `Store → LocalBusiness`). `Continent` doesn't exist in schema.org's type hierarchy. `QuantitativeValue.value` accepts only `Number` per the spec.

### Why I-09 exists
The founding year appears in at least 4 independent locations — `OrganizationSchema.tsx`, `PersonSchema.tsx`, `Footer.tsx`, and `layout.tsx` — with no shared source of truth. The values diverged: the schema says 1980, the footer component says 1989, and the copy says "35+" (implying ~1991). We need a single authoritative constant.

---

## Pre-Flight

```bash
cd aerofren-next
npm run build    # must pass before starting
```

---

## Task 1: Create shared AEROFREN constants

**Files:**
- Create: `src/lib/constants/aerofren.ts`

**Context:** This file becomes the single source of truth for all factual claims about AEROFREN. Every other file that references founding year, product count, or experience years must import from here. This eliminates the I-09 inconsistency permanently.

**Step 1: Create the file**

```typescript
// src/lib/constants/aerofren.ts

/** Year AEROFREN was founded. Used in schema markup, copy, and footer. */
export const FOUNDING_YEAR = 1980;

/** Current year for experience calculations */
const CURRENT_YEAR = new Date().getFullYear();

/** Years of experience — auto-calculated from founding year */
export const YEARS_OF_EXPERIENCE = CURRENT_YEAR - FOUNDING_YEAR;

/** Approximate SKU count for copy and schema */
export const PRODUCT_COUNT = "120.000+";

/** Official business name */
export const BUSINESS_NAME = "AEROFREN";

/** Canonical website URL — no trailing slash */
export const SITE_URL = "https://aerofren.gr";

/** Schema @id for the Organization node — must match across all schemas */
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
```

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: 0 errors.

**Step 3: Commit**

```bash
git add src/lib/constants/aerofren.ts
git commit -m "feat(constants): add AEROFREN shared constants — single source of truth for schema/copy"
```

---

## Task 2: Fix C-01 — Remove "use client" from Breadcrumbs.tsx

**Files:**
- Modify: `src/components/catalog/Breadcrumbs.tsx`

**Context:** `Breadcrumbs.tsx` has `"use client"` on line 1. This means the `<script type="application/ld+json">` tag is injected only after client-side hydration — Googlebot's primary indexing crawl reads the SSR HTML and will never see the BreadcrumbList schema. Removing `"use client"` makes this a Server Component, guaranteeing the JSON-LD appears in the initial HTML response. The component uses zero client-only APIs — `Link`, `ChevronRight`, and `Home` are all server-renderable.

**Step 1: Remove the directive**

Delete line 1 (`"use client";`) from `src/components/catalog/Breadcrumbs.tsx`.

The file should now start with:
```typescript
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: 0 errors. If a "hooks in server component" error appears, it means a hook was used that requires investigation — but none exist in the current Breadcrumbs implementation.

**Step 3: Verify SSR**

```bash
npm run build && npm run start
curl -s http://localhost:3000/products/push-in-fittings | grep "BreadcrumbList"
```
Expected: Match found. The JSON-LD should appear in the raw HTML response.

**Step 4: Commit**

```bash
git add src/components/catalog/Breadcrumbs.tsx
git commit -m "fix(seo): remove 'use client' from Breadcrumbs — BreadcrumbList schema was client-only, invisible to Googlebot"
```

---

## Task 3: Fix C-02 — Add nonce prop to all schema components

**Files:**
- Modify: `src/lib/schema/OrganizationSchema.tsx`
- Modify: `src/lib/schema/WebsiteSchema.tsx`
- Modify: `src/lib/schema/ItemListSchema.tsx`
- Modify: `src/lib/schema/FaqSchema.tsx`
- Modify: `src/lib/schema/GlossarySchema.tsx`
- Modify: `src/lib/schema/ArticleSchema.tsx`
- Modify: `src/lib/schema/PersonSchema.tsx`
- Modify: `src/components/catalog/Breadcrumbs.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/(about)/about/page.tsx`

**Context:** `layout.tsx` line 91 reads `x-nonce` from request headers. This infrastructure exists for CSP nonce enforcement. All `<script>` tags that don't carry the nonce will be blocked by the browser's Content Security Policy when it is enforced. The fix: every schema component accepts `nonce?: string | null` and passes it to its `<script>` tag.

**Step 1: Update OrganizationSchema.tsx**

```tsx
// src/lib/schema/OrganizationSchema.tsx
interface OrganizationSchemaProps {
  nonce?: string | null;
}

export function OrganizationSchema({ nonce }: OrganizationSchemaProps = {}) {
  const schema = { /* ... existing schema ... */ };

  return (
    <script
      type="application/ld+json"
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

Apply the same pattern to ALL schema components:
- `WebsiteSchema({ nonce }: { nonce?: string | null } = {})`
- `ItemListSchema({ name, description, url, items, nonce }: ItemListSchemaProps)` — add `nonce?: string | null` to `ItemListSchemaProps`
- `FaqSchema({ items, nonce }: FaqSchemaProps)` — add `nonce?: string | null` to `FaqSchemaProps`
- `GlossarySchema({ terms, nonce }: { terms: GlossaryTerm[]; nonce?: string | null })`
- `ArticleSchema({ ..., nonce }: ArticleSchemaProps)` — add to interface
- `FounderPersonSchema({ nonce }: { nonce?: string | null } = {})`
- `Breadcrumbs` — add `nonce?: string | null` to `BreadcrumbsProps`; pass through to `<script>`

**Step 2: Pass nonce from layout.tsx to OrganizationSchema and WebsiteSchema**

In `src/app/layout.tsx`:
```tsx
<OrganizationSchema nonce={nonce} />
<WebsiteSchema nonce={nonce} />
```

**Step 3: Pass nonce to FounderPersonSchema in about/page.tsx**

The About page is a Server Component. To access the nonce, it needs to read headers:
```tsx
// src/app/(about)/about/page.tsx
import { headers } from "next/headers";
import { FounderPersonSchema } from "@/lib/schema/PersonSchema";

export default async function AboutPage() {
  const nonce = (await headers()).get("x-nonce");
  return (
    <>
      <FounderPersonSchema nonce={nonce} />
      {/* rest of page */}
    </>
  );
}
```

Apply the same `headers()` pattern to any other page-level schema injections (category pages with `ItemListSchema`, etc.).

> **Note on page-level schemas:** Category and subcategory pages already use `generateMetadata` (async). Add `headers()` call similarly.

**Step 4: Build verification**

```bash
npm run build
```
Expected: 0 TypeScript errors.

**Step 5: Commit**

```bash
git add src/lib/schema/ src/components/catalog/Breadcrumbs.tsx src/app/layout.tsx src/app/\(about\)/about/page.tsx
git commit -m "fix(security): add nonce prop to all schema <script> tags to comply with CSP"
```

---

## Task 4: Fix I-01/I-02/I-03 — Correct invalid schema.org types in OrganizationSchema

**Files:**
- Modify: `src/lib/schema/OrganizationSchema.tsx`
- Uses: `src/lib/constants/aerofren.ts` (Task 1)

**Context:**
- `WholesaleStore` does not exist in the schema.org type hierarchy. The closest valid type is `["Organization", "LocalBusiness"]`.
- `{ "@type": "Continent", "name": "Europe" }` — `Continent` is not a schema.org type. The valid `areaServed` format is `Country`, `AdministrativeArea`, `City`, or a plain string.
- `QuantitativeValue.value: "10-50"` — `value` must be a `Number`. Use `minValue`/`maxValue` for ranges.

**Step 1: Apply all three fixes to OrganizationSchema.tsx**

The corrected schema fields:
```typescript
import { FOUNDING_YEAR, ORGANIZATION_ID, SITE_URL, YEARS_OF_EXPERIENCE, PRODUCT_COUNT } from "@/lib/constants/aerofren";

// Fix I-01: WholesaleStore → LocalBusiness
"@type": ["Organization", "LocalBusiness"],

// Fix I-02: remove Continent, use plain string
"areaServed": [
  { "@type": "Country", "name": "Greece" },
  "Europe",
],

// Fix I-03: QuantitativeValue range
"numberOfEmployees": {
  "@type": "QuantitativeValue",
  "minValue": 10,
  "maxValue": 50,
},

// Fix I-09 (founding year consistency): use constant
"foundingDate": String(FOUNDING_YEAR),

// Fix I-09 (description): use constant
"description": `B2B προμηθευτής πνευματικών εξαρτημάτων και συστημάτων νερού από το ${FOUNDING_YEAR}. ${YEARS_OF_EXPERIENCE}+ χρόνια εμπειρίας, ${PRODUCT_COUNT} προϊόντα.`,
```

**Step 2: Run schema validation**

```bash
npm run build && npm run start &
# Submit http://localhost:3000 to https://search.google.com/test/rich-results
# (or use schema validator CLI if available)
# Expected: No "Unknown type" or "Invalid value" errors
```

**Step 3: Commit**

```bash
git add src/lib/schema/OrganizationSchema.tsx
git commit -m "fix(schema): correct invalid schema.org types — LocalBusiness replaces WholesaleStore, fix QuantitativeValue range, remove invalid Continent type"
```

---

## Task 5: Fix I-04 — Remove invalid properties from ListItem in ItemListSchema

**Files:**
- Modify: `src/lib/schema/ItemListSchema.tsx`

**Context:** Per schema.org, `ListItem` only has `position`, `name`, `item`, and `url` as direct properties. The `description` and `image` fields placed directly on `ListItem` are not valid and will trigger Search Console warnings. To include these semantics, wrap them in the `item` property pointing to a `Thing` or `WebPage` entity.

**Step 1: Restructure the schema output**

Replace:
```typescript
"itemListElement": items.map((item, index) => ({
  "@type": "ListItem",
  "position": index + 1,
  "name": item.name,
  "url": item.url,
  "description": item.description,  // REMOVE
  "image": item.image,              // REMOVE
})),
```

With:
```typescript
"itemListElement": items.map((item, index) => ({
  "@type": "ListItem",
  "position": index + 1,
  "name": item.name,
  "url": item.url,
  "item": {
    "@type": "WebPage",
    "url": item.url,
    "name": item.name,
    ...(item.description && { "description": item.description }),
    ...(item.image && { "image": item.image }),
  },
})),
```

**Step 2: Build + verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/lib/schema/ItemListSchema.tsx
git commit -m "fix(schema): move description/image to nested WebPage item in ListItem — invalid on ListItem directly per schema.org spec"
```

---

## Task 6: Fix I-05 — Add @id to PersonSchema + use constants

**Files:**
- Modify: `src/lib/schema/PersonSchema.tsx`
- Uses: `src/lib/constants/aerofren.ts`

**Context:** The `Person` node lacks an `@id`. Without it, no other schema can reference the founder by IRI — the `ArticleSchema` author field can't point to this person, breaking the graph. Also fixes the "35+ χρόνια" factual error (M-06) using the constants.

**Step 1: Update PersonSchema.tsx**

```typescript
import { FOUNDING_YEAR, FOUNDER_ID, ORGANIZATION_ID, YEARS_OF_EXPERIENCE } from "@/lib/constants/aerofren";

export function FounderPersonSchema({ nonce }: { nonce?: string | null } = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": FOUNDER_ID,                              // FIX I-05
    "name": "Βασίλειος Κουτελίδης",
    "alternateName": "Vassilios Koutelidis",
    "jobTitle": "Ιδρυτής",
    "description": `Ίδρυσε την AEROFREN το ${FOUNDING_YEAR} και αφιέρωσε ${YEARS_OF_EXPERIENCE}+ χρόνια στον κλάδο πνευματικών συστημάτων και εξαρτημάτων νερού.`,  // FIX M-06
    "worksFor": {
      "@id": ORGANIZATION_ID,                       // reference by @id only — no redundant name/type
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
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Step 2: Commit**

```bash
git add src/lib/schema/PersonSchema.tsx
git commit -m "fix(schema): add @id to PersonSchema for graph connectivity + fix years-of-experience using constant"
```

---

## Task 7: Fix I-06 — Add individual guide pages to sitemap

**Files:**
- Modify: `src/app/sitemap.ts`
- Uses: `src/lib/constants/aerofren.ts`

**Context:** The sitemap has `/resources` but none of the three individual guide pages. Googlebot may discover them via internal links, but sitemap inclusion guarantees priority crawling and correct `lastModified` signaling.

**Step 1: Update sitemap.ts**

Add at the top:
```typescript
import { RESOURCE_GUIDE_SLUGS } from "@/lib/constants/aerofren";
```

After the `/resources` entry in `staticPages`, add:
```typescript
...RESOURCE_GUIDE_SLUGS.map((slug) => ({
  url: `${baseUrl}/resources/${slug}`,
  lastModified: new Date("2026-02-27"),
  changeFrequency: "monthly" as const,
  priority: 0.7,
})),
```

This uses the same `RESOURCE_GUIDE_SLUGS` constant that `[guide]/page.tsx` uses for `generateStaticParams` — they're automatically kept in sync.

**Step 2: Verify**

```bash
npm run build && npm run start &
curl http://localhost:3000/sitemap.xml | grep "resources"
# Expected: 4 matches — /resources, /resources/odigos-epilogis-rakor, etc.
```

**Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "fix(seo): add individual resource guide pages to sitemap — /resources/[slug] were missing"
```

---

## Task 8: Fix I-07 — Add ItemList schema to IndustriesPage

**Files:**
- Modify: `src/app/(main)/industries/page.tsx`

**Context:** The Industries page is the only new content page with zero JSON-LD. Adding `ItemList` schema for the 5 industry sectors gives Google structured data to interpret the page's content.

**Step 1: Add schema to industries/page.tsx**

```tsx
import { headers } from "next/headers";
import { ItemListSchema } from "@/lib/schema/ItemListSchema";
import { SITE_URL } from "@/lib/constants/aerofren";

export default async function IndustriesPage() {
  const nonce = (await headers()).get("x-nonce");

  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      <ItemListSchema
        nonce={nonce}
        name="Κλάδοι που Εξυπηρετεί η AEROFREN"
        description="B2B πνευματικά εξαρτήματα και συστήματα νερού για βιομηχανία, αγρoτικό τομέα, τρόφιμα, κατασκευές, ναυτιλία."
        url={`${SITE_URL}/industries`}
        items={industries.map((ind) => ({
          name: ind.name,
          url: `${SITE_URL}/products`,  // points to products catalog
          description: ind.description,
        }))}
      />
      {/* existing JSX unchanged */}
    </main>
  );
}
```

> Change the function signature from `function` to `async function` to allow `headers()`.

**Step 2: Commit**

```bash
git add src/app/\(main\)/industries/page.tsx
git commit -m "feat(schema): add ItemList JSON-LD to IndustriesPage — only content page without schema"
```

---

## Task 9: Fix I-08 — Pass sortedTerms to GlossarySchema

**Files:**
- Modify: `src/app/(main)/glossary/page.tsx`

**Context:** Line 39 passes unsorted `terms` to `GlossarySchema` while line 47 renders sorted `sortedTerms` in the UI. The schema and UI should reflect the same order.

**Step 1: One-line fix**

Change line 39 from:
```tsx
<GlossarySchema terms={terms} />
```
to:
```tsx
<GlossarySchema terms={sortedTerms} />
```

**Step 2: Commit**

```bash
git add src/app/\(main\)/glossary/page.tsx
git commit -m "fix(schema): pass sortedTerms to GlossarySchema — schema and UI were in different orders"
```

---

## Task 10: Fix M-01/M-02 — Refactor FAQ filter logic with language tags

**Files:**
- Modify: `src/app/(main)/faq/page.tsx`

**Context:** The Greek/English split uses `i < 8` as a hardcoded boundary (M-01). When a new Greek FAQ is added, the developer must remember to increment 8 — a silent, invisible coupling. Worse, after the `.filter()` call, the returned array resets indices to 0, so both the first Greek and first English items share `key={0}` (M-02), a duplicate React key error.

**Step 1: Add language field to faqItems**

Change the type and data:
```typescript
const faqItems: Array<{ question: string; answer: string; lang: "el" | "en" }> = [
  // GREEK SECTION
  { lang: "el", question: "Τι είναι τα push-in ρακόρ...", answer: "..." },
  // ... all Greek items get lang: "el"

  // ENGLISH SECTION
  { lang: "en", question: "What is a push-in fitting...", answer: "..." },
  // ... all English items get lang: "en"
];
```

**Step 2: Replace filter logic**

```tsx
{faqItems.filter((item) => item.lang === "el").map((item) => (
  <div key={item.question} className="border-b pb-6">  {/* stable key from question text */}
    ...
  </div>
))}

{faqItems.filter((item) => item.lang === "en").map((item) => (
  <div key={item.question} className="border-b pb-6">
    ...
  </div>
))}
```

**Step 3: Build + verify no key warnings**

```bash
npm run dev
# Open browser console on /faq
# Expected: No "duplicate key" React warnings
```

**Step 4: Commit**

```bash
git add src/app/\(main\)/faq/page.tsx
git commit -m "fix(react): FAQ items use lang field instead of hardcoded index boundary — stable keys, no duplicate key=0"
```

---

## Task 11: Fix M-03/M-04 — Replace index keys in Glossary and Industries pages

**Files:**
- Modify: `src/app/(main)/glossary/page.tsx`
- Modify: `src/app/(main)/industries/page.tsx`

**Context:** Both pages use `key={i}` (array index), an established React anti-pattern. While these are static data arrays, using index keys masks bugs if data ever becomes dynamic.

**Step 1: Fix glossary/page.tsx**

Change:
```tsx
{sortedTerms.map((term, i) => (
  <div key={i} id={...}>
```
To:
```tsx
{sortedTerms.map((term) => (
  <div key={term.name} id={...}>
```

**Step 2: Fix industries/page.tsx**

Change outer key:
```tsx
{industries.map((industry) => (
  <div key={industry.name} className="border rounded-lg p-6">
```

Change inner key:
```tsx
{industry.products.map((p) => (
  <li key={p} className="flex items-center gap-2">
```

**Step 3: Commit**

```bash
git add src/app/\(main\)/glossary/page.tsx src/app/\(main\)/industries/page.tsx
git commit -m "fix(react): replace index keys with stable identifiers in Glossary and Industries pages"
```

---

## Task 12: Fix M-05 — Add openGraph metadata to all new content pages

**Files:**
- Modify: `src/app/(main)/faq/page.tsx`
- Modify: `src/app/(main)/glossary/page.tsx`
- Modify: `src/app/(main)/alternatives/page.tsx`
- Modify: `src/app/(main)/industries/page.tsx`
- Modify: `src/app/(main)/resources/page.tsx`

**Context:** None of the 5 new content pages have `openGraph` metadata. When shared on LinkedIn, Slack, or WhatsApp, these pages will fall back to the root layout's OG image (`hero-fittings.jpg`) and the root layout's title. Adding page-specific OG data ensures correct preview cards.

**Step 1: Add openGraph to each page's metadata export**

Pattern (adapt title/description per page):
```typescript
openGraph: {
  title: "Συχνές Ερωτήσεις | AEROFREN",
  description: "Απαντήσεις στις πιο συχνές ερωτήσεις για πνευματικά εξαρτήματα...",
  url: "https://aerofren.gr/faq",
  siteName: "AEROFREN",
  locale: "el_GR",
  type: "website",
  images: [
    {
      url: "/images/hero-fittings.jpg",  // reuse existing OG image
      width: 1200,
      height: 630,
      alt: "AEROFREN – Εξαρτήματα Νερού & Αέρα",
    },
  ],
},
```

Pages and their OG titles:
- `/faq` — "Συχνές Ερωτήσεις | AEROFREN"
- `/glossary` — "Γλωσσάριο Πνευματικών | AEROFREN"
- `/alternatives` — "Εναλλακτικό SMC, Festo, Parker | AEROFREN"
- `/industries` — "Κλάδοι που Εξυπηρετούμε | AEROFREN"
- `/resources` — "Τεχνικοί Οδηγοί | AEROFREN"

**Step 2: Build + verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/app/\(main\)/faq/page.tsx src/app/\(main\)/glossary/page.tsx src/app/\(main\)/alternatives/page.tsx src/app/\(main\)/industries/page.tsx src/app/\(main\)/resources/page.tsx
git commit -m "feat(seo): add openGraph metadata to all new content pages for social preview cards"
```

---

## Task 13: Fix M-07/M-08 — Unify WebsiteSchema @graph + remove deprecated query-input

**Files:**
- Modify: `src/lib/schema/WebsiteSchema.tsx`

**Context:** `OrganizationSchema` uses a `@graph` array (the correct pattern for multi-entity schemas). `WebsiteSchema` emits a bare object. While Google handles both, unified structure is cleaner. Also, `query-input` was deprecated by Google's Sitelinks Searchbox in February 2024 — it's dead code that adds noise to the schema.

**Step 1: Update WebsiteSchema.tsx**

```typescript
import { SITE_URL, WEBSITE_ID, ORGANIZATION_ID } from "@/lib/constants/aerofren";

export function WebsiteSchema({ nonce }: { nonce?: string | null } = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    "name": "AEROFREN",
    "url": SITE_URL,
    "inLanguage": ["el", "en"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/products?q={search_term_string}`,
      },
      // "query-input" removed — deprecated Feb 2024
    },
    "publisher": {
      "@id": ORGANIZATION_ID,
    },
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Step 2: Commit**

```bash
git add src/lib/schema/WebsiteSchema.tsx
git commit -m "fix(schema): remove deprecated query-input from SearchAction + use constants for URLs"
```

---

## Task 14: Final build verification

**Step 1: Clean build**

```bash
cd aerofren-next
npm run build
```
Expected:
- ✓ Compiled successfully
- 0 TypeScript errors
- All routes listed including `/resources/[slug]` for 3 guides

**Step 2: Schema count spot-check**

```bash
npm run start &
# Homepage: org + website = 2 schemas minimum
curl -s http://localhost:3000 | grep -o "application/ld+json" | wc -l

# Category page: org + website + breadcrumb + itemlist = 4 schemas
curl -s "http://localhost:3000/products/push-in-fittings" | grep -o "application/ld+json" | wc -l

# FAQ page: org + website + faqpage = 3 schemas
curl -s http://localhost:3000/faq | grep -o "application/ld+json" | wc -l

# About page: org + website + person = 3 schemas
curl -s http://localhost:3000/about | grep -o "application/ld+json" | wc -l
```

**Step 3: Sitemap guide pages**

```bash
curl -s http://localhost:3000/sitemap.xml | grep "resources"
# Expected 4 lines: /resources + 3 guide slugs
```

**Step 4: Breadcrumbs SSR verification**

```bash
curl -s "http://localhost:3000/products/push-in-fittings" | grep "BreadcrumbList"
# Expected: match in initial HTML (not empty)
```

**Step 5: React key warnings**

```bash
npm run dev
# Visit /faq in browser with DevTools console open
# Expected: 0 "duplicate key" warnings
```

**Step 6: Final commit**

```bash
git add .
git commit -m "chore: SEO refactor complete — all C/I/M issues from audit resolved"
```

---

## Post-Fix Issue Registry

| ID | Severity | Fixed In | Resolution |
|----|----------|----------|------------|
| C-01 | CRITICAL | Task 2 | Removed `"use client"` from Breadcrumbs |
| C-02 | CRITICAL | Task 3 | Nonce prop added to all 8 schema components |
| I-01 | IMPORTANT | Task 4 | `WholesaleStore` → `LocalBusiness` |
| I-02 | IMPORTANT | Task 4 | `Continent` → plain string `"Europe"` |
| I-03 | IMPORTANT | Task 4 | `QuantitativeValue` uses `minValue`/`maxValue` |
| I-04 | IMPORTANT | Task 5 | `description`/`image` moved to nested `WebPage` entity |
| I-05 | IMPORTANT | Task 6 | `@id: FOUNDER_ID` added to PersonSchema |
| I-06 | IMPORTANT | Task 7 | 3 guide slugs added to sitemap via constant |
| I-07 | IMPORTANT | Task 8 | `ItemListSchema` added to IndustriesPage |
| I-08 | IMPORTANT | Task 9 | `sortedTerms` passed to GlossarySchema |
| I-09 | IMPORTANT | Tasks 1,4,6 | `AEROFREN_CONSTANTS` shared source of truth |
| M-01 | MINOR | Task 10 | `lang` field replaces hardcoded boundary `8` |
| M-02 | MINOR | Task 10 | Stable `key={item.question}` replaces `key={i}` |
| M-03 | MINOR | Task 11 | `key={term.name}` replaces `key={i}` |
| M-04 | MINOR | Task 11 | `key={industry.name}` and `key={p}` replace index keys |
| M-05 | MINOR | Task 12 | `openGraph` added to all 5 new content pages |
| M-06 | MINOR | Task 6 | `YEARS_OF_EXPERIENCE` constant used in PersonSchema description |
| M-07 | MINOR | Task 13 | `@graph` alignment + constants in WebsiteSchema |
| M-08 | MINOR | Task 13 | Deprecated `query-input` removed |
