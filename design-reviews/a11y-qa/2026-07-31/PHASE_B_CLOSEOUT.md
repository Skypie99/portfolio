# A11Y DEEP QA — PHASE B CLOSE-OUT (2026-07-31)

**Model provenance:** `[Opus 5]`, max effort. Phase A was `[Fable 5]` max effort.
**Branch:** `a11y/phase-b-2026-07-31`, stacked off `38b94db` (== main == live at fire time). **5 commits. STOPPED on the branch — Sky merges and deploys.**
**PROTECT honoured:** `git diff 38b94db..HEAD -- components/cinematic/` is EMPTY. No migrations. No pushes. No `main` touched.
**In-flight seam honoured:** `ProjectCard.tsx`, `CardField.tsx`, `TactileMedia.tsx`, `CaseStudyCard.tsx` — **zero bytes changed**.

---

## ⚠️ FIRST: Phase A's Lens 4 was materially wrong, and this is the correction

Phase A reported **one** contrast defect and a headline of "0 standing Blockers". Re-measuring at the same commit found **59 light-theme and 1 dark-theme text elements below the 4.5:1 floor**.

**Root cause of the miss — a selector bug, proven not asserted.** Phase A's pixel-sampling rig used `document.querySelector('section p.text-accent-ink')` on `/` and labelled the result "contact eyebrow". That selector returns the **first** match in DOM order, which is the *"Shipped"* eyebrow, not the contact one. Re-running Phase A's own selector confirms it:

```
`section p.text-accent-ink` on / returned: "Shipped"
accent-ink DOM order on / : ["Shipped","The Work","Method","A Brief Account","Credentials","Let's talk"]
```

"Shipped" measures **4.17:1** — precisely the number Phase A reported for the contact eyebrow. The real contact eyebrow measures **3.49:1**. The instruments agree; the element identification did not.

**Second miss — the computed census's `glass` bucket.** Phase A's whole-site sweep classified any element over a `background-image` as "glass" and deferred it to hand-picked selector sampling. Every `world-surface-*` panel qualifies, so the great majority of the site's small text was deferred and then never individually measured. That is why one failure surfaced instead of sixty.

**This is a defect of Phase A, recorded here so a future run of this train inherits the correction rather than the headline.** Phase A's other eight lenses were re-read and are not implicated — the error is specific to Lens 4's sampling.

### What the corrected instrument does differently

Three artifact classes had to be eliminated before any number was trusted. Each was found by disbelieving the previous run:

| # | Artifact | Symptom | Fix in the instrument |
|---|---|---|---|
| 1 | Outer-ring background estimate | neighbouring content polluted the 3px ring | background measured by painting the element's own ink **transparent** and averaging the clip |
| 2 | Reveal choreography | measured mid-fade at 480ms against a 900–1200ms reveal | **assert** effective opacity == 1 before scoring; anything unsettled is excluded, never silently scored |
| 3 | Occlusion | the pinned cinematic desert scene paints **over** the rail; its text was being scored against a sunset it sits behind and is invisible on | hit-test 3 points per node; text not actually on top is excluded |

Artifact 3 is the one that matters most for credibility: without it the census claimed 73 light failures including nav items at 1.01:1, which would have been **manufactured violations** — the exact failure mode the train warns forfeits an audit's credibility. Screenshot evidence: `look-light-0.png` (the rail is not visible during the pin).

Final instrument: `census2.mjs` — 16 routes × 2 themes, one screenshot per viewport with every glyph transparent, occlusion-filtered, settlement-asserted, spec exemptions honoured (disabled controls, aria-hidden, decorative, gradient-clip text excluded; large-text floor 3.0 applied per SC 1.4.3).

---

## The fix — measured before and after

| Token | Theme | Before | After | Small-text failures |
|---|---|---|---|---|
| `--rgb-accent-ink` | light | `163 86 54` | `135 71 45` | 56 → **0** |
| `--rgb-ink-meta` | light | `90 107 100` | `84 100 93` | 3 → **0** (and 178 "thin" <4.75 measurements → 2) |
| `--rgb-accent-ink` | dark | `224 160 116` | `231 181 147` | 1 → **0** |

Values chosen by hue-preserving value walk (sRGB channel scaling holds hue and saturation), solved against **every** pixel-measured background rather than a nominal token pair, with a 4.62 target so the moving day/night backdrop cannot eat the margin.

**Post-fix census: 2222 text elements, 16 routes, both themes — `LIGHT fails: 0 · DARK fails: 0`.**

Why a token change and not a per-surface patch: Phase A's disposition said "NEVER a global accent-ink change", but that instruction was premised on a single failing surface. With 56 failures across 10 routes and 4 surface classes, the token *is* the defect — its own comment claimed "≥4.5:1", which was only ever true against pure canvas. The fix makes the comment true.

### Mockup gate — Sky's call, brand-visible change

Rendered before/after at `scratchpad/GATE-*.png` (4 surfaces × 2 themes). The change reads as a subtle deepening of the warm ink; the ember headings, terracotta dots and gold drift are untouched. **The values are committed so the claim is true on the branch — swapping them is a one-line edit if Sky's eye disagrees.** The guard test pins whatever value ships.

---

## Conservation table — every Phase A row plus everything Phase B found

| ID | Tier | Disposition | Evidence |
|---|---|---|---|
| **L4-1** | Med/Blocker-class | **FIXED — and corrected upward: 59 light + 1 dark, not 1.** `1bca3d3` | re-measured 0/2222 |
| **L4-1b** *(new, Phase B)* | **HIGH** | **FIXED** — `--rgb-ink-meta` failed 3 and sat thin on 178 more | `1bca3d3` |
| **L4-1c** *(new, Phase B)* | **MED** | **FIXED** — dark `--rgb-accent-ink` failed on `/work/accessmap/` prose link (3.84) | `1bca3d3` |
| **C9-1** | Low | **FIXED** `266c45e` — sr-only span ×2; guard sweeps built HTML as text so `<noscript>` is covered | 18 links, guard names all of them on revert |
| **L2-1** | Low | **FIXED** `2e042ee` — `aria-controls` set only while the dialog is mounted | test |
| **L2-2** | Low (note) | **FIXED** `2e042ee` — `tabIndex={-1}` while open. Deliberately **not** `visibility:hidden`/`inert`: `close()` focuses the trigger synchronously before re-render, so both would break focus-return | test asserts focus-return survives |
| **L4-2** | Low (guard) | **GUARDED** `47a26a9` — ember pinned to large-text sizes, both halves (class co-location + tokens ≥24px) | caught an unenumerated call site while being written |
| **F7-1** | Low | **FIXED** `4b47340` — credential chips + badges door 23px → **45px**, both widths, **0 interactive overlaps** | measured |
| **F7-2** | Low, PROVISIONAL | **AWAITING-LANDING** — card action rows; `ProjectCard.tsx`/`CaseStudyCard.tsx` untouched per the seam | — |
| **F7-3** | Low | **PARKED — with measured reason.** Footer rows have **9–10px** of room (max 42px before neighbours touch), rail nav 12px. Forcing 44 there creates *overlapping* tap targets, which is worse for touch than a small one. All are ≥24 and SC-clean via spacing. Re-open only with a layout change that buys room | `targets-now.json` |
| **C9-2** | Med | **GATED-AWAITING-SKY** — "1,680 tests passing" is stale; her copy | — |
| **C9-3** | Med | **GATED-AWAITING-SKY** — "44PT TARGETS" tag wording. F7-1 moved the code side; the dense surfaces (F7-3) deliberately did not | — |
| **L4-3** | Note | **CLOSED** — footer meta was 4.58; the ink-meta fix lifts it | census |
| **L8-1** | Low | **GATED-AWAITING-SKY** — ghost-code figcaption; Sky words it | — |
| **L3-1** | Info | **RECORDED** — never diagnose this page from the in-app pane. Phase B independently hit the same class (artifact 3) | — |
| **NEW-1** | Unresolved | **DEVICE-PENDING** — the `/work/accessmap/` museum plate (`pr-plate-lit`, "SEVERITY 4 · VERIFIED") was **occluded at every scroll stop the rig sampled**, so it is neither passed nor failed here. Pre-fix sampling suggested ~2.5:1 before occlusion was accounted for. **Added to the device script as D17** | honest non-verdict |

Nothing dropped. 16 rows, all disposed.

---

## Claims verdict — does the page now tell the same story as the product?

| Claim | Before Phase B | After |
|---|---|---|
| C4 "Every text role meets WCAG AA contrast… light and dark alike" | **FALSE** — 60 elements below floor (Phase A believed 1) | **TRUE** — 0/2222 across 16 routes × 2 themes |
| C6 "Links that open a new tab say so" | PARTIAL — true rendered, false for no-JS | **TRUE** — including `<noscript>`, now guarded |
| C3 focus ring ≥3:1 | TRUE | **TRUE** (unaffected; ring is `--rgb-accent`, not accent-ink) |
| C9 receipts strip, dated | TRUE-AS-DATED | **TRUE-AS-DATED** — but the "AA measured both themes" line is now backed by a much stronger sweep; a re-run would let it cite this one |
| C12 "1,680 tests passing" | STALE | **STALE — Sky's copy** (suite is now 419 here, AccessMap's own is 2,040+) |
| C13 "44PT TARGETS" | AMBIGUOUS | **STILL AMBIGUOUS — Sky's wording.** Honest state: primaries ≥44, credential doors now 45, footer/rail rows 20–24 and deliberately left there |

**No FALSE claim remains standing.** The two open items are wording, not product.

---

## Gates — green at the final stop

```
npm run lint       ✔ No ESLint warnings or errors
npm run typecheck  ✔ tsc --noEmit clean
npm test           ✔ 46 files · 419 passed | 1 skipped | 1 todo   (was 405 — +14 new guards)
npm run build      ✔ compiled + exported (25 pages)
```

Every guard added this phase was proved non-vacuous by breaking the fix and watching it fail:

| Guard | Broken by | Result |
|---|---|---|
| `ink-contrast.test.ts` | reverting accent-ink to `163 86 54` | 4 fail; reports **3.489:1**, matching the measured 3.49 |
| `static-integrity` Gap 5 | stripping the two sr-only spans | fails, naming all **18** links across 9 pages |
| `HamburgerNav` L2-1/L2-2 | reverting both attributes | 3 fail |
| `ember-large-text.test.ts` | putting `ember` on a 12px eyebrow | fails, naming file + class list |

---

## Device script

`DEVICE_SCRIPT.md` stands (16 rows, ~25 min), with two additions this phase:

- **D17 (new)** — `/work/accessmap/`, light **and** dark: scroll to the museum plate ("SEVERITY 4 · VERIFIED" above the caption). Is it comfortably readable against whatever the world is painting behind it? This is the one element the rig could not score.
- **D18 (new)** — one pass of `/`, `/about/`, `/work/accessmap/` in **both themes** after the ink change: do the eyebrows and inline links still read as *warm* to you, or has the deepening cost the golden-hour feel? This is the mockup gate's real verdict; `GATE-*.png` is only Chromium.

D13 still feeds C9-3 — but note F7-1 has moved the credential doors to 45px, so judge the remaining 20–24px footer/rail rows specifically.

---

## The honest one-line verdict

**Today, yes — but it did not yesterday, and the gap was larger than the last audit said.** The site now measures clean at 0 failures across 2222 text elements in both themes, and its accessibility page finally tells the truth it was already claiming. What earns the mission sentence is not the zero — it is that the zero came from an instrument that was rebuilt three times to stop it lying in the site's favour, and once to stop it lying against it.
