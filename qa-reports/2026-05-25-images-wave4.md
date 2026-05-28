# Wave 4 — SVG Hero Images
**Date:** 2026-05-25
**Branch:** `assets/auto-2026-05-25-project-images`
**Role:** Dani (visual design)

---

## SVGs Created

All five images live at `public/images/deliverables/<project>/hero.svg`, 800×500, self-contained (no external `<image href>`), brand palette only.

### 1. AccessMap — `accessmap/hero.svg`
Cream background with a subtle stone grid suggesting a city map. Three secondary location pins (umber, amber, blush) dot the canvas with faint dashed route lines connecting them. A bold terracotta teardrop pin dominates center with a white inner circle containing an SVG wheelchair accessibility symbol. Radial glow under the pin. Eyebrow wordmark "ACCESSMAP" in spaced terracotta serif at bottom.

### 2. Mutual Mesh — `mutual-mesh/hero.svg`
Organic node-and-connector network on cream. Central terracotta hub (34px) with a heart silhouette, ringed by a FBCFAC glow. Eight satellite nodes in umber (primary), blush+terracotta (secondary), and amber (tertiary) at natural positions — not a rigid grid. Stone connector curves with partial cross-node bridges. Four tiny tertiary satellites extend the mesh to the canvas edges. Eyebrow wordmark "MUTUAL MESH."

### 3. Pac-Man Code Trainer — `pacman-code-trainer/hero.svg`
Dark near-black (#232420) background — the only dark card, intentional contrast. A full terminal window with rounded corners, terracotta border stroke, and a blurred-red title bar. Interior shows simulated CLI output (terracotta `$` prompts, amber command text), a flashcard panel ("Rewrite for clarity" style), score bar, and blinking cursor animation. Pac-Man character (amber wedge) in the lower-right eating three dot pellets. Pixel-art corner decorations. Scanline and pixel-grid overlay textures.

### 4. Prompt Library — `prompt-library/hero.svg`
Five stacked card layers receding into the background (blush → warm-white → cream, lightest in front). Each card has a terracotta-to-amber left accent border, growing in opacity toward the front. The front card shows: DM Mono eyebrow tag, serif prompt title "Rewrite for clarity," horizontal dividers, simulated text-line bars, tag pills (AI / WRITING / LOCAL-FIRST), and a footer reading "50 PROMPTS · BROWSER-ONLY STORAGE." A small lock icon (privacy signal) floats top-right. Eyebrow wordmark "PROMPT LIBRARY."

### 5. Claude Corp — `claude-corp/hero.svg`
Multi-agent radial diagram on cream. Two faint dashed orbital rings. A central hub (terracotta gradient, 46px) holds a document icon (the Constitution) and is labelled "ORCHESTRATOR." Eight role nodes at equal angular intervals on r=145 orbit: QUINN, DANI, STEVE, GARY, SHAMUS, ALEX, MORGAN, WILL — alternating umber, blush, and amber fills with inner contrasting dot. Thin stone connector lines hub-to-node and partial cross-ring arcs suggest cross-role communication. Eyebrow wordmark "CLAUDE CORP."

---

## Wiring into Data

`content/deliverables.json` — all five `heroImage.src` fields changed from `.jpg` to `.svg`:

| Project | Old path | New path |
|---------|----------|----------|
| accessmap | `/images/deliverables/accessmap/hero.jpg` | `/images/deliverables/accessmap/hero.svg` |
| claude-corp | `/images/deliverables/claude-corp/hero.jpg` | `/images/deliverables/claude-corp/hero.svg` |
| prompt-library | `/images/deliverables/prompt-library/hero.jpg` | `/images/deliverables/prompt-library/hero.svg` |
| pacman-code-trainer | `/images/deliverables/pacman-code-trainer/hero.jpg` | `/images/deliverables/pacman-code-trainer/hero.svg` |
| mutual-mesh | `/images/deliverables/mutual-mesh/hero.jpg` | `/images/deliverables/mutual-mesh/hero.svg` |

`ProjectCard.tsx` renders `<img src={d.heroImage.src} .../>` — no component changes needed; browsers render SVG natively via `<img>`.

---

## Accessibility

- Every SVG opens with a `<title>` element (descriptive, screen-reader-accessible).
- The `alt` text in `deliverables.json` continues to carry the accessible name for `<img>` elements.
- Pac-Man card's dark background (#232420) is paired with amber/terracotta text — all foreground elements pass 4.5:1 contrast against the dark field.

---

## What Remains for Sky

1. **Real screenshots / mockups** — The SVGs are designed as elegant placeholders in the brand aesthetic. When real app screenshots or mockup renders are ready, replace the SVG files in place (same paths) or switch `heroImage.src` to point to the new assets. No component changes are needed either way.
2. **Pac-Man cursor animation** — The blinking cursor `<animate>` tag works in browsers but is stripped by some static exporters. If the animation doesn't play after build, it gracefully degrades to a static cursor block.
3. **Featured card aspect ratio** — AccessMap uses `wide=true` (16:9) in ProjectCard. The SVG's 800×500 (8:5) will letterbox slightly inside the 16:9 container — acceptable, but Sky may want to extend the SVG to 800×450 for a tighter fit on that card specifically.

---

## Commits

1. `9ec1a15` — `assets: add SVG hero images for all 5 projects`
2. `68d6654` — `content: wire SVG hero images into deliverables data`

Branch: `assets/auto-2026-05-25-project-images` (off `content/auto-2026-05-25-links-and-copy`). NOT merged to main.
