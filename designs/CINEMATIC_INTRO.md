# CINEMATIC_INTRO — IMAX Desert Descent

**Component:** `components/CinematicIntro.tsx` (in-place redesign)
**Branch:** `feat/auto-2026-06-01-cinematic-hero`
**Phase:** 5.5 (post-Peter perf-harden, pre-Shamus rewrite)
**Author:** Dani · 2026-06-01

This is the visual target. Shamus implements against it; the Design Compiler validates against it. No component code here — only specification, color science, motion language, and silhouette character. Every measurement is intentional.

---

## 1 · Reference image interpretation

**Image 1 — wide vista, the "from" frame.** Symmetrical American Southwest tableau. Left of dead-center: an eroded red butte with a stepped profile — flat caprock, vertical cliff face, slumping talus skirt. Right of dead-center: a longer, lower mesa with stratified sediment bands visible across its face. Floor of the frame: dead-center two-lane asphalt road receding to a single-point perspective vanishing point at the horizon. Right shoulder: telephone poles in rhythmic recession, spacing diminishing with depth. Foreground: low scrub and prickly-pear silhouettes along both road edges. Sky: gradated cobalt-to-pale-blue from top to horizon with a single dispersed cumulus formation high-right. **The SVG silhouettes must echo:** the LEFT butte's stepped caprock-to-cliff-to-skirt profile (three distinct vertical zones), the RIGHT mesa's long horizontal stratification (4–5 sediment bands), the road's perfect center-frame vanishing convergence, and the telephone-pole rhythm (~7 poles, geometric recession).

**Image 2 — close-up, the "to" frame.** Tight crop on a red-rock cliff face. Vertical fluting dominates — alternating wide and narrow ribbed columns running top to bottom, the result of millennia of differential erosion. A horizontal sediment break sits roughly 40% from the top, lighter umber above, deeper red-sienna below. Scree slope at the base, scattered talus blocks of varying scale. Narrow strip of pale sky clinging to the upper-right ridge, one small cumulus puff. The watermark "ADAMS, NEW YORK" places this in the Robert Adams / New Topographics tradition — dignified, unsentimental, mineral. **The SVG silhouettes must echo:** vertical fluting alternating wide and narrow bands (no two columns identical width), a horizontal sediment break ~40% from top with a clear tonal shift, irregular ridgeline against sky (NOT a flat top), and a scree base with 5–8 talus blocks of mixed scale.

**The arc.** Dawn over the wide vista resolves into a forward dolly along the road, mesas grow and slide past frame edges, the road and telephone poles drift off-screen as we approach, atmospheric haze pulls back, and we arrive at the close cliff face. Title card resolves as if carved into the lit sediment band. **One continuous camera move.** No cuts. No layer popping in or out — anything that reaches its final state stays, the camera moves past it.

**Color story** drawn directly from the references: deep umber and red-sienna in shadow, terracotta on sun-struck rock faces, dusty rose in atmospheric haze, cobalt-to-robin-blue in sky, cream cumulus. This is the existing portfolio palette: `terracotta #B35F32`, `umber #7F4323`, WA teal family `#1D5468 → #D4EDF2`, WA rose family `#7D4E5A → #F0E4E7`. Nothing invented — every grading hex sits inside the established brand language.

---

## 2 · Scroll length

**200vh wrapper.** On a 900px viewport that is 1800px of scroll — roughly 6.5 seconds at a comfortable trackpad cadence (≈280px/s), 8 seconds slower, 4 seconds on a fast scroll wheel.

**Why 200vh:** current Phase 5 intro runs 510px (≈0.5 viewport), which reads as a pre-roll transition rather than a sequence. IMAX cadence needs the eye time to inhabit the wide frame before the dolly engages, time to feel the depth shift mid-glide, and time to arrive at the rock face without a hard cut. 200vh is the smallest budget that lets the three-act structure breathe; 250vh starts to feel patience-testing on a portfolio (this is not a film, it's an intro).

**Why not viewport-relative px:** all `useTransform` ranges below are expressed as `t ∈ [0, 1]` (normalized scrollYProgress against the 200vh wrapper), not pixel ranges. This survives viewport-height changes — same cinematic on a 13" laptop and a 27" display.

---

## 3 · Three-act structure

| `t` range | Act | What the eye sees |
|---|---|---|
| **0.00 – 0.25** | **DAWN — wide vista hold** | Indigo-violet sky, last stars dim and dissolve, moon haloed top-center, distant mesa silhouettes umber-on-violet. Horizon glow begins as a thin warm seam. Road visible as a dark slot to vanishing point. The frame holds. Establishing scale before any motion begins. |
| **0.25 – 0.70** | **FORWARD DOLLY — color climb + depth resolve** | Sun crests behind the far mesa around t=0.30. Sky warms in a single continuous gradient interpolation — indigo → plum → rose → terracotta → daylight blue. Mesas grow at depth-proportional rates: far mesa scales 1.0→1.4, mid 1.0→2.0. Telephone poles and road accelerate (scale 1.0→3.5) and slide past frame edges, off-screen by t=0.75. Foreground flora (cacti) swing past camera and exit by t=0.55. Atmospheric haze clears as we approach — depth-haze opacity 0.5→0.0. |
| **0.70 – 1.00** | **ARRIVAL — rock face resolve + title carve** | The close cliff face SVG emerges from t=0.55 (initial scale 0.4, hidden behind atmospheric haze), scales 0.4→1.0 to fill the lower 65% of the frame by t=0.85. Vertical fluting and the horizontal sediment break resolve into clarity. Sky narrows to a sliver across the top. Title card resolves over the lit sediment band starting t=0.78, fully clear by t=0.92. **Title HOLDS** — does not fade out at the end of scroll (the current intro fades the title at scroll 510; this redesign does not). Hero text below picks up after the cinematic wrapper completes. |

**Easing.** One unified S-curve — `cubic-bezier(0.83, 0, 0.17, 1)` (quint S-curve) — drives the "camera depth" parameter. All other curves derive from depth: sky color interpolation, haze opacity, layer scale, parallax offset. The scene moves as one body, not eight independent animations. Cautious approach (slow first quarter), decisive mid-glide (fast middle half), long gentle touchdown (slow last quarter).

---

## 4 · Five keyframes (Compile Compiler targets)

These are the visual targets. The build engineer captures screenshots at each `t` and compares against this description.

### Keyframe A · t=0.00 — Wide pre-dawn

**Sky color top→mid→horizon:** `#0F1A2E` indigo → `#2A1F3A` plum → `#4A2540` violet dawn line. Last stars visible at 60–90% opacity scattered in upper third. Moon crescent at 8% from top, 50% from left, with `rgba(253,246,227,0.06)` halo.
**Sun:** below horizon, not visible.
**Mesas:** far mesa silhouette `#3A2018` deep shadow, fills lower third right and left of vanishing point. Mid mesa hidden. Near rock face hidden.
**Foreground:** road visible as dark slot center-frame, telephone poles barely resolved as thin verticals at scale 1.0. Cacti at frame edges, low-saturation umber.
**Just appeared:** nothing (this is the resting frame).
**Just disappeared:** nothing.
**Camera feel:** static, observational, wide. The audience inhabits the vista.

### Keyframe B · t=0.25 — Sun crests

**Sky color top→mid→horizon:** `#3E4A6F` blue dawn → `#8B5A6F` rose → `#D4885A` warm horizon. Stars fully dissolved (opacity 0 by t=0.20). Moon at ~40% opacity, halo expanding.
**Sun:** disc emerging behind the far mesa right of center, radial glow blooming at the horizon line.
**Mesas:** far mesa shifts `#3A2018 → #6B3826` umber. Mid mesa begins to appear (opacity 0→0.6), silhouette `#8B4530` red sienna. Near rock face still hidden.
**Foreground:** road perspective slightly amplified (camera began dollying at t=0.20). Telephone poles scale 1.4. Cacti at edges scaled 1.6, drifting outward.
**Just appeared:** sun disc, horizon glow, mid mesa silhouette.
**Just disappeared:** stars, moon haloed bloom.
**Camera feel:** ignition. The descent has begun but is still observational.

### Keyframe C · t=0.50 — Mid-dolly, color climb peaks

**Sky color top→mid→horizon:** `#5C7AA0` deepening daylight → `#B89878` warm haze → `#DAA070` rose-amber horizon. Moon dissolved.
**Sun:** above horizon, glow saturating the lower sky band. Sun disc scaled 1.1.
**Mesas:** far mesa `#8B4731` lit umber, scale 1.2. Mid mesa fully resolved at opacity 1.0, scale 1.5, color `#A04E2E`. Near rock face just emerging (opacity 0→0.4 over t=0.50–0.65), behind atmospheric haze 2.
**Foreground:** road and telephone poles scale 2.4, accelerating off-screen. Cacti just exiting frame (last visible at t=0.50, gone by t=0.55).
**Just appeared:** atmospheric depth haze 1 begins to clear (opacity 0.5→0.3).
**Just disappeared:** moon, last cacti exiting bottom-corners.
**Camera feel:** decisive mid-glide. The audience is moving. Depth is undeniable.

### Keyframe D · t=0.75 — Arrival begins

**Sky color top→mid→horizon:** `#7BA8C4` daylight blue → `#C9B89A` warm haze → `#E8D4B5` golden plain. Sky band narrowing as foreground rises.
**Sun:** high in sky, smaller in compositional weight as foreground dominates.
**Mesas:** far mesa scale 1.35 sliding upward off the top edge. Mid mesa scale 1.85 cropping off frame sides. Near rock face SVG resolved to opacity 1.0, scale 0.85, occupying lower 50% of frame. Vertical fluting and sediment band visible but not yet fully sharp.
**Foreground:** road gone (off-screen by t=0.75). Telephone poles gone. Cacti gone. The frame is becoming the rock face.
**Just appeared:** rock face vertical fluting paths resolving, sediment break visible as a horizontal tonal seam.
**Just disappeared:** road, telephone poles, all flora.
**Camera feel:** the cliff is now the subject. Sky is a sliver. The journey has a destination.

### Keyframe E · t=1.00 — Title carved into rock

**Sky color top→mid→horizon:** `#96C4D0` teal-soft → `#D4EDF2` teal-pale → `#F0E4E7` rose-pale. The sky stops are now the existing portfolio tokens — the cinematic settles into the Hero color world.
**Sun:** not visible (off-frame top, implied by lighting on rock face).
**Mesas:** far and mid mesas fully off-frame. Near rock face scale 1.0, filling the lower 65% of viewport, color top `#C97A52` distant warm fade above the sediment break, body `#B35F32` terracotta-token lit zone below sediment break with `#7F4323` umber-token shadow fluting between columns.
**Foreground:** rock face is the foreground. Scree blocks at the base resolved sharp.
**Title card:** resolved at opacity 1.0, resting over the lit sediment band of the rock face. Cormorant italic wordmark "SkyPi Studio" + thin terracotta rule + meta lines. Contrast: cream-white text (`#FAF9F5`) on terracotta lit zone (`#B35F32`) = **4.7:1**, passes WCAG 2.2 AA for large text. Title **holds** — does not fade. Hero CTA underneath becomes interactive on scroll past cinematic wrapper.
**Just appeared:** title card, scree base detail.
**Just disappeared:** nothing this beat (no fade-outs in the final frame).
**Camera feel:** arrival. Chapter open. The room is silent.

---

## 5 · 9-layer architecture (back to front)

| # | Plane | Element | Scale rate | Y-translate rate | Silhouette character notes |
|---|---|---|---|---|---|
| 1 | **Sky dome** | Single linear-gradient, RGB-interpolated stops on `t` | none | none | Color only. Three stops (top/mid/horizon) move through 5 named keyframes per the §4 table. NOT a stack of crossfading gradients — interpolation. |
| 2 | **Sun disc** | SVG circle + soft radial glow | 1.0 → 1.2 | -8% (rises) | Hidden t=[0, 0.18], crests horizon t=0.30, settles high t=0.70. Glow opacity peaks at the horizon-line moment then settles. |
| 3 | **Star field** | Sparse SVG `<circle>` elements (~40 max) | 1.0 → 2.5 | -2% | NOT box-shadow stars (Peter's perf finding — SVG circles only). Constellation lines stay (proven Phase 5 detail). Opacity 1→0 over t=[0, 0.20]. |
| 4 | **Far mesa silhouette** | Wide SVG path, eroded stratified profile with deeper notches in the upper third | 1.0 → 1.4 | +3% | Echoes image 1 LEFT butte. Stepped caprock at top, vertical cliff face mid, slumping talus skirt at base. Three distinct vertical zones, top zone narrower than middle. Color shifts `#3A2018` → `#6B3826` → `#9F5538` → `#C97A52` on `t`. |
| 5 | **Atmospheric haze 1** | Dusty rose linear-gradient overlay | 1.0 → 1.1 | 0 | Builds opacity 0→0.5 t=[0.15, 0.45], clears 0.5→0.0 t=[0.45, 0.85]. Sells the depth between far and mid mesa planes. |
| 6 | **Mid mesa silhouette** | Closer butte, longer horizontal profile, stratified sediment bands | 1.0 → 2.0 | +6% | Echoes image 1 RIGHT mesa. 4–5 horizontal sediment band fills at varying opacity (0.10–0.14), softening top-to-bottom. Color shifts `#8B4530` → `#A04E2E` → `#B35F32` (settles to terracotta token) on `t`. |
| 7 | **Road + telephone poles** | SVG receding lines + 7 rhythmic verticals with geometric recession | 1.0 → 3.5 | +18% | Road: two converging asphalt lines + center dashed yellow stripe meeting at vanishing point dead-center frame. Poles: 7 verticals along right shoulder, spacing diminishing 1.0× / 0.78× / 0.61× / 0.48× / 0.37× / 0.29× / 0.22× toward vanishing point. Slides off-screen by t=0.75 (we've driven past). |
| 8 | **Foreground rock face** | The destination — eroded cliff texture echoing image 2 | scales 0.4 → 1.0, off-frame to fill | 0 | **Vertical fluting alternating wide and narrow bands** (12–14 fluted columns total, no two identical width — ratios like 1.0 / 0.7 / 1.2 / 0.6 / 1.1 / 0.8 / 1.0 / 0.65 / 1.15 / 0.75 / 1.05 / 0.85 to read as natural erosion). **Horizontal sediment break at ~40% from top** with clear tonal shift — upper zone lighter umber `#C97A52`, lower zone terracotta-token `#B35F32` with `#7F4323` umber-token shadow fluting between columns. Irregular ridgeline against sky (3–5 jagged peak transitions, NOT flat top). Scree base with 5–8 talus blocks of mixed scale (small 4–6px, medium 8–12px, one large 18px). Hidden until t=0.55, fully resolved by t=0.85. |
| 9 | **Foreground flora** | Cacti silhouettes at frame edges | 1.0 → 4.0 | +25% | Two prickly-pear clusters lower-left and lower-right corners. Swing past the camera (scale + downward translate), off-screen by t=0.55. Echoes the foreground scrub in image 1. Color sage `#4A5828` and lighter `#6B7C3A`. |

**Why scale rather than 3D translate-Z:** Framer Motion + CSS `transform: scale` + `translate` stays on the GPU compositor. True Z-translate in a `perspective` container fights `will-change` on mobile and burns paint cost. Peter's Phase 5 audit confirmed scale + translate is the winning combo here. Keep it.

**Layer 8 is the keystone.** Current Phase 5 intro has no destination — it lands on a generic mesa silhouette and fades. The redesign introduces a separate close-up SVG cliff face that resolves over the third act with vertical-fluting paths and horizontal sediment-band fills. This is what makes the journey arrive somewhere specific (image 2) rather than just dissolving.

---

## 6 · Color grading curves

**Sky gradient stops** (top → mid → horizon), interpolated on `t`:

| `t` | Top | Mid | Horizon |
|---|---|---|---|
| 0.00 | `#0F1A2E` indigo | `#2A1F3A` plum | `#4A2540` violet dawn line |
| 0.30 | `#3E4A6F` blue dawn | `#8B5A6F` rose | `#D4885A` warm horizon |
| 0.60 | `#7BA8C4` daylight blue | `#C9B89A` warm haze | `#E8D4B5` golden plain |
| 1.00 | `#96C4D0` teal-soft (token) | `#D4EDF2` teal-pale (token) | `#F0E4E7` rose-pale (token) — settles into existing Hero cream wash |

**Land color**, interpolated on `t`:

| `t` | Far mesa | Mid mesa | Near rock face |
|---|---|---|---|
| 0.00 | `#3A2018` deep shadow | (hidden) | (hidden) |
| 0.40 | `#6B3826` umber | `#8B4530` red sienna | (emerging) |
| 0.70 | `#9F5538` lit terracotta | `#B35F32` terracotta (token) | `#7F4323` umber band shadow |
| 1.00 | `#C97A52` distant warm | `#D89572` warm haze | `#B35F32` terracotta sun-lit + `#7F4323` shadow fluting |

**All values RGB-interpolated, not crossfaded between gradient stacks.** Drive the sky as a single `linear-gradient` whose color stops are interpolated via three `useTransform` calls on RGB channels (one per stop). The current intro stacks `skyNightOp`, `skyDawnOp`, `skyGoldenOp` overlays — that's three composite layers paying paint cost. A single interpolated gradient is one layer. This is both a design directive (cleaner color science, no muddy crossfade midpoints) and a perf directive (one paint layer, not three).

**All grading hex values selected to pass WCAG 2.2 AA when title text overlays them** — the title appears at t=0.78+ and rests over the foreground rock face's lit zone. Cream-white text (`#FAF9F5`) on terracotta-token lit rock (`#B35F32`) = **4.7:1**. Validated in the compile gate before merge.

---

## 7 · Easing

**`cubic-bezier(0.83, 0, 0.17, 1)`** — quint S-curve.

- First quarter (`t` 0 → 0.25): slow ramp-up. Audience inhabits the wide frame.
- Middle half (`t` 0.25 → 0.75): aggressive acceleration through the mid-glide. The dolly feels decisive, not glacial.
- Last quarter (`t` 0.75 → 1.0): long gentle touchdown. Arrival at the rock face never has a "snap" — it settles.

**Why quint, not quart:** the current intro uses `easeInOutQuart` and it works, but quart is slightly under-curved for a 200vh budget — the middle feels too fast to absorb the depth change. Quint's deeper S gives the audience time to register what's happening in the mid-glide without ever feeling rushed. Subtle but load-bearing for the IMAX-cadence target.

**Single curve drives the entire scene.** Every other motion (scale rates, parallax offsets, color interpolation) is a derivative of this one `t`-curve. No independent easing per layer. This is what makes the scene feel like one continuous camera move instead of eight overlapping animations.

---

## 8 · Title card resolve

**Holds, does not fade.** Critical departure from the current Phase 5 intro: that version fades the title at scroll 510 (`titleLine1Op` ends at opacity 0). The redesign does not. Once resolved at t=0.92, the title stays at full opacity for the remainder of the cinematic wrapper.

**Position:** rests over the **near rock face's lit zone** (terracotta-token `#B35F32`) below the sediment break. Cream-white text (`#FAF9F5`) at this position passes 4.7:1 AA contrast.

**Resolve sequence (t=0.78 → 0.92):**
- t=0.78: Wordmark line 1 ("SkyPi Studio") opacity 0 → 0.12 (ghost presence)
- t=0.82: Wordmark fully resolved (opacity 1.0). Letter-spacing tightens from 0.12em → 0.04em.
- t=0.84: Ornamental rule scaleX 0 → 1.0 (draws from center). Opacity 0 → 0.35.
- t=0.86: Sub-line 1 ("Est. 2026") opacity 0 → 1.0.
- t=0.90: Sub-line 2 ("Okanagan Valley, British Columbia") opacity 0 → 1.0.
- t=0.92: Hold. All elements at full opacity. No exit animation.

**Why hold:** the cinematic is a chapter title card, not a transition. A chapter title that fades out before you finish reading it has a tone problem. The hold says: this is the studio name. Stop. Acknowledge. Then scroll past into the Hero proper.

---

## 9 · Reduced motion

`@media (prefers-reduced-motion: reduce)`:

- Skip the scroll-driven scene entirely (no `useScroll`/`useTransform` activations).
- Render a **static frame at t=0.85** — the arrival frame, title card already resolved over the rock face's lit zone.
- Hero CTA functions normally below.
- All layer animations, twinkle, dust-mote float, prompt breathing — disabled.

**Why t=0.85 not t=1.0:** at t=0.85 the rock face is fully resolved (the photo of arrival), the title card is at full opacity, and the sky still has a hint of warmth that connects visually to the Hero cream wash below. At t=1.0 the sky is fully cooled to the teal-token palette, which reads as "after the moment" rather than "the moment." For users who skip the motion, the arrival frame is the right still.

This is legally required for WCAG 2.2 AA (motion-induced vestibular disorder accommodation) and a brand-language alignment (Sky's audience explicitly includes the accessibility community).

---

## 10 · Out of scope

- **Hero text content** does not change. Eyebrow, heading, subhead, CTA all stay identical.
- **No Three.js, no GSAP, no Lenis.** Framer Motion 11 + SVG + CSS only.
- **No photographic assets.** Hand-authored SVG only. ~20KB total landscape art budget.
- **No deployment pipeline changes.** Static export to GH Pages on push to main, same as current.
- **No edits to existing design tokens.** Cinematic-scoped tokens are appended to `tokens-phase2.css` under a new section header; existing tokens are not touched.
- **No main branch changes.** Feature branch only. Sky merges.
- **No work / process / about / contact section edits.** Only `CinematicIntro.tsx`, `Hero.tsx` integration touch-ups (Shamus), and `tokens-phase2.css` token additions (this commit).

---

## 11 · Verification (Compile Compiler checklist)

Before Shamus marks DONE:

1. Screenshot at t=0, 0.25, 0.50, 0.75, 1.00. Visual diff against §4 keyframes.
2. WCAG title-on-rock-face contrast measurement at t=0.92. Target ≥ 4.5:1.
3. Reduced-motion preview: static frame matches §9 description.
4. Mobile viewport (375px) check: collapsed scroll budget per existing Phase 5 mobile fallback pattern — does not run the full 200vh sequence.
5. Performance: Chrome DevTools 4× CPU throttle, scroll the cinematic, every frame under 16.7ms. Star-field paint cost ≤ Phase 5 baseline.
6. Build size: `out/` delta less than 30KB gzipped.
7. Token integrity: no edits to existing tokens in `globals.css` or `tokens-phase2.css` outside the new appended section.
