# GSAP ScrollSmoother → Lenis Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace GSAP ScrollSmoother with Lenis as the scroll smoothing layer on the homepage pilot, eliminating the full-page GPU composite layer while preserving all GSAP ScrollTrigger animations.

**Architecture:** `ReactLenis` root wrapper replaces `SmoothScrollProvider`. Lenis handles easing via native scroll + RAF. `ScrollTrigger.update()` is called on every Lenis tick via `useLenis()` inside an inner sync component. All existing ScrollTrigger-based animations (scrub, pin, parallax) continue working unchanged.

**Tech Stack:** `@lenis/react ^1.1.0`, `gsap ^3.14.2` (unchanged), Next.js 16, React 19, TypeScript

---

## Pre-Flight: Understand the Scope

**What ScrollSmoother was doing in this project:**
- Wrapping all content in `#smooth-wrapper` (position:fixed) + `#smooth-content` (transform:translateY) — the GPU killer
- Providing `smooth: 1.2` easing feel
- Applying `data-speed` / `data-lag` effects automatically (effects: true)
- `ScrollSmoother.get()` was used in `BackToTop.tsx` to scroll-to-top

**What does NOT change:**
- `HomePageClient.tsx` — already uses manual `gsap.fromTo` + ScrollTrigger for parallax. No ScrollSmoother dependency.
- `ScrollAnimation.tsx`, `HorizontalGallery.tsx`, `NexusHero.tsx`, `ScrollFrameAnimation.tsx` — all ScrollTrigger-based, zero changes.
- `src/lib/gsap/presets.ts` — no ScrollSmoother usage.

**The CSS for `#smooth-wrapper` / `#smooth-content` is inline JSX** inside `SmoothScrollProvider.tsx` via `<style jsx global>`. It disappears automatically when the component is replaced. No external CSS file to touch.

---

## Task 1: Install @lenis/react

**Files:**
- Modify: `package.json`

**Step 1: Install the package**

```bash
cd aerofren-next
npm install @lenis/react@^1.1.0
```

**Step 2: Verify installation**

```bash
cat node_modules/@lenis/react/package.json | grep '"version"'
```

Expected output: `"version": "1.1.x"`

**Step 3: Verify no peer dependency warnings**

The output of `npm install` should not show any UNMET PEER DEPENDENCY warnings. `@lenis/react` requires React 18+ — this project uses React 19.2.3, so it's compatible.

---

## Task 2: Remove ScrollSmoother from GSAP client

**Files:**
- Modify: `src/lib/gsap/client.ts`

**Context:** `ScrollSmoother` is imported on line 16, registered on line 37, and exported on line 151. Removing all three is the only change. The rest of the file (11 other plugins, custom eases, defaults, ScrollTrigger config, reduced-motion support) stays intact.

**Step 1: Remove the ScrollSmoother import (line 16)**

Find:
```ts
import { ScrollSmoother } from "gsap/ScrollSmoother";
```
Delete that line entirely.

**Step 2: Remove ScrollSmoother from registerPlugin (line 37)**

Find:
```ts
    gsap.registerPlugin(
        ScrollTrigger,
        ScrollToPlugin,
        ScrollSmoother,
        SplitText,
```

Replace with:
```ts
    gsap.registerPlugin(
        ScrollTrigger,
        ScrollToPlugin,
        SplitText,
```

**Step 3: Remove ScrollSmoother from exports (line 151)**

Find:
```ts
export {
    gsap,
    useGSAP,
    ScrollTrigger,
    ScrollToPlugin,
    ScrollSmoother,
    SplitText,
```

Replace with:
```ts
export {
    gsap,
    useGSAP,
    ScrollTrigger,
    ScrollToPlugin,
    SplitText,
```

**Step 4: Verify the file**

```bash
grep -n "ScrollSmoother" src/lib/gsap/client.ts
```

Expected output: (empty — zero matches)

**Step 5: Commit**

```bash
git add src/lib/gsap/client.ts
git commit -m "refactor(gsap): remove ScrollSmoother from plugin registry and exports"
```

---

## Task 3: Create LenisProvider.tsx

**Files:**
- Create: `src/components/LenisProvider.tsx`

**Context:** This is the direct replacement for `SmoothScrollProvider.tsx`. Key architectural details:
- `ReactLenis root` renders no DOM wrapper elements — native scroll
- `ScrollTriggerSync` is an inner component that must live *inside* `ReactLenis` context to use `useLenis`
- `prefersReducedMotion` sets `lerp: 1` (instant, no easing) when the user prefers no motion
- `smoothTouch: false` matches the near-zero `smoothTouch: 0.1` from the old config (effectively off)
- Cleanup: Lenis destroys itself automatically on unmount — no manual cleanup needed

**Step 1: Create the file**

Create `src/components/LenisProvider.tsx` with this exact content:

```tsx
"use client";

import { ReactLenis, useLenis } from "@lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * LenisProvider
 *
 * Replaces GSAP ScrollSmoother with Lenis smooth scrolling.
 * Uses native scroll (no DOM wrapper transform) — eliminates the full-page GPU composite layer.
 *
 * ScrollTrigger is kept alive via the inner ScrollTriggerSync component which calls
 * ScrollTrigger.update() on every Lenis tick.
 */

function ScrollTriggerSync() {
  useLenis(() => {
    ScrollTrigger.update();
  });
  return null;
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return (
    <ReactLenis
      root
      options={{
        // lerp: 1 = instant (no smoothing) for reduced-motion users
        lerp: prefersReducedMotion ? 1 : 0.08,
        duration: prefersReducedMotion ? 0 : 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothTouch: false,
        orientation: "vertical",
        gestureOrientation: "vertical",
      }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
```

**Step 2: Verify TypeScript accepts it**

```bash
npx tsc --noEmit 2>&1 | grep "LenisProvider"
```

Expected output: (empty — no errors in this file)

**Step 3: Commit**

```bash
git add src/components/LenisProvider.tsx
git commit -m "feat(scroll): add LenisProvider — ReactLenis root wrapper with ScrollTrigger sync"
```

---

## Task 4: Swap RouteScrollShell to LenisProvider

**Files:**
- Modify: `src/components/RouteScrollShell.tsx`

**Context:** This is a one-line import swap. The component logic (conditional disable for `/admin`, `/login`, `/signup`) is preserved 100%.

**Step 1: Replace the import**

Find (line 5):
```ts
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
```

Replace with:
```ts
import LenisProvider from '@/components/LenisProvider';
```

**Step 2: Replace the usage (line 20)**

Find:
```tsx
    return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
```

Replace with:
```tsx
    return <LenisProvider>{children}</LenisProvider>;
```

**Step 3: Verify the full file looks like this:**

```tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import LenisProvider from '@/components/LenisProvider';

const DISABLE_SMOOTH_SCROLL_PREFIXES = ['/admin', '/login', '/signup'];

function shouldDisableSmoothScroll(pathname: string): boolean {
    return DISABLE_SMOOTH_SCROLL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function RouteScrollShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (!pathname || shouldDisableSmoothScroll(pathname)) {
        return <>{children}</>;
    }

    return <LenisProvider>{children}</LenisProvider>;
}
```

**Step 4: Commit**

```bash
git add src/components/RouteScrollShell.tsx
git commit -m "refactor(scroll): swap RouteScrollShell from SmoothScrollProvider to LenisProvider"
```

---

## Task 5: Fix BackToTop — replace ScrollSmoother.get() with useLenis

**Files:**
- Modify: `src/components/BackToTop.tsx`

**Context:** `BackToTop.tsx` imports `ScrollSmoother` on line 4 and calls `ScrollSmoother.get()` inside `handleClick` (lines 62-64). Replace with `useLenis()` hook. The GSAP visibility animation and scroll detection logic are unchanged.

**Step 1: Replace the import (line 4)**

Find:
```ts
import { gsap, ScrollSmoother } from "@/lib/gsap";
```

Replace with:
```ts
import { gsap } from "@/lib/gsap";
import { useLenis } from "@lenis/react";
```

**Step 2: Add useLenis hook call at the top of the component body**

Find (after `const tweenRef = useRef...`, around line 21):
```ts
    const tweenRef = useRef<gsap.core.Tween | null>(null);

    // Throttled scroll detection
```

Replace with:
```ts
    const tweenRef = useRef<gsap.core.Tween | null>(null);
    const lenis = useLenis();

    // Throttled scroll detection
```

**Step 3: Replace the handleClick function (lines 61-74)**

Find:
```ts
    const handleClick = () => {
        const smoother = ScrollSmoother.get();
        if (smoother) {
            smoother.scrollTo(0, true);
            return;
        }

        gsap.to(window, {
            scrollTo: { y: 0, autoKill: false },
            duration: 1.0,
            ease: "power2.inOut",
            overwrite: "auto",
        });
    };
```

Replace with:
```ts
    const handleClick = () => {
        if (lenis) {
            lenis.scrollTo(0, { lerp: 0.05 });
            return;
        }

        gsap.to(window, {
            scrollTo: { y: 0, autoKill: false },
            duration: 1.0,
            ease: "power2.inOut",
            overwrite: "auto",
        });
    };
```

**Step 4: Verify no ScrollSmoother references remain**

```bash
grep -n "ScrollSmoother" src/components/BackToTop.tsx
```

Expected output: (empty)

**Step 5: Commit**

```bash
git add src/components/BackToTop.tsx
git commit -m "refactor(scroll): replace ScrollSmoother.get() with useLenis in BackToTop"
```

---

## Task 6: Create useParallax utility (groundwork for full refactor)

**Files:**
- Create: `src/lib/scroll/useParallax.ts`

**Context:** ScrollSmoother's `effects: true` automatically applies `data-speed` parallax to elements. Lenis has no such feature. This utility hook replicates that behavior using ScrollTrigger for pages that rely on `data-speed` without manual parallax code.

**⚠️ IMPORTANT:** The homepage does NOT need this hook — `HomePageClient.tsx` already has manual ScrollTrigger-based parallax that reads `data-speed` via `node.dataset.speed`. This hook is created now for use during the full refactor of other pages.

**Step 1: Create the directory if needed**

```bash
mkdir -p src/lib/scroll
```

**Step 2: Create the file**

Create `src/lib/scroll/useParallax.ts`:

```ts
"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * useParallax
 *
 * Replicates GSAP ScrollSmoother's data-speed attribute behavior using ScrollTrigger.
 * Required for pages that relied on ScrollSmoother's `effects: true` for parallax.
 *
 * NOTE: Do NOT use this in HomePageClient — it already has manual ScrollTrigger parallax.
 *
 * Usage:
 *   const sectionRef = useRef<HTMLDivElement>(null)
 *   useParallax(sectionRef)
 *   // Elements inside sectionRef with [data-speed] will get parallax
 *
 * data-speed="1"   → no effect (neutral)
 * data-speed="1.5" → moves 1.5× faster (floats forward)
 * data-speed="0.5" → moves 0.5× slower (recedes)
 */
export function useParallax(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nodes = Array.from(
      container.querySelectorAll<HTMLElement>("[data-speed]")
    );
    if (!nodes.length) return;

    const triggers: ReturnType<typeof ScrollTrigger.create>[] = [];

    nodes.forEach((node) => {
      const speed = parseFloat(node.dataset.speed ?? "1");
      if (speed === 1) return;

      const range = 150 * Math.abs(speed - 1);

      const st = ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const y =
            gsap.utils.interpolate(-range, range, 1 - self.progress) *
            (speed - 1);
          gsap.set(node, { y, overwrite: "auto" });
        },
      });

      triggers.push(st);
    });

    return () => {
      triggers.forEach((t) => t.kill());
      nodes.forEach((node) => gsap.set(node, { clearProps: "y" }));
    };
  }, [containerRef]);
}
```

**Step 3: Commit**

```bash
git add src/lib/scroll/useParallax.ts
git commit -m "feat(scroll): add useParallax hook — data-speed parallax for full refactor"
```

---

## Task 7: GATE 1 — Manual Functional Check

**This gate must fully pass before proceeding to Gate 2.**

**Step 1: Start the dev server**

```bash
npm run dev
```

Expected: Server starts with zero errors in terminal. Open `http://localhost:3000`.

**Step 2: Verify scroll smoothness on homepage**

- Scroll up and down — motion should feel smooth with ~1.2s easing
- No jank, no scroll hijacking, no frozen scroll
- Mobile: Scroll should feel native (no smoothTouch weirdness)

**Step 3: Verify stats section parallax**

Scroll to the 4 stats nodes (1980 Έτος Ίδρυσης, 10.000+ Προϊόντα, etc.). Each should move at different speeds as you scroll past. The existing manual parallax in `HomePageClient.tsx` drives this — it should work identically to before.

**Step 4: Verify contact card entrance**

Scroll to the bottom contact card. It should scale + fade in from `scale: 0.85, opacity: 0` as it enters the viewport.

**Step 5: Verify ScrollAnimation grid reveal**

Scroll to the 5×3 pinned grid section. It should:
- Pin to the viewport while scrolling
- Reveal cards with staggered scale/fade in 3 layers
- Unpin when done

**Step 6: Verify HorizontalGallery**

The gallery should drag horizontally with inertia. On desktop it should snap between cards.

**Step 7: Verify BackToTop**

- Scroll down 300px → BackToTop button appears (fade + scale in)
- Click it → page smoothly scrolls to top (Lenis lerp: 0.05 = fast)

**Step 8: Verify reduced-motion**

In Chrome DevTools → Rendering → Emulate CSS media feature: `prefers-reduced-motion: reduce`

- Scroll: Should be instant (lerp: 1 in LenisProvider)
- All GSAP animations should be paused (client.ts sets timeScale to 0)

**Step 9: Check browser console**

Zero errors, zero warnings related to scroll or GSAP.

---

## Task 8: GATE 2 — Static Analysis

**All checks must pass with zero errors.**

**Step 1: Lint**

```bash
npm run lint
```

Expected: No errors, no warnings.

**Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: No errors. If you see `Cannot find module '@lenis/react'`, run `npm install` first.

**Step 3: Grep for remaining ScrollSmoother references in source**

```bash
grep -rn "ScrollSmoother" src/ --include="*.ts" --include="*.tsx"
```

Expected output (these are acceptable — they're in `SmoothScrollProvider.tsx` which is kept but dormant):
```
src/components/SmoothScrollProvider.tsx: (multiple lines — this file is kept but unused)
```

No other files should reference `ScrollSmoother`.

**Step 4: Grep for #smooth-wrapper / #smooth-content outside SmoothScrollProvider**

```bash
grep -rn "smooth-wrapper\|smooth-content" src/ --include="*.ts" --include="*.tsx" --include="*.css"
```

Expected output: Only `SmoothScrollProvider.tsx` matches. No other files.

**Step 5: Verify no unused imports in edited files**

```bash
npx tsc --noEmit 2>&1 | grep -E "unused|declared but"
```

Expected: (empty — no unused import errors)

---

## Task 9: GATE 3 — Performance Audit

**Verify the GPU composite layer is gone.**

**Step 1: Open Chrome DevTools → Layers panel**

Navigate to `http://localhost:3000`. Open DevTools → More tools → Layers.

Before (with ScrollSmoother): You would see a `#smooth-content` layer covering the full page.

After (with Lenis): No full-page composite layer. Individual elements may have their own layers (Three.js canvas, etc.) but no DOM-wrapping transform layer.

**Step 2: Record a Performance trace during scroll**

DevTools → Performance → Record → Scroll for 3 seconds → Stop.

Check:
- No `#smooth-content` composite layer transforms in the Layers breakdown
- Frame time stays under 16ms during scroll (check the FPS graph — should be green, not red/yellow)

**Step 3: Baseline Lighthouse comparison (optional but recommended)**

```bash
# Run Lighthouse from CLI for an objective score
npx lighthouse http://localhost:3000 --only-categories=performance --output=json --output-path=./lighthouse-lenis.json
```

Compare `lighthouse-lenis.json` Performance score to the baseline before migration.

Expected: Score should be equal or higher. A regression here is a red flag.

---

## Task 10: Final Commit and Build Verification

**Only run this task after all three gates pass.**

**Step 1: Full production build**

```bash
npm run build
```

Expected: Build completes with zero errors. Warnings about image optimization or bundle size are acceptable. TypeScript errors are not.

**Step 2: Run the production build locally**

```bash
npm run start
```

Open `http://localhost:3000` and repeat Gate 1 Step 2 (scroll check) on the production build.

**Step 3: Final commit**

```bash
git add -p
```

Review any remaining unstaged changes, then:

```bash
git commit -m "feat(scroll): homepage pilot — GSAP ScrollSmoother replaced with Lenis

- Add LenisProvider (ReactLenis root, no DOM wrapper transform)
- ScrollTrigger sync via useLenis() inner component
- Remove ScrollSmoother from GSAP plugin registry and exports
- BackToTop uses useLenis() instead of ScrollSmoother.get()
- useParallax utility created for full-refactor phase
- All three validation gates passed: functional, lint+types, GPU audit"
```

---

## Post-Pilot: What Comes Next (Full Refactor)

After the homepage pilot is merged and validated in production, the full refactor covers:

| Phase | Action |
|---|---|
| Audit all 22 GSAP files for `ScrollSmoother` refs | Grep sweep, fix comments + any remaining usages |
| Pages with `data-speed` / `data-lag` only | Add `useParallax(sectionRef)` call |
| `Chatbot.tsx` line 367 | Update comment (no code change needed) |
| `src/app/(main)/layout.tsx` line 29 | Update comment |
| `data-lag` elements (if any exist) | Implement per-element Lenis lerp override |
| Delete `SmoothScrollProvider.tsx` | Only after full refactor passes all three gates |
| `HorizontalGallery.tsx` | Add `data-lenis-prevent` on the draggable wrapper to prevent Lenis from intercepting drag events |

---

## Troubleshooting

**ScrollTrigger start/end positions shift after migration**

Cause: ScrollSmoother's `#smooth-content` transform changes how GSAP calculates scroll positions. Lenis uses native scroll coordinates.

Fix: In affected components, adjust `start` / `end` values in `scrollTrigger` configs. Usually a small tweak like `"top 80%"` → `"top 75%"`.

**Pinned sections behave differently**

Cause: Same coordinate system change as above.

Fix: Test `ScrollAnimation.tsx` specifically. If pin feels off, adjust `pin: true` + `pinSpacing` settings.

**HorizontalGallery conflicts with Lenis scroll**

Cause: Lenis may intercept wheel events on the draggable wrapper.

Fix: Add `data-lenis-prevent` attribute to the `HorizontalGallery` root element. Lenis skips scroll handling on elements with this attribute.

**`Cannot find module '@lenis/react'` TypeScript error**

Fix:
```bash
npm install
npx tsc --noEmit
```

**Lenis doesn't initialize on first render**

Cause: `ReactLenis root` requires the component to be a client component. Ensure `"use client"` is at the top of `LenisProvider.tsx`.
