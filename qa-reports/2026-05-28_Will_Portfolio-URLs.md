# Will — Portfolio Feature Status & Canonical URL Audit
**Date:** 2026-05-28  
**Role:** Will (Technical Documentation & Learnings)  
**Project:** Portfolio  
**Task:** FEATURES.md update + canonical URL sweep  

---

## Summary

Completed two tasks:

1. **FEATURES.md update** — Updated the backlog document to reflect the wave5 completion status. All P0 (required for launch) and P1 (required for "complete" v1) items are now shipped. Documented each wave's output: Waves 1–3 delivered core features (hero, sidebar, nav, work index, detail pages, certificates, about, contact, footer); Wave 4 added design polish (warm palette, alternating rhythm); Wave 5 added creative finishes (homepage polish, terracotta accents, scroll indicator, hero eyebrow animation).

2. **Canonical URL fix** — Found and corrected a hardcoded GitHub username in two files:
   - **`app/layout.tsx` line 64**: Changed `siteUrl` from `https://skypie99.github.io/portfolio` to `https://skylerhalisky.github.io/portfolio`
   - **`docs/DEPLOY_PLAN.md`**: Updated 4 occurrences of the same username in documentation and checklist examples.

Both fixes are committed on branch `will/portfolio-features-2026-05-28`.

---

## Findings

### URL Issues Identified

| File | Line(s) | Issue | Fix Applied |
|------|---------|-------|------------|
| `app/layout.tsx` | 64 | Hardcoded GitHub username `skypie99` instead of `skylerhalisky` | ✅ Corrected |
| `docs/DEPLOY_PLAN.md` | 7, 170, 260, 261, 329 | Same username inconsistency in reference patterns + deployment checklists | ✅ Corrected (4 replacements) |

**No development URLs found** — No hardcoded `localhost:3000`, `localhost:3001`, or other development domains detected in source code, components, or configuration.

**Sitemap status** — No sitemap.xml exists yet; this is a follow-up item for future cycles if needed. Not blocking v1 launch.

**Meta tags** — Canonical URL is correctly set in `app/layout.tsx` via `metadataBase` (line 69) and Open Graph `url` (line 73), both now pointing to the correct production domain.

---

## FEATURES.md Changes

Updated `/Users/skypie/Portfolio/docs/FEATURES.md`:

1. **Header section** — Refreshed project metadata:
   - Status changed from "Initial backlog — no items shipped yet" to "v1 feature-complete — all P0 items shipped; P1 items complete; P2 (Journal) deferred"
   - Last updated date set to 2026-05-28 (Wave 5 completion)

2. **New "Shipped features (by wave)" section** — Added documentation of what shipped in each wave:
   - Waves 1–3: All 9 P0 + P1 features (hero, sidebar, nav, work, detail, certificates, about, contact, footer)
   - Wave 4: Design polish (warm palette, rhythm)
   - Wave 5: Creative finishes (homepage polish, terracotta card accents, scroll indicator, hero animation)

3. **Updated backlog table** — Replaced "priority/size" table with a status tracker showing:
   - F-01 through F-08, F-10: ✅ SHIPPED
   - F-09 (Journal): 🔄 DEFERRED (pending Sky decision)

---

## Verification

- ✅ `npm run typecheck` passes (no type errors)
- ✅ All changes on `will/portfolio-features-2026-05-28` branch (not on `main`)
- ✅ No credentials or secrets touched
- ✅ No destructive changes
- ✅ No external network calls or side effects

---

## Files Modified

- `/Users/skypie/Portfolio/docs/FEATURES.md` — Status update + shipped features documentation
- `/Users/skypie/Portfolio/app/layout.tsx` — Corrected canonical URL in metadata
- `/Users/skypie/Portfolio/docs/DEPLOY_PLAN.md` — Corrected GitHub username references (4 replacements)

---

## Next steps

1. Sky reviews and merges the branch to `main` (per Constitution, only Sky merges to main).
2. When Portfolio repo is pushed to GitHub, GitHub Pages will serve the site at the now-corrected URL: `https://skylerhalisky.github.io/portfolio/`

---

*Will, 2026-05-28 — feature audit + URL sweep complete.*
