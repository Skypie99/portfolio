/**
 * plates.ts — the data-driven manifest for the 2.5D camera-push desert.
 *
 * ── PIVOT (2026-06-01, Dani) ────────────────────────────────────────────────
 * We are NO LONGER compositing 6 isolated AI plates. Sky now generates whole
 * cohesive SCENES (one Midjourney vista) and we separate each scene into a small
 * stack of DEPTH PLANES (transparent PNGs) on disk. The engine drives that plane
 * stack with one GSAP timeline exactly as before — the choreography model
 * (scale + yPercent + opacity over progress p) is unchanged.
 *
 * The active scene is described by `ACTIVE_SCENE` below: its planes (back→front)
 * each carry their own depth transform. CinematicDesert.tsx reads `PLATES`
 * (which is just `ACTIVE_SCENE.planes`) and animates them; nothing in the engine
 * knows or cares that the art now comes from one separated vista instead of six
 * generated plates.
 *
 * Ordering: back → front (index 0 renders furthest back). The render layers the
 * array in order with ascending z-index, so a nearer plane always composites on
 * top of everything behind it.
 *
 * Transform model (matches Dani's director blueprint):
 *   scaleFrom/scaleTo — GSAP `scale`, grows over progress p (nearer = larger Δ
 *                       = reads as a forward dolly).
 *   yFrom/yTo         — GSAP `yPercent` (percent of the element's own height),
 *                       drift. Positive = downward. Transform-only; we NEVER
 *                       animate top/left/width/height.
 *   opacity           — optional crossfade/reveal, ramped over a sub-range
 *                       [p0,p1] of the master progress (outside the range it
 *                       holds at `from` before p0 and `to` after p1).
 *
 * All numbers are authored against progress p ∈ [0,1] across the pinned range.
 *
 * SOURCE-RESOLUTION NOTE: the dawn vista is 1680×720 (21:9). That's fine for this
 * prototype, but the near plane scales to ~2.4× at the deepest push, so the final
 * cut likely wants a 2× upscale of the source (→3360×1440) so the foreground
 * stays crisp at full dolly. Flagged for Sky.
 */

export type PlateOpacity = {
  from: number;
  to: number;
  /** progress at which the opacity ramp starts */
  p0: number;
  /** progress at which the opacity ramp ends */
  p1: number;
};

export type Plate = {
  /** stable id; also the plane filename stem (/images/cinematic/<id>.png) */
  id: string;
  /** human label, used for the placeholder caption + alt-debug only */
  label: string;
  /** real depth-plane art (separated from the source vista) */
  plateSrc: string;
  /** distinct, legible stand-in used during the motion-mechanics phase */
  placeholderSrc: string;
  /** true = PNG has alpha and composites over the layers behind it */
  transparent: boolean;
  scaleFrom: number;
  scaleTo: number;
  /** yPercent at p=0 */
  yFrom: number;
  /** yPercent at p=1 */
  yTo: number;
  /** optional opacity ramp; omitted = fully opaque the whole way */
  opacity?: PlateOpacity;
};

/** A whole separated vista: a back→front stack of depth planes + the arrival id. */
export type Scene = {
  /** stable scene id (also the source vista stem) */
  id: string;
  /** the depth planes, back → front */
  planes: readonly Plate[];
  /** which plane the camera push resolves onto (the arrival subject) */
  arrivalId: string;
};

/**
 * THE FLIP. When `true`, the engine renders the grey SVG placeholders (the
 * motion-mechanics phase). Now that the real DAWN scene planes exist on disk we
 * default to `false` so the photographic separated vista drives the scene; the
 * placeholder code path is kept intact (and simply unused) so the mechanics rig
 * can be re-enabled by flipping this one line. validate-assets.mjs reads this:
 * false → it enforces the real scene planes exist.
 */
export const USE_PLACEHOLDERS = false;

/**
 * ── THE DAWN VISTA, separated into 3 depth planes ───────────────────────────
 * Source: public/images/cinematic/source/dawn-vista.png (Midjourney, cleared to
 * ship). Separated by components/cinematic separation pass (sky/mid/fg).
 *
 *   dawn-sky → back layer, barely moves (the distant backdrop)
 *   dawn-mid → buttes + mesas + valley floor; grow as we approach
 *   dawn-fg  → near red ledge + sage scrub; races down past the camera
 *
 * Depth ramps per Dani's director blueprint:
 *   sky   scale 1.04→1.10, y  0→-1   (parallax floor; almost still)
 *   mid   scale 1.00→1.60, y  0→+8   (buttes loom)
 *   fg    scale 1.15→2.40, y +4→+34  (foreground rushes by)
 */
export const DAWN_SCENE: Scene = {
  id: 'dawn-vista',
  arrivalId: 'dawn-mid',
  planes: [
    {
      id: 'dawn-sky',
      label: 'dawn sky (backdrop)',
      plateSrc: '/images/cinematic/dawn-sky.png',
      placeholderSrc: '/images/cinematic/_placeholders/sky-dawn.svg',
      transparent: false,
      scaleFrom: 1.04,
      scaleTo: 1.1,
      yFrom: 0,
      yTo: -1,
    },
    {
      id: 'dawn-mid',
      label: 'dawn buttes + valley (mid)',
      plateSrc: '/images/cinematic/dawn-mid.png',
      placeholderSrc: '/images/cinematic/_placeholders/mid-mesa.svg',
      transparent: true,
      scaleFrom: 1.0,
      scaleTo: 1.6,
      yFrom: 0,
      yTo: 8,
    },
    {
      id: 'dawn-fg',
      label: 'dawn red ledge + scrub (near)',
      plateSrc: '/images/cinematic/dawn-fg.png',
      placeholderSrc: '/images/cinematic/_placeholders/foreground.svg',
      transparent: true,
      scaleFrom: 1.15,
      scaleTo: 2.4,
      yFrom: 4,
      yTo: 34,
    },
  ],
} as const;

/**
 * ── Placeholder scene (motion-mechanics rig) ────────────────────────────────
 * The original 6-plate grey-SVG stand-ins. Retained, unused while
 * USE_PLACEHOLDERS=false, so the mechanics rig can be brought back by flipping
 * the flag. Mirrors the depth ramps the mechanics phase was verified against.
 */
const PLACEHOLDER_SCENE: Scene = {
  id: 'placeholders',
  arrivalId: 'near-rockface',
  planes: [
    {
      id: 'sky-dawn',
      label: 'sky-dawn',
      plateSrc: '/images/cinematic/sky-dawn.png',
      placeholderSrc: '/images/cinematic/_placeholders/sky-dawn.svg',
      transparent: false,
      scaleFrom: 1.0,
      scaleTo: 1.06,
      yFrom: 0,
      yTo: -1,
      opacity: { from: 1, to: 0, p0: 0.2, p1: 0.65 },
    },
    {
      id: 'sky-day',
      label: 'sky-day',
      plateSrc: '/images/cinematic/sky-day.png',
      placeholderSrc: '/images/cinematic/_placeholders/sky-day.svg',
      transparent: false,
      scaleFrom: 1.0,
      scaleTo: 1.06,
      yFrom: 0,
      yTo: -1,
      opacity: { from: 0, to: 1, p0: 0.2, p1: 0.65 },
    },
    {
      id: 'far-ridge',
      label: 'far-ridge',
      plateSrc: '/images/cinematic/far-ridge.png',
      placeholderSrc: '/images/cinematic/_placeholders/far-ridge.svg',
      transparent: true,
      scaleFrom: 1.0,
      scaleTo: 1.25,
      yFrom: 0,
      yTo: 3,
    },
    {
      id: 'mid-mesa',
      label: 'mid-mesa',
      plateSrc: '/images/cinematic/mid-mesa.png',
      placeholderSrc: '/images/cinematic/_placeholders/mid-mesa.svg',
      transparent: true,
      scaleFrom: 1.0,
      scaleTo: 1.6,
      yFrom: 0,
      yTo: 8,
    },
    {
      id: 'near-rockface',
      label: 'near-rockface',
      plateSrc: '/images/cinematic/near-rockface.png',
      placeholderSrc: '/images/cinematic/_placeholders/near-rockface.svg',
      transparent: true,
      scaleFrom: 1.05,
      scaleTo: 2.15,
      yFrom: 6,
      yTo: 18,
      opacity: { from: 0, to: 1, p0: 0.42, p1: 0.62 },
    },
    {
      id: 'foreground',
      label: 'foreground',
      plateSrc: '/images/cinematic/foreground.png',
      placeholderSrc: '/images/cinematic/_placeholders/foreground.svg',
      transparent: true,
      scaleFrom: 1.1,
      scaleTo: 2.6,
      yFrom: 4,
      yTo: 30,
      opacity: { from: 1, to: 0, p0: 0.45, p1: 0.7 },
    },
  ],
} as const;

/**
 * The scene the engine renders. We swap the WHOLE scene on the flag so the
 * placeholder rig and the real vista can't half-mix (e.g. 6 ids vs 3).
 */
export const ACTIVE_SCENE: Scene = USE_PLACEHOLDERS ? PLACEHOLDER_SCENE : DAWN_SCENE;

/** back → front. The engine maps one GSAP timeline over these. */
export const PLATES: readonly Plate[] = ACTIVE_SCENE.planes;

/** The arrival subject — the plane the whole push resolves onto. */
export const ARRIVAL_ID = ACTIVE_SCENE.arrivalId;

/**
 * Which image source to render for a plane, honoring the global flag.
 * One place decides placeholder-vs-real so the flip is total and consistent.
 */
export function srcFor(plate: Plate): string {
  return USE_PLACEHOLDERS ? plate.placeholderSrc : plate.plateSrc;
}

/** The active scene's plane ids, in back→front order. Used by validate-assets.mjs. */
export const PLATE_IDS: readonly string[] = PLATES.map((p) => p.id);
