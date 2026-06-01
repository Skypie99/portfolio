# Morgan Briefing — Portfolio P0 Fix Plan + Hero Scroll Feature Ask
**Date:** 2026-05-29  
**Mode:** Direct /morgan (iMessage send authorized)  
**Triggered by:** Sky direct session — build audit + feature ask  
**model_tier:** Sonnet

```yaml
coherence_score: 0.97
state_consistency: pass
duplicate_work_detected: no
drift_risk: low
```

---

## §1 Dependency Graph

**nodes:**
- `rory/fix-duplicate-workflow#step-1` (Rory, delete nextjs.yml — 5 min)
- `rory/fix-ci-build-cache#step-1` (Rory, verify .next cache in GH Actions — 10 min)
- `peter/fix-metadatabase#step-1` (Peter, correct OG/canonical siteUrl — 10 min)
- `shamus/fix-projectcard-links#step-1` (Shamus, raw `<a>` → `<Link>` in ProjectCard — 15 min)
- `shamus/fix-appmockup-pacman#step-1` (Shamus, add pacman-code-trainer frame to AppMockup — 20 min)
- `sky/badge-images#step-1` (Sky, provide 6 certificate badge PNGs — MISSING INPUT)
- `gary/p0-validation#step-1` (Gary, full test suite + static-integrity extension — after all above)
- `morgan/merge-p0-wave#step-1` (Morgan, gate + merge wave to main)
- `sky/hero-scroll-decision#step-1` (Sky, approve hero scroll animation feature — DECISION_FOR_SKY)
- `dani/hero-scroll-spec#step-1` (Dani, design spec for scroll-parallax hero — LOCKED on Sky decision)
- `shamus/hero-scroll-impl#step-1` (Shamus, implement scroll animation — LOCKED on Dani spec)
- `alex/hero-scroll-a11y#step-1` (Alex, reduced-motion validation — LOCKED on Shamus impl)

**edges:**
- `rory/fix-duplicate-workflow#step-1` → `gary/p0-validation#step-1` (gate: single deploy workflow)
- `rory/fix-ci-build-cache#step-1` → `morgan/merge-p0-wave#step-1` (gate: CI cache confirmed before merge)
- `peter/fix-metadatabase#step-1` → `gary/p0-validation#step-1` (gate: OG domain corrected)
- `shamus/fix-projectcard-links#step-1` → `gary/p0-validation#step-1` (gate: P0 link fix complete)
- `shamus/fix-appmockup-pacman#step-1` → `gary/p0-validation#step-1` (gate: blank mockup resolved)
- `sky/badge-images#step-1` → `gary/p0-validation#step-1` (gate: badge PNGs on disk)
- `gary/p0-validation#step-1` → `morgan/merge-p0-wave#step-1` (gate: 108+ tests pass, static-integrity clean)
- `sky/hero-scroll-decision#step-1` → `dani/hero-scroll-spec#step-1` (gate: Sky approval)
- `dani/hero-scroll-spec#step-1` → `shamus/hero-scroll-impl#step-1` (gate: Design Compiler PASS)
- `shamus/hero-scroll-impl#step-1` → `alex/hero-scroll-a11y#step-1` (gate: prefers-reduced-motion compliance)

---

## §2 Reason for Ordering

- **Rory first on duplicate workflow:** Two `.github/workflows/` files (`deploy.yml` + `nextjs.yml`) both trigger on push to `main` — race condition risk on every deploy. Cheapest/safest fix, no code touch. (Source: `2026-05-29_OvernightAudit_Opus48.md §6a`)
- **Rory + build cache:** First clean-`.next` build fails with ENOENT `500.html` rename in Next.js 15.5.18 static export. GH Actions may or may not cache `.next/` — must confirm before next live push. (Source: direct build audit this session)
- **Shamus P0 fixes parallelizable with Peter:** ProjectCard link fix and OG/metadataBase fix are fully independent files. Both must land before Gary validates. (Source: `FEATURES.md P0 section`)
- **AppMockup + Design Compiler:** Adding a new mockup frame for `pacman-code-trainer` is a visual change. Dani Design Compiler gate required per Const. Art. 2.4 before merge. Shamus proposes; compiler runs post-implementation.
- **Badge PNGs are a Sky dependency:** Six cert badges are missing from disk. No agent can fabricate real credential logos. This is the only item that blocks Gary gate and requires Sky action. (Source: `2026-05-29_OvernightAudit_Opus48.md §6a bug #3`)
- **Hero scroll is Phase 2+ / Sky decision:** Framer Motion scroll animation on the hero is a new feature, not a fix. Dani must spec it (token-safe, entropy-controlled) before Shamus touches the hero section. Alex must validate prefers-reduced-motion before merge. Jordan not triggered (no PII/location/auth). (ASSUMPTION: hero animation uses only existing Framer Motion dependency already in package.json)

---

## §3 Blocked Nodes

- `{node: sky/badge-images#step-1, why: Real badge PNG files for 6 certificates don't exist on disk — Zod schema accepts path shape but doesn't check file existence; certs page shows 6 broken images in production, type: MISSING_INPUT, unblock: Sky drops actual PNGs into public/images/certificates/<slug>/badge.png}`
- `{node: sky/hero-scroll-decision#step-1, why: New interactive feature — parallax/scroll-reveal hero requires Sky approval before Dani specs it, type: DECISION_FOR_SKY, unblock: Sky says yes/no + rough direction (e.g. "parallax only" vs "full entrance sequence")}`
- `{node: dani/hero-scroll-spec#step-1, why: Locked on Sky decision above, type: BLOCKER, unblock: sky/hero-scroll-decision resolves}`

---

## §4 Checkpoint References

- `{name: phase2-ui-merge, role: Shamus/Rory/Gary, artifact: commit:11c69ae, qa-report: 2026-05-29_Rory_MergeWave_phase2ui.md:1}`
- `{name: blog-infra-merge, role: Will/Rory, artifact: commit:102c97c, qa-report: 2026-05-29_Will_BlogInfrastructure.md:1}`
- `{name: overnight-audit, role: Opus48, artifact: branch:main#audit-only, qa-report: 2026-05-29_OvernightAudit_Opus48.md:1}`
- `{name: phase1-complete, role: All/Morgan, artifact: commit:a925090, qa-report: qa-reports/INDEX.md:Phase1}`

---

## §5 Duplication Report

No duplications detected this cycle. Rory owns workflow/CI, Peter owns meta, Shamus owns component fixes, Gary owns validation — no overlap.

---

## §6 State Snapshot

**main:** `11c69ae` — phase2-ui merge (2026-05-29)  
**Live:** https://skypie99.github.io/portfolio/ (GitHub Pages)  
**Tests:** 108/108 (last confirmed pre-this-session)  
**Build:** First-clean FAIL (ENOENT 500.html); warm PASS — needs CI cache verification  
**TypeScript:** CLEAN  
**Open remote branches:** `feat/blog-infrastructure-2026-05-30`, `perf/auto-2026-05-28-peter`  
**P0 blockers on live site:** 5 (ProjectCard links, metadataBase, duplicate workflow, missing badge PNGs, pacman AppMockup)  
**Active decisions for Sky:** badge PNGs (MISSING INPUT), hero scroll (DECISION_FOR_SKY)

---

## §7 Execution Plan Summary

**Phase A — P0 Fixes (parallel, ~30 min total):**
- READY: `rory/fix-duplicate-workflow` + `rory/fix-ci-build-cache` (independent)
- READY: `peter/fix-metadatabase` (independent)
- READY: `shamus/fix-projectcard-links` + `shamus/fix-appmockup-pacman` (independent of Peter/Rory, Design Compiler on AppMockup variant)
- LOCKED: `sky/badge-images` (MISSING INPUT — Sky action required)

**Phase B — Validation + Merge (~15 min):**
- READY after Phase A (minus badge PNGs): `gary/p0-validation`
- READY after Gary + CI-cache confirmed: `morgan/merge-p0-wave`
- Badge PNG items merge as separate wave when Sky provides files

**Phase C — Hero Scroll (future, pending Sky):**
- LOCKED: `dani/hero-scroll-spec` → `shamus/hero-scroll-impl` → `alex/hero-scroll-a11y`
- Estimated: 1–2 days design + 1 day implementation once approved

**Critical path:** rory/workflow → shamus/links → gary/validation → merge (~35 min if badge PNGs excluded)  
**Parallelizable:** All Phase A nodes run concurrently  
**acyclic: true** ✓
