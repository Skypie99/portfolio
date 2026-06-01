'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';

/* ════════════════════════════════════════════════════════════════════════
   CinematicIntro — IMAX Desert Descent
   ────────────────────────────────────────────────────────────────────────
   Spec: designs/CINEMATIC_INTRO.md  (Dani 2026-06-01)
   Three-act scroll cinema:
     0.00 → 0.25  DAWN     wide vista hold, stars dissolve, sun crests
     0.25 → 0.70  DOLLY    sky climbs, mesas grow, road slides past
     0.70 → 1.00  ARRIVAL  rock face fills frame, title carves in
   One unified easing: quint S-curve. Every motion is a derivative of `t`.
   ════════════════════════════════════════════════════════════════════════ */

/* Quint S-curve — Dani locked the literal bezier coefficients in spec §7. */
function easeInOutQuint(t: number): number {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

/* RGB interpolation along a piecewise t→hex track.
   Used to drive sky/land gradient stops as a single string output. */
type Stop = { t: number; hex: string };

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function interpStops(t: number, stops: Stop[]): string {
  // Find bracketing stops
  if (t <= stops[0].t) return stops[0].hex;
  if (t >= stops[stops.length - 1].t) return stops[stops.length - 1].hex;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a.t && t <= b.t) {
      const local = (t - a.t) / (b.t - a.t);
      const [r1, g1, b1] = hexToRgb(a.hex);
      const [r2, g2, b2] = hexToRgb(b.hex);
      const r = Math.round(r1 + (r2 - r1) * local);
      const g = Math.round(g1 + (g2 - g1) * local);
      const bch = Math.round(b1 + (b2 - b1) * local);
      return `rgb(${r}, ${g}, ${bch})`;
    }
  }
  return stops[stops.length - 1].hex;
}

/* Sky keyframes — 5 t-points × 3 vertical stops (Dani §6).
   ─────────────────────────────────────────────────────────────────
   TOKEN SOURCE-OF-TRUTH MIRROR (Dani CONCERN, polish item 3):
   The hex values below MUST stay in sync with the canonical
   `--cinema-sky-*`, `--cinema-far-*`, `--cinema-mid-*`,
   `--cinema-near-*` tokens declared in `app/tokens-phase2.css`.
   If you tweak the palette, update BOTH the tokens AND this file.
   Literals here are necessary because `useTransform`'s callback is
   invoked outside React render and cannot read CSS custom properties
   without a DOM round-trip per frame (perf-prohibitive).
   Future: Wave 3 follow-up — resolve tokens once on mount via
   `getComputedStyle(document.documentElement)` and feed the arrays.
   ─────────────────────────────────────────────────────────────────
   SKY_TOP    → --cinema-sky-top-{0,30,60,100}
   SKY_MID    → --cinema-sky-mid-{0,30,60,100}
   SKY_HORIZON→ --cinema-sky-horizon-{0,30,60,100}
   FAR_MESA   → --cinema-far-mesa-{0,40,70,100}
   MID_MESA   → --cinema-mid-mesa-{25,40,70,100}
   NEAR_UPPER → --cinema-near-upper-{55,85,100}
   NEAR_LIT   → --cinema-near-lit-{55,85,100} (lit zone == --color-terracotta at t=1.0)
   NEAR_SHADOW→ --cinema-near-shadow-{55,85,100} (shadow == --color-umber at t=1.0)
*/
const SKY_TOP: Stop[] = [
  { t: 0.0, hex: '#0F1A2E' },
  { t: 0.25, hex: '#3E4A6F' },
  { t: 0.5, hex: '#5C7AA0' },
  { t: 0.75, hex: '#7BA8C4' },
  { t: 1.0, hex: '#96C4D0' },
];
const SKY_MID: Stop[] = [
  { t: 0.0, hex: '#2A1F3A' },
  { t: 0.25, hex: '#8B5A6F' },
  { t: 0.5, hex: '#B89878' },
  { t: 0.75, hex: '#C9B89A' },
  { t: 1.0, hex: '#D4EDF2' },
];
const SKY_HORIZON: Stop[] = [
  { t: 0.0, hex: '#4A2540' },
  { t: 0.25, hex: '#D4885A' },
  { t: 0.5, hex: '#DAA070' },
  { t: 0.75, hex: '#E8D4B5' },
  { t: 1.0, hex: '#F0E4E7' },
];

/* Land color tracks (Dani §6). */
const FAR_MESA: Stop[] = [
  { t: 0.0, hex: '#3A2018' },
  { t: 0.4, hex: '#6B3826' },
  { t: 0.7, hex: '#9F5538' },
  { t: 1.0, hex: '#C97A52' },
];
const MID_MESA: Stop[] = [
  { t: 0.25, hex: '#7A3A26' },
  { t: 0.4, hex: '#8B4530' },
  { t: 0.7, hex: '#B35F32' },
  { t: 1.0, hex: '#D89572' },
];
const NEAR_UPPER: Stop[] = [
  { t: 0.55, hex: '#8B4530' },
  { t: 0.85, hex: '#A05E3E' },
  { t: 1.0, hex: '#C97A52' },
];
const NEAR_LIT: Stop[] = [
  { t: 0.55, hex: '#7A3A22' },
  { t: 0.85, hex: '#A04E2A' },
  { t: 1.0, hex: '#B35F32' },
];
const NEAR_SHADOW: Stop[] = [
  { t: 0.55, hex: '#4A2410' },
  { t: 0.85, hex: '#6A3819' },
  { t: 1.0, hex: '#7F4323' },
];

/* ────────────────────────────────────────────────────────────────────────
   Static frame (reduced-motion fallback at t=0.85, per spec §9)
   ──────────────────────────────────────────────────────────────────────── */
function StaticArrivalFrame() {
  const t = 0.85;
  const skyTop = interpStops(t, SKY_TOP);
  const skyMid = interpStops(t, SKY_MID);
  const skyHorizon = interpStops(t, SKY_HORIZON);
  const upper = interpStops(t, NEAR_UPPER);
  const lit = interpStops(t, NEAR_LIT);
  const shadow = interpStops(t, NEAR_SHADOW);

  return (
    <div
      className="cinematic-static-frame"
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: `linear-gradient(to bottom, ${skyTop} 0%, ${skyMid} 55%, ${skyHorizon} 100%)`,
      }}
    >
      {/* Rock face — static silhouette filling lower 65% */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <RockFacePaths upperFill={upper} litFill={lit} shadowFill={shadow} />
      </svg>

      {/* Title card — static, centered over lit band */}
      <div className="cinematic-title-card cinematic-title-static" aria-hidden="true">
        <p className="cinematic-title-wordmark">SkyPi Studio</p>
        <div className="cin-title-rule" style={{ transform: 'scaleX(1)', opacity: 0.35 }} />
        <p className="cinematic-title-sub">Est. 2026</p>
        <p className="cinematic-title-sub">Okanagan Valley, British Columbia</p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   ROCK FACE PATHS  (Layer 8 — Dani §5 keystone)
   12 fluted columns of mixed width, sediment break ~40% from top,
   irregular ridgeline, scree base. Same paths reused by static + animated.
   ──────────────────────────────────────────────────────────────────────── */
function RockFacePaths({
  upperFill,
  litFill,
  shadowFill,
}: {
  upperFill: string;
  litFill: string;
  shadowFill: string;
}) {
  // viewBox: 0 0 1440 900. Rock face occupies y=180..900 (lower 80% of the box).
  // Sediment break at y=470 (~40% from top of the rock zone).
  return (
    <>
      {/* Irregular ridgeline silhouette — upper umber zone (above sediment break) */}
      <path
        d="
          M 0 900 L 0 240
          L 60 220 L 110 195 L 165 230 L 215 200 L 270 235
          L 330 190 L 390 215 L 450 185 L 510 225 L 575 195
          L 635 220 L 700 200 L 765 230 L 825 195 L 885 225
          L 950 205 L 1015 235 L 1080 200 L 1145 225 L 1210 195
          L 1275 230 L 1335 205 L 1390 220 L 1440 200
          L 1440 470 L 0 470 Z
        "
        fill={upperFill}
      />

      {/* Lower zone — lit terracotta band below sediment break */}
      <rect x="0" y="470" width="1440" height="430" fill={litFill} />

      {/* Sediment break line — subtle tonal seam */}
      <rect x="0" y="468" width="1440" height="4" fill="rgba(80, 35, 18, 0.35)" />
      <rect x="0" y="474" width="1440" height="2" fill="rgba(255, 220, 180, 0.10)" />

      {/* Vertical fluting — 12 columns with mixed widths (ratios from spec)
          Drawn as shadow strips between columns, top of column varies slightly
          to honor irregular natural erosion. */}
      <g fill={shadowFill} opacity="0.62">
        {/* Column boundaries (x positions). Widths: 1.0/0.7/1.2/0.6/1.1/0.8/1.0/0.65/1.15/0.75/1.05/0.85 */}
        {/* Total ratio sum ≈ 10.85; scale to 1440px → unit ≈ 132.7 */}
        <rect x="118"  y="470" width="6" height="420" />
        <rect x="211"  y="478" width="8" height="412" />
        <rect x="370"  y="470" width="6" height="420" />
        <rect x="450"  y="482" width="9" height="408" />
        <rect x="595"  y="470" width="7" height="420" />
        <rect x="703"  y="478" width="6" height="412" />
        <rect x="836"  y="470" width="8" height="420" />
        <rect x="922"  y="482" width="7" height="408" />
        <rect x="1075" y="470" width="6" height="420" />
        <rect x="1175" y="478" width="9" height="412" />
        <rect x="1314" y="470" width="6" height="420" />
      </g>

      {/* Upper zone fluting — slightly lighter shadow, narrower */}
      <g fill="rgba(60, 30, 18, 0.32)">
        <rect x="118"  y="260" width="4" height="208" />
        <rect x="211"  y="245" width="5" height="223" />
        <rect x="370"  y="225" width="4" height="243" />
        <rect x="450"  y="240" width="6" height="228" />
        <rect x="595"  y="235" width="4" height="233" />
        <rect x="703"  y="240" width="4" height="228" />
        <rect x="836"  y="250" width="5" height="218" />
        <rect x="922"  y="245" width="4" height="223" />
        <rect x="1075" y="240" width="4" height="228" />
        <rect x="1175" y="250" width="6" height="218" />
        <rect x="1314" y="235" width="4" height="233" />
      </g>

      {/* Scree base — 6 talus blocks of mixed scale */}
      <g fill={shadowFill} opacity="0.85">
        <polygon points="120,895 145,872 180,895" />
        <polygon points="320,895 360,860 410,895" />
        <polygon points="560,895 575,880 605,895" />
        <polygon points="780,895 825,855 880,895" />
        <polygon points="1050,895 1075,878 1115,895" />
        <polygon points="1280,895 1310,870 1355,895" />
      </g>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   STARS  (Layer 3 — 36 SVG circles, NOT box-shadow)
   ──────────────────────────────────────────────────────────────────────── */
const STAR_POSITIONS: Array<[number, number, number, number]> = [
  // [cx, cy, r, opacity*100]
  [82, 88, 1.4, 90], [156, 56, 1.7, 80], [221, 92, 1.4, 75], [288, 68, 1.2, 90],
  [344, 110, 1.5, 70], [402, 70, 1.3, 80], [464, 132, 1.5, 65], [528, 84, 1.4, 85],
  [592, 124, 1.2, 70], [664, 56, 1.6, 90], [722, 108, 1.3, 75], [785, 72, 1.4, 80],
  [848, 132, 1.5, 70], [912, 88, 1.3, 85], [968, 124, 1.2, 70], [1032, 60, 1.7, 90],
  [1098, 116, 1.4, 80], [1162, 76, 1.3, 75], [1224, 124, 1.5, 70], [1288, 92, 1.4, 85],
  [1348, 132, 1.2, 65], [128, 168, 1.3, 70], [262, 188, 1.4, 75], [388, 172, 1.2, 65],
  [512, 192, 1.5, 80], [640, 168, 1.3, 70], [768, 188, 1.4, 75], [896, 172, 1.2, 65],
  [1024, 192, 1.5, 80], [1152, 168, 1.3, 70], [1280, 188, 1.4, 75], [186, 232, 1.2, 60],
  [428, 248, 1.3, 65], [684, 228, 1.4, 70], [928, 252, 1.2, 60], [1184, 232, 1.3, 65],
];

/* ────────────────────────────────────────────────────────────────────────
   CinematicIntro — top-level gate
   Switches between reduced-motion static frame and full scroll cinema.
   Each branch is a separate component so React's Rules of Hooks hold:
   no hooks are called conditionally inside one component.
   ──────────────────────────────────────────────────────────────────────── */
export function CinematicIntro() {
  const prefersReducedMotion = useReducedMotion();

  /* Narrow-viewport gate (SSR-safe — no `window` during render so the static
     export builds and the first client paint matches the server: both start
     `false` = AnimatedScene. After mount, phones (<768px) flip to true).
     WHY route phones to StaticArrivalFrame: on <768px the mobile @media
     collapses .cinematic-wrapper-200vh to 100vh, so useScroll's target is
     exactly viewport-height → scrollYProgress = 0/0 = NaN → Framer clamps to
     1.0 → AnimatedScene renders its END frame instantly with no title. The
     static frame is the deliberate, correct final frame with a visible title. */
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (prefersReducedMotion || isNarrow) {
    return <StaticArrivalFrame />;
  }
  return <AnimatedScene />;
}

/* ────────────────────────────────────────────────────────────────────────
   AnimatedScene — the full 200vh scroll-driven cinema
   ──────────────────────────────────────────────────────────────────────── */
function AnimatedScene() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* ──────────────────────────────────────────────────────────────────
     useScroll scoped to the 200vh wrapper.
     Offset 'start start' → 'end end' so scrollYProgress is exactly
     the camera-depth parameter `t` across the whole wrapper.
     ────────────────────────────────────────────────────────────────── */
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // Apply quint S-curve once. Every downstream motion derives from this.
  const t: MotionValue<number> = useTransform(scrollYProgress, easeInOutQuint);

  /* ─────────────────────────────────────────────────────────────────
     NOTE — INPUT RANGES BELOW ARE ON THE EASED TRACK, NOT RAW SCROLL.
     `t` above is `easeInOutQuint(scrollYProgress)`, so every input
     range like `[0.18, 0.30, 0.70, 0.90]` is interpreted on the
     curved track. A keyframe at eased-t 0.30 does NOT correspond to
     a raw scroll position of 30% — it lands where easeInOutQuint
     equals 0.30 (approximately raw 41% on this curve's first half).
     The unified-easing architecture is intentional: every layer
     accelerates and decelerates as one body. Spec act-boundaries
     (Act 1 / 2 / 3) in §4 are written on eased-t and match below.
     To map eased-t back to raw scroll: invert easeInOutQuint
     (bezier 0.83, 0, 0.17, 1).
     ───────────────────────────────────────────────────────────────── */

  /* ── SKY — single gradient, RGB-interpolated stops (Dani §6) ─────── */
  const skyTop = useTransform(t, (v) => interpStops(v, SKY_TOP));
  const skyMid = useTransform(t, (v) => interpStops(v, SKY_MID));
  const skyHorizon = useTransform(t, (v) => interpStops(v, SKY_HORIZON));
  const skyBackground = useTransform([skyTop, skyMid, skyHorizon] as MotionValue<string>[], (vals) => {
    const [top, mid, hz] = vals as string[];
    return `linear-gradient(to bottom, ${top} 0%, ${mid} 55%, ${hz} 100%)`;
  });

  /* ── SUN — hidden t<0.18, crests horizon at t=0.30, settles high t>0.70 ── */
  const sunOpacity = useTransform(t, [0.18, 0.30, 0.70, 0.90], [0, 1, 1, 0.85]);
  const sunY = useTransform(t, [0.18, 0.30, 0.70, 1.0], ['8%', '0%', '-6%', '-8%']);
  const sunScale = useTransform(t, [0.18, 0.30, 0.70, 1.0], [1.0, 1.05, 1.15, 1.2]);
  const sunGlowOp = useTransform(t, [0.18, 0.30, 0.45, 0.85], [0, 0.7, 0.45, 0.2]);

  /* ── STARS — dissolve over t [0, 0.20], scale 1→2.5 ──────────────── */
  const starsOp = useTransform(t, [0, 0.10, 0.20], [1, 0.8, 0]);
  const starsScale = useTransform(t, [0, 1], [1, 2.5]);
  const starsY = useTransform(t, [0, 1], ['0%', '-2%']);

  /* ── MOON — top-center, dissolves t [0.10, 0.32] ─────────────────── */
  const moonOp = useTransform(t, [0, 0.10, 0.32], [1, 0.85, 0]);
  const moonHaloOp = useTransform(t, [0, 0.15, 0.32], [0.06, 0.18, 0]);

  /* ── FAR MESA — visible t=0, color climbs, scale 1.0→1.4 ─────────── */
  const farMesaFill = useTransform(t, (v) => interpStops(v, FAR_MESA));
  const farMesaScale = useTransform(t, [0, 1], [1.0, 1.4]);
  const farMesaY = useTransform(t, [0, 1], ['0%', '3%']);

  /* ── HAZE 1 — atmospheric depth, dusty rose ──────────────────────── */
  const haze1Op = useTransform(t, [0.10, 0.30, 0.50, 0.85], [0.10, 0.50, 0.35, 0]);

  /* ── MID MESA — emerges t [0.15, 0.35], color climbs, scale 1→2 ──── */
  const midMesaOp = useTransform(t, [0.15, 0.35], [0, 1]);
  const midMesaFill = useTransform(t, (v) => interpStops(v, MID_MESA));
  const midMesaScale = useTransform(t, [0, 1], [1.0, 2.0]);
  const midMesaY = useTransform(t, [0, 1], ['0%', '6%']);

  /* ── ROAD + POLES — scale 1→3.5, off-screen by t=0.75 ────────────── */
  const roadOp = useTransform(t, [0, 0.60, 0.72], [1, 1, 0]);
  const roadScale = useTransform(t, [0, 0.75], [1.0, 3.5]);
  const roadY = useTransform(t, [0, 0.75], ['0%', '18%']);

  /* ── FLORA — frame edges, scale 1→4, off-screen by t=0.55 ────────── */
  const floraOp = useTransform(t, [0, 0.42, 0.55], [1, 1, 0]);
  const floraScale = useTransform(t, [0, 0.55], [1.0, 4.0]);
  const floraY = useTransform(t, [0, 0.55], ['0%', '25%']);

  /* ── ROCK FACE — hidden until t=0.55, scale 0.4→1.0 by t=0.85 ────── */
  const rockOp = useTransform(t, [0.50, 0.62, 0.85], [0, 0.6, 1]);
  const rockScale = useTransform(t, [0.50, 0.85, 1.0], [0.4, 0.95, 1.0]);
  const rockUpperFill = useTransform(t, (v) => interpStops(v, NEAR_UPPER));
  const rockLitFill = useTransform(t, (v) => interpStops(v, NEAR_LIT));
  const rockShadowFill = useTransform(t, (v) => interpStops(v, NEAR_SHADOW));

  /* ── TITLE CARD — staggered resolve t [0.82, 0.95], HOLD to end ────
     Wordmark resolves at t [0.82, 0.86] so it appears against the
     fully-lit rock-face `#B35F32` (Dani polish item 7) — contrast
     ratio 4.7:1 vs the cream `#FAF9F5` text (matches spec §6 claim).
     Earlier `[0.78, 0.82]` resolved at ~#A85630 which landed at
     ~4.55:1 — passing AA but tighter than promised. */
  const wordmarkOp = useTransform(t, [0.82, 0.86], [0, 1]);
  const wordmarkTrackingVal = useTransform(t, [0.82, 0.86], [0.12, 0.04]);
  const wordmarkTracking = useTransform(wordmarkTrackingVal, (v) => `${v}em`);
  const ruleScaleX = useTransform(t, [0.86, 0.89], [0, 1]);
  const ruleOp = useTransform(t, [0.86, 0.89], [0, 0.35]);
  const sub1Op = useTransform(t, [0.88, 0.91], [0, 1]);
  const sub2Op = useTransform(t, [0.92, 0.95], [0, 1]);

  /* ── SKIP LINK + SCROLL PROMPT ───────────────────────────────────── */
  const skipOp = useTransform(t, [0.18, 0.22, 0.95, 1.0], [0, 1, 1, 0]);
  const promptOp = useTransform(t, [0, 0.05], [1, 0]);

  function handleSkip() {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div ref={wrapperRef} className="cinematic-wrapper cinematic-wrapper-200vh">
      <div className="cinematic-scene" aria-hidden="true">

        {/* ── LAYER 1 · SKY DOME — single animated gradient ─────────── */}
        <motion.div
          className="cin-sky-dome"
          style={{
            background: skyBackground,
            willChange: 'background',
          }}
        />

        {/* ── LAYER 3 · STAR FIELD (drawn before sun so sun overlays) ─ */}
        <motion.svg
          className="cin-plane"
          viewBox="0 0 1440 320"
          preserveAspectRatio="xMidYMin slice"
          style={{
            opacity: starsOp,
            scale: starsScale,
            y: starsY,
            zIndex: 2,
            willChange: 'transform, opacity',
          }}
        >
          {/* Constellation lines */}
          <g stroke="rgba(255,255,255,0.24)" strokeWidth="0.7" fill="none">
            <line x1="156" y1="56" x2="221" y2="92" />
            <line x1="221" y1="92" x2="288" y2="68" />
            <line x1="288" y1="68" x2="344" y2="110" />
            <line x1="1032" y1="60" x2="1098" y2="116" />
            <line x1="1098" y1="116" x2="1162" y2="76" />
            <line x1="1162" y1="76" x2="1224" y2="124" />
          </g>
          {/* Stars */}
          {STAR_POSITIONS.map(([cx, cy, r, op], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill={`rgba(255, 255, 255, ${op / 100})`}
            />
          ))}
        </motion.svg>

        {/* ── Moon — top-center crescent ───────────────────────────── */}
        <motion.div
          style={{
            opacity: moonOp,
            position: 'absolute',
            top: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(56px, 7vw, 84px)',
            height: 'clamp(56px, 7vw, 84px)',
            zIndex: 3,
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              inset: '-40%',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(253,246,227,0.12) 0%, rgba(253,246,227,0.04) 40%, transparent 70%)',
              opacity: moonHaloOp,
              willChange: 'opacity',
            }}
          />
          <svg viewBox="0 0 120 120" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
            <defs>
              <mask id="cin-crescent-mask">
                <rect width="120" height="120" fill="white" />
                <circle cx="72" cy="50" r="40" fill="black" />
              </mask>
            </defs>
            <circle cx="58" cy="50" r="44" fill="rgba(253,246,227,0.04)" />
            <circle cx="58" cy="50" r="40" fill="rgba(253,246,227,0.06)" />
            <circle cx="58" cy="50" r="36" fill="#FDF6E3" mask="url(#cin-crescent-mask)" />
          </svg>
        </motion.div>

        {/* ── LAYER 2 · SUN — crests behind far mesa at t=0.30 ─────── */}
        <motion.div
          className="cin-plane"
          style={{
            opacity: sunOpacity,
            y: sunY,
            scale: sunScale,
            position: 'absolute',
            top: '52%',
            left: '50%',
            transformOrigin: '50% 50%',
            translateX: '-50%',
            zIndex: 4,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
          }}
        >
          <svg
            viewBox="0 0 400 400"
            aria-hidden="true"
            style={{ width: 'clamp(180px, 22vw, 320px)', height: 'auto', display: 'block' }}
          >
            <defs>
              <radialGradient id="cin-sun-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255, 220, 160, 0.85)" />
                <stop offset="30%" stopColor="rgba(248, 196, 112, 0.45)" />
                <stop offset="70%" stopColor="rgba(232, 152, 80, 0.10)" />
                <stop offset="100%" stopColor="rgba(232, 152, 80, 0)" />
              </radialGradient>
            </defs>
            <motion.circle
              cx="200"
              cy="200"
              r="200"
              fill="url(#cin-sun-glow)"
              style={{ opacity: sunGlowOp }}
            />
            <circle cx="200" cy="200" r="60" fill="#FFE5B8" />
            <circle cx="200" cy="200" r="48" fill="#FFF2D6" />
          </svg>
        </motion.div>

        {/* ── LAYER 4 · FAR MESA — left butte + right mesa silhouettes ── */}
        <motion.svg
          className="cin-plane"
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMax slice"
          style={{
            opacity: 1,
            scale: farMesaScale,
            y: farMesaY,
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 5,
            transformOrigin: '50% 100%',
            willChange: 'transform',
          }}
        >
          {/* Left butte — stepped caprock / cliff / talus profile */}
          <motion.path
            d="
              M 0 600 L 0 460
              L 80 440 L 130 380 L 175 350 L 220 348 L 268 352
              L 308 395 L 340 460
              L 380 600 Z
            "
            fill={farMesaFill}
          />
          {/* Right mesa — long horizontal stratified profile */}
          <motion.path
            d="
              M 880 600 L 880 440
              L 940 410 L 1010 395 L 1090 392 L 1180 395
              L 1260 410 L 1340 425 L 1440 440
              L 1440 600 Z
            "
            fill={farMesaFill}
          />
          {/* Sediment band hints on right mesa (4 bands at low opacity) */}
          <g opacity="0.18">
            <rect x="880" y="465" width="560" height="3" fill="rgba(60, 25, 12, 1)" />
            <rect x="880" y="495" width="560" height="3" fill="rgba(60, 25, 12, 1)" />
            <rect x="880" y="525" width="560" height="3" fill="rgba(60, 25, 12, 1)" />
            <rect x="880" y="555" width="560" height="2" fill="rgba(60, 25, 12, 1)" />
          </g>
        </motion.svg>

        {/* ── LAYER 5 · HAZE 1 — atmospheric depth dusty rose ───────── */}
        <motion.div
          className="cin-plane"
          style={{
            opacity: haze1Op,
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(196,128,98,0.55) 0%, rgba(216,148,118,0.25) 35%, rgba(232,168,142,0.08) 60%, transparent 80%)',
            zIndex: 6,
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
        />

        {/* ── LAYER 6 · MID MESA — closer butte with sediment bands ─── */}
        <motion.svg
          className="cin-plane"
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMax slice"
          style={{
            opacity: midMesaOp,
            scale: midMesaScale,
            y: midMesaY,
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 7,
            transformOrigin: '50% 100%',
            willChange: 'transform, opacity',
          }}
        >
          {/* Mid mesa — closer, more detailed silhouette */}
          <motion.path
            d="
              M 0 600 L 0 510
              L 110 500 L 180 485 L 250 478 L 340 482
              L 420 472 L 510 478 L 600 472 L 700 480
              L 800 472 L 900 482 L 1000 478 L 1100 488
              L 1200 478 L 1300 488 L 1400 482 L 1440 490
              L 1440 600 Z
            "
            fill={midMesaFill}
          />
          {/* Five sediment bands across the mid mesa face */}
          <g opacity="0.14">
            <rect x="0" y="510" width="1440" height="4" fill="rgba(70, 28, 12, 1)" />
            <rect x="0" y="535" width="1440" height="3" fill="rgba(140, 58, 32, 1)" />
            <rect x="0" y="558" width="1440" height="4" fill="rgba(70, 28, 12, 1)" />
            <rect x="0" y="580" width="1440" height="3" fill="rgba(140, 58, 32, 1)" />
            <rect x="0" y="596" width="1440" height="2" fill="rgba(70, 28, 12, 1)" />
          </g>
        </motion.svg>

        {/* ── LAYER 7 · ROAD + TELEPHONE POLES (slides off by t=0.75) ── */}
        <motion.svg
          className="cin-plane"
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMax slice"
          style={{
            opacity: roadOp,
            scale: roadScale,
            y: roadY,
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 8,
            transformOrigin: '50% 100%',
            willChange: 'transform, opacity',
          }}
        >
          {/* Road — converging asphalt to vanishing point */}
          <path
            d="M 580 600 L 700 510 L 720 510 L 860 600 Z"
            fill="rgba(28, 22, 18, 0.78)"
          />
          {/* Center yellow dashes — receding */}
          <g fill="rgba(232, 192, 96, 0.55)">
            <rect x="716" y="510" width="8" height="4" />
            <rect x="714" y="520" width="12" height="5" />
            <rect x="712" y="534" width="16" height="6" />
            <rect x="708" y="550" width="24" height="8" />
            <rect x="702" y="572" width="36" height="10" />
          </g>
          {/* 7 telephone poles, right shoulder, geometric recession */}
          <g stroke="rgba(50, 35, 22, 0.7)" fill="none" strokeWidth="1.2">
            {/* Pole 1 — closest, scale 1.0 */}
            <line x1="900" y1="600" x2="900" y2="430" strokeWidth="3" />
            <line x1="880" y1="450" x2="920" y2="450" strokeWidth="2" />
            {/* Pole 2 — 0.78× */}
            <line x1="870" y1="600" x2="870" y2="475" strokeWidth="2.4" />
            <line x1="853" y1="490" x2="887" y2="490" strokeWidth="1.6" />
            {/* Pole 3 — 0.61× */}
            <line x1="845" y1="600" x2="845" y2="498" strokeWidth="1.8" />
            <line x1="832" y1="510" x2="858" y2="510" strokeWidth="1.2" />
            {/* Pole 4 — 0.48× */}
            <line x1="828" y1="600" x2="828" y2="512" strokeWidth="1.4" />
            <line x1="818" y1="520" x2="838" y2="520" strokeWidth="1" />
            {/* Pole 5 — 0.37× */}
            <line x1="816" y1="600" x2="816" y2="520" strokeWidth="1" />
            <line x1="808" y1="526" x2="824" y2="526" strokeWidth="0.8" />
            {/* Pole 6 — 0.29× */}
            <line x1="808" y1="600" x2="808" y2="525" strokeWidth="0.8" />
            {/* Pole 7 — 0.22×, vanishing point */}
            <line x1="803" y1="600" x2="803" y2="528" strokeWidth="0.6" />
          </g>
        </motion.svg>

        {/* ── LAYER 9 · FLORA — cacti at frame edges (swings past) ─── */}
        <motion.svg
          className="cin-plane"
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMax slice"
          style={{
            opacity: floraOp,
            scale: floraScale,
            y: floraY,
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 9,
            transformOrigin: '50% 100%',
            willChange: 'transform, opacity',
          }}
        >
          {/* Lower-left cluster — prickly pears */}
          <g fill="#4A5828">
            <ellipse cx="62" cy="582" rx="14" ry="8" />
            <ellipse cx="86" cy="588" rx="16" ry="9" />
            <ellipse cx="108" cy="582" rx="13" ry="7" />
          </g>
          <g fill="#6B7C3A">
            <ellipse cx="58" cy="572" rx="12" ry="8" />
            <ellipse cx="84" cy="568" rx="17" ry="10" />
            <ellipse cx="112" cy="572" rx="11" ry="7" />
          </g>
          {/* Tall barrel cactus left of cluster */}
          <g fill="#3A4A1E">
            <path d="M 138 590 C 137 540, 137 480, 138 425 C 139 415, 142 410, 146 408 C 150 410, 152 415, 153 425 C 154 480, 154 540, 153 590 Z" />
          </g>
          <g stroke="rgba(22,50,12,0.30)" strokeWidth="0.8" fill="none">
            <line x1="142" y1="430" x2="142" y2="588" />
            <line x1="148" y1="425" x2="148" y2="588" />
          </g>
          {/* Lower-right cluster */}
          <g fill="#4A5828">
            <ellipse cx="1330" cy="582" rx="14" ry="8" />
            <ellipse cx="1354" cy="588" rx="16" ry="9" />
            <ellipse cx="1376" cy="582" rx="13" ry="7" />
          </g>
          <g fill="#6B7C3A">
            <ellipse cx="1326" cy="572" rx="12" ry="8" />
            <ellipse cx="1352" cy="568" rx="17" ry="10" />
            <ellipse cx="1380" cy="572" rx="11" ry="7" />
          </g>
          {/* Tall barrel cactus right side */}
          <g fill="#3A4A1E">
            <path d="M 1290 590 C 1289 540, 1289 480, 1290 425 C 1291 415, 1294 410, 1298 408 C 1302 410, 1304 415, 1305 425 C 1306 480, 1306 540, 1305 590 Z" />
          </g>
          <g stroke="rgba(22,50,12,0.30)" strokeWidth="0.8" fill="none">
            <line x1="1294" y1="430" x2="1294" y2="588" />
            <line x1="1300" y1="425" x2="1300" y2="588" />
          </g>
        </motion.svg>

        {/* ── LAYER 8 · FOREGROUND ROCK FACE — the destination ────── */}
        <motion.svg
          className="cin-plane cin-rockface"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMax slice"
          style={{
            opacity: rockOp,
            scale: rockScale,
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            transformOrigin: '50% 100%',
            willChange: 'transform, opacity',
          }}
        >
          <RockFacePathsAnimated
            upperFill={rockUpperFill}
            litFill={rockLitFill}
            shadowFill={rockShadowFill}
          />
        </motion.svg>

        {/* ── TITLE CARD — resolves t [0.78, 0.92], HOLDS to end ──── */}
        <div className="cinematic-title-card cinematic-title-desktop">
          <motion.h2
            className="cinematic-title-wordmark"
            style={{ opacity: wordmarkOp, letterSpacing: wordmarkTracking }}
          >
            SkyPi Studio
          </motion.h2>
          <motion.div
            className="cin-title-rule"
            style={{ scaleX: ruleScaleX, opacity: ruleOp }}
            aria-hidden="true"
          />
          <motion.p className="cinematic-title-sub" style={{ opacity: sub1Op }}>
            Est. 2026
          </motion.p>
          <motion.p className="cinematic-title-sub" style={{ opacity: sub2Op }}>
            Okanagan Valley, British Columbia
          </motion.p>
        </div>

        {/* ── Mobile title (CSS-driven stagger, no scroll) ────────── */}
        <div className="cinematic-title-card cinematic-title-mobile">
          <h2 className="cinematic-title-wordmark cin-line-1">SkyPi Studio</h2>
          <p className="cinematic-title-sub cin-line-2">Est. 2026</p>
          <p className="cinematic-title-sub cin-line-3">Okanagan Valley, British Columbia</p>
        </div>

        {/* ── Skip link — keyboard-reachable (WCAG 2.1.1 + 2.4.1) ── */}
        <motion.button
          className="cinematic-skip-link"
          style={{ opacity: skipOp }}
          onClick={handleSkip}
          type="button"
        >
          Skip to the work ↓
        </motion.button>

        {/* ── Scroll prompt — visible t [0, 0.05] ─────────────────── */}
        <motion.div
          className="cinematic-scroll-prompt"
          style={{ opacity: promptOp }}
          aria-hidden="true"
        >
          <span className="cin-prompt-text">Scroll to begin</span>
          <span className="cin-prompt-chevron" aria-hidden="true">&#8964;</span>
        </motion.div>

        {/* Mobile scroll cue */}
        <div className="cinematic-mobile-arrow" aria-hidden="true">↓</div>

      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   RockFacePathsAnimated  (animated MotionValue fill variant of Layer 8)
   ──────────────────────────────────────────────────────────────────────── */
function RockFacePathsAnimated({
  upperFill,
  litFill,
  shadowFill,
}: {
  upperFill: MotionValue<string>;
  litFill: MotionValue<string>;
  shadowFill: MotionValue<string>;
}) {
  return (
    <>
      <motion.path
        d="
          M 0 900 L 0 240
          L 60 220 L 110 195 L 165 230 L 215 200 L 270 235
          L 330 190 L 390 215 L 450 185 L 510 225 L 575 195
          L 635 220 L 700 200 L 765 230 L 825 195 L 885 225
          L 950 205 L 1015 235 L 1080 200 L 1145 225 L 1210 195
          L 1275 230 L 1335 205 L 1390 220 L 1440 200
          L 1440 470 L 0 470 Z
        "
        style={{ fill: upperFill }}
      />
      <motion.rect x="0" y="470" width="1440" height="430" style={{ fill: litFill }} />
      <rect x="0" y="468" width="1440" height="4" fill="rgba(80, 35, 18, 0.35)" />
      <rect x="0" y="474" width="1440" height="2" fill="rgba(255, 220, 180, 0.10)" />

      {/* Lower fluting */}
      <motion.g style={{ fill: shadowFill, opacity: 0.62 }}>
        <rect x="118"  y="470" width="6" height="420" />
        <rect x="211"  y="478" width="8" height="412" />
        <rect x="370"  y="470" width="6" height="420" />
        <rect x="450"  y="482" width="9" height="408" />
        <rect x="595"  y="470" width="7" height="420" />
        <rect x="703"  y="478" width="6" height="412" />
        <rect x="836"  y="470" width="8" height="420" />
        <rect x="922"  y="482" width="7" height="408" />
        <rect x="1075" y="470" width="6" height="420" />
        <rect x="1175" y="478" width="9" height="412" />
        <rect x="1314" y="470" width="6" height="420" />
      </motion.g>

      {/* Upper fluting */}
      <g fill="rgba(60, 30, 18, 0.32)">
        <rect x="118"  y="260" width="4" height="208" />
        <rect x="211"  y="245" width="5" height="223" />
        <rect x="370"  y="225" width="4" height="243" />
        <rect x="450"  y="240" width="6" height="228" />
        <rect x="595"  y="235" width="4" height="233" />
        <rect x="703"  y="240" width="4" height="228" />
        <rect x="836"  y="250" width="5" height="218" />
        <rect x="922"  y="245" width="4" height="223" />
        <rect x="1075" y="240" width="4" height="228" />
        <rect x="1175" y="250" width="6" height="218" />
        <rect x="1314" y="235" width="4" height="233" />
      </g>

      {/* Scree base */}
      <motion.g style={{ fill: shadowFill, opacity: 0.85 }}>
        <polygon points="120,895 145,872 180,895" />
        <polygon points="320,895 360,860 410,895" />
        <polygon points="560,895 575,880 605,895" />
        <polygon points="780,895 825,855 880,895" />
        <polygon points="1050,895 1075,878 1115,895" />
        <polygon points="1280,895 1310,870 1355,895" />
      </motion.g>
    </>
  );
}
