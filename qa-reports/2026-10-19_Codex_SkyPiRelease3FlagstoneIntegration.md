# SkyPi Release 3 — Flagstone Integration

Date: 2026-10-19 (America/Vancouver)

**Candidate prepared for review; not cleared for release.** The two owner-approved Flagstone designs, the verified local Opus correction, and the owner-approved microsite table repair are combined on a new branch based on verified GitHub `main`. The independent homepage hotfix has not landed. Nothing was merged or deployed.

## DECISIONS FOR SKY

1. **Release order.** Recommendation: approve and land the independently investigated desktop intro hotfix first, then rebase this candidate onto that exact new `main` and repeat the gates below. The alternative is reviewing this pre-hotfix candidate now while keeping it draft. Impact: these results certify the current candidate only; they cannot certify a future combination with the hotfix.
2. **Remaining accessibility clearance.** Recommendation: retain a release hold for the documented contrast exceptions and real-device/assistive-technology checks. The new bounded rendered check confirms borderline light label/provenance samples below 4.5:1 and dark caption/kicker samples below 4.5:1; the earlier review also found short focus-ring arcs below 3:1 over video. Recommendation: follow up with a scoped contrast repair and a fresh rendered and device check before claiming AA. Alternative: retain this candidate unchanged for design review, with accessibility clearance explicitly outstanding. Visual approval and zero automated violations are not a WCAG conformance claim.

## Branch and source identity

- Integration branch: `codex/skypi-release3-flagstone-20261019`.
- Verified GitHub main/base: `78169e94c9f2b9810d3c9cdb18c54b0cacb7e297`.
- Tested application source: `43ef1c501b012515acc5d0313459589862c49939`.
- Approved Version A source: `claude/cloud-flagstone-version-a-20261018` at `f0ec3ed9185a79c720db8210e25c67b76e18dde9`; integrated by cherry-pick `995be00d3f8879e87e48bd9c2ce0b22851877c3c`.
- Approved 220px first-proof source: `claude/ecstatic-galileo-6nkhsx` at `6891cdbfc75b3adfadc4635e5926972c42b48a12`; integrated by cherry-pick `5f8eb33e523434e892940222a66aa8586ef2f1d2`.
- Both source branch tips and main were checked against GitHub. The primary checkout remained at stale `7dc04ff`, dirty and behind its tracking ref. Its documentation's claim that local main is ahead is stale; git and the remote checks govern this candidate.

## Actual local correction and microsite sources

These were found and read. No source-access blocker remains.

| Source | Original location | Verified SHA-256 |
|---|---|---|
| Opus correction | `~/SkyPi_Portfolio_Execution_Review/2026-10-19_flagstone-version-a-correction-r1/diff/correction-as-applied.diff` | `1fee357033de816d9ad8338302facecef64dd3f5a02b2a587927443689d261bf` |
| Table repair | `~/SkyPi_Portfolio_Execution_Review/2026-10-18_skypi-syn-t-016-flagstone-table-r1/SYN-T-016_candidate.patch` | `2213d3c360263a5cd88bcca84c8e88624081512857e7200a4a644d29f4a101fd` |

Each saved patch was byte-identical to the live uncommitted diff in its original worktree before integration. The exact patch bytes are included as deterministic gzip archives in the evidence folder; decompression recovers the SHA-256 listed above. Those worktrees were read-only. The separate table review at `2026-10-18_skypi-syn-t-016-independent-review-r1/` was read, including its conditional verdict and guard-reconciliation notes. Sky explicitly approved the reviewed table repair and its 20px spacing effect for this candidate. WO-B's draft guard is absent from this candidate; its review-proposed reconciliation was not imported or claimed integrated. If that separate draft is introduced later, reconcile its obsolete bare-wrapper assertion at that time.

The correction's source dates were verified in git: stills entered in `1cfb4b1a8a21d26a006a7c4519d6d6028555509a`; the clip entered in `a4584fdeaddd3b33dfceb850651d330470d40f2c`, both dated 2026-09-01. Capture dates remain unrecorded. This receipt supersedes the older Version A receipt's incorrect 2026-09-07 / `a531953` provenance and unconditional contrast wording; historical receipts were preserved.

## What changed and why

Seven production files and six test files changed relative to main, plus evidence and receipts:

- `app/work/[slug]/page.tsx`: the larger Flagstone hero figure and its own caption; three numbered proof panels; corrected provenance and dark text. Existing sections/routes and other project content are retained.
- `app/globals.css`: 114 added lines, confined to the new proof-row/breakout and capture-fit selectors. Existing rules, including cinematic rules, are unchanged.
- `components/ProductReveal.tsx`, `components/Plate.tsx`, `lib/media.ts`: optional capture-width/aspect threading and `figcaption` support, preserving existing defaults.
- `content/deliverables.json`: only Flagstone's `heroShot.width: 1290`, `height: 2803`, and first proof video's `autoplay: false` differ.
- `public/flagstone/accessibility/index.html`: focusable, caption-named scrolling table region; attributes only, using existing CSS.
- Tests: the two Flagstone page tests, Plate, ProductReveal, media, and Flagstone utility contrast tests. Existing assertions were retained; corrected provenance replaces the previously false expected fact.

Both cherry-picks conflicted only in generated `qa-reports/INDEX.md`. It was regenerated after each integration. Source changes in the shared page, stylesheet and JSON combined without conflicts. The reviewed local patches then applied cleanly.

## Preservation evidence

`source-preservation.json` contains hashes of the original hero, proof stills/poster and both video encodings. All are unchanged. Alt text, the museum plate and the three authentic captions are unchanged. The approved 220px treatment measures approximately 217.4 CSS px of image width on a 393px phone; its original 1290×2803 aspect is retained. The caption gap is 28px on phone and 48px on desktop.

A separately built exact-main baseline was compared with the candidate: all **27 routes** remain. After normalizing runtime build artifacts and class token order, **25 routes have identical DOM**, including `/`, `/float/`, `/tokyo-through-time/`, and every other case study. Only `/work/flagstone/` and `/flagstone/accessibility/` differ. The comparison retains JSON-LD, copy, media references, attributes and metadata. This is DOM/source preservation, not a claim of physical-device pixel equivalence.

`components/cinematic/`, homepage source/layout, Float, Tokyo Through Time, all original media, ProofArrival, ThemedMotion, dependency manifests and workflows have zero source diff from the verified base. The intro hotfix worktree is not a source for this candidate.

## Gates and actual results

Application source tested: `43ef1c501b012515acc5d0313459589862c49939`. Node 24.15.0, npm 11.12.1. Matching dependencies were copied into the new worktree; no dependency/lockfile change. Builds and browser matrices were run on the local machine. The final contrast probe and overflow census were run separately after stopping an overlapping probe to reduce memory pressure.

| Gate | Result |
|---|---|
| Production build | PASS, 25.0 seconds; static export completed |
| Lint | PASS, no ESLint warnings/errors |
| Typecheck | PASS |
| Full suite, after build | PASS: 115 files, 1,043 tests passed, 2 existing skips, 0 failures |
| Built-site integrity command | PASS: fresh build followed by 55 tests passed and 1 existing skip |
| QA index check | PASS |
| Diff whitespace check | PASS |
| Fresh baseline build and route comparison | PASS: 27 routes, only the two intended pages differ |
| Chromium 151 + WebKit 26.5 | PASS: 24 case-study scenarios and 8 table keyboard scenarios |
| Automated accessibility | Zero violations in the 16 JavaScript-enabled case-study scans and 8 table scans; incomplete checks retained |
| No-JavaScript Flagstone overflow | PASS: 24 frames across both engines, two pages, three widths and two themes; zero overhangs, 24/24 planted probes caught, JavaScript confirmed disabled |
| Site-wide overflow | PASS: 216 distinct frames = all 27 built routes × light/dark × 320/393/1024/1440 px. No visible element crosses the viewport. The planted 150%-width overflow was detected on all 216 frames. The old document scrollWidth reading was vacuous on 176/216 frames, so it is not the result used here. |
| Contrast probe | MEASURED HOLD: 72 stable samples across 393/1440 px, light/dark, six text targets and three scroll positions. Light label 03 reached 4.471:1 and provenance 4.481:1; dark caption 01 reached 3.981:1 and kicker 4.283:1. This bounded background probe does not clear dynamic video focus or every frame. |
| GitHub CI | Reported separately against the pushed draft PR head; local results above are not remote CI results |

Commands are recorded in `release3-flagstone-20261019/logs/gates.json`; local output is retained alongside it, with the home-directory prefix shortened to `~`. The reproduction commands below assume a checkout of the final candidate with matching dependencies installed and the browser engines available. The full suite exercises the built-output guards; the two skips are existing labelled placeholder tests. The suite emits the existing React development warning about `fetchPriority`; the same source line is present on main. Next emits its existing static-export `headers()` and `next lint` deprecation notices. None was hidden or treated as a new application failure.

The initial candidate and baseline builds used a loopback/Google Fonts allowlist; the additional repository `test:static` command performed its normal fresh local build. Browser requests were restricted to loopback and local embedded resources. No environment files or credentials were copied into the local fixture. No live database or authenticated archive was exercised.

## Reproducing the local gates

```bash
npm run build
```

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm test -- --maxWorkers=2 --minWorkers=1
```

```bash
npm run test:static
```

```bash
npm run qa:index:check
```

The tracked repository overflow command and its first failed log are retained. The same element census and non-vacuity proof then passed in the diagnostic copy; its only substantive runtime change was bounded recovery from a browser navigation race. The first diagnostic-copy startup had a misplaced shebang and was corrected before measurements. A partial diagnostic run was deliberately discarded after the separate `test:static` command rebuilt `out/`; the final census uses the settled export. A parallel contrast attempt was stopped to reduce memory pressure and rerun by itself. The diagnostic copy keeps the census and its planted-overflow proof unchanged; it adds per-frame logging, JSON results, and at most two retries only for a destroyed navigation context. It must be run from the candidate checkout because its fixture root is the working directory. The QA network guard blocks non-loopback requests. The final census recorded no blocked external requests. A targeted no-JavaScript census of the Flagstone case study and accessibility microsite used the same element measure in Chromium and WebKit and passed all 24 frames with JavaScript confirmed disabled.

```bash
NODE_OPTIONS="--require ./qa-reports/release3-flagstone-20261019/tools/browser-loopback.cjs" OVERFLOW_RESULTS=/tmp/skypi-release3-overflow.jsonl node qa-reports/release3-flagstone-20261019/tools/overflow-census-diagnostic.mjs --widths 320,393,1024,1440
```

Serve the local export using the range-capable fixture below; use the printed loopback URL for each browser matrix (the final argument selects one engine).

```bash
node qa-reports/release3-flagstone-20261019/tools/serve-range.mjs out 0
```

```bash
node qa-reports/release3-flagstone-20261019/tools/verify-release3.mjs http://127.0.0.1:PORT /tmp/skypi-release3-chromium chromium
```

```bash
node qa-reports/release3-flagstone-20261019/tools/verify-release3.mjs http://127.0.0.1:PORT /tmp/skypi-release3-webkit webkit
```

```bash
node qa-reports/release3-flagstone-20261019/tools/contrast-probe.mjs http://127.0.0.1:PORT /tmp/skypi-release3-contrast.json
```

```bash
node qa-reports/release3-flagstone-20261019/tools/overflow-nojs.mjs http://127.0.0.1:PORT /tmp/skypi-release3-nojs-overflow.json
```

## Screenshots and browser checks

96 screenshots are indexed in `release3-flagstone-20261019/screenshots.html`. Desktop is 1440×900; phone is 393×852. Both themes were tested with normal motion, reduced motion, and JavaScript disabled in each engine. Arrival captures use the named viewport; full hero/proof captures extend viewport height at the same width to paint the fixed backdrop behind the complete section.

Verified: authentic image loading and dimensions; the three-panel desktop row and ordered phone stack; paused video on load/scroll; intentional keyboard Play/Pause; visible unobscured focus; pause surviving a theme change; native no-JS video controls; keyboard table scrolling in both directions and focus exit at 100% and 200% text.

**No-JS dark limitation:** the case study falls back to light without JavaScript, even with a dark browser preference. Those captures are labelled as the actual light fallback, not a successful no-JS dark theme.

The first WebKit attempts exposed QA-fixture issues: blocking same-origin blob icons, using Tab instead of Option-Tab, and serving video without HTTP byte ranges. The final WebKit matrix used the range-capable Node fixture and correct keyboard traversal, and waited for actual reveal settling/playback. The application source was unchanged. The failed attempts and their corrections are disclosed in `browser-results.json` and the retained logs.

## Accessibility limits and remaining work

The Opus corrections are integrated; their historical residual exceptions are not erased. The first quicker contrast probe saw an extreme transient outlier at one scroll position; the settled geometry-checked probe did not reproduce it. The first data is retained as inconclusive motion/timing evidence, not a pass or confirmed new defect. Earlier rendered review measured small sub-3:1 focus-ring arcs during particular video frames and borderline light labels/provenance, and documented inherited dark caption/kicker contrast dips over the moving wash. This turn verifies interaction and records a 72-sample bounded text-background probe (`contrast-final.json`); it does not repeat the every-frame focus-ring sweep or claim those historical exceptions are all resolved.

In the bounded probe, light label 03 and provenance reached 4.471:1 and 4.481:1, and dark caption 01 and kicker reached 3.981:1 and 4.283:1. The label and provenance use the approved Version A styling; the existing captions/kicker were not changed. These are measured release holds. Axe leaves `color-contrast`, `aria-prohibited-attr` and `video-caption` checks incomplete on the case study. They are review items, not zero-risk passes. The existing generic evidence container's name, the silent clip's text description and gradient-backed text were inspected against the prior independent findings. No physical Safari/iPhone, VoiceOver, Windows High Contrast hardware, or human motion acceptance was performed. Playwright WebKit is not actual Safari/device acceptance.

Review guidance used: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) and the installed React best-practices checklist. No unrelated component refactor was introduced.

## Precise next action

After Sky separately approves and lands the intro hotfix, recreate the isolated worktree if cleaned up, fetch the new main, rebase this integration branch onto that exact SHA, resolve any shared-file overlap without undoing the hotfix, regenerate the QA index, and repeat build, lint, typecheck, full suite, overflow and the browser matrix. Compare protected intro source against the new base, then obtain the outstanding device/contrast clearance and Sky's merge decision. Keep the PR draft until then. No merge, deployment or push to main is authorized by this receipt.

## Process self-check

- Efficiency: reused both approved implementation commits, their tests/receipts, and the exact reviewed local patches. Fresh testing was limited to the combined candidate and a single exact-main baseline.
- Overlap: the cinematic hotfix and Release 4 interaction work remain separate. No other agent's source or worktree was edited. Shared git worktree metadata was used only to create/remove this session's isolated checkouts.
- Simplification: preserved existing component defaults and CSS tokens instead of introducing new components or a new presentation system. No application-source change was needed to resolve the browser-fixture failures.
