# Portfolio Truth Pass — 2026-08-21

**Branch:** `truth/portfolio-pass-2026-08-21` · branched from `main` @ `cf7148c`
**Phases run:** 1, 2, 3, 4, 5 (all five)
**`main` was not touched.** `main` == `origin/main` == `cf7148c`, unchanged. Nothing pushed, deployed, or sent.

Five commits, one per phase:

| # | Hash | Subject |
|---|---|---|
| 1 | `a03a0b7` | fix(truth): three false claims, and the dead file that held worse ones |
| 2 | `44dac7b` | feat(truth): honest status per project, and a role that matches the work |
| 3 | `204f62d` | feat(home): how the work actually gets made |
| 4 | `b12aa58` | feat(work): my role, on the three that carry the most weight |
| 5 | `4483161` | feat(work): rebuild the Flagstone case study on what is actually true |

---

## 1 · Gate results

Baseline measured on the branch **before the first edit**. Nothing inherited from a previous report.

| Gate | Baseline | Final | Δ |
|---|---|---|---|
| `npm run typecheck` | pass, exit 0 | pass, exit 0 | — |
| `npm run test` | 65 files · **650** pass · 1 skip · 1 todo (652) | 65 files · **656** pass · 1 skip · 1 todo (658) | **+6 tests** |
| `npm run lint` | 0 errors, 0 warnings | 0 errors, 0 warnings | — |
| `npm run build` | pass · 25 static pages · 5 `/work/*` paths | pass · 25 static pages · 5 `/work/*` paths | — |

**The one number that moved, and why.** Tests went 650 → 656. Exactly six were added in Phase 2, and no existing test was deleted or weakened:

- `lib/__tests__/schema.test.ts` **+3** — `status` missing is rejected; a status under 4 chars is rejected; 48 chars passes and 49 fails.
- `lib/__tests__/content.test.ts` **+3** — every deliverable has a substantive status; no bare `"Live"` stands as a whole status; no role reverts to unqualified `"Solo builder"`.

Two pre-existing `next.config.mjs` advisories (`headers` under `output: export`, and the multi-lockfile workspace-root inference) print on every lint and build run. They were there at baseline, they are unrelated to this pass, and they are not attributed to it.

**Eight test fixtures were edited, and that edit was the schema working.** Making `status` required broke six deliverable fixtures (`ProjectCard`, `GalleryWall`, `TapTargets`, `schema`, `schema.showcase`, `showcaseWire`) plus two assertions in `SidebarSectionNav`. Every one was a fixture missing a newly-required field, or a hardcoded count of homepage rail entries — not a weakened assertion. Details in §3 and the Phase 2/3 commit messages.

**One environment failure, not a code failure.** Running `npm run build` while `npm run dev` was live clobbered the dev server's `.next` chunks and produced a 500 with `MODULE_NOT_FOUND`. The production build and every gate passed throughout. Cleared with `rm -rf .next` and a dev restart. Recorded because it looked like a defect and was not.

---

## 2 · Conservation tally

Every item the prompt named, in a bucket. Nothing dropped.

### FIXED (14)

| Item | What happened |
|---|---|
| F-1 Flagstone "3 testers" | Deleted. Section renamed `What shipped` → `Where it stands`. |
| F-1b Flagstone Reflection duplicate | Deleted; the pull-quote stands. |
| F-2 Claude Corp "Constitution lives in GitHub" | Replaced with the true statement. |
| F-3 Prompt Library "permissive license" | Replaced with "source public on GitHub". |
| 1.4 `content/case-studies.md` | Deleted — verified unreferenced. |
| 2.1 Status line, all five projects | Added; schema-required, rendered on card + page. |
| 2.1 Status test coverage | 6 tests added. |
| 2.2 Role string | `Solo builder` → `Solo builder · AI-assisted`, all five. |
| Phase 3 "How I work" | New `#how-i-work` homepage band, registered in the guarded rail. |
| Phase 4 "My role" ×3 | Flagstone, Claude Corp, Dashboard. |
| Phase 4 load-bearing line | Preserved, rewritten, numbers verified. |
| Phase 5 Flagstone "The problem" | Origin story out, user's problem in. |
| Phase 5 "What went wrong" | The dead abuse-report button, verified against source. |
| Intra-page duplication (2 sites) | Found and closed — see §2.1. |

### PREMISE DIDN'T HOLD (4)

These are the ones that matter. **A prompt is not evidence**, and four of its factual premises did not survive checking.

**P-1 · "`~/ClaudeCorp` … is a git repo with no remote at all (`git remote -v` returns empty)."**
False. It has a remote named `backup` → `github.com/Skypie99/ClaudeCorp-governance`, last pushed **2026-08-21**. The conclusion survives for a better reason than the brief gave: that repo is **private**, so nothing is publicly inspectable either way. The replacement copy ("a working document, not a published one") is accurate against the corrected fact — a private backup is not a publication.

**P-2 · "no agent merges to `main`" — offered as a constraint to publish in Phase 3.**
Not true, and publishing it would have created a *new* false claim inside the pass that removes false claims. Constitution Art. 1.2 grants Rory a standing Art. 17 carve-out to merge and push one project (the Prompt Library) when the gate holds. The homepage now says *"Merges to `main` are mine, with one narrow gated exception I granted to a single project."* That qualifier is not a hedge — it is what makes the paragraph checkable.

**P-3 · Claude Corp's "adversarial verification — findings get independently refuted before I see them."**
`grep -i "adversarial\|refute"` across `CONSTITUTION.md` and `AGENT_OS.md` returns **nothing**. It may happen in workflow practice; it is not a written property of the system. Left out of Phase 4 entirely. An unfalsifiable claim about the system whose credibility is the whole argument is the worst possible place to make one.

**P-4 · "1,710 commits in 91 days."**
Close, and now stale: AccessMap is at **1,713** commits, first 2026-05-22, most recent 2026-08-21. Published as *"more than 1,700"* — a floor that stays true as the count grows, the same pattern the homepage test chip already uses.

### DELIBERATELY NOT FIXED (7) — the prompt's do-not-touch list, all confirmed intact

| Item | Verified |
|---|---|
| Test-count chip (`FlagstoneTestReceipt`) | Untouched. `2,971 / 2026-08-16` still pinned; `3,286` appears nowhere in source; 0 chip lines in the branch diff. |
| `/accessibility/` | 0 files changed. |
| Cinematic intro | Untouched, not gated. |
| Hero subhead | Untouched — alternatives drafted, §4. |
| Three competing taglines | All three untouched — §4. |
| Resume / LinkedIn | Not opened. Separate surfaces. |
| Historical audit bundles | Not rewritten. AccessMap-era records left as records. |

No formatter sweep was run. No bulk reformat. `content/deliverables.json` round-trips byte-identically through `json.dumps(indent=2, ensure_ascii=False)`, which is how every content edit was applied without reflowing the file.

### NEEDS SKY (7)

See §4. Nothing in this bucket was decided unilaterally.

### NOT APPLICABLE (1)

**Replacing `#process`.** The prompt allowed replacing it "if that section is genuinely thin". It is generic, but replacing it would delete Sky's existing designed content and is a taste call, not a truth call. The new band was **inserted between `#work` and `#process`** — the prompt's first option — so cutting `#process` remains available and remains Sky's.

### 2.1 · Two duplications this pass created, and closed

Worth recording because they were caused by the pass itself, not found in it:

- **Flagstone.** Phase 1's "Where it stands" summarised the anon write path, the fail-closed scrubber and the conservation tally. Phase 4's "My role" then explained all three properly. Phase 4 trimmed the summary and handed the detail down. `"48 findings"` went from 3 mentions to 2 — the count, and the load-bearing four.
- **Claude Corp.** "The approach" already said agents cannot self-approve and that Sky is final call. Phase 4's "Mine" was restating both. Rewritten around what is actually new.

### 2.2 · One overstatement I wrote and corrected before commit

Phase 5's first draft said the report mechanism was *"days from shipping"* dead. Nothing establishes that — the walk ran 2026-08-19 and the app is still pre-submission. The source claim is about the code, not a date. Corrected to *"would have shipped that way"*. A dramatised timeline is the same defect class as the three claims this pass opened by deleting.

---

## 3 · User-visible copy diff

### Deleted outright

| Location | Old |
|---|---|
| `/work/flagstone/` | "Launched with 3 testers; peer verification emerged organically within weeks — people confirming problems they'd encountered independently, not just filing tickets." |
| `/work/flagstone/` Reflection | "I've always been extremely passionate about accessibility, stemming from work I did with the vision loss community." |
| `content/case-studies.md` (dead file, 103 lines) | Incl. "still in use by Vancouver's disability community", "Proof of concept with 2 pilot neighborhoods", "Other AI practitioners adopted it", and a Mutual Mesh section for a project withdrawn in `cf7148c`. |

### Replaced

| Location | Old | New |
|---|---|---|
| `/work/claude-corp/` | "The Constitution lives in [GitHub](…/Claude_Corp) and evolves when we discover new patterns." | "The Constitution is a working document, not a published one — it changes when the system finds a new failure mode. A redacted excerpt is the next thing I plan to put online." |
| `/work/prompt-library/` | "Deployed as a static site on GitHub Pages and open-sourced under a permissive license." | "Deployed as a static site on GitHub Pages, source public on GitHub." |
| `/work/flagstone/` heading | `## What shipped` | `## Where it stands` |
| `/work/flagstone/` status para | "A map-first mobile app … Users can report, verify, and follow up on flags. *[3-testers claim]*" | "…The web build is browsable today. The iOS app has not shipped — App Store submission is the current work, and no build has been in a stranger's hands. So there are no users yet, and no outcomes to report. What exists instead is evidence: a test suite in the low thousands…and a four-wave simulator walk that produced 48 findings and accounted for every one of them." |
| `/work/flagstone/` The problem | "I've always been passionate about accessibility — it stems from work I did with the vision loss community. When people who depend on accessible routes hit a broken ramp…" | "When someone who depends on accessible routes meets a broken ramp or a missing curb cut, reporting it means a municipal form: describe the problem, submit, wait, hear nothing…I met this gap working with the vision loss community. It is the reason for the app." |
| All five cards + pages | `Role: Solo builder` | `Role: Solo builder · AI-assisted` |

### Added

| Location | New string |
|---|---|
| All five cards + pages | **Status:** `Pre-launch — App Store submission in progress` (flagstone) · `In active use — my own system, no outside users` (claude-corp) · `Live demo — synthetic data` (dashboard) · `Live — public, no backend` (prompt-library, ghost-code) |
| Homepage rail | New entry `How the work gets made` → `/#how-i-work`, between "The Work" and "Method" |
| Homepage `#how-i-work` | 292-word band, 5 paragraphs. Eyebrow "How the work gets made"; h2 "I direct AI agents, and I built the system that keeps them honest." |
| `/work/flagstone/` | `## My role` (235 w) and `## What went wrong` (228 w) |
| `/work/claude-corp/` | `## My role` (~240 w) |
| `/work/dashboard/` | `## My role` (198 w) |

### Ban-list

Clean across all five bodies and the new homepage band: no *leveraged, cutting-edge, revolutionary, seamless, innovative, ecosystem, transformative, passionate about, journey, empower*. `"platform"` survives only inside "cross-platform development", the literal technical term. The last "passionate about" on the site was removed in Phase 5.

Punctuation follows the house rule: straight apostrophes are authored in `deliverables.json` (30 straight vs 1 curly in the file) and curled at render by `smartPunctuation`. `lib/__tests__/smart-punctuation.test.ts` passes.

---

## 4 · Decisions for Sky

**1 · Prompt Library LICENSE — the one that is still a live falsehood-shaped hole**
The claim is gone from the site, but the repo still reports `license: null` with no LICENSE file, which legally means *all rights reserved*. AccessMap carries MIT; this one carries nothing.
**Recommendation:** add MIT to `Skypie99/Prompt_Library` to match, then the stronger sentence ("open-source under MIT") becomes available and true. Licensing is a rights decision and not mine to make, so the site currently claims nothing.
**Also, same click:** the repo's public description reads **"prompt libary"** — a typo on the first thing anyone sees. Verified live via the GitHub API. Not a portfolio file, so untouched.

**2 · Claude Corp "GitHub" link — left unchanged deliberately**
`links[0]` still points `GitHub → github.com/Skypie99/Claude_Corp`. That repo is the marketing site (`index.html`, `CNAME`, `og-image.png`, `robots.txt`, `sitemap.xml`, `404.html`, `LICENSE`, `README.md`). A technical reader clicks a link labelled *GitHub* on your differentiator specifically to see the thing, and finds a landing page.
**Options:** (a) relabel to `Site`; (b) remove it — a `Live demo` link to the same content already exists, so `GitHub` is currently the second link to one destination; (c) point it at a new public repo holding a redacted Constitution excerpt, which would make it the only inspectable artifact behind your central claim.
**Recommendation: (b) now, (c) when the excerpt exists.** Not chosen unilaterally — no existing source establishes the intended label.

**3 · The sentence that commits you — raise deliberately**
The F-2 replacement ends: *"A redacted excerpt is the next thing I plan to put online."* That is not false, but it is a **public commitment to a future action**, and if it doesn't happen it becomes exactly the kind of stale claim this pass exists to remove. No date is promised, per instruction.
**Options:** keep it as written (it is a real intention and it dates itself softly); or drop the last sentence and end on "…when the system finds a new failure mode."
**Recommendation:** keep it only if you intend to do it within a couple of months. Otherwise drop the sentence — it costs nothing.

**4 · Hero subhead — untouched, two alternatives drafted**
Current: *"Five projects built, all five live on the open web. Accessibility first, built for everyone."*
All five URLs really do return 200, so it is not false. It is **misread**: "live" implies users. The per-project status lines now correct that one click in, but the hero is the most-read sentence on the site.
- **A (minimal):** "Five projects built. Four live on the open web, one heading to the App Store. Accessibility first, built for everyone."
- **B (leads with the differentiator):** "Five products, built by directing AI agents inside a system I designed to catch their mistakes. Accessibility first, built for everyone."

A is the safe correction; B is the positioning move the audit recommends. Not changed — the hero is yours.

**5 · Role string — shipped as `Solo builder · AI-assisted`**
26 chars, inside the schema's 60-char cap. Alternatives if you want a different register: `Solo — AI-assisted` (18) · `Director & sole reviewer` (24, drops the AI word entirely, which I would not recommend — disclosure is the point) · `Solo builder · AI-directed` (26, claims more agency).
A `content.test.ts` invariant now fails the suite if any role reverts to bare `Solo builder`, so changing the wording is fine but silently dropping the disclosure is not.

**6 · Three competing taglines — all three left standing**
`profile.json` "AI tools built with intention." · `Sidebar.tsx` "Technology designed with accessibility in mind." · `app/page.tsx` hero "Building accessible, AI-native product."
Three positions on one page. Not consolidated — silently picking one is authorship, not a truth fix.
**Recommendation:** cut the Sidebar line. It is the most generic of the three, it appears in persistent chrome on every route, and it is the only one that could belong to anyone.

**7 · `#process` — kept, and now arguably redundant**
"Three quiet steps, repeated carefully" (Discover / Build / Ship & stay curious) sits directly below the new `#how-i-work` band, which says something specific about the same subject. Reading them in sequence, the new one does the work and the old one restates it generically.
**Recommendation:** cut `#process`, or cut it to one line. Removing it also removes a rail entry, so it is a real design decision — yours, not mine.

### Follow-up, not a decision

**The public test receipt should be re-measured from a fresh clone after the verified Wave 4 work is merged and pushed, rather than replacing the current receipt with a local branch count.** The chip is untouched and still pins 2,971 / 2026-08-16 / fresh anonymous clone. The local `fix/simwalk-w4-low-2026-08-21` branch reports 3,286, but that is not the state of the public repo, so publishing it would break the exact property that makes the chip worth having — that a stranger can reproduce it.

---

## 5 · Optional-phase notes

Phases 3, 4 and 5 all ran. Two things about them belong to Sky:

- **The `#how-i-work` band runs long.** 292 words against a 150–250 target. All five required elements (method · constraints · incident · decisions · limitation) are load-bearing, and I would rather run long than drop one. It was already cut once, 371 → 292, by removing two examples that duplicated the Flagstone page. If you want it at 250, the honest cut is the fourth paragraph (the content-filter decision) — but it is the only paragraph showing the system *declining* to decide for you, which is the most interesting thing in the section.
- **Phase 5 did not add a "What changed" or "What I'd do differently" block.** The prompt's Phase 5 block list does not include them; the durable rule is folded into the last line of "What went wrong" (the replacement test renders the parent, and fails against the old arrangement). Say the word if you want them as their own blocks.

---

## 6 · Rollback

The branch contains only this pass. `main` is untouched at `cf7148c`, so **discarding is a branch delete** — no revert needed:

```bash
git -C ~/Portfolio switch main && git -C ~/Portfolio branch -D truth/portfolio-pass-2026-08-21
```

That is safe as of close-out: nothing was pushed, `main` has no commits from this pass, and the three permanently-dirty working-tree files (`.claude/launch.json`, `DECISIONS_LOG.md`, `PROJECT_STATE.md`) were never staged and are unaffected by the switch.

To drop a single phase instead, revert its commit — they are independent in that later phases do not depend on earlier ones compiling differently, with one exception: **Phase 4 edited copy that Phase 1 wrote** (the Flagstone "Where it stands" trim). Reverting Phase 1 alone would conflict. Revert in reverse order:

```bash
git -C ~/Portfolio revert --no-edit 4483161 b12aa58 204f62d 44dac7b a03a0b7
```

To keep Phases 1–2 only (the unconditional truth fix) and drop the rest:

```bash
git -C ~/Portfolio revert --no-edit 4483161 b12aa58 204f62d
```

`--no-edit` is on every command deliberately: a revert without it opens `vi` and leaves the operation staged-but-uncommitted.

---

## 7 · What is still true and unfixed

Not in scope for this pass, but found while verifying and worth writing down:

- **`Skypie99/Prompt_Library` public description reads "prompt libary."** Typo, live, first thing a visitor to the repo sees.
- **The Constitution remains publicly uninspectable.** Its only remote is a private backup. Every claim the site makes about the governance system is currently unfalsifiable by a reader — which the new homepage band now states plainly rather than papering over, but stating it is not the same as fixing it. The redacted excerpt is the fix.
- **`content/case-studies.md` is gone but its claims were never live.** Nothing on the site ever rendered it. It is deleted so nobody rebuilds a page from it.
