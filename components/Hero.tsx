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
 * Dani wave5 homepage polish:
 *   - Terracotta rule (40px wide, 1px tall) below eyebrow for brand anchor
 *   - Scroll indicator below CTA draws eye to continue reading
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
      <div className="max-w-content w-full">
        {/* Eyebrow + terracotta brand rule */}
        <div className="hero-enter hero-scroll-fade mb-8">
          <p className="font-mono text-label tracking-label uppercase text-text-meta mb-3">
            {eyebrow}
          </p>
          {/* Terracotta horizontal rule — brand anchor, ties to CTA dot pattern */}
          <span aria-hidden="true" className="block h-px w-10 bg-terracotta" />
        </div>

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

        <div className="hero-enter hero-enter-delay-3 flex flex-col items-start gap-10">
          {/* Cycle 20: one-shot dot pulse 800ms after mount draws the eye
              after the hero entrance settles. Reduced-motion safe via
              the .cta-dot-pulse @media gate in globals.css. */}
          <Button href={ctaHref} pulseOnMount>
            {ctaLabel}
          </Button>

          {/* Scroll indicator — subtle affordance to continue reading */}
          <a
            href="#work"
            aria-label="Scroll to work section"
            className={cn(
              'inline-flex flex-col items-center gap-1.5',
              'font-mono text-meta tracking-label uppercase text-text-meta',
              'opacity-60 hover:opacity-100',
              'transition-opacity duration-base ease-out',
            )}
          >
            <span>Scroll</span>
            <span aria-hidden="true" className="text-terracotta text-[1rem] leading-none">
              {'↓'}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
