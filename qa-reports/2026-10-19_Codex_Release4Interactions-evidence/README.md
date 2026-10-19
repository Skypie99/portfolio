# Release 4 independent integration evidence

Read `../2026-10-19_Codex_Release4ApprovedInteractionIntegration.md` first. This evidence has open findings; it is not a clean browser or accessibility acceptance.

`summary.json` contains exact command results, all 14 candidate browser/input profiles, raw assertion failures and supplemental checks. `preservation.json` verifies protected Git objects and the immutable source evidence. The four `comparison-*.png` files arrange actual fresh-main and candidate captures. `raw-manifest.json` gives SHA-256 for each archived file. `raw-evidence.zip` retains the full independent frame bank, logs, JSON and diagnostics; extract its entries beside this README to resolve internal frame paths.

The source evidence directory is retained separately, without rewriting its historical receipt. Its raw measurements already show the work-row dot release at 8px. Two review-only follow-up patches are present here; neither changes the application snapshot.

All instruments serve production output using `node scripts/static-serve.mjs`, never a Python HTTP server. The baseline export came from verified main `78169e9`; the final application export came from `fbb84c6`. To reproduce in the isolated checkout, build first, prepare a separate baseline export for comparison, and provide your installed Chromium path:

```bash
cd /workspace/scratch/1b1252c73ace/skypi-release4-interactions-20261019
export PLAYWRIGHT_CHROMIUM_EXECUTABLE=/workspace/scratch/1b1252c73ace/browser-runtime/chromium
RELEASE4_INCLUDE_BASELINE=0 node qa-reports/2026-10-19_Codex_Release4Interactions-evidence/harness/independent-browser.mjs
node qa-reports/2026-10-19_Codex_Release4Interactions-evidence/harness/audit-production.mjs
node qa-reports/2026-10-19_Codex_Release4Interactions-evidence/harness/resolve-observations.mjs
```

Nonzero exits for the documented row, table and Firefox findings must stay visible. These runs are not expected to turn green until those findings are adjudicated or repaired.

Early diagnostics are retained: insufficient reveal settling, ambiguous menu locators, disposing the CDP session before release delivery, early pre-paint style reads, menu-exit timing, alias-document replacement and default Firefox subprocess restrictions. The final primary application checks were rerun after source corrections. The six Chromium profiles completed before an initial Firefox setup hang; the Firefox and WebKit matrices were then completed as separate runs on the same application SHA. The current harness includes the Firefox container launch configuration and waits for natural reveal settling. Numerical early failures were retained; obsolete frame references in the earliest diagnostic JSON were explicitly removed when filenames had been reused.

Normal Shift+Tab navigation confirms the Close focus ring in all three engines. Held reduced-motion samples are correct by the 25ms sample, while some immediate pre-paint reads still show the previous state. Separate settled-menu checks resolve the early DOM-exit timing assertions. The Firefox native-link-drag and Back-focus observations reproduce on fresh main and candidate and remain open. See the receipt for the distinction between confirmed defects, input limitations and physical-device gaps.
