# GSAP Animation System

Single source of truth for all animations in the AEROFREN website.

## Quick Start

```tsx
import { gsap, useGSAP, DURATION, EASE, STAGGER } from "@/lib/gsap";
```

Plugins are **auto-registered at import time** - no setup needed.

---

## Design Tokens Reference

### Radius Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Tags, chips |
| `--radius-md` | 10px | Buttons, inputs |
| `--radius-lg` | 14px | Cards, modals |
| `--radius-xl` | 20px | Hero panels |

### Typography Scale
| Class | Size | Weight |
|-------|------|--------|
| `.text-display` | 56px | 800 |
| `h1` | 40px | 700 |
| `h2` | 32px | 700 |
| `h3` | 24px | 600 |
| `h4` | 20px | 600 |

---

## Standard Pattern

### 1. Add refs and data attributes
```tsx
const sectionRef = useRef<HTMLDivElement>(null);

return (
  <section ref={sectionRef}>
    <h2 data-anim="section-title">Title</h2>
    <div data-anim="section-content">Content</div>
  </section>
);
```

### 2. Use the useGSAP hook with scope
```tsx
useGSAP(() => {
  gsap.fromTo(
    "[data-anim='section-title']",
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: DURATION.normal }
  );
}, { scope: sectionRef });
```

---

## Copy/Paste Examples

### Reveal Up (fade + translate)
```tsx
gsap.fromTo(
  "[data-anim='element']",
  { opacity: 0, y: 40 },
  { 
    opacity: 1, 
    y: 0, 
    duration: DURATION.normal, 
    ease: EASE.smooth 
  }
);
```

### Stagger List
```tsx
gsap.fromTo(
  "[data-anim='list-item']",
  { opacity: 0, y: 20 },
  { 
    opacity: 1, 
    y: 0, 
    duration: DURATION.normal,
    stagger: STAGGER.normal, // 0.1s
    ease: EASE.smooth 
  }
);
```

### Scroll-Triggered Reveal
```tsx
gsap.fromTo(
  "[data-anim='card']",
  { opacity: 0, y: 40 },
  {
    opacity: 1,
    y: 0,
    duration: DURATION.normal,
    scrollTrigger: {
      trigger: "[data-anim='card']",
      start: "top 85%",
      toggleActions: "play none none none",
    },
  }
);
```

### Parallax Layer
```tsx
gsap.fromTo(
  "[data-anim='parallax-image']",
  { y: -50 },
  {
    y: 50,
    ease: "none",
    scrollTrigger: {
      trigger: containerRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: 1, // Smooth scroll-linked
    },
  }
);
```

### Hover Micro-interaction
```tsx
useGSAP(() => {
  const cards = gsap.utils.toArray<HTMLElement>("[data-anim='card']");
  
  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { y: -4, duration: DURATION.fast });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { y: 0, duration: DURATION.fast });
    });
  });
}, { scope: containerRef });
```

### Count-Up Numbers
```tsx
const obj = { value: 0 };
gsap.to(obj, {
  value: 10000,
  duration: DURATION.xslow,
  ease: EASE.smooth,
  scrollTrigger: { trigger: element, start: "top 90%" },
  onUpdate: () => {
    element.textContent = Math.round(obj.value).toLocaleString("el-GR");
  },
});
```

---

## Constants

| Constant | Values |
|----------|--------|
| `DURATION.fast` | 0.4s |
| `DURATION.normal` | 0.6s |
| `DURATION.slow` | 0.8s |
| `DURATION.xslow` | 1.2s |
| `EASE.smooth` | power3.out |
| `EASE.emphasis` | power4.out |
| `EASE.bounce` | back.out(1.4) |
| `STAGGER.fast` | 0.06s |
| `STAGGER.normal` | 0.1s |
| `STAGGER.slow` | 0.15s |

---

## Conventions

### Naming
- Use `data-anim="descriptive-name"` attributes
- Names should describe the element, not the animation
- Examples: `hero-title`, `stat-item`, `card`, `footer-brand`

### When to use ScrollTrigger
- Section reveals (start: "top 80–85%")
- Parallax effects (scrub: true)
- Count-up animations
- **Don't use for:** Initial hero entrance (use timeline instead)

### Performance Rules
1. **Only animate transforms and opacity** (GPU-accelerated)
2. **Never animate:** width, height, top, left, margin, padding
3. **Batch ScrollTriggers** where possible
4. **Use scope** in useGSAP for automatic cleanup

---

## ScrollTrigger Lifecycle

### Route Changes
ScrollTrigger cleanup is handled automatically by useGSAP when component unmounts.

### Manual Refresh
If you dynamically add content that changes layout:
```tsx
import { ScrollTrigger } from "@/lib/gsap";

// After content changes
ScrollTrigger.refresh();
```

### Resize Handling
ScrollTrigger handles window resize automatically. For custom responsive logic:
```tsx
ScrollTrigger.matchMedia({
  "(max-width: 768px)": function() {
    // Mobile-specific animations
  },
  "(min-width: 769px)": function() {
    // Desktop-specific animations
  },
});
```

---

## Accessibility

Reduced motion is automatically respected:
```tsx
// In client.ts
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.globalTimeline.timeScale(0);
}
```

When `prefers-reduced-motion: reduce` is enabled, all animations are disabled.

---

## Available Plugins

| Plugin | Purpose |
|--------|---------|
| ScrollTrigger | Scroll-based animations |
| ScrollToPlugin | Smooth scroll to sections |
| Flip | Layout transitions |
| Observer | Gesture detection |

---

## Files

- `client.ts` - Plugin registration, defaults, accessibility
- `presets.ts` - Reusable animation utilities
- `index.ts` - Clean re-exports
