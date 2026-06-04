# UI System — skypistudio.com (visual single source of truth)

Companion to `MOTION_SYSTEM.md` (motion is LOCKED — reference only, never alter). Studio-grade
visual rules. All values are tokens in `app/globals.css :root` / `html.dark` + `tailwind.config.ts`.
The cinematic intro (globals.css 966→EOF, `--font-cormorant`, `--sidebar-w`) is locked.

## Type scale (modular, 1.25)
`--fs-step-1 … 5` (1.25 → 3.05rem), `--fs-display` (clamp 2.75–4.25rem), `--fs-hero` (clamp 3–5.5rem),
`text-body` 1rem, `text-body-sm` .875rem, `text-label` .75rem, `text-meta` .6875rem.
- **No arbitrary `text-[…]` sizes.** Body copy = `text-body` (or `text-step-1` for a lead). Headings use
  the step/display/hero tiers. Fonts: serif Cormorant (display), DM Sans (body), DM Mono (labels/meta).
- **Line-height:** tighter as size grows (`--lh-tight 1.1` display, `--lh-snug 1.2` sub-head, `1.65` body).
- **Tracking:** negative on large serif (`--ls-hero -0.025em`, `--ls-display -0.02em`); positive on
  caps/labels (`tracking-label .125em`). Use Tailwind `tracking-*`, not inline `style`.
- **Measure:** body prose = `max-w-measure` (**65ch**); long-form = `max-w-measure-wide` (**72ch**).
- **Micro-typo:** curly quotes `" "` + em/en dashes `— –` in content; `tabular-nums` on numerals;
  `text-balance` on headings, `text-pretty` on body; `font-optical-sizing: auto` (global).

## Spacing & grid
`--space-1…20`; sections `py-24 lg:py-32` (the standard rhythm); `px-gutter` (`--gutter` = 2rem);
content column `max-w-content` (1120px) centered; gutters never exceed the content frame.

## Color
Warm-tinted neutrals (never pure #000/#fff) via `--rgb-*` triplets that flip in `html.dark`:
ink / ink-muted / ink-meta (text, AA-tuned), canvas / canvas-alt (page), **surface / surface-mid /
surface-warm** (panels), accent (terracotta — restrained: CTAs, chrome, emphasis), cool (pine),
gold, line / line-strong (borders). Decorative one-offs must be `--rgb-*` triplets so they flip — no
raw hex in components.

## Dark mode (DESIGNED, not inverted)
- **Surface ladder:** canvas `21 25 26` < canvas-alt `26 31 32` < **surface-mid `37 43 45`** (raised
  panels) < surface `30 36 38`. Panels that should "lift" use `bg-surface-mid` (light value = cream, so
  light mode is unchanged; dark value lifts above the section).
- Accent luminance lifted in dark (`--rgb-accent 207 122 79`). Prefer **light hairline borders** over
  heavy shadows for elevation on dark surfaces. Full AA parity with light.

## Radii & elevation
`--radius-sm 4 / md 8 / lg 16 / pill 999`; cards `rounded-[22px]` (liquid-glass, approved). Shadows
`--shadow-sm/md/lg/xl` (warm-tinted light; lighter/contained in dark). One soft, layered ramp — no
harsh drop shadows.

## Components (one cohesive set; states complete)
- **Focus ring:** 2px terracotta, 2px offset, consistent across all interactive elements (`:focus-visible`).
- **Button:** primary + ghost; default/hover/active/**disabled** all defined; `h-14`, `rounded-pill`, ≥44px.
- **Pills (Filter/Tag):** constant 1px border (active = color/bg change, **never width** → no CLS).
- **Cards:** liquid-glass (locked material/motion); type/spacing consistent across featured + grid.
- **Links:** `.link-draw` underline-draw (a MOTION — do not add/remove this round); consistent text color.
- Touch targets ≥44px; hairline dividers consistent; pixel-aligned.

## Detail
Custom `::selection` (peach on ink, flips), thin warm scrollbar, terracotta focus ring, per-route
titles + descriptions, dynamic `app/sitemap.ts`, OG image (`opengraph-image.tsx`), `apple-icon`,
`colorScheme: 'light dark'`. No global `scroll-behavior: smooth` (would fight the intro's ScrollTrigger).
