# A11Y DEEP QA — PHASE A MASTER TABLE (2026-07-31 · target `38b94db` == live)

**Topline: 0 standing Blockers · 3 Medium · 8 Low/notes · 0 High.** The single Blocker-CLASS item is L4-1's coupling to a published claim (one 12px eyebrow at 4.17:1 in light theme vs the statement page's "every text role meets AA") — mechanically a one-surface Medium fix that restores the claim to TRUE.

Lens order run: 1 → 2 → 3 → 7 → 9 → 4 → 5 → 6 → 8 (limit-death order; all banked per-lens). Automated baseline: gates green (lint/tsc/405 tests/build) + **axe 0 violations across all 17 routes**.

| ID | Finding | SC | Tier | Surface | Evidence | Phase-B disposition |
|---|---|---|---|---|---|---|
| **L4-1** | Contact eyebrow "Let's talk" 4.17:1 (light) on cool panel + gold drift — falsifies the /accessibility/ "every text role AA" sentence until fixed | 1.4.3 | **MEDIUM (mech) / BLOCKER-class (claims)** | `app/page.tsx:538` | rendered-measured (pixel) | **FIX FIRST** — surface-scoped ink swap (candidate `text-cool-deep` ≈6.4:1 here); NEVER a global accent-ink change; re-measure BOTH themes + all accent-ink call-sites; add the coordinate to the receipts harness; guard test |
| **C9-2** | Homepage chip "1,680 tests passing" (AccessMap) — stale-undercount vs AccessMap's 2,040–2,826 today; present-tense, undated | claims-freshness | **MEDIUM** | `app/page.tsx` showcase chips | programmatic (cross-ledger) | **GATED-AWAITING-SKY** (her copy; option: refresh number and/or date it like the receipts strip) |
| **C9-3** | "44PT TARGETS" chip tag reads site-scoped; this site's secondaries measure 21–41px (SC-clean via spacing); linked statement never claims target sizes | claims-precision | **MEDIUM** | `app/page.tsx` "Born accessible" chip | rendered-measured | **GATED-AWAITING-SKY** — (a) scope tag, (b) swap tag, or (c) lift secondaries to 44 (mechanical half can be Phase B: F7-1/F7-3) |
| **F7-1** | Showcase chip door-links 21px tall (both widths) — house-44 band; SC-passes via spacing | 2.5.8 (house floor) | LOW | `app/page.tsx` L3-09 chips | rendered-measured | Phase B: py bump via the L5-07 negative-margin grammar; feeds C9-3(c) |
| **F7-2** | Card action rows 23px boxes — house-44 band; SC-passes via spacing at 375 too | 2.5.8 (house floor) | LOW · **PROVISIONAL** | `components/ProjectCard.tsx` (L5-07) | rendered-measured | **AWAITING-LANDING — IN-FLIGHT surface (project card samples). Phase B must NOT touch until Sky lands** |
| **F7-3** | Misc secondary links 24–41px (work GitHub 28 · about LinkedIn 24 · breadcrumbs 24–29 · verify 33 · cue 37) | 2.5.8 (house floor) | LOW | various | rendered-measured | Phase B: batch padding lifts, no layout shift, screenshot-diff verify |
| **C9-1** | 18 noscript-only ContactEmail GitHub/LinkedIn links lack "(opens in new tab)" (rendered site: 133/133 labeled) | 2.4.4 / claims C6 | LOW | `components/ContactEmail.tsx:80-100` | programmatic | Phase B: add the Footer's sr-only span ×2; extend new-tab guard test to noscript content |
| **L2-1** | `aria-controls="primary-menu"` dangles while dialog closed | 4.1.2 nit | LOW | `components/HamburgerNav.tsx:115` | programmatic | Phase B optional: set attr only when open |
| **L2-2** | Open-state trigger `opacity-0` stays focus-eligible in theory (rendered cycle proves unreachable; aria-modal scopes AT) | robustness | LOW (note) | `components/HamburgerNav.tsx:136` | rendered | Phase B optional: `visibility:hidden` while open (verify focus-return still works) |
| **L4-2** | Ember gradient text passes ONLY at display sizes (worst stop 3.18–3.30 vs 3.0 large floor) — no defect today; unguarded invariant | 1.4.3 guard | LOW | `globals.css` ember classes | rendered-measured | Phase B: cheap test asserting ember never renders below large-text threshold |
| **L4-3** | Footer meta 4.58:1 light — 0.08 above floor | 1.4.3 margin | NOTE | Footer surface | rendered-measured | record in token ledger + receipts coordinates; no action |
| **L8-1** | Ghost-code silent loop: text alternative rides aria-label + prose; a visible figcaption would make it first-class | 1.2.1 polish | LOW | `deliverables.json` ghost-code | programmatic | Sky words it if taken |
| **L3-1** | In-app preview pane paints blank on this page's GSAP states (CSSOM correct; real engines correct) — tooling truth, not a site defect | method | INFO | rig note | rendered | never diagnose from the pane; one Safari device row confirms the arrival beat |

## What was verified CLEAN (the part that deserves the mission sentence)

axe 0 × 17 routes · 405-test gates green · titles/lang/headings/landmarks flawless (0 skips site-wide) · ARIA-misuse hunt: 0 real hits in 54 labeled controls · dialog mechanics perfect rendered (trap/Escape/focus-return/44px) · route announcements VERIFIED-WIRED both motion settings · 2.4.11 engineered PASS (RailInert + focus-belt) · **683 targets, 0 hard 2.5.8 fails, zero reliance on the weak inline exception** · 2.5.7/3.3.7/3.3.8 verified-N/A by architecture · focus ring measured 3.68–4.02:1 light / 5.15–5.52:1 dark · glass-card text 5.0–11.2:1 both themes · 320px reflow 0 overflow ×10 routes · text-spacing + 200% zero clipping · the 6-layer RM contract rendered-TRUE on every layer · alt corpus genuinely excellent, 0 slop · claims page honesty architecture HOLDS under adversarial audit.

## Conservation pre-commitment (Phase B closes this)

Every row above must land FIXED / GATED-AWAITING-SKY / PARKED-with-reason / DEVICE-PENDING / AWAITING-LANDING. Nothing drops.
