'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInCubic(t: number): number {
  return t * t * t;
}

export function CinematicIntro() {
  const { scrollY } = useScroll();

  // ═══════════════════════════════════════════════════════════════
  //  SKY — atmospheric crossfade + horizon bloom
  // ═══════════════════════════════════════════════════════════════
  const skyNightOp  = useTransform(scrollY, [0, 70, 290], [1, 1, 0]);
  const skyDawnOp   = useTransform(scrollY, [70, 165, 225, 315], [0, 1, 1, 0]);
  const skyGoldenOp = useTransform(scrollY, [240, 340], [0, 1]);
  const horizonGlowOp = useTransform(scrollY, [120, 220, 340], [0, 0.6, 0.9]);

  // ═══════════════════════════════════════════════════════════════
  //  STARS — accelerating spread with parallax zoom
  // ═══════════════════════════════════════════════════════════════
  const starsOp    = useTransform(scrollY, [0, 110, 280], [1, 1, 0]);
  const starsScale = useTransform(scrollY, (v: number) => {
    const t = clamp01(v / 340);
    return 1 + easeInCubic(t) * 2;
  });

  // ═══════════════════════════════════════════════════════════════
  //  MOON — crescent with halo bloom before dissolve
  // ═══════════════════════════════════════════════════════════════
  const moonOp = useTransform(scrollY, [0, 90, 240], [1, 1, 0]);
  const moonHaloScale = useTransform(scrollY, [90, 210], [1, 1.6]);
  const moonHaloOp    = useTransform(scrollY, [90, 155, 230], [0.06, 0.18, 0]);

  // ═══════════════════════════════════════════════════════════════
  //  SHOOTING STAR — blink-and-you-miss-it delight
  // ═══════════════════════════════════════════════════════════════
  const shootingStarOp = useTransform(scrollY, [38, 43, 53, 58], [0, 0.85, 0.85, 0]);
  const shootingStarX  = useTransform(scrollY, [38, 58], [0, 180]);
  const shootingStarY  = useTransform(scrollY, [38, 58], [0, 65]);

  // ═══════════════════════════════════════════════════════════════
  //  LANDSCAPE — base camera descent (eased scale 0.18 → 1.0)
  // ═══════════════════════════════════════════════════════════════
  const landScale = useTransform(scrollY, (v: number) => {
    const t = clamp01(v / 350);
    return 0.18 + easeInOutCubic(t) * 0.82;
  });

  // ═══════════════════════════════════════════════════════════════
  //  DEPTH PARALLAX — staggered reveal + vertical offsets
  //  Far = appears first, lags most (pushed down as camera drops)
  //  Near = appears last, no lag (reference plane)
  // ═══════════════════════════════════════════════════════════════
  const farMesaOp = useTransform(scrollY, [60, 160], [0, 1]);
  const farMesaY  = useTransform(scrollY, [60, 350], [0, 18]);

  const midMesaOp = useTransform(scrollY, [80, 190], [0, 1]);
  const midMesaY  = useTransform(scrollY, [80, 350], [0, 8]);

  const nearMesaOp = useTransform(scrollY, [100, 210], [0, 1]);

  const floraOp = useTransform(scrollY, [200, 290], [0, 1]);
  const floraY  = useTransform(scrollY, [200, 350], [0, -4]);

  // ═══════════════════════════════════════════════════════════════
  //  ATMOSPHERIC DEPTH HAZE — warm amber between mesa groups
  // ═══════════════════════════════════════════════════════════════
  const depthHaze1Op = useTransform(scrollY, [150, 300], [0, 0.35]);
  const depthHaze2Op = useTransform(scrollY, [180, 320], [0, 0.25]);

  // ═══════════════════════════════════════════════════════════════
  //  DUST MOTES — golden-hour suspended particles
  // ═══════════════════════════════════════════════════════════════
  const dustOp = useTransform(scrollY, [240, 340], [0, 0.55]);

  // ═══════════════════════════════════════════════════════════════
  //  TITLE CARD — WA chapter opening
  // ═══════════════════════════════════════════════════════════════
  const titleY       = useTransform(scrollY, [270, 315, 360, 410], [10, 0, 0, -4]);
  const titleScale   = useTransform(scrollY, [270, 315], [1.015, 1]);
  const titleLine1Op = useTransform(scrollY, [270, 312, 360, 410], [0, 1, 1, 0]);
  const titleLine2Op = useTransform(scrollY, [282, 320, 360, 410], [0, 1, 1, 0]);
  const titleLine3Op = useTransform(scrollY, [292, 326, 360, 410], [0, 1, 1, 0]);

  const titleTrackingVal = useTransform(scrollY, [270, 315], [0.12, 0.04]);
  const titleTracking    = useTransform(titleTrackingVal, (v: number) => `${v}em`);
  const subTrackingVal   = useTransform(scrollY, [282, 326], [0.35, 0.22]);
  const subTracking      = useTransform(subTrackingVal, (v: number) => `${v}em`);

  const ruleScaleX = useTransform(scrollY, [305, 335, 360, 410], [0, 1, 1, 0]);
  const ruleOp     = useTransform(scrollY, [305, 325, 360, 410], [0, 0.35, 0.35, 0]);

  const skipOp   = useTransform(scrollY, [145, 190, 370, 415], [0, 1, 1, 0]);
  const promptOp = useTransform(scrollY, [0, 80], [1, 0]);

  function handleSkip() {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="cinematic-wrapper" aria-hidden="true">
      <div className="cinematic-scene">

        {/* ── Sky layers ──────────────────────────────────────────── */}
        <motion.div className="cin-sky cin-sky-night"  style={{ opacity: skyNightOp }} />
        <motion.div className="cin-sky cin-sky-dawn"   style={{ opacity: skyDawnOp }} />
        <motion.div className="cin-sky cin-sky-golden" style={{ opacity: skyGoldenOp }} />

        {/* Horizon bloom — warm radial glow at the horizon during dawn */}
        <motion.div className="cin-horizon-glow" style={{ opacity: horizonGlowOp }} />

        {/* ── Stars ───────────────────────────────────────────────── */}
        <motion.div
          className="cin-stars"
          style={{ opacity: starsOp, scale: starsScale }}
        />

        {/* ── Constellations ──────────────────────────────────────── */}
        <motion.svg
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          style={{
            opacity: starsOp,
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 3,
            willChange: 'opacity',
          }}
        >
          <g stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" fill="none">
            <line x1="130" y1="95"  x2="175" y2="65" />
            <line x1="175" y1="65"  x2="215" y2="88" />
            <line x1="215" y1="88"  x2="248" y2="60" />
            <line x1="248" y1="60"  x2="230" y2="112" />
            <line x1="175" y1="65"  x2="155" y2="132" />
          </g>
          <g fill="rgba(255,255,255,0.6)">
            <circle cx="130" cy="95"  r="1.5" />
            <circle cx="175" cy="65"  r="1.8" />
            <circle cx="215" cy="88"  r="1.5" />
            <circle cx="248" cy="60"  r="1.3" />
            <circle cx="230" cy="112" r="1.5" />
            <circle cx="155" cy="132" r="1.2" />
          </g>
          <g stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" fill="none">
            <line x1="1052" y1="72"  x2="1097" y2="50" />
            <line x1="1097" y1="50"  x2="1142" y2="75" />
            <line x1="1142" y1="75"  x2="1128" y2="118" />
            <line x1="1097" y1="50"  x2="1082" y2="122" />
          </g>
          <g fill="rgba(255,255,255,0.52)">
            <circle cx="1052" cy="72"  r="1.5" />
            <circle cx="1097" cy="50"  r="1.8" />
            <circle cx="1142" cy="75"  r="1.5" />
            <circle cx="1128" cy="118" r="1.3" />
            <circle cx="1082" cy="122" r="1.2" />
          </g>
        </motion.svg>

        {/* ── Moon — crescent with luminous halo bloom ──────────── */}
        <motion.div
          style={{
            opacity: moonOp,
            position: 'absolute', top: '8%', left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(56px, 7vw, 84px)', height: 'clamp(56px, 7vw, 84px)',
            zIndex: 3, overflow: 'visible',
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              inset: '-40%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(253,246,227,0.12) 0%, rgba(253,246,227,0.04) 40%, transparent 70%)',
              scale: moonHaloScale,
              opacity: moonHaloOp,
              willChange: 'transform, opacity',
            }}
          />
          <svg
            viewBox="0 0 120 120"
            aria-hidden="true"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <mask id="cin-crescent">
                <rect width="120" height="120" fill="white" />
                <circle cx="72" cy="50" r="40" fill="black" />
              </mask>
            </defs>
            <circle cx="58" cy="50" r="52" fill="rgba(253,246,227,0.02)" />
            <circle cx="58" cy="50" r="44" fill="rgba(253,246,227,0.04)" />
            <circle cx="58" cy="50" r="40" fill="rgba(253,246,227,0.06)" />
            <circle cx="58" cy="50" r="36" fill="#FDF6E3" mask="url(#cin-crescent)" />
          </svg>
        </motion.div>

        {/* ── Shooting star — scroll-driven streak ────────────── */}
        <motion.div
          className="cin-shooting-star"
          style={{ opacity: shootingStarOp, x: shootingStarX, y: shootingStarY }}
        />

        {/* ═══════════════════════════════════════════════════════
            LANDSCAPE — depth-layered parallax system
            ═══════════════════════════════════════════════════════ */}
        <motion.div className="cin-landscape-zoom" style={{ scale: landScale }}>

          {/* Ground plane */}
          <svg
            className="cin-ground-svg"
            viewBox="0 0 1440 500"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect x="0" y="386" width="1440" height="114" fill="#2A1A0B" />
            <rect x="0" y="381" width="1440" height="8"   fill="#3A2410" />
          </svg>

          {/* ── FAR MESAS — atmospheric blue-shift, most parallax lag ── */}
          <motion.svg
            className="cin-mesas-svg"
            viewBox="0 0 1440 500"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ opacity: farMesaOp, y: farMesaY }}
          >
            <defs>
              <clipPath id="mfl"><path d="M 42 390 L 68 290 L 92 262 L 140 258 L 205 260 L 248 262 L 262 290 L 280 390 Z" /></clipPath>
              <clipPath id="mfr"><path d="M 1162 390 L 1182 280 L 1200 254 L 1250 250 L 1312 252 L 1358 254 L 1375 278 L 1398 390 Z" /></clipPath>
            </defs>
            <g>
              <path d="M 42 390 L 68 290 L 92 262 L 140 258 L 205 260 L 248 262 L 262 290 L 280 390 Z" fill="#5E2216" />
              <path d="M 92 262 L 140 258 L 205 260 L 248 262 L 255 285 L 100 287 Z" fill="#7A3022" />
              <path d="M 42 390 L 68 290 L 100 287 L 106 390 Z" fill="rgba(180,90,55,0.18)" />
              <path d="M 272 390 L 262 290 L 255 285 L 264 390 Z" fill="rgba(50,18,8,0.22)" />
              <g clipPath="url(#mfl)">
                <rect x="30" y="290" width="260" height="3" fill="rgba(130,55,30,0.14)" />
                <rect x="30" y="318" width="260" height="4" fill="rgba(90,35,18,0.12)" />
                <rect x="30" y="348" width="260" height="3" fill="rgba(130,55,30,0.10)" />
                <rect x="30" y="374" width="260" height="4" fill="rgba(90,35,18,0.10)" />
                <line x1="155" y1="260" x2="152" y2="390" stroke="rgba(40,15,8,0.07)" strokeWidth="0.7" />
                <line x1="210" y1="261" x2="208" y2="390" stroke="rgba(40,15,8,0.05)" strokeWidth="0.6" />
              </g>
            </g>
            <g>
              <path d="M 1162 390 L 1182 280 L 1200 254 L 1250 250 L 1312 252 L 1358 254 L 1375 278 L 1398 390 Z" fill="#5E2216" />
              <path d="M 1200 254 L 1250 250 L 1312 252 L 1358 254 L 1365 278 L 1208 280 Z" fill="#7A3022" />
              <path d="M 1162 390 L 1182 280 L 1208 280 L 1214 390 Z" fill="rgba(180,90,55,0.18)" />
              <path d="M 1390 390 L 1375 278 L 1365 278 L 1378 390 Z" fill="rgba(50,18,8,0.22)" />
              <g clipPath="url(#mfr)">
                <rect x="1155" y="282" width="250" height="3" fill="rgba(130,55,30,0.14)" />
                <rect x="1155" y="312" width="250" height="4" fill="rgba(90,35,18,0.12)" />
                <rect x="1155" y="342" width="250" height="3" fill="rgba(130,55,30,0.10)" />
                <rect x="1155" y="370" width="250" height="4" fill="rgba(90,35,18,0.10)" />
                <line x1="1278" y1="252" x2="1276" y2="390" stroke="rgba(40,15,8,0.06)" strokeWidth="0.7" />
                <line x1="1230" y1="251" x2="1228" y2="390" stroke="rgba(40,15,8,0.05)" strokeWidth="0.6" />
              </g>
            </g>
          </motion.svg>

          {/* Atmospheric haze 1 — between far and mid depth planes */}
          <motion.div className="cin-depth-haze" style={{ opacity: depthHaze1Op }} />

          {/* ── MID MESAS — medium parallax lag ────────────────── */}
          <motion.svg
            className="cin-mesas-svg"
            viewBox="0 0 1440 500"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ opacity: midMesaOp, y: midMesaY }}
          >
            <defs>
              <clipPath id="mlc"><path d="M 382 390 L 410 255 L 432 220 L 468 216 L 510 214 L 550 216 L 568 252 L 585 390 Z" /></clipPath>
              <clipPath id="mrc"><path d="M 858 390 L 880 248 L 900 210 L 942 206 L 998 207 L 1038 210 L 1056 246 L 1080 390 Z" /></clipPath>
            </defs>
            <g>
              <path d="M 382 390 L 410 255 L 432 220 L 468 216 L 510 214 L 550 216 L 568 252 L 585 390 Z" fill="#7D2E1E" />
              <path d="M 432 220 L 468 216 L 510 214 L 550 216 L 560 246 L 442 248 Z" fill="#9B3824" />
              <path d="M 382 390 L 410 255 L 442 248 L 448 390 Z" fill="rgba(190,95,58,0.20)" />
              <path d="M 578 390 L 568 252 L 560 246 L 572 390 Z" fill="rgba(50,18,8,0.24)" />
              <g clipPath="url(#mlc)">
                <rect x="375" y="256" width="220" height="4" fill="rgba(140,58,32,0.13)" />
                <rect x="375" y="290" width="220" height="3" fill="rgba(90,32,16,0.14)" />
                <rect x="375" y="326" width="220" height="4" fill="rgba(140,58,32,0.11)" />
                <rect x="375" y="360" width="220" height="3" fill="rgba(90,32,16,0.10)" />
                <line x1="478" y1="216" x2="476" y2="390" stroke="rgba(40,15,8,0.06)" strokeWidth="0.7" />
                <line x1="530" y1="216" x2="528" y2="390" stroke="rgba(40,15,8,0.05)" strokeWidth="0.6" />
              </g>
            </g>
            <g>
              <path d="M 858 390 L 880 248 L 900 210 L 942 206 L 998 207 L 1038 210 L 1056 246 L 1080 390 Z" fill="#7D2E1E" />
              <path d="M 900 210 L 942 206 L 998 207 L 1038 210 L 1047 242 L 910 244 Z" fill="#9B3824" />
              <path d="M 858 390 L 880 248 L 910 244 L 916 390 Z" fill="rgba(190,95,58,0.20)" />
              <path d="M 1072 390 L 1056 246 L 1047 242 L 1060 390 Z" fill="rgba(50,18,8,0.24)" />
              <g clipPath="url(#mrc)">
                <rect x="850" y="252" width="240" height="4" fill="rgba(140,58,32,0.13)" />
                <rect x="850" y="288" width="240" height="3" fill="rgba(90,32,16,0.14)" />
                <rect x="850" y="322" width="240" height="4" fill="rgba(140,58,32,0.11)" />
                <rect x="850" y="358" width="240" height="3" fill="rgba(90,32,16,0.10)" />
                <line x1="968" y1="207" x2="966" y2="390" stroke="rgba(40,15,8,0.06)" strokeWidth="0.7" />
                <line x1="920" y1="208" x2="918" y2="390" stroke="rgba(40,15,8,0.05)" strokeWidth="0.6" />
              </g>
            </g>
          </motion.svg>

          {/* Atmospheric haze 2 — between mid and near depth planes */}
          <motion.div className="cin-depth-haze cin-depth-haze-2" style={{ opacity: depthHaze2Op }} />

          {/* ── NEAR MESA — center hero piece, no parallax lag ──── */}
          <motion.svg
            className="cin-mesas-svg"
            viewBox="0 0 1440 500"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ opacity: nearMesaOp }}
          >
            <defs>
              <clipPath id="mc"><path d="M 578 390 L 615 238 L 642 165 L 682 161 L 720 159 L 758 161 L 798 164 L 825 240 L 862 390 Z" /></clipPath>
            </defs>
            <g>
              <path d="M 578 390 L 615 238 L 642 165 L 682 161 L 720 159 L 758 161 L 798 164 L 825 240 L 862 390 Z" fill="#7D2E1E" />
              <path d="M 642 165 L 682 161 L 720 159 L 758 161 L 798 164 L 810 198 L 632 200 Z" fill="#A03828" />
              <path d="M 578 390 L 615 238 L 632 200 L 638 390 Z" fill="rgba(200,100,62,0.22)" />
              <path d="M 852 390 L 825 240 L 810 198 L 820 390 Z" fill="rgba(50,18,8,0.26)" />
              <g clipPath="url(#mc)">
                <rect x="570" y="210" width="300" height="5" fill="rgba(160,56,40,0.12)" />
                <rect x="570" y="248" width="300" height="4" fill="rgba(100,36,18,0.14)" />
                <rect x="570" y="282" width="300" height="5" fill="rgba(160,56,40,0.11)" />
                <rect x="570" y="318" width="300" height="4" fill="rgba(100,36,18,0.12)" />
                <rect x="570" y="352" width="300" height="5" fill="rgba(160,56,40,0.09)" />
                <rect x="570" y="378" width="300" height="3" fill="rgba(100,36,18,0.08)" />
                <line x1="680" y1="162" x2="678" y2="390" stroke="rgba(40,15,8,0.06)" strokeWidth="0.7" />
                <line x1="740" y1="162" x2="738" y2="390" stroke="rgba(40,15,8,0.05)" strokeWidth="0.6" />
                <line x1="660" y1="166" x2="658" y2="390" stroke="rgba(40,15,8,0.04)" strokeWidth="0.5" />
              </g>
            </g>
          </motion.svg>

          {/* ── Flora — foreground, slight upward parallax ─────── */}
          <motion.svg
            className="cin-flora-svg"
            viewBox="0 0 1440 500"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ opacity: floraOp, y: floraY }}
          >
            <g fill="#4A5828">
              <ellipse cx="148" cy="388" rx="9"  ry="5" />
              <ellipse cx="158" cy="391" rx="10" ry="5" />
              <ellipse cx="165" cy="387" rx="8"  ry="4" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="146" cy="385" rx="8"  ry="5" />
              <ellipse cx="157" cy="384" rx="11" ry="6" />
              <ellipse cx="167" cy="385" rx="7"  ry="4" />
            </g>
            <g stroke="#6B7C3A" strokeWidth="0.8" strokeLinecap="round" fill="none">
              <line x1="148" y1="383" x2="145" y2="377" />
              <line x1="157" y1="382" x2="159" y2="375" />
              <line x1="164" y1="383" x2="168" y2="378" />
            </g>
            <g fill="#4A5828">
              <ellipse cx="308" cy="389" rx="9" ry="5" />
              <ellipse cx="319" cy="391" rx="8" ry="4" />
              <ellipse cx="326" cy="388" rx="9" ry="5" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="306" cy="385" rx="8"  ry="5" />
              <ellipse cx="317" cy="384" rx="10" ry="6" />
              <ellipse cx="327" cy="385" rx="8"  ry="5" />
            </g>
            <g fill="#4A5828">
              <ellipse cx="465" cy="389" rx="10" ry="5" />
              <ellipse cx="477" cy="391" rx="9"  ry="5" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="461" cy="386" rx="8"  ry="5" />
              <ellipse cx="473" cy="385" rx="12" ry="6" />
              <ellipse cx="484" cy="386" rx="8"  ry="4" />
            </g>
            <g stroke="#6B7C3A" strokeWidth="0.8" strokeLinecap="round" fill="none">
              <line x1="465" y1="384" x2="462" y2="377" />
              <line x1="475" y1="383" x2="478" y2="376" />
              <line x1="482" y1="384" x2="486" y2="379" />
            </g>
            <g fill="#4A5828">
              <ellipse cx="516" cy="389" rx="8" ry="4" />
              <ellipse cx="526" cy="391" rx="9" ry="5" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="514" cy="386" rx="7"  ry="4" />
              <ellipse cx="524" cy="385" rx="10" ry="5" />
              <ellipse cx="533" cy="386" rx="8"  ry="4" />
            </g>
            <g fill="#4A5828">
              <ellipse cx="784" cy="389" rx="10" ry="5" />
              <ellipse cx="796" cy="391" rx="9"  ry="5" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="780" cy="386" rx="9"  ry="5" />
              <ellipse cx="793" cy="385" rx="11" ry="6" />
              <ellipse cx="805" cy="386" rx="8"  ry="4" />
            </g>
            <g stroke="#6B7C3A" strokeWidth="0.8" strokeLinecap="round" fill="none">
              <line x1="784" y1="384" x2="781" y2="377" />
              <line x1="794" y1="383" x2="797" y2="376" />
            </g>
            <g fill="#4A5828">
              <ellipse cx="1088" cy="389" rx="9"  ry="5" />
              <ellipse cx="1100" cy="391" rx="10" ry="5" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="1085" cy="386" rx="8"  ry="5" />
              <ellipse cx="1097" cy="385" rx="12" ry="6" />
              <ellipse cx="1109" cy="386" rx="8"  ry="4" />
            </g>
            <g stroke="#6B7C3A" strokeWidth="0.8" strokeLinecap="round" fill="none">
              <line x1="1090" y1="384" x2="1087" y2="377" />
              <line x1="1098" y1="383" x2="1101" y2="376" />
              <line x1="1106" y1="384" x2="1110" y2="379" />
            </g>
            <g fill="#4A5828">
              <ellipse cx="1248" cy="389" rx="9"  ry="5" />
              <ellipse cx="1260" cy="391" rx="10" ry="5" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="1245" cy="385" rx="8"  ry="5" />
              <ellipse cx="1257" cy="384" rx="11" ry="6" />
              <ellipse cx="1268" cy="385" rx="7"  ry="4" />
            </g>
            <g fill="#4A5828">
              <ellipse cx="692" cy="390" rx="7" ry="4" />
              <ellipse cx="701" cy="392" rx="8" ry="4" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="690" cy="387" rx="6"  ry="4" />
              <ellipse cx="699" cy="386" rx="9"  ry="5" />
              <ellipse cx="708" cy="387" rx="6"  ry="3" />
            </g>
            <g fill="#2D5A20">
              <path d="M 624 390 C 623 360, 623 310, 624 278 C 625 270, 627 266, 630 264 C 633 266, 635 270, 636 278 C 637 310, 637 360, 636 390 Z" />
              <path d="M 625 332 C 620 330, 608 328, 600 322 C 594 316, 592 308, 592 296 C 592 282, 593 276, 596 274 C 599 276, 600 282, 600 296 C 600 308, 604 316, 610 320 C 616 324, 624 328, 625 328 Z" />
              <path d="M 635 324 C 640 322, 652 320, 660 314 C 666 308, 668 300, 668 288 C 668 276, 669 270, 672 268 C 675 270, 676 276, 676 288 C 676 300, 672 310, 666 316 C 658 322, 642 324, 635 322 Z" />
            </g>
            <g stroke="rgba(22,50,12,0.25)" strokeWidth="0.6" fill="none">
              <line x1="628" y1="272" x2="628" y2="388" />
              <line x1="632" y1="268" x2="632" y2="388" />
            </g>
            <path d="M 624 390 C 623 360, 623 310, 624 278 C 625 270, 626 267, 628 265 L 628 390 Z" fill="rgba(70,120,45,0.18)" />
            <ellipse cx="648" cy="389" rx="14" ry="3" fill="rgba(30,12,6,0.16)" />
            <g strokeLinecap="round" fill="none">
              <path d="M 920 390 C 919 370, 918 345, 917 320 C 916 312, 917 308, 918 305" stroke="#4A3820" strokeWidth="5" />
              <line x1="918" y1="335" x2="886" y2="302" stroke="#4A3820" strokeWidth="3" />
              <line x1="918" y1="325" x2="952" y2="296" stroke="#4A3820" strokeWidth="2.8" />
              <line x1="917" y1="316" x2="894" y2="288" stroke="#4A3820" strokeWidth="2.2" />
              <line x1="918" y1="308" x2="940" y2="282" stroke="#4A3820" strokeWidth="2" />
              <line x1="886" y1="302" x2="868" y2="284" stroke="#54432A" strokeWidth="1.6" />
              <line x1="886" y1="302" x2="880" y2="278" stroke="#54432A" strokeWidth="1.4" />
              <line x1="894" y1="288" x2="878" y2="272" stroke="#54432A" strokeWidth="1.4" />
              <line x1="894" y1="288" x2="898" y2="268" stroke="#54432A" strokeWidth="1.2" />
              <line x1="952" y1="296" x2="938" y2="278" stroke="#54432A" strokeWidth="1.6" />
              <line x1="952" y1="296" x2="968" y2="280" stroke="#54432A" strokeWidth="1.4" />
              <line x1="940" y1="282" x2="956" y2="266" stroke="#54432A" strokeWidth="1.2" />
              <line x1="868" y1="284" x2="860" y2="272" stroke="#5C4C30" strokeWidth="0.9" />
              <line x1="868" y1="284" x2="864" y2="268" stroke="#5C4C30" strokeWidth="0.8" />
              <line x1="880" y1="278" x2="874" y2="264" stroke="#5C4C30" strokeWidth="0.8" />
              <line x1="938" y1="278" x2="930" y2="264" stroke="#5C4C30" strokeWidth="0.9" />
              <line x1="968" y1="280" x2="976" y2="266" stroke="#5C4C30" strokeWidth="0.8" />
              <line x1="956" y1="266" x2="962" y2="254" stroke="#5C4C30" strokeWidth="0.7" />
              <line x1="886" y1="302" x2="892" y2="316" stroke="#54432A" strokeWidth="1" />
              <line x1="952" y1="296" x2="960" y2="308" stroke="#54432A" strokeWidth="0.9" />
            </g>
            <ellipse cx="934" cy="389" rx="12" ry="3" fill="rgba(30,12,6,0.14)" />
          </motion.svg>
        </motion.div>

        {/* ── Dust motes — golden-hour floating particles ──────── */}
        <motion.div className="cin-dust-motes" style={{ opacity: dustOp }} />

        {/* ── Atmospheric haze — warm golden-hour glow at horizon ─ */}
        <motion.div className="cin-atmosphere" style={{ opacity: skyGoldenOp }} />

        {/* ── Title card — mobile (CSS time-based stagger) ─────── */}
        <div className="cinematic-title-card cinematic-title-mobile" aria-hidden="true">
          <p className="cinematic-title-wordmark cin-line-1">SkyPi Studio</p>
          <p className="cinematic-title-sub cin-line-2">Est. 2026</p>
          <p className="cinematic-title-sub cin-line-3">Okanagan Valley, British Columbia</p>
        </div>

        {/* ── Title card — desktop (WA chapter opening) ────────── */}
        <div className="cinematic-title-card cinematic-title-desktop" aria-hidden="true">
          <motion.div style={{ y: titleY, scale: titleScale }}>
            <motion.p
              className="cinematic-title-wordmark"
              style={{ opacity: titleLine1Op, letterSpacing: titleTracking }}
            >
              SkyPi Studio
            </motion.p>
            <motion.div
              className="cin-title-rule"
              style={{ scaleX: ruleScaleX, opacity: ruleOp }}
            />
            <motion.p
              className="cinematic-title-sub"
              style={{ opacity: titleLine2Op, letterSpacing: subTracking }}
            >
              Est. 2026
            </motion.p>
            <motion.p
              className="cinematic-title-sub"
              style={{ opacity: titleLine3Op, letterSpacing: subTracking }}
            >
              Okanagan Valley, British Columbia
            </motion.p>
          </motion.div>
        </div>

        {/* ── Skip link ───────────────────────────────────────── */}
        <motion.button
          className="cinematic-skip-link"
          style={{ opacity: skipOp }}
          onClick={handleSkip}
          tabIndex={-1}
          aria-hidden="true"
        >
          Skip to the work ↓
        </motion.button>

        {/* ── Scroll prompt — breathing text + chevron bob ─────── */}
        <motion.div
          className="cinematic-scroll-prompt"
          style={{ opacity: promptOp }}
          aria-hidden="true"
        >
          <span className="cin-prompt-text">Scroll to begin</span>
          <span className="cin-prompt-chevron" aria-hidden="true">&#8964;</span>
        </motion.div>

        {/* ── Mobile scroll cue ───────────────────────────────── */}
        <div className="cinematic-mobile-arrow" aria-hidden="true">↓</div>

      </div>
    </div>
  );
}
