# Astra Ultra 01: release acceptance and heading fix, 2026-10-24

Supersedes the heading measurements in [2026-10-24_AstraUltra01_PolishIntegration.md](2026-10-24_AstraUltra01_PolishIntegration.md). Everything else in that receipt stands.

## Finding

Final visual acceptance before release found that the new contribution heading clipped. "implementation." is wider than the heading column on a 320px phone:

| | 320px, 100% text | 320px, 125% | 360px, 125% | 320–414px, 150% |
|---|---|---|---|---|
| main `601a402` (old heading) | fits | fits | fits | fits |
| candidate `fbd9139` | 5px into the gutter (visible) | **clipped 46px** ("implementa") | **clipped 6px** | **clipped 24–118px** |
| fixed `0a14763` | "imple- / mentation." | "imple- / mentation." | fits | fits |

The section is `overflow: hidden`, so the overflow was cut off rather than scrolled.

## Fix (`0a14763`)

- A soft hyphen in `imple&shy;mentation`: an invisible break point, used only when the word cannot fit. The words are unchanged, and assistive technology ignores the soft hyphen.
- `break-words` on the heading, the R6-A idiom already used on the work-index titles for text zoom at phone widths.

Alternatives were measured and rejected ([release-fix/heading-variants.txt](astra-ultra-01-integration-20261024/release-fix/heading-variants.txt)):
- `hyphens: auto` hyphenated words at 100% text ("AI-assiste / d" at 390).
- `break-words` alone left a lone "." line at 320.
- Keeping "AI-assisted" unbreakable reintroduced clipping at 150%.

The break after the hard hyphen in "AI- / assisted" at some tablet widths is ordinary wrapping and was left alone.

## Verification

- **Clipping census** ([tools/clip-census.cjs](astra-ultra-01-integration-20261024/tools/clip-census.cjs)): every element carrying a changed string, across 12 routes × 320/360/390/414px × 100/125/150% text (552 elements per build).
  - main: 0 issues
  - pre-fix candidate: **6** (all the heading; this proves the census catches the defect)
  - fixed: **0**, and no horizontal page overflow
  - [release-fix/](astra-ultra-01-integration-20261024/release-fix/)
- **Rendering:** identical to the pre-fix candidate at 360px and wider at 100% text. Boards: [320 @125%](astra-ultra-01-integration-20261024/release-fix/board-heading-320-125-light.jpg), [320 @100%](astra-ultra-01-integration-20261024/release-fix/board-heading-320-100-light.jpg), [768](astra-ultra-01-integration-20261024/release-fix/board-heading-768-100-light.jpg).
- **Tests:** typecheck, lint and production build pass. Full suite: 130 files, 1212 passed, 2 skipped. Negative controls: 15/15, including a new one that removes `break-words` from the heading.
- **Interaction:** the fix touches only the heading's text and class, so the interaction-gate results in the integration receipt still apply to every other changed surface.
