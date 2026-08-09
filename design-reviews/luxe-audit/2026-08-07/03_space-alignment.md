# LENS 3 — SPACE + ALIGNMENT (banked 2026-08-07)

**Method:** computed margin/padding/gap census (home, 1280), block-level left-edge censuses (/contact/, /work/accessmap/, /work/@375), section-rhythm rects, sidebar void assessment. Live `45f6632`.

## The spacing system as actually shipped

- **A real 4px scale.** Home renders 29 distinct spacing values; the top 16 by count are all 4-multiples (4·8·12·16·24·28·32·48·64·96). The strays are principled: em-derived micro-leading (3.52/7.2/9.6/11.52/13.6/25.6), deliberate ±15px optical pulls, ±1px hairline compensations. One 174px one-off (/about/, headshot composition) and one 500px (spacer/max-w artifact) — neither reads as drift in situ.
- **Section rhythm (home):** uniform 96px section padding; sections butt cleanly, no double-spacing seams. Subpage title bands are a house institution — eyebrow → display → standfirst → gradient hairline land at near-identical y across /work/, /about/, /colophon/, /certificates/, /contact/ (cross-page consistency of the arrival moment: an expensive tell that already exists).
- **Breathing room:** title bands hold ~180–200px of air before the first section — silence where the register wants it. The /work/ hero's missing 48px beat before its divider is cured in the stack (UP-35, AFU).

## Alignment at the seams (measured)

- **Flagship two-column:** left column blocks at x=312 (19 elements), right column at x=880 (8) — two clean voices. The eyebrow dot boxes sit at 876 so the dot's *center* lands on the 880 text edge: **the bullets hang optically. Craft already present, worth protecting.**
- **/contact/:** one content edge (312) for every block element; apparent 315/308 voices are inline-anchor rect artifacts, not misalignment.
- **Phone (/work/ @375):** page gutter 32 → title-band rule indent 50 → card inner edge 60; h1 44.35px fluid; horizontal overflow 0px. Grid discipline holds at the small end. (The known 320 breadcrumb overhang is AFU `a115986`.)
- **Optical vs mechanical serif left-hang:** display serifs sit on the mechanical edge; at 88px Cormorant's side-bearing inset is visually negligible in every capture — **considered and REJECTED as a finding** (no measured misalignment worth a pass; chasing ink-edge hanging here is luxury-cosplay, not craft). → Restraint list.

## The sidebar void (Lens-1 carry, resolved)

At 1280×800 the sage sidebar runs ~500px empty between the NOTES block and the pinned WRITE TO ME pill. **Verdict: decided silence, not vacancy** — R4's curation explicitly considered and rejected sidebar-filling concepts (P14 styled-feed, P10 source-colophon); the quiet stance (R3 standing decision #2) owns this emptiness. → Restraint list with the citation, NOT a ledger item.

## Lens-3 outputs

- No new ledger item earns its place from this lens alone. The system is disciplined; its two live spatial defects (UP-35 beat, breadcrumb 320) are already cured in the unmerged stack (AFU).
- PROTECT note for the ledger: the hung eyebrow bullets and the ±15px optical pulls are *intentional* asymmetries — any future mechanical "alignment cleanup" pass must not flatten them.
- Restraint entries seeded: sidebar void (curation-decided) · serif ink-edge hanging (rejected) · 76–79cpl trim (rejected as standalone; noted in L2).
