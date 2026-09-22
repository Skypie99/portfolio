# P1 core closure receipt — cinematic finding deferred

**Disposition:** Four P1 core repairs PASS. Existing local source commit `679af3cb786bb1c709b3b18817e9e0a343080680` was reconciled and accepted without rewriting it. The cinematic performance finding remains **OPEN / DEFERRED_TO_CONTROLLED_EXPERIMENT**. No performance acceptance target was changed or claimed met. No push, merge, or deploy occurred.

## Identity, decision, and source scope

- Branch: `fix/p1-isolated-repairs`.
- Accepted P1 source commit: `679af3cb786bb1c709b3b18817e9e0a343080680`; tree: `00f6125f58287ed758c1c253a4b05f33a7441325`; sole parent and verified starting baseline: `058f75400ec562a14270cc366404fee63ea12716` (`origin/main` at reconciliation). There is exactly one commit between that baseline and the accepted source commit. No unrelated commit is interleaved; no write to the primary checkout occurred.
- The source commit contains only six modified core-repair files plus new `components/RouteFocus.tsx`. The exact seven-file preservation patch is `P1-Cinematic-Investigation-evidence/four-repairs.patch`, SHA-256 `b372fdcb63c584c35279c3045ed0f909a44b55596423583a7de50d11d993fe16`. All seven committed file SHA-256 values match the pre-investigation checkpoint.
- `components/cinematic/Layer.tsx`, `components/cinematic/plates.ts`, and `components/cinematic/StaticDesertFrame.tsx` match the verified baseline. Both the baseline-to-source-commit diff and the current tracked worktree diff are empty for `components/cinematic/**`. Protected `/runway/`, round data, featured data, and accessibility statement also have no baseline-to-source-commit diff. No cinematic behavior or image asset was committed.
- The reverted three-file experiment is preserved separately as `P1-Cinematic-Investigation-evidence/failed-cinematic-source-selection.patch`, SHA-256 `9793159c3d0655408be6553f140b0377913c411f5ffe995884614a346be4d1b1`. `git apply --stat` parsed exactly those three files. It is **not** part of the accepted source commit.
- Latest rebuilt `out/`: 349 files; sorted path-plus-file-SHA-256 manifest digest `6d717f4e67ad73c9d55450f14e0c840c1782f555d247a36d9b917c3c7c601199`. This is a local production build, not a deployment.

The source-selection experiment was introduced to meet the failed mobile performance gate. It selected lower-resolution assets at DPR 3, visibly reduced image detail, still made five requests, and remained well above the 2600 ms benchmark. The separate `fetchPriority` hint in `Layer.tsx` was part of the same performance experiment; its independent value was not validated against the full visual and request contract. Accordingly, the entire three-file experiment was reverted under Sky's default disposition. No image content, glow, pin length, first-frame composition, choreography, or reduced-motion behavior was changed.

## Exact source commit audit

| File | P1 repair served | Expected | Unrelated hunks | Result |
|---|---|---|---|---|
| `app/blog/[slug]/page.tsx` | Breadcrumb text reflow | Yes | None | PASS |
| `app/globals.css` | Cue placement and credential grid reflow | Yes | None | PASS |
| `app/layout.tsx` | Route focus mount outside private archive | Yes | None | PASS |
| `app/page.tsx` | Heading clause binding and Round V receipt | Yes | None | PASS |
| `components/AnimatedCertGrid.tsx` | Credential grid selector | Yes | None | PASS |
| `components/Hero.tsx` | Hero measure and avatar lazy loading | Yes | None | PASS |
| `components/RouteFocus.tsx` | Route focus and announcement | Yes | None | PASS |

The full parent-to-source diff was inspected hunk by hunk. The App Store P1.A source and prior historical work were neither duplicated nor reverted. `git diff --check` passed for the source commit.

## PASS — four preserved core repairs

| Repair | Candidate files | Final verification |
|---|---|---|
| Hero heading measure and clause binding | `components/Hero.tsx`, `app/page.tsx` | Three intact clauses on desktop in Chromium/WebKit; narrow heading retains bound leading “A”. The below-fold avatar remains lazy-loaded, with no generated headshot preload. |
| Route focus and page announcement | `app/layout.tsx`, `components/RouteFocus.tsx` | Six of six keyboard journeys (footer, rail, content × Chromium/WebKit) landed focus on `main`, at scroll 0, with the page-name status; the next key step stayed within main. `/archive/` remains excluded by existing `ChromeGate`. |
| Narrow cue, credentials, and breadcrumb layout | `app/globals.css`, `components/AnimatedCertGrid.tsx`, `app/blog/[slug]/page.tsx` | Cue/Skip Intro collision area 0 in all 25 home matrix cases. At 1280 px and 200% text, the farthest credential Verify right edge was 1145.66 px. At 390 px and 200% text, the blog title wrapped with `scrollWidth=clientWidth=262`. No real overflow in 160 route/width/engine cases. |
| Round V receipt | `app/page.tsx` | Every home matrix case showed `Round V` in the hero receipt; the existing Record band value remained `Round V`. Source round data was unchanged. |

The local, untracked `P1-Core-Closure-evidence/validation-summary.json` contains machine-checked assertions. The browser matrix contains 29 captures/probes with zero page errors. The representative 393 px DPR-3 opening frame after restoration was visually reviewed against the pre-experiment core candidate. Reduced-motion 393 px and 1440 px screenshots were pixel-identical; standard-motion screenshots were near-identical with tiny timing-dependent pixel differences. The restored `picture` selection fetched desktop AVIFs for the four live plates at 390 px DPR 3, as it did before the experiment. Eight of eight Skip Intro journeys passed across Chromium/WebKit, mobile/desktop, and standard/reduced motion.

## DEFERRED / EXPERIMENT — cinematic performance stays open

The accepted investigation report and raw waterfall remain local, untracked evidence; they are not part of this receipt commit. This table distinguishes the **historical approved experiment** from the **current reverted candidate**:

| State | Median LCP | Cinematic requests | Meaning |
|---|---:|---:|---|
| Original pre-experiment measurement | **7600 ms** | **5** | Accepted production source selection, before the exploratory cinematic edit |
| Corrected mobile source-selection experiment | **5916 ms** (fresh equivalent of earlier 5920 ms) | **5** | Faster, but failed the request and LCP gates and lost DPR-3 detail |
| Analysis-only mask-removal probe | **5712 ms** | **4** | Changed the authored later rim glow; never a valid implementation or acceptance pass |
| Current source after revert, freshly rebuilt and remeasured | **7608 ms** (7632, 7608, 7588) | **5** | Restored accepted cinematic selection; confirms finding remains open |
| Existing P1 contract | **≤2600 ms** | **≤4** | Unchanged; **not achieved** |

The experiment's final LCP resource was `mid-fg-mobile.avif` in all three runs. Its network download completed near **2948 ms**, while its final LCP event occurred near **5916 ms**. The remaining delay is strongly associated with the cinematic transform/compositor lifecycle after script initialization; the exact browser paint trigger remains unisolated. The corrected mobile tier visibly lost detail at DPR 3 because portrait `cover` enlarged narrow panoramic source crops by roughly 5.1–7.7 device pixels per source pixel. `arrival-cliff-mobile.avif` was fetched once by the content `<img>` and again by the CSS rim-glow mask, with a full second transfer. The current reverted build again selects the desktop content plates at 390 px DPR 3 while CSS still requests the mobile mask; its five-request behavior is the existing open finding, not a new fix.

The current post-revert run used the same exported-build profile: 390 × 844 CSS px, DPR 3, standard motion, fresh context per run, browser cache disabled, 150 ms latency, 200,000 B/s download, 75,000 B/s upload, cellular4g type, CPU 4×, three runs. Raw data: `P1-Cinematic-Investigation-evidence/post-revert-three-run.json`. No conclusion in this section releases, downgrades, or closes cinematic performance.

## Full regression gates against the accepted source commit

The source and browser gates below were freshly rerun on `679af3cb786bb1c709b3b18817e9e0a343080680` after cinematic restoration. The generated output and traces are untracked local evidence. The earlier visual matrix and cinematic measurements remain historical evidence for the same source bytes; the cinematic experiment was not rerun.

| Gate / command | Actual outcome |
|---|---|
| `npm run lint` | Exit 0; `✔ No ESLint warnings or errors`. Existing `next lint` deprecation and static-export headers notices printed. |
| `npm run typecheck` | Exit 0; `tsc --noEmit`. |
| `npm test` | Exit 0; **101 test files passed; 903 tests passed, 2 skipped**. Existing React `fetchPriority` warning comes from `components/ProductReveal.tsx`, not the restored cinematic files. |
| `npm run build` | Exit 0; static export and postbuild completed. |
| `npm run test:static` | Exit 0; its rebuild completed, then **2 files passed; 55 tests passed, 1 skipped**. |
| `node work/qa.mjs closure` | Earlier post-restoration run on the same seven source file hashes: exit 0; 29 visual/geometry cases; zero page errors; core assertions passed. |
| `node work/closure-focus.mjs` | Exit 0; **6/6** route-focus/announcement/next-key journeys passed. |
| `node work/closure-sweep.mjs` | Exit 0; 16 routes × two themes and a standard-motion pass, **48** cases total; **32/32 axe runs had zero violations**, one h1 per route, max CLS **0.00130**, reduced-motion animation count 0. |
| `node work/closure-overflow.mjs` | Exit 0; **160/160** route/width/engine cases had no real horizontal scroll or interactive element outside the viewport. |
| `node work/closure-skip.mjs` | Exit 0; **8/8** Skip Intro journeys passed. |
| `P1_OUTPUT=post-revert-three-run.json node work/p1-investigate.mjs` | Earlier post-restoration investigation on the same source bytes: exit 0; **5/5/5** cinematic requests; final LCP `mid-fg.avif`; median **7608 ms**. This is an open performance finding, not a core-repair gate failure. |
| `git diff --check` | Exit 0, no whitespace errors. |
| `git diff --exit-code 058f754..679af3c -- components/cinematic app/runway/page.tsx content/rounds.json content/deliverables.json app/accessibility/page.tsx` | Exit 0, no protected-surface change in the accepted source commit. |

The public browser sweep deliberately blocked non-local requests. `/archive/` logged one console error in each of its three cases, as in the previous baseline; private archive/auth behavior was not tested or changed, so a whole-site zero-console claim remains **unassessed**. `/accessibility/` retains its pre-existing reduced-motion-only text line, so literal text hashes differ across motion preferences; links and headings matched. Headless Chromium/WebKit verification is not native Safari, VoiceOver, or physical-device evidence. These known limits were not relabeled as passes.

```text
P1_SOURCE_COMMIT_STATUS: ACCEPTED_EXISTING_COMMIT
P1_CORE_STATUS: PASS
REGRESSION_GATE: PASS
CINEMATIC_SOURCE_DIFF: NONE
P1_CINEMATIC_STATUS: DEFERRED_TO_CONTROLLED_EXPERIMENT
PUSH: NO
MERGE: NO
DEPLOY: NO
```

## Accepted source commit and what's left

The **only files** in the accepted P1 source commit are:

1. `app/blog/[slug]/page.tsx`
2. `app/globals.css`
3. `app/layout.tsx`
4. `app/page.tsx`
5. `components/AnimatedCertGrid.tsx`
6. `components/Hero.tsx`
7. `components/RouteFocus.tsx`

Historical investigation reports, screen captures, patches, raw traces, and `work/` scripts remain untracked as local evidence and should not be mistaken for product source or a passed cinematic experiment. This receipt records the adopted source commit; it does not authorize push, merge, or deployment. The cinematic performance item remains open for a separately controlled experiment; no further cinematic source work is authorized now.

## DECISIONS FOR SKY

**Decision:** Whether and when to merge, push, or deploy the accepted P1 core source and this receipt. **Recommendation:** Keep those production actions owner-controlled and keep cinematic performance in its separate controlled experiment. **Why:** the core source and scoped regression suite passed while the existing cinematic target remains unmet. **Alternative:** defer integration and retain these local commits for review. **Impact:** neither local commit publishes a production change or closes the cinematic finding.
