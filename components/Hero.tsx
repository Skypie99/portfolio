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
 * Hero — F-01. Generous whitespace, Cormorant Light at 64/36px,
 * single primary CTA with the terracotta signature dot.
 *
 * Server Component (Peter C2 perf): Framer Motion removed from initial
 * chunk. Motion (Dani §5.3, Alex §5.1) implemented as CSS keyframes in
 * `app/globals.css`:
 *   - eyebrow -> heading -> subhead -> button stagger via delay classes
 *   - fade + 8px translateY rise, easeOut, 600ms
 *   - prefers-reduced-motion -> snaps to final state, no animation
 */
export function Hero({ eyebrow, heading, subhead, ctaLabel, ctaHref }: HeroProps) {
  return (
    <section
      className={cn(
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
        <p
          className={cn(
            'hero-enter hero-scroll-fade',
            'font-mono text-label tracking-label uppercase text-text-meta mb-4',
          )}
        >
          {eyebrow}
        </p>

        <h1
          className={cn(
            'hero-enter hero-enter-delay-1',
            'font-serif font-light',
            'text-[clamp(2.25rem,7vw,4rem)] md:text-[4rem]',
            'leading-[1.05]',
            'text-near-black',
            'mb-6',
            'max-w-3xl',
          )}
        >
          {heading}
        </h1>

        <p
          className={cn(
            'hero-enter hero-enter-delay-2',
            'font-sans font-light text-body text-charcoal',
            'leading-[1.65]',
            'max-w-[540px]',
            'mb-8',
          )}
          style={{ letterSpacing: '0.25px' }}
        >
          {subhead}
        </p>

        <div className="hero-enter hero-enter-delay-3">
          {/* Cycle 20: one-shot dot pulse 800ms after mount draws the eye
              after the hero entrance settles. Reduced-motion safe via
              the .cta-dot-pulse @media gate in globals.css. */}
          <Button href={ctaHref} pulseOnMount>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
