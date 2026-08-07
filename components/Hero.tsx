import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';

type HeroProps = {
  eyebrow: string;
  heading: string;
  subhead: string;
  ctaLabel: string;
  ctaHref: string;
  /**
   * Attribution nameplate (optional) — rendered above the eyebrow when `name`
   * is provided. Puts a face + name + a soft positioning line on the hub so a
   * first-time visitor knows whose work this is. Omitting `name` leaves the
   * hero exactly as before (keeps the Hero smoke test fixture unchanged).
   */
  name?: string;
  positioning?: string;
  avatarSrc?: string;
  avatarAlt?: string;
};

/**
 * Hero — F-01. Generous whitespace, Cormorant Light, single primary CTA
 * with the terracotta signature dot.
 *
 * Server Component (Peter C2 perf): Framer Motion removed from initial
 * chunk. Arrival is carried by the hero-wash bloom (hero-bg-drift in
 * `app/globals.css`) + the landing-pad spacing below — the old .hero-enter
 * mount stagger was retired (motion-clockwork 2026-07-19): the view-timeline
 * scroll rules replaced its `animation` in modern browsers, so it never played.
 *
 * Dani wave5 homepage polish:
 *   - Terracotta rule (40px wide, 1px tall) below eyebrow for brand anchor
 *   - Scroll indicator below CTA draws eye to continue reading
 */
export function Hero({
  eyebrow,
  heading,
  subhead,
  ctaLabel,
  ctaHref,
  name,
  positioning,
  avatarSrc,
  avatarAlt,
}: HeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden',
        'min-h-[85vh]',
        'flex flex-col justify-center',
        'px-gutter',
        'world-surface',
      )}
      style={{
        // U1 (A-01) — the landing pad. Top air sized to receive the film's exit
        // momentum: a natural flick past the pin release settles ~0.9–1.5
        // viewports beyond the seam at 375, so the nameplate sits deep enough
        // that the settled frame composes the person (avatar + name + role +
        // headline start) instead of depositing the visitor mid-headline.
        // Decreasing-with-width curve: ~500px at 375 (where release physics
        // live — the walk-observed settle band is seam+900…1330px), easing to
        // the original 200px by 1440 (desktop wheel scrolling never overshot).
        // Pure spacing — gravity, never capture or snap; the hero-wash bloom
        // keeps the receiving air lit.
        paddingTop: 'clamp(200px, calc(605px - 28vw), 500px)',
        paddingBottom: 'clamp(64px, 10vw, 128px)',
      }}
    >
      {/* Warm radial wash — drifts upward on scroll for depth behind the headline.
          hero-bg-drift: translateY + scale driven by scroll-driven animation. */}
      <div aria-hidden="true" className="hero-wash hero-bg-drift absolute inset-0 pointer-events-none" />

      <div className="max-w-content w-full relative">
        {/* Right-edge spine — closes the wide-screen void by anchoring the
            negative space with a quiet vertical rule: two hairlines converging
            on the brand terracotta dot (rhyming the eyebrow rule + CTA dot
            below). Decorative (aria-hidden), lg+ only, vertically centred so it
            stays clear of the upper-right hero-wash bloom; a mark, never a fill,
            so it never competes with the revealed world. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 lg:flex flex-col items-center gap-3"
        >
          <span className="h-28 w-px bg-gradient-to-b from-transparent to-terracotta/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-terracotta/70" />
          <span className="h-28 w-px bg-gradient-to-t from-transparent to-terracotta/40" />
        </div>

        {/* Attribution nameplate — face + name + soft positioning line, so a
            first-time visitor knows whose work this is the moment the hero
            settles. Rest-visible: the wash bloom carries the arrival. */}
        {name && (
          <div className="mb-10 flex items-center gap-4">
            {avatarSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt={avatarAlt ?? name}
                width={80}
                height={80}
                className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-terracotta/25"
              />
            )}
            <div className="flex flex-col gap-1">
              <p className="font-serif font-light text-step-2 leading-tight text-ink">
                {name}
              </p>
              {positioning && (
                <p className="font-sans font-light text-body-sm leading-snug text-ink-muted text-pretty max-w-[44ch]">
                  {positioning}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Eyebrow + terracotta brand rule */}
        <div className="hero-scroll-fade mb-12">
          <p className="font-mono text-label tracking-label uppercase text-text-meta mb-3">
            {eyebrow}
          </p>
          {/* Terracotta horizontal rule — brand anchor, ties to CTA dot pattern */}
          <span aria-hidden="true" className="block h-px w-16 bg-terracotta" />
        </div>

        <h1
          className={cn(
            'hero-scroll-translate',
            'font-serif font-light',
            'text-hero',
            'leading-[1.0]',
            'ember',
            'mb-7',
            'max-w-[16ch]',
            'text-balance',
          )}
        >
          {heading}
        </h1>

        <p
          className={cn(
            'font-sans font-light text-step-1 text-ink-muted',
            'max-w-[520px]',
            'mb-16',
            'text-pretty',
          )}
        >
          {subhead}
        </p>

        <div className="hero-scroll-fade flex flex-col items-start gap-16">
          <Button href={ctaHref}>{ctaLabel}</Button>

          {/* Scroll indicator — subtle affordance to continue reading.
              Alex A11y 2026-05-29: was opacity-60 (2.65:1 contrast — WCAG 1.4.3 FAIL).
              Changed to opacity-90 (5.04:1 — PASS) while keeping the subtle feel. */}
          <a
            href="#work"
            aria-label="Scroll to work section"
            className={cn(
              'inline-flex flex-col items-center gap-1.5',
              'font-mono text-meta tracking-label uppercase text-text-meta',
              'opacity-90 hover:opacity-100',
              'transition-opacity duration-base ease-out',
            )}
          >
            <span>Scroll</span>
            <span aria-hidden="true" className="text-cool text-body leading-none">
              {'↓'}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
