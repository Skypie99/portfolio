# Portfolio — Organic + Interactive Refinement Report

**Date:** 2026-06-03
**Branch:** `polish/portfolio-organic-2026-06-03` (stacked on `main`; **not merged** — main stays Sky's gate)
**Scope:** Everything on skypistudio.com **except** the opening interactive desert scroll scene (read-only / protected).
**Build status:** `typecheck` ✅ · `build` (static export, all routes) ✅ · `npm test` 160 passing ✅ · `test:static` ✅
**Dependencies added:** none.

---

## DECISIONS FOR SKY

### Honesty-gate verdict — *proceed, bounded* (and now: stop)
After six prior polish rounds the flagship surfaces were already excellent. The honest, non-manufactured
finding was a single theme: **the mature design system was built on the flagship surfaces but never fully
propagated to the secondary/older ones.** This round closed that gap and landed four organic signature
moves — real coherence + life, not cosmetic busywork. **The site is now at genuine diminishing returns:**
the second sweep found one missing item (since fixed) and nothing else meaningful. I recommend stopping here.

### Forks you confirmed this session
1. **Interactivity → "Add subtle magnetic CTAs too."** Delivered: living caustic, tactile work media,
   settle-on-arrival, **plus** a faint magnetic pull on the primary "Write to me." / Contact CTAs. All
   whisper-quiet, fine-pointer-only, reduced-motion-safe.
2. **Cert cards → "Full glass treatment."** Delivered: certificate cards now use the same locked
   liquid-glass material as the work cards (`CertCard`), retiring the flat blush tier.

### Judgment calls I made (safest reversible path)
- **Diagnosis correction:** the explore pass claimed `Button`/`HamburgerNav` used "Tailwind's default
  `ease-out`." Not true — `tailwind.config.ts` overrides `out` → `cubic-bezier(0.22,1,0.36,1)`, so the
  `ease-out` *class is already the site curve*, and HamburgerNav's `[0.4,0,0.2,1]` literal *is* `--ease-soft`.
  So those "easing fixes" were no-ops; I left the curves alone and didn't churn. Button's press feedback
  (`active:bg-peach-cream`) was judged adequate and left as-is.
- **Tags vs Tech pills:** both now render as `TagPill`s; the section labels ("Tech" / "Tags") carry the
  distinction. The `#` prefix was dropped (redundant under the label).
- **Gallery section colour:** the off-system `bg-wa-rose-pale` + `wa-rose-soft` border was realigned to the
  site's cream/warm-white rhythm (`bg-cream` / `border-decorative`).
- **About steps `rule-ember` dividers:** considered and **deferred** — the existing `divide-y` hairlines are
  clean and on-system; converting `divide-y` to gradient rules was fiddly for negligible gain (not
  manufacturing work).
- **404 primary button:** left non-magnetic (recovery action, not an invitation); magnetic is reserved for
  the inviting "Write to me." / Contact CTAs.

### Open item / needs you
- **Email not sent — Gmail connector needs reconnecting.** I attempted to create a draft to
  skylerhalisky@gmail.com (no "send" tool exists, and per the global rule only Morgan sends externally — a
  draft was the safe path). It failed: *"This connector requires additional permissions. The user needs to
  reconnect it with the appropriate access."* The ready-to-send email text is saved at
  `summaries/2026-06-03_Portfolio_Organic_Email.txt` — reconnect Gmail and I'll draft it, or copy-paste it.
- **No new a11y debt.** No blocking accessibility item. (Details in the Accessibility section.)
- **Git note (transparency).** Two things happened during this (long) session: (1) a **concurrent process
  committed to `main`** — `ae49d0c` / `a3c04c3` / `22444c7` (add Pac-Man Code Trainer, blurb fix, then the
  "pull Pac-Man card pending Ghost Code rebrand" legal de-risk). I did **not** make these and left them
  intact — flagging so you're aware main moved from `d98658e` → `22444c7` outside my work. (2) That process
  also left the working tree checked out on `main`, so my commit initially landed on main by mistake; I
  caught it immediately and moved it: the polish branch now holds my commit (`1b0cfcc`) and **main is reset
  back to `22444c7`** (only my commit was removed — nothing of yours/theirs touched). `git diff main..polish`
  is now exactly my work.

---

## PHASE 0 DIAGNOSIS — BEFORE → AFTER (every item closed)

### The /work/ set (priority)
| # | Item | BEFORE | AFTER |
|---|---|---|---|
| W1 | `CardField` caustic | static warm pool; cursor specular moved, the pool didn't — two lights | **Living caustic:** pool damp-tracks `--cx/--cy`, prism counter-drifts → one sun moving over the glass (every glass card) |
| W2 | Featured card entrance | `initial={false}` → the largest card had **no** entrance while small cards cascaded | lands with a weighted depth reveal (`Reveal variant="depth"`), then the grid cascades |
| W3 | Grid reveal | one `<Reveal>` over the whole block; 20px fade, no scale | per-card weighted cascade (rise + `scale(0.985)`, `gh-settle`, stagger) + a drifting `ParallaxWash` behind the grid |
| W4 | ProjectCard title hover | `hover:opacity-70` (web-1.0 dimming) | colour shift to `accent-text` |
| W5 | Card tech / detail Tags | plain mono text / `#{tag}` | `TagPill`s everywhere (shaped, tinted, hover ring) |
| W6 | CTA arrows | `duration-fast` 180ms → snapped | glide on `gh-glide` + `duration-base`; numeral + accent rule respond on hover |
| W7 | Hero + gallery images | fully static, no hover, lower fidelity than index cards; off-system gallery bg | **`TactileMedia`:** hover-scale + scroll-parallax; gallery bg realigned to warm rhythm |
| W8 | Detail meta + links | links appeared with no choreography | per-link staggered reveal + arrow drift (meta `dl` judged fine, left) |

### Other in-scope pages
| # | Item | BEFORE | AFTER |
|---|---|---|---|
| P1 | Every route `<h1>` | only `/work/[slug]` settled; the rest popped in | `SettleHeading` carve-in on **all** (work, certs, about, contact, 404, blog index + post) |
| P2 | certs + 404 headings | the only two without `.ember` | `.ember` added → all page headers consistent |
| P3 | Certificate cards | flat `bg-blush` rectangles, dead `work-card` class, 2px lift | **full liquid-glass `CertCard`** + per-issuer caustic + cursor specular + 7px lift |
| P4 | About work-list rows | hover landed only on a 4px arrow | whole-row lean (`hover:translate-x-0.5`) + colour |
| P5 | Contact socials + back-link | hover only on the precise handle; a full `py-24` section for one link | whole-row hover; back-link section tightened to `py-16 lg:py-20` |
| P6 | 404 | zero entrance animation | `SettleHeading` + `Reveal` body/actions entrance |

### Components / global
| # | Item | BEFORE | AFTER |
|---|---|---|---|
| C1 | Button easing | (mis-diagnosed) | already the site curve — left as-is; magnetic added to CTAs |
| C2 | HamburgerNav | solid `bg-cream` overlay; `[0.4,0,0.2,1]` flagged | easing is `--ease-soft` (kept); overlay now `bg-cream/92 backdrop-blur-2xl` (frosted, still AA) |
| C3 | TagPill | dead `transition-colors`, no hover target | faint inset hover ring (tint-agnostic, no CLS) |
| C4 | primary CTAs | no magnetic response | subtle `useMagnetic` pull (±6px, 0.2) on "Write to me." + Contact |
| C5 | `.work-card` | empty dead CSS class | removed |
| C6 | NumberedStep | one-off `max-w-[540px]` | tokenized to `max-w-measure` |

---

## Signature moves & their effect

1. **"One sun" — living caustic.** `useSpotlight` now publishes a *lagged* caustic position (`--cx/--cy`,
   eased in a self-terminating rAF lerp). `CardField`'s warm pool (`.cf-caustic`) trails the cursor specular
   and the cool prism (`.cf-prism`) counter-drifts → the glass reads as one physical sun with internal
   parallax depth. Lands on **every** glass card (work + certs) at once. *(Verified: at bottom-right the
   caustic translates +37px toward the cursor while the prism moves −21px opposite; both return to 0 at rest.)*
2. **Tactile work evidence.** `TactileMedia` gives detail-page hero + gallery photos a hover-scale (1→1.05)
   and a gentle scroll-parallax inside an oversized clipped well — the actual evidence of the work is now
   touchable, not an inert plate.
3. **Coherent arrival.** The case-study settle gesture generalised into `SettleHeading` for every page `<h1>`;
   the work grid and cert grid breathe in per-card with the featured card landing first.
4. **Subtle magnetic CTAs.** `useMagnetic` (mirrors `useSpotlight`: rAF, fine-pointer, RM no-op) gives the
   "Write to me." / Contact buttons a faint capped pull with an eased spring-home.

---

## Extended system / new tokens & components (all on-system)
- **`lib/motion.ts`:** `useMagnetic()` added; `useSpotlight()` extended with the lagged `--cx/--cy` lerp.
- **`globals.css`** (above the protected line 1044): `.cf-caustic` / `.cf-prism` (compositor `translate3d`
  off `--cx/--cy`); dead `.work-card` removed.
- **New components:** `CardField` (now living), `TactileMedia`, `MagneticButton`, `CertCard`, `SettleHeading`.
- **Tokens:** no new colour primitives — every new colour reuses existing `--rgb-*` tokens; `NumberedStep`
  moved to `max-w-measure`. Docs updated: `UI_SYSTEM.md`, `MOTION_SYSTEM.md` §10, `CLAUDE.md` file-map fix.

## Dark-mode parity
Verified in **both** modes. Glass cert cards confirmed in light (dark-ink serif titles, AA) and dark (bone
text). The caustic/prism, magnetic, settle, and pills all use mode-flipping `--rgb-*` tokens or the locked
`.glass-card` material (which already defines a dark warm-glass variant). Frosted hamburger kept at 92%
opacity so its text holds AA over any content behind, in both modes.

## Accessibility result (AA, both modes)
- **Contrast:** no new contrast risk — reused only AA-verified tokens (`ink`, `accent-text`, TagPill hues,
  the glass card's ink-on-glass which the work cards already proved AA). Cert glass text = `ink`/`ink-meta`
  (the same tokens as glass work cards).
- **Keyboard:** unchanged. No focus mechanism altered; magnetic/caustic/parallax/hover-scale are pointer-only
  enhancements — the underlying links/buttons remain fully keyboard-operable, with Button's terracotta
  `:focus-visible` ring preserved on magnetic CTAs and `CredentialBadge`'s ring on cert cards.
- **Reduced motion:** every new motion is gated — `useSpotlight`/`useMagnetic`/`useParallax` are RM no-ops
  (caustic + magnetic hold static; parallax writes no transform), `SettleHeading` renders the final state,
  the Framer cascades check `useReducedMotion`, and `group-hover` micro-feedback snaps instantly under the
  global RM block. Touch devices (no fine pointer) get the calm static site.
- **Semantics/alt:** `TactileMedia` preserves image alt text; decorative caustic/prism/wash layers are
  `aria-hidden`.

## Performance / CLS
Transform/opacity only — no `width`/`border-width` animation (the accent divider grows via `scale-x`, not
width). The caustic lerp and magnetic are rAF-throttled, self-terminating, and reuse the existing single
shared parallax rAF. No new dependencies; First-Load JS unchanged in shape. SettleHeading mirrors the
shipped `HeroTitleSettle` SSR pattern (final state server-rendered) so there's no load-time reflow.

## What the second sweep caught
A fresh diff-level pass found exactly **one** committed item not yet landed — the work-grid `ParallaxWash`
(W3) — now added in a self-clipped layer so it never clips the cards' hover-lift/shadows. Easing/duration
usage was confirmed consistent (only site tokens: `ease-out` = the site curve, `gh-glide`, `gh-settle`); no
leftover `hover:opacity` dimming, no off-system curves, no dead imports. Nothing else meaningful remained —
consistent with the honesty-gate verdict that the site is at diminishing returns.

## Intro scene — UNTOUCHED (confirmed)
`git diff main` shows **zero** changes to `components/cinematic/**`, `CinematicIntro.tsx`, `ContentReveal.tsx`,
`public/images/cinematic/**`, `scripts/`, `tokens-phase2.css`, `layout.tsx`, or `tailwind.config.ts`. In
`globals.css`, the only hunks are the `.work-card` removal (~662) and the `.cf-caustic` insertion (~1024) —
both **above** the protected cinematic block (1044→EOF), which is byte-identical. `overflow-x: clip`,
`--sidebar-w`, `--font-cormorant`, and the `body::after` grain are unchanged.

---

## How to review

**Diff:**
```
git diff main..polish/portfolio-organic-2026-06-03
```
(23 files changed, +356/−219, plus 3 new components: `CertCard`, `MagneticButton`, `TactileMedia`.)

**Live checklist — please view in BOTH light + dark, mobile + desktop:**
- `/work/` — grid cascade; hover a card and watch the warm caustic *trail* your cursor (the highlight leads,
  the pool follows); tech as tinted pills; featured card reveals first.
- A `/work/[slug]` (e.g. `/work/accessmap/`) — hover the hero/gallery images (lean-in + scroll-drift); Tech
  **and** Tags are pills; links stagger in; title settles.
- `/certificates/` — cards now read as liquid glass (matching work cards), badges lit, ember heading.
- `/about/`, `/contact/`, a `/blog/` post, and any 404 — every heading settles + carries `.ember`; Contact
  socials/back-link feel tactile.
- **Magnetic:** hover the "Write to me." (work-detail / about) and the Contact button — gentle pull + spring-home.
- **Keyboard:** tab through — focus rings visible, order logical, skip link works.
- **Reduced motion:** enable "Reduce motion" and re-walk — caustic/magnetic/parallax go static, headings show
  final state, the site stays calm and fully readable.
- **Intro scene:** load `/` and scroll the full desert scene — it must look/behave exactly as before.

**Note on my own preview checks:** the headless preview harness throttles `requestAnimationFrame` in a
backgrounded tab, so Framer-driven reveals *froze mid-animation* in my screenshots (not a production issue —
they complete normally in a real focused browser). I verified those paths via the DOM/computed styles and the
passing build/tests; your live review is the real confirmation of the animated feel.

---

## Files
- Report: `summaries/2026-06-03_Portfolio_Organic_Report.md` (this file)
- Plan: `~/.claude/plans/goal-a-further-refinement-shimmying-cosmos.md`
