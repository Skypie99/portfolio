# Visitor Personas — AI Portfolio Site

**Author:** Riley (User Researcher)
**Cycle:** 2026-05-23 (Day-0 Kickoff)
**Status:** Composite personas — synthesized from plausible portfolio-site visitor behavior. None represent real individuals.
**Confidence:** Medium. No visitor analytics exist yet (Day-0). Personas are reasoned from common portfolio/recruiter UX patterns, not from real traffic data for this specific site. Treat as a hypothesis to validate once analytics land.

---

## How to read this document

Each persona has the same shape so Shamus, Dani, and Quinn can scan it the same way every time:

- **Identity** — one-line who-they-are
- **Goals** — what they want from the site
- **First-10-second test** — the visible thing that keeps them on the page
- **Friction points** — what makes them bounce
- **Key journey moments** — the path they take and the CTA that closes the loop
- **Brand-language fit** — does ffern-inspired warm minimalism help or hurt them

At the end: **Common journey patterns** — the 2-3 end-to-end paths Shamus must guarantee work.

A note on the brand: ffern.co's aesthetic is editorial, slow, considered, warm-neutral palette, generous whitespace, serif headlines, prose that treats the reader as an intelligent adult. The risk for a portfolio is that the same aesthetic can read as "precious" or "decorative" when a visitor is in fast-scan mode. Each persona below flags how that tension lands.

---

## Persona 1 — Maya, the Recruiter / Hiring Manager

**Identity.** Maya, Director of AI Engineering at a 300-person SaaS company. She has a Slack DM with five candidate links to review before a 2pm meeting. She's on a laptop, in a hurry, and has done this a thousand times.

**Goals.**
- Verify in under a minute whether Sky is plausibly a fit for an open role (or worth a first-round chat).
- Find one concrete artifact she can paste into Slack to her team ("here's the thing I liked").
- Get a contact path that doesn't require filling out a form.

**First-10-second test.** She needs to see, above the fold:
1. Sky's name and a one-line specialization that includes "AI" — not "I build things."
2. Visible proof — a project tile, a logo wall, a certificate name, or a number. Something that isn't just a hero phrase.
3. A nav with the words "Work" / "Projects" / "Deliverables" so she knows where to click next.

If the first screen is a poetic hero quote with no proof, she's gone.

**Friction points.**
- Hero copy that's all vibe, no specificity ("I make beautiful things that matter"). She's seen this 500 times this year.
- Long scroll to get to actual projects. Recruiters do not scroll to learn.
- "Contact me" hidden behind a form with five fields. She wants an email address she can copy.
- No way to tell when projects are from — a stale 2022 portfolio reads as inactive.
- Generic "tech I use" badge wall with no context for what was actually built.

**Key journey moments.**
1. Lands on homepage → scans hero (3 sec) → clicks "Work" or first project tile (5 sec).
2. Opens one project detail → scans for: problem, role, outcome, links (15 sec).
3. Either bounces (most common) OR clicks Contact / About to confirm the human is real (10 sec).
4. **Closing CTA:** an email address she can copy, or a LinkedIn link. NOT a form.

**Brand-language fit.** *Mixed.* Warm minimalism reads as "considered taste" which is positive — but only if the proof is also surfaced fast. The biggest risk is that ffern's slow editorial pacing translates to "this person didn't put any actual work above the fold." Mitigation: keep the warm aesthetic, but front-load tangible deliverables. A serif headline is fine. A serif headline plus 600 words of prose before the first project tile is fatal for Maya.

---

## Persona 2 — Daniel, the Prospective Client

**Identity.** Daniel, founder of an early-stage company (or innovation lead at a mid-size org) who needs to hire someone to scope or build an AI feature. He has a budget, a vague problem, and a referral that pointed him to Sky.

**Goals.**
- Decide whether Sky is the right caliber for his project (i.e., not too junior, not too booked).
- See past work that's *thematically* similar to his problem — even if the domain is different.
- Get a sense of how Sky thinks, not just what Sky has shipped — does this person ask good questions?
- Find pricing/availability signal, or at least a "let's talk" CTA that doesn't feel transactional.

**First-10-second test.**
1. A clear positioning line — "I build [X type of AI thing] for [Y type of client]" or equivalent.
2. At least one piece of evidence that Sky has shipped real work, not just experiments.
3. A way to tell whether this is a freelancer, an agency-of-one, or a side-project hobbyist.

**Friction points.**
- No case studies — just screenshots without context. Daniel needs the story: problem → approach → outcome.
- No indication of recency. If the freshest project is 18 months old, he assumes Sky has a day job and isn't taking work.
- Over-claimed credentials. If every certificate is celebrated equally, none of them carry weight.
- No social proof — testimonials, logos, "as seen in," anything that says someone else trusted this.
- A contact form with a "Tell me about your project" textarea and no other signal he'll get a reply.

**Key journey moments.**
1. Lands → scans hero → reads About or scrolls to "What I do" (15 sec).
2. Clicks into a deliverable that looks adjacent to his problem (30+ sec — he actually reads).
3. Goes to Contact / About → looks for an email, a Calendly, a response time, or a "currently available" signal.
4. **Closing CTA:** sending a real intro email or booking a discovery call.

**Brand-language fit.** *Strongly positive.* Daniel is the persona ffern's aesthetic was built for. Warm minimalism signals taste, restraint, "this person won't ship me something ugly." A slower editorial homepage that reads like a considered statement is a *feature* for Daniel — it tells him Sky is selective. Lean into prose for this persona, but keep deliverable detail pages skimmable so he can still extract the facts.

---

## Persona 3 — Priya, the Peer / Conference Organizer

**Identity.** Priya, an AI researcher / developer-advocate / community organizer. She might be looking for a speaker for an upcoming meetup, a collaborator on a side project, or a co-author on a paper or post. She found Sky via a talk, a GitHub repo, or a mutual on a Slack/Discord.

**Goals.**
- Confirm Sky is a real practitioner (not a "thought leader") with shipped work.
- Find Sky's writing / talks / GitHub to assess depth and communication style.
- Get a low-friction way to DM or follow without committing to a meeting.

**First-10-second test.**
1. Visible links to *other* surfaces — GitHub, Twitter/X, LinkedIn, a blog, a Substack, a talk page.
2. At least one piece of public-facing thinking — a write-up, a post, a talk recording, a repo README.
3. A sense of Sky's *interests* — what topics does Sky actually care about in AI?

**Friction points.**
- No outbound links. A portfolio that's a walled garden tells Priya that Sky doesn't participate in the community.
- All work is private / "available on request." Priya wants to *read* something now, not negotiate access.
- A "Blog" link that goes to a single 2-year-old post.
- No way to subscribe / follow without an email form.
- A persona that's only deliverables, no point of view.

**Key journey moments.**
1. Lands → scans for outbound links in header/footer (5 sec).
2. Clicks GitHub or a writing piece → reads/skims (45+ sec — she's evaluating depth).
3. Returns to portfolio → looks at About to gauge "who is this person" (20 sec).
4. **Closing CTA:** following on a social platform, starring a repo, or sending a short DM. Almost never a contact form.

**Brand-language fit.** *Neutral-to-positive.* Priya cares less about aesthetics than about substance — but she will notice if the site is well-crafted (signals craft) or visibly templated (signals "doesn't care"). The ffern aesthetic helps if Sky has actual writing/thinking to back it up. The aesthetic *hurts* if it's the only thing there — a beautifully designed empty room makes Priya wonder where the work is.

---

## Persona 4 — Jordan, the Curious Visitor

**Identity.** Jordan landed here from a podcast mention, a tweet, a conference attendee list, a GitHub star, or a friend's recommendation. They have no specific intent — they're just curious about "who is this person." Could become any of the other three personas later, or just close the tab.

**Goals.**
- Get a quick sense of who Sky is and whether to bookmark / follow / share.
- Maybe find one cool thing to send to a friend.
- Decide whether to come back later.

**First-10-second test.**
1. A face, a name, and a single human-sounding sentence about who Sky is.
2. Something visually delightful or surprising — Sky's brief was "bright and interactive," and Jordan is the persona who rewards that.
3. A sense that the site is *alive* — recent activity, a date, a "currently working on" line.

**Friction points.**
- A perfectly minimal site with nothing to *do*. Jordan wants to click something.
- No personality. If the site reads like a corporate consultant landing page, Jordan closes the tab.
- A "Coming soon" message anywhere. Suggests abandonment.
- No way to follow / subscribe / bookmark with intent (RSS, newsletter, social links).
- Slow load or visible layout shift. Jordan has no commitment and will leave instantly.

**Key journey moments.**
1. Lands → looks at hero → scrolls or clicks the first thing that catches the eye (5–15 sec).
2. Explores 1–2 deliverables or an About page, often non-linearly (variable).
3. Either bookmarks / follows on social / shares with a friend, or closes tab.
4. **Closing CTA:** a low-commitment follow — social link, newsletter, "see all work" — not a meeting request.

**Brand-language fit.** *Highly positive — but contingent on interactivity.* Jordan is exactly who Sky's "bright and interactive" instruction is for. Warm minimalism plus a small moment of delight (a hover state, an animated section transition, a tiny easter egg) is the combination that turns a curious visitor into a return visitor. Pure-static ffern would feel reverent and pretty but inert. The interactive layer is the difference between Jordan bouncing and Jordan tweeting the link.

---

## Common journey patterns

Across the four personas, three end-to-end paths matter most. **Shamus must guarantee all three work without dead ends, broken links, or layout breakage on mobile.**

### Critical Journey 1 — The Recruiter Scan (Maya, sometimes Daniel)
```
Home → Work/Deliverables index → Single deliverable detail → Contact (email visible)
```
**Why it's critical:** Highest-stakes, lowest-time-budget journey. If Maya hits a 404, an unstyled page, or a "contact form only" wall, the candidate is dropped. This journey must be sub-10-second-per-step.
**Must-have:** Deliverable index loads fast, each tile is clickable, each detail page has at least one outbound link (live demo, GitHub, write-up), Contact surfaces a copyable email.

### Critical Journey 2 — The Considered Read (Daniel, Priya)
```
Home → About / What I do → Specific deliverable (deep read) → Contact OR external link (GitHub/social)
```
**Why it's critical:** This is the journey that closes paid work and serious collaborations. It demands the *prose* to be good, the deliverable pages to have real case-study content (not just screenshots), and About to make the human feel real.
**Must-have:** About page exists and isn't a placeholder; deliverable detail pages have a problem/approach/outcome shape; outbound links to GitHub, LinkedIn, talks all work and open in new tabs.

### Critical Journey 3 — The Curious Wander (Jordan, sometimes Priya)
```
Home → (interactive moment) → any 1-2 pages clicked non-linearly → social follow OR bookmark
```
**Why it's critical:** This is the volume journey — most visitors will be in this mode. Sky's "bright and interactive" instruction is aimed here. If the site is beautiful but inert, this journey converts at near-zero.
**Must-have:** At least one delightful, working interactive element on the homepage; visible social links in header/footer; no "coming soon" placeholders; clear recent-activity signal (a date, a "now" page, a most-recent deliverable callout).

---

## Cross-cutting friction (applies to all four personas)

These would hurt every visitor, ranked by severity:

1. **No proof above the fold.** Hero with no deliverable, certificate, logo, or number visible. Hurts Maya most, but degrades all four.
2. **No recency signal.** Visitors assume stale = inactive = unavailable. Add dates to projects, an "updated" timestamp, or a "currently" line.
3. **Contact gated only behind a form.** Maya, Priya, Jordan all prefer email/social. Daniel tolerates a form *if* there's also a direct email option.
4. **Pretty but inert.** Strong ffern aesthetic with zero motion/interactivity flatly contradicts Sky's "bright and interactive" directive and underserves Jordan entirely.
5. **Broken outbound links.** Especially to GitHub or social. Priya bounces immediately; Maya assumes Sky isn't careful.

---

## What's evidenced vs. reasoned

| Claim | Confidence | Basis |
| --- | --- | --- |
| Recruiters scan portfolios in under a minute | **Reasoned (high)** | Widely reported in hiring/UX literature; no specific data on Sky's site. |
| ffern.co aesthetic is "warm editorial minimalism" | **Reasoned (high)** | Direct observation of ffern.co; aesthetic well-documented in the brief. |
| These four personas are the right ones for Sky's site | **Reasoned (medium)** | Standard portfolio-site visitor archetypes; no analytics for this site exist yet. Should validate once traffic lands. |
| Specific friction points (no recency = bounce, etc.) | **Reasoned (medium)** | Patterns from general portfolio UX; not measured for Sky's specific audience. |
| The 3 critical journeys are the right ones | **Reasoned (high)** | Each maps to a distinct persona's closing CTA — coverage logic is sound, ranking is hypothesis. |
| Anything statistical (e.g., "50% bounce") | **Not claimed.** | I have no real numbers and refuse to invent them. |

---

## Recommendations to other roles

- **Shamus** — guarantee the 3 critical journeys end-to-end on the first scaffold. Don't ship without all three working.
- **Quinn** — make sure FEATURES.md includes: a Deliverables index, deliverable detail pages with case-study shape (problem/approach/outcome), a real About page, visible social links, and at least one interactive homepage moment. A contact-form-only contact path is a P0 risk.
- **Dani** — the brand-language tension is real: ffern aesthetic helps Daniel and Priya, hurts Maya and Jordan unless balanced with proof-above-fold and interactivity. Please specify *where* the warm-minimal pace gives way to skimmable density.
- **Alex** — interactive moments must remain accessible (motion-reduce respected, focus states, no keyboard traps).
- **Morgan** — flag to Sky: the "contact form vs. visible email" decision in PLAN.md item 5 has visitor-experience consequences as well as privacy ones. Recommend defaulting to visible email + social, no form.

---

## Re-research triggers

Update this doc when:
- The first analytics data lands (real bounce rates, exit pages, dwell times).
- Sky shares actual recruiter/client/peer feedback on the live site.
- Any persona converts meaningfully — re-weight which journeys to prioritize.
- The brief shifts (e.g., contact form added, blog enabled, new audience targeted).
