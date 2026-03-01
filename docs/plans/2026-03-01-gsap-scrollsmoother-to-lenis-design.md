# Design: GSAP ScrollSmoother → Lenis Migration
**Date**: 2026-03-01
**Status**: Approved
**Scope**: Homepage pilot first, full refactor follows
**Approach**: Option A — Replace scroll layer only, keep all GSAP animations

---

## Problem

GSAP ScrollSmoother wraps the entire page DOM in `#smooth-wrapper` / `#smooth-content` and applies `transform: translateY()` on every scroll frame. This promotes the full page tree to a single GPU composite layer, causing visible scroll lag — especially alongside Three.js (NexusHero) and the 118-frame canvas animation (ScrollFrameAnimation).

Lenis replaces the scroll smoothing layer using native scroll + RAF easing, with no full-page transform. All GSAP ScrollTrigger animations continue to work unchanged.

---

## Architecture Decision

**Chosen approach**: `ReactLenis` root wrapper via `@lenis/react`

- Drop-in replacement for `SmoothScrollProvider.tsx` — same wrapper pattern, same conditional disable logic
- No `#smooth-wrapper` / `#smooth-content` DOM nodes — native scroll
- ScrollTrigger stays alive via `useLenis(() => { ScrollTrigger.update() })`
- `data-speed` parallax reproduced by a `useParallax` utility hook using ScrollTrigger
- `BackToTop` uses `useLenis()` hook instead of `ScrollSmoother.get()`

---

## Scroll Layer Swap

```
BEFORE                                   AFTER
────────────────────────────────         ────────────────────────────────
SmoothScrollProvider.tsx                 LenisProvider.tsx
  └─ #smooth-wrapper (position: fixed)     └─ <ReactLenis root> (no DOM node)
      └─ #smooth-content                       └─ children (native scroll)
          └─ translateY() every frame
```

**Lenis config** (equivalent to ScrollSmoother `smooth: 1.2`):
```ts
{
  lerp: 0.08,
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothTouch: false,      // matches current smoothTouch: 0.1 (effectively off)
  orientation: 'vertical',
  gestureOrientation: 'vertical',
}
```

**ScrollTrigger integration** (one place, in LenisProvider):
```ts
useLenis(() => {
  ScrollTrigger.update()
})
```

---

## data-speed / data-lag Replacement

ScrollSmoother reads `data-speed` and `data-lag` HTML attributes natively. Lenis has no equivalent. A `useParallax` utility replicates this with ScrollTrigger:

```ts
// src/lib/scroll/useParallax.ts
// - Queries all elements with [data-speed] within a container ref
// - Creates a per-element ScrollTrigger with scrub: true
// - y transform = speed * scrollProgress * range
// - Cleans up on unmount
```

- `data-speed` attributes remain on HTML elements — no markup changes
- `data-lag` is not present on homepage — deferred to full refactor phase
- Called once in `HomePageClient.tsx` on the stats section container

---

## Files Changed — Homepage Pilot

| File | Action | Risk |
|---|---|---|
| `src/components/LenisProvider.tsx` | **Create** — replaces SmoothScrollProvider | Low |
| `src/components/RouteScrollShell.tsx` | **Edit** — swap import | Trivial |
| `src/components/BackToTop.tsx` | **Edit** — `ScrollSmoother.get()` → `useLenis()` | Low |
| `src/lib/scroll/useParallax.ts` | **Create** — data-speed parallax utility | Low |
| `src/lib/gsap/client.ts` | **Edit** — remove ScrollSmoother from plugin registry | Low |
| `src/components/HomePageClient.tsx` | **Edit** — add `useParallax()`, remove ScrollSmoother refs | Medium |
| `src/styles/global.css` | **Edit** — remove `#smooth-wrapper` / `#smooth-content` CSS | Low |
| `package.json` | **Edit** — add `@lenis/react` | Trivial |
| `src/components/SmoothScrollProvider.tsx` | **Keep** (do not delete until full refactor validates) | — |

**Zero changes** to:
`ScrollAnimation.tsx`, `HorizontalGallery.tsx`, `NexusHero.tsx`, `ScrollFrameAnimation.tsx`,
`AmbientParticles.tsx`, `presets.ts`, `Header.tsx`, all page components outside homepage.

---

## Files Changed — Full Refactor (Post-Pilot)

After pilot is validated, the full refactor extends to:

| File | Action |
|---|---|
| `src/components/AboutHistoryGrid.tsx` | Audit for ScrollSmoother refs |
| `src/components/ScrollFrameAnimation.tsx` | Audit for ScrollSmoother refs |
| `src/components/HorizontalGallery.tsx` | Audit for ScrollSmoother refs |
| `src/components/Header.tsx` | Audit for ScrollSmoother refs |
| `src/components/Chatbot.tsx` | Audit for ScrollSmoother refs |
| `src/components/catalog/CategoryCard.tsx` | Audit for ScrollSmoother refs |
| `src/components/catalog/ProductsPageContent.tsx` | Audit for ScrollSmoother refs |
| `src/components/SmoothScrollProvider.tsx` | **Delete** |
| All components with `data-lag` | Implement per-element Lenis lerp override |

---

## Triple Validation Gates

Every phase (pilot AND full refactor) must pass all three gates before committing.

### Gate 1 — Functional Check (Manual)
- [ ] `next dev` starts with zero console errors and zero warnings
- [ ] Homepage scroll is smooth end-to-end
- [ ] Stats section parallax fires (data-speed nodes move at correct speeds)
- [ ] Contact card entrance animation fires on scroll
- [ ] ScrollAnimation grid reveal fires and pins correctly
- [ ] HorizontalGallery drags and snaps correctly
- [ ] BackToTop button scrolls to 0
- [ ] `prefers-reduced-motion` disables animations (test in DevTools)
- [ ] Mobile scroll feels natural (no jank, no scroll hijacking)

### Gate 2 — Static Analysis
- [ ] `next lint` — zero errors, zero warnings
- [ ] `tsc --noEmit` — zero type errors
- [ ] `grep -r "ScrollSmoother" src/` — zero results (after full refactor only)
- [ ] `grep -r "#smooth-wrapper\|#smooth-content" src/` — zero results
- [ ] No unused imports left in edited files

### Gate 3 — Performance Audit
- [ ] Chrome DevTools → Layers panel: no `#smooth-content` composite layer
- [ ] Chrome DevTools → Performance: scroll frame time < 16ms (60fps)
- [ ] Lighthouse Performance score does not regress vs baseline
- [ ] GPU memory usage visibly reduced during scroll (Memory tab)

---

## Reduced Motion

Lenis respects `prefers-reduced-motion` via:
```ts
// In LenisProvider.tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
// Pass to Lenis options: if true, set lerp: 1 (instant, no easing)
```

Existing GSAP reduced-motion logic in `src/lib/gsap/client.ts` remains unchanged.

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| ScrollTrigger start/end offsets shift (no more translateY offset) | Medium | Audit all `start`/`end` values post-swap; native scroll changes coordinate system |
| Pinned sections behave differently | Low-Medium | Test `ScrollAnimation.tsx` pin carefully |
| HorizontalGallery scroll conflicts with Lenis | Low | Lenis has `prevent` callback; add `data-lenis-prevent` on gallery wrapper |
| `data-speed` parallax looks different | Low | Tune ScrollTrigger scrub range to match ScrollSmoother output visually |
| Mobile scroll feel regression | Low | Test on real device; Lenis `smoothTouch: false` is the safe default |

---

## Package Changes

```diff
+ "@lenis/react": "^1.1.0"
```

No GSAP packages removed during pilot. `gsap` and `@gsap/react` stay.
`ScrollSmoother` removed from plugin registration only — the import is removed since it's no longer called.

---

## Success Criteria

1. Homepage scrolls smoothly with zero GPU full-page composite layer
2. All existing homepage animations fire identically to before
3. All three validation gates pass
4. `next build` produces zero errors
5. No `ScrollSmoother` references in homepage-related files
