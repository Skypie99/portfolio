
import { FilmGrain } from './FilmGrain';
import { ARRIVAL_ID, PLATES, SCENES, sourcesFor, srcFor, type Plate } from './plates';

/**
 * StaticDesertFrame — a single composed frame at the ARRIVAL state, with NO
 * ScrollTrigger, NO timeline, and no motion of its own. This is what we render
 * for users who prefer reduced motion and for narrow (phone) viewports, where a
 * 680vh pinned scroll-hijack would be hostile.
 *
 * It paints the ARRIVAL destination — the golden fluted cliff — frozen near its
 * landed transform (wall risen to fill the frame). RECUT 2026-06-02: the cliff has
 * no base of its own (arrival-fg dropped), so the plane stack ends with the
 * persistent FLOOR (mid-fg) UNDER the wall — the cliff sits on the same ground the
 * live scene rides on. Warm grade + lifted exposure are an EVEN warm wash (no sun
 * bloom — that disc was cheap glare). The result IS the destination shot, so
 * nothing feels missing.
 *
 * (PLATES resolves to [arrival-sky, arrival-cliff, mid-fg floor] — see plates.ts
 * back-compat aliases — back→front, the floor last/on-top. ARRIVAL_ID stays the
 * cliff so it parks at its landed scale and the floor/sky settle behind/under it.)
 */


/** End-state opacity for a plate (its post-p1 value if it has an opacity ramp). */
function endOpacity(plate: Plate): number {
  return plate.opacity ? plate.opacity.to : 1;
}

export function StaticDesertFrame() {
  return (
    <section className="cdesert-static" aria-label="SkyPi Studio — desert title scene">
      <div className="cdesert-static-stage">
        {/* plates, frozen near their arrival transforms */}
        {PLATES.map((plate, i) => {
          // Hold each plate at a representative late-push transform. With the
          // PERF scale caps (2026-06-02) the whole push Δ is gentle, so the
          // arrival subject reads best parked AT its scaleTo (the old ×0.86
          // pull-back was to keep the 1.5× wall in frame; at 1.30 it sits clean).
          const isArrival = plate.id === ARRIVAL_ID;
          const scale = isArrival
            ? plate.scaleTo
            : plate.scaleFrom + (plate.scaleTo - plate.scaleFrom) * 0.85;
          const y = plate.yFrom + (plate.yTo - plate.yFrom) * 0.85;
          const { avifSrcSet, webpSrcSet } = sourcesFor(plate);
          return (
            <picture key={plate.id}>
              {/* sizes="100vw" — same full-bleed contract as Layer.tsx; the
                  static frame (reduced-motion) also benefits from the mobile
                  tier where one exists (arrival-cliff, mid-fg). */}
              {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes="100vw" />}
              {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes="100vw" />}
              <img
                src={srcFor(plate)}
                alt=""
                aria-hidden="true"
                draggable={false}
                data-plate={plate.id}
                className="cdesert-layer"
                style={{
                  zIndex: i,
                  opacity: endOpacity(plate),
                  transform: `translateY(${y}%) scale(${scale})`,
                }}
              />
            </picture>
          );
        })}

        {/* warm grade + lifted exposure held at the golden end of the arc */}
        <div className="cdesert-grade cdesert-grade--warm" aria-hidden="true" />
        <div className="cdesert-exposure cdesert-exposure--warm" aria-hidden="true" />
        {/* sun-bloom REMOVED — the arrival cliff photo is already golden-lit; the
            added glow read as cheap glare (Sky, 2026-06-02). Warmth stays via grade. */}

        {/* resolved wordmark */}
        <div className="cdesert-title cdesert-title--resolved">
          <p className="cdesert-title-mark">SkyPi Studio</p>
        </div>

        <FilmGrain />
      </div>
    </section>
  );
}
