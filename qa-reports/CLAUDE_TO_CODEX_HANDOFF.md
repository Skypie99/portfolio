# Claude → Codex Handoff — SkyPi Studio Portfolio 3.0

**Date:** 2026-09-03
**Scope:** freeze the accepted Claude-era state (Phases 00–03) and package what Codex needs to begin Phases 04 and 05.
**This document is evidence and packaging only.** No implementation, no discretionary change, no remote mutation.

---

## 1. Accepted predecessor chain — verified from Git, not from receipt prose

| Phase | Accepted SHA | Accepted tree | Note |
|---|---|---|---|
| **00** | `19d946c9c48b325bce5d3a9f292d2cb48450cf01` | `ee0be9130c2b4f9de5de956c6cdc33b9d151c682` | Phase 00 made **no commit of its own** (source-change-free). Its accepted state *is* `origin/main`. Its four evidence artifacts were tracked later, in `bd0b8bb`, during the Phase 03 remediation pass. |
| **01** | `abf1e3c` | `b37265cdb20d956540297ed7d8e3327bc398f670` | Two files added: `docs/IDENTITY_AND_CLAIM_CONTRACT.md`, Phase 01 receipt. No product source touched. |
| **02** | `622797ebc42085bf0138a2ded6925f5c9c6e4bc6` | `dca3dd238162ddb6e7814bc0575e036faa933d90` | 22 files across 4 commits (`109b7bc`, `dabb214`, `d46fa91`, `fa21f2e`, `622797e`): dependency remediation, shared `ProjectDoorwayButton`, self-canonicals, receipt + amendment. |
| **03** | `c2bde62b6ef44303f16066319ab471b1a173dcc0` | `8b195f460301a8a3d8caa4887ac6a7b07cbf83ab` | Implementation `cbd36df`; finalization `c2bde62`. |

**Ancestry verified.** Every accepted SHA above is an ancestor of (or is) `HEAD`:

```
19d946c9 → abf1e3c → 109b7bc → dabb214 → d46fa91 → fa21f2e → 622797e
         → cbd36df → 888c33c → bd0b8bb → c2bde62 (HEAD)
```

**Content verified in the accepted tree** (`git ls-tree -r 8b195f46`), not inferred:

- Phase 00: all four evidence artifacts present
- Phase 01: `docs/IDENTITY_AND_CLAIM_CONTRACT.md` + receipt present
- Phase 02: receipt present; `components/ProjectDoorwayButton.tsx` present; `canonicalFor()` in **13** route files
- Phase 03: receipt, copy specification, frozen acceptance instrument, and `lib/__tests__/support-first-hierarchy.test.ts` present

No Phase 00–02 work was reverted or lost by Phase 03.

## 2. Repository cleanliness

| Check | Result |
|---|---|
| Working tree vs `HEAD` | identical (`git diff HEAD` empty) |
| `git status --short` | empty |
| Untracked files (`--untracked-files=all`) | none |
| Staged-but-uncommitted | none |
| Source mutation after Phase 03 implementation | none (`git diff cbd36df..HEAD -- app components lib public content package*.json next.config.mjs tailwind.config.ts` empty) |
| Protected cinematic, whole Claude era | `git diff 19d946c9..HEAD -- components/cinematic` **empty** |
| Interrupted git operation | none |
| Ignored artifacts | `.next/`, `out/`, `node_modules/`, `next-env.d.ts`, `tsconfig.tsbuildinfo` — all standard, all gitignored, none requiring resolution |
| Remote mutations | **NONE.** `origin/main` = `19d946c9…`, unchanged. Branch is ahead 10 / behind 0 and **has never been pushed** |

**Pre-existing stash entries, not this work.** The shared stash stack carries three entries from unrelated branches (`archive/supply-swatches-2026-08-09`, `feature/canonical-apex-domain-2026-06-05`, `feat/phase5-sky-pi-motion-v2`). **No Claude Portfolio 3.0 phase ever used the stash.** Codex must not pop, drop, or apply them: the stack is shared across all worktrees and other sessions may own them.

## 3. Codex base — the one frozen state

```
CODEX_BASE_SHA:      <the handoff commit — the tip of the branch below>
CODEX_BASE_TREE:     <that commit's tree>
CODEX_BASE_BRANCH:   claude/portfolio-3.0-phase00-baseline-20260903
CODEX_BASE_WORKTREE: /Users/skypie/Portfolio-3.0-baseline
REMOTE:              https://github.com/Skypie99/portfolio.git

PARENT (accepted Phase 03 source state, unchanged by this handoff):
  SHA:  c2bde62b6ef44303f16066319ab471b1a173dcc0
  TREE: 8b195f460301a8a3d8caa4887ac6a7b07cbf83ab
```

**On the self-reference.** This document cannot name the SHA of the commit that
contains it without changing that SHA. Rather than chase it with repeated
amends, the base is defined **relationally and is fully mechanically verifiable**:

```
git rev-parse HEAD                 # = CODEX_BASE_SHA
git rev-parse HEAD^{tree}          # = CODEX_BASE_TREE
git rev-parse HEAD~1               # MUST equal c2bde62b6ef44303f16066319ab471b1a173dcc0
git log -1 --format=%s             # MUST start with "docs(qa): Claude to Codex handoff"
git diff HEAD~1..HEAD --stat -- app components lib public content
                                   # MUST be EMPTY — the handoff adds documentation only,
                                   # so the SOURCE state of CODEX_BASE is byte-identical
                                   # to accepted Phase 03 (tree 8b195f46…)
```

The literal SHA is also stated in the handoff result block delivered alongside
this document.

## 4. Phase 04 / 05 entry conditions — and an explicit limit

> **LIMIT, stated plainly.** The `SKYPI-PORTFOLIO-3.0-P04-LEAD`, `P05-LEAD`, and `P06-LEAD` prompts **were never provided to the Claude session**, and **no Phase 04/05/06 specification exists anywhere in this repository** (verified: `grep -rln "P04-LEAD|P05-LEAD|P06-LEAD|PHASE-04|PHASE-05|PHASE-06" docs/ qa-reports/` returns nothing). There is also **no master-plan document in the repo** — the phase prompts themselves have been the authority, supplied per-phase by Sky.
>
> Therefore the sections below state what is **authoritatively derivable** from Phase 00–03 artifacts and the P03-LEAD prompt. They are **not** a substitute for the real P04/P05 prompts, which Sky must supply to Codex exactly as P03 was supplied to Claude. Codex must not infer scope from this document alone.

### What is authoritatively known

From the P03-LEAD prompt, verbatim:

- **Next permitted prompt:** `SKYPI-PORTFOLIO-3.0-P04-LEAD and SKYPI-PORTFOLIO-3.0-P05-LEAD`
- **P03 precondition:** *"No concurrent Phase 04 or 07 edit to `app/page.tsx`."* → **Phase 04 is expected to touch `app/page.tsx`.**
- **P03 context:** *"It runs before project refinements so the professional frame is available to interpret them."* → project-refinement work follows Phase 03.
- **RC-003 systemic correction, explicitly deferred to a later phase:** *"Preserve full evidence while adding one concise `what this demonstrates` bridge on the highest-value projects and improving progressive disclosure/order."*

### Prerequisite state (applies to both 04 and 05)

- `BASELINE_LOCK: PASS`, `IDENTITY_CLAIM_GATE: PASS`, `FOUNDATION_GATE: PASS`, `RECRUITER_PATH_GATE: PASS`
- Base = §3 exactly; working tree clean; intake gate (§8) passing

### Required inherited contracts (both phases)

1. `docs/IDENTITY_AND_CLAIM_CONTRACT.md` — **binding vocabulary and fact authority.** Per its §30, no later phase may introduce a name form, role claim, support fact, or status word that contradicts it without a new, explicitly Sky-approved amendment.
2. `qa-reports/2026-09-03_PHASE03_CopySpecification.md` — the frozen Homepage / About / Credentials / Contact copy contracts as implemented.
3. `qa-reports/PHASE-03_RECRUITER_PATH_GATE_RECEIPT.md` — preserve register, task/finding mapping, unrun checks.
4. `qa-reports/2026-09-03_PHASE03_AcceptanceInstrument.md` — the frozen recruiter instrument. If any later phase re-measures recruiter comprehension, it **must not** alter this instrument mid-comparison.
5. The executable guards (§7), which are the machine-checkable half of the contract.

### PHASE_04_05_PARALLEL_SAFE: **NO**

Not a hedge. Two independent grounds:

1. **Cannot be certified against contracts that do not exist.** The instruction was to verify parallel-safety *against their actual file/scope contracts*. Those contracts are unavailable, so any YES would be a fabricated assurance.
2. **Positive evidence of overlap risk.** P03-LEAD's own precondition names **Phase 04 as a potential concurrent writer of `app/page.tsx`** — the single highest-contention file in this repo (homepage hero, flagship band, work index, Support Operating Record, The Record, how-i-work, About and Contact bands all live in it, 1,180+ lines). If Phase 05 touches the homepage, project ordering, or project cards, the collision is direct.

**If Sky's P04/P05 prompts turn out to be genuinely disjoint, these are the conditions Codex must satisfy before running them concurrently:**

- Read both prompts and diff their `EXACT IN-SCOPE SURFACES` and `FILE OWNERSHIP` sections. Proceed in parallel **only if the file sets are provably disjoint.**
- `app/page.tsx`, `lib/sectionNav.ts`, `content/deliverables.json`, and `app/layout.tsx` are **single-writer files**. If both phases claim any one of them, they are sequential, not parallel.
- One writer per worktree, and a separate worktree per phase branched from `CODEX_BASE_SHA`. Never share a write worktree.
- Both must re-run the full verification matrix (§6) independently, and the integrator must re-run it again after merge — a guard that passes in two isolated worktrees can still fail once both changes coexist (`section-nav-anchors` T3/T4 assert an **exact** id set, so two phases each adding a homepage band will pass alone and fail together).

## 5. Phase 06 blocking rule

```
PHASE_06_BLOCKED_NOW: YES
```

**Unblock conditions:**

1. Phase 04 complete with its own gate issued **PASS** by its lead prompt, and an accepted SHA/tree recorded.
2. Phase 05 complete with its own gate issued **PASS**, and an accepted SHA/tree recorded.
3. Both integrated into one branch, with the **full verification matrix re-run on the combined tree** (not on either phase in isolation).
4. The `P06-LEAD` prompt supplied by Sky, and its own stated preconditions verified from receipts and accepted SHA/tree — **not inferred from files that merely look changed** (the P03-LEAD current-truth rule).

**Phase 06 is not available merely because 04 or 05 has started, or because one of them has finished.** Both gates must be PASS and the combined tree must verify.

## 6. Required verification matrix (what every later phase must re-run)

```
npm run typecheck          # must exit 0
npm run lint               # must exit 0, no warnings
npm test                   # baseline at handoff: 93 files, 852 passed, 2 skipped
npm run build              # 26 static routes
npx vitest run lib/__tests__/static-integrity.test.ts \
               lib/__tests__/section-nav-anchors.test.ts \
               lib/__tests__/recruiter-copy-truth.test.ts \
               lib/__tests__/smart-punctuation.test.ts \
               lib/__tests__/support-first-hierarchy.test.ts   # needs ./out/ — build first
git diff -- components/cinematic     # MUST be empty
```

Plus, for any UI-touching change: axe (0 violations is the standing bar), responsive capture at 320/375/393/430/768/1440, light **and** dark, reduced-motion **and** standard, and 200% zoom reflow with zero horizontal overflow.

**Known CI gap, inherited not introduced:** CI runs `npm test` and **nothing in CI runs `test:static`**, so `static-integrity` and `section-nav-anchors` never execute on GitHub (recorded as DECISIONS §P `P3-CI-STATIC-GAP`). Those two guards are **local-only**. A rail or anchor regression will not be caught by CI. Codex must run them locally, every time.

## 7. Carry-forward register (authoritative, post-Phase-03)

### 7a. Intentionally deferred — owner decision, do not silently "fix"

| Item | Detail |
|---|---|
| **F-008 partial close** | Sky chose the *quieter* contact-intent option (Phase 03 decision D2). `/contact` names role intent; the homepage closer (*"Have something worth building?"*) and the About closing (*"collaborators and clients"*) are **unchanged by instruction**. Reopening this needs Sky's decision, not a phase's judgment. |
| **F-023 Studio Archive** | Sky-approved deferral from Phase 01 §23/§29. Only one private, auth-gated `/archive` surface exists; no second public/view-only edition was reproduced. Neither closed nor confirmed. A guard already forbids copy that presupposes a second surface. |

### 7b. Later-phase-owned work

| Item | Source |
|---|---|
| RC-003 project bridges: one concise *"what this demonstrates"* line on the highest-value projects, plus progressive-disclosure/order improvement, **without deleting evidence** | P03-LEAD RC-003 |
| Narrow the universal accessibility claim *"I build and test against WCAG 2.2 AA on every interface"* (`app/about/page.tsx:223`) | Contract §16, §25 |
| Colophon contradiction: *"no server, no database, and no account: nothing to run, and nothing to breach"* (`lib/content.ts:290`) is falsified by `/archive` | Contract §25; truth manifest |
| Reconcile Portfolio's own test-count inconsistency (`README.md` 567/611 vs `content/a11y-receipts.json` 763) | Contract §21 |
| Verify or soften *"shipped across 20 stacked branches"* (Prompt Library) | Contract §25 |
| Claude Corp public README *"hard law"* / *"Enforces Constitution safety rules"* | Contract §18 — a **Claude Corp repo** finding, not Portfolio |
| AccessMap README says WCAG **2.1** AA while Portfolio says **2.2** AA | Contract §16 — AccessMap repo, out of Portfolio scope |

### 7c. Observations, not defects

- **5-second frame:** the identity badge shows `TECHNICAL SUPPORT` and `AI-ASSISTED BUILDER` at near-equal visual weight, and `SkyPi Studio` is the largest text with its explanation one scroll away. All six frozen-instrument reviewers resolved it by 10 seconds and c1 scored 6/6, so the contract is met. Logged as a possible refinement only.
- Metadata says *"Okanagan Valley, BC"* while `content/profile.json` `location` is `"Canada"` (what the About page actually renders).
- `components/NumberedStep.tsx` and `components/Exhibit.tsx` are **dead code** — zero live JSX call sites. Do not cite them as in-use precedent.
- `components/HamburgerNav.tsx` hardcodes the wordmark instead of reading `profile.json` (a second source of truth for displayed identity).
- `app/work/[slug]` JSON-LD author is a literal `'Sky Halisky'` while `app/blog/[slug]` uses `profile.name`.

### 7d. Unresolved risks

- **CI gap** (§6) — two guards never run on GitHub.
- **No human reviewers.** Every timed recruiter review in Phase 03 used AI reviewers under a blinded protocol. A good proxy that caught two real defects; not a substitute.
- **No assistive-technology testing** in any phase. No VoiceOver, NVDA, or JAWS session. Accessibility evidence is axe-core plus accessibility-tree inspection.
- **No real-device or cross-browser testing.** All captures are headless Chromium at `deviceScaleFactor: 2`. No Safari, no Firefox, no physical device.
- **No Lighthouse or performance pass** in Phases 01–03.

### 7e. Closed — do not resurrect

F-001, F-002, F-003, F-006, F-007 (Phase 03) · F-014, F-028, F-031 (Phase 02) · F-036 (Phase 00) · F-020, F-025 (preserved/verified). Reopening any of these requires new primary evidence, not a re-reading.

## 8. `DO_NOT_CHANGE` — inherited preservation contract

These are **restated**, not newly created. Sources: P03-LEAD permanent invariants 1–19 and preserve register PR-001…PR-015; `docs/IDENTITY_AND_CLAIM_CONTRACT.md`.

### Identity and claims
1. **Skyler Halisky** is the person evaluated. **Sky / Sky Halisky** is the familiar public short form. **SkyPi Studio** is Skyler's authored umbrella practice — never an agency, never a team, never implying headcount.
2. **Senior technical/product support is the primary professional identity.** AI-assisted building is a differentiator, never the occupation.
3. Never fabricate Flagstone approval, release, users, adoption, traction, support metrics, titles, years, or operating scope.
4. Never publish: employer or customer names, tenure, team size, ticket/CSAT/NPS/SLA figures, or the private job-search signal in contract §13.
5. Never imply universal accessibility certification or platform-level enforcement without a named technical control.
6. Preserve exact public / private / synthetic / view-only boundaries.
7. Preserve transparent AI-contribution boundaries and human architecture, acceptance, merge, and release authority.

### Protected surfaces
8. **`components/cinematic/**` is read-only.** Never edit, rename, move, or re-time. Verify with `git diff -- components/cinematic` returning empty before declaring any work done. Protection is convention-only here — no lint rule or CI check enforces it.
9. Preserve the cinematic first frame and its real **Skip intro** affordance.
10. **PR-004 — the hero positioning sentence is byte-identical and must not move:**
    `Senior technical-support specialist. I turn recurring user friction into documentation, QA, and the tools that fix it.`
11. Preserve the About page's accessibility origin paragraph and the pull-quote *"Accessibility is not an add-on. It is where you begin."*
12. Preserve the Credentials subordinating sentence (*"most of the learning happens in the work, not on paper"*) — a repeated phrase family, present in both the populated and empty states.
13. Do not alter `components/RunwayIdentity.tsx`'s support-first role ordering; a guard forbids the bare string `AI Builder` there.

### Design system
14. Preserve the serif / sans / mono role system (Cormorant / DM Sans 300 / DM Mono). No family replacement, no role reassignment.
15. Preserve the warm editorial palette, theme-specific atmosphere (dark is authored, never a mechanical inversion), intentional negative space, restrained motion, and a complete reduced-motion experience.
16. Preserve the OG card's art direction — layout, dimensions, face, terracotta sun, horizon rules, gradient, crop behaviour.
17. **Flagstone remains first, deepest, and strongest** through order, narrative, media, and proof.
18. **`GATE-FLAGSTONE-CTA-PARITY` is permanent, exact, and non-deferrable.** No Flagstone-specific visual CTA override. Guarded by `app/__tests__/flagstone-cta-parity.test.tsx`.

### House rules that will fail the build if broken
19. **Zero em dashes (`—`)** in recruiter copy, source and rendered. No authored `--` in bodies.
20. **Curly apostrophe `’`**, never a straight `'`, in prose.
21. **Section-nav rule 1: labels are never invented.** A new `<section id>` on an indexed route needs a `ROUTE_SECTIONS` entry whose label is **byte-identical** to the section's own rendered eyebrow, in document order.
22. Preserve dated, method-specific evidence receipts. Exact numbers require project, date, method, and scope.
23. Preserve historical receipts and repository archaeology. Never delete a qa-report.

### Process
24. No broad visual redesign, framework migration disguised as cleanup, or speculative modernization.
25. **No production deployment before Phase 11 and explicit Sky authorization.**
26. **Sky retains final merge, visibility, and deployment authority.** Never push, merge to a default branch, deploy, or change repository visibility without explicit authorization in the governing prompt.

## 9. Codex intake gate

Run **read-only**, at the start of Phase 04 and **again separately** at the start of Phase 05. Do not implement if it fails.

```
HANDOFF_INTAKE_GATE

REPO_IDENTITY:              git remote get-url origin
                            → must equal https://github.com/Skypie99/portfolio.git
                            (identify by remote URL, never by folder name)

EXPECTED_BRANCH:            claude/portfolio-3.0-phase00-baseline-20260903
                            → git branch --show-current

EXPECTED_HEAD:              the handoff commit = current branch tip. Verify
                            relationally (see §3):
                              git rev-parse HEAD~1
                                → MUST equal c2bde62b6ef44303f16066319ab471b1a173dcc0
                              git log -1 --format=%s
                                → MUST start with "docs(qa): Claude to Codex handoff"

EXPECTED_SOURCE_STATE:      git diff HEAD~1..HEAD --stat \
                              -- app components lib public content
                                → MUST be EMPTY. The accepted Phase 03 source
                                  tree is 8b195f460301a8a3d8caa4887ac6a7b07cbf83ab
                                  and the handoff does not alter it.

WORKTREE_CLEAN:             git status --short  → must be EMPTY
                            git diff HEAD       → must be EMPTY
                            no MERGE_HEAD / CHERRY_PICK_HEAD / rebase-* present

HANDOFF_ARTIFACTS_PRESENT:  docs/IDENTITY_AND_CLAIM_CONTRACT.md
                            qa-reports/CLAUDE_TO_CODEX_HANDOFF.md
                            qa-reports/PHASE-03_RECRUITER_PATH_GATE_RECEIPT.md
                            qa-reports/2026-09-03_PHASE03_CopySpecification.md
                            qa-reports/2026-09-03_PHASE03_AcceptanceInstrument.md
                            qa-reports/2026-09-03_PHASE02_FOUNDATION_GATE_RECEIPT.md
                            qa-reports/2026-09-03_PHASE01_IDENTITY_CLAIM_RECEIPT.md
                            qa-reports/2026-09-03_PHASE00_BASELINE_LOCK_RECEIPT.md

PHASE_PREREQUISITES_PRESENT:
                            BASELINE_LOCK: PASS       (Phase 00 receipt)
                            IDENTITY_CLAIM_GATE: PASS (Phase 01 receipt)
                            FOUNDATION_GATE: PASS     (Phase 02 receipt + Amendment 1)
                            RECRUITER_PATH_GATE: PASS (Phase 03 receipt §16)
                            → read each receipt and confirm the gate line AND the
                              accepted SHA/tree it names. Never infer a gate from
                              files that merely look changed.

PRESERVATION_CONTRACT_LOADED:
                            §8 of this document read and in context

BASELINE_HEALTH:            npm run typecheck → 0
                            npm run lint      → 0
                            npm test          → 93 files, 852 passed, 2 skipped
                            git diff -- components/cinematic → EMPTY

PHASE_PROMPT_SUPPLIED:      the P04-LEAD / P05-LEAD prompt itself must be provided
                            by Sky. It is NOT in this repository and Claude never
                            had it. Do not infer phase scope from this handoff.

INTAKE_GATE: PASS | FAIL
```

**If `INTAKE_GATE: FAIL`, stop and report. Do not implement.**

## 10. Reproducibility statement

Everything load-bearing is committed to the repository. There is **no undocumented Claude context** a new agent would need to reconstruct: the identity contract, copy specification, acceptance instrument, all four phase receipts, the preservation contract, and the machine-checkable guards are all tracked files at `CODEX_BASE_TREE`.

The one boundary is stated in §4: the Phase 04/05/06 prompts were never in Claude's possession and are not in the repo. Sky supplies them to Codex the same way they were supplied to Claude.
