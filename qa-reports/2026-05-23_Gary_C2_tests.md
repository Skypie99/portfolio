# Gary (QA) Report — 2026-05-23 — Cycle 2 Test Infrastructure

## 1. DECISIONS FOR SKY

None. Everything in this report is reversible and dormant until Sky pushes to GitHub. The CI workflow file (`.github/workflows/ci.yml`) is on disk only — it does not run, deploy, or contact any external system until a push reaches the GitHub remote and a PR opens against `main` (or a `cycle/*` branch push lands there).

## 2. BLOCKERS / FAIL_FAST

None.

One soft note worth surfacing during the run (not a blocker): `npm install` reports 8 vulnerabilities (7 moderate, 1 critical) from transitive deps. Did not run `npm audit fix --force` — that would be a `main`-touching change and the breaking-version flag means it should go through Steve next cycle. See §6 Tests/CI finding for the recommendation.

## 3. Summary

Wired the Portfolio repo with a real test safety net: Vitest + React Testing Library + jest-dom, an `eslint-plugin-jsx-a11y` extension on top of `next/core-web-vitals`, two smoke tests (HamburgerNav + Sidebar) covering 6 assertions, and a dormant `.github/workflows/ci.yml` that gates lint + typecheck + test + build on PRs and `cycle/*` pushes. All four gates green locally. `jsx-a11y/recommended` surfaced zero new violations against Shamus's components — Alex's spec held up.

## 4. What Shipped (Checkpoints)

All changes on branch `qa/auto-2026-05-23` (off `cycle/auto-2026-05-23`). Not merged.

- `package.json` — added `eslint-plugin-jsx-a11y@^6.10.2`, `vitest@^2.1.8`, `@vitest/ui@^2.1.8`, `@vitejs/plugin-react@^4.3.4`, `@testing-library/react@^16.1.0`, `@testing-library/user-event@^14.5.2`, `@testing-library/jest-dom@^6.6.3`, `jsdom@^25.0.1`. Scripts: `test` → `vitest run` (CI-safe), added `test:watch` and `test:ui`.
- `.eslintrc.json` — extended to `["next/core-web-vitals", "plugin:jsx-a11y/recommended"]` with the `jsx-a11y` plugin declared.
- `vitest.config.ts` (new) — jsdom env, React plugin, `@/*` path alias mirroring `tsconfig`, setupFiles → `vitest.setup.ts`, include pattern `**/__tests__/**/*.test.{ts,tsx}`.
- `vitest.setup.ts` (new) — imports `@testing-library/jest-dom/vitest` so accessibility matchers (toBeInTheDocument, toHaveAttribute, toHaveFocus) are global.
- `components/__tests__/HamburgerNav.test.tsx` (new) — 3 tests: renders trigger collapsed, click toggles `aria-expanded`, Escape closes + returns focus to trigger. Mocks `next/navigation` (no App Router in jsdom) and `framer-motion` (deterministic, ref-forwarded `motion.div` shim).
- `components/__tests__/Sidebar.test.tsx` (new) — 3 tests: wordmark links to `/`, featured deliverable title renders, navigation landmark has accessible name. Mocks `@/lib/content` to avoid filesystem reads.
- `.github/workflows/ci.yml` (new) — dormant. Jobs: lint, typecheck, test, build (build depends on the other three). Node 20 LTS, npm cache, cancel-in-progress concurrency by ref. **No deploy job — Rory owns `deploy.yml`.**

## 5. What's Proposed (Not Applied)

| Proposal | File path | What it does | Impact | Rollback documented? |
|---|---|---|---|---|
| CI workflow | `.github/workflows/ci.yml` | Runs lint+typecheck+test+build on PRs to `main` and pushes to `cycle/**` | Dormant until push to GitHub remote; first PR after that will gate on green CI | Yes — delete the file |
| Test scripts | `package.json` (`test`, `test:watch`, `test:ui`) | Local dev + CI test entry points | Already in use; `test` is what CI invokes | Yes — revert `package.json` |
| Lint extension | `.eslintrc.json` adds `plugin:jsx-a11y/recommended` | Catches a11y regressions before review | None today (zero violations); future PRs will be gated | Yes — revert one line |

## 6. Findings by Domain

### Tests / CI (Gary)

- 🟢 **Test count: 6 passing / 0 failing across 2 files.** Both smoke tests pass cleanly with no React warnings (initial run had a "Function components cannot be given refs" warning from a naive `framer-motion` mock; fixed by switching the mock to `forwardRef`).
- 🟢 **`jsx-a11y/recommended`: zero new violations** across all components (Sidebar, HamburgerNav, Hero, Footer, Button, NumberedStep, SkipLink) and the App Router pages. Alex's spec and Shamus's implementation are tight.
- 🟢 **Build remains green** with the new test infra installed and configured.
- 🟡 **`npm install` reports 8 vulnerabilities (7 moderate, 1 critical)** in transitive deps. `npm audit fix --force` flags breaking changes — recommend Steve do a hardening pass next cycle. Not blocking; not exploitable from a static-export Next.js site at build time, but worth tracking.
- 🟡 **Typecheck via `npm run typecheck` does not surface failures reliably when `tsconfig.tsbuildinfo` is stale.** During this run, a real test-file type error (TS2769 in HamburgerNav.test.tsx) was hidden by incremental cache and only surfaced after `rm tsconfig.tsbuildinfo && npx tsc --noEmit`. Fix was straightforward (refactored `createElement` call); but the CI workflow runs in a fresh sandbox each time, so this won't bite there. Local dev: recommend Sky run `rm tsconfig.tsbuildinfo` before manual typecheck if something feels off.
- 🟢 **CI workflow concurrency-cancels in-flight runs** on the same ref so a fast-follow-up commit doesn't queue behind a stale one. Permissions scoped to `contents: read` (no write tokens granted).

### Accessibility (Alex) — handoff back

- 🟢 No `jsx-a11y` rule violations to surface. Alex's spec held up against the implementation. Nothing to action.

## 7. How to Review

```bash
# See everything I changed
git diff cycle/auto-2026-05-23..qa/auto-2026-05-23

# Run all four gates locally (in order)
cd ~/Portfolio
npm install                # picks up the new devDeps
npm run lint               # next + jsx-a11y; expect "No ESLint warnings or errors"
npm run typecheck          # tsc --noEmit; expect exit 0
npm run test               # vitest run; expect "Tests 6 passed (6)"
npm run build              # next build; expect "✓ Compiled successfully"

# Watch tests live
npm run test:watch

# Inspect the dormant CI workflow before it ships
cat .github/workflows/ci.yml
```

## 8. Next Recommended Action

Merge `qa/auto-2026-05-23` → `cycle/auto-2026-05-23` so the rest of the cycle's work runs against the test net. Then in Cycle 3:

1. Have Steve do a `npm audit` pass on the vulnerabilities (especially the critical one).
2. Have Rory write `deploy.yml` alongside the existing `ci.yml`.
3. Set per-feature coverage targets for new components: each new component shipped by Shamus gets at least one render-and-a11y smoke test before merge (target: 80% line coverage on `lib/`, render-and-a11y smoke for every interactive component). I did not enforce a coverage threshold in `vitest.config.ts` yet — adding `coverage: { thresholds: { lines: 70 } }` is a Cycle 4 thing once we have enough tests for it to be meaningful.
4. Add a `lib/__tests__/` directory next cycle — `lib/content.ts` and `lib/schema.ts` are pure-logic and very testable (Zod schema invariants like "exactly 0 or 1 featured deliverable" are exactly the kind of contract a test should pin down).
