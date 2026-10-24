# Creative Release 7 · refinement round · candidate for independent visual review

**Date:** 2026-10-23 · **Branch:** `claude/skypi-creative-r7-flagship-detail-20261022` (local only; not pushed, merged or deployed) · **Refinement source commit:** `6e76696` (this packet is committed directly after it) · **Refines:** v1 `ed5b25b` ([v1 packet](../creative-release7-flagship-detail-2026-10-22/README.md)) · **Compared against:** main `2fb857b`, the live site on 2026-10-23 (Deploy success 03:51 UTC; PR #39, `/motion/`) · **Native Safari + VoiceOver acceptance:** OPEN under GitHub issue #38

Sky accepted the freestanding Flagstone phone with the enlarged proof-detail panel and set four refinements. This round applies them, and nothing else. The v1 candidate was preserved and verified outside the temporary workspace before any change (section 8).

## 1. The four owner decisions, as applied

| # | Decision | What changed | Evidence |
|---|---|---|---|
| 1 | Accept the direction | Kept as built: the open stage and the detail plate | `boards/` |
| 2 | Tablets stack; keep the desktop composition | Side by side now starts at `lg` (1024, the room's own two-column breakpoint), not `sm`. Below it, the plate stands above a screen at main's size: 232px at 768 (main 233; v1 169) and 271px at 834 (main 272). The desktop composition is unchanged. | `refinement-boards/light-768x1024@1-room.jpg`, `boards/*-768x1024@1-*`, `boards/*-834x1194@2-*` |
| 3 | Approve the stronger caption ink | Kept: "Current product capture · Explore" and "Detail of the same capture" use `ink-muted` / `ink` | `a11y/`, `contrast-scroll/` |
| 4 | Fix the dark-mode contrast failures, ≥4.5:1 both themes | In this room only: one dark panel step (`--surface-alpha-alt` 0.68 → 0.80) and the room's wash at half strength in dark (Release 6's `#work` precedent). No ink token or text colour changed. Every text line in the room now measures **≥4.88:1 in light and ≥4.91:1 in dark**, at its worst pixel, at every width and scroll offset (section 4) | `contrast-scroll/`, `refinement-boards/dark-*` |

## 2. Start here

| What | Where |
|---|---|
| Before (main `2fb857b`) / after (refined) boards: desktop 1440, 1280, 1024; tablet 834, 768; phone 393, 375, 320; light and dark; room and viewport frames (32) | `boards/` |
| v1 / refined boards where this round changed something: tablet and dark | `refinement-boards/` |
| Reduced motion and no JavaScript (1440, 768, 393, both themes) | `modes/`, `modes/mode-diff.json` |
| Contrast across scroll offsets, both builds, both themes, six widths | `contrast-scroll/contrast-scroll-before.json`, `-after.json` |
| axe, keyboard path, ARIA snapshot, single-frame contrast (1440, 768, 393, both builds) | `a11y/` |
| Performance, WebKit, text-only 200%, motion timelines | `perf/`, `webkit/`, `boundaries/`, `motion/` |
| Gate logs and the protected-surface check | `gates/` |
| Instruments | `tools/run-refinement.sh` rebuilds this folder; it reuses the v1 instruments in `../creative-release7-flagship-detail-2026-10-22/tools/` and adds `tools/contrast-scroll.mjs` (new), plus `webkit-room.mjs` and `zoomtext-room.mjs` (copies with `--sizes`) |

Every capture is a headless render of a built static export served over loopback. Element frames taller than the viewport (stacked tablets and phones) are stitched by the capture engine, so the fixed world backdrop can show a faint horizontal tone step where the stitch falls. It appears identically on main's frames, and the viewport frames (`*-room-fold.jpg`) show the page has no such band.

## 3. Files changed in this round

| File | Change |
|---|---|
| `components/exhibitDetail.module.css` | Side-by-side gate `@media (min-width: 640px)` → `(min-width: 1024px)`; the comment records the decision |
| `app/page.tsx` | The room's `ParallaxWash` gains `dark:opacity-50`; the tablet-only stage cap (`sm:max-w-[34rem]`) is removed, so the stacked screen keeps main's 59% of the column; comments updated |
| `app/globals.css` | `html.dark #flagship { --surface-alpha-alt: 0.8; }`, documented beside the room's other scoped rules |
| `app/__tests__/flagship-exhibit.test.tsx` | Side-by-side gate at `lg`; no tablet cap; the dark floor pinned to this room only (exactly one scoped override, never the token blocks); the half-strength dark wash; the approved caption ink on both captions (3 new tests, 15 in the file) |
| `qa-reports/creative-release7-flagship-detail-2026-10-22/tools/a11y-room.mjs` | `--inject-css` and `--keep-shadow` options (used to measure candidate fixes before building one) |
| `qa-reports/creative-release7-flagship-detail-2026-10-22/README.md`, `qa-reports/2026-10-22_DesignCompile_flagship-detail.md` | One-line lifecycle banner each, pointing here; bodies unchanged |

Unchanged: the cinematic intro and its masters, the hero, `ContentReveal`, Skip Intro, the Motion page (`app/motion/`, its test, video, captions and poster all show no diff against main; `gates/protected-surfaces.txt`), every shared component, the ink tokens, content, media, dependencies and workflows.

## 4. The dark-mode text floor, measured

The room's backdrop moves. Its golden wash drifts with scroll, and the world behind its translucent panel changes tint with scroll, so a single frame can miss the binding state. `tools/contrast-scroll.mjs` takes each line's worst pixel inside its whole element box, with glyphs transparent and the line's own glow kept. It does this at four to six scroll offsets and reports the minimum. Floating chrome passing over a line (the phone menu button) is hidden for the sample and named in the JSON; it is occlusion, not contrast.

Minimum worst-pixel ratio over all scroll offsets, dark theme (threshold 4.5:1):

| Line | main 1440 | refined 1440 | main 768 | refined 768 | main 393 | refined 393 | main 320 | refined 320 |
|---|---|---|---|---|---|---|---|---|
| Eyebrow "Featured: the flagship" | 3.85 | **5.20** | 4.33 | **5.42** | 4.13 | **5.35** | 4.22 | **5.43** |
| Plate claim "SEVERITY 3 OF 5 · MODERATE · VERIFIED" | 4.27 | **5.45** | 4.25 | **5.48** | 3.86 | **5.12** | 3.81 | **5.09** |
| Plate provenance "CURRENT EXPLORE SCREEN · FLAGSTONE" | 4.09 | **5.19** | 3.99 | **5.35** | 3.70 | **4.91** | 3.91 | **4.97** |
| Status line | 4.31 | **5.34** | 5.51 | **6.32** | 5.30 | **6.03** | 4.87 | **5.70** |
| Capture caption | 5.09 | **9.07** | 5.25 | **9.48** | 5.10 | **9.47** | 4.67 | **9.05** |
| Detail tag (new in R7) | — | **8.14** | — | **7.64** | — | **7.18** | — | **7.00** |

1024 and 834 are in the JSON (refined minimum 5.25 dark). Light theme, refined: every line at every width ≥4.88 (minimum: the provenance at 320); main ≥4.92, unchanged. The "4.33:1" light reading at 393 in the first run was the menu button's shadow beyond the end of the claim's text; the probe now excludes floating chrome, and records what it hid.

Why this mechanism: the dark `accent-ink` and `ink-meta` tokens are tuned to clear 4.5:1 on a plain `world-surface-alt` (`lib/__tests__/ink-contrast.test.ts` pins accent-ink at 4.64:1 there), and this room adds the wash and the exhibit light on top. `UI_SYSTEM.md` names the panel alphas as the knob for exactly this ("set just above the alpha each surface needs to keep all text at WCAG AA over every world state"). Three alternatives were measured first and set aside: the wash at half strength alone (claim 4.39, eyebrow 4.33), an alpha of 0.76 (provenance 4.72), and recolouring the lines (it would change the house eyebrow and the plate's terracotta).

## 5. Verification (refined build; logs in `gates/`)

| Check | Result |
|---|---|
| `npm run typecheck` · `npm run lint` | clean · no warnings or errors |
| `npm run build` | clean; First Load JS `/` 174 kB on main and on the candidate; `/motion` present |
| `npm test` after the build | **127 files, 1175 passed, 2 skipped** (main `2fb857b`: 1148 passed, the same 2 skipped; +27 for R7) |
| Overflow census | 168 frames (28 routes × 2 themes × 320/375/414) and 336 frames (× 640/768/834/1024/1280/1440): no element crosses the viewport edge; the non-vacuity plant was caught on every frame |
| axe-core 4.11.4 (page and room; 1440, 768, 393; light and dark) | 0 violations |
| Screen-reader semantics | the room's ARIA snapshot is byte-identical to main's in all six combinations; the plate stays aria-hidden |
| Keyboard | one stop in the room, "View project", with the 2px terracotta ring, as on main |
| Reduced motion | 0 differing pixels between 120ms and 1600ms frames, light and dark, at 1440, 768 and 393; geometry identical to the normal frames |
| No JavaScript | complete composition (plate, screen, captions), no errors |
| Motion | 1440: the leader's one draw is unchanged (first movement 715ms, at rest 1831ms). Tablets and phones stack, so no leader is drawn |
| Text-only 200% | no overflow at 1440, 1024, 768, 393 or 320 (the "View project" pill crossing at 320 is on main too) |
| WebKit spot check (Playwright WebKit, not native Safari) | geometry matches Chromium at 1440, 768 and 393 in both themes; no errors |
| Performance | one request for the capture on both builds; image bytes identical; CLS 0; HTML +810 B and CSS +457 B gzipped against main |
| Screen size against main | within 1 to 2.5px at every width (1440 259 vs 261; 768 232 vs 233; 834 271 vs 272; 393 176 vs 177) |

## 6. Still open, needs a person or a device

- **Native Safari and VoiceOver (issue #38): OPEN.** Not tested here; nothing in this packet claims it. Check on iPhone and Mac that the plate is silent, the capture's alt is read once, and focus order is eyebrow, heading, plate, status, then "View project".
- The stacked tablet layout on a real iPad (portrait 768 and 834) and with Dynamic Type / larger text.
- The darker dark room on an OLED panel, and the leader's draw at 120Hz ProMotion.

## 7. Remaining improvements (unchanged ranking from v1, minus what this round fixed)

The dark-room text floor (v1's #1) is done. Still ranked:
1. The intro-to-portfolio seam (protected handoff, device-gated D7).
2. The closing invitation and contact intent (identity contract §15): an owner copy decision.
3. The room's two columns under text-only enlargement at 1024–1279 (on main too).
4. The Flagstone case-study hero's framed well (owner ruling `[bp4-lamp-as-built]`).
5. 320px wrap details, and the "View project" pill under 200% text at 320 (shared component).

## 8. Preservation

- **v1 (before this round):** `~/Desktop/SkyPi Studio Creative Releases/R7-flagship-detail_v1_2026-10-22_ed5b25b/`, holding the full repository, a single-file bundle with complete history, session evidence, SHA-256 receipts and verification. Every file was compared with the source by SHA-256 (identical). Git integrity was confirmed, and recovery from the bundle alone was tested.
- **The refined candidate** is preserved the same way in a new versioned folder beside it once committed (see that folder's `README-RECOVERY.md`).
- That Desktop folder syncs to iCloud Drive (Desktop & Documents), and with the disk nearly full, macOS offloads files from it. The bundle is the most robust artifact under sync.

## 9. Next steps toward an approved release

1. Independent visual review of `boards/` and `refinement-boards/` (desktop, tablet, phone; both themes).
2. Sky: push the branch and open a pull request against main (or authorize an agent to). CI runs lint, typecheck, the build-backed suite and the build; Deploy follows CI on `main`.
3. Device pass: the section 6 list together with the #38 checks.
4. Sky merges (portfolio changes are Sky-only; Art. 17 does not apply), then verifies the room on skypistudio.com in both themes at 1440, 768 and 393.
