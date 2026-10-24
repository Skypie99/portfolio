# Astra Ultra 01: owner-approved polish integration, 2026-10-24

**Verdict: INTEGRATED, READY FOR OWNER PREVIEW.** Local candidate only: not pushed, no PR, not merged, not deployed.

| | |
|---|---|
| Baseline | `main` @ `601a402ffdb29e1dacd47eddc4b01913e353d808` (PR #42), reverified with `git ls-remote` before starting |
| Candidate branch | `integrate/astra-ultra-01-polish` |
| Code commit | `a195a80bbc9bf29b2162ee8dda48e07df4fd99b8` (this receipt is the commit after it) |
| Astra source | `SkyPi-Astra-Ultra01-20261023.zip`, SHA-256 `dcbf1fe9…f5955c384`, 735/735 payload checksums re-verified; prepared on `2fb857b` |
| Method | Each approved change re-made by hand against current `main`; the Astra patch was not applied. Since `2fb857b`, only `app/page.tsx` and `app/globals.css` had moved among Astra's files; in both, only the lines listed below changed |

## What changed

| Ref | Change | Where |
|---|---|---|
| A | Certificate grid floor `max(11.5rem, …)` → `min(100%, max(16rem, …))`: two columns at 1024–1180, three from 1280 | `app/globals.css` |
| B | Demo labels: Open web app · Read system overview · Try synthetic demo · Open Prompt Library · Play Ghost Code. Cards render the full label (was the first word, "Live"); accessible name `<label> for <title> (opens in new tab)` | `content/deliverables.json`, `components/CaseStudyCard.tsx`, `components/ProjectCard.tsx` |
| B (layout) | Card external group wraps whole, right-aligned, `gap-y-8` stacked pitch; `overflow-wrap:anywhere` inherited from the group (large text only). Case-study demo pill: `[&>.rounded-full]:shrink-0` at the call site | same + `app/work/[slug]/page.tsx` |
| C | "View LinkedIn profile" (Contact, and the Footer pointer documented to move with it) | `app/contact/page.tsx`, `components/Footer.tsx` |
| D | Record figure "A documented defect" | `app/page.tsx` |
| E | "I set the direction, make the decisions, and guide AI-assisted implementation." | `app/page.tsx` |
| F | Back to home focus parity on Work, Certificates, About, Blog, Accessibility (Contact and Colophon already had it) | five `page.tsx` files |
| G | CountUpStat settles to its final value when reduced motion turns on mid-count | `components/CountUpStat.tsx` |
| H | Sitemap: build-time `lastModified` removed from all 14 dated URLs; none fabricated | `app/sitemap.ts` |
| GC | `#work ol > li` active-row rule: four `border-color` → `border-top-color` | `app/globals.css` |

**Rejected, verified absent:** the Contact reorder ("Open to senior support roles…" first). Rendered order on the candidate is unchanged: opening paragraph, roles sentence, socials line. `app/__tests__/astra-ultra-integration.test.ts` pins it; Astra's contract test, which demanded the reorder, was not imported.

**Untouched (byte-identical to `main`):** `Button.tsx`, `ProjectDoorwayButton.tsx`, `Exhibit.tsx`, `ExhibitDetail.tsx`, `exhibitDetail.module.css`, `ProductReveal.tsx`, `HamburgerNav.tsx`, `lib/motion.ts`, `tailwind.config.ts`, `tokens-phase2.css`, `public/` ([data/protected-files.txt](astra-ultra-01-integration-20261024/data/protected-files.txt)).

## Validation

| Check | Result |
|---|---|
| Typecheck | pass |
| Lint | pass, no warnings |
| Full suite (after build) | 130 files, 1212 passed, 2 skipped (baseline `main`: 127 / 1177 / 2) |
| Focused (12 files) | 112 passed, 1 skipped |
| Negative controls | 14/14 reintroduced defects caught, including the rejected reorder and Astra's heading ([data/negative-controls.json](astra-ultra-01-integration-20261024/data/negative-controls.json)) |
| Production build | `next build` + postbuild, exit 0; `sitemap.xml` 0 `<lastmod>` (main: 14) |

### Interaction regression gate (Chromium, baseline vs candidate builds)

20 targets × light, dark, reduced-light, reduced-dark, touch; computed colour, background, all four border colours, shadow, transform, outline, transition property/duration/easing, the doorway dot (size, fill, transition) and the arrow, in rest, hover, pointer press, release and keyboard focus (`:focus-visible` verified reached). [Analysis](astra-ultra-01-integration-20261024/data/interaction-gate-analysis.txt), [raw](astra-ultra-01-integration-20261024/data/interaction-gate.json.gz).

- **All 13 external-link / pill targets: 0 interaction-property differences** (5 demo pills incl. two-line labels at 320 and 1024, App Store pill ×2, card demo links at 1440 and 768, card GitHub, card View project). Only the label text and the link's own width differ.
- The first gate run caught a real regression: at 1024, "Read system overview" wrapped and flex squeezed the pill's dot (rest 8 → 6.98px, hover 10 → 8.64, press 6 → 5.30). Fixed at the call site; the final run shows 0 differences.
- Expected differences only: the Ghost Code row's bottom border colour (now neutral in every state; rows 1–4 have a 0px bottom border, so the change is invisible there; transition `border-color 0.18s` unchanged), and Back to home focus, which now equals its own hover (colour and −4px arrow glide) in both themes.
- Touch context: `(hover: hover)` false. After a tap, every pill, card link, work-index row and Back to home link returns to rest (no sticky hover), identical to main. The Contact LinkedIn link keeps its hover colour after a tap on **both** builds: its `hover:` utility predates the Release 4 hover gate. Only its words changed here; it is listed under remaining limitations.

### Feature probes ([summary](astra-ultra-01-integration-20261024/data/feature-summary.txt))

- **Counter:** main freezes mid-count when reduced motion turns on (`193 / 25` at +120ms and still at +1.6s); the candidate shows `763 / 100%` at +120ms. Without a preference change both count up normally.
- **Ghost Code divider:** row 5's 1px closing rule is lit on hover/press/focus on main, neutral on the candidate, light and dark at 1440/768/390; every row's top highlight still answers.
- **Certificates:** columns at 100% text: 1024–1180 → 2 (main 3, with clipped titles at 1024), 1280+ → 3. 0 clipped descendants at any size tested (main: 4 cases). Under text zoom the rem floor reflows earlier (e.g. 1024 @125% → 1 column).
- **Heading:** 2 lines at 1024+, 4 at 768, 5 at 390, 6 at 320 (one more than the old heading on phones); `text-balance`, no orphan.
- **Labels at 100% text** (8 widths × 6 routes × 2 themes): 0 overflow, 0 touch-target collisions. The only new wraps: the case-study pill for "Read system overview" and "Open Prompt Library" at 320 and 1024 (two centred lines inside the 56px pill, dot at full size).

### Visual previews

Before/after boards for every surface at 390/768/1024/1440 in light and dark: 66 boards in the Lexar package; 18 representative ones in [boards/](astra-ultra-01-integration-20261024/boards/). **Creative Release 7 flagship: pixel-identical** to `main` at 390, 768 and 1440 in both themes ([pixel-compare](astra-ultra-01-integration-20261024/data/pixel-compare.txt)).

## Remaining limitations (not resolved here)

1. **Extreme text sizes.** Certificate cards at very large text, and card action rows under a synthetic 200% root size: phone overflow improved (row overflow cases 50 → 20), but the narrow "other work" cards at 1024 still wrap letter by letter, as on `main`, and touch-target collisions count 8 → 9 (dark-only in both builds, so partly settle-time noise). [z200-collisions](astra-ultra-01-integration-20261024/data/z200-collisions.txt).
2. **Contact without JavaScript** (self-link behaviour), unchanged.
3. **Astra 06 evidence bundle** remains unavailable as bytes.
4. **Physical Safari / VoiceOver** testing remains owner-deferred; this run is Chromium (headless) only.
5. **Found, pre-existing, out of scope:** with reduced motion, floating `.ts-float` showcase layers stay visible on four case pages; on Dashboard and Ghost Code at 1024 and 1440 they cover the demo pill, so a pointer cannot reach it (keyboard still can). Identical on `main` ([census](astra-ultra-01-integration-20261024/data/ts-float-reduced-motion-census.txt), [screenshot](astra-ultra-01-integration-20261024/boards/preexisting-dashboard-1280-reduced-motion-main.png)).
6. **Found, pre-existing:** the Contact (and Footer) LinkedIn pointer uses an ungated `hover:text-accent-text`, so on touch devices it keeps the accent colour after a tap. Identical on `main`; not changed because the approved change to that link is text only.
7. The stacked card links at 768 sit 32px apart (the minimum that keeps the 21px touch extensions separate); a visual call for the owner's preview.

Tools: [tools/](astra-ultra-01-integration-20261024/tools/) (Playwright-core against two static exports served side by side).
