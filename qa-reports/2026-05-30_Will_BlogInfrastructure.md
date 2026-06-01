# Will — Blog Infrastructure Build Report
**Date:** 2026-05-30  
**Branch:** `feat/blog-infrastructure-2026-05-30`  
**Role:** Will (Feature Developer)

---

## What Was Built

### Routes
| Route | Type | File |
|-------|------|------|
| `/blog` | Static (SSG) | `app/blog/page.tsx` |
| `/blog/[slug]` | Static (SSG, generateStaticParams) | `app/blog/[slug]/page.tsx` |
| `/blog/building-accessmap` | Static page generated at build | (from generateStaticParams) |

### Schema
- `BlogPostSchema` added to `lib/schema.ts` — fields: `id` (slug), `title`, `summary` (max 200 chars), `publishedDate` (ISO), `tags` (max 6), `readingTimeMinutes`, `content` (markdown string), `draft?: boolean`
- `BlogPost` type exported from `lib/schema.ts`

### Content Loader
- `getBlogPosts()` added to `lib/content.ts` — reads `content/blog.json`, validates each entry through `BlogPostSchema`, deduplicates IDs, filters `draft: true`, sorts newest-first by `publishedDate`

### Content File
- `content/blog.json` — 1 placeholder post: `building-accessmap` (5 min read, 4 tags, draft: false)

### Components
- **Blog listing page** (`app/blog/page.tsx`): numbered-index editorial layout, post cards with title/date/summary/tags/reading-time, links to individual posts. Matches cream/blush/terracotta design system.
- **Blog post page** (`app/blog/[slug]/page.tsx`): breadcrumb, meta row (date, reading time), h1 title, summary, tags, prose body, back link. Lightweight custom markdown renderer handles h2, h3, **bold**, *italic*, paragraphs — no external dependency added.

### Navigation Updates
- `components/HamburgerNav.tsx`: "Blog" nav item added between About and Contact
- `components/Sidebar.tsx`: "Writing / Read the blog →" slot added between Featured and bottom CTA

### Tests
- `lib/__tests__/blog.test.ts`: 11 tests — real content/blog.json integration (returns array, validates schema, filters drafts, sorts newest-first, no duplicate IDs) + BlogPostSchema unit tests (valid shape, draft shape, invalid/missing fields, summary length, slug format, too many tags)
- `components/__tests__/BlogIndex.test.tsx`: 8 tests — mocked getBlogPosts, renders heading, post titles, summaries, links, post count, reading time, back link, empty state

---

## Test Count

| Before | After | New |
|--------|-------|-----|
| 88 tests | 107 tests | +19 |

All 107 tests pass. No regressions.

---

## TSC Result

```
npm run typecheck → 0 errors, 0 warnings
```

---

## Build Result

```
✓ Generating static pages (15/15)
✓ Exporting (2/2)

/blog          → static
/blog/building-accessmap → SSG via generateStaticParams
```

Build completes cleanly. All existing routes intact. No dynamic server routes introduced (compatible with `output: 'export'`).

---

## How Sky Adds New Posts

1. Open `content/blog.json`
2. Add a new object to the array following this shape:
```json
{
  "id": "my-post-slug",
  "title": "My Post Title",
  "summary": "One or two sentences. Max 200 characters.",
  "publishedDate": "2026-06-15",
  "tags": ["tag-one", "tag-two"],
  "readingTimeMinutes": 5,
  "draft": false,
  "content": "## Section Heading\n\nParagraph text here. **Bold** and *italic* work.\n\n## Another Section\n\nMore paragraphs."
}
```
3. Run `npm run build` — the schema validates and the page generates automatically
4. To hide a post while drafting it: set `"draft": true` — it won't appear in the listing or get a static page at build time

Rules enforced at build time:
- `id` must be kebab-case (URL-safe)
- `summary` max 200 characters
- `tags` max 6 entries
- Duplicate `id` values throw a build error
- `publishedDate` must be ISO format `YYYY-MM-DD`

---

## Decisions Made

- **No `react-markdown` dependency** — the content is basic markdown (headings, bold, italic, paragraphs). A custom inline renderer in `[slug]/page.tsx` handles all current content with zero bundle impact. If Sky needs tables, code blocks, or ordered lists later, migrate to `react-markdown` at that point.
- **Markdown in JSON** — simple and consistent with the existing pattern (everything in `content/*.json`). No MDX, no filesystem routing for blog posts, no build pipeline changes.
- **`generateStaticParams()` filters drafts** — draft posts are never statically generated, which means they also won't 404 in production; they simply don't exist as pages.

---

## Safe to Merge

**YES** — with one note:

The branch was created off `main` (which is at `e782202`). There are several other open branches (`feat/dark-mode-2026-05-30`, `feat/shamus-phase2-ui-2026-05-29`, etc.) that touch overlapping files (HamburgerNav, Sidebar). Standard merge conflict review required before merging. No automated merge should happen without Rory + Gary sign-off per the established gate.

**DECISIONS FOR SKY:**
- Should the Sidebar blog link live in the Featured slot or as its own dedicated slot? Currently it's its own "Writing" block — uses vertical space. If the sidebar feels crowded after the dark-mode changes land, it could be collapsed into the bottom link group.
