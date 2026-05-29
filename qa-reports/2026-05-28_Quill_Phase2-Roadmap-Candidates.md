---
report: quill-phase-2-roadmap-candidates
role: quill
date: 2026-05-28
phase: phase-2-horizon-analysis
invocation: cycle-6-shadow-task-18
---

# Portfolio Phase 2 Roadmap Candidates

**Date:** 2026-05-28  
**Phase:** Phase 2 (post-Phase-1 shipping, 2-3 weeks out)  
**Status:** Candidate list only — not committed roadmap, awaiting Sky approval  
**Synthesized from:** Morgan's Phase 2-4 Strategic Roadmap, Dani's Design Vision, Will's Content Strategy, existing PROJECT_STATE.md

---

## Overview

Phase 1 (portfolio homepage + deliverables index + about + contact) ships 2026-05-29 with 40/40 tests passing, zero lint errors, full WCAG AA compliance. This candidate list identifies 11 next-horizon themes for Phase 2 expansion, ranked by dependency, effort, and ROI. **All candidates are exploration-stage only; Sky approves which themes to pursue.**

---

## ═══ CANDIDATE THEMES ═══

### 1. Project Card Elevation System (Component)

**Title:** Interactive hover states for project cards + shadow dynamics  
**Rationale:** Phase 1 cards are flat. Dani's design vision proposes subtle interactivity: soft shadow increase, peach-cream background shift, 2px Y-translate on hover. Maintains minimalism while signaling affordance. High-ROI polish affecting all work pages.  
**Effort:** **M** (Dani: 2 days design tokens + mockups, Shamus: 3 days UI implementation + testing)  
**Dependencies:** Dani design tokens must finalize first; gate for Shamus UI work.  
**Deliverables:** New ProjectCard hover state component + token set (`--shadow-lift`, `--duration-lift`, `--color-background-lift`)  
**Success criteria:** All project cards lift on :hover without CLS violation; 280ms ease-out motion validated by Peter  
**Status:** Ready to queue (Dani + Shamus already scoped)

---

### 2. Case Study Expansion (Content + Layout)

**Title:** Deep-dive narratives for all 5 projects (AccessMap, Claude Corp, Pac-Man, Prompt Library, Mutual Mesh)  
**Rationale:** Phase 1 work detail pages are minimal (title + summary + tech tags). Phase 2 expands each to 3-section narrative: Problem → How Built → What Happened → Lessons. 300–500 words per case study. Highest SEO + shareability impact. Directly supports project showcase purpose.  
**Effort:** **M–L** (Sky: 3 days case study drafts across 5 projects, Will: 2 days copy-edit + consistency audit, Shamus: 1 day layout implementation)  
**Dependencies:** Sky's narrative drafts must complete first (blocks Will edits, Shamus layout). Dani design inputs (case study card variant + reading mode) optional.  
**Deliverables:** 5 case study pages at `/work/[slug]/case-study`, OG meta tags per post, structured data (schema.org Project/Article), "Lessons" sidebars  
**Success criteria:** All 5 case studies linkable + indexed by search engines; <1.5s load time (Peter validates); WCAG 2.2 AA on new layouts (Alex validates)  
**Status:** Blocked on Sky drafts (ready to queue once Sky completes outlines)

---

### 3. Interactive Category Filtering (UI + State)

**Title:** Pill-based filtering UI for work index + featured projects grid  
**Rationale:** Phase 1 shows all projects. Phase 2 adds filtering by category (Accessibility, AI Tools, Infrastructure, Learning, Community) with instant fade-swap content. UX improvement + engagement driver. Referenced in Dani's Phase 3 optional but feasible Phase 2.  
**Effort:** **M** (Dani: 1 day UI mockups + filter state tokens, Shamus: 2 days implementation + content swap, Peter: 0.5 days perf validation)  
**Dependencies:** Dani design finalization (motion tokens for fade transitions). Case studies must exist to populate grid.  
**Deliverables:** FilterPill component, fade-in/fade-out motion at 280ms, state management for active category  
**Success criteria:** Smooth content swap on filter click; zero CLS from reflow; <200ms interaction latency  
**Status:** Ready to queue (design + scope clear)

---

### 4. About Page Expansion (Content)

**Title:** Add "Current Focus" section + optional "Values" framing to About  
**Rationale:** Current About page is strong. Will proposes adding final section: "Current Focus" (150 words) expanding on the bio's closing line. Phase 3 optional: add "Values" micro-section (100 words on accessibility-first, documentation culture, learning in public). Frames the "why" behind project approach.  
**Effort:** **S** (Sky: 1 day writing "Current Focus" + "Values" draft, Will: 0.5 days edit)  
**Dependencies:** None. Independent of design/component work.  
**Deliverables:** Updated `/app/about/page.tsx` with new sections, optional linked "Recent articles" block (if blog ships Phase 3)  
**Success criteria:** Content tone matches existing bio; <300 words for "Current Focus", <100 words for "Values"; Flesch-Kincaid Grade 10 level  
**Status:** Ready to queue anytime (low risk, high authenticity ROI)

---

### 5. Credential/Certificate Card Polish (Component)

**Title:** Badge upgrade: issuer logos + verified checkmarks + hover lift  
**Rationale:** Phase 1 certs are plain. Dani proposes: issuer logo (20px × 20px, top-right of card), verified checkmark icon (12px, umber tint), hover lift (shadow + 2px Y-translate + blush background). Luxury polish on credentials showcase.  
**Effort:** **S–M** (Dani: 0.5 days micro-component tokens, Shamus: 1 day implementation + logo fallback logic, Alex: 0.5 days WCAG validation)  
**Dependencies:** Dani design finalization. Issuer logo assets must exist (fetch from /public/certs/ or external API).  
**Deliverables:** Updated CertCard component with logo slot + checkmark SVG, hover state tokens  
**Success criteria:** All issuer logos render at 20×20px; checkmark visible at all zoom levels; hover motion matches card elevation system  
**Status:** Ready to queue (high-impact, isolated scope)

---

### 6. Scroll-Triggered Section Reveals (Motion)

**Title:** Fade-in + Y-translate animations for hero headline + section entrances  
**Rationale:** Dani proposes scroll-triggered animations: hero headline fades in + 12px Y-translate on page load (300ms), section headlines/paragraphs reveal on scroll-into-view (900ms ease-out, staggered). Improves perceived performance + visual hierarchy. Must respect `prefers-reduced-motion: reduce`.  
**Effort:** **S–M** (Dani: 0.5 days motion token extension + Intersection Observer specs, Peter: 1 day implementation + perf profiling, Alex: 0.5 days reduced-motion fallback)  
**Dependencies:** Peter performance validation (no LCP/CLS regression). Dani motion tokens finalized.  
**Deliverables:** Intersection Observer hooks for scroll-trigger, extended motion tokens (`--dur-reveal`, `--ease-entry`), reduced-motion CSS fallbacks  
**Success criteria:** All animations fire at scroll-into-view without paint thrashing; Core Web Vitals unchanged (LCP, CLS, FID); <200ms latency  
**Status:** Ready to queue (medium complexity, high visual impact)

---

### 7. Hero Anchor Navigation (Navigation)

**Title:** Sticky or floating anchor dot navigation for single-scroll homepage  
**Rationale:** Phase 1 homepage is single-scroll with no orientation hints. Phase 2 adds small labeled dots or "scroll to section" indicators (bottom footer or side rail) to help users navigate sections (Hero → How I work → Projects → Certificates → Contact). Optional in Phase 2, may defer to Phase 3.  
**Effort:** **S** (Will: 0.5 days copy/structure, Shamus: 1 day UI + smooth-scroll implementation)  
**Dependencies:** None. Independent of other themes.  
**Deliverables:** AnchorNav component (mobile: dots only, desktop: dots + labels), smooth-scroll link behavior  
**Success criteria:** All section anchors functional; keyboard-accessible (Tab + Enter); no CLS on scroll  
**Status:** Ready to queue (low risk, defer to Phase 3 if needed)

---

### 8. Case Study Breadcrumb + Sibling Navigation (Navigation)

**Title:** Add breadcrumb path + "Other projects" recommendation logic to work detail pages  
**Rationale:** Phase 1 work detail pages are isolated. Phase 2 adds breadcrumb (Work / ProjectName) and "You might also like" cards linking to related projects. Improves navigation + discovery. Already templated, just needs copy/logic.  
**Effort:** **S** (Shamus: 1 day component + sibling-query logic, Will: 0.5 days breadcrumb labels)  
**Dependencies:** None. Independent of other themes.  
**Deliverables:** Breadcrumb component, recommendation query logic (fetch 2–3 related projects by category)  
**Success criteria:** Breadcrumb renders on all work pages; "Other projects" cards accurate + non-duplicate  
**Status:** Ready to queue anytime

---

### 9. Project Category Accent Tints (Design System)

**Title:** Introduce decorative category-specific background tints (non-breaking expansion)  
**Rationale:** Dani proposes optional color system expansion: AccessMap→Amber, Claude Corp→Terracotta, Prompt Library→Sand, Games→Umber, Certificates→Terracotta. Live in component backgrounds only (20% opacity), never primary text. Adds visual variety while preserving "one accent" rule. Requires Alex WCAG re-validation.  
**Effort:** **S–M** (Dani: 1 day token creation + palette definition, Alex: 1 day WCAG contrast audit on backgrounds)  
**Dependencies:** Dani design decision finalized. Alex accessibility validation required.  
**Deliverables:** New CSS custom properties for category tints, applied to project/cert card backgrounds  
**Success criteria:** All tints meet WCAG 2.2 AA contrast ratios for overlaid text; 20% opacity maintained across backgrounds  
**Status:** Ready to queue (design impact, non-breaking, optional Phase 4 if deprioritized)

---

### 10. Blog/Journal Infrastructure (Content Platform)

**Title:** Set up /journal route, blog index, BlogPosting schema, post template  
**Rationale:** Phase 2 focuses on case studies (higher ROI). Phase 3 optional: blog infrastructure for ongoing project reflections + learning notes. Will proposes: /journal index + individual post routes, BlogPosting schema.org markup, content-editor template for Sky reference. Enables 1–2 posts/month cadence if approved.  
**Effort:** **M** (Will: 2–3 days routes + schema + template, Peter: 0.5 days OG meta + JSON-LD setup, Gary: 0.5 days test coverage for new routes)  
**Dependencies:** Sky approval (must commit to 1–2 posts/month cadence to justify). Phase 3 or Phase 4 only.  
**Deliverables:** `/journal` index page, `/journal/[slug]` post template, BlogPosting structured data, blog.css reading-mode styles, content-editor guide (Markdown template for Sky)  
**Success criteria:** Blog routes indexed by search engines; OG tags render on social preview; TypeScript schema validates post frontmatter; zero 404s  
**Status:** DEFERRED to Phase 3 (Phase 2 focuses on case studies; blog adds ongoing burden)

---

### 11. Dark Mode Theme System (Design System + UI)

**Title:** Full token duplication + CSS custom properties for dark mode variant  
**Rationale:** Phase 1 ships light-only. Dani (optional Phase 4) proposes dark mode: duplicate token set for `prefers-color-scheme: dark`, test reduced-motion fallbacks, validate WCAG 2.2 AA contrast on dark backgrounds. Deferred to Phase 4 — not critical path, requires significant token work.  
**Effort:** **L** (Dani: 5–7 days token duplication + mockup validation, Shamus: 5–7 days UI implementation + testing, Alex: 2 days WCAG re-audit on dark backgrounds)  
**Dependencies:** Sky decision (Phase 4 or never?). Dani + Shamus bandwidth. Alex accessibility gate.  
**Deliverables:** Dark mode CSS custom properties, `prefers-color-scheme: dark` media queries on all components, dark mode toggle UI (if user-selectable)  
**Success criteria:** All text contrast meets WCAG 2.2 AAA on dark backgrounds; reduced-motion fallbacks tested; zero color violations  
**Status:** DEFERRED to Phase 4 (Phase 2–3 focused on case studies + blog; dark mode is exploratory luxury)

---

## ═══ CANDIDATE SUMMARY TABLE ═══

| # | Candidate | Type | Effort | Dependencies | Phase | Status |
|---|-----------|------|--------|--------------|-------|--------|
| 1 | Project Card Elevation | Component | M | Dani tokens → Shamus | **Phase 2** | Ready |
| 2 | Case Study Expansion | Content+Layout | M–L | Sky drafts → Will edits → Shamus layout | **Phase 2** | Blocked on Sky |
| 3 | Interactive Filtering | UI+State | M | Dani design + case studies exist | **Phase 2** | Ready |
| 4 | About Expansion | Content | S | None | **Phase 2** | Ready |
| 5 | Cert Card Polish | Component | S–M | Dani tokens + issuer logo assets | **Phase 2** | Ready |
| 6 | Scroll-Triggered Reveals | Motion | S–M | Dani tokens + Peter perf validation | **Phase 2** | Ready |
| 7 | Hero Anchor Nav | Navigation | S | None | **Phase 2** | Ready |
| 8 | Breadcrumb + Siblings | Navigation | S | None | **Phase 2** | Ready |
| 9 | Category Accent Tints | Design System | S–M | Dani design + Alex validation | **Phase 2/4** | Ready (optional) |
| 10 | Blog Infrastructure | Content Platform | M | Sky approval + Phase 3 commitment | **Phase 3** | Deferred |
| 11 | Dark Mode System | Design System+UI | L | Sky approval + Phase 4 scope | **Phase 4** | Deferred |

---

## ═══ PHASE 2 RECOMMENDED SEQUENCING ═══

Based on dependencies and ROI, recommended Phase 2 sequence:

**Tier 1 — Design Foundation (parallel, unblock downstream):**
1. Dani: finalize design tokens + component mockups (Themes 1, 5, 6, 9)
2. Sky: draft 5 case study narratives (outline format, 1 day) — unblocks Will edits + Shamus layout

**Tier 2 — Content + Component Build (parallel, overlapping):**
3. Will: edit case studies for voice + accessibility (Theme 2)
4. Shamus: implement card elevation + cert polish + filter UI (Themes 1, 3, 5)
5. Peter: profile scroll animations + perf baseline (Theme 6)

**Tier 3 — Content Implementation (parallel):**
6. Shamus: implement About expansion + breadcrumb nav (Themes 4, 8) — low-risk, ship anytime
7. Shamus: optional hero anchor nav (Theme 7)

**Tier 4 — QA + Accessibility (final gate):**
8. Alex: WCAG re-audit on new components + animations (all themes)
9. Gary: Phase 2 test suite (40+ tests for new components)
10. Morgan + Sky: final approval → merge to main

**Timeline estimate:** 15–18 days total effort (parallel reduce wall-clock time to ~10–12 days if Sky drafts case studies by 2026-05-31).

---

## ═══ DECISIONS FOR SKY ═══

1. **Phase 2 scope:** Pursue all 8 Phase 2 candidates (Themes 1–8) or prioritize subset?
   - Recommended: commit to all 8 (high ROI, interconnected, ~18-day total effort).
   - Minimum viable: Themes 1–2 (card elevation + case studies) + Theme 4 (About). Defer Themes 3, 5–8 to Phase 3.

2. **Case study narrative length:** 300–500 words per project or shorter?
   - Will's rec: 350–400 words (ships faster, reads faster, mid-ground on depth).

3. **Category accent tints (Theme 9):** Include decorative project tints or keep light-only forever?
   - Dani proposal: 4–5 category-specific tints (20% opacity, backgrounds only). Low risk if Alex validates.

4. **Phase 3 blog (Theme 10):** Commit to /journal infrastructure now (runs parallel with Phase 2) or defer?
   - Conditional: only if you commit to 1–2 posts/month cadence. Otherwise, skip or Phase 4 only.

5. **Phase 4 dark mode (Theme 11):** Wanted or out of scope forever?
   - Dani's rec: Phase 4 only, not critical path. Decide by end of Phase 3 (2026-07-15) to avoid scope creep.

---

## ═══ RISK & MITIGATION ═══

| Risk | Mitigation |
|------|-----------|
| **Case study burden:** Sky can't deliver all 5 narratives by June 2 | Phase 2 ships with 3–4 case studies; defer remainder to Phase 3 (non-blocking) |
| **Scope creep on Phase 2:** Dani/Shamus bandwidth stretched across 8 themes | Prioritize Themes 1–2 (card elevation + case studies) first; defer 3, 5–8 to Phase 3 |
| **Blog sustainability:** Phase 3 blog launches but Sky can't sustain cadence | Mark /journal "archived" (no new posts); don't force content |
| **Dark mode confusion:** Phase 4 dark mode decision deferred so long it gets deprioritized forever | Final decision gate by 2026-07-15; document either way in PROJECT_STATE.md |
| **Animation accessibility:** Scroll-triggered reveals cause issues for reduced-motion users | Alex validates all motion against WCAG 2.2 standard; Peter confirms no CLS |

---

## ═══ NEXT STEPS ═══

1. **Sky review & approval:** Review this candidate list. Approve/modify Phase 2 scope above (Themes 1–8). Mark Phase 3 (Theme 10) and Phase 4 (Theme 11) as approved/deferred.
2. **Morgan dispatch:** Once Sky approves, Morgan routes agents:
   - Dani: start design tokens (Theme 1, 5, 6) — 2–3 days
   - Sky: draft case study outlines (Theme 2) — 1 day
   - Shamus: implement UI (Themes 1, 3, 5) once Dani gates — 4–5 days
   - Will: edit case studies (Theme 2) — 2 days (parallel with Shamus)
   - Peter: perf validation (Theme 6) — 1 day (final gate)
   - Alex: WCAG audit (all themes) — 1–2 days
3. **Execution timeline:** Phase 2 feature-complete by 2026-06-14 (pending Sky final approval).

---

## Appendices

### A. Earlier Strategic Context

This candidate list synthesizes:
- **Morgan's Phase 2-4 Strategic Roadmap** (2026-05-28) — full dependency graph, Phase 2 breakdown (15–18 day effort estimate)
- **Dani's Phase 2-4 Design Vision** (2026-05-28) — component tokens, motion, brand direction, accessibility flags
- **Will's Phase 2-4 Content Strategy** (2026-05-28) — case study structure, blog scope, voice refinement, accessibility in copy
- **PROJECT_STATE.md** (2026-05-28) — Phase 1 shipped, Phase 2 queued, Phase 3–4 pending decisions

### B. Phase 1 Context

Phase 1 (shipped 2026-05-29):
- Homepage hero + "How I work" section + deliverables index
- About page + contact info + certificates showcase
- All 5 projects linked (AccessMap, Claude Corp, Pac-Man, Prompt Library, Mutual Mesh)
- 40/40 tests passing, 0 lint errors, WCAG AA compliant
- Live on GitHub Pages at https://skypie99.github.io/portfolio/

### C. Candidate Status Legend

- **Ready:** All scope clear, dependencies mapped, role assigned. Can start on go-ahead.
- **Blocked on Sky:** Awaiting narrative drafts or strategic decision from Sky.
- **Deferred:** Phase 3 or Phase 4 only. Not Phase 2 critical path (lower ROI, higher burden, or awaiting decisions).

---

**Compiled by:** Quill (Specialist, Cycle 6-Shadow)  
**Date:** 2026-05-28  
**For:** Sky (Portfolio owner)  
**Via:** Morgan (Project Manager)
