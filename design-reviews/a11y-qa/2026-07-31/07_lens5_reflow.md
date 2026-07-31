# LENS 5 — RESIZE + REFLOW (banked 2026-07-31)

Method: chromium-1228 sweeps (scratchpad `reflow.json`): 320×800 across all 10 content routes (scroll-settled, offender census); the standard SC 1.4.12 spacing override (lh 1.5 · letter 0.12em · word 0.16em · para 2em) at 1280 AND 375 on the 4 text-heaviest routes; 200% root-font-size proxy at 1280 on the 3 longest reads, with programmatic clip detection (`scrollHeight > clientHeight` on hidden-overflow text ancestors) — not eyeballed.

| Check | SC | Result |
|---|---|---|
| 320px reflow — horizontal overflow | 1.4.10 | **PASS — 0 overflow on 10/10 routes** (no 2-D scroll anywhere; wide media stays contained) |
| Text-spacing override — overflow/clipping | 1.4.12 | **PASS — 0 findings** at both widths (no fixed-height text boxes anywhere; the TY-2 "no line-clamp" law pays off here) |
| 200% text — overflow/clipping | 1.4.4 | **PASS — 0 findings**; viewport meta allows zoom (no `maximum-scale`, no `user-scalable=no`) |
| Dynamic Type (RN class AX5) | — | N/A (web); real-device pinch-zoom + iOS text-size row lives in DEVICE_SCRIPT.md |

**Findings: none.** Evidence tags: rendered (programmatic detection).
**Verdict: FINISHED** — the cleanest lens of the round.
