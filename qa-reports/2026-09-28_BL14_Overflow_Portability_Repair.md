# BL-14 overflow-census portability repair (2026-09-28)

Bounded maintenance fix for **BL-14**: make `scripts/overflow-census.mjs`
runnable from a normal fresh clone, without an untracked helper and without a
machine-specific Chromium path.

| Field | Value |
|---|---|
| Prompt ID | `PORTFOLIO-BL14-OVERFLOW-PORTABILITY-20260928-V1` |
| Owner | Sky |
| Branch | `codex/portfolio-bl14-overflow-portability-20260928` |
| Baseline SHA | `b57dbf69d23cee7b11af2b9dbfa41de9717997dd` |
| Scope | BL-14 only (overflow-census portability) |
| Remote actions | none (no push, no merge, no deploy) |

## Root cause

Two blockers, both confirmed by reading the source at the baseline (not assumed):

1. **Untracked static-server dependency.** `scripts/overflow-census.mjs`
   spawned `design-reviews/showcase-refresh/tools/static-serve.mjs` (line 205 at
   the baseline). `git ls-files design-reviews/showcase-refresh/tools/` returns
   nothing: the file is untracked and absent from a fresh clone. It existed only
   as a stray file in Sky's primary checkout under `/Users/skypie/Portfolio/`.
   In a clean checkout the spawn fails and the run dies with
   `[overflow] static fixture never came up.` (exit 2).
2. **macOS-only Chromium resolution.** `resolveChromium()` scanned only
   `path.join(process.env.HOME, 'Library/Caches/ms-playwright')` with macOS
   `chrome-mac-arm64` / `chrome-mac` bundle paths. On any other OS, or with
   `$HOME` unset, it returned `null` and the script exited 2. It also ignored
   `PLAYWRIGHT_BROWSERS_PATH` and the repo's existing
   `PLAYWRIGHT_CHROMIUM_EXECUTABLE` convention.

Neither is an application defect; both are provisioning/tooling. Per the source
triage they were promoted from "environment-blocked" to `READY_TO_IMPLEMENT`
because a tracked substitute pattern already existed in-repo.

## Files changed

| File | Change |
|---|---|
| `scripts/static-serve.mjs` | **New, tracked.** Dependency-free Node `http` loopback static server; the tracked replacement for the untracked helper. |
| `scripts/overflow-census.mjs` | Portable Chromium resolution, tracked server, ephemeral port handshake, guaranteed teardown, honest fail-closed messages, empty-width/empty-route guards. |
| `scripts/README.md` | Helper row added; "known limits" replaced with the accurate fresh-clone setup. |
| `qa-reports/2026-09-28_BL14_Overflow_Portability_Repair.md` | This receipt. |
| `qa-reports/INDEX.md` | Regenerated (repository rule: the QA index tracks `qa-reports/` files). |

## Exact portability repair

**Static server (`scripts/static-serve.mjs`).** A ~110-line Node-`http` server
cloned from the proven Node design already used across the repo (it deliberately
avoids `python3 -m http.server`, which `design-reviews/guards/2026-08-01/GUARD-LEDGER.md`
records as dropping sockets under Playwright churn). It uses only Node builtins,
so `node` is the sole prerequisite:

- binds `127.0.0.1`; serves `<dir>` (default `out/`) on `<port>` (default 3005);
- `node scripts/static-serve.mjs <dir> [port]`;
- symlink-aware containment (`fs.realpathSync` compared against the served root)
  so a link inside `out/` cannot expose a file outside it;
- stream `'error'` handling so an unreadable file fails one response, never the
  process;
- clean `SIGTERM`/`SIGINT` shutdown (`server.close()` with a bounded fallback);
- useful failure messages: missing directory → exit 1; `EADDRINUSE` → exit 1
  with a hint naming `OVERFLOW_PORT`. Prints the bound
  `http://127.0.0.1:<port>` URL on ready.

**Browser resolution (`scripts/overflow-census.mjs`).** `resolveChromium()` now
resolves, in order:

1. `chromium.executablePath()` — playwright-core's own resolver, cross-platform
   and honouring `PLAYWRIGHT_BROWSERS_PATH`; returned only if `fs.existsSync`
   (it returns the expected path even when the browser is not downloaded);
2. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` — the repo's documented cross-machine
   override, already used by `scripts/verify-intro-focus.cjs`;
3. the legacy macOS Playwright-cache scan, now built with `os.homedir()`
   (no unguarded `process.env.HOME`).

If all three miss, the script fails closed with install instructions
(`npx playwright-core install chromium`, plus the `--with-deps` and
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` alternatives). No owner-machine path literal
remains anywhere in the changed files.

**Lifecycle.** The census now spawns the tracked helper and reads the actually
bound URL back from its stdout; the default port is `0` (OS-assigned), so a
stray listener can never be mistaken for our fixture (with `OVERFLOW_PORT` to
pin one). Teardown is guaranteed by a `try/finally` **and** a
`SIGINT`/`SIGTERM` handler, so no run — including a Ctrl-C or a mid-run throw —
orphans the listener.

## Fresh-clone contract

After the repository's documented setup (`README.md` Quick start: Node 24 +
`npm ci`), the overflow census needs one extra, explicitly documented step — a
browser download — and nothing else:

```bash
npm ci
npm run build
npx playwright-core install chromium      # once per machine; version-matched
npm run check:overflow                    # exit 0 clean, 1 real overflow, 2 no fixture
```

`npx playwright-core install chromium` uses the locally installed
`playwright-core` (declared in `devDependencies`, lock-pinned to 1.62.1), whose
`browsers.json` pins the same Chromium revision that `chromium.executablePath()`
resolves to. If the browser is absent the script fails closed with that exact
instruction rather than a stack trace. The census remains a local/pre-merge gate
and is intentionally **not** wired into CI (CI installs no browser).

## Validation run

All commands run in the BL-14 worktree. Dependencies were supplied by linking the
primary checkout's installed `node_modules` (the lock-pinned `playwright-core`
1.62.1) — no network install — and `out/` was produced by a real
`npm run build`.

| Check | Result |
|---|---|
| `git rev-parse HEAD` == baseline | PASS |
| Working tree clean at start | PASS |
| `git diff --check` | PASS (clean) |
| `node --check scripts/static-serve.mjs`, `node --check scripts/overflow-census.mjs` | PASS |
| No `static-serve` ref to the untracked path in the census | PASS |
| No `/Users/...` literal; no unguarded `process.env.HOME` | PASS |
| Helper: serve 200 + correct content-types, dir→index.html, 404 | PASS |
| Helper: symlink escape → 403; unreadable file → one failed response, server stays up | PASS |
| Helper: missing dir → exit 1; `EADDRINUSE` → exit 1 + `OVERFLOW_PORT` hint | PASS |
| Helper: clean `SIGTERM`/`SIGINT` shutdown, port released | PASS |
| Census: detection — a planted 150 vw element → exit 1 | PASS |
| Census: clean build → exit 0; non-vacuity plant caught 100/100 frames | PASS |
| Census: `--widths abc` / `--widths 0` → exit 2 (no vacuous clean pass) | PASS |
| Census: pinned `OVERFLOW_PORT` collision → exit 2, helper stderr surfaced | PASS |
| Census: stray listener on a fixed port is **not** reused (ephemeral default) | PASS |
| Census: Ctrl-C mid-run → exit 130, no orphaned listener | PASS |
| Fail closed: no browser (fake home + empty browsers path) → exit 2, actionable | PASS |
| Fail closed: `playwright-core` missing → exit 2, actionable | PASS |
| Fail closed: no `out/` → exit 2, "run `npm run build`" | PASS |
| `npm run lint` (next lint) | PASS — no warnings or errors |
| `npm run typecheck` (`tsc --noEmit`) | PASS |
| `npm test` (vitest, against the real build) | PASS — 107 files, 949 passed, 2 skipped |
| `npm run build` then `npm run check:overflow` (the contract) | PASS — 25 routes × 2 themes × 2 widths, 100/100 non-vacuity, exit 0 |
| Stray `static-serve` processes after runs | none |

### Unavailable validation

None material. The full Next build and the census on all real routes were both
executed, so this is `FULL_RUNTIME_VALIDATION_AVAILABLE`. CI deliberately does
not install Chromium, so the census cannot be a CI gate by design; that is the
documented posture, not an unvalidated gap. No browser was downloaded for this
run (the machine already had one resolvable via `chromium.executablePath()`).

## Independent cross-check

**USED** — MiMo Flash (`opencode/mimo-v2.6-flash-free`), read-only, on the
narrow changed surface. It independently re-derived all six portability claims
from file:line evidence and reproduced its own harness runs. Verdict:
`CROSSCHECK_PASS`. Its findings and disposition:

- B1 misleading diagnostic when the helper is up but `GET /` 404s → **fixed**
  (now reports "listening … but GET / never returned 200").
- B2 pre-existing silent pass on an empty `--widths` list → **fixed** (exit 2).
- B3 helper crashed on an unreadable file (no stream `'error'` handler) →
  **fixed**.
- B4 symlink escape from the served directory → **fixed** (realpath containment).
- B5 new helper untracked → **resolved by this commit**.
- B6 four dated `design-reviews/luxe-audit/...` tools still spawn the old
  untracked helper (no npm script references them) → **out of scope**, per
  mission §6 (do not modify unrelated dated evidence).
- B7/B8 theoretical spawn-error and chunk-split diagnostics → **fixed**
  (child `'error'` handler; stdout accumulated before matching).

## Ultra-speed escalation

**0.** The portability design and process lifecycle were resolved with direct
evidence and empirical runs; no escalated question was needed.

## Final candidate

Single local commit on `codex/portfolio-bl14-overflow-portability-20260928`
whose parent is the baseline `b57dbf69d23cee7b11af2b9dbfa41de9717997dd`. This
receipt is part of that commit, so its SHA is the commit itself
(`git rev-parse HEAD` after the commit). No amend, no push, no merge,
`main` untouched.
