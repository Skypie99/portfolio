# Portfolio — "Show the Work, Cinematically" — build report

**Date:** 2026-06-04 · **Branch:** `feature/portfolio-show-work-2026-06-04`
(stacked on `polish/portfolio-wow-2026-06-04`, **not** merged to `main`)
**Build / typecheck / tests:** green · **Intro scene:** byte-identical (untouched)

The portfolio now **shows** every product. One reusable cinematic component —
`ProductReveal` — renders a genuinely beautiful golden-hour placeholder in every
work card and case study today, and accepts a real screenshot later via a
**one-line swap** with zero layout shift. Ghost Code already demonstrates the
real-image path (its game frame renders live).

---

## DECISIONS FOR SKY

1. **Email of this report.** Per the Constitution, only Morgan sends externally
   and only on direct invocation — so I did **not** auto-send. This report is
   saved here; an email-ready copy is at
   `summaries/2026-06-04_Portfolio_ShowWork_Email.txt`. Say the word (or `/morgan`)
   and it goes to skylerhalisky@gmail.com, or send it yourself.
2. **Base branch.** Built on `polish/portfolio-wow-2026-06-04` (HEAD), because
   this work builds on the WOW-continuity pass that isn't on `main` yet.
   Reversible; rebase onto `main` whenever you like.
3. **Data model.** `heroImage` stays required and unchanged; I **added** optional
   `heroShot` (real hero screenshot) and `shots[]` (2–3 in-body shots) to the
   schema. Absent/`.svg` `src` → placeholder; add a real `src` → real image. The
   four legacy `hero.svg` mockups are now **unused** (the new placeholder renders
   instead) — safe to delete anytime, harmless if left.
4. **Card treatment & device frames** — per your calls: **media band on top, card
   grows** (all inscription text stays on glass → AA preserved); **per-medium
   frames** (phone / window / plate).
5. **Placeholder a11y.** A placeholder is decorative — meaning comes from the
   adjacent real title/caption (I do **not** fake a screenshot description). A
   real image carries its `alt`. If you'd prefer an explicit screen-reader
   description on placeholders too, it's a one-line toggle.
6. **No new dependencies.** Reused GSAP-free site motion (`Reveal`, `useParallax`,
   CSS). If real screenshots later want AVIF/WebP, reuse the intro's existing
   `scripts/encode-planes.mjs` pattern — still no new dep.

**Nothing here is blocking.** All reversible; `main` stays your gate.

---

## BEFORE → AFTER

| Surface | Before | After |
|---|---|---|
| **AccessMap case-study hero** | Empty well: a flat SVG illustration with "AccessMap" text overlaid | A **phone resting in the golden-hour world** — notch, soft shadow, wordmark + role on screen; flips beautifully in dark mode |
| **All 5 case-study heroes** | Flat SVG / text overlay | Device-in-landscape per medium — **phone** (AccessMap, Mutual Mesh), **window/terminal** (Prompt Library, Claude Corp), **plate** (Ghost Code → shows its **real** game frame) |
| **In-body shots** | None | New "See it in motion" section — **2–3 filmic placeholder planes** per case study, each with a written caption, drop-in ready |
| **Work cards (homepage + /work/)** | Text-only glass panels | A **16:10 golden-hour media band** crowns each card; the glass inscription stays below (all text on glass) |
| **"More work" cards** | Text-only | Same media band, real-image-capable |

---

## What was built

**New:** `components/ProductReveal.tsx` (the component + `HeroProductReveal` /
`CardProductReveal` / `ShotProductReveal`), `components/DeviceFrame.tsx`
(pure-CSS phone/window/plate), `lib/signature.ts` (shared per-product hue + frame
map), `lib/media.ts` (real-vs-placeholder resolver), `components/__tests__/ProductReveal.test.tsx`.
**Modified:** `lib/schema.ts` (+`heroShot`, `shots[]`), `app/work/[slug]/page.tsx`
(hero + shots section + "More work" media), `components/ProjectCard.tsx` &
`CaseStudyCard.tsx` (media band), `components/WorkFilterGrid.tsx` (pass media),
`components/TactileMedia.tsx` (+`<picture>` AVIF/WebP path), `components/CardField.tsx`
(import shared signature), `content/deliverables.json` (seeded `shots` for all 5),
`app/globals.css` (`.pr-*` classes, outside the locked range), `UI_SYSTEM.md`,
`MOTION_SYSTEM.md`.

**Reveal spec (short):** placeholder = static golden-hour CSS world + per-medium
device frame + wordmark/UI hint (no `<img>`); real image = `<picture>` AVIF→WebP→`<img>`
in the SAME reserved frame; parallax via the existing `TactileMedia` layer; the
scroll/mount reveal is owned by the call site (`Reveal` / `HeroImageSettle`) so
nothing nests a second reveal. Full spec in `UI_SYSTEM.md` "Show the work,
cinematically" + `MOTION_SYSTEM.md` §12.

---

## One-line image swap (full guide: `SHOW_WORK_PLAN.md`)

In `content/deliverables.json`, per product:
- **Hero:** add `"heroShot": { "src": "/images/deliverables/<slug>/screen.png", "alt": "…" }`.
- **In-body shot:** add a `"src"` to a `shots[i]` entry (alt + caption already written).
- **Optional retina:** add `"avif"`/`"webp"` siblings (served first).
- `npm run build && npm test` validates the path + alt; push to `main` → live.

The screenshot lands in the **same** frame → **zero layout shift**. Ghost Code is
already "swapped" (real `hero.png`) — use it as the reference for how a real
screenshot looks.

---

## Floor held (verified)

- **Intro untouched:** `git diff` shows **0** changes under `components/cinematic/**`,
  `public/images/cinematic/**`, and **0** changed lines in the `app/globals.css`
  `.cdesert-*` range. Intro byte-identical.
- **A11y / AA:** no text sits over a real screenshot (card text on glass; hero
  title in its column); placeholder wordmark uses flipping ink tokens; `.pr-scrim`
  guards ≥4.5:1 for any future text-over-image. Keyboard/focus unchanged.
- **Reduced motion / no-JS:** placeholders are static CSS; `useParallax` no-ops;
  `Reveal`/`HeroImageSettle` fall back to final state. Verified by tests + design.
- **No CLS:** every slot has a fixed `aspect-[…]`; placeholder→real is content
  replacement in an already-sized box.
- **Perf:** transform/opacity only; `loading="lazy"` on below-fold media; one
  promoted parallax layer per well; no heavy dependency added.
- **Tests:** 164 pass + 1 todo; `token-parity` green; `static-integrity` green
  (build + every local `<img src>` resolves); new `ProductReveal` test green.

**Verified live (dev preview):** AccessMap hero (phone) — light, dark, mobile —
all premium; Ghost Code hero shows the **real** game frame in the plate; Claude
Corp shows the window frame (3 titlebar dots); 3 shots render per case study; 5
card bands render on `/work/`; **zero console errors**.

---

## How to review

```
git diff main..feature/portfolio-show-work-2026-06-04
```

**View live** (`npm run dev`):
- `/work/accessmap/` — the marquee fix: phone-in-golden-world hero (was empty).
- `/work/ghost-code/` — the **real-image** path (plate frame + live game shot).
- `/` and `/work/` — the 5 work cards with the golden-hour media band.
- Each `/work/<slug>/` — the "See it in motion" in-body shots.

**Check:** light **and** dark (sidebar toggle); desktop **and** mobile;
keyboard tab (focus rings intact); reduced-motion on (placeholders/reveals show
final state, no motion).

**Then drop in a real screenshot** per `SHOW_WORK_PLAN.md` — one line, no layout
shift.

---

## Suggested follow-ups (not done — your call)

- Capture real screenshots and swap them in (one line each).
- Optional: extend `scripts/validate-assets.mjs` to also gate `heroShot.src` /
  `shots[].src` existence (analogous to the badge check) so a typo'd path blocks
  the build early.
- Optional: delete the four now-unused `hero.svg` mockups.
