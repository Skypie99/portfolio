'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export function CinematicIntro() {
  const { scrollY } = useScroll();

  // Title card: invisible → visible at 260–295px → hold → gone at 340–370px
  const titleOpacity = useTransform(scrollY, [250, 290, 325, 365], [0, 1, 1, 0]);

  // Skip link: invisible → visible at 120–160px → gone at 330–370px
  const skipOpacity = useTransform(scrollY, [120, 160, 330, 370], [0, 1, 1, 0]);

  // Scroll prompt: fully visible → gone by 80px
  const promptOpacity = useTransform(scrollY, [0, 80], [1, 0]);

  function handleSkip() {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  }

  const titleContent = (
    <>
      <p className="cinematic-title-wordmark">SkyPi Studio</p>
      <p className="cinematic-title-sub">Est. 2026</p>
      <p className="cinematic-title-sub">Okanagan Valley, British Columbia</p>
    </>
  );

  return (
    /* Scroll-space wrapper: desktop = 100vh + 400px budget; mobile = 100vh only (CSS) */
    <div className="cinematic-wrapper" aria-hidden="true">
      <div className="cinematic-scene">

        {/* ── Sky layers ──────────────────────────────────────────────── */}
        <div className="cinematic-sky-night" />
        <div className="cinematic-sky-dawn" />
        <div className="cinematic-sky-golden" />

        {/* ── Stars ───────────────────────────────────────────────────── */}
        <div className="cinematic-stars" />

        {/* ── Constellations ──────────────────────────────────────────── */}
        <svg
          className="cinematic-constellation"
          viewBox="0 0 1440 600"
          preserveAspectRatio="xMidYMid slice"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          {/* Constellation 1 — upper left */}
          <g stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" fill="none">
            <line x1="130" y1="95"  x2="175" y2="65"  />
            <line x1="175" y1="65"  x2="215" y2="88"  />
            <line x1="215" y1="88"  x2="248" y2="60"  />
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
          {/* Constellation 2 — upper right */}
          <g stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" fill="none">
            <line x1="1052" y1="72"  x2="1097" y2="50"  />
            <line x1="1097" y1="50"  x2="1142" y2="75"  />
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
        </svg>

        {/* ── Moon ────────────────────────────────────────────────────── */}
        <svg
          className="cinematic-moon"
          viewBox="0 0 120 120"
          style={{
            position: 'absolute',
            top: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(56px, 7vw, 84px)',
            height: 'clamp(56px, 7vw, 84px)',
            zIndex: 3,
            overflow: 'visible',
          }}
        >
          <defs>
            <mask id="cinematic-crescent-mask">
              <rect width="120" height="120" fill="white" />
              {/* Offset circle creates the crescent bite */}
              <circle cx="72" cy="50" r="40" fill="black" />
            </mask>
          </defs>
          {/* Soft glow ring */}
          <circle cx="58" cy="50" r="40" fill="rgba(253,246,227,0.06)" />
          {/* Moon body */}
          <circle cx="58" cy="50" r="36" fill="#FDF6E3" mask="url(#cinematic-crescent-mask)" />
        </svg>

        {/* ── Landscape: background ridge ─────────────────────────────── */}
        <svg
          className="cinematic-landscape-bg"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '44%',
            zIndex: 4,
          }}
        >
          <path
            d="M 0 400 L 0 288
               C 120 274 250 258 390 265
               C 530 272 630 248 768 242
               C 906 236 1028 254 1168 262
               C 1308 270 1390 275 1440 272
               L 1440 400 Z"
            fill="#0D0D14"
          />
        </svg>

        {/* ── Landscape: midground mesas ──────────────────────────────── */}
        <svg
          className="cinematic-landscape-mid"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '40%',
            zIndex: 5,
          }}
        >
          <path
            d="M 0 400 L 0 368
               L 55 368 L 60 322 L 172 312 L 212 322 L 252 368
               L 342 368 L 372 340 L 472 320 L 558 320 L 582 340 L 622 368
               L 712 368 L 748 342 L 858 316 L 978 316 L 1008 342 L 1058 368
               L 1118 368 L 1150 332 L 1232 310 L 1338 310 L 1368 332 L 1440 368
               L 1440 400 Z"
            fill="#8B3A2A"
          />
        </svg>

        {/* ── Landscape: foreground rocks + cacti + juniper ───────────── */}
        <svg
          className="cinematic-landscape-fg"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '38%',
            zIndex: 6,
          }}
        >
          {/* Rock formations */}
          <path
            d="M 0 400 L 0 382 L 68 382 L 112 357 L 188 344 L 248 357 L 292 382
               L 362 382 L 406 364 L 456 350 L 506 350 L 542 364 L 578 382
               L 652 382 L 692 362 L 742 350 L 812 350 L 857 362 L 908 382
               L 978 382 L 1012 360 L 1062 347 L 1122 347 L 1162 360 L 1208 382
               L 1272 382 L 1312 364 L 1362 352 L 1402 352 L 1440 377
               L 1440 400 Z"
            fill="#C84B31"
          />

          {/* Saguaro 1 — slightly left of centre */}
          <g fill="#1C3D2A">
            {/* Trunk */}
            <rect x="330" y="248" width="18" height="104" rx="7" />
            {/* Left arm: horizontal segment then vertical */}
            <rect x="290" y="278" width="44" height="13" rx="5" />
            <rect x="286" y="245" width="13" height="47" rx="5" />
            {/* Right arm */}
            <rect x="344" y="296" width="42" height="13" rx="5" />
            <rect x="374" y="260" width="13" height="51" rx="5" />
          </g>

          {/* Saguaro 2 — right of centre, slightly off-axis */}
          <g fill="#1C3D2A">
            {/* Trunk */}
            <rect x="1043" y="253" width="16" height="99" rx="6" />
            {/* Left arm */}
            <rect x="1004" y="285" width="43" height="12" rx="5" />
            <rect x="1000" y="251" width="12" height="46" rx="5" />
            {/* Right arm — slightly higher for asymmetry */}
            <rect x="1055" y="272" width="38" height="12" rx="5" />
            <rect x="1083" y="240" width="12" height="46" rx="5" />
          </g>

          {/* Gnarled juniper — between the two cacti */}
          <g stroke="#1C3D2A" strokeWidth="3.5" strokeLinecap="round" fill="none">
            {/* Trunk */}
            <line x1="822" y1="350" x2="820" y2="286" />
            {/* Main branches */}
            <line x1="820" y1="302" x2="787" y2="270" />
            <line x1="820" y1="302" x2="852" y2="272" />
            <line x1="820" y1="291" x2="796" y2="261" />
            {/* Sub-branches */}
            <line x1="787" y1="270" x2="768" y2="253" />
            <line x1="787" y1="270" x2="792" y2="251" />
            <line x1="852" y1="272" x2="836" y2="254" />
            <line x1="852" y1="272" x2="866" y2="256" />
            <line x1="796" y1="261" x2="778" y2="245" />
            <line x1="796" y1="261" x2="801" y2="244" />
          </g>
        </svg>

        {/* ── Title card — mobile (CSS, always visible on small screens) ── */}
        <div className="cinematic-title-card cinematic-title-mobile" aria-hidden="true">
          {titleContent}
        </div>

        {/* ── Title card — desktop (Framer Motion, scroll-driven opacity) ── */}
        <motion.div
          className="cinematic-title-card cinematic-title-desktop"
          style={{ opacity: titleOpacity }}
          aria-hidden="true"
        >
          {titleContent}
        </motion.div>

        {/* ── Skip link ───────────────────────────────────────────────── */}
        <motion.button
          className="cinematic-skip-link"
          style={{ opacity: skipOpacity }}
          onClick={handleSkip}
          tabIndex={-1}
          aria-hidden="true"
        >
          Skip to the work ↓
        </motion.button>

        {/* ── Scroll prompt (desktop only — hidden on mobile via CSS) ────── */}
        <motion.p
          className="cinematic-scroll-prompt"
          style={{ opacity: promptOpacity }}
          aria-hidden="true"
        >
          Scroll to begin.
        </motion.p>

        {/* ── Mobile scroll cue arrow (hidden on desktop via CSS) ─────────── */}
        <div className="cinematic-mobile-arrow" aria-hidden="true">↓</div>

      </div>
    </div>
  );
}
