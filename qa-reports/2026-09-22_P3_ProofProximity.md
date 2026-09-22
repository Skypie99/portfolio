# Portfolio 4.0 P3 — Story and proof proximity

- **P3_STATUS:** PASS_WITH_DOCUMENTED_EXCEPTIONS
- **P3_REGRESSION_GATE:** PASS_WITH_INHERITED_LIMITS
- **Branch:** `story/p3-proof-proximity`
- **BASE_COMMIT:** `92404f133f0b88a1cdd9f64680536378d3c48f0f`
- **BASE_TREE:** `3c32bdaa9415a595279050db29df4afdd19a2631`
- **OWNER_APPROVED_CANDIDATE_TREE:** `708193eea2b890ace9b8670af96eec7d48ff9860`
- **P3_SOURCE_COMMIT:** `01705b5dd5f96bdf6cb1cb17487293dc5b95c147`
- **FINAL_SOURCE_TREE:** `a8fa7e742427885dda1de8f45570092b8058ed4b`; it differs from the approved candidate only by removing the mixed Flagstone gallery date and updating its two stale test assertions.
- **COMMIT / PUSH / MERGE / DEPLOY:** local source and receipt commits / NO / NO / NO. The receipt commit is recorded in the final handoff because a commit cannot contain its own SHA.

## FILES_CHANGED / what changed

| File | Change |
| --- | --- |
| `app/work/[slug]/page.tsx` | Render existing proof assets in the supporting narrative section, retain the P2 media-aware heading wording as an H3 inside that section, add short three-part hero captions, and place related cards after the contact invitation. Existing media sources, video forwarding, frame classes, and links remain. |
| `content/deliverables.json` | Add four hero captions, four body status beats, documented constraint/limit headings using existing prose, four complete non-flagship gallery date sets, the Ghost Code My role heading, the AccessMap repository label clarification, and the one authorized Dashboard sentence deletion. |
| `lib/schema.ts` | Validate the optional three-part hero caption. |
| `app/page.tsx` | Re-register the existing honest-limit sentence as a visual stop without changing the section's text content. |
| `lib/__tests__/recruiter-copy-truth.test.ts` | Narrowly permit the exact AccessMap historical repository label while continuing to reject that name everywhere else in current-facing product copy. |
| `app/__tests__/flagstone-first-impression.test.ts` | Assert that the Flagstone proof gallery is consistently undated after owner-approved normalization. |
| `lib/__tests__/static-integrity.test.ts` | Assert the built Flagstone gallery has no capture-date stamp while retaining its separate receipt date. |
| `qa-reports/2026-09-22_P3_ProofProximity.md` | This receipt. |
| `qa-reports/P3-ProofProximity-evidence/` | Local, uncommitted baseline/candidate measurements, 44 full-page screenshots, 12 inspected detail crops, 4 inspected focus captures, browser QA JSON, and `visual-index.json` with filenames, dimensions, byte sizes, and SHA-256 hashes. |

`work/` contains untracked local measurement scripts/logs and the temporary index. Neither it nor the large local evidence directory was included in the two commits. The primary `~/Portfolio/` checkout was read only. P3 was created from the exact P2 receipt after verifying the branch and worktree did not exist; tracked status was clean at creation. No dependencies were installed.

Git truth differs from one line in the untracked primary `AGENTS.md`: at session start, primary `main...origin/main` was **0 ahead / 65 behind**, whereas that document says local main is ahead. P3 did not use either main as a base and did not change the primary checkout; the stale sentence should be corrected by its owner.

## P3_CURRENT_STATE_REVALIDATION — COMPLETE

**CURRENT_STATE_REVALIDATION: COMPLETE.**

The P2-derived baseline was built and captured **before source editing**, at 1440/393 × light/dark for all five case studies plus 1440/393 home. `baseline/measurements.json` records document Y positions from the built page. The five source bodies and rendered pages agreed:

| Study | Baseline article H2 spine | Baseline hero / media / status / role / date state |
| --- | --- | --- |
| Flagstone | The problem → The approach → Where it stands → My role → What went wrong → Reflection | Existing three-part hero plate. Three proof shots after Reflection, plus an approach diagram inside the article. Status and failure beat already present. First shot dated `2026-09-01`; two current-product stills undated. |
| Claude Corp | The problem → The approach → What shipped → My role → Reflection | Hero uncaptioned. One team shot after Reflection. Status exists in hero ledger but no body status beat. Constraint exists in My role prose. Shot undated. Historical repo link says `Real commits (Flagstone repo)` but resolves to AccessMap. |
| Dashboard | The problem → The approach → What shipped → My role → Reflection | Hero uncaptioned. Think Tank and Dispatch shots after Reflection. Status exists in hero ledger; rejected single-flag shortcut exists in My role prose. Both shots undated. The identified hiring-audience sentence was present. |
| Prompt Library | The problem → The approach → What shipped → My role → Reflection | Hero uncaptioned. Opened-prompt shot after Reflection. Status exists in hero ledger; no-backend constraint exists in approach prose. Shot undated. |
| Ghost Code | The problem → The approach → What shipped → Reflection | Hero uncaptioned. Round clip after Reflection. Status exists in hero ledger; zero-dependency constraint and ownership sentence exist in approach prose. No My role H2. Shot undated. |

Baseline document order on every page was article/Reflection → sign-off → detached proof gallery → related cards → contact invitation. Baseline related cards were therefore not the last page section. The old diagnosis was directionally valid, but the exact pre-P2 distance figures were not reused. Every baseline `status` string was already present in the hero ledger and remains byte-identical. The four new body status beats repeat that accepted status truth for scan readers; they do not claim a new milestone.

### H2_SPINES_BEFORE / H2_SPINES_AFTER

| Study | Candidate article H2 spine |
| --- | --- |
| Flagstone | The problem → The approach → Where it stands → My role → What went wrong → Reflection |
| Claude Corp | The problem → The approach → What shipped → Where it stands → My role → The limit → Reflection |
| Dashboard | The problem → The approach → What shipped → Where it stands → My role → The rejected shortcut → Reflection |
| Prompt Library | The problem → The approach → The no-backend rule → What shipped → Where it stands → My role → Reflection |
| Ghost Code | The problem → The approach → Zero dependencies → What shipped → Where it stands → My role → Reflection |

The P2 `See it in motion.` / `A closer look.` conditional remains media-aware. It is an H3 now because proof is subordinate to its supporting H2. Sidebar TOC is generated from body H2s and includes the new body headings. **H2_DIFFERENTIATION: PASS.**

## DISTANCE_TABLE_BEFORE / DISTANCE_TABLE_AFTER

Method: in Chromium, reduced motion, light theme, 1440×900 or 393×852, use `getBoundingClientRect().top + scrollY` for the supporting article H2 and each shot's figure. Distance is `ASSET_Y − H2_Y`; all values are pixels in document order. Theme did not change placement. The original baseline and pre-closure candidate positions are in `baseline/measurements.json` and `candidate/measurements.json`; Flagstone and Dashboard final positions after date normalization are in the local `work/proof-closure.log`. The gallery's own media-aware H3 is **not** used as a substitute supporting claim.

| Study / supported beat / width | Before `H2_Y → ASSET_Y = DISTANCE_PX` | After `H2_Y → ASSET_Y = DISTANCE_PX` |
| --- | --- | --- |
| Flagstone / The approach / 1440 | 1869 → 6589, 6589, 7310 = 4720, 4720, 5441 | 1869 → 2375, 2375, 2825 = 506, 506, 956 |
| Flagstone / The approach / 393 | 2529 → 9460, 9960, 10441 = 6931, 7431, 7912 | 2529 → 3249, 3730, 4211 = 720, 1201, 1682 |
| Claude Corp / The approach / 1440 | 1824 → 4723 = 2899 | 1837 → 2284 = 447 |
| Claude Corp / The approach / 393 | 2132 → 6223 = 4091 | 2121 → 2722 = 601 |
| Dashboard / What shipped / 1440 | 2486 → 4596, 4596 = 2110, 2110 | 2335 → 2811, 2811 = 476, 476 |
| Dashboard / What shipped / 393 | 3170 → 5895, 6206 = 2725, 3036 | 2935 → 3565, 3895 = 630, 960 |
| Prompt Library / The approach / 1440 | 1860 → 4318 = 2458 | 1873 → 2261 = 388 |
| Prompt Library / The approach / 393 | 2134 → 5358 = 3224 | 2145 → 2627 = 482 |
| Ghost Code / The approach / 1440 | 1827 → 3784 = 1957 | 1840 → 2287 = 447 |
| Ghost Code / The approach / 393 | 2165 → 4736 = 2571 | 2154 → 2754 = 600 |

**PROOF_PROXIMITY: PASS_WITH_DOCUMENTED_EXCEPTIONS.** All first assets and all non-flagship desktop assets are within 800px. Flagstone's third desktop shot is 956px; its second and third mobile shots are 1201/1682px; Dashboard's second mobile shot is 960px. The approximate 800px target was not universally achieved. The claim and evidence relationship remains understandable: each figure follows its supporting H2, has a specific caption, and precedes the next narrative H2. The current mobile figures remain readable in sequence. No new >3000px evidence corridor was introduced. The pre-closure corridor comparison (largest interval between article start, in-article figure starts, and article end) was baseline → candidate at 1440/393: Flagstone 2711/4186 → 2712/4186; Claude Corp 2665/4062 → 2306/3406; Dashboard 2598/3855 → 1575/2097; Prompt Library 2254/3256 → 1915/2620; Ghost Code 1753/2602 → 2228/2557. Removing one date stamp shortened Flagstone's first figure and shifted the subsequent figures and H2s upward; it introduced no new content or gap.

**ACCEPTED_PROOF_PROXIMITY_EXCEPTIONS:** (1) Flagstone proof placement: third desktop figure 956px from The approach; second and third mobile figures 1201/1682px. (2) Dashboard second mobile figure 960px from What shipped. The owner accepted these coherent placements without moving proof solely to satisfy the approximate numeric target. They are not regressions.

## Source-backed additions

### HERO_CAPTIONS_ADDED — verbatim

| Study | Eyebrow / interpretive line / currency stamp | Source of truth and why supported |
| --- | --- | --- |
| Claude Corp | `Merge gate` / `Fifteen roles, one human-held merge gate.` / `In active use` | Existing The approach and My role say fifteen roles and Sky retains merge authority; existing accepted status says active use. This identifies the decision boundary beyond the summary. |
| Dashboard | `Demo seam` / `Synthetic decisions keep the private operator data out of the public build.` / `Public synthetic demo` | Existing The approach and My role describe separate synthetic demo read/write paths and private real data; existing status names the public synthetic demo. |
| Prompt Library | `One network call` / `The prompt and user key go directly to Anthropic.` / `Live and evolving` | Existing The approach and My role describe the direct Anthropic call and the user's key; accepted status supplies currency. |
| Ghost Code | `Mastery count` / `Three correct answers mark a card mastered.` / `Complete · live` | Existing The approach states the exact three-correct local counter; accepted status supplies currency. |

Flagstone already had a three-part hero plate. None of these captions required a new image or claim of a failure, adoption, or owner-only implementation.

### STATUS_LINES_ADDED

Each new short body beat reproduces its exact pre-existing, accepted `status` field in `content/deliverables.json` (source location: same project's `status`; why supported: existing hero ledger already rendered it):

| Study | Exact beat |
| --- | --- |
| Claude Corp | `In active use, on my projects only` |
| Dashboard | `Private operator app · public synthetic demo` |
| Prompt Library | `Live and evolving · no backend of mine` |
| Ghost Code | `Complete · live · no backend` |

### TRADEOFFS_OR_LIMITS_ADDED

No new failure fact was written. The following **existing body prose** was moved under a truthful H2, preserving its words. Source of truth is the baseline `content/deliverables.json` body at the named original location; the reason for support is that the same project already made the claim before P3.

| Study | Exact beat / baseline source location |
| --- | --- |
| Claude Corp | `The honest limit: these fences are prompt-level, not sandbox-level, and some of the overhead does not pay for itself.` — previously the final sentence of My role; now The limit. |
| Dashboard | `The alternative was a single demo-mode flag, which is one misconfigured environment variable away from serving my actual findings to the open internet. These controls cover different points in the path, but they share mode configuration.` — previously inside My role; now The rejected shortcut. |
| Prompt Library | `The no-backend rule turned out to be the whole product discipline. There was nowhere to offload a hard decision, so every feature had to be scoped to run on the client and earn its place.` — previously final approach paragraph; now The no-backend rule. |
| Ghost Code | `The runtime is one HTML file and a deck file. No framework, no build step, no dependencies, no server. That rule meant every feature cost exactly what it weighed, and it kept the whole game readable in one sitting, which is what a practice project needed to be.` — previously second approach paragraph; now Zero dependencies. |

**PROJECTS_WITH_STATUS_ONLY:** none. Each non-flagship already contained a documented limitation or rejected alternative; no invented failure was necessary. A word-multiset comparison of all five bodies passes after removing only the newly repeated status lines, structural headings, and the authorized Dashboard sentence. Flagstone body SHA-256 remains `1367cd913756f537c98b2158a99c598faf1592cdb7e7e638cd858848a29dea83` before and after.

### GHOST_CODE_MY_ROLE_RESULT

**PASS.** Baseline: the ownership sentence followed the one-file runtime paragraph within The approach. Candidate: the same sentence, byte-identical, is under the explicit My role H2 after Where it stands. It states Sky chose the concept/deck/constraint, while agents did most implementation, validation, and accessibility audits; no ownership was inflated.

### CAPTURE_DATES_ADDED / CAPTURES_LEFT_UNDATED

| Gallery | Exact added date | Reliable local evidence |
| --- | --- | --- |
| Claude Corp team, light and dark | `captured 2026-09-05` | `content/showcase.manifest.json`, `scene: team`, matching shipped paths, both themes. |
| Dashboard Think Tank and Dispatch, light and dark | `captured 2026-09-05` | Same manifest, `scene: think-tank` and `scene: dispatch`, matching shipped paths, both themes. |
| Prompt Library prompt detail, light and dark | `captured 2026-07-31` | Same manifest, `scene: prompt-detail`, matching shipped paths, both themes. |
| Ghost Code board and round clip, light and dark | `captured 2026-07-31` | Same manifest, `scene: board` and `scene: clip:round`, both themes. |

**FLAGSTONE_CAPTURE_DATING: CONSISTENT_UNDATED.** The three Flagstone proof items share one gallery. The reporting-flow clip's pre-existing `2026-09-01` capture-date stamp was removed because exact dates for the two current-product stills could not be proven; all three gallery items now display no capture date. The separate Flagstone receipt date remains a dated `<time>` and is not part of this product gallery. Every non-flagship gallery remains wholly dated from its source manifest. No date was inferred from file age or commit proximity. The deliberate no-date open calibration round was unchanged.

### Other bounded edits

**DASHBOARD_SENTENCE_RESULT: REMOVED.** Exact deleted sentence: `This demonstrates the support-operations work of making blockers visible, routing decisions, and keeping evidence close to each handoff.` No other baseline prose was shortened.
**HOW_I_WORK_PULL_QUOTE:** `The honest limit: these fences are prompt-level, not sandbox-level.` The existing text node was wrapped and styled once; no repeated spoken content was created.
**HOW_I_WORK_TEXT_IDENTITY_PROOF:** SHA-256 of built `#how-i-work.textContent` at 1440, baseline, pre-closure candidate, and final closure build: `4b2280a2ae4a9d125521d39ad1c2be2a40d5993b38ca764e340b0b3d4f188e24`. **HOW_I_WORK_TEXT_CHANGED: NO.**
**ACCESSMAP_LINK_LABEL_BEFORE:** `Real commits (Flagstone repo)`. **ACCESSMAP_LINK_LABEL_AFTER:** `Flagstone commits (AccessMap)`. Target remains `https://github.com/Skypie99/AccessMap/commits/main`; the repository was not renamed.
**REFLECTION_FINAL_BEAT_RESULT: PASS.** Reflection is last in every article H2 spine.
**RELATED_CARDS_LAST_RESULT: PASS.** Candidate H2 order after the article is contact invitation → `Continue reading.` related cards → footer. At 1440, all five related H2 Y positions exceed their contact H2 Y positions; no proof appendix follows Reflection.

## Gates and regression results

| Command / gate | Actual final result |
| --- | --- |
| `npm run build` | Exit 0; static export and postbuild completed. |
| `npm run lint` | Exit 0; no ESLint warnings or errors. Next's deprecation/export notices remain. |
| `npm run typecheck` | Exit 0; `tsc --noEmit`. |
| `npm test` | Exit 0 after dating normalization and test updates; 101 files passed, 904 tests passed, 2 skipped. |
| `npm run test:static` | Exit 0; rebuild plus 2 files passed, 55 tests passed, 1 skipped. |
| `node work/qa-sweep.mjs` | Exit 0; 32/32 axe runs across established 16 routes × 2 themes had zero violations; one H1 in every route/theme/motion case; max CLS `0.001812` (≤0.01); reduced-motion animations zero. `/archive/` had the inherited one console error per state; `/accessibility/` retained the inherited motion-text difference. |
| `node work/qa-overflow.mjs --widths 320,393,768,1440,2560` | Exit 0; 160/160 route/theme/width frames had zero visible element overhang and zero real horizontal `scrollX` after `scrollTo`. Plant at 150% width detected 160/160, proving the element-rect census was live even though `scrollWidth` was vacuous under `overflow-x: clip`. |
| `node work/qa-focus-ring.mjs` | Exit 0; Ghost Code Play button focus-visible at 393/1440 × light/dark, minimum sampled ratio `4.088:1`, above both 3:1 and the prior 3.09:1 floor. |
| `node work/qa-skip.mjs` | Exit 0; 8/8 Chromium/WebKit × mobile/desktop × standard/reduced Skip Intro journeys. |
| `node work/qa-final-smoke.mjs` | Exit 0; Skip Intro in first three tab stops and in viewport on 10/10 width/theme frames (320,393,768,1440,2560 × light/dark); `/runway/` HTTP 200, one `Hi, Runway.` H1, zero page/console errors. |
| `node work/qa-closure-proof.mjs` | Exit 0; final Flagstone and Dashboard heading/figure coordinates and captions at 393/1440; Flagstone proof gallery undated, Dashboard proof gallery dated; Reflection final article H2 and related cards after contact. |
| Final `#how-i-work` browser text hash | Exit 0; SHA-256 `4b2280a2ae4a9d125521d39ad1c2be2a40d5993b38ca764e340b0b3d4f188e24`, identical to baseline. |
| `git diff --check` | Exit 0; no whitespace defects. |
| Protected-source and asset diff | Empty for `components/cinematic/**`, `app/runway/**`, `public/runway/**`, approved P2 artwork, showcase factory, and `content/showcase.manifest.json`. `public/showcase/` remains exactly 8,656,372 bytes / 8.26 MiB, below 10 MiB. Exactly Flagstone is `featured: true`. |

Two pre-approval interim failures were resolved before final QA: the first new AccessMap label exceeded the schema's 30-character maximum; an initial test run then found the old current-product-naming guard and an exact Flagstone `<time>` spacing assertion. The label was shortened, the guard narrowed to the one exact historical-repository link, and the original date markup spacing restored. During owner-approved dating normalization, `npm test` and the static test first failed because their old assertions required that date. Their assertions were updated to check the consistently undated product gallery and separately dated receipt, then both suites passed. The final command results above are from the corrected source.

The pre-approval full logs are stored locally in `P3-ProofProximity-evidence/*-final.log`; the final closure command logs are uncommitted in `work/*-closure.log`. Interim diagnostics were:

```text
String must contain at most 30 character(s)
AssertionError: claude-corp.links[1].label: expected 'Flagstone commits (AccessMap)' not to contain 'AccessMap'
expected built Flagstone HTML to contain 'captured<!-- --> <time dateTime="2026-09-01"'
expected Flagstone shot capturedDate to equal '2026-09-01'; received undefined after normalization
expected at least two Flagstone <time> elements; only the separate receipt date remains
```

**P1_REGRESSION_RESULT: PASS.** P1 source repairs, `/runway/`, Skip Intro, focus, and the protected cinematic files are preserved. The separate cinematic performance experiment stays **DEFERRED_TO_CONTROLLED_EXPERIMENT**.
**P2_REGRESSION_RESULT: PASS.** Approved Claude Corp and Prompt Library art, Dashboard active media, Ghost Code still-first video, and crop/factory source remain intact. The media-aware gallery wording is still conditional and the footage/screenshots are unchanged. Inactive P2 factory candidate cleanup remains **DEFERRED_TO_P4**.
**P3_REGRESSION_GATE: PASS_WITH_INHERITED_LIMITS.** This is a no-new-regression result, separate from the partial editorial proximity target.

## INHERITED_UNASSESSED_LIMITS / blocked / unassessed

**BLOCKED_ITEMS:** exact dates for Flagstone's report/community stills remain unproven; the gallery is consistently undated, so P3 closure is not blocked. Any future FC-01-dependent wording remains outside P3.
**UNASSESSED_ITEMS:** inherited archive console cause, inherited accessibility motion-text reason, native Safari/VoiceOver and physical-device visual acceptance.

- `/archive/` console limitation: inherited; this phase made no archive change and did not determine its cause.
- `/accessibility/` motion-text difference: inherited; not changed or reclassified as pass.
- Flagstone report/community capture dates: **SOURCE_UNRESOLVED**. Exact dates were not established, so the mixed gallery was normalized to consistently undated. A future phase may add dates only from exact source evidence for all relevant captures.
- FC-01 account/anonymous/verification wording: **BLOCKED_ON_FC_01** for any future proposal needing that truth. P3 made no Flagstone body wording change.
- Native Safari/VoiceOver and physical-device visual acceptance were not performed. Playwright/WebKit was used for the bounded Skip Intro regression journey; browser screenshots and axe used Chromium.

## VISUAL_EVIDENCE_INDEX

`qa-reports/P3-ProofProximity-evidence/visual-index.json` enumerates and hashes all **60 personally opened** images from the approved pre-closure candidate. It includes the full baseline/candidate matrix (five routes × 1440/393 × light/dark = 20 each), two home full pages per phase, ten candidate proof detail crops, two home `#how-i-work` crops, and four focus captures. Those screenshots still show the pre-closure Flagstone clip date; they are retained locally as historical evidence and are not claimed to picture the final normalized gallery. The final built HTML and `work/proof-closure.log` verify that all three Flagstone gallery dates are absent and record final coordinates/captions. The before/after document-order maps are `baseline/measurements.json` and `candidate/measurements.json`; final browser gate records are `sweep.json`, `focus-ring.json`, `skip-intro.json`, and `smoke.json`. The full-page images show the approved art and captures intact; detail crops were used to inspect caption and motion-control legibility at reading scale. The large evidence directory remains local and uncommitted.

## What's left

The approved P3 source is committed locally. The approximate 800px proximity target has the two owner-accepted exceptions listed above. The Flagstone product gallery is consistently undated; exact dates for its two stills remain unproven. Inherited `/archive/` and `/accessibility/` limits and native device acceptance remain unassessed. No P4 cleanup, production action, credential work, external send, push, merge, deploy, or source-project change was made.

## DECISIONS FOR SKY

None for P3 closure. Sky approved the exact candidate direction, the two documented proof-proximity exceptions, and the gallery-wide Flagstone date normalization. A later decision to add exact dates would require evidence for every relevant capture. P4 starts only from the final P3 receipt commit if Sky chooses to begin it; this session did not begin P4.
