# Cycle Plan — 2026-05-23 (Day-0 Kickoff)

**Project:** AI Portfolio Website
**Cycle branch:** `cycle/auto-2026-05-23`
**Mode:** Kickoff planning ONLY. No production code this cycle.
**Authored by:** Morgan (per orchestrator Phase 0)
**Authority:** Sky's intent > CONSTITUTION v1.3 > role files > skills

---

## Survey (Day-0 reality check)

- No existing codebase. Brand-new repo at `~/Portfolio/`.
- Initial branch is `cycle/auto-2026-05-23` — `main` is intentionally unborn so Sky owns its creation.
- No FEATURES.md, LEARNINGS.md, or prior qa-reports yet — every artifact this cycle is the FIRST of its kind.
- Sky-provided brief: ffern.co-inspired warm minimalism; "bright and interactive" portfolio for AI deliverables + certificates.
- Proposed defaults (Sky to ratify when reviewing): location `~/Portfolio`, stack Next.js 15 static export, deploy GitHub Pages, content placeholders for now.

## Dependency graph (this cycle)

```
Wave 1 (parallel — independent specs/docs):
  Quinn    → docs/FEATURES.md
  Dani     → docs/PROJECT_DESIGN.md  + designs/home-hero-mockup.md
  Riley    → docs/PERSONAS.md
  Rory     → docs/DEPLOY_PLAN.md

Wave 2 (parallel — depend on Wave 1):
  Dana     → docs/DATA_SHAPE.md            (needs Quinn's features)
  Shamus   → docs/SCAFFOLDING_PLAN.md      (needs Quinn + Dani)
  Alex     → docs/ACCESSIBILITY.md         (needs Dani's tokens)

Wave 3 (sequential — wrap-up):
  Will     → README.md + docs/LEARNINGS.md skeleton
  Morgan   → qa-reports/cycle-2026-05-23.md  (compiled briefing for Sky)
```

## Roles deliberately skipped this cycle

| Role | Why skipped |
| --- | --- |
| Peter (Performance) | No code to profile yet |
| Gary (QA) | No code to test yet — Gary returns next cycle to scaffold CI alongside Shamus's first build |
| Steve (Security) | No surface to harden yet — runs in final safety sweep next cycle once code lands |
| Casey (Community) | Portfolio is a 1-person showcase, not a community surface |
| Jordan (Privacy) | No PII / user data on a portfolio site (contact form decision deferred) |

## Hard constraints (Constitution v1.3)

- **Art. 1:** No commits to `main`. Sky merges. All work stays on the cycle branch.
- **Art. 5:** No live deploys, no external side effects (no actual GitHub Pages push, no DNS).
- **Art. 7:** Safety / privacy / accessibility are non-negotiable pillars — Alex's findings are blocking for any token Dani proposes.
- **Art. 9:** Only Morgan messages Sky. All other roles write to their artifact files; Morgan's briefing aggregates.

## Decisions deferred to Sky (preview — Morgan will restate in briefing)

1. Confirm location `~/Portfolio` (done — repo exists here, easy to relocate if wrong).
2. Confirm tech stack (Next.js 15 static export proposed).
3. Confirm deploy target (GitHub Pages proposed).
4. Provide actual list of AI deliverables + certificates to populate the portfolio (placeholders this cycle).
5. Decide on contact form (privacy implication — Jordan would re-engage if yes).
6. Decide on whether to enable the optional Journal/Blog section in Quinn's backlog.
