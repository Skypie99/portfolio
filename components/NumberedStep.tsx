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
  return (
    <div className={cn('flex gap-6 md:gap-8 items-start', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'font-mono text-display-s tracking-label uppercase',
          'text-accent-text',
          'shrink-0 w-12',
          'leading-none pt-1',
          highlight && 'border-l-2 border-terracotta pl-4 py-1',
        )}
      >
        {number}
      </span>
      <div className="flex flex-col gap-3">
        <h3
          className="font-serif font-normal text-[1.5rem] leading-[1.15] text-near-black text-balance"
          style={{ letterSpacing: '-0.01em' }}
        >
          {title}
        </h3>
        <p className="font-sans font-light text-body text-charcoal leading-[1.65] max-w-[540px] text-pretty">
          {body}
        </p>
      </div>
    </div>
  );
}
