import type { CSSProperties } from 'react';

import { cn } from '@/lib/cn';
import { type CaptureDetail, cropGeometry } from '@/lib/captureDetail';

import styles from './exhibitDetail.module.css';

type ExhibitDetailProps = {
  detail: CaptureDetail;
  /** The capture's own sources (heroMedia), so the plate requests exactly the
   *  URLs the device frame beside it already requested: one download, two
   *  views of it. */
  sources: { src: string; avif?: string; webp?: string };
  className?: string;
};

/**
 * ExhibitDetail — the flagship room's detail plate (Creative Release 7
 * candidate, 2026-10-22). One region of the hero capture, shown at a size
 * where the product's own text can be read, beside the whole screen; a 1px
 * leader runs from the plate to the device frame, and a mono line names it
 * for what it is.
 *
 * Decorative by construction: the whole plate is aria-hidden. It magnifies
 * pixels that the capture's alt text and the museum plate's words already
 * carry, so assistive technology meets the information once, not twice. The
 * crop is the shipped file itself (lib/captureDetail.ts states the truth
 * rules); nothing is retouched or re-rendered.
 *
 * Server Component. The plate rides its stage's Reveal like the screen does;
 * the leader's one draw lives in exhibitDetail.module.css with its reduced-
 * motion, no-JS, failsafe and print floors. The leader and its pin exist only
 * in the side-by-side composition (the module's `.stage` container rule),
 * where the screen sits beside the plate; stacked, on a phone or under
 * enlarged text, the plate stands above the screen and its line alone does
 * the naming.
 */
export function ExhibitDetail({ detail, sources, className }: ExhibitDetailProps) {
  const g = cropGeometry(detail);
  return (
    <div aria-hidden="true" data-exhibit-detail="" className={cn('relative', className)}>
      <div className="relative">
        <div
          className={cn(styles.plate, 'relative overflow-hidden rounded-lg')}
          style={
            {
              aspectRatio: g.aspect,
              '--crop-scale': g.scale,
              '--crop-x': g.x,
              '--crop-y': g.y,
            } as CSSProperties
          }
        >
          <picture>
            {sources.avif && <source type="image/avif" srcSet={sources.avif} />}
            {sources.webp && <source type="image/webp" srcSet={sources.webp} />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sources.src}
              alt=""
              width={detail.width}
              height={detail.height}
              loading="lazy"
              decoding="async"
              className={styles.crop}
            />
          </picture>
        </div>
        <span className={cn(styles.leader, 'absolute left-full top-1/2 h-px bg-terracotta')} />
        <span
          className={cn(styles.pin, 'absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta')}
          style={{ left: 'calc(100% + var(--leader-span, 12%))' }}
        />
      </div>
      {/* ink-muted / ink, the Release 5 caption pair (CaseShowcase.tsx), not
          text-meta: in dark the stage light sits under this line, and text-meta
          measured 3.56:1 at its worst pixel there (393); ink reads well clear. */}
      <p className="mt-3 font-mono text-meta tracking-label uppercase text-ink-muted dark:text-ink">Detail of the same capture</p>
    </div>
  );
}
