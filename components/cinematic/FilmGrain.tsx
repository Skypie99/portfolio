/**
 * FilmGrain — the plate-agnostic finishing layer that sits on top of the whole
 * scene. PERF rebuild (2026-06-02): trimmed to the cheap, static finish only:
 *
 *   1. a STATIC SVG grain (feTurbulence, fractalNoise, 3 octaves) at low
 *      opacity — rendered once, never animated (animated turbulence is a known
 *      GPU killer, so we bake a single noise field and leave it).
 *   2. a radial VIGNETTE that darkens the corners and focuses the eye.
 *   3. a warm color-grade tint to unify the palette toward gold.
 *
 * The 16 animated dust motes were REMOVED here: 16 continuously-transforming
 * compositor layers is real per-frame GPU cost for dust that's barely visible,
 * and they kept a hot ticker even at rest. The grain + vignette already give the
 * frame its film texture. (See the perf report on perf/cinematic-lightweight.)
 *
 * Everything here is pointer-events:none + aria-hidden — it must never trap a
 * tap or be announced. It does not depend on any plate, so it works identically
 * over placeholders and real art.
 */

export function FilmGrain() {
  return (
    <div className="cdesert-finish" aria-hidden="true">
      {/* 1 — static baked grain */}
      <svg className="cdesert-grain" width="100%" height="100%" preserveAspectRatio="none">
        <filter id="cdesert-grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={3}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cdesert-grain-filter)" />
      </svg>

      {/* 2 — vignette */}
      <div className="cdesert-vignette" />

      {/* 2b — scroll-driven push-in (art pass): deepens as the gold lands.
          Driven by CinematicDesert (opacity 0→1 over p[0.70,1.0]); rests fully
          drawn-in on the static frame via the .cdesert-static-stage scope rule. */}
      <div className="cdesert-vignette-arc" />

      {/* 3 — warm color-grade tint (over the vignette) */}
      <div className="cdesert-tint" />
    </div>
  );
}
