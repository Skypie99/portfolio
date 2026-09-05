# Phase 00 — Visual Baseline Capture

**Date:** 2026-09-03
**Scope:** Read-only browsing + screenshotting of production (`http://skypistudio.com/`), built from commit `19d946c9c48b325bce5d3a9f292d2cb48450cf01` (== verified `origin/main`, accepted Phase 00 planning baseline). No source files were modified, no git commands were run, nothing was installed.
**Method:** Claude Browser pane (`mcp__Claude_Browser__*`). Viewports emulated via `resize_window` (375×812 mobile, 768×1024 tablet, 1440×900 desktop). Theme toggled via the site's own light/dark control (a `next-themes`-style button in the nav, `aria-label="Switch to light/dark mode"`); state changes were confirmed programmatically each time by reading `document.documentElement.className` (`...js light` / `...js dark`) rather than by eyeballing the screenshot alone.

Routes captured: `/`, `/work`, `/work/flagstone`, `/about`, `/contact`, `/accessibility`. All six resolved as distinct, real routes (not 404s, not client-side redirects to `/`) — confirmed via page `<title>` changes on navigation (`Sky Halisky: AI Portfolio` / `Selected Work: Sky Halisky` / `Flagstone: Sky Halisky` / `About: Sky Halisky` / `Contact: Sky Halisky` / `Accessibility: Sky Halisky`).

**Result: 36 / 36 combinations captured.** (See "Not captured / issues" for one adjacent limitation encountered along the way — the resolved, post-intro Home hero could not be *screenshotted* at desktop/tablet width due to a reproducible site rendering bug, but the required evidence was still obtained by other means and is reported below.)

---

## 1. Screenshot grid (36/36)

For `/`, the "visual description" reflects the page's actual first-paint state: a cinematic full-bleed photo intro (see Preserve-item check #1). This is what a fresh navigation to `/` shows in all six Home cells below, per the task's "top of the page, first load" instruction.

| Route | Viewport | Theme | One-line visual description |
|---|---|---|---|
| `/` | 375×812 | dark | Identity plate top-left ("SKY HALISKY / TECHNICAL SUPPORT / AI-ASSISTED BUILDER") on dark pill, hamburger icon top-right, full-bleed sky/cloud photo mid-transition, "SCROLL" + "SKIP INTRO ↓" pills bottom. |
| `/` | 375×812 | light | Same layout, pills switch to light/cream backgrounds; identical photo (photo itself isn't theme-tinted). |
| `/` | 768×1024 | light | Same intro layout scaled to tablet width; identity plate top-left, "SCROLL"/"SKIP INTRO" pills bottom-center/right. |
| `/` | 768×1024 | dark | Same as above with dark-toned chrome (pills, plate) over the same photo. |
| `/` | 1440×900 | light | Full-bleed desert/monument-valley photo, identity plate top-left, "SCROLL ⌄" and "SKIP INTRO ↓" pills bottom; no other UI. |
| `/` | 1440×900 | dark | Identical composition, dark-toned pill chrome. |
| `/work` | 375×812 | dark | Left-aligned "THE WORK: 5 DELIVERABLES" eyebrow, large "The Work" heading, intro paragraph, then project card 01 (Flagstone) with phone-screenshot image and barrier-report popup visible. |
| `/work` | 375×812 | light | Same content, cream/tan background, dark ink text. |
| `/work` | 768×1024 | light | Two-column layout: persistent left sidebar (name, theme toggle, "FEATURED: Flagstone", "NOTES"), right content column with heading + card 01 (Flagstone, phone mockup). |
| `/work` | 768×1024 | dark | Same layout, dark sidebar (near-black) and dark content panel. |
| `/work` | 1440×900 | light | Sidebar + content two-column layout; card 01 Flagstone image was mid-lazy-load (blurred) on this specific load. |
| `/work` | 1440×900 | dark | Same layout, dark theme; Flagstone image rendered sharp (fully loaded) on this load. |
| `/work/flagstone` | 375×812 | light | "THE WORK / FLAGSTONE" breadcrumb, "FEATURED · SOLO BUILDER · AI-ASSISTED · SKY HALISKY" tags, large "Flagstone" heading, description paragraph, "LIVE DEMO ↗" pill button, phone-mockup screenshot below. |
| `/work/flagstone` | 375×812 | dark | Same content, dark background, orange "Flagstone" heading retains its accent color. |
| `/work/flagstone` | 768×1024 | dark | Left sidebar (Flagstone re-listed as "FEATURED") + right detail column with breadcrumb, heading, tag row, description, "LIVE DEMO" button, phone mockup. |
| `/work/flagstone` | 768×1024 | light | Same layout, light theme. |
| `/work/flagstone` | 1440×900 | light | Sidebar with "ON THIS PAGE" jump-links (The Problem / The Approach / Where It Stands / My Role / What Went Wrong / Reflection) + right column: title, description, LIVE DEMO button, phone screenshot (blurred, lazy-loading) + status/role/year metadata. |
| `/work/flagstone` | 1440×900 | dark | Same layout, dark theme, phone image rendered sharp. |
| `/about` | 375×812 | dark | "A BRIEF ACCOUNT" eyebrow, "I build things with AI." heading, bio paragraph, pull-quote "Accessibility is not an add-on. It is where you begin." |
| `/about` | 375×812 | light | Same content, light theme. |
| `/about` | 768×1024 | light | Sidebar (Flagstone featured, "ON THIS PAGE": Method/Principles/Currently/The Work) + right column with heading, bio paragraph, pull-quote. |
| `/about` | 768×1024 | dark | Same layout, dark theme. |
| `/about` | 1440×900 | dark | Sidebar + content: "I build things with AI." heading, bio paragraph, italic pull-quote, "I work from Canada..." paragraph, then project-list preview beginning. |
| `/about` | 1440×900 | light | Same layout, light theme. |
| `/contact` | 375×812 | light | "LET'S TALK" eyebrow, "Write to me." heading, short paragraph, "EMAIL ME" pill button, "FULL HISTORY ON LINKEDIN ↗" link, "ELSEWHERE" section heading below. |
| `/contact` | 375×812 | dark | Same content, dark theme. |
| `/contact` | 768×1024 | dark | Sidebar + content: "Write to me." heading, paragraph, "EMAIL HELLO@SKYPISTUDIO.COM" pill, LinkedIn link, "Find me in other quiet corners." section with GitHub handle "@skypie99" visible. |
| `/contact` | 768×1024 | light | Same layout, light theme. |
| `/contact` | 1440×900 | light | Sidebar + content: "Write to me." heading, paragraph, email pill button (full address shown at this width), LinkedIn link, "Find me in other quiet corners." section heading. |
| `/contact` | 1440×900 | dark | Same layout, dark theme. |
| `/accessibility` | 375×812 | dark | "ACCESSIBILITY" eyebrow, "Accessibility is where I begin." heading, subhead sentence, drop-cap body paragraph beginning "This site is built to be used by everyone, including people who navigate with a keyboard, a screen reader, or with motion turned down..." |
| `/accessibility` | 375×812 | light | Same content, light theme. |
| `/accessibility` | 768×1024 | light | Sidebar + content: heading, subhead, "ON THIS PAGE" jump-links (The standard I aim for / What I built in / Measured, not claimed / What I have not done / Found a barrier? Tell me.), drop-cap body paragraph, "The standard I aim for" section start. |
| `/accessibility` | 768×1024 | dark | Same layout, dark theme. |
| `/accessibility` | 1440×900 | dark | Sidebar + content: heading, subhead, drop-cap paragraph (contrast/keyboard/AA-related copy visible further down, not fully read at top-of-page crop). |
| `/accessibility` | 1440×900 | light | Same layout, light theme. |

---

## 2. Preserve-item checks

### PR-001 — Cinematic first frame (Home, 1440×900, light, true first load)

Confirmed sparse and cinematic. On a fresh navigation to `/` at desktop/light, the only elements on screen are:
- A full-bleed photographic background (a desert/monument-valley scene at sunset in this run; the intro appeared to be a short sequence of such photos).
- An identity plate, top-left: "SKY HALISKY / TECHNICAL SUPPORT / AI-ASSISTED BUILDER" on a translucent rounded pill.
- A "SCROLL ⌄" pill, bottom-center.
- A "SKIP INTRO ↓" link/pill, bottom-right — real, labeled, and present in the accessibility tree (`link "Skip intro" href="#hero"`), not just visual chrome.

No recruiter-copy block, no progress bar/step indicator, and no CTA cluster were present anywhere in this first frame. The only interactive/text elements are the identity plate and the two bottom pills described above — confirmed both visually (screenshot) and via `read_page`/`find` (accessibility tree), which listed exactly: the "Sky Halisky" logo link, the theme-toggle button, the main nav links (present in the DOM but not visually surfaced in this frame), and "Skip intro."

### PR-004 — Hero sentence (Home)

**Exact verbatim text:** "Senior technical-support specialist. I turn recurring user friction into documentation, QA, and the tools that fix it."

This immediately follows an "Sky Halisky" name heading. It was confirmed two ways:
1. Visually, in a full render at 375×812 (mobile) after clicking "Skip Intro" — screenshot shows the sentence rendering correctly under a circular portrait photo and the "Sky Halisky" name.
2. Via `get_page_text` DOM extraction of the full page, which returned the identical string in the same position in reading order (immediately after "Sky Halisky", before "PORTFOLIO: 2026").

Both light and dark confirmed the same copy (theme does not alter this text).

### PR-006 — Flagstone hierarchy (`/work`)

Confirmed: Flagstone is listed first (card "01") and is also called out separately, above/beside the list, in a persistent "FEATURED" sidebar block (present on `/work`, `/work/flagstone`, `/about`, `/contact`, and `/accessibility` alike) reading "FEATURED / Flagstone / Solo builder · AI-assisted / OPEN IT →".

Full visible ordering on `/work` (via `get_page_text`, "Deliverables" section):
1. **01 — Flagstone** — "App Store review submitted · August 2026." Rendered as a bordered, shadowed card containing a phone-mockup screenshot plus title/description/status and three action links (View Project / Live / GitHub).
2. **02 — Claude Corp** — "In active use, on my projects only." Rendered as a plainer, borderless full-width band (image + text sit directly on the page background, no visible card border/shadow in this run) — a visibly lighter treatment than card 01.
3. **03 — Claude Corp Dashboard** — "Private operator app · public synthetic demo."
4. **04 — Prompt Library** — "Live and evolving · no backend of mine."
5. **05 — Ghost Code** — "Complete · live · no backend."

Flagstone (01) is the only project additionally pinned in the sidebar "FEATURED" block, and its card in the main list is the only one observed with a distinct bordered/shadowed container in this run — both consistent with the preserve-item's "more depth/prominence" expectation.

### Reduced motion — UNVERIFIABLE

Not exercised. The `resize_window` tool's `colorScheme` parameter only emulates `prefers-color-scheme` (light/dark); it does not expose a `prefers-reduced-motion` emulation. No in-page "reduce motion" toggle was found on the site itself (`find "reduce motion"` returned no matches across the pages visited). No other means of setting `prefers-reduced-motion: reduce` was available in this Browser-pane toolset, so this preserve-item could not be checked in this pass and is marked UNVERIFIABLE — a real device/OS-level test (or Chrome DevTools rendering emulation, not available here) would be needed.

---

## 3. Not captured / issues

- **Home hero screenshot at desktop/tablet width, post-"Skip Intro" (not part of the required 36 — this was extra verification for PR-004):** reproducibly blank/unrenderable in this tool. Clicking "Skip Intro" (or navigating straight to `/#hero`) at 1440×900 or after resizing from mobile back to 1440×900 leaves the viewport showing only the flat page background color, with no hero content visible, in both light and dark theme. Root cause identified via DOM inspection: a GSAP ScrollTrigger "pin-spacer" element (`div.pin-spacer`, height 3420px, z-index 50) created for the cinematic intro remains in the layout/stacking order after the anchor-jump and intercepts hit-testing (`document.elementFromPoint` at the theme-toggle button's coordinates returned the pin-spacer, not the button) even though the underlying hero DOM content is present and correct (confirmed via `get_page_text`). The same scroll position at 375×812 (mobile) renders and is clickable normally — this pinning behavior appears specific to desktop/tablet widths. This did not block completion of the 36-grid (Home's grid cells use the first-load intro state, which rendered normally in every case) or PR-004 (confirmed via mobile screenshot + DOM text, see above), but it did block a *direct* desktop screenshot of the resolved Home hero and initially blocked clicking the desktop theme toggle during the intro (worked around using a synthetic `element.click()` call, which bypasses hit-testing and does reach the real handler — confirmed via `localStorage.theme` and `document.documentElement.className` changing correctly).
- **Reduced motion:** UNVERIFIABLE, see above — no toggle on-site, no OS/browser-level emulation available in this tool.
- All 36 required grid combinations were otherwise captured without incident; no page returned an error, 404, or unexpected redirect during this pass.
