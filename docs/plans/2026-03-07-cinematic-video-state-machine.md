# Cinematic Video State Machine — Implementation Plan
**Date:** 2026-03-07
**Agent:** Senior Frontend Architect
**Status:** Assets ready — awaiting implementation

---

## 0. Infrastructure & Cost Reality Check

> **TL;DR: Total infrastructure cost: €0/month on existing Vercel plan.**

| Option | Monthly Cost | Speed |
|--------|-------------|-------|
| Vercel `/public` (Free) | €0 | Excellent CDN |
| Cloudflare R2 | €0–5 | World-class (if >27k views/month) |

All performance gains come from code optimizations, not paid infrastructure.

---

## 1. Architecture Decision: The Hybrid Model

> **Key insight:** Loop videos and transition videos are fundamentally different. Treating them the same is a mistake.

| Video | Type | Format | Why |
|-------|------|--------|-----|
| `Above_Water_Dim_Loop.webm` | **Loop** | WebM video | Streams efficiently, near-zero CPU cost for looping |
| `Going_Down-webm.webm` | **Transition (submerge)** | WebP frame sequence → Canvas scrub | User controls the dive speed with their scroll |
| `Under_Water_Dim_loop.webm` | **Loop** | WebM video | Streams efficiently, near-zero CPU cost for looping |
| `Transition_UP.mp4` | **Transition (resurface)** | WebP frame sequence → Canvas scrub | User controls the rise speed with their scroll |

**The result:** Loops feel effortless. Transitions feel physically connected to the user's hand. This is the Apple Mac Pro / AirPods approach for transitions.

---

## 2. Assets — Current Status ✅ COMPLETE

### Loop Videos (WebM) — Already Ready
| File | Path | Status |
|------|------|--------|
| `Above_Water_Dim_Loop.webm` | `public/About us/frames/Above_Water_Dim_Loop.webm` | ✅ Ready |
| `Under_Water_Dim_loop.webm` | `public/About us/frames/Under_Water_Dim_loop.webm` | ✅ Ready |

### Transition Frame Sequences (WebP) — Extracted ✅
| Video | Frames | Avg/Frame | Total | Path |
|-------|--------|-----------|-------|------|
| `Going_Down-webm.webm` (submerge ↓) | **192 frames** ✅ | ~24.9 KB | **4.67 MB** | `public/About us/frames/transition_down/frame_%04d.webp` |
| `Transition_UP.mp4` (resurface ↑) | **192 frames** ✅ | ~26.1 KB | **4.9 MB** | `public/About us/frames/transition_up/frame_%04d.webp` |

**Extraction command used (ffmpeg 8.0.1):**
```bash
& "C:\Users\Stelios\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_...\bin\ffmpeg.exe" \
  -i "public/About us/Going_Down-webm.webm" \
  -vf "fps=24,scale=1280:-1" \
  -vcodec libwebp -lossless 0 -compression_level 6 -q:v 80 -an -fps_mode passthrough \
  "public/About us/frames/transition_down/frame_%04d.webp"
```

### Sprite Sheets — Generated ✅
| File | Path | Size | Grid | Cell Size |
|------|------|------|------|-----------|
| `sprite_down.webp` | `public/videos/sprites/sprite_down.webp` | **2.22 MB** ✅ | 8×24 | 640×360px |
| `sprite_up.webp` | `public/videos/sprites/sprite_up.webp` | **2.22 MB** ✅ | 8×24 | 640×360px |

**Canvas render formula for frame N (0-indexed):**
```typescript
const col  = N % 8;
const row  = Math.floor(N / 8);
const srcX = col * 640;
const srcY = row * 360;
ctx.drawImage(sprite, srcX, srcY, 640, 360, 0, 0, canvas.width, canvas.height);
```

**Generation script:** `scripts/generate-sprites.mjs` — re-run any time source frames change.

---

## 3. Key Design Question — ANSWERED ✅

### "Can we keep the CinematicBackgroundLine SVG and add the videos behind it?"

**YES. It is the perfect architecture. No SVG changes needed at all.**

Here's why it works perfectly already:

#### Current Layer Stack (AboutCinematicPage.tsx)
```
z-index 11  →  CinematicBackgroundLine SVG (transparent background, just the thread path)
z-index  2  →  Content sections (hero, text blocks, contact)
z-index  0  →  Page root (.about-wrap) ← has background: var(--theme-bg-solid) ← BLOCKER
```

#### What blocks the videos right now
The **only** thing blocking the video from showing through is this single CSS property on `.about-wrap`:
```css
background: var(--theme-bg-solid);  /* ← This one line blocks everything */
```

#### The Fix (One Change to AboutCinematicPage.tsx)
Remove that solid background from the root wrapper. The videos will live in a new `VideoBackground` component at `z-index: 0`, absolutely filling the page. Everything else — the SVG, the content — stays exactly as-is and layers on top:

```
z-index 11  →  CinematicBackgroundLine SVG ← UNCHANGED. Perfect as-is.
z-index  2  →  Content sections ← UNCHANGED.
z-index  1  →  Grain overlay + Vignette overlay (new — adds cinematic feel on top of video)
z-index  0  →  VideoBackground (video loops + canvas transitions) ← NEW
               page root background: transparent (was: solid color)
```

#### Will the 3 themes (dark/light/dim) still work?
**Yes — with one consideration.** The `--theme-accent` color used by the SVG thread will still adapt per theme (cyan / blue / pink). The videos are always the same dark underwater footage regardless of theme. This actually creates a beautiful contrast:
- **Dark theme:** Black text barely visible, SVG thread in cyan over dark water. Stunning.
- **Dim theme:** Slightly lighter text on dark video, SVG thread in pink/coral. Premium.
- **Light theme:** This needs a `backdrop-filter: brightness(1.4)` or a semi-transparent white overlay over the video to ensure text remains readable. The SVG thread should remain visible. We can handle this with a CSS variable-driven overlay opacity.

---

## 4. The Transition Problem & Solution

### The Problem
Even if the first/last frames match perfectly, a hard swap will cause a 1-frame flash.

### The Solution: CSS Crossfade
- All 4 sources (2 `<video>` loops + 2 `<canvas>` transitions) exist in the DOM at all times.
- Only ONE is visible via `opacity: 1` with `.active` class.
- CSS `transition: opacity 400ms ease-in-out` handles the crossfade.
- For 400ms, both the outgoing and incoming sources are partially visible simultaneously.
- Because their edge frames match, the blend is invisible.

```css
.videoLayer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 400ms ease-in-out;  /* THE SMOOTHNESS */
    will-change: opacity;
    transform: translateZ(0);  /* GPU compositing layer */
    pointer-events: none;
}
.videoLayer.active { opacity: 1; }
```

---

## 5. The State Machine (React `useReducer`)

```
ABOVE        + scrollDown   → SUBMERGING
SUBMERGING   + videoEnded   → UNDERWATER
UNDERWATER   + scrollUp     → RESURFACING
RESURFACING  + videoEnded   → ABOVE
```

**Critical rule:** `SUBMERGING` and `RESURFACING` states are **locked** — they ignore ALL scroll input. Only the canvas `onComplete` callback (when frame 191 is reached) can advance the state.

### Edge Cases
| Scenario | Behavior |
|----------|----------|
| Scroll down mid-submerge, then scroll back up | Let submerge finish. State machine locked during transitions. |
| Scroll very fast past both triggers | Queues naturally. No state skipping allowed. |
| Refresh while underwater | Always reset to ABOVE on mount. |
| `prefers-reduced-motion` | Skip all video. Show static poster from first frame of above-water loop. |
| Tab hidden | Pause active video / pause canvas animation. Resume on tab return. |
| Off-screen | Pause via IntersectionObserver. Resume when visible. |

---

## 6. Smart Loading Strategy

### Detect Network + Device on Mount
```typescript
const connection = (navigator as any).connection;
const isSlow = ['2g', 'slow-2g'].includes(connection?.effectiveType);
```

### Cascade Preload Chain
```
Mount → preload Above-water WebM (above)
Above-water canplaythrough → preload Sprite_Down (transition ↓)
Sprite_Down loaded → preload Underwater WebM
Underwater canplaythrough → preload Sprite_Up (transition ↑)
```
Only enable GSAP scroll triggers after their required asset is ready.

### `<link rel="preload">` in page.tsx (Server Component)
```tsx
<link rel="preload" as="video" href="/About us/frames/Above_Water_Dim_Loop.webm" type="video/webm" />
<link rel="preload" as="image" href="/videos/sprites/sprite_down.webp" />
```

### Vercel Cache Headers (`next.config.js`)
```js
{ source: '/videos/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
{ source: '/About us/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
```

### Slow Connection Fallback
Show static poster image (first frame of above-water). Still apply grain + vignette. Same cinematic feel, zero video overhead.

---

## 7. GSAP ScrollTrigger Layout

```
Page Layout:
┌──────────────────────────────┐
│                              │
│  HERO (Η Ιστορία μας.)       │ ← Video: Above_Water_Dim_Loop.webm (looping)
│                              │
│  ── DIVE TRIGGER ─────────── │ ← ScrollTrigger fires SUBMERGING dispatch
│                              │   (only active after sprite_down.webp loaded)
│  01 / Ίδρυση                 │
│  02 / Εξέλιξη     ← (canvas)  │ ← sprite_down scrubbed by scroll (frames 0→191)
│  03 / Χώρος                  │   then: Under_Water_Dim_loop.webm takes over
│  04 / Τιμή                   │
│                              │
│  ── RESURFACE TRIGGER ─────  │ ← ScrollTrigger fires RESURFACING dispatch
│                              │   (only active after sprite_up.webp loaded)
│  05 – 10 / Philosophy        │ ← sprite_up scrubbed by scroll (frames 0→191)
│                              │   then: Above_Water_Dim_Loop.webm takes over
│  Contact                     │
│                              │
└──────────────────────────────┘
```

---

## 8. File Map

| File | Action | Status |
|------|--------|--------|
| `src/components/AboutCinematicPage.tsx` | Remove `background: var(--theme-bg-solid)` from root | ⏳ Code |
| `src/components/CinematicBackgroundLine.tsx` | **NO CHANGES** — perfect as-is | ✅ Done |
| `src/components/VideoStateManager.tsx` | New: `useReducer` + GSAP ScrollTrigger + crossfade | ⏳ Code |
| `src/components/VideoBackground.tsx` | New: 2× `<video>` loops + 2× `<canvas>` transitions stacked | ⏳ Code |
| `src/app/(about)/about/page.tsx` | Add `<link rel="preload">` tags | ⏳ Code |
| `next.config.js` | Add cache headers for `/videos/` and `/About us/` | ⏳ Code |
| `scripts/generate-sprites.mjs` | ✅ Created + run | ✅ Done |
| `public/About us/frames/Above_Water_Dim_Loop.webm` | ✅ Ready | ✅ Done |
| `public/About us/frames/Under_Water_Dim_loop.webm` | ✅ Ready | ✅ Done |
| `public/About us/frames/transition_down/frame_*.webp` | ✅ 192 frames extracted | ✅ Done |
| `public/About us/frames/transition_up/frame_*.webp` | ✅ 192 frames extracted | ✅ Done |
| `public/videos/sprites/sprite_down.webp` | ✅ 2.22 MB sprite sheet | ✅ Done |
| `public/videos/sprites/sprite_up.webp` | ✅ 2.22 MB sprite sheet | ✅ Done |

---

## 9. Things We Haven't Thought Of Yet (Brainstorm)

### ⚠️ Issue: Light Theme Readability
The underwater video is always dark. On the light theme, white text over dark video may look wrong because `--theme-text` is dark on light theme. **Fix:** A semi-transparent white overlay (`rgba(255,255,255,0.15)`) on top of the video container, controlled by a CSS variable that is 0 on dark/dim and 0.15 on light theme.

### ⚠️ Issue: Canvas Scroll Speed Calibration
The canvas scrub speed needs calibration. If the scroll trigger zone is 200px of real scroll, 192 frames must map to those 200px. If calibrated wrong: either the user scrolls through it too fast (no immersion) or way too slow (annoying). Needs real-device testing. **Fix:** Make the `scrollTrigger.end` value configurable — a constant we can adjust once we see it on screen.

### ⚠️ Issue: First Contentful Paint (FCP) — Videos are not SSR
The video container renders as blank until React hydrates client-side. This could cause a flash of solid background. **Fix:** Add a `<noscript>` poster fallback AND set the root wrapper's `background` to a dark navy `#030816` instead of `transparent` for the initial SSR render. Once hydrated and videos load, the video takes over.

### ⚠️ Issue: Mobile iOS — Autoplay restrictions
iOS Safari allows autoplay ONLY if `muted`, `playsinline`, and `autoplay` attributes are ALL present. Missing any one of them = black screen. **Fix:** Must verify all 3 attributes on both `<video>` elements in code.

### ⚠️ Issue: NextJS `public` folder path with spaces
The path `public/About us/` contains a space. This requires careful URL encoding in Next.js `src` attributes. In React/Next.js, the browser-served path is `/About%20us/Above_Water_Dim_Loop.webm`. **Recommendation:** Before coding, rename the folder from `About us` to `about-us` or `about_us` to avoid URL encoding headaches in both CSS and JSX. This is a 5-second folder rename now vs. hours of debugging path issues later.

### ⚠️ Issue: `CinematicBackgroundLine` z-index vs Canvas
The SVG thread is `z-index: 11`. The canvas and videos must be `z-index: 0`. The content sections are `z-index: 2`. A **grain overlay at `z-index: 1`** would sit between the video and the content — creating the cinematic texture without blocking interactive elements (links, buttons).

### ⚠️ Issue: Page scrollbar and `overflow: hidden`
The root `.about-wrap` currently has `overflow: hidden` in `AboutHistoryGrid.tsx` (not in `AboutCinematicPage.tsx` but worth checking). If we add `position: fixed` to the video background, we must ensure `overflow: hidden` is NOT on the page root, otherwise the fixed element will be clipped.

### ⚠️ Issue: Sprite sheet canvas resize
If the user resizes their browser window while on the About page, the canvas element's `width`/`height` pixel dimensions must update to match the new viewport. Without this, the canvas will appear blury (CSS-scaled) or incorrectly sized. **Fix:** Add a `ResizeObserver` on the canvas container that updates `canvas.width` and `canvas.height` to the container's `clientWidth`/`clientHeight`.

---

## 10. Pre-Implementation Checklist

Before writing one line of code:
- [ ] Rename `public/About us/` to `public/about-us/` to remove spaces from paths
- [ ] Confirm loop videos autoplay correctly in browser locally (drop path in browser address bar)
- [ ] Confirm first frame of `Above_Water_Dim_Loop.webm` matches last frame of `sprite_up.webp` frame 191
- [ ] Confirm last frame of `Above_Water_Dim_Loop.webm` matches first frame of `sprite_down.webp` frame 0
- [ ] Confirm last frame of `sprite_down.webp` frame 191 matches first frame of `Under_Water_Dim_loop.webm`
- [ ] Confirm last frame of `Under_Water_Dim_loop.webm` matches first frame of `sprite_up.webp` frame 0

---

## 11. Verification Checklist (Post-Implementation)

- [ ] Vercel cache headers set for video paths in `next.config.js`
- [ ] Slow connection shows static poster fallback
- [ ] Cascade preload chain works: Above → Sprite_Down → Underwater → Sprite_Up
- [ ] Scroll triggers only fire after their required asset is `canplaythrough` / `loaded`
- [ ] `SUBMERGING` / `RESURFACING` states are locked (refuse new scroll input)
- [ ] `above → submerge canvas`: seamless (no flash, no jump cut)
- [ ] `submerge canvas → underwater loop`: seamless
- [ ] `underwater loop → resurface canvas`: seamless
- [ ] `resurface canvas → above loop`: seamless
- [ ] Canvas resize works on browser window resize
- [ ] Light theme: text is readable over video (overlay active)
- [ ] Dark theme: electric and cinematic
- [ ] Dim theme: balanced and premium
- [ ] `prefers-reduced-motion`: shows static poster, video skipped
- [ ] Tab switch: pauses video/canvas. Resumes on return
- [ ] iOS Safari: all videos autoplay (`muted playsinline autoplay`)
- [ ] CinematicBackgroundLine SVG visible threading through all sections
- [ ] Grain + vignette overlays render above video, below content
- [ ] `react-doctor` score remains 100/100
- [ ] `eslint` and `tsc` pass with 0 errors
