'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import { useInViewOnce, usePrefersReducedMotion } from '@/lib/motion';

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
  const m = value.match(/^(\d[\d,]*)(\D*)$/);
  return m ? { target: Number(m[1].replace(/,/g, '')), suffix: m[2] } : null;
}

/**
 * Split a STATIC (non-counted) stat into a leading figure + trailing unit so the
 * unit can be set optically below the numeral (§5.5). "2.2 AA" → {figure:"2.2",
 * unit:"AA"} (the literal space is dropped — the unit span's margin is the gap).
 * Returns null for pure tokens with no leading number ("E2E") so they render
 * whole. Deliberately separate from parseStat: widening parseStat's regex would
 * route "2.2 AA" into the count-up path and animate "2.2".
 */
function splitStaticUnit(value: string): { figure: string; unit: string } | null {
  const m = value.match(/^(\d[\d.,]*)\s*(\S.*)$/);
  return m ? { figure: m[1], unit: m[2] } : null;
}

/**
 * CountUpStat — signature moment #1.
 *
 * A numeric stat figure that counts once from 0 → its value the first time it
 * scrolls into view, then holds. Mirrors the landing's "arrive and settle":
 * one eased ramp (--ease-out / --dur-reveal) that resolves and stops.
 *
 * Craft details that keep it premium, not gimmicky:
 *  - `tabular-nums` locks digit width while the count runs so the number
 *    never jitters horizontally; it releases the frame the count completes,
 *    and is never worn by SSR / no-JS / reduced-motion renders — the rest
 *    state is the final frame.
 *  - Non-numeric values ("E2E") render statically — no nonsense scramble.
 *  - A trailing suffix ("+") only appears once the count completes.
 *  - The accessible name is the FINAL value ("789 tests passing"), so screen
 *    readers never hear "0, 1, 2…".
 *  - SSR / no-JS / reduced-motion render the final value immediately — the
 *    number is never hidden and there is no flash of "0".
 *  - The figure caps at --fs-step-5: the display clamp's upper range belongs
 *    to route H1s (HI-4) — the stats win their cells, never the page.
 */
export function CountUpStat({ value, emberClass, label }: CountUpStatProps) {
  const parsed = useMemo(() => parseStat(value), [value]);
  const [ref, inView] = useInViewOnce<HTMLParagraphElement>();
  const reduced = usePrefersReducedMotion();
  // Initial = final value: correct first paint, no-JS safe, no flash of 0.
  const [display, setDisplay] = useState(parsed ? parsed.target : 0);
  const started = useRef(false);
  const counting = parsed !== null && display < parsed.target;

  useEffect(() => {
    if (!parsed || reduced || started.current || !inView) return;
    started.current = true;
    const target = parsed.target;
    const duration = 900;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3); // ≈ ease-out [.22,1,.36,1]
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(easeOut(t) * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setDisplay(0); // snap to 0 as it enters view, then count up
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, parsed]);

  // §5.5: the trailing unit (e.g. "%" in "100%", "AA" in "2.2 AA") is set optically
  // below the numeral so every figure reads as one confident stat. Two paths:
  //  • counted (parsed) — the number animates; the suffix appears only once it lands
  //    (preserving the existing "suffix on completion" detail) and only if non-empty
  //    (so the four pure-number cells stay span-free).
  //  • static (parsed === null) — split a trailing unit out of e.g. "2.2 AA".
  const suffixSpan = (text: string) => (
    <span className="text-[0.5em] tracking-normal align-baseline ml-[0.22em]">{text}</span>
  );

  let body: ReactNode;
  if (parsed) {
    body = (
      <>
        {display.toLocaleString('en-US')}
        {display >= parsed.target && parsed.suffix ? suffixSpan(parsed.suffix) : null}
      </>
    );
  } else {
    const split = splitStaticUnit(value);
    body = split ? (
      <>
        {split.figure}
        {suffixSpan(split.unit)}
      </>
    ) : (
      value
    );
  }

  return (
    <>
      {/* L6-05 (aria-prohibited-attr): a <p> cannot carry aria-label. The
          animated figure is aria-hidden so AT never hears "0, 1, 2…", and the
          stable accessible name — the FINAL value — lives on an sr-only span.
          The finding's prescribed mechanism; the visual craft is byte-identical. */}
      <p
        ref={ref}
        aria-hidden="true"
        className={cn(
          'font-serif font-light text-stat-figure mb-1',
          counting && 'tabular-nums',
          // tactile (wow 2026-06-04, C4): the figure leans in a hair when its cell
          // is hovered — the count "completes under your hand". Compositor-only,
          // origin-left so it stays aligned; snaps to rest under reduced motion.
          'origin-left transition-transform duration-base ease-gh-glide group-hover:scale-[1.03]',
          emberClass,
        )}
      >
        {body}
      </p>
      <span className="sr-only">{`${value} ${label}`}</span>
    </>
  );
}
