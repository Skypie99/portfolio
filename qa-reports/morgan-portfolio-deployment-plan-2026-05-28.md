# PORTFOLIO DEPLOYMENT PLAN — UI Polish + Certs + Deploy
**Date:** 2026-05-28  
**Mode:** Morgan autonomous execution (CLEAR gate — portfolio improvements, no blockers)  
**Authority:** Morgan coordination + agent dispatch  
**Target:** Deploy single-scroll homepage with certificates + OG meta by EOD 2026-05-28

---

## EXECUTION PHASES

### PHASE 1 — Content + Test + Meta (PARALLEL, starts NOW)
**Timeline:** 20 min (can overlap with Dani design work)

| Agent | Task | Scope | Deadline |
|---|---|---|---|
| **Will** | Credential URLs + Pac-Man add | Replace 5 `example.com` → real links; add Pac-Man to deliverables.json | 10 min |
| **Casey** | About page expansion | Remove duplicate; add 2–3 original paragraphs distinct from homepage | 5 min |
| **Gary** | Test validation (gaps 2 & 3) | Ensure 40/40 tests green post-content-merge; validate internal/external link rel attrs | 5 min |
| **Peter** | OG + Twitter meta tags | Add title, description, image to layout.tsx; improves social share preview | 5 min |

### PHASE 2 — Design Polish (CRITICAL PATH, starts NOW)
**Timeline:** 5 min  
**Gate:** Unblocks PHASE 3 (Shamus UI work)

| Agent | Task | Scope | Deadline |
|---|---|---|---|
| **Dani** | Design token finalization | Finalize `design/portfolio-creative-polish-2026-05-27` branch tokens; mobile wordmark treatment; card design system. Merge to main. | 5 min |

**UNBLOCK SIGNAL:** Once Dani merges, Shamus starts immediately.

### PHASE 3 — UI Implementation (BLOCKED on Phase 2, ~10 min after Dani)
**Timeline:** 10 min  
**Scope:** Single-scroll homepage + certificates section

| Agent | Task | Scope | Deadline |
|---|---|---|---|
| **Shamus** | Single-scroll + certificates UI | Implement `feature/single-scroll-2026-05-24` branch changes:<br/>• Rewrite app/page.tsx (6 anchored sections: hero, work, process, about, **certificates**, contact)<br/>• Update HamburgerNav.tsx (anchor links to #work, #certificates, #about, #contact)<br/>• Merge 3 UI branches: dani-warmth, homepage-polish, card-upgrade<br/>• Place "Sky Halisky" mobile wordmark in hamburger header<br/>• Add GitHub vs. external link icons (16px SVG) on project cards<br/>• Hero image placeholder → AccessMap screenshot or mockup<br/>• Certificates section: call getCertificates(), render as stacked list (title, issuer, date) | 10 min |

### PHASE 4 — Final Merge + Deploy (Sky only)
**Timeline:** 5 min  
**Gate:** All Phase 1/2/3 agents complete

| Agent | Task | Scope | Deadline |
|---|---|---|---|
| **Sky** | Merge wave + redeploy verify | After all agents complete:<br/>1. Merge all 12 branches to main in dependency order<br/>2. Verify GitHub Pages CI triggers (deploy.yml)<br/>3. Check live at https://skypie99.github.io/portfolio/<br/>4. Verify: no lint, 40+/40 tests, zero 404s, hero images rendering, certificates visible | 5 min |

---

## TOTAL EXECUTION TIME

**Best case (all parallel + no delays):** ~20 min wall-clock
- Phases 1 + 2 overlap (both 20 min max)
- Phase 3 starts ~5 min after Phase 2 begins
- Phase 4 is final 5 min after Phase 3

**EOD Timeline:**
- 13:30 UTC — Dispatch Phase 1 + 2 (Will, Casey, Gary, Peter, Dani)
- 13:50 UTC — Dani finishes; Shamus starts (Phase 3)
- 14:00 UTC — Shamus finishes; all tests green
- 14:05 UTC — Sky merges + deploys; verifies live redeploy
- **14:10 UTC — PORTFOLIO LIVE with certificates + single-scroll + OG meta**

---

## CERTIFICATES STATUS

**Current:** `lib/content.ts` exports `getCertificates()` with 5 entries (data defined, function ready)  
**Design:** Single-scroll homepage includes certificates section (lines 335-339 in plan)  
**Implementation:** Shamus wires section into `app/page.tsx` (Phase 3)  
**Live:** Once Shamus merges + Sky deploys (Phase 4)

---

## DEPENDENCIES & GATES

✅ No Constitutional blockers (no RLS, no auth, no privacy data beyond Sky's existing bio)  
✅ No external approvals needed (all agents are coordinators with domain autonomy)  
✅ All 12 branches are ready and merged-testable  
✅ CI is green on main  

---

## RISK MITIGATION

| Risk | Mitigation |
|---|---|
| Dani design delay | Shamus can start with existing tokens if Dani's branch isn't final; Shamus re-merges once Dani done (low impact) |
| Gary tests fail post-merge | Gary's job is to catch this; if 40/40 fail, stop Phase 4 and surface to Sky |
| Shamus UI takes longer than 10 min | Acceptable — Phase 4 (Sky merge) still happens EOD; just slides to 14:15 UTC |
| GitHub Pages deploy fails | CI will show error; Sky verifies and fixes; manual re-trigger available |

---

## SIGN-OFF

**Morgan:** Portfolio is ready. All agents are assigned. Phase 1 + 2 dispatch NOW. Certificates will be live EOD 2026-05-28 as part of single-scroll redesign. Zero blockers. Execute.

**Next action:** Invoke Dani (design) + Will (content) + Casey (copy) + Gary (tests) + Peter (meta) in parallel. Once Dani merges → invoke Shamus.

---
