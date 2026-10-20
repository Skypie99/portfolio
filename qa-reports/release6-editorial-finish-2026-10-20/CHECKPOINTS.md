# Release 6 · checkpoints

Each row is a commit on `claude/stoic-fermat-r3s6vx`, oldest first, with the checks run before it was recorded. The baseline is `origin/main` `f29ce93b781372418cfe9d0e01ac17850a34b70e` (the latest successful Deploy, run 187).

| Commit | Package | What landed | Checks before the commit |
|---|---|---|---|
| `280de42` | R6-A | Catalogue order on the wall (opt-in `editorial` on CaseStudyCard), the phone-authored home index (grid below `lg` through `contents`), ClauseBound status wrapping, `lib/clauses.ts` + unit test | typecheck · eslint on changed files · 13 guard files (74 tests) · build · captures at 1440/393 light+dark, 320/375/768 light |
| `3d5ea10` | R6-B | `components/readingGroup.module.css` (one clock, heading-first stagger, pair arrival on the wall); the Record counts through ClauseBound | typecheck · eslint · 7 guard files (140 tests) · build · motion recordings with timing probes, before vs after |
| `c4c3041` | R6-A/B floors | Keyboard focus floor; wall numeral /65 in the editorial variant; home index wash at 50% in dark mode | typecheck · eslint · CaseStudyCard/GalleryWall/numeral guards · contrast experiments by injected CSS before building |
| `9198291` | R6-A | `clauseBound.module.css` (container-query release of the clause hold), `break-words` on the index title, module-shape guard | typecheck · eslint · 7 guard files (31 tests) · build · text-only 200% captures re-run at 393 and 1440 · the full evidence set re-run on the final build |
| branch head | review | This folder: tools, boards, recordings, reports, README | the final validation set recorded in README §7 |

R6-C recorded no commit: the baseline dusk-turn is retained (README §5).
