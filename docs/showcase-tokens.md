# Showcase surface tokens — the coloring-pass map

Every color/surface token the theme-synced showcase surfaces consume, with
where it lives and what reads it. Editing a value here re-colors every
showcase surface at once — a token edit, never a hunt. (All showcase CSS
deliberately consumes EXISTING site tokens; the train invented no parallel
palette.)

## Core tokens the showcase reads

| Token | Light | Dark | Defined | Consumed by |
|---|---|---|---|---|
| `--rgb-surface` | `255 255 255` | `30 36 38` | globals.css:61 / :327 | `.ts-matte` wash (85%) · ThemedMotion pause affordance fill (72%) |
| `--rgb-ink` | `32 48 44` | `236 234 224` | :67 / :336 | `.ts-matte-well` hairline (12%) · `.ts-float` hairline (10%, light) |
| `--rgb-ink-meta` | `90 107 100`* | `159 176 169` | :69 / :338 | pause affordance icon (`text-ink-meta`) |
| `--rgb-line` | `204 207 190` | `44 52 54` | :71 / :340 | pause affordance border (`border-line`, hover `line-strong`) |
| `--rgb-accent` | `185 99 64` | `207 122 79` | :75 / :344 | pause affordance hover (`hover:text-accent`) |
| `--rgb-gold` | `191 155 93` | `201 168 95` | :85 / :354 | `.ts-matte` sig-wash FALLBACK when a well has no `--pr-sig` |
| `--pr-sig` | per-project | per-project | lib/signature.ts (SIGNATURE map) | `.ts-matte` top wash (10%) — the project's own hue lighting its mat |
| `--shadow-lg` | warm umber pair | deep black | :261 / :369 | `.ts-matte-well` + `.ts-float` elevation |
| `--dur-transition` | 420ms | — | :311 | the theme dissolve the swap rides (never re-declared by ts-*) |
| `--ease-gh-glide` | cubic-bezier(.5,0,.1,1) | — | :296 | same |

\* the in-flight a11y train's uncommitted fix moves light `--rgb-ink-meta` to
`84 100 93` — merges cleanly with this train (non-overlapping regions).

## Showcase-owned rules (all in app/globals.css, end of file)

- `.ts-layer` block **:2865** — the ENTIRE swap mechanism (display gating on
  `html.dark`). LAW: no transition/animation may ever be added here; the
  site's view-transition dissolve supplies the crossfade and reduced-motion
  inherits the 0.01ms guard.
- `.ts-matte` / `.ts-matte-well` **:2878** — the mono-project exhibit mat.
  Light: warm inner top light `rgb(255 255 255 / .55)`; dark: ember hairline
  `rgb(255 240 214 / .08)` — the two literals in the block, both candidates
  for your coloring pass.
- `.ts-float` **:2904** — Sky's picked chrome: radius `1.35rem` (matches the
  designed-empty-state panel), `--shadow-lg`, ink hairline; dark border
  literal `rgb(255 240 214 / .10)`.

## Component-side styling (Tailwind classes, not raw CSS)

- ThemedMotion pause/play affordance — components/ThemedMotion.tsx
  (`h-11 w-11 rounded-pill border-line bg-[rgb(var(--rgb-surface)/0.72)]
  text-ink-meta backdrop-blur-md hover:text-accent`). Restyling it is a
  class edit in one place; it inherits every token above.
- Per-scene chrome override: `chrome: 'device' | 'float' | 'matte'` on any
  heroShot/cardImage/shot entry in content/deliverables.json; site default is
  `SHOWCASE_CHROME` in lib/showcase.ts (currently `'float'`, your gate pick).

## Not consumed

`--day-night` (the scroll world state) is deliberately untouched — showcase
surfaces sit on token surfaces that already respond to the theme; no parallel
world variable was introduced.
