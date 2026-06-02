'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

import { FilmGrain } from './FilmGrain';
import { Layer } from './Layer';
import { ACTIVE_SCENES, type Plate, type Scene } from './plates';
import { StaticDesertFrame } from './StaticDesertFrame';
import { useReducedMotion } from './useReducedMotion';

/**
 * CinematicDesert — the 2.5D camera-push title scene (3-beat descent).
 *
 * ────────────────────────────────────────────────────────────────────────────
 * MECHANICS (one timeline, scrubbed to scroll — no per-frame listeners):
 *
 *   <section .cdesert-stage>          height: 680vh   ← the scroll budget
 *     <div .cdesert-pin>              height: 100vh   ← ScrollTrigger PINS this
 *       3 SCENE GROUPS, stacked (.cdesert-scene), each:
 *         3 depth-plane <img> layers (back→front)
 *         a per-scene sun glow (positioned at that beat's measured sun)
 *       grade overlay   (cool→warm, ONE continuous ramp)
 *       exposure overlay(deep→golden, ONE continuous ramp)
 *       2 haze bands    (swell into dissolve B, clear as the cliff lands)
 *       title wordmark  (resolves p[0.86,0.96], holds to 1)
 *       <FilmGrain/>
 *
 * ScrollTrigger pins .cdesert-pin for the full height of .cdesert-stage and maps
 * scroll-progress 0→1 onto a single GSAP timeline of unit length (1). Each
 * scene's planes do their depth push within that scene's master-timeline `range`
 * (a tween placed at range.start, duration = range.end − range.start), driven by
 * SCENE-LOCAL keyframes (scaleFrom→scaleTo etc.). The three scene GROUPS
 * cross-dissolve via opacity on their `fadeIn`/`fadeOut` windows — overlapping,
 * so the push continues THROUGH each dissolve and it reads as one continuous move,
 * never a cut. ONE exposure ramp + ONE grade ramp run across the WHOLE p (never
 * reset per scene), so the light is a single slow sunrise dark→golden.
 *
 * `scrub: 1.1` gives a smooth, slightly weighted catch-up. Depth rides
 * power3.inOut; crossfades/exposure ride sine.inOut so nothing pops.
 *
 * SSR-safety: nothing touches `window` at module scope. GSAP wiring runs inside
 * useGSAP (client effect). `narrow` starts false so server/first client render
 * agree (no hydration mismatch), then upgrades after mount.
 *
 * Cleanup: useGSAP scopes everything to `scope`; the returned cleanup kills the
 * ScrollTrigger so a route change can't leak a pin or double-register.
 * ────────────────────────────────────────────────────────────────────────────
 */

const SCENES = ACTIVE_SCENES;

/**
 * PERF: per-scene COMPOSITE windows [start,end] in master-p. A scene's group gets
 * `.cdesert-scene--culled` while p is OUTSIDE its window. The class no longer
 * hides (it's GSAP opacity 0 that stops it drawing; the class only drops
 * pointer-events + is kept as an engine hook), so culling here is conservative —
 * we never cull the FLOOR or anything mid-dissolve.
 *
 * 2-SCENE RECUT (2026-06-02): SCENES = [MID, ARRIVAL, FLOOR]. The dissolve is
 * incoming-only (the outgoing group holds opaque and is OCCLUDED by the opaque
 * incoming group above it), so MID is safe to cull once ARRIVAL has fully faded IN
 * (fadeIn end 0.62) and covers it. The FLOOR is the persistent ground — it NEVER
 * dissolves and is NEVER culled (window spans the whole timeline).
 *   MID     [-0.01, 0.64]  — opener; composited until ARRIVAL covers it (~0.62)
 *   ARRIVAL [ 0.44, 1.01]  — from just before its fadeIn start (0.46) to the end
 *   FLOOR   [-0.01, 1.01]  — always composited (persistent)
 * Index-aligned to SCENES; any other scene list (e.g. placeholder rig) falls back
 * to "always composite" so nothing is wrongly hidden.
 */
const CULL_WINDOWS: readonly { start: number; end: number }[] =
  SCENES.length === 3
    ? [
        { start: -0.01, end: 0.64 }, // MID (opener)
        { start: 0.44, end: 1.01 }, // ARRIVAL
        { start: -0.01, end: 1.01 }, // FLOOR (persistent — never culled)
      ]
    : SCENES.map(() => ({ start: -0.01, end: 1.01 }));

/** Flat [sceneIndex, planeIndex] addressing for the per-plane ref grid. */
type PlaneAddr = { s: number; p: number };

export function CinematicDesert() {
  const reduce = useReducedMotion();
  const [narrow, setNarrow] = useState(false);

  // matchMedia for the phone breakpoint. Initial `false` keeps SSR/CSR in sync;
  // we read the real value after mount.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setNarrow(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  const scope = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  // per-plane <img> refs, addressed by `${sceneIndex}:${planeIndex}`
  const layerRefs = useRef<Map<string, HTMLImageElement | null>>(new Map());
  // per-scene group + sun refs
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sunRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gradeRef = useRef<HTMLDivElement>(null);
  const exposureRef = useRef<HTMLDivElement>(null);
  // PERF (2026-06-02): the two haze bands merged into ONE overlay → one ref.
  const hazeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // Whether to mount the animated scene. When false we render the static frame
  // and skip GSAP entirely.
  // PERF rebuild (2026-06-02): the lightweight engine ships on this branch
  // (perf/cinematic-lightweight) — scale caps, scene culling, merged overlays,
  // motes dropped — so the animated path is RE-ENABLED. The static-frame
  // fallback below still serves reduced-motion + narrow viewports.
  const FORCE_STATIC = false;
  const animate = !FORCE_STATIC && !(reduce || narrow);

  // PERF (2026-06-02): force-decode every plane upfront. Lazy planes decoded their
  // AVIF on the main thread the first time each scene scrolled into view — a ~1s
  // hitch per scene (the "glitchy at points"). Decoding here, while the user is
  // still at the top, makes them GPU-ready so scrolling is pure compositing (~60fps).
  useEffect(() => {
    if (!animate) return;
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      if (cancelled) return;
      layerRefs.current.forEach((img) => {
        if (img?.decode) img.decode().catch(() => {});
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [animate]);

  useGSAP(
    () => {
      if (!animate) return;
      gsap.registerPlugin(ScrollTrigger);

      const stage = scope.current?.querySelector('.cdesert-stage');
      const pin = pinRef.current;
      if (!stage || !pin) return;

      // ── SCENE CULLING (PERF 2026-06-02) ──────────────────────────────────
      // Drive each group's composite on/off from master progress. Toggling the
      // cull class (visibility:hidden) drops an inactive beat's 3 planes out of
      // the GPU composite; we also park will-change:transform ONLY on the planes
      // of the currently-composited scene(s) so we never hold 9 promoted layers'
      // worth of GPU memory at once (will-change discipline — too many promoted
      // layers blow the memory budget and themselves cause jank).
      const applyCull = (p: number) => {
        for (let si = 0; si < SCENES.length; si += 1) {
          const group = sceneRefs.current[si];
          if (!group) continue;
          const win = CULL_WINDOWS[si] ?? { start: -0.01, end: 1.01 };
          const active = p >= win.start && p <= win.end;
          // class toggle is idempotent + cheap; only writes when it changes.
          if (group.classList.contains('cdesert-scene--culled') === active) {
            group.classList.toggle('cdesert-scene--culled', !active);
          }
          // will-change discipline: promote only the active scene(s) — the group
          // for its opacity dissolve, its planes for their transform push.
          group.style.willChange = active ? 'opacity' : 'auto';
          for (let pi = 0; pi < SCENES[si].planes.length; pi += 1) {
            const el = layerRefs.current.get(`${si}:${pi}`);
            if (el) el.style.willChange = active ? 'transform' : 'auto';
          }
        }
      };

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: 'bottom bottom',
          pin,
          pinSpacing: true,
          scrub: 1.1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // cull on every progress tick (cheap: a handful of class/style writes,
          // only when a boundary is crossed) + once on mount/refresh.
          onUpdate: (self) => applyCull(self.progress),
          onRefresh: (self) => applyCull(self.progress),
        },
      });
      // initial state (p≈0): only DAWN composites.
      applyCull(0);

      // Dev-only debug handle: lets a harness scrub the descent by progress
      // (`__cdesert.seek(0.55)`) without fighting scroll/screenshot sync. Stripped
      // from production builds — never ships.
      if (process.env.NODE_ENV !== 'production') {
        const st = tl.scrollTrigger;
        (window as unknown as { __cdesert?: unknown }).__cdesert = {
          tl,
          seek: (p: number) => {
            if (st) st.scroll(st.start + (st.end - st.start) * p);
          },
          // freeze: kill the ScrollTrigger pin and hold the timeline at progress
          // p, with the scene parked at the top of the viewport (scrollY 0) so a
          // screenshot harness can capture each beat without scroll/pin sync.
          freeze: (p: number) => {
            if (st) st.disable(false);
            window.scrollTo(0, 0);
            const pinEl = pinRef.current;
            if (pinEl) {
              pinEl.style.position = 'fixed';
              pinEl.style.top = '0';
              pinEl.style.left = '0';
            }
            tl.pause();
            tl.progress(p);
          },
        };
      }

      // ── per-scene plane depth pushes ──────────────────────────────────────
      // Each plane tween is placed at its SCENE's range.start with a duration of
      // the scene's span, so its scaleFrom→scaleTo plays out exactly across that
      // beat's window on the master timeline. power3.inOut is the spine of the
      // IMAX glide (cautious open, decisive mid, long gentle arrival).
      SCENES.forEach((scene: Scene, si) => {
        const span = Math.max(0.0001, scene.range.end - scene.range.start);
        scene.planes.forEach((plate: Plate, pi) => {
          const el = layerRefs.current.get(`${si}:${pi}`);
          if (!el) return;
          tl.fromTo(
            el,
            { scale: plate.scaleFrom, yPercent: plate.yFrom },
            { scale: plate.scaleTo, yPercent: plate.yTo, duration: span, ease: 'power3.inOut' },
            scene.range.start,
          );
          // optional per-plane opacity reveal/exit (scene-local sub-window)
          if (plate.opacity) {
            const { from, to, p0, p1 } = plate.opacity;
            const start = scene.range.start + p0 * span;
            const dur = Math.max(0.0001, (p1 - p0) * span);
            tl.fromTo(el, { opacity: from }, { opacity: to, duration: dur, ease: 'sine.inOut' }, start);
          }
        });

        // ── scene-group cross-dissolve — INCOMING-ONLY (true A-over-B) ────────
        // Each beat's back plane (sky) is opaque and fills the frame, so the WHOLE
        // group is opaque. Beats stack by z (later beat on top). We therefore
        // dissolve a beat IN over the one below and let the OUTGOING beat hold full
        // opacity underneath — the opaque incoming group covers it as it resolves.
        //
        // Why not also fade the outgoing group out (the obvious "cross"-fade)?
        // Because the groups are STACKED over the pin: if the lower group also went
        // translucent, the pin would bleed through at the dissolve midpoint (measured
        // on the old cold pin: dissolve B sagged ~20% in luminance and cooled toward
        // indigo at t=0.5 — a dark seam right in the "one real leap"). Holding the
        // outgoing group opaque keeps total coverage at 1 and the frame warm THROUGH
        // the dissolve — an unbroken push, never a dip. (The pin is now a WARM dawn
        // wash too — 2026-06-02 recut — so even an accidental bleed would stay warm,
        // but incoming-only remains the clean approach: zero bleed of any kind.) The
        // manifest's `fadeOut` window is retained as the spec record of the handoff.
        const group = sceneRefs.current[si];
        if (group) {
          // fade IN (0→1). A zero-width window means "already on screen" (dawn).
          // sine.inOut: eased on/off so the incoming beat resolves IN, never pops.
          const inDur = scene.fadeIn.end - scene.fadeIn.start;
          if (inDur > 0) {
            tl.fromTo(
              group,
              { opacity: 0 },
              { opacity: 1, duration: inDur, ease: 'sine.inOut' },
              scene.fadeIn.start,
            );
          }
          // No fadeOut tween: the outgoing group stays opaque and is occluded by the
          // opaque incoming group above it (see note). Last beat holds to p=1.
        }

        // ── per-scene sun: BLOOM KILLED (2026-06-02 recut) ───────────────────
        // Every scene's sunMax is 0 — the localized sun disc was the bright
        // flash/glare Sky saw (the mid's side-key lit up during the transition).
        // We drive the sun element to opacity:scene.sunMax (0) and hold it there:
        // no rise, no halation, no hardcoded bloom. The element paints nothing at
        // any scroll position. Warmth is now an EVEN wash from the grade/exposure
        // overlays (globals.css) — no hotspot. (The element + the per-scene `sun`
        // anchor are retained so re-introducing a glow later is a data change.)
        const sun = sunRefs.current[si];
        if (sun) {
          tl.set(sun, { opacity: scene.sunMax }, scene.range.start);
        }
      });

      // ── ONE continuous hue grade: warm-morning → warm-gold across the whole p ──
      // RE-TUNED (Dani 2026-06-02): starts at 0.35, not 0. The open is warm DAYLIGHT
      // (see the exposure note), so the hue grade must not slam a full cool-blue
      // multiply over the valley at p=0 (that was part of the cold open). Beginning
      // partway-warm means the morning already reads warm, and the grade still travels
      // a long, even way up to full gold for the arrival. sine.inOut → no banding.
      if (gradeRef.current) {
        tl.fromTo(
          gradeRef.current,
          { '--cdesert-grade-mix': 0.35 },
          { '--cdesert-grade-mix': 1, duration: 1, ease: 'sine.inOut' },
          0,
        );
      }

      // ── ONE continuous exposure ramp: warm MORNING → golden-hour ───────────
      // RE-AUTHORED (Dani 2026-06-02). Sky's brief is explicit: the recut OPENS in
      // the daylight MID valley, so this is NOT a forced dark/pre-dawn open — it's a
      // gentle warm-morning → golden-hour LIFT. The old curve opened at a true 0 with
      // a deep night-hold, which crushed the daylight photo to a cold blue dusk at the
      // top (measured). We now OPEN already warm-lit (~0.30 — soft early morning, the
      // valley reads as daylight with a touch of cool morning-shade left in the lower
      // frame), then climb smoothly, with the gold still ACCELERATING late so the
      // arrival cliff earns the richest, most golden light.
      if (exposureRef.current) {
        const ex = exposureRef.current;
        // Knot by knot (every segment sine.inOut so slopes meet smoothly — no kink,
        // no banding). Warm-morning open (0.30) → steady lift across the valley push →
        // through the dissolve → late-gold acceleration after p≈0.74 → full golden at
        // p1. Monotonic, gentle, even.
        tl.fromTo(
          ex,
          { '--cdesert-expose': 0.3 },
          { '--cdesert-expose': 0.36, duration: 0.18, ease: 'sine.inOut' }, // warm-morning open, soft lift
          0,
        )
          .to(ex, { '--cdesert-expose': 0.44, duration: 0.18, ease: 'sine.inOut' }, 0.18) // morning warms over the valley
          .to(ex, { '--cdesert-expose': 0.54, duration: 0.18, ease: 'sine.inOut' }, 0.36) // through the dissolve
          .to(ex, { '--cdesert-expose': 0.6, duration: 0.16, ease: 'sine.inOut' }, 0.54) // cliff resolving, still climbing
          .to(ex, { '--cdesert-expose': 0.66, duration: 0.16, ease: 'sine.inOut' }, 0.7) // approaching golden
          .to(ex, { '--cdesert-expose': 0.8, duration: 0.12, ease: 'sine.in' }, 0.74) // gold ACCELERATES (after 0.74)
          .to(ex, { '--cdesert-expose': 0.92, duration: 0.12, ease: 'sine.inOut' }, 0.86)
          .to(ex, { '--cdesert-expose': 1, duration: 0.02, ease: 'sine.out' }, 0.98); // full golden-hour at p1
      }

      // ── atmospheric haze: swells into THE DISSOLVE, clears as the cliff lands ──
      // The single merged haze band carries the mid→arrival leap so the cliff
      // resolves IN through dust rather than cutting. Dani 2026-06-02 — retuned to the
      // wider dissolve (p0.46–0.66): the swell starts ~p0.40 (opener stays crisp),
      // rises a touch deeper and peaks slightly LATER (~p0.55, the heart of the now-
      // longer resolve) so the wall genuinely materialises OUT of the densest dust as
      // it grows, then clears gently as the cliff settles (by ~p0.68). A 3-knot rise
      // (0.40→0.50→0.55) makes the swell itself smoother. sine.inOut so the dust
      // breathes in and out — no edge.
      if (hazeRef.current) {
        tl.fromTo(
          hazeRef.current,
          { opacity: 0 },
          { opacity: 0.4, duration: 0.1, ease: 'sine.inOut' },
          0.4,
        )
          .to(hazeRef.current, { opacity: 0.62, duration: 0.07, ease: 'sine.inOut' }, 0.5) // peak at the resolve heart
          .to(hazeRef.current, { opacity: 0.05, duration: 0.13, ease: 'sine.inOut' }, 0.57); // clear as the cliff settles
      }

      // ── title: carves in over p[0.86,0.97], then HOLDS to p=1 ──────────────
      // Late (the gold has fully landed on the cliff), and graceful: it rises a hair,
      // sharpens from a soft 10px blur, and fades up on power2.out so it SETTLES
      // rather than pops. Dani 2026-06-02: nudged a touch later (0.84→0.86) + a hair
      // longer so it resolves over the FULLY golden cliff and the eye lands on the
      // wordmark last. Once carved it holds fully opaque through the tail so the
      // wordmark is the frame you're left on (lockfile: "carves in late and HOLDS").
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, yPercent: 7, filter: 'blur(10px)' },
          { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.11, ease: 'power2.out' },
          0.86,
        );
        tl.to(titleRef.current, { opacity: 1, duration: 0.03 }, 0.97);
      }
    },
    { scope, dependencies: [animate] },
  );

  if (!animate) {
    return <StaticDesertFrame />;
  }

  return (
    <div ref={scope}>
      <section className="cdesert-stage" aria-label="SkyPi Studio — desert title scene">
        <div ref={pinRef} className="cdesert-pin">
          {/* stacked scene groups, each its own depth stack + sun. Render order
              (= z) is SCENES order: [MID, ARRIVAL, FLOOR] — the persistent floor
              renders last (top z) so the cliff rises out of it. */}
          {SCENES.map((scene, si) => {
            // A scene starts VISIBLE iff its fadeIn is a zero-width window
            // ("already on screen") — that's MID (the opener) AND the persistent
            // FLOOR. Scenes that dissolve IN (ARRIVAL) start hidden at opacity 0.
            // Keyed off fadeIn, not the index, so the floor (si 2) starts visible.
            const startsVisible = scene.fadeIn.end - scene.fadeIn.start <= 0;
            return (
            <div
              key={scene.id}
              ref={(el) => {
                sceneRefs.current[si] = el;
              }}
              className="cdesert-scene"
              data-scene={scene.id}
              style={{ opacity: startsVisible ? 1 : 0, zIndex: 10 + si }}
              aria-hidden="true"
            >
              {scene.planes.map((plate, pi) => (
                <Layer
                  key={plate.id}
                  plate={plate}
                  z={pi}
                  ref={(el) => {
                    layerRefs.current.set(`${si}:${pi}`, el);
                  }}
                  // `eager` is API-compat only — ALL planes load eagerly now
                  // (Layer forces loading="eager"); the force-decode effect makes
                  // every plane GPU-ready upfront so no scene hitches mid-scroll.
                  eager={si === 0}
                />
              ))}
              {/* per-scene sun, parked at that beat's measured glow */}
              <div
                ref={(el) => {
                  sunRefs.current[si] = el;
                }}
                className="cdesert-sun"
                style={
                  {
                    '--sun-x': `${scene.sun.x * 100}%`,
                    '--sun-y': `${scene.sun.y * 100}%`,
                  } as React.CSSProperties
                }
                aria-hidden="true"
              />
            </div>
            );
          })}

          {/* lighting arc — one continuous grade + exposure over the whole push */}
          <div ref={gradeRef} className="cdesert-grade" aria-hidden="true" />
          <div ref={exposureRef} className="cdesert-exposure" aria-hidden="true" />
          {/* single merged atmospheric haze band (was two) */}
          <div ref={hazeRef} className="cdesert-haze" aria-hidden="true" />

          {/* title wordmark */}
          <div ref={titleRef} className="cdesert-title">
            <p className="cdesert-title-mark">SkyPi Studio</p>
          </div>

          {/* finishing grain / vignette / motes */}
          <FilmGrain />
        </div>
      </section>
    </div>
  );
}
