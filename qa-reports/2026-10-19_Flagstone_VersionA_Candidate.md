# Flagstone Version A candidate: three-panel proof row with a click-to-play clip (2026-10-19)

Owner authorization 2026-10-18 (Version A of design study RC2-VE04-COMP-01, plus the click-to-play decision). One Claude Code cloud session, no subagents. Production-intended implementation on an isolated candidate branch; **not** merged, published or deployed.

| | |
|---|---|
| Branch | `claude/cloud-flagstone-version-a-20261018` (created from `main`) |
| Source baseline | `0cda7c7831e19cc0ca900e2bc9a360fc95e7a214` (remote `main` at session start; verified, unchanged, not touched) |
| Design study read | `claude/cloud-rc2-ve04-designstudy-20261018` at `6ded06979d382e9e482637e402045bd5e9bd2077` (`design-studies/rc2-ve04-thinframe-20261018/`), fetched read-only; nothing from it was merged, cherry-picked or copied into this branch |
| Statuses | IMPLEMENTED · BUILD_PASS · RENDERED · ACCESSIBILITY_REVIEW_PENDING · OWNER_VISUAL_REVIEW_PENDING · INTEGRATION_PENDING · PUBLICATION_NOT_AUTHORIZED |
| Evidence | `flagstone-version-a-20261018/` (screenshots, `measurements.json`, `MEASUREMENTS.md`, the capture harness) |

The screenshots below are renders of **this branch's built Next.js output** (`npm run build`, served from `out/` over loopback, Chromium 141 from the pre-installed Playwright build). None of them is a design-study mockup. Pixel readings are medians over 24 samples at device scale 2; contrast is WCAG 2.x relative-luminance contrast. Every number quoted here is copied from `flagstone-version-a-20261018/MEASUREMENTS.md`, which `tools/capture.mjs` wrote from the same run.

---

## 1. What changed

| File | Change |
|---|---|
| `content/deliverables.json` | `"autoplay": false` on the Flagstone reporting-flow clip (`shots[0].video`). One line. No other shot, caption, alt, date or link changed. |
| `app/work/[slug]/page.tsx` | `CaseProof` renders the Flagstone proofs as an ordered three-window row (numbered mono label, 17:20 thin frame, thin warm caption rule, one provenance line) and marks the block as the bounded breakout; Flagstone's content column carries the breakout root class. Every other case study renders the previous markup. `CaseProof` is now exported for its test. The single `ShotProductReveal` call site and its `media={{ … }}` literal are unchanged (the `shot-matte-forwarding` / `shot-dark-forwarding` source guards still match). |
| `app/globals.css` | One new block after the VE04 rules, every selector scoped under `.proof-row` / `.proof-breakout*`: (1) the container-query width breakout, (2) window 01's 20px exhibit mat (6px radius, no shadow), (3) the Flagstone-scoped Play/Pause placement, dark-theme boundary and two-tone focus halo, (4) the fluid-band label alignment. The VE04 rules, the global `*:focus-visible` rule and the focus tokens are byte-identical. |
| `app/__tests__/flagstone-proof-row.test.tsx` | New, 18 tests (see §8). |
| `qa-reports/2026-10-19_Flagstone_VersionA_Candidate.md`, `qa-reports/flagstone-version-a-20261018/**`, `qa-reports/INDEX.md` | This receipt, the evidence, the regenerated index. |

**Untouched, by design:** `components/ProofArrival.tsx`, `components/ThemedMotion.tsx`, `components/ProductReveal.tsx`, `components/Reveal.tsx`, `components/__tests__/ProofArrival.test.tsx`, the homepage, the cinematic intro, navigation, project cards, the Flagstone microsite under `public/flagstone/`, `/tokyo-through-time/`, other deliverables' data, workflows, dependencies and the lockfile.

### Deviations from the brief, and why

1. **Label separator.** The brief's labels read `01 — Reporting flow, in motion.`; the rendered labels read `01 · Reporting flow, in motion.` `lib/__tests__/recruiter-copy-truth.test.ts` bans em dashes on every rendered route outside the legal/private allowlist (and the tests were not to be weakened), so the site's own middot separator is used. The study itself listed the em dash as an open owner input (§12 item 5).
2. **1024–1279px.** The content column is 680–935px wide there, so the three windows shrink fluidly (210.7 × 247.8 at 1024, 296 × 348 at 1280) instead of holding 340 × 400; captions wrap to three lines at 1024. At 1440 and 1920 the reference geometry is exact. Between 1024 and about 1207px the longest label wraps to two lines, so a scoped container rule reserves two label lines for all three windows in that band only, keeping the frames level (verified at 1024: label blocks 33.6 / 33.6 / 33.6px, frames at one y).
3. **Windows 02 and 03 keep the shared `Reveal` entrance** (the site-wide fade-and-rise, staggered 80ms), exactly as production has it; the study rendered them settled only to isolate its one variable. Removing an entrance was not an owner decision in this brief.
4. **Provenance wording.** `Current Flagstone build · captures in this repository since 2026-09-07 (a531953) · capture dates not recorded`. The date and SHA are the verified git addition (`git log --diff-filter=A` on the three "current" captures: commit `a531953`, 2026-09-07); the capture date is not established and the line says so rather than inventing one. The per-shot figcaption provenance span still renders nothing (no `capturedDate` was added to the data).

---

## 2. Three-panel desktop results

| Viewport | Theme | Window 01 · 02 · 03 (w × h @ x) | Gaps | Grid tracks | Row width | Article x / w | Column x / w |
|---|---|---|---|---|---|---|---|
| 1920 × 1080 | light, dark | 340 × 400 @ 540 · 904 · 1268 | 24 / 24 | 340 340 340 | 1068 | 540 / 652 | 540 / 1120 |
| 1440 × 900 | light, dark | 340 × 400 @ 312 · 676 · 1040 | 24 / 24 | 340 340 340 | 1068 | 312 / 652 | 312 / 1096 |
| 1280 × 800 | light, dark | 296 × 348 @ 312 · 632 · 952 | 24 / 24 | 296 296 296 | 936 | 312 / 652 | 312 / 936 |
| 1024 × 768 | light, dark | 210.7 × 247.8 @ 312 · 546.7 · 781.3 | 24 / 24 | 210.7 ×3 | 680 | 312 / 544 | 312 / 680 |

The reference x positions (312 / 676 / 1040 at 1440; 540 / 904 / 1268 at 1920) fall out of the site's own grid, as the study predicted. The row's left edge is the article's left edge at every width; its right edge never passes the content column's right edge (the width is `min(1068px, 100cqw)` of the column, never a vw unit or a negative margin). Frame aspect 0.85 (17:20), 1px frame, 8px radius, in every cell. Window 01's mat well is inset 21px (20px mat + the 1px frame), radius 6px, no shadow. Sidebar, headings, kicker, reading order and the article's own measure are unchanged.

Captions: two lines each at 1280 and above, three each at 1024. Labels: one line each at 1280 and above; at 1024 the two-line reservation holds all three windows level.

**Overflow.** `document.documentElement.scrollWidth === innerWidth` at all 14 theme × viewport combinations, and the element census of the proof subtree found 0 boxes crossing a viewport edge. The repository's own instrument, `npm run check:overflow -- --widths 320,375,393,1024,1280,1440,1920` (26 routes × 2 themes × 7 widths = 364 frames, non-vacuity plant caught on every frame), reported no element crossing the viewport edge on any route.

## 3. Mobile results

| Viewport | Theme | Each window (w × h) | Order | Overflow |
|---|---|---|---|---|
| 393 × 852 | light, dark | 329 × 387 | label → window → caption, 01 → 02 → 03, provenance last; 40px between windows | none |
| 375 × 667 | light, dark | 311 × 366 | same | none |
| 320 × 568 | light, dark | 256 × 301 | same (the 01 label wraps to two lines; caption 02 to three) | none |

Captions readable, nothing clipped (the two stills are cover-fitted at 0.85 against sources of 0.84 and 0.89, so the crop is under 1% and under 5% respectively; the clip's poster is cropped to the mat well exactly as production crops it today). Tablet widths (768–1023) stack the three windows at 340px, left-aligned, under the sidebar.

## 4. Click-to-play verification

All on the built page, window 01, both themes, at every required viewport unless stated.

| Check | Result |
|---|---|
| Markup | `<video poster preload="none" muted loop playsinline>`; no `autoplay` attribute; `controls` present in the server HTML (no-JS path) |
| After load and hydration, before any scroll | `data-motion="paused"`, `video.paused === true`, `currentTime 0` (14 / 14) |
| After the row scrolls into view (IntersectionObserver entry) and 1.9s | still paused, `currentTime 0` (14 / 14); `preload` steps to `metadata` only |
| Theme flip while paused (system preference change, light → dark and dark → light) | still paused; the VE04 edge retargets (light `rgba(185 99 64 / .7)` ↔ dark `rgba(207 122 79 / .4)`) and the pill restyles; nothing plays |
| Reduced motion | the row arrives settled; the clip stays paused on viewport entry; a deliberate Play still starts it (t ≈ 1.0s after one second) |
| Keyboard | Tab reaches the control in 18 presses from the top of the page (desktop) / 8 (phones); `:focus-visible` matches; **Enter plays** the real clip (`report-flow-current.dark.phone.webm`, `currentTime` 1.09–1.11s after 1.1s); **Enter pauses**; the accessible name reads `Play animation: …` at rest and `Pause animation: …` while playing (14 / 14) |
| Pointer | click resumes from the paused position, click pauses again (14 / 14) |
| No JavaScript | no `html.js`; native `<video controls>`, no overlay button; no `autoplay`; the edge paints its rest colour |
| Other clips | ghost-code's clip was already `autoplay: false` and renders unchanged; no other deliverable ships a clip; `/tokyo-through-time/` is untouched (its two videos render as before) |

Behavioural note for the reviewer: `ThemedMotion` pauses any clip that leaves the viewport (unchanged behaviour). With `autoplay: false` a clip the visitor started and then scrolled away from stays paused when it scrolls back in; the visitor presses Play again. That is the literal reading of "no playback merely because the video enters the viewport".

## 5. Play control and focus contrast (pixel readings, device scale 2)

| Theme | Rest: hairline : clip | hairline : pill body | icon : pill body | pill body : clip | Focus: ring : halo (inner) | ring : clip (outer) | halo : clip | Pill → frame edge |
|---|---|---|---|---|---|---|---|---|
| light 1440 | 5.7:1 | 1.1:1 | 3.4:1 | 5.5:1 | **3.9:1** | 2.3:1 | 8.9:1 | 33px right, 33px bottom |
| light 393 | 5.8:1 | 1.1:1 | 3.4:1 | 5.4:1 | **3.8:1** | 2.2:1 | 8.5:1 | 33 / 33 |
| dark 1440 | **3.1:1** | 4.7:1 | 6.2:1 | 1.5:1 | **5.2:1** | **3.0:1** | 1.7:1 | 33 / 33 |
| dark 393 | **3.3:1** | 4.9:1 | 6.1:1 | 1.5:1 | **5.2:1** | 2.9:1 | 1.8:1 | 33 / 33 |

Computed styles: button 44 × 44 CSS px (`h-11 w-11`, unchanged); focus `outline: 2px solid <accent>` at `outline-offset: 2px` (the global rule, untouched) plus `box-shadow: 0 0 0 2px rgb(<canvas>)` filling the offset gap; dark pill `background rgba(30 36 38 / .85)`, `border rgba(236 234 224 / .6)`; light pill unchanged (`rgba(255 255 255 / .72)`, `line`).

Reading: in **dark**, the control now has a visible boundary at rest (hairline 3.1–3.3:1 against the clip beside it, 4.7–4.9:1 against its own body; the study measured the shipped pill body at ~1.5:1 and the baseline position at ~1.1:1), and the focus ring clears 3:1 on both sides (5.2:1 against the halo, 2.9–3.0:1 against the clip). In **light**, the pill body itself is the boundary (5.5:1 against the clip); the focus indicator is two-tone: the terracotta ring reads 3.8–3.9:1 against the cream halo on its inner side, and the halo reads 8.5–8.9:1 against the clip, while the ring's outer side against this particular poster frame stays at 2.2–2.3:1 (the study's 2.33:1 finding for the inward placement). The indicator as a whole, a 4px two-tone band, is therefore perceptible against the clip in both themes; whether the outer-side ratio alone must also reach 3:1 is the one open accessibility question (see §10). The ring is never clipped: the pill sits 33px from the frame's right and bottom edges, 12px inside the mat well, so the ring and the VE04 edge never touch.

## 6. VE04 lifecycle verification

- `components/__tests__/ProofArrival.test.tsx`: **unchanged, 11 / 11 passing** (consume at trigger, scroll-away finish, hash, Back/Forward, reload, repeat visit, restored scroll, storage denied, nav-type unavailable, reduced motion, disabled footprint).
- `components/ProofArrival.tsx` and the VE04 CSS: not edited (the new test pins `SETTLE_SAFETY_MS = 900`, `threshold: 0.2`, the sessionStorage key, the rest colours `accent / 0.7` light and `/ 0.4` dark, the settling transition on `--dur-transition` and the `--dur-base` phone band as text).
- **On the real page, every first visit (14 / 14):** the host is `armed` at hydration with the proof below the fold; scrolling the row in flips it to `settling` within one or two frames, the sessionStorage key `w4-06-proof-arrival.v1` is `1` at that moment, and the 900ms safety timer flips the state to `settled` (observed 917–949ms after the scroll). The border colour, sampled on every animation frame, travels from the neutral line (`rgb(204 207 190)` light / `rgb(44 52 54)` dark) to the rest value and first equals it at 353–409ms on desktop (420ms nominal, ease-out) and 241–279ms on the phones (280ms nominal). Window 01's edge at rest reads `rgb(202 140 112)` light (2.3:1 against the surface beside it) and `rgb(117 78 60)` dark on the real composited backdrop, beside a neutral frame line of `rgb(203 206 190)` / `rgb(51 59 61)` and a caption rule of `rgb(202 169 144)` / `rgb(139 109 84)`; the computed values are the shipped `rgba(185 99 64 / .7)` and `rgba(207 122 79 / .4)`.
- **Arrival clauses on the real page:** reload → `settled` (navigation type `reload`); Back/Forward → `settled` (`back_forward`); hash arrival (`#the-approach` present at load; the site's `ViewTransitions` then consumes the hash, and the host sat at 602–1099px in the 900px viewport) → `settled`; reduced motion → `settled` at hydration with `transition: none`; no-JS → the settled colour is painted although the markup says `armed`. A theme flip mid-session retargets the colour without a replay.
- The border animation gates nothing: labels, headings, captions and the Play control are present and operable throughout (the keyboard runs in §4 happen on the same page loads).

## 7. Build and regression results

Run from a clean `npm ci` of the committed lockfile (Node 22.22, npm 10.9; `NEXT_TELEMETRY_DISABLED=1`, update notifier off; no package or lockfile change).

| Step | Result |
|---|---|
| Targeted suites (ProofArrival, ThemedMotion, ProductReveal, shot-matte/dark forwarding, matte invariance, first-impression, work-receipt, recruiter-copy-truth, duration-ramp, token-parity, the new suite) | pass |
| `npm run typecheck` | pass |
| `npm run lint` | pass (no warnings or errors) |
| `npm run build` | pass (static export to `out/`; the only notice is the pre-existing `headers` / `output: export` message) |
| `npm test` after the build (the CI order, so the build-dependent guards ran) | **108 files, 967 tests passed, 2 skipped, 0 failed** |
| `npm run check:overflow -- --widths 320,375,393,1024,1280,1440,1920` | clean, 364 frames |
| Final `npm test` after the last CSS change and rebuild (the build the screenshots were taken from) | **108 files, 967 tests passed, 2 skipped, 0 failed** |

No test was deleted, skipped or weakened. No existing assertion changed.

## 8. The new test, `app/__tests__/flagstone-proof-row.test.tsx` (18)

Content: the reporting-flow clip is `autoplay: false`; the full set of shipped clips and their settings is exactly `{flagstone[0]: false, ghost-code[0]: false}`. DOM (rendering `CaseProof` with the real content): an `<ol class="proof-row">` of three windows in shot order, each `label → window → caption`, labels `01 · Reporting flow, in motion.` / `02 · Report a barrier.` / `03 · Community review.`, captions verbatim from the data, the warm rule on every caption, no em dash anywhere, 17:20 / 8px frames, the breakout class, the VE04 host and edge on window 01 only, the provenance line with its `<time>` and no invented capture date. Playback: nothing plays on hydration, on IntersectionObserver entry or on a theme flip; Enter on the focused button plays, Enter pauses, click resumes, the name tracks the state; under reduced motion the edge settles at once, nothing autoplays, a deliberate Play works. Other case studies: dashboard keeps its `<ul>` two-column gallery with no labels, rule, provenance or breakout; ghost-code keeps its portrait still-first clip. CSS (globals.css as text): the block exists after the VE04 rules; the breakout uses `100cqw` under `@supports`, no vw, no negative margin; every selector in the block is scoped to the row; the block declares no `animation` / `transition` and redefines no focus token; the global focus rule and the VE04 colours and durations are byte-identical; `ProofArrival.tsx` keeps its 900ms bound, 0.2 threshold and storage key.

## 9. Screenshots (this branch's build)

Relative paths from `qa-reports/`; on GitHub, prefix `https://github.com/Skypie99/portfolio/blob/claude/cloud-flagstone-version-a-20261018/qa-reports/`.

**Owner review boards**
- Desktop, light over dark, 1440 (row crops): `flagstone-version-a-20261018/captures/boards/desktop_light-over-dark_1440.jpg`
- Phones 393 / 375 / 320: `flagstone-version-a-20261018/captures/boards/phones_light.jpg` · `flagstone-version-a-20261018/captures/boards/phones_dark.jpg`
- Play control at rest and with keyboard focus (2×): `flagstone-version-a-20261018/captures/boards/play-control_light.png` · `flagstone-version-a-20261018/captures/boards/play-control_dark.png`

**Compositions (viewport at the row), both themes, 7 viewports:** `flagstone-version-a-20261018/captures/composition/comp_{light,dark}_{1920x1080,1440x900,1280x800,1024x768,393x852,375x667,320x568}.jpg`
**Row crops, same matrix:** `flagstone-version-a-20261018/captures/row/row_{theme}_{w}x{h}.jpg`
**Details (2×):** `flagstone-version-a-20261018/captures/detail/play_rest_{theme}_{1440,393}.png`, `play_focus_{theme}_{1440,393}.png`, `edge_w01_{theme}_{1440,393}.png`
**Modes:** `flagstone-version-a-20261018/captures/modes/rm_{light,dark}_1440.jpg` (reduced motion), `nojs_light_1440.jpg` (no JavaScript, native controls)
**Other routes, unchanged:** `flagstone-version-a-20261018/captures/others/dashboard_light_1440.jpg`, `ghost-code_light_1440.jpg`, `claude-corp_light_1440.jpg`, `tokyo-through-time_light_1440.jpg`

Reproduce: `npm ci && npm run build && node qa-reports/flagstone-version-a-20261018/tools/capture.mjs` (Chromium from `PLAYWRIGHT_CHROMIUM_EXECUTABLE` or `$PLAYWRIGHT_BROWSERS_PATH`; nothing is installed).

## 10. Accessibility: observations and limitations (no conformance claim)

- **axe-core 4.11.4 on the proof block**, both themes, 1440 and 393: **0 violations**, 17 rules passed, 3 "needs review" items, all pre-existing in kind: `aria-prohibited-attr` on the block's wrapper (the `aria-label` on a plain `div`, present on every case study before this candidate; a `section` with `aria-labelledby` would resolve it, left for the integrator since it touches every case study), `color-contrast` on the kicker, heading, labels and captions (axe cannot resolve text over the translucent world panel; the repository's `ink-contrast.test.ts` guards those inks against the composited surfaces, and the pixel readings in §5 cover the new control), and `video-caption` (the silent UI capture ships no track; nothing to caption, but axe cannot know that).
- **Light-theme focus ring, outer side 2.3:1** against this poster frame (§5). The inner side and the halo clear 3:1 comfortably; if the reviewer requires the outer side alone to reach 3:1, the remedy is a darker halo colour or a 1px `ink` outer keyline, one scoped declaration.
- **Not performed:** screen-reader or switch-access runs, real-device sessions, human perceptibility of the beat, `forced-colors` mode, landscape phones, Firefox and Safari renders. Chromium only.
- The ordered list, figure/figcaption pairs, the clip's `aria-label` and the state-tracking button name are in the DOM (unit-tested); announced order is label → figure → caption → next window.

## 11. Integration overlaps (for the integrator)

- `app/globals.css` is the one widely shared file this candidate appends to (one self-contained block between the VE04 rules and the HeroSettle rules). Any other candidate that also edits `globals.css` (the homepage candidate `claude/cloud-rc2-home-landing-20261017`, the accessibility candidates) will merge textually; the block has no dependency on other rules beyond the existing tokens.
- `app/work/[slug]/page.tsx`: this candidate edits `CaseProof` and one wrapper class on the case-study body. The Flagstone table repair (`claude/portfolio-syn-t-016-table-20261018`) and the card repair (`claude/portfolio-syn-t-014-cards-20261018`) were not read or incorporated; if either touches this file, the overlap is confined to those two spots.
- `content/deliverables.json`: one added key on `flagstone.shots[0].video`.
- Neither the homepage, the cinematic intro, navigation, `components/ProjectCard.tsx`, `public/flagstone/**` nor `app/tokyo-through-time/**` is touched.

## 12. Remaining blockers and the next step

Blockers to publication: owner visual review of the renders above (especially light at 1440 on a real display, which the study asked for), an independent accessibility review of §10, and integration with the other open candidates. None are code blockers; CI's own gates (lint, typecheck, build-backed tests, build) pass on this branch locally.

Next step toward publication: the owner opens the boards in §9, decides on the light-theme outer-ring question in §10, and, if accepted, merges this branch into `main` (which runs CI and then the gated deploy). This session created no pull request and will not merge or deploy.
