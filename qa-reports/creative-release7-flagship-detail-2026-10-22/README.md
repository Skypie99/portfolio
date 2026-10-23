# Creative Release 7 candidate · The flagship room, shown at reading size · owner review

**Date:** 2026-10-22 · **Branch:** `claude/skypi-creative-r7-flagship-detail-20261022` (local only, not pushed) · **Base:** `origin/main` `093324581fecdca4d06ec68ddcb666244491e309`, fetched and verified at the start of the session; GitHub Actions Deploy run `39694576424` published that exact SHA (2026-10-21 23:37 UTC), so the live site is this main · **Deployed:** no · **Merged:** no · **Pull request:** none

| Package | Surface | Status |
|---|---|---|
| R7 · the flagship exhibit | homepage `#flagship` room | PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING · DEVICE_QA_PENDING (#38) · NOT_DEPLOYED |

This is an isolated candidate for Sky's visual review. It is not acceptance, not a release, and nothing here calls its own review independent. Implemented by Claude (an AI agent) in a fresh clone in a temporary directory; Sky's `~/Portfolio` checkout and every other agent's worktree were not touched. Nothing was sent anywhere.

## 1. Start here

| What | Where |
|---|---|
| Before / after boards, matched build, theme, viewport, scroll state and DPR (28) | `boards/*.jpg` (before = main `0933245`, after = this branch) |
| The single most telling pair | `boards/light-1440x900@1-room.jpg`, `boards/light-393x852@2-room.jpg`, `boards/dark-1440x900@1-room.jpg` |
| Normal-speed recordings of the room's arrival, before and after (1440, 393) | `motion/*.mp4`, sampled timelines `motion/*.json` |
| Contact sheets at matched times, and the leader's draw frame by frame | `motion/sheets/arrival-*.jpg`, `motion/sheets/leader-draw-light-1440x900.jpg` |
| Reduced motion and no JavaScript | `modes/*.jpg`, `modes/mode-diff.json` |
| Accessibility: axe, keyboard path, ARIA snapshot, rendered-pixel contrast (both builds) | `a11y/a11y-before.json`, `a11y/a11y-after.json` |
| Performance: requests, layout shift, bytes (both builds) | `perf/perf-before.json`, `perf/perf-after.json` |
| WebKit spot check, text-only 200% probe | `webkit/`, `boundaries/` |
| What the live site looked like when this session began | `baseline-live/` (skypistudio.com, 2026-10-22) |
| Gate logs | `gates/*.txt` |
| Every instrument, each documenting its command line, and the script that rebuilds this folder | `tools/*.mjs`, `tools/run-all.sh` |

Every capture is a headless render of the built static export served over loopback (Chromium, plus Playwright's WebKit for the spot check), or of the live site for `baseline-live/`. Nothing here is a mockup; the only annotations are the boards' label strips and the sheets' time stamps.

## 2. The current baseline (live, measured this session)

The film (protected), the hero (protected identity and positioning), then the first proof a reader meets: the flagship room. What the room shows today, in both themes and at every width:

1. **A slab, not a room.** The room's own brief says "no bordered well and no earth gradient (pane A's `.phonewell` is the phone standing in the room's own light, not a framed picture)". But the shared hero component still paints its golden-hour world inside the well: an opaque earth gradient, cut hard at the well's edges. Measured: 465×581 at 1440 and 324×405 at 393, behind the phone in light and dark (`baseline-live/live-home-06-flagship-*.jpg`; `before/geometry-before.json` reports the slab on every frame).
2. **The evidence cannot be read.** The capture's most important pixels are the expanded report card: the title "Steep grade", "SEVERITY 3 OF 5 · MODERATE · VERIFIED", "Reported 17h ago", a real photograph of a steep stair behind a chain-link fence, "Slope is too steep to roll up steep stairs no ramp safely.", and "Open details". At room scale that card's text renders at 3 to 7px. The museum plate beside it transcribes those words, but the reader cannot see them. It is the one product image on the homepage.
3. What already works, and stays: the eyebrow and title, the three-line plate (the human claim, before any pixels), the status line, the shared "View project" doorway, the capture itself, and the caption.

Other opportunities were surveyed against the brief's eight areas before choosing, and are ranked in section 9. The film and the hero are protected (identity contract PR-001 and PR-004; `MOTION_SYSTEM.md` §0). The intro handoff is protected and device-gated (D7). The homepage index is text-only by an owner-ratified decision (THE ROOM C3, Release 6), and the case-study well is an owner ruling (`[bp4-lamp-as-built]`). The flagship room was the highest-impact surface not covered by a lock or a ruling.

## 3. Two directions for the one improvement

The improvement: **make the flagship room show, at reading size, the evidence it currently only names, with the artifact standing in the room's own light.**

| | A · The detail plate (editorial) | B · The push-in (cinematic) |
|---|---|---|
| Idea | One region of the SAME capture (the report card, with a margin of the map) shown at about twice the screen's scale, beside the whole screen. A 1px terracotta leader runs from plate to frame, and a mono line names it: "Detail of the same capture". The slab goes; a soft, edge-less signature light replaces it. | As the room scrolls through, the camera pushes from the whole phone into the card, scroll-linked, landing on a legible close-up while the plate holds beside it. An echo of the film's camera push. |
| Brand continuity | Strong. It extends the museum-plate and exhibit grammar THE ROOM built, and Release 5's established "labelled detail … at a size where the product's own text can be read". | Mixed. Strong echo of the film, but it re-uses the protected intro's signature move below the landing (`MOTION_SYSTEM.md` §0 and §5 limit parallax to decorative layers and detail-page heroes). |
| Visual originality | High for a portfolio: an annotated exhibit, not a device mockup. | High, but the "zoom into the screen" is a recognisable product-marketing trope. |
| Recruiter usefulness | High. The card is legible at rest for every reader, at any scroll speed. | Low to medium. Legible only at the end of the push; fast scrollers and reduced-motion readers miss it. |
| Accessibility | The plate is decorative (aria-hidden) and duplicates text the plate and alt already carry. Static at rest; one optional beat. | Information gated behind motion. A reduced-motion fallback would either lose the close-up or the whole screen. Vestibular risk (WCAG 2.3.3). |
| Mobile quality | A designed stacked composition: the plate at near-native size above the unchanged screen. | Scroll-linked zoom on phones is jank-prone; there's no room for a plate beside the phone. |
| Performance | Zero new bytes. The plate requests the capture's own URL, served from the same download. CSS only, no client JS. | A per-frame transform on a large raster; needs JS or scroll-timelines (support varies). |
| Implementation risk | Moderate: deterministic geometry, guarded by tests. | High. |

**Selected: A.** It's the only direction whose benefit reaches every reader at rest, it builds on two accepted grammars (THE ROOM's plate, Release 5's details) instead of reopening a protected one, and it costs no bytes and no client JavaScript.

## 4. What the candidate does

- **The open stage.** In this room only, the shared hero component's slab (`.pr-world`), its horizon hairline and its dark-mode lamp are switched off (`app/globals.css`, scoped `#flagship` rule, beside the existing VE01 override). An edge-less radial in Flagstone's signature hue takes their place: transparent by 76% of its ellipse, never extending above the stage. The phone stands in the room's light, as the room's brief always said. Every case-study hero keeps its slab and lamp, untouched.
- **The detail plate.** `ExhibitDetail` shows the capture file itself, scaled and offset by a measured crop (`lib/captureDetail.ts`: box `236,414 774×910` of the 1290×2803 Explore capture, holding the card at `266,444 714×852` with a margin). The spec turns itself off if the hero ever stops being that exact file at that exact size, or becomes a themed twin, a clip or owner artwork, so it can never crop the wrong pixels. The plate is aria-hidden, with an empty alt and nothing focusable.
- **Composition.** The plate and screen stand side by side (50 : 44, a 6% gap the leader spans) from `sm` while the stage holds at least 20em. Those proportions put the plate's mid-height on the card's mid-height on the screen, within 2.1px at every side-by-side width measured. Otherwise (phones, or enlarged text) the plate stands above the screen, which keeps the width it had on main. The switch is a container query in em, Release 6's clause-hold idiom, and both columns are `minmax(0, …)`.
- **The screen keeps its size where it matters.** The capture-fitted frame (the `frameWidth` mechanism Release 3 built for the case study) gives a 277px frame at 1440, 234 at 1280, 167 at 1024 (main: the same within 1–2.5px), and 194 at 393 (main: 193). The well's height is reserved by an in-flow spacer at exactly the frame's height, for zero letterbox and zero CLS.
- **Words.** No copy changed. The one new visible line, "Detail of the same capture", is literally true. The capture caption keeps its exact text and gains the Release 5 caption ink pair (`ink-muted` / `ink`). It sits on the stage light, and its contrast only rose (section 7).
- **Grid.** With the plate present, the room's lg track gives the stage the larger share (`0.8fr / 1.2fr`, was `1.1fr / 0.9fr`). The copy column takes the narrower track, and the W4-05 phone-size target (260–300px at wide desktop) still holds at 277.

## 5. Files changed

| File | Change |
|---|---|
| `lib/captureDetail.ts` (new, 83 lines) | The detail spec registry and its fail-safe resolver; `cropGeometry()` |
| `components/ExhibitDetail.tsx` (new, 81 lines) | The plate: aria-hidden picture of the same sources, crop by custom properties, leader and pin, its line |
| `components/exhibitDetail.module.css` (new, 186 lines) | Stage container rule (stacked / side by side by em), edge-less light, plate material, crop placement, leader beat and floors |
| `app/page.tsx` (+112/−33, mostly comments) | The room's stage: light, plate, capture-fitted screen, caption; grid track when the plate is present; fallback = the previous well when no spec applies |
| `app/globals.css` (+15) | `#flagship .pr-world, .pr-horizon, .pr-lamp { display: none }` with its reason |
| `lib/__tests__/captureDetail.test.ts` (new, 7 tests) | Spec names the shipped file at its WebP size; crop holds its subject; **the subject is the card, read back from the file's pixels**; resolver turns off on every mismatch; geometry arithmetic (mutation-tested: three planted spec errors all fail it) |
| `components/__tests__/ExhibitDetail.test.tsx` (new, 5 tests) | Decorative by construction; same URLs, AVIF first, lazy; geometry; leader inside the hidden subtree; its line and ink |
| `app/__tests__/flagship-exhibit.test.tsx` (new, 12 tests) | One plate cut from the frame's own file; the capture stays the room's one accessible image; stage light hidden; spacer formula; lg track; slab switched off under `#flagship` only; container rule; motion floors |

Not changed: `components/ProductReveal.tsx`, `DeviceFrame.tsx`, `Plate.tsx`, `HeroSettle.tsx`, `ProjectDoorwayButton.tsx`, `Reveal.tsx`, `lib/motion.ts`, `lib/schema.ts`, `content/*.json`, `tailwind.config.ts`, tokens, media, `app/work/[slug]/page.tsx`, the cinematic, the hero, `MOTION_SYSTEM.md`, `UI_SYSTEM.md`, dependencies, workflows.

## 6. The motion change, reproducibly

One new beat, and nothing else moves differently:

- **The leader draws** from the pin on the device frame toward the plate (the detail is drawn out of the screen): `transform: scaleX(0 → 1)`, `transform-origin` at the frame end, over `--dur-scene` (1200ms) on `--ease-gh-glide`, starting `--dur-slow` (520ms) after the stage's existing Reveal shows. It is armed only under `html.js` inside `prefers-reduced-motion: no-preference`. Reduced motion, no-JS, the dead-bundle failsafe, hash arrivals and print all rest it drawn. It runs once, and it exists only in the side-by-side composition. Ramp tokens only, never the intro's curve; guarded in `app/__tests__/flagship-exhibit.test.tsx`.
- **Measured** (1440, light, same scripted glide on both builds; `motion/*.json`): the stage's Reveal shows at 102ms (main) / 108ms (candidate) after the glide starts, and rests at 1102ms / 1125ms, so the room's own arrival is unchanged. The leader's first measurable movement comes at 708ms (sampling interval about 40ms; authored start 628ms), and it rests drawn at 1825ms. At 393 the stack has no leader, and the stage arrives at 248ms to 1232ms (main 253 to 1236ms).
- **Reduced motion:** the room framed at 120ms and at 1600ms is pixel-identical (0 differing pixels, light and dark, 1440 and 393; `modes/mode-diff.json`), so the composition is complete from first paint.
- **Reproduce:** `node qa-reports/creative-release7-flagship-detail-2026-10-22/tools/room-motion.mjs --dir out --out <dir> --tag after --size 1440x900@1 --theme light` (walks to 1.2 viewports above the room, glides the room to the top over 1600ms on a cubic ease-out, samples every frame for 3.2s, then repeats under reduced motion and without JavaScript, and records a normal-speed clip).

Proposed contract text, for Sky to apply when a release is approved (not applied here, as with Releases 4 to 6). `MOTION_SYSTEM.md` §17: "Flagship detail leader (R7): one scaleX draw, `--dur-scene` on `--ease-gh-glide`, delayed `--dur-slow` behind the stage's Reveal, side-by-side composition only; RM / no-JS / failsafe / seat / print rest drawn; `components/exhibitDetail.module.css`." `UI_SYSTEM.md`: "The flagship room is an open stage: no slab, an edge-less signature light; a detail plate (a measured crop of the hero capture, aria-hidden, Release 5 caption ink) beside the screen from `sm` at ≥20em, above it otherwise."

## 7. Tests and accessibility findings

| Gate (final source; logs in `gates/`) | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run lint` (next lint + jsx-a11y) | no warnings or errors |
| `npm run build` | clean; First Load JS unchanged: `/` 174 kB, shared 103 kB (the route chunk reads 52.8 kB, main 52.7 kB) |
| Render identity | The evidence was rendered from a build made before one comment-only edit to `app/page.tsx`. A rebuild from the final source produced byte-identical homepage HTML (build id masked) and identical CSS files (`gates/render-identity.txt`), and typecheck, lint and the suite were re-run on the final source |
| `npm test` after the build (build-dependent guards run, as in CI) | **126 files, 1159 passed, 2 skipped** (main, same machine: 123 files, 1135 passed, the same 2 skipped; +3 files, +24 tests, 0 failures) |
| House overflow census | 162 frames (27 routes × 2 themes × 320/375/414) and 270 frames (× 640/768/1024/1280/1440): no element crosses the viewport edge; the non-vacuity plant was caught on every frame |

| Accessibility check (both builds, light and dark, 1440 and 393) | Result |
|---|---|
| axe-core 4.11.4, whole page and `#flagship` alone | 0 violations on both builds. The room's 11 "incomplete" contrast nodes are axe declining to compute over gradients; the rendered-pixel probe below covers them |
| Screen-reader semantics: the room's ARIA snapshot | **Byte-identical before and after** in all four combinations: the same eyebrow, heading, plate, status, "View project" link, the capture as the one image with its full alt, and the caption. The plate adds nothing to the accessibility tree |
| Keyboard | From the last stop before the room, Tab lands on "View project" (focus-visible, 2px terracotta ring) and then leaves the room; identical on main. No focusable content inside any aria-hidden subtree |
| Rendered-pixel contrast (worst pixel under the text; `a11y/`) | New line "Detail of the same capture": light 5.33 / 5.10, dark 7.03 / 5.66, all pass. Capture caption: 5.53 → 5.98, 5.64 → 6.01, 6.74 → 10.24, 4.79 → 7.48. No room line measures lower than main, apart from noise (dark plate caption 6.44 → 6.37 at 1440) |
| Reduced motion · no JS | Composition complete at first paint (0px difference 120ms vs 1600ms). No JS: the plate, leader and screen all rest visible. The no-JS "dark" frame renders light because the site's theme class needs JavaScript (pre-existing). Under reduced motion the world backdrop rests at its night state (designed), which is the tint difference in `mode-diff.json` |
| Text-only 200% (root font-size doubled) | No overflow at 1440, 1024, 393 or 320. The stage releases to stacked under enlarged text. **Found and fixed during this session:** the first build collapsed the screen to a sliver at 1024 with 200% text; the em container rule is the fix (`boundaries/`) |
| WebKit spot check (Playwright WebKit, not native Safari) | Geometry identical to Chromium (plate 314×370, screen 259×562 at 1440; plate 250×294, screen 176×383 at 393). The AVIF decodes; no errors |
| Performance | One request for the capture on both builds (`explore-current.phone.avif`); image bytes identical (749,533 at 1440; 306,495 at 393); CLS 0 on both builds through the room; homepage HTML +823 B and CSS +640 B gzipped (+3,044 B and +2,759 B raw); no client JS added |

**Pre-existing finding, not introduced and not fixed here.** In dark, three lines of the room measure below 4.5:1 at their worst pixel on main and on the candidate alike: the eyebrow (4.15 → 4.26/4.22), the plate claim (4.18 → 4.19/4.33) and the plate provenance (4.07 → 4.18, 4.12 → 4.12). They come from the shared eyebrow pattern and the shared `Plate` component. Fixing them is the accessibility-wide work Release 6's owner decision D1 deferred, so it's ranked first in section 9 instead of being slipped in here.

**Needs physical-device QA** (cannot be proven headless): native Safari and VoiceOver on iPhone and Mac (GitHub issue #38, still deferred), confirming the plate is silent and the capture's alt is read once; the leader's draw at 120Hz ProMotion; the stacked composition at real phone DPR and Dynamic Type; the open stage on an OLED in dark mode.

## 8. Decisions for Sky

1. **Accept the direction (A, the detail plate) for the homepage room?** `[ACCEPT (recommended)]` · `[REVISE]` · `[DECLINE]`. Rollback: before merge, delete the branch; after merge, `git revert -m 1 <merge-sha>`. The change is isolated to 2 modified and 6 new source and test files.
2. **768 portrait (rail open, 424px column):** side by side, as built, makes the screen 169px wide (main 233) and the room 146px shorter, with the plate legible beside it. The alternative is to stack below `md` (screen kept at 233, room taller). `[AS BUILT (recommended)]` · `[STACK BELOW md]`
3. **The capture caption's ink:** `text-meta` → `ink-muted` / `ink` (Release 5's caption pair), matching the plate's line; contrast rises in every case. `[ACCEPT (recommended)]` · `[KEEP text-meta]`
4. **Contract docs:** apply the section 6 text to `MOTION_SYSTEM.md` and `UI_SYSTEM.md` with the release, or leave them as module-header documentation as Releases 4 to 6 did. `[APPLY WITH RELEASE]` · `[LEAVE]`
5. **The pre-existing dark contrast lines in this room** (section 7): schedule them in the accessibility-wide campaign `[DEFER (as D1)]`, or fold a scoped dark-ink fix into this release `[FIX IN R7]`.

## 9. Remaining improvements, ranked

| # | Opportunity | Why it matters | Gate |
|---|---|---|---|
| 1 | Dark flagship-room text floors (eyebrow, plate claim, provenance at 4.07 to 4.18:1 worst pixel) | An accessibility pillar, in the room every reader meets first | Owner: in or out of the accessibility-wide campaign (R6 D1) |
| 2 | The intro-to-portfolio seam: on desktop the side rail appears with a hard horizontal cut under the film's lower fade; on phones a bright (light) or dark (dark) band crosses mid-screen as the film leaves (`baseline-live/`) | The one moment between the film and the work | Protected handoff (`MOTION_SYSTEM.md` §0) and D7, device-gated |
| 3 | Closing invitation and contact intent: "Have something worth building? Let's talk about it." reads collaboration-first; the identity contract §15 (Sky, 2026-09-03) puts hiring and professional conversations first | Recruiter conversion at the end of the page | Owner copy decision; no copy was touched here |
| 4 | The room's two columns under text-only enlargement at 1024–1279 (on main and here, the words column takes the width and the screen renders tiny) | Low-vision readers who enlarge text, not the page | A room-level em release, the same idiom as this stage |
| 5 | The Flagstone case-study hero: the same framed well with a slab | Consistency between the two flagship first impressions | Owner ruling `[bp4-lamp-as-built]` would need re-ruling |
| 6 | 320px wraps that trail an interpunct (plate claim, capture caption), and the "View project" pill crossing the edge at 320 with 200% text | Craft at the narrowest width | Shared components; small |
| 7 | Imagery for the four other projects on the homepage | Visual proof beyond Flagstone on the page most recruiters see | THE ROOM C3 and Release 6 chose a text index; only if Sky reopens it |

## 10. Next steps toward an approved release

1. Sky reviews the boards and clips (sections 1 and 3) and answers section 8.
2. On acceptance: push the branch and open a pull request (Sky, or an agent Sky authorizes). CI runs lint, typecheck, the build-backed suite and the build; Deploy runs only after CI succeeds on `main` (`CLAUDE.md` gotcha 1).
3. A device pass on iPhone Safari with VoiceOver and a Mac, using the section 7 list, alongside the deferred #38 checks.
4. Sky merges. This is a portfolio change, so it's Sky-only; the Art. 17 grant does not apply.
5. After Deploy: confirm on skypistudio.com that the slab is gone, the plate is legible, one capture request is made, and there are no console errors, in light and dark at 1440 and 393. Then record the publication receipt.
6. Apply or decline the section 6 contract text as decided.
