# LENS 4 — MATERIAL + SURFACE (banked 2026-08-07)

**Method:** backdrop-filter inventory, shadow/border/radius censuses (light + dark via html.dark flip), gradient inventory, on live home/certificates/flagship @1280. Chromium (glass rendering on WebKit = existing device row D23, not re-claimed here).

## Shadows — layered and lit, not default-harsh (PASS, protect it)

- Light: 4 distinct shadows total. The glass rim combo (top-lit `0 1px white .75 inset` + `0 0 0 1px white .22 inset` ring + warm drop), and **sepia-tinted elevation** (`rgba(60,32,18,.06–.08)` stacks) — shadows are *warm material*, not black defaults. Dark: 3 distinct, tokenized deeper (`--shadow-sm..xl` 0.40→0.55).
- Nothing on the estate ships a raw Tailwind `shadow-md` gray. **This is the material system already at luxury grade — PROTECT.**

## Radius census (estate)

`4 · 8 · 16 · 22 · 9999(pills) · 50%(avatar)` + two nested computed values (13, 21.6 — child-of-22 insets, not authored). Six authored voices, each with a role (micro-tile 4, badge tile 8, media 16, card 22, pill full). One voice per role holds across pages sampled. **No drift finding.**

## Borders

One width voice (1px ×31 on home — zero 2px+ decorative borders), colors from the line/ink-hairline/sage token families only. Disciplined.

## Glass (the finding of this lens)

Anatomy of `.glass-card` in **light**: `backdrop-filter: blur(20px) saturate(1.7)` + pane `rgba(252,251,255,0.42)` + white lit rim + white top-sheen + **cool blue corner glow `rgba(150,188,214,.26)`** (6 cards). In **dark**: pane goes warm smoke (`rgba(34,28,22,.68)` / `rgba(21,25,26,.68)`) — already coherent with the candlelit register.

**The cheap tell (measured):** the *light-theme* glass family is tinted cool — pane `#FCFBFF` (blue-white) + blue corner light — floating on a warm cream canvas (`#FAF8F1`), and it includes the identity chip, the most-seen object on the site (Lens-1 carry, now measured). The unmerged train already RULED the direction here: **UP-19 moves the glass rim's lit stop to the warm palette in light** (`8645610`, AFU) — but the rim fix leaves the pane tint and corner glow cool. The material currently splits: warm rim (post-merge) over cool pane.

**→ ELEVATION LEDGER CANDIDATE: finish the glass material** — the pane tint + corner light join the warm palette in light (one token + one gradient stop), completing UP-19's own thesis. MOCKUP-GATE (Sky's eye; cool-cast glass is a defensible material realism — render both). PROTECT: the derived ink-contrast guard (`e85a93f`, unmerged) must re-run — pane alpha feeds composite backdrops; axe 0 floor.

## Gradients

40 distinct on home, but ~6 families: link-draw underline pairs · accent CTA ramps · white sheens/glows · gold shimmer hairlines · sky day-ramps (lit-windows material) · teal secondary pair. No orphan decoration found. Banding: none visible in light captures; dark OLED banding remains device row D20 (not claimable in Chromium).

## Texture

One texture: the film's SVG grain (`#cdesert-grain-filter`), confined to the cinematic world. No noise overlays, no fake paper elsewhere — restraint held.

## Lens-4 outputs

- Ledger candidate: **light glass warmth completion** (pane + corner light; cites UP-19 adjacency).
- AFU observed: UP-19 (rim) · UP-17 (certificate paper in dark) · UP-20 (dark bands separate by lightness on live; warmth fix unmerged).
- PROTECT for ledger items: sepia shadow system · one-width border grammar · six-radius roles.
