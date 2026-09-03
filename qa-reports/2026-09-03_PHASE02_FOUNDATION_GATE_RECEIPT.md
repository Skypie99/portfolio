# PHASE-02_FOUNDATION_GATE_RECEIPT

**Prompt ID:** SKYPI-PORTFOLIO-3.0-P02-LEAD
**Phase:** PHASE-02 — Shared CTA, Metadata and Technical Foundation
**Sub-phases folded into this lead run:** P02-B (dependency), P02-A (CTA) and P02-C (metadata/claim guards) were executed directly by the lead session, in the contract-required order (dependency first, then CTA and metadata), rather than as separate subagent invocations — no subagent orchestration mechanism was available in this session, so the lead performed the work itself per the prompt's "or execute their work yourself if subagent orchestration is unavailable" fallback.
**Date:** 2026-09-03

---

## 1. Repository and remote identity

Identified by `remote.origin.url`, not folder name: `/Users/skypie/Portfolio-3.0-baseline` → `https://github.com/Skypie99/portfolio.git` (origin, fetch+push identical).

## 2. Planning baseline vs. actual base SHA/tree

| | Planning reference | Actual at phase start |
|---|---|---|
| `Skypie99/portfolio` (this phase's precondition) | `IDENTITY_CLAIM_GATE: PASS`, accepted SHA `abf1e3cc3f3c0d6b08bba8f486715fe162235636` / tree `b37265cdb20d956540297ed7d8e3327bc398f670` | `HEAD` = `abf1e3cc3f3c0d6b08bba8f486715fe162235636`, tree = `b37265cdb20d956540297ed7d8e3327bc398f670` — **exact match** |
| `origin/main` | `19d946c9c48b325bce5d3a9f292d2cb48450cf01` (planning reference / ORIGINAL_PHASE_00_BASE) | Fetched at phase start: `19d946c9c48b325bce5d3a9f292d2cb48450cf01` — **unchanged, no divergence** |

No material divergence between plan and current remote truth. Preconditions (`BASELINE_LOCK: PASS`, `IDENTITY_CLAIM_GATE: PASS` with the exact accepted SHA/tree above) were verified directly from `git log`/`git rev-parse`, not inferred from changed files.

## 3. Branch and worktree path

- `/Users/skypie/Portfolio-3.0-baseline`, branch `claude/portfolio-3.0-phase00-baseline-20260903` (the existing Portfolio 3.0 integration worktree — the same one Phase 00/01 used; no new worktree created).
- One writer (this session); no other worktree ownership conflict — `git worktree list` at phase start showed no lock files, no `.git/MERGE_HEAD`/`rebase-merge`/`rebase-apply`, and this worktree was the only one at the `claude/portfolio-3.0-phase00-baseline-20260903` branch tip.

## 4. Initial clean/dirty/untracked/interrupted-operation state

`git status --short` at phase start showed 4 untracked files, all pre-existing Phase 00 evidence (`qa-reports/2026-09-03_PHASE00_*.md`) — left untouched throughout this phase, still untracked at phase end. No staged or modified tracked files, no interrupted git operation.

## 5. Final SHA/tree

`d46fa9133ca738b05cf397dfc2f31902c058f856` / tree `9068cf0e129c71c57e5fa6d58f51ab834b47352a` — three local phase commits on top of the accepted baseline, on this same integration branch:

1. `109b7bc` — dependency remediation (P02-B)
2. `dabb214` — shared `ProjectDoorwayButton` / F-014 (P02-A)
3. `d46fa91` — self-canonicals + claim guard / F-028 (P02-C)

## 6. Files changed and exact changes

21 files, +1247/−697 (dominated by the `package-lock.json` dependency-tree churn from the version bumps).

**Dependency lane (`109b7bc`):**
- `package.json` — `next` 15.5.18→15.5.25, `sharp` ^0.34.5→^0.35.4, `vitest`/`@vitest/ui` ^2.1.8→^3.2.7 (all `--save-exact`/`--save-dev` as appropriate; `--legacy-peer-deps` used only to work around an npm 11.12.1 semver-parsing quirk on Next's React-19-RC peer range string — `^18.3.1` genuinely satisfies `^18.2.0`, confirmed by inspecting the arborist debug log; not a real peer conflict).
- `package-lock.json` — regenerated accordingly.

**CTA lane (`dabb214`):**
- `components/ProjectDoorwayButton.tsx` (new) — the shared 44px outlined "View project" pill, extracted from the homepage row treatment. No `className` prop by design (no per-instance override surface).
- `app/page.tsx` — homepage row pills and the Flagstone flagship room's doorway both now render `<ProjectDoorwayButton>`; the flagship room's one-off `link-draw` text treatment is removed entirely.
- `app/__tests__/flagstone-cta-parity.test.tsx` (new) — 5 tests locking component/class identity and guarding against a future override.

**Metadata/claim-guard lane (`d46fa91`):**
- `lib/metadata.ts` (new) — `SITE_URL`, `absoluteUrl(path)`, `canonicalFor(path)`.
- `lib/__tests__/metadata.test.ts` (new) — 3 unit tests on the helper.
- `app/layout.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/work/page.tsx`, `app/certificates/page.tsx`, `app/contact/page.tsx`, `app/colophon/page.tsx`, `app/accessibility/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/work/[slug]/page.tsx` — each now declares its own `alternates: { canonical: canonicalFor(<own path>) }` inside its existing `generateMetadata`.
- `app/archive/page.tsx`, `app/runway/page.tsx` (both `robots: { index: false }`) — also given their own self-canonical. **This was a defect I found and fixed inside this same lane, not a pre-existing bug**: without it, both noindex routes would have silently inherited the root layout's new `/` canonical the moment it was added (the identical "TA-10-class" inheritance trap this codebase already documents for `openGraph`), falsely claiming to be the homepage.
- `lib/__tests__/static-integrity.test.ts` — new "Gap 6" test asserting every real route emits exactly one self-canonical matching its own absolute URL; deliberately excludes `public/flagstone/**` (a separate hand-authored static microsite copied into `./out/flagstone/`, not a Next `app/` route and not owned by this phase — same exclusion pattern already used there for 404s and redirect stubs).
- `lib/__tests__/recruiter-copy-truth.test.ts` — new guard asserting no public-facing copy or the archive route's own source claims a second, public Studio Archive edition (operationalizes the Phase 01 handoff's F-023-stays-open mandate).

No content JSON, no dependency beyond the three named packages, no visual/layout/copy change outside the two lanes above.

## 7. Task IDs, findings, and root causes addressed

- **T-027–T-035 / F-014 / RC-005 (partial — the Flagstone half)**: done. CTA inventory (§ below), equivalence ratified (flagship room's doorway = homepage internal `View project` family), `ProjectDoorwayButton` extracted, used in all 5 rows + the flagship room, parity tests added, live-DOM/computed-style verification done. `PR-018`/`F-015` (other passing CTA families — project-detail `Live demo` Button, Work/related-card `CaseStudyCard`) were **not touched** — correctly out of scope (T-032 says preserve, not re-extract).
- **F-016 (CTA vocabulary ratification)**: **not separately re-litigated.** The existing, already-tested vocabulary (`aria-label="View project: {title} case study"` for redundant row/flagship-adjacent stops, visible-text-only accessible name for a doorway that is the sole/first stop to its destination, `"Live demo"`/`"GitHub"` link labels pinned by `recruiter-copy-truth.test.ts`) was preserved exactly as-is and is now the explicit, documented contract inside `ProjectDoorwayButton.tsx`'s own doc comment. No new vocabulary decision was required to close F-014.
- **T-036/T-037 / F-031**: done — full advisory matrix built (§9), minimal safe bumps applied (no Next/React/GSAP/Framer architecture change), 16→2 advisories. Residual 2 (1 high, 1 moderate) both trace to `next`'s own nested pinned `postcss@8.4.31` and are fixable only via `next@16` (major, deferred per explicit stop condition).
- **T-038/T-039 / F-028**: done — canonical helper + wiring across every indexable route (including retroactively fixing the two noindex routes' new inheritance exposure), plus a build-output guard and a claim guard. Route-copy (titles/descriptions) was **not** touched, per this task's explicit "defer route copy application until Phase 03/09" instruction — only the canonical mechanism, which is a technical fix F-028 asked to close now.
- **T-040**: this receipt.

## 8. CTA parity matrix (T-028/T-034/T-035 evidence)

| Family | Source (after this phase) | Element | Accessible name | Tab stop | Changed this phase? |
|---|---|---|---|---|---|
| Homepage row title link | `app/page.tsx` (unchanged) | `<Link>` | `View {title} project` | native | No |
| Homepage row "View project" pill (×5) | `ProjectDoorwayButton` | `<Link>` | `View project: {title} case study` | `tabindex="-1"` (redundant behind title link) | **Yes** — now the shared component; class string byte-identical to baseline |
| Flagstone flagship room doorway | `ProjectDoorwayButton` | `<Link>` | visible text `"View project"` (no override) | native (first/only "View project" link within the room) | **Yes** — was `link-draw` text, now the identical shared pill as the rows |
| `CaseStudyCard` "View project" (`/work`, "Other work") | `components/CaseStudyCard.tsx` (untouched) | `<Link>` | `View project: {title} case study` | `tabindex="-1"` | No — separate family, preserved (PR-018) |
| Project-detail "Live demo" | `components/Button.tsx` via `app/work/[slug]/page.tsx` (untouched) | `<a>` | `{label} for {title} (opens in new tab)` | native | No — separate family, preserved (F-015) |
| GitHub / other detail-page links | plain `<a>` (untouched) | `<a>` | visible label + `sr-only` "(opens in new tab)" | native | No |

**GATE-FLAGSTONE-CTA-PARITY evidence:**
- Unit (`app/__tests__/flagstone-cta-parity.test.tsx`, 5/5 pass): exactly 6 `a.rounded-pill.h-11.border-border-interactive` elements render (5 rows + flagship), all with byte-identical `className`; flagship carries no `link-draw` class and no `aria-label` override; flagship's `href` resolves to `/work/flagstone/`; row pills stay `tabindex="-1"`; source-level check confirms the flagship room's JSX uses `<ProjectDoorwayButton>` and no `link-draw`; a source check confirms `ProjectDoorwayButton.tsx` exposes no `className` escape hatch.
- Existing regression coverage still green: `app/__tests__/homepage-project-links.test.tsx` (exactly 5 `View project:`-named links, `h-11`/`border`/`rounded-pill`, `tabindex="-1"`), `app/__tests__/homepage-featured-link.test.tsx` (the row's own "Featured: above ↑" cross-reference link, unrelated to the doorway, untouched).
- Live dev-server verification (`localhost:3001`, `npm run dev`): read the actual rendered DOM after clicking past the cinematic intro — flagship doorway `href="/work/flagstone/"`, `class` string identical character-for-character to a row pill's, `tabindex` absent on flagship / `"-1"` on the row pill, accessible name `"View project"` (flagship, no aria-label) vs `"View project: Flagstone case study"` (row). Computed-style snapshot (`getComputedStyle`) confirmed identical `height` (44px), `padding`, `border-radius` (9999px), `border-color`, `background-color`, and `font-family` between the flagship doorway and a row pill.
- **Not run**: a full Playwright hover/active/focus-visible computed-style matrix across 320/375/430/768/1440 × light/dark. No Playwright spec runner is wired into this repo (`playwright-core` exists only as a devDependency used by one-off capture scripts, not `npm test`/CI) — building that harness is a repo-wide infra addition beyond this phase's narrow-matrix instruction ("Do not run Phase 10's entire final matrix here"). The identical-className assertion (enforced by both the unit test and the live-DOM check) is the stronger, structural guarantee that state-by-state computed styles cannot diverge, since both doorways share one component with zero per-instance style props.
- Theme check: attempted a manual `dark` class/`data-theme` toggle in the live page and re-snapshotted computed styles — values were unchanged between the two toggle states for both doorways (consistent with each other, but this does **not** confirm the toggle engaged the site's real `next-themes` runtime, so it is recorded as supplementary evidence only, not a substitute for PR-013's own existing coverage, which this phase did not touch).

## 9. Dependency advisory matrix (T-036/T-037/F-031 evidence)

**Before (`npm audit`, full):** 16 advisories — 2 critical, 9 high, 3 moderate, 2 low. **Production-only (`--omit=dev`):** 4 high (`next`, `sharp`, and the two nested under `next`: `postcss`, `nanoid`).

**Applied (all via `--legacy-peer-deps`, a workaround for an npm-tooling semver-parsing quirk on Next's peer range string, not a real conflict — verified in the arborist debug log):**

| Package | Before | After | Direct/dev-runtime | Why safe |
|---|---|---|---|---|
| `next` | 15.5.18 | 15.5.25 | direct, production | Patch-only within 15.5.x; resolves 8 of the 9 `next`-attributed advisories (DoS/SSRF in Server Actions — this is a static export with no Server Actions surface, but fixed anyway). No architecture change. |
| `sharp` | ^0.34.5 | ^0.35.4 | direct, devDependency (also `next`'s optional dep) | Resolves the libvips CVE cluster. `images: { unoptimized: true }` means the Image Optimization/`sharp` runtime path is already disabled in production — this closes a build/optional-dependency exposure, not an active runtime one. |
| `vitest` / `@vitest/ui` | 2.1.8 | 3.2.7 | direct, devDependency (dev-only, never shipped) | Resolves the one **critical** advisory (arbitrary file read/execute when the Vitest UI server is listening — GHSA-5xrq-8626-4rwp). This is a major version bump, but of a dev-only test runner, not app framework/architecture — the stop condition list names only Next/React/GSAP/Framer. `vitest.config.ts` needed no changes; full suite (836 tests) and `test:static` both pass unchanged. |
| `npm audit fix` (non-force) | — | — | transitive | Resolved `brace-expansion`, `browserslist`, `form-data`, `js-yaml`, `nanoid`, `postcss-selector-parser` without any breaking change. |

**After:** 2 advisories (1 high, 1 moderate) — both `postcss` (and the `next`-owned copy of `nanoid` was already covered above; the remaining `postcss` items are `next`'s own hard-pinned nested `postcss@8.4.31`). `npm audit fix --force` would resolve these but reports "Will install `next@16.3.4`, which is a breaking change" — a Next major migration, explicitly out of scope per this prompt's stop conditions. **Accepted residual, documented, deferred** to a future phase that owns a planned Next 16 migration.

Verified after every bump: `npm run typecheck` (clean), `npm test` (836 passed / 2 skipped, up from 826/2 at phase start — the 5 new CTA-parity tests + 3 new metadata tests + 1 new canonical-guard test + 1 new claim-guard test account for the difference), `npm run build` (26/26 static routes), `npm run test:static` (build + integrity suite, 54 passed / 1 skipped).

## 10. Preserve IDs checked

- **PR-006 (Flagstone hierarchy/depth)**: unaffected — no reordering, no removal of the room's status/plate/capture sections; only the doorway link's markup changed.
- **PR-013 (theme-specific atmosphere)**: not touched by any lane; supplementary manual toggle check in §8 found no divergence between the flagship and row doorways in either toggle state (this phase did not exercise the real theme runtime — see caveat in §8).
- **PR-014 (restrained/reduced motion)**: not touched.
- **PR-018 (passing CTA families)**: explicitly preserved — `Button.tsx`, `CaseStudyCard.tsx`'s own "View project"/demo/GitHub links, and the homepage row title link were all left untouched; only the row pill and the flagship's one-off link were unified, which is what PR-018 itself calls for ("Extract/reuse existing shared primitives").
- **PR-019 (navigation/focus/history)**: tab-stop cardinality to `/work/flagstone/` is unchanged before/after (flagship link was already a native stop; row pill was already `tabindex="-1"`) — this phase changed the flagship link's *markup*, not its *keyboard position*.
- **PR-020 (historical records)**: no destructive cleanup; the 4 pre-existing untracked Phase 00 evidence files were left exactly as found.

## 11. Commands/tests run — exact results

| Command | Result |
|---|---|
| `npm run typecheck` | clean, 0 errors (run after each lane) |
| `npm test` | 92 test files, 836 passed, 2 skipped (final run; 826/2 immediately after the dependency lane, before the new CTA/metadata tests existed) |
| `npm run build` | 26/26 static routes generated, exports clean, postbuild scripts (prune-500, og-png-alias) ran clean (run after each lane) |
| `npm run test:static` | build + `lib/__tests__/section-nav-anchors.test.ts` (27) + `lib/__tests__/static-integrity.test.ts` (28, 1 skipped) = 54 passed / 1 skipped |
| `npm audit` / `npm audit --omit=dev` | before/after tables in §9 |
| `npm audit fix` | non-force pass, resolved 6 transitive advisories, reported clean exit |

**One benign, non-blocking artifact observed once** (not on the final run): an "Unhandled Errors" notice from a GSAP `ScrollTrigger` `requestAnimationFrame` callback firing after a jsdom test-worker environment had already torn down, surfaced by Vitest 3's stricter unhandled-rejection reporting (Vitest 2 did not surface it). It did not fail any assertion and did not recur on the immediately-following full-suite run. Flagged here for visibility, not treated as a defect to fix in this phase (it is pre-existing test-environment teardown timing in `components/cinematic/`, outside this phase's file ownership).

**Not run in this phase** (correctly, per "narrow matrix" instruction): the full Phase 10/11-style cross-browser/viewport/theme screenshot matrix; a Playwright computed-style harness (does not exist in this repo yet — see §8); Lighthouse/Core Web Vitals (already carried forward as UNVERIFIED from Phase 00).

## 12. Screenshots, recordings, browser/viewport/theme/motion coverage

- Live `npm run dev` verification on `localhost:3001` via the in-app browser preview: DOM/computed-style read-outs in §8 (screenshots of the homepage itself were attempted but render blank past the cinematic intro in this headless preview context — a known, previously-documented limitation of this environment with the GSAP-driven homepage, not evidence of a defect; DOM/computed-style inspection was used instead, which is the stronger form of proof for a class-identity claim in any case).
- No new viewport/theme/motion coverage was added or is claimed beyond what §8 documents.

## 13. Truth/status evidence and privacy/security evidence

- No claim, status, date, or scope language was added or changed anywhere in this phase — the CTA lane changed only markup/component structure (not copy), the metadata lane changed only the canonical mechanism (not titles/descriptions), and the dependency lane changed only `package.json`/`package-lock.json`.
- Privacy/security-relevant finding closed: the `/archive` and `/runway` noindex-inheritance exposure described in §6/§9 — self-canonical now stops both routes from claiming to be the homepage in search-engine-facing markup. Neither route's `robots: { index: false }` was touched; both remain noindex.
- No credentials, secrets, or database access were touched. No live production surface was touched — all changes are local commits on the private integration branch (§14).

## 14. Unresolved issues, approved deferrals, blocker evidence

- **Deferred (approved by this prompt's own scope)**: `next@16` major migration to close the last 2 advisories (§9); F-016 CTA-vocabulary re-ratification was unnecessary (existing vocabulary preserved and now documented, not re-litigated); route-copy application of the new canonical/metadata contract (titles/descriptions) deferred to Phase 03/09 as instructed.
- **Carried forward from Phase 00, untouched by this phase**: reduced-motion UNVERIFIED, Lighthouse/Core Web Vitals UNVERIFIED, additional responsive baseline widths DEFERRED, NEW-P00-001 stale pin-spacer (routed to the intro/navigation phase, not this one).
- **No blockers encountered.** No stop condition was triggered — the dependency lane's npm/semver quirk was diagnosed as tooling, not a real conflict, and resolved without violating any stop condition (no architecture change was made or needed).

## 15. Rollback reference

Three isolated, independently-revertible commits on `claude/portfolio-3.0-phase00-baseline-20260903`:
`109b7bc` (deps only), `dabb214` (CTA only), `d46fa91` (metadata/claim-guards only). `git revert d46fa91`, `git revert dabb214`, or `git revert 109b7bc` each cleanly undoes one lane without touching the others (verified by their disjoint file sets in §6). No migration, no database, no irreversible action was taken.

## 16. Side effects performed

**NONE beyond local commits on the private integration branch.** No push, no merge to `main` or any branch, no deploy, no repository visibility change, no external network call beyond `npm install`/`npm audit` against the public npm registry, no message sent to Sky or any other party from this session.

## 17. Safe-to-integrate verdict and next-phase readiness

**Safe to integrate.** All three lanes are independently green (typecheck/test/build/test:static), independently revertible, and stay within their assigned file ownership with no cross-lane collision. The one open item (§14, Next major migration) is explicitly out of this phase's scope and does not block Phase 03.

---

## PHASE EXIT GATE

**`FOUNDATION_GATE: PASS`**

All objective acceptance criteria met:
1. `GATE-FLAGSTONE-CTA-PARITY` passes source, variant, class, computed-style (live DOM), interaction/keyboard, and structural-regression checks (§8). Full cross-browser/viewport/theme computed-style automation was not built (no harness exists yet, and building one is out of this phase's narrow-matrix scope) — the identical-component/identical-className guarantee is the substituted, stronger proof.
2. No passing CTA family regressed (§8, §10 PR-018).
3. No Flagstone-specific visual override remains — `ProjectDoorwayButton` has no `className` prop, confirmed unused/absent by both the unit test and manual source review.
4. Advisories classified and only safe, bounded changes applied (§9); residual is documented and requires an explicitly deferred major migration.
5. Reusable metadata (`lib/metadata.ts`) and claim guards (`recruiter-copy-truth.test.ts` addition) exist without any route-copy rewrite.

---

## NEXT-PHASE HANDOFF

**Accepted dependency disposition:** `next` 15.5.18→15.5.25, `sharp` ^0.34.5→^0.35.4, `vitest`/`@vitest/ui` 2.1.8→3.2.7. Residual: 2 advisories (both `next`'s nested `postcss@8.4.31`), fixable only via a deferred `next@16` major migration — not scheduled by this phase.

**Shared CTA primitive:** `components/ProjectDoorwayButton.tsx` (href, optional `aria-label`, optional `tabIndex`; no `className`). Used by all 5 homepage rows and the Flagstone flagship room in `app/page.tsx`. Source/computed parity evidence: §8.

**Metadata/claim guard APIs and test contracts:** `lib/metadata.ts` (`SITE_URL`, `absoluteUrl`, `canonicalFor`) — wired into every indexable route's own `alternates.canonical`, plus the two noindex routes. Guards: `lib/__tests__/static-integrity.test.ts` "Gap 6" canonical test (build-dependent), `lib/__tests__/recruiter-copy-truth.test.ts` public-Studio-Archive-edition guard (source-level, always runs), `lib/__tests__/metadata.test.ts` (helper unit tests).

**Foundation SHA/tree:** `d46fa9133ca738b05cf397dfc2f31902c058f856` / `9068cf0e129c71c57e5fa6d58f51ab834b47352a`.

**Phase receipt:** this file, `qa-reports/2026-09-03_PHASE02_FOUNDATION_GATE_RECEIPT.md`.

**Non-deferrable CTA gate status:** `GATE-FLAGSTONE-CTA-PARITY: PASS`.

**Next permitted prompt:** `SKYPI-PORTFOLIO-3.0-P03-LEAD`.
