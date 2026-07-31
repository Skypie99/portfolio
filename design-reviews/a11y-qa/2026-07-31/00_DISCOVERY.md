# A11Y DEEP QA — PHASE A — STEP 0 DISCOVERY (banked)

**Train:** THE A11Y DEEP QA + FIX TRAIN · first run for this project (no prior a11y-qa/ predecessor — self-ledger starts here)
**Target:** ~/Portfolio — Next.js 15 static export (`output: 'export'`) → GitHub Pages, live at https://skypistudio.com
**Fired:** 2026-07-31 · Phase A only (standalone — STOPS after banking)
**Model provenance:** `[Fable]` — Claude Fable 5, max effort (per train spec). No switches so far.

## Ground truth (verified, not assumed)

- `main == origin/main == 38b94db` — "fix(art): the verify-fleet's two catches". Deploy run for `38b94db` = **SUCCESS** (gh run list) and the live homepage carries the `008cf93` "AI Builder" marker → **live site == HEAD**. Rendered evidence gathered on the live site is evidence about current main.
- Working tree: only `DECISIONS_LOG.md` + `PROJECT_STATE.md` modified (Morgan's uncommitted state refreshes — FROZEN, not mine); `design-reviews/`, `qa-reports/`, `summaries/`, `TASK_GRAPH.json`, `headshot-source.jpeg` untracked docs. **No code files differ from HEAD** → local build == deployed build.
- PROJECT_STATE.md is stale (compiled 07-16, says `544dc1b`): the R4 build train has since landed on main (log shows R4/BP8 P05 receipt-OG, T9 RM-line fill in Sky's words, AI Builder identity, film gold pass, clockwork motion pass, MOTION_SYSTEM §15). Audit target = actual HEAD, not the state file's memory.

## Stack (flips the toolkit → web)

Next.js 15 App Router static export · React 18 · TypeScript strict · Tailwind 3 · GSAP + framer-motion (cinematic intro) · next-themes (light + dark) · Zod content validation · Vitest + Testing Library · `eslint-plugin-jsx-a11y`. No backend, no auth. GH Pages: **runtime headers are NOT applied** (next.config headers() = documentation only), but a **meta CSP is live in the HTML**: `default-src 'self'; script-src 'self' 'unsafe-inline'; …` → axe injection must be **inline source** (CDN script-src would be blocked). `axe-core` present in node_modules (transitive) — inject `axe.min.js` text directly.

## Gates that exist (floors, not verdicts)

- `npm run lint` — includes `eslint-plugin-jsx-a11y`
- `npm run typecheck` — tsc strict
- `npm test` — vitest (~293+ tests incl. dedicated a11y-flavored suites: SkipLink, RailInert, HamburgerNav, A11yReceipts, TagPill, ViewTransitions…)
- `npm run test:static` — build + static-integrity (links, images, JSON)
- Zod schema enforces **alt-text law** (Alex §4.1): 4–200 chars, must not start with "image of/picture of/photo of" — presence+shape enforced at build; **quality is not** (Lens 8's job).
- No axe gate in-repo. Automated baseline = lint + my live-site axe runs.

## House floors (stricter than bare WCAG — these govern)

- **Touch targets ≥ 44px** (UI_SYSTEM.md: "Touch targets ≥44px"; Button h-14 ≥44px). SC 2.5.8's 24px stays the Blocker floor; 24–44 band tiered honestly per context (dense desktop web ≠ auto-fail).
- **Focus:** 2px terracotta ring, 2px offset, consistent, `:focus-visible` (UI_SYSTEM.md §Focus ring).
- **RM contract (MOTION_SYSTEM.md §6):** `prefers-reduced-motion: reduce` → the **final resting state**, never a suppressed affordance; CSS patterns gated by media queries both directions; JS via `usePrefersReducedMotion()` early-return; `useParallax` writes no transform under RM; every pattern in §§7–15 declares its RM column. This contract is the audit bar for Lens 6.
- **AA in both modes** (UI_SYSTEM.md: verified contrast pass light ≥9.7:1 body / ≥4.5:1 small-meta; dark ≥5.2:1) — prior contrast work is CLOSED baseline; Lens 4 re-measures current HEAD (post-R4 gold pass!) rather than re-litigating.
- Era Codex rails exist (`~/ClaudeCorp/design-reviews/era-codex/`, GT/SE/SF + F1–F9) — referenced, never re-authored.

## Themes

**light + dark** via next-themes (ThemeProvider/ThemeToggle). Every rendered check runs in BOTH. (Project CLAUDE.md's "No theme system yet" is stale — verified against deps + components.)

## PROTECT list (byte-respect in Phase B; Phase A reads only)

- `components/cinematic/**` — the desert intro. **PROTECTED, read-only** (project CLAUDE.md; every prior train verified `git diff -- components/cinematic` EMPTY).
- The R4 landed art surfaces (gilded wordmark ink, film gold, clockwork pass) are Sky-ratified craft — findings there need the mockup gate in Phase B, never silent edits.
- 3 placeholders were live post-R3 (T7 TKTK test count on /work/accessmap/ · T9 RM bracket line on /accessibility/ · T18 humans.txt header); **T9 has since been filled by Sky (`781cbca`)**. T7/T18 status verified during lenses — placeholders are Sky-owned; not audit defects, but claims-lens relevant.

## Prior-audit baseline (ledger-aware; re-finding these = a defect of THIS audit)

- **CLOSED:** dark-AA floor pass (uplift P0-A 07-03) · hover/focus parity sweep (06-18) · focus-ring comment fix (06-17) · tagpill contrast (a11y/tagpill branch, merged era) · skip link (SkipLink + test) · RM contract build-out through MOTION_SYSTEM §15 · alt-text schema law · `38b94db` itself fixed a double-announcement (gilded ink ::after in the AX tree) + widened @supports alt-text-syntax gate.
- **Sky-skipped, permanently rests:** A0/R3-D2 pre-fix leg (A-03 MEDIUM-on-outcome — do not re-open).
- **Known open (not mine to re-find as new):** R3-D5 device session (Sky's hands) · C-44 copy · register fork.

## THE IN-FLIGHT SEAM (declared at fire time)

**"The project card samples."** `grep -ri sample` across app/components/content/lib finds only Mutual Mesh demo-data copy — the samples work is **not in the tree yet** (or lives in another window). Seam defined generously:

> **IN-FLIGHT SURFACES:** `components/ProjectCard.tsx`, `components/CardField.tsx`, `components/TactileMedia.tsx` (as consumed by cards), the card grid regions of `/` and `/work/`, and the `deliverables.json` card-facing media fields.

Phase A audits these **read-only, findings tagged PROVISIONAL** (the surface is moving). Phase B NEVER touches them until Sky says landed → those fixes queue as **AWAITING-LANDING** in the close-out.

## Claims census — sources enumerated (Lens 9 verifies each)

1. `/accessibility/` page (app/accessibility/page.tsx + A11yReceipts + CalibrationRecord + receipts JSON artifact)
2. Per-project copy in `deliverables.json` (e.g., Mutual Mesh "WCAG 2.2 AA accessibility"; AccessMap claims; T7 test-count zone)
3. `/colophon/` + humans.txt (T18 zone)
4. README.md claims
5. Hero/identity claims ("AI Builder", counts: "six built, five live" — Sky-ratified decision `[five-live-six-shown]`)
6. OG receipt surface (R4/BP8: "sharing the accessibility page deposits the receipt")

## Rendered-audit rig

- Live site https://skypistudio.com (== HEAD) via the in-app browser; themes via next-themes toggle (and `resize_window colorScheme` for prefers-color-scheme default behavior); 320px reflow via viewport resize; axe injected inline from `node_modules/axe-core/axe.min.js` (meta-CSP-compatible).
- Local `out/` rebuild for whole-site static greps (headings, landmarks, alt corpus) — generated artifact, safe to regenerate; source == HEAD.
- Contrast: computed from token values + live computed styles — **measured, never eyeballed**; honest tags on every finding: `programmatic` / `rendered` / `NEEDS-SKY-DEVICE`.

## Page inventory (routes to walk)

`/` · `/work/` · `/work/[slug]/` ×6 (accessmap, claude-corp, dashboard, prompt-library, ghost-code, mutual-mesh — slugs verified in Lens 2) · `/about/` · `/certificates/` · `/contact/` · `/accessibility/` · `/colophon/` · `/blog/` + posts · 404 (`/not-found`) · non-HTML: feed.xml, feed.json, sitemap, humans.txt, receipts JSON.

## Output convention

Everything banks to `design-reviews/a11y-qa/2026-07-31/` (this dir): per-lens files `01_lens1…` in run order 1 → 2 → 3 → 7 → 9 → 4 → 5 → 6 → 8, `MASTER_TABLE.md`, `DEVICE_SCRIPT.md`, `HANDOFF.md` updated at every bank. Nothing committed — untracked docs, zero tracked-file edits, zero pushes. Phase A ends: report + STOP.
