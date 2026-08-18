import type { CSSProperties } from 'react';

import Link from 'next/link';

import type { Deliverable } from '@/lib/schema';
import { signatureFor } from '@/lib/signature';

/**
 * The lit windows (R4/BP6 · P01) — at full night above the footer, the works
 * appear as lit windows on the horizon; the one whose room isn't on the open
 * web stays dark. WM-3's seat completed: dusk at the door, and what the dusk
 * reveals.
 *
 * The lit map is BOUND to the hero sentence's own claim: the page passes the
 * showcase strip's hrefs as `litHrefs` (the "all five live on the open web"
 * rendered as data), so the sentence, the strip, and the windows can never
 * disagree — one source, edited together (DECISIONS §S delegation record).
 *
 * Five real links, five honest tab stops (the pitch's named price), 44px hit
 * areas, plain-fact accessible names. Visibility is CSS-owned: dark register
 * only, opacity riding the shipped --day-night writer (RM/no-JS rest at the
 * theme's static state — present in dark, absent in light).
 */

/** SKY-EDIT: the state words + the group label live here, one place. */
const STATE_WORD = { lit: 'lit', dark: 'dark' } as const;
const GROUP_LABEL = 'The five works, on the horizon';

/** Hand-set seats along the horizon — uneven on purpose (a valley, not a chart). */
const SEATS = ['9%', '24%', '38.5%', '70.5%', '86%'];

type LitWindowsProps = {
  deliverables: Deliverable[];
  /** The hrefs the page's own live-claim surfaces (the showcase strip). */
  litHrefs: string[];
};

export function LitWindows({ deliverables, litHrefs }: LitWindowsProps) {
  return (
    <nav aria-label={GROUP_LABEL} className="lit-windows">
      {deliverables.map((d, i) => {
        const href = `/work/${d.id}/`;
        const lit = litHrefs.includes(href);
        return (
          <Link
            key={d.id}
            href={href}
            aria-label={`${d.title} — ${lit ? STATE_WORD.lit : STATE_WORD.dark}`}
            data-lit={lit ? '' : undefined}
            className="lit-window"
            style={{ '--lw-sig': signatureFor(d.id), '--lw-x': SEATS[i] ?? `${10 + i * 15}%` } as CSSProperties}
          />
        );
      })}
    </nav>
  );
}
