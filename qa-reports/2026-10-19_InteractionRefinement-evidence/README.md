# 2026-10-19 · Interaction refinement — raw evidence

Cited by [`../2026-10-19_InteractionRefinement.md`](../2026-10-19_InteractionRefinement.md). Every PNG and every frame of every recording is a live headless-Chromium frame of the real built site; nothing is a mockup or a composite of anything other than those frames (the sheets only arrange and label them).

| Path | What it is |
|---|---|
| `sheets/<viewport>-<theme>--<control>.png` | 39 before/after comparison sheets. Left column: a build of `main` `b3e992b`; right column: this candidate. Rows: REST · HOVER (1440 only) · FOCUS (keyboard) · PRESSED (held) · RELEASED (lifted without navigating) · CANCELLED (dragged / scrolled away while held). Crops were captured @2x with 20 px of context and are presented at 1x. |
| `sequences/after-*.webm` | Real recordings of the candidate: doorway press → release → route dissolve → `/work/flagstone/` → history Back (sequence A), and on the phones also hamburger → press "Credentials" → `/certificates/` → Back (sequence B). VP9 re-encode of Playwright's capture; no frame was altered. |
| `sequences/strips/*.png` | 10 fps frame strips of the press window (press − 0.2 s … + 1.6 s), reading order, before and after. |
| `sequences/{before,after}.sequence.json` | Timestamps of each step and the measured state of the doorway / trigger after Back (`restored`), after arrival (`arrived`) and before the press. |
| `measurements/{before,after}.measurements.json` | 292 readings each: computed border, fill, colour, shadow, transform, outline, transition timing, dot size + fill, and the live `:active` / `:hover` / `:focus-visible` flags at the instant of every captured frame, plus the media profile (`hover: hover`, `pointer: coarse`, reduced motion, theme). |
| `measurements/tables.md` | The same, as before/after markdown tables per profile. |
| `measurements/axe-{before,after}.json` | axe-core 4.11 (WCAG 2.x A/AA + best-practice) on `/accessibility/`, `/` (flagship + rows) and `/` with the menu open, at 393 and 1440 in both themes; plus the press-colour contrast reads from the live tokens. |
| `measurements/css-hash-*.txt` | SHA-256 of the built stylesheets for the build the frames were captured from and for the final committed build (identical — the only edit between them was a comment). |
| `harness/` | The rig. `harness.mjs` (state ladder + crops + measurements), `sequence.mjs` (recordings), `strip.mjs`, `sheet.mjs`, `tables.mjs`, `axe.mjs`, and `probe-active2.mjs` (the experiment that chose the touch input path). |

## Reproduce

```
npm ci && npm run build
node scripts/static-serve.mjs out 3106 &
cd qa-reports/2026-10-19_InteractionRefinement-evidence/harness
ln -s ../../../node_modules node_modules          # playwright-core, sharp, ffmpeg-static, axe-core
node harness.mjs  --base http://127.0.0.1:3106 --out ./after --label after
node sequence.mjs --base http://127.0.0.1:3106 --out ./after-seq --label after
node strip.mjs --seq ./after-seq
node axe.mjs --base http://127.0.0.1:3106 --label after > axe-after.json
# the before side: build b3e992b into another directory, serve it on 3105, repeat with --label before
node tables.mjs --before ./before --after ./after > tables.md
node sheet.mjs  --before ./before --after ./after --out ./sheets
```

Chromium is resolved from `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, then playwright-core's own path, then `/opt/pw-browsers/chromium`.

## Two facts about the rig that matter when reading it

- **Phone presses use Chromium's touch-from-mouse emulation** (`Input.emulateTouchFromMouseEvent`, the DevTools device-mode input path), which holds a real `:active` from ~40 ms under the phone media profile. Plain CDP touch points (`Input.dispatchTouchEvent`) never matched `:active` during a hold in headless — only for ~20 ms after release — so they could not show a held press at all. `harness/probe-active2.mjs` is the measurement behind that choice.
- **The browser is headless Chromium only.** No WebKit or Android build was available in the session; what real devices are expected to do, and what still needs confirming on them, is in the receipt's "Outstanding issues".
