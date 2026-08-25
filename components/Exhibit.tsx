import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type LeaderLine = {
  /** Absolute position of this 1px leader line within the capture, e.g.
   *  `{ top: '20%', left: '10%', width: '3rem' }`. Decorative only — the
   *  claim it points at is restated in the caption text below, per
   *  10_OCD_CHECKLIST's rule (leader lines never carry meaning alone). */
  style: CSSProperties;
};

type ExhibitProps = {
  /** The capture itself — an <img>/<picture>/TactileMedia the caller renders. */
  children: ReactNode;
  scene: string;
  theme: string;
  /** ISO date (YYYY-MM-DD) the capture was taken. */
  capturedDate: string;
  /** The one claim this exhibit proves — plain text. Always rendered as real
   *  text (never leader-line-only), so it reaches AT regardless of the
   *  decorative lines below. */
  claim: string;
  /** At most 2 decorative leader lines (10_OCD_CHECKLIST: "≤2 per exhibit,
   *  never crossing text"). Exactly 1px, terracotta, aria-hidden. */
  leaderLines?: [LeaderLine] | [LeaderLine, LeaderLine];
  className?: string;
};

/**
 * Exhibit — THE ROOM instrument furniture (A15). A capture + mono FIG tag
 * (`FIG · scene · theme · captured date`) + one-claim caption + up to 2
 * aria-hidden leader lines. Case studies only. Not yet wired into any page
 * (Phase A) — that's Phase C+, where a real capture supplies real leader-line
 * geometry.
 */
export function Exhibit({ children, scene, theme, capturedDate, claim, leaderLines, className }: ExhibitProps) {
  return (
    <figure className={cn('relative m-0 flex flex-col gap-3', className)}>
      <div className="relative">
        {children}
        {leaderLines?.map((line, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute h-px w-12 bg-terracotta"
            style={line.style}
          />
        ))}
      </div>
      <figcaption className="flex flex-col gap-1">
        <p className="font-mono text-meta tracking-label uppercase text-text-meta">
          {`FIG · ${scene} · ${theme} · captured ${capturedDate}`}
        </p>
        <p className="font-sans text-body-sm text-charcoal">{claim}</p>
      </figcaption>
    </figure>
  );
}
