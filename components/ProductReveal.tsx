'use client';

import type { CSSProperties, ReactNode } from 'react';

import { DeviceFrame } from '@/components/DeviceFrame';
import { TactileMedia } from '@/components/TactileMedia';
import { cn } from '@/lib/cn';
import { type DeviceFrameKind, frameForSlug, signatureFor } from '@/lib/signature';

/**
 * ProductReveal — ONE cinematic product-media component (Show-the-work
 * 2026-06-04). It renders a product image inside a reserved-aspect well in the
 * golden-hour world, echoing the locked desert intro with the SITE's own
 * (non-GSAP) motion: a parallax-drifting media layer (TactileMedia) over a
 * warm signature-tinted landscape, with a per-medium device frame on the
 * case-study hero.
 *
 * Two states, ONE frame → a one-line swap:
 *   • `media.src` ABSENT  → a genuinely beautiful CSS placeholder (no <img>):
 *     golden-hour world + device frame + product wordmark / UI hint.
 *   • `media.src` PRESENT → the real screenshot drops into the SAME reserved
 *     box (zero CLS), with the future AVIF/WebP `<source>`s if provided.
 *
 * The scroll/mount reveal is owned by the CALL SITE (a `<Reveal>` wrapper for
 * cards/shots, `HeroImageSettle` for the hero), so ProductReveal never nests a
 * second reveal. All decorative layers are aria-hidden; only a real `<img>`
 * (with `alt`) is exposed to the a11y tree — placeholders carry no fake alt
 * (meaning lives in the adjacent title / caption). Reduced-motion + no-JS:
 * TactileMedia's parallax is a no-op and the placeholder is static CSS, so the
 * final image/placeholder shows instantly.
 */

export type ProductRevealContext = 'hero' | 'card' | 'shot';

export type ProductRevealMedia = {
  /** Absence => render the placeholder and emit NO <img>. */
  src?: string;
  /** Required (schema-enforced) — the real image's alt, ready for the swap. */
  alt: string;
  /** Optional responsive siblings (absent until generated). */
  avif?: string;
  webp?: string;
  caption?: string;
};

export type ProductRevealProps = {
  slug: string;
  title: string;
  /** Small role/category eyebrow shown in the hero placeholder. */
  eyebrow?: string;
  media: ProductRevealMedia;
  context?: ProductRevealContext;
  /** Override the per-slug frame. Defaults to a frame only on the hero. */
  frame?: DeviceFrameKind;
  /** Inner parallax depth. Defaults per context (hero .06 / card .04 / shot .08). */
  depth?: number;
  className?: string;
  /** Render only the inner plane (no aspect well). The parent owns the well —
   *  used by the case-study hero, where HeroImageSettle provides aspect +
   *  group + overflow + the mount settle. */
  bare?: boolean;
};

const ASPECT: Record<ProductRevealContext, string> = {
  hero: '', // parent (HeroImageSettle) owns aspect-[4/5]
  card: 'aspect-[16/10]',
  shot: 'aspect-[16/10]',
};

const DEPTH: Record<ProductRevealContext, number> = { hero: 0.06, card: 0.04, shot: 0.08 };

const FRAME_PLACEMENT: Record<Exclude<DeviceFrameKind, 'none'>, string> = {
  phone: 'absolute left-1/2 top-1/2 h-[90%] aspect-[9/19] -translate-x-1/2 -translate-y-1/2',
  window: 'absolute left-1/2 top-1/2 w-[86%] aspect-[16/11] -translate-x-1/2 -translate-y-1/2',
  plate: 'absolute left-1/2 top-1/2 w-[86%] aspect-[16/10] -translate-x-1/2 -translate-y-1/2',
};

/** Nominal <img> dimensions (CLS hint only; CSS drives the real size). */
const NOMINAL: Record<ProductRevealContext, { w: number; h: number }> = {
  hero: { w: 1200, h: 1500 },
  card: { w: 1280, h: 800 },
  shot: { w: 1280, h: 800 },
};

/** A faint UI bar — a decorative hint of an interface (no text). */
function Bar({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={cn('block rounded-full', className)} style={style} />;
}

/** Hero device-screen placeholder: signature wash + product wordmark + eyebrow. */
function HeroScreenFill({ sig, title, eyebrow }: { sig: string; title: string; eyebrow?: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(165deg, rgb(${sig} / 0.18), rgb(${sig} / 0.05) 55%, rgb(var(--rgb-earth) / 0.10))`,
        }}
      />
      <Bar className="absolute left-1/2 top-4 h-1 w-10 -translate-x-1/2 bg-[rgb(var(--rgb-ink)/0.10)]" />
      <div className="relative z-10 flex flex-col items-center gap-3">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 font-mono text-meta tracking-label uppercase text-umber/70">
            <span className="inline-block h-1 w-1 rounded-full bg-terracotta" />
            {eyebrow}
          </span>
        )}
        <span className="font-serif font-light text-step-3 text-umber leading-tight">{title}</span>
      </div>
    </div>
  );
}

/** Card / in-body placeholder: a soft "screen" silhouette resting in the world. */
function BandHint({ sig }: { sig: string }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
      <div
        className="panel-lit relative h-[64%] w-[66%] overflow-hidden rounded-xl border border-[rgb(var(--rgb-ink)/0.08)]"
        style={{
          background: `linear-gradient(160deg, rgb(${sig} / 0.16), rgb(var(--rgb-canvas) / 0.10) 60%, transparent)`,
        }}
      >
        <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 px-3 py-2">
          <Bar className="h-1.5 w-1.5 bg-[rgb(var(--rgb-ink)/0.14)]" />
          <Bar className="h-1.5 w-1.5 bg-[rgb(var(--rgb-ink)/0.10)]" />
          <Bar className="h-1.5 w-1.5 bg-[rgb(var(--rgb-ink)/0.08)]" />
        </div>
        <div className="absolute inset-x-5 top-9 flex flex-col gap-2">
          <Bar className="h-2 w-3/5 bg-[rgb(var(--rgb-ink)/0.08)]" />
          <Bar className="h-2 w-2/5" style={{ background: `rgb(${sig} / 0.40)` }} />
          <Bar className="h-2 w-4/5 bg-[rgb(var(--rgb-ink)/0.06)]" />
        </div>
      </div>
    </div>
  );
}

export function ProductReveal({
  slug,
  title,
  eyebrow,
  media,
  context = 'shot',
  frame,
  depth,
  className,
  bare = false,
}: ProductRevealProps) {
  const sig = signatureFor(slug);
  const kind: DeviceFrameKind = frame ?? (context === 'hero' ? frameForSlug(slug) : 'none');
  const d = depth ?? DEPTH[context];
  const nominal = NOMINAL[context];
  const hasReal = Boolean(media.src);
  const sources = media.avif || media.webp ? { avif: media.avif, webp: media.webp } : undefined;

  // The "screen" content: a real screenshot (carries alt) OR a decorative fill.
  const screen: ReactNode = hasReal ? (
    <TactileMedia
      src={media.src as string}
      alt={media.alt}
      width={nominal.w}
      height={nominal.h}
      depth={d}
      sources={sources}
    />
  ) : kind === 'none' ? (
    <BandHint sig={sig} />
  ) : (
    <HeroScreenFill sig={sig} title={title} eyebrow={eyebrow} />
  );

  const layers = (
    <>
      <div aria-hidden="true" className="pr-world absolute inset-0" />
      <div aria-hidden="true" className="pr-horizon absolute inset-x-0" />
      {kind === 'none' ? (
        <div className="absolute inset-0 overflow-hidden">{screen}</div>
      ) : (
        <DeviceFrame kind={kind} className={FRAME_PLACEMENT[kind]}>
          {screen}
        </DeviceFrame>
      )}
    </>
  );

  const style = { '--pr-sig': sig } as CSSProperties;

  // Hero: the parent HeroImageSettle well already owns aspect + group + overflow.
  if (bare) {
    return (
      <div className="absolute inset-0" style={style}>
        {layers}
      </div>
    );
  }

  return (
    <div
      className={cn('group relative isolate overflow-hidden', ASPECT[context], className)}
      style={style}
    >
      {layers}
    </div>
  );
}

/** Case-study hero — device-in-landscape. Render inside HeroImageSettle. */
export function HeroProductReveal(props: Omit<ProductRevealProps, 'context' | 'bare'>) {
  return <ProductReveal context="hero" bare {...props} />;
}

/** Work card — full-bleed filmic band atop the glass inscription. */
export function CardProductReveal(props: Omit<ProductRevealProps, 'context'>) {
  return <ProductReveal context="card" {...props} />;
}

/** In-body case-study shot — full-bleed filmic plane. */
export function ShotProductReveal(props: Omit<ProductRevealProps, 'context'>) {
  return <ProductReveal context="shot" {...props} />;
}
