# Steve — Cycle 4 / 5 / 6 Security Pass

**Project:** Portfolio (Next.js 15.5.18 static export → GH Pages)
**Branch:** read-only review; no edits, no commits
**Date:** 2026-05-23
**Reviewer:** Steve (Safety Engineer)
**Scope:** Shamus's C4+C5+C6 additions —
`app/work/page.tsx`, `app/work/[slug]/page.tsx`, `app/certificates/page.tsx`,
`app/about/page.tsx`, `app/contact/page.tsx`, `components/ProjectCard.tsx`,
`lib/content.ts`, `content/deliverables.json`, `content/certificates.json`.

---

## TL;DR

**Overall risk: LOW.** Clean pass — no new sinks, no regressions, and the C2/C3 P0 (Next.js CVE cluster) is **already resolved**: `next` is now `15.5.18` (was `15.1.4`). The C4+C5+C6 code itself introduces zero new attack surface — every external `<a>` is `noopener noreferrer`, every URL is Zod-validated to `https://`, every dynamic route slug is a whitelist lookup (not a filesystem path), and no user input crosses any trust boundary because the entire site renders at build time.

**Audit delta vs C2 baseline:**

| Severity | C2 (next@15.1.4) | C4-6 (next@15.5.18) | Δ |
|---|---|---|---|
| CRITICAL | 1 | **0** | -1 |
| HIGH | (8+ rolled up) | **0** | -8 |
| MODERATE | 1 (`postcss`) | 1 (`postcss`) | 0 |
| LOW / INFO | 0 | 0 | 0 |
| **Total advisories** | 26 | **2** | **-24** |

The one residual moderate (`postcss` GHSA-qx2v-qp2m-jg93, CSS-stringify XSS) is **build-time only**, transitive via `next`, and the `fix available via --force` path downgrades `next` to 9.3.3 — far worse than the residual. Hold.

---

## Top 3 findings

1. **C2 P0 is closed.** `next@15.5.18` clears the critical RCE (GHSA-9qr9-h5gf-34mp) and the critical middleware-auth-bypass (GHSA-f82v-jwr5-mffw) plus all eight high-sev CVEs from the C2 list. Verified at `node_modules/next/package.json` = `15.5.18`. Strong result.
2. **`/work/[slug]` is path-traversal-safe by design.** `params.slug` is used solely as a **whitelist lookup** (`getDeliverables().find((x) => x.id === params.slug)`) against an in-memory array loaded from a hard-coded JSON filename. Every `id` was already validated by `SlugSchema` (`/^[a-z0-9][a-z0-9-]*[a-z0-9]$/` — no slashes, no dots, no `..`). And under `output: 'export'`, `generateStaticParams()` enumerates exactly the valid slugs at build time; any URL that doesn't match a built file is a 404 served by GH Pages, never a runtime lookup. Three independent layers of defense — no vector.
3. **Every external `<a target="_blank">` carries `rel="noopener noreferrer"` plus sr-only "(opens in new tab)".** Confirmed at `app/work/[slug]/page.tsx:163-172` (deliverable links), `app/certificates/page.tsx:116-122` (credential links), `app/contact/page.tsx:80-87` (socials). Zero misses. (The mailto CTAs on `/about`, `/contact`, `/work/[slug]` don't open in new tab — correct, no `rel` needed.)

## Anchor / `rel` audit

**Zero anchors missing `rel="noopener noreferrer"`.** Grep across all C4-6 files for `target="_blank"` returned 3 hits, all properly attributed. No bare `target="_blank"`, no `rel="noopener"` alone (which leaves `noreferrer` off and leaks `Referer`).

## Path-traversal in `[slug]`

**No risk.** As above — `params.slug` never touches `readFileSync` / `join` / `fs`. `lib/content.ts` `readJson` still takes only the 3 hard-coded filenames it took in C2 (`profile.json`, `deliverables.json`, `certificates.json`), unchanged this cycle.

## Other checks (all CLEAN)

`dangerouslySetInnerHTML`: 0 hits. `eval(`: 0. `new Function(`: 0. `innerHTML =`: 0. `document.write`: 0. Plain `http://` in source or content: 0 (all socials + credentialUrls `https://`, Zod-enforced). Hard-coded secrets/keys/tokens: 0. `process.env.*` in C4-6 files: 0 (only `next.config.mjs` still reads `NODE_ENV`, unchanged from C2). `.env*` committed: still none.

**Content note (not security):** `content/certificates.json` `credentialUrl` values all point to `https://example.com/credentials/...` placeholders. Safe (valid HTTPS, won't render harmful pages), but Quinn/Sky will want real URLs before launch. Flagging for awareness — not Steve's lane.

---

## Fix priority

- **P0:** none. The pre-existing P0 (`next` CVE cluster) is already resolved.
- **P1:** none net-new. The C2 P1 (add meta-tag CSP in `app/layout.tsx`) is still open from the prior pass — no change in scope this cycle. Refer to C2 §6 P1.
- **P2:** none net-new. The C2 P2 items (constrain `readJson` filename type, consider host migration, dep-pin posture) all unchanged.

---

## Constraints honored

READ-ONLY. No edits, no commits, no installs, no `--force`, no external sends. Reviewed files listed at top. No write to `main`. Per Const. Art. 9, Morgan surfaces — Steve does not message Sky.

---

*End of report. Morgan: nothing new for the Decisions queue this cycle. The C2 P1 CSP item is still pending Sky's go-ahead — see C2 report §7 Decision B.*
