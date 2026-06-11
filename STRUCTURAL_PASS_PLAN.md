# STRUCTURAL_PASS_PLAN — structural/portfolio-links-rename-2026-06-10

Phase-0 findings for the structural pass: certificate verify links (+3 additions),
LinkedIn correction, "Correspond" → "Let's talk" rename, five mechanical honesty
fixes, and the world-backdrop hairline. Every change located and verified against
current source (main = `8f94da4`) before editing. No copywriting — every visible
string is supplied.

## Intro baseline (off-limits set — must stay byte-identical to main)

- Pathset: `components/CinematicIntro.tsx`, `components/cinematic/`, `public/images/cinematic/`, `cinematic-masters/`
- `git diff main -- <pathset>` at branch start: **empty** ✓
- Blob hash `components/CinematicIntro.tsx` @ main: `6fafe087311f72db22604acab99c90add95e16c1` ✓
- Locked globals.css range: cinematic block lines 1438–end (`.cdesert-*`, `.cin-*`); also `--font-cormorant`, `--sidebar-w`, cinema tokens. World-backdrop CSS (lines 624–1067) is OUTSIDE the lock → editable.
- Lint baseline on fresh branch: **0 errors, 0 warnings** (only next-lint deprecation + workspace-root notices, non-ESLint).

## Section A — Certificate verify links (content/certificates.json, data-only)

All rendering already correct (`CredentialBadge.tsx:70-81`, `app/page.tsx:394-403` —
`<a>` + target/rel + aria). No JSX changes.

| Cert (exact `title` match) | Action |
|---|---|
| AI Fluency Framework & Foundations | URL → `https://verify.skilljar.com/c/ef3fxd6rptc5` |
| Introduction to Claude Cowork | URL → `https://verify.skilljar.com/c/rgnu9r9tyfoj` |
| Claude 101 | URL → `https://verify.skilljar.com/c/9twktanftgpq` |
| Google Prompting Essentials Specialization | verify only — already exact match, no change |
| Programming for Everybody (Getting Started with Python) | URL → `…/accomplishments/records/LNNCK1O38M7U` |
| AI For Everyone | URL → `https://www.coursera.org/account/accomplishments/records/5Z1UGVB7BO2N` |

**3 additions** (inserted after Claude 101, existing relative order unchanged):

| id | title | issued | credentialId / URL |
|---|---|---|---|
| `anthropic-mcp-intro-2026` | Introduction to Model Context Protocol | 2026-06-01 | `397oybawccv4` / `https://verify.skilljar.com/c/397oybawccv4` |
| `anthropic-claude-code-in-action-2026` | Claude Code in Action | 2026-05-01 | `ad8ot95z543s` / `https://verify.skilljar.com/c/ad8ot95z543s` |
| `anthropic-claude-code-101-2026` | Claude Code 101 | 2026-05-01 | `cxrwvg7sz5w6` / `https://verify.skilljar.com/c/cxrwvg7sz5w6` |

- Alt text formula: "Anthropic <title> credential badge". Tags mechanical, non-rendered.
- Badge artwork: Dani designs 3 PNGs matching hand-drawn ink line-art style
  (references: `anthropic-claude-101-2026/badge.png` 500×500, `anthropic-ai-fluency-2026/badge.png` 500×500).
  Saved to `public/images/certificates/<slug>/badge.png` — required by both
  `CertificateSchema` (lib/schema.ts:118) and `scripts/validate-assets.mjs` (prebuild).
- Existing badge dims: 4× 500×500, 1× 680×680, 1× 1000×1000 → new badges at 500×500 (matches both references).
- Surfaces grow automatically 6 → 9 (certificates grid + homepage Credentials list) — flagged.
- Issuer strings stay as-is (table's "(Coursera)" suffixes are identification metadata) — flagged.
- No test asserts cert counts (only `length > 0` + per-entry schema) → gate-safe.

## Section B — LinkedIn + link sweep

| File:line | Current → New |
|---|---|
| `content/profile.json:16` | `https://www.linkedin.com/in/sky-halisky/` → `https://www.linkedin.com/in/skyler-halisky` |
| `content/profile.json:15` | handle `sky-halisky` → `skyler-halisky` (renders as contact-page link text; mechanical consistency — flagged) |
| `app/layout.tsx:146` | JSON-LD `sameAs` → same supplied URL |

profile.json feeds Footer ELSEWHERE (`Footer.tsx:149`) and contact page
(`app/contact/page.tsx:88-97`) — one edit fixes both. Sweep: HEAD/GET every
external link (GitHub, mailto label match, 6 project GitHub + 6 demo links).
Fix only label-vs-destination mismatches (flag each); flag non-resolvers
WITHOUT changing them.

## Section C — "Correspond" → "Let's talk" (6 locations, IDs stable)

| Location | Edit |
|---|---|
| `components/SidebarSectionNav.tsx:43` | `label: 'Correspond'` → `label: "Let's talk"` (real apostrophe) |
| `components/HamburgerNav.tsx:32` | same |
| `app/page.tsx:440` | JSX eyebrow → `Let&apos;s talk` |
| `app/contact/page.tsx:38` | JSX eyebrow → `Let&apos;s talk` |
| `components/Footer.tsx:118` | SITE-column link text → `Let&apos;s talk` |
| `components/__tests__/SidebarSectionNav.test.tsx:32,54` | LABELS array + `getByRole` name → `"Let's talk"` |

`id: 'contact'`, all `/#contact` hrefs, `aria-label="On this page"` untouched.
Casing from parents' `uppercase` utilities — no hardcoded casing. Repo grep
confirms exactly these 6 code instances (FINAL_POLISH_PLAN.md mentions are
historical docs, untouched). Post-build: grep `out/` → 0 user-visible hits.

## Section D — Mechanical honesty fixes

- **D-1** `content/deliverables.json` (Prompt Library tech array, line 183): `"Vercel"` → `"GitHub Pages"`.
- **D-2** same file line 227 (body): delete `Fifty features shipped. ` → "…favorites, bulk import/export, and dark mode. Zero backend. Deployed as a static site…" — flagged.
- **D-3** `app/about/page.tsx:186-187`: delete sentence `Mutual Mesh is built the same way.` → flagged before→after.
- **D-4** `content/case-studies.md` (non-rendered, zero imports): line 90 `End-to-end encrypted Expo app.` → `Privacy-first Expo app.`; line 101 `E2E encryption enables…` → `Privacy-first design enables the requests that platforms would suppress` (Sky-approved smoothing) — flagged.
- **D-5** `node-version: 20` → `24` in `.github/workflows/deploy.yml:52` AND `ci.yml:38,50,62,75` (Sky approved both). YAML syntax-verified. Local gates already run Node v24.15.0.

NOT touched (future-pass log): og-image.svg redesign; About "command-line trainer"
prose (+ de-emphasize-About question); work/page.tsx "slowly, documented honestly"
echo; orphaned `.hero-status-ping`; Dashboard in About "Right now" list.

## Section E — Hairline (diagnose, then soften — Sky-approved)

Prime suspect: `.world-horizon`, `app/globals.css:1041-1050` — 1px line, `top: 60%`,
inside `position: fixed` `.world-backdrop` (z -1). Opacity
`clamp(0.12, calc(1 - --day-night), 1)`, gradient `rgb(--sky-sun/0.4)` 24%–76%.
In editable world range, NOT locked territory.

Order: (1) reproduce on dev server — both themes, 375/768/1280, top/mid/bottom
scroll, screenshot + y-position; (2) identify via `display:none` toggle; (3) if
confirmed → soften: contained edit to its rule only (opacity cap ≈ 0.35 and/or
gradient alpha 0.4 → ≈ 0.22), tuned live; if locked territory → NO fix, proposal
to DECISIONS FOR SKY; (4) verify both themes/3 widths/3 scroll positions,
before/after screenshots, `--day-night-rest` fallback intact; (5) if
irreproducible → document, zero speculative changes.

## Execution order (commit per section, gates after each)

0. ✓ Branch off `8f94da4`, intro pathset verified, lint baseline captured.
1. This plan (commit 1).
2. Section A: certificates.json + Dani badges → gates.
3. Section B: profile.json + layout.tsx → gates.
4. Section C: rename ×6 → gates.
5. Section D: D-1…D-5 → gates.
6. Section E: reproduce → soften → screenshot-verify → gates.
7. Final: `npm run test:static` (full build) → built-output sweeps → report commit.

Gates per commit: `npm run lint` (0 errors, warnings ≤ baseline 0) ·
`npm run typecheck` · `npm test`. Report →
`summaries/2026-06-10_Portfolio_StructuralPass_Report.md`. No merge — main is Sky's gate.
