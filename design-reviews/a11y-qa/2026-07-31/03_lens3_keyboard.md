# LENS 3 — KEYBOARD (banked 2026-07-31)

Method: real key events (Tab/Enter/Escape) in the sanctioned engine (chromium-1228) against the HEAD static build; journeys logged to scratchpad `shots/journey-log.json` + `journey2-log.json` with per-stop screenshots. The site's interactive inventory = links, buttons (theme toggle, hamburger, dialog close), one dialog. No custom widgets, no sliders, no drag surfaces on web (map lives in AccessMap, not here).

## Verified

| Check | SC | Result | Evidence |
|---|---|---|---|
| Everything operable by keyboard (links/buttons only; Enter activates — verified on skip link) | 2.1.1 | **PASS** | rendered |
| No traps anywhere; the one intentional trap (dialog) releases on Escape and close | 2.1.2 | **PASS** — 10-stop cycle + Escape verified | rendered |
| Skip link: first Tab, **visible 210×45 chip at 16,16** (cream on canvas, terracotta border + 2px ring), Enter lands focus on `main#main` | 2.4.1 | **PASS** — screenshot A1 | rendered |
| Top-of-page journey: skip → hero CTA ("See the work.", 191×56) → scroll cue → showcase chips → cards — **rail correctly inert during the pinned intro** (RailInert), releases after; DOM order == visual order (Alex §6.4 held) | 2.4.3 | **PASS** — journey A log | rendered |
| Focus visible on every stop sampled: skip chip, hero CTA (double-ring terracotta), scroll cue, showcase chip ring, card links, dialog links | 2.4.7 | **PASS** — screenshots A1/A3/A4/A5/M1 (indicator *contrast* measured in Lens 4) | rendered |
| **2.4.11 Focus Not Obscured (Minimum)** — the audit's crown 2.2 check, walked deliberately: (a) during the pinned desert intro the obscured rail is `inert` (native attr, rendered TRUE) so focus can never land under the stage; (b) Tab into the hero settles with the CTA **on top and visible** (`elementFromPoint` == the CTA; screenshot A3); (c) the only fixed chrome is the 44×44 mobile trigger + dialog close at top-right — no sticky headers/banners/footers exist to bury focus, and the dialog's focus-belt (`focusin` → `scrollIntoView`, L5-02) keeps every trap stop in view at short heights | **2.4.11** | **PASS** | rendered |
| Dialog focus management: trap-in (10-stop cycle stays inside), initial focus first link, restore-out to trigger on Escape/close | 2.4.3 / 2.1.2 | **PASS** | rendered |
| Theme toggle keyboard-operable (real button; global ring) | 2.1.1 | **PASS** | programmatic + A3 screenshot shows it in tab fabric |
| View-transition interceptor never hijacks modifier/middle/aux clicks, hash-jumps, downloads, external, mailto (source-verified guard list) — keyboard nav via Enter on links takes the same interception path and commits via `router.push` with announcer firing | 2.1.1 | **PASS** | programmatic + rendered |

## Findings

**L3-1 · INFO/adjacent (not a keyboard defect)** — the in-app pane episode: an instant Tab-teleport into the film's handoff zone produced blank frames **only in the pane's broken capture**; the sanctioned engine settles the same journey correctly (A3/B1 screenshots). Recorded so nobody re-chases it. A **real-hardware** confirmation of the Tab-into-hero arrival belongs in the device script (VoiceOver + keyboard on Safari — WebKit's scroll-anchoring differs; Chromium-only preview is a known blind spot per house memory). Evidence: NEEDS-SKY-DEVICE (one row in DEVICE_SCRIPT.md).

**Verdict: FINISHED.** Zero keyboard defects. The 2.2-new 2.4.11 criterion passes with engineered support (RailInert + focus-belt — this project *built machinery* for it).
