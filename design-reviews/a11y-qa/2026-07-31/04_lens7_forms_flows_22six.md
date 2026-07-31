# LENS 7 — FORMS + FLOWS + THE 2.2-SIX (banked 2026-07-31)

Method: measured sweep of **683 rendered targets** across 11 routes × {1280, 375} in the sanctioned engine (scratchpad `targets.json`), spec-precise SC 2.5.8 evaluation (24px hard floor · spacing-exception circle geometry · inline exception), plus architecture checks for the form/flow criteria.

## The 2.2-six, each by number (the 2.2 trap disarmed)

| SC | Verdict | Evidence |
|---|---|---|
| **2.4.11 Focus Not Obscured (Min.)** | **PASS** — walked in Lens 3 (RailInert during the pin; dialog focus-belt; no sticky chrome that can bury focus) | rendered |
| **2.5.7 Dragging Movements** | **N/A-verified** — zero drag/pointer-down/touch-start handlers in the codebase (grep-proven); galleries are composed links, parallax is scroll-driven | programmatic |
| **2.5.8 Target Size (Min.)** | **PASS — 0 hard failures in 683 measurements.** Every under-24px target (426 measurements: showcase chip door-links 99–130×21, card action rows 54–126×23, footer/social links) passes via the **spacing exception, geometrically verified** (24px circles intersect nothing); **zero targets lean on the weaker inline exception** | rendered (measured) |
| **3.2.6 Consistent Help** | **PASS** — the contact mechanism repeats in the same locations on every route: `contentinfo` footer (email + socials) on all 17 pages + rail "Write to me." pinned bottom + menu "Let's talk" | programmatic |
| **3.3.7 Redundant Entry** | **N/A-verified** — no multi-step flows exist; the only "flow" is mailto handoff | programmatic |
| **3.3.8 Accessible Authentication (Min.)** | **N/A-verified** — no auth anywhere | programmatic |

## Forms criteria

No `<form>`, `<input>`, `<textarea>`, or `<select>` exists on any route (grep + extraction). Contact is a runtime-assembled mailto with a noscript socials fallback. → 3.3.1 / 3.3.2 / 3.3.3 / 1.3.5 all **N/A-by-architecture**; nothing to mislabel, no errors to identify, nothing to autocomplete. 2.5.2 Pointer Cancellation: **PASS** — all activation is default click-up semantics (no down-event handlers).

## The house 44 floor (aspirational band census — honest tiering, not manufactured violations)

Primary controls all clear 44: hero CTA 191×56 · rail "Write to me." pill · theme toggle 44×44 · hamburger 44×44 · dialog close 44×44 · skip chip 210×45. The 24–43 band is populated by secondary text links, tiered per the calibrated law (desktop fine-pointer context — none are SC failures):

- **F7-1 · LOW (house-band) · showcase chip door-links** (`app/page.tsx` L3-09 chips): 21px tall at both widths. Spacing-saved with room; a py bump to ≥24 (ideally 44 mobile) would be pure gain. **Adjacent to the "44PT TARGETS" tag rendered on the same grid** — see the claims lens for the wording question. Evidence: rendered.
- **F7-2 · LOW (house-band) · PROVISIONAL/IN-FLIGHT · card action rows** (`components/ProjectCard.tsx` L5-07): 23px boxes, deliberate wrap-pitch design, spacing-verified at 375 too. **In-flight surface (project card samples)** — any change queues AWAITING-LANDING; Phase B must not touch until Sky lands her card work. Evidence: rendered.
- **F7-3 · LOW (house-band) · misc secondaries**: work-page GitHub link 28px · about LinkedIn row 24px · breadcrumb/back links 24–29px · certificate Verify links 112×33 · scroll cue 48×37. All ≥24 with clear spacing. Batch-liftable in Phase B via link paddings without layout shift (the L5-07 negative-margin trick is already the house grammar for exactly this). Evidence: rendered.

**Verdict: FINISHED.** The 2.2-six: three engineered PASSes, three verified-N/A. Zero Blockers, zero High. Three Low house-band items (one PROVISIONAL).
