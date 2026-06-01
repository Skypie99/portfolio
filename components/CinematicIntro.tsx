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

  // ── Sky: atmospheric crossfade ──────────────────────────────────────
  const skyNightOp  = useTransform(scrollY, [0, 70, 290], [1, 1, 0]);
  const skyDawnOp   = useTransform(scrollY, [70, 165, 225, 315], [0, 1, 1, 0]);
  const skyGoldenOp = useTransform(scrollY, [240, 340], [0, 1]);

  // ── Stars: accelerating spread — parallax increases with proximity ──
  const starsOp    = useTransform(scrollY, [0, 110, 280], [1, 1, 0]);
  const starsScale = useTransform(scrollY, (v: number) => {
    const t = clamp01(v / 340);
    return 1 + easeInCubic(t) * 2;
  });
  const moonOp = useTransform(scrollY, [0, 90, 240], [1, 1, 0]);

  // ── Landscape: eased descent — slow start, dramatic middle, gentle landing
  const landScale = useTransform(scrollY, (v: number) => {
    const t = clamp01(v / 350);
    return 0.18 + easeInOutCubic(t) * 0.82;
  });
  const mesaOp  = useTransform(scrollY, [80, 190], [0, 1]);
  const floraOp = useTransform(scrollY, [200, 290], [0, 1]);

  // ── Title card: staggered entrance, y-drift, extended hold ──────────
  const titleY       = useTransform(scrollY, [270, 315, 360, 410], [10, 0, 0, -4]);
  const titleLine1Op = useTransform(scrollY, [270, 312, 360, 410], [0, 1, 1, 0]);
  const titleLine2Op = useTransform(scrollY, [282, 320, 360, 410], [0, 1, 1, 0]);
  const titleLine3Op = useTransform(scrollY, [292, 326, 360, 410], [0, 1, 1, 0]);
  const skipOp       = useTransform(scrollY, [145, 190, 370, 415], [0, 1, 1, 0]);
  const promptOp = useTransform(scrollY, [0, 80], [1, 0]);

  function handleSkip() {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="cinematic-wrapper" aria-hidden="true">
      <div className="cinematic-scene">

        {/* ── Sky layers (Framer Motion opacity) ─────────────────────── */}
        <motion.div className="cin-sky cin-sky-night"  style={{ opacity: skyNightOp }} />
        <motion.div className="cin-sky cin-sky-dawn"   style={{ opacity: skyDawnOp }} />
        <motion.div className="cin-sky cin-sky-golden" style={{ opacity: skyGoldenOp }} />

        {/* ── Stars — scale outward as camera drops (spreading zoom effect) */}
        <motion.div
          className="cin-stars"
          style={{ opacity: starsOp, scale: starsScale }}
        />

        {/* ── Constellations ──────────────────────────────────────────── */}
        <motion.svg
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          style={{
            opacity: starsOp,
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 3,
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

        {/* ── Moon (crescent) ─────────────────────────────────────────── */}
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 120 120"
          style={{
            opacity: moonOp,
            position: 'absolute', top: '8%', left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(56px, 7vw, 84px)', height: 'clamp(56px, 7vw, 84px)',
            zIndex: 3, overflow: 'visible',
          }}
        >
          <defs>
            <mask id="cin-crescent">
              <rect width="120" height="120" fill="white" />
              <circle cx="72" cy="50" r="40" fill="black" />
            </mask>
          </defs>
          <circle cx="58" cy="50" r="40" fill="rgba(253,246,227,0.06)" />
          <circle cx="58" cy="50" r="36" fill="#FDF6E3" mask="url(#cin-crescent)" />
        </motion.svg>

        {/* ── Landscape zoom container ─────────────────────────────────
            Camera starts high (scale 0.18 = distant horizon strip).
            As scroll increases the scene grows toward full-screen ground level.
            transform-origin: bottom center keeps ground anchored.          */}
        <motion.div className="cin-landscape-zoom" style={{ scale: landScale }}>

          {/* Ground plane — visible as soon as the zoom container appears */}
          <svg
            className="cin-ground-svg"
            viewBox="0 0 1440 500"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect x="0" y="386" width="1440" height="114" fill="#2A1A0B" />
            <rect x="0" y="381" width="1440" height="8"   fill="#3A2410" />
          </svg>

          {/* ── Mesa formations ─────────────────────────────────────────
              WA symmetry: center mesa (tallest) flanked by two shorter
              on each side. Light source from the left — left faces lighter,
              right faces darker. Geological striations on all cliff faces.  */}
          <motion.svg
            className="cin-mesas-svg"
            viewBox="0 0 1440 500"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ opacity: mesaOp }}
          >
            {/* FAR-LEFT MESA — atmospheric blue-shift (most distant) */}
            <g>
              <path d="M 42 390 L 68 290 L 92 262 L 140 258 L 205 260 L 248 262 L 262 290 L 280 390 Z" fill="#5E2216" />
              {/* Cap band — slightly lighter rock on top tier */}
              <path d="M 92 262 L 140 258 L 205 260 L 248 262 L 255 285 L 100 287 Z" fill="#7A3022" />
              {/* Left face highlight (light from left) */}
              <path d="M 42 390 L 68 290 L 100 287 L 106 390 Z" fill="rgba(200,100,70,0.18)" />
              {/* Right face shadow */}
              <path d="M 272 390 L 262 290 L 255 285 L 264 390 Z" fill="rgba(0,0,0,0.22)" />
              {/* Geological striations */}
              <g stroke="rgba(0,0,0,0.1)" strokeWidth="0.9" fill="none">
                <line x1="115" y1="287" x2="110" y2="390" />
                <line x1="140" y1="285" x2="136" y2="390" />
                <line x1="165" y1="286" x2="162" y2="390" />
                <line x1="195" y1="285" x2="193" y2="390" />
                <line x1="225" y1="285" x2="224" y2="390" />
              </g>
            </g>

            {/* LEFT-CENTER MESA */}
            <g>
              <path d="M 382 390 L 410 255 L 432 220 L 468 216 L 510 214 L 550 216 L 568 252 L 585 390 Z" fill="#7D2E1E" />
              <path d="M 432 220 L 468 216 L 510 214 L 550 216 L 560 246 L 442 248 Z" fill="#9B3824" />
              <path d="M 382 390 L 410 255 L 442 248 L 448 390 Z" fill="rgba(200,100,70,0.20)" />
              <path d="M 578 390 L 568 252 L 560 246 L 572 390 Z" fill="rgba(0,0,0,0.24)" />
              <g stroke="rgba(0,0,0,0.11)" strokeWidth="0.9" fill="none">
                <line x1="458" y1="248" x2="454" y2="390" />
                <line x1="478" y1="247" x2="475" y2="390" />
                <line x1="502" y1="246" x2="499" y2="390" />
                <line x1="525" y1="247" x2="523" y2="390" />
                <line x1="545" y1="248" x2="543" y2="390" />
              </g>
            </g>

            {/* CENTER MESA — hero piece, tallest, WA focal point */}
            <g>
              <path d="M 578 390 L 615 238 L 642 165 L 682 161 L 720 159 L 758 161 L 798 164 L 825 240 L 862 390 Z" fill="#7D2E1E" />
              {/* Cap — warm terracotta cap rock */}
              <path d="M 642 165 L 682 161 L 720 159 L 758 161 L 798 164 L 810 198 L 632 200 Z" fill="#A03828" />
              {/* Left face light */}
              <path d="M 578 390 L 615 238 L 632 200 L 638 390 Z" fill="rgba(200,100,70,0.22)" />
              {/* Right face shadow */}
              <path d="M 852 390 L 825 240 L 810 198 L 820 390 Z" fill="rgba(0,0,0,0.26)" />
              {/* Striations */}
              <g stroke="rgba(0,0,0,0.11)" strokeWidth="1" fill="none">
                <line x1="652" y1="200" x2="648" y2="390" />
                <line x1="672" y1="199" x2="669" y2="390" />
                <line x1="695" y1="198" x2="692" y2="390" />
                <line x1="720" y1="197" x2="718" y2="390" />
                <line x1="744" y1="198" x2="742" y2="390" />
                <line x1="768" y1="199" x2="766" y2="390" />
                <line x1="790" y1="200" x2="789" y2="390" />
              </g>
            </g>

            {/* RIGHT-CENTER MESA */}
            <g>
              <path d="M 858 390 L 880 248 L 900 210 L 942 206 L 998 207 L 1038 210 L 1056 246 L 1080 390 Z" fill="#7D2E1E" />
              <path d="M 900 210 L 942 206 L 998 207 L 1038 210 L 1047 242 L 910 244 Z" fill="#9B3824" />
              <path d="M 858 390 L 880 248 L 910 244 L 916 390 Z" fill="rgba(200,100,70,0.20)" />
              <path d="M 1072 390 L 1056 246 L 1047 242 L 1060 390 Z" fill="rgba(0,0,0,0.24)" />
              <g stroke="rgba(0,0,0,0.11)" strokeWidth="0.9" fill="none">
                <line x1="922" y1="244" x2="919" y2="390" />
                <line x1="946" y1="243" x2="944" y2="390" />
                <line x1="972" y1="243" x2="970" y2="390" />
                <line x1="998" y1="243" x2="997" y2="390" />
                <line x1="1024" y1="244" x2="1023" y2="390" />
              </g>
            </g>

            {/* FAR-RIGHT MESA — atmospheric blue-shift */}
            <g>
              <path d="M 1162 390 L 1182 280 L 1200 254 L 1250 250 L 1312 252 L 1358 254 L 1375 278 L 1398 390 Z" fill="#5E2216" />
              <path d="M 1200 254 L 1250 250 L 1312 252 L 1358 254 L 1365 278 L 1208 280 Z" fill="#7A3022" />
              <path d="M 1162 390 L 1182 280 L 1208 280 L 1214 390 Z" fill="rgba(200,100,70,0.18)" />
              <path d="M 1390 390 L 1375 278 L 1365 278 L 1378 390 Z" fill="rgba(0,0,0,0.22)" />
              <g stroke="rgba(0,0,0,0.1)" strokeWidth="0.9" fill="none">
                <line x1="1222" y1="280" x2="1219" y2="390" />
                <line x1="1248" y1="279" x2="1246" y2="390" />
                <line x1="1276" y1="279" x2="1274" y2="390" />
                <line x1="1305" y1="279" x2="1304" y2="390" />
                <line x1="1335" y1="280" x2="1334" y2="390" />
              </g>
            </g>
          </motion.svg>

          {/* ── Flora: sagebrush, saguaro, juniper ──────────────────────
              WA composition: saguaro left-of-center, juniper right-of-center,
              sagebrush clumps scattered across the ground plane.
              One element intentionally slightly off for art-direction intent. */}
          <motion.svg
            className="cin-flora-svg"
            viewBox="0 0 1440 500"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ opacity: floraOp }}
          >
            {/* ── SAGEBRUSH CLUSTERS ──────────────────────────────────────
                Small oval clumps of grey-green — knee-height high desert scrub.
                Shadow layer first, then lighter tops for volume.              */}

            {/* Cluster A — far left */}
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

            {/* Cluster B */}
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

            {/* Cluster C */}
            <g fill="#4A5828">
              <ellipse cx="465" cy="389" rx="10" ry="5" />
              <ellipse cx="477" cy="391" rx="9"  ry="5" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="461" cy="386" rx="8"  ry="5" />
              <ellipse cx="473" cy="385" rx="12" ry="6" />
              <ellipse cx="484" cy="386" rx="8"  ry="4" />
            </g>

            {/* Cluster D — near saguaro base */}
            <g fill="#4A5828">
              <ellipse cx="516" cy="389" rx="8" ry="4" />
              <ellipse cx="526" cy="391" rx="9" ry="5" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="514" cy="386" rx="7"  ry="4" />
              <ellipse cx="524" cy="385" rx="10" ry="5" />
              <ellipse cx="533" cy="386" rx="8"  ry="4" />
            </g>

            {/* Cluster E — center-right, breaks pure symmetry (WA intent) */}
            <g fill="#4A5828">
              <ellipse cx="784" cy="389" rx="10" ry="5" />
              <ellipse cx="796" cy="391" rx="9"  ry="5" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="780" cy="386" rx="9"  ry="5" />
              <ellipse cx="793" cy="385" rx="11" ry="6" />
              <ellipse cx="805" cy="386" rx="8"  ry="4" />
            </g>

            {/* Cluster F */}
            <g fill="#4A5828">
              <ellipse cx="1088" cy="389" rx="9"  ry="5" />
              <ellipse cx="1100" cy="391" rx="10" ry="5" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="1085" cy="386" rx="8"  ry="5" />
              <ellipse cx="1097" cy="385" rx="12" ry="6" />
              <ellipse cx="1109" cy="386" rx="8"  ry="4" />
            </g>

            {/* Cluster G — far right */}
            <g fill="#4A5828">
              <ellipse cx="1248" cy="389" rx="9"  ry="5" />
              <ellipse cx="1260" cy="391" rx="10" ry="5" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="1245" cy="385" rx="8"  ry="5" />
              <ellipse cx="1257" cy="384" rx="11" ry="6" />
              <ellipse cx="1268" cy="385" rx="7"  ry="4" />
            </g>

            {/* Cluster H — small, between saguaro and juniper */}
            <g fill="#4A5828">
              <ellipse cx="692" cy="390" rx="7" ry="4" />
              <ellipse cx="701" cy="392" rx="8" ry="4" />
            </g>
            <g fill="#6B7C3A">
              <ellipse cx="690" cy="387" rx="6"  ry="4" />
              <ellipse cx="699" cy="386" rx="9"  ry="5" />
              <ellipse cx="708" cy="387" rx="6"  ry="3" />
            </g>

            {/* ── SAGUARO — slightly left of center (trunk center x≈630) ── */}
            <g fill="#2D4A1E">
              {/* Trunk */}
              <rect x="622" y="268" width="16" height="122" rx="7" />
              {/* Left arm: horizontal then vertical — arm emerges at y≈316 */}
              <rect x="583" y="308" width="43" height="14" rx="6" />
              <rect x="580" y="273" width="14" height="43" rx="6" />
              {/* Right arm: horizontal then vertical — slightly higher for asymmetry */}
              <rect x="634" y="330" width="44" height="13" rx="6" />
              <rect x="665" y="296" width="13" height="47" rx="6" />
            </g>
            {/* Saguaro left-face highlight (light from left) */}
            <rect x="622" y="268" width="5"  height="122" rx="2" fill="rgba(80,140,60,0.2)" />
            <rect x="580" y="273" width="5"  height="43"  rx="2" fill="rgba(80,140,60,0.2)" />

            {/* ── DEAD JUNIPER — right of center (x≈922) ─────────────────
                Bare gnarled branches, no foliage — classic high-desert form. */}
            <g stroke="#4A3820" strokeLinecap="round" fill="none">
              <line x1="920" y1="390" x2="918" y2="318" strokeWidth="4" />
              {/* Main branches */}
              <line x1="918" y1="335" x2="888" y2="306" strokeWidth="2.8" />
              <line x1="918" y1="328" x2="950" y2="300" strokeWidth="2.8" />
              <line x1="918" y1="320" x2="896" y2="295" strokeWidth="2.2" />
              {/* Sub-branches left */}
              <line x1="888" y1="306" x2="870" y2="290" strokeWidth="1.6" />
              <line x1="888" y1="306" x2="892" y2="286" strokeWidth="1.6" />
              <line x1="896" y1="295" x2="880" y2="280" strokeWidth="1.4" />
              <line x1="896" y1="295" x2="900" y2="277" strokeWidth="1.4" />
              {/* Sub-branches right */}
              <line x1="950" y1="300" x2="935" y2="283" strokeWidth="1.6" />
              <line x1="950" y1="300" x2="966" y2="285" strokeWidth="1.6" />
              <line x1="950" y1="300" x2="958" y2="279" strokeWidth="1.2" />
              {/* Tertiary */}
              <line x1="870" y1="290" x2="863" y2="276" strokeWidth="1" />
              <line x1="892" y1="286" x2="886" y2="272" strokeWidth="1" />
              <line x1="935" y1="283" x2="928" y2="268" strokeWidth="1" />
              <line x1="966" y1="285" x2="974" y2="271" strokeWidth="1" />
            </g>

          </motion.svg>
        </motion.div>

        {/* ── Title card — mobile (CSS time-based stagger) ───────────── */}
        <div className="cinematic-title-card cinematic-title-mobile" aria-hidden="true">
          <p className="cinematic-title-wordmark cin-line-1">SkyPi Studio</p>
          <p className="cinematic-title-sub cin-line-2">Est. 2026</p>
          <p className="cinematic-title-sub cin-line-3">Okanagan Valley, British Columbia</p>
        </div>

        {/* ── Title card — desktop (staggered entrance with y-drift) ────── */}
        <div className="cinematic-title-card cinematic-title-desktop" aria-hidden="true">
          <motion.div style={{ y: titleY }}>
            <motion.p className="cinematic-title-wordmark" style={{ opacity: titleLine1Op }}>SkyPi Studio</motion.p>
            <motion.p className="cinematic-title-sub"      style={{ opacity: titleLine2Op }}>Est. 2026</motion.p>
            <motion.p className="cinematic-title-sub"      style={{ opacity: titleLine3Op }}>Okanagan Valley, British Columbia</motion.p>
          </motion.div>
        </div>

        {/* ── Skip link ───────────────────────────────────────────────── */}
        <motion.button
          className="cinematic-skip-link"
          style={{ opacity: skipOp }}
          onClick={handleSkip}
          tabIndex={-1}
          aria-hidden="true"
        >
          Skip to the work ↓
        </motion.button>

        {/* ── Scroll prompt (desktop only) ────────────────────────────── */}
        <motion.p
          className="cinematic-scroll-prompt"
          style={{ opacity: promptOp }}
          aria-hidden="true"
        >
          Scroll to begin.
        </motion.p>

        {/* ── Mobile scroll cue ───────────────────────────────────────── */}
        <div className="cinematic-mobile-arrow" aria-hidden="true">↓</div>

      </div>
    </div>
  );
}
