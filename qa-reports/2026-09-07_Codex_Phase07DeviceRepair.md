# Phase 07 — iPhone Safari Device Repair

## First repair

- `app/globals.css`
  - Preserves the approved portrait native-fragment landing offset (`-220px`).
  - Adds a short, touch-only landscape offset (`-310px`) so an iPhone that crosses the 768px layout breakpoint still lands with the hero identity and first headline visible.
  - Uses `100dvh` for the narrow touch cinematic pin when supported, with the existing `100svh` declaration as fallback. This is a bounded repair for the owner-observed Safari browser-chrome underfill.
- `components/__tests__/IntroHandoff.test.ts`
  - Adds source guards for both new contracts.
- `qa-reports/PHASE-07_INTRO_HANDOFF_GATE_RECEIPT.md`
  - Records the owner-supplied physical device failure, its exact claim boundary, and the repair candidate as HOLD.

No `components/cinematic/**` file, copy, dependency, route, production setting, remote, or primary checkout was changed by the first repair.

## Second owner retest and repair

The owner's second physical-iPhone Safari capture set confirmed the landscape landing is now correct. Portrait lands successfully but lower than desired, and the pale cinematic band remains. This disproves the first repair's viewport-height hypothesis as a complete fix.

Second source repair `0679c4f79c52cd49b50ac85f4b93d6f136c63c0c`:

- moves only the portrait native-fragment offset from `-220px` to `-300px`;
- preserves the accepted short-landscape `-310px` rule;
- gives sub-768px phones a direct source for the existing lightweight `-mobile.webp` cinematic plates on both animated and reduced-motion paths;
- leaves wider landscape and desktop image selection, animation choreography, assets, copy, routes, dependencies, production configuration, and remote state unchanged.

The phone-specific source avoids having high-DPR portrait Safari select and composite the full-width AVIF alpha plates. This is an evidence-backed repair hypothesis, not physical-device proof; the owner must retest the exact static artifact.

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
| Second repair source | `0679c4f79c52cd49b50ac85f4b93d6f136c63c0c` — `fix(intro): harden iPhone cinematic handoff` |
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

### Second-repair verification

| Check | Result |
| --- | --- |
| Focused Vitest | PASS — 2 files, 10 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — existing Next lint deprecation/export-header notices only |
| `npm run build` after source commit | PASS — exact committed static export completed |
| `npm test -- --run` | PASS — 96 files; 873 passed, 2 skipped. Existing React SSR and `fetchPriority` warnings only. |
| `npm run test:static` | PASS — rebuilt static export; 54 passed, 1 skipped. |
| `git diff --check` | PASS |
| High-DPR Chrome portrait, 440 × 844 | All four live planes select `-mobile.webp`; identity `182px`; headline `451px`; margin `-300px`. |
| High-DPR Chrome landscape, 956 × 440 | Preserves full AVIF path; identity `27px`; headline `243px`; margin `-310px`. |
| Chrome desktop, 1440 × 900 | Preserves full AVIF path and `0px` margin. |

The second repair intentionally modifies three protected cinematic implementation files under explicit owner authorization to fix the owner-observed mobile defect. No cinematic asset or choreography value changed.

## Gate

```text
INTRO_HANDOFF_GATE: HOLD
SAFE_TO_INTEGRATE: NO
NEXT_PHASE: NOT AUTHORIZED
```

The repair needs a repeat on the physical iPhone Safari before the strip, safe-area/browser-chrome behavior, or landscape landing can be marked PASS.

## Rollback

Revert `0679c4f79c52cd49b50ac85f4b93d6f136c63c0c` to remove only the second repair, or revert `a53195326aae13adfabea07dbb6cddbfe7f428a1` as well to remove both device repairs. Do not reset or rewrite history.

## DECISIONS FOR SKY

### Repeat the repair candidate on the physical iPhone before gate adjudication

**Decision:** whether the second-repair static artifact eliminates the cinematic strip, improves portrait landing, and preserves the already accepted short-landscape result.

**Recommendation:** retest the freshly built local URL once in portrait and once in landscape, then report the observed results in this task.

**Why:** the repair targets Safari visual-viewport behavior and native fragment geometry; only the physical device can prove the result.

**Alternative:** retain the hold and leave the repair as a locally validated candidate.

**Impact:** no PASS receipt, integration, or Phase 08 work is authorized until the physical device result supports it.
