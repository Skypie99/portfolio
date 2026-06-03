'use client';

import type { ReactNode } from 'react';

import { useParallax } from '@/lib/motion';
import { cn } from '@/lib/cn';

/**
 * Golden-hour palette sampled from the locked cinematic intro (cdesert grade +
 * exposure): a luminous gold-cream sky → gold-peach → terracotta-amber → deep
 * terracotta over a deep warm base. The field reads like the intro's sky-to-cliff,
 * with the title carved into the deep pool at the base — echoing the intro's
 * wordmark resolving on the lit cliff. Fixed RGB (a warm "photograph": same in
 * light + dark).
 */
const SKY = '255 226 184'; // luminous gold-cream (intro exposure top)
const SUN = '255 240 214'; // sun glow
const PEACH = '245 196 138'; // gold-peach
const CLIFF = '176 104 58'; // deep terracotta (intro grade bottom)
const DEEP = '28 12 4'; // deep warm base / title pool (intro title scrim)

/** Per-project MID hue — a SUBTLE shift, all inside the golden-hour family. */
const FIELD_MID: Record<string, string> = {
  'accessmap': '224 150 90', // terracotta-amber (classic)
  'claude-corp': '206 134 78', // deeper amber
  'prompt-library': '236 186 118', // gold-forward
  'pacman-code-trainer': '200 108 60', // rust
  'pacman': '200 108 60',
  'mutual-mesh': '202 142 114', // clay-rose
  'mutual': '202 142 114',
};

/** Site film-grain (matches body::after) — crafted, photographic texture. */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23g)'/%3E%3C/svg%3E\")";

type CardFieldProps = {
  slug: string;
  /** Sizing/shape classes — the PARENT owns aspect/height. */
  className?: string;
  /** Parallax depth for the drifting sun glow (small; far tier). 0 disables. */
  depth?: number;
  /** Overlaid editorial content (numeral, title, meta). */
  children?: ReactNode;
};

/**
 * CardField — golden-hour "material" matched to the cinematic intro. A luminous
 * vertical sky→cliff gradient, a drifting sun glow (useParallax, RM-safe), a soft
 * vignette + film grain for photographic depth, and a deep base pool that keeps an
 * overlaid cream title at WCAG AA.
 */
export function CardField({ slug, className, depth = 0.04, children }: CardFieldProps) {
  const ref = useParallax<HTMLDivElement>(depth);
  const mid = FIELD_MID[slug] ?? FIELD_MID['accessmap'];

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ backgroundColor: `rgb(${DEEP})` }}
    >
      {/* Luminous golden-hour field: sky → gold → project-hue → cliff → deep pool. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(176deg, rgb(${SKY}) 0%, rgb(${PEACH}) 17%, rgb(${mid}) 43%, rgb(${CLIFF}) 71%, rgb(70 33 16) 88%, rgb(${DEEP}) 100%)`,
        }}
      />
      {/* Drifting sun glow (parallax) — the moving golden light. Oversized. */}
      <div
        ref={ref}
        aria-hidden="true"
        className="absolute -inset-[14%] will-change-transform"
        style={{
          backgroundImage: `radial-gradient(105% 60% at 50% -2%, rgb(${SUN} / 0.8), transparent 52%)`,
        }}
      />
      {/* Soft vignette — photographic edge fall-off, like the intro. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(125% 115% at 50% 38%, transparent 56%, rgb(${DEEP} / 0.5) 100%)`,
        }}
      />
      {/* Film grain. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13] mix-blend-soft-light"
        style={{ backgroundImage: NOISE, backgroundSize: '160px 160px' }}
      />
      {/* Cursor-follow golden light — blooms where you point (--mx/--my set by
          useTilt on the card). Screen-blended so it reads as real light. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
        style={{
          background: `radial-gradient(26% 34% at var(--mx, 50%) var(--my, 28%), rgb(${SUN} / 0.5), transparent 72%)`,
          mixBlendMode: 'screen',
        }}
      />
      {/* Specular gleam — one slow diagonal sweep across on hover-enter. */}
      <div
        aria-hidden="true"
        className="card-gleam pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(100deg, transparent 42%, rgb(255 248 232 / 0.5) 50%, transparent 58%)',
          mixBlendMode: 'screen',
        }}
      />
      {/* Fine keyline — frames the field like a mounted print (a hairline of warm
          light inside the top edge, deepening at the base). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 1px 0 0 rgb(255 244 224 / 0.22), inset 0 0 0 1px rgb(255 244 224 / 0.10)' }}
      />
      {children && <div className="relative z-10 flex h-full flex-col">{children}</div>}
    </div>
  );
}
