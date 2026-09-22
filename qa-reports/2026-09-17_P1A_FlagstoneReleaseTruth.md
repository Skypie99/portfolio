# P1.A — Flagstone Release-Truth Repair

**Date:** 2026-09-17
**Branch:** `truth/flagstone-app-store-live`
**Worktree:** `~/Portfolio-p4/flagstone-truth`
**Baseline:** `origin/main` @ `29c2bc09c5df003b2182dfc612ac3d79df304707` (confirmed; `~/Portfolio` local main is 63 behind and was not touched)
**Captures:** `~/career-arsenal/portfolio-4.0-implementation/2026-09-17/P1A/` (48 frames)
**Authorisation:** local implementation + verification only. Nothing committed, pushed, merged or deployed. No dependency installs beyond the worktree's own `npm ci`.
**Status:** CLOSED for owner commit authorisation — owner decisions applied and WebKit pass completed 2026-09-17. See **§10**.

---

## 0. Two things Sky should read first

**1. Model.** The prompt specifies Sonnet. This ran on **Opus 5**, because Sky started the session directly (the explicit carve-out in the global Opus rule). Flagging it rather than letting it pass silently.

**2. The prompt's stale-surface list was incomplete — by two files.** It named one guard (`app/__tests__/flagstone-release-status.test.ts`). The global sweep found **three** test files pinning the now-false claims. All three had to be inverted or the suite could not pass:

| Guard | What it pinned | Status |
|---|---|---|
| `app/__tests__/flagstone-release-status.test.ts` | every stale string | named in the prompt · inverted |
| `lib/__tests__/recruiter-copy-truth.test.ts` | `/available on the App Store/` banned site-wide **including in built HTML**; `status` had to match `/submitted/i` | **NOT in the prompt** · inverted |
| `lib/__tests__/flagstone-professional-bridge.test.ts` | body must contain `'there is no adoption to report'` | **NOT in the prompt** · phrase swapped |

This is the finding worth keeping: the site had **three independent mechanisms** enforcing the untruth, and a repair that fixed only the copy plus the one named guard would have failed CI and looked like a broken change rather than an incomplete sweep.

---

## 1. Primary source — what the App Store actually says

Checked directly on 2026-09-17, not read from a repo file:

```
itunes.apple.com/lookup?bundleId=com.accessmap.app
  trackName                  Flagstone Accessibility Map
  trackId                    6774709116
  version                    4.1.1
  formattedPrice             Free
  releaseDate                2026-09-15T21:21:25Z
  sellerName                 Skyler Halisky
  primaryGenreName           Navigation
  minimumOsVersion           15.1
  userRatingCount            0
  averageUserRating          0
```

**Storefront scope, 12 storefronts checked:** `us` → 1 result, `ca` → 1 result. `gb au de fr jp mx nz ie in br` → 0 results. The app is **not worldwide**, and the copy says so.

**`userRatingCount: 0` is the evidence for the second half of the repair.** There is no adoption to report. Saying that plainly is the point, and it is now guarded.

**Link chosen:** `https://apps.apple.com/app/flagstone-accessibility-map/id6774709116` — country-neutral, so a US and a Canadian visitor each land on their own storefront rather than one being sent to the other's. Verified **HTTP 200** (1 redirect to the visitor's storefront); page `<title>` reads "Flagstone Accessibility Map App - App Store".

⚠ **AccessMap's own `release/current.json` is now the stale source.** It still reads `"appStore": { "status": "submitted_for_review" }`, last verified 2026-09-02. Portfolio no longer derives from it; `docs/PORTFOLIO_TRUTH_MANIFEST.md` now says so explicitly. **Not fixed here** — out of scope (no AccessMap source touched).

---

## 2. Every string changed

### `content/deliverables.json`

**`status`** (40 → 44 chars, both inside `z.string().min(4).max(48)`; 44 matches the longest existing status, `dashboard`, so the card's inscription line is at a proven-safe length)

- **Before:** `App Store review submitted · August 2026`
- **After:** `On the App Store · US and Canada · Sept 2026`

**`verifiedDate`**

- **Before:** `2026-08-31`
- **After:** `2026-09-17`

**`body` → "Where it stands" ¶1**

- **Before:** `The [web build](https://flagstone.skypistudio.com) is browsable today. The iOS app has not shipped. It was submitted to Apple for App Store review on August 31, 2026. Before submission, one early TestFlight build reached a single outside tester. Apple approval and public App Store availability have not been established.`
- **After:** `The [web build](https://flagstone.skypistudio.com) is browsable today. The iOS app is [available on the App Store](https://apps.apple.com/app/flagstone-accessibility-map/id6774709116) in the United States and Canada: version 4.1.1, free, released September 15, 2026. It was submitted for review on August 31, 2026, and before that one early TestFlight build reached a single outside tester.`

The TestFlight sentence and the submission date are **kept** — both are true dated history, and dropping them would have thinned the page's honesty rather than improved it.

**`body` → "Where it stands" ¶2**

- **Before:** `Until that review completes there is no adoption to report, and I would rather say so than imply otherwise. What exists is evidence:`
- **After:** `The launch is recent, so adoption and usage numbers are not yet meaningful, and I would rather say so than imply otherwise. They go here when there is real usage to report. What exists now is evidence:`

The clause `and I would rather say so than imply otherwise` is reused **verbatim** — the sentiment was already ratified copy; only its reason changed. The evidence paragraph after the colon (test suite, 48-finding simulator walk, privacy model) is **byte-identical**.

**`links`** — one entry added after `Live demo`:

```json
{ "label": "Get it on the App Store",
  "href":  "https://apps.apple.com/app/flagstone-accessibility-map/id6774709116",
  "type":  "appstore" }
```

3 links total (≤ 5 ✓). Exactly one `demo` link, so the `only one demo link` refine is untouched.

Diff is **8 insertions / 3 deletions** — no JSON re-serialisation churn.

### `app/page.tsx` (homepage subhead, 132 → 133 chars)

- **Before:** `Five projects built, all five on the open web. One submitted to Apple for App Store review. Accessibility first, built for everyone.`
- **After:** `Five projects built, all five on the open web. One is on the App Store in the US and Canada. Accessibility first, built for everyone.`

Storefront scope is carried here too: "on the App Store" alone would read as worldwide to a UK visitor who then cannot install it.

### `public/flagstone/index.html`

- **Before:** `Flagstone for iPhone: submitted to Apple for App Store review in August 2026. Made in Canada.`
- **After:** `Flagstone for iPhone: on the App Store in the United States and Canada since September 2026. Made in Canada.`

### `lib/schema.ts`

Two changes. The enum:

```diff
- type: z.enum(['github', 'demo', 'writeup', 'video', 'other']),
+ type: z.enum(['github', 'demo', 'writeup', 'video', 'other', 'appstore']),
```

with a comment recording why `appstore` is promoted rather than listed. And the stale line-163 comment:

- **Before:** `four of the five are demos or personal tools and one has not shipped, and nothing on the site used to correct that reading.`
- **After:** `four of the five are demos or personal tools, and nothing on the site used to correct that reading.`

### `app/work/[slug]/page.tsx`

`appStoreLink` is selected alongside `demoLink` and **excluded from `otherLinks`** (same reason `demo` is: a promoted link left in the list renders twice). Both pills render in one `flex flex-col md:flex-row md:flex-wrap gap-4` group, both `variant="primary"`.

### Docs

- `docs/IDENTITY_AND_CLAIM_CONTRACT.md` §19 (Submitted/Approved/Released rows), §20 (rewritten in full, with the primary-source record and the storefront evidence), §25 (adversarial row), §26 (PR-007 preserve row).
- `docs/PORTFOLIO_TRUTH_MANIFEST.md` §5 — status row replaced, plus a new row pinning the no-adoption claim to `userRatingCount 0`.

---

## 3. The guard inversion, and why it is shaped this way

The old guard's failure mode is the interesting part and is written into the file's header comment so it is not re-learned: **the copy was false for two days, and a test was actively holding it in place.** A pin on a time-bound fact has to be inverted in the same commit as the copy it guards, or the test becomes the reason the lie survives review.

So the new shape is deliberately **asymmetric**:

- **Availability language is now REQUIRED.** `status` must name the App Store; the body must contain `available on the App Store` *and* `United States and Canada`. Silence would be the new understatement.
- **Adoption language is PROHIBITED**, and that half is now the load-bearing one. Nine patterns covering downloads/installs, "thousands of users", MAU/DAU/WAU, star ratings, chart positions, rating and review counts, and marketing-voice traction claims. Applied to `status` + `summary` + `body`, and separately to the homepage and Flagstone landing page sources.
- **The retired understatements are banned** so they cannot drift back: `has not shipped`, `Apple approval … have not been established`, and present-tense review claims.
- **The body must keep saying `not yet meaningful`** — the page has to state the absence out loud, not merely avoid numbers.

**One regex I had to narrow, and why.** My first draft banned `/in review\b/`. It failed — against the page's own unrelated sentence *"drift shows up in review and a missed flag does not."* And `"submitted for review on August 31, 2026"` is true history the page should keep. The final pattern only catches `awaiting review` / `review is pending` / `currently in|under review` / `until that review completes`. The over-broad version is exactly the kind of guard that gets deleted in frustration six months later.

`lib/__tests__/recruiter-copy-truth.test.ts`: the three App Store bans (`released on the App Store`, `available on the App Store`, `approved by Apple`) were **removed** — all three became true on 2026-09-15, and a guard that bans a true statement enforces an understatement. Five adoption patterns replace them. That list is applied to **built HTML on every rendered route**, so this was load-bearing, not cosmetic. The `appstore` label is now pinned to `Get it on the App Store`, matching how `demo` and `github` labels are already pinned.

`lib/__tests__/flagstone-professional-bridge.test.ts`: this guard's intent is the **claim boundary** (the page never converts the project into traction), not the specific sentence. The boundary is unchanged; its reason is not. The pinned phrase moved from `there is no adoption to report` to `not yet meaningful`, with the reasoning written in place.

**Blog assertions: untouched.** `git diff origin/main -- app/__tests__/blog-dated-status.test.tsx` is empty, and the two `building-flagstone` assertions in the release-status guard (`'The v1 TestFlight build at the time'` present, `'currently in TestFlight'` absent) are carried over verbatim.

---

## 4. Global sweep — including the deliberate non-matches

Swept `*.ts *.tsx *.js *.jsx *.json *.md *.mdx *.html *.txt` for: `not shipped · not public · approval not established · awaiting review · in review · has not been established · submitted to Apple · App Store review · not yet shipped · pending review · under review · TestFlight`.

**Live surfaces after the repair: clean.** Every remaining hit under `app/ components/ lib/ content/ public/ docs/` is one of:

| Hit | Why it stays |
|---|---|
| `flagstone-release-status.test.ts:85,120` · `recruiter-copy-truth.test.ts:207` | These are the **inversion** — `not.toMatch(...)` assertions that *forbid* the stale phrases. The phrase appears because the guard bans it. |
| `public/images/cinematic/README.md:13` | The known false positive the prompt named. "The heavy source PNGs are **not shipped**" is about image assets. **Left alone.** |
| `docs/IDENTITY_AND_CLAIM_CONTRACT.md:150` | "not publicly reachable" — about the Studio Archive and the Dashboard operator app, not the iOS app. |
| `docs/IDENTITY_AND_CLAIM_CONTRACT.md:168` · `docs/PORTFOLIO_TRUTH_MANIFEST.md:73` | Docs **narrating this repair** and the two-day window, deliberately. |
| `docs/PORTFOLIO_TRUTH_MANIFEST.md:96` | The "nothing to breach" colophon item — unrelated open finding. |

**Not touched, by scope:** `qa-reports/**` and `design-reviews/**` carry the old language throughout. They are **dated historical records**, not rendered routes, and rewriting them would falsify the audit trail — the record that the claim was true when written is the thing that makes the archive worth having.

---

## 5. Acceptance

| Gate | Result |
|---|---|
| No stale release language outside the cinematic README | ✅ verified, table above |
| `status` + `verifiedDate` current and true | ✅ verified against the store record itself |
| Body states US/Canada availability + metrics not yet meaningful | ✅ verified in rendered HTML and on screen |
| "Get it on the App Store ↗" beside "Live demo ↗", 200, new tab, correct rel | ✅ **OWNER_ACCEPTED** — grouped with Live demo as a stacked pair (§6a); 200 in Chromium and WebKit; correct rel/target/aria |
| Schema accepts the new type · `npm run typecheck` | ✅ exit 0 |
| `flagstone-release-status.test.ts` inverted and passing · blog assertions untouched | ✅ 6/6 · diff empty |
| Exactly 6 homepage pills · both named guards pass **unmodified** | ✅ 6 in built HTML; `git diff origin/main` empty for both files |
| `npm test` | ✅ **903 passed**, 2 skipped, 101 files |
| `npm run lint` | ✅ "No ESLint warnings or errors" |
| `npm run build` | ✅ compiled successfully |
| axe-core 0 violations | ✅ **0 across 25 routes × 2 themes** (the floor asked for 16) |
| 0 console errors → owner rule: **zero NEW console-error identities** | ✅ **NONE new** — Chromium set and WebKit set each identical to `origin/main` (§6c, §10.3) |
| Exactly one `<h1>` per route | ✅ **25/25** |
| CLS ≤ 0.01 → owner rule: **no CLS regression on changed surfaces** | ✅ `/` 0 → 0; `/work/flagstone/` 0.0013/0.0012 → 0.0013/0.0012, 5× each, both builds (§6d) |
| WebKit / Safari pass (owed) | ✅ **PASS** — §10.2 |
| Reduced motion: text/link/heading deltas 0, `getAnimations()` empty | ✅ all deltas 0, 0 animations |
| Focus ring ≥ 3:1 (floor 3.09) | ✅ **4.02 light / 5.52 dark**, measured under real `Tab` focus with `:focus-visible` matching |
| Skip intro within first 3 tab stops, in-viewport 320–1440 | ✅ position **3** at 320/375/393, **2** at 768/1440; in-viewport at all five |
| Zero horizontal overflow 320→2560 | ✅ **0** at 320/375/393/768/1024/1440/1920/2560, element-rect census **and** real `scrollTo` probe |
| `/runway/` unchanged | ✅ `git diff origin/main -- app/runway` empty |
| `components/cinematic/**` unchanged | ✅ diff empty |
| Flagstone `featured: true`, first position | ✅ 1 featured total, index 0 |

**Files changed: 10.** Nothing outside the repair.

---

## 6. What did not pass cleanly — stated plainly

### 6a. The two CTAs stack; they do not share a row. This is a measurement, not an oversight.

The acceptance line says "renders **beside**". They do not sit side by side at **any** viewport, and the reason is the details column's own measure:

| Viewport | Details column | Pair needs |
|---|---|---|
| 768 | 424px | 475.9px |
| 1024 | 240px | 425.0px |
| 1280 | 368px | 475.9px |
| 1440 | 448px | 475.9px |
| 1920 | 460px | 475.9px |

The column is **never** wide enough. Getting one row would require shortening the label (now pinned by `recruiter-copy-truth.test.ts`, and the prompt fixed the wording), trimming `Button`'s padding (a redesign of every pill on the site to win one row here), or letting the pair overflow the column (a real overflow defect). **Per the stop rule, I did not trade a preserve for the gate.**

What ships instead: both pills in one CTA group, the App Store link a promoted **peer** of the demo pill rather than buried in the below-fold Links list — which is the substance of "beside". Below md both are full-width, equal and aligned; above md they are left-aligned at 169px and 290.8px. Measured across 320/375/393/768/1024/1440 × light/dark: **h=56px** (≥44 floor ✓), **never wraps**, **always within viewport**. The `md:flex-row md:flex-wrap` classes are kept deliberately and the measured numbers are written into the source comment, so nobody re-derives this.

✅ **OWNER DECISION 2026-09-17: ACCEPTED.** The stacked CTA group stands. The layout is **not** to be altered merely to force one horizontal row, because the details column cannot hold both actions side by side without breaking the spacing, label or overflow constraints; both actions stay grouped on the case study; no homepage CTA was added; CTA parity and the 6-doorway-pill contract hold.

### 6b. "Visible (opens in new tab) text" — I matched the existing pattern instead

The prompt asked for visible "(opens in new tab)" text **and** "match existing external-link semantics exactly". Those conflict: this site never renders that phrase visibly. It uses either an `sr-only` span (prose links) or an `aria-label` (pills). The demo pill uses `aria-label`, and an `aria-label` **overrides** inner content — an `sr-only` span inside it would be dead markup.

So the App Store pill carries `aria-label="Get it on the App Store for Flagstone (opens in new tab)"`, byte-parallel with the demo pill. Verified in built HTML — exactly 2 App Store anchors, both `target="_blank" rel="noopener noreferrer"`; the pill has the aria-label, the in-body prose link has `<span class="sr-only"> (opens in new tab)</span>`. Rendering the phrase visibly would have been a redesign of the pill.

### 6c. 3 console errors — pre-existing, and I proved it

**OWNER DISPOSITION:** `PRE_EXISTING_NON_REGRESSION_RESIDUAL` for P1.A only, on the grounds that identical errors reproduce on `origin/main`. P1.A's own bar is **zero new console-error identities**, which holds. Unrelated routes are **not** to be modified to push the global count to zero.

I built `origin/main` in a separate worktree and ran the **identical** harness. The error set is identical:

| Route | Error | Baseline | After |
|---|---|---|---|
| `/archive/` light | `Error: supabaseUrl is required.` | present | present |
| `/archive/` dark | `Error: supabaseUrl is required.` | present | present |
| `/blog/building-accessmap/` light | `Failed to load resource: 404` | present | present |

**New in after: none. Gone in after: none.**

- The `/archive/` errors are a **local-environment artifact**: this worktree has no `.env.local`, so `NEXT_PUBLIC_SUPABASE_URL` is absent. Production supplies it from repo Actions Variables. Not a site defect.
- The `/blog/building-accessmap/` 404 **I could not reproduce** on an isolated load of that route with network capture on (0 failed requests). It appears once per full-sweep run, identically on both builds. I am reporting it as observed and **unexplained**, not as resolved.

### 6d. CLS — one pre-existing route above the floor

**OWNER DISPOSITION:** `/flagstone/privacy/` ≈0.0306 is a `PRE_EXISTING_NON_REGRESSION_RESIDUAL` for P1.A only — same value on `origin/main`, route untouched. **Not to be repaired inside P1.A.** P1.A's own bar is no CLS regression on any changed surface, and the case-study route keeps its measured baseline.

The single-shot sweep gave unstable readings, so I measured **5× per route/theme on both builds** rather than trust one sample:

| Route | Baseline (5×) | After (5×) |
|---|---|---|
| `/` light & dark | `0,0,0,0,0` | `0,0,0,0,0` |
| `/work/flagstone/` light | `0.0013` ×5 | `0.0013` ×5 |
| `/work/flagstone/` dark | `0.0012` ×5 | `0.0012` ×5 |
| `/runway/` dark | `0,0.0167,0,0,0` | `0,0,0,0,0` |
| `/flagstone/privacy/` light | `0.0306` ×4, `0` ×1 | **`0.0306` ×5** |
| `/flagstone/privacy/` dark | `0.0306` ×5 | **`0.0306` ×5` |

**On the two routes I changed, CLS is identical before and after and well inside the floor.** Adding a second pill and rewriting the copy introduced **zero** layout shift.

⚠️ **`/flagstone/privacy/` has a stable, reproducible CLS of 0.0306 — 3× the 0.01 floor — and it is pre-existing on `origin/main`.** I did not cause it and did not fix it (not a route in this phase's scope). **It is a real defect and should get its own phase.** I also correct an earlier reading of my own: the single-shot sweep suggested `/runway/` was the offender; five repeats show `/runway/` is effectively 0 and `/flagstone/privacy/` is the stable one.

---

## 7. Captures — 48 frames, all opened

`~/career-arsenal/portfolio-4.0-implementation/2026-09-17/P1A/`

24 before (`29c2bc0`) + 24 after, as `{label}__{anchor}__{viewport}__{theme}__{motion}.png`, across 3 anchors (`homepage-subhead`, `flagstone-cta`, `flagstone-where-it-stands`) × 2 viewports (desktop 1440 DPR2, mobile 393 DPR3) × 2 themes × 2 motion states. Engine: chromium-1234 (Chrome for Testing). Every frame's anchor element was located and scrolled to before capture — **0 missing anchors, 0 console errors** across both passes. `before-manifest.json` / `after-manifest.json` carry per-frame route, viewport, DPR, theme, motion, engine and commit.

Frames I opened and read personally, and what each shows:

| Frame | What it establishes |
|---|---|
| `before__flagstone-cta__desktop-1440__light__standard` | single LIVE DEMO pill; STATUS "App Store review submitted · August 2026" |
| `before__flagstone-cta__mobile-393__dark__standard` | single full-width pill, dark |
| `after__flagstone-cta__desktop-1440__light__standard` | both pills; STATUS "On the App Store · US and Canada · Sept 2026" |
| `after__flagstone-cta__mobile-393__dark__standard` | two equal-width stacked pills, aligned, no awkward wrap at 393 |
| `after__flagstone-where-it-stands__desktop-1440__light__standard` | rewritten copy; "available on the App Store" renders as an underlined inline link; evidence paragraph intact |
| `after__homepage-subhead__desktop-1440__light__standard` | new subhead, 3 lines, **no App Store CTA added** |
| `after__homepage-subhead__mobile-393__light__reduced` | subhead wraps cleanly over 5 lines at 393, reduced motion |

Served from built `out/` by a **Node** static server, never `python3 -m http.server`.

---

## 8. Verified vs. not verified

**Verified first-hand:**
- The App Store record, from Apple's own lookup API, including the zero-rating figures that justify the no-adoption copy.
- Storefront scope across 12 storefronts.
- The link resolving 200 and its rendered page title.
- Rendered HTML of both App Store anchors, attribute by attribute.
- Zero rendered App Store `<a>` on the homepage (both `apps.apple.com` hits there are inside Next's RSC hydration payload, not links).
- Focus ring under **real keyboard `Tab`** with `:focus-visible` matching — not a programmatic `.focus()`, which reported `outlineStyle: none` and would have given a false reading.
- CLS by 5× repeat on both builds, not one sample.
- Console errors and CLS compared against a **freshly built `origin/main`** in a scratch worktree, since "pre-existing" is a claim that needs a measurement.
- Every capture I cite.

**Not verified:**
- **No real device.** Chromium and WebKit ran headless on the Mac, served from built `out/`. Real Safari on a real iPhone was not driven. (WebKit pass: §10.2.)
- **CLS is Chromium-only.** Checked, not assumed: WebKit 26.5's `PerformanceObserver.supportedEntryTypes` has no `layout-shift` entry, so WebKit cannot report CLS at all.
- The `/blog/building-accessmap/` 404 is reported as observed, cause unknown.
- AccessMap's `release/current.json` was read but **not updated** — owner-dispositioned **OUT OF SCOPE**; recorded as a follow-up in §10.5.
- Apple's brand guidelines for App Store link presentation were not reviewed; the label is plain text, not Apple's badge artwork, so no artwork rules are in play — but if Sky wants the official badge that is a separate decision.
- `/flagstone/privacy/`'s 0.0306 CLS was measured but **not diagnosed**.

---

## 9. Decisions for Sky

🔴 **1. Commit authorisation.** Nothing is committed. The branch `truth/flagstone-app-store-live` is ready in `~/Portfolio-p4/flagstone-truth`. Sky authorises the commit and merges.
✅ **2. The stacked CTAs** — decided: OWNER_ACCEPTED (§6a).
🟡 **3. `/flagstone/privacy/` CLS 0.0306** — dispositioned as an inherited residual; still a real defect worth its own phase.
🟡 **4. AccessMap `release/current.json`** — dispositioned OUT OF SCOPE; separate Flagstone source-truth follow-up (§10.5).
🟡 **5. No App Store link on `public/flagstone/index.html`.** That page's copy is now true, but a visitor there still has no path to the app. Adding one was outside "add a doorway on the case study", so I did not. Say the word and it is a one-line change.

---

## 10. Closure — owner decisions + the owed WebKit pass (2026-09-17)

### 10.1 Owner decisions applied

| Item | Disposition |
|---|---|
| Stacked CTA group | **OWNER_ACCEPTED.** Not to be altered to force one row. |
| Chromium console identities (3) | `PRE_EXISTING_NON_REGRESSION_RESIDUAL` for P1.A only. Bar: zero **new** identities. |
| `/flagstone/privacy/` CLS ≈0.0306 | `PRE_EXISTING_NON_REGRESSION_RESIDUAL` for P1.A only. Not repaired here. |
| AccessMap `release/current.json` = `submitted_for_review` | **OUT OF P1.A SCOPE.** Separate follow-up (§10.5). AccessMap not modified. |

**No product source changed during closure.** WebKit found no genuine P1.A regression, so the only closure edit is this receipt.

### 10.2 WebKit / Safari result — PASS

**Engine:** Playwright WebKit build 2336 (`~/Library/Caches/ms-playwright/webkit-2336/pw_run.sh`), reports version **26.5**. Headless on the Mac, same Node static server, same built `out/`. **Nothing installed.**

**Coverage:** `/` and `/work/flagstone/` × 1440 (DPR 2) and 393 (DPR 3) × light and dark = 8 frames, plus the App Store destination.

| Route | Viewport | Theme | `<h1>` | Overflow (element census) | `scrollX` after `scrollTo(9999)` | Console |
|---|---|---|---|---|---|---|
| `/` | 1440 | light | 1 | 0 | 0 | 0 |
| `/` | 1440 | dark | 1 | 0 | 0 | 0 |
| `/` | 393 | light | 1 | 0 | 0 | 0 |
| `/` | 393 | dark | 1 | 0 | 0 | 0 |
| `/work/flagstone/` | 1440 | light | 1 | 0 | 0 | 0 |
| `/work/flagstone/` | 1440 | dark | 1 | 0 | 0 | 0 |
| `/work/flagstone/` | 393 | light | 1 | 0 | 0 | 4 ⓘ |
| `/work/flagstone/` | 393 | dark | 1 | 0 | 0 | 4 ⓘ |

ⓘ Inherited WebKit media-control noise, identical on `origin/main` — §10.3.

**Homepage:** the subhead renders identically in all 4 combinations ("…One is on the App Store in the US and Canada…"). No App Store CTA on the homepage.

**Case-study CTA rendering:**

| Viewport | Theme | Live demo | Get it on the App Store | Same row | Wraps | 44px | In viewport |
|---|---|---|---|---|---|---|---|
| 1440 | light | 169.2 × 56 | 291 × 56 | no (accepted stack) | no | ✅ | ✅ |
| 1440 | dark | 169.2 × 56 | 291 × 56 | no (accepted stack) | no | ✅ | ✅ |
| 393 | light | 329 × 56 | 329 × 56 | no (full-width stack) | no | ✅ | ✅ |
| 393 | dark | 329 × 56 | 329 × 56 | no (full-width stack) | no | ✅ | ✅ |

`STATUS` renders `On the App Store · US and Canada · Sept 2026` in all four. Both pills: `target="_blank"`, `rel="noopener noreferrer"`, `aria-label="… for Flagstone (opens in new tab)"`.

**Keyboard focus order — and a platform fact that has to be read correctly.** Plain `Tab` in WebKit focuses **nothing on the page at all**: 0 elements in 12 presses, not even the skip link, on **both** this branch and `origin/main`. That is macOS WebKit's tab model — links sit outside `Tab` unless Safari's "Press Tab to highlight each item on a webpage" or macOS Keyboard navigation is on — not a site defect and not a P1.A change. Safari's link-navigation key is **Option+Tab**, and with it:

| Viewport | Theme | Branch: order reached | Focus treatment | `origin/main` |
|---|---|---|---|---|
| 1440 | light | 1) Live demo → 2) Get it on the App Store | `:focus-visible`, solid 2px, ring **4.02:1** | 1/2 (Live demo only, 4.02) |
| 1440 | dark | 1) Live demo → 2) Get it on the App Store | `:focus-visible`, solid 2px, ring **5.52:1** | 1/2 (Live demo only, 5.52) |
| 393 | light | 1) Live demo → 2) Get it on the App Store | `:focus-visible`, solid 2px, ring **4.02:1** | 1/2 (Live demo only, 4.02) |
| 393 | dark | 1) Live demo → 2) Get it on the App Store | `:focus-visible`, solid 2px, ring **5.52:1** | 1/2 (Live demo only, 5.52) |

`origin/main` reaches 1/2 only because the App Store pill does not exist there. The new pill takes the next stop after Live demo, and its ring matches the existing pill and the Chromium measurement exactly (floor 3.09:1).

**External-link behaviour (B):** in WebKit, navigating to the `href` read off the rendered pill → **HTTP 200**, redirected once to `https://apps.apple.com/us/app/flagstone-accessibility-map/id6774709116`. The page title is "Flagstone Accessibility Map App - App Store", the `<h1>` is "Flagstone Accessibility Map", and "Free" appears. Captured and opened: `webkit/webkit__appstore-cta-destination.png`. That frame shows the real listing: developer Skyler Halisky, category Navigation, 20.1 MB, and the product screenshots. One observation, not a defect: a *desktop* WebKit visitor gets Apple's Mac-store presentation of an iPhone-only app ("Only for iPhone … Not verified for macOS · View in Mac App Store"). That page is Apple's, and the link is behaving correctly.

**Layout vs the accepted Chromium evidence: no material discrepancy.** Pill geometry is within 0.2px (169.2 vs 169.0; 291 vs 290.8 at 1440) and identical at 393 (329/329). The stack order, alignment, status line and subhead wrap all match. The only visible difference is the **unchanged** Flagstone `summary` paragraph breaking one word earlier in WebKit at 1440 and 393. That is ordinary text rasterisation between engines, on copy P1.A did not touch.

**WebKit frames opened personally:** `webkit__flagstone-cta__desktop-1440__light`, `webkit__flagstone-cta__mobile-393__dark`, `webkit__homepage-subhead__mobile-393__dark`, `webkit__appstore-cta-destination`.

### 10.3 Console-error identities — full inherited set, each compared to `origin/main`

Identities are normalised (volatile `blob:` UUIDs stripped), then set-compared against a fresh `origin/main` build run through the **identical** harness.

| # | Engine | Identity | Route · viewport · theme | `origin/main` | Branch | New? |
|---|---|---|---|---|---|---|
| C1 | Chromium | `Error: supabaseUrl is required.` | `/archive/` · 1440 · light | ✅ present | ✅ present | no |
| C2 | Chromium | `Error: supabaseUrl is required.` | `/archive/` · 1440 · dark | ✅ present | ✅ present | no |
| C3 | Chromium | `Failed to load resource: 404` | `/blog/building-accessmap/` · 1440 · light | ✅ present | ✅ present | no |
| W1 | WebKit | `Button failed to load, iconName = pip-placard …` | `/work/flagstone/` · 393 · light+dark | ✅ present | ✅ present | no |
| W2 | WebKit | `Button failed to load, iconName = airplay-placard …` | `/work/flagstone/` · 393 · light+dark | ✅ present | ✅ present | no |
| W3 | WebKit | `Button failed to load, iconName = invalid-placard …` | `/work/flagstone/` · 393 · light+dark | ✅ present | ✅ present | no |

**Chromium:** 3 identities on both builds, set difference ∅ in both directions. **WebKit:** 3 identities (8 occurrences) on both builds, set difference ∅ in both directions. **New identities introduced by P1.A: NONE.**

⚠️ **One thing to flag rather than fold in quietly.** W1–W3 were **not** in the owner's disposition list, because they only exist under WebKit and only surfaced in this closure pass. They meet the owner's stated test (reproduced on `origin/main`, not introduced by P1.A), so they are recorded here as inherited, non-blocking residuals. But they sit on `/work/flagstone/`, a changed route, so the owner should know they exist. **Source:** WebKit's own native media controls failing to load their placard icons from WebKit-internal `blob:` URLs. The route has exactly one media element: the report-flow `<video controls>`, whose component and assets P1.A did not touch (`git diff origin/main -- components/ public/showcase/` is empty). They do not appear at 1440.

### 10.4 CLS

| Surface | `origin/main` (5×) | Branch (5×) | Verdict |
|---|---|---|---|
| `/` light | 0 ×5 | 0 ×5 | no regression |
| `/` dark | 0 ×5 | 0 ×5 | no regression |
| `/work/flagstone/` light | 0.0013 ×5 | 0.0013 ×5 | **baseline retained exactly** |
| `/work/flagstone/` dark | 0.0012 ×5 | 0.0012 ×5 | **baseline retained exactly** |
| `/flagstone/privacy/` (untouched, inherited) | 0.0306 (9 of 10) | 0.0306 (10 of 10) | inherited residual, owner-dispositioned |

**CLS regression on changed P1.A surfaces: NONE.** Measured in Chromium. WebKit exposes no `layout-shift` entry type (§8).

### 10.5 Out-of-scope follow-up — Flagstone source truth

**AccessMap `release/current.json`** (read from `~/AccessMap/.claude/worktrees/flagstone-build-33-docs-6ff9d2/release/current.json`) still records `"app": { "appStore": { "status": "submitted_for_review", "submittedAt": null } }` with `"lastVerified": "2026-09-02T06:15:01Z"`. The App Store record says `released 2026-09-15T21:21:25Z`.

- **Not modified.** No AccessMap file was written from this worktree.
- Portfolio no longer derives Flagstone status from that file. `docs/PORTFOLIO_TRUTH_MANIFEST.md` §5 now names it as the stale source.
- **Required follow-up (separate phase, AccessMap repo):** update the `appStore` block to the released state, citing the store record, so the next process that reads it is not misled.

### 10.6 Exact files changed · final git state

Branch `truth/flagstone-app-store-live`, `HEAD` = `origin/main` = `29c2bc0`. **No commits.**

```
 M app/__tests__/flagstone-release-status.test.ts
 M app/page.tsx
 M app/work/[slug]/page.tsx
 M content/deliverables.json
 M docs/IDENTITY_AND_CLAIM_CONTRACT.md
 M docs/PORTFOLIO_TRUTH_MANIFEST.md
 M lib/__tests__/flagstone-professional-bridge.test.ts
 M lib/__tests__/recruiter-copy-truth.test.ts
 M lib/schema.ts
 M public/flagstone/index.html
?? qa-reports/2026-09-17_P1A_FlagstoneReleaseTruth.md
```

```
 app/__tests__/flagstone-release-status.test.ts     | 112 ++++++++++++++++++---
 app/page.tsx                                       |   2 +-
 app/work/[slug]/page.tsx                           |  71 ++++++++++---
 content/deliverables.json                          |  11 +-
 docs/IDENTITY_AND_CLAIM_CONTRACT.md                |  20 ++--
 docs/PORTFOLIO_TRUTH_MANIFEST.md                   |   3 +-
 .../flagstone-professional-bridge.test.ts          |   9 +-
 lib/__tests__/recruiter-copy-truth.test.ts         |  38 +++++--
 lib/schema.ts                                      |  14 ++-
 public/flagstone/index.html                        |   2 +-
 10 files changed, 230 insertions(+), 52 deletions(-)
```

Of the 71 lines in `app/work/[slug]/page.tsx`, most are the source comment recording the measured column widths (§6a). The functional change is the `appStoreLink` selection, the `otherLinks` exclusion and the second `<Button>`.

**Preserve diffs, all empty against `origin/main`:** `app/__tests__/flagstone-cta-parity.test.tsx`, `app/__tests__/homepage-project-links.test.tsx`, `app/__tests__/blog-dated-status.test.tsx`, `components/cinematic/`, `app/runway/`.

### 10.7 Captures added in closure

`~/career-arsenal/portfolio-4.0-implementation/2026-09-17/P1A/webkit/`: 8 route frames (`webkit__{anchor}__{viewport}__{theme}.png`), `webkit__appstore-cta-destination.png`, and `webkit-manifest.json` (per-frame engine, viewport, DPR, theme, overflow, `<h1>`, pill geometry and attributes, console). Total evidence: **57 frames** (24 Chromium before, 24 Chromium after, 9 WebKit).

---

## 11. Release — 2026-09-21

### 11.1 Owner authorisation

On 2026-09-21 Sky explicitly instructed: commit and merge P1.A "to do it properly" so the next phase can proceed. This is recorded as an **explicit one-time owner override** authorising commit, fast-forward of `main`, push, and the resulting GitHub Pages deployment **for this exact candidate only** — the same form used for the `29c2bc0` release. It does not extend to any other phase.

### 11.2 Independent re-verification before release

Re-run from scratch in this worktree on 2026-09-21, four days after implementation, by a separate session rather than trusted from §5:

| Gate | Result |
|---|---|
| `origin/main` unmoved since implementation | ✅ still `29c2bc0` — clean fast-forward, no rebase |
| `npx vitest run` | ✅ exit 0 · **101 files · 903 passed · 2 skipped · 0 failed** |
| `npm run typecheck` | ✅ exit 0 |
| `npm run lint` | ✅ exit 0 |
| `npm run build` | ✅ exit 0 · 26/26 static pages |
| `flagstone-release-status` · `recruiter-copy-truth` · `flagstone-professional-bridge` | ✅ all inverted guards green |
| `homepage-project-links` · `flagstone-cta-parity` | ✅ green, **both files unmodified** |
| Stale phrases in shipped source (`app components lib content public`) | ✅ **0** (remaining matches are the inverted guards forbidding them, and dated history in docs) |
| Stale phrases in **built** `out/work/flagstone/index.html` | ✅ **0** "has not shipped", **0** "have not been established" |
| Homepage doorway pills in built output | ✅ **6** |
| Homepage App Store CTA | ✅ **0 rendered `<a href>` to the App Store.** The raw string `apps.apple.com` does appear **twice** in `out/index.html`, but both occurrences are inside the serialized React Server Components payload — the Flagstone record's markdown `body` and its `links` array, which the homepage embeds to hydrate its Flagstone card. Neither is rendered as a link. The live homepage shows 0 only because that data does not yet contain the URL. Caught during this re-verification and checked before release rather than assumed. |
| App Store link | ✅ HTTP 200 → `apps.apple.com/us/app/flagstone-accessibility-map/id6774709116` |
| `components/cinematic/**` · `/runway/` | ✅ 0 files changed |

One measurement note, recorded so it is not mistaken for a pass: the first stale-string sweep in this re-verification returned "NONE" because zsh expanded an unquoted `--include=*.ts` glob and grep never ran. It was re-run with quoted globs, and a positive-control grep confirmed the search worked before the result above was accepted.

### 11.3 Release method

Two commits on `truth/flagstone-app-store-live`, then `git push origin truth/flagstone-app-store-live:main` — a **fast-forward only**, no force, no merge commit, linear history. CI (`ci.yml`) runs on the push; `deploy.yml` deploys on CI success.
