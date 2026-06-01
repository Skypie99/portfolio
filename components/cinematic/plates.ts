/**
 * plates.ts — the data-driven manifest for the 2.5D camera-push desert.
 *
 * Every layer of the cinematic is described here as pure data. The engine
 * (CinematicDesert.tsx) reads this array and drives one GSAP timeline from it,
 * so the choreography lives in ONE place and swapping placeholder art for the
 * real photographic plates is a single flag flip — see USE_PLACEHOLDERS below.
 *
 * Ordering: back → front (index 0 renders furthest back). The render layers the
 * array in order with ascending z-index, so a nearer plate always composites on
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
  /** stable id; also the real-plate filename stem (/images/cinematic/<id>.png) */
  id: string;
  /** human label, used for the placeholder caption + alt-debug only */
  label: string;
  /** real photographic plate (dropped in later by Sky) */
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

/**
 * THE FLIP. While Sky is still generating the 6 real PNGs, this stays `true`
 * and the engine renders the SVG placeholders. The day the real plates land in
 * public/images/cinematic/<id>.png, change this one line to `false` and the
 * whole scene swaps to photographic art — no other code changes, and
 * scripts/validate-assets.mjs will then enforce that all 6 PNGs are present.
 */
export const USE_PLACEHOLDERS = true;

/**
 * back → front. yPercent/scale ramps authored to Dani's blueprint.
 * Nearer layers move faster (bigger scale Δ, larger downward drift) to sell the
 * camera pushing forward into the arrival.
 */
export const PLATES: readonly Plate[] = [
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
] as const;

/** The arrival subject — the plate the whole push resolves onto. */
export const ARRIVAL_ID = 'near-rockface';

/**
 * Which image source to render for a plate, honoring the global flag.
 * One place decides placeholder-vs-real so the flip is total and consistent.
 */
export function srcFor(plate: Plate): string {
  return USE_PLACEHOLDERS ? plate.placeholderSrc : plate.plateSrc;
}

/** The 6 ids, in back→front order. Used by validate-assets.mjs. */
export const PLATE_IDS: readonly string[] = PLATES.map((p) => p.id);
