# Motion-Polish Pass — skypistudio.com (Dani, 2026-06-03)

**Branch:** `motion-polish/portfolio-2026-06-03` (4 commits, NOT merged — main is Sky's gate)
**Register decided with Sky:** *cinematic depth, calm* + *leave the hero untouched.*
**Spec:** [`MOTION_SYSTEM.md`](../MOTION_SYSTEM.md) (repo root) — single source of truth.

---

## What changed (perceptible on first scroll, never loud)

| Layer | Change |
|---|---|
| **Page transitions** | NEW `app/template.tsx` — every client navigation crossfades + rises in (420ms, `--ease-gh-glide`), replacing hard route cuts. **Homepage `/` and the initial cold load are exempt** so the cinematic opening + LCP are untouched. |
| **Scroll-parallax depth** | NEW `useParallax(depth)` (one shared rAF + one IO, `translate3d` only) + `<ParallaxWash>` golden-hour light layer. Applied to text-only sections: home *About*, about *How I work* (teal), work/[slug] body. |
| **Choreographed reveals** | `<Reveal>` gained `variant="scene"` (28px / 1.2s / golden settle) for section headers and `variant="depth"` (rise + scale-settle) for lists — all backward-compatible. |
| **Filled static gaps** | blog/[slug] prose (was zero-motion) + work/[slug] case-study body now scene-reveal; Footer rises in at page bottom. |
| **Tokens** | Golden-hour easings (`--ease-gh-glide/-settle`), scene durations (`--dur-transition/-scene`), stagger + parallax-depth tokens. Mirrored in `tailwind.config.ts`. |

---

## The ONE hard rule — honored

Protected intro is **byte-identical**. `git diff main --name-only` touches **zero** of:
`components/cinematic/**`, `CinematicIntro.tsx`, `cinematic-masters/**`, `Hero.tsx`,
`HeroSettle.tsx` (reused as-is, values unchanged), `ContentReveal.tsx`,
`tokens-phase2.css`. All new `globals.css` rules sit at lines ~259–670 — the
cinematic/`cdesert` block (799→EOF) is untouched. Homepage `/` gets **no** entrance
transition; `pageEnterOnHome: 0` verified live.

---

## Verification

**Rails (all green):** `npm run typecheck` · `npm test` (160 pass, incl. token-parity 39) · `npm run lint` · `npm run build` (static export, all routes). Home First Load JS **unchanged at 206 kB**.

**Live (preview, port 3220):**
- Tokens resolve: `--ease-gh-glide`, `--ease-gh-settle`, `--dur-transition`=420ms, `--dur-scene`=1200ms, parallax tiers. ✓
- Scene-variant CSS resolves: forced-shown `.reveal-scene` computes `1.2s` + `cubic-bezier(0.22,0.9,0.26,1)`. ✓
- Page transition: client nav → `.page-enter` present; homepage `/` exempt. ✓
- Homepage About section: `relative overflow-hidden` + wash + content `z-10`, heading not clipped. ✓
- Light + dark render cleanly (no regression); dark canvas + lifted terracotta + teal accents legible. ✓
- No console errors. ✓

**Known headless limitation (not a bug):** a vanilla IntersectionObserver does **not**
fire on programmatic `scrollTo` in the preview env (confirmed with a probe). So
reveal-on-scroll and parallax-on-scroll read as "not fired" in headless — a false
negative. Both gate on the same shipped IO the live site already uses successfully;
they animate normally in a real browser.

**Reduced motion:** every pattern has a fallback — variant CSS placed *before* the
`prefers-reduced-motion` block (so it wins), `.page-enter` gated to `no-preference`,
`useParallax` early-returns with no transform. (RM emulation isn't available in the
preview tool; verified by code structure, consistent with the Alex-validated patterns.)

---

## DECISIONS FOR SKY

1. **Page transitions** are the most noticeable change — a calm crossfade on every
   navigation between pages (the homepage landing is never affected). Please confirm
   the feel in the live branch.
2. **Hero / opening: untouched** (your call). All motion starts below the hero.
3. **No new dependency** (framer-motion + gsap were already installed).
4. **Approval before merge:** nothing ships to skypistudio.com from this branch —
   review the preview and merge yourself. Recommend a quick real-browser pass to see
   the scroll-reveals + parallax (headless can't show them).
