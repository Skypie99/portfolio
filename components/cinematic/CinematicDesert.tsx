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
  const haze1Ref = useRef<HTMLDivElement>(null);
  const haze2Ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // Whether to mount the animated scene. When false we render the static frame
  // and skip GSAP entirely.
  const animate = !(reduce || narrow);

  useGSAP(
    () => {
      if (!animate) return;
      gsap.registerPlugin(ScrollTrigger);

      const stage = scope.current?.querySelector('.cdesert-stage');
      const pin = pinRef.current;
      if (!stage || !pin) return;

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
        },
      });

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

        // ── scene-group cross-dissolve (the no-cut transitions) ──────────────
        const group = sceneRefs.current[si];
        if (group) {
          // fade IN (0→1). A zero-width window means "already on screen" (dawn).
          const inDur = scene.fadeIn.end - scene.fadeIn.start;
          if (inDur > 0) {
            tl.fromTo(
              group,
              { opacity: 0 },
              { opacity: 1, duration: inDur, ease: 'sine.inOut' },
              scene.fadeIn.start,
            );
          }
          // fade OUT (1→0) on the next dissolve; null = holds to the end.
          if (scene.fadeOut) {
            const outDur = Math.max(0.0001, scene.fadeOut.end - scene.fadeOut.start);
            tl.to(group, { opacity: 0, duration: outDur, ease: 'sine.inOut' }, scene.fadeOut.start);
          }
        }

        // ── per-scene sun: drift + bloom within the scene's window ───────────
        // The sun ELEMENT is parked at this beat's measured glow (CSS, below);
        // here we only rise/bloom/fade it on the timeline so one sun reads as
        // travelling center→up-right across the descent (each scene's sun is
        // visible only while its group is, via the group opacity above).
        const sun = sunRefs.current[si];
        if (sun) {
          const isArrival = si === SCENES.length - 1;
          // Peak bloom is per-beat (scene.sunMax): dawn is a SUBTLE pre-dawn glow
          // that must not wash the dark; the big bright bloom is the arrival's
          // alone. Early beats also bloom smaller so the sun reads as a distant
          // glow, not a near light source over the vista.
          tl.fromTo(
            sun,
            { yPercent: 14, opacity: 0.0, scale: 0.85 },
            {
              yPercent: -6,
              opacity: scene.sunMax,
              scale: isArrival ? 1.3 : 1.05,
              duration: span,
              ease: 'power1.inOut',
            },
            scene.range.start,
          );
          // arrival beat alone gets a halation bloom as the cliff lands (~p0.85).
          if (isArrival) {
            tl.to(sun, { opacity: 1, scale: 1.5, duration: 0.1, ease: 'power2.out' }, 0.82)
              .to(sun, { opacity: 0.92, scale: 1.42, duration: 0.08, ease: 'sine.out' }, 0.93);
          }
        }
      });

      // ── ONE continuous hue grade: cool-blue → warm-gold across the whole p ──
      if (gradeRef.current) {
        tl.fromTo(
          gradeRef.current,
          { '--cdesert-grade-mix': 0 },
          { '--cdesert-grade-mix': 1, duration: 1, ease: 'sine.inOut' },
          0,
        );
      }

      // ── ONE continuous exposure ramp: deep pre-dawn → golden ───────────────
      // Authored to the lockfile curve: dark/cool at p=0, slow lift through dawn,
      // a WARM-but-LOW plateau across MID (no daytime spike), then the gold
      // accelerates after p≈0.74 so arrival earns its warmth. We shape the
      // monotonic curve with keyframes (custom-prop tween) instead of a single
      // ease so the MID plateau + late-gold acceleration are explicit.
      if (exposureRef.current) {
        const ex = exposureRef.current;
        tl.fromTo(
          ex,
          { '--cdesert-expose': 0 },
          { '--cdesert-expose': 0.12, duration: 0.2, ease: 'sine.inOut' },
          0,
        )
          .to(ex, { '--cdesert-expose': 0.3, duration: 0.2, ease: 'sine.inOut' }, 0.2)
          .to(ex, { '--cdesert-expose': 0.42, duration: 0.15, ease: 'sine.inOut' }, 0.4) // MID plateau
          .to(ex, { '--cdesert-expose': 0.5, duration: 0.17, ease: 'sine.inOut' }, 0.55)
          .to(ex, { '--cdesert-expose': 0.72, duration: 0.13, ease: 'power1.in' }, 0.72) // gold accelerates
          .to(ex, { '--cdesert-expose': 0.9, duration: 0.13, ease: 'sine.inOut' }, 0.85)
          .to(ex, { '--cdesert-expose': 1, duration: 0.02, ease: 'sine.out' }, 0.98);
      }

      // ── atmospheric haze: swells into DISSOLVE B, clears as the cliff lands ──
      // The bands carry the mid→arrival leap so the cliff resolves IN through
      // dust rather than cutting. Peak around p0.70, clearing by p0.86.
      if (haze1Ref.current) {
        tl.fromTo(
          haze1Ref.current,
          { opacity: 0 },
          { opacity: 0.5, duration: 0.22, ease: 'sine.inOut' },
          0.5,
        ).to(haze1Ref.current, { opacity: 0.08, duration: 0.16, ease: 'sine.inOut' }, 0.78);
      }
      if (haze2Ref.current) {
        tl.fromTo(
          haze2Ref.current,
          { opacity: 0 },
          { opacity: 0.4, duration: 0.2, ease: 'sine.inOut' },
          0.56,
        ).to(haze2Ref.current, { opacity: 0.05, duration: 0.16, ease: 'sine.inOut' }, 0.82);
      }

      // ── title: carves in over p[0.86,0.96], then HOLDS to p=1 ──────────────
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, yPercent: 5, filter: 'blur(8px)' },
          { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.1, ease: 'power2.out' },
          0.86,
        );
        tl.to(titleRef.current, { opacity: 1, duration: 0.04 }, 0.96);
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
          {/* three stacked scene groups, each its own depth stack + sun */}
          {SCENES.map((scene, si) => (
            <div
              key={scene.id}
              ref={(el) => {
                sceneRefs.current[si] = el;
              }}
              className="cdesert-scene"
              data-scene={scene.id}
              // dawn (si 0) starts visible; later scenes start hidden and fade in.
              style={{ opacity: si === 0 ? 1 : 0, zIndex: 10 + si }}
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
                  // lazy-load every scene's planes except the first (dawn) —
                  // the off-screen beats load as the user scrolls toward them.
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
          ))}

          {/* lighting arc — one continuous grade + exposure over the whole push */}
          <div ref={gradeRef} className="cdesert-grade" aria-hidden="true" />
          <div ref={exposureRef} className="cdesert-exposure" aria-hidden="true" />
          <div ref={haze1Ref} className="cdesert-haze cdesert-haze--1" aria-hidden="true" />
          <div ref={haze2Ref} className="cdesert-haze cdesert-haze--2" aria-hidden="true" />

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
