# THE ONE DEVICE SESSION
**Sky · iPhone + Mac · ~30 minutes, one sitting · replaces every device row from four programs**

Four programs (ui-polish, R4, a11y-QA, THE ROOM A–I) accumulated roughly **fifty** device rows across five documents. **None were ever run — a 0% execution rate.** The cure is not a fifty-first row; it is one list short enough to finish. Everything below is deduped, merged, and re-pointed at the routes that exist today (the a11y script still said `/work/accessmap/`).

Everything this program measured is **Chromium**. Every row below is something Chromium structurally cannot answer.

**This is now live.** THE ROOM shipped 2026-08-26 (`main` `a58ecf1`) — everything below is on the real site, not a preview. Chromium has already confirmed, against production: 25 URLs all 200 · 17 routes with zero console errors · exactly one `<h1>` on 16 of 17 · axe clean everywhere except `/archive/`'s sign-in card (🔴 9, a private page). **Every row below is something Chromium structurally cannot answer, on the live site.**

**Setup:** iPhone, Safari, `skypistudio.com`. Mac for Part 3. Toggle shorthand — **VO** VoiceOver · **AXT** Larger Text (top-3 size) · **RT** Reduce Transparency · **RM** Reduce Motion.

---

## Part 1 · iPhone Safari — the WebKit blind spot (~12 min)

| # | Do this | "Good" looks like | Report back |
|---|---|---|---|
| **1** | Home, top of page. Look at the identity chip and any frosted card edge. Then Settings → **RT** on, reload. | The glass reads as *frosted*, not as a flat grey slab and not as a hard-edged box. With RT on it stays legible — `backdrop-filter` is the single largest WebKit-vs-Chromium gap on this site. | "fine" / a photo of whichever surface looks wrong |
| **2** | Home, scroll slowly down and back up, letting the address bar collapse and re-expand. | Nothing jumps, nothing gets cut off at the bottom, no band ends up 60px too tall or too short. iOS `100vh` ≠ the visible viewport, and Chromium never reproduces this. | "no jump" / where it jumped |
| **3** | Home, top of page (film still playing). Tap **Skip intro** (bottom-right). Then try tapping a rail/menu link *before* using it. | Skip intro works on the first tap and lands you at the hero. **Expected and pre-existing:** the film swallows taps over the rail until you're past it — that is exactly why Skip intro exists, and Phase J proved it is the only pointer escape (there was none before Phase B). | "skip works" / "skip didn't work" |
| **4** | Anywhere with a link or button. Press and **hold** one, then slide your thumb off before releasing. | Something visibly happens on press (the card/link acknowledges the touch), and sliding off cancels it cleanly rather than firing. Touch has no hover; `:active` is designed on `.glass-card` only. | "feels responsive" / "feels dead" |
| **5** | Footer and sidebar rows — the small ones (~20–24px). Tap a few with your actual thumb. | You hit what you aimed at. These were **deliberately** left under 44px: they have 9–12px of room and forcing 44 would overlap neighbours. Your thumb is the deciding evidence, not the spec. | "fine" / "kept missing X" |
| **6** | Settings → **AXT** to a top-3 size, reload home + `/work/flagstone/`. Also pinch-zoom to ~200%. **Then look at two specific spots:** the method line under `/accessibility/`'s receipts, and the "Real commits" link on `/work/claude-corp/`. | No clipped or overlapping text, nothing truncated, cards grow rather than crop, zoom is not blocked, no side-to-side scrolling. **Phase J found those two spots lose text at 200% on a 375px screen** (151px and 34px clipped) — confirm how bad it actually looks to you; it drives 🔴 7 and 🔴 8. | "clean" / how bad the two spots are |

## Part 2 · iPhone, dark + motion (~8 min — the two rulings that close here)

| # | Do this | "Good" looks like | Report back |
|---|---|---|---|
| **7** | Dark theme, room lights **off**, brightness low. Home + `/work/flagstone/`. | Warm near-black, not muddy grey and not crushed pure black; the ember/terracotta reads warm; the case-study lamp glow behind the device frame has no visible banding on OLED. | "reads warm" / "reads grey" / "banding" |
| **8** | 🔴 **The dusk-turn — the one Sky asked for.** Tap the theme toggle **light → dark**, then **dark → light**. Do it a few times. | Both directions read as *the world turning through its own dusk* — indigo → wine → ember → night — not a grey shimmer and not a screen blink. **This is your perceptibility requirement from the mockup gate; it closes here or not at all.** Phase G's 🔴 asks whether to SHIP AS TUNED or DIAL BACK (a one-line change). | **"ship it" / "dial it back" / "didn't see it"** |
| **9** | Settings → **RM** on. Reload home, then toggle the theme again. | Static desert frame, no pin, everything readable immediately; the theme flip is an instant cut with **no sky**; the `/accessibility/` page shows its RM-only line ("You're reading this because your system asked for less motion."). | "instant cut, no sky" / what you saw |
| **10** | Deep-link a case-study heading (tap any `Continue reading` anchor, or paste a `#…` URL). | The gutter bar announces the arrival and the heading lands at the top of the screen, not under the address bar. | "lands right" / "lands wrong" |

## Part 3 · Mac Safari + one share (~8 min)

| # | Do this | "Good" looks like | Report back |
|---|---|---|---|
| **11** | Mac Safari, cold load, press **Tab** repeatedly through home. | Skip link first; then a **2px terracotta ring on every single stop**, both themes. Chromium proves 463/463 light and 411/411 dark; Safari's ring rendering and scroll-anchoring are the open half. | "ring everywhere" / first stop that lost it |
| **12** | Mac Safari, toggle the theme once. | The dusk-turn either plays or degrades to a clean instant cut — **never a half-state, never a flash of the wrong theme**. Safari's `startViewTransition` support differs and cannot be tested headless (it is skipped in a hidden pane). | "plays" / "clean cut" / "half-state" |
| **13** | Paste `https://skypistudio.com/work/flagstone/` into a real chat (iMessage to yourself is fine). | A real unfurl: correct image, correct title, no cropped text, no broken card. The OG pipeline is only ever proven by one real send. | screenshot of the unfurl |
| **14** | 🔴 **VoiceOver spot-pass** — Mac ⌘F5 *or* iPhone VO, ~3 minutes. On `/` and `/accessibility/`: Rotor → Headings, then swipe through the hero. | The heading outline reads like a table of contents; the film region is announced and skippable; receipts read once as "{value} {label}", never digit-by-digit and never the caption twice; nothing traps the rotor. | **"clean" / what read wrong** |

> **What row 14 unlocks.** `/accessibility/` currently says, in Sky's own words and byte-frozen: *"I have not run a full manual screen-reader pass on this site."* **If you run row 14, that sentence can finally become a dated fact.** If you don't, it stays exactly as written — which is the honest outcome, not a failure. Nobody may soften it on your behalf.

---

## Two eye-checks, if you have five more minutes

| # | Do this | Why it's still open |
|---|---|---|
| **15** | `/work/flagstone/`, both themes: read the museum **plate** ("SEVERITY 4 · VERIFIED") above the caption. | The one element the a11y rig could never score — occluded at every scroll stop it sampled. Is it comfortably readable against whatever the world is painting behind it? |
| **16** | `/`, `/about/`, `/work/flagstone/`, light theme: the eyebrows and inline links. | Phase B deepened the warm ink tokens to clear AA (`accent-ink 163 86 54 → 135 71 45`, `ink-meta 90 107 100 → 84 100 93`). Do they still read *warm* to you, or has AA cost the golden-hour feel? Reverting is a one-line edit; the guard pins whatever ships. |

---

**If a row fails:** the row number and a photo is plenty. Rows **6, 8 and 14** carry open decisions (🔴 7/8, the dusk-turn, and the screen-reader sentence); everything else is a pass/fail observation.

*Merged from: `a11y-qa/2026-07-31/DEVICE_SCRIPT.md` D1–D18 · `ui-polish/2026-08-01/REPORT.md` carried D-rows · `r4-gallery/04_r4-curation.md` DEVICE/WEBKIT ROLL-UP (P01/P04/P05/P12/P13) · THE ROOM C/D/E/G device rows + G-D1…G-D6 · Phase J's own findings (rows 3, 6, 11, 12).*
