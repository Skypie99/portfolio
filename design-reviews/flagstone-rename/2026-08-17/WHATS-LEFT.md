# FLAGSTONE RENAME — WHAT'S DONE, WHAT'S LEFT
**2026-08-17 · everything below was verified on production, not assumed.**

## ✅ Shipped and live

| | Where | Proof |
|---|---|---|
| Portfolio rename (copy + URLs + screenshots) | `main = 092f8ec`, live | `/work/flagstone/` **200** · `/blog/building-flagstone/` **200** · homepage 37×Flagstone |
| Old URLs still resolve | live | `/work/accessmap/` and `/blog/building-accessmap/` both **200**, meta-refresh to the new URLs |
| Re-captured drawer (still + clip) | live CDN | both **200**; wordmark reads Flagstone in the still *and* the clip poster |
| Test-count truth pass | live | chip **2,900+**, receipt **2,971 · measured 2026-08-16** |
| Share-link fix | AccessMap `main = f03bfaa`, pushed | share footer now leads with an https URL; 2,972 tests pass |
| Mutual Mesh flaky test | **PR #39 open** | https://github.com/Skypie99/mutual-mesh/pull/39 — main is protected, so it needs your review + merge |

## 🔴 Yours — needs your accounts (I can't)

**1. The demo domain.** Full runbook: `~/AccessMap/design-reviews/demo-domain/2026-08-17/DOMAIN-MOVE.md`
- Vercel → the project → Settings → Domains → add `flagstone.skypistudio.com`
- Add the DNS record Vercel shows you
- **Do NOT remove `accessmap.skypistudio.com`** — Supabase auth redirects and the `accessmap://` scheme are pinned to it. Additive only.
- Supabase → Auth → URL Configuration → **add** the new origin (never replace)
- Then tell me, and I flip two one-line constants: `WEB_ORIGIN` in `~/AccessMap/src/lib/shareFlag.ts`, and the `Live map` href in `~/Portfolio/content/deliverables.json`

**2. Merge PR #39** (Mutual Mesh) once its checks pass.

## 🟡 Optional — say the word and I'll do it

| | Why it's optional |
|---|---|
| **Re-capture the other showcase scenes** | Only the drawer was re-shot. `map-overview`, `tasks`, `report-composed` are still from the older `5ab3f0c` build, so the case study mixes two builds. Coherent today — and you gate-picked that map-overview on 2026-07-31, which is why I didn't overwrite it. |
| **Internal docs pass** | `docs/showcase-factory.md`, `docs/COWORK_GITHUB_URLS.md` and other planning docs still say accessmap. None ship; none are in `out/`. |
| **Universal Links** (AASA + `assetlinks.json`) | Would make an https share link open the *app* on a phone instead of the web build. Real improvement, blocks nothing. |
| **`fetchpriority` → `fetchPriority`** | One console error in `components/ThemedShowcase.tsx:95`. Already flagged as a background task. |

## ⚠️ Two things to remember next time

1. **Always use `--no-edit` on merge commands.** `git merge --no-ff` opens `$EDITOR`; your `core.editor` is unset, so it blocked on `vi` and left the merge **staged but uncommitted** with `main` unmoved. That is what happened this round.
2. **Never run a showcase capture at the same time as a path migration.** The first capture wrote into `public/showcase/accessmap/` seconds after it had been `git mv`'d away — split assets, double-named manifest. And a capture only produces the *current* branding if `registry.mjs` is pinned to a post-rename SHA (now `main @ 8cdd643`).

## Frozen on purpose — not misses

`https://github.com/Skypie99/AccessMap` (repo kept its name) · `https://accessmap.skypistudio.com` (live host, pinned app-side) · `masters/accessmap/…` capture sources · `public/receipts/a11y-2026-07-09.json` (a dated measurement; renaming its route keys would make it claim a measurement that never happened) · the two redirect stubs, which *are* the old URLs.

---

# ADDENDUM — 2026-08-17, the optional pass

## Done and live

**Console warning cleared.** One React error fired on every page load: *"Invalid DOM property `fetchpriority`. Did you mean `fetchPriority`?"*. Two of the three call sites carried comments asserting the opposite — that lowercase was the warning-free form. That was **wrong on React 18.3.1**: 18.3 is the release that added the warning to nudge toward React 19, and lowercase is what it fires on. All three moved to camelCase, verified by loading the page and reading a clean console. The comments now say what is true, and the `as unknown as` casts are gone because React's own types accept the camelCase prop.

**Instructions that no longer worked, fixed.** The rename quietly falsified anything written against the old slug:
- `docs/showcase-factory.md` told you to run `--project accessmap` — which now matches nothing and simply fails
- `SHOW_WORK_PLAN.md` (the live image-swap guide, referenced by UI_SYSTEM and MOTION_SYSTEM) pointed every path at a directory that no longer exists
- `README.md` listed `accessmap` among the prerendered slugs, and its Branch state section still called `main` "unborn" — on the branch that now publishes on every push

Left alone on purpose: `FEATURES.md`'s `~/AccessMap/qa-reports/…` pointer and every `github.com/Skypie99/AccessMap` link — that repo kept its name.

Shipped as `b151570`.

## 🛑 The full re-capture was tried and DISCARDED — read this before anyone retries it

Re-shooting all 23 scenes at current `main` produced **worse imagery than what is shipped**, because **production currently has no flag data**:

| Scene | Shipped (good) | Re-captured (regression) |
|---|---|---|
| `map-overview` — the case-study **hero** | severity-coloured pins over downtown Kelowna | **"0 flags · No barriers reported here yet"** — the empty state |
| `tasks` | a populated barrier list with severity chips | **"All caught up"** — the empty state |

The alt text would have become false too: it promises "severity-coloured barrier pins" and "a nearest-barrier banner", neither of which appears in an empty map. So the capture was discarded and the shipped images stand.

**This validates the 2026-07-31 gate pick.** Those images date from when prod had data; they are currently irreplaceable.

**Consequence — the images and the app build are now decoupled.** Everything except the drawer was shot at the older `5ab3f0c` build. That mix is invisible today, and fixing it is blocked on data, not on code.

**Precondition for any future re-capture:** seed or restore production flag data first (this is the same blocker as the store dossier's MUST-1 junk-data cleanup). Re-capturing before that will silently replace good screenshots with empty states, and every gate will stay green while it happens — nothing in the pipeline knows an empty map is wrong.
