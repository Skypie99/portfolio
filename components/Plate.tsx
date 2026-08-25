import type { CSSProperties } from 'react';

import { cn } from '@/lib/cn';
import { smartPunctuation } from '@/lib/markdown';

type PlateProps = {
  /** The measured claim / severity line — mono, uppercase, accent-text. */
  claim: string;
  /** The artifact caption. Smart-punctuated (the estate's one prose transform). */
  caption: string;
  /** Place/date provenance line — mono, uppercase, meta. */
  placeDate: string;
  /** Per-project signature hue (lib/signature.ts signatureFor), scopes the
   *  dark-only hairline warmth via .pr-plate-lit. Omit for no signature glow. */
  sig?: string;
  className?: string;
};

/**
 * Plate — THE ROOM instrument furniture (A15). Three mono lines: claim ·
 * artifact caption · place/date. Project heroes ONLY, never cards — see
 * CaseStudyCard/ProjectCard for the card register instead.
 *
 * Generalizes the inline plate markup in app/work/[slug]/page.tsx
 * (Flagstone's d.heroPlate block) byte-for-byte: same classes, same
 * structure, same .pr-plate-lit hairline mechanism. Not yet wired into any
 * page (Phase A) — the inline version stays exactly as-is until a later
 * phase swaps it for this component, and the two must render
 * word-identically when that happens.
 */
export function Plate({ claim, caption, placeDate, sig, className }: PlateProps) {
  return (
    <div
      className={cn('flex flex-col gap-3 max-w-measure-wide', className)}
      style={sig ? ({ '--pr-sig': sig } as CSSProperties) : undefined}
    >
      <div className="flex flex-col gap-1.5">
        <p className="pr-plate-lit font-mono text-meta tracking-label uppercase text-accent-text">
          {claim}
        </p>
        <p className="font-mono text-body-sm text-near-black leading-snug">
          {smartPunctuation(caption)}
        </p>
      </div>
      <p className="font-mono text-meta tracking-label uppercase text-text-meta">
        {placeDate}
      </p>
    </div>
  );
}
