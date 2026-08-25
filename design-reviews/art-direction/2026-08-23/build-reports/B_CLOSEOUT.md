# Phase B — The Global Shell — CLOSE-OUT

**Branch:** `room/pB-shell` (4 commits, one per shipped item). **STOP — not merged, not pushed.**
**Date:** 2026-08-25 (single continuous session).
**Gate at close:** `npm run typecheck && npm run build && npx vitest run` — **all green.** Typecheck 0 errors. Build: compiled successfully, 26/26 static pages exported, same 6 pre-existing warnings as Phase A (the documented "headers won't work with output:export" notice). Tests: **70 files, 684 passed / 1 skipped / 1 todo** (baseline from Phase A's own close-out was 69/678/1/1 — the delta is exactly this phase's new `IntroSkip.test.tsx`, 6 tests. No other count moved).

---

## Prerequisite check (before any work)

Verified directly rather than trusted: `git log` showed `main`'s `HEAD` at `49efe18 Merge branch 'room/pA-tokens'` — Phase A is merged into local `main` (Sky merged it herself sometime after Phase A's own close-out was written; that report still said "not merged" because it was written before the merge). Gate held. Two unrelated things were sitting on `main`'s working tree at start — 21 commits unpushed to `origin/main`, and ~25 uncommitted files (old Morgan state-file edits from 2026-07-16 plus this program's own planning docs) — both pre-existing, both left exactly as found; every commit below stages only its own named files.

---

## What shipped, per item

| # | What shipped | Where | Gate at commit |
|---|---|---|---|
| **B1** | The subpage brand chip's fill measured 1.034:1 (light) / 1.121:1 (dark) against canvas — `.glass-card`'s translucent fill is tuned for the cinematic backdrop it usually refracts, and a fully opaque version of the *same* near-canvas tint still only reaches 1.036:1 / 1.089:1 (measured, not assumed — a near-canvas hue cannot cross a real contrast floor by opacity alone). Fix: opaque fill (stops page bleed-through washing out the existing drop shadow) + the existing warm hairline raised from a 12%/10% whisper to 0.85/0.5 alpha, measuring **3.34:1 / 4.15:1** against canvas — clears the 3:1 non-text UI floor. Scoped to `.runway-identity--page` only; the homepage's glass-over-film chip is untouched. No new colour. | `app/globals.css` | typecheck + build + 678/1/1 (unchanged) |
| **B4** | The pinned cinematic holds ~3.8 viewport-heights before identity appears; the sr-only SkipLink already covers keyboard, but pointer/touch visitors had no visible way past it. New `IntroSkip` component: a real link (`href="#hero"`, visible "Skip intro ↓" text, the site's focus-visible ring, 44px target), mounted as a fixed sibling in `app/page.tsx` beside `RunwayIdentity`/`IntroScrollCue` — never touching `components/cinematic/**`. Verified `ViewTransitions.tsx` already special-cases same-page hash clicks to native fragment-scroll, so no interception handling was needed — confirmed live (click → `hash:"#hero"`, `scrollY:2436`). Retirement mirrors `IntroScrollCue`'s own IntersectionObserver contract exactly (same top-open + strict-intersection guards) — confirmed live (`data-skip-done` sets, opacity animates to 0, `visibility:hidden`). Own test file (6 tests), matching the codebase's per-component convention. | `components/IntroSkip.tsx`, `components/__tests__/IntroSkip.test.tsx`, `app/page.tsx` | typecheck + build + 684/1/1 |
| **B5** | `/accessibility/` and `/colophon/` were reachable only by scrolling to the footer — ratified in THE ROOM's Decision Record (G1.3) as pages that should be promoted. Neither the persistent desktop rail nor the mobile menu carried a direct link to either. Added both to `HamburgerNav`'s `NAV_ITEMS` (grouped with Notes, its own standalone-page neighbour, ahead of the closing CTA) and moved them up in Footer's Site column from last-of-8 to immediately after Notes. `lib/sectionNav.ts`'s per-route "On this page" index is a different mechanism (in-page sections, not site-level nav) and does not participate — confirmed by inspection, left untouched, so `section-nav-anchors.test.ts` needed no migration. Verified live against the **built** export: the menu renders all 8 items in order, auto-renumbered 01–08, both new hrefs resolve to real built routes (`○ /accessibility`, `○ /colophon` both present in the build's route table). | `components/HamburgerNav.tsx`, `components/Footer.tsx` | typecheck + build + 684/1/1 |
| **B3 (wave-1, wordmark)** | The rail wordmark's `.link-draw` underline drew across the full 183px content column rather than under its own text — measured, not assumed: the Link's rendered box was 183px, "Sky Halisky"'s actual text 113.74px, `align-self: auto` inheriting the flex parent's default `stretch` (nothing to do with the `inline-block` already on the element — flex-item sizing overrides the box's own display value). `self-start` is the identical fix already shipped for the same condition on Footer's LinkedIn link (`Footer.tsx`, `self-start` on the "Full history on LinkedIn" link). Verified live: link box now measures exactly 113.7421875px, matching the text. The underline *mechanism* (`.link-draw` itself) is untouched — only the link's own box sizing changed. | `components/Sidebar.tsx` | typecheck + Sidebar 7/7 |

**Not a decision — a bug, fixed without asking:** the brief filed "the `Sidebar.tsx:57` wordmark overhang" alongside two genuine taste questions in the "wave-1 banked trio," but on inspection it has zero ambiguity: a measured CSS box-sizing defect with an established, already-proven fix pattern in the same file tree. Fixing it as B1/B4/B5 were fixed (directly, on its own commit) rather than surfacing it as a fourth 🔴 would have manufactured a decision where none exists; surfacing it here instead, for the record.

---

## PROTECT-list proof (mechanical, not asserted)

```
git diff main --stat -- components/cinematic/                                    → empty
git diff main --stat -- app/archive/ components/archive/ lib/archive/ supabase/   → empty
git diff main --stat -- scripts/capture-showcase.mjs scripts/showcase/ \
                         content/showcase.manifest.json                            → empty
git diff main -- content/deliverables.json                                        → empty
git diff main -- app/accessibility/page.tsx                                       → empty
git diff main..HEAD --stat                                                        → 7 files
  (app/globals.css, app/page.tsx, components/Footer.tsx, components/HamburgerNav.tsx,
   components/IntroSkip.tsx, components/Sidebar.tsx, components/__tests__/IntroSkip.test.tsx)
```

The three pre-existing dirty files on `main`'s working tree (`.claude/launch.json`, `DECISIONS_LOG.md`, `PROJECT_STATE.md`) appear in a bare `git diff main --stat` (working tree vs `main`) but **not once** in `git diff main..HEAD` (this branch's actual commits) — confirmed they were never staged by anything in this phase. `44px` floor, hamburger focus trap, skip-link-first position: none of B1/B4/B5/B3 touch a single byte of `HamburgerNav.tsx`'s open/close logic, `SkipLink.tsx`, or `IntroScrollCue.tsx` — verified by the diff stat above (SkipLink and IntroScrollCue don't even appear; HamburgerNav's diff is additive-only, the 6 new `NAV_ITEMS` lines).

---

## Guard-migration ledger

| Guard | Touched? | Outcome |
|---|---|---|
| `Sidebar.test.tsx` (`link-draw`, `rail-nav`, `rail-trim`, `'Solo builder'`) | Yes — B3 added `self-start` to the wordmark's className | **No migration needed.** `link-draw` stays; 7/7 green unchanged. |
| `HamburgerNav.test.tsx` (`w-[13.5px]`/`h-[1.25px]` glyph geometry) | No — B5 only appended to `NAV_ITEMS`, never touched the trigger glyph | Unaffected, confirmed green in the full suite run. |
| `SkipLink.test.tsx` (`sr-only`, `href="#main"`) | No — B4 built an entirely separate component | Unaffected. |
| `IntroScrollCue.test.tsx` (pins the string `'Scroll'`, retirement geometry) | No — `IntroSkip` mirrors the *pattern*, shares no code | Unaffected. |
| `lib/__tests__/section-nav-anchors.test.ts` | No — B5 doesn't touch `lib/sectionNav.ts`'s `ROUTE_SECTIONS` | Unaffected — confirmed by inspection before writing B5, not assumed. |

No guard was deleted or bulk-migrated. One new guard added: `components/__tests__/IntroSkip.test.tsx` (6 tests), matching the codebase's per-component test convention — `RunwayIdentity.tsx` was noted to have **no** test file at all (a pre-existing gap, not this phase's to fix, flagged here since it's directly adjacent to B1's own change).

---

## Verification (against the **built** `out/`, per SE-2)

Served `out/` on a throwaway static server (not the dev server) and walked it at 375/1440, both themes:

- **Keyboard trace:** fresh load → first Tab lands on "Skip to main content" (`href="#main"`), visible 2px solid terracotta outline. Second Tab lands on the hamburger trigger (mobile), same visible ring. Opening the menu auto-focuses "01 Home" inside a visible focus rectangle. Escape returns focus to the trigger (confirmed via `document.activeElement`).
- **Promoted nav links resolve:** read the built menu DOM directly — all 8 items render in order (`01 Home` … `06 Accessibility` … `07 Colophon` … `08 Let's talk`), both new hrefs point at routes present in the build's own route table (no 404s).
- **B1's chip, in the built export:** re-verified visually on `/about/` at 375 — same solid, clearly-bordered chip as the dev-server check, both themes.
- **Reduced-motion:** this session's browser tool has no reduced-motion emulation control, so the walk was done by *code inspection* against house convention rather than live toggling — recorded honestly rather than skipped silently. Every animated/transform-based retirement in this codebase (`.runway-identity`, `.intro-scroll-cue`) declares its exit `transition` unconditionally, not gated behind `prefers-reduced-motion: no-preference` — only large-scale motion (parallax, `.reveal` entrances, view-transitions) gets that gate. `IntroSkip`'s own retirement transition is `opacity/color/border-color` only (no `transform`), strictly more conservative than `RunwayIdentity`'s own precedent (which includes a small `translateY`). Consistent with the pattern; not independently reproduced on-device.
- **Untouched-route diff:** no capture-diff pipeline exists for this shell (the one `CAPTURE_CHECKLIST.md` on disk is Flagstone's device-photo checklist, a different thing entirely) — rather than assert a pixel-diff that wasn't run, this is a spot-check: `/work/`, `/certificates/`, `/contact/` visually inspected during the B6 before/after passes below, nothing unexpected. The 684-test suite (unchanged outside additions) is the actual regression signal here.

---

## 🔴 Still open — five decisions, none shipped

Per the standing rule (surface clearly, always recommend, never bury): B2 was investigated exhaustively by two prior ui-polish/luxe-audit passes and is presented with a recommendation. B3's icon and B6's three forks were built as real before/after pairs (screenshots taken live, in-browser, both themes) rather than described in the abstract, then **reverted to the shipped state** — B6's brief is explicit ("nothing until Sky picks"), and B3's icon is the one exception left *applied but uncommitted* in `components/ThemeToggle.tsx`, since the brief's own worked example leans "draw it" and the change has no existing test to break.

### B2 — UP-36 + UP-26, the link-colour family

> **What:** the Notes rail link ("Read the notes →") uses the cool/teal family (`text-cool-deep`); every other mono `tracking-label` micro-CTA on the site (48 of 49, including its own rail-mate 30px above) uses the accent family. The homepage outro ("The full account →") renders near-black at rest, which *looks* like the odd one out next to its siblings but is the documented `.link-draw` contract (Dani §5.1.5), not drift — the "muted" reading in two prior audits was an anti-aliasing artifact on 12px mono glyphs (computed colour is exactly ink).
> **Recommendation:** (a) for UP-36 — one class, `text-cool-deep` → `text-accent-text` on `SidebarRailLinks.tsx:54`. Measured safe: 6.11:1 light / 8.99:1 dark, both clear of AA. (b) for UP-26 — leave it. The contract is real and correctly implemented; "fixing" it would mean un-fixing something that was never broken.
> **Why:** UP-36 is a grammar miss from a ratified sweep (`6e0f54f`) that normalised eyebrows to accent-ink but only listed `app/*.tsx`, missing this one file. UP-26 has already been investigated twice (ui-polish P4, luxe-audit wave1) and refuted twice; a third pass would not find a different answer.
> **Alternative:** leave UP-36 as shipped (the teal reads as a deliberate secondary voice, not obviously wrong, just inconsistent) · nudge the underlying `--rgb-cool-deep` token instead (refused by both prior audits — it also inks every TagPill, whose worst chip is already only 0.39 over the AA floor).
> **Impact:** one class in one file for UP-36; zero code for UP-26.
> **Your choice:** [Accept both recommendations] [Keep UP-36 as-is too] [DEFER]

### B3 — the ThemeToggle icon

> **What:** the toggle currently uses stock Lucide-shaped sun/moon glyphs (inlined, not imported — but visually identical to the library). The alternative, now built and applied uncommitted in `components/ThemeToggle.tsx`: a sun drawn from the house's own sun language (disc + two horizon lines, the exact composition `RunwayIdentity`'s sun and the favicon already use) and an original crescent-moon partner (no house moon exists yet — this would be the first one) sharing the same two horizon lines, so the pair reads as one object across day and night.
> **Recommendation:** draw it. Screenshots taken live at real 18px size, both themes, in the actual sidebar button: both read cleanly and legibly at production size.
> **Why:** it is the last borrowed shape in a shell that otherwise draws its own — the hamburger's "Horizon" glyph (LUXE-4) already proved the language works at icon scale.
> **Alternative:** keep Lucide — zero risk, but the shell keeps one generic, off-language icon. No existing test covers `ThemeToggle` at all, so neither choice touches a guard.
> **Impact:** one file, both themes, no behaviour change — `currentColor` is preserved so it keeps theming with the button's ink token exactly as before.
> **Your choice:** [DRAW IT (already applied, uncommitted)] [KEEP LUCIDE (revert)] [DEFER]

### B6a — UP-11-SET, the footer ELSEWHERE column

> **What:** GitHub currently renders terracotta at rest (a comment calls this "elevated brand presence"); email and LinkedIn render ink at rest. Built and screenshotted both ways.
> **Recommendation:** (b) — ink at rest for all three, accent on hover (the fix is deleting GitHub's special case entirely; email/LinkedIn already use this exact rule).
> **Why:** three same-column links, three different rest treatments for no stated functional reason beyond a "brand presence" note that reads more like an unexamined default than a considered hierarchy.
> **Alternative:** (a) leave as shipped · (c) promote all three to accent-at-rest (untried — no prior audit costed this one, and it would makes the column louder, not quieter, which cuts against the site's own "everything quiet answers when touched" grammar).
> **Impact:** one file, one column, both themes. Screenshots taken live (before: GitHub terracotta / after: all three ink).
> **Your choice:** [Unify to ink-at-rest] [Keep GitHub accent] [All-accent] [DEFER]

### B6b — UP-46-COLOPHON, pill vs. quiet mono

> **What:** `/accessibility`'s "Get in touch" is a house pill (its page's primary action); `/colophon`'s structural-twin closer, "Read the accessibility statement," stays a quiet mono link with an arrow. Built and screenshotted both ways.
> **Recommendation:** (a) — leave as shipped.
> **Why:** this is the one fork in the trio that already has a real, considered rule behind it, recorded in-file: pill marks a page's *primary action* (`/about`, `/contact`, the rail's own write-CTA all follow this), quiet mono marks *navigation*. Colophon's link is navigation — a pointer to a sibling document, not a conversion moment. Promoting it to a pill (option b, also built and screenshotted — it looks clean, matching accessibility's own treatment) would blur that distinction for a page that doesn't have a primary action to elevate.
> **Alternative:** (b) promote colophon's link to a pill too (built — drops the `→`, since no internal-route pill in the estate carries one) · (c) revert UP-46 and de-pill accessibility (not built — would undo a shipped, gate-verified change to solve a consequence, not a defect).
> **Impact:** if (b): one file, one link, loses its arrow, gains the `Button` import.
> **Your choice:** [Leave as shipped] [Promote colophon's link too] [DEFER]

### B6c — UP-42-STEP, the colophon specimen size

> **What:** the "LABELS & METADATA" mono specimen (the third of three "type, set live" rows) renders at 12px, close enough to its own 11px caption below it that two prior audits flagged it as looking like a paste error. Built and screenshotted at `text-display-s` (19px) too.
> **Recommendation:** (a) — leave as shipped.
> **Why:** two things block the larger size, both measured rather than assumed: DM Mono's own working-size convention across the *entire* site is 11–12px (180 of 182 call sites), and — the harder constraint — the page's own prose one section above this specimen says, in Sky's words, DM Mono "handles the **small** uppercase labels." At 19px the specimen would out-size the 17px body row above it and invert the page's own descending 39/17/12 hierarchy while directly contradicting a sentence on the same page.
> **Alternative:** (b) `text-display-s` (built, screenshotted — reads well in isolation, contradicts the copy in context) · (c) take (b) and reword the sentence (the sentence is Sky's words, not this phase's to rewrite).
> **Impact:** if (b) alone: one class, one file, page now disagrees with its own prose.
> **Your choice:** [Leave as shipped] [Take the bigger size, contradiction and all] [Take it + I'll reword the sentence myself] [DEFER]

---

## Found that the brief didn't predict

1. **The line-number citation had drifted.** "`Sidebar.tsx:57`" pointed at a comment, not code — Phase A's 18 commits shifted every line number in files it touched. Re-derived the actual defect from the *description* ("missing-`self-start` condition... draws the full 183px column") and measured it directly (183px box vs 113.74px text) rather than trusting the stale line ref.
2. **UP-46-COLOPHON's "leave as shipped" is not the passive option it sounds like.** It's the one fork of the three that already carries real, in-file reasoning distinguishing it from a coin-flip — worth naming so "leave as shipped" doesn't read as "did nothing."
3. **This session's browser automation tool intermittently returns stale/blank screenshots when a tab isn't fronted** (a background tab from an unrelated scratch preview silently stopped compositing the main tab). Cost real time to diagnose before the tool's own error message named the cause; recorded so a future window doesn't re-walk the same dead end — front the working tab explicitly if screenshots start looking wrong for no code reason.
4. **No `RunwayIdentity.test.tsx` exists.** Noted while touching its CSS for B1 — a pre-existing gap (this component has never had a test), not introduced by this phase and not this phase's to fix, but adjacent enough to flag.

---

## Files changed

7 files, +226/−7, across 4 commits (`307672c`, `9e4655c`, `413a87a`, `28c281d`). One additional file (`components/ThemeToggle.tsx`) sits modified but **uncommitted** — the B3 icon candidate, pending the decision above. Full list: `git diff main..HEAD --stat` on this branch.
