# Phase E — The other four projects, credentials, colophon — CLOSE-OUT

Branch `room/pE-projects`, 8 commits on top of `main` (`2c9d744`). Not merged, not pushed.

```
8461a55 docs(showcase): bank the E3 decision on Claude Corp's shots (no code)
01887be content(prompt-library): rewrite the Reflection pull-quote (E9)
ca1bf57 style(certificates): credential badge text reads in accent tone at rest (E6)
b1fa129 feat(work): status + last-verified date on the /work/ wall (E2)
7c2ac0a style(certificates): conform CertCard to the unified card family (E7)
5d2125b feat(blog): add optional dark-mode figure support (E5)
b5c58d3 content(claude-corp): reconcile the dead heroImage.alt (CP-4)
19c186f content(prompt-library): restore pre-truth-pass open-source phrasing
```

Two rounds: the first five commits shipped everything not gated on Sky; the last three (`8461a55`, `01887be`, `ca1bf57`) shipped after Sky picked among the drafted options for E3, E6, and E9. Full gate green throughout — `npm run typecheck && npm run build && npx vitest run`, **70 test files, 685 passed, 1 skipped, 1 todo** — re-run after every commit in both rounds.

## What shipped, per item

**Truth item (Prompt Library license).** `gh api repos/Skypie99/Prompt_Library --jq '.license.spdx_id'` → `MIT`, confirmed live. Restored the exact pre-truth-pass phrase from `design-reviews/truth-pass/2026-08-21/REPORT.md:136` — *"Deployed as a static site on GitHub Pages and open-sourced under a permissive license."* `/about`'s "All of them open source" needed no change; it was already accurate.

**E2 — status + last-verified dates on `/work/`.** `CaseStudyCard` renders `d.status` in the exact classes `ProjectCard:102` already uses, plus a new `verifiedDate` — an ISO date the deliverable's live link was last confirmed to resolve by an actual HTTP check (`curl`, all five returned 200 → all five carry `"2026-08-25"`). Verified visually at 1440/768/375, both themes.

**E3 — Claude Corp's `shots[]` (decided).** The brief's "three dead slots" premise was stale (CP-2 fixed Aug 1). Sky's call, given the real choice: leave it at the one fully-wired shot rather than promoting the registry's `proof`/`not-found` scenes. Banked as a comment in `scripts/showcase/registry.mjs` — zero behavior change, so a future pass doesn't reopen it as undecided.

**E4 (CP-4 half) — Claude Corp's dead `heroImage.alt`.** Described a retired still-life concept; the shipped `hero.svg` is an orchestration diagram. Corrected the alt text to describe the actual file. Confirmed `heroImage` isn't rendered anywhere in the built page (zero `<img src*="hero.svg">` in the DOM) — pure hygiene, zero visual change.

**E5 — blog figure dark-mode capability.** `BlogFigureSchema.dark` (src/avif/webp/lqip) + `ProseFigure` renders it via plain `dark:` visibility classes. No post has a dark figure yet — confirmed byte-identical today, one `<img>`, zero console errors.

**E6 — credential badge accent color (decided).** UP-24's open half ("is the ~10px affordance visible enough at rest") — Sky picked, of 4 drafted options: share `--color-accent-deep` across border/icon/text instead of muting just the words. Verified computed contrast both themes: **~9.6:1 dark, ~6.7:1 light**.

**E7 (polish half) — CertCard conforms to the card family.** Migrated to `p-7 md:p-9 lg:p-10` / `text-card-title` / `font-light` per `05_DESIGN_SYSTEM.md`'s own naming of CertCard. Verified at all three breakpoints, both themes.

**E9 (Prompt Library half) — Reflection rewrite (decided).** Sky picked option 1 of 3 drafted alternatives, restructured into the site's blockquote+follow-up Reflection pattern. Ghost Code's Reflection was also flagged by the brief, but Sky agreed with the read that it already reads specific rather than generic — left unchanged.

## PROTECT-list proof (mechanical, `git diff main..HEAD --stat`)

```
 app/blog/[slug]/page.tsx        | 93 +++++++++++++++++++++++++++++++--------
 app/tokens-phase2.css           |  7 ++-
 components/CaseStudyCard.tsx    | 25 +++++++++-
 components/CertCard.tsx         |  4 +-
 components/GalleryWall.tsx      |  2 +
 content/deliverables.json       | 11 ++++-
 lib/schema.ts                   | 23 +++++++++
 scripts/showcase/registry.mjs   |  6 +++
 8 files changed, 138 insertions(+), 33 deletions(-)
```

`git diff main..HEAD --stat -- components/cinematic/ app/archive/ app/accessibility/ scripts/capture-showcase.mjs content/showcase.manifest.json content/certificates.json app/certificates/page.tsx` → **empty**. `scripts/showcase/registry.mjs` shows only the E3 comment (0 lines of behavior changed — confirmed no `ship:` value flipped). None of the protected surfaces carry a functional change. The Flagstone case-study content is untouched; its card on `/work/` now shows status+verifiedDate like every other card, via the shared `GalleryWall`/`CaseStudyCard` components (E2 applying uniformly), not a Flagstone-specific edit.

## Guard migrations

Re-verified against the actual test files and re-run after every commit in both rounds:

- `lib/__tests__/content.test.ts:126-157` — no bare `"Live"`, every role contains `"ai-assisted"` — **holds**.
- `lib/content.ts:68-74` — exactly one `featured: true` — **holds**.
- `components/__tests__/GalleryWall.test.tsx:66-100` — `lg:flex-row` alternation, `work:seen`/`data-wall-seen` — **holds**.
- `lib/schema.ts:19-26` alt-text rule, `:176-179` heroImage.src regex — **holds**.
- `verifiedDate` and `BlogFigureSchema.dark` are optional/additive — no migration needed, both covered by the full re-parse tests.

## The Flagship Standard — run against Claude Corp

Per `15_FLAGSHIP_STANDARD.md`, at Claude Corp's own scale:

1. **First impression — does not fully hold.** Real capture ✓. One human claim (the plate) — **missing** (E1, still open). One dated number (the receipt) — **missing**; Claude Corp's one shot carries no `capturedDate`/`commit`, unlike Flagstone's.
2. **Hierarchy** — holds (shared template).
3. **Image/art presentation — partially holds.** Both themes ✓, one real caption ✓. Not dated (same gap as point 1).
4. **Typography** — holds, by construction.
5. **Storytelling — does not hold.** No `## What went wrong` — and this isn't unique to Claude Corp: **none of the four non-flagship projects have one.** Not attempted this pass — a factual account of what actually went wrong is Sky's own, not something to invent, and drafting four of them is its own item.
6. **Transitions/motion** — holds, by construction.
7. **Interaction** — no dated figure exists yet to check (see point 1).
8. **Responsive** — holds at the breakpoints checked; not an exhaustive mobile walk of all four non-flagship studies this pass.
9. **Accessibility** — holds on the rules checked; CP-4 directly improved this. AA contrast not independently re-measured this phase beyond E6's own badge check.
10. **Authorship** — holds well; specific, not template-fillable.

**Follow-up flagged, not built:** Claude Corp's one shot could carry `capturedDate`/`commit` (the Aug 1 wiring commit `65a0f9b` is a knowable source) — small and mechanical, but incremental beyond the lettered items.

## 🔴 Still open — needs Sky's own words, numbers, or an asset (not a pick-list)

Four items didn't move this round because none of them can — each needs something only Sky can supply, not a decision among options:

### E1 — four `heroPlate` blocks (needs approval or edits)
Zero code needed — the template already renders this generically. Drafted one full candidate per project in the first round of this close-out (Claude Corp / Dashboard / Prompt Library / Ghost Code — severity/caption/provenance triplets, grounded only in facts already in each project's shipped body copy). **Still waiting on:** "ship as drafted" or edits.

### E4 (CP-3 half) — Claude Corp's stale hero stats (needs current numbers)
The hero image's baked-in stats strip reads "5 Projects · 2 fully live" against the page's own footer saying "five of six live." Can't be fixed by re-running the capture script — the registry pins a specific commit of `~/Claude_Corp`, so a reshoot today reproduces the same stale numbers. **Still waiting on:** the accurate current figures, and a go-ahead to re-pin the registry once they're known. Correctly deferred to the existing C-27/WM-4 reshoot lane.

### E7 (UP-18 asset half) — badge art (needs a file)
Confirmed twice now: not a CSS-fixable defect. **Still waiting on:** square or letterboxed re-exports of the U-Michigan and DeepLearning.AI badges (existing S10/L3-05 lane).

### E8 — colophon: P10 "Source Colophon" + P11 "Set From Source" (needs copy, or a go-ahead to build a mock)
- **P10** can't be built without Sky's exact copy — its own pitch says every string is hers to write — and its identity line separately waits on **W1-01** (the footer's dual-brand-line fork), still open.
- **P11** is unblocked to build (P02, its coordination gate, already shipped) but needs a composite mock — "just P02" vs. "P02 + P11" — before Sky can pick. Not built this pass.

**Still waiting on:** either P10's words, or a go-ahead to spend time on the P11 mock. Neither resolves without one of those regardless of which is answered first.

## Device rows

Built `out/` served locally (`python3 -m http.server`), Chromium only:

| Route | 1440 | 768 | 375 | Light | Dark | Console |
|---|---|---|---|---|---|---|
| `/certificates/` | ✓ | ✓ | ✓ | ✓ | ✓ | 0 errors |
| `/work/` | ✓ | — | ✓ | ✓ | — | 0 errors |
| `/work/claude-corp/` | ✓ | — | — | ✓ | — | 0 errors |
| `/blog/building-flagstone/` | ✓ | — | — | ✓ | — | 0 errors, figure asset 200 |

Round 2's checks (E6's badge color, E9's quote) were verified by computed style / re-run test suite rather than a fresh full device walk — no new routes touched, no new breakpoints in play.

Not walked this pass, by scope: `/colophon/` (no code changed — E8 stayed proposal-only), `/work/dashboard/`, `/work/prompt-library/`, `/work/ghost-code/` (data-only changes, same shared template).

## 🟡 Premises of the brief that did not hold

- **E3/CP-2**: "three dead shots[] slots, zero system texture" — fixed Aug 1, three weeks before this brief.
- **E6's "VIEW ↗"**: the label is "Verify ↗" today; the *original* finding's location (homepage credential rows) no longer exists, demoted to a link sentence after 08-01. The design question survived the move to `/certificates/`.
- **E4/CP-4's "seven dead alt/caption pairs"**: six of seven collapsed to zero when CP-2 shipped. One remained, and is fixed.

## STOP

Branch `room/pE-projects` only. Not merged, not pushed. Four items (E1, E4/CP-3, E7, E8) remain open on Sky's side — none of them block a merge; they're each their own follow-up whenever the words/numbers/asset are ready.
