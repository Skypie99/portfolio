# LENS 2 — SCREEN-READER SEMANTICS (banked 2026-07-31)

Method: whole-site structural extraction over all 17 exported routes (jsdom, scratchpad `semantics.json`) + source reads of every interactive component + rendered verification in the project's own capture engine (playwright-core chromium-1228 — the pane proved unreliable for this page's compositor, see §Rig note). Evidence tags per item.

## Verified clean (the crown-jewel inventory)

| Check | SC | Result | Evidence |
|---|---|---|---|
| Page titles — unique, descriptive, `X — Sky Halisky` pattern | 2.4.2 | **PASS** all 17 routes (404.html/404/ dup is the same page) | programmatic |
| `lang="en"` on html | 3.1.1 | **PASS** all routes | programmatic |
| Single `<h1>` per page; **zero heading-level skips site-wide** | 1.3.1 | **PASS** (vitest also guards Hero single-h1) | programmatic |
| Landmarks: labeled navs (`Site navigation` · `On this page` · `Breadcrumb` · `The six works, on the horizon`), single `main`, top-level `contentinfo` (C-71 held), labeled section for the desert scene | 1.3.1 | **PASS** | programmatic |
| Accessible names on all interactive elements; no unnamed SVGs; no missing img alt; no positive tabindex | 4.1.2 | **PASS** all routes | programmatic |
| **ARIA-misuse hunt**: aria-hidden on focusables → **0**; invalid/redundant roles → 0 (axe corroborates); label-in-name → all 54 aria-labels BEGIN with the visible words (arrow glyphs are aria-hidden spans) | 2.5.3 / 4.1.2 | **PASS** | programmatic |
| Hamburger dialog: `role="dialog" aria-modal="true"` labeled "Primary menu"; focus → first link on open; **10-stop Tab cycle stays inside** (6 links → theme toggle → close btn → wraps); Escape closes + focus returns to trigger + `aria-expanded` flips; explicit in-dialog close button 44×44 | 4.1.2 / 2.1.2 | **PASS — rendered** (375×812, journey2-log) | rendered |
| Route-change announcements: `next-route-announcer` **fires with destination title** ("Notes — Sky Halisky"), verified via MutationObserver through BOTH the ViewTransitions path and the RM-degraded plain push | 4.1.3 | **PASS — rendered, verified wired** | rendered |
| CountUpStat: animated figure `aria-hidden`, sr-only stable final value (L6-05 mechanism HELD); A11yReceipts caption dedup deliberate | 4.1.3 / 1.3.1 | **PASS** | programmatic |
| SidebarSectionNav scroll-spy: `aria-current` without live region — deliberate anti-spam design, documented in-component | 4.1.3 | **PASS** (design is correct: AT reads aria-current on focus, not mutation) | programmatic |
| Reveal system: opacity/transform only — content NEVER leaves the AX tree; head-script failsafe rescues dead-JS; RM forces resting-visible | 1.3.2 | **PASS** | programmatic |
| Breadcrumbs on work + blog: `aria-current="page"` present, rendered | 2.4.8/1.3.1 | **PASS — rendered** | rendered |
| RunwayIdentity chip, ghosted numerals, hairlines, arrows, wordmark gilded-ink `::after` (the 38b94db double-announcement fix) | 1.1.1 | **PASS** — decorative properly hidden | programmatic |
| ContactEmail/FooterEmail: runtime-assembled mailto, name = visible text pre-hydration, contains-visible-text post; noscript socials fallback | 2.5.3 / 4.1.2 | **PASS** | programmatic |

## Findings

**L2-1 · LOW · SC 4.1.2 (robustness nit) · `components/HamburgerNav.tsx:115`** — `aria-controls="primary-menu"` references an ID that exists only while the dialog is open. Harmless in practice (axe passes it; AT ignores dangling idrefs; the trigger is `md:hidden` on desktop), but the cleanest form points at an always-present container or drops the attribute when closed. Evidence: programmatic.

**L2-2 · LOW · robustness note · `components/HamburgerNav.tsx:136`** — while the dialog is open the trigger stays mounted with `opacity-0 pointer-events-none` (deliberate IN-3 hit-test design). It remains technically focus-eligible outside the trap's scope; **rendered 10-stop cycle proves keyboard focus never reaches it**, and `aria-modal` scopes conforming AT away — recording as a hardening note (`visibility:hidden`/`inert` while open would close the last theoretical gap), not a defect. Evidence: rendered.

## Rig note (method truth, matters for Phase B and future trains)

The in-app browser pane's screenshots/paint states are **unreliable on the homepage** (GSAP pin + compositor: settled CSSOM said "visible ink text on top"; pane pixels said blank cream at the same coordinates). The project's own playwright-core chromium-1228 engine renders correctly and matches prior-train evidence. **All visual evidence in this audit comes from that engine.** Do not diagnose "blank page" from the pane on this project.

**Verdict: FINISHED.** Two Low robustness notes; zero user-impacting semantic defects found.
