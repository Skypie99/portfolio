# Portfolio — UI/UX Polish (2026-06-03)

Branch `polish/portfolio-ui-2026-06-03` (off main `ff41556`). **Not merged.** The opening animation
and ALL existing motion were treated as LOCKED and left untouched (verified). Pure visual/UX craft.

---

## DECISIONS FOR SKY (read first)
1. **Branch only — not merged/deployed.** Review the diff; merge to view live (or `npm run dev`). I can
   merge live + reversible afterward if you say so (like last round).
2. **Motion lock honored literally.** This round changed NO motion. One consequence: I did **not** add
   `.link-draw` to the demo/GitHub links that lack it — that would be *adding* a hover animation. A small,
   deliberate link-style gap remains; say the word and I'll unify it (1-line motion add).
3. **Cards** (your calls): glass material + motion preserved exactly; refined only details (mobile height,
   tokenized prose size). **Imagery:** the work cards stay text-only; I set up the retina pipeline for the
   *detail-page* images (below).
4. **No new dependency** — `sharp` (already present via Next) generated the apple-icon and is ready for the
   case-study image conversion. No global smooth-scroll (would fight the intro's ScrollTrigger).
5. **Capacity note (honest):** this was a deep session. I delivered + verified a strong, clearly-perceptible
   **first pass** (below). Several lower-traffic / heavier items are scoped + ready for a follow-up pass
   (also below) — the build is green and the branch clean to continue from.
6. **Report saved to `qa-reports/`, not auto-emailed**; Cowork/Gmail prompt at the bottom.

---

## BEFORE → AFTER (what shipped this pass)
| Area | Before | After |
|---|---|---|
| **Dark mode depth** | canvas→panel only ~3% apart — panels read flat/"inverted" | new **`--rgb-surface-mid`** tier (light = cream, so light mode is **unchanged**; dark = `37 43 45`, a raised surface above the section). Process panel + Showcase cells now **lift** in dark; lighter dark border + lighter dark shadow on the panel. |
| **Type system** | ~18 arbitrary `text-[1.0625rem]` + loose measures | a formal **`text-prose`** token (same 17px, now systematic — zero visual change) across every page + Hero; About bio tightened to the **65ch `--measure`** for optimal reading length. No arbitrary body sizes left. |
| **Components** | FilterPill jiggled on activate (1px→2px border); ghost button had no disabled style | FilterPill active = **constant 1px border** (color/bg change) → **no layout shift**; **ghost disabled** state added (stays transparent). |
| **Colour** | a hardcoded `#FDE9D7` badge-well gradient that didn't flip | tokenized to `--rgb-*` (flips to a designed warm-dark well in dark). |
| **Cards** | wide card `min-h-[23rem]` dominated mobile | `min-h-[20rem] md:min-h-[23rem]` (glass + motion untouched; DOM/labels intact → tests green). |
| **Meta / detail** | no apple-icon, generic 404 title, no `colorScheme` | **`apple-icon.png`** (180×180, from `icon.svg`); **404** gets its own title/description; **`colorScheme: 'light dark'`** so browser chrome matches the theme. |
| **Responsive** | mobile-nav heading could crash at 320px | clamp `2–3.75rem` + leading `1.05` — long labels wrap cleanly. |
| **System doc** | — | **`UI_SYSTEM.md`** added as the visual single source of truth (type/spacing/colour/dark-ladder/radii/elevation/component spec). |

## Reduced-motion / dark / a11y / perf
- **Motion unchanged** → reduced-motion behaviour identical. Dark mode is now layered, not inverted; light
  mode is byte-identical where intended (surface-mid light = cream). AA preserved (no text colours changed).
  Home First Load JS **205 kB** (no change); no new dependency; build green.

## ⛔ Intro + motion — UNTOUCHED (verified)
`git diff --name-only main..HEAD` has **no** `components/cinematic/**`, `CinematicIntro.tsx`, or
`public/images/cinematic/**`. The only `app/globals.css` changes are three additive token hunks at lines
**58 / 189 / 301** — all far before the cinematic zone (966→EOF) and none touching a motion rule. The
14 motion systems + easing/duration tokens are byte-identical.

## Scoped for the next pass (ready, not yet done)
Prioritised, each bounded + low-risk; I stopped here on capacity, not on a blocker:
1. **Case-study image retina pipeline** — `sharp` script → AVIF/WebP/@2x + a `<picture>` `CaseStudyImage`
   for `/work/[slug]` hero + gallery (no CLS — they already reserve dimensions; this is format/retina).
2. **Render-time smart-punctuation** (curly quotes/apostrophes) in the markdown renderer (the body content
   already uses em-dashes; this is the finer quote layer, skipping code spans).
3. **Measure standardization** on the remaining prose blocks (blog/work body 720px → `measure-wide`).
4. **Dynamic `app/sitemap.ts`** (current `lastmod`) replacing the stale static XML.
5. **Focus-ring radius unification** into one utility; verify cert-badge legibility on the new warm-dark well.

---

## How to review
```
git diff main..polish/portfolio-ui-2026-06-03
```
Live (merge or `npm run dev`), in **light + dark, mobile + desktop, keyboard**: dark-mode panels (Process /
Showcase) now sit *above* the page as designed surfaces; body reading width is comfortable; filter pills
don't jiggle when clicked; the mobile nav doesn't crash on a narrow phone; **the motion feels exactly the
same**. Files changed: `app/globals.css`, `tailwind.config.ts`, `lib/cn.ts`, `UI_SYSTEM.md`,
`app/{page,layout,not-found}.tsx`, the route pages, `components/{Button,FilterPill,ProjectCard,
HamburgerNav,AnimatedCertGrid,Hero}.tsx`, `app/apple-icon.png`.

**Merge (reversible):** `git checkout main && git merge --no-ff polish/portfolio-ui-2026-06-03 && git push`
→ rollback `git revert -m 1 <merge> && git push`.

**Email it to yourself:** *Send an email to skylerhalisky@gmail.com, subject "Portfolio — UI Polish Report
(2026-06-03)", body = ~/Portfolio/qa-reports/2026-06-03_Portfolio_UI_Polish_Report.md*
