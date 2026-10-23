# Design Compile Result — flagship-detail (Creative Release 7 candidate) — 2026-10-22

**Surface:** homepage `#flagship` room · **Branch:** `claude/skypi-creative-r7-flagship-detail-20261022`, off `origin/main` @ `0933245` (verified on GitHub; Deploy run `39694576424` published it) · **Integrated at handoff:** main moved to `2fb857b` (PR #39, `/motion/`) during the session and was merged in at `82ed254` (only the generated index overlapped; regenerated). Merged tree re-verified: build, typecheck, lint clean; 127 files, 1172 passed, 2 skipped; overflow 168 + 280 frames clean; homepage render byte-identical to the evidence build.
**Status:** candidate on a local branch for Sky's review. Not pushed, not merged, not deployed; nothing sent to anyone.
`mode: active · model_tier: opus (Sky-initiated session) · state_consistency: verified against remote main and the Deploy run · duplicate_work_detected: none (open PR #39 touches /motion/ only) · drift_risk: low`

The review packet is the entry point: [`creative-release7-flagship-detail-2026-10-22/README.md`](creative-release7-flagship-detail-2026-10-22/README.md).

## 1. DECISIONS FOR SKY

- [ ] **Accept direction A (the detail plate) for the homepage flagship room** (recommended). Rollback: delete the branch; after a merge, `git revert -m 1 <merge-sha>`.
- [ ] **768 portrait:** keep side by side as built (screen 169px, room 146px shorter), or stack below `md` (screen stays 233px).
- [ ] **Capture caption ink** `text-meta` → `ink-muted` / `ink` (contrast rises in every case).
- [ ] **Contract docs:** apply the proposed `MOTION_SYSTEM.md` §17 and `UI_SYSTEM.md` text with the release, or leave it in the module headers.
- [ ] **Pre-existing dark-room contrast** (eyebrow, plate claim, provenance at 4.07–4.18:1 worst pixel, identical on main): defer to the accessibility-wide campaign (R6 D1), or fix in this release.

## 2. BLOCKERS / FAIL_FAST

None. One defect of this candidate's own first build was found and fixed before handoff: under text-only 200% enlargement at 1024 the screen's column collapsed to a sliver. The stage now releases to its stacked composition by width in em (a container query, Release 6's clause-hold idiom).

## 3. Summary

The flagship room is the first proof past the film and the hero. On the live site it showed Flagstone's capture on a hard-edged earth-gradient slab (465×581 at 1440), contradicting the room's own brief ("the phone standing in the room's own light, not a framed picture"). And the capture's key evidence, a verified barrier report with a real photograph, rendered its words at 3 to 7px. The candidate switches the slab off in this room, stands the phone in an edge-less signature light, and adds a detail plate beside the screen: the same capture file, cropped by a measured, self-disabling spec, at about twice the screen's scale, joined to the frame by a 1px terracotta leader that draws once. No copy changed and no bytes were added. The plate is aria-hidden, so the room's accessibility tree is byte-identical to main's.

## 4. What changed (local commit on the branch)

| File | What |
|---|---|
| `lib/captureDetail.ts` (new) | Detail spec registry (Flagstone's measured crop) and its fail-safe resolver |
| `components/ExhibitDetail.tsx` (new) | The plate: aria-hidden crop of the capture's own sources, leader and pin, its line |
| `components/exhibitDetail.module.css` (new) | Stage container rule (side by side from `sm` at ≥20em, stacked otherwise), edge-less light, plate material, crop placement, the leader's one beat and floors |
| `app/page.tsx` | The room's stage and lg track; fallback to the previous well when no spec applies |
| `app/globals.css` | `#flagship` switches off the bare hero's slab, horizon and lamp (this room only) |
| 3 new test files (24 tests) | Spec truth (including a pixel read-back of the card), component contract, room wiring, scoped stylesheet rule, container rule, motion floors |
| `qa-reports/creative-release7-flagship-detail-2026-10-22/`, this receipt, `qa-reports/INDEX.md` | Evidence, instruments, packet, regenerated index |

## 5. Verification

| Check | Result |
|---|---|
| `npm run lint` · `npm run typecheck` · `npm run build` | clean · clean · clean (First Load JS `/` 174 kB, unchanged) |
| `npm test` after the build | 126 files, **1159 passed**, 2 skipped (main: 123 files, 1135 passed, same 2 skipped) |
| Overflow census | 162 + 270 frames (27 routes × 2 themes × 8 widths, 320 to 1440): no element crosses the edge; plant caught on every frame |
| axe-core 4.11.4 (page and room; light and dark; 1440 and 393) | 0 violations, both builds |
| ARIA snapshot of the room | byte-identical to main in all four combinations |
| Keyboard | one stop in the room ("View project", 2px ring), as on main |
| Rendered-pixel contrast | new line 5.10 to 7.03:1; capture caption up in every case (to 5.98–10.24); no line lower than main beyond noise |
| Reduced motion | composition complete at first paint: 0 differing pixels between 120ms and 1600ms frames |
| No JS · text-only 200% · WebKit | complete composition · no overflow (fix above) · geometry identical to Chromium |
| Performance | capture requested once on both builds; image bytes identical; CLS 0; HTML +823 B and CSS +640 B gzipped (+3,044 B and +2,759 B raw) |

## 6. LAYER BREAKDOWN

| Layer | Result | Score | Evidence |
|---|---|---|---|
| 1. Tokenization | PASS | — | Colour, shadow, radius, duration and easing come from tokens only (`--rgb-*`, `--pr-sig`, `--shadow-lg`, `rounded-lg`, `--dur-scene`, `--dur-slow`, `--ease-gh-glide`). The light's alphas mirror the existing plinth's (0.2 / 0.06). Raw values are layout proportions with stated reasons (50 : 44 : 6, the 20em release, a 300px phone-plate cap); `1.125rem` mirrors the phone frame's padding and border, a documented coupling |
| 2. Accessibility Parity | PASS (change) · ESCALATE (pre-existing) | — | The change adds no AT node, no tab stop, no motion under RM, and no overflow; its new text passes in both themes. The room's pre-existing dark contrast lines are escalated to Sky (decision 5), not introduced |
| 3. Component Consistency | PASS | Cohesion 18/20 | Re-uses the capture-fitted frame (`frameWidth`), `Plate`, `Reveal`, the Exhibit leader grammar (1px terracotta, aria-hidden, never crossing text), the HorizonRule draw, and Release 5's caption ink. One new component with one caller (`ExhibitDetail`): it is the visual unit under test, and the registry is slot-driven because the room reads the featured slot, not a name |
| 4. Visual Entropy | PASS | ~85/100 (judgment) | Adds two elements (plate, leader) and removes one (the slab); the room gains a left-to-right reading order of words, then the legible evidence, then the whole artifact |
| 5. Luxury UI Score | PASS | ~88/100 (judgment) | An exhibit, not a mockup: the device stands in light; the detail is crisp at every DPR (the source is 774px for a ≤314px plate); one quiet beat |
| 6. Regression Safety | PASS | — | No shared component modified; one scoped stylesheet rule; full suite, overflow censuses, WebKit and RM/no-JS all green; screen sizes within 2.5px of main except the documented 768 trade-off |
| 7. Compile Decision | **COMMIT to the candidate branch** · release **ESCALATED** to Sky (section 1) | — | UI done for review; nothing applied live |

## 7. Findings and notes

- 🟢 **Fixed during verification:** the text-zoom collapse (section 2). The dark-theme line under the plate measured 3.56:1 on `text-meta` over the stage light at 393, so both exhibit captions moved to the Release 5 pair (now 5.10 to 10.24:1). The light's upward bleed lowered the plate provenance to 4.75:1 at 393 light, so the light no longer extends above the stage (back to main's 5.02).
- 🟡 **Pre-existing, unchanged:** dark-room contrast (decision 5). The room's two columns squeeze under text-only 200% at 1024–1279 (on main too). The "View project" pill crosses the edge at 320 with 200% text (shared component, on main too).
- ⚪ Instrument notes: Playwright's video recorder and an in-page rAF sampler starved each other in one context, so recording is a separate pass. With JavaScript disabled, in-page rAF never runs, so the no-JS reading is static. The theme class needs JavaScript, so a no-JS "dark" frame renders light (pre-existing site behaviour).

## 8. Evidence

`qa-reports/creative-release7-flagship-detail-2026-10-22/`: `boards/` (28 before/after pairs), `before/` and `after/` (room and fold frames, 7 widths × 2 themes, with geometry), `motion/` (4 normal-speed clips, sampled timelines, contact sheets, leader strip), `modes/`, `a11y/`, `perf/`, `webkit/`, `boundaries/`, `baseline-live/`, `gates/`, `tools/` (each instrument documents its command line; `tools/run-all.sh` rebuilds the folder).
