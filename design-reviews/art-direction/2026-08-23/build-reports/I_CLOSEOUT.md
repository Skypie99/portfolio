# Phase I — Performance — CLOSE-OUT

**Branch:** `room/pI-perf` · **Date:** 2026-08-25 · **Depends on:** Phases A–E, G, H (all merged)

**Gate at close:** typecheck 0 · build 26/26 + 3/3 export · prebuild `validate-assets` OK (9 certs, 5 cinematic planes, 125 deliverable siblings, 3 blog figures) · vitest **764/767 passing, 1 skipped, 1 todo** (1 failure was a parallel-load flake — isolated re-run: 3/3 clean, see I4) · `check:overflow` — 0 elements cross the viewport edge (100/100 frames, 25 routes × 2 themes × 2 widths).

One commit, independently revertible:
1. `I1 — retire the three legacy PNGs: two superseded, one dead`

I2 produced no commit (investigation-only, STOP per PROTECT — see below). I3 produced no commit (measured, then explicitly reverted — see below). I4 is verification only.

---

## An operational note that belongs at the top, not buried

Partway through this phase, `git commit` landed I1's work on **`room/pH-dedup-instruments`** instead of `room/pI-perf`. Investigation (reflog + `ps aux`) showed why: another live Claude Code process was actively committing to `room/pH-dedup-instruments` in this same shared working directory — the "consolidate 3 duplicated instrument components" follow-up Phase H's own close-out had flagged as spawned-but-unstarted. It started at some point during this session and interleaved a checkout with mine, so `room/pI-perf` got branched from that session's in-progress tip instead of `main`, and a later checkout from that same session moved the shared HEAD before my commit landed.

Nothing was lost. Recovery, done without touching the other session's branch or the shared working directory at all: confirmed I1's diff was fully self-contained (zero overlap with the dedup files) via `git diff --stat` between the two commits · reset the `room/pI-perf` ref to clean `main` (`1c15e3e`, not checked out anywhere, so a pure metadata move) · created an isolated `git worktree` at `~/Portfolio-worktrees/pI-perf-2026-08-25` · cherry-picked the I1 commit there cleanly (`bbda372`) · re-verified typecheck + build green in the isolated copy. `room/pH-dedup-instruments` in the main `~/Portfolio` working directory still carries one extra harmless commit of mine (`900030f`, identical content) that neither branch nor session needs — safe to `git reset --hard` off that branch whenever convenient, but I didn't touch it myself given that session was still running.

**This entire close-out and its one commit live in the isolated worktree, cleanly stacked on `main` with nothing else mixed in.**

---

## I1 · The three legacy images

| File | Original | Disposition | Result |
|---|---|---|---|
| `deliverables/ghost-code/hero.png` | 476,442 B | superseded, not "re-encode" as literally listed — see below | → `hero.webp`, 27,000 B (**−94.3%**) |
| `deliverables/mutual-mesh/screen-feed.png` | 245,831 B | retire | **deleted** |
| `certificates/.../deeplearning-ai-for-everyone-2025/badge.png` | 248,323 B | re-encode | badge.png kept (17,696 B unchanged) + new `badge.avif` 10,740 B, `badge.webp` 17,696 B |

**ghost-code — the brief's own "or retire if superseded" clause fired, but not cleanly.** `heroImage.src` (the PNG) turned out to be **fully superseded already** — `lib/media.ts`'s `heroMedia()` always prefers `heroShot.src` when present, and ghost-code has had a real `heroShot` (pointing at `/showcase/ghost-code/title.*.avif/webp`) since the showcase train. Confirmed three ways: grep found zero direct reads of `heroImage` anywhere outside `media.ts`/`schema.ts`; `validate-assets.mjs`'s deliverable-proof checker only gates `heroShot`/`cardImage`/`shots[]`/`ogCard`, never `heroImage`; and a live network trace of the built `/work/ghost-code/` page showed only `/showcase/ghost-code/title.dark.desktop.avif` fetched — the legacy PNG never requested.

So the honest disposition was **retire**, not re-encode — except `heroImage` is a Zod-required field (unlike `heroShot`/`cardImage`, it has no `.optional()`), and nothing enforces the file it names actually exists. Outright deletion would have left a JSON field claiming an image exists at a path where nothing does — a dangling, dishonest reference, even though mechanically harmless today. I judged that worse than the alternative: **re-encoded the same picture to WebP in place** (1100×711, unchanged — this isn't a crop or a re-shoot, just a modern-format re-encode) and repointed the one JSON string. Zero schema change, zero component change, the field still names something real, and the actual byte weight problem (476KB of PNG sitting in `public/` for an image nothing renders) is gone. This is a judgment call, not a certainty — the schema could instead be loosened to make `heroImage` optional once every deliverable has a `heroShot`, which would let genuinely-retired legacy heroes disappear outright. That's a small, separate, deliberate schema decision, not a drive-by I made inside a performance pass.

**mutual-mesh — clean retire, no caveats.** Zero references anywhere in `content/` (grep confirmed). The two test hits on the string "mutual-mesh" are unrelated to this file: `static-integrity.test.ts` asserts the `/work/mutual-mesh/` URL-redirect stub still resolves (a route-level concern, not this image), and `ProductReveal.test.tsx` uses `"mutual-mesh"` only as an arbitrary fixture slug for a decorative-placeholder test case. Deleted outright.

**badge — genuine re-encode, actually used.** Unlike `heroImage`, `BadgeImage.tsx` really does read `avif`/`webp` off the JSON and wrap the `<picture>` around them when present — this is the live path for the six Anthropic badges already. Ran the same pipeline that produced those (`scripts/encode-proof.mjs`, `--out-dir public/images/certificates/<slug>` — the script's own docstring names this exact "C-02 badge encode" precedent), `--kind card` (500×500 source, well under any width cap either kind would apply). AVIF landed at q52 on the first rung of the budget ladder — nowhere near the 150KB ceiling. `badge.png` is untouched, still the universal `<img>` fallback per `BadgeImage.tsx`'s own contract. **UP-18's known defect (the source image slices words mid-letter at its 500×500 crop) is untouched** — re-encoding format doesn't fix a source crop, and a square re-export is Sky's asset to supply, not mine to fabricate around.

Live-verified against the built `out/`: both new sibling sets fetch 200 OK, zero console errors on a clean tab, `validate-assets` and `static-integrity` both pass.

---

## I2 · `perf/trim-hero-weight` — F7 verdict: 🔴 unlock request, not a quiet merge

Ancestry: cut at `c20aa9e`, **1 commit ahead** of that point (`70fc59c`), **263 commits behind** current `main`. It does exactly what Sky ruled it should — adds responsive `srcset` + a real mobile tier (6 new AVIF/WebP plates) for the cinematic hero layers, so phones stop downloading the full desktop-magnification plate.

**It edits `components/cinematic/**` — Layer.tsx, StaticDesertFrame.tsx, plates.ts — all three, substantively**, exactly the scenario the brief named as a 🔴, not a quiet edit. Checked with `git merge-tree --write-tree main perf/trim-hero-weight` (a read-only simulation — no branch or working tree touched):

| File | Merge result |
|---|---|
| `Layer.tsx` | clean (main never touched it since the branch point) |
| `plates.ts` | clean auto-merge |
| `StaticDesertFrame.tsx` | **real conflict** |

The conflict's cause, checked directly (`git log`/`git diff` from the merge-base to `main`): **PROTECT did not universally hold across the whole program** — six later commits (`eb10e51` "one grammar, one clock," `35c9693`/`95e8505`/`a7150c0`/`1393d40`/`38b94db`, all reading as a Phase-D-era art pass: rim-glow, gilded title ink, breathing frame) legitimately touched this same file, wrapping each plate's `<picture>` in a `<Fragment>` alongside a new sibling `.cdesert-cliff-glow` div. `trim-hero-weight`'s side renames the destructured `sourcesFor()` return (`avif`/`webp` → `avifSrcSet`/`webpSrcSet`) and adds `sizes="100vw"` to the same `<picture>` block. Both sides are legitimate, non-overlapping-in-intent changes to the same lines — genuinely not auto-resolvable, and reconciling them means hand-editing a protected file to re-apply the srcset logic onto the Fragment-wrapped structure without disturbing the rim-glow.

> 🔴 **DECISION NEEDED**
> **What:** unlock `components/cinematic/StaticDesertFrame.tsx` (+ the two clean files) so `perf/trim-hero-weight`'s mobile-tier srcset can land.
> **Recommendation:** unlock it — this is your own standing ruling ("mobile cinematic plates, real LCP win"), the two non-conflicting files apply as-is, and the one conflict is a small, well-scoped merge (re-thread `avifSrcSet`/`webpSrcSet` + `sizes="100vw"` into the Fragment-wrapped block, touching nothing else) — not a rewrite.
> **Why:** real phones currently download the full desktop-magnification cinematic plates regardless of viewport; this is the fix, already built and reviewed in principle.
> **Alternative:** leave it stranded again. Costs nothing today, but it drifts further from `main` every phase and the eventual conflict only grows.
> **Impact:** touches exactly 3 files, 1 with a real (small, mechanical) conflict to resolve by hand; adds 6 new binary plates (~185KB total) + 1 new script.
> **Your choice:** [UNLOCK — I resolve the conflict and prepare it for your merge] [UNLOCK — you resolve it] [LEAVE STRANDED]

Per the brief: **Sky merges — I prepared and reported, I did not touch the protected files.**

---

## I3 · The polyfill bundle — measured, not assumed

`polyfills-42372ed130431b0a.js` — confirmed **112,594 bytes**, matching the brief exactly.

**The premise didn't hold.** I temporarily swapped `browserslist` to a tighter, still mobile-inclusive modern target (`last 2 Chrome/ChromeAndroid/Firefox/Safari/iOS/Edge/Samsung versions` — 13 resolved versions vs. the current 31, dropping KaiOS, UC/QQ Android, Opera[Mobile], and two-to-three-year-old desktop Chrome), rebuilt, and measured:

| Artifact | `defaults, not dead, not op_mini all` (current) | Tighter modern-evergreen (13 versions) | Δ |
|---|---|---|---|
| `polyfills-*.js` | 112,594 B | **112,594 B — byte-identical hash** | **0** |
| Every route's Size / First Load JS | (baseline table below) | byte-for-byte identical, every route | **0** |
| Largest CSS chunk | 90,519 B | 87,620 B | **−2,899 B (−3.2%)** |
| Other 2 CSS chunks | 15,198 B / 10,855 B | 15,198 B / 10,855 B | **0** |

Next.js's `polyfills.js` is a **fixed framework-level bundle**, not something `browserslist`-driven usage-based polyfilling (à la a bare `@babel/preset-env` + core-js setup) shrinks — it doesn't respond to the project's browserslist target at all. `browserslist` here only feeds Tailwind's autoprefixer (the one real, small, measured win above) and the SWC/Babel down-level target for the app's own syntax — which, for this codebase's already-modern JS, cost nothing here since no route's compiled size moved.

Reverted immediately after measuring; `git diff package.json` confirmed clean before continuing.

> 🔴 **DECISION NEEDED**
> **What:** tightening `browserslist`.
> **Recommendation:** **LEAVE IT.** The stated motivation — cut the 112KB polyfill weight — doesn't apply; that number is fixed regardless. The only real, measured effect is a 2,899-byte (2.6% of total First Load JS) CSS saving, and the current query already drops the genuinely dead/niche engines (`not dead`, `not op_mini all`) while keeping real mobile Chrome/Safari/Samsung users the tighter target would drop.
> **Why:** ~3KB isn't worth narrowing who can load the site for a hiring-manager audience that does sometimes browse on a locked-down work laptop or an older phone.
> **Alternative:** tighten anyway for the small CSS win — defensible if Sky wants the byte count as low as physically possible regardless of size, just not on the "112KB polyfills" reasoning that motivated the question.
> **Impact:** near-zero either way, now that it's measured instead of assumed.
> **Your choice:** [LEAVE IT] [TIGHTEN for the ~3KB CSS delta] [DEFER]

---

## I4 · The budgets — real numbers

| Budget | Limit | Banked baseline | Measured now |
|---|---|---|---|
| `public/` tree | ≤ 8 MB | 5.57 MB (`public/showcase` specifically, at the showcase-refresh merge) | **26.83 MB raw** — see caveat below. `public/showcase` alone: **5.9 MB** (in line with its own baseline). Excluding one deliberately-unlisted page's asset: **9.6 MB**. |
| Worst-case CLS | ≤ 0.004 floor | 0.00034 (banked), 0.0039 (Phase H's more recent measured worst-case) | Not re-run — see honesty note. Reasoned, not measured: none of I1's 3 changes touch a rendered, sized, or layout-participating element (ghost-code's PNG/WebP swap is on an unrendered field; the badge's fixed `width={400} height={400}` is unchanged; mutual-mesh's file was already unreferenced) — no CLS mechanism for this phase's work to have moved. |
| Homepage First Load JS | must not grow | — (no pre-program figure was ever recorded in a close-out; flagged, not invented) | **171 kB, byte-identical across all 3 builds this phase** (pre-I1, post-I1, post-I1-with-experimental-browserslist). Unchanged *by this phase's own work* — the only claim I can actually back. |
| Above-fold images/route | ≤ 600 KB | — | Not exhaustively re-audited per-route. Spot-verified the homepage's above-fold set via network trace (5 woff2 fonts, `headshot.jpg`, 2 CSS chunks, 4 cinematic AVIF planes) — unchanged, since none of this phase's edits touch the homepage. |
| Autoplaying clips/viewport | ≤ 1, IO-gated | homepage: 0 | Unaffected — no video/clip logic touched this phase. |

**The `public/` raw number needs a caveat, not a shrug.** `public/videos/amazon-night-flight.mp4` is **17.2 MB — 63% of the entire `public/` tree on its own**. It belongs to `/runway`, a page built for one specific job application: `robots: {index:false, follow:false}`, not linked from any nav/footer/sitemap, `<video preload="metadata">` so the byte cost is never paid by any visitor who doesn't open that one unlisted URL and press play. It predates this program and has nothing to do with THE ROOM. Excluding it, `public/` is 9.6 MB — still over the literal 8MB line, but the remainder (showcase 5.9MB, cinematic 1.7MB, deliverables 988KB, certificates 748KB, the rest under 100KB combined) reads as ordinary, organic growth from a site that's added a lot of real content (more certificates, more captures, dark-mode twins) since 5.57MB was banked — nothing in that remainder looks like a bug I could safely cut alone.

> 🔴 **DECISION NEEDED**
> **What:** how the `public/` tree budget should treat `/runway`.
> **Recommendation:** exclude it from the gate explicitly (measure `public/` minus `videos/amazon-night-flight.mp4`, or minus anything under a page with `robots: noindex`) — the budget's intent is protecting the crawlable, general-visitor experience, and this asset structurally can't affect that (unlinked, noindexed, metadata-only preload).
> **Why:** the raw number reads as a 3.3× budget blowout, which isn't true of the site anyone but that one hiring team will ever load.
> **Alternative:** keep the budget literal (whole `public/` tree, no exceptions) — simpler rule, but means either moving the video outside `public/` entirely (it'd need its own serving mechanism, more work than this phase's scope) or accepting a permanently-red gate.
> **Impact:** a wording/measurement-scope decision only; no files move either way until Sky picks.
> **Your choice:** [EXCLUDE noindexed pages from the gate] [KEEP LITERAL — accept red] [DEFER]

**The furniture — confirmed, zero runtime JS added.** `Plate.tsx`, `Receipt.tsx`, `LedgerRow.tsx`, `Exhibit.tsx` — grepped all four, zero `'use client'` directives. Server components, as claimed.

**One other client component was added in the same span, and it isn't the furniture.** Diffed every `'use client'` file between Phase A's start (`52bd0ef`, the parent of the Phase A merge) and now: exactly one addition, `components/IntroSkip.tsx` (Phase B, `9e4655c`, "a real, clickable way past the pinned film"). It's a "Skip intro" control driven by an `IntersectionObserver` watching `.cinematic-content-reveal` — genuinely can't be a server component (it's stateful, viewport-reactive UI), and it's a real accessibility/UX feature (a pointer/touch equivalent to the keyboard-only skip link), not scope creep. Justified, not fixed — there's nothing to fix.

---

## The CLS honesty note (carried forward as instructed)

**No estate-wide CLS number was re-derived this phase.** The 64-frame full-page rig from the ui-polish train was a one-off, never committed, and rebuilding it was out of this phase's scope. The most recent real number on record is Phase H's own measured worst-case, **0.0039** (`work-flagstone@768`), against the 0.004 floor — published there as *worse than the older 0.00034 banked figure, on purpose, because it was actually measured*. I'm not re-quoting either number as if I re-measured it, and I'm not synthesizing a new one. My only CLS claim is the narrow, reasoned one above: nothing in I1's 3 file changes has a mechanism to move it.

## PROTECT — proof it held

- `components/cinematic/**` — **untouched by this phase.** (The unrelated concurrent session's dedup work touched `components/Plate.tsx`/`CalibrationRecord.tsx`/`LedgerRow.tsx` — the furniture, not the cinematic directory — confirmed by its own commit messages and by `room/pI-perf`'s clean cherry-pick showing zero file overlap.)
- `/archive` island — untouched.
- `content/showcase.manifest.json` + the capture factory (`scripts/capture-showcase.mjs`, `scripts/showcase/**`) — untouched; only read, never modified, to understand how `heroShot` supersedes `heroImage`.
- `lib/motion.ts` (the single shared motion frame clock) — untouched. Read once to confirm it, never edited.
- Code-splitting: `HamburgerNavMount`'s `next/dynamic({ssr:false})` boundary — untouched; `supabase-js` — still confined to `components/archive/**` + `lib/archive/**` (grep re-confirmed, unchanged from before this phase).

## Premises that didn't hold

1. **I1's ghost-code row assumed a clean binary choice** ("re-encode... or retire"). Reality was messier — superseded-but-schema-required — and the resolution (shrink in place) is a judgment call, documented above, not a certainty.
2. **I3's underlying premise — that the 112KB polyfill bundle is browserslist-tunable — was false.** Measuring first (as instructed) caught this before any unnecessary compatibility was traded away for a saving that doesn't exist.
3. **The `public/` ≤8MB budget's literal wording doesn't distinguish a noindexed, unlinked page's assets from the crawlable site** — which is exactly why the raw number is misleading without the `/runway` caveat.
4. **No prior close-out recorded a pre-program homepage First Load JS figure** — searched C/D/E/H's close-outs specifically; the number simply wasn't banked anywhere. Flagging the gap rather than inventing a figure to diff against.

---

## STOP

Built + green + **STOPPED on `room/pI-perf`** (isolated worktree: `~/Portfolio-worktrees/pI-perf-2026-08-25`, one commit `bbda372` ahead of clean `main` `1c15e3e`). **Never merged, never pushed.** Three 🔴s open above (I2 unlock, I3 browserslist, I4 `/runway` budget scope) — none acted on, all measured and ready for a pick. `room/pH-dedup-instruments` in `~/Portfolio` carries one harmless stray duplicate commit from the collision above, unresolved by me on purpose (that branch belongs to the other session).
