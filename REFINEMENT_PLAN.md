# Refinement plan — high-end polish round (2026-06-03)

Branch `polish/portfolio-highend-2026-06-03`. Lift the flat sections + a richer site-wide
motion/continuity layer, on the existing token + motion system. **The cinematic intro is
LOCKED** (`components/cinematic/**`, `CinematicIntro.tsx`, `globals.css` 966–EOF, tokens
`--font-cormorant`/`--sidebar-w`, `public/images/cinematic/**`). No GSAP below the landing —
new motion is CSS + `lib/motion.ts`. No new dependency. Not merged (Sky's gate).

## System additions (this round)
- `lib/motion.ts`: **`useScrollProgress()`** (sets `--scroll-progress` 0→1 on `<html>`, shared
  rAF, RM→no-op) and **`useActiveSection(ids)`** (IO scroll-spy → active id, RM-safe).
- Reuse: `Reveal` (default/scene/**depth**), `ParallaxWash` (gold/teal × far/mid/near),
  `useParallax`, `CountUpStat`, `link-draw`, tokens (`--ease-gh-glide/settle/entrance`,
  `--dur-*`, `--stagger-step 80`, `--parallax-far .04/mid .08`, `--shadow-*`).

## Per-section before → after (visual + motion)
| Section | Before (flat) | After (refined + motion) | Reduced-motion |
|---|---|---|---|
| **Showcase** `#showcase` | plain stat cells, scene reveal only | bigger number hierarchy, refined hairlines/elevation; cells reveal **depth** + per-cell stagger; CountUp settle; **teal ParallaxWash** behind | wash static; reveals = final state; no settle |
| **Process** `#process` | numbered steps, default reveal | weightier numerals, refined dividers + panel elevation; **depth** stagger; faint parallax wash behind panel | wash static; reveals final |
| **About** `#about` | uniform paragraphs | lead para `fs-step-1`, refined pull-quote; quote reveals with accent grow-in (**depth**), body staggers; `link-draw` | accent at full; reveals final |
| **Certificates** `#certificates` | flat divided list | refined rows + per-row hover (bg/accent/arrow); **depth** stagger | reveals final; hover = instant (non-motion) |
| **Sidebar** | static rail | **scroll-progress hairline** (`useScrollProgress`, `scaleY`), spacing/type/divider polish, gentle load reveal | hairline hidden (scaleY 0); reveal final |
| **HamburgerNav** (mobile) | static toggle/menu | scroll-tint behind toggle; **active-section highlight** (`useActiveSection`) | tint static; highlight is state, not motion |
| **Footer** | plain 3-col | refined type/spacing, hairline dividers + faint top glow, refined `link-draw`; columns stagger | reveals final |
| **Global** | mixed reveals | layered parallax on more bgs (far/mid, restrained), consistent scene/depth choreography, `link-draw` everywhere, unified hover/focus/active/disabled | all parallax static; all reveals final |

## Non-negotiables (every change)
- **60fps:** transform/opacity only; reuse the shared rAF; no layout-thrash properties.
- **prefers-reduced-motion:** every new pattern has a static/final-state fallback (table above).
- **WCAG AA both modes:** no wash/glow drops text below AA; focus rings + skip link stay visible.
- **Tokens only** — no magic numbers; new values are decorative raw literals (parity-safe).
