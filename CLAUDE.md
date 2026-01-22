# AEROFREN Project Instructions

> These instructions apply to Claude Code when working in this repository.
> **Always read this file at the start of a session.**

---

## Project Context

**AEROFREN** - Premium B2B e-commerce platform for industrial pneumatics.

| Stack | Version |
|-------|---------|
| Next.js | 16.1.1 (App Router) |
| React | 19.2.3 |
| TypeScript | Strict mode |
| Tailwind CSS | 4.x |
| GSAP | 3.14.2 (11 premium plugins) |
| Firebase | Auth + Firestore |

**Full technical reference:** `ARCHITECTURE.md` (same directory)

---

## Critical Files - Confirm Before Modifying

| File | Risk Level | Notes |
|------|------------|-------|
| `src/components/NexusHero.tsx` | HIGH | Three.js shader, 6 ball groups, performance-critical |
| `src/components/ScrollFrameAnimation.tsx` | HIGH | 118 frames, scroll-linked |
| `src/app/globals.css` | HIGH | Design system (614 lines) |
| `src/lib/gsap/client.ts` | MEDIUM | 11 registered plugins, custom eases |
| `src/data/categories.ts` | MEDIUM | 120k+ products, bilingual |

---

## NexusHero Quick Reference

### Ball Layout (DO NOT change positions without asking)
```
TOP-LEFT (0.08, 0.92)      + small (0.25, 0.72)
                [Moving spheres + cursor ball in center]
BOTTOM-LEFT (0.08, 0.08)   + small (0.28, 0.25)
BOTTOM-RIGHT (0.92, 0.08)  + small (0.72, 0.25)
```

### Key Uniforms
- `uFixedTopLeftRadius`, `uFixedBottomRightRadius`, `uFixedBottomLeftRadius` - Big balls
- `uSmallTopLeftRadius`, `uSmallBottomRightRadius`, `uSmallBottomLeftRadius` - Small balls
- `uSphereCount` - Moving spheres (6 desktop, 4 mobile)
- `uCursorRadius` - Cursor-following ball

### Performance Rules for NexusHero
- **NO** `getBoundingClientRect()` in animation loops - cache it
- **NO** `new Vector3/Vector2()` in loops - reuse refs
- **YES** Visibility observer to pause when off-screen
- **YES** `powerPreference: 'high-performance'` for WebGL

---

## GSAP Configuration

### Registered Plugins (src/lib/gsap/client.ts)
```
ScrollTrigger, ScrollToPlugin, ScrollSmoother, SplitText,
ScrambleTextPlugin, CustomEase, CustomBounce, Draggable,
InertiaPlugin, Observer, MotionPathPlugin
```

### Custom Eases
- `hydraulic` - Industrial pneumatic feel
- `gauge` - Pressure gauge settling

### Animation Presets (src/lib/gsap/presets.ts)
Always use existing presets before creating new animations.

---

## Theme System

| Theme | Background | Accent | Cursor Glow |
|-------|------------|--------|-------------|
| Dark | `#06101f` | `#00bae2` | Cyan |
| Light | `#f0f4f8` | `#0066cc` | Blue |
| Dim | `#152433` | `#ff48a9` | Pink/Purple |

---

## Behavior Rules

### 1. Read Before Write
- Check `ARCHITECTURE.md` before major changes
- Scan existing patterns in the codebase
- Don't introduce new dependencies without clear benefit

### 2. No Guessing
- If unsure, say "not confirmed" and ask
- Don't invent file paths, env vars, or endpoints
- Don't assume ball counts or positions - verify in code

### 3. Production Quality
- No `any` types unless justified
- Include error handling
- Validate inputs at boundaries
- Cache expensive operations (getBoundingClientRect, etc.)

### 4. Performance First
- Always check for animation loop allocations
- Use refs for values updated every frame
- Add visibility observers for off-screen components
- Test on both powerful and weak devices conceptually

### 5. Verification
- Provide exact commands to run
- Include expected output
- Browser check for UI changes

---

## Output Format (Non-trivial Tasks)

```markdown
## Goal
[1-2 line summary]

## Plan
1. Step one
2. Step two

## Tradeoffs
- **Decision**: What we're doing
- **Alternatives**: What we considered
- **Risks**: Potential issues

## Implementation
[Code changes]

## Verification
[Commands to run]
```

---

## Directory Structure

```
aerofren-next/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (main)/       # Main layout group
│   │   ├── globals.css   # Design system
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── catalog/      # Product catalog components
│   │   ├── ui/           # UI primitives
│   │   ├── NexusHero.tsx # Three.js hero (CRITICAL)
│   │   └── ...
│   ├── lib/              # Utilities
│   │   ├── gsap/         # GSAP config & presets
│   │   └── utils.ts      # Helper functions
│   └── data/             # Product catalog, types
├── public/
│   ├── frames/           # 118 WebP animation frames
│   ├── images/           # Static images
│   └── bg/               # Background assets
├── ARCHITECTURE.md       # Full technical docs
└── CLAUDE.md             # This file
```

---

## Common Commands

```bash
# Development
npm run dev

# Build (always run after major changes)
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Quick Prompt Templates for User

### Bug Fix
```
Fix [issue] in [file path]. Don't change: [constraints]. Expected: [behavior].
```

### Feature Add
```
Add [feature] to [component]. Follow patterns in [reference file].
```

### Deep Analysis
```
ULTRATHINK: Review [file] for [performance/security/patterns]. List issues, don't fix yet.
```

### Safe Refactor
```
Refactor [component] for [goal]. Keep: [what to preserve]. Change: [what to improve].
```

---

## Performance Checklist (Before Any Animation Code)

- [ ] No `getBoundingClientRect()` in animation loops
- [ ] No `new Object/Array/Vector` in animation loops
- [ ] Visibility observer for off-screen pause
- [ ] `powerPreference: 'high-performance'` for WebGL
- [ ] Cached values updated only on resize
- [ ] Refs used for frame-by-frame values (not state)
- [ ] Passive event listeners where possible

---

## Security Checklist

- [ ] Input validation (zod)
- [ ] No secrets in code/logs
- [ ] Auth checks on protected routes
- [ ] CSRF for mutations

---

## Don't Do

- ❌ Change NexusHero ball positions without confirmation
- ❌ Add new WebGL contexts without performance review
- ❌ Placeholder code without "MVP" label
- ❌ Skip verification section
- ❌ Ignore existing patterns
- ❌ `any` without justification
- ❌ `getBoundingClientRect()` in animation loops
- ❌ Create new objects in render/animation loops

---

## Session Start Checklist (For Claude)

1. ✅ Read this CLAUDE.md
2. ✅ Note which critical files might be involved
3. ✅ Check ARCHITECTURE.md if touching major systems
4. ✅ Use TodoWrite for multi-step tasks
5. ✅ Verify with build command after changes
