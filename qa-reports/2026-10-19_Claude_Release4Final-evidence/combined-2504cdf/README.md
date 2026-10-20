# Release 4 combined-integration evidence (merge `2504cdf`)

Read [`../../2026-10-19_Claude_Release4Final-CombinedIntegration.md`](../../2026-10-19_Claude_Release4Final-CombinedIntegration.md) first. These files record the **final combined candidate** — Release 4 merged onto the production baseline that carries Release 3. They are deliberately kept separate from the pre-integration evidence in the parent directory so that record stays intact.

| File | What it is |
|---|---|
| `production-audit.json` | `harness/audit-production.mjs` at `2504cdf`: 27 export routes HTTP 200, **106 axe scans with 0 violations** (the inherited `.table-wrap` `scrollable-region-focusable` pair is gone — Release 3's repair), no-JS navigate + Back, keyboard Enter-Back, touchscreen tap/menu Back, disabled native fixture. 151 checks, 2 failures — both the reduced-motion single-rAF reads |
| `reduced-motion-settle.json` | `harness/reduced-motion-settle.mjs`, 24 samples: the held press under reduced motion sampled at 0/5/25/100/400ms, proving the two failures above are a pre-paint read artefact and not missing behaviour |

Also produced against `2504cdf`, kept in the parent directory under new names so nothing is overwritten:

- `../final-probe-combined.json` — `harness/final-probe.mjs`, **130/130 checks passed, 0 errors**, Chromium 151 + WebKit 26.5.

Reproduce from the worktree root, after `npm run build`:

```bash
RELEASE4_BROWSERS=chromium,webkit RELEASE4_RESULTS_NAME=final-probe-combined.json \
  node qa-reports/2026-10-19_Claude_Release4Final-evidence/harness/final-probe.mjs
RELEASE4_BROWSERS=chromium,webkit RELEASE4_EVIDENCE_DIR=qa-reports/2026-10-19_Claude_Release4Final-evidence/combined-2504cdf \
  node qa-reports/2026-10-19_Claude_Release4Final-evidence/harness/audit-production.mjs
RELEASE4_BROWSERS=chromium,webkit RELEASE4_EVIDENCE_DIR=qa-reports/2026-10-19_Claude_Release4Final-evidence/combined-2504cdf \
  node qa-reports/2026-10-19_Claude_Release4Final-evidence/harness/reduced-motion-settle.mjs
```
