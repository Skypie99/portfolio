# Shamus Wave2 — ProjectCard Image Upgrade

**Date:** 2026-05-25
**Branch:** ui/auto-2026-05-25-shamus-card-upgrade
**Files changed:** components/ProjectCard.tsx, components/__tests__/ProjectCard.test.tsx

---

## What Changed in ProjectCard

### 1. next/Image replaces bare <img>

The previous `<img>` (with an `eslint-disable-next-line @next/next/no-img-element` suppression) was replaced with Next.js `<Image>`. The project already has `images: { unoptimized: true }` in `next.config.mjs` for the static GH Pages export, so next/Image generates a standard `<img>` tag with no optimization API dependency. The same `width`/`height` props are passed explicitly, so the CLS guarantee (Alex F-C4-3) is unchanged.

### 2. Hover-scale wrapper

The `group-hover:scale-[1.02]` and `group-focus-visible:scale-[1.02]` transition classes moved from the `<img>` to a wrapping `<span className="absolute inset-0">`. This ensures the scale animation fires whether the real image file exists or the gradient fallback is showing — both states animate identically on card hover/focus.

### 3. Gradient fallback

The image container background changed from `bg-blush` to `bg-gradient-to-br from-blush to-peach-cream`. This gradient is always present behind the `<Image>`. When the image file exists (once SVG heroes land from the assets branch), the image renders on top. When it doesn't exist yet, the gradient placeholder shows through.

The fallback overlay (`aria-hidden="true"`) now includes:
- Terracotta dot + role eyebrow (DM Mono, uppercase)
- **First-letter initial** in large Cormorant (4rem, terracotta/30 opacity) — gives each card a distinct visual identity
- Full title in smaller Cormorant (1.5rem)

### 4. Terracotta left-border accent

The `<a>` card wrapper now carries `border-l-4 border-l-terracotta` alongside the existing `border border-stone`. This works because:
- `border-l-4` is in the `border-w-l` tailwind-merge group (distinct from `border` which is `border-w`)
- `border-l-terracotta` is a side-specific color class (distinct from `border-stone` which is all-sides)
- Both survive tailwind-merge without conflict (verified with npx tsx test)

Visual result: 4px terracotta left edge, 1px stone on the other three sides.

### 5. Smaller warm tech pills

`<TagPill>` calls in the tech stack now pass `className="px-2 py-0.5 text-[10px]"` to tighten the default `px-3 py-1 text-meta` padding. Gap between pills narrowed from `gap-2` to `gap-1.5`. The warm sand/umber/DM Mono style from TagPill's base is preserved — just smaller.

### 6. Card title already uses font-serif

The `<h3>` was already `font-serif` — no change needed.

---

## How Image Fallback Works

1. next/Image renders an `<img>` with `src={d.heroImage.src}` (e.g. `/images/deliverables/accessmap/hero.svg`).
2. The `<img>` is positioned `absolute inset-0 w-full h-full object-cover` inside the scaling `<span>`.
3. If the file doesn't exist at that path, the browser shows nothing for the `<img>` element.
4. The container `<div>` has `bg-gradient-to-br from-blush to-peach-cream` — this gradient shows through from behind.
5. The `aria-hidden` overlay (initial + role + title) renders on top of the gradient, below the `<img>` z-order.
6. Once the SVG file lands (from the parallel `assets/auto-2026-05-25-project-images` branch), the image renders on top of the gradient automatically — no code change needed.

---

## Typecheck Result

```
npm run typecheck
> tsc --noEmit
(exit 0 — no errors)
```

---

## Test Results

```
npm test
Test Files  10 passed (10)
Tests       42 passed (42)
```

All 42 tests pass. ProjectCard now has 9 tests (up from 6):
- 6 existing tests updated (hover-scale now asserts on wrapper span, not img directly)
- 2 new tests added: terracotta left-border accent, first-letter initial fallback

---

## Hard Rule Compliance

- Did NOT merge to main
- Did NOT touch any SVG files in public/images/deliverables/
- Typecheck: PASS
- Tests: 42/42 PASS
- No build or dev server run
