# AI Portfolio — Full Audit 2026-05-25

**Authors:** Quinn (Product), Dani (Design), Alex (Accessibility)
**Branch audited:** `main` (HEAD: `782c4b8`)
**Standard:** WCAG 2.2 Level AA · Constitution v1.11 Art. 7
**Mode:** READ-ONLY — no source files modified

---

## Summary

The portfolio is structurally solid: Next.js 15 static export, clean TypeScript (0 errors), 40/40 tests passing, 0 lint errors, well-considered design system with WCAG-conscious token choices, and thoughtful accessibility implementation throughout. The primary gaps are content-level — placeholder credential URLs linking to `example.com`, no hero images loaded in `public/`, and the Pac-Man Code Trainer project is entirely absent from the portfolio despite being a listed project in Sky's memory. A second tier of issues covers missing OG/social meta tags, mobile lacking a site wordmark, and a minor `focus` vs `focus-visible` inconsistency in the SkipLink component.

---

## Quinn — Product Assessment

### Strengths

- **Four of five projects are represented.** AccessMap, Claude Corp, Prompt Library, and Mutual Mesh all have detail pages and cards. GitHub links and live demo links are wired and pointing at real URLs.
- **Clear primary CTA.** Hero "View the work" button, sidebar "Get in touch" button, and contact section are all well-placed. No competing CTAs above the fold.
- **Story arc exists.** Hero → Work → Process → About → Certificates → Contact is a coherent, logical flow. The "Three quiet steps" Process section effectively conveys how Sky approaches work.
- **Contact path is frictionless.** mailto-only, email visible, socials linked. Exactly what Persona 1 (Maya the recruiter) needs.
- **Certificates page is present.** Five credentials are listed. Issuers (Anthropic, Google Cloud, DeepLearning.AI, IBM, Microsoft) are credible and name-recognizable.

### Gaps

1. **Pac-Man Code Trainer is missing.** The project registry lists it as one of Sky's five projects (live at `skypie99.github.io/pacman-code-trainer/`). It is not in `content/deliverables.json` and has no card or detail page. This is Sky's only project that is unambiguously user-facing and live — it shows personality, playfulness, and shipping ability. Missing it makes the portfolio feel incomplete.

2. **All five credential URLs are `example.com` placeholders.** `content/certificates.json` has `https://example.com/credentials/...` for every entry. Any recruiter who clicks "View credential" lands on a dead page. This actively undermines trust.

3. **No hero images in `public/`.** The only file in `public/` is `.nojekyll`. Every project card and detail page renders a blush placeholder block (the `img::before` graceful-degradation pattern works, but the site looks clearly unfinished to a first-time visitor).

4. **No OG / social share meta tags.** `layout.tsx` generates title + description but has no `openGraph` or `twitter` metadata. When someone shares the portfolio URL on LinkedIn, Slack, or Twitter, no preview image or rich card renders — just a plain blue link. For a portfolio designed to be shared by recruiters, this is a significant gap.

5. **Tagline is too abstract for Maya persona.** "Building thoughtful AI work, one careful deliverable at a time." is elegant but does not include the word "engineer," a specific skill claim, or a domain hook. Riley's persona doc (Persona 1, Maya) explicitly warns: "a serif headline is fine. A serif headline plus 600 words of prose before the first project tile is fatal for Maya." The tagline could do more work: adding "AI engineer · accessibility · tools" anywhere above the fold would help.

6. **Role labels lack specificity.** "Solo builder," "Architect," "Lead engineer" are fine, but none say "AI engineer" explicitly. The word "AI" only appears in the eyebrow label ("AI Portfolio — 2026") and one About section heading ("I build AI tools with care."). A recruiter skimming in 10 seconds may not see it.

7. **Tech stack entry "Solo build" is not a technology.** `content/deliverables.json` for Prompt Library has `"tech": ["Next.js", "AI", "Solo build"]`. "Solo build" belongs in the role field, not tech. "AI" alone is too vague — should be "Claude API" or "Anthropic SDK."

8. **No breadcrumb or contextual navigation on the homepage.** On the inner pages (`/work/[slug]`), breadcrumbs work well. But on the homepage, a visitor landing from a direct link to the site has no persistent visible wordmark on mobile — the sidebar is hidden and the hamburger menu doesn't show the site name in its nav items.

### Priority Improvements (1 = most important)

1. Add Pac-Man Code Trainer to `content/deliverables.json` with GitHub + live demo links.
2. Replace all five `example.com` credential URLs with real credential URLs.
3. Add OG and Twitter meta tags to `layout.tsx` (title, description, image).
4. Add project hero images to `public/images/deliverables/` (at minimum for AccessMap, the featured card).
5. Fix tech stack in Prompt Library entry: replace "AI" → "Claude API" and remove "Solo build" from tech array (move that signal to the role field or summary).
6. Strengthen the tagline or add a one-line specialization line below the name in the sidebar to name the discipline ("AI engineer · accessibility · tools").

---

## Dani — Design Assessment

### Strengths

- **Token system is rigorously consistent.** Every component traces back to CSS variables and Tailwind aliases. No one-off hex values found. The terracotta/umber split (graphics vs. text) is correctly applied throughout.
- **Typography hierarchy is clear and restrained.** Cormorant at display sizes, DM Sans for body, DM Mono for metadata labels. The 12px label / 11px meta / 16px body / 36px display-m / 52px display-l scale is applied cleanly.
- **Whitespace is generous and intentional.** `py-24 lg:py-32` section padding, `max-w-content` constraint, and the `max-w-[640px]` body text cap are all executed correctly.
- **Motion system is well-documented and consistent.** The four duration tokens (fast/base/slow/reveal) are used correctly throughout. `prefers-reduced-motion` is respected everywhere.
- **The warm-cream aesthetic is achieved.** Cream backgrounds, blush cards, peach-cream callout panel — the palette reads as warm and considered without being garish.
- **Footer three-column layout (lg:grid-cols-3) and terracotta signature dot** are a nice finishing touch consistent with the ffern reference.
- **ProjectCard placeholder overlay** (role eyebrow + Cormorant title) turns empty image wells into intentional editorial cards — far better than a broken-image fallback.

### Issues

1. **Mobile has no visible wordmark.** On screens below 768px, the Sidebar (`hidden md:flex`) disappears entirely. The HamburgerNav overlay shows nav items ("Home," "Work," "Certificates," "About," "Contact") but no site name ("Sky Halisky"). A visitor on mobile has no visual anchor for whose portfolio this is unless they read the hero heading. The wordmark should appear top-left on mobile — either in the hamburger overlay header or as a fixed/sticky element in the main content area.

2. **No real hero images anywhere.** `public/` contains only `.nojekyll`. Every `<img>` in the site 404s silently (the `img::before` blush overlay gracefully hides this). For a portfolio site that lives or dies on first impression, launching with zero real imagery is a risk. The Prompt Library screenshot (which is a Next.js web app) could be screenshotted easily.

3. **Certificate badge images are also missing.** Same as above — `public/images/certificates/` doesn't exist. The blush square placeholder is acceptable as a temporary state but should be replaced.

4. **The "Featured" project in the sidebar links to AccessMap, but the featured dot on the homepage work list also marks AccessMap.** This double-featuring is consistent, but if Sky wants Claude Corp or another project featured differently in the sidebar vs. the homepage, there is no mechanism for that divergence. Not a bug, but a design decision to surface.

5. **`content/certificates.json` has `expiresDate` for Google Cloud ML Engineer, but the homepage certificates section does NOT show expiry dates** while the dedicated `/certificates` page also omits them (per the comment "DATA_SHAPE.md we do NOT show expiresDate publicly"). This is a deliberate decision, but the homepage does surface the date via `toLocaleDateString` with `year` + `month` only — confirming the hiding is intentional. However, the published cert list shows IBM's 2024 cert with no expiry, which may look stale. Consider adding "active" vs "archived" status.

6. **No visual differentiation between GitHub links and demo links on the homepage.** Both render as identical `font-mono uppercase` text arrows. A GitHub icon (SVG, 16px) would instantly communicate "source" vs. "live."

7. **The Contact section heading (`"Have an AI project worth building?"`) presupposes a specific kind of collaborator.** A general recruiter reading this as the final CTA might feel slightly excluded. Consider a secondary CTA line for recruiting context ("or just want to chat about AI engineering").

8. **About page bio copy is identical to the Homepage About section.** `/app/about/page.tsx` and `/app/page.tsx` both render the same three body paragraphs word-for-word. The About page should expand on the bio rather than repeat it.

### Priority Improvements (1 = most important)

1. Add a visible wordmark to mobile — place "Sky Halisky" in serif at the top of the hamburger overlay (above the nav items list), matching the sidebar wordmark treatment.
2. Add at minimum 1 real hero image for the AccessMap featured card (screenshot or designed mockup) — this is the first visible card a visitor encounters.
3. Expand the About page bio — write 2–3 original paragraphs distinct from the homepage About section.
4. Add GitHub/external SVG icons to differentiate link types on project cards (16px, `aria-hidden`).
5. Add expiry/active status signals to the certificates page for credentials with `expiresDate`.

---

## Alex — Accessibility Assessment

### Passing

- **Skip link** is present as the first child of `<body>` and uses `sr-only` → visible on `:focus`. Correct implementation. (Minor issue noted below re: `focus` vs `focus-visible`.)
- **`<html lang="en">`** is set in `layout.tsx`.
- **HamburgerNav** has complete ARIA: `aria-expanded`, `aria-controls`, `aria-label` (dynamic "Open/Close navigation menu"), `role="dialog"`, `aria-modal="true"`, `aria-label="Primary menu"`. Focus trap is implemented. Escape key closes. Focus returns to trigger on close. Body scroll is locked during open.
- **All img tags have non-empty alt text.** Hero images use descriptive alt text in `content/deliverables.json`/`content/certificates.json`. Badge images are similarly described. The `aria-hidden` placeholder overlays are correctly hidden from assistive tech.
- **All external links include `rel="noopener noreferrer"` and an `<span class="sr-only">(opens in new tab)</span>` cue.** Consistent across Footer, Contact page, and work detail pages.
- **Focus-visible ring** is globally set: `*:focus-visible { outline: 2px solid #B35F32; outline-offset: 2px; }`. Terracotta at 4.33:1 on cream passes the 3:1 non-text UI threshold (WCAG 1.4.11). ProjectCard has an explicit `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta` reinforcing the global rule.
- **Heading order is logical.** `h1` on every page, `h2` for sections (or `sr-only` where visually suppressed), `h3` for cards. The `sr-only` section headings on `/work` and `/certificates` close the `h1 → h3` gap correctly.
- **`aria-current="page"`** is applied to the active HamburgerNav item. On anchor hash links it only fires for the "Home" item (correct — hash links are all on the same page).
- **`<main id="main" tabIndex={-1}>`** in `layout.tsx` is correct — `tabIndex={-1}` allows programmatic focus from the skip link without placing main in the tab order.
- **Breadcrumb nav** on detail pages uses `<nav aria-label="Breadcrumb">` + `<ol>` with `aria-current="page"` on the current item. Correct pattern.
- **All descriptive link labels.** No "click here" or bare "→" text found. Every interactive link has a meaningful accessible name (`aria-label` or visible text).
- **Reduced motion** is respected via `@media (prefers-reduced-motion: reduce)` in globals.css and `useReducedMotion()` in HamburgerNav. Hero entrance, reveal-on-scroll, and CTA dot pulse all obey this media query.
- **`aria-hidden="true"`** is correctly applied to all decorative elements: numbered indices, terracotta dots, directional arrows.
- **Color contrast:** The WCAG audit from `docs/ACCESSIBILITY.md` was integrated into the design tokens. Key text pairs all pass: Near Black on Cream (14.82:1), Charcoal on Cream (8.53:1), Umber/accent-text on Cream (7.30:1), sage-text `#5C5D54` on cream (passes 4.5:1), Tag Pill Umber on Sand (5.36:1).

### Failures / Risks

1. **SkipLink uses `:focus` not `:focus-visible` (WCAG 2.4.11 — Non-default Focus Appearance).** `/Users/skypie/Portfolio/components/SkipLink.tsx` uses Tailwind `focus:not-sr-only` / `focus:fixed` etc. This means the skip link becomes visible on mouse click (when the element receives programmatic `:focus`), not just on keyboard navigation (`:focus-visible`). This is a minor cosmetic issue — the skip link should only visibly appear for keyboard users. Fix: change `focus:` to `focus-visible:` on all relevant classes.

2. **`NumberedStep` numerals are `aria-hidden="true"` — this is correct — but the accessible name of each step depends entirely on the visible `<h3>` title.** The number ("01", "02", "03") is purely decorative. However, if a screen reader user navigates by headings, they get "Discover," "Build," "Ship" without the numbering context. This is acceptable (the ordinal context comes from the `<ol>` wrapping them on pages where they're used), but the homepage uses `<ol>` + `<li>` correctly.

3. **Missing `lang` on the HamburgerNav `role="dialog"` landmark.** The dialog element itself does not declare a `lang` attribute, but it inherits from `<html lang="en">` — this is not a failure, just a note that it is dependent on inheritance.

4. **Certificate "View credential" links point to `example.com`.** These open in `target="_blank"`, which means a keyboard user activating "View credential" lands on an unfamiliar dead page. Until real URLs replace the placeholders, any keyboard user following these links encounters a confusing experience. Not a WCAG failure per se, but a usability/trust failure.

5. **The `claude-corp-dashboard` slug appears in `generateStaticParams()` (inferred from README) but there is no deliverable with `id: "claude-corp-dashboard"` in `content/deliverables.json`.** The README says "5 prerendered slugs: accessmap, claude-corp, claude-corp-dashboard, prompt-library, mutual-mesh" but `deliverables.json` only has 4 entries. If a user navigates to `/work/claude-corp-dashboard/`, Next.js static export will 404. This should be verified and the slug either added to content or removed from generateStaticParams.

6. **`reveal-on-scroll` class.** Sections use this class but it does not appear to be wired to an `IntersectionObserver`. If it is a CSS-only animation (scroll-driven), verify it degrades gracefully and fires `prefers-reduced-motion`. If it is JavaScript-driven and the observer is missing, sections may stay permanently invisible in a JS-disabled or slow-parse context.

### Priority Improvements (1 = most important)

1. **SkipLink:** Change `focus:` to `focus-visible:` on all Tailwind classes in `/Users/skypie/Portfolio/components/SkipLink.tsx` (lines 12–19). This prevents the skip link from appearing on mouse click.
2. **Verify `claude-corp-dashboard` slug:** Either add a `claude-corp-dashboard` entry to `content/deliverables.json` or confirm `generateStaticParams()` does not list it. If it's a dead slug, remove it to prevent silent 404s.
3. **Audit `reveal-on-scroll`:** Confirm it is wired to an IntersectionObserver or is CSS scroll-driven, and that it degrades safely under `prefers-reduced-motion: reduce`.
4. **Replace placeholder credential URLs** as a prerequisite to the links being accessible in any meaningful sense.

---

## Wave 2 Agent Action List

These are ordered by impact. Each item identifies the exact file, the exact change, and which role is best placed to do it.

### IMMEDIATE — Content fixes (any role with file access)

1. **[Shamus] Add Pac-Man Code Trainer deliverable** — Edit `/Users/skypie/Portfolio/content/deliverables.json`. Add a fifth entry with `id: "pacman-code-trainer"`, `title: "Pac-Man Code Trainer"`, `role: "Solo builder"`, `tech: ["JavaScript", "GitHub Pages", "Game design"]`, `year: 2026`, summary describing the retro flashcard game, `links: [{ label: "GitHub", href: "https://github.com/Skypie99/pacman-code-trainer", type: "github" }, { label: "Live demo", href: "https://skypie99.github.io/pacman-code-trainer/", type: "demo" }]`. Then verify `npm run typecheck && npm run build` still passes.

2. **[Sky action] Replace `example.com` credential URLs** in `/Users/skypie/Portfolio/content/certificates.json`. All five `credentialUrl` values are `https://example.com/credentials/...` placeholders. Sky needs to locate real credential URLs for: Anthropic Claude Engineer, Google Cloud ML Engineer, DeepLearning.AI Prompt Engineering, IBM AI Engineering, Microsoft Responsible AI. Update those five fields.

3. **[Shamus] Fix Prompt Library tech stack** — Edit `/Users/skypie/Portfolio/content/deliverables.json`, Prompt Library entry: change `"tech": ["Next.js", "AI", "Solo build"]` to `"tech": ["Next.js", "Claude API", "localStorage"]`. "Solo build" is not a tech; "AI" is not specific enough.

### ACCESSIBILITY fixes

4. **[Alex/Shamus] Fix SkipLink focus vs focus-visible** — Edit `/Users/skypie/Portfolio/components/SkipLink.tsx`. On lines 12–19, replace every instance of `focus:` with `focus-visible:` in the className string. This prevents the skip link from rendering on mouse click. Example: `focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[9999] focus-visible:px-4 focus-visible:py-3 focus-visible:bg-cream focus-visible:text-near-black focus-visible:border-2 focus-visible:border-accent-primary focus-visible:rounded-md focus-visible:font-mono focus-visible:text-label focus-visible:tracking-label focus-visible:uppercase focus-visible:no-underline`.

5. **[Shamus] Verify `claude-corp-dashboard` slug** — Check `/Users/skypie/Portfolio/app/work/[slug]/page.tsx` in `generateStaticParams()`. The README says 5 prerendered slugs including `claude-corp-dashboard`, but `content/deliverables.json` has no entry with that id. Either: (a) add a `claude-corp-dashboard` deliverable to `deliverables.json`, or (b) if it was removed, confirm `generateStaticParams()` iterates `getDeliverables()` dynamically (which it does — `return getDeliverables().map((d) => ({ slug: d.id }))`). Since `generateStaticParams` maps live deliverables, if `claude-corp-dashboard` was deleted from the JSON, the dead route no longer prebuilds. The README is just stale. Update the README's "5 prerendered slugs" line to "4 prerendered slugs."

6. **[Shamus/Dani] Audit `reveal-on-scroll`** — Search `globals.css` for `.reveal-on-scroll` definition. If it uses `opacity: 0` as its initial state and requires JavaScript to add a class, verify the IntersectionObserver is initialized somewhere (likely `HamburgerNavMount.tsx` or a separate Client Component). If it is purely CSS scroll-driven animation (`animation-timeline: scroll()`), confirm the `@media (prefers-reduced-motion: reduce)` block in `globals.css` resets it.

### DESIGN improvements

7. **[Dani/Shamus] Add wordmark to mobile (hamburger overlay)** — Edit `/Users/skypie/Portfolio/components/HamburgerNav.tsx`. Inside the `<motion.div>` overlay, before the `<nav aria-label="Primary menu">`, add the site wordmark as a non-interactive element:
   ```tsx
   <p className="font-serif font-normal text-display-s text-near-black mb-12 self-start">
     Sky Halisky
   </p>
   ```
   Pull the name from `profile.json` (the component does not currently import `getProfile`, but since HamburgerNav is a Client Component you can pass the name as a prop from `HamburgerNavMount` or hardcode it from profile.json — pass as prop is cleaner).

8. **[Dani/Shamus] Expand About page bio** — Edit `/Users/skypie/Portfolio/app/about/page.tsx`. The three body paragraphs (lines ~54–70) are identical to the homepage About section. Replace with a richer version unique to this page: add personal voice, background context, specific interest in accessibility/AI tooling, and what Sky is learning or building next. The homepage condensed version can stay. See `docs/PERSONAS.md` for the voice guidance.

### PRODUCT improvements

9. **[Shamus] Add OG/social meta tags** — Edit `/Users/skypie/Portfolio/app/layout.tsx`. In `generateMetadata()`, add:
   ```ts
   openGraph: {
     title: `${profile.name} — AI Portfolio`,
     description: profile.tagline,
     url: 'https://skypie99.github.io/portfolio/',
     siteName: profile.name,
     type: 'website',
     // Add once an OG image exists:
     // images: [{ url: 'https://skypie99.github.io/portfolio/og-image.png', width: 1200, height: 630 }],
   },
   twitter: {
     card: 'summary_large_image',
     title: `${profile.name} — AI Portfolio`,
     description: profile.tagline,
   },
   ```
   Create a 1200×630 `og-image.png` in `/Users/skypie/Portfolio/public/` (cream background, "Sky Halisky" in Cormorant serif, tagline in DM Mono) — even a simple static version dramatically improves link shares.

10. **[Sky action / Dani] Add real hero images** — At minimum for AccessMap (the featured card). Take a real screenshot of the AccessMap interface or the Vercel deploy (`https://access-map-tau.vercel.app`), drop it at `/Users/skypie/Portfolio/public/images/deliverables/accessmap/hero.jpg`. The expected dimensions per `ProjectCard.tsx` are 900×600 (3:2 ratio, wide-card 1280×720 16:9). Repeat for the other three projects once screenshots are available.

11. **[Dani] Differentiate link types visually** — Edit `/Users/skypie/Portfolio/app/page.tsx` and `/Users/skypie/Portfolio/app/work/[slug]/page.tsx`. GitHub links currently render identically to demo links. Add a GitHub SVG icon (inline, `aria-hidden="true"`, 14px) before the "GitHub" label and an external-link SVG for "Live demo." This communicates link intent without adding text.

---

## TypeScript / Test Status

```
typecheck:  PASS — 0 errors (tsc --noEmit --strict)
lint:       PASS — 0 ESLint warnings or errors
             (Note: `next lint` deprecation warning in Next 16 — migrate to ESLint CLI
             per the codemod: `npx @next/codemod@canary next-lint-to-eslint-cli .`)
tests:      PASS — 40/40 tests, 10 files
             lib/__tests__/content.test.ts       7/7
             components/__tests__/Hero.test.tsx   3/3
             components/__tests__/Button.test.tsx 3/3
             components/__tests__/ProjectCard.test.tsx 7/7
             components/__tests__/Sidebar.test.tsx    4/4
             components/__tests__/Footer.test.tsx     4/4
             components/__tests__/HamburgerNav.test.tsx 4/4
             components/__tests__/NumberedStep.test.tsx 3/3
             components/__tests__/TagPill.test.tsx      3/3
             components/__tests__/SkipLink.test.tsx     2/2
build:      NOT RUN this audit cycle (read-only audit). Last known build: clean
             (per README cycle 4-6 notes and Morgan ship briefing 2026-05-24)

Note: Vitest CJS deprecation warning observed (`The CJS build of Vite's Node API
is deprecated`). Not a test failure, but worth migrating to ESM config in
vite.config.ts at next opportunity.
```

---

## Decisions for Sky

1. **Pac-Man Code Trainer inclusion** — Should Shamus add it to the deliverables list? Recommended: yes. Confirm whether the featured slot should be AccessMap (current) or rotated.
2. **Real credential URLs** — Sky needs to supply the actual URL for each certificate's credential verification page. Agents cannot look these up on Sky's behalf.
3. **Hero images** — Does Sky want agents to generate placeholder editorial-style imagery (DALL-E / Midjourney / screenshotted UI), or will Sky source them? The design spec calls for "warm, natural-light, off-center-composed editorial imagery" — generated AI images may or may not fit that bar.
4. **OG image** — Confirm whether Shamus should generate a simple typographic OG card (cream bg + wordmark) programmatically, or if Sky wants to design one.
5. **About page bio** — Sky's voice only. Agents can draft options but Sky should write or approve the final copy.
