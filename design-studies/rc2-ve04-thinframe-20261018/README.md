# RC2 VE04 thin-frame study (2026-10-18)

**Non-production design study.** A matched visual comparison of the shipped Flagstone first-proof arrival edge (W4-06.VE04_M1) and the D-CON-003 A three-window proof row, built at source baseline `a5854a5`. Nothing in this folder is imported by the site, and nothing outside this folder was changed.

- `index.html` — the prototype. Open it from a checkout; it references the real captures in place (`../../public/showcase/flagstone/`) and requests the site's three font families from Google Fonts (the site itself self-hosts them through `next/font`). Controls: theme, window-01 mat or full-bleed, prototype beat mode, per-variant replay. URL parameters are documented at the top of the file.
- `REVIEW_PACKET.md` — the owner-decision packet: verified baseline, both variants, evidence, creative comparison, the conditional recommendation, accessibility observations, inputs for a production candidate.
- `EVIDENCE_MATRIX.md` — what was captured and observed, what is pending, how to reproduce.
- `captures/` — renders (JPEG compositions, PNG detail crops at device scale 2), motion frames, mode checks, composite boards, `manifest.json`, `MEASUREMENTS.md`, `colour-maths.md`.
- `tools/` — `capture.mjs` (Chromium capture and pixel readings, repository toolchain only), `compose.py` (boards), `colour-maths.py` (token arithmetic).

The prototype's "arrival beat" plays the settle transition only. It is not the production lifecycle and must not be read as evidence about it.
