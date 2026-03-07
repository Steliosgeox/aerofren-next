# Contact Route Lenis Lightweight Path

## Goal

Remove the GSAP-synced scroll loop from `/contact` and keep that page on a lighter Lenis setup, while preserving the GSAP-synced Lenis branch for routes that still depend on ScrollTrigger precision.

## Chosen Approach

- Keep `LenisProvider` as the single scroll provider abstraction.
- Add a `syncWithGsap` switch so the provider can run in two modes:
  - `true`: GSAP ticker + `ScrollTrigger.update` for animation-heavy routes
  - `false`: native Lenis RAF with no GSAP scroll coupling
- Route `/contact` through the lightweight branch inside `RouteScrollShell`.

## Why This Approach

- Avoids duplicating scroll-provider components.
- Removes unnecessary GSAP scroll overhead from the Contact page.
- Preserves existing scroll-trigger behavior on routes that still need it.

## Files

- `src/components/LenisProvider.tsx`
- `src/components/RouteScrollShell.tsx`
- `src/__tests__/scroll/RouteScrollShell.test.tsx`
- `src/app/(main)/layout.tsx`
- `src/components/BackToTop.tsx`
- `src/components/Chatbot.tsx`

## Verification

- `bun.exe run test:run -- src/__tests__/scroll/RouteScrollShell.test.tsx`
- `bun.exe run lint`
- `bun.exe x tsc --noEmit`
- `bun.exe run build`
- `bun.exe x react-doctor@latest . --verbose --diff`

## Result

`/contact` now uses Lenis without the GSAP-driven scroll loop. Public routes such as `/products` still use the GSAP-synced Lenis path where scroll-triggered choreography exists.
