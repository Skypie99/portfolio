# Portfolio Final Polish — Merge Report — 2026-06-10

**Role:** Rory (DevOps / release). **Repo:** `~/Portfolio` (Next.js 15 static export → GitHub Pages, skypistudio.com).
**Status:** ✅ MERGED, PUSHED, GREEN. Sky's two corrections shipped with the final-polish pass.

**Merge SHA (main):** `80e512ff740c5fa4f22424983aa06ca4fed578bb`
**Rollback:** `git revert -m 1 80e512f` (reverts the whole release; `-m 1` keeps the pre-release main `c3087ad` as the mainline parent)
**Branch (audit trail, pushed):** `polish/portfolio-final-2026-06-10` @ `8778942`
**Base before merge:** `c3087ad` (origin/main had not moved — 0 commits ahead — so no rebase was needed)

My three commits on the branch:
- `a6fb8dc` — `polish(copy)`: honest five-live/six-shown claims + Mesh demo label
- `5e8d9b7` — `polish(order)`: Claude Corp #2, Dashboard #3
- `8778942` — `polish(copy)`: card demo link reflects live status — Mesh reads 'Demo' (discovered during verification — see §6)

---

## 1. DECISION A — exact final count/live wording (flagged for Sky's last look)

Load-bearing facts now true site-wide: **six projects built/shown · FIVE live · Mutual Mesh built but NOT live.**

| Where | File | Final wording |
|---|---|---|
| Hero subhead | `app/page.tsx:88` | "Built in public. Documented from the first commit. **Six projects built, five live on the open internet.**" |
| Showcase eyebrow | `app/page.tsx:111` | "Live" → **"Shipped"** (live-dot icon kept) |
| Showcase heading | `app/page.tsx:115` | "Built, shipped, and open. ~~Everything here is live.~~" → **"Built, shipped, and open."** |
| Footer "About" | `components/Footer.tsx:136` | "…Built in public, **five of six live on the open internet.**" |
| Mutual Mesh demo link (data) | `content/deliverables.json` | label `"Live demo"` → **`"Demo"`** (Mesh entry only) |
| Card demo link (render) | `components/ProjectCard.tsx:153,156` | now derived from the label: live products keep **"Live" / "Open live demo for …"**; Mutual Mesh reads **"Demo" / "Open demo for Mutual Mesh"** |

Reviewed and deliberately kept (not false-live claims): `app/page.tsx:118` "Real products on the open internet. Each one accessible by design." (the strip is no longer headlined "Live", and Mesh's demo IS reachable on the open internet); `/work` header "The Work — 6 deliverables" (true — six shown). The 5 genuinely-live products keep their "Live" labels.

**Why this wording, not a bare "Five products live":** the hero distinguishes *built* (six) from *live* (five); the footer states the exact split (five of six); Mutual Mesh's own card art/body already say "Demo — sample data" / "a working proof of concept". Nowhere is six-live claimed; nowhere is Mutual Mesh called live.

## 2. DECISION B — card reorder, confirmed across BOTH render locations

New order everywhere the project list renders: **AccessMap (featured #1) → Claude Corp #2 → Dashboard #3 → Prompt Library #4 → Ghost Code #5 → Mutual Mesh #6.**

Single source of truth: `content/deliverables.json` → `getDeliverables()` (`lib/content.ts:43`, stable sort by year; all six are `year: 2026`, so array order = display order). Implemented as a pure block move (swap the `claude-corp` and `dashboard` objects). The homepage "THE WORK" grid (`app/page.tsx`) and the `/work` index (`WorkFilterGrid`) both consume that one function, so they cannot disagree.

Verified rendered order in the built export (document order of `/work/<slug>/` hrefs) — **identical on both pages:** `accessmap, claude-corp, dashboard, prompt-library, ghost-code, mutual-mesh`.

## 3. GRID INTEGRITY (Hard Rule 4) — measured, both render locations

The bookend is position-based (`lone = i === rest.length-1 && rest.length % 2 === 1`). Non-featured count stays **5 (odd)** and Mutual Mesh stays last → **Mutual Mesh remains the full-width bookend**; the reorder moved no other card into that slot. Measured live (desktop 1440, `getBoundingClientRect`):

- **Home grid:** AccessMap 100% (featured) · Claude Corp 49% · Dashboard 49% · Prompt Library 49% · Ghost Code 49% · **Mutual Mesh 100% (full-width bookend)** — four half-cards = two clean rows, then the bookend closes it. No dangling cell.
- **/work grid:** AccessMap featured on top; non-featured grid of 5 with **Mutual Mesh centered bookend** (47% width, equal 290px gaps left/right). No dangling cell.

Rendered cleanly in **light and dark** (screenshots: `/work` header "THE WORK — 6 DELIVERABLES", featured AccessMap, single `tools` filter, both themes). Grid layout is theme-independent (col-span CSS); mobile (390) is single-column (`grid-cols-1`, no bookend), so order stacks with no rhythm risk.

## 4. GATES — green on branch AND on merged main

| Gate | Command | Branch (`8778942`) | Merged main (`80e512f`, pre-push) |
|---|---|---|---|
| Lint | `npm run lint` | ✓ 0 errors / 0 warnings | ✓ 0 / 0 |
| Typecheck | `npm run typecheck` | ✓ 0 | ✓ 0 |
| Tests | `npm test` | ✓ 184 passed (1 skip, 1 todo) | ✓ 184 passed |
| Build | `npm run build` | ✓ clean static export | ✓ clean |
| Static-integrity | `npm run test:static` | ✓ 4 passed (1 skip) | ✓ 4 passed |

Post-merge gates were run on the merged main commit **before** pushing (push = instant GH Pages deploy), so a failure could never reach production. That commit is now `origin/main` unchanged.

## 5. INTRO CHECKSUM (Hard Rule 1) — confirmed unchanged

- Cinematic pathset diff `c3087ad..HEAD` over `CinematicIntro.tsx`, `components/cinematic/`, `app/tokens-phase2.css`, `lib/fonts.ts`, `public/images/cinematic/`, `cinematic-masters/` → **empty (byte-identical to main), before and after my work.**
- `CinematicIntro.tsx` git blob hash `6fafe087311f72db22604acab99c90add95e16c1` — **unchanged** across all three of my commits.
- My commits touched only four files: `app/page.tsx`, `components/Footer.tsx`, `components/ProjectCard.tsx`, `content/deliverables.json` — no cinematic file, no `globals.css`, no `HeroSettle`.
- Note on the documented baseline `4de1a4315b5cc7301071ff38967109c94704b46d`: it is a "marker-to-EOF, marker-based" hash with **no reproduction script committed in the repo**, so I treated the **empty pathset diff + unchanged blob hash** as the binding proof — strictly stronger, since it covers the whole cinematic surface rather than one file. The intro is provably untouched.

## 6. Discovered during verification (flag for Sky) — `ProjectCard` hardcoded "live"

The planned `deliverables.json` relabel (Mesh "Live demo" → "Demo") only affected the **detail page**. `ProjectCard` (the homepage cards) **ignored the link label** and hardcoded the demo link's visible text ("Live") and aria-label ("Open live demo for {title}") for every card — so the homepage Mutual Mesh card still announced "live" to sighted and screen-reader users. This would have failed the "nowhere claims Mutual Mesh is live" check.

Fix (`8778942`): derive both from the link label — `label.split(' ')[0]` for the compact text, `label.toLowerCase()` for the aria-label. The five live products are **byte-identical** ("Live" / "Open live demo for …"); only Mutual Mesh changes ("Demo" / "Open demo for Mutual Mesh"). This is the minimal, appearance-preserving completion of Sky's approved Q1 relabel at the actual render site, in scope as a copy edit (no new component, no layout change). The ProjectCard test (`/open live demo for accessmap/i`, fixture label "Live demo") still passes.

**Out of scope, intentionally NOT touched (internal docs / comments, not user-visible site copy):** `README.md:30` "5 prerendered slugs", `COWORK_PROMPT.md:9` "showing 4 projects", `app/page.tsx:23` code comment "All 4 deliverables". Flagging for future doc hygiene; out of Decision A's scope (Hard Rule 2).

## 7. VERIFY-BEFORE-DONE (the brief's three)

1. **Reduce Motion + hard-load `/work/dashboard/` → title VISIBLE.** Deterministic: zero `<h1 style="opacity:0">` in the export; the settle title animation lives only inside `@media (prefers-reduced-motion: no-preference)`, so the RM rest state is visible. Live probe with animations suppressed (≡ RM): `/work/dashboard/` h1 = "Claude Corp Dashboard", computed **opacity 1, visibility visible, no inline style.** The polish-pass headline fix held. (The preview tool can't emulate `prefers-reduced-motion` directly, so RM was simulated by suppressing the gated animation — equivalent to the RM rest state.)
2. **Copy says FIVE live; nowhere six-live; nowhere Mutual Mesh live.** Export audit: `"Every product live"` 0, `"Everything here is live"` 0, `"live demo for Mutual Mesh"` 0; hero "Six projects built, five live" present; footer "five of six" present (15 pages); Mesh link "Demo" / "Open demo for Mutual Mesh"; the 5 live products keep "Open live demo for …".
3. **Claude Corp #2 / Dashboard #3 everywhere; grid rhythm intact both themes/widths.** Confirmed §2 (order, both pages) + §3 (bookend measured, both pages; both themes; mobile single-column).

## LOCKED FLOOR — held

scripting:none `.reveal` fallback present in built CSS; reduced-motion settle gating intact; no `<h1>` inline opacity:0; `globals.css` / `HeroSettle.tsx` untouched by this release (so the pass's RAISED reduced-motion + no-JS title fixes are byte-preserved). Lint/typecheck/test/build/static all green. Intro byte-identical.

— Rory (release). Main is green and clean at `80e512f`.
