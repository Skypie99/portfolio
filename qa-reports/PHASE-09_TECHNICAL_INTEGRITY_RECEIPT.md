# PHASE-09 Technical Integrity Receipt

Status: IN PROGRESS — evidence checkpoint, not a gate. Final performance adjudication and final handoff will supersede this line before closure.

## Identity and authority

Prompt `SKYPI-PORTFOLIO-3.0-P09-LEAD`; Phase09, Technical Integrity, SEO and Maintainability. Planning authority `SKYPI-PORTFOLIO-3.0-MASTER-20260903`. Repository `Skypie99/portfolio`, remote `https://github.com/Skypie99/portfolio.git`. Historical planning SHA/tree `19d946c9c48b325bce5d3a9f292d2cb48450cf01` / `ee0be9130c2b4f9de5de956c6cdc33b9d151c682`, never used as a reset target.

Actual integration start: `eb67733403ba434cb8de94003037666f80aa6592`, tree `1746309ac60e57cda3873119d19248a905056896`, branch `claude/portfolio-3.0-phase00-baseline-20260903`, worktree `/Users/skypie/Portfolio-3.0-baseline`. Clean tracked and untracked state; no merge/rebase/cherry-pick/revert/bisect or Git locks. P08 source `f85cde880b491d3fe47cc10eca50b5dabfeff3e5` / `ed08949b91a22ebf21b872c0b7d9820b30333b75`, P08 PASS and SAFE_FOR_P09_BASELINE verified. P02 foundation and P07 preserve/CTA receipts present. Exact requested baseline matched; no historical reset or reconciliation.

Upstream origin/main and read-only live remote main both `19d946c9c48b325bce5d3a9f292d2cb48450cf01`. Local primary main is `7dc04ff2be3d8754516cb218bc4f4a08079dfcd3`, 0 ahead / 3 behind origin/main. No fetch/ref mutation; no primary-checkout writes. Existing unrelated/prunable worktrees preserved. Current Git overrides stale narrative statements.

Lead writer `/Users/skypie/Portfolio-codex/portfolio-3.0-phase09-20260907`, branch `codex/portfolio-3.0-phase09-20260907`. A/B each created a separate worktree at exact P08 base; one writer each. Read-only contract review shared the lead checkout without writes. Existing node_modules linked for execution; no install/update. All temporary server/browser contexts owned by this run.

## Candidate and serialized accepted changes

Frozen build source: `d680cbcb5cdf8016f71a84b1476fb03867be9e52`, tree `e9418b9c1154a9ad99475008a9719e2bd296e571`. Later commits contain QA evidence only. Final evidence-tip identity will be reported after receipt commit, avoiding self-reference.

| Lane | Isolated branch/worktree suffix | Lane commits | Accepted lead commits |
|---|---|---|---|
| P09-A | portfolio-3.0-p09-a-20260907 | 79df3cb, efdc668; validation e00df157 | fda0ce9, a770768; validation ce608fd |
| P09-B | portfolio-3.0-p09-b-20260907 | e35c6b8, 756d4e1 | d1a6ed6, a494bf1 |
| Lead | portfolio-3.0-phase09-20260907 | d680cbc comments; later evidence only | serialized in lead branch |

A final lane tree `3187554cbf4758b8247da7d37249a6dbf5a24285`; B final tree `a462cff98ef5fd8c0fe86df6841f0ebbcb8ec10f`. All safe lane changes reviewed from actual diffs, logs, emitted metadata and dependency evidence. Gated indexing implementation was not committed or integrated. No manifest, dependency, production rendering, CSS, media, privacy/auth/data behavior change.

Applied non-QA files:

- `lib/metadata.ts`: comment corrected to describe existing noindex route self-canonicals.
- `app/layout.tsx`, `next.config.mjs`: comments corrected to distinguish document meta delivery, static export, and explicitly configured future host enforcement. No header configuration value changed.
- `components/__tests__/AnimatedCertGrid.test.tsx`, `A11yReceipts.test.tsx`: server render tests run in Node; HTML parser remains locally scoped without global window.
- `components/__tests__/GalleryWall.test.tsx`, new `GalleryWall.ssr.test.tsx`: move server-floor case to Node; browser tests stay jsdom. Existing server assertions retained using real deliverables.

Separate receipts: `PHASE-09A_SEO_HEADERS_RECEIPT.md`, `2026-09-07_Codex_Phase09Dependencies.md`, `2026-09-07_Codex_Phase09Warnings.md`, and `PHASE-09C_PERFORMANCE_INTEGRITY_RECEIPT.md`. Underlying evidence in `phase-09-a`, `phase-09-b`, `phase-09-evidence`.

## T-130–134 / F-028, F-029: metadata, indexing and host truth

Fresh frozen export: 26 HTML documents. Fourteen indexable app routes have exact absolute HTTPS self-canonicals and sitemap entries. Private Archive and unlisted Runway have noindex,nofollow plus self-canonicals and are omitted from sitemap. Three static meta-refresh aliases claim their destination canonical and are omitted. Two noindex error documents retain their existing home-canonical inheritance and explicit error-route exclusion. Five public Flagstone utility pages lack canonicals and sitemap inclusion; this remains a phase-owned HOLD.

Full route matrix, title/robots/redirect/JSON-LD and HTML hashes: `phase-09-evidence/final-seo-inventory.json` and `artifact.json`. The five missing routes are `/flagstone/`, `/flagstone/accessibility/`, `/flagstone/privacy/`, `/flagstone/support/`, `/flagstone/terms/`. No cross-host Portfolio canonical found. Robots permits crawl/discovery of noindex directives; it is not an access-control mechanism. XML RSS and JSON Feed parse, agree on their one post, and use an indexable sitemap URL. Person, SoftwareApplication and BlogPosting JSON-LD parse; no speculative claims added.

P09-A measured public host GET responses on September7, normal TLS and allowlisted headers only. Primary HTTPS works, but HTTP apex remains HTTP200; the GitHub Pages HTTPS alias ends at HTTP apex. Sampled primary custom-domain responses lack CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy and Permissions-Policy response headers. Main HTML delivers a meta CSP/referrer policy; sampled static utility HTML does not. Configured Next headers are not live export enforcement. GitHub.io Archive separately emits HSTS, so absence on the custom domain is not generalized to all GitHub Pages hosts. The matrix and raw observations are in the A receipt and `production-headers.json`. No enforcement posture accepted, no host/security mutation.

Public Studio Archive vanity TLS still fails; its separate live canonical remains the vanity URL. This is the known P06/P11 unpublished repair boundary, not proof that the locally accepted fallback failed. No cross-repo/publication work was reopened. Phase09 local source and current deployment are explicitly separate.

## Exact banked indexing approval candidate

Seven-file patch `phase-09-a/APPROVAL_REQUIRED_flagstone-indexing.patch`, SHA256 `35729e25bff77ee787b497a5a531d587025dca14214160a119d49f739f964eeb`, adds five self-canonicals, five sitemap entries and removes the earlier microsite exclusion in the static canonical guard. It changes no legal wording, scripts, CSS, privacy data or auth behavior.

Original base eb677334; patch-only prospective tree `659f842f842cc435e94a3f70bfa7854718b950b7`. Applied only to a disposable index on frozen lead source d680cbc, it yields prospective tree `9b53c506ba4c878c9e46f46b392ed443dd5400cf`; the real lead index/source is untouched. Applicability rechecked after accepted integration.

For concrete review, the exact patch was temporarily applied only in A's isolated lane: production build/typecheck PASS; focused metadata/static/anchor tests **57 passed, 1 existing skip**; 26 HTML with **19 correct indexable canonicals and 19 sitemap entries**, zero cross-host/missing canonical, no redirect/noindex/error inclusion, feed parity PASS. The exact patch was then reversed and its seven paths proved restored with git diff --exit-code. No policy adopted and no gated source commit exists. Candidate validation logs are retained. Future owner-approved application still requires integrated reruns, not reuse of A's now-stale ignored out/.

## T-135 / F-031: current dependency disposition

Fresh full and production-only npm audits, September7 11:04 UTC: **2 vulnerable package records, 1 high +1 moderate, 0 critical; four distinct PostCSS GHSAs**. Both audit commands exit1 because vulnerabilities remain. Full advisory/path/precondition matrix and raw JSON are in the dependency receipt and phase-09-b evidence.

Path: portfolio → direct next15.5.25 → hard-pinned nested postcss8.4.31. Root development PostCSS8.5.28 is outside the reported ranges; changing it alone would not fix the nested instance. Next builds process source CSS with a from filename. Static production has no request-time Next/PostCSS server, and no public visitor-to-CSS-build input path was established. Compromised/malicious build input remains relevant. Dependency membership is not proof of public runtime exploitability.

Four advisories: GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849. Current npm says fixAvailable=false. Historical Next16-only remediation is not repeated as verified-current. No audit fix, override, install or migration. Residual acceptance requires Sky; P02 history is not silently promoted into P09 approval.

## T-136 / F-033: warning disposition

Real SSR tests had selected Reveal's browser layout effect because jsdom created a global window before module import. Correct Node server environments remove those warnings at test ownership without changing product motion. Focused SSR/browser protection:19/19 PASS. Final full suite confirms no SSR warning.

Native fetchPriority is correct for Next15 App Router's bundled React19.2 canary. Vitest resolves package React18.3.1 and warns. A lowercase experiment was rejected and reversed; no runtime spelling change or console suppression. Warning stays visible and is narrowly bounded by package-versus-App-Router renderer evidence plus zero warnings in the final public runtime sweep. The lead accepts this warning criterion without suppression; the supplied prompt requires approval for suppression, not visible bounded retention. This supersedes P09-B-WARN-01 in the lane receipt. Existing next-lint deprecation and export-header notices are retained; no framework modernization was introduced.

Initial diagnostic no-out run failed the build-dependent recruiter-copy suite and skipped static guards, plus an intermittent GSAP rAF-after-teardown error. Both are retained in lane logs. Focused GSAP passed; the two lead full suites with a built artifact pass without unhandled error. These successful reruns do not erase the initial observation or claim the intermittent risk impossible.

## T-137–142 / F-035: artifact and performance

Final artifact digest (sorted path/size/SHA256 inventory) `444c1108258451fa7917c0266e384e51c6e970f0158bc008a4183f7cbcd43c86`. Exact per-file and source hashes in `phase-09-evidence/artifact.json`; binding in `source-artifact-binding.json`. All same-path JS/CSS/font/media hashes match the fresh P08 build. New build IDs and sitemap timestamps regenerate HTML/RSC/manifests; no deterministic-build claim is made from raw cross-build digest inequality.

Static scanner checks actual HTML internal/relative/absolute links, fragments, referenced assets, alt presence, duplicate IDs, heading order/H1, blank link names/hrefs and target-blank rel protection. **Zero public static/semantic/link/asset issues**. One unchanged private Archive pre-auth shell H1 census exception is explicitly outside public document semantics; it is not an auth/AT pass. Canonical HOLD remains separate and is not erased by the other zero counts. Full post-build suite exercises existing prohibited-copy, CTA, identity/status, private-boundary and static guards.

Final runtime:24 public HTML routes/documents including redirects and both error documents, desktop1440×900, light, normal motion, natural scrolling/lazy media. **0 console/page errors, 0 failed requests, 0 HTTP errors, 0 broken loaded images**. Private Archive and unlisted Runway excluded from runtime; their static output inspected. No authenticated access or private data. Screenshots of Home and Flagstone inspected as bounded checks, not full Phase10 certification.

External public HEAD checks:26 unique URLs,25 successful2xx, LinkedIn999 bot-block. Normal TLS, redirects followed,20s cap; HEAD status is not authenticated GET/content proof. URL set rechecked identical on final artifact. Archive vanity header probe TLS failure belongs to the separate known publication boundary above.

Fresh performance methodology, tables and final interpretation are in the separate C receipt. Exact Phase00 deployment ZIP was recovered from retained scratchpad and matches recorded SHA256 `9eb7b5696e6f5381eb98cd77e5b8d0433ec432a650caf86fcd46fb1a74d2e11d`, size30,848,225 bytes, artifact9870638981, source19d946c. Remote artifact metadata now says expired=true; retained copy recovery avoids rebuilding a historical toolchain. Original September3 two-route live NavigationTiming observations remain historical, not generalized to mobile or LCP. September7 measurements compare the exact deployed artifact and final candidate with one current harness and explicit local conditions.

No performance optimization applied. The unlisted18MB Runway video is out of recruiter-funnel optimization scope. No visual/media/motion trade-off accepted.

T142 architecture review in `phase-09-evidence/test-contract-review.md`: meaningful existing coverage for identity/claims, CTA parity, dated Flagstone status, Support Operating Record, intro history/focus, CSS contrast/a11y scope, canonical helper/output and public/private claims. Canonical microsite guard gap is covered only by the banked patch. No redundant count-driven tests added. Status tests preserve dated evidence rather than querying Apple live.

## Required gates and actual results

| Gate | Result |
|---|---|
| npm run build, frozen d680cbc | PASS; production export/postbuild; existing static-header notices retained |
| npm run lint | PASS; no ESLint errors/warnings; CLI/export notices retained |
| npm run typecheck | PASS |
| npm test, integrated prebuild | 98 files PASS;873 passed,2 existing skips |
| npm test, final post-build | 98 files PASS;873 passed,2 existing skips; no unhandled errors |
| Metadata/sitemap/feed/JSON-LD scan | Mechanisms valid; five missing canonicals require policy; no phase-wide PASS |
| Full/production audits | Both exit1; two vulnerable package records, fourGHSAs; owner acceptance pending |
| Warning reproduction/SSR targeted | Ownership established;19 SSR/browser tests pass; React18 warning visibly bounded, no suppression |
| Exact banked indexing patch | Build/typecheck PASS;57 tests passed,1 existing skip; unapplied |
| Frozen runtime sweep | 24/24 complete, zero error/failure/broken-image counts |
| Internal/static/semantic/asset scan | Zero public issues; private shell exception retained |
| External link scan |25/26 2xx; LinkedIn999 bounded automation limitation |
| Diff check | PASS; source diff is comments/test organization only |

Every command's raw output remains in the three evidence directories. `test:static` wrapper was not rerun redundantly: final production build followed by full Vitest includes the static and anchor suites. Two existing skips are the labeled no-out sentinel cases in static-integrity and recruiter-copy-truth; out exists, so their real build-dependent suites execute and their fallback sentinel cases remain skipped. No result counted as a passed test if skipped.

## Preserve adjudication

PR001 cinematic first frame; PR013 theme atmosphere; PR014 reduced motion; PR017 accessible interaction; P07 native intro/history/focus; P08 responsive/a11y repairs; flagship hierarchy; support-first identity; Skyler/SkyPi relationship; CTA parity: **PASS as bounded preservation**. Product code/style/media identity plus full existing contracts and final public Chromium sweep support preservation. No new broad Safari, VoiceOver, physical device, universal accessibility or field-CWV certification. Phase10 remains owner of final integrated AT/Safari matrix.

PR009 dated/method-scoped numbers: PASS. PR012 private/public/synthetic boundaries: unchanged source and claim guards PASS within static scope, no authenticated/data access. PR020 historical evidence: append-only retained. `preserve-identity.json` records actual existing path byte comparisons. Performance relation to Phase00 remains separately judged from measured data, not inferred from P08 byte equality.

## DECISIONS FOR SKY

1. **Approve the exact tested Flagstone indexing patch.** Recommendation: approve all five existing public utility self-canonicals, sitemap entries and guard. Why: currently indexable public pages lack canonical coverage; tested patch closes all five without text/behavior changes. Alternative: explicitly choose a different unlisted/noindex set. Impact: full T130–132 closure needs policy approval and integrated reruns; no permission to deploy.
2. **Decide custom-domain transport/header posture.** Recommendation: Sky review HTTPS enforcement and plan appropriate host-level headers, retaining measured limits until fresh evidence. Why: HTTP200 and HTTPS-alias-to-HTTP are observed; static config cannot enforce headers. Alternative: explicitly accept bounded existing-host residual pending later hosting work. Impact: Phase09 host/security trade-off cannot be auto-accepted or changed overnight.
3. **Accept exact dependency residual or authorize remediation investigation.** Recommendation: retain manifests for this phase with explicit build-input risk acceptance and separately scoped parent/override evaluation. Why: no public request path to PostCSS established, current npm offers no fix; blind override/migration is unapproved. Alternative: HOLD while authorizing and validating remediation. Impact: all fourGHSAs remain, no cosmetic count reduction.
No approvals inferred from silence. Known Public Archive publication/TLS boundary remains with P06/P11. No scope extension, P1 deferral, warning suppression, host residual, dependency residual or performance trade-off accepted by this run.

## Side effects, rollback and closure

Local-only worktrees, commits, receipt files, ignored build/cache outputs and owned loopback servers/browser contexts. Public documentation/header/link/advisory reads only; no remote mutation, push, merge to main, deploy, visibility/auth/security change, paid build, external message or production write. No credentials handled. No Phase10 execution.

Rollback of safe changes: revert the listed test/comment commits in a newly owned worktree if desired; retain prior evidence. The gated indexing patch is unapplied, so no implementation rollback exists. Never reset/stash/clean unrelated work. Final clean-state/cleanup and private integration identities are recorded at closure.
