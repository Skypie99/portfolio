# Shamus Audit — Portfolio Blog Infrastructure
**Date:** 2026-05-29  
**Role:** Shamus (Engineering Lead — audit + propose, no code changes)  
**Branch audited:** `feat/blog-infrastructure-2026-05-30` + `main` HEAD  
**Mode:** AUDIT + PROPOSE ONLY — nothing committed, nothing changed.

---

## Summary

Will shipped solid blog infrastructure on `feat/blog-infrastructure-2026-05-30`: schema-validated JSON content, static SSG routes, an inline markdown renderer, nav integration in both Sidebar and HamburgerNav, and 19 new tests (107 total, 0 regressions). The foundation is clean and consistent with the site's existing data model. However, three pre-merge issues need Sky's attention before this branch touches `main`: (1) the placeholder post is future-dated and self-describes as a placeholder — it should be set to `draft: true` or the date corrected; (2) the inline markdown renderer silently corrupts prose containing standalone asterisks (e.g. "44×44" written as `44*44`), a latent defect that will produce broken published pages; (3) there is no `schema.org BlogPosting` JSON-LD block on post pages, which was listed as a Phase 3 deliverable in the roadmap and is missing. Beyond the blog branch, the Opus overnight audit surfaced three critical production bugs on `main` that predate blog work and are blocking regardless of Phase 3 scope. The proposed next feature increments are detailed at the bottom of this report.

---

## Findings

| # | Title | Severity | File:Line | Recommendation | Effort |
|---|-------|----------|-----------|----------------|--------|
| 1 | Placeholder post is live with a future publish date and explicit placeholder disclaimer | high | `content/blog.json:6,9` | Set `"draft": true` immediately, or correct the `publishedDate` to today and replace the placeholder content body before merging. A live post dated 2026-05-30 that self-identifies as a test fixture undermines the portfolio's credibility. | S |
| 2 | `parseInline` silently corrupts prose with standalone asterisks | high | `app/blog/[slug]/page.tsx:96-108` | The regex `/(\*\*[^*]+\*\*\|\*[^*]+\*)/g` pairs any `*` with the next `*`, mangling text like `44*44` into a spurious `<em>`. Either add word-boundary anchors to the italic pattern, or wrap heading children in `parseInline()` consistently and document that unmatched asterisks are unsupported. Short-term: add a unit test for `"5 * 3"` and `"44*44"` to catch regressions. | S |
| 3 | No `schema.org BlogPosting` JSON-LD on post pages | medium | `app/blog/[slug]/page.tsx` (no ld+json block present) | The Phase 3 roadmap (`2026-05-28_Morgan_Phase2-4_Roadmap.md`) explicitly listed "BlogPosting structured data (OG tags, schema.org)" as a Phase 3 deliverable. OG tags are present; schema.org JSON-LD is not. Add a `<script type="application/ld+json">` block with `@type: BlogPosting`, `headline`, `datePublished`, `author`, and `url` fields. This is a single server-component render — no dependencies. | S |
| 4 | Empty `<ul aria-label="Tags">` emitted for zero-tag posts on the blog listing | low | `app/blog/page.tsx:143-149` | The post detail page (`[slug]/page.tsx:174`) guards with `post.tags.length > 0 &&`; the listing does not. An untagged post produces an empty labeled list that confuses screen readers. Mirror the detail page guard. | S |
| 5 | No future-date guard in `getBlogPosts()` — posts can be published before their date | medium | `lib/content.ts:111` | `getBlogPosts()` filters only on `!p.draft`. A post dated in the future (as the current placeholder is) appears live immediately. Add `.filter(p => p.publishedDate <= new Date().toISOString().slice(0, 10))` before the sort, matching how `draft: true` suppresses posts. Alternatively, document that `draft: true` is the intended pre-publish gate and enforce it in the content guide. | S |
| 6 | `HamburgerNav` hardcodes `'Available for work · 2026'` — year will stale at rollover | low | `components/HamburgerNav.tsx:253` | Sidebar and Footer derive the year via `new Date().getFullYear()`. HamburgerNav hardcodes `2026`. Replace with the dynamic expression to match the other surfaces. | S |
| 7 | Certificate badge images missing from disk — credentials page broken in production | critical | `content/certificates.json` (all 6 entries), `public/images/` (no `certificates/` dir) | `public/images/certificates/` does not exist. Every certificate renders a broken image. Add the 6 badge PNGs under `public/images/certificates/<slug>/badge.png`, OR extend `static-integrity.test.ts` to validate `<img src>` targets against the built `out/` directory so this class of missing-asset bug is caught automatically. | M |
| 8 | OG/canonical `metadataBase` points at wrong GitHub Pages domain | critical | `app/layout.tsx:65` | `siteUrl` is hardcoded as `'https://skylerhalisky.github.io/portfolio'` but the live site is `skypie99.github.io/portfolio`. Every OG/Twitter/canonical URL resolves to a dead host, so link-unfurl previews (LinkedIn, Slack, iMessage) 404. Fix the domain; ideally derive it from a single constant or from `profile.json` so it cannot drift. | S |
| 9 | Two GitHub Pages deploy workflows race on every push to `main` | critical | `.github/workflows/nextjs.yml` + `.github/workflows/deploy.yml` | Both trigger on `push: main` with conflicting `cancel-in-progress` settings (`false` vs `true`). Deploy outcomes are nondeterministic. Delete `.github/workflows/nextjs.yml` (the scaffold leftover). `deploy.yml` is the authoritative workflow per `docs/DEPLOY_PLAN.md`. | S |
| 10 | `ProjectCard` internal links use raw `<a>` instead of `<Link>` — 404 in production | critical | `components/ProjectCard.tsx:128-129,166` | Raw `<a href="/work/${d.id}/">` bypasses Next's `basePath` rewrite. In production the card title and primary CTA resolve to `https://skypie99.github.io/work/...` (no `/portfolio` prefix) — the primary navigation path 404s for all five projects. Replace both raw anchors with `<Link>` from `next/link`. | S |

---

## Proposed Next Feature Increments

These are proposals only — no code was written. Listed in recommended delivery order based on dependency graph and ROI.

---

### Increment 1: Real Blog Post — "Building AccessMap" (replaces placeholder)
**Owner:** Will (structure) + Sky (narrative)  
**Gate:** Increment 1 ships before the blog branch merges to `main`.

The current placeholder post (`content/blog.json`) is a test fixture with a placeholder disclaimer in the body. The infrastructure is ready; the content is not. This increment converts the scaffold post into a real, publishable article.

**Spec:**
- Sky writes the "Building AccessMap" narrative (problem / stack / what I learned — 400–600 words). Reference: `2026-05-28_Phase2_Case_Study_Drafts.md` has the skeleton.
- Will edits for voice consistency, updates `readingTimeMinutes` to match actual length, and replaces the placeholder disclaimer body.
- Remove the `draft: false` / future-date issue: set date to actual publish day.
- Add missing `schema.org BlogPosting` JSON-LD block to `app/blog/[slug]/page.tsx` (see Finding 3 above) as part of this increment.
- Gary: add one integration test asserting the real post body does not contain the string "This Post Is a Placeholder".

**Effort:** S (Sky narrative ~1 hr; Will edit + JSON-LD block ~2 hrs; Gary test ~30 min)

---

### Increment 2: Blog Renderer Hardening + Tag Filter
**Owner:** Shamus (implementation) + Gary (tests)  
**Gate:** Deploy after Increment 1 (real content needed to verify the renderer).

The inline `renderMarkdown` function has two confirmed defects (Findings 2, 24 from the Opus audit) and one omission (headings don't pass through `parseInline`). As Sky writes more posts this will produce visible bugs. This increment hardens the renderer and adds a tag-based filter to the listing page.

**Spec:**

*Renderer fixes:*
- Fix the `parseInline` regex to require word-boundary anchors on italic: `\*(?!\s)([^*]+?)(?<!\s)\*` so `44*44` is not mangled.
- Apply `parseInline()` to h2/h3 heading text, not just paragraphs (current code emits raw `**bold**` inside headings).
- Add a unit test suite for `renderMarkdown` covering: standalone asterisk, bold-in-heading, nested emphasis, unmatched asterisk, empty string.

*Tag filter (blog listing):*
- Add a client-side tag filter to `app/blog/page.tsx` using URL search params (`?tag=accessibility`) so the listing can be filtered without a full page reload. Requires converting to a `'use client'` component or extracting the filter into a child client component (preferred — keeps page as server component).
- Filter pill UI reuses the existing `TagPill` component. Active tag gets a terracotta fill variant.
- `generateStaticParams` is unaffected (tag filtering is client-side).
- Tests: verify filter renders the pill set and that selecting a tag hides non-matching posts.

**Effort:** M (renderer fixes S; tag filter M — requires client component architecture decision)

---

### Increment 3: RSS Feed + Sitemap
**Owner:** Will (schema + route) + Rory (deploy verification)  
**Gate:** Requires Increment 1 (at least one real post published). Can run in parallel with Increment 2.

The blog has no machine-readable feed. RSS enables newsletter aggregators, read-later apps, and future social sharing automation. A sitemap improves search indexing of new posts.

**Spec:**
- Add `app/blog/feed.xml/route.ts` — a static `GET` handler that returns an RSS 2.0 XML feed. Items are all non-draft, non-future posts from `getBlogPosts()`. Fields: `title`, `description` (summary), `link`, `pubDate`, `guid` (canonical URL). Rendered as a static file via `output: 'export'` using `generateStaticParams` trick (see Next 15 static export docs).
- Add `app/sitemap.ts` — Next 15's built-in `MetadataRoute.Sitemap` return. Include all `/blog/[slug]/` routes alongside existing `/work/[slug]/` routes.
- Add `<link rel="alternate" type="application/rss+xml" href="/blog/feed.xml">` to `app/layout.tsx` `<head>` so browsers and feed readers discover it.
- Schema addition: no changes to `BlogPostSchema` needed (all required RSS fields already exist).
- Tests: static-integrity assertion that `out/blog/feed.xml` exists and contains at least one `<item>` element when at least one non-draft post is present in `blog.json`.

**Effort:** M (RSS route M; sitemap S; head link S; static-integrity test S)

---

## DECISIONS FOR SKY

1. **Placeholder post gate:** Should the blog branch be held from merging to `main` until the "Building AccessMap" post is real content? Recommended: YES — a placeholder on a public portfolio reads as unfinished. Set `draft: true` immediately on the current entry as a safe bridge while the real post is written. (Finding 1)

2. **Future-date filtering:** Should `getBlogPosts()` silently exclude future-dated posts (so Sky can pre-load posts in `blog.json` with a future date and they go live automatically), or should `draft: true` always be the explicit pre-publish gate? The two models have different DX tradeoffs. Decision needed before Increment 1 ships. (Finding 5)

3. **Tag filter client/server architecture:** Increment 2's tag filter requires a client component. The blog listing is currently a pure server component (good for static export / TTFB). Options: (a) make the filter a child `'use client'` component and keep the page server, or (b) pass the active tag via URL query string and re-render server-side (requires `searchParams` — compatible with static export only at pre-known tag values). Which approach does Sky prefer? (Affects Increment 2 delivery.)

4. **RSS feed static export compatibility:** `app/blog/feed.xml/route.ts` requires verifying that `output: 'export'` can emit XML at this path in Next 15. If not, the feed can be generated as a build script and placed in `public/` instead. Rory should validate before Increment 3 ships.
