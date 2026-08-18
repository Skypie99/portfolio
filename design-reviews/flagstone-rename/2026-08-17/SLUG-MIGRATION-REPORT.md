# SLUG MIGRATION — THE FLAGSTONE URL HALF

**2026-08-17 · branch `rename/flagstone-slug-2026-08-17` · nothing pushed, nothing merged.**

The URL, the asset directories and every identifier that routes off the slug now say
`flagstone`. Both old URLs still resolve. `main` is untouched.

---

## 0 · ⚑ READ FIRST — three things that need your decision

**1. This branch is stacked on the copy pass, not on `main`.**
The prompt said "off current `main`". `main` does **not** contain the copy rename —
that lives on `rename/flagstone-site-2026-08-17` (`d07c42f` + `283152c`) and is
unmerged. Branching off `main` would have dropped the copy work, conflicted on every
shared file, and made `CLOSE-OUT.md` unreadable. So this branch is cut from
`283152c`, and **merging it merges both halves**. (Mid-run, the prompt file itself was
amended with a PRECONDITION saying exactly this — see §6.)

**2. A showcase re-capture was running in this repo while this migration ran.**
It wrote four freshly-encoded `drawer-open.*` images into `public/showcase/accessmap/`
*after* that directory had been `git mv`d away, and it **regenerated
`content/showcase.manifest.json`**. Both were caught and quarantined, not committed.
Its output is preserved under
`design-reviews/flagstone-rename/2026-08-17/RECAPTURED-DRAWER-SHOTS-UNCOMMITTED/`.
That capture run was almost certainly corrupted — the directory it was writing into was
renamed out from under it. **It should be re-run against the new path.** Details in §6.

**3. This run found and closed a copy-pass miss: the hero SVG rendered "ACCESSMAP".**
`public/images/deliverables/<slug>/hero.svg` carried the old name twice — once as
visible `<text>` on the case study, once as the SVG's `<title>` (its accessible name,
which is what a screen reader announces). Both are now Flagstone. See §4.

---

## 1 · What moved

| | |
|---|---|
| **Asset directories** | `public/images/deliverables/accessmap` → `flagstone` (4 files) · `public/showcase/accessmap` → `flagstone` (59 files) |
| **63 files** | all moved with `git mv`; git records 62 × `R100` and 1 × `R097` (`hero.svg`, renamed *and* edited — §4) |
| **Case study URL** | `/work/accessmap/` → `/work/flagstone/` |
| **Blog post URL** | `/blog/building-accessmap/` → `/blog/building-flagstone/` (decision in §5) |
| **`content/deliverables.json`** | `id` → `flagstone`; 38 asset paths |
| **`content/blog.json`** | `id` → `building-flagstone`, `relatedDeliverable` → `flagstone`, 3 hero paths |
| **`content/showcase.manifest.json`** | `projects` key, `slug`, 24 × `project`, 58 shipped paths |
| **Code identifiers** | the `'accessmap'` member of `CaseStudyCategory`/`Category` and their lookup maps in `app/work/[slug]/page.tsx`, `app/blog/[slug]/page.tsx`, `components/GalleryWall.tsx`, `components/CaseStudyCard.tsx`; signature hue + device-frame keys in `lib/signature.ts`; the OG scene map in `scripts/og-cards.mjs`; `slug` in `scripts/showcase/registry.mjs` and `wiring.mjs`; the `--tint-accessmap` token |
| **Symbols** | `AccessMapTestReceipt` → `FlagstoneTestReceipt`, its import in `app/__tests__/work-receipt.test.tsx`, and the anchor `#accessmap-test-count-method` → `#flagstone-test-count-method` — all three together, since the anchor is asserted by its own test *and* the section-nav guard |
| **Tests** | 137 slug/path/symbol occurrences across 22 test files |
| **New** | 2 redirect stubs · 1 new guard block (`Gap 8`) · 1 documented guard exemption |

**Not touched, as instructed:** the `2,971 tests passing · measured 2026-08-16` receipt
and its method paragraph are byte-identical to `HEAD`. No number in this repo was
re-derived, refreshed or edited.

---

## 2 · Every surviving `accessmap` in `out/`, accounted for

The sweep is **case-insensitive**. That matters: an earlier case-*sensitive* pass
reported a clean tree and was wrong — it silently hid the capitalised `ACCESSMAP` in
`hero.svg`. Same trap the prompt flagged for test regexes, one layer down.

```
$ grep -rIni "accessmap" out/ | wc -l
97
```

| # | Survivor | Count | Why it stays |
|---|---|---|---|
| 1 | `https://github.com/Skypie99/AccessMap` | 95 | The repo kept its name, so the link must too. Identifier, not a name. |
| 2 | `https://accessmap.skypistudio.com` | 93 | The live host, pinned deliberately app-side along with the `accessmap://` scheme and the Supabase redirect URLs. |
| 3 | `out/work/accessmap/index.html`, `out/blog/building-accessmap/index.html` | 2 files | The redirect stubs themselves. They *are* the old URL. |
| 4 | `out/receipts/a11y-2026-07-09.json` | 12 lines | **A dated measurement receipt.** Route keys like `work-accessmap@768` record what the routes were called on 2026-07-09, when the numbers were measured. Renaming them would make the file claim a measurement that never happened. Frozen under the same law as the test-count receipt. |

```
$ grep -rIni "accessmap" out/ | (drop the two stubs, the receipt, and the two frozen URLs)
<<< empty >>>
```

Nothing else. Counts 95/93 are occurrences (the URLs recur across HTML, RSC payloads
and JS chunks); 97 is matching *lines*.

---

## 3 · The gates — verbatim

Run against a clean `out/` after the §4 repairs.

```
############ GATE 1: npm run typecheck ############
> tsc --noEmit
TYPECHECK_EXIT=0

############ GATE 2: npm run build ############
[validate-assets] OK — all 9 certificate badge image(s) found in public/.
[validate-assets] OK — all 5 cinematic real plate (AVIF+WebP)(s) found in public/.
[validate-assets] OK — all 140 declared deliverable proof sibling(s) found in public/.
[validate-assets] OK — all 3 blog figure image(s) found in public/.
 ✓ Compiled successfully in 1600ms
 ✓ Generating static pages (26/26)
 ✓ Exporting (3/3)
├   └ /blog/building-flagstone
└ ● /work/[slug]
    ├ /work/flagstone
BUILD_EXIT=0

############ GATE 3: npx vitest run ############
 Test Files  65 passed (65)
      Tests  648 passed | 1 skipped | 1 todo (650)
VITEST_EXIT=0
```

648 vs the copy pass's 643: **+5**, exactly the new `Gap 8` block (§4). Nothing was
skipped-and-forgotten; the 1 skipped and 1 todo are the pre-existing
`asset-integrity` pair.

Note the build ran *before* vitest in every run, so `out/` existed and the
build-dependent suites (`static-integrity`, `section-nav-anchors`) actually executed
rather than self-skipping.

---

## 4 · The redirect, and what it cost

### The stubs

`next.config.mjs` `redirects()` is inert under `output: 'export'`, there is no server
and no `_redirects`. What does work: Next copies `public/` into `out/` verbatim, and
`public/` held no HTML before this. So two hand-written files now sit at the old paths:

```
public/work/accessmap/index.html            → /work/flagstone/
public/blog/building-accessmap/index.html   → /blog/building-flagstone/
```

Each carries a zero-delay `<meta http-equiv="refresh">`, a `<link rel="canonical">` to
its destination, and a real visible sentence with a plain `<a>` for anyone whose meta
refresh is blocked.

### ⚠ A meta refresh is not a 301 — say it plainly

This is the honest ceiling on GitHub Pages, not a preference. A meta refresh:

- passes **less** link equity than a 301, and search engines treat it as a softer signal;
- is **client-side**, so it costs a round trip and a paint, and anything that doesn't
  execute it (some crawlers, some privacy extensions) sees the stub page instead —
  which is why the visible `<a>` is load-bearing, not decoration;
- **cannot** be seen by a client that only issues a `HEAD` request.

The `rel=canonical` is what actually consolidates the two URLs for search. If the site
ever moves off GitHub Pages, these two files should become real 301s and be deleted.

The stubs deliberately declare **no** Open Graph block. Giving the retired URL a share
card would make it compete with the new one — the precise failure
`static-integrity`'s Gap 6 exists to catch.

### Guard changes (2, both deliberate)

**Exemption.** Gap 6 sweeps every built HTML file and requires an own-URL `og:url`,
`og:site_name` and `og:locale`. A stub has none by design, so it is now exempt —
keyed on **content** (`<meta http-equiv="refresh">`), not a path allowlist, so a future
stub is covered the day it is written and a file that stops being a stub re-enters the
guard by itself. Written in the same "excluded deliberately, never silently" voice as
the existing `IS_404` exemption directly above it.

**New guard — `Gap 8`.** Nothing else in the build knows the stubs matter: they are not
routes, nothing imports them, and no other test would notice their deletion. A tidy-up
of `public/work/` would silently 404 every inbound link with all gates green. So five
new assertions, against the **built** artifact:

- each stub exists in `out/`
- each declares a zero-delay meta refresh to the right destination
- each declares the right canonical
- each ships a plain `<a>` fallback
- the destinations exist, and the sitemap lists the new URLs while **not** advertising the stubs

### The `hero.svg` fix

`public/images/deliverables/flagstone/hero.svg` still said the old name twice:

```
<title>AccessMap — accessibility-flagging app hero illustration</title>
<text … text-anchor="middle" opacity="0.5">ACCESSMAP</text>
```

The second is visible on the case study; the first is the image's accessible name. Both
are now `Flagstone` / `FLAGSTONE`. This was a copy-pass miss rather than this run's
scope, but the file is one of the 63 this run moved, it is visitor- and
screen-reader-facing, and leaving a known-wrong product name because of a scope line
would have been the wrong call.

Safe by the same lucky break the copy pass recorded: **both names are 9 characters**,
and the label is `text-anchor="middle"`, so the centred text re-centres identically and
the letter-spacing does not reflow.

---

## 5 · The one decision — the blog URL **moves**

`/blog/building-accessmap/` is a dated historical post, and leaving it was defensible.
It moves. Why:

1. **The URL was the last place the old name leaked to a visitor.** After the copy pass
   the post's `<title>` and `<h1>` already read *"Building Flagstone"*. A URL that
   disagrees with the headline above it is a seam, not a record.
2. **The record is carried by the post's date and body, not its slug.** Nothing
   historical is lost by moving it; the post still says it was built as AccessMap.
3. **The cost of moving is one extra stub**, and the stub means no existing link breaks
   either way — so consistency is nearly free while inconsistency is permanent.
4. It is the lower-surprise reading of the brief, whose own step list already specified
   `id` → `building-flagstone`.

It gets identical redirect treatment to the case study, and the same honest caveat
in §4 applies to it.

---

## 6 · Banked, not guessed

**1. The branch base.** Covered in §0. Recorded here because it changes your merge:
one stacked branch, not two.

**2. ⚠ The concurrent showcase capture.** The single most important item in this report.

At 22:26–22:27, *after* step 1 had `git mv`'d `public/showcase/accessmap/` away, a
capture process recreated that directory and wrote four freshly-encoded files into it —
`drawer-open.{light,dark}.phone.{avif,webp}` — byte-different from the 2026-08-01
captures, and with bytes that appear nowhere in this repo's history. It also
**regenerated `content/showcase.manifest.json`** (`generatedAt` 2026-08-01 → 2026-08-18),
re-introducing four shipped `/showcase/accessmap/` paths and a duplicated project entry.

Those four filenames are exactly the ones the copy-pass close-out §4 flagged as still
showing the old wordmark — so this was very likely the re-capture that fixes them.

What was done:

- the four images are preserved (with md5s) under
  `design-reviews/flagstone-rename/2026-08-17/RECAPTURED-DRAWER-SHOTS-UNCOMMITTED/`;
- the capture's manifest is parked beside them as
  `showcase.manifest.REGENERATED-BY-CAPTURE.json`;
- the committed manifest was **re-derived from `HEAD` + this migration's transform
  only**, so no capture output rode along in this commit;
- nothing was deleted without a copy first.

**Do not hand-copy those four images into `public/showcase/flagstone/`.** The capture
run was interrupted mid-flight by the rename and should be treated as incomplete — four
files, no clip/poster siblings, no regenerated budgets or determinism proof. Re-run the
factory against the new path so the manifest and its receipts are produced together.

**3. `scripts/showcase/registry.mjs` was repinned mid-run — left unstaged.** Someone
changed the capture source from `shipready/3-polish-submission @ 5ab3f0c` to
`main @ 8cdd643` (reasoning: the old pin predates the app rename and rebuilds the old
wordmark). That is a real and probably correct change, but it is a *capture* decision,
not a *URL* decision, and it asserts a commit in another repo that this run cannot
verify. So the file was staged surgically: the index holds `HEAD` + this migration's
one-line `slug` change, and the repin remains in your working tree as an unstaged edit
for you to own. `git status` shows it as `MM`. Confirmed safe: `registry.mjs` is
imported only by the capture scripts, never at build or test time.

**4. `SLUG-MIGRATION-PROMPT.md` was edited mid-run — left unstaged.** Someone added a
PRECONDITION block (branch-base check) and a warning against running concurrently with a
capture. Not this run's change to commit.

**5. The a11y receipt is frozen.** Reasoning in §2, row 4. Consumed by
`app/accessibility/opengraph-image.tsx`, which reads only the `summary` block — never
the per-route keys — so freezing it breaks nothing.

**6. The Supabase migration is frozen.** `supabase/migrations/20260808000000_…sql` has
one comment naming AccessMap prod. Applied migrations are history; not edited.

**7. Internal planning docs were not rewritten.** `README.md`, `FEATURES.md`,
`SHOW_WORK_PLAN.md`, `UI_SYSTEM.md`, `docs/`, `designs/`, `qa-reports/`, `summaries/`
and the `design-reviews/` archive still contain `accessmap`. None ship, none are in
`out/`, and most are dated records of decisions taken when the product had that name.
Rewriting them would inflate the diff and falsify the archive. Flagged rather than done
— say the word if you want a follow-up pass over the live-facing subset
(`docs/showcase-factory.md`, `docs/COWORK_GITHUB_URLS.md`).

**8. A judgment call worth naming.** Code comments describing *past incidents* by URL
(the `/blog/building-accessmap/` broken-hero story in `validate-assets.mjs` and
`static-integrity.test.ts`) were moved to the new URL, on the grounds that a future
reader chasing that path should land on the live page. That trades a little
archaeological fidelity for navigability. Reversible if you disagree.

**9. Kebab-case rejection fixtures.** `lib/__tests__/schema.test.ts` uses `'AccessMap'`,
`'-accessmap'` and `'accessmap-'` as *deliberately invalid* ids. They moved to the
Flagstone equivalents so they read coherently beside the now-`flagstone` good fixture.
Behaviour is unchanged — they still assert rejection.

---

## 7 · Proof, not assertion

**Both URL pairs, served over HTTP from `out/`:**

```
  /work/accessmap/               HTTP 200   Moved to /work/flagstone/ — Sky Halisky
  /work/flagstone/               HTTP 200   Flagstone — Sky Halisky
  /blog/building-accessmap/      HTTP 200   Moved to /blog/building-flagstone/ — Sky Halisky
  /blog/building-flagstone/      HTTP 200   Building Flagstone — A Lesson in Shipping Something…
  control /work/no-such-page/    HTTP 404
```

The control line is the point: a path with no stub 404s, so the 200s above are the
stubs doing work, not the server being lenient.

**The hop itself** (curl does not follow meta refresh, so it was read out by hand):

```
  /work/accessmap/           --meta refresh-->  /work/flagstone/            → 200
  /blog/building-accessmap/  --meta refresh-->  /blog/building-flagstone/   → 200
```

**The 63 moved assets:**

```
  moved assets in out/           : 63   (expect 63)
  old asset dirs in out/         : 0    (expect 0)
  referenced flagstone assets    : 27   missing: 0
  hero.svg visible label         : >FLAGSTONE</text>
  hero.svg accessible name       : <title>Flagstone — accessibility-flagging app hero illustration
```

Every `/showcase/flagstone/…` and `/images/deliverables/flagstone/…` path referenced
anywhere in the built HTML, JSON, XML, JS, CSS or SVG resolves to a real file. This
matters because the schema only guards `/images/deliverables/<slug>/` — a stale
`/showcase/` path would have shipped a broken image with every gate green.

**Sitemap** — derives from `getDeliverables()`/`getBlogPosts()`, so it followed on its own:

```
  https://skypistudio.com/blog/building-flagstone/
  https://skypistudio.com/work/flagstone/
  …
  stub advertised? -> 0
```

---

## 8 · The commit

```
  2 A       the two redirect stubs
 43 M       content, code, tests, guards
 62 R100    assets moved, byte-identical
  1 R097    hero.svg — moved and edited
```

Left uncommitted on purpose: `.claude/launch.json`, `DECISIONS_LOG.md`,
`PROJECT_STATE.md` (the three permanently-dirty files, untouched),
`SLUG-MIGRATION-PROMPT.md` and the `registry.mjs` repin (§6.3, §6.4).

---

## 9 · Over to you

Nothing has been pushed and nothing merged. Merging this brings the copy half with it.

```bash
cd ~/Portfolio
git checkout main
git merge --no-ff rename/flagstone-slug-2026-08-17
```

Before you do, three things worth a look: the concurrent capture (§0.2 / §6.2), the
unstaged `registry.mjs` repin (§6.3), and — if you want it — a decision on the internal
docs (§6.7).
