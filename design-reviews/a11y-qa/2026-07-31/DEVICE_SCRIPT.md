# THE DEVICE SCRIPT — what only Sky's hands can verify (Phase A draft, 2026-07-31)

The honest last mile. This audit's rendered evidence is **Chromium-only** (the house blind spot: preview can't catch Safari/WebKit differences). The `/accessibility/` page itself says "I have not run a full manual screen-reader pass" — this script IS that pass. One sitting, ~25 minutes, real iPhone + the Mac.

Settings shorthand: **VO** = VoiceOver on · **AXT** = Settings → Accessibility → Display & Text Size → Larger Text (drag to a top-3 size) · **RM** = Reduce Motion on · **RT** = Reduce Transparency on.

## Part 1 — iPhone Safari, VoiceOver (the walk that's never been done)

| # | Surface | Setting | What to check | PASS | FAIL |
|---|---|---|---|---|---|
| D1 | `skypistudio.com` cold load | VO | Swipe-through order makes sense aloud: identity chip → (film region announced as the labeled desert-scene section, skippable) → hero → work. Nothing traps the rotor | ☐ | ☐ |
| D2 | The intro | VO + RM **off** | Can you swipe PAST the film without scrubbing it? Does the scroll cue read "Scroll to work section"? | ☐ | ☐ |
| D3 | Same, RM **on** | RM | Static desert frame (no pin); everything readable immediately; the /accessibility/ bracket line VISIBLE ("You're reading this because…") | ☐ | ☐ |
| D4 | Hamburger menu | VO | Double-tap trigger → VO lands inside "Primary menu" dialog; all 6 items + theme toggle + close reachable; **Z-gesture (scrub) closes it**; focus returns to the trigger | ☐ | ☐ |
| D5 | A project card | VO | Card title announces "{title} — {role}, {year}"; action row reads "View project…", "Live/Demo… opens in new tab", "GitHub… opens in new tab" | ☐ | ☐ |
| D6 | Theme toggle | VO | Announces "Switch to dark mode"/"…light mode"; activating flips theme; label updates | ☐ | ☐ |
| D7 | `/accessibility/` receipts | VO | Each receipt reads ONCE as "{value} {label}" (never "0, 1, 2…" and never the caption twice) | ☐ | ☐ |
| D8 | Route change | VO | Tap "Notes" from the menu → VO announces the new page (title) without you doing anything | ☐ | ☐ |
| D9 | Ghost Code page | VO + RM off | The proof loop: poster first, plays only after your tap on real Safari? (Chromium autoplays muted — WebKit policy may differ; either behavior is fine, controls must be present) | ☐ | ☐ |

## Part 2 — iPhone, display settings

| # | Surface | Setting | What to check | PASS | FAIL |
|---|---|---|---|---|---|
| D10 | Home + a card page | **AXT** (max Larger Text) | Safari text-size respect: no clipped/overlapping text, cards grow, action rows wrap without collisions | ☐ | ☐ |
| D11 | Home + menu | **RT** | Frosted surfaces (glass cards, hamburger chip) stay readable with transparency reduced | ☐ | ☐ |
| D12 | Home, portrait | Pinch-zoom | Zoom is NOT blocked; 200% pinch keeps text readable, no 2-D scroll jail | ☐ | ☐ |
| D13 | The 21–23px links (chip doors, card action rows) | thumb, honestly | Do they FEEL comfortably tappable to you on glass? (SC-clean; this is the house-44 judgment call that feeds C9-3) | ☐ | ☐ |

## Part 3 — Mac Safari, keyboard only (WebKit half of Lens 3)

| # | Surface | Setting | What to check | PASS | FAIL |
|---|---|---|---|---|---|
| D14 | Cold load, press Tab | — | Skip link appears top-left; Enter jumps to content; **next Tab reaches "See the work." with the hero VISIBLE and settled** (the arrival beat — Chromium proves it; Safari's scroll-anchoring is the open question) | ☐ | ☐ |
| D15 | Full home walk | — | Tab order: CTA → cue → 6 chips → cards → about → certificates → contact → footer; terracotta ring visible on every stop, both themes | ☐ | ☐ |
| D16 | VoiceOver Mac (⌘F5), 2 min | VO | Rotor → Headings: the outline reads like a table of contents on / and /accessibility/ | ☐ | ☐ |

## Part 4 — added by Phase B (2026-07-31)

| # | Surface | Setting | What to check | PASS | FAIL |
|---|---|---|---|---|---|
| D17 | `/work/accessmap/` museum plate ("SEVERITY 4 · VERIFIED", above the caption) | both themes | **The one element the rig could not score** — it was occluded at every scroll stop sampled. Scroll it into view and judge plainly: is it comfortably readable against whatever the world is painting behind it? | ☐ | ☐ |
| D18 | `/`, `/about/`, `/work/accessmap/` | both themes | **The mockup gate's real verdict.** Phase B deepened the warm ink tokens to clear AA (accent-ink `163 86 54`→`135 71 45`, ink-meta `90 107 100`→`84 100 93`, dark accent-ink lifted). Do the eyebrows and inline links still read as *warm* to you, or has it cost the golden-hour feel? `GATE-*.png` is Chromium only — your eye on real glass decides. Swapping the values back is a one-line edit; the guard test pins whatever ships | ☐ | ☐ |

Note for D13: F7-1 lifted the credential chips + badges door to **45px**, so judge the *remaining* 20–24px footer and rail rows specifically — those were deliberately left small because they have only 9–12px of room and forcing 44 would overlap neighbours.

## If anything FAILS
Note the row + what you saw (a photo is plenty). Phase B treats every FAIL here as a finding with tier assigned on triage; D13 feeds the C9-3 wording decision directly.
