import { FilmGrain } from './FilmGrain';
import { ARRIVAL_ID, PLATES, srcFor, type Plate } from './plates';

/**
 * StaticDesertFrame — a single composed frame at the ARRIVAL state, with NO
 * ScrollTrigger, NO timeline, and no motion of its own. This is what we render
 * for users who prefer reduced motion and for narrow (phone) viewports, where a
 * 500vh pinned scroll-hijack would be hostile.
 *
 * It paints the same plates as the live scene but frozen at roughly their p≈1
 * end transforms (near-rockface risen to fill the lower frame, sky-day shown,
 * foreground already drifted past and faded out), the warm grade, the resolved
 * title, and the grain/vignette finish. The result reads as the destination
 * shot — the same place the animated push arrives at — so nothing feels missing.
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
          // Hold each plate at a representative late-push transform. We don't go
          // all the way to scaleTo for the near layers (that would blow the
          // subject out of frame); the arrival reads best a touch before p=1.
          const isArrival = plate.id === ARRIVAL_ID;
          const scale = isArrival
            ? plate.scaleTo * 0.86
            : plate.scaleFrom + (plate.scaleTo - plate.scaleFrom) * 0.7;
          const y = plate.yFrom + (plate.yTo - plate.yFrom) * 0.82;
          return (
            <img
              key={plate.id}
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
          );
        })}

        {/* warm grade + lifted exposure held at the sunrise end of the arc */}
        <div className="cdesert-grade cdesert-grade--warm" aria-hidden="true" />
        <div className="cdesert-exposure cdesert-exposure--warm" aria-hidden="true" />
        <div className="cdesert-sun cdesert-sun--bloom" aria-hidden="true" />

        {/* resolved wordmark */}
        <div className="cdesert-title cdesert-title--resolved">
          <p className="cdesert-title-mark">SkyPi Studio</p>
        </div>

        <FilmGrain />
      </div>
    </section>
  );
}
