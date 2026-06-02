/**
 * plates.ts — the data-driven manifest for the 2.5D camera-push desert.
 *
 * ── 3-BEAT DESCENT (2026-06-01, Dani) ───────────────────────────────────────
 * The piece is now a single continuous scroll-scrubbed camera push through THREE
 * beats, no cuts:
 *
 *   DAWN    deep cool blue-hour Monument Valley vista → pushes into the valley
 *   ↳ dissolve A (near-seamless — same valley, central-spire lock holds)
 *   MID     warmer daylight, same valley pushed closer → continues forward
 *   ↳ dissolve B (the one real leap — valley → cliff, resolved IN through haze)
 *   ARRIVAL golden close-up of a fluted sandstone cliff → title carves + HOLDS
 *
 * Each beat is a whole Midjourney vista SEPARATED into a small stack of depth
 * planes (transparent PNGs) by scripts/separate-scene.mjs. The engine drives the
 * planes with ONE GSAP timeline (progress p ∈ [0,1]); each scene's planes animate
 * within that scene's `range`, and the three scene GROUPS cross-dissolve on their
 * `dissolve` windows. No second timeline, no per-frame listeners.
 *
 * Authority: designs/AESTHETIC_LOCKFILE.md (commit 46fbc19). The dissolve
 * windows, exposure ramp, and per-scene sun positions below are transcribed from
 * §1, §3, §4 of that lockfile.
 *
 * Ordering within a scene: back → front (index 0 furthest back). The render
 * layers each scene's array with ascending z-index so a nearer plane always
 * composites over everything behind it.
 *
 * Transform model (unchanged):
 *   scaleFrom/scaleTo — GSAP `scale`; nearer = larger Δ = forward dolly.
 *   yFrom/yTo         — GSAP `yPercent` (percent of the element's own height).
 *   opacity           — optional per-plane reveal/exit over a sub-range [p0,p1].
 * All numbers are authored against the SCENE's local progress (0→1 across its
 * `range`), so a plane's depth ramp is independent of where its scene sits on the
 * master timeline. Transform-only; we NEVER animate top/left/width/height.
 */

export type PlateOpacity = {
  from: number;
  to: number;
  /** progress at which the opacity ramp starts (scene-local) */
  p0: number;
  /** progress at which the opacity ramp ends (scene-local) */
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
  /** yPercent at scene-local p=0 */
  yFrom: number;
  /** yPercent at scene-local p=1 */
  yTo: number;
  /** optional opacity ramp; omitted = fully opaque the whole way */
  opacity?: PlateOpacity;
};

/** Master-timeline window [start,end] in p∈[0,1]. */
export type Range = { start: number; end: number };

/** A whole separated vista: a back→front stack of depth planes + choreography. */
export type Scene = {
  /** stable scene id (also the source vista stem) */
  id: string;
  /** the depth planes, back → front */
  planes: readonly Plate[];
  /** which plane the camera push resolves onto (the arrival subject) */
  arrivalId: string;
  /** the master-timeline window over which this scene's planes do their push */
  range: Range;
  /** group cross-dissolve IN window (opacity 0→1) on the master timeline */
  fadeIn: Range;
  /** group cross-dissolve OUT window (opacity 1→0); null = holds to p=1 */
  fadeOut: Range | null;
  /** measured sun/brightest-point for this beat, fraction of frame (origin TL) */
  sun: { x: number; y: number };
  /** peak opacity of this beat's sun bloom. Dawn is a SUBTLE pre-dawn glow; the
   *  big bright bloom is reserved for arrival (golden). Keeps the dawn beat's
   *  negative space + low key intact (lockfile §1, §6). */
  sunMax: number;
};

/**
 * THE FLIP. When `true`, the engine renders the grey SVG placeholders (the
 * motion-mechanics phase). The real 3-beat scenes exist on disk, so we default to
 * `false`. validate-assets.mjs reads this: false → it enforces the real scene
 * planes exist (all 9, unioned across the 3 scenes).
 */
export const USE_PLACEHOLDERS = false;

/**
 * ── BEAT 1 — DAWN VISTA (3 depth planes) ────────────────────────────────────
 * Source: source/dawn-vista.png. Separated (vista layout) into sky/mid/fg.
 * Depth ramps (scene-local p): sky barely moves; mid (buttes+valley) looms; fg
 * (near red ledge + scrub) races down past the camera. Cool, dark, vast.
 */
const DAWN_SCENE: Scene = {
  id: 'dawn-vista',
  arrivalId: 'dawn-mid',
  range: { start: 0.0, end: 0.46 },
  fadeIn: { start: 0.0, end: 0.0 }, // already on screen at p=0
  fadeOut: { start: 0.36, end: 0.42 }, // dissolve A
  sun: { x: 0.5, y: 0.62 }, // warm glow dead-center on the horizon (sun rising center)
  sunMax: 0.34, // SUBTLE — pre-dawn glow only; the deep cold quiet keeps its dark
  planes: [
    {
      id: 'dawn-sky',
      label: 'dawn sky (backdrop)',
      plateSrc: '/images/cinematic/dawn-sky.png',
      placeholderSrc: '/images/cinematic/_placeholders/sky-dawn.svg',
      transparent: false,
      scaleFrom: 1.04,
      scaleTo: 1.12,
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
      scaleTo: 2.5,
      yFrom: 4,
      yTo: 34,
    },
  ],
} as const;

/**
 * ── BEAT 2 — MID APPROACH (3 depth planes) ──────────────────────────────────
 * Source: source/mid-approach.png. Separated (vista layout) into sky/mid/fg.
 * Same valley pushed closer; the central twin spires stay dead-center (the
 * continuity lock with dawn). Warmer, but graded LOW (the engine grade keeps it
 * off a daytime spike). The push CONTINUES forward through the dissolve.
 */
const MID_SCENE: Scene = {
  id: 'mid-approach',
  arrivalId: 'mid-mid',
  range: { start: 0.34, end: 0.74 },
  fadeIn: { start: 0.36, end: 0.42 }, // dissolve A (in)
  fadeOut: { start: 0.68, end: 0.74 }, // dissolve B (out)
  sun: { x: 0.62, y: 0.4 }, // raking key from upper-right
  sunMax: 0.52, // moderate side-key; warmer than dawn, not yet the golden bloom
  planes: [
    {
      id: 'mid-sky',
      label: 'mid sky (backdrop)',
      plateSrc: '/images/cinematic/mid-sky.png',
      placeholderSrc: '/images/cinematic/_placeholders/sky-day.svg',
      transparent: false,
      scaleFrom: 1.04,
      scaleTo: 1.12,
      yFrom: 0,
      yTo: -1,
    },
    {
      id: 'mid-mid',
      label: 'mid buttes + spires + plain',
      plateSrc: '/images/cinematic/mid-mid.png',
      placeholderSrc: '/images/cinematic/_placeholders/mid-mesa.svg',
      transparent: true,
      scaleFrom: 1.0,
      scaleTo: 1.7,
      yFrom: 0,
      yTo: 9,
    },
    {
      id: 'mid-fg',
      label: 'mid terracotta dunes + grass (near)',
      plateSrc: '/images/cinematic/mid-fg.png',
      placeholderSrc: '/images/cinematic/_placeholders/foreground.svg',
      transparent: true,
      scaleFrom: 1.15,
      scaleTo: 2.6,
      yFrom: 4,
      yTo: 34,
    },
  ],
} as const;

/**
 * ── BEAT 3 — ARRIVAL CLIFF (3 depth planes) ─────────────────────────────────
 * Source: source/arrival-cliff.png. Separated (cliff layout) into
 * sky/cliff/fg. The fluted wall is dominant; it resolves IN through haze on
 * dissolve B and the title carves over it. Golden — the richest light, earned
 * late. This scene HOLDS to p=1 (no fadeOut).
 */
const ARRIVAL_SCENE: Scene = {
  id: 'arrival-cliff',
  arrivalId: 'arrival-cliff',
  range: { start: 0.66, end: 1.0 },
  fadeIn: { start: 0.68, end: 0.74 }, // dissolve B (in)
  fadeOut: null, // holds to the end
  sun: { x: 0.7, y: 0.3 }, // warmest band on the upper-right crest
  sunMax: 0.9, // the golden bloom — the richest light, earned late
  planes: [
    {
      id: 'arrival-sky',
      label: 'arrival sky sliver (backdrop)',
      plateSrc: '/images/cinematic/arrival-sky.png',
      placeholderSrc: '/images/cinematic/_placeholders/sky-day.svg',
      transparent: false,
      scaleFrom: 1.04,
      scaleTo: 1.12,
      yFrom: 0,
      yTo: -1,
    },
    {
      id: 'arrival-cliff',
      label: 'arrival fluted cliff wall',
      plateSrc: '/images/cinematic/arrival-cliff.png',
      placeholderSrc: '/images/cinematic/_placeholders/near-rockface.svg',
      transparent: true,
      // the wall lands already large (it resolves IN, not from far away) and
      // settles with a gentle final push — a touch less Δ than the vista mids so
      // the flutes don't smear at the end.
      scaleFrom: 1.12,
      scaleTo: 1.5,
      yFrom: 0,
      yTo: 5,
    },
    {
      id: 'arrival-fg',
      label: 'arrival talus + sand (near)',
      plateSrc: '/images/cinematic/arrival-fg.png',
      placeholderSrc: '/images/cinematic/_placeholders/foreground.svg',
      transparent: true,
      scaleFrom: 1.15,
      scaleTo: 2.3,
      yFrom: 4,
      yTo: 28,
    },
  ],
} as const;

/** The 3 beats, in descent order. The engine sequences these on one timeline. */
export const SCENES: readonly Scene[] = [DAWN_SCENE, MID_SCENE, ARRIVAL_SCENE] as const;

/**
 * ── Placeholder scene (motion-mechanics rig) ────────────────────────────────
 * The original 6-plate grey-SVG stand-ins. Retained, unused while
 * USE_PLACEHOLDERS=false, so the mechanics rig can be brought back by flipping
 * the flag. Single-scene shape (the mechanics phase predates the 3-beat split).
 */
const PLACEHOLDER_SCENE: Scene = {
  id: 'placeholders',
  arrivalId: 'near-rockface',
  range: { start: 0.0, end: 1.0 },
  fadeIn: { start: 0.0, end: 0.0 },
  fadeOut: null,
  sun: { x: 0.5, y: 0.6 },
  sunMax: 0.7,
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
 * The scenes the engine renders. Swapping the WHOLE list on the flag keeps the
 * placeholder rig and the real vistas from half-mixing.
 */
export const ACTIVE_SCENES: readonly Scene[] = USE_PLACEHOLDERS
  ? [PLACEHOLDER_SCENE]
  : SCENES;

/**
 * ── Back-compat single-scene aliases ────────────────────────────────────────
 * The static frame + the reduced-motion test reference these. We point them at
 * the ARRIVAL beat (the golden cliff) so the static fallback is the most
 * impressive frame and ARRIVAL_ID stays meaningful.
 */
const FALLBACK_SCENE: Scene = USE_PLACEHOLDERS ? PLACEHOLDER_SCENE : ARRIVAL_SCENE;

/** back → front. Used by the static frame. */
export const PLATES: readonly Plate[] = FALLBACK_SCENE.planes;

/** The arrival subject — the plane the whole push resolves onto. */
export const ARRIVAL_ID = FALLBACK_SCENE.arrivalId;

/**
 * Which image source to render for a plane, honoring the global flag.
 * One place decides placeholder-vs-real so the flip is total and consistent.
 */
export function srcFor(plate: Plate): string {
  return USE_PLACEHOLDERS ? plate.placeholderSrc : plate.plateSrc;
}

/** Every plane id across all active scenes, back→front per scene. Used by
 *  validate-assets.mjs (kept in sync there as a literal union). */
export const PLATE_IDS: readonly string[] = ACTIVE_SCENES.flatMap((s) =>
  s.planes.map((p) => p.id),
);
