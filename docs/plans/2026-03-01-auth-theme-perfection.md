# Auth Theme Perfection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate theme inconsistency and state drift on `/login` and `/signup`, while keeping visuals effectively unchanged and improving maintainability/scalability.

**Architecture:** Introduce a single theme-state writer, formalize auth semantic tokens, and refactor duplicated login/signup UI into shared primitives. Keep all output token-driven and add regression tests for theme transitions.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, next-themes, Tailwind CSS, Vitest + Testing Library

---

## Task 1: Baseline Reproduction + Guardrail Capture

**Files:**
- Create: `docs/plans/auth-theme-baseline-checklist.md`
- Modify: `docs/plans/2026-03-01-auth-theme-perfection-design.md` (link baseline artifact)

**Step 1: Create baseline checklist**

Document deterministic manual steps:
- `/login` toggle `dark -> light -> dim -> dark`
- `/signup` same sequence
- rapid toggle stress test (3 quick flips)
- navigate `/login <-> /signup` while switching themes

**Step 2: Add expected baseline observations**

Include current issues observed (mixed surfaces, delayed element sync, alert contrast concerns).

**Step 3: Commit**

```bash
git add docs/plans/auth-theme-baseline-checklist.md docs/plans/2026-03-01-auth-theme-perfection-design.md
git commit -m "docs(auth): add baseline reproduction checklist for auth theme inconsistency"
```

---

## Task 2: Add Theme Adapter (Single Source Contract)

**Files:**
- Create: `src/lib/theme/useAppTheme.ts`
- Create: `src/__tests__/theme/useAppTheme.test.ts`
- Modify: `src/lib/auth/index.ts` (if exporting theme helper through barrel is desired)

**Step 1: Write failing test**

Create `src/__tests__/theme/useAppTheme.test.ts` covering:
- mounted fallback behavior
- `effectiveTheme` derivation from `resolvedTheme || theme`
- no direct DOM mutations

**Step 2: Run test and verify failure**

Run:
```bash
npm run test:run -- src/__tests__/theme/useAppTheme.test.ts
```
Expected: FAIL (module missing).

**Step 3: Implement adapter**

Implement `useAppTheme()` returning:
- `mounted`
- `theme`
- `resolvedTheme`
- `effectiveTheme`
- `setTheme`

No DOM writes allowed in this helper.

**Step 4: Re-run test**

```bash
npm run test:run -- src/__tests__/theme/useAppTheme.test.ts
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/theme/useAppTheme.ts src/__tests__/theme/useAppTheme.test.ts
git commit -m "feat(theme): add useAppTheme adapter with deterministic effectiveTheme contract"
```

---

## Task 3: Refactor LiquidGlassSwitcher to Single Writer

**Files:**
- Modify: `src/components/LiquidGlassSwitcher.tsx`
- Create: `src/__tests__/theme/liquidGlassSwitcher.theme-write.test.tsx`

**Step 1: Write failing test**

Add a test asserting theme change:
- calls `setTheme(newTheme)`
- does **not** call `document.documentElement.setAttribute("data-theme", ...)`

**Step 2: Run failing test**

```bash
npm run test:run -- src/__tests__/theme/liquidGlassSwitcher.theme-write.test.tsx
```
Expected: FAIL (current code mutates DOM directly).

**Step 3: Implement fix**

- Replace direct DOM `setAttribute` with single `setTheme(newTheme)`.
- Keep view transition animation wrapper if desired, but state write remains singular.
- Consume `useAppTheme()` for mounted-safe `effectiveTheme`.

**Step 4: Run test**

```bash
npm run test:run -- src/__tests__/theme/liquidGlassSwitcher.theme-write.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/LiquidGlassSwitcher.tsx src/__tests__/theme/liquidGlassSwitcher.theme-write.test.tsx
git commit -m "fix(theme): remove direct data-theme DOM mutation from switcher and use single-writer theme flow"
```

---

## Task 4: Tokenize GlassSurface (Remove Hardcoded Branch Colors)

**Files:**
- Modify: `src/components/ui/GlassSurface.tsx`
- Modify: `src/app/globals.css`
- Create: `src/__tests__/theme/glassSurface.tokens.test.tsx`

**Step 1: Write failing test**

Test should fail when hardcoded focus colors (`#0A84FF`, `#007AFF`) or hardcoded surface RGBA values remain.

**Step 2: Run failing test**

```bash
npm run test:run -- src/__tests__/theme/glassSurface.tokens.test.tsx
```
Expected: FAIL.

**Step 3: Implement tokenized surface style**

- Add/ensure semantic variables:
  - `--glass-surface-bg`
  - `--glass-surface-border`
  - `--glass-surface-shadow`
  - `--focus-ring-color`
- Update `GlassSurface` to derive styles from tokens instead of hardcoded theme branches.
- Preserve current visual feel by mapping existing values to tokens per theme in `globals.css`.

**Step 4: Re-run test**

```bash
npm run test:run -- src/__tests__/theme/glassSurface.tokens.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/ui/GlassSurface.tsx src/app/globals.css src/__tests__/theme/glassSurface.tokens.test.tsx
git commit -m "refactor(theme): make GlassSurface token-driven and remove hardcoded color branches"
```

---

## Task 5: Add Auth Semantic Tokens and Alert Accessibility Colors

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/auth/AuthAlert.tsx`
- Create: `src/__tests__/auth/authAlert.theme.test.tsx`

**Step 1: Write failing test**

Test `AuthAlert` uses semantic classes/tokens, not fixed `text-red-300`/`text-amber-300`.

**Step 2: Run failing test**

```bash
npm run test:run -- src/__tests__/auth/authAlert.theme.test.tsx
```
Expected: FAIL.

**Step 3: Implement**

- Add semantic auth alert tokens in `globals.css`.
- Implement `AuthAlert` component with variants (`warning`, `error`).
- Keep same visual intent, improve theme contrast behavior.

**Step 4: Re-run test**

```bash
npm run test:run -- src/__tests__/auth/authAlert.theme.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/globals.css src/components/auth/AuthAlert.tsx src/__tests__/auth/authAlert.theme.test.tsx
git commit -m "feat(auth-theme): add semantic auth alert tokens and themed alert component"
```

---

## Task 6: Extract Shared Auth Action Primitives

**Files:**
- Create: `src/components/auth/AuthPrimaryButton.tsx`
- Create: `src/components/auth/AuthSocialButton.tsx`
- Create: `src/components/auth/AuthDivider.tsx`
- Modify: `src/components/auth/index.ts`

**Step 1: Write failing component tests**

Create tests validating shared primitives render with expected classes/ARIA and disabled/loading behavior.

**Step 2: Run failing tests**

```bash
npm run test:run -- src/__tests__/auth/authButtons.test.tsx
```
Expected: FAIL.

**Step 3: Implement minimal primitives**

Extract repeated UI from login/signup, preserving current layout/spacing/text.

**Step 4: Re-run tests**

```bash
npm run test:run -- src/__tests__/auth/authButtons.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/auth/AuthPrimaryButton.tsx src/components/auth/AuthSocialButton.tsx src/components/auth/AuthDivider.tsx src/components/auth/index.ts src/__tests__/auth/authButtons.test.tsx
git commit -m "refactor(auth): extract shared auth action primitives for login/signup"
```

---

## Task 7: Refactor Login to Shared Components

**Files:**
- Modify: `src/components/Login.tsx`
- Modify: `src/components/auth/index.ts`
- Modify: `src/__tests__/auth/login.theme-flow.test.tsx` (create if missing)

**Step 1: Write failing regression test**

Validate:
- theme toggles do not break social/email mode switches
- forgot-password path still works
- auth alerts rendered via `AuthAlert`

**Step 2: Run failing test**

```bash
npm run test:run -- src/__tests__/auth/login.theme-flow.test.tsx
```
Expected: FAIL before refactor.

**Step 3: Implement refactor**

- Replace duplicated button/divider/alert blocks with shared components.
- Keep strings/layout and auth behavior unchanged.
- Keep mounted behavior stable (remove only if validated safe).

**Step 4: Run test**

```bash
npm run test:run -- src/__tests__/auth/login.theme-flow.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Login.tsx src/__tests__/auth/login.theme-flow.test.tsx
git commit -m "refactor(auth): migrate Login to shared auth primitives with theme-safe alerts"
```

---

## Task 8: Refactor Signup to Shared Components

**Files:**
- Modify: `src/components/Signup.tsx`
- Modify: `src/__tests__/auth/signup.theme-flow.test.tsx` (create if missing)

**Step 1: Write failing regression test**

Validate:
- social/email toggle works in all themes
- field validation rendering unchanged
- alert blocks use tokenized component

**Step 2: Run failing test**

```bash
npm run test:run -- src/__tests__/auth/signup.theme-flow.test.tsx
```
Expected: FAIL before refactor.

**Step 3: Implement**

Refactor signup to same shared primitives used by login.

**Step 4: Re-run**

```bash
npm run test:run -- src/__tests__/auth/signup.theme-flow.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Signup.tsx src/__tests__/auth/signup.theme-flow.test.tsx
git commit -m "refactor(auth): migrate Signup to shared auth primitives and tokenized alerts"
```

---

## Task 9: Normalize Auth Entry Surface in Header

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/app/globals.css`

**Step 1: Write failing test**

Add assertion that login button style on header resolves to semantic tokens (no hardcoded white overlay).

**Step 2: Run failing test**

```bash
npm run test:run -- src/__tests__/theme/header-auth-entry.tokens.test.tsx
```
Expected: FAIL.

**Step 3: Implement**

- Replace `LOGIN_BUTTON_STYLES` hardcoded background with tokenized surface vars.
- Keep perceived appearance unchanged.

**Step 4: Re-run**

```bash
npm run test:run -- src/__tests__/theme/header-auth-entry.tokens.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/Header.tsx src/app/globals.css src/__tests__/theme/header-auth-entry.tokens.test.tsx
git commit -m "fix(theme): tokenise header auth entry surface for cross-theme consistency"
```

---

## Task 10: Clean Theme Technical Debt Around Auth

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/auth/AuthLayout.tsx` (only if needed for observer simplification)

**Step 1: Add failing lint/style check**

Ensure duplicated blur-disable blocks and unused theme hacks are removed.

**Step 2: Implement cleanup**

- Remove duplicate global blur-disable block(s).
- Keep behavior intact.
- If `AuthLayout` observer logic is reduced, keep Silk color response deterministic.

**Step 3: Run checks**

```bash
npm run lint
```
Expected: PASS.

**Step 4: Commit**

```bash
git add src/app/globals.css src/components/auth/AuthLayout.tsx
git commit -m "chore(theme): remove duplicated global theme tech debt and simplify auth layout theme plumbing"
```

---

## Task 11: React Doctor + Integrated Test Pass

**Files:**
- Modify only as required by findings from checks

**Step 1: Run React doctor workflow**

Run:
```bash
npm run lint
npm run test:run
```

Fix only regressions introduced by this refactor.

**Step 2: Verify no auth regressions**

Run focused suites:
```bash
npm run test:run -- src/__tests__/auth
npm run test:run -- src/__tests__/theme
```

**Step 3: Commit**

```bash
git add .
git commit -m "test(auth-theme): pass React doctor checks and auth/theme regression suites"
```

---

## Task 12: Triple Validation Gate (Required Before Completion)

**Step 1: Validation #1 (Static)**

```bash
npm run lint
npm run test:run
```

**Step 2: Validation #2 (Build)**

```bash
npm run build
```

**Step 3: Validation #3 (Runtime Manual Matrix)**

Start app and validate:
```bash
npm run dev
```

Manual matrix:
- `/login`: `dark -> light -> dim -> dark`
- `/signup`: `dark -> light -> dim -> dark`
- rapid toggles (no mixed surfaces)
- route swaps between login/signup while theme changes
- keyboard focus visibility in all themes

Expected:
- no theme desync
- no visual redesign side-effects
- no console errors

**Step 4: Final commit**

```bash
git add .
git commit -m "refactor(auth-theme): stabilize login/signup theme system with token-driven shared architecture"
```

---

## Task 13: GitHub Push + Vercel Deploy

**Step 1: Push branch**

```bash
git push origin <branch-name>
```

**Step 2: Open/Update PR**

Include:
- issue registry resolved
- screenshots for all 3 themes on login/signup
- test/build output snippets

**Step 3: Deploy to Vercel (preview first, then production)**

```bash
vercel --prod
```

or preview:

```bash
vercel
```

**Step 4: Post-deploy verification**

Check deployed `/login` and `/signup`:
- theme toggle consistency
- no hydration warnings
- no console/runtime errors

---

## Execution Notes

- Keep visual change minimal and corrective only.
- Do not touch unrelated routes unless required for shared theme primitives.
- If runtime tooling (`npm`, `npx`) is unavailable in environment, pause and restore toolchain before execution.

