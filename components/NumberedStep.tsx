import { cn } from '@/lib/cn';

type NumberedStepProps = {
  number: string;
  title: string;
  body: string;
  /**
   * Wave 3: adds a left terracotta border to the numeral column,
   * used when the step sits inside the warm-white process panel.
   */
  highlight?: boolean;
  className?: string;
};

/**
 * NumberedStep — Dani §3.6.
 *
 * Numeral uses font-mono at 19px in Umber (--color-accent-text).
 * Alex BLK-3.b: at 19px the normal-text contrast rule applies, so the
 * numeral MUST be Umber (7.30:1 on cream), never raw Terracotta (3.87:1 fail).
 *
 * Wave 3: `highlight` prop adds a terracotta left-border on the numeral
 * column for use inside the warm-white process panel.
 *
 * Reused for the "How I work" block on the homepage and the About page.
 */
export function NumberedStep({ number, title, body, highlight = false, className }: NumberedStepProps) {
  // C-43: below lg the numeral column + gap ate the body's measure, rendering the
  // confession at ~12ch / 9 lines. Stack the numeral ABOVE the text sub-lg so the
  // body keeps its full width; restore the side-by-side row at lg.
  return (
    <div className={cn('flex flex-col gap-3 lg:flex-row lg:gap-12 lg:items-start', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'font-mono text-step-2 tracking-label uppercase tabular-nums',
          'text-accent-text',
          'shrink-0 w-14',
          'leading-none pt-0.5',
          highlight && 'border-l-2 border-terracotta pl-4 py-1',
        )}
      >
        {number}
      </span>
      <div className="flex flex-col gap-3">
        {/* UI_SYSTEM §type: tracking rides a `tracking-*` utility, never an inline
            style. text-step-2 folds no tracking of its own (only step-3/4/5 do),
            so the sub-head's -0.01em is carried explicitly here. Arbitrary rather
            than a named token by design — --ls-heading holds this exact value, but
            exposing it as `tracking-heading` is a tailwind.config change that
            belongs to the naming pass (UP-03 · DECISIONS §P P1-UP-03-FORM). */}
        {/* leading-[1.15]: a singular tuned value (no token matches; unrelated
            to the stale, disconnected --lh-display). */}
        <h3 className="font-serif font-normal text-step-2 tracking-[-0.01em] leading-[1.15] text-ink text-balance">
          {title}
        </h3>
        <p className="font-sans font-light text-body text-ink-muted max-w-measure text-pretty">
          {body}
        </p>
      </div>
    </div>
  );
}
