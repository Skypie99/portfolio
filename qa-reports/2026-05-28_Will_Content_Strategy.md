---
report: will-phase-2-4-content-strategy
date: 2026-05-28
role: will
---

# Portfolio Content Strategy — Phase 2-4 Vision (Will)

**Context:** Phase 1 (skeleton + homepage narrative + deliverables index) ships Monday. This doc outlines content direction for Phase 2-4 expansion.

---

## 1. Case Study Strategy (Phase 2 primary)

**Phase 2 Case Study Expansion:**
- Each work detail page (currently: title + summary + role/tech + links) should grow into a **3-section narrative**: (1) **The Problem** — what accessibility or UX challenge was being solved?; (2) **How I Built It** — key technical or design decisions, with 1–2 code/design decision callouts; (3) **What Happened** — shipped outcome, user feedback, or measurable impact.
- Narrative arc per project (example: AccessMap = "Disabled residents couldn't report accessibility issues efficiently → built crowdsourced verification system → now X reports/month"). Keep to 300–500 words per project.
- Add optional **"Lessons" sidebar** — 3–5 bullet-point takeaways the reader should remember (e.g., "Accessible doesn't mean minimal," "Community feedback loops shape priorities").
- Archive mode: each case study should be linkable at `/work/[slug]/case-study` or similar for SEO + sharability.

**Content owners:**
- Narrative drafts: Sky (knows the projects best; Will edits for voice/clarity)
- Structure/templates: Will (ensures consistency, LEARNINGS documentation)

---

## 2. About Page Expansion (Phase 2 enhancement)

**Phase 2 Update (minimal):**
- Current About bio is strong and authentic. Add a **final section** beneath the current "How I work" steps: **"Current Focus"** (150 words) expanding on the closing line of the bio ("exploring what happens when accessibility, AI, and community collide"). Name specific problems you're thinking about, not vague generalities.
- This keeps the door open for Phase 3 case studies and blog posts without requiring a full rewrite.

**Phase 3 (optional, if blog exists):**
- Extend "How I work" with a **"Values"** micro-section (100 words on accessibility-first, documentation culture, learning in public). Frames why you approach projects the way you do.
- Add linked "Recent articles" or "Latest thinking" block that pulls from blog/journal entries (feeds Phase 3 traffic).

---

## 3. Blog/Journal Scope (Phase 3–4 decision)

**Recommendation: Phase 3 OPTIONAL, Phase 4 ACTIVE.**

**Why Phase 3 is deferrable:**
- Blog adds significant ongoing content burden (1–2 posts/month to be credible).
- Phase 2 case studies are higher ROI (permanent, SEO-friendly, directly showcase projects).
- Only pursue if Sky has clear content cadence in mind.

**If blog ships Phase 3:**
- Focus on **project reflections + learning notes**, not daily journaling or AI tutorials (plenty of those exist; your unique angle is accessibility + community + process transparency).
- Examples: "Why I open-sourced AccessMap," "What I learned building Claude Corp's Constitution," "Accessibility audit patterns I use."
- Platform: blog index at `/journal` or `/thoughts`, individual posts at `/journal/[slug]`.
- Target: 300–800 words per post, 1–2 posts/month (sustainable).
- SEO: every post gets meta tags (title, description, OG) + structured data (BlogPosting schema).

**Phase 4 (ACTIVE — long-form thinking):**
- If Phase 3 blog established trust, Phase 4 can expand to deeper thought leadership: "The Future of Community-Driven Accessibility," retrospectives on shipped projects, interviews with other builders.

---

## 4. Navigation & Information Architecture (Phase 2-3 growth)

**Phase 1 (current):**
- Single-scroll homepage + top sidebar nav + footer.
- Works fine for limited scope.

**Phase 2 changes:**
- Add **case study breadcrumb + sibling-project nav** on work detail pages (already in template, just needs copy).
- Homepage hero may stay single-scroll, but add **sticky anchor nav** (small dot indicator + scroll-to-section links) if Phase 2 adds long-form case study blocks.
- Footer can stay minimal; no change needed.

**Phase 3 (if blog exists):**
- Consider a **persistent top nav bar** (not sticky, just larger header area) showing: Home | Work | Journal | About | Contact. Current sidebar + hamburger works for mobile; desktop gets horizontal nav.
- Alternatively, keep sidebar, add "Journal" link between Work + About.
- Navigation should reflect content depth — don't add nav structure until content exists.

**Info arch principle:**
- Every new page type (blog post, case study, journal entry) should be linkable + archivable. Don't create orphaned content.

---

## 5. Voice & Messaging Refinement (Phase 2+ identity)

**Current tagline:** "AI tools, built slowly. Documented honestly."

**Refined value proposition for Phase 2-4:**
- **For whom:** Builders who care about accessibility + sustainable open-source + transparent process.
- **What matters:** Slow, thoughtful shipping. Accessible-first design. Learning in public.
- **Core claim:** "I build tools that help people help each other — especially the people tech has left behind. I document how, so you can learn from it."

**Homepage hero messaging (Phase 2 refinement):**
- Keep the current hero headline ("I build AI tools with care.") — it's authentic.
- Optionally expand the CTA below the hero: instead of just "View work," add clarity like "See the projects + how they were built."

**Case study framing:**
- Each case study should open with **the human problem**, not the technical problem. Example: "Disabled residents in Vancouver couldn't report inaccessible paths" (not "we needed a mapping app").
- Consistent voice: direct, specific, honest about tradeoffs (e.g., "I chose Expo because X, which meant tradeoff Y").

**Blog voice (Phase 3+):**
- Same voice as About page: conversational, clear, jargon-conscious. Explain concepts as if writing to a smart friend unfamiliar with the domain.
- Avoid hype. Favor "here's what I learned" over "here's the hot take."

---

## 6. Accessibility in Copy (Phase 2 QA)

**Reading-level targets:**
- Aim for **Grade 10 reading level** (Flesch-Kincaid) across all long-form content (case studies, blog, About).
- Use shorter sentences than normal writerly prose — favor 15–20 words/sentence in body copy.
- Define technical terms once on first use, then assume knowledge thereafter.

**Inclusive language patterns (to flag for Phase 2 review):**
- **Disability language:** Use identity-first language for accessibility ("disabled residents") but ask individuals their preference. Avoid "suffer from" / "afflicted with" framing.
- **Alt text:** Every project image must have descriptive alt text (not just "project screenshot"). Example: "AccessMap mobile screen showing a map with colored pins for accessibility reports: red for urgent, yellow for minor."
- **Credentials/certificates:** Use explicit language ("I earned this," "This credential verifies...") rather than claiming authority.
- **Gendered language:** Audit for assumptions; use "they/them" as default or ask individuals their pronouns (not applicable on portfolio yet, but flag for future blog contributors).

**Semantic markup (Phase 2 implementation):**
- Case study sections should use `<article>`, `<section>`, `<h2>` hierarchy (not all `<div>`).
- Link text should be descriptive: "Read the AccessMap case study" (not "read more" or "click here").
- Credentials/badges should use `<abbr title="...">` for acronyms and `<time>` for issued/expiry dates.
- Schema markup: ensure BlogPosting (blog) and ProjectArticle/Thing (case studies) structured data is in place for SEO.

---

## Checkpoint & Decisions for Sky

**Content ownership:**
- Case study narratives: Sky writes draft, Will edits for consistency + accessibility.
- Blog posts (Phase 3+): Sky authors, Will copy-edits + handles publication setup.
- Navigation/IA changes: Coordinated between Will (copy structure) + Dani (visual hierarchy) + Shamus (implementation).

**Deferred to Sky:**
1. **Blog in Phase 3 or Phase 4 only?** (Phase 2 case studies are more important.)
2. **Case study length target:** Are you comfortable with 300–500 words per project, or prefer shorter?
3. **Blog publishing cadence:** If blog ships, can you commit to 1–2 posts/month? (Honest answer prevents ghost blogs.)
4. **Accessibility stance:** Any specific projects or audiences you're writing *for* in Phase 2+? (Shapes messaging angle.)

---

## Deliverable Summary

| Phase | Content Type | Scope | Effort |
|-------|---|---|---|
| **Phase 2** | Case studies (5×) + About "Current Focus" | 3-section narratives per project + OG meta | 5–7 days (Sky drafts + Will edits) |
| **Phase 3** | Blog infrastructure (if approved) + 2–3 pilot posts | /journal route, BlogPosting schema, 1–2 posts | 3–4 days setup + ongoing |
| **Phase 4** | Long-form thought leadership | Deeper retrospectives, interviews, essays | Ongoing cadence |

---

## Content Audit Notes

**Current content health (Phase 1):**
- ✅ Profile.json: clean, accurate tagline + contact details
- ✅ Deliverables.json: all projects have summaries, tech tags, links
- ✅ About page: strong narrative, authentic voice
- ⚠️ Work detail pages: minimal (title + summary only; case study bodies missing)
- ⚠️ No LEARNINGS.md or content strategy doc yet (this document fills that gap)
- ⚠️ No blog infrastructure (no /journal routes, no blog schema)

**Phase 2 PRE-launch checklist:**
- [ ] Case study drafts reviewed for tone consistency
- [ ] Alt text written + reviewed (Dani + Alex verify with images)
- [ ] OG/Twitter cards wired up for case studies
- [ ] "Other work" recommendation logic tested
- [ ] Breadcrumb nav tested across all work detail pages

