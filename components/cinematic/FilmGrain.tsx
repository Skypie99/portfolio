/**
 * FilmGrain — the plate-agnostic finishing layer that sits on top of the whole
 * scene. Four stacked, decorative, non-interactive elements:
 *
 *   1. a STATIC SVG grain (feTurbulence, fractalNoise, 3 octaves) at low
 *      opacity — rendered once, never animated (animated turbulence is a known
 *      GPU killer, so we bake a single noise field and leave it).
 *   2. a radial VIGNETTE that darkens the corners and focuses the eye.
 *   3. ≤16 slowly-drifting dust motes (cheap CSS-keyframe transforms).
 *   4. a warm color-grade tint to unify the palette toward gold.
 *
 * Everything here is pointer-events:none + aria-hidden — it must never trap a
 * tap or be announced. It does not depend on any plate, so it works identically
 * over placeholders and real art.
 */

/** ≤16 motes — authored once so positions/durations are stable across renders. */
const MOTES = [
  { left: '8%', top: '64%', size: 3, dur: 19, delay: 0 },
  { left: '17%', top: '38%', size: 2, dur: 23, delay: -4 },
  { left: '24%', top: '72%', size: 4, dur: 17, delay: -8 },
  { left: '33%', top: '52%', size: 2, dur: 26, delay: -2 },
  { left: '41%', top: '80%', size: 3, dur: 21, delay: -11 },
  { left: '48%', top: '44%', size: 2, dur: 24, delay: -6 },
  { left: '55%', top: '68%', size: 4, dur: 18, delay: -14 },
  { left: '62%', top: '34%', size: 2, dur: 27, delay: -3 },
  { left: '69%', top: '76%', size: 3, dur: 20, delay: -9 },
  { left: '76%', top: '50%', size: 2, dur: 25, delay: -16 },
  { left: '83%', top: '62%', size: 3, dur: 22, delay: -5 },
  { left: '89%', top: '40%', size: 2, dur: 28, delay: -12 },
  { left: '13%', top: '86%', size: 2, dur: 23, delay: -7 },
  { left: '46%', top: '24%', size: 2, dur: 29, delay: -18 },
  { left: '72%', top: '88%', size: 3, dur: 19, delay: -10 },
  { left: '93%', top: '74%', size: 2, dur: 26, delay: -15 },
] as const;

export function FilmGrain() {
  return (
    <div className="cdesert-finish" aria-hidden="true">
      {/* 1 — static baked grain */}
      <svg className="cdesert-grain" width="100%" height="100%" preserveAspectRatio="none">
        <filter id="cdesert-grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves={3}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cdesert-grain-filter)" />
      </svg>

      {/* 2 — vignette */}
      <div className="cdesert-vignette" />

      {/* 4 — warm color-grade tint (sits under the motes, over the vignette) */}
      <div className="cdesert-tint" />

      {/* 3 — drifting dust motes */}
      <div className="cdesert-motes">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="cdesert-mote"
            style={{
              left: m.left,
              top: m.top,
              width: m.size,
              height: m.size,
              animationDuration: `${m.dur}s`,
              animationDelay: `${m.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
