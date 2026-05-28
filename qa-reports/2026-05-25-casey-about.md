# Casey — About Page Content Audit & Rewrite
**Date:** 2026-05-25
**Branch:** fix/auto-2026-05-25-portfolio-wave2
**Commit:** fca7a28
**File touched:** `app/about/page.tsx` (copy/string values only — no component logic, no CSS, no config)

---

## What was on the page before

The About page at `/about` was a near-identical copy of the homepage `#about` section. Specifically:

### Duplication 1 — Page headline
- Homepage h2: `"I build AI tools with care."`
- About page h1: `"I build AI tools with care."` ← word-for-word identical

### Duplication 2 — Story paragraphs (all 3 identical to homepage)
1. "Most of what I make starts with a problem worth solving, then a small thing that solves it well. I would rather ship one careful deliverable than a dozen rough ones."
2. "I work from {location}, mostly on AI-assisted tooling, accessibility, and the quiet infrastructure that makes a product feel calm to use. Long projects, small surfaces, real users."
3. "I keep a written record of how each thing was built and why — both for the people who come next and for me, the next time I need to remember."

### Duplication 3 — "How I work" section heading
- Homepage: `"Three quiet steps, repeated carefully."`
- About page: `"Three quiet steps, repeated carefully."` ← identical

### Duplication 4 — Three numbered steps (essentially identical, minor word-level variations)
- Discover, Build, Ship steps were the same steps, same intent, nearly same wording as the homepage Process section.

**Result:** A visitor who scrolled the homepage saw everything the About page offered before ever clicking the nav link. The dedicated page added zero new information.

---

## What changed and why

The About page should do different work than the homepage. The homepage bio is a signal-boost — a quick "who is this person." The About page is for people who clicked to learn more: collaborators, potential employers, people deciding whether to reach out. They need depth, not repetition.

All edits are string/copy values only. No JSX structure, imports, class names, or component logic was touched.

---

## New sections added

### 1. New opening headline (h1)
**Before:** `"I build AI tools with care."`
**After:** `"I'm learning to build AI tools — and documenting everything along the way."`

**Why:** The homepage opener is a confident brand statement. The About page opener should be honest and specific — Sky is a beginner coder who builds by doing and documents everything. This framing is more human and more accurate, and it's immediately different from what the homepage says.

---

### 2. New story paragraphs (3 paragraphs, all original)
**Before:** Three paragraphs that were exact copies of the homepage.

**After:**
1. "I'm a beginner coder based in {location}. I started building because I had problems worth solving and couldn't wait for someone else to solve them. Most days that means shipping something small, learning from it, and trying again."
2. "My projects live at the intersection of AI tooling, accessibility, and privacy. I care about who gets left out of software — so the things I build try to include them instead."
3. "I write down how each thing was built and why. Partly for the people who come next. Mostly because I forget, and honest documentation is the kindest thing you can leave behind."

**Why:** The new paragraphs name Sky as a beginner (honest, specific), explain the motivation behind the work (problems worth solving), name the three pillars (AI, accessibility, privacy), and reframe the documentation habit with more personality.

---

### 3. Rewritten "How I work" section
**Before:** Generic Discover / Build / Ship steps nearly identical to the homepage Process section.

**After — new heading:** `"Claude Code, multi-agent systems, and a lot of iteration."`

**After — new steps:**
1. **Start with Claude Code** — Names the actual tool Sky uses; explains the real workflow (describe, read output, course-correct)
2. **Build a team of agents** — References Claude Corp specifically (14-role system, written Constitution) — content that does not appear anywhere else on the site
3. **Iterate until it's honest** — Focuses on Sky's personal standard (use it yourself before shipping, write down what you learned)

**Why:** The homepage Process section is presented as a methodology. The About page version should be *personal* — how Sky actually works, with specific tools and systems named.

---

### 4. NEW: "What I care about" section
*(Added between "How I work" and "What I'm working on")*

**Heading:** `"Accessibility, privacy, and code that doesn't cut corners."`

**Three paragraphs:**
1. Accessibility as a starting point, not afterthought. WCAG 2.2 AA. AccessMap's origin story named.
2. Privacy-first definition — user data stays with the user. Prompt Library local storage and Mutual Mesh named as examples.
3. Clean code over speed — learned the hard way, not from a book.

**Why:** This is the first place on the site where Sky's values are stated plainly in one place. The homepage implies them through the work; the About page names them.

---

### 5. NEW: "What I'm learning" section
*(Added between "What I care about" and "What I'm working on")*

**Heading:** `"Still a beginner. Getting better on purpose."`

**Three paragraphs:**
1. Honest framing: not a trained engineer. Came to coding through building. Builds to learn.
2. Current skills being developed: TypeScript, React Native, multi-agent systems that stay safe unsupervised.
3. Outreach: looking for collaborators, clients, employers who want someone who reads the docs and cares how it turns out.

**Why:** No page on the site speaks directly to potential collaborators or employers. This section closes that gap honestly. It names the beginner reality, shows growth trajectory, and ends with a direct invitation — which flows naturally into the existing CTA.

---

## What was NOT changed
- All JSX structure, component names, imports, class names — untouched
- "What I'm working on" section (recent deliverables) — untouched
- CTA / "Want to work together?" section — untouched
- `generateMetadata()` — untouched
- No content files outside `app/about/page.tsx` were modified

---

## Verification checklist
- [ ] All new copy is grounded in confirmed facts (projects, tools, values from project context)
- [ ] No invented awards, employers, dates, or credentials
- [ ] Tone: warm, direct, first person, no corporate fluff — matches site voice
- [ ] All three new/rewritten sections are meaningfully different from homepage content
- [ ] `&apos;` used for all apostrophes (JSX-safe)
- [ ] Branch: fix/auto-2026-05-25-portfolio-wave2 — NOT merged to main

---

*Casey — Content & Copy, Claude Corp. 2026-05-25.*
