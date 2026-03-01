# Auth Theme Perfection Audit & Refactor Plan

**Goal:** Eliminate theme drift and auth-page style inconsistencies on `/login` and `/signup` while preserving existing UI and improving maintainability/scalability.

**Scope:** Auth theme flow (`LiquidGlassSwitcher`, `GlassSurface`, auth alerts/buttons/dividers, login/signup composition).

## Issue Registry

| ID | Severity | Area | Finding | Status |
|----|----------|------|---------|--------|
| T-01 | Critical | Theme switching | Multiple writers updating theme state (`setTheme` + direct `data-theme` DOM mutation) | Fixed |
| T-02 | Critical | Theme tokens | `GlassSurface` had local dark/light detection logic and hardcoded color branches | Fixed |
| T-03 | Important | Auth alerts | Login/Signup used hardcoded alert utility colors (`amber/red`) instead of semantic tokens | Fixed |
| T-04 | Important | Duplication | Repeated button/divider class strings across Login/Signup caused drift risk | Fixed |
| T-05 | Important | Theme safety | No mounted-safe, shared theme contract for client components | Fixed |
| T-06 | Minor | Test gaps | No regression coverage for theme-write ownership and auth primitive usage | Fixed |

## Refactor Strategy

1. Establish one theme contract.
2. Enforce one theme writer.
3. Replace hardcoded visual branches with semantic tokens.
4. Introduce shared auth primitives for repeated UI patterns.
5. Add regression tests around theme ownership and auth composition.

## Implemented Changes

1. Added `useAppTheme` (`src/lib/theme/useAppTheme.ts`) as mounted-safe theme contract.
2. Refactored `LiquidGlassSwitcher` to only call `setTheme`; removed direct `data-theme` DOM mutation.
3. Refactored `GlassSurface` to token-driven styling and removed local observer/media-query theme logic.
4. Added semantic auth alert tokens/classes in `src/app/globals.css`.
5. Added shared primitives:
`AuthAlert`, `AuthPrimaryButton`, `AuthSocialButton`, `AuthDivider`.
6. Refactored `src/components/Login.tsx` and `src/components/Signup.tsx` to consume shared primitives.
7. Added regression tests:
`useAppTheme`, `LiquidGlassSwitcher` theme ownership, `GlassSurface` tokenization, auth alerts/buttons, login/signup primitive integration.

## Predicted Future Risks (and Mitigations)

1. Risk: New components bypass semantic tokens and reintroduce hardcoded colors.
Mitigation: Keep source-level token tests and enforce shared primitives in auth flows.
2. Risk: Theme state divergence if direct DOM mutation is reintroduced.
Mitigation: Keep single-writer test asserting `setTheme` ownership.
3. Risk: Primitive divergence if local ad-hoc button variants appear.
Mitigation: Extend primitives with props instead of duplicating class blocks.
4. Risk: Hydration/UI flash from mount-gated rendering patterns.
Mitigation: Prefer `useSyncExternalStore`-based mounted detection pattern.

## Validation Protocol

1. Targeted regression suite for auth/theme components must pass.
2. Full build must pass (`next build`).
3. Full test/lint baselines tracked with explicit pre-existing failures documented.
4. React Doctor scan for post-refactor quality signal.

## Non-Auth Backlog (Observed During Validation)

1. Existing full-suite failures unrelated to this auth refactor:
`src/__tests__/auth/validation.test.ts`,
`src/app/api/contact/route.test.ts` (runtime `zod` import issue under current test runtime).
2. Existing lint blockers unrelated to this scope:
`src/components/Header.tsx`,
`src/components/HomePageClient.tsx` (`react-hooks/set-state-in-effect`).
