# Design Compile Result: flagship-detail crop (Creative Release 7), 2026-10-24

Feature: the homepage flagship room's detail plate ends above the Flagstone report's free-text description. Branch `refine/flagstone-detail-crop-20261024`, commit `6ef2405`, on main `43788b2`. Evidence: [`2026-10-24_Flagstone_DetailCrop.md`](2026-10-24_Flagstone_DetailCrop.md).

**Decision: PASS** (owner review pending; nothing pushed).

| Layer | Result | Basis |
|---|---|---|
| 1 Tokenization | PASS | No colour, spacing, type or motion value is added or changed. The diff is one crop rectangle plus comments. |
| 2 Accessibility parity | PASS | No axe violations (page and room, 1440 and 393, light and dark). One keyboard stop. The plate stays `aria-hidden` with an empty alt. Worst text contrast is 5.02:1, against 5.02:1 before. |
| 3 Component consistency | PASS | `ExhibitDetail` and the stage CSS are untouched. The Release 5 detail grammar ("a labelled detail of one") holds. |
| 4 Visual entropy | PASS | No new elements. The plate becomes a 1.29:1 landscape crop. Side by side, it stays top-aligned with the screen, with the leader on the card's heading. Stacked, the stage is shorter and the screen keeps its size. |
| 5 Luxury UI score | PASS, with a note | The crop ends on blank card face with the stripe running to the edge: it reads as a deliberate detail. The note: at 1440 the stage holds more empty light below the plate than before (`boards/room-light-1440.jpg`). The copy column balances it. |
| 6 Regression safety | PASS | Full suite, typecheck, lint and build are green. The new pixel guard fails on the old crop and on two bad boxes. No image bytes changed. One capture request per view. |
| 7 Compile decision | PASS | The change is a geometry refinement within the shipped design language. |
