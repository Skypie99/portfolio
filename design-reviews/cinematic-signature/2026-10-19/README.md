# Cinematic signature candidate — 2026-10-19 (Fable, cloud session)

**Lifecycle:** `HISTORICAL_PLAN` + `RELEASE_EVIDENCE` for the candidate branch `claude/eloquent-planck-6yegy8` (based on `main` `b3e992bddf31daa86a4d471b1c38ad47f45802e7`). Not merged, not deployed, owner review pending.

Start with **`boards/00-side-by-side-board.jpg`**, then the six reports:

| File | What it is |
|---|---|
| `CREATIVE_DIRECTION_A.md` | The implemented direction: light-up, credit, veil handoff. |
| `CREATIVE_DIRECTION_B.md` | The explored alternative, "The Plate", rendered as a prototype only. |
| `IMPLEMENTATION_REPORT.md` | Branch, commit, exact files, how it works, integration notes, recommendation. |
| `BEFORE_AFTER_VISUAL_REVIEW.md` | Board-by-board reading of the renders, with residuals. |
| `MOTION_REVIEW.md` | Frame-by-frame choreography and timing rationale. |
| `TEST_RESULTS.md` | Lint, typecheck, tests, build, browser checks, accessibility probe, performance. |

Evidence folders:

- `boards/` — labelled comparison boards (JPEG), the primary viewing surface.
- `frames/original/`, `frames/candidate/` — settled viewport captures at p = 0 … 1 and at +160 … +1100 px past release, six viewport/theme configs (JPEG).
- `motion/` — scroll-through recordings (MP4) for both builds.
- `direction-b/` — the Direction B prototype renders.
- `a11y/` — the accessibility probe output (keyboard path, Skip intro, reduced motion, no-JS, axe, credit contrast).
- `manifests/` — capture manifests (geometry, console logs, overflow probe) and the probe report.
- `harness/` — the scripts that produced everything above (`serve.mjs`, `capture.mjs`, `opening.mjs`, `frames.mjs`, `boards.mjs`, `make-boards.mjs`, `proto-b.mjs`, `a11y.mjs`). Run order is in `TEST_RESULTS.md` §Reproduce.
