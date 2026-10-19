import { Fragment } from 'react';

import { cn } from '@/lib/cn';

import styles from './editorial.module.css';

/**
 * The two role lines are the SAME strings the mobile runway chip
 * (components/RunwayIdentity.tsx) and the homepage nameplate already publish:
 * Technical Support stays the primary professional identity, and the builder
 * side is described without presenting it as a conventional engineering
 * title. Nothing new is claimed here; keep these byte-identical to the chip.
 */
export const IDENTITY_ROLES = ['Technical Support', 'AI-assisted Builder'] as const;

type IdentityLinesProps = {
  /** profile.name (content/profile.json) */
  name: string;
  /** profile.location (content/profile.json) */
  location: string;
  className?: string;
  /** 'mount' rises the two lines in reading order once the plate lands. */
  arrival?: 'mount' | 'none';
};

/**
 * IdentityLines — the name, roles and location a plate carries. The mono
 * line follows the estate's interpunct wrap discipline (UI_SYSTEM.md
 * "Wrap discipline" #4): break between words only, and each `·` bonds into
 * the word after it so a separator always LEADS its clause.
 */
export function IdentityLines({ name, location, className, arrival = 'none' }: IdentityLinesProps) {
  // Below sm each `· word` pair is a unit (a phone column may be ~110px wide
  // beside the portrait); from sm each whole segment is a unit, so a role never
  // splits across lines ("· AI-assisted / Builder") once there is room.
  const segments = [...IDENTITY_ROLES, location].map((segment, s) =>
    segment.split(' ').map((word, w) => (s > 0 && w === 0 ? `· ${word}` : word)),
  );
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1.5',
        arrival === 'mount' && styles.riseMount,
        className,
      )}
    >
      <p className="font-serif font-light text-step-2 leading-tight text-ink">{name}</p>
      <p className="font-mono text-meta tracking-label uppercase text-text-meta">
        {segments.map((words, s) => (
          <Fragment key={words.join(' ')}>
            {s > 0 ? ' ' : null}
            <span className="sm:whitespace-nowrap">
              {words.map((word, w) => (
                <Fragment key={`${w}-${word}`}>
                  {w > 0 ? ' ' : null}
                  <span className="whitespace-nowrap">{word}</span>
                </Fragment>
              ))}
            </span>
          </Fragment>
        ))}
      </p>
    </div>
  );
}
