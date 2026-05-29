# FEATURES.md — AI Portfolio Backlog

**Project:** Sky's AI Portfolio Website
**Owner:** Quinn (PM)
**Last updated:** 2026-05-28 (Wave 5 completion)
**Authority:** Sky's intent > CONSTITUTION v1.3 > role files
**Status:** v1 feature-complete — all P0 items shipped; P1 items complete; P2 (Journal) deferred pending Sky decision
**Companion docs:** `PLAN.md` (cycle plan), `PROJECT_DESIGN.md` (Dani — shipped), `PERSONAS.md` (Riley — shipped)

---

## Shipped features (by wave)

### Wave 1–3 + Cycles 2-6: Foundation & Core Features
All P0 items shipped across the initial build waves:
- **F-01** (Hero homepage) — Cormorant serif headline + DM Mono CTA, Cream background, scrollable intro section.
- **F-02** (Sidebar) — Fixed left frame on desktop, persistent wordmark, featured deliverable slot, collapsible on mobile.
- **F-03** (Hamburger nav) — Fixed top-right drawer, Escape-closable, keyboard-navigable, focus-trapped.
- **F-04** (Work index) — 2-column grid (desktop) / 1-column (mobile), Blush card backgrounds, Cormorant titles, DM Mono labels.
- **F-05** (Detail page) — 2-column layout (hero left, details right), full-width image gallery, stacks on mobile.
- **F-06** (Certificates) — Grid of credential items, issuer + title + date + link, newest-first sort.
- **F-07** (About) — Narrative intro + numbered "How I work" steps, editorial portrait slot.
- **F-08** (Contact — mailto) — Single paragraph + mailto link, social links, no form (per DECISIONS #1).
- **F-10** (Footer) — 3-column layout (Site / About / Social), auto-updating year, collapses on mobile.

### Wave 4: Design Polish (2026-05-25)
- Warm component palette refresh: cream/blush card backgrounds, peach-cream contact section.
- Alternating section rhythm for visual flow.
- Typography polish: Cormorant body weights, line-height tokens, spacing refinement.

### Wave 5: Creative Polish & Refinement (2026-05-28)
- Homepage polish: terracotta section headers, peach-cream contact background, improved section rhythm.
- Hero test: eyebrow animation classes added (Framer Motion trigger).
- **ProjectCard upgrade**: terracotta accent color, improved image handling, gradient fallback for missing images.
- **Scroll indicator**: wave5-branded progress marker on homepage hero.
- Final a11y fixes: SkipLink `:focus-visible:` improvements, contrast validation across all tokens.

---

## DECISIONS FOR SKY (escalated to Morgan)

These items cannot be groomed further until Sky weighs in. Morgan will lift them into the cycle briefing.

1. **Contact form vs. mailto only?** (F-08) — A form means storing/forwarding email content, which is PII; Jordan would need to design retention + consent. Mailto is privacy-trivial. **Quinn recommends mailto for v1**, defer the form to a future cycle once Jordan can spec it. Need Sky's yes/no.
2. **Journal / Blog — ship or skip?** (F-09) — Adds MDX dependency, content commitment, and ongoing authorship overhead. Real value only if Sky intends to actually write. **Quinn recommends defer (P2) until Sky confirms intent to publish 3+ posts in next 90 days.**
3. **Content source for deliverables + certificates** — Backlog is shaped, but every card needs real titles, hero images, dates, credential URLs. Placeholders work for scaffolding; Sky needs to provide the actual list before launch. (Not blocking this cycle.)
4. **Featured deliverable in sidebar (F-02)** — Which single deliverable goes in the sidebar slot at launch? Pick one or rotate? Affects content model. (Not blocking; Sky can decide once F-04 cards exist.)
5. **Optional Journal nav item** — If F-09 is skipped, remove the nav item entirely (don't show a dead link). Confirmed once #2 is decided.

---

## Cross-cutting acceptance criteria (apply to EVERY feature)

These ride along with each story below. A feature is not Done unless it satisfies all five.

- **C-1 Background is Cream `#FAF9F5`** — never pure white. Token from Dani's `PROJECT_DESIGN.md`.
- **C-2 No bold headlines** — typographic hierarchy uses size + whitespace + Cormorant serif weight only; no `font-weight: bold/700+` on display text.
- **C-3 Editorial photography style** — every image slot uses warm, natural-light, off-center-composed editorial imagery (no stock vector clip-art, no AI-generated busy collages, no harsh studio shots).
- **C-4 WCAG 2.2 AA contrast** — all text/icon-vs-background pairs meet 4.5:1 (normal) or 3:1 (large/UI). Alex validates Dani's token pairings before any feature ships.
- **C-5 Single narrative per screen** — one primary message, one primary CTA. No competing CTAs above the fold.

---

## Priority + sizing key

- **P0** — required for first public reveal
- **P1** — required for "complete" portfolio (ship within 2 cycles of P0)
- **P2** — nice-to-have / optional / behind a Sky decision
- **Size:** S = under a day, M = 1–3 days, L = 3+ days (single-person estimate)

---

## Backlog status (all P0 & P1 shipped; P2 deferred)

| # | ID | Title | Priority | Status | Last update |
| - | -- | ----- | -------- | ------ | ----------- |
| 1 | F-01 | Hero homepage | P0 | ✅ SHIPPED (Wave 1) | 2026-05-28 |
| 2 | F-02 | Persistent left sidebar | P0 | ✅ SHIPPED (Wave 1) | 2026-05-28 |
| 3 | F-03 | Hamburger navigation | P0 | ✅ SHIPPED (Wave 1) | 2026-05-28 |
| 4 | F-04 | Deliverables index | P0 | ✅ SHIPPED (Wave 1) | 2026-05-28 |
| 5 | F-05 | Deliverable detail page | P0 | ✅ SHIPPED (Wave 1) | 2026-05-28 |
| 6 | F-10 | Footer | P1 | ✅ SHIPPED (Wave 1) | 2026-05-28 |
| 7 | F-06 | Certificates section | P1 | ✅ SHIPPED (Wave 3) | 2026-05-28 |
| 8 | F-07 | About page | P1 | ✅ SHIPPED (Wave 3) | 2026-05-28 |
| 9 | F-08 | Contact (mailto) | P1 | ✅ SHIPPED (Wave 3) | 2026-05-28 |
| 10 | F-09 | Journal / Blog | P2 | 🔄 DEFERRED (pending Sky decision) | 2026-05-23 |

---

## F-01 — Hero homepage

**Priority:** P0  **Size:** M  **Owner (build):** Shamus  **Design:** Dani

### User story
As a first-time visitor (recruiter, collaborator, curious peer), I want to land on a single calm screen that tells me who Sky is and gives me one clear next step, so I immediately understand what this site is for without scanning a product grid.

### Scope
- Single full-viewport-height hero section on `/`.
- One short statement of who Sky is (one sentence, max ~16 words, set in Cormorant serif).
- One CTA below it, leading to F-04 (`/work`).
- One editorial hero image, off-center, generous whitespace around it.
- No carousel, no product grid, no testimonial wall, no metrics counter.
- Hero scrolls into a quiet second section (a brief 2–3 sentence intro paragraph) before any other content.

### Acceptance criteria
- [ ] `/` route renders the hero on first paint with no layout shift > 0.05 CLS.
- [ ] Exactly ONE CTA visible above the fold.
- [ ] Cormorant serif on the headline, DM Mono on the CTA label.
- [ ] Background = Cream `#FAF9F5` (C-1).
- [ ] No `font-weight >= 600` on the headline (C-2).
- [ ] Hero image is a real editorial photo placeholder (not a gradient block, not Lorem Picsum) (C-3).
- [ ] Headline-on-cream contrast >= 4.5:1 (C-4).
- [ ] Only one CTA above the fold (C-5).
- [ ] Renders correctly at 360w (mobile), 768w (tablet), 1440w (desktop).

### Out of scope
- Multiple hero variants / A-B test scaffolding.
- Animated headline (no typewriter, no fade-cycling words).
- Email capture inline on the hero.

### Dependencies
- Dani's `PROJECT_DESIGN.md` (tokens for Cream, Cormorant, DM Mono, spacing scale).
- Riley's `PERSONAS.md` (informs the one-sentence headline wording).
- Sky to approve the headline copy before launch.

---

## F-02 — Persistent left sidebar

**Priority:** P0  **Size:** S  **Owner (build):** Shamus  **Design:** Dani

### User story
As a visitor moving between pages, I want a quiet persistent frame on the left so the site feels like one editorial publication and not a stack of unrelated pages, so I always know whose site I'm on and what's currently featured.

### Scope
- Fixed-position sidebar on the left of every page on desktop (>= 1024w).
- Contains, top-to-bottom: (a) wordmark logo, (b) a single "Featured" block (one deliverable thumbnail + title + role label), (c) a single CTA (e.g., "View all work →").
- Collapses gracefully on tablet/mobile (sidebar content moves into the menu drawer; see F-03).

### Acceptance criteria
- [ ] Sidebar is visible on every page at >= 1024w.
- [ ] Sidebar width fits within a defined column of the layout grid (no overlapping page content).
- [ ] Featured deliverable is sourced from a single content file (so swapping it = 1 line change).
- [ ] CTA is a single link, no dropdown.
- [ ] Background = Cream (C-1); no bold (C-2); featured image is editorial (C-3); contrast 4.5:1 (C-4); one CTA only (C-5).
- [ ] On `<1024w`, sidebar is hidden and its CTA appears inside the F-03 drawer instead.

### Out of scope
- Multiple featured items / carousel inside sidebar.
- Sidebar-scoped search.
- User-customizable sidebar.

### Dependencies
- F-04 must exist for the featured deliverable to link somewhere real.
- Sky picks the launch-featured deliverable (DECISIONS #4).

---

## F-03 — Hamburger navigation

**Priority:** P0  **Size:** S  **Owner (build):** Shamus  **Design:** Dani

### User story
As a visitor who wants to navigate the site, I want a single subtle menu control tucked top-right so the main pages stay calm and uncluttered, so the navigation never competes with the editorial content.

### Scope
- Hamburger icon, top-right corner, on every page (including mobile).
- Opens a panel/drawer revealing nav items: **Home, Work, Certificates, About, Contact** (and **Journal** only if F-09 ships).
- Closes on item click, on Escape, on outside click.
- Keyboard navigable; focus trapped inside the open drawer.

### Acceptance criteria
- [ ] Hamburger icon visible top-right on every route.
- [ ] Drawer opens within 200ms; no jank.
- [ ] All nav items are real `<a>` / `<Link>` elements (no JS-only handlers).
- [ ] Escape key closes the drawer and returns focus to the hamburger button.
- [ ] Drawer is reachable via keyboard tab order; tab order inside drawer is logical top-to-bottom.
- [ ] Hamburger icon and drawer text meet contrast 3:1 (icon) / 4.5:1 (text) (C-4).
- [ ] Drawer background = Cream (C-1); no bold (C-2); only one primary CTA inside the drawer (C-5).
- [ ] Aria-expanded toggles correctly; drawer has `role="dialog"` and `aria-modal="true"`.

### Out of scope
- Multi-level nested nav.
- Search inside the drawer.
- Mega-menu / preview-on-hover.

### Dependencies
- DECISIONS #2 (Journal yes/no) determines whether the Journal item appears.

---

## F-04 — Deliverables index (Work)

**Priority:** P0  **Size:** M  **Owner (build):** Shamus  **Design:** Dani

### User story
As a visitor evaluating Sky's AI work, I want to browse a curated index of deliverables in a calm editorial grid so each piece feels considered, not dumped, and I can scan role/tech at a glance before clicking in.

### Scope
- Route: `/work`.
- Editorial grid (2 columns desktop, 1 column mobile) of deliverable cards.
- Each card: hero image (editorial style), title (Cormorant serif), role + primary tech (DM Mono label set).
- Card background = Blush (per Dani's token).
- Card click → F-05 detail page.
- Cards sortable by year (newest first by default); no client-side filtering in v1 (defer to later cycle if list grows past ~12).

### Acceptance criteria
- [ ] `/work` lists every deliverable in the content source.
- [ ] Each card shows hero image, title, role label, tech label, year.
- [ ] Cards have Blush background; gutter spacing matches Dani's grid token.
- [ ] Title is Cormorant serif, role/tech are DM Mono uppercase (per Dani).
- [ ] Whole card is clickable (not just the title link).
- [ ] Empty-state copy if 0 deliverables exist ("Deliverables coming soon.").
- [ ] All cross-cutting C-1 through C-5 satisfied.
- [ ] Image alt text required for every card (no empty `alt=""` unless decorative).

### Out of scope
- Filter / search / tag chips.
- Pagination (defer until list exceeds ~12 items).
- Animated card hover (subtle static elevation only).

### Dependencies
- Dani's tokens (Blush, Cormorant, DM Mono, grid).
- Dana's `DATA_SHAPE.md` will define the deliverable content schema in Wave 2.
- Sky to provide actual deliverables list (DECISIONS #3).

---

## F-05 — Deliverable detail page

**Priority:** P0  **Size:** M  **Owner (build):** Shamus  **Design:** Dani

### User story
As a visitor who clicked into a deliverable, I want a focused page with the hero image on the left and a quiet column of details on the right so I can study the work without sidebar clutter or unrelated cross-sells.

### Scope
- Route: `/work/[slug]`.
- Two-column desktop layout: large image on left, right column with title, summary, role, tech stack, year, primary external link.
- Below the fold: optional image gallery (vertical stack of additional editorial images, each full-width-of-column).
- "Back to Work" link at the top of the right column.
- No "related deliverables" carousel in v1.

### Acceptance criteria
- [ ] Route renders for every deliverable in F-04's source.
- [ ] Left column image and right column content stay legible at 1024w and above; stack vertically below 1024w.
- [ ] Summary is set in Cormorant body weight; metadata labels (Role, Tech, Year) are DM Mono uppercase.
- [ ] External link opens in a new tab with `rel="noopener noreferrer"`.
- [ ] Back-to-work link is keyboard reachable as the first interactive element.
- [ ] All gallery images have descriptive alt text.
- [ ] All cross-cutting C-1 through C-5 satisfied.
- [ ] 404 if slug doesn't match a real deliverable.

### Out of scope
- Comments / reactions.
- "Next deliverable" pager (defer; risk of distracting from the current piece).
- Inline video embeds (defer; need privacy review).

### Dependencies
- F-04 (cards link here).
- Dana's `DATA_SHAPE.md` (slug, summary, gallery fields).

---

## F-06 — Certificates section

**Priority:** P1  **Size:** M  **Owner (build):** Shamus  **Design:** Dani

### User story
As a visitor verifying Sky's credentials, I want to see certificates presented as an editorial collection — not a LinkedIn-style credential dump — so the page feels intentional and the certificates feel earned, not collected.

### Scope
- Route: `/certificates`.
- Grid of certificate items. Each item: issuer logo (or wordmark), certificate title, date earned, "View credential" external link.
- Same Cream background, Blush card backgrounds, Cormorant titles, DM Mono labels — matching F-04's editorial language.
- Group/sort: newest first by default. Optional grouping by issuer if Sky requests post-launch.

### Acceptance criteria
- [ ] `/certificates` lists every certificate in the content source.
- [ ] Each item shows issuer, title, date, credential link.
- [ ] Layout reuses tokens from F-04 (don't reinvent a new card style).
- [ ] External credential links open in a new tab with `rel="noopener noreferrer"`.
- [ ] Empty state copy if 0 certificates exist.
- [ ] All cross-cutting C-1 through C-5 satisfied.
- [ ] Issuer logos respect contrast on Cream / Blush (some white-on-white risk — Alex to validate).

### Out of scope
- PDF embedding of the certificates themselves.
- Skill/topic filtering.
- "Verified by" badges (defer; needs source-of-truth process).

### Dependencies
- F-04 (shares card pattern).
- Dana's schema (issuer, title, date, url, optional logo).
- Sky to provide certificate list (DECISIONS #3).

---

## F-07 — About page

**Priority:** P1  **Size:** S  **Owner (build):** Shamus  **Design:** Dani

### User story
As a visitor who wants to know the person behind the work, I want a calm About page that tells Sky's story and shows how Sky works (in a numbered-step pattern) so I get a clear sense of voice and approach before reaching out.

### Scope
- Route: `/about`.
- Two sections: (1) short narrative paragraph ("Sky's story"), (2) a numbered "How I work" list — three to five steps, each step set with a large DM Mono numeral (01, 02, 03…) and a Cormorant heading + short paragraph beneath.
- Optional editorial portrait image (off-center, warm tone).

### Acceptance criteria
- [ ] `/about` route renders both sections.
- [ ] Numerals (01, 02…) are DM Mono, sized as a design accent (per Dani's spec).
- [ ] Step headings are Cormorant serif, no bold (C-2).
- [ ] Narrative paragraph is set in body Cormorant with comfortable measure (~60–75ch).
- [ ] If portrait image is included, it satisfies C-3 (editorial) and has alt text.
- [ ] All cross-cutting C-1 through C-5 satisfied.

### Out of scope
- Timeline / resume export.
- Embedded interview video.
- Testimonials block.

### Dependencies
- Sky to write/approve the narrative copy.
- Dani's typography tokens.

---

## F-08 — Contact (mailto-only for v1)

**Priority:** P1  **Size:** S  **Owner (build):** Shamus

### User story
As a visitor who wants to reach out, I want one clear way to email Sky directly so I can make contact without filling out a form or creating an account.

### Scope (recommended v1)
- Route: `/contact`.
- One short paragraph of context ("The best way to reach me is by email — say hi.").
- One mailto link/button with Sky's address.
- Optional secondary links: LinkedIn, GitHub (whichever Sky wants public — confirm before launch).
- NO form, NO inputs, NO captcha, NO third-party embed in v1.

### Acceptance criteria
- [ ] `/contact` route renders a single short paragraph + mailto CTA.
- [ ] Mailto link opens user's default mail client with the address pre-filled.
- [ ] Email address is not pasted as plain text in a way that scrapers can trivially harvest (use a simple obfuscation pattern; Steve to advise next cycle).
- [ ] All cross-cutting C-1 through C-5 satisfied.
- [ ] No PII is collected (this is why mailto-only is recommended — see DECISIONS #1).

### Out of scope (until Sky decides DECISIONS #1)
- Form fields, form submission, email forwarding service, captcha.
- Calendly / scheduling embed (later cycle if Sky wants it; would also need a privacy pass).

### Dependencies
- DECISIONS #1 (Sky's call on form vs. mailto).
- If Sky chooses a form: Jordan must spec data retention + consent before a single field is built.

---

## F-09 — Journal / Blog (OPTIONAL — pending Sky decision)

**Priority:** P2  **Size:** L  **Owner (build):** Shamus  **Design:** Dani

### User story
As a returning visitor curious about Sky's thinking, I want a small set of essays/notes on AI work so I can hear Sky's voice on topics beyond what each deliverable can show.

### Scope (if approved)
- Route: `/journal`.
- MDX-powered post system; posts live as files in the repo.
- Index page lists posts (title, date, ~2-line excerpt) in chronological order, newest first.
- Detail route `/journal/[slug]` renders the MDX with editorial typography (Cormorant body, generous measure, no sidebars on the article page itself).
- Estimated commitment: 3 posts at launch, then 1/month minimum to stay alive.

### Acceptance criteria (if approved)
- [ ] MDX pipeline integrated into the Next.js static export.
- [ ] Index page lists every published post.
- [ ] Each post renders with consistent editorial typography.
- [ ] Post slugs are stable URLs.
- [ ] All cross-cutting C-1 through C-5 satisfied.
- [ ] No comment system, no third-party analytics on posts in v1.

### Out of scope
- Comments, reactions, social-share widgets.
- Email subscription / RSS in v1 (RSS is a fast follow if posts gain traction).
- Tag/category taxonomies.

### Dependencies
- **BLOCKED on DECISIONS #2 (Sky's yes/no).**
- If yes: Sky commits to writing ~3 launch posts before this feature ships.

---

## F-10 — Footer

**Priority:** P1  **Size:** S  **Owner (build):** Shamus  **Design:** Dani

### User story
As a visitor reaching the bottom of any page, I want a quiet, organized footer that mirrors the editorial frame so the site feels finished, not abandoned, and so I can find secondary links without them cluttering the main content.

### Scope
- Three-column layout (ffern style): **Site** (Home, Work, Certificates, About, Contact), **About** (1–2 sentence positioning line + a single secondary link), **Social** (links to whatever public profiles Sky wants — at minimum, the same options surfaced in F-08).
- Visible on every page.
- Collapses to a single column on mobile (<768w), columns stacked top-to-bottom in the same order.
- Bottom strip: copyright line + year (auto-updating) + small "Made with care" line.

### Acceptance criteria
- [ ] Footer renders on every route.
- [ ] Three columns at >= 768w; single column below.
- [ ] All links are real anchors (no JS-only).
- [ ] Year in copyright auto-updates (`new Date().getFullYear()`).
- [ ] No bold (C-2); Cream background (C-1); contrast 4.5:1 for text (C-4); single primary CTA at most (C-5).
- [ ] Social links open in new tabs with `rel="noopener noreferrer"`.

### Out of scope
- Newsletter signup (until contact-form decision is resolved).
- Sitemap link / accessibility statement link (P1 follow-ups handled by Alex/Will when their docs land).
- Theme toggle / language toggle.

### Dependencies
- Sky confirms which social profiles to list publicly.

---

## Out of scope for the entire backlog (this cycle)

The following are intentionally NOT in v1. Logging here so they don't get smuggled in later as "small adds":

- Analytics of any kind (would need Jordan's review first).
- Login / accounts.
- E-commerce / paid downloads.
- Comment systems, reactions, view counters.
- Multi-language support.
- Dark mode (the warm-cream aesthetic is the brand; no dark variant in v1).
- AI chatbot widget / "ask my portfolio" assistant.

---

## Definition of Done (whole backlog)

A feature is Done when:
1. All its acceptance criteria pass.
2. All five cross-cutting criteria (C-1 through C-5) pass.
3. Alex has signed off on accessibility for that feature's tokens and interactions.
4. Gary has at least one test (visual or behavioral) covering the feature once code lands (next cycle onward).
5. Morgan has logged it as shipped in the cycle qa-report.

---

*Quinn, 2026-05-23 — Day-0 backlog v1. Re-groom next cycle after Sky ratifies DECISIONS and after Dani's PROJECT_DESIGN.md + Dana's DATA_SHAPE.md land.*
