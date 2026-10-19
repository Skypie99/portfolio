# Signature-interaction refinement — the press language for buttons and navigation (2026-10-19)

**Status:** IMPLEMENTED · TESTED · VISUALLY_RENDERED (Chromium, four viewports, both themes) · OWNER_REVIEW_PENDING · INTEGRATION_PENDING · NOT_DEPLOYED

**Candidate branch:** `claude/modest-keller-ki98t5` (an isolated Cloud branch; `main` was not touched, no PR was opened, nothing was merged or deployed). Started from `b3e992bddf31daa86a4d471b1c38ad47f45802e7`, the verified tip of `main` on 2026-10-19 — the branch carried no other change before this work.

**Brief:** M-CON-002 A r2 — a terracotta accent, a deliberate border response, a restrained background tint, a subtle change to the signature dot, no unnecessary movement, immediate acknowledgement. Scope: `components/Button.tsx`, `components/ProjectDoorwayButton.tsx`, `components/HamburgerNav.tsx`.

**Raw evidence:** [`2026-10-19_InteractionRefinement-evidence/`](2026-10-19_InteractionRefinement-evidence/) — every PNG is a live Chromium frame captured by the rig in `harness/`; nothing is a reconstruction. The before side was captured from a build of `b3e992b` served separately, the after side from a build of this candidate, with the identical script.

---

## 1 · What the site already did (measured, not assumed)

The baseline was driven in a real browser before a line changed (`measurements/before.measurements.json`, 292 readings). The desktop readings use a real mouse press; the phone readings use Chromium's DevTools touch-emulation input path, which holds a genuine `:active` from ~40 ms under the phone media profile (`hover: none`, `pointer: coarse`). Findings:

| Control | Baseline response to a HELD press | Baseline after the finger lifts (no navigation) |
|---|---|---|
| `Button` (hero "See the work.", `/accessibility/` "Get in touch", the case-page contact CTA) | Fill only: canvas → `surface-warm`, reached through a **280 ms** ease-out, so a normal tap had barely begun to show it. Border and dot did not answer. On a phone the pressed frame was the *hover* look (white fill, ink-muted hairline, 10 px dot, 1 px lift) with the warm fill under it. | **Hover stuck**: white fill, ink-muted hairline, 10 px dot and the 1 px lift stayed on until the next touch elsewhere — the "looks pressed after a mailto / new-tab round trip" symptom. |
| `ProjectDoorwayButton` (five rows + the flagship room) | Dot 8 → 6 px only (P4's contraction) — and on a phone, with no hover growth to contract from, **nothing changed**; pill border and fill were identical to rest. | Hover stuck (white fill, ink-muted hairline, 8 px dot). |
| `HamburgerNav` trigger and in-dialog close | `:active` matched, **no style answered it** (identical border, fill, glyph). | Hover stuck (glyph terracotta). |
| `HamburgerNav` menu items | `:active` matched, **no style answered it**. | Hover stuck (accent label). |

Already correct in the baseline, and preserved: after a navigation and history Back the rebuilt page shows every control at rest (`sequences/before.sequence.json` — `restored.active/hover/focusVisible` all false on all three runs); a touch that turns into a scroll drops `:active`; keyboard focus is the global 2 px terracotta ring; axe reports 0 violations on every surface scanned (`measurements/axe-before.json`).

## 2 · What changed — one press language, three components

The design is one grammar, declared once per control in Tailwind utilities (no new CSS file, no global stylesheet edit, no token change, no JavaScript, no listeners):

| State | Button (h-14 pill) | ProjectDoorwayButton (h-11 pill) | HamburgerNav trigger / close | HamburgerNav items |
|---|---|---|---|---|
| **REST** | unchanged | unchanged | unchanged | unchanged |
| **HOVER** | unchanged *response*, now **fine pointers only** (`[@media(hover:hover)]`) | same | same | same (label accent, numeral nudge) |
| **KEYBOARD FOCUS** | global ring, **+ the dot grows to 10 px** (hover parity) | explicit ring, **+ dot 8 px** | global ring (unchanged) | accent label + nudge (unchanged) |
| **PRESSED** | hairline → **terracotta** (colour only, 1 px stays 1 px) · fill → **10 % terracotta tint** · the 1 px hover lift settles to 0 (the documented D4 press weight) · dot **contracts 8 → 6 px and deepens to accent-hover** | hairline → terracotta · 10 % tint · dot **6 → 4 px**, deepens · no transform (P4's "no lift" stands) | hairline → terracotta · glyph → terracotta · 10 % tint laid **over** the frosted `canvas/90` fill (an inset spread shadow, so the backing that lets the trigger sit on the film survives); the close button, over the opaque dialog, takes a plain tint | label and numeral → accent-text, immediately, no nudge |
| **timing** | press-in **90 ms** (`calc(var(--dur-fast)/2)`, the rung the glass press already uses) · release **280 ms** `duration-base` ease-out | same | press-in 90 ms · release 180 ms `duration-fast` | same |
| **CANCELLED** | pure CSS: `:active` drops on pointer-leave / scroll start; the release transition settles it home | same | same | same |
| **NAVIGATION START** | release → the existing 420 ms route dissolve (ViewTransitions) is the acknowledgement; the control's own release settle overlaps it | same | item press closes the dialog (its exit is the acknowledgement) and the dissolve follows | |
| **NAVIGATION COMPLETE / BACK** | rest; nothing carries over (measured) | same | same | same |
| **REDUCED MOTION** | the global 0.01 ms floor: the press is still answered, without motion | same | same | same |
| **tap highlight** | `-webkit-tap-highlight-color: transparent` — the designed press replaces the grey flash | same | same | same |

Why the pieces are shaped the way they are:

- **Hover gated to hover-capable pointers.** iOS and Android apply `:hover` on a tap and keep it. That is the mechanism behind every "it still looks pressed" frame in the baseline. With the gate, a touch pill goes rest → pressed → rest. Hybrid laptops (`hover: hover`) keep today's behaviour.
- **`!` on the colour press utilities.** Tailwind emits arbitrary-media variants after `active:`, so without `!` a desktop press would lose to the hover it happens inside of. This is the precedent P4 set on the doorway dot (`group-active:!h-1.5`), extended to the pill. The transform settle is the one deliberate exception — it lives *inside* the hover gate (`[@media(hover:hover)]:active:translate-y-0`, where `active` already outranks `hover`) and carries no `!`, because an important transform would snatch the inline magnetic translate `MagneticButton` owns and jerk a cursor-pulled CTA by up to 6 px on press. A press must never move its target.
- **The tint is `accent/10`, not `surface-warm`.** The concept is terracotta; `rgb(var(--rgb-accent) / 0.1)` over canvas reads 244 233 223 light / 40 35 31 dark — a hair warmer than the old peach, and token-true in both themes.
- **The dot contracts.** P4 chose contraction as the doorway's press cue; the Button now agrees (8 → 6), and both deepen to `accent-hover` ("sunlit rock" in the token's own words). A per-project dot hue (an inline style) keeps its colour and still contracts.
- **The disabled withdrawals ride the same gate** so they keep outranking the hovers they cancel; `SidebarRailLinks.tsx`'s on-route withdrawal was moved onto the gate for the same reason (two strings, otherwise tailwind-merge could no longer collapse it against the lift).

## 3 · Files changed

| File | Change |
|---|---|
| `components/Button.tsx` | press language; hover gate; focus parity on the dot; tap highlight; rationale in the component comment |
| `components/ProjectDoorwayButton.tsx` | press language on the pill (it had none); hover gate; focus parity; tap highlight. No `className` prop was added (the parity gate still passes: 6 identical pills) |
| `components/HamburgerNav.tsx` | trigger + close + items: press language; hover gate; numeral inks on press. Structure, links, labels, focus trap, glyph choreography untouched |
| `components/SidebarRailLinks.tsx` | the `/contact/` self-link's hover withdrawal moved onto the hover gate (consequential; behaviour unchanged) |
| `components/__tests__/Button.test.tsx` | +8 tests |
| `components/__tests__/HamburgerNav.test.tsx` | +2 tests |
| `components/__tests__/ProjectDoorwayButton.test.tsx` | new, 8 tests |
| `qa-reports/2026-10-19_InteractionRefinement.md` + `-evidence/` | this receipt and its raw evidence (~11 MB: 39 sheets, 5 strips, 3 recordings, measurements, the rig); `qa-reports/INDEX.md` regenerated |

Not touched: `app/**`, `app/globals.css`, `app/tokens-phase2.css`, `tailwind.config.ts`, `components/Hero.tsx`, `components/Receipt.tsx`, `components/ThemeToggle.tsx`, `components/IntroSkip.tsx` (the protected Skip Intro control), `components/cinematic/**`, any design token, any link or destination, any navigation structure.

## 4 · Visual evidence (actual interactive states)

Every sheet pairs the baseline frame (left) with the candidate frame (right) for the same control, state, viewport and theme — `sheets/<viewport>-<theme>--<control>.png`, 39 sheets in all: the three phone widths × both themes × five controls (Button, flagship doorway, hamburger trigger, close, menu item), 1440 × both themes × three (Button, flagship doorway, hero Button), plus three representatives of the remaining instances (the per-project-hue contact CTA, a work-row doorway, the hero Button on a dark phone). Crops are @2x with 20 px of context. Rows: REST · HOVER (desktop only) · FOCUS (keyboard) · PRESSED (held) · RELEASED (lifted without navigating — what sticks) · CANCELLED (dragged / scrolled away while held).

Start with these:

- `sheets/393x852-light--doorway-flagship.png`, `sheets/393x852-dark--doorway-flagship.png` — the headline: a phone press that used to change nothing now answers; RELEASED no longer sticks.
- `sheets/1440x900-light--button.png`, `sheets/1440x900-dark--button.png` — desktop: hover unchanged, focus ring unchanged (+ dot), press now distinguishable from both.
- `sheets/393x852-light--hamburger-trigger.png`, `sheets/393x852-light--hamburger-item.png`, `…--hamburger-close.png` — the navigation controls, over the film and inside the dialog.
- `sheets/375x667-*` and `sheets/320x568-*` — the small-phone profiles; the full-width Button and the trigger at the tightest width.

Motion evidence (`sequences/`): real recordings of the candidate — press → release → route dissolve → arrival → Back — on 393 light, 393 dark and 1440 light (`after-*.webm`, VP9 re-encodes of the Playwright captures), 10 fps frame strips of the press window in reading order for the candidate and, for comparison, the baseline on 393 light (`strips/*.png`), and the measured end state after Back for both builds (`*.sequence.json`). Sequence B on the phones goes through the hamburger: open → press "Credentials" → arrive on `/certificates/` → Back.

Measurements: `measurements/tables.md` — before/after computed style for every captured control × state × profile (flags `active`/`hover`/`focus-visible`, border, fill, dot size + colour, transform, transition duration), generated from the two `*.measurements.json` files.

## 5 · Accessibility

- **axe-core 4.11** (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`, `best-practice`) on `/accessibility/`, `/` scrolled to the flagship room and work rows, and `/` with the primary menu open — 393 and 1440, light and dark: **0 violations before, 0 after** (`measurements/axe-before.json`, `axe-after.json`).
- **Contrast of the designed press colours**, read from the live tokens (`pressContrast` in the axe files): pressed hairline on canvas **4.02:1 light / 5.52:1 dark** (resting hairline is 2.96 / 2.31 — the press *raises* edge contrast); label ink over the 10 % tint **11.55:1 / 12.89:1**; deepened dot over the tint 4.28 / 5.75. All above the 3:1 non-text and 4.5:1 text floors.
- **Preserved**: accessible names (the dot stays `aria-hidden`; labels unchanged), keyboard operation, the global focus ring (untouched — pressed is now visibly different from focused: ring vs terracotta hairline + tint), 44 px targets (no geometry change; the 1 px border is colour-only), reduced motion (the global 0.01 ms floor makes every press an instant, motionless answer — verified under `reducedMotion: 'reduce'` during the axe runs), no-JS (pure CSS pseudo-classes), screen-reader semantics (no attribute changed). Hover is never the only way to discover an action: every control's label and ring are unchanged.

## 6 · Build and test results

| Check | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm run lint` | pass (0 warnings) |
| `npm run build` (static export) | pass |
| `npm test` (build-backed, full, on the final build) | **109 files · 974 passed · 2 skipped · 0 failed** (exit 0) |
| New tests against the **baseline** components | 14 fail (the suites are non-vacuous); all pass on the candidate |
| Existing guards touching these files | `flagstone-cta-parity` (6 identical pills, no `className` escape), `TapTargets`, `Sidebar`, `HamburgerNav` glyph choreography, `recruiter-copy-truth`, `float-application`, `runway-application-copy`, `ember-large-text` — all green |

One guard tripped during the work and is recorded here because it is instructive: `ember-large-text` scans the text inside `className={cn(…)}` blocks for the bare token `ember`, and a *comment* I had written inside the dot's `cn()` call ("the ember is the default dot's alone") matched it. The comment was reworded; no class was involved.

## 7 · Outstanding issues and honest limitations

- **No real device in this environment.** All frames are headless Chromium (the only browser installed). iOS Safari / WebKit and Android Chrome were not run. What is expected from the browser engines, and should be confirmed on Sky's devices: iOS applies `:active` on touch-down for links and buttons; Android Chrome shows it after its ~150 ms show-press delay on a stationary finger (a fast tap shows the release settle rather than the hold). Neither delay can be shortened from CSS without disabling scrolling over the control, which was not done.
- **Synthetic touch in headless Chromium.** Plain CDP touch points never held `:active` here (only a ~20 ms flash after release); the DevTools touch-from-mouse path does, and is what the phone frames use. Documented in `harness/harness.mjs`.
- **Mouse drag-away keeps `:active` in Chromium** until the button is released (Firefox drops it). CSS cannot change that without a pointer listener, which the brief asked me not to add; the CANCELLED rows on the 1440 sheets show it. A touch that becomes a scroll cancels correctly on the doorways and menu items; on the `/accessibility/` Button and the fixed trigger the rig's scroll gesture had nowhere to scroll (page end / page top), so those two CANCELLED rows show the hold continuing — a rig limit, not a control defect. One CANCELLED frame (393 light, work-row doorway) caught the dot a frame before its release settle finished; the RELEASED row and the after-Back readings for the same control are clean.
- **`peach-cream` has lost its only consumer.** `tailwind.config.ts` annotates the alias "1 live call site (Button.tsx)"; that call site is now `active:!bg-accent/10`. The comment is stale, not wrong in effect; the alias stays registered (tokens were out of scope). One line to update when the config is next touched.
- **Hybrid devices** (touchscreen laptops reporting `hover: hover`) keep sticky hover on touch, exactly as today.

## 8 · Integration requirements

- Separate future release; nothing here depends on RELEASE 1–3 or the Flagstone first-proof session. Overlap risk is limited to `components/HamburgerNav.tsx` (if RELEASE 2 edits it, rebase this branch on top and re-run `components/__tests__/HamburgerNav.test.tsx`) and `components/SidebarRailLinks.tsx` (two strings).
- The flagstone parity gate will fail loudly if any future homepage doorway diverges — rebase, do not cherry-pick the pill alone.
- No content, token, schema or deploy change: integrating is a plain merge of the branch into `main` after owner review; CI (lint · typecheck · test · build) gates the deploy as usual.

## 9 · Creative recommendation

Ship it as one release, and resist tuning it per control: the value is that a press now *means the same thing* everywhere — the hairline turns terracotta, the room warms a tenth, the sun contracts — and that the answer arrives in 90 ms rather than fading in over 280. Two taste decisions are genuinely Sky's: (1) the doorway's pressed dot at 4 px is the smallest mark on the site; if it reads too fine on a real phone, 6 px (P4's value) is one class away and costs only the touch-only contraction; (2) the deepening to `accent-hover` can be dropped for a size-only press with no other change. I would keep both — at normal speed the contraction is felt more than seen, and the deepening is what makes the dot read as pressed rather than merely smaller.
