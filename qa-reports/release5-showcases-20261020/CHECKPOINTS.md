# Release 5 checkpoints

Branch: `claude/inspiring-pascal-p12cfr` (session-assigned, verified isolated: it started at main `f08c327` with no divergence). Nothing here is deployed; no pull request is opened for this branch.

| # | Project | Commit | Status | Checks at the checkpoint | Remaining |
|---|---|---|---|---|---|
| 1 | Prompt Library | `a61194a` | PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING | typecheck, lint, focused vitest (case-showcase, flagstone proof row and first proof, recruiter-copy truth, arrival-top), production build, build-backed recruiter-copy and static-integrity guards; Chromium captures at 1440×900 and 393×852 in both themes | Claude Corp, Ghost Code, Dashboard; responsive sweep; motion recordings; handoff |
| 2 | Claude Corp | `e9ef17c` | PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING | the same set on the Claude Corp build (67 build-backed assertions passing) | Ghost Code, Dashboard; responsive sweep; motion recordings; handoff |
| 3 | Ghost Code | `77baf35` | PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING | the same set on the Ghost Code build (74 build-backed assertions passing); the first normal-speed recording and reduced-motion first-paint check | Dashboard; responsive sweep; recordings for the other three; handoff |
| 4 | Dashboard | `08bdb30` | PROTOTYPED · BUILD_VERIFIED · RENDERED · OWNER_VISUAL_REVIEW_PENDING | the same set on the final build (95 build-backed assertions passing); full suite 119 files / 1080 tests passing; lint and typecheck clean | responsive sweep, modes, recordings, axe and keyboard pass; README handoff |

Each checkpoint is recoverable with `git checkout <commit>`, `npm ci`, `npm run build`, then `node qa-reports/release5-showcases-20261020/tools/capture.mjs --out <dir> --full --fold --routes <slug>`.
