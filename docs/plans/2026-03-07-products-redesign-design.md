# Products Redesign Design

**Date:** 2026-03-07
**Status:** Approved
**Scope:** Replace the public products category experience with a single premium product showcase driven by the new `public/images/new-categories` assets.

---

## Goal

Turn `/products` into a world-class product showcase that:

- removes the old category and subcategory IA from the public experience
- uses the new real product images as the single source of truth
- opens a premium detail panel when a product is selected
- explains that orders proceed through contact channels, not direct checkout
- stays coherent with all three site themes without looking like generic template UI

---

## Confirmed Product Inventory

The new public showcase is based on the filenames in `public/images/new-categories`.

Canonical product set:

1. `ΣΩΛΗΝΕΣ ΙΝΟΧ ΘΕΡΜΟΥ ΑΕΡΑ`
2. `ΠΟΛΛΑΠΛΑ ΣΤΗΡΙΓΜΑΤΑ`
3. `ΜΠΡΟΥΤΖΙΝΑ ΤΑΦ`
4. `ΚΟΦΤΗΣ`
5. `ΘΕΡΜΟΣΥΣΤΕΛΛΟΜΕΝΑ`
6. `ΕΠΕΞΕΡΓΑΣΙΑ ΝΕΡΟΥ`
7. `ΕΞΑΡΤΗΜΑΤΑ ΣΩΛΗΝΩΝ`
8. `ΕΞΑΡΤΗΜΑΤΑ ΠΟΛΛΑΠΛΩΝ ΧΡΗΣΕΩΝ`
9. `ΕΞΑΡΤΗΜΑΤΑ ΑΕΡΟΣ`
10. `ΓΩΝΙΑΚΟΙ ΟΔΗΓΟΙ`
11. `BALL VALVE ΑΕΡΟΣ & ΥΓΡΩΝ`

Note:
- `ΕΞΑΡΤΗΜΑΤΑ_ΣΩΛΗΝΩΝ` exists twice with different extensions. The new public data model will normalize this into one canonical product entry.

---

## Experience Direction

### Chosen Direction: Product Atlas

The products page becomes a single editorial-style product field rather than a catalog of categories.

Core interaction:

- the page opens with a technical-luxury hero and strong Greek messaging
- products appear in an asymmetric visual grid with varied scale and pacing
- clicking a product activates it in-place and opens a right-side information rail on desktop
- on mobile, the same content appears as a premium bottom sheet
- the panel contains:
  - product name
  - concise premium Greek copy written specifically for each product
  - a short usage/value stack
  - a clear message that purchasing is handled through phone, email, or account-assisted chat
  - direct CTAs for `Κλήση`, `Email`, and `Σύνδεση / Δημιουργία λογαριασμού`

What it is not:

- no fake e-commerce flow
- no prices
- no add-to-cart
- no old category cards repainted as “new”

---

## Visual Language

### Design Principles

- industrial precision over bubbly softness
- strong structure, disciplined radii, and visible technical framing
- product imagery elevated through composition, not hidden behind effects
- restrained motion with clear hierarchy
- elegant enough for a premium B2B brand, not lifestyle-brand fluff

### UI Character

- dark metallic layered surfaces over the existing theme system
- structural grid lines and measured spacing
- selective bevels and inset highlights
- narrow technical labels, not oversized pills everywhere
- expressive contrast through lighting, not through random color noise

### Theme Strategy

All new product UI uses existing theme tokens:

- `--theme-bg-solid`
- `--theme-text`
- `--theme-text-muted`
- `--theme-accent`
- `--theme-accent-hover`
- `--theme-glass-bg`
- `--theme-glass-border`

This preserves dark, light, and dim modes as first-class experiences.

---

## Page Architecture

### 1. Hero Layer

Purpose:
- establish the new product language immediately
- communicate the business model clearly

Content:
- premium Greek headline
- supporting body copy focused on consultation, sourcing, and professional support
- product count derived from the new normalized dataset
- subtle technical SVG accents instead of generic decorative blobs

### 2. Product Field

Purpose:
- show the real current stock visually
- create desire and confidence

Structure:
- asymmetric responsive grid
- two or three visual tile scales
- product image chambers with controlled crop windows
- active-state treatment for the selected product

### 3. Product Information Rail

Purpose:
- give the click a meaningful payoff
- convert interest into contact

Desktop:
- animated right-side rail
- product visual anchor on the left side of the open state
- information and CTAs on the right inside the rail

Mobile:
- bottom sheet with strong first-view hierarchy
- image, title, copy, contact block, close affordance

### 4. Contact Conversion Block

Purpose:
- replace “buy now” behavior with assisted conversion

Greek message direction:
- users contact AEROFREN for availability and guidance
- account creation leads to faster service through chat
- phone and email remain immediate options

---

## Information Architecture Changes

### Public Experience

- `/products` becomes the single public showcase page
- old public category and subcategory browsing is removed from the main IA
- header and homepage references stop presenting old category entities

### Legacy Route Handling

- `/products/[category]`
- `/products/[category]/[subcategory]`

These legacy paths should no longer render the old experience. They should redirect users to `/products` so the site exposes one coherent catalog story.

### SEO

- `/products` remains canonical
- sitemap removes category and subcategory URLs
- metadata and structured content shift from “category listing” copy to “product showcase / consultation” copy

---

## Data Model Direction

Create a new dedicated public product showcase dataset rather than overloading the old category model.

Each product entry should include:

- stable id
- slug
- Greek title
- image path
- short Greek overview
- short Greek application/value points
- optional visual variant hint for layout composition

This dataset becomes the source for:

- the `/products` page
- product links inside the homepage product teaser area
- header product discovery links if they remain in the mega menu

---

## Existing Systems To Strip Or Replace

Public-facing category experience to remove or bypass:

- `src/components/catalog/ProductsPageContent.tsx`
- `src/components/catalog/CategoryCard.tsx`
- `src/components/catalog/SubcategoryCard.tsx`
- `src/components/catalog/CategorySidebar.tsx`
- `src/components/catalog/SubcategoryPageContent.tsx`
- `src/app/(main)/products/[category]/page.tsx`
- `src/app/(main)/products/[category]/[subcategory]/page.tsx`
- category-driven sitemap generation
- homepage gallery links that still point to old category query params
- header category mega-menu content that still exposes the old catalog taxonomy

---

## Motion Strategy

Motion should feel engineered, not playful.

Allowed motion language:

- reveal sweeps
- rail glide-in/out
- subtle image parallax
- focus-line pulses
- controlled hover elevation

Rejected motion language:

- excessive floating
- generic card wobble
- overlong easing chains
- attention-hungry looping gimmicks

Reduced motion must preserve access to all content and actions.

---

## Copy Direction

All product copy in the new panel will be written in Greek and generated manually from the product title and image context.

Tone:

- assured
- technically literate
- premium but not theatrical
- concise enough to scan quickly

Commercial message:

- no direct payment flow
- emphasis on consultation, availability confirmation, and guided service

---

## Validation Targets

Implementation must be checked against:

- responsive behavior on mobile, tablet, and desktop
- all three themes
- keyboard and close behavior for the product panel
- redirect behavior for legacy category routes
- removal of stale category URLs from sitemap
- React-focused validation after implementation

Planned verification:

- lint
- test run
- react-doctor
- manual UI review where possible

---

## Execution Constraints Observed In This Session

- the current shell did not expose `git`, `node`, `npm`, or `npx` on `PATH`
- design and implementation can still proceed in the workspace
- verification and worktree creation may require fallback handling if the toolchain remains inaccessible during execution

This constraint affects execution confidence, not the approved design.
