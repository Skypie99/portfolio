> **SHIPPED 2fc4f8b — merged + live as of 2026-06-19.** This report's "QUEUED FOR SKY" status and the "SH monogram placeholder" headshot below are stale: the real headshot photo shipped (commit `2fc4f8b`) and the attribution branch is merged + live at https://skypistudio.com. Body unchanged for the record.

# Attribution Pass — Portfolio (the hub)

**Date:** 2026-06-18
**Branch:** `attribution/portfolio-hero-2026-06-18` (commit `579a1ab`, off `main` 66bf844)
**Status:** ✅ Built + verified · **QUEUED FOR SKY** (public claim in Sky's name → Sky-only merge)
**Surface:** skypistudio.com — the hub every spoke points home to.

---

## Why
Morgan's master review (`~/ClaudeCorp/qa-reports/2026-06-18_Morgan_Footing_Master_Review.md`) found the portfolio reads as *excellent but anonymous*: SEO meta already carries Sky's name, but **nothing above the fold tells a recruiter whose work this is or what she does.** This adds a tasteful, employer-safe identity block to the hero and fixes two hub→spoke links that pointed at non-canonical URLs.

## What changed (3 files + 1 asset)
1. **`components/Hero.tsx`** — new **optional** props (`name`, `positioning`, `avatarSrc`, `avatarAlt`) render a nameplate **above the eyebrow**: round headshot + "Sky Halisky" (serif, `text-step-2`) + soft positioning line (sans, `text-body-sm`, charcoal). Optional props = the existing Hero smoke test (which omits them) stays green.
2. **`app/page.tsx`** — passes the nameplate copy to `<Hero>`.
3. **`content/deliverables.json`** — corrected two `type:"demo"` URLs to canonical custom subdomains:
   - AccessMap: `access-map-tau.vercel.app` → **`accessmap.skypistudio.com`**
   - Claude Corp: `skypie99.github.io/Claude_Corp/` → **`claudecorp.skypistudio.com`**
4. **`public/images/headshot.jpg`** — placeholder monogram ("SH", on-brand cream/terracotta, 512×512).

### Exact public wording added (for Sky's sign-off)
- Name: **Sky Halisky**
- Positioning: **"Building accessible, AI-native product. Open to thoughtful product collaborations."** (soft / employer-safe per Sky's 2026-06-18 decision)

## Constraints honored
- **Intro lock untouched** — `CinematicIntro.tsx` / `components/cinematic/**` not modified; nameplate lives in the post-cinematic `Hero`.
- **Reduced-motion safe** — nameplate uses `.hero-enter`, which snaps to final state under `prefers-reduced-motion` (globals.css gate).
- **AA + a11y** — `jsx-a11y/recommended` satisfied (img has `alt="Sky Halisky"`); name/positioning use existing AA-passing ink tokens; raw `<img>` suppresses `@next/next/no-img-element` like the rest of the repo.
- **Static-export safe** — no basePath (custom apex domain); root-relative image path resolves correctly; `validate-assets.mjs` does not gate arbitrary imgs.

## Verification (built output)
- `npm run typecheck` — clean
- `npm run lint` — ✔ no warnings/errors (only pre-existing config notices)
- `npm test` — **285 passed** / 1 skipped (Hero's 3 included)
- `npm run build` — static export OK; `out/index.html` contains:
  - `<img src="/images/headshot.jpg" alt="Sky Halisky" …>`
  - `<p class="font-serif … text-step-2 …">Sky Halisky</p>`
  - "…AI-native product. Open to thoughtful product collaborations."
  - `accessmap.skypistudio.com` + `claudecorp.skypistudio.com` present; **old URLs: 0 occurrences**

## DECISIONS FOR SKY
1. **Approve the hero wording** (name + soft positioning line) — it's your name on the hub.
2. **Headshot:** drop your photo at `public/images/headshot.jpg` (same filename → zero code change). Until then the on-brand "SH" monogram is a graceful fallback.
3. **Merge** `attribution/portfolio-hero-2026-06-18` to `main` (Sky-only; not pushed). Confirm on desktop + iPhone Safari first if you want.
