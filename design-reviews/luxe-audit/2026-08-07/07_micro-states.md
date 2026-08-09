# LENS 7 — MICRO-STATES (banked 2026-08-07)

**Method:** CSSOM pseudo-class rule extraction matched per-element against all 44 interactive elements on /work/ @1280 (sidebar + toggle + wall + footer); scrollbar/::selection rule reads; cursor census. Live `45f6632`. Tap FEEL remains device row D19.

## Where cheap sites die, this estate mostly doesn't

- **Focus rings are a designed system, not a default:** global `:focus-visible { outline: var(--focus-ring-width,2px) solid var(--focus-ring-color, accent); outline-offset: var(...) }` — tokenized width/color/offset, plus component-grade rings (`.lit-window:focus-visible` 2px offset-4 + opacity lift) and link-draw treating focus = hover (the underline draws for keyboard hands too). Coverage: every interactive element gets at least the global ring. **PASS at luxury grade.**
- **Hover census: 41/44 respond; 3 dead.** One is the skip link (focus-only by design — correct). Two are real: **the sidebar FEATURED project link** (the whole block: title, "Solo builder", "Open it →") and **"Read the notes →"** — the only always-visible navigation objects on every subpage that give the hand nothing back, on an estate whose grammar is "everything quiet answers when touched" (link-draw underlines, card lift+press, toggle, scrollbar thumb!). → **ELEVATION LEDGER CANDIDATE (micro): the two quiet sidebar links learn the house hover grammar** (likely: the → glyph nudge + link-draw underline on the inner label; XS effort, sitewide surface). Adjacency: UP-36 is about the Notes link's *color family* (Sky's open pick) — this item is about *response*, orthogonal; flag both in the build card so the pick isn't preempted.
- **Press/tap:** `.glass-card:active` press exists (BP3's measured matrix press) + a `(pointer:coarse)` press layer + `active:translate-y-0` utilities. Tap targets: card action rows to 44px is AFU (UP-02); doors are 45px live (a11y F7-1).
- **Cursor honesty:** all 43 visible interactive elements = `pointer`; no pointer-on-static found.
- **Text selection:** gold `::selection` designed for both themes (.28/.34 alpha) — a signature micro-luxury already present.
- **Scrollbar:** tokenized custom thumb (pill, `line-strong/.45`, hover→`pebble/.7`, transparent track, 10px) — even the thumb has a hover state. (Firefox `scrollbar-color` not present — Chromium-only styling; acceptable, note only.)
- **:visited:** no styling anywhere — reads as the deliberate portfolio convention, not an omission. Recorded, no finding.

## The hamburger (Lens-1 carry, resolved here)

Mobile chrome: identity chip (drawn sun glyph) + SCROLL cue (drawn chevron, ratified UP-39) + hamburger = **three default straight lines** — the one glyph above the fold that no hand drew. → **ELEVATION LEDGER CANDIDATE (micro, MOCKUP-GATE): the hamburger joins the drawn-glyph grammar** (a hand-weighted mark consistent with chevron/sun; renders candidates for Sky). PROTECT: the dialog behavior (D3 device row) untouched; aria-label unchanged; 44px target held.

## Lens-7 outputs

- Ledger candidates: sidebar dead-hover pair (XS) · hamburger drawn glyph (XS–S, MOCKUP-GATE).
- AFU observed: UP-02 (44px rows).
- PROTECT: focus-ring token system; press layer; gold selection; scrollbar craft.
