# Design Makeover — Golden-Hour Desert Palette + Dark Mode

**Date:** 2026-06-02
**Branch:** `dani/desert-palette-darkmode-2026-06-02` (off `main` @ df66396)
**Worktree:** `/tmp/portfolio-desert`
**Brief:** Sky's "skypistudio.com Visual Makeover" — warm terracotta/gold against cool
pine/lagoon/sage, "camera lands out of the intro animation," legible in light **and** dark.
**Decisions confirmed with Sky:** full makeover in one branch · follow-OS default · typography
open to refinement · `CinematicIntro.tsx` is the canonical intro to hand off from.

---

## Outcome

A finish/colour/atmosphere pass — **not** a teardown. The site already used a terracotta
desert palette with all colour centralised, so the re-tune was high-impact/low-risk. The
genuinely new capability is **dark mode**, added with a token architecture that flips the
whole site with **zero component class-rename**.

**Status: COMPLETE & VERIFIED.** Both modes render across the homepage and `/work` routes;
typecheck, the full test suite, and the static-export build all pass.

---

## What changed (4 commits)

1. `29ded24` **Token foundation + follow-OS dark mode**
   - `app/globals.css`: re-tuned the palette to the brief's 10 source hexes + 3 cliff
     accents. Mode-aware colours are stored as space-separated **`--rgb-*` triplets**
     (so Tailwind opacity modifiers like `border-line/70` keep working); `--color-*`
     convenience vars auto-follow. A single `html.dark { … }` block overrides **only the
     triplets**, so every existing Tailwind class (`bg-cream`, `text-charcoal`,
     `border-wa-teal-soft/40`, …) flips automatically.
   - `tailwind.config.ts`: `darkMode: 'class'`; semantic tokens (`canvas`, `surface`,
     `ink`, `ink-muted`, `line`, `accent`, `accent-ink`, `cool`, `cool-soft`, `gold-glow`,
     …) + raw "paint" hexes; legacy names re-pointed to roles.
   - `next-themes`: `ThemeProvider` (attribute=class, defaultTheme=system, enableSystem) in
     `app/layout.tsx`; a11y-complete `ThemeToggle` (sun/moon) mounted in `Sidebar` +
     `HamburgerNav`; `suppressHydrationWarning`; dropped the hardcoded `color-scheme:light`.
2. `8647524` **Hero glow + cinematic final-frame palette** (see Coordination below).
3. `b1c3f13` **Typography** — loaded Cormorant italic; set the "A Brief Account" pull-quote
   in real italic. Families otherwise preserved (calm/crafted per brief).

Total app surface touched directly: ~9 files. The remaining ~600 colour-class usages across
~12 files **did not need editing** — they inherit the flip through the var-backed tokens.

---

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm test` (Vitest) | ✅ 110 passed (the 4 static-integrity tests pass once `out/` exists) |
| `npm run build` (static export) | ✅ all routes prerendered, export OK |
| Light mode | ✅ body `#FAF8F1` / ink `#20302C`; verified hero, stats, work cards, about, footer |
| Dark mode | ✅ body `#15191A` / ink bone-cream; same sections + `/work/[slug]` |
| Follow-OS | ✅ flips both directions live; no flash; no console errors |
| Theme toggle | ✅ works from Sidebar + Hamburger; persists; a11y labels + focus ring |

### Contrast (WCAG 2.2 AA — both modes)
Light, measured on canvas `#FAF8F1`: ink `#20302C` ≈ 13:1 · ink-meta `#5A6B64` **5.3:1** ·
cool/pine link `#427A6F` **4.66:1** · warm link accent-ink `#A35636` **5.0:1** · terracotta
`#B96340` **4.0:1** (used only for ≥large text / CTAs / graphics — meets the 3:1 large/UI
bar). Neutrals carry body; accents carry chrome — no body copy in a mid-tone on light.
Dark uses lifted accents (terracotta `#CF7A4F`, lagoon `#6FBFC2`) on near-black — high
contrast by construction. **Note:** `line-strong` interactive border sits at ~3.0:1 in light
(meets the bar; could be deepened for margin if desired).

---

## Coordination — the intro animation (one open thread)

Per Sky's choice, `CinematicIntro.tsx`'s **final-frame (t=1.00) palette only** was shifted to
the new colours (sky → cool green-teal pale / warm sand horizon; lit rock `#B35F32 → #B96340`),
mirrored in `tokens-phase2.css`. Journey stops (t<1) and all motion are untouched.

**Important:** the live homepage still mounts **`CinematicDesert.tsx`** (GSAP), whose gradients
live in `globals.css .cin-*/.cdesert-*` and are an **actively-refined zone I deliberately did
NOT touch**. The hero side of the handoff (`.hero-wash`) is done and palette-correct. Whoever
owns the cinematic should either adopt these end-state values for the live intro, or commit
`8647524` can be dropped if it conflicts with in-flight animation work.

---

## Optional follow-ups (not blocking)
- Deepen `--rgb-line-strong` slightly for extra border-contrast margin.
- Cosmetic: rename legacy Tailwind tokens (`wa-teal-*`, `cream`, …) to the semantic names now
  that dark mode no longer depends on them.
- Bigger typography moves (weights/scale/typeface) — left for Sky to steer.

## How to review
`git -C /tmp/portfolio-desert log df66396..HEAD` · run `npm run dev` and toggle the OS theme
(or the in-app toggle). **Do not push/merge to `main`** — it auto-deploys; Sky merges.
