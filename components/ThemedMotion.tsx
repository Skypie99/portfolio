'use client';

import { useEffect, useRef, useState } from 'react';

import type { ShowcaseMatte } from '@/components/ProductReveal';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/motion';

/**
 * ThemedMotion — a short, silent product clip that matches the active theme
 * (showcase/theme-sync). One motion grammar for every showcase clip:
 *
 *  - POSTER-FIRST, `preload="none"` (→ `metadata` after first intersection):
 *    below the fold a clip costs its poster, nothing more.
 *  - AUTOPLAYS muted/looping/inline ONLY while intersecting — leaving the
 *    viewport pauses it (IntersectionObserver), returning resumes it.
 *  - REDUCED MOTION: never autoplays; the poster stands and the affordance
 *    remains — WCAG bans auto-motion, not user-initiated motion.
 *  - PAUSE AFFORDANCE (WCAG 2.2.2): SSR renders native `controls` so no-JS
 *    always has a play path; hydration swaps them for a visible 44px overlay
 *    button in the site's chrome. A user pause is STICKY against viewport
 *    re-entry.
 *  - THEME SYNC: two <video>s in the same `.ts-layer` display-gated stack the
 *    stills use, so the flip rides the site's view-transition dissolve.
 *    `display:none` does not pause media, so one MutationObserver on
 *    `html.class` (the flip happens inside the VT callback and fires no React
 *    event) pauses the hidden twin and hands its `currentTime` to the visible
 *    one — the loop continues across the dissolve instead of restarting.
 *  - MONO projects (`matte`) render one <video> on the `.ts-matte` exhibit
 *    mat, same behavior.
 *
 * The clip's meaning never depends on motion: `alt` (aria-label) + the poster
 * carry it, and the caption renders at the call site's figcaption slot.
 */

export type MotionVariant = {
  mp4?: string;
  webm?: string;
  poster: string;
  lqip?: string;
};

export type ThemedMotionProps = {
  light: MotionVariant;
  dark?: MotionVariant;
  matte?: ShowcaseMatte;
  /** Accessible description of the flow the clip shows (from the manifest). */
  alt: string;
  captions?: string;
  fit: 'cover' | 'contain';
  position?: string;
  className?: string;
};

function VariantVideo({
  variant,
  theme,
  alt,
  captions,
  fit,
  position,
  controls,
  videoRef,
}: {
  variant: MotionVariant;
  theme: 'light' | 'dark';
  alt: string;
  captions?: string;
  fit: 'cover' | 'contain';
  position?: string;
  controls: boolean;
  videoRef: React.Ref<HTMLVideoElement>;
}) {
  return (
    <div className={cn('ts-layer', theme === 'dark' ? 'ts-layer--dark' : 'ts-layer--light')}>
      <video
        ref={videoRef}
        poster={variant.poster}
        preload="none"
        muted
        loop
        playsInline
        controls={controls}
        aria-label={alt}
        className={cn('absolute inset-0 h-full w-full', fit === 'cover' ? 'object-cover' : 'object-contain')}
        style={{
          ...(position ? { objectPosition: position } : {}),
          ...(variant.lqip
            ? {
                backgroundImage: `url("${variant.lqip}")`,
                backgroundSize: fit === 'cover' ? 'cover' : 'contain',
                backgroundPosition: position ?? 'center',
                backgroundRepeat: 'no-repeat',
              }
            : {}),
        }}
      >
        {variant.mp4 && <source src={variant.mp4} type="video/mp4" />}
        {variant.webm && <source src={variant.webm} type="video/webm" />}
        {captions && <track kind="captions" src={captions} srcLang="en" label="Captions" default />}
      </video>
    </div>
  );
}

function PlayPauseIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[16px] w-[16px]" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[16px] w-[16px]" aria-hidden="true">
      <path d="M8 5.5a1 1 0 0 1 1.52-.86l10 6.5a1 1 0 0 1 0 1.72l-10 6.5A1 1 0 0 1 8 18.5v-13z" />
    </svg>
  );
}

export function ThemedMotion({
  light,
  dark,
  matte,
  alt,
  captions,
  fit,
  position,
  className,
}: ThemedMotionProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLVideoElement>(null);
  const darkRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const userPausedRef = useRef(false);
  const intersectingRef = useRef(false);

  useEffect(() => setMounted(true), []);

  const activeVideo = () =>
    document.documentElement.classList.contains('dark') && darkRef.current ? darkRef.current : lightRef.current;
  const hiddenVideo = () =>
    document.documentElement.classList.contains('dark') && darkRef.current ? lightRef.current : darkRef.current;

  const play = (deliberate = false) => {
    // Belt over the hook: usePrefersReducedMotion syncs one frame after mount,
    // so an IO entry in that gap could slip an autoplay past an RM user. Read
    // the media query directly at play time — a DELIBERATE play (the
    // affordance) is always allowed; WCAG bans auto-motion, not chosen motion.
    if (!deliberate && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    }
    const el = activeVideo();
    if (!el) return;
    el.preload = 'metadata';
    const p = el.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
    setPlaying(true);
  };
  const pause = () => {
    activeVideo()?.pause();
    hiddenVideo()?.pause();
    setPlaying(false);
  };

  // IO: autoplay only while in viewport, never under RM, never over a user pause.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver !== 'function') return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        intersectingRef.current = entries.some((e) => e.isIntersecting);
        if (intersectingRef.current) {
          const el = activeVideo();
          if (el) el.preload = 'metadata';
          if (!reduced && !userPausedRef.current) play();
        } else {
          pause();
        }
      },
      { rootMargin: '64px 0px' },
    );
    io.observe(host);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // Theme continuity: the class flips inside the VT callback (no React event) —
  // observe it, pause the hidden twin, hand the clock to the visible one.
  useEffect(() => {
    if (!dark) return undefined;
    const mo = new MutationObserver(() => {
      const from = hiddenVideo();
      const to = activeVideo();
      if (!from || !to) return;
      const wasPlaying = !from.paused || playing;
      from.pause();
      if (Number.isFinite(from.currentTime) && from.currentTime > 0) {
        try {
          to.currentTime = from.currentTime;
        } catch {
          /* not yet seekable — the loop restarts, acceptably */
        }
      }
      if (wasPlaying && intersectingRef.current && !reduced && !userPausedRef.current) {
        to.preload = 'metadata';
        const p = to.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark, reduced, playing]);

  const toggle = () => {
    if (playing) {
      userPausedRef.current = true; // sticky against IO re-entry
      pause();
    } else {
      userPausedRef.current = false;
      play(true);
    }
  };

  const videos = matte ? (
    <div className="ts-matte absolute inset-0">
      <div className="ts-matte-well">
        <VariantVideo
          variant={light}
          theme="light"
          alt={alt}
          captions={captions}
          fit={fit}
          position={position}
          controls={!mounted}
          videoRef={lightRef}
        />
      </div>
    </div>
  ) : (
    <>
      <VariantVideo
        variant={light}
        theme="light"
        alt={alt}
        captions={captions}
        fit={fit}
        position={position}
        controls={!mounted}
        videoRef={lightRef}
      />
      {dark && (
        <VariantVideo
          variant={dark}
          theme="dark"
          alt={alt}
          captions={captions}
          fit={fit}
          position={position}
          controls={!mounted}
          videoRef={darkRef}
        />
      )}
    </>
  );

  return (
    <div
      ref={hostRef}
      data-themed-motion={matte ? 'matte' : dark ? 'themed' : 'single'}
      data-motion={playing ? 'playing' : 'paused'}
      className={cn('absolute inset-0', className)}
    >
      {videos}
      {mounted && (
        <button
          type="button"
          onClick={toggle}
          aria-label={`${playing ? 'Pause' : 'Play'} animation — ${alt}`}
          className={cn(
            'absolute bottom-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-pill',
            'border border-line bg-[rgb(var(--rgb-surface)/0.72)] text-ink-meta backdrop-blur-md',
            'transition-colors duration-base ease-out hover:text-accent hover:border-line-strong',
          )}
        >
          <PlayPauseIcon playing={playing} />
        </button>
      )}
    </div>
  );
}
