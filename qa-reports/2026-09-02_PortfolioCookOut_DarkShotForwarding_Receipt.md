# Portfolio Cook Out — Dark Shot Forwarding Repair (receipt)

**Session:** PORTFOLIO-COOKOUT-DARK-SHOTS-20260902 · **Date:** 2026-09-02 · **Mode:** bounded repair + live verification
**Base (Prompt 2, untouched):** `b17972700e62cd6e65bd307a74b2481554b735bb` (tree `843055bc931f9828744bcf46617f34dd6fc599f7`)
**Worktree:** `/Users/skypie/Portfolio/.claude/worktrees/portfolio-recruiter-truth-repair-aad11f`
**Branch:** `claude/portfolio-dark-shot-forwarding-20260902` (created from exactly the base; `git merge-base --is-ancestor <base> HEAD` PASS)
**Final SHA:** the single commit on this branch (`git rev-parse HEAD`); reported in the session receipt.

Not merged, not pushed, not deployed. Sky merges.

---

## 1. Static finding

`content/deliverables.json` — every `shots[]` entry carrying `dark` (jq over the file, not the expected list):

| Project | Shot | Light base | Dark twin |
|---|---|---|---|
| claude-corp | 0 | `team.light.desktop.{avif,webp}` | `team.dark.desktop.{avif,webp}` + lqip |
| dashboard | 0 | `think-tank.light.desktop.*` | `think-tank.dark.desktop.*` + lqip |
| dashboard | 1 | `dispatch.light.desktop.*` | `dispatch.dark.desktop.*` + lqip |
| prompt-library | 0 | `prompt-detail.light.desktop.*` | `prompt-detail.dark.desktop.*` + lqip |
| ghost-code | 0 | `board.light.desktop.*` + clip `round.light.phone.{mp4,webm}` | `board.dark.desktop.*` + lqip + clip `round.dark.phone.{mp4,webm}` + poster |

Five shots, four projects — matches the Prompt 2 investigation. Only Flagstone shot 0 carries `matte` (`dark-mono`); no shot carries both.

`app/work/[slug]/page.tsx` at the base: the `<ShotProductReveal media={{ … }}>` object (lines 915–937) forwarded `src, alt, avif, webp, focal, lqip, video, matte, precropped` — **`dark` omitted**; **`matte: shot.matte` present** (Prompt 2 · Part C intact).

## 2. Live reproduction BEFORE the fix (dev server from this worktree, :3001, 1440×900)

Method. The Browser pane was hidden for the whole session, which leaves IntersectionObserver and lazy loading dormant, so for each shot the `.reveal` wrapper was given `reveal-shown` and the lazy `<img>`s `loading="eager"` (exactly what scrolling to it does in a live browser), the theme was set with `localStorage.theme` + reload (next-themes' own pre-hydration path), and the verdict was read from the DOM: the ProductReveal path marker (`data-themed-showcase` / `data-themed-motion` / neither), each layer's computed `display`, each media element's `currentSrc`, bounding box, decode state, and the **mean luminance of the pixels the browser actually decoded** (canvas `drawImage` of the displayed element; ≈0.9 = light capture, ≈0.1 = dark capture). Screenshots from the hidden pane and from a background Chrome tab came back as flat theme-colour panels and were not used as evidence.

| Shot | Light theme | Dark theme | Defect |
|---|---|---|---|
| claude-corp 0 | legacy path (no themed marker) · `team.light.desktop.avif` · 1600×1000 decoded · visible 498×311 · lum 0.914 | **legacy path · still `team.light.desktop.avif` · lum 0.914** · no dark layer in DOM | confirmed — light variant shown in dark |
| dashboard 0 | legacy · `think-tank.light.desktop.avif` · lum 0.951 | **legacy · still `think-tank.light…avif` · lum 0.951** | confirmed — light variant shown in dark |
| dashboard 1 | legacy · `dispatch.light.desktop.avif` · lum 0.956 | **legacy · still `dispatch.light…avif` · lum 0.956** | confirmed — light variant shown in dark |
| prompt-library 0 | legacy · `prompt-detail.light.desktop.avif` · lum 0.721 | **legacy · still `prompt-detail.light…avif` · lum 0.721** | confirmed — light variant shown in dark |
| ghost-code 0 | `data-themed-motion="single"` · one `<video>` in `ts-layer--light` (display block) · `round.light.phone.mp4` · readyState 4 · 390×844 · visible 498×311 | **`single` · lone layer `ts-layer--light` computed `display: none` · video 0×0 · displayed media count 0 · live "Play animation" button present** | confirmed — BLANK card in dark |

Card box in every case: 500×313, `aspect-ratio: 16 / 10`, caption rendered.

## 3. Root cause (confirmed, not assumed)

1. `deliverables.json` provides `shots[].dark` correctly (schema-validated at build).
2. `app/work/[slug]/page.tsx` built the `ShotProductReveal` media object without `dark`.
3. `ProductReveal`'s `isThemed = Boolean(media.dark || media.matte)` was therefore false for all five shots.
4. Stills fell through to the theme-blind `TactileMedia` plane → the light capture rendered in both themes (wrong variant, never blank).
5. The ghost-code clip fell through to `ThemedMotion` in "single" mode → one `<video>` tagged `ts-layer--light` with no twin; `html.dark .ts-layer--light { display: none; }` (the dual-theme gate) hid it → blank well with a live play/pause control. Same mechanism Prompt 2 found for Flagstone's matte, but with no `.ts-matte` ancestor the Prompt 2 override does not (and must not) apply.

## 4. Repair

`app/work/[slug]/page.tsx` — one field added to the existing media object, with a comment: `dark: shot.dark,` (after `video: shot.video,`). Nothing else in production code changed; ProductReveal / ThemedMotion / ThemedShowcase / globals.css / content / media files untouched. Scope widened: **NO**.

Expected and intended rendering consequence: these five shots now take the same themed path the case-study hero and work cards already use for dark twins (`lib/media.ts` forwards `dark` there). Stills move from the parallax `TactileMedia` plane to `ThemedShowcase`'s two static cover-fit layers in the **same** 500×313 / 16:10 well, same `object-position` (50% 50%), same caption and layout; the ghost-code clip gains its dark twin `<video>` with loop-continuity across the theme flip.

## 5. Tests

- **New** `lib/__tests__/shot-dark-forwarding.test.ts` — (a) the ShotProductReveal media object forwards `dark: shot.dark`; (b) it still forwards `matte: shot.matte`; (c) non-vacuous: the shipped content still has ≥1 dark-twin shot, each a real light/dark pair. **Red before the fix** (failed on exactly `dark: shot.dark`), green after.
- **Appended** to `components/__tests__/ProductReveal.test.tsx` — 6 routing guards: dark still → `data-themed-showcase="themed"` with one layer per theme sourcing its own variant (+ dark LQIP, no `.ts-matte`); dark clip → `data-themed-motion="themed"` with the dark `<video>` sourcing dark mp4/webm/poster; a pair always renders exactly `[light, dark]` layers; single-source still → legacy path (no themed host, no layers, one img); single-source clip → ThemedMotion `single`, no dark layer; matte → `matte` path on the exhibit mat, no dark layer.
- Prompt 2 tests preserved unmodified: `shot-matte-forwarding.test.ts`, `matte-theme-invariance.test.ts`, the ThemedMotion/ThemedShowcase matte regressions.
- Full suite: 87 files, 806 passed, 1 pre-existing skip.

## 6. Live acceptance AFTER the fix (same method, both themes, every affected shot)

| Shot | Light | Dark |
|---|---|---|
| claude-corp 0 | `showcase:themed` · layers `light:block / dark:none` · displayed `team.light.desktop.avif` 1600×1000 · lum 0.914 · 498×311 | `showcase:themed` · `light:none / dark:block` · displayed **`team.dark.desktop.avif`** 1600×1000 · lum 0.109 · 498×311 |
| dashboard 0 | themed · light shown · `think-tank.light…avif` · lum 0.951 | themed · **`think-tank.dark…avif`** shown · lum 0.157 |
| dashboard 1 | themed · light shown · `dispatch.light…avif` · lum 0.956 | themed · **`dispatch.dark…avif`** shown · lum 0.159 |
| prompt-library 0 | themed · light shown · `prompt-detail.light…avif` · lum 0.721 | themed · **`prompt-detail.dark…avif`** shown · lum 0.071 |
| ghost-code 0 | `motion:themed` · 2 `<video>` · light clip shown, plays (t 0→1.96 s, 390×844, readyState 4) · dark clip hidden | `motion:themed` · **dark clip `round.dark.phone.mp4` shown, plays (t 0→1.98 s, 390×844)** · light clip hidden 0×0 · poster `round.dark.phone-poster.avif` |

Every case: exactly one displayed media element, root 500×313 `16 / 10`, `object-position 50% 50%`, caption unchanged, one play/pause control on the clip. Exported HTML (`out/work/<slug>/index.html`) carries the `ts-layer--dark` layers and dark asset paths; ghost-code's export has `data-themed-motion="themed"`.

## 7. Flagstone regression (Prompt 2 matte fix)

| Theme | Path | Layer | Video |
|---|---|---|---|
| Light | `motion:matte`, `.ts-matte` + well 438×478 | `ts-layer--light: block` | `report-flow-current.dark.phone.mp4` plays (t 1.50 s, 780×1378) |
| Dark | `motion:matte`, `.ts-matte` + well 438×478 | `ts-layer--light: block` (scoped override holds) | plays (t 1.50 s, 780×1378) |

Shots 1–2 (single-source stills) unchanged on the legacy path (1257×1489, 1320×1480 decoded, visible). Identical to the pre-fix baseline captured earlier in the session.

## 8. Theme-switch continuity (real toggle button, view-transition callback stubbed to run synchronously because the hidden pane suspends paint)

- ghost-code (clip): light start → deliberate play (light t 2.08 s) → **toggle → dark**: `html.dark` set, `light:none / dark:block`, clock handed to the dark twin (both at 2.09 s), 1 host, 2 videos, 1 button, root `500x313@277` → **toggle → light**: back to `light:block / dark:none`, same node counts, same rect. No duplicate nodes, no blank state, no layout jump. (Auto-resume after the flip is intersection-gated and the pane's observers are dormant; the resume path is covered by `ThemedMotion.test.tsx` "the html.class flip pauses the hidden twin and resumes the visible one".)
- dashboard (stills, 2 figures): light → dark → light flips both layer pairs each time, both imgs decoded, 1 host per figure, root `500x313@277` throughout.

## 9. Quality gates

| Gate | Result |
|---|---|
| `git diff --check` | clean |
| `npm run lint` | `next lint` aborts with an ESLint config conflict caused by this worktree's location: it is nested under `~/Portfolio/.claude/worktrees/`, so ESLint's hierarchical lookup also loads the parent checkout's `.eslintrc.json` ("Plugin @next/next was conflicted between .eslintrc.json and ../../../.eslintrc.json"). Not a code finding. Equivalent run with the project config only — `npx eslint --no-eslintrc -c .eslintrc.json --ext .js,.jsx,.mjs,.ts,.tsx app components lib` — **exit 0, no warnings or errors**. |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 806 passed, 1 skipped (87 files). (First run in the fresh worktree showed 4 failures in the two built-HTML suites because `out/` was stale; green after `npm run build`.) |
| `npm run build` | PASS — 26 routes, export + prune-500 + og-png-alias OK |
| `npm run test:static` | PASS — 53 passed, 1 pre-existing skip (2 files) |

## 10. Files changed

- `app/work/[slug]/page.tsx` (+9: one forwarding line + comment)
- `components/__tests__/ProductReveal.test.tsx` (+121, appended block)
- `lib/__tests__/shot-dark-forwarding.test.ts` (new)
- `qa-reports/2026-09-02_PortfolioCookOut_DarkShotForwarding_Receipt.md` (this file)

Product copy: NO · Media files: NO · Other repos: NO · Prompt 2 commits/branch: untouched.

## Notes for Sky

- The one real-Chrome tab opened for screenshots could not be closed at the end because the Chrome extension disconnected mid-session; it is a `localhost:3001` tab and can simply be closed.
- Visible framing of the four still shots changes slightly by design (exact cover crop instead of the 12 %-oversized parallax plane) — same box, same focal centre, same caption.
