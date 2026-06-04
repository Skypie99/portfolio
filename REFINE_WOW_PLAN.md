# REFINE_WOW_PLAN — skypistudio.com (2026-06-04)

Phase-0 diagnosis for the WOW continuity pass. Goal: a real wow the moment a visitor scrolls in,
drawn **directly from the locked intro's language**, so the site reads as one cinematic piece —
without breaking the calm golden-hour brand or readability. The intro scene is OFF LIMITS (studied
read-only; verified byte-identical after the pass).

## The intro's wow vocabulary (READ-ONLY observation — never modified)
- **Scrub-weighted camera-push:** `scrub: 1.0` (~1s lag); planes `ease:'none'` (zoom tracks scroll 1:1);
  uniform 1.0→1.5 zoom + a cliff rising `yPercent 92→-2`; `transform-origin: 50% 70%`; `sine.inOut` dissolves.
- **Golden-hour grade that warms as you descend:** exposure ramp 0.30→1.0, amber→copper multiply,
  archival vignette, warm soft-light tint, film grain ~0.035. (No sun hotspot.)
- **The "moment" — the title carve-in:** `blur(10px)→0`, `y 7→0`, letter-spacing `0.12em→0.06em`,
  `power2.out`, against the fully-golden cliff, then holds.
- **The handoff (LOCKED):** `ContentReveal` maps `scrollY [300,420] → opacity 0→1, y 22→0`.

## Reference principles (tasteful cinematic-calm wow)
Restraint is the material. The handoff works when the hero **resolves into** content (light continuity),
not cuts. Depth = speed/intensity differential, not 3D. One ease everywhere; stagger by reading order;
arrive (scale/settle from 1.0, blur→sharp), never "load" (scale from <1). Avoid: cursor trails, heavy
WebGL, scroll-jacking/snap, text animating while unreadable, section-exit double-animations.
(Sources: Siena Film, First Frame, Joffrey Spitzer/Codrops, Noomo, GSAP+Lenis; NN/G; WCAG.)

## Honesty-gate verdict — PROCEED, focused, then stop
The site is already at a high bar. The one real gap is **continuity**: the desert's light/grade and the
signature carve-in go *silent* below the intro, so it reads as "a stunning intro on top of a very good
ordinary page." Closing that is the whole round. Scope confirmed by Sky: focused continuity wow + small
craft sweep; `/work/` refined in place (no scroll-linked depth — shipped cascade untouched).

## Diagnosis → BEFORE → AFTER (what shipped this round)
| # | Where | BEFORE | AFTER |
|---|---|---|---|
| SM1 | Intro→hero handoff (`hero-bg-drift`) | hero wash full-on from mount → sun "cuts away" | wash **blooms 0.5→1 on entry** → light resolves in (one piece); holds; exit drift preserved. RM/no-support → full wash |
| SM2 | Sections missing a warm wash (homepage Certificates; `/work/` + `/certificates/` headers; `/work/[slug]` gallery + more-work) | warm light dropped out room-to-room | `ParallaxWash` on every major section — "the sun is in every room" |
| SM3 | Featured work card (`CardField`) | same caustic alpha as grid → no focal hierarchy | `featured` → caustic 0.20→0.28: the lit focal plane |
| SM4 | Case-study body (one `<Reveal scene>`) | arrives as one undifferentiated fade | per-block reveal in reading order; H2s **carve in** (blur→sharp) — the intro's signature recurs |
| C1 | Process step dividers | plain `border-t border-stone/70` | `.rule-ember` warm gradient hairlines |
| C2 | About Principles/Currently body | default reveal | `variant="depth"` |
| C3 | Contact "Elsewhere" h2 | only non-ember section h2 | `.ember` (all section h2s now ember) |
| C4 | Showcase stat figures | inert on hover | subtle `group-hover` lean (compositor, origin-left) |
| C5 | `/work/[slug]` closing CTA | plain, neutral | `ambient-drift` "sun at rest" echo + `scene` reveal + ember h2 |

## Non-negotiables held
AA in both modes (washes decorative behind content; carve sharp at rest; ember large-text ≥3:1; new
motion adds no text-contrast risk). RM honored for every new motion (bloom/wash/carve/ambient/scale all
gated → static or instant-sharp). Transform/opacity/filter-only; no CLS. Keyboard/focus unchanged. No new
dependency. **Intro byte-identical** (protected-set fingerprint matched baseline; zero diff in
`components/cinematic/**` + `globals.css` 1071–2007 + shared surfaces).

## Already-strong, deliberately untouched
Glass cards (material/caustic/specular/prism), WorkFilterGrid cascade, HeroImageSettle/HeroTitleSettle,
SettleHeading, TactileMedia, MagneticButton, homepage Contact ambient-drift + About section, the
`page-enter` route transition.
