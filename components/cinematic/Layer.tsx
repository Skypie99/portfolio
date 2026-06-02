import { forwardRef } from 'react';

import { srcFor, type Plate } from './plates';

/**
 * One depth plate, rendered as an absolutely-positioned full-bleed <img>.
 *
 * The element is the GSAP transform target — the parent forwards a ref and
 * drives `scale` / `yPercent` / `opacity` on it from the master timeline. We
 * keep will-change:transform on THIS wrapper img (not on inner nodes, which
 * don't exist for a raster plate) so the compositor promotes exactly one layer
 * per plate.
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

  return (
    <img
      ref={ref}
      src={srcFor(plate)}
      alt=""
      aria-hidden="true"
      draggable={false}
      data-plate={plate.id}
      className="cdesert-layer"
      // The dawn beat (eager) loads immediately so the opening frame is sharp;
      // off-screen beats (mid/arrival) lazy-load as the user scrolls toward them
      // — 9 hi-res planes shouldn't all block the open. (We deliberately don't
      // set fetchpriority: React 18.3's prop handling for it is inconsistent
      // between SSR/jsdom/DOM and warns either spelling; `loading="eager"`
      // already front-loads the dawn planes, which is what matters.)
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={{
        zIndex: z,
        // Seed the pre-animation state so SSR/first paint already matches the
        // p=0 frame (no flash before GSAP attaches). GSAP overwrites these.
        opacity: startOpacity,
        transform: `translateY(${plate.yFrom}%) scale(${plate.scaleFrom})`,
      }}
    />
  );
});
