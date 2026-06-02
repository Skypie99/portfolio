'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

import { FilmGrain } from './FilmGrain';
import { Layer } from './Layer';
import { PLATES, type Plate } from './plates';
import { StaticDesertFrame } from './StaticDesertFrame';
import { useReducedMotion } from './useReducedMotion';

/**
 * CinematicDesert — the 2.5D camera-push title scene.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * MECHANICS (one timeline, scrubbed to scroll — no per-frame listeners):
 *
 *   <section .cdesert-stage>          height: 500vh   ← the scroll budget
 *     <div .cdesert-pin>              height: 100vh   ← ScrollTrigger PINS this
 *       6 plate <img> layers (back→front)
 *       grade overlay  (cool→warm)
 *       sun glow       (rises + blooms)
 *       2 haze bands   (swell mid-push, ease as we "enter" the dust)
 *       title wordmark (resolves p[0.80,0.92], holds to 1)
 *       <FilmGrain/>
 *
 * ScrollTrigger pins .cdesert-pin for the full height of .cdesert-stage and
 * maps scroll-progress 0→1 onto a single GSAP timeline of unit length (1).
 * `scrub: 1.1` gives a smooth, slightly weighted catch-up so it never feels
 * snappy. The depth dolly rides power3.inOut (cautious open, decisive mid, long
 * gentle arrival); crossfades/reveals use sine.inOut so no fade pops — the
 * "cinematic" feel, rather than tracking the scrollbar linearly.
 *
 * Because each tween is placed on the timeline at its authored progress window
 * (e.g. an opacity ramp at start=p0, duration=p1−p0), a plate's opacity/scale/
 * drift are all just functions of the master progress p. Swapping placeholder
 * art for real plates changes nothing here — the data lives in plates.ts.
 *
 * SSR-safety: nothing touches `window` at module scope. The GSAP wiring runs
 * inside useGSAP (client effect). `narrow` starts false so the server and first
 * client render agree (no hydration mismatch), then upgrades after mount.
 *
 * Cleanup: useGSAP scopes everything to `scope`, and the returned cleanup kills
 * the ScrollTrigger, so a route change can't leak a pin or double-register.
 * ────────────────────────────────────────────────────────────────────────────
 */

/** master timeline length; progress p maps 0→1 across this. */
const P = 1;

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
  // one ref per plate, in PLATES order
  const layerRefs = useRef<(HTMLImageElement | null)[]>([]);
  const gradeRef = useRef<HTMLDivElement>(null);
  const exposureRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const haze1Ref = useRef<HTMLDivElement>(null);
  const haze2Ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // Whether to mount the animated scene. When false we render the static frame
  // and skip GSAP entirely. Computed once per render; useGSAP re-runs when it
  // (via `animate` in deps) flips.
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
          pinSpacing: true, // ScrollTrigger owns the spacer so the Hero flows after
          scrub: 1.1, // slightly longer catch-up — a touch more inertia on the glide
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // ── depth plates ──────────────────────────────────────────────────────
      PLATES.forEach((plate: Plate, i) => {
        const el = layerRefs.current[i];
        if (!el) return;

        // scale + drift run the WHOLE push (0→P). power3.inOut is the spine of
        // the IMAX glide: a cautious open, a decisive mid, and a long gentle
        // arrival (a heavier ease-out tail than power2) so the dolly settles
        // into the destination instead of stopping flat.
        tl.fromTo(
          el,
          { scale: plate.scaleFrom, yPercent: plate.yFrom },
          { scale: plate.scaleTo, yPercent: plate.yTo, duration: P, ease: 'power3.inOut' },
          0,
        );

        // optional opacity ramp, placed on its authored sub-window [p0,p1].
        // sine.inOut (was linear) carves the ends of every fade so the dawn→day
        // sky crossfade has no luminance dip at the midpoint, and the
        // near-rockface reveal / foreground exit ease in and out of frame
        // instead of popping on at a constant rate.
        if (plate.opacity) {
          const { from, to, p0, p1 } = plate.opacity;
          tl.fromTo(
            el,
            { opacity: from },
            { opacity: to, duration: Math.max(0.0001, p1 - p0), ease: 'sine.inOut' },
            p0,
          );
        }
      });

      // ── lighting arc: cool-blue → warm-gold grade across the whole push ────
      // sine.inOut (was power1.inOut) is the gentlest continuous S — the warmth
      // builds like a sunrise, no perceptible step at any point in the grade.
      if (gradeRef.current) {
        tl.fromTo(
          gradeRef.current,
          { '--cdesert-grade-mix': 0 },
          { '--cdesert-grade-mix': 1, duration: P, ease: 'sine.inOut' },
          0,
        );
      }

      // ── exposure / time-of-day: deep pre-dawn (p=0) → warm sunrise (p→1) ────
      // The grade overlay above shifts HUE (cool→warm); this layer drives the
      // EXPOSURE arc the grade's multiply blend can't. It's an `overlay` blend
      // (see .cdesert-exposure): at p=0 a cool-blue wash DEEPENS the frame (true
      // pre-dawn), and as p→1 it crossfades to a warm wash that LIFTS the
      // midtones/highlights and lets the glow breathe — so the valley reads as
      // the sun cresting, not a recolored night.
      // One driver var `--cdesert-expose` (0→1) on the same scrubbed timeline;
      // sine.inOut matches the grade so hue + exposure move as one continuous
      // sunrise with no banding. (Tuned to WARM a dark frame — never fake midday.)
      if (exposureRef.current) {
        tl.fromTo(
          exposureRef.current,
          { '--cdesert-expose': 0 },
          { '--cdesert-expose': 1, duration: P, ease: 'sine.inOut' },
          0,
        );
      }

      // ── sun glow: rises from the horizon, warms, blooms (peak ~p0.85) ──────
      // Main rise is power1.inOut (was power2.in): it emerges steadily from the
      // horizon and DECELERATES as it crests, handing off to the bloom — instead
      // of a hard ease-in that left the sun rushing up late.
      if (sunRef.current) {
        tl.fromTo(
          sunRef.current,
          { yPercent: 18, opacity: 0, scale: 0.85 },
          { yPercent: -6, opacity: 0.95, scale: 1.35, duration: P, ease: 'power1.inOut' },
          0,
        );
        // a final halation bloom that peaks near p≈0.85 then settles slightly.
        // sine.out on the settle (was linear) keeps the halation from snapping.
        tl.to(sunRef.current, { opacity: 1, scale: 1.5, duration: 0.15, ease: 'power2.out' }, 0.78)
          .to(sunRef.current, { opacity: 0.9, scale: 1.42, duration: 0.08, ease: 'sine.out' }, 0.92);
      }

      // ── atmospheric haze: swells mid-push, eases as we "enter" the dust ────
      // Peaks softened (0.55→0.50, 0.40→0.36) and residuals lowered
      // (0.12→0.10, 0.08→0.06) so the bands read as depth haze rather than a fog
      // wall and clear more fully as the camera arrives. Curves stay sine.inOut.
      if (haze1Ref.current) {
        tl.fromTo(
          haze1Ref.current,
          { opacity: 0 },
          { opacity: 0.5, duration: 0.35, ease: 'sine.inOut' },
          0.2,
        ).to(haze1Ref.current, { opacity: 0.1, duration: 0.3, ease: 'sine.inOut' }, 0.62);
      }
      if (haze2Ref.current) {
        tl.fromTo(
          haze2Ref.current,
          { opacity: 0 },
          { opacity: 0.36, duration: 0.32, ease: 'sine.inOut' },
          0.3,
        ).to(haze2Ref.current, { opacity: 0.06, duration: 0.28, ease: 'sine.inOut' }, 0.68);
      }

      // ── title: carves in over p[0.80,0.96], then HOLDS to p=1 ──────────────
      // Longer reveal window (0.12→0.16) + deeper start blur (6→8px) makes the
      // wordmark resolve out of soft focus as a graceful carve-in rather than a
      // snap; power2.out decelerates it into place. yPercent eases up a hair
      // more (6→5) so the lift is felt, not seen.
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, yPercent: 5, filter: 'blur(8px)' },
          { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.16, ease: 'power2.out' },
          0.8,
        );
        // explicit hold so the wordmark stays put through the end of the scroll.
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
          {/* depth plates, back → front */}
          {PLATES.map((plate, i) => (
            <Layer
              key={plate.id}
              plate={plate}
              z={i}
              ref={(el) => {
                layerRefs.current[i] = el;
              }}
            />
          ))}

          {/* lighting arc */}
          <div ref={gradeRef} className="cdesert-grade" aria-hidden="true" />
          <div ref={exposureRef} className="cdesert-exposure" aria-hidden="true" />
          <div ref={haze1Ref} className="cdesert-haze cdesert-haze--1" aria-hidden="true" />
          <div ref={haze2Ref} className="cdesert-haze cdesert-haze--2" aria-hidden="true" />
          <div ref={sunRef} className="cdesert-sun" aria-hidden="true" />

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
