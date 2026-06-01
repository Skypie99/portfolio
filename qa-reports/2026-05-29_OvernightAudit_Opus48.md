# Portfolio — Overnight Opus 4.8 Audit (2026-05-29)

> **Run status:** COMPLETE (recovered across two passes — the first hit the session usage limit; bug sweep was re-run). Audit-only — nothing committed, changed, or applied. Every fix below is a proposal.
> **Engine:** Opus 4.8 multi-agent workflows. Bugs: 24 verified (🔴3 🟡8 🟢13), each survived 2-skeptic adversarial refutation. Architecture: 35 findings (🔴3 🟡15 🟢17).

## §1 DECISIONS FOR SKY
- [ ] **[BUG] Internal links in ProjectCard use raw <a> instead of next/link — drop the production basePath and 404** — `components/ProjectCard.tsx:128-129, 166`
  - Proposed fix (NOT applied): Replace the two raw `<a href={`/work/${d.id}/`}>` elements in ProjectCard with `import Link from 'next/link'` and `<Link href={`/work/${d.id}/`}>`. Next will then prepend the basePath in production. The external demo/github anchors can stay raw `<a>` (they're absolute https URLs). Add a static-integrity assertion that no emitted internal href start
- [ ] **[BUG] AppMockup renders nothing for the pacman-code-trainer deliverable (blank mockup well on its card)** — `components/AppMockup.tsx:12, 343-371 (consumed in ProjectCard.tsx:109-112)`
  - Proposed fix (NOT applied): Add a 'pacman-code-trainer' case to AppMockup (a browser- or arcade-frame screen, matching the others) and add it to the AppMockupSlug union. Then remove the unsafe `as`-cast in ProjectCard.tsx:109-112 and type the prop honestly (e.g. accept `slug: string` and render a neutral fallback frame for any unknown slug) so a future added deliverable can n
- [ ] **[BUG] All certificate badge images are missing from disk — every certificate renders a broken image in production** — `content/certificates.json:all 6 entries (badgeImage.src)`
  - Proposed fix (NOT applied): Add the missing badge PNGs under public/images/certificates/<slug>/badge.png, OR add a build-time/static-integrity check that resolves every heroImage.src / badgeImage.src / gallery[].src against public/ (or out/) and fails if the file is absent. Extend static-integrity.test.ts to extract <img src> in addition to <a href>. This catches the whole cl
- [ ] **[ARCH] ProjectCard ships broken transition: duration-280 / duration-520 / scale-102 are no-op classes absent from compiled CSS** — ``
  - Proposed fix (NOT applied): Replace `duration-280`→`duration-base` and `duration-520`→`duration-slow` everywhere. Replace `group-hover:scale-102` with an arbitrary value `group-hover:scale-[1.02]` (or add a `102` key to theme.extend.scale). Replace the meaningless `group-hover:opacity-change` with the actual intent (e.g. `group-hover:opacity-100` on an element starting at a l
- [ ] **[ARCH] OG/canonical metadataBase points at the wrong GitHub Pages domain** — ``
  - Proposed fix (NOT applied): Replace the hardcoded 'skylerhalisky.github.io' with the canonical 'https://skypie99.github.io/portfolio'. Better: stop hardcoding the host in two files — derive siteUrl from a single source (e.g. a SITE_URL constant in lib/, or read profile.socials github handle) so the domain can never drift again. Add a unit/static-integrity assertion that every
- [ ] **[ARCH] Two GitHub Pages deploy workflows both trigger on push to main** — ``
  - Proposed fix (NOT applied): Delete .github/workflows/nextjs.yml (the scaffolded duplicate). Keep deploy.yml as the single source of deploy truth per the DEPLOY_PLAN ownership note in its header. Verify only one workflow owns the 'pages' concurrency group. Document in docs/DEPLOY_PLAN.md that nextjs.yml was removed to avoid the double-deploy race.

## §2 Blockers / Fail-Fast
- See §1. All 🔴 items are pre-launch/correctness blockers. Portfolio's span a broken animation, wrong OG/canonical domain, and duplicate deploy workflows.

## §3 Summary
Opus 4.8 ran an exhaustive, audit-only review of Portfolio: a multi-lens bug/correctness sweep (adversarially verified) plus a per-layer architecture/tech-debt pass. It produced 24 verified bugs and 35 architecture findings, each with a file-level reference and a proposed (unapplied) fix. No code was modified.

## §4 What Shipped
Nothing — audit-only. Zero edits, zero commits, zero DB changes, zero deploys.

## §5 What's Proposed
Every item in §6 is a proposal only. Themes: build/deploy config, Next 15 params contract, dead code, content↔UI drift, and Tailwind/token discipline.

## §6 Findings by Domain

### §6a Bugs & Correctness  (24 verified)
#### 1. 🔴 Internal links in ProjectCard use raw <a> instead of next/link — drop the production basePath and 404  ·  _blocker_
`components/ProjectCard.tsx:128-129, 166` · lens: Logic correctness / routing · verify: 2/2 skeptics could not refute

ProjectCard renders the card title link and the "Case study" CTA as raw `<a href={`/work/${d.id}/`}>` (lines 128-129 and 165-166) rather than Next's `<Link>`. With `basePath: '/portfolio'` in production, Next only rewrites `<Link>` hrefs — raw `<a>` strings are emitted verbatim. I confirmed this against the built output: `out/index.html` contains both `href="/portfolio/work/accessmap/"` (from a real `<Link>`) AND `href="/work/accessmap/"` (from ProjectCard's raw anchor). In production the card title and primary CTA therefore point at `https://skypie99.github.io/work/accessmap/`, which does not exist under the `/portfolio` base — every project card's main link 404s. This is the primary navigation path on the homepage and /work index.

**Why it matters:** The headline interaction of the portfolio (open a project) is broken in production for all five deliverables.

**Proposed fix (NOT applied):** Replace the two raw `<a href={`/work/${d.id}/`}>` elements in ProjectCard with `import Link from 'next/link'` and `<Link href={`/work/${d.id}/`}>`. Next will then prepend the basePath in production. The external demo/github anchors can stay raw `<a>` (they're absolute https URLs). Add a static-integrity assertion that no emitted internal href starts with `/work/` without the `/portfolio` prefix in a prod build.

#### 2. 🔴 AppMockup renders nothing for the pacman-code-trainer deliverable (blank mockup well on its card)  ·  _blocker_
`components/AppMockup.tsx:12, 343-371 (consumed in ProjectCard.tsx:109-112)` · lens: Logic correctness + type-safety (unsafe cast hiding a real gap) · verify: 2/2 skeptics could not refute

content/deliverables.json now contains FIVE deliverables, including id "pacman-code-trainer" (lines 107-141 of deliverables.json). AppMockup's slug union (AppMockupSlug, line 12) only knows four slugs: 'accessmap' | 'claude-corp' | 'prompt-library' | 'mutual-mesh'. The component body (lines 348-367) has a conditional block per known slug and NO default/fallback branch, so for slug='pacman-code-trainer' it renders only the empty <div className='mockup-float'> wrapper — no phone/browser frame at all. ProjectCard.tsx line 110 hard-casts `slug={d.id as 'accessmap' | 'claude-corp' | 'prompt-library' | 'mutual-mesh'}`, an unsafe assertion that lies to the compiler (which is why typecheck stays green) and suppresses the very error that would have caught this. Result: the Pac-Man card on the homepage Work grid and on /work renders a visibly empty gradient box where every other card shows an animated mockup. grep confirms no 'pacman' handling in AppMockup.

**Why it matters:** This is a public portfolio whose entire pitch is 'everything here is live and shipped.' A card with a blank preview box reads as a broken/unfinished project to recruiters — the exact opposite of the intended signal, and it is shipped to production on the next push.

**Proposed fix (NOT applied):** Add a 'pacman-code-trainer' case to AppMockup (a browser- or arcade-frame screen, matching the others) and add it to the AppMockupSlug union. Then remove the unsafe `as`-cast in ProjectCard.tsx:109-112 and type the prop honestly (e.g. accept `slug: string` and render a neutral fallback frame for any unknown slug) so a future added deliverable can never again silently produce a blank mockup. At minimum, give AppMockup a default branch that renders a generic frame instead of nothing.

#### 3. 🔴 All certificate badge images are missing from disk — every certificate renders a broken image in production  ·  _blocker_
`content/certificates.json:all 6 entries (badgeImage.src)` · lens: Data integrity / edge cases · verify: 2/2 skeptics could not refute

Every one of the 6 certificates references a badgeImage.src under /images/certificates/<slug>/badge.png, but the public/images/certificates/ directory does not exist at all (public/images/ contains only deliverables/). I verified each referenced file on disk: all 6 are MISSING. The Zod ImageSchema only validates the path *string shape* (z.string().startsWith('/images/') plus the regex /^\/images\/certificates\/[a-z0-9-]+\//), never that the file exists. The static-integrity test (lib/__tests__/static-integrity.test.ts) only checks anchor href resolution and external rel attributes — it never validates <img> src targets. So the build passes, 40 tests pass, and the live certificates page shows 6 broken badge images.

**Why it matters:** This is a public-facing portfolio whose entire credentials page is visibly broken, with zero detection in the test suite or build. It is the exact 'silent user-facing break' the static-integrity test claims to guard against, but for images instead of links.

**Proposed fix (NOT applied):** Add the missing badge PNGs under public/images/certificates/<slug>/badge.png, OR add a build-time/static-integrity check that resolves every heroImage.src / badgeImage.src / gallery[].src against public/ (or out/) and fails if the file is absent. Extend static-integrity.test.ts to extract <img src> in addition to <a href>. This catches the whole class of missing-asset bugs, not just these six files.

#### 4. 🟡 404 page 'Back to the homepage' Button links to GH Pages root, not the portfolio  ·  _should-fix_
`app/not-found.tsx:42` · lens: Logic correctness / routing · verify: 2/2 skeptics could not refute

`<Button href="/">Back to the homepage</Button>` renders a raw `<a href="/">` (Button.tsx emits a plain anchor, lines 111-121, never a next/link). Confirmed in built output: `out/404.html` contains `href="/"` with no basePath. In production that resolves to `https://skypie99.github.io/` — the user's GitHub Pages account root — not `https://skypie99.github.io/portfolio/`. A visitor who hits a 404 and clicks the primary recovery button is sent off the site entirely. The secondary `<Link href="/work/">` on the same page is correct because it uses next/link.

**Why it matters:** The 404 recovery path strands users on the wrong site in production.

**Proposed fix (NOT applied):** Either make Button render a next/link for internal hrefs, or in not-found.tsx use the homepage CTA via `<Link>` / pass an already-based path. Simplest: change the recovery button to a `<Link href="/">` styled as a button, matching how the secondary link is done. Audit every `<Button href="/...">` with an internal path (Sidebar/contact use mailto: which is fine; not-found is the internal one).

#### 5. 🟡 AppMockup has no branch for the 'pacman-code-trainer' deliverable — blank mockup well  ·  _should-fix_
`components/AppMockup.tsx:343-371` · lens: Edge cases / data-model drift · verify: 2/2 skeptics could not refute

deliverables.json now contains 5 entries including `id: "pacman-code-trainer"` (added at lines 107-141 of the JSON). AppMockup's slug union and render switch only handle `'accessmap' | 'claude-corp' | 'prompt-library' | 'mutual-mesh'` (line 12 and the four `slug === ...` branches at 348-367). For the pacman card none of the conditionals match, so AppMockup renders only the empty floating wrapper `<div className="mockup-float">` with no frame inside — the card's mockup area shows the bare blush→peach gradient with no content. Worse, ProjectCard force-casts `d.id as 'accessmap' | 'claude-corp' | 'prompt-library' | 'mutual-mesh'` (ProjectCard.tsx line 110), so TypeScript can't catch this drift — the unsafe cast hides the missing case at compile time.

**Why it matters:** One of five featured projects shows an empty preview tile, and the unsafe cast guarantees future deliverables silently repeat the bug.

**Proposed fix (NOT applied):** Add a `pacman-code-trainer` branch to AppMockup (a browser- or arcade-frame screen) and add 'pacman-code-trainer' to the AppMockupSlug union. Remove the unsafe `as` cast in ProjectCard.tsx line 110 and instead type `slug` as `Deliverable['id']` or validate, so a future new deliverable id is a compile error until a mockup exists. Optionally render a neutral fallback frame for unknown slugs.

#### 6. 🟡 Homepage assumes deliverables[0] is the featured project; relies on sort coincidence, not the featured flag  ·  _should-fix_
`app/page.tsx:157-165` · lens: Logic correctness / data integrity · verify: 2/2 skeptics could not refute

The homepage renders `deliverables[0]` as the full-width `wide` featured card and `deliverables.slice(1)` as the rest, with a comment 'Remaining 3' (line 162). But getDeliverables() (lib/content.ts:70) sorts ONLY by `year` descending. All five deliverables are year 2026, so ordering among them is just stable-sort input order — `deliverables[0]` happens to be 'accessmap' which happens to be featured today. Nothing guarantees the element at index 0 is the one with featured:true. The /work page does this correctly via `deliverables.find(d => d.featured)` (work/page.tsx:42-44). If the featured flag is moved to another project (or accessmap is reordered/removed in the JSON), the homepage would promote a NON-featured project to the wide hero slot while the actual featured project gets a small card — a silent content bug. The comment 'Remaining 3' is also stale now that there are 5 deliverables (slice(1) yields 4).

**Why it matters:** Couples the most prominent homepage slot to array position rather than the explicit featured invariant the schema and lib enforce everywhere else, so an innocent JSON edit can quietly demote the project Sky wants front-and-center.

**Proposed fix (NOT applied):** Mirror the /work page logic: `const featured = deliverables.find(d => d.featured); const rest = deliverables.filter(d => d !== featured);` then render `featured` as the wide card and `rest` in the grid (handle the zero-featured case the way the sidebar fallback does). Update the stale 'Remaining 3' comment to 'Remaining deliverables'.

#### 7. 🟡 ProjectCard always renders a '·' separator after 'Case study', even when no demo/github links follow it  ·  _should-fix_
`components/ProjectCard.tsx:178-210` · lens: Edge cases (empty/optional data) + conditional rendering · verify: 2/2 skeptics could not refute

The CTA row renders the 'Case study →' link, then an UNCONDITIONAL middot separator `<span aria-hidden="true" className="text-stone">·</span>` (line 178), then conditionally renders the Live demo link (line 179, only if demoLink) and the GitHub link (line 195, only if githubLink). A deliverable with no demo and no github link (links is optional in the schema, and 'demo'/'github' are only two of five allowed link types) will render 'Case study → ·' with a dangling trailing separator and nothing after it. Today every entry in deliverables.json carries both a github and demo link so it doesn't visibly break, but the schema explicitly permits links to be omitted or to contain only e.g. a 'writeup' type — this is a latent defect waiting on the next content edit.

**Why it matters:** A stray '·' with no following link is a visible polish defect on a luxury-editorial portfolio, and it will appear the moment a deliverable is added without a demo+github link — exactly the kind of low-friction content change the JSON-driven design invites.

**Proposed fix (NOT applied):** Only render the separator when at least one trailing link exists, e.g. `{(demoLink || githubLink) && <span aria-hidden="true" className="text-stone">·</span>}`. Better: build the CTA items into an array and join them with separators so multiple separators can never desync from the items.

#### 8. 🟡 Homepage #work hardcodes deliverables[0] as featured but renders a blank mockup card for pacman-code-trainer  ·  _should-fix_
`app/page.tsx:157-165` · lens: Logic correctness / data integrity · verify: 2/2 skeptics could not refute

deliverables.json now contains 5 entries (accessmap, claude-corp, prompt-library, pacman-code-trainer, mutual-mesh). The homepage Work grid renders deliverables[0] as the wide/featured card, then deliverables.slice(1).map(...) for the remaining FOUR — which now includes pacman-code-trainer. ProjectCard's mockup area calls <AppMockup slug={d.id as 'accessmap'|'claude-corp'|'prompt-library'|'mutual-mesh'} />, and AppMockup has no branch for 'pacman-code-trainer', so that card shows an empty gradient box with only the Featured/Live badges and no preview. The doc comment at lines 16-21 still says '#work — All 4 deliverables', confirming the section was written for 4 items, not 5. The 5th deliverable silently degrades.

**Why it matters:** A visitor on the homepage sees one project card with an empty preview area, which reads as a broken image / unfinished site on the primary landing page.

**Proposed fix (NOT applied):** Either (a) add a 'pacman-code-trainer' branch to AppMockup with its own mockup screen, or (b) have the homepage explicitly select which deliverables to showcase rather than blindly slicing all of them, and (c) update the stale '#work — All 4 deliverables' comment. Long-term, AppMockup's slug prop should accept Deliverable['id'] and render a graceful generic fallback for any unknown slug instead of nothing.

#### 9. 🟡 AppMockup injects a duplicate global <style> keyframe block for every card instance  ·  _should-fix_
`components/AppMockup.tsx:346 (AppMockup return) with floatStyles defined at 331-339` · lens: React/RN correctness · verify: 2/2 skeptics could not refute

AppMockup renders `<style>{floatStyles}</style>` inside the component body, so a fresh identical `@keyframes mockup-float` + `.mockup-float` rule is emitted once per AppMockup instance. The homepage `/` renders one ProjectCard per deliverable (currently 5 in deliverables.json) and `/work` renders all of them too, so the static HTML ends up with 5 copies of the exact same global keyframe/style block on those pages. The keyframe and the `.mockup-float` class are global (not scoped), so every duplicate redefines the same global animation — pure redundancy that bloats the HTML payload and pollutes the global style scope. It also means the float animation rule's presence is coupled to whether any card happens to render, rather than being a stable global.

**Why it matters:** Repeated identical global style blocks bloat every page that lists projects and violate the 'Tailwind only / CSS in globals.css' convention in CLAUDE.md. It is also a latent footgun: the animation only exists if a card renders.

**Proposed fix (NOT applied):** Move `floatStyles` out of the per-instance render. Either inject it once globally in `app/globals.css` (it's a static keyframe, already gated behind prefers-reduced-motion) and delete the inline `<style>` from AppMockup, or render the `<style>` from a single shared parent/once-guard rather than inside every AppMockup. globals.css is the cleanest since the keyframe is fully static.

#### 10. 🟡 Future-dated blog post is published and shown as if already live  ·  _should-fix_
`content/blog.json:6 ("publishedDate": "2026-05-30") with line 9 "draft": false` · lens: edge cases / data integrity · verify: 2/2 skeptics could not refute

Today is 2026-05-29 but the only blog post 'building-accessmap' has publishedDate '2026-05-30' (tomorrow) and draft:false. getBlogPosts() (lib/content.ts:110-112) filters only on `!p.draft` and sorts by publishedDate string — it does NOT exclude future-dated posts. So the blog index (app/blog/page.tsx) renders the post now with a <time> reading 'May 30, 2026', a date in the future relative to the visitor. BlogPostSchema (schema.ts:130) validates the YYYY-MM-DD format but has no not-in-future constraint, unlike the deliverable `year` field which caps at next year.

**Why it matters:** A live blog showing a post dated in the future (and labelled a placeholder) reads as broken/unfinished to anyone who lands on /blog before the intended publish moment.

**Proposed fix (NOT applied):** Either correct the date in blog.json to today/past, or set draft:true until it should go live, or add a future-date guard: in getBlogPosts() filter out posts whose publishedDate > today's ISO date (e.g. `.filter(p => p.publishedDate <= new Date().toISOString().slice(0,10))`), and/or add a Zod refine to BlogPostSchema rejecting future publishedDate. The post body also says 'This Post Is a Placeholder' — it should not be live regardless.

#### 11. 🟡 parseInline mis-parses literal/standalone asterisks into spurious <em> tags  ·  _should-fix_
`app/blog/[slug]/page.tsx:96-108` · lens: logic correctness / edge cases · verify: 2/2 skeptics could not refute

parseInline splits paragraph text on /(\*\*[^*]+\*\*|\*[^*]+\*)/g and treats any `*…*` run as italic. Because the regex matches greedily across word boundaries, any prose that uses an asterisk for multiplication, footnotes, or emphasis spanning across a later asterisk is mangled. Traced concretely: the string 'Why is this button 44*44 pixels? Because *every* pixel counts' renders as '44<em>44 pixels? Because </em>every* pixel counts' — the renderer pairs the FIRST `*` with the next `*`, eating real text into a bogus <em> and leaving a dangling literal `*`. The current blog.json happens to use the '×' glyph so it is latent, but the WHOLE article body is user/content-authored markdown and the first time anyone writes '5 * 3' or an unmatched asterisk the post body silently corrupts. There is no escaping mechanism.

**Why it matters:** Blog content is the product here; a renderer that silently corrupts prose containing an asterisk produces visibly broken published pages with no build-time warning.

**Proposed fix (NOT applied):** Require the italic/bold delimiters to be word-boundary anchored (e.g. only treat `*x*` as italic when not surrounded by alphanumerics), or switch to a tested markdown library (react-markdown/marked) as the renderer's own doc comment suggests for anything beyond trivial content. At minimum, change the italic branch to ignore single asterisks that are flanked by digits/spaces on both sides, and add a unit test covering '5 * 3' and '44*44'.

#### 12. 🟢 Homepage hardcodes deliverables[0] as the 'wide/featured' card regardless of the featured flag  ·  _nice-to-have_
`app/page.tsx:157-165` · lens: Logic correctness · verify: 2/2 skeptics could not refute

The homepage Work grid hoists `deliverables[0]` into the full-width `<ProjectCard ... wide>` slot and renders the rest with `.slice(1)`. This assumes the array's first element is the featured one. getDeliverables() sorts by `b.year - a.year` (content.ts line 70); all current deliverables are year 2026, so the sort is a no-op and accessmap (the featured one, first in JSON) happens to land at index 0. But the featured invariant is independent of array position — if the featured deliverable were authored later in the JSON, or a future deliverable had a higher year, `deliverables[0]` would be a non-featured project getting the cinematic wide treatment while the actually-featured one renders as a normal card. The /work index page does this correctly (work/page.tsx lines 42-44 explicitly find `featured`).

**Why it matters:** Changing which project is featured (a documented, supported edit) would silently mis-style the homepage.

**Proposed fix (NOT applied):** Mirror the /work page logic on the homepage: `const featured = deliverables.find(d => d.featured); const rest = deliverables.filter(d => !d.featured); const ordered = featured ? [featured, ...rest] : rest;` then render `ordered[0]` wide. Or pass `wide={d.featured}` and reorder. This removes the positional assumption.

#### 13. 🟢 certificates.json carries a credentialId field that the schema silently drops  ·  _nice-to-have_
`lib/schema.ts:73-93` · lens: Data integrity / schema validation gap · verify: 2/2 skeptics could not refute

Every entry in certificates.json includes a `credentialId` (e.g. "ef3fxd6rptc5", certificates.json line 8). CertificateSchema (schema.ts lines 73-93) does not declare `credentialId`, and Zod `.object()` is non-strict by default, so the field is silently stripped during `getCertificates()` parsing. The data is authored, validated as 'passing', and then discarded — it never reaches any component and there's no warning. This is exactly the kind of silent drift the build-time validation contract is meant to prevent. (If the intent is the opposite — that unknown keys are forbidden — the schema should `.strict()` and this would instead be a build error flagging the unused field.)

**Why it matters:** Authored credential-ID data is silently lost, and the schema's 'fail loud on shape errors' contract has a hole for extra keys.

**Proposed fix (NOT applied):** Decide intent: (a) if credentialId should be shown/used, add `credentialId: z.string().min(1).optional()` to CertificateSchema so it survives parsing and can be rendered; or (b) if content files must not carry stray keys, add `.strict()` to the object schemas so an unexpected field fails the build loudly instead of vanishing. Either makes the behavior intentional rather than silent.

#### 14. 🟢 Certificates page comment claims expiresDate is never shown publicly, but homepage renders it  ·  _nice-to-have_
`app/certificates/page.tsx:16-25` · lens: Data integrity / privacy consistency · verify: 2/2 skeptics could not refute

The /certificates page header comment asserts: 'Per Dana DATA_SHAPE.md we do NOT show expiresDate publicly (privacy + signal-to-noise reasons). The page reads issuedDate, the issuer, and the credential URL only.' However the homepage certificates section (app/page.tsx lines 302-310) DOES render '· expires <Month Year>' whenever c.expiresDate is present. The two public surfaces disagree about whether expiresDate is publishable. No certificate currently carries expiresDate so nothing leaks today, but if Sky adds one to certificates.json it will appear on the homepage in direct contradiction to the stated policy, with no schema or code guard preventing it.

**Proposed fix (NOT applied):** Decide the policy once and enforce it in one place. If expiresDate must stay private, remove the expires block from app/page.tsx (lines 302-310). If it is allowed, update the /certificates page comment so the two surfaces are consistent and add the expires display there too.

#### 15. 🟢 Homepage certificate date uses toLocaleDateString while /certificates uses a manual month table — divergent, locale-fragile formatting  ·  _nice-to-have_
`app/page.tsx:298-309` · lens: Edge cases / consistency · verify: 2/2 skeptics could not refute

The homepage formats issuedDate with `new Date(c.issuedDate).toLocaleDateString('en-CA', { year:'numeric', month:'long' })` whereas /certificates/page.tsx uses a hand-rolled formatIssuedDate() that splits the ISO string and indexes a MONTHS array. The two produce different strings ('May 2026' vs 'ISSUED MAY 2026') and, more importantly, the homepage path goes through new Date('YYYY-MM-DD') which is parsed as UTC midnight; for a build/render in a timezone behind UTC the displayed month can roll back to the previous month for first-of-month dates like '2026-05-01'. The /certificates manual parser is immune to this. Two code paths for the same datum, one of which has a latent off-by-one-month timezone bug.

**Proposed fix (NOT applied):** Use the timezone-safe manual parse (the formatIssuedDate approach, splitting the ISO string) on the homepage too, or factor a single shared formatter in lib/ and call it from both surfaces so they cannot drift.

#### 16. 🟢 AppMockup injects <style> with global @keyframes on every card instance, duplicating identical CSS N times  ·  _nice-to-have_
`components/AppMockup.tsx:331-347` · lens: React correctness / DOM hygiene · verify: 2/2 skeptics could not refute

AppMockup renders `<style>{floatStyles}</style>` inline in its own output. Since ProjectCard renders one AppMockup per deliverable and the homepage/work pages render multiple ProjectCards, the identical global @keyframes mockup-float and .mockup-float rule are emitted once per card into the DOM (4-5 duplicate <style> blocks on the homepage). The class name is global and unscoped, so this is harmless functionally but pollutes the DOM and defeats styled-jsx/Tailwind conventions the project otherwise follows (CLAUDE.md: 'Tailwind only — no inline style except in globals.css'). It also means a server-rendered page ships the same keyframe text repeated.

**Proposed fix (NOT applied):** Move the mockup-float keyframes and class into app/globals.css (which already houses reveal-on-scroll, hero-status-ping, link-draw, cta-dot-pulse) and delete the inline <style> from AppMockup so it is defined exactly once.

#### 17. 🟢 Stale doc comment: layout/AppMockup say '14-role' / homepage hero says 'four live products' while content claims 18 roles and 5 deliverables  ·  _nice-to-have_
`content/deliverables.json:40` · lens: Data integrity (internal consistency) · verify: 2/2 skeptics could not refute

deliverables.json describes Claude Corp as 'An 18-role AI team' (line 40), but app/about/page.tsx line 122 hardcodes 'I've built Claude Corp — a 14-role multi-agent system', and the homepage showcase chip (app/page.tsx line 43) hardcodes '15 / AI agents'. Three different agent counts (18 / 15 / 14) appear across the public site for the same product. Separately, the hero subhead and About copy repeatedly say 'Four live products' / 'a handful of recent things' while the work grid now lists 5 deliverables. These are hardcoded prose values with no single source of truth, so they have already drifted.

**Proposed fix (NOT applied):** Pick the correct agent count and reconcile all three locations (deliverables.json summary, about page prose, homepage showcase chip). Where a count mirrors data (number of deliverables), derive it (deliverables.length) instead of hardcoding 'Four'. At minimum align the three Claude Corp role counts.

#### 18. 🟢 work/[slug] 'Other work' comment promises same-year preference the code never implements  ·  _nice-to-have_
`app/work/[slug]/page.tsx:69-71` · lens: Logic correctness · verify: 2/2 skeptics could not refute

The comment says 'up to 2 sibling deliverables, prefer same-year + non-self', but the implementation is `allDeliverables.filter((x) => x.id !== d.id).slice(0, 2)` — it only excludes self and takes the first two in getDeliverables() order (year-desc with no stable tiebreaker, see content.ts). There is no same-year preference at all. Because every current deliverable is year 2026 the discrepancy is invisible today, but the moment a deliverable from another year is added, the 'Other work' block will not prefer same-year siblings as documented, and which two siblings appear is governed purely by the unstable year-desc sort.

**Why it matters:** Comment/behavior drift misleads future maintainers and the feature silently fails to do what its own docstring claims once multi-year content exists.

**Proposed fix (NOT applied):** Either implement the documented behavior (partition siblings into same-year first, then fill from others, then slice(0,2)) or correct the comment to state it simply takes the first two siblings in default order. If keeping order-based selection, add a stable secondary sort key in getDeliverables so the chosen siblings are deterministic.

#### 19. 🟢 Homepage stat chips, About copy, and Claude Corp summary disagree on the agent count (15 vs 14 vs 18)  ·  _nice-to-have_
`app/page.tsx:44-46 (showcase '15 AI agents'); about/page.tsx:122 ('14-role'); content/deliverables.json:40 ('18-role')` · lens: Data integrity · verify: 2/2 skeptics could not refute

Three hardcoded sources state three different team sizes for the same Claude Corp system: the homepage showcase chip hardcodes `stat: '15', label: 'AI agents'` (page.tsx ~line 44), the About page body says 'Claude Corp — a 14-role multi-agent system' (about/page.tsx ~line 122), and the deliverables.json Claude Corp summary says 'An 18-role AI team governed by a written Constitution'. The user's own CLAUDE.md describes '15 roles + orchestrator'. At least two of the three public-facing numbers are wrong, and because each is independently hardcoded there is no single source of truth keeping them in sync.

**Why it matters:** Conflicting hardcoded facts on a public portfolio undermine credibility and are exactly the kind of silent drift that build/lint/tests cannot catch.

**Proposed fix (NOT applied):** Pick the canonical count (CLAUDE.md says 15 roles + orchestrator) and reconcile all three strings. Ideally factor the number into one constant or into profile/deliverable content so it cannot drift again.

#### 20. 🟢 credentialId is silently dropped by CertificateSchema (strip), so a typo'd field name would be ignored rather than caught  ·  _nice-to-have_
`lib/schema.ts:73-93` · lens: Type-safety & null handling / data integrity · verify: 2/2 skeptics could not refute

CertificateSchema is a plain z.object (default strip mode), and certificates.json carries a `credentialId` field on every entry that the schema does not declare. Zod strips unknown keys silently, so `credentialId` is parsed away and never typed or rendered. Beyond the already-reported 'unused credentialId' observation, the deeper defect is that the schema is non-strict: any misspelled or stray key (e.g. `credentialUrl` typo'd as `credentialURL`, or `isuedDate`) is silently dropped instead of failing the build. For a project whose entire content-safety story is 'a schema violation fails the build' (CLAUDE.md), the schemas not using `.strict()` means whole categories of content typos pass validation and surface as missing data at runtime instead of a build error.

**Why it matters:** Non-strict schemas defeat the build-time content-validation guarantee the project relies on; a single mistyped key would ship as silently missing content with no error.

**Proposed fix (NOT applied):** Add `.strict()` to CertificateSchema, DeliverableSchema, and ProfileSchema (and nested objects where appropriate) so unknown/misspelled keys fail the build. Then either add `credentialId` to CertificateSchema or remove it from certificates.json.

#### 21. 🟢 ProjectCard root is a non-focusable <div> carrying focus-visible: outline classes that can never fire  ·  _nice-to-have_
`components/ProjectCard.tsx:45-59 (div has 'group block' + 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta')` · lens: React/a11y correctness · verify: 2/2 skeptics could not refute

The card's outer element is a plain <div> with no tabindex and no role, but it is given focus-visible:outline-* classes (lines 55) as if it were the focusable element. A div without tabindex never receives keyboard focus, so :focus-visible never matches and those classes are dead. The actual focusable elements are the inner <a> tags (title link line 127, case-study link line 164, demo/github links), which carry their own focus-visible outlines. The comment at lines 48-50 ('focus-visible outline alongside hover/focus lift') implies the card itself was meant to show a focus ring, which it does not.

**Why it matters:** Minor, but it's dead styling that misrepresents the card's keyboard-focus behavior and could mislead future edits about how focus is handled.

**Proposed fix (NOT applied):** Remove the focus-visible:* classes from the outer div (they're dead), or if a card-level focus ring is desired, use group-focus-within:outline / focus-within: on the div so it lights up when one of its inner links is focused. Update the misleading comment either way.

#### 22. 🟢 Blog listing renders an empty <ul aria-label="Tags"> when a post has no tags, unlike the detail page which guards it  ·  _nice-to-have_
`app/blog/page.tsx:143-149` · verify: 2/2 skeptics could not refute

The blog index always renders `<ul className="flex flex-wrap gap-2" aria-label="Tags">{post.tags.map(...)}</ul>` with no length guard. `BlogPostSchema` allows `tags: z.array(...).max(6)` with no minimum, so a post with `tags: []` produces an empty list labeled "Tags" — an empty labeled list is an accessibility/semantics smell. The detail page (blog/[slug]/page.tsx line 174) correctly guards with `post.tags.length > 0 && (...)`; the listing is inconsistent with it.

**Why it matters:** Low impact (all current posts have tags) but it's an inconsistency that will surface a confusing empty 'Tags' region to screen-reader users the moment an untagged post is added.

**Proposed fix (NOT applied):** Wrap the listing's tag `<ul>` in `post.tags.length > 0 && (...)`, mirroring the detail page, so empty-tag posts don't emit an empty labeled list.

#### 23. 🟢 Sidebar 'Available for work' availability micro-status is hardcoded in two places (Sidebar, Footer, HamburgerNav) with no shared source  ·  _nice-to-have_
`components/Sidebar.tsx:55 ('Available for work'); also Footer.tsx line 40 ('Open to work'), HamburgerNav.tsx line 253 ('Available for work · 2026')` · verify: 2/2 skeptics could not refute

The availability status string and the year are duplicated and already drifting: Sidebar says 'Available for work', Footer says 'Open to work', HamburgerNav says 'Available for work · 2026' with a hardcoded literal `2026` (the Sidebar/Footer correctly derive the year via `new Date().getFullYear()`). When 2027 arrives, the hamburger overlay will display a stale '2026' while the sidebar/footer auto-update, and toggling availability requires editing three files.

**Why it matters:** Guaranteed to produce a visible inconsistency at the next year boundary, and the divergent wording ('Available' vs 'Open') already reads as carelessness on a portfolio whose whole pitch is making things carefully.

**Proposed fix (NOT applied):** Source the availability label from profile.json (or a single shared constant) and replace the hardcoded `2026` in HamburgerNav.tsx line 253 with `new Date().getFullYear()` to match Sidebar/Footer.

#### 24. 🟢 Bold/italic markdown inside ## / ### headings renders as literal asterisks  ·  _nice-to-have_
`app/blog/[slug]/page.tsx:56-79` · lens: logic correctness · verify: 2/2 skeptics could not refute

renderMarkdown applies parseInline only to the paragraph branch. The h2 and h3 branches emit block.slice(3) / block.slice(4) as a raw string. So a heading authored as '## The **real** stack' renders the literal text 'The **real** stack' with visible asterisks, while the same markup in a paragraph is bolded. The renderer's doc comment claims it 'Handles: ## headings (h2, h3), **bold**, *italic*' — implying inline formatting works everywhere, but it does not inside headings.

**Why it matters:** Inconsistent rendering between headings and paragraphs surprises content authors and leaks raw markdown syntax onto the live page.

**Proposed fix (NOT applied):** Wrap the heading children in parseInline(block.slice(3)) / parseInline(block.slice(4)) so inline emphasis is consistent, or document that headings are plain-text only.


### §6b Architecture & Tech-Debt  (35 findings)
#### 1. 🔴 ProjectCard ships broken transition: duration-280 / duration-520 / scale-102 are no-op classes absent from compiled CSS  ·  _blocker_
**Area:** build/config health · shipped bug
**Evidence:** /Users/skypie/Portfolio/components/ProjectCard.tsx:53 (`duration-280`); /Users/skypie/Portfolio/components/CaseStudyCard.tsx:48,57,58,66,67,81,95; /Users/skypie/Portfolio/components/FilterPill.tsx:40,61; tokens defined at /Users/skypie/Portfolio/tailwind.config.ts:98-103; confirmed MISSING from out/_next/static/css/*.css

The design system defines named duration tokens in tailwind.config.ts (fast=180ms, base=280ms, slow=520ms, reveal=900ms). Several components instead use raw numeric class names duration-280 and duration-520, which Tailwind does NOT generate — there is no `duration: 280` arbitrary-value syntax without brackets, so these emit zero CSS. Verified absent from the built stylesheet: grepping out/_next/static/css/*.css for `duration-280`, `duration-520`, `scale-102`, and `opacity-change` all return MISSING. ProjectCard.tsx is LIVE on the homepage and the /work page, and its top-level card transition at line 53 (`transition-all duration-280 ease-out`) therefore has no duration — the carefully-specced 280ms hover lift/shadow/translate either snaps instantly or relies on a browser default, not the intended easing. CaseStudyCard (lines 48,57,66,81,95) and FilterPill (lines 40,61) have the same defect plus `group-hover:scale-102` and `group-hover:opacity-change` which are entirely invented utilities.

**Proposed fix (NOT applied):** Replace `duration-280`→`duration-base` and `duration-520`→`duration-slow` everywhere. Replace `group-hover:scale-102` with an arbitrary value `group-hover:scale-[1.02]` (or add a `102` key to theme.extend.scale). Replace the meaningless `group-hover:opacity-change` with the actual intent (e.g. `group-hover:opacity-100` on an element starting at a lower opacity). Add a guardrail: a lint rule or a static-integrity test that scans component className strings for `duration-\d`/`scale-\d{3}` raw numerics and fails, since these silently produce no CSS and typecheck/eslint will not catch them.

#### 2. 🔴 OG/canonical metadataBase points at the wrong GitHub Pages domain  ·  _blocker_
**Area:** build/config health, separation of concerns
**Evidence:** app/layout.tsx:65,70,74,78,85 (siteUrl='https://skylerhalisky.github.io/portfolio'); content/profile.json (github @skypie99); out/index.html built og:image = https://skylerhalisky.github.io/portfolio/og-image.svg

app/layout.tsx line 65 hardcodes siteUrl = 'https://skylerhalisky.github.io/portfolio', and this feeds metadataBase (line 70) and openGraph.url (line 74). But the actual live site (per CLAUDE.md, content/profile.json socials, README, and PROJECT_STATE) is skypie99.github.io/portfolio. Confirmed in the built artifact: out/index.html emits property="og:image" content="https://skylerhalisky.github.io/portfolio/og-image.svg" — a domain that resolves to the wrong (or nonexistent) GitHub Pages user. Every absolute OG/Twitter/canonical URL on the site therefore points at a dead host, so link-unfurl previews on LinkedIn/Slack/iMessage/Twitter will 404. For a public-facing portfolio whose whole job is to be shared, this is a launch-grade defect.

**Proposed fix (NOT applied):** Replace the hardcoded 'skylerhalisky.github.io' with the canonical 'https://skypie99.github.io/portfolio'. Better: stop hardcoding the host in two files — derive siteUrl from a single source (e.g. a SITE_URL constant in lib/, or read profile.socials github handle) so the domain can never drift again. Add a unit/static-integrity assertion that every emitted og:image / og:url in out/**/*.html starts with the expected production origin.

#### 3. 🔴 Two GitHub Pages deploy workflows both trigger on push to main  ·  _blocker_
**Area:** build/config health, dead code, separation of concerns
**Evidence:** .github/workflows/nextjs.yml (on push main, group 'pages', cancel-in-progress:false) vs .github/workflows/deploy.yml (on push main, group 'pages', cancel-in-progress:true)

.github/workflows/ contains three files: ci.yml (gate), deploy.yml (Rory's hand-authored deploy), and nextjs.yml (the GitHub starter 'Deploy Next.js site to Pages'). BOTH deploy.yml and nextjs.yml declare `on: push: branches: [main]` and both target the github-pages environment with concurrency group 'pages'. On every push to main they race for the single Pages deployment — one cancels/blocks the other, deploy outcomes become nondeterministic, and which build actually goes live depends on timing. deploy.yml uses cancel-in-progress:true while nextjs.yml uses cancel-in-progress:false, so they actively fight over the concurrency group. nextjs.yml is almost certainly an unintended leftover from `actions/configure-pages` scaffolding (it even re-injects basePath and unoptimized images, duplicating next.config.mjs).

**Proposed fix (NOT applied):** Delete .github/workflows/nextjs.yml (the scaffolded duplicate). Keep deploy.yml as the single source of deploy truth per the DEPLOY_PLAN ownership note in its header. Verify only one workflow owns the 'pages' concurrency group. Document in docs/DEPLOY_PLAN.md that nextjs.yml was removed to avoid the double-deploy race.

#### 4. 🟡 Dynamic route /work/[slug] types params as sync object, diverging from Next 15.5's Promise<params> contract  ·  _should-fix_
**Area:** build/config health, dependency health
**Evidence:** app/work/[slug]/page.tsx lines 10, 21-26, 61-67 (sync params) vs /Users/skypie/Portfolio/.next/types/validator.ts line 9 and routes.d.ts lines 43,57 (Promise<ParamMap[Route]>)

app/work/[slug]/page.tsx declares `type RouteParams = { slug: string }` and consumes params synchronously in three places: generateStaticParams (fine), generateMetadata ({ params }: { params: RouteParams }) and the default export WorkDetailPage ({ params }: { params: RouteParams }), reading params.slug directly. The Next 15.5 generated types in .next/types/routes.d.ts and validator.ts declare `params: Promise<ParamMap[Route]>` — under the App Router, params is now a Promise that should be awaited. Typecheck currently passes (EXIT=0) ONLY because Next's PageProps validator intersects with `& any` (validator.ts line 9: `params: Promise<...> & any`), which masks the mismatch. This is silently relying on a loose escape hatch. The synchronous read still works at build time for static export today, but this is exactly the kind of latent contract drift that breaks on a minor Next upgrade, and it is undocumented despite CLAUDE.md being detailed about other Next 15 gotchas.

**Proposed fix (NOT applied):** Migrate the route to the async params contract: `export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; ... }` and likewise make generateMetadata async and await params. Keep generateStaticParams returning the sync array (it is correct). Add a one-line note to CLAUDE.md Gotchas documenting that dynamic-route params are Promises in Next 15. Do not change behavior — only align the type contract so the `& any` mask is no longer load-bearing.

#### 5. 🟡 Two navigations expose conflicting destinations for the same labels (Sidebar → standalone routes, HamburgerNav → homepage anchors)  ·  _should-fix_
**Area:** separation of concerns, naming & consistency, scalability
**Evidence:** components/HamburgerNav.tsx lines 25-30 (anchors) vs components/Sidebar.tsx lines 56,68,85 (/work/ routes) vs existence of app/about/page.tsx, app/certificates/page.tsx, app/contact/page.tsx; homepage About duplicate at app/page.tsx 217-263

The site has two parallel nav surfaces with hardcoded, independently-maintained link tables that disagree on where a label points. HamburgerNav (components/HamburgerNav.tsx lines 25-30) routes Work/Certificates/About/Contact to homepage anchors: '/#work', '/#certificates', '/#about', '/#contact'. The desktop Sidebar (components/Sidebar.tsx) instead links to standalone pages '/work/' and the featured deliverable, while the full standalone routes /about/, /certificates/, /contact/ also exist as real pages. So a mobile user tapping 'About' scrolls the homepage section, while the same conceptual destination on desktop / via the page routes is a dedicated page with different, longer content. This is a separation-of-concerns and consistency problem: there is no single source of truth for navigation, the two tables will drift as Phase 2 adds routes (blog infra is open), and the dual destination is genuinely confusing. The homepage even duplicates near-identical About content (app/page.tsx lines 217-263) that the standalone /about page (app/about/page.tsx) expands on.

**Proposed fix (NOT applied):** Introduce one shared nav config (e.g. lib/nav.ts exporting a typed NAV_ITEMS array) consumed by both Sidebar and HamburgerNav, and decide a single canonical destination per label — either the homepage-anchor model or the standalone-page model, not both per-surface. If both an anchored homepage section and a deep page must coexist (e.g. About teaser + full story), make that an explicit, documented pattern (anchor for in-page, page for 'Read the full story') rather than a per-nav accident. This removes the two hardcoded tables and makes adding the Phase-2 blog route a one-line change in one file.

#### 6. 🟡 Heavy markup duplication across pages: section-eyebrow, page-header, and back-link patterns repeated verbatim  ·  _should-fix_
**Area:** duplication/DRY, scalability
**Evidence:** 11x eyebrow-dot (`grep -c w-1.5 h-1.5 rounded-full bg-terracotta` across app/*.tsx), 5x back-link (app/about,contact,work,certificates/page.tsx + not-found.tsx), 5x clamp H1 header, 14x `px-gutter ... py-24 lg:py-32`

The same multi-class JSX fragments are copy-pasted across the pages layer with no shared component, despite CLAUDE.md mandating that shared UI live in components/. (1) The 'eyebrow label' — `<p className="font-mono text-label tracking-label uppercase text-text-meta ... flex items-center gap-2"><span aria-hidden className="... w-1.5 h-1.5 rounded-full bg-terracotta"/>Label</p>` — appears 11 times across page.tsx, about, work, certificates, contact. (2) The page H1 header block (`font-serif font-light text-[clamp(2.5rem,6vw,4rem)] ... style={{letterSpacing:'-0.02em'}}`) is duplicated verbatim in about, work, certificates, contact, and not-found. (3) The 'Back to home' link block is repeated in 5 files (about, contact, work, certificates, not-found) with identical classes. (4) 14 sections repeat the `px-gutter py-24 lg:py-32` wrapper. This is the primary scalability bottleneck for the pages layer: every design tweak (a Dani wave) must be hand-applied in 5-11 places, which is exactly how the per-section bg-rhythm comments accumulated and how drift creeps in.

**Proposed fix (NOT applied):** Extract three small server components into components/: SectionEyebrow ({ children }), PageHeader ({ eyebrow, title, intro? }), and BackLink ({ href='/', label }). Optionally a Section wrapper that encapsulates the `reveal-on-scroll px-gutter py-24 lg:py-32 border-t border-border-decorative` shell with a `bg` prop. Replace the inline copies page-by-page. All are zero-JS server components so static-export and First-Load-JS are unaffected. This collapses ~30 duplicated fragments to a handful of call sites and makes the next design wave a single-file edit.

#### 7. 🟡 Homepage showcase stats are hardcoded and contradict the JSON content source of truth  ·  _should-fix_
**Area:** separation of concerns, divergence from conventions, data integrity
**Evidence:** app/page.tsx lines 34-60 (hardcoded `showcaseChips ... as const`, comment 'hardcoded per spec'); contradicts CLAUDE.md 'Content data model' section and lib/content.ts validation pattern

app/page.tsx lines 34-60 define `showcaseChips` as a hardcoded const array (AccessMap '789 tests passing', Claude Corp '15 AI agents', Prompt Library '50+ features', Mutual Mesh 'E2E encrypted') with the comment '// hardcoded per spec'. This violates the project's central architectural principle stated throughout CLAUDE.md: 'All content is JSON, parsed and validated at build time via lib/content.ts. A schema violation fails the build — that's intentional.' These chips reference the same four projects that already exist as schema-validated deliverables in content/deliverables.json, but the stats/tags here bypass Zod validation entirely, can silently go stale (the '789' will be wrong next test run; the homepage already says 789 while AccessMap evolves), and duplicate project names that could drift from deliverables.json titles. It also mixes content into the presentation layer, which the conventions explicitly forbid ('Components are in components/, pages are in app/. Don't blur the line' extends to content vs code).

**Proposed fix (NOT applied):** Move the showcase stats into the content layer: either add an optional `showcaseStat?: { stat, label, tags }` field to DeliverableSchema (lib/schema.ts) so the chips derive from getDeliverables(), or add a dedicated content/showcase.json with its own Zod schema and a getShowcase() in lib/content.ts. Render the strip by mapping validated data, matching the pattern every other section already uses. This restores build-time validation and a single source of truth, and prevents stale stats from shipping silently to production.

#### 8. 🟡 No test coverage for the page (route) layer — only components and lib are tested  ·  _should-fix_
**Area:** test architecture
**Evidence:** find shows only components/__tests__/ and lib/__tests__/ test files; duplicated ordering logic at app/about/page.tsx 44-49, app/work/page.tsx 42-44, app/work/[slug]/page.tsx 71

The test suite (components/__tests__/ x9, lib/__tests__/ x4) covers every shared component and the content/schema layer, but there is zero direct test coverage of the app/ page modules themselves. The pages contain real, testable logic that has already shown signs of fragility: the about page's featuredFirst IIFE (app/about/page.tsx 44-49) reorders deliverables, work/page.tsx and about/page.tsx both independently reimplement featured-first ordering (duplicated logic — about uses an IIFE, work uses find/filter/spread, work/[slug] uses a different 'others' slice), and work/[slug] has notFound() branching. The static-integrity test (lib/__tests__/static-integrity.test.ts) is a good structural net for link resolution and external rel attrs (as noted in context), but it tests the built HTML, not the page logic, and it requires a full build so it won't run in fast loops. As Phase 2 adds pages (blog), the untested page layer is where regressions will land.

**Proposed fix (NOT applied):** Two moves: (1) DRY the duplicated featured-first ordering into a single helper in lib/content.ts (e.g. getDeliverablesFeaturedFirst()) and unit-test it once, replacing the three ad-hoc reimplementations in page.tsx/about/work. (2) Add lightweight render tests for the page components (they are server components returning JSX — renderable in jsdom via @testing-library) asserting key invariants: empty-state copy on /work when no deliverables, notFound path on an unknown slug, correct count in the 'Work — N deliverable(s)' header pluralization. Keep these in a new app/__tests__/ dir or co-located per the existing convention.

#### 9. 🟡 Three components (CaseStudyCard, CredentialBadge, FilterPill) are dead code — unreferenced, untested, and depend on undefined CSS variables  ·  _should-fix_
**Area:** dead code · scalability
**Evidence:** Usage grep: only /Users/skypie/Portfolio/components/CaseStudyCard.tsx, CredentialBadge.tsx, FilterPill.tsx reference their own names. CSS vars: grep -c 'badge-bg|pill-bg|case-study' app/globals.css → 0. No matching test files in /Users/skypie/Portfolio/components/__tests__/.

CaseStudyCard.tsx, CredentialBadge.tsx, and FilterPill.tsx are imported nowhere outside their own files (grep across app/ and components/ returns only the definitions themselves). They have no tests in components/__tests__/. All three were added in a single Phase 2 commit (`feat: Phase 2 UI components — elevation, filtering, case studies, badges`) and never wired into a page. Worse, they are non-functional even if dropped in: they reference CSS custom properties that do not exist anywhere in app/globals.css — `--case-study-overlay`, `--case-study-image-height`, `--badge-bg`, `--badge-border`, `--badge-text`, `--badge-accent`, `--pill-bg-active`, `--pill-border-resting`, etc. (grep of globals.css for these returns 0 matches). So they would render with transparent/unset backgrounds and borders. This is speculative scaffolding that increases the surface area to maintain and misleads future work into thinking a filtering/case-study system exists.

**Proposed fix (NOT applied):** Either (a) delete the three files now and re-introduce them on the Phase 2 feature branch that actually consumes them, or (b) if they are intended near-term, define the missing CSS variables in app/globals.css, wire them into the certificates/work pages, and add smoke tests — and gate them behind that work so they don't sit broken on main. Given Phase 1 is merged and these are unreferenced, removal is the cleaner default; the code is preserved in git history (commit 0a3c49f).

#### 10. 🟡 CaseStudyCard category union diverges from AppMockup/deliverable slug union  ·  _should-fix_
**Area:** naming & consistency · coupling
**Evidence:** /Users/skypie/Portfolio/components/CaseStudyCard.tsx:5 vs /Users/skypie/Portfolio/components/AppMockup.tsx:12 and /Users/skypie/Portfolio/components/ProjectCard.tsx:110

AppMockup.tsx and ProjectCard.tsx use the canonical slug union `'accessmap' | 'claude-corp' | 'prompt-library' | 'mutual-mesh'` (matching deliverables.json ids). CaseStudyCard.tsx independently declares `category: 'accessmap' | 'claude-corp' | 'prompt-library' | 'pacman' | 'mutual'` — it both adds a value not in the deliverable set (`pacman`) and renames `mutual-mesh` to `mutual`. This is a divergent, hand-maintained copy of what should be one shared type. As the project scales (Phase 2 blog/dark mode), these unions will drift further and the mismatch defeats the build-time guarantee that slugs line up.

**Proposed fix (NOT applied):** Define a single `DeliverableSlug` type in lib/schema.ts (ideally derived from the Zod schema / deliverables data so it can't drift) and import it in AppMockup, ProjectCard, and CaseStudyCard. Remove the inline string unions. This also makes AppMockup's `slug={d.id as 'accessmap' | ...}` cast at ProjectCard.tsx:110 unnecessary.

#### 11. 🟡 AppMockup violates the project's own 'Tailwind only, no inline style' convention at scale (62 inline style objects)  ·  _should-fix_
**Area:** divergence from conventions · separation of concerns
**Evidence:** /Users/skypie/Portfolio/components/AppMockup.tsx (62 `style={{` occurrences, <style>{floatStyles} at line 346); also Hero.tsx:38,63,77, ProjectCard.tsx:126,144, NumberedStep.tsx:46. Convention in /Users/skypie/Portfolio/CLAUDE.md 'Conventions' section.

CLAUDE.md states under Conventions: 'Tailwind only — no inline style= or raw CSS except in globals.css.' AppMockup.tsx contains 62 inline `style={{...}}` objects with hardcoded hex colors (#1C1A17, #6B9FD4, #E05252, #FAF9F5, etc.) that duplicate values already tokenized in tailwind.config.ts (e.g. cream #FAF9F5, charcoal #484A43, terracotta scale). It also injects a raw <style> tag with @keyframes mockup-float on every render (line 346) rather than placing the keyframe in globals.css where the other animations (hero-enter, hero-status-ping, cta-dot-pulse) live. The hardcoded colors mean a future dark-mode or palette change (Phase 2 lists dark mode as open) silently misses the entire mockup illustration. Hero.tsx (3), ProjectCard.tsx (2), NumberedStep.tsx (1), HamburgerNav.tsx (1), CaseStudyCard.tsx (2) also use inline style for letter-spacing/clamp/line-clamp values.

**Proposed fix (NOT applied):** Two-part: (1) Move the mockup-float @keyframes from the injected <style> into app/globals.css alongside the other keyframes, and apply via a `.mockup-float` class (already referenced). (2) For AppMockup, accept that an SVG/illustration with many one-off coordinates is a legitimate exception, but at minimum replace the hardcoded brand hexes with the design tokens (reference CSS variables from globals.css) so palette/dark-mode changes propagate; document AppMockup as an explicit, scoped exception in CLAUDE.md so the convention stays honest. For the small letter-spacing/clamp inline styles in Hero/ProjectCard/NumberedStep, add `letterSpacing`/`fontSize` tokens or arbitrary Tailwind values (`tracking-[-0.025em]`, `text-[clamp(...)]`) to eliminate the style attribute.

#### 12. 🟡 Tailwind spacing scale override silently redefines default utilities (5/6/8/10/12/16) used across components  ·  _should-fix_
**Area:** build/config health · scalability bottleneck
**Evidence:** /Users/skypie/Portfolio/tailwind.config.ts:73-88; non-overridden keys in use found by grep: gap-7, h-11, h-14, px-7, mt-14 in components/*.tsx.

tailwind.config.ts theme.extend.spacing redefines numeric keys to non-default values: '5':1.5rem (Tailwind default 1.25rem), '6':2rem (default 1.5rem), '8':3rem (default 2rem), '10':4rem (default 2.5rem), '12':6rem (default 3rem), '16':8rem (default 4rem). Because this is under `extend`, the defaults are merged, so utilities still compile — but every `p-6`, `gap-8`, `mb-10`, `pt-16`, `mt-12` etc. across all components now means something different from stock Tailwind. Components freely mix overridden keys (p-6, gap-10, pb-8) with non-overridden ones (gap-7, h-11, h-14, px-7, mt-14 — verified present). A contributor reading `gap-8` will reasonably assume 2rem (Tailwind default) and get 3rem; a contributor adding `gap-7` gets the stock 1.75rem, breaking the intended rhythm. This is a latent footgun that will bite as Phase 2 adds pages/contributors.

**Proposed fix (NOT applied):** Either (a) rename the custom spacing scale to named tokens (e.g. `space-section`, `space-block`) so overloading the numeric scale is impossible and intent is explicit, or (b) audit and document that the numeric scale is intentionally re-based, and add the missing intermediate keys (7,9,11,14) so the scale is internally consistent rather than a mix of custom and stock values. Option (a) is the more scalable fix and matches the project's habit of semantic tokens (text-meta, accent-text, etc.).

#### 13. 🟡 Per-call re-parse with no memoization: every page re-reads and Zod-validates the same JSON, multiplying file reads across the build  ·  _should-fix_
**Area:** scalability / separation of concerns
**Evidence:** /Users/skypie/Portfolio/lib/content.ts lines 23-107 (no caching); /Users/skypie/Portfolio/app/work/[slug]/page.tsx calls getDeliverables() at lines 18, 26, 62 plus getProfile() at 67.

getDeliverables(), getCertificates(), and getProfile() in /Users/skypie/Portfolio/lib/content.ts perform a synchronous readFileSync + full Zod parse + dedupe + sort on EVERY invocation. There is no caching layer. The loaders are called from 9+ call sites (app/page.tsx, app/about/page.tsx, app/work/page.tsx, app/work/[slug]/page.tsx, app/certificates/page.tsx, app/contact/page.tsx, app/layout.tsx, components/Sidebar.tsx, components/Footer.tsx). app/work/[slug]/page.tsx alone calls getDeliverables() 4 times (generateStaticParams, generateMetadata, the page, related list) — and that runs once PER slug. With N deliverables you re-read+re-validate the whole deliverables.json O(N) times just for detail pages, plus once per other page. At today's content size this is microseconds and harmless, but it is an architectural bottleneck baked into the lib layer: as the blog/Phase-2 content grows and more pages consume the loaders, the build does redundant disk I/O and Zod work that scales with pages x content. It also means the featured-slot/duplicate-id invariants are re-checked dozens of times per build instead of once.

**Proposed fix (NOT applied):** Add a module-level memoization cache in content.ts. Since the build is a single short-lived process and content is static, wrap each loader's body in a lazily-initialized cached value (e.g. a `let cache` per loader, or a small `once()` helper). Validation, dedupe, and sort then run exactly once per content file per build. Keep the public function signatures identical so no call site changes. Document that the cache is build-time-only (no invalidation needed because the process is ephemeral).

#### 14. 🟡 readJson<T> casts untyped JSON.parse output, and array loaders assume the JSON top level is an array without validating it  ·  _should-fix_
**Area:** separation of concerns / robustness
**Evidence:** /Users/skypie/Portfolio/lib/content.ts line 17 (`as T` cast), lines 42-44 and 86-88 (`readJson<unknown[]>` then `raw.forEach`).

In /Users/skypie/Portfolio/lib/content.ts, readJson<T>() does `JSON.parse(raw) as T` (line 17) — an unchecked cast that defeats TS strict's safety and the project's 'no any' convention in spirit. More concretely, getDeliverables() and getCertificates() call readJson<unknown[]>(...) then immediately do raw.forEach(...). If deliverables.json or certificates.json is accidentally edited to a top-level object, number, or null (e.g. a stray refactor, or someone wraps it in {"items": [...]}), `.forEach` throws a raw TypeError ('raw.forEach is not a function') with no file context — instead of the deliberate, file-named, Zod-formatted error message the rest of the loader carefully produces. This is the one shape error class the loader doesn't catch cleanly, which contradicts the file's own design goal of 'throws loudly on shape errors' with actionable messages.

**Proposed fix (NOT applied):** Validate the top-level container shape before iterating. Either (a) wrap each array file in a Zod array schema (e.g. `z.array(DeliverableSchema).safeParse(raw)`) and report with the same file-named error format — this also collapses the manual forEach loop; or (b) add an explicit `if (!Array.isArray(raw)) throw new Error('content/deliverables.json must be a top-level JSON array')` guard before the loop. Option (a) is cleaner and removes the unchecked cast. Drop the `as T` cast in readJson by returning `unknown` and letting Zod narrow.

#### 15. 🟡 cn.ts CUSTOM_COLOR_TOKENS / CUSTOM_FONT_SIZES are a hand-maintained mirror of tailwind.config.ts with no drift guard  ·  _should-fix_
**Area:** naming & consistency / divergence from conventions
**Evidence:** /Users/skypie/Portfolio/lib/cn.ts lines 15-39 (manual arrays + 'Keep in sync' comment); /Users/skypie/Portfolio/tailwind.config.ts lines 22-53 and 59-68 (the source the arrays mirror).

/Users/skypie/Portfolio/lib/cn.ts hardcodes two arrays (CUSTOM_COLOR_TOKENS lines 17-28, CUSTOM_FONT_SIZES lines 36-39) that must be kept in sync with theme.extend.colors and theme.extend.fontSize in /Users/skypie/Portfolio/tailwind.config.ts. The comment literally says 'Keep in sync with tailwind.config.ts'. This is a manual-mirror coupling: the whole reason this file exists is the Cycle 11 bug where twMerge dropped a custom color, and that exact bug re-occurs silently for any NEW custom color or font-size token added to the Tailwind config but not added here. I verified the lists currently match the config, but a future token (e.g. a dark-mode color — dark mode is an open Phase 2 item) added only to tailwind.config.ts would reintroduce the silent class-collapse bug with no test catching it (cn.test.ts only pins the specific known tokens).

**Proposed fix (NOT applied):** Two options, in order of preference: (a) Import the token keys from a single source of truth. Move the color/fontSize token maps into a shared TS module (e.g. lib/design-tokens.ts), import it into both tailwind.config.ts and cn.ts, and derive CUSTOM_COLOR_TOKENS = Object.keys(tokens.colors). Then drift is impossible. (b) If a shared import is awkward, add a test that imports tailwind.config.ts, reads theme.extend.colors/fontSize keys, and asserts every key is present in the corresponding cn.ts array — turning silent drift into a failing test. Given dark mode is imminent, do this before adding dark tokens.

#### 16. 🟡 Certificate badge images referenced by content do not exist on disk  ·  _should-fix_
**Area:** content/asset integrity, test architecture
**Evidence:** content/certificates.json (6x src '/images/certificates/.../badge.png'); find public/images/certificates -> empty; app/certificates/page.tsx:101-103; lib/__tests__/static-integrity.test.ts (no img/asset existence check)

content/certificates.json references six badge images under /images/certificates/<slug>/badge.png, and app/certificates/page.tsx renders them via <img src={c.badgeImage.src}>. But public/images/certificates/ does not exist at all (find returns nothing) — only public/images/deliverables/*/hero.svg files are present. The Zod schema validates the *path shape* but cannot validate *file existence*, so the build passes green while the live certificates page renders six broken images. content/README notes assets are placeholders 'Sky needs to drop before launch', but the site is already described as live, so the gap is shipping. There is no automated test catching this: static-integrity.test.ts checks anchor href resolution and external rel attrs but never checks that <img src> assets resolve to files in out/.

**Proposed fix (NOT applied):** Two parts. (1) Add the real badge PNGs under public/images/certificates/<slug>/ (or switch to SVG placeholders matching the deliverables pattern). (2) Close the test gap: extend static-integrity.test.ts to extract every <img src> (and og:image) from out/**/*.html and assert each internal asset resolves to a real file in out/. This catches both the cert badges and any future deliverable hero typo at CI time instead of in production.

#### 17. 🟡 case-studies.md is fully orphaned content — written but never consumed  ·  _should-fix_
**Area:** dead code, separation of concerns, content model
**Evidence:** content/case-studies.md (orphan, 0 code refs); components/ProjectCard.tsx:174-176 ('Read case study for', href /work/<slug>/); app/work/[slug]/page.tsx (renders only JSON fields, no markdown)

content/case-studies.md is a 7.2KB hand-written file with detailed Problem/Process/Outcome/What I Learned narratives for each project. Nothing reads it: grep across app/, lib/, components/ for 'case-studies' returns zero references, and there is no markdown loader in lib/ (only JSON via lib/content.ts). Meanwhile ProjectCard.tsx renders a 'Read case study for <title>' link that points to /work/<slug>/ — and app/work/[slug]/page.tsx renders ONLY the JSON summary (160 chars), role/year, tech, links, tags. So the 'case study' CTA leads to a page that contains no case study; the actual case-study prose sits unused on disk. This is a separation-of-concerns gap (two parallel content systems: validated JSON vs unvalidated orphan markdown) and a content-promise mismatch users will notice.

**Proposed fix (NOT applied):** Decide the content model and make it singular. Either (a) wire case-studies.md into work/[slug] via a build-time markdown loader keyed by slug (add a schema/section model so it's validated like the JSON), or (b) if the detail page is intentionally summary-only, delete case-studies.md and rename the ProjectCard CTA from 'Read case study' to 'View project' so the label matches what the page delivers. Do not leave both states coexisting.

#### 18. 🟡 OG image is an SVG, which most social scrapers reject  ·  _should-fix_
**Area:** build/config health, scalability of sharing
**Evidence:** public/og-image.svg; app/layout.tsx:78,85; app/about/page.tsx:19; app/work/page.tsx:18; app/work/[slug]/page.tsx:37

Every page's openGraph/twitter image is /og-image.svg (public/og-image.svg, also referenced in layout.tsx, about, work, work/[slug]). Major unfurl engines — Facebook/LinkedIn, Twitter/X, iMessage, Slack — do not render SVG OG images; they require raster PNG/JPG and many silently drop SVG, leaving a textless card. Combined with the wrong-domain bug above, the social card story is doubly broken. For a portfolio meant to be shared with recruiters this directly undercuts the artifact's purpose.

**Proposed fix (NOT applied):** Export a 1200x630 PNG (or JPG) og-image and point all openGraph/twitter image URLs at it. Keep the SVG as the design source if desired but ship the raster for OG. After fixing the domain, validate with a card-preview tool / curl the unfurl. Add a note in CLAUDE.md gotchas that OG images must be raster.

#### 19. 🟢 Three Phase-2 components committed but wired into nothing (CaseStudyCard, CredentialBadge, FilterPill)  ·  _nice-to-have_
**Area:** dead code, module structure
**Evidence:** components/CaseStudyCard.tsx, components/CredentialBadge.tsx, components/FilterPill.tsx — `grep -rln` finds no importer outside the files themselves; no matching __tests__ files; not listed in /Users/skypie/Portfolio/CLAUDE.md component map

components/CaseStudyCard.tsx, components/CredentialBadge.tsx, and components/FilterPill.tsx are git-tracked (committed today 2026-05-29 in 'feat: Phase 2 UI components') but are imported by zero pages, zero other components, and have zero tests in components/__tests__/. They are also absent from the CLAUDE.md file map (which lists the canonical component set). Given Phase 2 is active across 6 feature branches, these are most likely staged-ahead primitives rather than truly abandoned dead code — so this is a watch-item, not a defect. The risk is that if a Phase-2 branch is abandoned or its consuming page is cut, these silently become permanent dead weight that ships in no bundle (tree-shaken) but accrues maintenance/typecheck cost and confuses the file-map convention.

**Proposed fix (NOT applied):** No deletion now (would conflict with active Phase 2 branches). Track them: in PROJECT_STATE.md or the relevant feature-branch task, record which page is expected to consume each of the three. Add a CI/lint check (e.g. an unused-exports/knip pass, or a simple grep-based test) that fails when a component in components/ has no importer AND no test after a feature lands. Update the CLAUDE.md file map when they are wired in so the documented component set stays authoritative.

#### 20. 🟢 Inline style={{ letterSpacing }} usage across pages violates the 'Tailwind only, no inline style' convention  ·  _nice-to-have_
**Area:** divergence from conventions, naming & consistency
**Evidence:** style={{ letterSpacing: '-0.02em' }} at app/about/page.tsx:62, app/work/page.tsx:63, app/certificates/page.tsx:53, app/work/[slug]/page.tsx:148, app/not-found.tsx:30, app/page.tsx:111; CLAUDE.md Conventions 'no inline style='

CLAUDE.md Conventions state: 'Tailwind only — no inline style= or raw CSS except in globals.css.' Yet `style={{ letterSpacing: '-0.02em' }}` appears inline on the H1/heading of app/about/page.tsx (line 62), app/work/page.tsx (line 63), app/certificates/page.tsx (line 53), app/work/[slug]/page.tsx (lines 148), app/not-found.tsx (line 30), and `style={{ letterSpacing: '-0.02em' }}` plus a `letterSpacing` on the showcase stat in app/page.tsx (line 111). Same value, repeated as inline style in ~6 places. This is both a convention violation and a small duplication/consistency issue — the tracking value is a de-facto design token living as a magic string.

**Proposed fix (NOT applied):** Add a Tailwind tracking token (e.g. extend theme.letterSpacing with `tight-display: '-0.02em'` in tailwind.config.ts) and replace the inline styles with `tracking-tight-display`. This satisfies the no-inline-style rule, centralizes the value as a token, and folds naturally into the PageHeader extraction proposed above. Verify visually that the rendered tracking is identical.

#### 21. 🟢 Comment/behavior mismatch in /work/[slug] 'Other work' recommendation logic  ·  _nice-to-have_
**Area:** naming & consistency, separation of concerns
**Evidence:** app/work/[slug]/page.tsx lines 69-71 — comment claims 'prefer same-year' but code is plain `filter(...).slice(0,2)`

In app/work/[slug]/page.tsx line 69-71 the comment says: '"Other work" — up to 2 sibling deliverables, prefer same-year + non-self.' but the implementation is `allDeliverables.filter((x) => x.id !== d.id).slice(0, 2)` — it only excludes self and takes the first two by the existing year-desc sort; there is no same-year preference at all. The comment describes intended behavior that was never implemented (or was removed), which is a documentation-accuracy trap for the next maintainer and a small instance of the broader pattern where this file carries many Cycle-N narrative comments that may no longer match code.

**Proposed fix (NOT applied):** Either implement the documented behavior (sort/partition so same-year siblings are preferred before falling back to nearest years, then slice 2) or correct the comment to state the actual behavior ('first two other deliverables by year-desc'). Given it is a quiet recommendation, simplest is to fix the comment. This is a good candidate to fold into the page-logic test added above.

#### 22. 🟢 Duplicated 'availability status' ping-dot markup across three components  ·  _nice-to-have_
**Area:** duplication/DRY
**Evidence:** /Users/skypie/Portfolio/components/Sidebar.tsx:50-53; /Users/skypie/Portfolio/components/HamburgerNav.tsx:245-248; /Users/skypie/Portfolio/components/ProjectCard.tsx:102-105; DRY precedent in /Users/skypie/Portfolio/components/TagPill.tsx docblock.

The pulsing terracotta availability dot (a `relative inline-flex h-1.5 w-1.5` wrapper with a `hero-status-ping` ping span plus a solid span) is copy-pasted verbatim in Sidebar.tsx (lines 50-53), HamburgerNav.tsx (lines 245-248), and ProjectCard.tsx 'Live' indicator (lines 102-105). The project already established the right pattern by extracting TagPill in Cycle 8 to kill four duplicated pill copies (per TagPill.tsx docblock), so this duplication runs against the codebase's own DRY norm. Any change to the status-dot treatment must be made in three places.

**Proposed fix (NOT applied):** Extract a small `StatusDot` (or `PingDot`) presentational component into components/ taking an optional size prop, and replace the three inline copies. Mirrors the TagPill extraction rationale.

#### 23. 🟢 HamburgerNav focus trap re-queries DOM on every Tab and excludes some focusable elements  ·  _nice-to-have_
**Area:** separation of concerns · robustness
**Evidence:** /Users/skypie/Portfolio/components/HamburgerNav.tsx:55-68

The focus trap in HamburgerNav.tsx queries `a[href], button:not([disabled])` inside the keydown handler on every Tab keypress (lines 56-58). The selector omits other focusable elements (inputs, [tabindex], [contenteditable]) — fine for the current static link list, but brittle if the menu ever gains a form/toggle (e.g. the Phase 2 dark-mode switch could plausibly live here), at which point the trap would silently let focus escape. The logic is also inline in the component rather than in a reusable hook, so the next dialog (none yet, but Phase 2 may add one) will re-implement it.

**Proposed fix (NOT applied):** Extract a `useFocusTrap(ref, active)` hook into lib/ that uses the canonical focusable selector (including input, select, textarea, [tabindex]:not([tabindex='-1'])) and computes the focusable set once per open (or via a ref cache invalidated on DOM change). Keeps the a11y behavior correct as the menu grows and removes ~20 lines of imperative DOM code from the component body.

#### 24. 🟢 Button uses two near-identical destructuring blocks instead of a shared rest pattern  ·  _nice-to-have_
**Area:** duplication/DRY · naming
**Evidence:** /Users/skypie/Portfolio/components/Button.tsx:99-142

Button.tsx repeats the same six-key custom-prop strip (`variant: _v, fullWidth: _f, showDot: _s, pulseOnMount: _p, className: _c, children: _ch, ...attrs`) twice — once for the anchor branch (lines 102-110) and once for the button branch (lines 124-132). Adding a new custom prop requires editing both blocks, and the `_v/_f/_s/_p/_c/_ch` throwaway names are cryptic. The anchor branch also destructures `href` from `rest` after already narrowing via `'href' in props`, then re-destructures the custom keys — slightly convoluted.

**Proposed fix (NOT applied):** Compute the DOM-safe attrs once before the branch by destructuring the known custom props off `props` into a single `domProps` object, then spread `domProps` in whichever element renders. Replaces two duplicated blocks with one and removes the underscore-alias noise.

#### 25. 🟢 Stale/backup files committed in repo root (PROJECT_STATE.md.bak, tsconfig.tsbuildinfo) and unclear task scaffolding  ·  _nice-to-have_
**Area:** build/config health · repo hygiene
**Evidence:** /Users/skypie/Portfolio/PROJECT_STATE.md.bak; /Users/skypie/Portfolio/tsconfig.tsbuildinfo; /Users/skypie/Portfolio/TASK_T_GARY_GAPS.md

The repo root contains PROJECT_STATE.md.bak (a manual backup that should not be version-controlled) alongside the live PROJECT_STATE.md, and tsconfig.tsbuildinfo (an incremental-build cache that is environment-specific and should be gitignored). There is also TASK_T_GARY_GAPS.md and .context-bundle.md in root. These add noise and the .bak/.tsbuildinfo files risk merge conflicts and accidental drift. Not a components-layer issue per se but surfaced while reviewing the tree the components live in.

**Proposed fix (NOT applied):** Add `*.bak` and `tsconfig.tsbuildinfo` to .gitignore and remove them from tracking (git rm --cached). Confirm whether TASK_T_GARY_GAPS.md / .context-bundle.md are intended to be tracked or are transient working notes that belong in qa-reports/ or .gitignore.

#### 26. 🟢 Duplicated load-validate-dedupe-sort boilerplate across getDeliverables and getCertificates  ·  _nice-to-have_
**Area:** duplication / DRY
**Evidence:** /Users/skypie/Portfolio/lib/content.ts lines 41-71 vs 85-107 (structurally identical bodies).

getDeliverables() (lines 41-71) and getCertificates() (lines 85-107) in lib/content.ts are near-identical: read array JSON, loop+safeParse with an index-stamped error message, build a Set to detect duplicate ids, then sort. The only real differences are the schema, the filename, the entity noun in error strings, and the sort key (year desc vs issuedDate localeCompare desc). This is copy-paste that will be triplicated the moment blog-post loading lands in Phase 2 (the open 'blog infra' item), and any fix to the validation/error/dedup logic has to be applied in multiple places.

**Proposed fix (NOT applied):** Extract a generic `loadCollection<T>({ file, schema, idOf, compare, entityLabel })` helper in content.ts that does read → array-shape-check → per-item safeParse with indexed error → duplicate-id check → sort. getDeliverables, getCertificates, and a future getBlogPosts become thin wrappers that pass the schema and comparator. Keep the featured-slot check as a deliverable-specific post-step layered on top. This also gives one place to add the caching from finding #1.

#### 27. 🟢 getFeaturedDeliverable triggers a second full validation+sort pass of all deliverables  ·  _nice-to-have_
**Area:** scalability / coupling
**Evidence:** /Users/skypie/Portfolio/lib/content.ts lines 77-80; consumer components/Sidebar.tsx line 21 (runs on every page).

getFeaturedDeliverable() (lib/content.ts lines 77-80) calls getDeliverables() and then .find(featured). Because getDeliverables has no cache (finding #1), and Sidebar.tsx calls getFeaturedDeliverable() on every page (it's in the persistent layout chrome) while pages like app/page.tsx and app/about/page.tsx ALSO call getDeliverables() directly, the full read+validate+dedupe+sort of deliverables.json runs at least twice per rendered page. Resolving finding #1 (memoization) makes this free, so the two are linked — but flagging separately because even with caching, the helper re-sorts/re-filters a list just to pull one element.

**Proposed fix (NOT applied):** Once caching from finding #1 is in place this is largely resolved. Optionally, have getFeaturedDeliverable read from the cached deliverables list rather than re-invoking the full pipeline, and short-circuit (the featured item, if any, is unique by invariant so a single .find is fine).

#### 28. 🟢 Gallery image src has no per-slug path enforcement, unlike heroImage and badgeImage  ·  _nice-to-have_
**Area:** separation of concerns / schema completeness
**Evidence:** /Users/skypie/Portfolio/lib/schema.ts lines 35-37 (GalleryImageSchema, no path refine) vs lines 50-53 (heroImage refine); /Users/skypie/Portfolio/docs/DATA_SHAPE.md lines 314-318.

In /Users/skypie/Portfolio/lib/schema.ts, heroImage (lines 50-53) and badgeImage (lines 84-87) both carry a .refine() that forces the src under /images/deliverables/<slug>/ or /images/certificates/<slug>/. GalleryImageSchema (lines 35-37) only inherits ImageSchema's `startsWith('/images/')` — so a gallery image can point anywhere under /images/ including another deliverable's folder. DATA_SHAPE.md §(gallery, lines 314-318) shows gallery images living under the same per-slug folder as the hero, so the schema is silently more permissive than the documented convention. Low impact (gallery is optional and self-authored) but it's an inconsistency in the validation contract that the static-integrity test won't catch either (it checks link resolution, not folder ownership).

**Proposed fix (NOT applied):** This is genuinely hard at the field level because the slug isn't known inside GalleryImageSchema in isolation. Best handled the same way heroImage already cross-references: add a top-level .refine() on DeliverableSchema that asserts every gallery[].src begins with /images/deliverables/<this.id>/. That mirrors the heroImage rule and ties gallery images to the deliverable's own folder, matching DATA_SHAPE §gallery.

#### 29. 🟢 Loaders use readFileSync/process.cwd() with no test isolation, coupling unit tests to ship-state content  ·  _nice-to-have_
**Area:** test architecture
**Evidence:** /Users/skypie/Portfolio/lib/content.ts line 13 (process.cwd()); /Users/skypie/Portfolio/lib/__tests__/content.test.ts lines 18-21 + 100-110 (only happy-path / current-state assertions, no error-branch coverage).

content.ts reads from join(process.cwd(), 'content') (line 13) via readFileSync. content.test.ts deliberately runs against the real JSON files ('no mocks ... validate the actual ship-state'). That's a reasonable integration choice, but it means content.test.ts is really a content-fixture test, not a loader-logic test: the error paths (duplicate id throw at line 57/101, the >1 featured throw at lines 63-68, malformed JSON, top-level non-array) are NEVER exercised because the real files are always valid. The loader's most important safety behavior — failing loudly with a good message — has zero coverage. The featured-invariant test (content.test.ts lines 100-110) only proves the current file has exactly one featured, not that 2 throws.

**Proposed fix (NOT applied):** Add a loader-logic test file that drives the error branches with controlled input. Easiest path: refactor the loaders to accept an optional content directory (or inject readJson) so tests can point at a temp dir with crafted bad JSON (duplicate ids, 2x featured, non-array top level, schema violation) and assert the thrown messages. Keep the existing real-content test as the integration layer. This closes the gap where a refactor could break the throw paths without any test noticing.

#### 30. 🟢 Regex-based HTML parsing in static-integrity test is brittle for the rel-attribute security check  ·  _nice-to-have_
**Area:** test architecture / robustness
**Evidence:** /Users/skypie/Portfolio/lib/__tests__/static-integrity.test.ts lines 54-86 (regex extraction), line 57 requires double-quoted href; this backs the Gap 3 security check at lines 212-253.

static-integrity.test.ts extracts anchors with regexes (/<a\s([^>]*)>/ at line 71, href/rel sub-matches at lines 76-77). This is the test that enforces the external-link rel="noopener noreferrer" security invariant (the very gap being added per the known context). Regex anchor parsing has real blind spots: attributes whose value contains '>' , multiline tags, single-quoted attributes (rel='noopener'), or rel split across the tag would be mis-read, and the href pattern at line 57 requires double-quoted href specifically. Next.js's static export output is currently double-quoted and single-line so it passes today, but a security-enforcing test that can silently under-report (treat a missing/oddly-quoted rel as 'no anchor found' rather than a violation) is risky for the exact attribute it's meant to guard.

**Proposed fix (NOT applied):** Parse the built HTML with a real parser instead of regex. Options: use node-html-parser or cheerio (dev dependency) to select all <a href^="http"> and read getAttribute('rel'); or, since jsdom is already a devDependency and the vitest env is jsdom, load each file into a DOMParser/JSDOM document and query anchors via DOM APIs. This removes the quoting/multiline blind spots and makes the security assertion trustworthy.

#### 31. 🟢 static-integrity.test.ts uses require() inside an ESM/TS module instead of the file's own imports  ·  _nice-to-have_
**Area:** naming & consistency / config health
**Evidence:** /Users/skypie/Portfolio/lib/__tests__/static-integrity.test.ts line 25 (ESM import from node:fs) vs line 37 (require of node:fs).

At /Users/skypie/Portfolio/lib/__tests__/static-integrity.test.ts line 37, collectHtmlFiles does `const { readdirSync, statSync } = require('node:fs') as typeof import('node:fs')` — a CommonJS require inside a file that otherwise uses ESM `import` (it already imports existsSync/readFileSync from 'node:fs' at line 25). The project is ESM ('module':'esnext' in tsconfig, .mjs config). It works under Vitest's transform today, but it's inconsistent with the file's own top-of-file imports and the codebase convention, and a stricter lint/transform setting could flag it (@typescript-eslint/no-require-imports).

**Proposed fix (NOT applied):** Add readdirSync and statSync to the existing `import { existsSync, readFileSync } from 'node:fs'` line and delete the inline require. Purely mechanical, no behavior change.

#### 32. 🟢 Schema comments reference external docs (Dana §, Alex §) as the contract source, creating doc-coupling drift risk  ·  _nice-to-have_
**Area:** divergence from conventions / maintainability
**Evidence:** /Users/skypie/Portfolio/lib/schema.ts lines 3-10 (verbatim claim) and line 97 (wordmarkText required); /Users/skypie/Portfolio/docs/DATA_SHAPE.md line 192 (prose: defaults if omitted) vs line 472 (reference schema: required).

schema.ts opens by stating it 'mirror[s] Dana's DATA_SHAPE.md §2 verbatim' and content.ts cites 'Dana DATA_SHAPE.md §6'. I cross-checked and found one already-live contradiction: DATA_SHAPE.md prose (line 192) says profile.wordmarkText 'defaults to name if omitted' (i.e. optional), but both the DATA_SHAPE reference schema (line 472) and lib/schema.ts (line 97) make it REQUIRED (z.string().min(2).max(60)). So the implemented schema is internally consistent with the doc's code block but diverges from the doc's prose. More broadly, 'mirror verbatim' comments rot: there's no test or mechanism ensuring schema.ts and DATA_SHAPE.md stay aligned, so the doc is an unverifiable source-of-truth claim.

**Proposed fix (NOT applied):** Two-part: (1) Resolve the wordmarkText contradiction — decide whether it's optional-with-default or required, then make DATA_SHAPE prose and lib/schema.ts agree (if 'defaults to name', schema should be .optional() and the loader/consumers should fall back to name). (2) Demote the 'mirror verbatim' language to 'derived from' and treat lib/schema.ts as the runtime source of truth, since it's the thing the build actually enforces; or generate a short schema summary into the doc from the Zod types so the doc can't silently drift. This is a Will/Dana coordination item, not an app-code blocker.

#### 33. 🟢 Documentation says hero/badge images are .jpg/.png but actual assets are .svg  ·  _nice-to-have_
**Area:** naming & consistency, divergence from own conventions
**Evidence:** content/README.md ('hero.jpg', 'badge.png'); CLAUDE.md File map; actual: public/images/deliverables/*/hero.svg; deliverables.json heroImage.src ends .svg

content/README.md instructs 'Drop deliverable images in /public/images/deliverables/<slug>/hero.jpg and certificate badges in .../badge.png'. CLAUDE.md likewise documents .jpg/.png. But the real deliverable assets on disk are hero.svg, and deliverables.json references hero.svg. So the documented convention diverges from the shipped reality, and the certificate side documents badge.png while no files exist yet. A future contributor following the README will create the wrong extension or wonder why the convention is .jpg when every file is .svg.

**Proposed fix (NOT applied):** Reconcile the docs to the actual convention: state that hero images are .svg (or pick one format and migrate). Update content/README.md and CLAUDE.md File map together so deliverable=.svg and certificate badge format is stated explicitly. Cheap, prevents onboarding confusion.

#### 34. 🟢 heroImage/badge path regex enforces shape but not slug==id, allowing silent cross-wiring  ·  _nice-to-have_
**Area:** schema design, content integrity
**Evidence:** lib/schema.ts:50-53 (heroImage refine, no id comparison), :84-87 (badgeImage refine); content.ts validates per-item but never relates id to src slug

lib/schema.ts requires heroImage.src to match /^\/images\/deliverables\/[a-z0-9-]+\// and badgeImage.src to match the certificates equivalent, but it does NOT assert that the <slug> segment in the path equals the entry's id. So a deliverable with id 'accessmap' could legally reference /images/deliverables/mutual-mesh/hero.svg and the build would pass. Given the project's strong 'fail loud at build' philosophy, this is an enforcement gap that allows a copy-paste content error to ship a mismatched image.

**Proposed fix (NOT applied):** Move the heroImage/badgeImage path check from a standalone field .refine to an object-level .superRefine (or post-parse check in content.ts) that compares the path's <slug> segment against the entry id and throws if they differ. This keeps the 'build fails on bad content' contract honest. Add a schema.test case for the cross-wired id/path scenario.

#### 35. 🟢 Content is re-read and re-validated from disk on every loader call (no memoization)  ·  _nice-to-have_
**Area:** module structure, scalability, DRY
**Evidence:** lib/content.ts:15-18 readJson (no cache), :77-80 getFeaturedDeliverable calls getDeliverables; app/work/[slug]/page.tsx:18,26,62 (3 getDeliverables calls per route)

lib/content.ts readJson does a synchronous readFileSync + JSON.parse + full Zod safeParse on every invocation, and getFeaturedDeliverable() calls getDeliverables() which re-does the whole read+validate. app/work/[slug]/page.tsx calls getDeliverables() up to 3 times per route (generateStaticParams, generateMetadata, the component) and other pages call the loaders repeatedly. At build time with 5 deliverables this is harmless, but it's a structural smell: validation runs N times where 1 would do, and it sets a pattern that degrades as content grows (the blog infra in Phase 2 will multiply route count). The duplicate id-uniqueness + featured-invariant checks also run on every call rather than once.

**Proposed fix (NOT applied):** Memoize the parsed+validated results at module scope (e.g. a lazy singleton: parse once, cache the frozen array/object). Since this is a static build with immutable content files, caching is safe and removes the repeated I/O and validation. Keep the throw-on-invalid behavior on first load. This also DRYs getFeaturedDeliverable to read from the cached list.


## §6.5 Process Self-Check
- **Coverage:** bug sweep ran multi-lens finders (logic, edge-cases, async/races, type-safety, error-handling, security-adjacent, RN/React, data-integrity) across all layers, looping until dry; architecture reviewed per layer. All on Opus 4.8.
- **Adversarial verification:** every bug listed survived 2 independent skeptic agents instructed to refute it (default-refute on doubt), so false positives were filtered before inclusion.
- **Recovery note:** the first combined run hit the account session usage limit during bug verification; bugs were re-swept in a second, leaner run and merged here. Architecture findings are from the first run.

## §7 How to Review
- `git -C ~/Portfolio status` → clean except this report file.
- Each finding cites a `file:line` — open directly to verify.
- Nothing to revert: no changes were applied.

## §8 Next Recommended Action
Fix the three 🔴 deploy/animation/metadata blockers, then prune the dead Phase-2 components.
