# Phase 07 — iPhone Safari Device Repair

## What changed

- `app/globals.css`
  - Preserves the approved portrait native-fragment landing offset (`-220px`).
  - Adds a short, touch-only landscape offset (`-310px`) so an iPhone that crosses the 768px layout breakpoint still lands with the hero identity and first headline visible.
  - Uses `100dvh` for the narrow touch cinematic pin when supported, with the existing `100svh` declaration as fallback. This is a bounded repair for the owner-observed Safari browser-chrome underfill.
- `components/__tests__/IntroHandoff.test.ts`
  - Adds source guards for both new contracts.
- `qa-reports/PHASE-07_INTRO_HANDOFF_GATE_RECEIPT.md`
  - Records the owner-supplied physical device failure, its exact claim boundary, and the repair candidate as HOLD.

No `components/cinematic/**` file, copy, dependency, route, production setting, remote, or primary checkout was changed.

## Evidence and claim boundary

The owner supplied physical iPhone Safari screenshots on 2026-09-07. They show:

- a pale/beige band exposed during the portrait cinematic;
- a valid portrait target composition to preserve;
- a short-landscape native Skip Intro landing that misses the identity/headline;
- the intended short-landscape composition.

The screenshot address bar showed bare `10.0.0.22`, not the earlier numbered static-server URL. Once the temporary server was gone, a read-only comparison of the bare endpoint was unavailable. Therefore the captures are valid owner-reported device defects, but this report does not claim cryptographic served-artifact provenance for the strip.

## Branch and commits

| Field | Value |
| --- | --- |
| Branch | `codex/portfolio-3.0-phase07-20260905` |
| Original Phase 07 source | `d1c15f9cd33051edff3f053ad20c4b2ce0c1cfe4` |
| Repair source | `a53195326aae13adfabea07dbb6cddbfe7f428a1` — `fix(intro): repair iPhone Safari handoff` |
| Previous evidence receipt | `03a1ccdb35ba1c77051ab4fa3e91580e9d434aed` |
| Remote / production actions | none |

## Local verification

| Check | Result |
| --- | --- |
| `npm run test -- components/__tests__/IntroHandoff.test.ts` | PASS — 5 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — existing Next lint deprecation/export-header notices only |
| `npm run build` | PASS — static export completed |
| `npm run test` | PASS — 96 files; 871 passed, 2 skipped. Existing React SSR and `fetchPriority` warnings only. |
| `npm run test:static` | PASS — rebuilt the static export; 54 passed, 1 skipped. |
| `git diff --check` before commit | PASS |
| Static artifact inspection | PASS — emitted CSS contains `-310px` and `100dvh` rules. |
| Local touch geometry, 956 × 440 | PASS — native arrival: identity `27px`, headline `243px`, margin `-310px`. |
| Local touch geometry, 440 × 844 | PASS — portrait retains margin `-220px`. |
| Local fine-pointer geometry, 1440 × 900 | PASS — desktop retains margin `0px`. |
| `npm run check:overflow` | BLOCKED / pre-existing harness gap — exits 2: `[overflow] static fixture never came up.` No source change was made to its absent fixture helper. |

The local browser runtime used for geometry was Chrome, not iPhone Safari. The available Playwright WebKit runtime was not installed. Neither is presented as mobile-Safari acceptance proof.

## Gate

```text
INTRO_HANDOFF_GATE: HOLD
SAFE_TO_INTEGRATE: NO
NEXT_PHASE: NOT AUTHORIZED
```

The repair needs a repeat on the physical iPhone Safari before the strip, safe-area/browser-chrome behavior, or landscape landing can be marked PASS.

## Rollback

Revert `a53195326aae13adfabea07dbb6cddbfe7f428a1`; do not reset or rewrite history. The source changes are limited to the two files above.

## DECISIONS FOR SKY

### Repeat the repair candidate on the physical iPhone before gate adjudication

**Decision:** whether the new static artifact eliminates the cinematic strip and lands correctly in portrait and short landscape.

**Recommendation:** retest the freshly built local URL once in portrait and once in landscape, then report the observed results in this task.

**Why:** the repair targets Safari visual-viewport behavior and native fragment geometry; only the physical device can prove the result.

**Alternative:** retain the hold and leave the repair as a locally validated candidate.

**Impact:** no PASS receipt, integration, or Phase 08 work is authorized until the physical device result supports it.
