# THE GUARD LEDGER — Portfolio (skypistudio.com)

**Repo:** `/Users/skypie/Portfolio`
**HEAD (measured):** `polish/p4-link-grammar` @ **`06aa565`** — *"fix(layout): /contact's ELSEWHERE columns span the content row [UP-48]"*, committed 2026-08-01 23:54:43 -0700.
**Note on the SHA:** the task brief and both mine files name `0dbf479`. The branch has advanced 3 commits since (`7cae293`, `41246a4`, `06aa565`). **This ledger is against `06aa565`, the real HEAD** — as the census also was. Where a mine-file claim was true at `0dbf479` and is no longer true at `06aa565`, it is corrected inline and listed in §8.
**Date:** 2026-08-01 (Phase A) · **Model tier:** Opus 5, max effort, unattended.
**Stack:** Next.js 15.5.18 static export (`output: 'export'`), TypeScript 5.7 strict, Tailwind 3, vitest 2.1.8 + jsdom.
**Working tree:** dirty — ` M .claude/launch.json`, ` M DECISIONS_LOG.md`, ` M PROJECT_STATE.md` (Sky's frozen trio) + 61 untracked paths. **UI-POLISH TRAIN IN FLIGHT.**

> **Phase A is read-only; nothing in this repo was modified.**
> No file was edited, staged, committed, moved, or deleted. No git state-changing command was run. `out/` was left exactly as found. `npm test` and `npx vitest run` were executed (read-only) to measure the baseline; `npm run build` was **not** run, because `postbuild` writes into `out/`.

**Measured this window:**
- `npx vitest run` → **54 files passed. 510 passed | 1 skipped | 1 todo (512 total). Exit 0.** Duration 17.96s.
- `npx vitest run lib/__tests__/static-integrity.test.ts lib/__tests__/section-nav-anchors.test.ts` → **43 passed | 1 skipped (44).**
- `out/` exists: **316 files, newest mtime `Sat Aug 01 2026 23:46:36`**. HEAD committed **23:54:43**. The artifact is **~8 minutes and 3 commits older than HEAD.**

**Inputs read (all present — no MISSING INPUTS):**
- `design-reviews/guards/2026-08-01/bank/census-portfolio.md` (211 lines)
- `design-reviews/guards/2026-08-01/bank/mine-portfolio-fable-uplift-r2-r3.md` (684 lines)
- `design-reviews/guards/2026-08-01/bank/mine-portfolio-r4-truth-ui-showcase-corp-a11y-qa.md` (783 lines)

**Dedupe result:** 66 raw invariant rows across the two mines → **55 distinct invariants** after merging 11 duplicate pairs (listed in §2 footnotes). Coverage was **verified by opening the named test file**, not by trusting a census line, for every P1 row and for every row this ledger reclassifies.

---

## 1. HIGH — VACUOUS OR FALSE-CONFIDENCE EXISTING GUARDS

Nine findings. Phase B fixes these **before** it forges anything new. Each carries the exact mutation that settles it.

---

### V-1 · CONFIRMED — the entire built-artifact guard family executes **zero times** in CI (42 tests of false confidence)

**Affects:** static-integrity Gaps 2, 3, 5, 5-newtab, 6, 7; section-nav-anchors T0–T7.

Three facts, each verified this window:

1. `.github/workflows/ci.yml` `test` job is `checkout → setup-node@v6 → npm ci → npm run test`. **No build step.** (Read in full.)
2. `package.json` has **no** `pretest` and **no** `postinstall`. `"test": "vitest run"`. Nothing builds.
3. `test:static` — the only script that chains build → artifact tests — is invoked by **neither** `ci.yml` **nor** `deploy.yml`. Verified by reading both workflows end to end.

`out/` is gitignored, so `OUT_EXISTS` is `false` on a fresh CI checkout and every `describe.skipIf(!OUT_EXISTS)` / `describe.runIf(OUT_EXISTS)` block evaporates.

**Measured size of the hole.** `static-integrity.test.ts` = 17 tests, 1 of which is the deliberate `it.skip` notice → **16 assertion-bearing tests, all inside gated describes**. `section-nav-anchors.test.ts` = 27 tests, 1 of which (`Sidebar section index — guard mode`, line 71) is ungated → **26 gated**. **42 of 510 passing tests (8.2%) do not exist on the gate**, and they are precisely the link-integrity, `rel="noopener"`, reveal-floor, new-tab-announcement, share-card-identity, share-card-MIME and TOC-truth checks — the ones that protect against *false claims shipped to users*.

Derived CI count: **468 passing on GitHub, not 510.** I did **not** measure this directly, because the only way to do so is to move `out/` aside, which Phase A's read-only law forbids. The 468 is arithmetic from two measured numbers (510 total, 42 gated), and Phase B's first act should confirm it.

**Already known and recorded** at `lib/__tests__/section-nav-anchors.test.ts:44-48` and in `design-reviews/ui-polish/2026-08-01/build-plan/DECISIONS.md` §P `P3-CI-STATIC-GAP`. Confirmed accurate; quantified here.

**MUTATION TO SETTLE IT:** `mv out out.bak && npx vitest run --reporter=basic; mv out.bak out` — record the passing count. It must read **468**, not 510. The delta *is* the CI gap, measured. (Phase B only; `out/` may not be moved in Phase A.)

---

### V-2 · CONFIRMED — `ci.yml` never fires for this repo's branch names or its actual merge workflow

**Affects:** the gate itself.

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches:
      - "cycle/**"
```

**Measured:** the repo has **151 local branches; exactly 1 matches `cycle/**`** (`cycle/node24-actions-2026-06-12`, June). The live families are `polish` (20), `uplift` (16), `r4` (8), `ui-polish` (4), `a11y` (2), `truth` (1), `showcase` (1) — **none match either trigger.** Pushing the current HEAD branch runs no CI at all.

That leaves `pull_request → main`. But the recorded and repeated workflow for this repo is a **local fast-forward merge followed by a direct push to `main`** ("Sky ff-merged P1→P6 herself, `main==origin==…`"). A local ff-merge opens no pull request. Meanwhile `deploy.yml` (`on: push: branches: [main]`) builds and publishes to GitHub Pages with **no lint, no typecheck, no test** — `deploy.yml:8-11` documents that omission as deliberate separation of concerns, sound *only if PRs exist*.

> **On the path this repo actually ships through, the gate and the deploy path have no intersection.** Everything green in this ledger is green because it was run by hand, locally, just now.

**MUTATION TO SETTLE IT:** `git rev-parse --abbrev-ref HEAD` (→ `polish/p4-link-grammar`), then `grep -nE 'branches:|- "' .github/workflows/ci.yml` and confirm no pattern matches it. Zero jobs would be selected. Optionally `act -n push` on the current branch to see the empty plan.

---

### V-3 · CONFIRMED VACUOUS — `asset-integrity.test.ts`'s headline guard is an `it.todo`, and its docblock claims a guarantee it does not provide

`lib/__tests__/asset-integrity.test.ts:29`:
```ts
// TODO: add real badge PNGs to public/images/certificates/<slug>/badge.png to un-todo this guard
it.todo('every badgeImage.src in certificates.json exists in public/');
```

`it.todo` registers a name and **asserts nothing** — vacuity by construction. The file's docblock (lines 8–13) states: *"It can run as part of `npm test` and will fail fast if any badge is missing."* **That is false.** The only executing test checks that `certificates.json` parses and is non-empty.

**The stated blocker is already resolved.** I resolved all 9 `badgeImage.src` paths against `public/` this window: **9/9 exist.** The TODO waits for a condition met long ago and would pass today.

**Severity mitigated, not removed:** `scripts/validate-assets.mjs:61-79` (wired as `prebuild`) does iterate the same 9 entries and hard-fails the build, so a missing badge cannot reach production via `npm run build`. The finding is that the test file **advertises** a guarantee it does not deliver, and an auditor counting coverage would count it as covered.

**MUTATION TO SETTLE IT:** convert to a live `it()` that resolves each `badgeImage.src` under `public/`, then `mv public/images/certificates/umich-python-2025/badge.png{,.bak}` and run `npx vitest run lib/__tests__/asset-integrity.test.ts`. It must go RED naming the slug. Restore.

---

### V-4 · CONFIRMED — `static-integrity.test.ts`'s header documents a **Gap 4** that does not exist in the file

`lib/__tests__/static-integrity.test.ts:17-22` reads:

> *"Gap 4 — Referenced image asset existence. Every `<img src="...">` pointing to a local path … must resolve to an existing file inside `./out/`. Missing images produce broken-image icons on the live site — badge images, hero images, and gallery images are all caught."*

**Verified by grepping every `describe` in the file:** it implements Gaps 2, 3, 5, 5-newtab, 6, 7. **There is no Gap 4 describe.** The only Gap 4 in the repo is V-3's `it.todo`, in a different file, scoped only to certificate badges.

This is the repo's own documentation claiming a guard it does not have — the honesty failure the truth-audit exists to catch, turned inward. It is also *why* PF-05 (a live broken blog hero, §3) survived: a reader checking "are images guarded?" finds a paragraph saying yes.

**MUTATION TO SETTLE IT:** implement PF-06 (§3, P1-6). Before the fix it goes RED immediately on `content/blog.json`'s figure. After: point one `deliverables.json` `heroImage.src` at a missing file and confirm RED.

---

### V-5 · SUSPECT-VACUOUS — three silent-pass early returns inside live artifact guards

```
lib/__tests__/static-integrity.test.ts:332   if (!existsSync(blog)) return;   // route shape guarded elsewhere
lib/__tests__/static-integrity.test.ts:341   if (!existsSync(cssDir)) return;
lib/__tests__/static-integrity.test.ts:403   if (!existsSync(home)) return;
```

Line 341 is the serious one: it guards the **entire** built-CSS assertion block — the one carrying the L7-01 negative-lookbehind `expect(css).not.toMatch(/(?<!js )\.reveal\{opacity:0/)`. If Next ever changes the CSS output directory from `out/_next/static/css`, the assertion does not fail, it **silently passes**, and the reveal floor — the site's worst-case failure mode — is unguarded with a green tick. Same shape at 332 (`out/blog/index.html`) and 403 (the homepage for the noscript sweep).

`existsSync → return` is the exact "test that cannot fail" pattern, applied to a precondition rather than an assertion. The fix is `expect(existsSync(cssDir), 'built CSS dir moved — guard is blind').toBe(true)`.

**MUTATION TO SETTLE EACH:** temporarily rename the target (`mv out/_next/static/css out/_next/static/css.bak`) and re-run the file. Today it stays **green**; after the fix it must go RED. Restore. (Phase B only — Phase A may not move build output.)

---

### V-6 · CONFIRMED — the local pass is against a **stale** `out/`, which is worse than a missing one

**Measured:** `out/` newest mtime `Sat Aug 01 2026 23:46:36`; HEAD `06aa565` committed `23:54:43`. The artifact predates HEAD by ~8 minutes and **three commits** — `7cae293` (external-link colour), `41246a4` (/accessibility pill), `06aa565` (/contact layout). Two of those touch exactly the link and layout surfaces Gaps 2 and 3 police.

So the 43 build-dependent tests that "passed" for me validated an export built **before** the code they claim to check. A missing `out/` skips loudly (and the section-nav guard-mode test even `console.warn`s). A stale `out/` **passes falsely**, and a developer running `npm test` gets a green tick for link integrity that was never checked against their code.

**MUTATION TO SETTLE IT:** in a scratch copy, edit any page's internal `href` to `/does-not-exist/`, run `npm test` **without** rebuilding. It reports green today. With PF-03's freshness assertion (§3, P1-3) it must go RED with "`out/` is older than HEAD".

---

### V-7 · CONFIRMED — `work-receipt.test.tsx` is an **inverted** guard and will be miscounted as coverage

`app/__tests__/work-receipt.test.tsx:30`:
```ts
expect(code?.textContent).toBe('TKTK_ACCESSMAP_TEST_COUNT');
```

This asserts the placeholder **is present** in production. That is *correct as designed* — it is a scaffold-integrity pin keeping an unfinished slot visibly unfinished rather than letting a fabricated number take its place. It is **not vacuous** (deleting the placeholder makes it red).

The false confidence is directional: an auditor asking *"is the placeholder problem guarded?"* finds a test named for it and counts it as covered, when in fact **nothing anywhere fails on a NEW placeholder** — that is PF-34 (§3, P1-9), which is naked. Verified: `TKTK_ACCESSMAP_TEST_COUNT` still renders at `app/work/[slug]/page.tsx:61`, and `public/humans.txt:1` still opens `# ---- NEEDS-SKY COPY (placeholder — not final) ----`. Both live in production, both since before 2026-07-14.

**MUTATION TO SETTLE IT:** add `TODO(Sky)` to any rendered string in `app/about/page.tsx` and run the full suite. It stays **green** today — that is the proof the ship gate does not exist. With PF-34 it must go RED naming the file and the token.

---

### V-8 · CONFIRMED DEAD MACHINERY — `BASE_PATH = '/portfolio'` strips a prefix this site does not have

`lib/__tests__/static-integrity.test.ts:114` declares `const BASE_PATH = '/portfolio'` and the surrounding comment asserts *"The Next.js static export for this site uses basePath=/portfolio in production."*

**Verified:** `next.config.mjs` at `06aa565` sets `output: 'export'` and `trailingSlash: true` and contains **no `basePath` key at all**. `public/CNAME` = `skypistudio.com`. Three prior audits already contradicted the doc (P0-B, corp-page-audit §5, ui-polish P3). Project `CLAUDE.md` §Gotchas 3 still asserts it, as does `components/SidebarFeatured.tsx:19`.

Harmless today (the strip is a no-op), but it is dead machinery inside a live guard, and it is one refactor away from silently mis-resolving every internal href. **Not fixed here — Phase A is read-only, and whether to delete or keep as future-proofing is Sky's call (§9 Q8).**

**MUTATION TO SETTLE IT:** nothing to make red — the finding is that the code is unreachable. Confirm with `grep -n basePath next.config.mjs` → no output.

---

### V-9 · CONFIRMED — the README's test row is stale by 30× and never names the real ship gate

`README.md:47`: `| `npm run test` | Vitest single run (**17 tests across 4 files**) |`

**Measured reality: 510 passing across 54 files.** The README's Scripts table (lines 38–49) also never mentions **`test:static`** — the only command that runs the artifact guards. The command a new contributor would run is documented; the command that actually gates the site is not. (`CLAUDE.md:118` does document `test:static`; the README does not.) This is the documentation half of §7.

**MUTATION TO SETTLE IT:** none needed — it is a factual mismatch settled by running `npx vitest run` and reading the tail. Fix is a doc edit, and §7 proposes replacing the row with the single standing command.

---

**How I checked for vacuity beyond these nine.** I ran a repo-wide census of every `it.only` / `describe.only` / `test.only` / `it.todo` / `it.skip` / `.skipIf(` / `.runIf(` under `app/`, `components/`, `lib/`. **Complete result: zero `.only` anywhere**; one `it.todo` (V-3); one `it.skip` (the deliberate labelled notice at `static-integrity.test.ts:51`); eight `skipIf`/`runIf` describes (V-1). I additionally grepped every guard-shaped test file for bare `return;` preconditions (V-5) and read `ink-contrast.test.ts`, `token-parity.test.ts`, `ember-large-text.test.ts`, `TapTargets.test.tsx`, `A11yReceipts.test.tsx`, `HamburgerNav.test.tsx`, `schema.test.ts`, `BlogIndex.test.tsx`, `ProductReveal.test.tsx`, `rounds.test.ts` and `section-nav-anchors.test.ts` for self-satisfying assertions. **`lib/__tests__/ink-contrast.test.ts:99` ships its own anti-vacuity test** (`it('rejects the pre-fix ink values (non-vacuity)')`) — the only guard in the repo that does. It is the template Phase B should copy.

---

## 2. THE GUARD LEDGER TABLE

55 invariants. **Category:** contract · bug-class · floor · honesty-lock · ratified-words · protected-artifact · guard-integrity.
**Guarded?** GUARDED · GUARDED (CI-INERT) — the guard exists and bites locally but runs in **no** automated gate, see V-1/V-2 · PARTIAL · NAKED · MANUAL.
**Effort:** S ≈ one file, under an hour · M ≈ half a day · L ≈ needs provisioning or a rig.

| ID | invariant | origin citation | cat | bitten | currently guarded? | proposed mechanism | pri | eff |
|---|---|---|---|---|---|---|---|---|
| **PF-01** | CI executes the build-dependent guards (build before test) | `ui-polish/2026-08-01/build-plan/DECISIONS.md` §P `P3-CI-STATIC-GAP` | guard-integrity | 1 | **NAKED** (verified `ci.yml` `test` job = `npm ci` → `npm run test`) | CI step | **P1** | S |
| **PF-02** | every `OUT_EXISTS`-gated file is named in the ship gate | `ui-polish/…/HANDOFF.md` §"Five things the next phase should inherit" #2 | guard-integrity | 1 | **NAKED** | source-grep assertion | **P1** | S |
| **PF-03** | artifact guards **fail**, never skip or pass, on a missing **or stale** `out/` | `lib/__tests__/static-integrity.test.ts:39-50` (mechanism) + `uplift/2026-07-15_R2-P6…md` §head 1 (motivation) | guard-integrity | 1 | **NAKED** (a `console.warn` in a passing suite is not a gate) | unit test + CI step | **P1** | S |
| **PF-04** | no guard that cannot fail (`.only`, unjustified `.todo`/`.skip`) | `ui-polish/…/DECISIONS.md` §DRIFT, P3 pre-flight | guard-integrity | 3 | **NAKED** | source-grep assertion | **P1** | S |
| **PF-05** | every image path in `content/blog.json` resolves in `public/` | `ui-polish/…/HANDOFF.md` §"Carried out of P1" | bug-class | 1 · **LIVE NOW** | **NAKED** (verified: `validate-assets.mjs` reads certificates/deliverables/plates, never `blog.json`) | build-time check + unit test | **P1** | S |
| **PF-06** | every local `<img>`/`<source>` URL in built HTML resolves in `out/` | `lib/__tests__/static-integrity.test.ts:17-22` header §Gap 4 | bug-class | 2 | **NAKED** — and the header claims otherwise (V-4) | unit test (built artifact) | **P1** | M |
| PF-07 | every media sibling consumed at render is declared in the Zod schema | `uplift/2026-07-14_R2-P5…md` §WI-2 · C-02 | bug-class | 1 | **NAKED** (`validate-assets` guards declared→exists, the opposite direction) | unit test | P2 | S |
| PF-08 | ≤1 deliverable may be `featured: true` | project `CLAUDE.md` §Gotchas 4 + `lib/content.ts:42-72` | contract | 0 | **GUARDED** — `lib/__tests__/content.test.ts` §"featured-slot invariant (Dana DATA_SHAPE.md §6)" | unit test (exists) | — | — |
| PF-09 | alt 4–200 chars, never "image/picture/photo of" | `a11y-qa/2026-07-31/00_DISCOVERY.md` §Gates that exist; `lib/schema.ts:21-25` | contract | 0 | **GUARDED (non-vacuously)** — `lib/__tests__/schema.test.ts:123,131,139,147,155,163` (3 reject + 1 mid-sentence accept + length bounds) | unit test (exists) | — | — |
| **PF-10** | every route declares its OWN og:url and keeps site_name/locale | `truth-audit/2026-07-31/PHASE-B-CLOSEOUT.md` §3 PB-1; `uplift/…R2-P1…md` W0-04 | contract | **2 → CLASS** | **GUARDED (CI-INERT)** — Gap 6, 3 tests at `static-integrity.test.ts:464/486/500` | already built — its gap **is** PF-01/PF-03 | see PF-01 | — |
| PF-11 | every share-card path carries a real image extension; `.png` alias byte-identical | `truth-audit/…/PHASE-B-CLOSEOUT.md` §3 PB-2 | contract | 1 | **GUARDED (CI-INERT)** — Gap 7, 4 tests at `:561/584/598/615` | see PF-01 | see PF-01 | — |
| PF-12 | every internal href resolves in `out/` | `qa-reports/2026-05-25_Gary_StaticIntegrity.md` §Gap 2 | contract | 1 | **GUARDED (CI-INERT)** — `:178` + `:214` sanity check | see PF-01 | see PF-01 | — |
| PF-13 | every external `<a>` carries `rel="noopener noreferrer"` | same, §Gap 3 | contract | 1 | **GUARDED (CI-INERT)** — `:235` + `:277` sanity check | see PF-01 | see PF-01 | — |
| PF-14 | every `target="_blank"` announces itself, `<noscript>` included | `a11y-qa/…/PHASE_B_CLOSEOUT.md` C9-1 | contract | 1 | **GUARDED (CI-INERT)** — `:382` + `:399` | see PF-01 | see PF-01 | — |
| **PF-15** | per built route: one `<h1>`, `lang="en"`, one `<main>`, top-level `contentinfo`, unique `<title>`, no heading skip, skip link first | `a11y-qa/2026-07-31/02_lens2_screenreader.md` §Verified clean; `uplift/2026-07-13_R2-P3…md` §C-71 | contract | 1 (C-71, 32/32 axe scans) | **NAKED site-wide** (verified: only `Hero.test.tsx:29` + `HeroSettle.test.tsx`, both component-scoped) | unit test (built artifact) | **P1** | M |
| PF-16 | dialog: trap · Escape · focus-return · `aria-expanded` · `aria-controls` only while mounted | `a11y-qa/…/PHASE_B_CLOSEOUT.md` rows L2-1 / L2-2 | contract | 1 | **GUARDED** — `components/__tests__/HamburgerNav.test.tsx:93/110/131/146` | render test (exists) | — | — |
| PF-17 | the mobile dialog scrolls; the theme toggle is reachable at every device height | `qa-reports/2026-07-04_P0-B…md` §JOB 2 (L5-02) | contract | 1 (HIGH) | **GUARDED** — `HamburgerNav.test.tsx:184` + `:196` | render test (exists) | — | — |
| PF-18 | the rail's index describes the route it is on; title bands never indexed | `ui-polish/…/DECISIONS.md` §P `P3-UP-10-TITLEBAND` | contract | 1 | **GUARDED (CI-INERT)** — T0–T7 + T4b, 26 tests, `section-nav-anchors.test.ts:219-341` | see PF-01 | see PF-01 | — |
| PF-19 | `useActiveSection` clears on every id-list change | `ui-polish/…/DECISIONS.md` §P `P3-SPY-RESET` | bug-class | 1 | **GUARDED** — `lib/__tests__/useActiveSection.test.tsx` (4 assertions incl. the empty-route case) | unit test (exists) | — | — |
| PF-20 | `role="list"` on style-stripped lists survives, with its eslint-disable | `ui-polish/…/08_p8-colophon-craft.md` §PRE-FLIGHT | contract | 1 | **NAKED** (verified live at `components/CalibrationRecord.tsx:44`, comment at `:37`; no test) | source-grep assertion | P2 | S |
| PF-21 | ≥44px effective hit areas with **zero** interactive overlaps | `ui-polish/…/DECISIONS.md` §P `P2-UP-02-MECH` | floor | **2 → CLASS** | **PARTIAL** — `components/__tests__/TapTargets.test.tsx` (4 tests) asserts the class recipe **and** `not.toContain` the opposite direction; real px needs a layout engine | render test (exists) + rig for geometry | P2 | L |
| **PF-22** | inks clear 4.5:1 against **pixel-measured composited** backdrops | `a11y-qa/…/PHASE_B_CLOSEOUT.md` §FIRST | floor | **2 → CLASS** | **PARTIAL** — `lib/__tests__/ink-contrast.test.ts` (5 rows + a real non-vacuity test at `:99`); the 5 backgrounds are **hardcoded 2026-07-31 measurements**, so a `world-surface-*` change breaks reality while the guard stays green | unit test — add a surface-drift pin | **P1** | S |
| **PF-23** | `--rgb-accent` clears its floors: never a fill behind small text (4.5), focus ring ≥3.0 | `uplift/…R2-P2…md` §⚠️ flaky axe; `a11y-qa/…/06_lens4_contrast.md` §Results | floor | 2 | **NAKED** (verified: `BINDING_BACKGROUNDS` covers `rgb-accent-ink` and `rgb-ink-meta` only — `--rgb-accent` at `globals.css:75` has no row) | unit test — extend the existing instrument | **P1** | S |
| PF-24 | ember gradient classes only on ≥24px display sizes | `a11y-qa/…/MASTER_TABLE.md` L4-2 | floor | 0 | **GUARDED** — `lib/__tests__/ember-large-text.test.ts` (both halves + the gradient-clip reason) | unit test (exists) | — | — |
| PF-25 | globals.css ↔ tailwind.config.ts ↔ lib/cn.ts stay in lockstep | `lib/__tests__/token-parity.test.ts` header (Overhaul 2026-06-03) | floor | 1 | **GUARDED** — 107 assertions over the three real source files | unit test (exists) | — | — |
| PF-26 | `.reveal` rests visible; hidden armed only under `html.js` from an in-`<head>` script | `qa-reports/2026-07-04_P0-B…md` §JOB 1; `r2-audit/…Design_Review.md` PROTECT-33 | floor | 1 (CRIT L7-01) | **GUARDED (CI-INERT)** — Gap 5, 3 tests at `:304/328/338` incl. the negative lookbehind; **plus** `RevealAlive.test.tsx` (runs in CI) | see PF-01 + fix V-5 | see PF-01 | — |
| PF-27 | the RM `.reveal` reset must **beat** `html.js .reveal` on specificity | `qa-reports/2026-07-04_P0-B…md` §Deviations | bug-class | 1 | **NAKED** (verified: Gap 5 checks the arm, not who wins; the source is correct at `globals.css:942-951` — `!important` + `html.js` scoping) | unit test (built CSS) | P2 | S |
| PF-28 | reduced motion = the final resting state, never a suppressed affordance | `a11y-qa/…/00_DISCOVERY.md` §House floors (MOTION_SYSTEM.md §6) | contract | 1 | **PARTIAL** — 13 component tests cover the behaviours; the site-wide `0.01ms !important` backstop (`globals.css:1977-1984`) is asserted by nothing | source-grep assertion (built CSS) | P2 | S |
| PF-29 | no element's visibility may rest on `animation-delay` under RM | `uplift/2026-07-13_R2-P4…md` §WI-1 RM note | bug-class | 1 | **NAKED** (verified: the global floor sets duration/iteration/transition/scroll only — `globals.css:2839` says so in a comment) | source-grep assertion (**fragile**, see §4) | P3 | M |
| PF-30 | descendant transforms need their own `motion-safe:` gate | `r2-audit/assets/p2-craft/skeptics/C-82-WF-C.md` | bug-class | 1 | **NAKED** (verified: `CertCard.tsx:63` complies; nothing stops the next component) | source-grep assertion + allowlist | P3 | S |
| PF-31 | `RunwayIdentityRelease` gates retirement on `intersectionRatio > 0`; any bottom-margin expansion is RM-gated | `uplift/2026-07-13_R2-P0…md` §WI-1 (C-21) | bug-class | 1 (+1 near-miss) | **PARTIAL** — ratio gate guarded at `RunwayIdentityRelease.test.tsx:85`; the RM-margin branch is guarded only for `IntroScrollCue` | unit test — extend | P2 | S |
| PF-32 | the RM bracket line shows **only** under reduced motion | `a11y-qa/…/05_lens9_claims.md` C8 | ratified-words | 0 | **NAKED** (verified: `app/accessibility/page.tsx:113` carries `hidden motion-reduce:block`; **no test references it**) | render test | P2 | S |
| **PF-33** | `RailInert` + `RunwayIdentityRelease` observe with `rootMargin:'100000px 0px 0px 0px'` | `uplift/2026-07-13_R2-P0…md` §WI-1 (C-20) | bug-class | 1 (live CRIT) | **NAKED** (verified: neither test file contains the string `rootMargin`; the idiom already exists at `IntroScrollCue.test.tsx:137/148/167`) | unit test | **P1** | S |
| **PF-34** | only named, dated, Sky-owned placeholders may reach the built export | `truth-audit/…/06_phase-C_true-sentences.md` §CAR 9; `uplift/2026-07-15_R2-P6…md` §head 1 | honesty-lock | 1 (catastrophic, **still live**) | **NAKED** — and the one related test is **inverted** (V-7) | unit test (built artifact) + allowlist file | **P1** | M |
| PF-35 | every published number reads from a build-time artifact or carries a visible date | `truth-audit/2026-07-31/REPORT.md` TA-2 / TA-5 | honesty-lock | **4 → CLASS** | **PARTIAL** — `lib/__tests__/rounds.test.ts` binds `rounds.json`; `A11yReceipts.test.tsx:34` binds the receipts JSON; the homepage chips and TKTK's three numbers are literals | unit test per bound surface (**general grep is fragile**, §4) | P2 | M |
| PF-36 | the receipts strip's self-fence sentence stays byte-intact | `r3-audit/01_orientation.md` PROTECT-37 (**NAMED AT-RISK**) | honesty-lock | 0 | **PARTIAL** — `A11yReceipts.test.tsx:34` pins every label/**value** against the evidence JSON; the self-fence lives in the JSON's free-text `detail` (`public/receipts/a11y-2026-07-09.json:19`) and **nothing pins it** | unit test — 1 assertion | P2 | S |
| PF-37 | the AA-contrast sentence may only ship while its guard covers both themes | `a11y-qa/…/05_lens9_claims.md` C4 | honesty-lock | 1 | **NAKED** | unit test (meta — Sky's call on shape, §9 Q9) | P2 | S |
| PF-38 | the A3 / X1 / X5 honesty sentences are never softened or removed | `truth-audit/…/06_phase-C_true-sentences.md` §WHAT THIS TRAIN MUST NEVER DO | honesty-lock | 0 | **NAKED** (verified live at `app/about/page.tsx:248`, `lib/content.ts:202`, `lib/content.ts:220`; **zero test references**) | source-grep assertion | P2 | S |
| PF-39 | "Open to thoughtful product collaborations" is byte-locked | `r3-audit/build-plan/DECISIONS.md` §STANDING #3; `ui-polish/…/REPORT.md` §2.2 | ratified-words | 0 | **NAKED** (verified live at `app/page.tsx:157` — the ledgers' `:123` is stale; **zero test references**) | source-grep assertion | P2 | S |
| PF-40 | a receipt link resolves to a destination that contains what the sentence promises | `corp-page-audit/2026-07-16_CorpPage_Audit.md` CP-1 | honesty-lock | **2** | **PARTIAL** — href half is Gap 2 (CI-inert); the **semantic** half is MANUAL | Gap 2 + **MANUAL-ONLY** (§5) | P2 / M | — |
| PF-41 | no agent writes Sky's copy; an empty slot beats invented voice | `r4-gallery/build-plan/DECISIONS.md` §S | honesty-lock | 0 | **MANUAL** | **MANUAL-ONLY** (§5) — fenced mechanically by PF-34/38/39 | M | — |
| PF-42 | while the footer says "No analytics. No cookies.", the repo carries none | `uplift/2026-07-13_R2-P0…md` §WI-7 (PROTECT-60) | honesty-lock | 0 | **NAKED** (verified: string live at `components/Footer.tsx:250`; no test; **I re-ran the dependency check this window — 10 runtime deps, none analytics**) | build-time check | P2 | S |
| PF-43 | the `/blog/` count eyebrow equals the real entry count | `r3-audit/03_r3-slate.md` PROTECT-69 | honesty-lock | 0 | **GUARDED** — count is derived (`app/blog/page.tsx:73` `{posts.length}` + correct pluralisation) and `BlogIndex.test.tsx:95` proves it with a 2-post fixture against 1 real post | unit test (exists) | — | — |
| PF-44 | "See it in motion." gates on real media, never array length | `uplift/2026-07-13_R2-P0…md` §WI-4 · T4 (CRIT W3-01) | bug-class | 1 (shipped CRIT) | **NAKED** (verified: correct gate survives at `app/work/[slug]/page.tsx:590`; **no test greps the heading**) | render test | P2 | S |
| PF-45 | src-less shots render `data-pr-placeholder="designed"`, never a skeleton | `r2-audit/…Design_Review.md` PROTECT-39 | contract | 0 | **GUARDED** — `components/__tests__/ProductReveal.test.tsx:128-145` (resolves mine-1 §CLAIMED-UNVERIFIED 7) | render test (exists) | — | — |
| PF-46 | no DM Sans element computes ≥600; `font-synthesis-weight: none` holds | `r2-audit/…Design_Review.md` PROTECT-24 / C-85 | contract | 1 | **NAKED** (verified: `globals.css:403` declares the synthesis kill, `MarkdownProse.tsx:30` uses `font-light`; no test) | source-grep assertion + allowlist | P2 | S |
| PF-47 | every visitor-facing copy path runs `smartPunctuation` | `r2-audit/assets/p2-craft/skeptics/C-33-skeptic-evidence.md` | contract | 1 | **NAKED**, but **source is compliant at `06aa565`** — `smartPunctuation` wraps the caption paths at `app/work/[slug]/page.tsx:335/619/669`. **This corrects mine-1**, which reported the caption path bypassing it | unit test | P3 | S |
| PF-48 | route leaves never call `ReactDOM.preload()` | `uplift/2026-07-14_R2-P5…md` §WI-3 · C-03 | bug-class | 1 | **NAKED** (verified: zero test references) | source-grep + built-HTML check | P2 | S |
| PF-49 | `out/` has no `/500` in either form; keeps **both** 404 forms | `uplift/2026-07-14_R2-P5…md` §WI-1 · C-12 | bug-class | 1 | **PARTIAL** — `scripts/prune-500.mjs` runs as `postbuild` and *warns*; a warn is not a gate | build-time check | P2 | S |
| PF-50 | zero console errors on every route, every visit | `ui-polish/…/REPORT.md` UP-01 | floor | 1 | **NAKED** — rig not in the repo (§4) | CI step, **needs provisioning** | P3 | L |
| PF-51 | worst CLS ≤ 0.004 · 0 horizontal overflow at 320/375 | `r3-audit/build-plan/DECISIONS.md` §STANDING #5; `ui-polish/…/REPORT.md` §0 | floor | 1 (caught pre-ship) | **NAKED** — rig not in the repo (§4) | CI step, **needs provisioning** | P3 | L |
| PF-52 | 0 axe violations, all routes × both themes | `r3-audit/build-plan/DECISIONS.md` §STANDING #5; `a11y-qa/…/01_lens1_automated.md` | floor | 0 (caught 2 mid-build) | **NAKED** — **`axe-core` is not a dependency of this repo at all** (verified) | CI step, **needs provisioning** | P3 | L |
| PF-53 | `components/cinematic/**` + the named globals ranges are byte-frozen | `r3-audit/build-plan/DECISIONS.md` §STANDING #1; `qa-reports/2026-07-19_MotionClockwork_Pass.md` §Adversarial outcome | protected-artifact | 1 (caught pre-merge) + 7 manual proofs | **NAKED** (verified: `CinematicDesert.test.tsx` has 4 behavioural tests, nothing pins bytes/380vh/680vh/`'bottom bottom'`) | build-time hash manifest | P2 | M |
| PF-54 | `PROJECT_STATE.md` / `DECISIONS_LOG.md` / `.claude/launch.json` are never staged by an agent | `ui-polish/…/DECISIONS.md` §KNOWN-DIRTY | protected-artifact | 1 (near-miss) | **NAKED** (verified: **no active git hooks**, no `.husky/`; all three still ` M` right now) | pre-commit check | P2 | S |
| PF-55 | a factory re-run reproduces every still byte-identically outside named byte-expected classes | `qa-reports/2026-07-31_ShowcaseRefresh.md` §Determinism proof | protected-artifact | 1 | **PARTIAL** — `scripts/capture-showcase.mjs --verify` exists and is tracked, but its browser is unprovisioned (§4) | on-demand gate, **not per-PR** | P3 | L |

**Dedupe footnotes.** 11 merges, both origin citations kept: mine-1 `OG-ROUTE-IDENTITY` → **PF-10**; `NO-UNRATIFIED-PLACEHOLDER` → **PF-34**; `C3-POSITIONING-STRING` → **PF-39**; `AXE-STRICT-ZERO` → **PF-52**; `CLS-FLOOR` → **PF-51**; `REVEAL-FAILURE-FLOOR` → **PF-26**; `FEATURED-SLOT` → **PF-08**; `ALT-TEXT-SHAPE` → **PF-09**; `INTRO-LOCK-BYTES` → **PF-53**; `CONTENTINFO-TOP-LEVEL` → folded into **PF-15** (it is an instance of the landmark class; PF-15 therefore inherits its bitten count of 1); mine-1 `ACCENT-FILL-AA` + mine-2 `FOCUS-RING-3-1` → **PF-23** (one token, one instrument, two floors).

**Bitten-count adjudications** (per the house rule against double-counting):
- **PF-10 = 2, not 3.** mine-1's "first bite 2026-07-13 R2-P1 W0-04" and mine-2's "first bite BP8 2026-07-18 (W0-04 repaired)" are *the same finding* logged at different phases. Distinct bites: W0-04 and TA-10.
- **PF-23 = 2, not 4.** mine-1 rates the terracotta-fill residual "bitten 3" — but reading the citations (R2-P2, R2-P6, R3) these are **three re-loggings of one standing, never-closed residual**, not three regressions. Counted as 1, plus 1 distinct bite for the focus-ring `4.33` vs `4.02` documentation drift (`qa-reports/2026-06-17_Steve_FocusRingCommentFix.md`).
- **PF-53 = 1 (caught pre-merge), not 0.** mine-1 says "0 regressions / 7 manual proofs"; mine-2 records the MotionClockwork governance breach that was BLOCKED and REVERTED. A breach caught before merge is still a bite of the class.
- **PF-04 = 3, but the mechanizable guard only covers 1 of the 3.** Bites (1) P3's self-satisfying label check and (2) P2's 96%-vacuous hit test were caught by adversarial human review and no grep can catch them; bite (3) the standing `it.todo` **is** catchable. Stated plainly so nobody mistakes the guard for full coverage of the class.

**Coverage totals:** GUARDED (runs in CI) **11** · GUARDED (CI-INERT — the guard is real, the gate is not) **7** · PARTIAL **8** · NAKED **27** · MANUAL **2**.
Counting CI-inert as unguarded on the shipping path — which V-1 and V-2 together establish — the honest number is **11 guarded, 44 not**.

---

## 3. P1 DETAIL — THE TOP TIER

Ten guards. Four fix false confidence, two close a live user-facing defect, four close a bitten class or a live-CRIT regression. Each names the exact mutation that must make it RED and a **real existing test file in this repo** whose grammar it should copy.

---

### P1-1 · PF-01 — CI builds before it tests

**Statement.** The automated gate that decides whether code ships must execute the build-dependent guards. Concretely: `.github/workflows/ci.yml`'s `test` job runs `npm run build` before `npm run test`, **and** `ci.yml` fires on the branch families this repo actually uses (`polish/**`, `ui-polish/**`, `r4/**`, `a11y/**`, `truth/**`, `uplift/**`, `showcase/**`, `fix/**`, `feat/**` — or simply `'**'`).

**Why violating it is a defect.** Not "a test is missing" — **42 tests that exist, pass locally, and are quoted in every phase report as evidence do not run on the gate.** They are the link-integrity, `rel=noopener`, reveal-floor, new-tab-announcement, share-card-identity and TOC-truth checks: exactly the class whose failure ships a *false claim to a user*. A PR can be green while shipping a dead internal link. Combined with V-2 — no CI trigger matches this repo's branches, and a local ff-merge opens no PR — the enforced-on-push surface today is **nothing**, while `deploy.yml` publishes to production within ~90 seconds.

**Exact mutation that must make it red.** Change one internal `href` in `app/page.tsx` to `/does-not-exist/`, push the branch (or open a PR). The `Test` job must fail with Gap 2's *"broken internal link(s)"* message. Today it passes — or, on a `polish/**` branch, no job runs at all.

**House idiom to imitate.** The workflow file itself: `.github/workflows/ci.yml`'s existing `build` job already demonstrates the `needs: [lint, typecheck, test]` chaining and the `actions/setup-node@v6` + `cache: npm` + `npm ci` preamble. The cheapest correct edit adds one `- run: npm run build` step to the `test` job above `- run: npm run test`; the alternative (a dedicated `static` job running `npm run test:static`) costs a second `npm ci` and re-introduces PF-02's path-filter problem. **Recommend the one-liner.**

**Caveat to record with it.** `deploy.yml` runs no tests by design, and this repo merges locally and pushes `main` directly. Fixing `ci.yml` alone does not gate the production path. Sky's decision (§9 Q1) is whether `deploy.yml` should also gate — the honest options are a reusable-workflow `needs:` on the CI jobs, or accepting that the standing local command (§7) is the real gate.

---

### P1-2 · PF-02 — every build-dependent guard is named in the ship gate

**Statement.** No test file may gate its assertions on `OUT_EXISTS` (or any build-artifact precondition) without being named in the command that builds before testing.

**Why violating it is a defect.** `"test:static": "npm run build && vitest run <file> <file>"` is a **path filter, not a suite**. A third build-dependent file added tomorrow and not added to that string runs in *no* gate: `npm test` skips it (no `out/`), `test:static` never selects it. That is a test that cannot fail, created by omission — the Prime Law violated silently, by a future contributor, with no signal. Checked this window: **today no file is orphaned** (only `static-integrity.test.ts` and `section-nav-anchors.test.ts` gate on `OUT_EXISTS`, and both are named). The guard is prophylactic — which is the right time to build it.

**Exact mutation that must make it red.** Create `lib/__tests__/scratch-artifact.test.ts` containing `const OUT_EXISTS = existsSync(resolve(process.cwd(),'out')); describe.runIf(OUT_EXISTS)('x', () => { it('y', () => {}); });` **without** adding it to `test:static`. The guard must fail naming `lib/__tests__/scratch-artifact.test.ts` as an orphan. Delete the scratch file.

**House idiom to imitate.** `lib/__tests__/glassPress.test.ts` — it already walks `components/`, `lib/` and `app/` with `readdirSync` and asserts a property over every file it finds, collecting offenders into an array and asserting `expect(offenders, <message listing them>).toEqual([])`. Copy that offender-collection grammar exactly; it produces failures a human can act on without opening the test.

**Note.** If §7's `npm run check` (build → **full** `vitest run`, no path filter) is adopted, PF-02's failure mode largely evaporates — but the guard is still worth having, because `test:static` will remain in `package.json` and someone will keep using it.

---

### P1-3 · PF-03 — artifact guards fail loudly on a missing **or stale** `out/`

**Statement.** The build-artifact guards must **fail**, not skip and not pass, when `out/` is absent, and must fail when `out/` is older than the newest tracked source file under `app/`, `components/`, `content/`, `lib/`, `public/`.

**Why violating it is a defect.** This is the Prime Law applied to the guards themselves, and the *stale* half is the one nobody has been enforcing. **Measured this window: `out/` is 8 minutes and 3 commits older than HEAD, and two of those commits touch link and layout surfaces.** The 43 build-dependent tests that "passed" for me validated an export built before the code they claim to check. A missing `out/` at least warns; a stale `out/` **manufactures a false green** for the highest-value guards in the repo, locally, for every developer, silently. V-6.

**Exact mutation that must make it red.** With the guard in place: `touch app/page.tsx` (source now newer than `out/`) and run `npx vitest run lib/__tests__/static-integrity.test.ts`. It must fail with *"`out/` is stale — rebuild"*. Second mutation for the missing half: `mv out out.bak && npx vitest run lib/__tests__/static-integrity.test.ts` must now report **RED**, where today it reports green-all-skipped. Restore both.

**House idiom to imitate.** `lib/__tests__/ink-contrast.test.ts` — specifically its structure of *a real assertion plus a companion non-vacuity assertion* (`it('rejects the pre-fix ink values (non-vacuity)')` at `:99`). PF-03 should ship the same way: the freshness assertion **plus** a test proving the freshness check itself rejects a deliberately-backdated mtime.

**Ship it together with the V-5 fix.** The three `if (!existsSync(...)) return;` escape hatches at `static-integrity.test.ts:332/341/403` are the same disease at assertion scope. Convert each to `expect(existsSync(x), '<what moved>').toBe(true)` in the same commit.

---

### P1-4 · PF-04 — no guard that cannot fail

**Statement.** No `it.only` / `describe.only` / `test.only` anywhere under `app/`, `components/`, `lib/`. Every `it.todo` and `it.skip` must appear in a checked-in allowlist carrying a reason and a date, so adding one is a deliberate, reviewable act.

**Why violating it is a defect.** A stray `.only` silently reduces a 510-test suite to one test while every gate reports green — a catastrophic, one-character, entirely invisible failure. And the `.todo` half has already bitten: `asset-integrity.test.ts:29` has advertised a badge guard it does not provide **since 2026-05-25** (V-3), and the file's docblock states the false guarantee in prose. Bitten 3 as a class; this guard catches 1 of the 3, and the ledger says so rather than overclaiming.

**Exact mutation that must make it red.** Add `it.only('scratch', () => {})` to `components/__tests__/SkipLink.test.tsx` and run the suite. The guard must fail naming file and line. Second: add `it.todo('unjustified')` to any file without an allowlist entry — must fail. Revert both.

**House idiom to imitate.** `lib/__tests__/glassPress.test.ts` again — it already proves "no `touchstart` anywhere in runtime source" by walking directories and collecting offenders. PF-04 is the same walk with a different regex, over `**/__tests__/**` instead of runtime source.

**Allowlist seed (two entries, both real):**
| construct | file:line | reason | date |
|---|---|---|---|
| `it.skip` | `lib/__tests__/static-integrity.test.ts:51` | deliberate labelled "needs ./out/" notice — **retire it when PF-03 lands**, since a failing guard replaces a skip notice | 2026-05-25 |
| `it.todo` | `lib/__tests__/asset-integrity.test.ts:29` | **should be deleted, not allowlisted** — all 9 badges exist (verified 9/9 this window); convert to a live `it()` | 2026-05-25 |

---

### P1-5 · PF-05 — every image path in `content/blog.json` resolves in `public/`

**Statement.** Every `figure.src` / `figure.avif` / `figure.webp` in `content/blog.json` resolves to a real file under `public/`. Violation fails `prebuild`, i.e. blocks the deploy.

**Why violating it is a defect — and it is violated right now.** **Verified first-hand at `06aa565`:** `content/blog.json:16-18` points at `/images/deliverables/accessmap/card-flag.{jpg,avif,webp}`; `public/images/deliverables/accessmap/` contains **only `hero.svg`**. `<picture>` does **not** fall back on a 404 — Chromium selects the AVIF `<source>` and paints nothing. The flagship blog post's hero is broken on the live site, and it is the last remaining console error in the estate (`ui-polish/…/HANDOFF.md` §Carried out of P3: *"the only 2 console errors in the sweep, before and after"*). `scripts/validate-assets.mjs` reads `certificates.json`, `deliverables.json` and `components/cinematic/plates.ts` — **never `blog.json`** (verified by reading the script). The suite passes 510/512 with the dangling reference.

**Blast radius.** `/blog/building-accessmap/` — the site's only post, linked from `/blog/`, the rail, and every related-work card. One route today; unbounded as the notes index grows.

**Exact mutation that must make it red.** It is red today: implement the walker and run `npm run validate:assets` — it must abort naming all three paths. To prove non-vacuity *after* the asset is restored, set `figure.src` to `/images/deliverables/accessmap/does-not-exist.jpg` and confirm `prebuild` aborts before `next build` compiles.

**House idiom to imitate.** `scripts/validate-assets.mjs`'s own `checkDeliverableProof` walker (line ~138) — it already resolves declared `{avif,webp,video,poster,captions}` siblings from `deliverables.json` against `public/` and reports missing files with a regeneration hint. Copy that function shape for `blog.json`. Pair it with a no-build unit test beside `lib/__tests__/asset-integrity.test.ts` so `npm test` catches it too, since `prebuild` only fires on `npm run build`.

**Scope note.** PF-05 is a strict subset of PF-06, but it is worth building separately: it needs no build, it runs in the fast loop, and it blocks the deploy at `prebuild` — which is the only guard family in this repo that fires on the production path regardless of V-1 and V-2.

---

### P1-6 · PF-06 — every local image URL in built HTML resolves in `out/`

**Statement.** For every `out/**/*.html`, every `<img src>` and `<source srcset>` pointing at a local path (not `http(s):` / `data:` / `blob:`) resolves to an existing file inside `out/`.

**Why violating it is a defect.** It is the general form of P1-5, and it is the guard the repo *says* it has. `lib/__tests__/static-integrity.test.ts:17-22` documents "Gap 4 — Referenced image asset existence" in prose; **no such describe exists in the file** (V-4). Any content source that emits an `<img>` — blog figures, showcase wiring, markdown prose, OG plates — can dangle with no gate noticing, on a site whose entire thesis is that its claims verify. Bitten twice: the Gap-4-as-`it.todo` miss and the live `card-flag` 404.

**Blast radius.** Every route that paints an image — all 17 built surfaces.

**Exact mutation that must make it red.** Today it goes red immediately on the blog figure. After that is fixed: point one `deliverables.json` `heroImage.src` at a missing file, rebuild, and confirm the guard names the route and the path. Delete the mutation.

**House idiom to imitate.** `lib/__tests__/static-integrity.test.ts` Gap 2 itself (`:178`) — it already has `collectHtmlFiles`, the path resolver, and (critically) the **sanity-check companion** at `:214` *"finds at least one internal link across all pages"*, which prevents a false green if the regex ever matches nothing. **PF-06 must ship the same companion assertion** (`expect(totalImagesSeen).toBeGreaterThan(0)`) or it is one bad regex away from being vacuous. Add the new describe to the same file and it inherits PF-01/PF-02/PF-03's plumbing for free.

---

### P1-7 · PF-15 — one `<h1>`, `lang`, one `<main>`, top-level `contentinfo`, unique `<title>`, no heading skip, skip link first

**Statement.** For every built route: exactly one `<h1>`; `lang="en"` on `<html>`; exactly one `<main>`; the `contentinfo` element is not a descendant of `<main>`; the `<title>` is unique across routes; no heading level is skipped; the skip link is the first focusable element.

**Why violating it is a defect.** Two `<h1>`s or a missing `lang` is a screen-reader defect no visual review catches and no current test would notice — **verified: the only `h1` assertions in the repo are `Hero.test.tsx:29` and `HeroSettle.test.tsx`, both component-scoped.** The whole of a11y Lens 2 ("PASS all 17 routes") was established by a one-off sweep and left ungated. The contentinfo half has already bitten once: `uplift/2026-07-13_R2-P3…md` records `landmark-contentinfo-is-top-level` firing on **all 32 axe scans** when a well-intentioned `role="contentinfo"` was added while `<footer>` sat inside `<main>` — and the gate that caught it (axe) **is not run today** (PF-52 is naked; `axe-core` is not even a dependency). The site also publishes claim C5 ("honest landmarks… heading hierarchy a screen reader can move through") on `/accessibility/`, so a break is a false claim as well as a defect.

**Blast radius.** All 17 built surfaces, every AT user, plus a published claim.

**Exact mutation that must make it red.** Add a second `<h1>` to `app/about/page.tsx`, rebuild, run the guard — it must fail naming `/about/` and reporting 2. Second mutation for the landmark half: move `<Footer />` back inside `<main>` in `app/layout.tsx` — must fail naming every route. Third for the lang half: strip `lang` from the root `<html>`. Revert each.

**House idiom to imitate.** `lib/__tests__/section-nav-anchors.test.ts:205-341` — it already iterates routes with a nested `describe(route)` per built page and names each assertion family `T0`…`T7`, so a failure reads *"`/about/` T1 — every mapped anchor exists on the page"*. That per-route-describe grammar is exactly right here (`S0` = one h1, `S1` = lang, `S2` = one main, `S3` = contentinfo top-level, `S4` = unique title, `S5` = no heading skip, `S6` = skip link first). It also demonstrates scoping every query **inside `<main>`** so persistent chrome cannot satisfy an assertion about page content — reuse that discipline.

**Cheap companion worth having anyway.** A jsdom render test asserting `contentinfo` is not `.closest('main')` runs in the fast gate and does not wait on PF-01. Two lines.

---

### P1-8 · PF-33 — the top-open observer geometry that killed the dead-CTA CRITICAL

**Statement.** `components/RailInert.tsx` and `components/RunwayIdentityRelease.tsx` each construct their `IntersectionObserver` with `{ threshold: 0, rootMargin: '100000px 0px 0px 0px' }`. A bare `threshold: 0` is a defect.

**Why violating it is a defect.** This is a sentinel-conflation bug: one boolean (`!isIntersecting`) was made to mean "the intro is still running", but it is equally true *above* and *below* the observed wrapper. When it fires at the resting bottom, the theme toggle, the rail nav and the **"Write to me." CTA** all become `inert` — dead to pointer **and** keyboard, at the moment of highest conversion intent, while the brand mark visibly doubles into a glitch. The R2 report ranks it one of three CRITICALs; it shipped to production before it was found.

**Why it is P1 despite being bitten only once.** Highest blast-radius-per-line in the bank: the rail is in the root layout, so this is *every route at every resting scroll bottom*, and an `inert` region is unreachable for keyboard and AT users with no visual explanation. The guard is ~6 lines, the mechanism is stable (constructor-argument capture, no layout engine needed), **and the idiom already exists in this repo** — so the cost is near zero and the current exposure is total.

**Exact mutation that must make it red.** Delete `rootMargin: '100000px 0px 0px 0px'` from `components/RailInert.tsx:53`, leaving `{ threshold: 0 }`. Today the full 510-test suite stays green — **verified this window: neither `RailInert.test.tsx` nor `RunwayIdentityRelease.test.tsx` contains the string `rootMargin`.** With the guard it must go red. Repeat for `components/RunwayIdentityRelease.tsx:47`.

**House idiom to imitate — copy it literally.** `components/__tests__/IntroScrollCue.test.tsx:137/148/167`:
```ts
expect(ioOptions?.rootMargin).toBe('100000px 0px 0px 0px');
expect(ioOptions?.rootMargin).toBe('100000px 0px 100% 0px');   // motion branch
```
The file already stubs the `IntersectionObserver` constructor and captures its second argument. Lift that harness verbatim into the other two component tests. **While you are there, close PF-31's other half**: `IntroScrollCue.test.tsx:148` proves the RM-vs-motion rootMargin branch; `RunwayIdentityRelease.test.tsx` guards the `intersectionRatio > 0` gate (`:85`) but not the margin branch. Same harness, one more assertion.

---

### P1-9 · PF-34 — only named, dated, Sky-owned placeholders may reach the built export

**Statement.** The built export contains no placeholder token (`TKTK`, `NEEDS-SKY`, `TODO(Sky)`, `Lorem ipsum`, `PLACEHOLDER`, `— not final`) in `out/**/*.{html,txt,json,xml}` unless that exact token is on a checked-in, dated allowlist. A **new** token fails. A **listed** token that has vanished also fails — so the allowlist cannot rot into a permanent excuse.

**Why violating it is a defect.** Three unfinished strings shipped to production on 2026-07-14 and were found only by a later audit: `TKTK_ACCESSMAP_TEST_COUNT` on the flagship case study; a `[NEEDS-SKY placeholder — the reduced-motion-only line goes here.]` rendered **to every reduced-motion visitor on the radical-honesty page**; and `# ---- NEEDS-SKY COPY (placeholder — not final) ----` as the first line of `/humans.txt`, in front of exactly the view-source audience it was written for. Push to `main` is live in ~90 seconds with no staging and no rollback notice. **Verified still live at `06aa565`:** `app/work/[slug]/page.tsx:61` and `public/humans.txt:1`. T18 has been shipping since **June** and survived four audits because no gate looks.

**The invariant is not "no placeholders" — it is "only these placeholders."** T7 and T18 are Sky's, known, and deliberately live. The guard's job is to nag on anything *new*, and to make each carried placeholder a dated, dispositioned entry rather than an accident.

**Exact mutation that must make it red.** Add `TODO(Sky)` to any rendered string in `app/about/page.tsx`, rebuild, run the guard — it must fail naming the file and the token. **Today the full suite stays green** (V-7). Second mutation, proving the anti-rot half: delete the TKTK line from `app/work/[slug]/page.tsx` without updating the allowlist — the guard must also fail, saying the allowlist is stale.

**House idiom to imitate.** `components/__tests__/A11yReceipts.test.tsx:34` — the cross-artifact parity check that reads `content/a11y-receipts.json` **and** the shipped `public/` evidence file and asserts they agree, with a per-item message (``evidence summary missing "${r.label}"``). PF-34 is the same shape: built artifact on one side, checked-in allowlist on the other, neither satisfiable by editing one side alone.

**Allowlist seed** (`design-reviews/guards/PLACEHOLDER_ALLOWLIST.md` — token · file · date · Sky's disposition):
| token | file | live since | disposition |
|---|---|---|---|
| `TKTK_ACCESSMAP_TEST_COUNT` | `app/work/[slug]/page.tsx:61` | ≤ 2026-07-14 | Sky — fill with the true count (truth-audit says 2,891 executed) or remove the strip. §9 Q3. |
| `NEEDS-SKY COPY (placeholder — not final)` | `public/humans.txt:1` | June 2026 | Sky — T18, the queue's oldest resident. §9 Q3. |

---

### P1-10 · PF-22 + PF-23 — the contrast class: pin the surfaces, and give `--rgb-accent` its rows

**Statement, two halves sharing one instrument.**
(a) **PF-22 surface-drift pin** — the composited backgrounds that `ink-contrast.test.ts` measures against are pixel readings frozen on 2026-07-31. The guard must additionally pin the `world-surface-*` declarations those readings were taken against, so changing a surface alpha forces a re-measure instead of silently invalidating the maths.
(b) **PF-23 accent rows** — `--rgb-accent` (`185 99 64`, `globals.css:75`) must clear 4.5:1 wherever it is a fill behind small text, and the focus ring built from it must clear 3.0:1 in both themes.

**Why violating it is a defect.** `/accessibility/` publishes claim C4 — *"Every text role meets WCAG AA contrast… light and dark alike."* That sentence was **FALSE on production** for the whole window between the R4 gold pass and Sky's push: Phase A believed there was 1 defect; re-measuring at the same commit found **60 elements below floor**. Bitten twice, same root cause both times: *contrast on this site cannot be read off a token pair*, because `world-surface-*` panels are translucent over a moving gradient, and axe's `color-contrast` rule is blind to that composite. The existing guard fixed the token half brilliantly and left the **surface** half hardcoded — so it is precise about the ink and blind about what the ink sits on. Meanwhile `--rgb-accent` has no row at all: the cream-on-terracotta pair computes **4.015:1** (below the 4.5 floor) and the light focus ring sits at **3.68–4.02** against a 3.0 floor — under 1.4× headroom on a moving backdrop, with an in-repo history of a comment claiming 4.33 where the tokens computed 4.02.

**Honest scope note.** mine-1 could not find a live cream-on-terracotta control at HEAD — every `bg-terracotta` usage it found is an `aria-hidden` decorative dot, and `Button.tsx` uses `bg-cream`/`bg-transparent`. So PF-23's fill half guards a **token-level trap**, not a live defect. That is still worth guarding (the value is unchanged and nothing stops the next component pairing it with cream text) — but the ledger says so plainly rather than implying a live break.

**Exact mutations that must make it red.**
- (a) Change any `world-surface-cool-pale` alpha in `app/globals.css` — the surface-drift pin must fail with *"binding background changed; re-measure before editing the pin"*. Today nothing fails.
- (b) Change `components/Button.tsx`'s `primary` variant from `bg-cream` to `bg-terracotta text-cream` — the fill row must fail reporting 4.015:1. And lighten `--rgb-accent` toward canvas in `:root` — the 3.0 focus-ring row must fail.
- The existing non-vacuity proof still holds and must keep passing: reverting `--rgb-accent-ink` to `163 86 54` fails 4 assertions reporting **3.489:1**.

**House idiom to imitate — extend, do not rebuild.** `lib/__tests__/ink-contrast.test.ts` is the best guard in this repo: it parses `--rgb-*` triplets out of the real `globals.css`, computes WCAG luminance against pixel-measured binding backgrounds via `it.each(BINDING_BACKGROUNDS)` with a self-describing title (`'--$token ($scope) ≥ 4.5:1 against $where'`), pins the audited values in a second test, **and ships its own anti-vacuity test at `:99`.** PF-23 is two more rows in `BINDING_BACKGROUNDS` plus a `floor` field so the focus-ring rows use 3.0 instead of 4.5. PF-22 is one more `it()` in the same file asserting the surface declarations. **Every new row must arrive with its own non-vacuity companion**, matching `:99`.

---

## 4. P2 AND P3

### P2 — real invariants, real blast radius, build them second

| ID | invariant | why P2, not P1 | mechanism | make it RED | eff |
|---|---|---|---|---|---|
| PF-07 | Zod declares every consumed media sibling | silent perf loss (151 KB PNG instead of 34 KB AVIF, −77% evaporates), not a correctness break; bitten once, pre-ship | unit test: `JSON.parse` the raw file, run it through the schema, assert every `avif`/`webp`/`lqip`/`video`/`focal` key present in raw survives into parsed | delete `avif: z.string().optional()` from `ImageSchema` in `lib/schema.ts` | S |
| PF-20 | `role="list"` + its eslint-disable survive in `CalibrationRecord` | one call site, one user class (Safari VoiceOver) — but the house lint rule `jsx-a11y/no-redundant-roles` actively *pushes* an editor to delete it, which is why it needs a rail | source-grep on `components/CalibrationRecord.tsx` for `role="list"` **and** the disable comment | delete `role="list"` from `CalibrationRecord.tsx:44` | S |
| PF-27 | the RM `.reveal` reset outranks `html.js .reveal` | source is correct today (`globals.css:942-951` has `!important` + `html.js` scoping); the risk is a future specificity accident | built-CSS assertion: the RM reset carries `!important` **and** a selector of specificity ≥ `html.js .reveal` | drop `!important` from the RM reset, or narrow it to a bare `.reveal` | S |
| PF-28 | the site-wide `0.01ms !important` RM backstop exists | 13 component tests already cover the *behaviours*; only the backstop rule itself is unasserted | source-grep on built CSS for the `animation-duration:.01ms!important` block; assert the `prefers-reduced-motion` block count never *decreases* without a same-commit note | delete the `0.01ms !important` block from `globals.css:1977-1984` | S |
| PF-31 | RM-margin branch on `RunwayIdentityRelease` | the ratio gate (the half that bit) is already guarded at `:85`; this is the near-miss half | extend the existing test with the `IntroScrollCue.test.tsx:148` harness | expand the bottom rootMargin without an RM gate | S |
| PF-32 | the RM bracket line shows only under reduced motion | bitten 0, but ungated it becomes a self-referential lie on the honesty flagship | render test: assert the element carries the `motion-reduce:` display gate; absent under `no-preference` | drop `motion-reduce:` from the wrapper class at `app/accessibility/page.tsx:113` | S |
| PF-35 | published numbers bind to an artifact or carry a date | bitten 4 → class, **but the general mechanism is fragile** (see §4 fragility) — the specific per-surface pins are the safe slice | unit test per bound surface (`rounds.json`, receipts JSON), following `lib/__tests__/rounds.test.ts` | change a value in `content/rounds.json` without updating the card — `rounds.test.ts` fails today | M |
| PF-36 | the receipts self-fence sentence stays byte-intact | one assertion in an existing file; bitten 0 but flagged NAMED AT-RISK by the ledger that owns it | add to `A11yReceipts.test.tsx`: the suite receipt's `detail` contains `not the AccessMap project’s 1,680` (curly U+2019 as shipped) | reword `public/receipts/a11y-2026-07-09.json:19` to "measured on this repo" | S |
| PF-37 | the AA claim may only ship while its guard covers both themes | deliberately meta; cheap, but Sky should choose whether this shape belongs in the suite (§9 Q9) | unit test: if `lib/content.ts` contains the AA sentence, `BINDING_BACKGROUNDS` must carry ≥1 `scope:'root'` and ≥1 `scope:'dark'` row | delete the single `scope:'dark'` row while the sentence still says "light and dark alike" | S |
| PF-38 | A3 / X1 / X5 honesty sentences | bitten 0, but these are the exact sentences a "polish" pass reaches for, and they are what make every other claim credible | source-grep: pin each substring to its file | change "I am not a trained software engineer." → "I am a self-taught software engineer." at `app/about/page.tsx:248` | S |
| PF-39 | the C3 positioning line is byte-locked | bitten 0, one line — but the harm on violation is real-world (Sky is job-hunting while employed; an agent sharpening it into "Available for hire" is a career risk, not a style regression) | source-grep on `app/page.tsx` for the exact substring | change "thoughtful" → "interesting" at `app/page.tsx:157` | S |
| PF-40 | a receipt link's **href** resolves | the href half rides Gap 2 (already built, CI-inert); the semantic half is MANUAL (§5) | Gap 2 + a MANUAL row | point a receipt link at `/receipts/does-not-exist.json` — Gap 2 fails | — |
| PF-42 | the privacy postmark stays grep-true | bitten 0; the premise is clean today (**verified this window: 10 runtime deps — `@gsap/react, clsx, framer-motion, gsap, next, next-themes, react, react-dom, tailwind-merge, zod` — none analytics**) | build-time check paired to the string: if the footer text ships, assert no analytics package in `dependencies`, no `document.cookie` outside theme persistence, no `Set-Cookie` in `out/` | add `"plausible-tracker": "^0.3.9"` to `package.json` dependencies | S |
| PF-44 | "See it in motion." gates on real media | bitten 1 as a shipped CRITICAL, and the correct gate survives at `app/work/[slug]/page.tsx:590` — but nothing pins it | render test: a deliverable whose `shots` are all src-less yields **0** headings; add one `src` → 1 | revert the gate to `d.shots && d.shots.length > 0` | S |
| PF-46 | never faux-bold | bitten 1 (5 synthetic-bold spans on the colophon); source is correct now (`globals.css:403` + `MarkdownProse.tsx:30` `font-light`) | source-grep: no `font-semibold`/`font-bold`/`font-medium` under `app/`+`components/` outside an allowlist; `font-synthesis-weight: none` present | change `font-light` → `font-semibold` at `components/MarkdownProse.tsx:30` | S |
| PF-48 | no `ReactDOM.preload()` in route leaves | bitten 1 and *invisible to every static check* — the leak only appears at runtime via the prefetched RSC flight stream | source-grep (`react-dom`'s `preload` never imported/called under `app/`) + built-HTML check: `out/index.html` has ≤1 `rel=preload` `fetchpriority=high` image link | replace the hoisted `<link rel="preload">` in `app/work/[slug]/page.tsx` with a `ReactDOM.preload(...)` call | S |
| PF-49 | no `/500` in either form; **both** 404 forms kept | bitten 1 (a check written against the wrong path silently passed — `trailingSlash:true` emits `out/500/index.html`, not `out/500.html`); `prune-500.mjs` only *warns* | build-time assertion in the artifact suite: `out/500.html`, `out/500/index.html` and the 500 chunk absent; `out/404.html` **and** `out/404/index.html` present | remove the `prune-500.mjs` chaining from `postbuild` and rebuild | S |
| PF-53 | the cinematic is byte-frozen | 7+ manual proofs paid by hand across every phase; 1 governance breach caught pre-merge. **P2 not P1 only because the baseline SHA needs Sky** (§9 Q6) — the R3 lock predates the D1/D2/D3/D5 ratifications she shipped 2026-07-19 | build-time hash manifest over `components/cinematic/**`, `app/tokens-phase2.css`, `public/images/cinematic/**` + the named `.cdesert-*`/`.cinematic-*`/`.world-*`/`--ease-cinematic` ranges in `globals.css` | change one byte in `components/cinematic/CinematicDesert.tsx` | M |
| PF-54 | frozen state docs are never staged | **verified: no git hooks exist at all** — `.git/hooks` has only samples, no `.husky/`. All three files are ` M` right now | pre-commit check: `PROJECT_STATE.md`, `DECISIONS_LOG.md`, `.claude/launch.json` absent from `git diff --cached --name-only` | `git add PROJECT_STATE.md` — the hook must refuse | S |

### P3 — build later, or never; each says which

| ID | invariant | verdict | mechanism / provisioning cost | make it RED |
|---|---|---|---|---|
| PF-29 | RM must not leave visibility resting on `animation-delay` | **Build only with a planted-violation fixture.** Pairing "declares a delay" to "has a matching RM override" by static CSS analysis is a real matcher-design problem and will produce false reds on every decorative delayed animation. If it flaps, it trains people to ignore the RM guards — the exact failure the Second Law warns against | source-grep over `globals.css`, **shipped with a fixture proving the matcher finds a planted violation** | delete the `@media (prefers-reduced-motion: reduce)` override on `.intro-scroll-cue` |
| PF-30 | descendant transforms carry their own `motion-safe:` | Build; low cost, moderate fragility (needs an allowlist that will accrete) | grep `app/**`+`components/**` for `group-hover:scale|translate|rotate` and the `group-focus-within:` twins, each requiring a `motion-safe:` prefix | strip `motion-safe:` from `components/CertCard.tsx:63` |
| PF-47 | one typographic normalizer for all visitor copy | **Lowest severity in the bank, and the defect is already gone.** Verified at `06aa565`: `smartPunctuation` wraps the caption paths at `app/work/[slug]/page.tsx:335/619/669` — this **corrects mine-1**, which reported the caption path bypassing it. Guard it only if a cheap unit test is free | unit test: a caption fixture containing `it's` renders U+2019 | remove the `smartPunctuation(...)` wrapper at `:619` |
| PF-50 | zero console errors, every route, every visit | **Blocked on provisioning, not on will.** See the rig note below | CI step; needs the rig committed + a declared browser dep | re-add `"frame-ancestors 'none'"` to `PROD_CSP` in `app/layout.tsx` — the sweep must report 1 error per frame |
| PF-51 | CLS ≤ 0.004 · 0 horizontal overflow at 320/375 | Blocked on the same rig. Two lessons must ride with it or the numbers lie: inject `* { content-visibility: visible !important }` at DOMContentLoaded (else `content-visibility:auto` blanks off-viewport regions in fullPage stitches), and run under `reducedMotion:'reduce'` for 0.000px determinism. Also: the known `/work/@768` Framer flake needs a documented re-run-once policy, or the gate gets ignored | CI step, same rig | add a fixed-height image without dimensions above the fold |
| PF-52 | 0 axe violations, all routes × both themes | Blocked on the rig **plus a dependency that does not exist**: `grep -c axe package.json` → **0**. Two recorded honesty constraints: the meta-CSP blocks CDN scripts so axe must be injected as inline source from `node_modules/axe-core/axe.min.js`, and the export must be served by a keep-alive Node server (`python3 -m http.server` drops connections under Playwright churn and manufactures phantom violations) | CI step; needs `axe-core` + the rig | remove the theme toggle's `aria-label`, or duplicate an `id` on one route |
| PF-55 | showcase captures are deterministic | **On-demand only — never per-PR, and the ledger should say so rather than pretend.** `scripts/capture-showcase.mjs --verify` exists and is tracked, but it drives real browsers against six sibling repos through git worktrees | fire before any factory refresh; not a CI step | re-encode one AVIF in `public/showcase/` at a different quality and re-run `--verify` |

**The rig provisioning fact, measured this window.** PF-50/51/52/55 all depend on a headless browser. Current state: `playwright-core@1.61.1` is present in `node_modules` but **`npm ls` reports it `extraneous`** — it is not in `package.json` — and `chromium.executablePath()` resolves to a path that **does not exist on this machine**. So the browser floors are unrunnable *both* from a clean checkout *and* right now. They are **automatable in principle** — this is provisioning, not a device limit — and the honest cost is: declare `playwright-core` + `axe-core` in `devDependencies`, run `npx playwright install chromium`, and commit the capture rig (00_master's parking lot proposes `design-reviews/ui-polish/tools/`; a working base pattern already exists in `design-reviews/showcase-refresh/tools/gate-shots.mjs` + `tools/static-serve.mjs`). Until that happens they sit in §5 as manual items with this reason attached. **Do not write these as CI steps that silently no-op — that is fake automation and it is exactly what the Prime Law forbids.**

### Fragility flags — guards that would generate false reds

| guard | fragility | mitigation |
|---|---|---|
| PF-29 (RM `animation-delay` pairing) | **HIGH.** Static CSS analysis pairing a delay to an RM override; every decorative delayed animation is a candidate false positive | ship with a planted-violation fixture; scope to selectors whose keyframes start at `opacity:0`; allowlist by rule |
| PF-35 general form ("a numeric literal in copy needs a visible date") | **HIGH.** Would fire on "6 projects", "44px", years, reading times | build only the per-surface artifact bindings; leave the general rule as a review step |
| PF-51 CLS gate | **MEDIUM.** The `/work/@768` Framer layout race is a recorded standing harness flake | documented re-run-once policy in the rig README, or exclude that one frame explicitly and say why |
| PF-25 token parity (existing) | **MEDIUM-HIGH, already live.** It pins 9 exact `clamp()` strings and 3 letter-spacing tokens, and **the in-flight `ui-polish` train is a type/spacing program.** It is a change-detector by design, but it is the kind that gets bulk-updated without being read | leave as is, but Phase B should not add more exact-string pins to the same file this quarter |
| PF-23 / PF-22 pinned backgrounds | **MEDIUM by design.** Every legitimate surface retune fires them — which is the point (PF-22 *is* the pin) | pair every pin with a comment naming the re-measure procedure |
| PF-39 / PF-38 byte pins | **LOW mechanically, MEDIUM socially.** They stop Sky as well as agents (§9 Q4) | Sky picks substring vs exact bytes |

---

## 5. MANUAL-ONLY

Automation here would be a lie. Each row says exactly why.

| item | origin | why it cannot be automated **here** |
|---|---|---|
| **Safari / WebKit rendering** — `-webkit-initial-letter`, real focus-ring painting, older-iOS overlay behaviour | `r3-audit/build-plan/DEVICE-GATE-CHECKLIST.md`; `ui-polish/…/REPORT.md` §5 device boundary | Every probe in this estate is Chromium. The ledgers say so on every page ("Engine honesty: Chromium, never WebKit"). No agent shell on this machine can drive real Safari. The overlay-scroll fix explicitly **rejected** a `justify-content: safe center` alternative because it "would pass in Chromium but silently clip on device" — a Chromium gate would have shipped the wrong fix |
| **VoiceOver / TalkBack rotor behaviour**, real screen-reader announcement order | `a11y-qa/2026-07-31` Lens 2 + `DEVICE-GATE-CHECKLIST.md` | Requires a real AT stack driven by a human ear. axe checks the machine-checkable subset; the site's own X5 honesty lock already says a full manual SR pass has not been done |
| **Real-thumb tap feel / release physics; the 44px geometry as *felt*** | `a11y F7-3`; `ui-polish HANDOFF` §P2 | jsdom has no layout engine and vitest runs with `css: false`, so `TapTargets.test.tsx` asserts the **class recipe**, not measured pixels. If the base row height moves off 23.391px, 21 + 23.391 no longer equals 44.391 and the guard still passes. The real measurement needs a browser (see the rig note) **and** the felt judgement needs a thumb |
| **PF-40 semantic half — does the destination contain what the sentence promises?** | `corp-page-audit/2026-07-16` CP-1, re-confirmed `truth-audit/03_factual-truth.md` W7 | No machine can decide whether a repo "holds the Constitution." Verified still live in source: `content/deliverables.json:206` and `content/case-studies.md:34`. The href half is Gap 2; the meaning half belongs on the truth-audit re-run checklist. **Bitten twice — and the corollary is ruled: never add a receipt link to a destination that does not hold the promise (REC-3, "a receipt to nothing is worse than none")** |
| **PF-41 — no agent-authored voice** | `r4-gallery/build-plan/DECISIONS.md` §S | No test distinguishes Sky's sentence from a good imitation. What *is* mechanizable is the negative space — PF-34's allowlist, PF-38's honesty locks, PF-39's byte lock — which fences the highest-risk surfaces. The rule itself stays a review gate |
| **Alt-text *quality*** (as distinct from shape) | `a11y-qa/…/00_DISCOVERY.md` §Gates that exist | Shape is schema-enforced and well guarded (PF-09). Quality was judged by hand across 55 images ("genuinely excellent, 0 slop"). Machine-checking descriptiveness is not honest work |
| **OG unfurl on real scrapers** (LinkedIn, Slack, iMessage) | `r3-audit/…/DEVICE-GATE-CHECKLIST.md` | Requires network posts to third-party services. Gap 6/7 prove the *markup* is right; only a real scraper proves the *card* is right |
| **The live-site verdicts** (is TA-1 healed on production?) | `truth-audit/2026-07-31` measured against `38b94db`; `main` has since moved to `45f6632` | This run is local-only, no network. Every "live" claim in the corpus is as-of its own measurement date and must be re-fetched at fire time |
| **PF-50 / PF-51 / PF-52 / PF-55 — until the rig is provisioned** | §4 rig note | Automatable in principle, unrunnable today: `playwright-core` is extraneous, the chromium binary is absent, `axe-core` is not a dependency. They are manual **until** Sky approves committing the rig and declaring the deps (§9 Q2) — not manual forever |

---

## 6. LINT-OR-DOC — preferences, not invariants

Recorded so nobody re-proposes them as guards. One line each on why not.

| item | origin | why NOT a guard |
|---|---|---|
| `design-reviews/**` + `qa-reports/**` stay untracked | `ui-polish/…/REPORT.md` §0 | A convention across nine trains, not a correctness property; Phase B considered committing them and **flagged rather than did it silently** — that flag is the right mechanism |
| Legacy alias class names (`text-charcoal` ×40, `bg-cream` ×8, `wa-teal-*` ×10) | `ui-polish/…/REPORT.md` UP-06 | All aliases resolve to flipping tokens — **no parity bug**, verified in `tailwind.config.ts:66-84`. Two vocabularies for one system is naming preference, zero user impact |
| `NumberedStep` inline `letterSpacing` · `CredentialBadge` `text-sm` · `transition-all` | `ui-polish` UP-03/04/05 | System hygiene with byte-identical rendering (`-0.24px` → `-0.24px`). Nothing breaks for a user. A lint rule at most |
| `RunwayIdentity` hardcoded hex (`#B35F40`, `#C2A878`) | `ui-polish` UP-07 | Disposition is RECORD-AS-DELIBERATE — the mark rides the intro's fixed golden palette and should not theme-flip. Guarding freezes a decision Sky may re-rule |
| Footer GitHub lone-accent · scroll-cue glyph split · outro-nav arrangement · hero-vs-outro pill materials | `ui-polish` UP-11/39/28/40 | Taste. UP-40's own disposition is "documented-deliberate, Sky may re-rule" |
| Section-header signature (rule-everywhere vs prose-variant) | `ui-polish` UP-22 | An open SKY-PICK behind a mockup gate. Un-picked forks are never guard material |
| `CertCard` verify pills at 33.391px | `ui-polish/…/DECISIONS.md` §P `P2-CERTCARD` | The estate already ruled it: *"Deliberately NO guard: asserting the absence of padding would freeze a legitimate future fix."* Quoted because it is the Second Law done right |
| Footer/rail rows at 20–24px | `a11y` F7-3 | PARKED **with measurement** — 9–12px of room, max 42px before neighbours touch. Forcing 44 there creates *overlapping* tap targets, which is worse for touch. **A guard demanding 44 everywhere would be actively wrong** |
| The register fork (INFUSE vs SHIFT) · LinkedIn whisper line · cue arrow sage-vs-teal · "A Brief Account →" twice · C-86 colophon numerals | `r3-audit/03_r3-slate.md` §5; R2 §4b; `uplift` P4/P1; `uplift/assets/r2-p3/C-86-scaffold.md` | Open taste forks reserved to Sky. Encoding either branch freezes a preference as law |
| "Prove every new guard non-vacuous by breaking the fix" | `a11y-qa/…/PHASE_B_CLOSEOUT.md` §Gates | The Prime Law itself — but a *process*, not a runtime assertion. The mechanizable slice is PF-04 |
| "Line numbers go stale — re-read before editing" · "an in-file comment explaining deliberateness WINS over the finding" · "where an audit claim and source disagree, the source wins" | `ui-polish/…/REPORT.md` §1 | Audit hygiene for humans and agents. No code artifact to assert against |
| Never diagnose this project from the in-app preview pane | `a11y` L3-1 + `truth-audit` Lens 1 | A tooling truth (the pane paints false blanks on GSAP pin states), reproduced independently three times. Belongs in the rig README |
| Stale `loop.webm` reference in `ProductReveal.test.tsx:251` | `uplift/…R2-P6…md` §1 C-40 | A synthetic fixture, not real content; its absence on disk causes no failure and no user-facing defect. Cleanup, not a guard |
| `/work/@768` flaky CLS (Framer layout race) | `uplift/…R2-P5…md` §DECISIONS 4 | Harness noise, not a site defect. Guarding it produces a flapping red that trains people to ignore the CLS gate |
| The stale project `CLAUDE.md` (claims `basePath:'/portfolio'`, "no theme system") **and** the stale README test row (V-9) | `r3-audit/build-plan/DECISIONS.md` §STANDING #8; `README.md:47` | Documentation drift. Guarding a doc against the code invites churn; a one-line correction is the right fix. **But V-9's fix is load-bearing for §7** and should ship with it |
| PROTECT-54 "no lone-orphan `/work/` card" | `r2-audit/…Design_Review.md` PROTECT-54 | **FORMALLY RETIRED — Sky's ruling, 2026-08-23** (THE ROOM Phase 0, recorded in `art-direction/2026-08-23/13_DECISIONS.md` §Phase 0 and the session plan PART III §G2.5). `WorkFilterGrid.tsx`/`FilterPill` do not exist at HEAD (deleted by R4 BP9's gallery-wall rebuild); the invariant has had no referent since. §9 Q7 below answers itself: retired, not reworked — no replacement invariant was invented. |
| PROTECT-3 hero completeness *inside one 375 viewport* | `r3-audit/02_findings.md` A-01 | **Split it.** The *presence* half (avatar + name + role + headline + subhead + single pill) is a fine render test; the *"inside one 375 viewport"* half needs a real layout engine and a real thumb — that half is §5 |

---

## 7. STANDING-CHECK ENTRY POINT

The repo **has** a test runner (vitest 2.1.8 + jsdom, 54 files, 510 tests) — it has no single command that runs all of it honestly.

**Proposed command — one line, one name:**

```bash
npm run check
```

**Proposed `package.json` script:**

```json
"check": "npm run lint && npm run typecheck && npm run build && vitest run"
```

**Why this shape and not `test:static`.** The order matters and so does the absence of a path filter:

1. **`build` before `vitest run`** means `out/` is fresh, so `OUT_EXISTS` is true and no guard skips. This is what makes the 42 CI-inert tests actually execute (PF-01, PF-03).
2. **`vitest run` with no file list** — not `test:static`'s two-file filter — means a new build-dependent guard is picked up automatically. PF-02's orphan-guard failure mode cannot occur here at all.
3. `build` also runs `prebuild` (`validate-assets.mjs`) and `postbuild` (`prune-500.mjs`, `og-png-alias.mjs`), so the asset gate and the OG alias are exercised on the same command — which is where PF-05's blog-figure walker and PF-49's 500-prune assertion should live.
4. Cost: ~60s build + ~18s tests. Slower than `npm test`, which is why `npm test` should **stay** as the fast inner-loop command. `check` is the ship gate; `test` is the dev loop. Say so in both places.

**Where it must be documented — two places, both currently wrong or silent:**

- **`README.md` §Scripts (lines 38–49).** Fix V-9 in the same edit: the row `| npm run test | Vitest single run (17 tests across 4 files) |` is stale by 30× (real: 510 across 54), and `test:static` appears nowhere. Add `| npm run check | **The standing gate.** lint + typecheck + build + full vitest against a fresh out/. Run before every merge. |` and correct the `test` row to name it the fast inner loop that **skips the build-artifact guards**.
- **`CLAUDE.md` §Commands (lines 112–120).** It already documents `test:static` correctly and says "Always run `npm run typecheck` before declaring something done." Replace that with "Always run `npm run check` before declaring something done" so the single sentence agents read names the whole gate.

**And in CI.** `ci.yml`'s `test` job becomes `- run: npm run check` (dropping the separate lint/typecheck/build jobs, or keeping them for parallel speed and having `test` run `npm run build && npm run test`). Either is fine; what matters is that **the command a human runs locally and the command CI runs are the same string**, so a green tick means the same thing in both places.

---

## 8. CLAIMED-UNVERIFIED

Ledger or mine claims I could not confirm against the code, plus corrections where the source disagrees with a mine file.

1. **The 468 CI test count.** Derived (510 measured total − 42 measured gated), not observed. Direct observation requires moving `out/` aside, which Phase A forbids. Phase B's first act (M-08) settles it.
2. **CORRECTION — `smartPunctuation` in the caption path.** mine-1 states *"`grep smartPunctuation app/work/[slug]/page.tsx` returns nothing — the caption path still bypasses it."* **False at `06aa565`:** the import is at line 16 and it wraps captions at `:335`, `:619`, `:669`. Either the mine's grep hit a shell-glob problem on the bracketed path, or the 3 commits since `0dbf479` changed it. Either way PF-47 drops to P3 and its severity claim is withdrawn.
3. **CORRECTION — `ProductReveal` placeholder coverage.** mine-1 listed this as unverified. **Confirmed GUARDED:** `components/__tests__/ProductReveal.test.tsx:128-145` asserts `[data-pr-placeholder="designed"]` and the absence of the retired skeleton bars. PF-45 needs no work.
4. **CORRECTION — the blog count relationship.** mine-1 listed this as unverified. **Confirmed GUARDED:** the count is derived at `app/blog/page.tsx:73` (`{posts.length}` with correct singular/plural) and `BlogIndex.test.tsx:95` proves it with a two-post fixture against one real post. PF-43 needs no work.
5. **`basePath: '/portfolio'`.** Project `CLAUDE.md` §Gotchas 3, `components/SidebarFeatured.tsx:19` and `static-integrity.test.ts:114` all assert it. **`next.config.mjs` at `06aa565` contains no `basePath` key** (verified). Three prior audits already said so. Recorded, not laundered — V-8, and Sky's call at §9 Q8.
6. **"axe 0 / 32 scans", "worst CLS 0.00034", "0/2222 text elements below floor".** Ledger-attested; I re-ran **no** browser rig this window (it is unprovisioned — §4). The census instrument for the 0/2222 figure (`census2.mjs`) lived in a session scratchpad and is not in the repo, so that number is **currently unreproducible from a clean checkout**. Any guard citing these must re-measure at fire time.
7. **"The public AccessMap suite runs 2,891 passed."** Cross-repo and network-dependent. Recorded as the *expectation* for filling TKTK, never as a fact to paste — Phase C's NUMBERS LAW requires re-measuring at fire time anyway.
8. **Live-site state.** Every "live" verdict in the truth audit was measured against `38b94db`; `main` has since moved to `45f6632`. No network was used this run, so the four Blockers' *live* status may have shifted. TA-1 (the contrast claim) may already be healed on production.
9. **"The locked globals ranges" for PF-53.** `ui-polish/…/REPORT.md` §2.1 names `--ease-cinematic` and "the locked globals ranges" as PROTECT surfaces. I confirmed `.cdesert-*` and `.world-*` rules exist in `globals.css` but **did not determine the exact line ranges** that constitute the lock — that boundary lives in R3 DECISIONS #1 / MOTION_SYSTEM.md, outside this corpus. A hash manifest written without resolving it will over- or under-lock.
10. **The two mines' unopened corpus tails.** mine-1 opened 26 of 97 files; mine-2 opened 51 of 228. In particular `r2-audit/03_craft_census.md` (866 lines, 113 C-findings) and `r2-audit/05_r2-slate.md` (1,056 lines) were mined by targeted grep, not read end to end. **There may be additional mechanism-level bug classes in the LOW/POLISH tail that never reached this ledger.** I did not re-open them either; this ledger's completeness is bounded by the mines'.
11. **`scripts/capture-showcase.mjs --verify` actually passing.** The script is tracked and its `--verify` flag is real (`:14`, `:49`, `:411`), but I did not run it — the browser it needs is absent. PF-55's "68 checked, 0 fatal" is ledger-attested only.

---

## 9. BANKED QUESTIONS FOR SKY

1. **The CI shape (V-1 + V-2 together).** Two decisions, and they are separable. (a) Widen `ci.yml`'s push trigger to the real branch families (`polish/**`, `ui-polish/**`, `r4/**`, `a11y/**`, `truth/**`, `uplift/**`, `showcase/**`, `fix/**`, `feat/**`) — or simply `'**'`? (b) Since you ff-merge locally and push `main` directly, **no PR is ever opened**, so `ci.yml` never gates the production path at all. Should `deploy.yml` grow a gate (calling the CI jobs as a reusable workflow), or do you accept that `npm run check` run by you locally *is* the gate and we document it as such?
2. **Commit the capture rig + declare the browser deps?** Three floors (console-zero, CLS/overflow, axe-zero) plus the showcase determinism check are unrunnable from a clean checkout — `playwright-core` is extraneous, the chromium binary is missing, `axe-core` is not a dependency at all. Committing the rig and declaring the deps turns four MANUAL rows into real gates and makes the 0/2222 contrast census reproducible. It is also a dependency-surface decision on a static site with 10 runtime deps.
3. **The two live placeholders — allowlist or remove?** PF-34 needs a policy. (a) Allowlist with T7 (`TKTK_ACCESSMAP_TEST_COUNT`) and T18 (`humans.txt`) dated and dispositioned, so the guard only nags on anything *new*; or (b) hard-fail, which means filling or reverting both first. Related: should the guard hard-fail on a new `TODO(Sky)`, meaning a train cannot ship one even temporarily? Hard-fail is the honest default.
4. **Byte pins vs substring pins for the ratified words (PF-38, PF-39).** Exact bytes stop *you* as well as an agent — you could not reword your own positioning line without editing a test. A substring pin ("thoughtful product collaborations") lets you rephrase around it but permits an agent's paraphrase of the rest. Which failure mode do you want?
5. **`asset-integrity.test.ts`'s `it.todo` (V-3).** All 9 badge PNGs exist — I verified 9/9 this window — so converting it to a live `it()` would pass immediately. May Phase B do that? And the file's docblock currently makes a false claim ("will fail fast if any badge is missing"); fixing the comment is a doc edit that Phase A could not make.
6. **The cinematic hash manifest baseline (PF-53).** The R3 lock predates D1/D2/D3/D5, which you ratified and shipped 2026-07-19 in `polish/film-ratified-2026-07-19`. The manifest must baseline on the **post-ratification** tree or it will flag your own approved work as drift. Confirm the baseline SHA. Also: is the two-file-commit friction (code + digest) acceptable for a surface that is meant to be frozen anyway?
7. ~~**PROTECT-54 is superseded.** The `/work/` grid was rebuilt to full-width plates and `WorkFilterGrid` no longer exists. Does the no-orphan-card invariant still exist in some form under the new grammar, or is it formally retired? I will not invent a replacement.~~
   **ANSWERED — Sky's ruling, 2026-08-23 (THE ROOM Phase 0):** formally retired. No replacement invariant. See row 516 above and `art-direction/2026-08-23/13_DECISIONS.md`.
8. **`BASE_PATH = '/portfolio'` (V-8).** Delete the dead strip from `static-integrity.test.ts:114`, or keep it as future-proofing if the site ever returns to a project-path deploy? And should `CLAUDE.md` gotcha 3 be corrected — it has now been contradicted by four separate audits?
9. **Is PF-37's meta shape welcome?** A test asserting that a *claim's guard* covers both themes is deliberately self-referential. It directly encodes the estate's own law ("a published claim needs a live guard, not a one-time measurement") — but it is an unusual thing to find in a suite. Guard, or documented review step?
10. **PF-25 token parity vs the in-flight type program.** The existing guard pins 9 exact `clamp()` strings and 3 letter-spacing values, and the `ui-polish` train is a type/spacing program. It will fire on legitimate work and is the kind of guard people bulk-update without reading. Leave it, loosen it to structural parity only, or accept the churn?

---

## PHASE B ORDER OF WORK

Fix false confidence first. Nothing new is worth forging on top of a suite that lies about what it runs.

**Wave 0 — MEASURE, before touching anything.**
1. **M-08 first.** `mv out out.bak && npx vitest run; mv out.bak out`. Record the count. It should read **468**, not 510. This converts V-1 from an argument into a number and settles §8 item 1. Non-destructive to source; needs no code change.
2. Confirm V-2 by inspection: current branch vs `ci.yml`'s two triggers. Zero jobs selected.

**Wave 1 — repair the guards that lie (V-1 … V-9). No new guards yet.**
3. **PF-01** — `- run: npm run build` before `- run: npm run test` in `ci.yml`'s `test` job, plus the branch-trigger widening Sky picks (§9 Q1). *Instantly un-hollows 42 existing tests — the single highest-leverage line in the plan.*
4. **PF-03** — artifact guards fail (not skip) on a missing `out/`, and fail on a **stale** one (V-6). Ship with its own non-vacuity companion, copying `ink-contrast.test.ts:99`.
5. **V-5** — convert the three `if (!existsSync(...)) return;` escape hatches at `static-integrity.test.ts:332/341/403` into `expect(...).toBe(true)`. Same commit as PF-03; same disease.
6. **V-3** — convert `asset-integrity.test.ts:29`'s `it.todo` to a live `it()` (9/9 badges exist) and correct the false docblock. Gated on §9 Q5.
7. **V-4** — delete the "Gap 4" paragraph from `static-integrity.test.ts`'s header, or (better) leave it and let step 11 make it true.
8. **PF-04** — the `.only`/`.todo`/`.skip` guard plus the two-entry allowlist. Retire the `it.skip` notice at `:51` once PF-03 lands.
9. **PF-02** — the orphan-guard grep.
10. **§7 + V-9** — add `npm run check`; correct the README's stale test row; point `CLAUDE.md` §Commands at `check`. *Do this now, not last: every later verification quotes this command.*

**Wave 2 — close the live defect and the asset class.**
11. **PF-05** — the `blog.json` walker in `validate-assets.mjs` + a no-build unit test. **This is a live broken hero on production and the estate's last console error.** Gated on §9 Q1's sibling question of whether it ships on its own branch or folds into the polish train.
12. **PF-06** — Gap 4 for real, in `static-integrity.test.ts`, **with the `expect(totalSeen).toBeGreaterThan(0)` sanity companion** copied from Gap 2's `:214`.

**Wave 3 — the top-tier new guards, cheapest-first so the wave lands.**
13. **PF-33** — the two `rootMargin` assertions, lifted verbatim from `IntroScrollCue.test.tsx:137`. Two files, six lines, closes a live CRITICAL class. Do PF-31's margin branch in the same commit.
14. **PF-23 + PF-22** — two rows plus a `floor` field in `BINDING_BACKGROUNDS`, plus the surface-drift pin. Every new row arrives with its own non-vacuity companion.
15. **PF-34** — the placeholder allowlist guard, seeded with T7 and T18. Gated on §9 Q3.
16. **PF-15** — the per-route document-structure sweep, copying `section-nav-anchors.test.ts`'s per-route-describe grammar. Largest of the P1 set; land it last in the wave so the plumbing from steps 3–4 and 12 is already proven. Ship the two-line `contentinfo`-not-in-`main` render test first as a down payment.

**Wave 4 — P2, in the order the table lists them.** Start with the free ones that need no new machinery: PF-36 (one assertion in an existing file), PF-38, PF-39, PF-20, PF-32, PF-42, PF-44, PF-46, PF-48, PF-49, PF-27, PF-28, PF-07, PF-31-remainder. Then PF-54 (a hook is a workflow change), PF-53 (gated on §9 Q6), PF-35 (per-surface bindings only — not the fragile general form), PF-37 (gated on §9 Q9).

**Wave 5 — provisioning, only if Sky says yes (§9 Q2).** Declare `playwright-core` + `axe-core`, `npx playwright install chromium`, commit the rig. Then and only then: PF-52, PF-50, PF-51 as real CI steps. PF-55 stays on-demand. **If the answer is no, they stay in §5 with the reason attached — never as CI steps that silently no-op.**

**Standing rule for every step above.** No guard is accepted green. Each one is proven RED first by the mutation named in its row, then reverted, and the RED output is pasted into the phase report — the practice `a11y-qa/…/PHASE_B_CLOSEOUT.md` §Gates already established for this estate, and the only thing that distinguishes this ledger from a wish list.

---

*Ledger produced read-only at `06aa565` on 2026-08-01 by Opus 5, max effort, unattended. No repo file was edited, staged, committed, or moved; no build was run; `out/` was left exactly as found. `npx vitest run` was executed twice to measure the baseline. Every coverage verdict marked GUARDED, PARTIAL or NAKED for a P1 row was established by opening the named test file, not by trusting a census line. Where a mine file's claim disagreed with the source, the source won and the correction is in §8. This file is untracked by design.*
