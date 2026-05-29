---
report: morgan-phase-2-4-strategic-roadmap
date: 2026-05-28
model_tier: sonnet
invocation: direct /morgan (Morgan's strategic planning)
coherence_score: 0.94
state_consistency: pass
duplicate_work_detected: no
drift_risk: low
---

# Portfolio Phase 2-4 Strategic Roadmap

**Window:** Post-Phase-1 (shipping 2026-05-29), synthesis of Dani (design) + Will (content) + Morgan (PM).

---

## ═══ FIVE-SECTION SPINE ═══

### §1 Dependency Graph

**nodes:**
- dani/phase-2-design (Dani, design component tokens + mockups)
- will/phase-2-case-studies (Will + Sky, narrative drafts + edits)
- shamus/phase-2-ui-build (Shamus, implement component elevation + filtering)
- gary/phase-2-tests (Gary, validate new components + accessibility)
- peter/phase-2-perf (Peter, profile scroll-trigger animations)
- will/phase-3-blog-infrastructure (Will, /journal route + schema setup)
- sky/phase-2-case-study-content (Sky, write case study narratives)
- dani/phase-3-optional-polish (Dani, optional cert timeline + carousel)
- will/phase-3-blog-content (Will + Sky, blog posts + editorial)
- sky/phase-4-dark-mode-decision (Sky, decide if dark mode in scope)
- dani/phase-4-dark-mode-tokens (Dani, if approved: full token duplication)
- shamus/phase-4-dark-mode-ui (Shamus, if approved: implement dark mode)

**edges:**
- dani/phase-2-design → shamus/phase-2-ui-build (gate: mockups + token specs)
- will/phase-2-case-studies → gary/phase-2-tests (gate: alt text + markup ready)
- shamus/phase-2-ui-build → peter/phase-2-perf (gate: animation code ready for profiling)
- peter/phase-2-perf → gary/phase-2-tests (gate: performance regression confirmed none)
- sky/phase-2-case-study-content → will/phase-2-case-studies (gate: narratives drafted)
- will/phase-2-case-studies → shamus/phase-2-ui-build (gate: copy finalized for case study page layout)
- will/phase-3-blog-infrastructure → will/phase-3-blog-content (gate: routes + schema deployed)
- sky/phase-4-dark-mode-decision → dani/phase-4-dark-mode-tokens (gate: Sky approval)
- dani/phase-4-dark-mode-tokens → shamus/phase-4-dark-mode-ui (gate: tokens validated by Alex)

---

### §2 Reason for Ordering

- **Phase 2 ships first (lowest dependencies, highest ROI).** Design tokens + case study narratives are parallel-path and unlock all downstream work. LEARNINGS: Portfolio Phase 1 established momentum; merging Phase 2 feature-complete before Phase 3 exploratory scope keeps quality high (`LEARNINGS:2026-05-23 — Merge-on-done > stacking branches`).

- **Dani's component tokens precede Shamus.** Phase 2 design (card elevation, filtering UI, animations) must be mockup-validated + token-defined before code, not after. This enforces the design-first discipline (Const. Art. 2.2).

- **Case studies depend on Sky's narrative drafts.** Will can't structure copy without content. Sky writes problem/process/outcome per phase-2 strategy; Will edits for voice + accessibility + alt text.

- **Animation profiling (Peter) closes Phase 2 QA.** Scroll-trigger reveals + card hovers need perf validation before shipping. Peter measures Core Web Vitals impact (LCP, CLS, FID) on production builds.

- **Phase 3 is feature-locked pending decisions.** Blog infrastructure is conditional on Sky's Phase 3 approval. If yes, Will sets up /journal routes + BlogPosting schema in parallel with Phase 2 shipping, then phases Phase 3 content cadence (1–2 posts/month).

- **Phase 4 dark mode is purely optional.** If Sky doesn't approve, the roadmap stops at Phase 3. If approved, dark mode adds 5–7 days of token + UI work (Dani + Shamus + Alex coordination). Not critical path.

- **Dani's optional polish loop (cert timeline, carousel).** Phase 3 adds interactivity only if design + content bandwidth allows. Lower priority than blog content or dark mode.

---

### §3 Blocked Nodes

- `{node: shamus/phase-2-ui-build, why: Awaiting dani/phase-2-design mockups + token specs, unblock: Dani completes component elevation + filtering UI mockups (~2–3 days from Phase 1 ship), type: GATE}`
- `{node: will/phase-2-case-studies, why: Awaiting sky/phase-2-case-study-content (Sky writes narrative drafts), unblock: Sky completes 5 case study drafts (problem/process/outcome per phase 2 content strategy), type: GATE}`
- `{node: gary/phase-2-tests, why: Awaiting shamus/phase-2-ui-build completion (component code must exist to test), unblock: Shamus ships Phase 2 UI branch, type: GATE}`
- `{node: sky/phase-4-dark-mode-decision, why: No unblock condition; Sky decision only, type: DECISION_FOR_SKY}`
- `{node: will/phase-3-blog-infrastructure, why: Conditional on Sky's Phase 3 approval (if blog not in scope, delete node), unblock: Sky confirms blog cadence commitment + phase-3 timeline, type: DECISION_FOR_SKY}`

---

### §4 Checkpoint References

- `{name: phase-1-complete, role: morgan + sky, artifact: merged-to-main branch:main commit:[latest] 2026-05-29, qa-report: ~/Portfolio/PROJECT_STATE.md}`
- `{name: dani-design-vision, role: dani, artifact: qa-report:2026-05-28_Dani_Vision_Input.md, checkpoint: design-tokens + component mockups ready for Phase 2}`
- `{name: will-content-strategy, role: will, artifact: qa-report:2026-05-28_Will_Content_Strategy.md, checkpoint: case study narrative framework + blog strategy defined}`
- `{name: phase-2-ui-ready, role: shamus, artifact: branch:feat/phase-2-components-2026-05-29 (pending dani/design gate), qa-report: qa-reports/[TBD]_Shamus_Phase2_UI_BUILD.md}`
- `{name: phase-2-tests-pass, role: gary, artifact: branch:feat/phase-2-components-2026-05-29 (pending shamus completion), qa-report: qa-reports/[TBD]_Gary_Phase2_Tests.md}`

---

### §5 Duplication Report

No duplications detected. Dani + Will coordinated asynchronously; no overlapping scope.

---

## ═══ PHASE BREAKDOWN ═══

### Phase 2: Foundation + Case Studies (2–3 weeks post-Phase-1)

**Scope:**
- Dani: Design token evolution (component elevation system, filtering UI, animations, alt-text accessibility)
- Shamus: Implement card hover states, category filtering, scroll-triggered reveals
- Will + Sky: 5 full case studies (problem/process/outcome per project) with OG metadata
- Gary: Test new components, validate WCAG 2.2 AA on new hover states
- Peter: Profile scroll animations; ensure no CLS/LCP regression

**Milestones:**
- Week 1: Dani completes mockups + tokens; Sky delivers case study drafts
- Week 2: Shamus builds Phase 2 UI; Will edits case studies for voice + accessibility
- Week 3: Gary tests; Peter profiles; merge to main (pending Sky final review)

**Deliverables:**
- 5 case studies at `/work/[slug]/case-study` with full narratives
- Project card elevation hover states + peach-cream background shift
- Category filtering UI (pill-based, smooth content swap)
- Scroll-triggered section reveals (fade-in + Y-translate)
- Updated component library docs

**Effort estimate:** 15–18 days total effort (Dani 3, Shamus 4, Will 4, Sky 3, Gary 2, Peter 1)

**Success criteria:**
- All 5 case studies live + linkable
- Zero WCAG contrast failures (Alex validates)
- Core Web Vitals: no LCP/CLS regression from Phase 1
- 40/40 tests passing (Gary's Phase 2 suite)

---

### Phase 3: Blog Infrastructure + Content (optional, contingent on Sky approval)

**Scope:**
- Will: /journal route setup, BlogPosting schema, content-editor guidelines
- Sky: 2–3 pilot blog posts (project reflections, learning notes)
- Will: Copy edit + publication workflow
- Dani (optional): Polish loop on cert display (timeline view, badge animations)

**Milestones:**
- Week 1: Will sets up routes + schema (runs parallel with Phase 2 shipping if approved early)
- Week 2–4: Sky + Will iterate on 2–3 posts; publish as ready
- Ongoing: 1–2 posts/month cadence

**Deliverables:**
- /journal index + individual post pages
- BlogPosting structured data (OG tags, schema.org)
- Content-editor template (Sky reference for writing)
- Optional: cert timeline variant (Dani) + badge animations

**Effort estimate:** 8–10 days setup (Will 3–4, Sky 3–4, Dani 2 if polish loop runs)

**Success criteria:**
- Blog routes deployed + OG meta tested
- 2–3 pilot posts published with full metadata
- Dani polish loop (if run) completes ≤2 iterations (Luxury UI ≥75 score)

**Decisions for Sky:**
- **Blog scope:** Full commitment (1–2 posts/month) or Phase 4 deferral?
- **Blog topics:** Project reflections, AI learnings, accessibility essays, or all three?
- **Publishing frequency:** Weekly, biweekly, or monthly?

---

### Phase 4: Polish + Long-form + Dark Mode (optional, 2+ months out)

**Scope:**
- Optional: Dark mode tokens + UI (if Sky approves) — Dani + Shamus + Alex coordinated gate
- Optional: Longer-form thought leadership posts (Sky + Will)
- Optional: Performance deep-dives, accessibility audit retrospectives, interviews

**Milestones:**
- Dependent on Phase 3 completion + Phase 4 priority decisions
- If dark mode: 2 weeks (token + UI)
- If long-form: ongoing (1 post/month)

**Deliverables:**
- Dark mode CSS custom properties + UI variants (if approved)
- 4–6 long-form essays/retrospectives
- Archived blog content + timeline view

**Effort estimate:** 10–15 days (Dani 5–7 if dark mode, Shamus 5–7 if dark mode, Sky 3–5, Will 2)

**Success criteria:**
- Dark mode passes WCAG 2.2 AA (Alex validates)
- Long-form content maintains 1–2 posts/month cadence (if committed in Phase 3)

---

## ═══ DECISIONS FOR SKY ═══

1. **Phase 2 approval:** Proceed with case study expansion + component elevation (recommended: YES)? 
   - Estimated timeline: 15–18 days, shipping ~June 14.
   - Risk: low (all design + content + test infrastructure in place).

2. **Phase 3 blog commitment:** Approve Phase 3 blog infrastructure + cadence (1–2 posts/month)?
   - If YES: Will sets up routes/schema in parallel with Phase 2; Sky commits to pilot 2–3 posts by mid-June.
   - If NO: Defer to Phase 4 or backlog; Phase 3 scope collapses to Dani's optional polish loop.
   - Risk: Medium — ongoing blog cadence requires consistent Sky participation.

3. **Phase 4 dark mode:** Include dark mode in Phase 4 or never?
   - If YES: 5–7 days additional work (Dani + Shamus + Alex) post-Phase-3.
   - If NO: Keep light-only forever (no hidden complexity).
   - Risk: Low (contained scope, non-critical).

4. **Category accent tints:** Approve Dani's proposal for project-category tints (decorative backgrounds, not primary text)?
   - Proposal: AccessMap→Amber, Claude Corp→Terracotta, Prompt Library→Sand, Games→Umber, Certificates→Terracotta.
   - Keeps "one accent" rule; adds visual variety without breaking minimalism.
   - Risk: Low (Alex validates WCAG compliance).

5. **Case study narrative length:** 300–500 words per case study or shorter?
   - Shorter (250–350) ships faster, reads faster, easier to maintain.
   - Longer (400–600) allows deeper process insights, stronger SEO.
   - Recommend: 350–400 words as a middle ground.

---

## ═══ STATE SNAPSHOT ═══

```
updated: 2026-05-28
cycle: morgan-strategic-roadmap-phase-2-4
status: Phase 1 shipping 2026-05-29; Phase 2–4 planned, awaiting Sky decisions

Phase 1 (SHIPPING):
  - Homepage + deliverables index complete
  - About page + contact live
  - Certificates + work detail pages scaffolded
  - All tests green (40/40)
  - Ready for Monday merge

Phase 2 (QUEUED):
  - Dani: component design tokens ready (2026-05-28_Dani_Vision_Input.md)
  - Will: case study narrative framework ready (2026-05-28_Will_Content_Strategy.md)
  - Gate: Sky case study drafts needed
  - Estimated start: 2026-05-30
  - Estimated completion: 2026-06-14

Phase 3 (CONDITIONAL):
  - Blog infrastructure approval pending Sky decision
  - If approved: ~2 weeks setup + ongoing cadence
  - If deferred: skip to Phase 4 or backlog

Phase 4 (EXPLORATORY):
  - Dark mode decision pending
  - Long-form content cadence pending Phase 3 blog approval
  - Estimated 2+ months out

Roles assigned:
  - Dani: design tokens + component mockups (Phase 2, 3 optional, 4 optional)
  - Shamus: UI implementation (Phase 2, 4 optional)
  - Will: content structure + copyedit + blog setup (Phase 2, 3, 4)
  - Gary: tests (Phase 2)
  - Peter: perf validation (Phase 2)
  - Sky: case study narratives + blog posts + decisions (all phases)

No blocking issues. All parallel paths clear. Ready to execute Phase 2 on go-ahead from Sky.
```

---

## ═══ EXECUTION TIMELINE ═══

| Date | Task | Owner | Status |
|---|---|---|---|
| 2026-05-29 | Phase 1 merges to main | Sky | GO |
| 2026-05-30 | Dani starts Phase 2 design tokens | Dani | Ready |
| 2026-05-30 | Sky drafts case studies (5×) | Sky | Ready |
| 2026-06-02 | Dani review + Shamus Phase 2 UI build start | Dani + Shamus | Blocked on Sky drafts |
| 2026-06-04 | Will edits case studies; Peter starts perf profiling | Will + Peter | Blocked on Sky drafts |
| 2026-06-09 | Shamus Phase 2 build ready for testing | Shamus | Blocked on Dani tokens |
| 2026-06-10 | Gary Phase 2 test suite runs | Gary | Blocked on Shamus |
| 2026-06-12 | Phase 2 feature complete; Peter perf report | Peter | Blocked on Shamus |
| 2026-06-14 | Phase 2 merges to main (pending Sky final approval) | Morgan + Sky | Blocked on Gary + Peter |
| 2026-06-15 | Phase 3 decision deadline (blog yes/no) | Sky | Decision needed |
| 2026-06-16 | Phase 3 setup starts (if approved) | Will | Conditional |

---

## ═══ CRITICAL PATH ═══

1. **Sky's case study drafts** (blocking Will, Shamus, tests, perf validation)
2. **Dani's design tokens** (blocking Shamus UI build)
3. **Shamus Phase 2 build** (blocking Gary tests + Peter perf)
4. **Gary + Peter validation** (blocking Phase 2 merge)
5. **Sky Phase 3 decision** (unblocks Will blog setup)

**Longest pole:** Sky case study drafts → Will edits → Shamus build → Gary tests → Peter perf → merge (10–12 days if sequential). Recommend overlapping Will edits + Shamus build where possible (Will finishes first 1–2 case studies while Shamus starts with tokens).

---

## ═══ RECOMMENDATIONS ═══

**To accelerate Phase 2 ship:**
- Sky drafts 5 case study skeletons (bullet-point outlines) by end of 2026-05-30. Will fills in narrative gaps; full edit cycle 3 days.
- Dani completes design tokens + mockups by end of 2026-06-01. Shamus can scaffold UI structure while waiting for final token validation.
- Gary + Peter run in parallel with Shamus's build (Peter starts perf profiling on staging builds).

**To stabilize long-term:**
- Establish Phase 3 blog cadence contract with Sky (commitment in writing: 1–2 posts/month, topics, publishing schedule).
- Document all case study + blog writing templates in a Content Guide (Will leads, Sky reviews for voice).
- Add Portfolio to the weekly Morgan digest for ongoing health checks.

**Risk mitigations:**
- Case study burden: If Sky can't deliver all 5 by June 2, Phase 2 ships with 3–4 case studies (others defer to Phase 3).
- Blog sustainability: If Phase 3 blog launches but Sky can't sustain cadence, revert to backlog and mark /journal "archived" (no new posts).
- Dark mode scope creep: Finalize Phase 4 dark mode decision by end of Phase 3 (2026-07-15) to avoid ambiguity.

---

## Synthesized from

- `~/Portfolio/qa-reports/2026-05-28_Dani_Vision_Input.md` — Dani's design evolution + component tokens
- `~/Portfolio/qa-reports/2026-05-28_Will_Content_Strategy.md` — Will's case study + blog narrative strategy
- `~/Portfolio/PROJECT_STATE.md` — Phase 1 shipping status
- `~/Portfolio/PLAN.md` — Day-0 cycle context

---

**Next step:** Sky reviews this roadmap and approves/modifies Phases 2-3-4 scope + timeline. Morgan stands by for execution.

