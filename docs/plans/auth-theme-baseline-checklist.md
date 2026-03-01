# Auth Theme Baseline Checklist

**Date:** 2026-03-01  
**Routes:** `/login`, `/signup`  
**Themes:** `dark`, `light`, `dim`

## Manual Reproduction Matrix

1. Open `/login`, toggle `dark -> light -> dim -> dark`.
2. Repeat on `/signup`.
3. Toggle themes rapidly (3 quick clicks) on each route.
4. Switch route during theme changes (`/login <-> /signup`).
5. Check desktop header + auth card + inputs + alert blocks for visual sync.
6. Check keyboard focus ring visibility in each theme.

## Current Baseline Observations (Pre-Refactor)

1. Theme state has dual-write path in switcher (`setAttribute` + `setTheme`), increasing risk of transient mismatch.
2. Theme-derived component behavior is fragmented across observers (`AuthLayout`, `GlassSurface`, `NexusHero`).
3. Alert styling on auth pages uses fixed warning/error utility colors, not semantic theme tokens.
4. Login/signup shared UI patterns are duplicated, making consistency fixes easy to miss in one route.

## Pass Criteria After Refactor

1. Theme changes are deterministic and consistent across all auth surface elements.
2. No visual drift beyond corrective consistency updates.
3. No hydration/theme flicker warnings.
4. Accessibility remains valid (focus and contrast).
