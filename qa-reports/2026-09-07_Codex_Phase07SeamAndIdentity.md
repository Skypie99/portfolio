# Phase 07 — Safari seam repair and owner-requested identity update

## Outcome and authority

`INTRO_HANDOFF_GATE: HOLD`. This is a local repair candidate, not final physical-device or visual acceptance. No push, merge, deployment, production/configuration change, external send, integration, or Phase 08 work occurred.

The owner reported that the beige strip persisted after the second repair and asked to raise the portrait arrival further. The owner separately authorized the primary name **Skyler Halisky**, removal of the redundant Sky/Skyler explanation and agency wording, a one-person studio credit, and quieter casing on desktop as well as mobile.

## Branch and provenance

- Worktree: `/Users/skypie/Portfolio-codex/portfolio-3.0-phase07-20260905`.
- Branch: `codex/portfolio-3.0-phase07-20260905`.
- Intake was clean at `e76f701f4591836a965d22eaaa3f913af3d96f34`, following source repair `0679c4f79c52cd49b50ac85f4b93d6f136c63c0c`.
- New source commit: `d6e378a4f5b76682a3a9b821e7d90c12e255be76` — `fix(intro): close Safari seam and simplify identity`.
- Source tree: `52c276e537fdd06603c5e91dbea48c4b4fef66c2`.
- Primary checkout and unrelated worktrees were not modified. Local `main...origin/main` currently reports `0 3`; old narrative statements about local main being ahead were not treated as current git truth. No fetch or reconciliation was performed.
- Built artifact: worktree `out/`, rebuilt by `npm run test:static` after the production-source changes. Later changes before the source commit were test teardown and a restored historical comment only; exported implementation bytes were unchanged.
- [Artifact manifest](phase-07-repair3/artifact.json) records the source tree, 49 HTML/CSS/JS/share-card hashes, verified LAN URL, and served HTML equality. Served HTML SHA-256: `cd5995bb292327521bf3656a0e67f196e65119846e426c2eee67a83737910ece`.
- Temporary Node static server: `http://10.0.0.22:3028/?phase07=d6e378a`, bound to `0.0.0.0:3028`, `Cache-Control: no-store`. It serves only the built export. No hot development renderer is used. Server remains running for the owner retest; address/process availability is temporary.

## Owner-supplied physical evidence

The original screenshots remain in the owner's Downloads folder; they were inspected, not edited or copied into this public-facing repository.

| File | Owner observation | SHA-256 |
| --- | --- | --- |
| `IMG_8188.PNG` | Beige strip persists under the released film. | `a262c9d2f29e3adaa96329ff6596225591a0d89829ad5e6cdb22c1e2012cb886` |
| `IMG_8189.PNG` | Identity is visible and somewhat higher, but should move up further. | `50c3c862a81f108ebb486511327490204b4fbd7f13e5db6924cc295fce44ebf2` |

Earlier owner-supplied `IMG_8185.PNG` and accompanying text accepted the short-landscape landing as “perfect.” These reports establish real-device defects/preferences. The screenshots show a collapsed bare-IP address, so exact served bytes cannot be retroactively established from the images alone. The new URL has an explicit port and candidate identifier for the next run. No result from the new candidate is attributed to the physical iPhone yet.

## What changed and why

### Reproduced seam, not another image-format guess

The existing `.cdesert-pin` is `100svh`. The installed ScrollTrigger implementation measures its viewport with a `100vh` probe; its old `end: 'bottom bottom'` therefore can release a small-viewport-height pin before the stage's bottom meets the hero. The leftover stage exposes the brighter world backdrop, while the hero below carries the dark world surface.

On the intake static artifact, the diagnostic harness injected a **40px difference** between the pin height and large viewport height before ScrollTrigger initialized. The measured gap was **39.999px**, visually reproducing the reported strip. An 80px difference produced a 79.999px gap; no difference produced effectively no gap. `elementsFromPoint` in the strip identified `.cdesert-stage`, not a beige element or an image-alpha seam. [Baseline capture](phase-07-repair3/seam-baseline-dark-40.png).

This proves the mechanism in controlled local Chromium, not that physical Safari is now fixed. Reference mechanics: [GSAP ScrollTrigger start/end documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) and [Apple's viewport-unit explanation](https://developer.apple.com/videos/play/wwdc2022/10048/?time=1394).

- `components/cinematic/CinematicDesert.tsx`: only the narrow-phone endpoint now uses the actual pin height (`bottom top+=${pin.offsetHeight}`). A live captured media-query object handles the breakpoint; wider layouts retain `bottom bottom`. The timeline choreography, art, layers, and native intro navigation remain unchanged.
- `app/globals.css`: removes the ineffective earlier `100dvh` override, which was superseded by the later `100svh` base rule. Portrait fragment offset moves from `-300px` to `-360px`, including the safe-area adjustment. Landscape stays `-310px`; fine-pointer desktop stays `0px`.
- `Layer.tsx`, `StaticDesertFrame.tsx`, `plates.ts`: removes the unsuccessful forced phone-WebP workaround and restores the pre-second-repair responsive AVIF/WebP paths. No image asset bytes changed. This also avoids the unnecessary quality reduction of selecting small plates on a high-DPR phone.
- `IntroHandoff.test.ts` now checks the new portrait offset. The superseded dvh and forced-WebP contract tests were removed, not presented as proof of the fix. The actual gap is exercised by the browser regression helper.

### Owner copy and casing

- `content/profile.json`, homepage, intro/subpage identity defaults, navigation fallback identity, About, bylines, page metadata, feeds, JSON-LD primary name, OG rendering/alt text, and static fallback identity now use **Skyler Halisky**.
- Hero credit is exactly **SkyPi Studio is one person.** The Sky/Skyler explanation and agency phrase are gone. The existing support-first role sentence is byte-identical.
- `components/Hero.tsx` uses normal-case sans text for the short credit and stops forcing uppercase on the role eyebrow. Intro identity badge rules in `app/globals.css` stop uppercase and reduce letter spacing. Other navigation typography is not redesigned.
- Public Flagstone pages, including privacy/terms pages, have only the portfolio `og:site_name` string updated. No policy, authentication, private-artwork, location, disability-data, backend, or security behavior changed. `/archive` changes only that same public site-name metadata string.
- Name expectations in affected tests were updated. The earlier Phase 03 short-name/long-imprint copy contract is explicitly superseded by the owner's request, not silently waived.
- React best-practices review found no need for additional refactoring: no new client boundary, effect-driven copy, imperative focus handling, or dependencies were added.

## Gates and actual results

| Command | Result |
| --- | --- |
| `npm run lint` | PASS — `No ESLint warnings or errors`. Existing Next lint deprecation and static-export header notices remain. |
| `npm run typecheck` | PASS — `tsc --noEmit`. |
| `npm test -- --silent --reporter=dot` | Final run PASS — 96 files; 870 tests passed, 2 skipped; no unhandled errors; exit 0. |
| `npm run test:static` | PASS — rebuilt static export; 2 files, 54 passed, 1 skipped; exit 0. |
| `git diff --check` | PASS. |
| `node .../work/phase07-repair3-verify.mjs` | PASS — final post-commit static-browser matrix: 23 cells, zero failures, exit 0; full results in [metrics](phase-07-repair3/metrics.json), reproducible helper in [verify.mjs](phase-07-repair3/verify.mjs). |
| `node qa-reports/phase-07-repair3/verify-artifact.mjs` | PASS — implementation equals committed source; expected name/credit/CSS/release endpoint found in export; LAN HTTP 200; response HTML hash equals local artifact; no-store. |
| Official `npm run check:overflow` wrapper | Not rerun: its previously recorded missing static fixture helper is still absent. Current browser `scrollWidth` assertions are supplemental, not a claim that this wrapper passed. |

Intermediate failures are retained here rather than hidden: the initial full run had two stale Sidebar expectations for the old name plus an asynchronous media-query/mock-teardown error. Those expectations were updated and the endpoint now closes over its live MediaQueryList. A subsequent full run had all 870 assertions passing but exited 1 because ScrollTrigger's global timer fired after jsdom removed `requestAnimationFrame`. Two cinematic-mounting test files now call `ScrollTrigger.disable()` at suite teardown. The final complete run exited 0. Production code was not changed to accommodate that test-environment timer.

## Browser evidence and visual review

The matrix uses installed desktop Chrome, local static output, both themes, touch/DPR3 portrait at 320/375/393/430/440px, touch landscape 956×440, fine-pointer desktop 1440×900, reduced motion, keyboard activation, and no JavaScript. Controlled viewport-deficit cells use 0/40/80px in each theme and are explicitly marked simulations in metrics. One portrait journey checks Back, Forward, reload, and landscape rotation/re-entry.

Final source-attributed results: **23 cells passed, zero failures**. All six simulated seam cases measured `-0.0009765625px` (effectively zero). At portrait 440×844, identity top is `121.80px` and role top `155.80px`; at landscape 956×440, identity top is `27.31px`; at desktop 1440×900 it is `201.80px`. Light and dark geometry matches. No page errors or document horizontal overflow were recorded in the arrival cells. The portrait history/reload/rotation journey passed; keyboard focus and focus-visible assertions passed.

The helper asserts zero document horizontal overflow, the requested identity/credit, normal credit casing, a visible identity, the role in the upper half on portrait, unchanged desktop/landscape margins, and keyboard focus visibility. It does not emulate Safari browser chrome, Dynamic Island, VoiceOver, or physical safe-area behavior.

The first post-commit browser attempt passed 18 cells but timed out in five while waiting for `networkidle`; [that failed attempt is retained](phase-07-repair3/metrics-networkidle-attempt.json). A focused diagnostic found the document complete, fonts loaded, and pin initialized while background Next route-prefetch requests for `/work/flagstone/index.txt` and `/blog/index.txt` remained pending. The harness now waits for page load and explicitly asserts font readiness, loaded cinematic plates, and the pin where animation applies. It does not disable prefetch or mutate the production application to obtain a green run.

Visual review covered the reproduced baseline and repaired seam, dark portrait at 440px, narrow light portrait at 320px, narrow first frame, desktop, landscape, and the generated OG card. The longer name fits the share card and narrow identity; no unrequested desktop layout redesign was made.

## What's left

- Real iPhone Safari confirmation of the repaired seam in both themes, the higher portrait arrival, safe-area/chrome clearance, landscape preservation, and Back/Forward/reload.
- Final owner visual acceptance of the updated name/credit/casing.
- The pre-existing official overflow-wrapper disposition remains documented in the gate receipt.

For a rollback, review a new local revert of `d6e378a`; do not reset or rewrite history. This would also remove the requested identity revision, so selective rollback should be an explicit owner decision. No rollback was executed.

## DECISIONS FOR SKY

**Decision:** accept or reject the revised physical-iPhone Safari presentation. **Recommendation:** use the exact numbered-port URL above, scroll through the old strip location, then reload and activate Skip Intro. Check portrait, landscape and back, Back/Forward, then reload and repeat. Capture only (1) the former strip location and (2) the immediate portrait landing, both with Safari chrome visible. Note light/dark results; capture any defect in the other state. **Why:** simulated viewport geometry cannot establish the physical browser result. **Alternative:** keep the candidate on HOLD without retesting. **Impact:** no PASS, integration, or Phase 08 until real observations genuinely support acceptance; a new defect requires a bounded proposal and owner repair authorization.
