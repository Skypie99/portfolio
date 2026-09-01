# Homepage project-link affordance — QA receipt

## Candidate

- Branch: `codex/flagstone-final-polish-20260901`
- Follow-up implementation: `8772f1fdfaf5f245111afabd719c7d89e3743d56`
- Prior Flagstone media implementation: `a4584fdeaddd3b33dfceb850651d330470d40f2c`
- Scope: make the five homepage project actions unmistakably clickable at rest.

## What changed

- Replaced the subtle text-only `VIEW PROJECT →` treatment with a compact, 44px-tall outlined button.
- Each button now has a persistent border, canvas fill, visible terracotta dot, and hover/focus response. Project-title links remain the single keyboard-tab destination, avoiding a duplicate Tab stop.
- No media source, media crop, or media encoding changed. The supplied Flagstone poster remains 780×1378; the earlier chat image was a 375px-wide browser test capture enlarged for display.

## Gates

| Check | Result |
| --- | --- |
| `npm test -- app/__tests__/homepage-project-links.test.tsx` | PASS — 2 tests. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS — no ESLint warnings/errors. |
| `npm run build` | PASS — static export and asset validation completed. |
| Browser review | PASS — five visible outlined project actions at desktop 1440×1000; no console errors. |
| `git diff --check` | PASS. |

## Visual evidence

- `qa-reports/2026-09-01_FlagstoneFinalPolish/home-project-links-stronger-desktop.png`

## What is left

- No additional work is needed in this narrow follow-up scope.
- No merge, push, deploy, or release action was performed.

## DECISIONS FOR SKY

No decision is required. The visual-action treatment is now deliberately clear while preserving the existing title-link keyboard path.
