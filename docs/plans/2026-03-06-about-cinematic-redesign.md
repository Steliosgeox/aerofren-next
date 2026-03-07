# About Page — Cinematic Redesign
**Date:** 2026-03-06
**Inspiration:** TrickyKnot.com scrollytelling SVG thread technique

---

## Technique (TrickyKnot-Reverse-Engineered)

NOT stroke-dashoffset. NOT Lottie.

1. A **massively tall, static SVG** (`viewBox="0 0 1440 11000"`) positioned `absolute` in the wrapper
2. The `<path>` is completely **still** — drawn to weave between content blocks
3. Lenis smooth-scrolling provides the **cinematic illusion** of the line flowing
4. `preserveAspectRatio="none"` ensures it scales to actual page height responsively

---

## Design System

| Token | Value |
|---|---|
| Aesthetic | Deep-Sea Industrial Noir |
| BG | `--theme-bg-solid` (dark: `#06101f`) |
| Thread Color | `--theme-accent` at 30% opacity with glow filter |
| Stroke Width | 1.5px main + 4px ghost |
| Section font | TT Norms 900 weight |

---

## Page Structure (total ≈ 11 × 100vh + 60vh closing)

| Section | Alignment | SVG Line Zone |
|---|---|---|
| Hero | Center | Center → curves right |
| 01: Ίδρυση 1980 | Text LEFT | Line RIGHT (x≈1100) |
| 02: Εξέλιξη | Text RIGHT | Line LEFT (x≈200) |
| 03: Νέος Χώρος | Text LEFT | Line RIGHT |
| 04: Τιμή Ιδρυτή | Text RIGHT | Line LEFT |
| Divider | Center | Line to Center |
| 05: Ακρίβεια | Text LEFT | Line RIGHT |
| 06: Αντοχή | Text RIGHT | Line LEFT |
| 07: Συστηματική | Text LEFT | Line RIGHT |
| 08: Αθόρυβα | Text RIGHT | Line LEFT |
| 09: Τεχνογνωσία | Text LEFT | Line RIGHT |
| 10: Επαγγελματίες | Text RIGHT | Line LEFT |
| Closing | Center | Line to Center |

---

## Files Modified

- `src/components/CinematicBackgroundLine.tsx` — NEW
- `src/components/AboutCinematicPage.tsx` — NEW (replaces AboutHistoryGrid)
- `src/app/(about)/layout.tsx` — ADD Lenis via LenisProvider
- `src/app/(about)/about/page.tsx` — swap to AboutCinematicPage
