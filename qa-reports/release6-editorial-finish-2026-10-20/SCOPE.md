# Release 6 · scope note (written before implementation, 2026-10-20)

**Baseline:** `origin/main` = `f29ce93b781372418cfe9d0e01ac17850a34b70e`, the same commit the latest successful `Deploy` run (run 187, 2026-10-20 01:42 UTC) published. **Branch:** `claude/stoic-fermat-r3s6vx`, started at exactly that commit. **Release 5:** `origin/claude/inspiring-pascal-p12cfr` at `dfddbdd9…` is NOT on main (merge-base `f08c327`, before Release 4); it was inspected read-only for overlap and compatibility and nothing from it is imported.

## The three interventions

| Package | Intervention | Actual write surfaces |
|---|---|---|
| R6-A | The wall plate's reading order becomes the catalogue order (title, one line, facts, invitation) with a readable measure; the home index gets a phone stack where the year sits on the title line and the facts read before the doorway; both surfaces stop breaking a status mid-clause or a month from its year. | `components/CaseStudyCard.tsx` (opt-in `editorial` prop, default unchanged), `components/GalleryWall.tsx` (passes it), `app/page.tsx` (the `#work` rows only), new `lib/clauses.ts` + `components/ClauseBound.tsx` |
| R6-B | The heading and its rows arrive as one reading group on one clock (one selected timing treatment compared against the baseline at normal speed); the first wall plate arrives with the title band rather than after it. | new `components/editorial.module.css` (scoped, opt-in class hooks), `components/Reveal.tsx` only if an additive hook is unavoidable (it was not; see README), the two surfaces above |
| R6-C | Record both legs of the dusk-turn with text in view; keep or build one restrained alternative, in its own commit. | `app/globals.css` dusk-turn block + `components/ThemeToggle.tsx` only if changed |

## Protected consumers that must render byte-identically

- `CaseStudyCard` default path: `app/work/[slug]/page.tsx` (Release 5 owns this file; "Other work" cards) and `app/blog/[slug]/page.tsx`.
- `Reveal` and its CSS: 19 homepage call sites outside `#work`, About, Contact, case studies, MarkdownProse, Footer, blog, cinematic ContentReveal. Nothing in `app/globals.css` reveal rules changes.
- `ProjectDoorwayButton`: size, padding, dot, press and focus untouched (no `className` prop exists; none added).
- The `#flagship` room, `#support-work`, `#record`, `#how-i-work`, `#about`, `#contact`: not edited.
- Global tokens (`--dur-*`, `--fs-*`, `--ease-*`, colours, spacing): not edited. `duration-ramp.test.ts` pins the ramp to exactly seven rungs, so no new duration token is possible; scoped CSS consumes existing rungs only.

## Release 5 overlaps

Zero shared files by diff (`app/work/page.tsx`, `GalleryWall.tsx`, `CaseStudyCard.tsx`, `app/page.tsx`, `Reveal.tsx`, `ThemeToggle.tsx`, `globals.css`, `lib/motion.ts` are all untouched on the Release 5 branch). Runtime seam to re-verify after integration: Release 5 renders `CaseStudyCard` without the new prop on four case-study routes, so its "Other work" cards keep today's layout by construction; the README records the check MiMo should run.

## Hypotheses rechecked against the baseline render (not assumed)

- D-VIS-010 (0.9 to 1.2 s reveals vs 0.5 to 0.7 s): the home index heading runs on a 1200 ms clock while its rows run 900 ms with an 80 ms stagger, so the heading lands after its content. To be compared, not asserted.
- D-VIS-011 (small tracked type at DPR 1): status and year run at 11 px DM Mono, uppercase, +0.125em on the index; checked at DPR 1 at 1440 and 1280 before any change.
- M-VIS-023/029 (unit and date wraps, squeezed groups): confirmed in the baseline captures: `Sept / 2026` splits on the 393 wall plate; `PUBLIC / SYNTHETIC DEMO` splits in the index's status column at 1440; the year drops to its own line on three of five phone rows.
- M-VIS-024 (heading to paragraph): the wall plate's title is the third element read in its column (numeral, two meta lines, then title).
- D-VIS-017 / M-VIS-011 (invitations distinct without cards): the five doorway pills are the loudest repeated element in the index; the wording is the locked "View project" and is not changed. Destination truth: internal case-study links use "View project →"; external links carry ↗ and open in a new tab.
