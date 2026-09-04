# PHASE-02_FOUNDATION_GATE_RECEIPT

**Prompt ID:** SKYPI-PORTFOLIO-3.0-P02-LEAD
**Phase:** PHASE-02 — Shared CTA, Metadata and Technical Foundation
**Sub-phases folded into this lead run:** P02-B (dependency), P02-A (CTA) and P02-C (metadata/claim guards) were executed directly by the lead session, in the contract-required order (dependency first, then CTA and metadata), rather than as separate subagent invocations — no subagent orchestration mechanism was available in this session, so the lead performed the work itself per the prompt's "or execute their work yourself if subagent orchestration is unavailable" fallback.
**Date:** 2026-09-03

---

## AMENDMENT 1 (2026-09-03) — three gate-evidence items closed post-acceptance

Sky accepted the Phase 02 handoff conditionally and required three gate-evidence items closed before Phase 03 begins. **No implementation was reopened or redone** — all three items below are evidence/documentation fixes only; `git status --short` was clean (product code) before and after this amendment.

1. **Final-SHA discrepancy** — §5 originally named `d46fa913...` (the last *implementation* commit) as the phase's final SHA, but the receipt documenting that SHA was itself then committed as `fa21f2e` — a self-reference a receipt can never fully resolve in its own text (a commit's SHA is a hash of its content, so a commit cannot name its own hash). §5 is corrected below to state the resolution rule explicitly, and the FINALIZATION section at the end of this document states the literal resulting SHA once this amendment itself is committed.
2. **Vitest major-version approval** — recorded verbatim in §9a below, per Sky's explicit conditions.
3. **CTA responsive/theme evidence gap** — closed in §8a below via live verification using the site's real `next-themes` mechanism at all 5 required widths × both themes, using the narrowest available method (direct browser JS/CSSOM inspection against the running dev server — no new test framework built). Two cells are marked UNVERIFIABLE with cause and substitute evidence, per Sky's explicit instruction not to represent them as tested if tooling makes them genuinely impossible.

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

Three **implementation** commits on top of the accepted baseline, on this same integration branch:

1. `109b7bc` — dependency remediation (P02-B)
2. `dabb214` — shared `ProjectDoorwayButton` / F-014 (P02-A)
3. `d46fa91` — self-canonicals + claim guard / F-028 (P02-C)

`d46fa9133ca738b05cf397dfc2f31902c058f856` / tree `9068cf0e129c71c57e5fa6d58f51ab834b47352a` is the tree at that point — the last *implementation* commit, before any receipt existed.

**Corrected rule (Amendment 1, item 1):** the phase's actual final SHA/tree is **not** a fixed value this document can name in advance — it is necessarily the SHA of the commit that carries this receipt file itself, which cannot be known until that commit is made (a commit's SHA is a hash of its own content, so no commit can contain its own hash). The receipt was first committed as `fa21f2e` (tree `a4d9d8b`), then amended again for this update. **The FINALIZATION section at the end of this document states the literal, verified-after-the-fact SHA/tree Phase 03 must use** — obtained by running `git rev-parse HEAD` / `git rev-parse HEAD^{tree}` immediately after this amendment's own commit, not asserted from inside the file being committed.

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
- ~~Theme check: attempted a manual `dark` class/`data-theme` toggle...~~ **Superseded by §8a below (Amendment 1) — the original theme check used an uncertain synthetic toggle; §8a redoes it against the site's real `next-themes` mechanism.**

## 8a. CTA responsive/theme evidence (Amendment 1, closes the gap named in the original §8)

**Method:** live `npm run dev` (`localhost:3001`), narrowest available tooling — direct browser JS/CSSOM inspection via this session's browser-preview tool against the running dev server. No Playwright harness or other new QA framework was built, per instruction.

**Real theme mechanism, not a synthetic class toggle:** the site's actual `ThemeProvider` (`components/ThemeProvider.tsx`) wraps `next-themes` with `attribute="class"`. The real toggle control is `components/ThemeToggle.tsx`, a `<button aria-label="Switch to {dark|light} mode">`. This session located that exact button and invoked its real click handler. Verified this was the real mechanism, not a bypass: after invoking it, `document.documentElement` gained/lost the literal `dark` class, `getComputedStyle(html).colorScheme` flipped `light`↔`dark`, `localStorage.getItem('theme')` was written (`"dark"`/`"light"`), and the button's own `aria-label` re-rendered to name the *other* mode — i.e., `next-themes`' own React state updated, not a value this session set directly. (Coordinate-based mouse clicks on the toggle are blocked in this headless preview by the pinned cinematic-intro overlay, a pre-existing, previously-documented limitation of this tool unrelated to theming — confirmed empirically via `document.elementFromPoint`, which returned the intro overlay at the toggle's screen coordinates. `element.click()` on the real button element was used instead of a coordinate click to work around that hit-testing block; the click handler invoked is the site's own.)

**A tooling artifact found and worked around (not a product defect):** the very first capture showed the flagship pill's `background-color` still reading the pre-toggle light value seconds after switching to dark, while `color` (not in the component's `transition-property` list) updated instantly and correctly, and the element's own resolved `--rgb-canvas` custom property already read the correct dark value. Diagnosis: `background-color`/`border-color`/`box-shadow` are all in `ProjectDoorwayButton`'s CSS `transition-property` list, and this headless preview's dormant animation-frame scheduling (a limitation already on record for this GSAP-driven homepage) leaves such transitions stuck at their pre-change value indefinitely — the transition never gets a frame tick to advance, no matter how long you wait. Fix used only for reading true values (never touches the component or its source): before each `getComputedStyle` read, set `el.style.transition = 'none'`, force a synchronous reflow (`el.offsetHeight`), read, then restore the saved inline value. Confirmed this reproduces the correct value both ways (dark → `rgb(21, 25, 26)`, light → `rgb(250, 248, 241)`, matching `globals.css`'s `--rgb-canvas` tokens exactly).

**Rest-state matrix — 320 / 375 / 430 / 768 / 1440 × light / dark (10/10 cells, live):**

| Width | Theme | `identical` (flagship vs. row pill, full computed snapshot) | `backgroundColor` | `color` |
|---|---|---|---|---|
| 320 | dark | ✅ true | `rgb(21, 25, 26)` | `rgb(236, 234, 224)` |
| 375 | dark | ✅ true | `rgb(21, 25, 26)` | `rgb(236, 234, 224)` |
| 430 | dark | ✅ true | `rgb(21, 25, 26)` | `rgb(236, 234, 224)` |
| 768 | dark | ✅ true | `rgb(21, 25, 26)` | `rgb(236, 234, 224)` |
| 1440 | dark | ✅ true | `rgb(21, 25, 26)` | `rgb(236, 234, 224)` |
| 1440 | light | ✅ true | `rgb(250, 248, 241)` | `rgb(32, 48, 44)` |
| 768 | light | ✅ true | `rgb(250, 248, 241)` | `rgb(32, 48, 44)` |
| 430 | light | ✅ true | `rgb(250, 248, 241)` | `rgb(32, 48, 44)` |
| 375 | light | ✅ true | `rgb(250, 248, 241)` | `rgb(32, 48, 44)` |
| 320 | light | ✅ true | `rgb(250, 248, 241)` | `rgb(32, 48, 44)` |

At every one of the 10 cells, `identical` compared the FULL snapshot (`display`, `height`, `paddingLeft/Right`, `borderRadius`, `borderWidth`, `borderColor`, `backgroundColor`, `color`, `fontFamily`, `fontSize`, `letterSpacing`, `textTransform`, `gap`, `boxShadow`) between the flagship doorway and a row pill — all 10 returned `true`. Values also correctly tracked theme (light vs. dark differ as shown) and were unaffected by width (each theme's 5 rows are identical to each other) — expected and confirmed from source: `ProjectDoorwayButton.tsx` carries zero `sm:`/`md:`/`lg:`/`xl:`-prefixed classes, so no `@media` rule can touch it at any of the 5 widths. `tabIndex`/accessible-name pairing (flagship: no `tabindex`, no `aria-label` override; row: `tabindex="-1"`, full `aria-label`) was re-confirmed unchanged at every cell.

**Icon/dot treatment:** confirmed present on both instances (`span[class*="bg-terracotta"]` found inside both) at the initial capture; not width/theme-conditional in source (no `sm:`/`dark:` prefix on the dot span either), so not re-captured at all 10 cells.

**Active state — verified from source, not a live-tooling gap:** `ProjectDoorwayButton.tsx`'s className string contains no `active:`-prefixed utility at all (confirmed by reading the full file). This mirrors the original row-pill markup it was extracted from (also had none). There is no distinct active state defined for this family to diverge on — this is a fact about the component, not something tooling failed to observe.

**Hover — UNVERIFIABLE BY LIVE INTERACTION in this environment.** The pinned cinematic-intro overlay intercepts pointer hit-testing across the *entire* viewport in this headless preview (confirmed via `document.elementFromPoint` returning the overlay at both the header and, after scrolling the flagship link to center-viewport, at the flagship link's own coordinates too) — a real mouse `hover` gesture cannot reach any interactive element on this page in this tool, not just during the intro. `:hover` cannot be forced by a JS-dispatched event either (browsers require genuine pointer position tracked by the UA, not a page-level synthetic event). **Substitute evidence:** grepped the compiled Tailwind output (`.next/static/css/app/layout.css`) — the `hover:` utility rules the component uses (e.g. `hover:-translate-y-px`, `hover:bg-blush`) are plain, unscoped class selectors; there is no `#flagship`-scoped or ancestor-scoped rule anywhere in the compiled CSS (grepped for `flagship` — the only 3 matches are code comments, none are selectors). Since the flagship and row instances share a byte-identical class list (confirmed in §8), the same unscoped hover rule is structurally guaranteed to apply to both identically, at every width and theme — CSS class-selector matching cannot differentiate between two elements carrying the same classes.

**Focus-visible — UNVERIFIABLE BY LIVE INTERACTION for this specific element, same root cause as hover, with a partial live proof.** This session confirmed the underlying mechanism works on this exact page/build: a genuine `key: Tab` press (real input, not a page-level event) landed real focus on a link and correctly matched `:focus-visible` (`true`) — programmatic `.focus()` alone did not (`:focus-visible: false`), confirming the distinction matters and that real-Tab detection functions correctly here. However, reaching the *flagship room's own* doorway specifically requires the cinematic intro to have really dismissed — its dismissal is driven by an `IntersectionObserver` (see `components/IntroSkip.tsx`), and this headless preview's dormant animation-frame scheduling means that dismissal never fires; a real Tab-key walk from the top of the document in this session skipped straight past all of the intro-scoped chrome (skip link, nav, hero, the flagship room) and landed on the first `#work` row's title link. This is the same dormant-rAF/IO limitation already on record for this GSAP-driven homepage, not a claim about the deployed site's real keyboard accessibility (which is covered separately by the existing jsdom-based `homepage-project-links.test.tsx`/`flagstone-cta-parity.test.tsx`, unaffected by this preview-only rendering quirk). **Substitute evidence:** the same structural argument as hover — `focus-visible:` utility classes on `ProjectDoorwayButton` are plain and unscoped (confirmed in the same grep), so the identical rule necessarily applies to both instances.

**Not claimed:** this amendment does not claim a full Playwright cross-browser matrix exists — it closes the specific gap by demonstrating, live, the exact properties the original prompt listed (dimensions, padding, typography, border, radius, background, gap/alignment, rest, responsive, accessible name, keyboard ownership) at all 10 required width×theme cells, and honestly marks the two cells (hover, focus-visible-on-this-element) blocked by a real, verified, previously-documented tooling limitation — each backed by a structural proof that does not depend on live rendering.

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

### 9a. Owner approval — Vitest / @vitest/ui major-version bump (Amendment 1, item 2)

**Sky's explicit approval, recorded verbatim (2026-09-03):**

> I explicitly approve retaining the Vitest / @vitest/ui 3.2.7 upgrade provided:
> - it remains development/test-only;
> - no production/runtime dependency path was introduced;
> - the full 836-test suite, typecheck, build and static suite remain green;
> - no unrelated compatibility changes are required.

**Each condition checked against this phase's actual change:**

| Condition | Status |
|---|---|
| Development/test-only | ✅ `vitest` and `@vitest/ui` are both `devDependencies` in `package.json` (never in `dependencies`); `npm audit --omit=dev` does not list either package at all, confirming no production/runtime dependency graph includes them. |
| No production/runtime dependency path introduced | ✅ Confirmed by the same `--omit=dev` audit (§9) — the 4 production-relevant advisories before this phase were `next`, `sharp`, and two nested under `next` (`postcss`, `nanoid`); none involve `vitest`. |
| Full suite/typecheck/build/static-suite green | ✅ `npm run typecheck` clean; `npm test` 836 passed / 2 skipped; `npm run build` 26/26 routes; `npm run test:static` 54 passed / 1 skipped — all re-confirmed in this same session, after this amendment's additional live-browser verification work (§8a), with zero source changes in between. |
| No unrelated compatibility changes required | ✅ `vitest.config.ts` needed zero edits for the 2.1.8→3.2.7 bump (confirmed by reading the file both before and after — no diff). No other file was touched to accommodate the bump beyond `package.json`/`package-lock.json` themselves. |

**No additional dependency changes were made in this amendment**, per Sky's explicit instruction.

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
1. `GATE-FLAGSTONE-CTA-PARITY` passes source, variant, class, computed-style (live DOM, now including the full 320/375/430/768/1440 × light/dark responsive/theme matrix — §8a, Amendment 1), interaction/keyboard, and structural-regression checks (§8). Hover and this-element's-own focus-visible were verified live to be blocked by a real, previously-documented headless-preview limitation (not a product defect) and are marked UNVERIFIABLE with structural substitute evidence (§8a) rather than claimed as tested.
2. No passing CTA family regressed (§8, §10 PR-018).
3. No Flagstone-specific visual override remains — `ProjectDoorwayButton` has no `className` prop, confirmed unused/absent by both the unit test and manual source review.
4. Advisories classified and only safe, bounded changes applied (§9); residual is documented and requires an explicitly deferred major migration.
5. Reusable metadata (`lib/metadata.ts`) and claim guards (`recruiter-copy-truth.test.ts` addition) exist without any route-copy rewrite.

---

## NEXT-PHASE HANDOFF

**Accepted dependency disposition:** `next` 15.5.18→15.5.25, `sharp` ^0.34.5→^0.35.4, `vitest`/`@vitest/ui` 2.1.8→3.2.7. Residual: 2 advisories (both `next`'s nested `postcss@8.4.31`), fixable only via a deferred `next@16` major migration — not scheduled by this phase.

**Shared CTA primitive:** `components/ProjectDoorwayButton.tsx` (href, optional `aria-label`, optional `tabIndex`; no `className`). Used by all 5 homepage rows and the Flagstone flagship room in `app/page.tsx`. Source/computed parity evidence: §8.

**Metadata/claim guard APIs and test contracts:** `lib/metadata.ts` (`SITE_URL`, `absoluteUrl`, `canonicalFor`) — wired into every indexable route's own `alternates.canonical`, plus the two noindex routes. Guards: `lib/__tests__/static-integrity.test.ts` "Gap 6" canonical test (build-dependent), `lib/__tests__/recruiter-copy-truth.test.ts` public-Studio-Archive-edition guard (source-level, always runs), `lib/__tests__/metadata.test.ts` (helper unit tests).

**Foundation SHA/tree:** see FINALIZATION below — the literal, verified-after-commit SHA/tree of this amendment, which is the true Phase 03 working base (it includes the receipt; §5/Amendment 1 explains why no earlier SHA is correct to cite here).

**Phase receipt:** this file, `qa-reports/2026-09-03_PHASE02_FOUNDATION_GATE_RECEIPT.md`.

**Non-deferrable CTA gate status:** `GATE-FLAGSTONE-CTA-PARITY: PASS`.

**Next permitted prompt:** `SKYPI-PORTFOLIO-3.0-P03-LEAD`.

---

## FINALIZATION (Amendment 1)

- **Vitest 3.2.7 retention:** owner-approved, conditions verified — §9a.
- **CTA responsive/theme evidence:** closed — §8a (10/10 live cells; 2 cells honestly marked UNVERIFIABLE with cause + structural substitute, per instruction).
- **No product code was modified in this amendment** — verification found no regression. `git status --short` was clean (only the 4 pre-existing, untouched Phase 00 files) immediately before this amendment's own commit.
- **Final accepted SHA/tree:** `fa21f2eed83dd844eb54a4b603cb229f1b83acf7` / tree `a4d9d8b558fc092009145ee4ba44b6752ada2847` — this is `HEAD` as verified by `git rev-parse HEAD`/`git rev-parse HEAD^{tree}` immediately before writing this amendment. **This amendment itself is committed as one additional commit on top of that SHA** (a documentation-only commit, since the evidence above was gathered without any product-code change); the true final Phase 03 working base is that new commit's own SHA, reported directly in this session's reply to Sky once the commit is made (see the commit log — `git log --oneline -1` — for its authoritative value, since, as explained in §5, this file cannot name its own resulting hash).
- **`FOUNDATION_GATE: PASS`** — reissued, now with all three gate-evidence items closed.
