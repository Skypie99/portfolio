---
phase: 2
role: will
date: 2026-05-28
kickoff: true
due: 2026-05-30
approval: sky-2026-05-28
---

# Phase 2 Kickoff — Will (Templates + About Expansion)

**Status:** KICKOFF — Sky approved Phase 2. You're unblocked to start now.

**Due:** 2026-05-30 (templates ready for Sky to fill in; About outline ready for copy)

**Effort estimate:** 1–2 days prep work

---

## Phase 2 Content Scope

### 1. Case Study Template & Framework

**Deliverable:** A reusable template for case study narratives that Sky will fill in with project specifics.

**Template structure (3-section arc):**

```
## [Project Title] — Case Study

### The Problem
[80–120 words: What accessibility or UX challenge was being solved?
 Lead with the human problem, not the technical problem.
 Example: "Disabled residents in Vancouver couldn't report inaccessible paths efficiently."]

### How I Built It
[120–200 words: Key technical or design decisions. Include 1–2 code/design decision callouts.
 Format: "I chose [approach] because [reason], which meant [tradeoff]."]

### What Happened
[80–150 words: Shipped outcome, user feedback, or measurable impact.
 Example: "Now X reports/month from community. Learned: community feedback loops shape priorities."]

### Lessons (optional sidebar)
[3–5 bullet-point takeaways the reader should remember.
 - "Accessible doesn't mean minimal"
 - "Community feedback loops shape priorities"
 - etc.]
```

**Total:** 300–500 words per project (Sky-approved target)

**Tone:** Direct, specific, honest about tradeoffs. Conversational (write to a smart friend unfamiliar with the domain).

**Accessibility in copy:**
- Grade 10 reading level (Flesch-Kincaid)
- Sentences: 15–20 words average in body copy
- Define technical terms once on first use
- Alt text: descriptive, not "project screenshot" (e.g., "AccessMap mobile screen showing a map with colored pins for accessibility reports: red for urgent, yellow for minor.")

**Deliverable files:**
- `docs/CASE_STUDY_TEMPLATE.md` — the reusable template above
- `docs/WRITING_GUIDE.md` — companion guide covering tone, examples, accessibility standards
- Confirmation: all 5 project slugs ready for case study pages (accessmap, claude-corp, pacman-code-trainer, prompt-library, mutual-mesh)

---

### 2. About Page Expansion: "Current Focus" Section

**Current state:** Phase 1 About page has bio + "How I work" numbered steps.

**Phase 2 addition:** New section below "How I work"

**Content outline (150 words):**

```
## Current Focus

[Expand on the closing line of your bio: 
 "exploring what happens when accessibility, AI, and community collide"

 This section should name specific problems you're thinking about, NOT vague generalities.
 
 Examples of specificity:
 - "How do we make AI tools accessible to people with disabilities?"
 - "What does sustainable open-source look like in an era of AI?"
 - "How can communities help each other without central surveillance?"]

[Keep door open for Phase 3 case studies + blog posts without requiring a full rewrite.]
```

**Writing requirements:**
- Authentic, personal voice
- Specific problem areas (not "I care about accessibility")
- 150 words target (±10%)
- Same tone as existing bio

**Deliverable:** Draft outline + example text for your review

---

### 3. Navigation & Information Architecture (Phase 2 minimal)

**Current state:** Single-scroll homepage + sidebar nav.

**Phase 2 changes (minimal):**
- Add breadcrumb + sibling-project nav on work detail pages (template exists, just needs copy structure)
- Sticky anchor nav on homepage if Phase 2 adds long-form case study blocks (design decision pending Dani)
- Footer stays minimal; no change needed

**For now:** Confirm that `app/work/[slug]/page.tsx` can render case study bodies without breaking existing layout. (Check with Shamus if layout changes needed.)

**Deliverable:** IA diagram or brief doc showing proposed breadcrumb + sibling nav structure

---

## Blocking Next Steps

Once your templates are ready (2026-05-30):
- **Sky** fills in case study drafts (5 projects, problem/process/outcome outlines)
- **You** edit Sky's drafts for voice + accessibility + alt text (due ~2026-06-04, blocked on Sky)
- **Shamus** uses templates to build case study page layout + component integration
- **Gary** validates template markup + alt text for accessibility compliance

---

## Reference Docs

- **Roadmap:** `qa-reports/2026-05-28_Morgan_Phase2-4_Roadmap.md`
- **Content Vision:** `qa-reports/2026-05-28_Will_Content_Strategy.md` (your own input, operationalized here)
- **Projects:** `content/deliverables.json` (5 projects to create case studies for)
- **About page:** `app/about/page.tsx` (current bio to extend from)

---

## Task Assignments (Will's Timeline)

| Task | Due | Dependent On | Blocks |
|------|-----|--------------|--------|
| Case study template + writing guide | 2026-05-30 | None | Sky's drafts |
| About "Current Focus" outline | 2026-05-30 | None | Copy review |
| Edit Sky's 5 case study drafts for voice/accessibility | 2026-06-04 | Sky's drafts (2026-05-30) | Shamus UI layout |
| Review Gary's accessibility validation | 2026-06-10 | Gary tests (blocked on Shamus) | Phase 2 merge |

---

## Quick Start

1. Read the Content Vision doc to refresh on narrative arc + voice
2. Draft case study template in `docs/CASE_STUDY_TEMPLATE.md`
3. Draft writing guide in `docs/WRITING_GUIDE.md` (tone, examples, accessibility rules)
4. Draft About "Current Focus" outline
5. Share with Sky for sign-off before you finalize

---

## Go!

Templates are the gate — once Sky has a clear structure to fill in, the case study drafts can flow smoothly. You've got this.

Questions? Ping Morgan or Sky.
