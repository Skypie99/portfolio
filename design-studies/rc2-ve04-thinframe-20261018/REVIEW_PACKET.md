# RC2-VE04-COMP-01 · Review packet

**Flagstone VE04 arrival edge versus the D-CON-003 A three-window proof row**
Owner authorization 2026-10-18 · one Cloud session · NON-PRODUCTION DESIGN STUDY

| | |
|---|---|
| Source baseline | `a5854a5b78cf8a3499b9753c101cd4a37d76d288` (branch `claude/cloud-rc2-ve04-designstudy-20261018` was created at this commit) |
| What changed in the repository | Only new files under `design-studies/rc2-ve04-thinframe-20261018/`. No production file, test, route, dependency or workflow was modified. |
| Prototype | `index.html` (open from a checkout; media are referenced in place from `public/showcase/flagstone/`) |
| Evidence | `captures/` (renders, pixel readings, traces) · `EVIDENCE_MATRIX.md` (what was observed, what is pending) |
| Statuses | DESIGN_STUDY_COMPLETE · MOTION_VERIFICATION_PENDING · ACCESSIBILITY_REVIEW_PENDING · OWNER_VERDICT_PENDING |

The historical concept file `concepts/D-CON-003/A.html` is **not present** in this repository. The row was built from the brief's specification (three windows of about 340 × 400, left edges at x = 312 / 676 / 1040 at 1440, numbered mono labels, 1 px frames, a thin warm caption rule, a sans caption, one provenance line) and from the real content in `content/deliverables.json`. No concept screenshot was available or consulted.

The live site could not be reached from the Cloud environment (no HTTP response through the proxy), so the baseline section is a **reconstruction built from source**, labelled as such everywhere it appears. It is not a render of skypistudio.com.

---

## 1. The baseline, verified from source

Files read at the baseline: `components/ProofArrival.tsx`, `components/ThemedMotion.tsx`, `components/ProductReveal.tsx`, `app/work/[slug]/page.tsx`, `app/globals.css`, `content/deliverables.json`, `components/__tests__/ProofArrival.test.tsx`, plus `UI_SYSTEM.md`, `MOTION_SYSTEM.md`, `lib/signature.ts`, `lib/showcase.ts`, `components/Reveal.tsx`, `lib/motion.ts`, `tailwind.config.ts`, `app/fonts.ts`, `content/showcase.manifest.json`.

**Where VE04 lives.** `CaseProof` (page.tsx, lines 228–311) renders the Flagstone shots as a `grid-cols-1 lg:grid-cols-2 gap-12` list inside the 60ch article column (≈652 px at lg). Only `d.id === 'flagstone' && i === 0` is wrapped in `<ProofArrival>` and carries `.proof-arrival-edge` on the `ShotProductReveal` root (`rounded-lg border border-border-decorative aspect-[7/8]`); its generic `<Reveal>` entrance is skipped. Shots 2 and 3 keep the shared Reveal entrance (fade and 16 px rise, staggered 80 ms). At lg the third proof sits alone on a second row.

**What the edge is.** Border colour only. Rest = settled: `rgb(accent / 0.7)` light, `rgb(accent / 0.4)` dark (`globals.css` 1410–1417). The armed neutral (`--color-border-decorative`) exists only under `html.js`; `settling` transitions `border-color` over `--dur-transition` (420 ms) on `--ease-out`, `--dur-base` (280 ms) at ≤ 767 px; `settled` has no transition. `html.reveal-failsafe` and `prefers-reduced-motion: reduce` force the settled edge with `!important`. Theme change retargets the live transition rather than restarting it.

**Lifecycle (ProofArrival.tsx, pinned by its test).** Consumed at trigger (sessionStorage key `w4-06-proof-arrival.v1`), never at animation end; hash arrival, Back/Forward, reload, repeat visit, unavailable storage or navigation-type detection, and proof-already-in-view (restored scroll) all settle instantly with consume latched; IntersectionObserver threshold 0.2 is the one trigger; scroll-away mid-settle finishes to rest and stays consumed; a 900 ms safety timer flips the state to settled; reduced motion settles at arrival; the disabled instance renders children with zero wrapper. The test suite covers each of these clauses. **None of this was reimplemented or touched.**

**The first proof's media.** The clip (`report-flow-current.dark.phone`, mp4 + webm, AVIF poster) is a dark-mono capture, so `ProductReveal` routes it through `ThemedMotion` inside the exhibit mat (`.ts-matte` / `.ts-matte-well` 88 % × 84 %); the Play/Pause overlay is a 44 px pill at `bottom-3 right-3` of the plate (`border-line`, `bg-surface/0.72`, `text-ink-meta`, blur). Shots 2 and 3 are `precropped` stills, cover-fitted at their `focal` values over the `.pr-world` placeholder paint.

**Two baseline facts the brief should know about.**
1. **Production autoplays this clip.** `ThemedMotion` defaults `autoplay = true` and `ProductReveal` passes `media.video?.autoplay !== false`; the Flagstone shot has no `autoplay` field, so the clip starts (muted, looping) when it intersects, pauses off-screen, never under reduced motion, and a user pause is sticky. "Still-first" in the shipped code means poster-first with IO-gated autoplay, not "nothing moves until Play". The study renders the window still-first by brief; the production candidate needs an explicit decision (one field, `autoplay: false`, would make the shipped behaviour match the brief).
2. **The three "current" captures are not in the capture manifest.** `report-flow-current`, `report-current.phone` and `community-current.phone` entered the repository in commit `a531953` (2026-09-07) outside the showcase factory; `shots[]` carries no `capturedDate` or `commit` for them, so the figcaption's provenance span never renders today. The study's provenance line therefore cites the git fact (added 2026-09-07, a531953), not a capture date.

---

## 2. The three-window row as built

Built in the site's own values (tokens, radii, durations, easing and the focus rule transcribed from `globals.css` into the prototype) with the real media and the published captions.

| Element | Value used | Source / reason |
|---|---|---|
| Row | 3 × 340 px, 24 px gaps, 1068 px, left-aligned to the content column | Measured in the render: left edges 312 / 676 / 1040 at 1440 and 540 / 904 / 1268 at 1920 (the content column is 280 px rail + 32 px gutter, so the brief's historical x positions fall out of the site's own grid) |
| Window | 340 × 400 (`aspect-ratio: 17 / 20`), 1 px `line` border, **8 px radius** (`--radius-md`), `background-clip: padding-box` | Thin-frame grammar; the shipped plate's 16 px radius with a 1 px line reads as a card at 340 px wide. A tunable (see §10) |
| Label | DM Mono 12 px / 0.125em / uppercase / `ink-meta`: `01 — Reporting flow, in motion.` `02 — Report a barrier.` `03 — Community review.` | Brief §5 subjects; set in the site's label register |
| Caption | DM Sans 300 14 px / 1.6 / `ink-muted`, text-wrap pretty, verbatim from `deliverables.json` | Same register as the shipped figcaption |
| Caption rule | 1 px `rgb(accent-ink / 0.35)` | Brief §5 "thin warm caption rule around 0.35"; `accent-ink` ties it to the "Inside the build" kicker and keeps `accent` reserved for VE04 |
| Provenance | DM Mono 11 px uppercase `ink-meta`: `Current Flagstone build · captures added 2026-09-07 (a531953) · captions as published` | Verified git fact; the manifest holds no record for these captures |
| Window 01 | The clip set into a 20 px exhibit mat (`surface` + the Flagstone signature tint at 0.10, well edge `ink / 0.12`, 6 px radius); Play/Pause at the well's bottom-right, 12 px in | Keeps the Cook-Out rule that a dark-mono capture is matted, not dropped raw onto the light page; the pill stays ≥ 34 px from the VE04 edge. A full-bleed option is built (`?mat=bleed`) and captured |
| Windows 02, 03 | Stills cover-fitted at their published `focal` values | Identical media relationships to production |
| Heading | `Inside the build` kicker and `See it in motion.` above the row | Unchanged from production so the three treatments are matched |
| Phones (< 1024 px) | Single column, frames `min(100 %, 340 px)`, 40 px row gap, order label → media → caption, provenance last | Brief §9; 1024–1279 px renders the row fluid (three columns of ≥ 210 px) and is outside the required viewports |
| Entrance motion | Rows render settled; no Reveal entrance on 02/03 | Isolates the one variable (the first window's edge). The production candidate decides whether 02/03 keep their staggered Reveal |

---

## 3. Variant A · keep VE04

The row above with the shipped VE04 treatment on window 01, exactly: rest `accent / 0.70` light and `accent / 0.40` dark, one arrival beat (border colour only, 420 / 280 ms, `--ease-out`), the lifecycle contract unchanged. Windows 02 and 03 rest on the neutral `line`.

Measured rest line (DSF 2 pixel reading, equal to the token arithmetic): light `rgb(203 140 111)`, 2.40:1 against the case-body surface, ΔE2000 **27.3** from the neutral line; dark `rgb(103 65 45)`, 1.90:1, ΔE **23.4**. In light the first frame is unambiguously the warm one; in dark it is a quiet warm line against a cool-grey neutral.

**The hierarchy it creates.** Three equal frames, one of them lit. Because the row is already a thin-frame grammar (no plates, no world paint, no shadow), the only difference between the windows is that single line's colour, so the 0.70 edge does not read as a heavier card; it reads as the frame that was touched. The caption rules (ΔE 12.9 from the A edge in light) stay clearly subordinate.

## 4. Variant B · fold into frame grammar

The same row; window 01 keeps the one-time beat but settles to a quieter line: `accent / 0.42` light (the brief's ceiling) and `accent / 0.30` dark. Same weight, radius and focus ring. The dark value is the alpha that gives roughly the same perceptual step from the neutral line as the light value (0.28 is the exact parity value, ΔE 19.7 vs 19.1; 0.30 was kept as the rounder number, ΔE 20.3; the two are indistinguishable).

Measured rest line: light `rgb(220 179 156)`, 1.65:1, ΔE **19.1** from neutral; dark `rgb(86 56 39)`, 1.60:1, ΔE **20.3**.

**What the evidence says about B.**
- In light, B's rest line sits **ΔE 4.2 from the caption rules** (`rgb(206 179 160)`) that run under all three windows. The first frame and the three rules read as one warm family; the "first proof" cue dilutes into general warmth. The rendered boards show this directly (`captures/composites/AvsB_light_1440.jpg`, `edge-specimen_light.png`).
- In dark, B is **ΔE 4.5 from A**: the shipped dark edge is already at 0.40, so B changes almost nothing a viewer would notice while still requiring the contract's colour values to change.
- The beat's colour travel shrinks by about 30 % in light (ΔE 27 → 19). The prototype trace confirms the transition itself is identical in timing (final value reached at the same sample in both; see §6); only the destination is quieter. Whether the quieter beat is still perceived as an arrival was **not** tested on a human and cannot be claimed from a static image.
- Option B2 (`?opt=warm-rule`, captured): the 01 caption rule adopts the rest-line colour so frame and rule form a pair. It extends VE04's colour to a second element, which is a contract change, and it does not restore separation from windows 02/03; it was built to be seen, not recommended.

## 5. Variant C · retire

Not implemented, by instruction. Retiring VE04 would make all three windows identical at rest and remove the only arrival moment in the case study; the thin-frame row would then rely on order and the numbered labels alone for hierarchy. It is an explicit alternative that requires new owner authorization; nothing in this study supports or prepares it.

---

## 6. Evidence summary

Full tables: `captures/MEASUREMENTS.md` (instrument readings off the prototype), `captures/colour-maths.md` (token arithmetic with the CIEDE2000 self-check), `captures/manifest.json` (every record with coordinates). Surface in all readings is the `canvas-alt` token, an approximation of the live composited `world-surface-alt`.

| Measure | A light | B light | A dark | B dark | Baseline |
|---|---|---|---|---|---|
| Rest line (pixel) | rgb(203 140 111) | rgb(220 179 156) | rgb(103 65 45) | rgb(86 56 39) | = A |
| Rest line : surface | 2.40:1 | 1.65:1 | 1.90:1 | 1.60:1 | = A |
| ΔE2000 rest vs neutral line | 27.3 | 19.1 | 23.4 | 20.3 | = A |
| ΔE2000 rest vs caption rule | 12.9 | **4.2** | 7.6 | 8.8 | no rule |
| ΔE2000 A vs B | 11.0 | | **4.5** | | |
| Neutral line : surface | 1.36:1 | | 1.33:1 | | same |
| Focus ring : surface | 3.67:1 | | 5.26:1 | | same |
| Ring : clip beside the pill (pixel, focused) | 2.33:1 | 2.33:1 | 3.10:1 | 3.10:1 | 3.25:1 light · 4.32:1 dark |
| Play icon : pill (pixel) | 3.62:1 | 3.62:1 | 6.65:1 | 6.65:1 | 4.05:1 · 6.81:1 |
| Pill : clip (pixel) | 5.76:1 | 5.76:1 | **1.52:1** | **1.52:1** | 8.98:1 · **1.12:1** |
| Labels / provenance (ink-meta : surface) | 5.38:1 | | 7.43:1 | | same |
| Captions (ink-muted : surface) | 6.85:1 | | 9.17:1 | | same |

**Geometry.** Frames 340 × 400 at 312 / 676 / 1040 (1440) and 540 / 904 / 1268 (1920); 329 / 311 / 256 px wide when stacked at 393 / 375 / 320. No horizontal overflow at any required viewport in either theme (document `scrollWidth` = `innerWidth`; zero elements past either edge).

**Keyboard.** Two Tab presses reach the Play control (skip link, then Play); `:focus-visible` is true; the ring is the site rule (2 px `accent`, 2 px offset). Enter starts the real clip (webm source; `currentTime` 0.79–0.88 s after ~0.9 s) and Enter again pauses it, in all eight runs. The pill is 34 px from the frame edge with the mat (13 px full-bleed; 13 px in the baseline), so the ring never touches the settled edge in the mat treatment.

**Prototype beat (not the lifecycle).** Per-animation-frame computed border colour, triggered programmatically from the armed state: desktop runs reach their final value by about 320–350 ms (420 ms nominal, ease-out) and the phone run by about 210 ms (280 ms nominal); A and B differ only in destination. Screenshot frames are kept at ~0 / 100 / 200 / 300 / 420 / 600 / 800 ms (`captures/motion/`, strips in `composites/beat-strip_*`).

**Modes.** Reduced motion from first paint: settled, rest colour, `transition: none` (A, B, both themes). Reduced motion switched on mid-beat: the edge snaps to rest at once; switched off again: no replay (prototype CSS floor, mirrors the shipped rules). No JavaScript: no `html.js`, rest colour painted, native `<video controls>` present, no overlay button (both themes, dark via an injected class). `prefers-contrast: more`: the neutral line steps to `line-strong` as in production while the VE04 edge keeps its value (A: ΔE 26 from the strengthened line in light; B: ΔE 24.5).

**Fonts.** Cormorant Garamond 300, DM Sans 300 and DM Mono 400 loaded in every render (`document.fonts.status = loaded`).

---

## 7. Creative comparison

| Criterion | A · keep VE04 | B · fold into frame grammar |
|---|---|---|
| Visual hierarchy | One lit frame among three equals; the cue is unambiguous in light and quietly legible in dark | Light: the cue merges with the caption rules (ΔE 4). Dark: indistinguishable from A in practice |
| Editorial restraint | The row removes the plates, world paint and shadows; within it a 1 px line at 2.4:1 is restrained, not loud | Quieter by construction, but the restraint the row buys is the same in both; B's extra quiet comes at the cost of the cue |
| Relationship to the approved identity | The shipped value, the shipped contract, the terracotta the focus ring and kicker already use | A new alpha in the family that lands between the rule (0.35) and the ring; reads as a tint, not a decision |
| Media legibility | Identical | Identical |
| Frame consistency | Three identical frames; one differs in colour only | Same |
| Premium finish | "The frame that was touched"; intentional | Risks reading as an unintended warm cast on one frame in light |
| Motion perceptibility expectations | Full colour travel (ΔE 27 light); same timing as shipped | ~30 % less travel in light; a quieter beat on an already quiet treatment risks becoming unwitnessed motion, which the clockwork pass deliberately removed elsewhere |
| Mobile composition | Identical stacking; the edge reads at 329–256 px | Identical; the quieter line is fainter at phone size |
| Accessibility risks | Shared: dark pill boundary, ring over the clip in light (see §9) | Shared; the ring separates slightly better from a quieter edge (2.23:1 vs 1.53:1) but adjacency is already avoided by placement |
| Implementation complexity | Row only; VE04 CSS and tests untouched | Row plus eight colour edits across the rest / settling / failsafe / reduced-motion rules in both themes; no lifecycle test change |

## 8. Conditional recommendation

**Recommend Variant A: adopt the three-window thin-frame row and keep the shipped VE04 edge unchanged on window 01.**

Conditions:
1. Window 01 keeps an exhibit mat (20 px, surface + signature tint) rather than a raw full-bleed dark clip; the full-bleed option is captured for the owner's eye but puts the pill and its ring 13 px from the edge and drops a dark slab onto the light page.
2. The clip is still-first in production (`autoplay: false`) **or** the owner explicitly re-authorizes the shipped IO-gated autoplay; the study assumed still-first per brief and the shipped code does not.
3. The Play control's ring contrast over this clip is handled in the production candidate (§9), whichever placement the owner picks.
4. The owner views A in light at 1440 on a real display. If the 0.70 edge reads too strong beside 1 px neutral frames there, the next step is not B at 0.42 but an intermediate value tested against the rule (ΔE ≥ 8 from the caption rule and clearly above the neutral line), which would be a new, short study tick.

Why not B: in light its rest line is perceptually one step from the caption rules, so the first-proof cue dissolves; in dark it is within ΔE 4.5 of the shipped edge, so it changes the contract for no visible gain; and it spends a third of the beat's colour travel. The quieter number is not the better design here. Why not simply "because the animation exists": A was judged inside the new row, where the line is the only decorative mark left, and it holds up as a mark; the shipped value happens to be the right amount, which is evidence for it, not deference to it.

Decision status: **OWNER_VERDICT_PENDING**. This is a recommendation, not an adoption.

---

## 9. Accessibility review (observations, no conformance claim)

- **Play-control visibility at rest.** Light: the pill is clear over the dark clip (5.8:1 pill : clip, 3.6:1 icon : pill). Dark: the pill body is nearly invisible against the clip (1.5:1 in A/B, 1.1:1 in the baseline position); the control is carried by its icon alone (6.7:1). This is a pre-existing condition of the shipped control over this capture, not something the row introduces. Record for the production candidate: a slightly lighter dark pill, or a hairline in `line-strong`, would give the pill a boundary.
- **Keyboard focus.** Reachable in two Tabs, `:focus-visible` matches, the ring is the site's 2 px terracotta at 2 px offset, and Enter operates the control. Measured ring against the clip beside the pill: 2.33:1 light with the inward placement (the baseline's placement over the clip's darker edge reads 3.25:1), 3.10:1 dark (baseline 4.32:1). The 3:1 non-text orientation line is therefore not met in light at the inward placement over this particular poster frame; the ring stays clearly perceptible by weight and hue, and never touches the settled edge (34 px away). A two-tone ring, or keeping the shipped placement over the mat corner, are the candidate repairs; this is the one recorded conflict between "visually integrated" and "ring contrast over the media".
- **Light-theme contrast.** Text on the surface: heading 11.9:1, captions 6.9:1, labels and provenance 5.4:1, kicker 6.1:1. Decorative lines sit between 1.36:1 (neutral) and 2.40:1 (A edge); they carry no information that text does not also carry.
- **Dark-theme contrast.** Text: heading 14.0:1, captions 9.2:1, labels 7.4:1, kicker 9.2:1. Lines 1.33–1.90:1.
- **Readable captions and provenance.** The 11 px provenance wraps to three or four lines at phone widths and stays legible; the 12 px label wraps to two lines at 320 px.
- **Mobile stacking.** Clean at 393 / 375 / 320, no overflow, order label → media → caption preserved per window, provenance last.
- **Reduced motion.** Settled edge from first paint; a mid-beat switch snaps to rest; switching back never replays (prototype; the shipped CSS carries the same floor).
- **No JS.** Settled edge, native controls, no overlay; the `armed` state never exists without `html.js`.
- **Still-first media.** Nothing autoplays in the prototype; production currently does (see §1).
- **Decorative versus functional lines.** The frame line, the VE04 edge and the caption rule are decorative; the ring and the pill border are functional. In A the edge (ΔE 27 from neutral) cannot be mistaken for a focus state because the ring is 2 px, offset, and encloses the pill; in B the edge moves toward the ring's territory in weight-to-colour terms but is still a 1 px perimeter line.
- **Assistive technology.** The ordered list, figure/figcaption pairs, the clip's `aria-label` and the Play/Pause names are in place in the prototype; no screen-reader run was performed. ACCESSIBILITY_REVIEW_PENDING.

## 10. Motion and reduced-motion constraints for a production candidate

- The lifecycle contract stays byte-identical: consume at trigger, the uncertain-arrival clauses, IO threshold 0.2, scroll-away finish, the 900 ms safety timer, the `html.js` arming and the failsafe floor. Only the host element moves (from a 7:8 plate to a 17:20 thin frame); `ProofArrival`'s "proof below the fold at mount" assumption should be re-checked once the row's vertical position in the Flagstone body is final.
- Durations stay on the ramp: `--dur-transition` desktop, `--dur-base` at ≤ 767 px, `--ease-out`; `duration-ramp.test.ts` keeps guarding it.
- Variant A changes no colour value. If the owner ever chooses an intermediate value, it must be changed in all four places the edge colour is declared (rest, settling, failsafe, reduced motion) in both themes.
- Window 01's Reveal stays skipped; whether 02/03 keep their staggered Reveal is an owner input (the concept asked for no unnecessary motion; the shipped page has it).
- The exhibit mat, the caption rule and the provenance line are static paint; nothing new animates.
- The whole lifecycle matrix (hash, Back/Forward, reload, bfcache, restored scroll, theme retarget, storage denied) belongs to engineering verification on the real component. MOTION_VERIFICATION_PENDING.

## 11. Work not attempted

- Variant C (retire) and any production implementation, route, test or content change.
- Verification of the VE04 lifecycle; the prototype beat is a transition only and claims nothing about the shipped lifecycle.
- A render of the live site (unreachable from the environment) or of the Tokyo-film commit that followed the baseline on `main`.
- Tablet widths (768–1279 px), landscape phones, and `forced-colors` mode.
- Screen-reader or switch-access runs; human perceptibility testing of either beat.
- Measured contrast against the live composited world backdrop (token surface used instead, stated throughout).
- The M-CON-003 B r2 mobile hero, RC-1 worktrees, SYN-T-014 and the homepage candidate were not read, touched or incorporated.
- Registration of this folder in `docs/INDEX.md` (would modify a file outside the study folder; left to the owner).

## 12. Exact inputs required for a later production candidate

1. Owner verdict: A, B, an intermediate value with its two alphas, or hold.
2. Window 01 treatment: mat (inset, tint, well edge, radius) or full-bleed.
3. Frame radius for the row (8 px used; the shipped plate uses 16 px).
4. Caption-rule colour and alpha (`accent-ink / 0.35` used) or a warm neutral.
5. Label copy for 01 / 02 / 03 and whether the em dash stays (the brief's wording was used).
6. Provenance copy, and whether `capturedDate` / `commit` are added to the three `shots[]` entries in `deliverables.json` so the existing figcaption span renders real provenance (a content change gated by the schema and the recruiter-copy guards).
7. Play/Pause placement: shipped rule (plate bottom-right, over the mat corner) or inward (well bottom-right), plus the ring-contrast repair.
8. Autoplay: `autoplay: false` for the clip (still-first) or the shipped IO-gated autoplay.
9. Reveal entrance for windows 02 / 03: keep or render settled.
10. Layout mechanics: `CaseProof` lives inside the 652 px article; the row needs 1068 px, so the proof block must escape the measure at lg+ while keeping the article's left edge, and the 1024–1279 px behaviour (fluid three-up or stacked) needs a decision.
11. Guards: a DOM-order test for label → media → caption, an axe pass on the new section, the unchanged `ProofArrival.test.tsx`, and a static-integrity run.
12. A device session: light A at 1440 and on a phone, reduced motion on device, and one assistive-technology pass.
