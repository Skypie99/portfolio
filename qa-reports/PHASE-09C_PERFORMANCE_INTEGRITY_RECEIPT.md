# Phase 09-C Performance and Integrity Receipt

P09-C / T137–142 / F035 / RC010. Date: 2026-09-07. **P09-C: HOLD for performance-confidence disposition. Integrity checks PASS within stated scope.** No parent-gate authority.

## Artifact and baseline

The original Phase00 deployment artifact 9870638981 for source 19d946c was recovered from its retained scratchpad copy. ZIP SHA256 exactly matches the recorded9eb7b5696e6f5381eb98cd77e5b8d0433ec432a650caf86fcd46fb1a74d2e11d;30,848,225 bytes. GitHub API now reports expired=true. Extraction used traversal/link checks and a task-owned work directory, not an old/shared worktree. No historical reset, dependency install, or historical rebuild.

The initial P09 build at d680cbc had identical product behavior to accepted P08; its paired baseline/candidate measurements are preserved as pre-canonical evidence. The final canonical patch changes only five static head tags, sitemap membership and a guard. A fresh final source build and candidate-only three-repetition measurement rerun bind the final result; existing exact Phase00 readings remain valid and are reused rather than remeasured. Final comparison is sequential same-host/same-method, not falsely described as simultaneous or fully interleaved. Full identity is in parent receipt and source-artifact-binding.json.

## Method and limits

Existing Playwright-core with cached Chromium149.0.7827.55. agent-browser CLI was unavailable; no new tool/dependency installed. Dedicated headless contexts only. Local read-only Node server uses Next's existing send implementation, range support,1h cache, no gzip compression, no SPA404 fallback. No production server/CDN speed claim.

Five routes: Home, Work, Flagstone, About, Contact. Desktop1440×900/DPR1, unthrottled CPU and loopback. Mobile emulation390×844/DPR3/touch,4× CPU slowdown,150ms latency,1.6Mbps download/750Kbps upload via CDP. Three repetitions, plus three additional paired mobile-Home repetitions to adjudicate a single long-task outlier; other completed route measurements are retained. Fresh is a new context; warm is reload in the same context. Measure normal motion/light OS theme with no scroll/interaction, until5 seconds after load. Build, full tests, runtime sweep and parallel lane CPU work finish before measurement. This is a navigation lab, not exhaustive media/scroll/intro-interaction performance.

PerformanceObserver records LCP, session-window CLS excluding recent input, and long tasks. Reported long-task excess sums max(duration−50ms,0) after FCP until the fixed observation end; it is an explicit proxy, **not Lighthouse TBT, INP, a score, or field Core Web Vitals**. No natural interaction INP sample or Lighthouse available; no surrogate field claim. Resource count/transfer/encoded-body totals exclude main HTML, matching the earlier Phase00 definition; full NavigationTiming includes document metrics separately. Warm cache behavior is evidenced by zero transfer for cached resources. Largest resources retained per row.

Original September3 live baseline had only two1440×900 NavigationTiming observations: warm Home responseStart12.9/DCL689.1/load859.2ms,32 resources,0 transfer/1,004,456 encoded bytes; Flagstone first-route visit in an already-used context215.9/380.9/575.6ms,30 resources,198,330 transfer/551,161 encoded. These are historical observations, not a cold-profile guarantee, not mobile/LCP/CLS/TBT data, and not directly comparable with loopback. September7 exact-artifact remeasurement supplies the valid controlled comparison.

## Static, runtime and external integrity

Final static inventory scans26 HTML files and all exported paths, including relative/same-origin links/fragments, referenced assets, alt presence, duplicateIDs, heading order and H1 counts, blank link names/hrefs and target-blank rel. Public surfaces have zero issues. The private pre-auth Archive shell has no H1 in static HTML, unchanged from exact Phase00/P08; it is deliberately excluded from public semantic adjudication, not called an authenticated/a11y pass. Canonical policy/result handled separately in A/parent receipts, not hidden by a zero noncanonical issue count.

Public Chromium sweep covers24 HTML documents incl three redirects and two error documents, natural scrolling/lazy assets, no form submission. Private Archive and unlisted Runway are excluded from runtime; static output remains inventoried. Console capture includes errors/warnings plus pageerror; HTTP failures/requestfailed and broken completed images tracked. Full raw records, URL transitions, resources and inspected Home/Flagstone screenshots retained. No exhaustive Safari/AT matrix claimed.

External26 unique public URLs checked by HEAD with normal TLS, redirects,20s cap:25 successful2xx, LinkedIn 999 bot-block. No broken-link conclusion inferred from the bot-block. Same URL set rechecked after final build. Separate Archive TLS failure remains P06/P11 host/publication evidence, not a public link included in this26-URL set.

T142 review found meaningful existing identity/claims, CTA parity, Flagstone status evidence consistency, Support Operating Record, intro history/focus, CSS contrast/accessibility scope, canonicals and private/public boundary contracts. Existing canonical guard now includes utilities; sitemap membership is compared with the actual emitted indexable route set. Server tests moved to actual Node semantics; no redundant tests or cosmetic count increase. Static tests run after build. Two existing no-out sentinel skips do not represent unrun real static checks.

## Optimization and preserve disposition

No optimization was applied because no demonstrated P09 rendering/media cost justifies changing authored experience. The existing18,071,317-byte unlisted Runway video dominates exported video bytes but is outside the recruiter funnel and explicitly out of optimization scope. Bundle totals are inventory/storage, not first-load transfer. Phase00/P09 font and video inventories are unchanged. Any timing variability is retained; no outlier silently dropped, no score tuning.

Cinematic, P07 intro/history/focus, themes, reduced motion, flagship hierarchy, public/private boundaries, and P08 a11y repairs remain protected by exact source/asset identity except nonvisual canonical tags, plus full tests and bounded runtime checks. No trade-off, framework migration, media reencode, font/animation removal, visual flattening, or unlisted-video optimization.

## Final analysis and measured limitation

The final comparison contains **132 navigation records**:66 per artifact;3 repetitions for each route/device/cache group except mobile Home, which has6 after the focused recheck. An additional60 pre-canonical candidate records remain separately preserved and are not substituted for the final candidate. All132 comparison records completed with zero console/page warnings/errors, failed requests or HTTP failures.

Final-candidate mobile fresh median LCP:Home6576ms, Work6240ms, Flagstone2604ms, About1912ms, Contact1800ms. Warm medians:428/384/280/256/284ms. Desktop fresh medians:224/192/196/136/100ms. Maximum observed CLS0.001300. These results describe this uncompressed local throttled setup, not field CWV or production CDN performance. Cold Home/Work cost is largely shared with the exact historical artifact; no synthetic-score optimization is justified from those absolute numbers alone.

Most LCP comparisons overlap the baseline ranges. Work desktop fresh increases52ms in median (140→192; baseline range136–252, final156–240). Flagstone mobile fresh increases124ms (2480→2604; baseline2412–2780, final2600–2656). Those small differences do not establish a material product regression independently.

**P09-C-PERF-01 — warm-mobile Home long-task confidence remains HOLD.** Baseline fixed-window excess values across6 runs:[0,0,0,0,0,0]ms. Final values:[0,151,0,0,91,117]ms; median45.5ms, maximum151ms. Cold Home also has isolated168/275ms final samples versus a maximum82ms in the baseline; cold medians are similar (41.5 vs44.5ms). The focused paired rerun therefore did not justify discarding the spikes as a one-off. The proxy is not Lighthouse TBT or INP, and its variable timing does not establish field harm or the responsible component. A firm no-regression conclusion for this measurement is not supported.

Per the prompt's repeated-measurement-instability stop boundary, no broad rerun, optimization, animation simplification, or cinematic edit followed. All raw rows and ranges remain banked. This is a measurement/acceptance hold, not a fabricated diagnosed P1 rendering bug and not an accepted performance trade-off.

## Bundle and route inventory

| Category | Phase00 bytes | Final bytes | Delta bytes |
|---|---:|---:|---:|
| JavaScript | 1,484,736 | 1,485,124 | +388 |
| CSS | 132,641 | 134,079 | +1,438 |
| Fonts | 308,960 | 308,960 | +0 |
| Images | 8,340,684 | 8,325,385 | -15,299 |
| Video | 21,349,029 | 21,349,029 | +0 |
| HTML | 1,752,283 | 1,784,012 | +31,729 |

These are whole-export uncompressed file totals. Final export has350 files/26 HTML documents versus348/26 in the original deployment. Directly referenced script/CSS gzip totals and file lists for all five routes are in route-bundles.json; those exclude dynamic imports and are not observed transfer. Example Home direct JS219754→219831 gzip bytes, CSS21358→21446 gzip bytes. The final build's own first-load estimates are Home171kB, Work123kB, Flagstone124kB, About117kB, Contact117kB; shared103kB. Asset storage and first-load estimates must not be conflated.

Final artifact digest:aba823c2678fc2dc793922c207e1426d40f0df5b981c99060be64645d2abddab. All350 files rehashed with zero mismatch and unchanged file set. Product buildfb3e2e6; final technical/test candidate34cdd66 adds only the sitemap test after that build. Final static/runtime evidence and source binding refer to this exact artifact.

## Lab table

Medians of three runs per artifact/device/cache/route, with six runs per artifact for mobile Home after a targeted outlier recheck. See performance.json.gz for every raw row and exact method. Milliseconds for LCP and fixed-window long-task excess; the latter is not Lighthouse TBT or INP. No field Core Web Vitals claim.

| Route | Device | Cache | P00 LCP | P09 LCP (min–max) | P09 CLS | P00/P09 long-task excess | Requests P00/P09 | Resource transfer bytes P00/P09 |
|---|---|---|---:|---:|---:|---:|---:|---:|
| / | desktop | fresh | 272 | 224 (224–292) | 0.000010 | 0/0 | 33/34 | 1498116/1500658 |
| / | desktop | warm | 136 | 144 (136–148) | 0.000010 | 0/0 | 33/34 | 0/0 |
| /work/ | desktop | fresh | 140 | 192 (156–240) | 0.000000 | 0/0 | 34/35 | 1334172/1344783 |
| /work/ | desktop | warm | 152 | 152 (136–196) | 0.000010 | 0/0 | 34/35 | 0/0 |
| /work/flagstone/ | desktop | fresh | 216 | 196 (156–252) | 0.001300 | 0/0 | 31/32 | 1258795/1267899 |
| /work/flagstone/ | desktop | warm | 140 | 132 (132–136) | 0.001300 | 0/0 | 31/32 | 0/0 |
| /about/ | desktop | fresh | 136 | 136 (120–192) | 0.000010 | 0/0 | 29/30 | 1103524/1112397 |
| /about/ | desktop | warm | 112 | 120 (116–124) | 0.000010 | 0/0 | 30/31 | 0/0 |
| /contact/ | desktop | fresh | 264 | 100 (100–108) | 0.000010 | 0/0 | 29/30 | 1103924/1112799 |
| /contact/ | desktop | warm | 128 | 120 (112–272) | 0.000010 | 0/0 | 30/31 | 0/0 |
| / | mobile | fresh | 7330 | 6576 (6504–6712) | 0.000000 | 42/44 | 29/30 | 1416753/1417886 |
| / | mobile | warm | 418 | 428 (316–528) | 0.000000 | 0/46 | 29/30 | 0/0 |
| /work/ | mobile | fresh | 6272 | 6240 (6240–6272) | 0.000000 | 58/27 | 26/27 | 1032341/1036135 |
| /work/ | mobile | warm | 420 | 384 (380–504) | 0.000000 | 0/0 | 26/27 | 0/0 |
| /work/flagstone/ | mobile | fresh | 2480 | 2604 (2600–2656) | 0.000000 | 26/30 | 25/26 | 1006433/1008608 |
| /work/flagstone/ | mobile | warm | 408 | 280 (268–284) | 0.000000 | 0/0 | 26/27 | 0/0 |
| /about/ | mobile | fresh | 1984 | 1912 (1836–1952) | 0.000000 | 64/28 | 20/21 | 753026/754064 |
| /about/ | mobile | warm | 304 | 256 (252–280) | 0.000000 | 0/0 | 21/22 | 0/0 |
| /contact/ | mobile | fresh | 2088 | 1800 (1744–1940) | 0.000306 | 228/25 | 20/21 | 753426/754466 |
| /contact/ | mobile | warm | 464 | 284 (284–364) | 0.000000 | 2/0 | 21/22 | 0/0 |


## DECISIONS FOR SKY

P09-C-PERF-01: resolve the warm-mobile Home performance-confidence limit before P10. Recommendation: retain the current authored experience and HOLD acceptance pending a narrowly scoped, controlled performance investigation that can attribute the repeated long-task difference. Alternative: explicitly accept these exact bounded lab observations/uncertainty for the private baseline, without claiming field INP or universal no-regression and without changing media/motion. Impact: no optimization is ready or proposed; no performance trade-off was accepted. Further identical noisy measurements were stopped per the prompt. Host/dependency decisions remain separate.

