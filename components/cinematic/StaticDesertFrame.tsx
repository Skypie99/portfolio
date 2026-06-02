import type { CSSProperties } from 'react';

import { FilmGrain } from './FilmGrain';
import { ARRIVAL_ID, PLATES, SCENES, sourcesFor, srcFor, type Plate } from './plates';

/**
 * StaticDesertFrame — a single composed frame at the ARRIVAL state, with NO
 * ScrollTrigger, NO timeline, and no motion of its own. This is what we render
 * for users who prefer reduced motion and for narrow (phone) viewports, where a
 * 680vh pinned scroll-hijack would be hostile.
 *
 * It paints the ARRIVAL beat's planes (the golden fluted cliff — the most
 * impressive frame of the piece) frozen near their p≈1 transforms (wall risen to
 * fill the frame, talus settled), the warm grade + lifted exposure, the golden
 * sun parked at the arrival crest, the resolved title, and the grain/vignette
 * finish. The result IS the destination shot, so nothing feels missing.
 *
 * (PLATES resolves to the ARRIVAL scene's planes — see plates.ts back-compat
 * aliases — so this stays the golden cliff even though the live scene now has
 * three beats.)
 */

/** The arrival beat's measured sun (upper-right crest), for the static bloom. */
const ARRIVAL_SUN = SCENES[SCENES.length - 1]?.sun ?? { x: 0.7, y: 0.3 };

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
          const { avif, webp } = sourcesFor(plate);
          return (
            <picture key={plate.id}>
              {avif && <source type="image/avif" srcSet={avif} />}
              {webp && <source type="image/webp" srcSet={webp} />}
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
        <div
          className="cdesert-sun cdesert-sun--bloom"
          style={
            {
              '--sun-x': `${ARRIVAL_SUN.x * 100}%`,
              '--sun-y': `${ARRIVAL_SUN.y * 100}%`,
            } as CSSProperties
          }
          aria-hidden="true"
        />

        {/* resolved wordmark */}
        <div className="cdesert-title cdesert-title--resolved">
          <p className="cdesert-title-mark">SkyPi Studio</p>
        </div>

        <FilmGrain />
      </div>
    </section>
  );
}
