# Codex Flagstone First-Impression Refresh — 2026-09-01

## DECISIONS FOR SKY

- [ ] **Review and merge the isolated candidate** — the refresh is committed locally; nothing was pushed, merged, or deployed.
  - **Recommendation:** Review `codex/flagstone-first-impression-20260901` at implementation commit `1cfb4b1a8a21d26a006a7c4519d6d6028555509a`, then merge through Sky's normal process.
  - **Why:** The requested source, visual, metadata, performance, and production-static gates are green.
  - **Alternative:** Leave the branch unmerged; `main` and the deployed portfolio remain unchanged.
  - **Impact:** Merging replaces the recruiter-facing Flagstone media and layout on the next Sky-controlled deployment.

## BLOCKERS / FAIL_FAST

- None remaining.
- The first sandboxed production build could not resolve the existing Google Fonts host. The same build passed after network access was allowed. This was environmental, not a source failure.
- The first static-integrity run exposed a stale test assumption that all three showcase cards carried dates. The two supplied current-product stills have no independently proven capture dates, so the assertion was narrowed to the preserved dated drawer clip and dated test receipt. The full static gate then passed.

## Summary

The homepage flagship and `/work/flagstone/` now lead with Sky's current Explore screen, including the real barrier photograph and current controls. The reporting and community-review stills are refreshed from the supplied captures, the existing drawer animation is unchanged, the redundant inline defect screenshot is removed without altering the essay, and the Flagstone hero now scrolls as one normal-flow composition. The Flagstone `g` is fully visible at desktop and mobile widths, sharing metadata points to a refreshed 1200×630 current-product card, and all requested local gates pass.

## What changed

- `app/work/[slug]/page.tsx:226` — removed the Flagstone-only inline defect exhibit while preserving all explanatory prose.
- `app/work/[slug]/page.tsx:494` — exempted only Flagstone from the desktop sticky media behavior, keeping the phone and copy in one scroll plane.
- `app/work/[slug]/page.tsx:650` — increased only the Flagstone hero title line box so the descender is no longer clipped.
- `app/work/[slug]/page.tsx:931` — gave the two supplied lower stills a stable crop appropriate to their portrait source.
- `app/page.tsx:551` — replaced the stale dated capture label with the truthful date-free label `Current product capture · Explore`.
- `scripts/showcase/wiring.mjs:29` and `content/deliverables.json` — wired the new Explore, Report a flag, and Review barriers assets with descriptive alt text, current captions, and no invented dates or commits.
- `scripts/showcase/wiring.mjs:51` — explicitly preserved the existing drawer shot and motion clip byte-for-byte.
- `scripts/wire-showcase.mjs` and `lib/showcaseWire.ts` — extended the existing validated wiring path to support supplied optimized assets, a preserved scoped shot, and hero-plate metadata.
- `scripts/og-cards.mjs:40` — made the current supplied Explore master the reproducible Flagstone social-card source and added a scoped `--project` option.
- `public/showcase/flagstone/` — added AVIF/WebP product assets and regenerated `og-card.jpg`; raw multi-megabyte phone captures are not shipped.
- `app/__tests__/flagstone-first-impression.test.ts:8` — added regression coverage for current hero media, truthful metadata, preserved motion, refreshed lower stills, removed exhibit, normal-flow hero, and descender spacing.
- `qa-reports/visual-evidence/2026-09-01_flagstone-first-impression/` — stored candidate-attributed before/after desktop and mobile evidence.

## Branch + SHA

- Worktree: `/Users/skypie/Portfolio-codex/flagstone-first-impression-20260901`
- Branch: `codex/flagstone-first-impression-20260901`
- Starting `origin/main`: `2cc82eeaa00f9c2ebd4a489a12d9b0f392c86bab`
- Implementation commit: `1cfb4b1a8a21d26a006a7c4519d6d6028555509a`
- Production, `main`, remote branches, and deployed files: unchanged

## Gates

- `node scripts/wire-showcase.mjs scripts/showcase/wiring.mjs --dry` — PASS; five configured slugs validated cleanly.
- Focused Vitest run — PASS; 5 files, 36 tests.
- `npm run typecheck` — PASS.
- `npm run lint` — PASS; no warnings or errors from ESLint. Next printed its existing static-export headers notice and `next lint` deprecation notice.
- `npm test` — PASS; 81 files passed, 1 skipped; 727 tests passed, 54 skipped. Existing React test-environment warnings were printed; no failures.
- `npm run build` — PASS; Next 15.5.18 compiled and exported 26 static pages. `/work/[slug]` reports 124 kB first-load JS.
- `npm run test:static` — PASS after the truthful-date test correction; 2 files passed, 53 tests passed, 1 skipped.
- `git diff --check` — PASS.
- Local browser direct-entry QA — PASS at 1440×900 and 375×812, in light and dark themes; no horizontal overflow and no browser console warnings/errors.
- Reduced-motion contract — PASS through the existing CSS-only `prefers-reduced-motion: no-preference` entrance gate and 11 passing `HeroSettle` tests that prove visible-at-rest markup. The in-app browser does not expose an OS reduced-motion emulator, so this is source and automated evidence rather than a toggled-OS screenshot.

## Direct-entry and scroll evidence

- A ten-second `/work/flagstone/` scan clearly presents: Flagstone as the product, accessibility-barrier mapping as its purpose, Sky as solo builder with AI assistance, App Store review submitted in August 2026 as current status, and current real product UI as evidence.
- The old inline `FIG · REPORT-COMPOSED` exhibit is absent from the DOM; the entire What went wrong narrative remains.
- Desktop scroll samples at Y 0/225/450/675/900 show the phone and title moving by the same delta. The phone's computed position is `relative`, not `sticky`.
- Desktop title line box changed from 71.4 px line-height / 77 px scroll height to 78.2 px / 80 px; the descender is visibly complete.
- Mobile title line box is 51.0 px with no clipping, and `document.body.scrollWidth` equals the 375 px viewport.
- Both themes load the same honest current dark product capture rather than recolouring it into a fictional light version.

## Sharing metadata audit

- Title: `Flagstone — Sky Halisky` — current and specific.
- Description: current accessibility-map and privacy-first summary — unchanged and accurate.
- Open Graph URL: `https://skypistudio.com/work/flagstone/`.
- Open Graph image: `https://skypistudio.com/showcase/flagstone/og-card.jpg`.
- Image dimensions: 1200×630; Twitter card is `summary_large_image`.
- The regenerated image shows the current Steep grade card and real barrier photograph rather than the stale map capture.

## Performance

- Current Explore AVIF: 126,271 bytes; WebP fallback: 195,758 bytes. The 3,552,227-byte source PNG is not tracked or shipped.
- Reporting AVIF: 30,677 bytes versus the previous themed AVIFs at 29,671–33,587 bytes.
- Community AVIF: 33,079 bytes versus the previous tasks AVIFs at 33,206–33,651 bytes.
- The browser loads the 126 kB AVIF hero eagerly; the lower stills remain lazy and add about 64 kB of AVIF only when reached.
- The richer real-photo hero costs about 75–80 kB more than one previous active-theme map AVIF. This is the deliberate visual-evidence tradeoff; the delivered hero remains 96% smaller than its source PNG.
- The social card is 80,313 bytes, up from 45,728 bytes, and remains a compact progressive JPEG at the required 1200×630 size.
- Historical media remains in the repository for evidence continuity but is no longer referenced by the refreshed homepage or Flagstone route.

## What's left

- Human review and merge only. No production action was taken.
- If Sky wants true OS-level reduced-motion visual evidence, repeat the direct-entry pass with macOS **Reduce motion** enabled; the source and automated contract already pass.

## Process self-check

- **Efficiency:** Reused the existing encode, showcase-wiring, schema-validation, product-reveal, and OG-generation paths. No parallel media system or new UI component was introduced.
- **Overlap:** No concurrent writer was touched. The primary checkout remained untouched, and the branch started from the verified current `origin/main` SHA.
- **Simplification:** Directly replacing JSON paths would have been shorter, but would have made the next wiring run revert the refresh. Extending the established validated pipeline keeps the result reproducible.

## How to review

```bash
git -C /Users/skypie/Portfolio-codex/flagstone-first-impression-20260901 diff origin/main...codex/flagstone-first-impression-20260901
```

```bash
npm -C /Users/skypie/Portfolio-codex/flagstone-first-impression-20260901 run test:static
```

## Next recommended action

Review the before/after evidence and candidate diff, then merge through Sky's normal protected process if the refreshed recruiter impression matches the intended story.
