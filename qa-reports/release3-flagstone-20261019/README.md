# SkyPi Release 3 — Flagstone evidence

Candidate: `codex/skypi-release3-flagstone-20261019` from main `78169e94c9f2b9810d3c9cdb18c54b0cacb7e297`.
Tested application source: `43ef1c501b012515acc5d0313459589862c49939`.

- Open `screenshots.html` for all 96 desktop and phone captures in Chromium and WebKit. The no-JavaScript dark-preference captures show the actual light fallback.
- `browser-results.json` has all 32 browser scenarios, 24 axe scans, their incomplete items, and recorded fixture repairs.
- `route-comparison.json` compares the candidate to a separately built exact-main baseline.
- `source-preservation.json` records source asset hashes and the capture fields.
- `intake.json`, `opus.patch.gz`, and `table.patch.gz` show the two actual reviewed local sources and their hashes. Decompress the patch archives to recover the exact original bytes.
- `contrast-final.json` contains the 72 settled, geometry-checked rendered text samples. `contrast-initial.json` is the first quicker, unsettled probe; its extreme outlier was not reproduced by the settled probe and is retained as an inconclusive motion/timing observation. Several fall below 4.5:1; see the release hold in the report.
- `overflow-results.jsonl` and `logs/overflow-final.log` document the 216-frame site-wide census and its planted-overflow checks. `overflow-nojs.json` and its log cover the two Flagstone pages in both engines without JavaScript.
- `logs/` contains the gate output, including failed/interrupted QA fixture attempts. `tools/` contains the standalone test helpers. They must be run from a checkout with its dependencies and browser engines available.

This is local browser evidence. It does not replace real-device or assistive-technology acceptance, and it does not authorize deployment or merge.
