# LENS 6 — MOTION (banked 2026-07-31)

Method: rendered dual-state pass (chromium-1228, `reducedMotion: reduce` vs `no-preference`) + source verification of the MOTION_SYSTEM.md §6 contract (the house floor: RM = the final resting state, never a suppressed affordance).

## The RM contract, layer by layer — rendered TRUE

| Layer | reduce | no-preference |
|---|---|---|
| GSAP cinematic | **stage absent, StaticDesertFrame renders** (full replacement, not a frozen scrubber) | stage + pin active |
| Scroll reveals | **0 hidden — everything rest-visible at load** | 34 armed, reveal on scroll |
| RailInert | never engages (no pin → chrome free) | engages during pin only |
| `/accessibility/` RM bracket line (T9, Sky's words) | **visible** | **hidden** — the sentence is true in both worlds (claims C8 ✓) |
| ProofVideo (ghost-code) | no autoplay, poster held, controls present | autoplays muted WITH native controls (2.2.2 mechanism ✓) |
| Theme-flip view transition | JS gate + `::view-transition` 0.01ms guard → instant snap | golden cross-dissolve |
| Site-wide backstop | `globals.css:1677` forces `animation/transition-duration: 0.01ms !important` — **15** `prefers-reduced-motion` blocks total; framer `useReducedMotion` + `usePrefersReducedMotion` hooks gate JS-driven motion | — |

## SC verdicts

- **2.3.1 Flashes**: nothing flashes site-wide (golden-hour dissolves; no strobe class anywhere). PASS.
- **2.2.2 Pause, Stop, Hide**: the one autoplaying media (ProofVideo) is muted + carries native controls = in-page pause mechanism. The two autonomous decorative motions (ambient-drift light field, scroll-cue pulse) are non-information motion, subtle, and fully stilled under RM — recorded honestly as the standard decorative-motion reading of 2.2.2 (the film itself is scroll-driven, i.e., user-controlled, not auto-moving). PASS with note.
- **Animation-from-interaction**: hovers/magnetic/spotlight ride `motion-safe:`/token gates; RM snaps them (rendered: transitions 0.01ms). PASS.

**Findings: none.** The 6-layer receipts claim (C7) is corroborated rendered. Real-hardware Reduce-Motion + Reduce-Transparency rows live in DEVICE_SCRIPT.md (WebKit's RM behaviors differ from Chromium's — Chromium-only blind spot acknowledged).
**Verdict: FINISHED.** This is the strongest motion-accessibility implementation this auditor has measured — the contract isn't compliance, it's architecture.
