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
};

export const Layer = forwardRef<HTMLImageElement, LayerProps>(function Layer(
  { plate, z },
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
