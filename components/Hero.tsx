import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';

type HeroProps = {
  eyebrow: string;
  heading: string;
  subhead: string;
  ctaLabel: string;
  ctaHref: string;
};

/**
 * Hero — F-01. Generous whitespace, Cormorant Light, single primary CTA
 * with the terracotta signature dot.
 *
 * Server Component (Peter C2 perf): Framer Motion removed from initial
 * chunk. Motion implemented as CSS keyframes in `app/globals.css`:
 *   - status pill -> eyebrow -> heading -> subhead -> button stagger via delay classes
 *   - fade + 8px translateY rise, easeOut, 600ms
 *   - prefers-reduced-motion -> snaps to final state, no animation
 *
 * 2026-05-27 polish:
 *  - "Available for work" status pill above the eyebrow (pulse dot)
 *  - text-balance on the headline so multi-line breaks read editorially
 *  - decorative ornament between eyebrow and heading replaces the rule
 *  - meta cluster below the CTA: location · availability · open-source
 */
export function Hero({ eyebrow, heading, subhead, ctaLabel, ctaHref }: HeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden',
        'min-h-[80vh]',
        'flex flex-col justify-center',
        'px-gutter',
        'pt-20 pb-16 md:pt-20 md:pb-16',
        'bg-cream',
      )}
      style={{
        paddingTop: 'clamp(96px, 14vw, 200px)',
        paddingBottom: 'clamp(64px, 10vw, 128px)',
      }}
    >
      {/* Decorative radial wash — subtle warmth from the upper-right.
          Pure CSS, no JS, zero perf cost. Behind everything (z-0). */}
      <span
        aria-hidden="true"
        className="hero-wash pointer-events-none absolute inset-0 z-0"
      />

      <div className="relative z-10 max-w-content w-full">
        {/* Status pill — "Available for work" with pulsing terracotta dot.
            Sits above the eyebrow as a small editorial signal. */}
        <div className="hero-enter mb-5">
          <span
            className={cn(
              'inline-flex items-center gap-2',
              'px-3 py-1 rounded-pill',
              'bg-blush border border-sand',
              'font-mono text-meta tracking-label uppercase text-accent-text',
            )}
          >
            <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
              <span className="hero-status-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-terracotta" />
            </span>
            Available for work · 2026
          </span>
        </div>

        {/* Eyebrow — terracotta dot + label */}
        <p
          className={cn(
            'hero-enter hero-scroll-fade hero-enter-delay-1',
            'font-mono text-label tracking-label uppercase text-terracotta',
            'flex items-center gap-2 mb-6',
          )}
        >
          <span
            aria-hidden="true"
            className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta"
          />
          {eyebrow}
        </p>

        <h1
          className={cn(
            'hero-enter hero-enter-delay-2',
            'font-serif font-light',
            'text-[clamp(2.5rem,7.5vw,4.5rem)] md:text-[4.5rem]',
            'leading-[1.02]',
            'text-near-black',
            'mb-6',
            'max-w-[18ch]',
            'text-balance',
          )}
          style={{ letterSpacing: '-0.025em' }}
        >
          {heading}
        </h1>

        <p
          className={cn(
            'hero-enter hero-enter-delay-2',
            'font-sans font-light text-[1.0625rem] text-charcoal',
            'leading-[1.65]',
            'max-w-[540px]',
            'mb-10',
            'text-pretty',
          )}
          style={{ letterSpacing: '0.25px' }}
        >
          {subhead}
        </p>

        <div className="hero-enter hero-enter-delay-3 flex flex-col items-start gap-5">
          <Button href={ctaHref} pulseOnMount>
            {ctaLabel}
          </Button>

          {/* Meta cluster — three small editorial signals. */}
          <ul
            className="flex flex-wrap items-center gap-x-5 gap-y-1.5"
            aria-label="At a glance"
          >
            {[
              'Vancouver, BC',
              '4 live projects',
              'All open source',
            ].map((m, i) => (
              <li
                key={m}
                className="font-mono text-meta text-sage-text flex items-center gap-3"
                style={{ letterSpacing: '0.08em' }}
              >
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="inline-block w-1 h-1 rounded-full bg-stone -ml-2"
                  />
                )}
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
