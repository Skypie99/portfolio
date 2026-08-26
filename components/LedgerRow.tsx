import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type LedgerRowProps = {
  /** Left-aligned mono figure — a round numeral ("01", "IV"). */
  numeral: string;
  /** Serif title. */
  title: string;
  /** Right-aligned mono date. Ignored when `open` is true. */
  date?: string;
  /** Renders the open-state chip (terracotta dot + "open") instead of a date. */
  open?: boolean;
  /** sr-only word read before the numeral ("Row 01"). Defaults to "Row" —
   *  callers with their own noun for a row (CalibrationRecord's rounds are
   *  "Round") override it. */
  numeralLabel?: string;
  /** Optional full-width content wrapped onto its own line, under the row's
   *  own `flex-wrap` (give it `basis-full`) — e.g. CalibrationRecord's
   *  counts line. */
  after?: ReactNode;
  className?: string;
};

/**
 * LedgerRow — THE ROOM instrument furniture (A15). Mono figure left · serif
 * title · right-aligned date · hairline separators — CalibrationRecord's
 * bones, generalized into a reusable row. Renders an `<li>`; the caller
 * owns the surrounding `<ul role="list">`. Wired into CalibrationRecord
 * since THE ROOM's Phase H follow-up dedup pass — `numeralLabel` and `after`
 * exist because CalibrationRecord needed a "Round" noun and a trailing
 * counts line this row's original four props didn't cover.
 */
export function LedgerRow({
  numeral,
  title,
  date,
  open = false,
  numeralLabel = 'Row',
  after,
  className,
}: LedgerRowProps) {
  return (
    <li
      className={cn(
        'flex flex-wrap items-baseline gap-x-6 gap-y-1.5 border-t border-border-decorative py-5 first:border-t-0 first:pt-0',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="font-serif font-light text-step-1 leading-none text-ink/75 w-10 shrink-0"
      >
        {numeral}
      </span>
      <span className="sr-only">{`${numeralLabel} ${numeral}`}</span>
      <span className="font-mono text-label tracking-label uppercase text-ink">
        {title}
      </span>
      {/* UP-43(b): ml-auto lands every status on the row rule's own right
          edge, so the dates read as a ledger column instead of trailing the
          keyword at a different x per row (right-edge spread 44.55px ->
          0.00 at every width). Chosen over a fixed keyword column, which
          reads equally clean today but is destroyed by one longer title —
          measured with a synthetic 130.5px title, the fixed column's spread
          reopens to 30.66-66.50px while ml-auto holds 0.00 through the
          schema's own 24-char maximum. Same house idiom as
          ProjectCard/CaseStudyCard's trailing action group. */}
      {open ? (
        /* UP-43(c): items-baseline, not items-center. Under items-center no
           flex item participates in baseline alignment, so per CSS Flexbox
           §8.5 this chip's first baseline is synthesised from its STARTMOST
           item — the dot, which has no line boxes and falls back to its
           border-box bottom. The row's own items-baseline then pinned the
           DOT's bottom to the row baseline and let the text hang 1.31px
           below it (measured 1.31-1.32px at every width, both themes; an
           earlier read called this "~3px ABOVE", which is the sign inverted
           and the magnitude doubled by a deviceScaleFactor-2 capture).
           items-baseline makes the chip's own text the baseline it offers,
           so the text lands at 0.00 and the dot does not move — measured
           0.00px on both axes in 28 of 28 reads. Do NOT reach for
           align-middle: that utility is not in the built stylesheet and
           would be a silent no-op. */
        <span className="ml-auto inline-flex items-baseline gap-2 font-mono text-meta tracking-label uppercase text-accent-text">
          <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-terracotta" />
          open
        </span>
      ) : date ? (
        <span className="ml-auto font-mono text-meta tracking-label uppercase text-text-meta tabular-nums">
          <time dateTime={date}>{date}</time>
        </span>
      ) : null}
      {after}
    </li>
  );
}
