# Portfolio — High-End Polish + Richer Motion (2026-06-03)

Branch `polish/portfolio-highend-2026-06-03` (off main `218f63c`). **Not merged** — main is
your gate. The cinematic opening animation was treated as LOCKED and **not touched**.

---

## DECISIONS FOR SKY (read first)

1. **Branch only — NOT merged or deployed.** Per the brief, main stays your gate. To see it
   live you merge the branch (one command, below) or run `npm run dev` locally. I did not
   deploy a preview (no new external surface without your say-so).
2. **Scope = "push the motion further too"** (your pick): I lifted the flat sections + tightened
   cohesion **and** layered a richer, calm site-wide motion pass — and left the hero and the
   liquid-glass cards you just approved **as-is**.
3. **"Nav responds to scroll" interpreted** as a **scroll-progress hairline** on the fixed desktop
   sidebar (a fixed rail shouldn't hide/reveal). The mobile hamburger's active-section highlight
   is wired (`useActiveSection` exists) but not yet attached to the menu — flagged as a small
   follow-up. Tell me if you wanted the desktop rail to actually transform on scroll.
4. **Report saved to `qa-reports/`, NOT emailed.** I don't send mail on your behalf. A copy-paste
   prompt to email it to yourself is at the bottom.
5. **No new dependency.** All new motion is CSS + the existing `lib/motion.ts` hooks. **No GSAP
   below the landing.** No new `--ease-*/--shadow-*/--fs-*` tokens (so `token-parity` is untouched).
6. **Self-check note:** the local *dev* server is in a broken state and served pages without CSS
   to my headless captures, so I could not screenshot the running sections. The **production build
   compiles all CSS cleanly** (green), every class is a valid token, and the new motion reuses
   patterns already live on your site — so this is a dev-server artifact, not breakage. Motion is
   best judged live by scrolling anyway; the review checklist is below.

---

## BEFORE → AFTER (section by section)

| Section | Before | After (visual + motion) |
|---|---|---|
| **Hero** | refined (entrance stagger, scroll wash, dot pulse) | **unchanged** (left as approved) |
| **Showcase / stats** | flat 4-cell grid, single scene reveal | **teal golden-hour parallax wash** drifts behind for layered depth; each stat cell now **reveals with the depth variant** (scale-settles in, staggered per cell); roomier padding. The count-up numbers stay. |
| **Work cards** | liquid glass (just approved) | **unchanged** |
| **Process** | numbered steps, default reveal, soft shadow | **golden parallax wash behind the panel**; steps **reveal with depth** + stagger; **weightier step numerals** (19px → 24px mono umber, still AA); panel elevation `shadow-soft → shadow-lg` for a more defined, layered lift. |
| **About** | uniform paragraphs | **lead paragraph promoted** to the larger `--fs-step-1` in full ink for real hierarchy; pull-quote + body **reveal with depth**; existing golden wash kept. |
| **Certificates** | flat divided list | rows **reveal with depth**; content **slides right on row hover** (with the title→terracotta + arrow nudge already there) — the list now feels interactive, not static. |
| **Sidebar (desktop)** | static brand rail | a **reading-progress hairline** on the right edge fills with terracotta as you scroll the page (compositor-only `scaleY`); collapses to nothing under reduced motion. The rail finally *responds* to scroll. |
| **Footer** | clean but plain | a **faint warm hairline-glow** marks the footer threshold + more breathing room (pt-16 → pt-20). |
| **Contact** | ambient golden drift (signature) | **unchanged** |

**Net feel:** the page now reads as one continuous golden-hour camera move — section
backgrounds drift at the far parallax tier, content scale-settles in on the intro's easing, the
sidebar tracks your descent, and the flat sections carry the same craft as the hero and cards.

---

## Design + motion system (extended, not reinvented)

- Reused: the token system (type `--fs-step-*`, color `--rgb-*` flipping light/dark, `--shadow-*`,
  easings `--ease-gh-glide/settle/entrance`, durations, `--stagger-step`, `--parallax-far/mid/near`),
  and the primitives `Reveal` (now using its **depth** variant), `ParallaxWash`, `useParallax`,
  `CountUpStat`, `link-draw`.
- Added (`lib/motion.ts`, dependency-free, SSR/jsdom-safe): **`useScrollProgress()`** and
  **`useActiveSection(ids)`** — documented in `MOTION_SYSTEM.md` §9 and `REFINEMENT_PLAN.md`.
- New component: `components/SidebarProgress.tsx` (tiny client child; the sidebar stays a server
  component).

## Reduced motion (honored per pattern)
- Parallax washes → static glow (no drift). Depth reveals → final state, instant (content always
  in the DOM/a11y tree). Sidebar progress → `scaleY(0)`, invisible. Certificate hover → instant
  (it's a hover, not a scroll animation). All gated via `usePrefersReducedMotion` / CSS `@media`.

## Performance (what keeps it 60fps)
- Every new animation is **transform/opacity only**. Parallax reuses the **single shared rAF +
  one IntersectionObserver**. The sidebar progress is one CSS-var write per frame (no React
  re-render). **Home First Load JS: 205 kB** (was 206 — the progress child added ~nothing).
  No new dependency.

## Accessibility
- AA preserved both modes (ink tokens over the low-alpha washes stay well past 4.5:1). Skip link
  + terracotta focus rings intact. Decorative layers `aria-hidden`. Step-numeral enlargement keeps
  the umber (AA) colour.

## ⛔ Opening animation — UNTOUCHED (confirmed)
`git diff --name-only main..HEAD` contains **no** `components/cinematic/**`, `CinematicIntro.tsx`,
or `public/images/cinematic/**`; **`app/globals.css` is not in the diff at all** (so lines 966–EOF
and `--font-cormorant`/`--sidebar-w` are byte-identical). GSAP remains intro-only.

---

## How to review
```
git diff main..polish/portfolio-highend-2026-06-03
```
Then view live (after you merge, or via `npm run dev` locally) and check, **in light AND dark mode,
AND with reduced-motion on**:
- Scroll the homepage top-to-bottom — does it read as one continuous, calm golden-hour move?
- **Showcase**: cells settle in (staggered); teal wash drifts behind.
- **Process**: steps settle; bigger numerals; panel sits on a softer, deeper shadow.
- **About**: the lead line is visibly larger; the block settles in.
- **Certificates**: rows slide on hover.
- **Sidebar**: the terracotta progress hairline fills on the right edge as you scroll.
- **Footer**: the faint warm line at its top edge.
- **Reduced motion**: everything still legible + final-state; nothing moves; sidebar line gone.
- Confirm the **opening animation is identical**.

**Files changed:** `app/page.tsx`, `components/{Footer,NumberedStep,Sidebar,SidebarProgress}.tsx`,
`lib/motion.ts`, `MOTION_SYSTEM.md`, `REFINEMENT_PLAN.md`, this report.

**Merge when happy:** `git checkout main && git merge --no-ff polish/portfolio-highend-2026-06-03 && git push`
**Or discard the branch:** `git branch -D polish/portfolio-highend-2026-06-03`
