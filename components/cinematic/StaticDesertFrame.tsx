import { Fragment } from 'react';

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
            <Fragment key={plate.id}>
            <picture>
              {/* CONFLICT RESOLUTION (2026-08-26, Sky-unlocked): both sides of
                  this hunk were legitimate and neither was reverted.
                  · main's side is the art pass — each plate wrapped in a
                    <Fragment> so the landed rim-glow can be a SIBLING of the
                    <picture> (a div is invalid picture content). The key moved
                    to the Fragment when that happened. Kept exactly.
                  · perf/trim-hero-weight's side is the mobile tier — sourcesFor()
                    now returns srcSets rather than single srcs, and each <source>
                    declares sizes="100vw", the same full-bleed contract Layer.tsx
                    uses. Kept exactly.
                  The old `avif`/`webp` names had to go regardless: the
                  destructure four lines up auto-merged to the srcSet names, so
                  main's identifiers no longer exist. That is the whole conflict —
                  a rename crossing a re-wrap, not a disagreement.
                  sizes="100vw" earns its place here too: the static frame is what
                  reduced-motion visitors see, and it benefits from the mobile
                  tier wherever one exists (arrival-cliff, mid-fg). */}
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
            {/* landed rim-glow (art pass): the static destination shot keeps a
                calmer 0.5 of the live peak — no motion narrative to justify a
                hot rim for reduced-motion visitors. Same park transform as the
                cliff. A SIBLING of the <picture> (a div is invalid picture
                content per the HTML model — verify-fleet tidy); both resolve
                their containing block to .cdesert-static-stage, so geometry and
                the explicit zIndex paint order are unchanged. */}
            {isArrival && (
              <div
                className="cdesert-cliff-glow cdesert-cliff-glow--landed"
                aria-hidden="true"
                style={{ zIndex: i, transform: `translateY(${y}%) scale(${scale})` }}
              />
            )}
            </Fragment>
          );
        })}

        {/* warm grade + lifted exposure held at the golden end of the arc */}
        <div className="cdesert-grade cdesert-grade--warm" aria-hidden="true" />
        <div className="cdesert-exposure cdesert-exposure--warm" aria-hidden="true" />
        {/* sun-bloom REMOVED — the arrival cliff photo is already golden-lit; the
            added glow read as cheap glare (Sky, 2026-06-02). Warmth stays via grade. */}

        {/* resolved wordmark — data-text feeds the gilded-ink ::after overlay */}
        <div className="cdesert-title cdesert-title--resolved">
          <p className="cdesert-title-mark" data-text="SkyPi Studio">SkyPi Studio</p>
        </div>

        <FilmGrain />
      </div>
    </section>
  );
}
