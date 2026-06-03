'use client';

import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

type CountUpStatProps = {
  /** Raw stat string, e.g. "789", "50+", "E2E". */
  value: string;
  /** Ember gradient utility class for the figure (e.g. "ember-teal"). */
  emberClass: string;
  /** Label that follows the figure — used to build the accessible name. */
  label: string;
};

/** Split a stat into a numeric target + trailing suffix, or null if non-numeric. */
function parseStat(value: string): { target: number; suffix: string } | null {
  const m = value.match(/^(\d+)(\D*)$/);
  return m ? { target: Number(m[1]), suffix: m[2] } : null;
}

/**
 * CountUpStat — signature moment #1.
 *
 * A numeric stat figure that counts once from 0 → its value the first time it
 * scrolls into view, then holds. Mirrors the landing's "arrive and settle":
 * one eased ramp (--ease-out / --dur-reveal) that resolves and stops.
 *
 * Craft details that keep it premium, not gimmicky:
 *  - `tabular-nums` locks digit width so the number never jitters horizontally.
 *  - Non-numeric values ("E2E") render statically — no nonsense scramble.
 *  - A trailing suffix ("+") only appears once the count completes.
 *  - The accessible name is the FINAL value ("789 tests passing"), so screen
 *    readers never hear "0, 1, 2…".
 *  - SSR / no-JS / reduced-motion render the final value immediately — the
 *    number is never hidden and there is no flash of "0".
 */
export function CountUpStat({ value, emberClass, label }: CountUpStatProps) {
  const parsed = useMemo(() => parseStat(value), [value]);
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();
  // Initial = final value: correct first paint, no-JS safe, no flash of 0.
  const [display, setDisplay] = useState(parsed ? parsed.target : 0);
  const started = useRef(false);

  useEffect(() => {
    if (!parsed || reduced || started.current || !inView) return;
    started.current = true;
    setDisplay(0); // snap to 0 as it enters view, then count up
    const controls = animate(0, parsed.target, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduced, parsed]);

  return (
    <p
      ref={ref}
      className={cn(
        'font-serif font-light text-[clamp(2.75rem,5.5vw,4.25rem)] leading-none mb-1 tabular-nums',
        emberClass,
      )}
      style={{ letterSpacing: '-0.03em' }}
      aria-label={`${value} ${label}`}
    >
      {parsed ? `${display}${display >= parsed.target ? parsed.suffix : ''}` : value}
    </p>
  );
}
