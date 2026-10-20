# Release 4 final evidence

Read [`../2026-10-19_Claude_Release4FinalIntegration.md`](../2026-10-19_Claude_Release4FinalIntegration.md) first.

| File | What it is |
|---|---|
| `final-probe.json` | 130 checks from `harness/final-probe.mjs`: phone tap residue with a negative control, desktop hover/press/cancel/focus, keyboard / Firefox-shaped / pointer Back. Chromium and WebKit |
| `production-audit.json` | `harness/audit-production.mjs` (Codex harness plus engine selection): 27 export routes, 106 axe scans, no-JS, keyboard and touch Back |
| `resolved-observations.json` | `harness/resolve-observations.mjs` (Codex harness plus engine selection): reduced-motion held samples, 44px menu targets, menu exit, Close focus |
| `ladder-differential.json` | The unmodified Codex ladder, rerun for candidate versus production main `1001624` on the same Mac. Frames were left out of the repository |
| `build-summary.json`, `full-suite.txt`, `overflow.txt` | Gate outputs |

Each harness serves `out/` with `node scripts/static-serve.mjs`. Build first, then run from the worktree root:

```bash
RELEASE4_BROWSERS=chromium,webkit node qa-reports/2026-10-19_Claude_Release4Final-evidence/harness/final-probe.mjs
RELEASE4_EVIDENCE_DIR=qa-reports/2026-10-19_Claude_Release4Final-evidence RELEASE4_BROWSERS=chromium,webkit node qa-reports/2026-10-19_Claude_Release4Final-evidence/harness/audit-production.mjs
RELEASE4_EVIDENCE_DIR=qa-reports/2026-10-19_Claude_Release4Final-evidence RELEASE4_BASELINE_OUT=out RELEASE4_BROWSERS=chromium,webkit node qa-reports/2026-10-19_Claude_Release4Final-evidence/harness/resolve-observations.mjs
```

`production-audit.json` keeps its 5 failing checks: 2 inherited table scans (fixed by Release 3), plus pre-paint reduced-motion reads that `resolved-observations.json` resolves at 25ms. `resolved-observations.json` keeps its 2 failing macOS WebKit plain-Tab checks. The ladder results keep every failure; the receipt classifies each one.

## The combined candidate

Everything above is the record of Release 4 **before** it met Release 3 and is preserved as-is. The final integrated candidate (merge `2504cdf`, Release 4 + Release 3 production baseline) was re-verified separately:

- [`combined-2504cdf/`](combined-2504cdf/) — `production-audit.json` (106 axe scans, **0 violations**; the inherited `.table-wrap` pair is gone) and `reduced-motion-settle.json`.
- [`final-probe-combined.json`](final-probe-combined.json) — 130/130 checks, 0 errors.

See [`../2026-10-19_Claude_Release4Final-CombinedIntegration.md`](../2026-10-19_Claude_Release4Final-CombinedIntegration.md) for the merge, the conflict resolution and the full result table.
