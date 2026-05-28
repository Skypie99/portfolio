# Sam — Integration Test Audit — AI Portfolio — 2026-05-25

```yaml
mode: background
role: sam
project: ai-portfolio
cycle_id: sam-integration-portfolio-2026-05-25
model_tier: sonnet
date: 2026-05-25
audit_only: true  # change budget used by Prompt Library this cycle
coherence_score: 0.94
state_consistency: pass
duplicate_work_detected: no
drift_risk: low
```

---

## What I read

- `qa-reports/cycle-2026-05-24-3rounds.md` — 46 cycles completed, Morgan confirmed all tests clean, open decisions include terracotta contrast (4.33:1), GH Pages vs Cloudflare, PostCSS CVE.
- Current test state: `npx vitest run` → 40/40 passing, 10 suites.

---

## Existing Test Coverage

| File | What it covers | Classification |
|---|---|---|
| `content.test.ts` | Loader functions vs Zod schemas; featured deliverable invariant | Data integration ✓ |
| `ProjectCard.test.tsx` | Card renders with fixture data | Component unit |
| `Hero.test.tsx` | Hero renders with profile | Component unit |
| `Sidebar.test.tsx` | Sidebar renders with deliverables | Component unit |
| `Footer.test.tsx` | Footer renders | Component unit |
| `Button.test.tsx` | Button variants | Component unit |
| `HamburgerNav.test.tsx` | Mobile nav open/close | Component unit |
| `NumberedStep.test.tsx` | Step component | Component unit |
| `TagPill.test.tsx` | Tag display | Component unit |
| `SkipLink.test.tsx` | Skip nav link | Component unit |

**Note:** `content.test.ts` is already an integration test in the right sense — it runs against the real JSON files and validates the full loader→schema→return chain. Gary wrote this well.

---

## Integration Gap Analysis

### Gap 1 — Deliverable content → ProjectCard render pipeline (LOW-MEDIUM risk)
**Flow:** `getDeliverables()` returns `Deliverable[]` → `DeliverableSchema` validates → each deliverable rendered as a `ProjectCard` with `title`, `description`, `tags`, `links`.

**What's tested:** `content.test.ts` validates the schema round-trip. `ProjectCard.test.tsx` renders with a fixture.
**What's NOT tested:** That the fields `getDeliverables()` actually returns match the props `ProjectCard` expects by name. If `deliverables.json` uses `externalUrl` but `ProjectCard` expects `demoUrl`, the test passes (fixture uses the right name) but production renders a broken link.

**Proposed test:** A single integration test that calls `getDeliverables()` (real data) and passes each result directly to `ProjectCard`, asserting the expected link text/href renders — no fixture, real data shapes.

### Gap 2 — All internal links resolve within the static export (MEDIUM risk)
**Flow:** `next build` produces `./out/` → every `href="/about"` or `href="/projects/slug"` must have a corresponding `out/about/index.html` or `out/projects/slug/index.html`.

**What's tested:** Nothing. If a page is removed or a route renamed, broken links exist silently until someone navigates to them.
**What's NOT tested:** Whether the static export is self-consistent (no href points to a missing page).

**Proposed test:** A build-time integration test that reads `./out/` after `npm run build`, collects all `href` values from HTML files, and asserts each relative href has a corresponding file in `./out/`. This is a structural integrity test — the portfolio equivalent of "does the game loop complete."

This is the highest-value gap for a static site: the test catches link rot before it reaches users.

### Gap 3 — External link `rel` attributes
**Flow:** Every external link (`href` starting with `http`) should have `rel="noopener noreferrer"` for security.

**What's tested:** Nothing.
**What's NOT tested:** Whether all external links in the rendered HTML have the correct rel attributes. A missing `noopener` on a target="_blank" link is a security issue (opener attack surface).

**Proposed test:** Read `./out/**/*.html`, find all `<a href="http` elements, assert each has `rel` containing both `noopener` and `noreferrer`.

### Gap 4 — Image alt text coverage
**Flow:** Every `<img>` in the built output should have a non-empty `alt` attribute (WCAG 1.1.1).

**What's tested:** Alex's a11y audits check this pattern manually. No automated test.
**What's NOT tested:** That all images in the final static export have alt text. A future template change adding an `<img>` without alt would pass all component tests (if the component test doesn't assert alt) and fail only on manual a11y audit.

**Proposed test:** Read `./out/**/*.html`, find all `<img>` elements, assert none have empty or missing alt.

---

## Priority Order for Next Cycles

1. **Gap 2 (internal links resolve)** — most impactful; broken nav links would be the first thing a visitor notices.
2. **Gap 3 (external link rel attributes)** — security; can be written alongside Gap 2 (same HTML-scanning approach).
3. **Gap 1 (deliverables → ProjectCard pipeline)** — medium; catches schema/prop mismatch before it reaches production.
4. **Gap 4 (image alt text)** — low; Alex's manual audits catch this, but an automated test would prevent regression.

---

## Note on Test Infrastructure

The portfolio already has `vitest` + `@testing-library/react` installed and working (10 suites, 40 tests green). Gaps 2, 3, and 4 can be implemented as `node:fs`-based tests against `./out/` after `npm run build` — no additional dependencies needed. They should live in `lib/__tests__/static-integrity.test.ts`.

---

## Shift note for Gary

**No change applied to portfolio this cycle** (Sam's one change went to Prompt Library).
**Gaps documented:** 4 integration gaps. Gap 2 (internal link resolution in static export) + Gap 3 (external link rel attributes) can both be written in one test file using `node:fs` — no new deps, fast, high value.
**Gary's next move:** `lib/__tests__/static-integrity.test.ts` — read `./out/**/*.html` post-build, assert internal links resolve, external links have `rel="noopener noreferrer"`. Flag to Morgan: this test requires `npm run build` first, so it's not part of the normal `vitest run` suite — needs a separate `npm run test:static` script or a pre-test build hook.

---

*— Sam, 2026-05-25 (BACKGROUND mode — no external sends)*
