import { forwardRef } from 'react';

import { sourcesFor, srcFor, type Plate } from './plates';

/**
 * One depth plate, rendered as an absolutely-positioned full-bleed <img> wrapped
 * in a <picture> that serves AVIF (primary) → WebP (fallback) → the <img> WebP.
 *
 * The heavy source PNGs don't ship (only AVIF+WebP do, ~80% lighter, alpha
 * intact); AVIF+WebP together cover ~all 2026 browsers. The <img> is still the
 * single rendered box and the GSAP transform target — the parent forwards a ref
 * to it and drives `scale` / `yPercent` / `opacity` from the master timeline.
 * <picture> only chooses the source; it generates no box of its own, so the
 * absolute-positioned img (.cdesert-layer) lays out exactly as before. We keep
 * will-change:transform on the img so the compositor promotes one layer per
 * plate.
 *
 * `object-fit: cover` crops the 21:9 plate to the viewport without distortion;
 * `draggable={false}` and empty alt keep it inert/decorative (the scene is
 * announced by the section, the plate art carries no information of its own).
 */
type LayerProps = {
  plate: Plate;
  /** ascending paint order; index 0 (sky) sits at the back */
  z: number;
  /** eager-load this plane (the first/dawn beat); later beats lazy-load. */
  eager?: boolean;
};

export const Layer = forwardRef<HTMLImageElement, LayerProps>(function Layer(
  { plate, z, eager = false },
  ref,
) {
  const startOpacity = plate.opacity ? plate.opacity.from : 1;
  const { avif, webp } = sourcesFor(plate);

  return (
    <picture>
      {avif && <source type="image/avif" srcSet={avif} />}
      {webp && <source type="image/webp" srcSet={webp} />}
      <img
        ref={ref}
        src={srcFor(plate)}
        alt=""
        aria-hidden="true"
        draggable={false}
        data-plate={plate.id}
        className="cdesert-layer"
        // ALL planes load eagerly. Lazy-loading off-screen beats meant their AVIF
        // decoded on the main thread the first time each scene scrolled into view —
        // a ~1s hitch per scene mid-scroll (the "glitchy at points"). Eager-loading
        // (~1.8MB total) front-loads fetch+decode to page-open; CinematicDesert then
        // forces `img.decode()` on all planes so they're GPU-ready before any scroll.
        // (`eager` prop retained for API compatibility; all planes are eager now.)
        loading="eager"
        decoding="async"
        style={{
          zIndex: z,
          // Seed the pre-animation state so SSR/first paint already matches the
          // p=0 frame (no flash before GSAP attaches). GSAP overwrites these.
          opacity: startOpacity,
          transform: `translateY(${plate.yFrom}%) scale(${plate.scaleFrom})`,
        }}
      />
    </picture>
  );
});
