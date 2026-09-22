# Portfolio 4.0 P2 closure — owner-approved evidence doctrine

**P2_STATUS: PASS**
**P2_REGRESSION_GATE: PASS_WITH_INHERITED_LIMITS**
**P1_CORE_REGRESSION: PASS**
**Branch:** `media/p2-evidence-doctrine`
**Base:** `b31e742719ba89fd9348072e9711d5a517eee4cd`
**P2 source commit:** `709f674ca0f72a6594258e8af1f4f953c8167405`
**Owner selections:** Claude Corp **03 Branch atlas**; Prompt Library **UI/UX Refinement Pass with #App**.
**Push / merge / deploy:** NO / NO / NO. P3 was not started.

This final receipt supersedes the **PARTIAL** disposition in the earlier local P2 investigation reports. Those reports and their comparison assets remain historical local evidence; they were not included in the P2 source commit. The accepted P1 cinematic finding remains **DEFERRED_TO_CONTROLLED_EXPERIMENT**. Its target and source were not changed.

## Source commit and media inventory

The single P2 source commit contains exactly **38 files**: ten code/content files, eight approved hero artwork files, and 20 factory-generated candidate files required by the generated manifest. Its exact code/content files are:

| File | P2 purpose |
| --- | --- |
| `app/work/[slug]/page.tsx` | Label selected artwork, use a media-aware gallery heading, and reserve Ghost Code's portrait clip well. |
| `components/ProductReveal.tsx` | Forward Ghost Code's optional still-first clip setting. |
| `components/ThemedMotion.tsx` | Respect that setting while preserving deliberate Play and the existing autoplay default for other clips. |
| `content/deliverables.json` | Select the two approved hero illustrations and set Ghost Code's clip to still-first. Dashboard's record is byte-identical to base. |
| `lib/__tests__/media.showcase.test.ts` | Assert artwork leads only the case-study hero while work cards retain captured evidence. |
| `lib/media.ts` | Select labelled hero artwork without replacing card/gallery capture sources. |
| `lib/schema.ts` | Validate artwork separately from authentic `heroShot` and validate the optional clip setting. |
| `scripts/capture-showcase.mjs` | Add optional selector or hash-verified bounded master-region capture. Old scenes without region metadata retain the existing `shoot()` path. |
| `scripts/showcase/registry.mjs` | Add five P2 candidate scenes and pin Prompt Library capture to its isolated committed source. Existing scene definitions, routes, nav steps, and viewport lists were not edited. |
| `content/showcase.manifest.json` | Factory-produced ten new capture rows; no hand edit. |

The eight selected optimized files are `public/images/deliverables/claude-corp/branch-atlas.{light,dark}.{avif,webp}` and `public/images/deliverables/prompt-library/ui-ux-refinement.{light,dark}.{avif,webp}`. The 20 factory files are AVIF/WebP siblings for five scenes in both themes: `claude-corp/p2-morgan-to-roles`, `claude-corp/p2-roles-to-safety`, `dashboard/p2-command-disclosed`, `prompt-library/p2-featured-card`, and `prompt-library/p2-variable-panel`, all under `public/showcase/`. They remain **inactive candidates**, including the technically rejected Dashboard and variable-panel views. They are included because the factory-generated manifest references them, not because owner approval activated them. No comparison sheet, rejected restyle concept, temporary script, or `work/` file entered the source commit.

The selected illustrations are visibly labelled **Concept diagram** and **Card illustration**, with separate artwork alt text. Real screenshots remain in both projects' case-study galleries and their work-card media selection. Prompt Library's actual stored/source entry was not edited to change `#app`; `#App` belongs only to the approved portfolio artwork. Its primary repository remains at committed HEAD `32fcf8d189926fe8e39005f1b5440967059bdfd8` with the same previously recorded dirty-status entries. No source project checkout was reset, cleaned, stashed, or modified for this closure.

## Factory and protected-surface verification

The base manifest's **76/76** capture rows compare exactly with the generated manifest; ten new rows were added. The **156/156** pre-existing `public/showcase/` assets match their previously banked SHA-256 values. All ten added master PNGs match their recorded hashes and byte counts. All 20 new shipped files exist with the manifest's exact byte counts, and each external approved source master still matches the recorded SHA-256. This is a read-only audit of the outputs from the five already completed scoped normal factory runs; the factory was not rerun for closure and no new variant was generated. Existing non-cropped scenes still use the original whole-viewport capture path. Prompt Library's deliberate isolated committed-source pin implements the owner's source-safety instruction.

Dashboard's active `content/deliverables.json` record is exactly the base record, and its previously accepted showcase assets are hash-identical. The new Dashboard candidate is inactive. The seven P1 core source files, `components/cinematic/**`, `app/runway/**`, and `public/runway/**` have no diff from base. A fresh built `/runway/` returned HTTP 200, one `Hi, Runway.` h1, and no page or console errors.

## Final media and image-weight results

The built case studies were checked in Chromium at **1440 and 393 px**, light and dark: **20/20** project/width/theme cases passed across Claude Corp, Prompt Library, Dashboard, Ghost Code, and Flagstone. Both approved illustrations had rendered-width/natural-width ratios **0.652 desktop** and **0.477 mobile**, above the P2 directional 0.60/0.45 targets. All eight illustration cases also loaded an authentic `/showcase/<project>/` gallery capture in the same case study. Their hero and gallery claims remain distinct.

The gallery heading is **See it in motion.** only for Flagstone and Ghost Code, which have video; Claude Corp, Prompt Library, and Dashboard say **A closer look.** Ghost Code's clip remains still-first, with an accessible Play control and the full 390:844 composition: approximately **388×842** at 1440 and **327×710** at 393 in both themes. Its prompt and four tokens remain visible. Dashboard still loads its existing `command-center` hero and has no illustration label.

Selected AVIF hero bytes are lighter than the previous active hero AVIFs: Claude Corp light **23,330 → 16,687 B** (−6,643), dark **24,454 → 15,310 B** (−9,144); Prompt Library light **24,303 → 8,038 B** (−16,265), dark **25,955 → 7,452 B** (−18,503). The total `public/showcase/` tree is **8,656,372 B / 8.26 MiB**, above its 8 MiB target but below the 10 MiB hard cap. This known increase consists of inactive factory candidate outputs already reported before final art selection; it is not a heavier active hero request. No unexpected active image-weight regression was found.

## Final QA gates

All results below are from the final P2 source bytes before the source commit. Generated output and traces remain local under `qa-reports/P2-EvidenceDoctrine-evidence/` and `qa-reports/P2-Final-evidence/`; they are not part of the source commit.

| Command / gate | Actual result |
| --- | --- |
| `npm test` | Exit 0; **101 files passed, 904 tests passed, 2 skipped**. |
| `npm run lint` | Exit 0; **no ESLint warnings or errors**. Next printed its existing deprecation/export notices. |
| `npm run typecheck` | Exit 0; `tsc --noEmit`. |
| `npm run build` | Exit 0; static export and postbuild completed. |
| `npm run test:static` | Exit 0; its rebuild completed, then **2 files passed, 55 tests passed, 1 skipped**. |
| `node --check scripts/capture-showcase.mjs` and `node --check scripts/showcase/registry.mjs` | Exit 0 each. |
| `node work/closure-sweep.mjs` | Exit 0; **48** route/theme/motion cases. **32/32 axe runs had zero violations**; one h1 in every case; max CLS **0.001300**; all reduced-motion animation counts zero. Changed routes had zero console errors. |
| `node work/closure-focus.mjs` | Exit 0; **6/6** Chromium/WebKit footer, rail, and content navigation journeys focused main, announced the new page, and kept the next tab in main. |
| `node work/closure-skip.mjs` | Exit 0; **8/8** Chromium/WebKit × mobile/desktop × standard/reduced Skip Intro journeys. `node work/p2-changed-check.mjs` also found Skip Intro within the first three visible tab stops at 320/393/768/1440. |
| `node work/closure-overflow.mjs` | Exit 0; **160/160** Chromium/WebKit route/width cases had no actual horizontal scroll or off-viewport interactive control. |
| `node work/p2-final-overflow-census.mjs --widths 320,393,1440` | Exit 0; **150** exported-route/theme/width frames, zero visible overhangs. The instrument's planted overhang was detected **150/150** times. This temporary copy used the existing Node static server path available in the primary checkout; no product source was changed. |
| `node work/p2-changed-check.mjs` and `node work/p2-focus-ring.mjs` | Exit 0; Ghost Code changed-area max CLS **0.000010**; four standard/reduced text, link, and heading pairs matched; focus ring visible in all four cases with minimum measured contrast **4.05:1**. |
| `node work/p2-final-media.mjs` | Exit 0; **20/20** media cases, including artwork scale, exact selected source, gallery heading, Dashboard preservation, and Ghost Code crop. Eight art cases also verified loaded authentic gallery capture. |
| `git diff --cached --check` before source commit | Exit 0; no whitespace errors. |
| Read-only manifest/asset audit and protected-path diff | **76/76** old rows exact, **156/156** old assets hash-identical, **10/10** new masters and **20/20** shipped files verified; protected source diff empty. |

The sweep recorded one `/archive/` console error in each of its three measured states, matching the inherited P1 limitation. `/accessibility/` retained its prior reduced-motion-only text line, so its literal text hashes differ while its links and headings match. These remain **INHERITED_UNASSESSED_LIMITS**, neither new P2 failures nor new passes. Headless browser results are not native Safari, VoiceOver, or physical-device acceptance.

**P1_CORE_REGRESSION: PASS.** The P1 source files are byte-identical to base, the test/static counts, route focus, Skip Intro, and protected `/runway/` checks pass. The separate cinematic performance target remains open as **DEFERRED_TO_CONTROLLED_EXPERIMENT**; P2 makes no claim that target was met.

## What's left

No P2 source, visual direction, crop selection, factory run, or owner review remains open. The generated inactive candidates and the known 8 MiB target variance are recorded above; the 10 MiB hard cap passes. No production or owner integration action was taken. P3 should begin only from the final local P2 receipt commit once that commit exists.

## DECISIONS FOR SKY

**Decision:** Whether and when to merge, push, or deploy these local P2 commits. **Recommendation:** keep those actions owner-controlled and use the receipt commit as the P3 baseline. **Why:** the approved P2 source and scoped regression gate passed, while the inherited limits and deferred cinematic finding retain their existing classifications. **Alternative:** defer integration and retain the local branch for review. **Impact:** these commits alone do not publish or deploy the portfolio.
