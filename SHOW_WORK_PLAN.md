# Show the Work, Cinematically — plan + image-swap guide

**Built:** 2026-06-04 · branch `feature/portfolio-show-work-2026-06-04`
**Component:** `components/ProductReveal.tsx` (+ `components/DeviceFrame.tsx`)

The portfolio now **shows** every product with a reusable cinematic media
component. Each slot renders a genuinely beautiful golden-hour **placeholder**
today; dropping in a real screenshot later is a **one-line edit** in
`content/deliverables.json`. No layout shift when you swap.

---

## What got wired (inventory of every product image slot)

| Surface | Where | Slot | State today |
|---|---|---|---|
| **Case-study hero** | `/work/<slug>/` (top) | `heroShot` → device-in-landscape | Placeholder (Ghost Code shows its real `hero.png`) |
| **In-body shots** | `/work/<slug>/` ("See it in motion") | `shots[]` (2–3) → full-bleed planes | Placeholders (alt + caption pre-written) |
| **Work card band** | homepage `/` + `/work/` (all 5) | top band, golden-hour world | Placeholder (Ghost Code shows real) |
| **"More work" cards** | bottom of every `/work/<slug>/` | top band | Placeholder / real |

Per-product **device frame** (hero only) reads true to the medium:

| Product | Frame | Hero today |
|---|---|---|
| Flagstone | `phone` | placeholder |
| Mutual Mesh | `phone` | placeholder |
| Prompt Library | `window` | placeholder |
| Claude Corp | `window` | placeholder |
| Ghost Code | `plate` | **real** `hero.png` |

---

## How to drop in a real screenshot (the one-line swap)

All product media lives in `content/deliverables.json`. You never touch
component code.

### 1. Hero screenshot — add a `heroShot`

Find the product and add **one block** next to its existing `heroImage`:

```jsonc
{
  "id": "flagstone",
  "heroImage": { "src": "/images/deliverables/flagstone/hero.svg", "alt": "…" },

  "heroShot": {
    "src": "/images/deliverables/flagstone/screen-map.png",
    "alt": "Flagstone map view with three barrier pins and a report sheet open"
  }
}
```

- Drop the image file at `public/images/deliverables/flagstone/screen-map.png`
  (any name; **must** live under `/images/deliverables/<slug>/`).
- The screenshot appears inside the **same** device frame — zero layout shift.
- `alt` is required (4–200 chars, can't start with "image/picture/photo of").

### 2. In-body shots — fill in a `shots[i].src`

Each product already has a `shots` array of 2–3 placeholders with the alt +
caption written. To make one real, **add the `src` line** to that entry:

```jsonc
"shots": [
  {
    "src": "/images/deliverables/flagstone/shot-report.png",   // ← the one line you add
    "alt": "Flagstone reporting flow — choosing a barrier type and adding a short note",
    "caption": "Reporting a broken curb cut in three taps."
  },
  { "alt": "…", "caption": "…" }    // still a placeholder until you add its src
]
```

### 3. (Optional) crisp retina / light mobile — add `avif`/`webp`

If you generate responsive siblings, add them and they're served first
(AVIF → WebP → your `src`), mirroring the intro's image pipeline:

```jsonc
"heroShot": {
  "src":  "/images/deliverables/flagstone/screen-map.png",
  "avif": "/images/deliverables/flagstone/screen-map.avif",
  "webp": "/images/deliverables/flagstone/screen-map.webp",
  "alt":  "Flagstone map view …"
}
```

(An encode step like the intro's `scripts/encode-planes.mjs` can emit these.
No new dependency required.)

### 4. Ship it

```
npm run build && npm test     # validates the JSON + that the file resolves
```
Push to `main` → live in ~2 min. A typo'd path or bad alt **fails the build**
(by design) — it won't silently 404.

---

## Notes

- **Placeholders are pure CSS** (no asset files) — the golden-hour world +
  device frame + wordmark/UI hint. They never emit an `<img>`, so the build
  never carries a dangling local image src.
- The four legacy `hero.svg` mockups are now **unused** (the new placeholder
  renders instead). Safe to delete whenever; harmless if left.
- Frame defaults live in `lib/signature.ts` (`frameForSlug`). To change a
  product's frame, pass `frame="phone|window|plate|none"` at its call site, or
  edit `FRAME_FOR_SLUG`.
- A11y: a placeholder is decorative (meaning comes from the adjacent title /
  caption); a real screenshot carries its `alt`. Reduced-motion + no-JS show the
  final image/placeholder instantly (no motion).
