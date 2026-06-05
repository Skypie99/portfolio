# Portfolio — feature & fix backlog

The next things to fix/build, ordered by value vs. cost. One line per item —
flesh it out when you (or an agent) picks it up. This file is the source of
truth for what to do next; remove items once they land on `main`.

This site is **live** (https://skypistudio.com) and push-to-`main`
deploys instantly with no staging gate — so P0 items affect production now.

---

## Audit follow-ups — Opus 4.8 overnight (2026-05-29)

Sourced from `qa-reports/2026-05-29_OvernightAudit_Opus48.md` (24 verified bugs +
35 arch findings). Full triage in
`~/AccessMap/qa-reports/cycle-2026-05-29-morgan-audit-followup.md`.

### P0 — live-site blockers (Rory deploy + Shamus links/assets)
- **`ProjectCard` uses raw `<a>` → internal links 404 under the production basePath.** Switch to `next/link`.
- **`metadataBase` points at the wrong GitHub Pages domain** → broken OG/canonical tags.
- **Two GH Pages deploy workflows both trigger on push to `main`** — dedupe to one.
- **All certificate badge images are missing from disk** → every certificate renders a broken image in production.
- **`AppMockup` renders nothing for the `pacman-code-trainer` deliverable** — blank mockup well on its card.

### P1 — should-fix
- 404 page "back to homepage" Button links to GH Pages root, not the portfolio.
- Homepage assumes `deliverables[0]` is the featured project (sort coincidence, not the `featured` flag).
- `/work/[slug]` types params as a sync object — diverges from Next 15.5's `Promise<params>` contract.
- A future-dated blog post is published and shown as if already live.
- `parseInline` mis-parses stray asterisks into spurious `<em>`; bold/italic inside `##`/`###` headings render as literal asterisks.
- Dead components (`CaseStudyCard`, `CredentialBadge`, `FilterPill`) + orphaned `case-studies.md` — wire up or delete.
- Agent-count drift (14 vs 15 vs 18) across hero / About / Claude-Corp copy — pick one source of truth.

### P2 — tech-debt (later)
- Tailwind spacing-scale override silently shadows default utilities; `cn.ts` hand-mirrors `tailwind.config.ts` (drift risk); inline `style=` usage violates the Tailwind-only convention; `AppMockup` injects duplicate global `@keyframes` per card instance; loaders re-read + re-validate JSON on every call (memoize); `ProjectCard` root is a non-focusable `<div>` carrying `focus-visible` classes that can never fire.

---

## Conventions
- Tailwind only — no inline `style=`. TypeScript strict, no `any`.
- Use `next/link` + relative paths; never hardcode the `/portfolio` basePath.
- `npm run typecheck && npm test && npm run build` before declaring done.
- Exactly one deliverable may be `featured: true`.
