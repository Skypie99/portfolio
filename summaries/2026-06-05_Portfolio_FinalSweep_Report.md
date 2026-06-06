# Portfolio Final Sweep — Light-World Reveal + Whole-Site Polish

**Site:** skypistudio.com · **Branch:** `polish/portfolio-final-sweep-2026-06-05` (off `main` @ `74bd7e3`)
**Date:** 2026-06-05 · **Status:** ✅ complete, build/typecheck/179 tests/static-integrity all green · **Not merged** (main is Sky's gate)
**Scope:** 18 files, +207 / −70 — refinement, not redesign. Intro provably untouched. AA held in both modes with margin.

This was the thorough final sweep: **Part 1** revealed the light-mode world (gentler than dark, AA-protected), then **Part 2** polished the whole site section by section on that finished state, then a second fresh-eyes pass.

---

## ◆ DECISIONS FOR SKY (read first)

### 1. Light reveal amount + measured AA ratios (the headline call)
I revealed the light world by the **gentlest mechanism that clears AA with margin**, and measured live rather than guessing. Posture chosen: **conservative** — warm but barely-darker-than-day, panels firmed slightly on the meta-heavy sections.

**What changed (light `:root` only — dark untouched):**
- **Mechanism:** generalized the dark body-transparent reveal to both themes via `body.bg-canvas { background-color: transparent }` (specificity 0-1-1, beats the Tailwind `.bg-canvas` utility). `html` keeps its cream fallback so there's no flash.
- **Sky retune:** the light "evening" end went from a **cool twilight-blue** to a **warm golden-evening**, high-luminance, low-travel (the `-4` band behind text barely moves across scroll). So light reads as *day → warmer golden*, not *day → night*.
- **Surface alphas (firmed for margin):** cream `.59→.62`, footer/certs/process `.79→.82`, showcase `.77→.80`, contact `.62→.66`.

**Measured worst-case AA — LIGHT** (over every scroll position dn ∈ {0,.25,.5,.75,1} × every behind-text band; the warmest/most-revealed point is included):

| Surface (where) | muted-meta (11px) | body-muted | body-ink |
|---|---|---|---|
| cream — hero/work/about/404 | **4.69** ✓ | 6.63 | 11.49 |
| warm-white — footer/certs/process | **4.65** ✓ | 6.56 | 11.37 |
| cool wash — showcase | **4.67** ✓ | 6.59 | 11.43 |
| cool-pale — contact panel | *muted-only, 5.61* ✓ | 5.61 | 9.73 |

All normal text clears the **4.5:1** AA floor **with margin**. The contact panel is **muted-only by design** (it carries 0 small meta labels — verified by DOM audit; even pre-reveal its meta would've been 4.48, which is *why* it was built muted-only). The reveal's cost vs the old opaque-cream baseline is small (−0.33 to −0.62) and every meta surface still lands above 4.5. **No text anywhere sits over the bare world** — the sidebar is opaque, cards add their own opacity, and the one bare section (404) was given a surface (see below).

**DARK is byte-identical** — I changed **zero** dark tokens. The reveal rule produces the identical computed value dark already had (`body` was already transparent in dark). Measured dark AA is unchanged from production.

### 2. Writing section name → **"Notes"** *(you chose this)*
Unified the three names (Blog / Writing / Dispatches) to **Notes** everywhere: page title + OG, eyebrow ("Notes — N entries"), the H1, the case-study/post breadcrumb, and the sidebar + mobile nav. Test updated in lockstep.

### 3. Homepage email → **obfuscated** *(you chose this)* — extended site-wide for consistency
The raw `skylerhalisky@gmail.com` was sitting in the static HTML on the homepage **and** the about page **and** all five case-study CTAs. Leaving five of six leaking would defeat the homepage fix, so I obfuscated **all** of them via the bot-safe `ContactEmail` pattern (assembles the address at runtime). **Verified: 0 raw addresses in any `out/*.html`.** Humans still see "Email skylerhalisky@gmail.com" and a working mailto after the page hydrates. I also upgraded the no-JS fallback from a dead `#` to `/contact/` so the scripting:none floor isn't regressed. *Flag: this changed contact behavior on 6 pages — if you'd rather keep the address visible-and-raw somewhere, say so and I'll revert that page.*

### 4. Missing real screenshots — **asset gap, your call** *(flag only — not fabricated)*
Two case studies (**Claude Corp**, **Prompt Library**) have no real hero screenshot, so the cinematic reveal landed on an empty placeholder. I did **not** fabricate screenshots. Instead I turned the placeholder into a **designed empty state**: the device frame now carries a quiet "Interface preview" caption so it reads as a deliberate product cover, not a missing image. **When you have real screenshots, drop them into `content/deliverables.json` (`heroShot`) and they replace the placeholder with zero layout shift.**

### 5. Pre-existing finding (not changed) — OG images are SVG
The sub-pages' `openGraph.images` point at `/og-image.svg`. Most social platforms (Twitter/LinkedIn/Facebook) **don't render SVG OG images** — they want PNG/JPG. The homepage already uses the proper dynamic PNG (`opengraph-image.tsx`). This is pre-existing infra, out of scope for a visual sweep and risky to change untested, so I left it. **Recommend:** a follow-up to render the sub-page OG as PNG.

*(Never decided here, per the rails: touching the intro, merging to main, adding any paid service/dependency.)*

---

## ◆ BEFORE → AFTER (section by section)

### PART 1 — The light world
| | Before | After |
|---|---|---|
| **Light background** | Opaque cream — the fixed golden-hour world was fully hidden in light (only dark showed it). | The world shows **gently** through the translucent panels: a soft warm daylight that deepens to a **warm golden-evening** as you scroll. Airy, calm, bright. |
| **Evening hue** | (n/a — occluded) the latent light "night" stops were a **cool twilight blue**. | Retuned to **warm golden** (high-luminance, low-travel) so it never swings toward night and never threatens contrast. |
| **Contrast** | Cream-on-cream (no world). | Measured AA with margin on every surface (table above); panels firmed where meta-heavy. |
| **Dark** | Day→night arc (shipped last week). | **Unchanged, byte-identical.** |

### PART 2 — Whole-site polish

**Global (applied once, inherited everywhere)**
- **Ghost numerals** on work/case-study cards: were `15%` ink (~3.4:1, read like an accident) → **`30%` resting / `45%` hover**, a deliberate, just-visible editorial index. Flips correctly in dark (bone at 30%). Now `tabular-nums`.
- **Tabular numerals** added to the Method "01–03" steps and the Notes index numbers (the stat counters already had them) — figures now align.
- **Writing → "Notes"** unified across nav, title, eyebrow, H1, breadcrumb (+ test).
- **FilterPill** gained a tactile `:active` press (`scale 0.97`) for parity with the button language.

**Homepage**
- **Hero void:** the wide-screen right half read as accidental emptiness → closed with a **whisper-quiet right-edge "spine"** (two hairlines converging on the brand terracotta dot, lg+, decorative) that anchors the negative space and rhymes with the eyebrow rule + CTA dot. A mark, never a fill — it never competes with the revealed world.
- **Correspond:** raw email text + raw mailto → a warm reply-time line + the bot-safe `ContactEmail` (address out of the static HTML, still one-click for humans).
- Showcase/Work rhythm reviewed — already consistent (the showcase is an intentionally tighter strip); no churn.

**Work + case studies**
- **Designed empty state:** Claude Corp & Prompt Library hero placeholders now declare themselves ("Interface preview") so the cinematic reveal lands on an intentional cover.
- Card radii/dividers verified consistent (`glass-card rounded-[22px]` across home + index).
- About/case-study CTAs obfuscated (carry a per-project mailto subject).

**About / Certificates / Contact / 404**
- **About:** removed a stray empty `<p>` that added an accidental rhythm gap.
- **404:** it was the **only** section site-wide with no surface — with the light body now transparent its text would have sat on the bare world. Gave it `world-surface` (AA-protected, consistent with every other section).
- Contact already used the bot-safe pattern; the homepage now matches it.

**Detail layer**
- Verified: `::selection` (already on-brand, flips dark), favicon (`icon.svg` + `apple-icon.png`), the global terracotta focus ring, and that the Notes OG title now matches. Flagged the SVG-OG finding (#5).

---

## ◆ Confirmations
- ✅ **Intro untouched** — `git diff` touches no `cinematic`/`cdesert` files; all `globals.css` edits are at lines ~865–913 (world tokens + reveal rule), well above the locked ~1399 cinematic block. `--font-cormorant` / `--sidebar-w` unchanged.
- ✅ **Dark unchanged** — zero dark-token edits; reveal rule yields identical dark output; measured dark AA identical; the deep-night world still renders.
- ✅ **AA both modes** — measured live, with margin (table above). The contact panel is muted-only by design (0 small meta).
- ✅ **Locked floor intact** — type/color system, prefers-reduced-motion (world rests at golden via the `--day-night` fallback), scripting:none, B reveals, D transitions, A/C world + card spotlight all preserved.
- ✅ **Green** — lint, `tsc --noEmit`, 179 tests, full `build`, and `test:static` (static-integrity) all pass. No new dependencies.

**What the second sweep caught (and I fixed inline):** a Tailwind opacity bug (`/28` isn't a valid step → the ghost numeral was rendering opaque; fixed to `/30`); a Hero test collision from an earlier text-based spine (replaced with the geometric spine); the email still leaking on about + 5 case-study pages (obfuscated all); and the 404 sitting on the bare world (surfaced).

---

## ◆ How to review

```bash
git diff main..polish/portfolio-final-sweep-2026-06-05
git -C ~/Portfolio checkout polish/portfolio-final-sweep-2026-06-05
npm run dev   # localhost:3000
```

Checklist:
1. **Light mode, top → bottom:** the world is present but quiet — a soft warm daylight easing to a warm golden-evening. Text is **always crisp** (watch the small meta labels on the certificates + footer).
2. **Dark mode:** identical to before — the dramatic deep-night arc, nothing shifted.
3. **Both modes on mobile** (≤375px): the Notes page, a case study, the homepage.
4. **Keyboard / screen reader:** tab order, visible terracotta focus ring, the work filter pills (now with a press state), the case-study controls.
5. **Reduced motion on:** the world holds static at golden (no scroll arc); nothing animates.
6. **The polish, section by section:** ghost numerals now deliberate; hero right-edge spine; "Notes" everywhere; the Claude Corp / Prompt Library "Interface preview" covers; the contact button shows the address but the page source doesn't.

**Stop point:** light world revealed + AA-safe with margin, dark untouched, every section polished, second sweep clean, build green. Branch left clean; intro untouched; not merged.
