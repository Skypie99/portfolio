# Cycle 14 — Gary's ESLint flat-config plan + Steve's audit re-run

**Cycle:** 14 of 15 in cycle/auto-2026-05-23 self-improving build run
**Authors:** Gary (QA), Steve (Safety)
**Status:** Plans + audit findings — no code shipped this cycle

---

## Part A — Gary: ESLint flat-config migration plan

### Why this exists

Next 16 deprecates `next lint`. The current `package.json` script:

```json
"lint": "next lint"
```

will print a deprecation warning the moment Sky bumps from 15.5.18 → 16.x. The replacement is the standalone ESLint CLI with a flat-config file (`eslint.config.js`).

This plan documents the migration so Sky can pull the trigger in one focused cycle — instead of letting it tangle with whatever Next 16 brings.

### Current state (Cycle 14 snapshot)

- `next lint` runs ESLint 8.x with `eslint-config-next` and `eslint-plugin-jsx-a11y` in legacy `.eslintrc` mode
- No `.eslintrc.*` file in the repo — config is implicit via `eslint-config-next` defaults baked into `next lint`
- Lint passes 0/0 today

### Migration steps (when Sky is ready, before Next 16 bump)

1. **Run Next's codemod** (it handles the heavy lifting):
   ```bash
   npx @next/codemod@canary next-lint-to-eslint-cli .
   ```
   This generates `eslint.config.js` with the right `flat-config` shape and updates `package.json` to use the standalone CLI.

2. **Verify the generated config includes:**
   - `eslint-config-next/core-web-vitals` (the Next-recommended rule set)
   - `eslint-plugin-jsx-a11y` (the a11y plugin)
   - `parserOptions.project: './tsconfig.json'` (so type-aware rules work)
   - `ignores: ['.next', 'out', 'node_modules']`

3. **Update the lint script:**
   ```json
   "lint": "eslint ."
   ```

4. **Smoke-test:** `npm run lint` should produce the same output as before (0/0 today).

5. **Catch likely regressions:**
   - jsx-a11y in flat config sometimes needs `parserOptions.ecmaFeatures.jsx: true` explicitly — codemod usually adds it; verify
   - The deprecated `@next/next/no-img-element` rule may need to migrate to a different syntax for the eslint-disable comments scattered through ProjectCard, certificates, and detail page

### Rollback

If the migration produces unexpected lint failures:
1. `git revert <migration commit>`
2. Stay on `next lint` until Next 16 forces the issue
3. Lint is the only consumer; no downstream tooling depends on the config file

### Dependencies to add

```bash
npm install --save-dev eslint@latest @eslint/eslintrc
```

ESLint 9.x ships flat-config natively. `@eslint/eslintrc` is the compat shim for the (now-deprecated) plugins that haven't migrated yet — `eslint-plugin-jsx-a11y` might need it.

### Recommended timing

Ship in the cycle BEFORE Sky bumps Next to 16.x. Bundling the lint migration WITH a Next major-bump means two simultaneous changes touching the lint surface — diagnose-by-bisect becomes hard.

### DECISION FOR SKY

**Do not ship this migration in the current orchestrator run.** Migrating ESLint config touches CI semantics and may surface previously-silent lint findings that block builds. That's a Sky-supervised cycle, not an autonomous one.

---

## Part B — Steve: audit re-run + introduced-risk check

### npm audit (production deps only)

```
$ npm audit --omit=dev
postcss <8.5.10 — Severity: moderate
  XSS via Unescaped </style> in CSS Stringify Output
  Transitive: next 15.5.18 → postcss
  Fix path: npm audit fix --force → downgrades next to 9.3.3 (rejected)

2 moderate severity vulnerabilities  (same root: postcss inside Next pipeline)
```

**Delta vs cycle 4-6 baseline (`2026-05-23_Steve_C4-6_security.md`):**
- 0 critical (unchanged)
- 0 high (unchanged)
- 2 moderate (unchanged — both transitive postcss inside Next's build pipeline)

**Why not fix:**
- The only `npm audit fix --force` path downgrades `next` to 9.3.3, which loses App Router and every feature shipped 2026-05-23 (loss of all 12 routes, hamburger nav, all components)
- postcss does NOT run at runtime on GH Pages — output is pre-built static CSS
- Re-evaluate when Next 15.6+ ships with a patched transitive

**Recommendation:** **continue to accept** (NEW-3 from cycle 4-6 demo briefing still stands). Documented in `qa-reports/2026-05-23_Steve_C4-6_security.md` and `qa-reports/cycle-2026-05-23-demo.md`.

### Dev-deps audit (informational)

```
$ npm audit  →  8 moderate severity vulnerabilities
```

The 6 additional dev-only advisories are inside `vitest`/`vite`/`eslint`/`jsdom` transitives. Build-time / test-time only; never reach the production bundle. Same accept rationale.

### Introduced-risk check — cycles 1-13 of this 15-loop run

I grepped the working tree for the four classic React/Next security smells. All clean.

| Pattern | Cycle 4-6 baseline | Cycle 14 re-check | Delta |
|---|---|---|---|
| `dangerouslySetInnerHTML` | 0 | 0 | 0 |
| `eval(` | 0 | 0 | 0 |
| `http://` URLs in source | 0 | 0 | 0 |
| Hardcoded API keys / secrets / tokens | 0 | 0 | 0 |

Additional spot-checks against new code from this run:

- **Cycle 4 scroll-driven animation** — pure CSS, no JS hooks, no data
- **Cycle 10 hero scroll-fade** — same; pure CSS animation-timeline
- **Cycle 12 meta-CSP** — adds defense-in-depth, doesn't widen any surface. Verified the `<meta http-equiv="Content-Security-Policy">` lands in every static HTML file by grep on `out/index.html` and `out/about/index.html`
- **Cycle 11 cn() extension** — touches build-time string formatting only; no runtime exec, no eval, no template-string interpolation of user input

`new Date()` appears in two places — Footer year auto-update (intentional, ships only this year's number) and its matching test. Neither is a security concern.

### Net-new findings: NONE

No new advisories, no new dangerous-API uses, no new secrets, no new http://. The 15-loop run is **safer** than the baseline because Cycle 12 added a CSP layer that didn't exist before.

### Recommendation

Continue with cycle 15 final sweep. No safety blockers.

---

## Combined sign-off

- **Gary:** ESLint flat-config plan filed. Migration deferred until Sky decides (recommended timing: just before the Next 16 bump). No code change this cycle.
- **Steve:** Audit re-run shows no security delta from the 13 prior cycles. CSP shipped Cycle 12 is the only net-new security artifact, and it strengthens posture. **Risk LOW**, same as cycle 4-6 baseline.

Gates at end of cycle 14: lint **0/0** · typecheck **0** · test **31/31** · build **clean** · audit prod **2 moderate** (accepted, NEW-3) · audit dev **8 moderate** (build-time only, accepted).

---

*Gary + Steve, 2026-05-23 — joint qa-report for cycle 14 of the cycle/auto-2026-05-23 15-loop run.*
