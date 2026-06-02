/**
 * plates.ts — the data-driven manifest for the 2.5D camera-push desert.
 *
 * ── 2-SCENE DESCENT over ONE CONTINUOUS FLOOR (2026-06-02, recut) ────────────
 * The piece is a single continuous scroll-scrubbed camera push: it OPENS in the
 * mid valley and ARRIVES at the fluted cliff, one dissolve, no cuts. The old DAWN
 * vista is dropped (Sky: "very natural and logical" — open already in the valley,
 * descend to the wall):
 *
 *   MID      warm daylight valley (sky + buttes) — the OPENER → pushes forward
 *   ↳ THE DISSOLVE (the one real leap — valley → cliff; the cliff RISES to cover it)
 *   ARRIVAL  golden close-up of a fluted sandstone cliff → title carves + HOLDS
 *
 * ── THE PERSISTENT FLOOR (load-bearing) ─────────────────────────────────────
 * The arrival cliff plane (arrival-cliff) is the fluted WALL only — its talus/base
 * lived in arrival-fg, which is now DROPPED. So the cliff has no ground; the bottom
 * of the frame is filled by the MID valley's floor (mid-fg) PERSISTING under the
 * rising wall. mid-fg is pulled into its OWN group (FLOOR_SCENE) that NEVER
 * dissolves and renders IN FRONT (top z). The mid sky/buttes fade out at the
 * dissolve; the floor does not — so the cliff rises out of ONE unbroken floor, no
 * second floor to cross-fade against (no doubling/ghosting).
 *
 * Render/z order back → front:  mid-sky, mid-mid  (↔ arrival-sky, arrival-cliff
 * cross-dissolving)  then the persistent mid-fg FLOOR on top. SCENES is ordered
 * [MID, ARRIVAL, FLOOR] so the floor group is rendered last (highest z).
 *
 * Each beat is a whole Midjourney vista SEPARATED into a small stack of depth
 * planes (transparent PNGs) by scripts/separate-scene.mjs. The engine drives the
 * planes with ONE GSAP timeline (progress p ∈ [0,1]); each scene's planes animate
 * within that scene's `range`, and the scene GROUPS cross-dissolve on their
 * `fadeIn`/`fadeOut` windows. No second timeline, no per-frame listeners.
 *
 * Light: every bloom is killed (sunMax 0 on every scene — the mid's old side-key
 * was the bright flash Sky saw during the transition). Warmth now comes ONLY from
 * an EVEN warm wash in the grade/exposure overlays (globals.css), no hotspot.
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
  /** stable id; also the plane filename stem (/images/cinematic/<id>.{avif,webp};
   *  plateSrc keeps the .png stem and sourcesFor() derives the shipped formats) */
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
  /** optional 2nd-phase transform drift on the MASTER timeline [start,end]
   *  (ABSOLUTE p, not scene-local), for a plane whose scene `range` ends before
   *  p=1 but which must KEEP MOVING — e.g. the persistent floor under the still-
   *  rising arrival cliff (so the foreground doesn't freeze). Applied as a 2nd
   *  `.to()` after the main fromTo, continuing from the plane's phase-1 end value. */
  phase2?: { toScale: number; toY: number; start: number; end: number };
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
  /** peak opacity of this beat's sun bloom. RECUT 2026-06-02: 0 on EVERY scene —
   *  the localized sun disc was the bright flash/glare Sky saw (the mid's bloom lit
   *  up during the transition). All warmth is now an EVEN wash from the grade +
   *  exposure overlays; there is ZERO bright hotspot at any scroll position. */
  sunMax: number;
};

/**
 * THE FLIP. When `true`, the engine renders the grey SVG placeholders (the
 * motion-mechanics phase). The real scenes exist on disk, so we default to
 * `false`. validate-assets.mjs reads this: false → it enforces the real scene
 * planes exist (the 5 USED planes, unioned across MID + ARRIVAL + FLOOR).
 */
export const USE_PLACEHOLDERS = false;

/**
 * ── SCENE 1 — MID APPROACH / THE OPENER (sky + buttes) ──────────────────────
 * Source: source/mid-approach.png. Separated (vista layout); we keep only the
 * sky + the buttes/spires here — the floor (mid-fg) is pulled into FLOOR_SCENE
 * below so it can PERSIST under the arrival. Warm daylight valley, graded by the
 * even wash. This is the opening frame (fadeIn {0,0} = already on screen); the
 * push CONTINUES forward through the dissolve, then sky+buttes fade out.
 */
const MID_SCENE: Scene = {
  id: 'mid-approach',
  arrivalId: 'mid-mid',
  range: { start: 0.0, end: 0.62 }, // OPENER — push runs from the top through the dissolve
  fadeIn: { start: 0.0, end: 0.0 }, // already on screen at p=0
  fadeOut: { start: 0.46, end: 0.62 }, // THE dissolve (out) — valley sky+buttes hand off to the cliff
  sun: { x: 0.62, y: 0.4 }, // (no bloom — sunMax 0; kept only as the element's anchor)
  sunMax: 0, // bloom KILLED — the mid side-key was the bright flash during the transition (Sky, 2026-06-02)
  planes: [
    {
      // RECUT 2026-06-02 — TRANSFORM-LOCKED TO mid-mid (1.30 / +4). The two tall
      // EDGE mesas are split across planes: their TOPS are baked into this sky plate,
      // their BASES live on mid-mid. With the old sky cap (1.08 / -1) the tops scaled
      // & drifted LESS than the bases (1.30 / +4) on the zoom, so the mesa tops
      // visibly detached from their lower halves (Sky, 2026-06-02). Locking this
      // plate's push to mid-mid's EXACTLY (scaleFrom/yFrom already match; now scaleTo/
      // yTo too) makes the two planes interpolate identically at every p → tops and
      // bases move as ONE, zero shear by construction. Cost: the sky/clouds now dolly
      // 30% (was 8%) — correct for a forward push, far better than a tear. (arrival-sky
      // is PURE sky, no rock, so it keeps its slow 1.08 parallax — only mid-sky locks.)
      id: 'mid-sky',
      label: 'mid sky (backdrop) — locked to mid-mid (carries the mesa tops)',
      plateSrc: '/images/cinematic/mid-sky.png',
      placeholderSrc: '/images/cinematic/_placeholders/sky-day.svg',
      transparent: false,
      scaleFrom: 1.0,
      scaleTo: 1.3, // LOCKED to mid-mid (was 1.08) — kills the mesa-top shear
      yFrom: 0,
      yTo: 4, // LOCKED to mid-mid (was -1)
    },
    {
      // PERF: capped to 1.30 (mid tier ceiling), travel scaled to the Δ.
      id: 'mid-mid',
      label: 'mid buttes + spires + plain',
      plateSrc: '/images/cinematic/mid-mid.png',
      placeholderSrc: '/images/cinematic/_placeholders/mid-mesa.svg',
      transparent: true,
      scaleFrom: 1.0,
      scaleTo: 1.3,
      yFrom: 0,
      yTo: 4,
    },
  ],
} as const;

/**
 * ── SCENE 2 — ARRIVAL CLIFF (sky sliver + fluted wall) ──────────────────────
 * Source: source/arrival-cliff.png. The fluted WALL is dominant; arrival-fg
 * (its talus/base) is DROPPED — the wall now rises out of the persistent mid
 * floor (FLOOR_SCENE) instead. It arrives by RISING to cover the valley (occlusion-
 * by-motion — no dust) and the title carves over it. Golden via the even wash.
 * HOLDS to p=1 (no fadeOut).
 */
const ARRIVAL_SCENE: Scene = {
  id: 'arrival-cliff',
  arrivalId: 'arrival-cliff',
  range: { start: 0.32, end: 0.62 }, // REFINE 2026-06-02: phase-1 shares the MID valley's window {…,0.62} so the cliff CO-MOVES with it (matched scale+velocity through the blend → seamless, not jarring); lands on 1.30 at 0.62, then arrival-cliff.phase2 carries it on
  // THE dissolve (in). 0.42 → 0.60 (REFINE 2026-06-02 r2: EVEN ease, moderate width —
  // a gradual cinematic dissolve, not a snap). The group fade is now sine.inOut (was
  // the front-loaded power2.out, which hit ~85% opaque by the window midpoint = the
  // "abrupt change" Sky kept seeing). The even ease gives a gentle onset (no front-load
  // snap); the moderate 0.18 window passes through the muddy 50/50 midpoint reasonably
  // quickly (a wider window lingered there = double-exposure). NOTE the irreducible
  // trade-off: crossfading a WIDE valley vista into a CLOSE cliff shows a brief overlap
  // of both at the midpoint — slower = less abrupt but muddier, faster = cleaner but
  // abrupt. This is the balance point. The cliff CO-MOVES with the valley (range starts
  // 0.32, co-scaled gap ≤2%, velocity-matched), both warm sandstone under one grade, so
  // the blend is a red-rock match-dissolve, not a scale-mismatch ghost. MID holds opaque
  // underneath (incoming-only) and is culled only at 0.64 (after the fade); HOLDS to p=1.
  //   arrival-sky.png has faint top-edge inpaint streaks; the rising cliff + warm
  //   sky-wash cover the upper frame by the time it's legible. If any streak peeks,
  //   bump start 0.40 → 0.42.
  fadeIn: { start: 0.42, end: 0.6 },
  fadeOut: null, // holds to the end
  sun: { x: 0.7, y: 0.3 }, // (no bloom — sunMax 0; kept only as the element's anchor)
  sunMax: 0, // bloom REMOVED — the cliff photo is already golden-lit; the added glow read as cheap glare (Sky). Warmth comes only from the even wash.
  planes: [
    {
      // PERF (2026-06-02): sky scale cap.
      id: 'arrival-sky',
      label: 'arrival sky sliver (backdrop)',
      plateSrc: '/images/cinematic/arrival-sky.png',
      placeholderSrc: '/images/cinematic/_placeholders/sky-day.svg',
      transparent: false,
      scaleFrom: 1.0,
      scaleTo: 1.08,
      yFrom: 0,
      yTo: -1,
    },
    {
      id: 'arrival-cliff',
      label: 'arrival fluted cliff wall',
      plateSrc: '/images/cinematic/arrival-cliff.png',
      placeholderSrc: '/images/cinematic/_placeholders/near-rockface.svg',
      transparent: true,
      // RECUT 2026-06-02 — CO-MOVING DOLLY (the dust is gone). The wall arrives by
      // COVERING the valley with its own opaque shape AND dollying in LOCKSTEP with it,
      // so the camera push is continuous through the handoff (no lurch — the fix for
      // the "jarring"). Its scene range is {0.32, 0.62} = the valley's window, so
      // phase-1 tracks the valley's scale+velocity and LANDS on 1.30 EXACTLY at p0.62
      // (scale gap ≤0.01, velocity ratio ~1 through the fade — vs the old pre-grown,
      // near-static cliff that popped in over a fast valley). scaleFrom 1.20 (was 1.12)
      // → MORE coverage during the fade AND closes the gap. yTo 6 settles WITH the
      // floor (floor yTo 6). phase2 (0.62→1.0) re-accelerates the cliff (1.30→1.38) so
      // it keeps dollying into the title hold and never freezes. Warm sandstone both
      // ends → a red-rock match-dissolve, not a crossfade.
      scaleFrom: 1.2,
      scaleTo: 1.3,
      yFrom: 5,
      yTo: 6,
      // 2nd-phase drift through the arrival (p0.62→1.0): keep dollying WITH the floor
      // so the foreground + wall arrive as ONE and nothing freezes.
      phase2: { toScale: 1.38, toY: 8, start: 0.62, end: 1.0 },
    },
  ],
} as const;

/**
 * ── FLOOR — the PERSISTENT desert floor (mid-fg, one plane) ─────────────────
 * The continuous ground the whole piece rides on. It is the MID valley's floor
 * (mid-fg) pulled into its OWN group so it NEVER dissolves: range 0→1, fadeIn
 * {0,0} (already on screen), fadeOut null (holds to p=1). Rendered LAST in SCENES
 * → highest z → it sits IN FRONT of everything, so the arrival cliff RISES OUT OF
 * this one floor. The mid sky/buttes fade out at the dissolve; this floor does not
 * — and there is no second floor to cross-fade against, so no doubling/ghosting.
 * Keeps its gentle fg push (scale cap 1.45, fg/floor tier).
 */
const FLOOR_SCENE: Scene = {
  id: 'floor',
  arrivalId: 'mid-fg',
  range: { start: 0.0, end: 0.62 }, // UNIFIED ZOOM — SAME window as the mountains (mid-mid 0→0.62) so the floor rides the same easing and tracks them EXACTLY; phase2 (on mid-fg) continues it through the arrival
  fadeIn: { start: 0.0, end: 0.0 }, // already on screen at p=0
  fadeOut: null, // NEVER dissolves — holds to p=1 (and never gets culled)
  sun: { x: 0.5, y: 0.6 }, // unused (no sun element bloom; sunMax 0)
  sunMax: 0,
  planes: [
    {
      // RECUT 2026-06-02 — UNIFIED ZOOM (refinement 4). The floor must move AS ONE
      // with the mountains on the first image (Sky, repeatedly). The REAL fix is the
      // RANGE: FLOOR_SCENE.range is now {0,0.62} = the mountains' window, so the floor
      // rides the SAME power3.inOut curve and tracks mid-mid's scale EXACTLY at every
      // p — not the old {0,1}, which stretched the ease and made the floor LAG the
      // zoom (at p0.31 the mountains were 1.15× but the floor only ~1.04×). scaleTo
      // 1.30 === mid-mid; yTo 6 gives Δy 4 === mid-mid's Δy, so the floor holds a
      // constant +2 yPercent foreground offset and never converges/diverges. phase2
      // keeps it drifting WITH the cliff through the arrival so it doesn't freeze
      // (~85% of the cliff's travel is after p0.62).
      id: 'mid-fg',
      label: 'desert floor (terracotta dunes + grass) — persistent, moves AS ONE with the scene',
      plateSrc: '/images/cinematic/mid-fg.png',
      placeholderSrc: '/images/cinematic/_placeholders/foreground.svg',
      transparent: true,
      scaleFrom: 1.0,
      scaleTo: 1.3, // === mid-mid (unified zoom — floor tracks the mountains exactly)
      yFrom: 2,
      yTo: 6, // Δy 4 === mid-mid's Δy → constant +2 yPercent foreground offset
      // 2nd-phase drift through the arrival (p0.62→1.0): continue WITH the cliff so the
      // foreground never freezes while the wall finishes its dolly. Tuned by eye.
      phase2: { toScale: 1.4, toY: 8, start: 0.62, end: 1.0 },
    },
  ],
} as const;

/**
 * The scenes the engine sequences on one timeline, in RENDER order (back→front
 * group z). [MID, ARRIVAL, FLOOR]: mid sky/buttes and the arrival sky/cliff
 * cross-dissolve underneath, then the persistent floor renders LAST (on top) so
 * the cliff rises out of it. DAWN is dropped from the recut.
 */
export const SCENES: readonly Scene[] = [MID_SCENE, ARRIVAL_SCENE, FLOOR_SCENE] as const;

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
 * The static frame (reduced-motion / narrow) + the reduced-motion test reference
 * these. The static frame is the ARRIVAL destination — the golden fluted cliff —
 * but the cliff has no base of its own (arrival-fg dropped), so the static plane
 * stack ends with the persistent FLOOR (mid-fg) under the wall: the cliff sits on
 * the same ground the live scene rides on. Order back→front:
 *   arrival-sky, arrival-cliff, mid-fg(floor).
 * ARRIVAL_ID stays the cliff so the static frame parks it at its landed scale.
 */
const STATIC_PLATES: readonly Plate[] = [
  ...ARRIVAL_SCENE.planes, // arrival-sky, arrival-cliff
  ...FLOOR_SCENE.planes, // mid-fg floor, rendered last (on top)
];

/** back → front. Used by the static frame. Placeholder rig keeps its own stack. */
export const PLATES: readonly Plate[] = USE_PLACEHOLDERS
  ? PLACEHOLDER_SCENE.planes
  : STATIC_PLATES;

/** The arrival subject — the plane the whole push resolves onto. */
export const ARRIVAL_ID = USE_PLACEHOLDERS ? PLACEHOLDER_SCENE.arrivalId : ARRIVAL_SCENE.arrivalId;

/**
 * Which image source to render for a plane, honoring the global flag.
 * One place decides placeholder-vs-real so the flip is total and consistent.
 *
 * For real art this is the WebP variant (the heavy source PNGs are dropped from
 * the shipped bundle — only AVIF+WebP ship — so WebP is the universal <img>
 * fallback, NOT the PNG). Placeholders return their SVG as-is.
 */
export function srcFor(plate: Plate): string {
  if (USE_PLACEHOLDERS) return plate.placeholderSrc;
  return swapExt(plate.plateSrc, 'webp');
}

/** Swap a path's file extension (…/foo.png → …/foo.webp). The AVIF / WebP
 *  variants are always derived from the manifest's plateSrc stem so there's no
 *  second list to keep in sync. */
function swapExt(src: string, ext: string): string {
  return src.replace(/\.[a-z0-9]+$/i, `.${ext}`);
}

/**
 * The responsive source set for a plane's <picture>:
 *   { avif, webp } → modern formats (AVIF primary, WebP fallback), derived from
 *                    the plateSrc stem. ~all 2026 browsers take one or the other,
 *                    alpha intact.
 *   { fallback }   → the <img> src (WebP for real art; the SVG for placeholders).
 * For placeholders (grey SVGs) there are no raster variants — avif/webp are null
 * and the SVG is served directly.
 */
export function sourcesFor(plate: Plate): {
  avif: string | null;
  webp: string | null;
  fallback: string;
} {
  if (USE_PLACEHOLDERS) {
    return { avif: null, webp: null, fallback: plate.placeholderSrc };
  }
  return {
    avif: swapExt(plate.plateSrc, 'avif'),
    webp: swapExt(plate.plateSrc, 'webp'),
    fallback: swapExt(plate.plateSrc, 'webp'),
  };
}

/** Every plane id across all active scenes, back→front per scene. Used by
 *  validate-assets.mjs (kept in sync there as a literal union). */
export const PLATE_IDS: readonly string[] = ACTIVE_SCENES.flatMap((s) =>
  s.planes.map((p) => p.id),
);
