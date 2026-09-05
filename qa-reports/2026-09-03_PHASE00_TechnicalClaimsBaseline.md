# Phase 00 — Technical Claims Baseline (Read-Only Evidence Capture)

**Date:** 2026-09-03
**Scope:** Live production only — `https://skypistudio.com/`
**Verified build:** commit `19d946c9c48b325bce5d3a9f292d2cb48450cf01` (= `origin/main`, = local checkout `/Users/skypie/Portfolio-3.0-baseline`)
**Method:** No source files modified. No git commands run. No new tools/packages installed. Used `curl` (read-only), the Browser pane, `gh api` (read-only), and the Playwright/Chromium binary already present locally in `node_modules` / `~/Library/Caches/ms-playwright` to drive axe-core.

---

## Task 1 — Link Integrity (26 routes)

Checked with `curl -s -o /dev/null -w "%{http_code}"` against `https://skypistudio.com<path>`, both without following redirects and with `-L` (follow).

| Route | No-redirect code | Followed code | Notes |
|---|---|---|---|
| `/` | 200 | 200 | |
| `/404` | 200 | 200 | Real page at `/404`, not the framework's not-found handler |
| `/about` | 301 → `/about/` | 200 | |
| `/accessibility` | 301 → `/accessibility/` | 200 | |
| `/archive` | 301 → `/archive/` | 200 | Auth-gated app shell; `noindex,nofollow` (see Task 5c) |
| `/blog` | 301 | 200 | |
| `/blog/building-accessmap` | 301 | 200 | |
| `/blog/building-flagstone` | 301 | 200 | |
| `/certificates` | 301 | 200 | |
| `/colophon` | 301 | 200 | |
| `/contact` | 301 | 200 | |
| `/flagstone` | 301 | 200 | |
| `/flagstone/accessibility` | 301 | 200 | |
| `/flagstone/privacy` | 301 | 200 | |
| `/flagstone/support` | 301 | 200 | |
| `/flagstone/terms` | 301 | 200 | |
| `/runway` | 301 | 200 | `noindex,nofollow` (see Task 5b) |
| `/work` | 301 | 200 | |
| `/work/accessmap` | 301 | 200 | |
| `/work/claude-corp` | 301 | 200 | |
| `/work/dashboard` | 301 | 200 | |
| `/work/flagstone` | 301 | 200 | |
| `/work/ghost-code` | 301 | 200 | |
| `/work/mutual-mesh` | 301 | 200 | |
| `/work/prompt-library` | 301 | 200 | |
| `/sitemap.xml` | 200 | 200 | |

**Result: all 26 routes resolve to 200.** The 301s are the expected extensionless→trailing-slash redirect for this static export on GitHub Pages (`/foo` → `/foo/`), not broken links. Sanity check: a genuinely nonexistent path (`/this-route-does-not-exist-xyz`) correctly returns `404`, confirming the site's 404 handling is real and distinct from the 301 behavior above.

**No broken links found.**

---

## Task 2 — Metadata / Canonical Scan

Fetched raw HTML via `curl -s` for `/`, `/work/flagstone`, `/about`, `/accessibility`.

| Page | `<title>` | Meta description | Canonical `<link>` | og:title | og:image |
|---|---|---|---|---|---|
| `/` | Sky Halisky: AI Portfolio | "Sky Halisky is an AI builder crafting accessible, privacy-first tools from the Okanagan Valley, BC. Creator of Flagstone, the Prompt Library, and more." | **None found** | Sky Halisky: AI Portfolio | `https://skypistudio.com/opengraph-image.png` |
| `/work/flagstone` | Flagstone: Sky Halisky | "Community map of accessibility barriers: report a broken ramp, verify a neighbour's, see it marked fixed. Privacy-first: no ads, no analytics, no trackers." | **None found** | Flagstone: Sky Halisky | `https://skypistudio.com/showcase/flagstone/og-card.jpg` |
| `/about` | About: Sky Halisky | "Sky Halisky. AI builder. Okanagan Valley, British Columbia." | **None found** | About: Sky Halisky | `https://skypistudio.com/opengraph-image.png` |
| `/accessibility` | Accessibility: Sky Halisky | "How this site is built to be accessible: the specific choices, the honest limits, and how to report a barrier." | **None found** | Accessibility: Sky Halisky | `https://skypistudio.com/accessibility/opengraph-image.png` |

**Finding:** None of the four pages checked emit a `<link rel="canonical">` tag. Titles, meta descriptions, and OG tags are all present and page-specific. **This is a gap worth a decision from Sky/Will** — not a broken-link issue, but a missed SEO/duplicate-content safeguard (relevant given `/foo` and `/foo/` both resolve to content, per Task 1).

---

## Task 3 — Accessibility Automation (axe-core v4.11.4)

**Method note:** The task specified pasting `axe.min.js` (551 KB, effectively one 564,211-byte line) into the Browser pane via `javascript_tool`. In practice the Read tool truncates single-line output above ~25K tokens, and the live site's CSP (`script-src 'self' 'unsafe-inline'`, found in a `<meta>` tag) blocks loading axe from a CDN via `<script src>`. To still satisfy "run the actual local axe-core build against the live pages" without installing anything new, I used `playwright-core` (already a project devDependency, version pinned in `package.json`) driving the Chromium binary already cached at `~/Library/Caches/ms-playwright/chromium-1228` — no download, no install. The script read `node_modules/axe-core/axe.min.js` directly in Node (no truncation) and executed it via Playwright's `page.evaluate()`, which — like DevTools console execution — is not subject to the page's CSP. Confirmed `window.axe.version === "4.11.4"` on every page before scoring, i.e. this is a real execution of the shipped local axe-core build, not a stub.

Viewport: default (no explicit resize for this task); `resultTypes` requested: `violations`, `incomplete`, `passes`.

| Page | Violations | By impact | Passed rules | Incomplete (needs manual check) |
|---|---|---|---|---|
| `/` | **0** | — | 38 | `color-contrast` × 31 nodes |
| `/work` | **0** | — | 38 | `color-contrast` × 27 nodes |
| `/work/flagstone` | **0** | — | 41 | `color-contrast` × 18 nodes, `video-caption` × 1 node |
| `/about` | **0** | — | 36 | `color-contrast` × 7 nodes |
| `/contact` | **0** | — | 36 | `color-contrast` × 14 nodes |
| `/accessibility` | **0** | — | 37 | `color-contrast` × 7 nodes |

**Zero automated violations on all 6 pages.** Every page has exactly one recurring `incomplete` item: `color-contrast` — "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds." This is axe-core's standard behavior when it cannot algorithmically resolve contrast (e.g. elements over gradients/images, or partial transparency) — it is **not** a violation, but does mean those specific nodes need a manual/visual contrast check rather than being cleared automatically. `/work/flagstone` additionally has one `video-caption` incomplete item (1 node) — axe cannot verify captioning automatically and flags it for manual confirmation.

No page failed to load axe; no UNVERIFIABLE results.

---

## Task 4 — Performance Baseline (Navigation Timing API, NOT Lighthouse)

**Label: this is a Navigation Timing API baseline, not a Lighthouse score.** Captured via `javascript_tool` in the Browser pane at a 1440×900 viewport.

| Page | TTFB (responseStart) | DOMContentLoaded | Load event | Resource count | Total transfer (bytes) | Total encoded body (bytes) |
|---|---|---|---|---|---|---|
| `/` | 12.9 ms | 689.1 ms | 859.2 ms | 32 | **0*** | 1,004,456 |
| `/work/flagstone` | 215.9 ms | 380.9 ms | 575.6 ms | 30 | **198,330** | 551,161 |

\* The `/` measurement reflects a **warm/cached repeat load** — this session had already navigated to `/` several times, so every resource reported `transferSize: 0` (a valid, spec-correct signal for disk-cache hits, confirmed by inspecting individual `PerformanceResourceTiming` entries — e.g. a CSS file showed `transferSize: 0` but `encodedBodySize: 19,942`). `/work/flagstone` was the first navigation to that path in this session and shows a genuine cold-network transfer of **~198 KB**. Treat the `/` transfer number as not meaningful; its timing numbers (TTFB/DCL/load) are still real render-timing measurements, just for a cache-warmed load. If a true cold-cache figure for `/` is needed, it should be re-measured in a fresh browser profile/incognito context.

---

## Task 5 — Claims / Boundary Reverification

### 5a. Flagstone status language (verbatim excerpts, <15 words each)

**`/work/flagstone`** (the only page among the five that discusses product status):
- "App Store review submitted · August 2026" (status field on the case study)
- "The iOS app has not shipped." — *Source: `/work/flagstone`*
- "...submitted to Apple for App Store review on August 31, 2026" — *Source: `/work/flagstone`*
- "Apple approval and public App Store availability have not been established." — *Source: `/work/flagstone`*

No "released," "live," or adoption/user-count claims found for the iOS app anywhere on this page — framing is consistently "submitted for review," explicitly **not** "approved" or "shipped." The page separately notes the web build is "browsable today," which is a distinct, accurate claim about the web build only, not the App Store submission.

**`/flagstone/privacy`, `/flagstone/support`, `/flagstone/terms`, `/flagstone/accessibility`:** No product-status, adoption, or traction language found on any of these four pages (checked via targeted regex for status/adoption/traction/tester/beta keywords — zero matches beyond generic feature description, e.g. Support page explains the flag/verify/resolve mechanic without user counts). These read as standard legal/support boilerplate, consistent with not overclaiming.

### 5b. robots.txt / sitemap.xml boundary check

`robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://skypistudio.com/sitemap.xml
```
No `Disallow` rules — indexing is controlled per-page via `<meta name="robots">` instead.

`sitemap.xml` lists 14 URLs: `/`, `/work/`, `/about/`, `/certificates/`, `/blog/`, `/contact/`, `/accessibility/`, `/colophon/`, `/work/flagstone/`, `/work/claude-corp/`, `/work/dashboard/`, `/work/prompt-library/`, `/work/ghost-code/`, `/blog/building-flagstone/`.

**All sitemap entries are public, non-boundary content** — good.

**Findings worth flagging:**
- `/archive` and `/runway` both carry an explicit `<meta name="robots" content="noindex, nofollow">` tag and are correctly omitted from the sitemap — consistent, intentional exclusion.
- `/work/mutual-mesh`, `/work/accessmap`, `/flagstone/privacy` (and its sibling legal pages), and `/blog/building-accessmap` are **omitted from the sitemap but carry no `noindex` meta tag** — meaning they are indexable-by-default and 200-OK, just not proactively submitted via the sitemap. This isn't a privacy leak (all are meant-to-be-public pages), but it's an inconsistency: some public pages get sitemap entries and some don't, with no `noindex` signal explaining the omission. Worth a decision on whether the sitemap should be exhaustive.
- `/archive` is more than just noindexed — its HTML shows it's an **auth-gated app shell** (`<div class="studio-archive-root">` / `"opening the studio…"` auth prompt), i.e. a private curation surface, not public content. This is a separate thing from the public studio archive site found in 5c below.

### 5c. Studio Archive public repo (`Skypie99/studio-archive`)

Confirmed via `gh api repos/Skypie99/studio-archive/pages -q '{html_url,status}'`:
```
{"html_url":"https://skypie99.github.io/studio-archive/","status":"built"}
```
Repo itself: `visibility: public`.

The live site actually serves from a custom domain, confirmed via its own canonical tag: **`https://archive.skypistudio.com`**.

- `archive.skypistudio.com/robots.txt`: `User-agent: * / Allow: /`, with its own `Sitemap: https://archive.skypistudio.com/sitemap.xml`.
- Canonical tag on its homepage: `<link rel="canonical" href="https://archive.skypistudio.com">` — present and correct.
- Title: "The Studio Archive · Skypi Studio". Meta description: *"A view-only public archive of Skypi Studio: 67 artworks in the order they were made, and a catalogue of 117 art supplies and colours."*

**One sentence:** The site explicitly self-describes as **"a view-only public archive"** in its own meta description — it presents itself as archival/reference material, not live product data, and this framing is machine-readable (not just a subjective read of the design). Note this is distinct from the noindexed, auth-gated `/archive` path on the main portfolio domain (5b) — the two "archive" surfaces are different things (one private/gated on `skypistudio.com`, one public/read-only on `archive.skypistudio.com`), and neither leaks the other's intended boundary as far as this check could tell.

### 5d. Dashboard repo visibility

Confirmed via `gh repo view Skypie99/Dashboard --json visibility,isPrivate`:
```
{"isPrivate":true,"visibility":"PRIVATE"}
```
**Still PRIVATE, no change from the 2026-09-03 baseline.**

---

## Summary of flags for Sky

1. **No canonical `<link>` tags** on any of the 4 pages checked in Task 2 — likely site-wide, given the pattern. Not broken, but a missed duplicate-content safeguard worth a decision.
2. **Sitemap is not exhaustive** — `/work/mutual-mesh`, `/work/accessmap`, the Flagstone legal pages, and `/blog/building-accessmap` are public/200 but neither in the sitemap nor noindexed. Worth deciding whether that's intentional.
3. Everything else — link integrity, axe-core violations, Flagstone status-language framing, robots/sitemap privacy boundaries, studio-archive self-description, Dashboard privacy — came back clean/as-expected. **Nothing UNVERIFIABLE.**
