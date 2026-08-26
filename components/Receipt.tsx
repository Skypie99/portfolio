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
  /** ISO date (YYYY-MM-DD) the figure was measured/reported.
   *  OPTIONAL, and the omission is meaningful rather than lazy: an
   *  append-only ledger row that has not closed yet has no date to give, and
   *  inventing one (its predecessor's close, say) would be the exact kind of
   *  almost-true number this component exists to prevent. With no date the
   *  line reads `reported · the record` — tier, then method, and nothing
   *  claimed in between. Board 01 pane A draws that receipt this way.
   *  (C4, THE ROOM Phase C — the homepage's calibration-round receipt.) */
  date?: string;
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
 * Carries the G2 method underline (Phase G): the card is a `.method-pair`, so
 * hovering the FIGURE — or tabbing into the card — draws the method link's
 * underline. The link itself is always visible text, so touch and reduced-
 * motion visitors lose nothing. See the G2 block in globals.css.
 *
 * Generalizes the homepage/A11yReceipts chip band's figure-and-method idea
 * into one component; wired into the homepage hero in Phase C (C4). Despite
 * the shared "evidence" concept, this does NOT replace FlagstoneTestReceipt
 * (app/work/[slug]/page.tsx) — that strip carries a paragraph of methodology
 * prose this card has no slot for. See FlagstoneTestReceipt's own docblock
 * for the reasoning (reviewed and kept separate, Phase H follow-up).
 */
export function Receipt({ value, label, tier, date, methodHref, methodLabel, className }: ReceiptProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 bg-receipt border border-receipt-rule rounded-md p-6',
        // G2 (THE ROOM Phase G): the card is the method PAIR — the figure and
        // the door to its proof are one instrument, so landing anywhere on the
        // receipt draws the method's underline. No-op when methodHref is absent
        // (nothing carries .method-draw to answer).
        'method-pair',
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
        {tier}
        {date && (
          <>
            {' '}
            <time dateTime={date}>{date}</time>
          </>
        )}
        {methodHref && (
          <>
            <span aria-hidden="true"> · </span>
            <a
              href={methodHref}
              className="link-draw method-draw text-accent-text hover:text-accent-text"
            >
              {methodLabel ?? 'method'}
            </a>
          </>
        )}
      </p>
    </div>
  );
}
