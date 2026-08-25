import { cn } from '@/lib/cn';

type ReceiptProps = {
  /** The figure itself, e.g. "2,971", "100%", "2.2 AA". Rendered as-is, no
   *  count-up — that animated register belongs to CountUpStat (the homepage
   *  showcase); Receipt is the documentary "mono proves" register instead. */
  value: string;
  /** What the figure measures. */
  label: string;
  /** "measured" = run against this site directly. "reported" = project-
   *  claimed, with a method. Tier is carried by the WORD, never colour alone. */
  tier: 'measured' | 'reported';
  /** ISO date (YYYY-MM-DD) the figure was measured/reported. */
  date: string;
  /** Optional link to the method/evidence — the command or artifact that
   *  reproduces the figure. */
  methodHref?: string;
  /** Defaults to "method" if methodHref is given without a label. */
  methodLabel?: string;
  className?: string;
};

/**
 * Receipt — THE ROOM instrument furniture (A15). A figure (mono 500,
 * tabular) · label · `measured/reported YYYY-MM-DD` · optional method
 * anchor. Reads as a second paper stock (--rgb-receipt /
 * --rgb-receipt-rule, A5) — evidence, not decoration.
 *
 * Replaces the hardcoded FlagstoneTestReceipt JSX (app/work/[slug]/page.tsx)
 * and the homepage/A11yReceipts chip band in spirit, generalized into one
 * component. Not yet wired into any page (Phase A) — that's Phase C+.
 */
export function Receipt({ value, label, tier, date, methodHref, methodLabel, className }: ReceiptProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 bg-receipt border border-receipt-rule rounded-md p-6',
        className,
      )}
    >
      <p className="font-mono font-medium text-step-2 tabular-nums text-ink">
        {value}
      </p>
      <p className="font-mono text-label tracking-label uppercase text-text-meta">
        {label}
      </p>
      <p className="font-mono text-meta tracking-label uppercase text-text-meta">
        {tier} {date}
        {methodHref && (
          <>
            <span aria-hidden="true"> · </span>
            <a href={methodHref} className="link-draw text-accent-text hover:text-accent-text">
              {methodLabel ?? 'method'}
            </a>
          </>
        )}
      </p>
    </div>
  );
}
