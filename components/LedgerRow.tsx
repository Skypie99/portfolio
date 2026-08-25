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
  className?: string;
};

/**
 * LedgerRow — THE ROOM instrument furniture (A15). Mono figure left · serif
 * title · right-aligned date · hairline separators — CalibrationRecord's
 * bones, generalized into a reusable row. Renders an `<li>`; the caller
 * owns the surrounding `<ul role="list">` (CalibrationRecord keeps its own
 * inline rows for now — not yet wired to this component, Phase A).
 */
export function LedgerRow({ numeral, title, date, open = false, className }: LedgerRowProps) {
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
      <span className="sr-only">{`Row ${numeral}`}</span>
      <span className="font-mono text-label tracking-label uppercase text-ink">
        {title}
      </span>
      {open ? (
        <span className="ml-auto inline-flex items-baseline gap-2 font-mono text-meta tracking-label uppercase text-accent-text">
          <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-terracotta" />
          open
        </span>
      ) : date ? (
        <span className="ml-auto font-mono text-meta tracking-label uppercase text-text-meta tabular-nums">
          {date}
        </span>
      ) : null}
    </li>
  );
}
