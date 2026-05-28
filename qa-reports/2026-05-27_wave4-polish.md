# Portfolio — Wave 4 Polish Pass

**Date:** 2026-05-27
**Branch:** `feat/portfolio-wave4-2026-05-27`
**Base:** `design/portfolio-creative-polish-2026-05-27`
**Status:** Build green · 45/45 tests · lint clean

---

## What was done

### 1. SEO — Open Graph (was entirely absent)

Every page now ships a full social-sharing head. Changes:

| Page | Before | After |
|------|--------|-------|
| `/` (layout) | title + description only | + `metadataBase`, `og:type`, `og:title`, `og:description`, `og:image`, `og:siteName`, `og:locale`, `twitter:card` |
| `/about` | title + description | + openGraph + twitter card |
| `/work` | title + description | + openGraph + twitter card |
| `/work/[slug]` | title + description | + openGraph (`type: article`) + twitter card |

`metadataBase` is set to `https://skypie99.github.io/portfolio` so relative `/og-image.svg` resolves correctly in production.

**Branded OG image created:** `public/og-image.svg` — 1200×630, terracotta/cream palette, includes name, tagline, availability pill, decorative ampersand ornament, and site URL.

> **Sky note:** SVG works for WhatsApp, iMessage, and many link-preview crawlers. For LinkedIn and Twitter/X card previews, convert to a 1200×630 PNG (`public/og-image.png`) and update the `og-image.svg` → `og-image.png` references in all four `generateMetadata()` calls. A Figma export or `sharp` CLI conversion works fine.

---

### 2. Mobile polish (375px verified)

**ProjectCard min-height:**
- Non-wide cards: `min-h-[520px]` → `min-h-[360px] sm:min-h-[520px]`
- Wide (featured) card: removed fixed min-height on mobile; the mockup + content stack naturally

**CTA row in ProjectCard:**
- Changed `flex items-center gap-5` → `flex flex-wrap items-center gap-x-5 gap-y-2`
- Added `whitespace-nowrap` to all three link elements (Case study, Live demo, GitHub)
- Before: "CASE / STUDY →" would break mid-phrase at 375px
- After: items wrap as complete phrases — "CASE STUDY → · LIVE DEMO ↗" on line 1, "GITHUB ↗" wraps to line 2

Verified at 375×812 via preview screenshot. No console errors.

---

### 3. Performance

- `images: { unoptimized: true }` is already correct for GH Pages — intentional, no change needed
- All `<img>` elements in `work/[slug]/page.tsx` already carry explicit `width`/`height` — no CLS risk
- `AppMockup` is pure JSX/SVG with fixed pixel dimensions — no CLS risk
- First Load JS: 109 kB on `/` — identical to pre-wave4 baseline

---

### 4. Copy review

**deliverables.json — two summaries rewritten:**

| Project | Before | After |
|---------|--------|-------|
| AccessMap | "A privacy-respecting accessibility-flagging app helping disabled users navigate the city with care and confidence." — passive, vague | "Expo/React Native app where disabled residents flag inaccessible paths, broken ramps, and missing curb cuts — then share fixes with their neighbourhood." — active, concrete, 154 chars ✓ |
| Mutual Mesh | "Privacy-first mutual-aid platform connecting neighbours who want to give with neighbours who need a hand." — passive | "E2E-encrypted Expo app for mutual aid: neighbours post what they can share and what they need, matched privately without a central record of requests." — active, specifics, 150 chars ✓ |

Other copy (hero subhead, Process steps, About paragraphs) reviewed and left unchanged — already strong from the Wave 3 pass.

---

### 5. Micro-interactions — no regressions

Audited all hover/focus states:
- Card hover: `hover:-translate-y-1 hover:shadow-soft hover:border-pebble` ✓
- `link-draw` underline draw-in ✓
- Certificate row `group-hover:text-accent-text` ✓
- Hero status ping loop ✓
- CTA dot pulse ✓
- Scroll-driven section reveals ✓

No new transitions introduced; no existing ones removed.

---

## Verification

```
npm run typecheck  ✓
npm run lint       ✓  (No ESLint warnings or errors)
npm run test       ✓  45/45
npm run build      ✓  12 static pages exported
```

Preview verified at:
- Desktop 1280px — hero, sidebar, card grid ✓
- Mobile 375×812 — hero, card content, CTA row, no console errors ✓

---

## Open for Sky

1. **Convert `og-image.svg` → `og-image.png`** for LinkedIn/Twitter card support (see note above)
2. This branch is ready to merge into `main` once Sky reviews — no auto-merge

## Commit

```
ca4e83d feat(wave4): SEO/OG tags, mobile polish, copy sharpening
```
