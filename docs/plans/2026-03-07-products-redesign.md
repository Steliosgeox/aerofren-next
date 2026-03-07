# Products Showcase Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the public category-based products experience with a single premium product showcase built from the new real product assets, with an animated product detail rail and contact-first conversion flow in Greek.

**Architecture:** Introduce a new normalized `product-showcase` data source and make it the single public source of truth for `/products`, header discovery, and homepage product promotion. Replace the old category grid with a custom interactive showcase page, and collapse legacy `/products/[category]` and `/products/[category]/[subcategory]` routes into redirects back to `/products`. Keep all styling on existing theme tokens so dark, light, and dim stay coherent.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS 4, existing theme tokens in `src/app/globals.css`, Lucide icons, Vitest + Testing Library.

---

### Task 1: Introduce The New Product Showcase Data Model

**Files:**
- Create: `src/data/product-showcase.ts`
- Test: `src/__tests__/products/productShowcaseData.test.ts`
- Reference: `public/images/new-categories/*`

**Step 1: Write the failing test**

Create `src/__tests__/products/productShowcaseData.test.ts` to assert:

- the exported product list contains the canonical 11 products
- each product has a stable `id`, `slug`, `nameEl`, `image`, `summaryEl`, and `highlightsEl`
- duplicate source files for `ΕΞΑΡΤΗΜΑΤΑ ΣΩΛΗΝΩΝ` are normalized into one product entry
- the exported count matches the rendered product inventory

Example assertions:

```ts
import { productShowcaseItems, getProductBySlug } from "@/data/product-showcase";

describe("product showcase data", () => {
  it("normalizes the live product inventory into unique public items", () => {
    expect(productShowcaseItems).toHaveLength(11);
    expect(productShowcaseItems.map((item) => item.nameEl)).toContain("ΕΠΕΞΕΡΓΑΣΙΑ ΝΕΡΟΥ");
    expect(
      productShowcaseItems.filter((item) => item.nameEl === "ΕΞΑΡΤΗΜΑΤΑ ΣΩΛΗΝΩΝ")
    ).toHaveLength(1);
  });

  it("exposes stable lookup by slug", () => {
    expect(getProductBySlug("epexergasia-nerou")?.nameEl).toBe("ΕΠΕΞΕΡΓΑΣΙΑ ΝΕΡΟΥ");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/__tests__/products/productShowcaseData.test.ts`

Expected: FAIL because `src/data/product-showcase.ts` does not exist yet.

**Step 3: Write minimal implementation**

Create `src/data/product-showcase.ts` with:

- a `ProductShowcaseItem` type
- a canonical `productShowcaseItems` array
- generated slugs written explicitly, not inferred at runtime from Unicode names
- handcrafted Greek summaries and highlight bullets for each product
- helpers:
  - `getProductBySlug(slug: string)`
  - `getProductShowcaseCount()`
  - `productShowcaseNavigationItems` if useful for header/homepage reuse

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/__tests__/products/productShowcaseData.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/data/product-showcase.ts src/__tests__/products/productShowcaseData.test.ts
git commit -m "feat(products): add normalized product showcase dataset"
```

---

### Task 2: Add The Product Detail Rail Interaction

**Files:**
- Create: `src/components/catalog/ProductDetailRail.tsx`
- Test: `src/__tests__/products/ProductDetailRail.test.tsx`

**Step 1: Write the failing test**

Create `src/__tests__/products/ProductDetailRail.test.tsx` covering:

- selected product title is rendered
- right-side contact message appears in Greek
- `Κλήση`, `Email`, and `Σύνδεση / Δημιουργία λογαριασμού` actions render
- close button `X` triggers `onClose`
- closed state returns `null`

Example structure:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductDetailRail } from "@/components/catalog/ProductDetailRail";
import { productShowcaseItems } from "@/data/product-showcase";

describe("ProductDetailRail", () => {
  it("renders the selected product contact flow in Greek", async () => {
    const onClose = vi.fn();
    render(
      <ProductDetailRail
        isOpen
        product={productShowcaseItems[0]}
        onClose={onClose}
      />
    );

    expect(screen.getByText(productShowcaseItems[0].nameEl)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /κλήση/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /κλείσιμο/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/__tests__/products/ProductDetailRail.test.tsx`

Expected: FAIL because the component does not exist yet.

**Step 3: Write minimal implementation**

Create `src/components/catalog/ProductDetailRail.tsx` as a client component with:

- `isOpen`, `product`, `onClose` props
- desktop right-side rail and mobile bottom-sheet layout using CSS classes and responsive variants
- keyboard escape handling
- close button with accessible label
- Greek consultation copy:
  - call to confirm availability and details
  - email for requests
  - account creation/login for faster chat support
- no purchase, no cart, no fake checkout

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/__tests__/products/ProductDetailRail.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/catalog/ProductDetailRail.tsx src/__tests__/products/ProductDetailRail.test.tsx
git commit -m "feat(products): add animated product detail rail"
```

---

### Task 3: Rewrite The `/products` Page Around The New Showcase

**Files:**
- Modify: `src/app/(main)/products/page.tsx`
- Modify: `src/components/catalog/ProductsPageContent.tsx`
- Modify: `src/app/(main)/products/loading.tsx`
- Test: `src/__tests__/products/ProductsPageContent.test.tsx`
- Reference: `src/app/globals.css`

**Step 1: Write the failing test**

Create `src/__tests__/products/ProductsPageContent.test.tsx` to assert:

- the new page headline renders
- the product tiles render from `productShowcaseItems`
- clicking a product opens the detail rail
- the old category copy like `κατηγορίες` is absent from the main hero
- the conversion message mentions call, email, or account/chat

Example:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductsPageContent } from "@/components/catalog/ProductsPageContent";

describe("ProductsPageContent", () => {
  it("opens the selected product in the detail rail", async () => {
    render(<ProductsPageContent />);

    const trigger = screen.getByRole("button", { name: /επεξεργασία νερού/i });
    await userEvent.click(trigger);

    expect(screen.getByText("ΕΠΕΞΕΡΓΑΣΙΑ ΝΕΡΟΥ")).toBeInTheDocument();
    expect(screen.getByText(/δημιουργία λογαριασμού/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/__tests__/products/ProductsPageContent.test.tsx`

Expected: FAIL because the current page still renders the old category grid.

**Step 3: Write minimal implementation**

Rewrite `src/components/catalog/ProductsPageContent.tsx` to:

- import `productShowcaseItems`
- manage selected product state
- render a premium hero with Greek copy and accurate product count
- render an asymmetric product field with accessible `button` triggers, not links
- include a custom SVG or CSS linework layer for technical atmosphere
- mount `ProductDetailRail` for the selected product
- ensure reduced motion support

Adjust `src/app/(main)/products/page.tsx` metadata to:

- describe the new consultation-first products experience
- remove old category-count language

Adjust `src/app/(main)/products/loading.tsx` to match the new showcase skeleton instead of the old category listing shape.

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/__tests__/products/ProductsPageContent.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add src/app/(main)/products/page.tsx src/app/(main)/products/loading.tsx src/components/catalog/ProductsPageContent.tsx src/__tests__/products/ProductsPageContent.test.tsx
git commit -m "feat(products): redesign products page as premium showcase"
```

---

### Task 4: Replace Header And Homepage Product Discovery Links

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/HorizontalGallery.tsx`
- Modify: `src/components/HomePageClient.tsx` if needed
- Test: `src/__tests__/products/productNavigation.test.tsx`

**Step 1: Write the failing test**

Create `src/__tests__/products/productNavigation.test.tsx` to assert:

- header discovery content uses the new product showcase data instead of `categories`
- homepage product gallery no longer links to category query params
- homepage product labels match the new products dataset

Focus on the data transformation and rendered labels instead of brittle full-header snapshots.

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/__tests__/products/productNavigation.test.tsx`

Expected: FAIL because both components still reference old category data and query-string category URLs.

**Step 3: Write minimal implementation**

Update:

- `Header.tsx` to surface real products, not categories
- `HorizontalGallery.tsx` to use the new product dataset and link to `/products`
- any gallery label text from `ΚΑΤΗΓΟΡΙΕΣ ΠΡΟΪΟΝΤΩΝ` to product-driven messaging

Preserve:

- overall header behavior
- existing homepage section structure unless a small layout change is needed for consistency

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/__tests__/products/productNavigation.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/HorizontalGallery.tsx src/components/HomePageClient.tsx src/__tests__/products/productNavigation.test.tsx
git commit -m "refactor(products): replace category discovery with product showcase links"
```

---

### Task 5: Collapse Legacy Category Routes And Sitemap Output

**Files:**
- Modify: `src/app/(main)/products/[category]/page.tsx`
- Modify: `src/app/(main)/products/[category]/[subcategory]/page.tsx`
- Modify: `src/app/sitemap.ts`
- Test: `src/__tests__/products/productsLegacyRedirects.test.ts`

**Step 1: Write the failing test**

Create `src/__tests__/products/productsLegacyRedirects.test.ts` that checks:

- legacy route helpers resolve to `/products`
- sitemap output no longer includes category or subcategory product URLs
- `/products` remains present in the sitemap

If direct Next route testing is cumbersome, extract a tiny pure helper module for legacy route behavior and test that.

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/__tests__/products/productsLegacyRedirects.test.ts`

Expected: FAIL because sitemap still emits category URLs and legacy routes still render old pages.

**Step 3: Write minimal implementation**

Update:

- both legacy route pages to redirect permanently to `/products`
- `generateStaticParams` on those pages to return an empty array if appropriate for the new strategy
- sitemap generation to remove category and subcategory URL emission

Keep:

- `/products` canonical entry intact

**Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/__tests__/products/productsLegacyRedirects.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/app/(main)/products/[category]/page.tsx src/app/(main)/products/[category]/[subcategory]/page.tsx src/app/sitemap.ts src/__tests__/products/productsLegacyRedirects.test.ts
git commit -m "refactor(products): redirect legacy catalog routes to products showcase"
```

---

### Task 6: Remove Or Retire Obsolete Public Catalog Components

**Files:**
- Modify or delete: `src/components/catalog/CategoryCard.tsx`
- Modify or delete: `src/components/catalog/SubcategoryCard.tsx`
- Modify or delete: `src/components/catalog/CategorySidebar.tsx`
- Modify or delete: `src/components/catalog/SubcategoryPageContent.tsx`
- Modify or delete: `src/components/QuoteModal.tsx`

**Step 1: Write the failing test**

Add or extend a products regression test to assert the public products experience no longer imports or depends on the old category/subcategory UI path.

If direct import-level testing is too brittle, use this task mainly for safe cleanup after earlier tests are green.

**Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/__tests__/products/ProductsPageContent.test.tsx`

Expected: If any old public dependency still leaks through, the test or render path should expose it.

**Step 3: Write minimal implementation**

Delete or retire obsolete public catalog components only after confirming:

- they are no longer referenced
- no protected/admin area depends on them
- the new rail fully replaces the public quote modal behavior

Prefer deleting dead files over leaving misleading unused public catalog UI behind.

**Step 4: Run tests to verify the cleanup is safe**

Run:

```bash
npm run test:run -- src/__tests__/products/ProductsPageContent.test.tsx
npm run test:run -- src/__tests__/products/productNavigation.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/catalog src/components/QuoteModal.tsx
git commit -m "refactor(products): remove obsolete public catalog components"
```

---

### Task 7: Full Verification And Regression Sweep

**Files:**
- Verify: `src/app/(main)/products/page.tsx`
- Verify: `src/components/catalog/ProductsPageContent.tsx`
- Verify: `src/components/catalog/ProductDetailRail.tsx`
- Verify: `src/components/Header.tsx`
- Verify: `src/components/HorizontalGallery.tsx`
- Verify: `src/app/sitemap.ts`

**Step 1: Run the targeted product tests**

Run:

```bash
npm run test:run -- src/__tests__/products/productShowcaseData.test.ts
npm run test:run -- src/__tests__/products/ProductDetailRail.test.tsx
npm run test:run -- src/__tests__/products/ProductsPageContent.test.tsx
npm run test:run -- src/__tests__/products/productNavigation.test.tsx
npm run test:run -- src/__tests__/products/productsLegacyRedirects.test.ts
```

Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`

Expected: PASS with zero errors

**Step 3: Run React Doctor**

Run: `npx -y react-doctor@latest . --verbose --diff`

Expected: no new critical React findings

**Step 4: Run type/build verification if toolchain is available**

Run:

```bash
npx tsc --noEmit
npm run build
```

Expected: PASS

**Step 5: Manual review checklist**

Verify manually:

- desktop rail animates from the right and closes cleanly
- mobile uses a bottom sheet and keeps actions visible without clipping
- hero, grid, and rail remain coherent in dark, light, and dim themes
- keyboard escape closes the rail
- no old category language remains in the main products experience

**Step 6: Commit**

```bash
git add src docs/plans/2026-03-07-products-redesign-design.md docs/plans/2026-03-07-products-redesign.md
git commit -m "feat(products): replace public category catalog with premium product showcase"
```

---

## Execution Notes

- This plan assumes a functioning Node and Git toolchain for red-green verification and commits.
- In the current shell session, those executables may not be exposed on `PATH`. If that remains true during execution, keep the test-first file order intact, document the environment block, and continue implementation without making false verification claims.
- Do not preserve the old public category IA “just in case”. The approved direction is to strip it from the public experience.

## Execution Log

- Implemented `src/data/product-showcase.ts` as the new public source of truth for 11 real products based on `public/images/new-categories/*`, with explicit Greek summaries, highlights, and stable slugs.
- Added `src/components/catalog/ProductDetailRail.tsx` with the consultation-first interaction model:
  - animated right rail on desktop
  - bottom sheet on mobile
  - Greek contact-first copy for phone, email, and faster account-based chat support
- Rebuilt `src/components/catalog/ProductsPageContent.tsx` and `src/app/(main)/products/page.tsx` around a premium showcase experience instead of category browsing.
- Replaced public discovery links in `src/components/Header.tsx` and `src/components/HorizontalGallery.tsx` so the site now promotes real products rather than category buckets.
- Collapsed legacy `/products/[category]` and `/products/[category]/[subcategory]` pages into permanent redirects back to `/products`.
- Removed category and subcategory product URLs from `src/app/sitemap.ts`.
- Deleted obsolete public catalog-era files that no longer match the approved IA:
  - `src/components/QuoteModal.tsx`
  - `src/components/SmoothScrollProvider.tsx`
  - `src/components/catalog/CategoryCard.tsx`
  - `src/components/catalog/CategorySidebar.tsx`
  - `src/components/catalog/ProductGrid.tsx`
  - `src/components/catalog/SubcategoryCard.tsx`
  - `src/components/catalog/SubcategoryPageContent.tsx`
  - `src/components/ui/ProductHeroCard.tsx`
  - `src/data/categories.ts`
- Cleaned stale smooth-scroll wording so the layouts now describe Lenis correctly instead of referring to ScrollSmoother.
- Updated `src/lib/chatbot/prompts.ts` so the assistant now talks about the new public product set and the contact-first purchase flow instead of the old category-based catalog copy.
- Fixed one unrelated quality-guard failure discovered during verification by replacing an index key in `src/app/(main)/admin/page.tsx` with stable slot keys.
- Follow-up correction: replaced the first products-grid attempt after visual review. The masonry-style `hero` / `tall` / `wide` spans were removed in favor of fixed-height block panels with controlled image sectors, because the previous geometry made the visuals feel oversized and inconsistent.
- Follow-up correction: refactored the product detail interaction from a right-docked rail into a centered product window, removed the redundant `Επιλεγμένο προϊόν` caption block, paused Lenis while the window is open so wheel/touch input stays inside the modal, and hid the `BackToTop` affordance during the modal state.

## Verification Log

- `bun.exe run test:run -- --maxWorkers=1 src/__tests__/products/productShowcaseData.test.ts src/__tests__/products/ProductDetailRail.test.tsx src/__tests__/products/ProductsPageContent.test.tsx src/__tests__/products/productNavigation.test.ts src/__tests__/products/productsLegacyRedirects.test.ts src/__tests__/products/productsCleanup.test.ts src/__tests__/products/productPromptAlignment.test.ts src/__tests__/quality/reactDoctor.findings.test.ts`
  - PASS
  - Note: a parallel Vitest run hit default 5s timeouts under worker contention; serial execution passed cleanly and is the reliable verification mode for this set.
- `bun.exe run test:run -- src/__tests__/products/productSectionGeometry.test.ts src/__tests__/products/ProductsPageContent.test.tsx src/__tests__/products/productShowcaseData.test.ts src/__tests__/products/ProductDetailRail.test.tsx`
  - PASS
- `bun.exe run lint`
  - PASS with 1 pre-existing warning in `scripts/generate-sprites.mjs` (`err` unused)
- `bun.exe x tsc --noEmit`
  - PASS
- `bun.exe run build`
  - PASS
- `bun.exe run lint`
  - PASS with 1 pre-existing warning in `scripts/generate-sprites.mjs` (`err` unused)
- `bun.exe x tsc --noEmit`
  - PASS
- `bun.exe run build`
  - PASS
- `bun.exe x react-doctor@latest . --verbose --diff`
  - PASS
  - Score remained `89/100` with existing repository-wide warnings outside the scope of this change.
- `bun.exe run test:run -- src/__tests__/products/ProductDetailRail.test.tsx src/__tests__/products/productDetailWindowLayout.test.ts src/__tests__/products/ProductsPageContent.test.tsx`
  - PASS
- `bun.exe x react-doctor@latest . --verbose --diff`
  - PASS
  - Score remained `89/100` with existing repository-wide warnings outside the scope of this change.
- `bun.exe run lint`
  - PASS with 1 pre-existing warning in `scripts/generate-sprites.mjs` (`err` unused)
- `bun.exe x tsc --noEmit`
  - PASS
- `bun.exe run build`
  - PASS
