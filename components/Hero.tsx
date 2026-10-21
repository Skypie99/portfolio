import type { ReactNode } from 'react';

import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';

type HeroProps = {
  eyebrow: string;
  heading: ReactNode;
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
  /**
   * One-line imprint under the positioning sentence (Portfolio 3.0 Phase 03,
   * F-002). The cinematic title card shows "SkyPi Studio" as the largest text
   * on the opening screen and, being protected (PR-001), cannot explain
   * itself. Phase 03's blinded 10-second test found 3 of 3 reviewers unable
   * to tell whether that was a person's practice or an agency. This line is
   * the fix, and it lives HERE rather than on /about because the identity
   * contract (§7) requires the relationship to be made explicit in the
   * section immediately following the one that introduces the mark, and
   * because a 10-second reader never reaches /about. Omitted → the hero is
   * byte-identical to before.
   */
  imprint?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  /**
   * Proof slot (C4, THE ROOM Phase C) — the three curated receipts that
   * replaced the five-chip band. They belong to the HERO, inside its own
   * content column, because the point of the move is that the hardest
   * numbers on the site arrive with the introduction instead of a band
   * later. Rendered OUTSIDE the `hero-scroll-fade` group on purpose: the
   * CTA fades on scroll and the evidence must not. Omitted → the hero is
   * byte-identical to before (the Hero smoke fixture passes nothing).
   */
  receipts?: ReactNode;
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
 *   - Terracotta rule (1px tall) below eyebrow for brand anchor, as wide as the
 *     eyebrow's own text (owner refinement 2026-10-18; it was a fixed 64px)
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
  imprint,
  avatarSrc,
  avatarAlt,
  receipts,
}: HeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden',
        'min-h-[85vh]',
        'flex flex-col justify-center',
        'px-gutter',
        'world-surface',
        // Bottom air (RC-2 first visual slice, D-CON-001 B). Below xl this is
        // today's value, byte for byte; from xl the hero closes 96px above the
        // next band — with the pill beside the lead and the strip unboxed,
        // the base's 128px read as a trailing void. Expressed as classes so
        // the landing pad above stays the only inline length.
        'pb-[clamp(64px,10vw,128px)] xl:pb-24',
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
      }}
    >
      {/* Warm radial wash — drifts upward on scroll for depth behind the headline.
          hero-bg-drift: translateY + scale driven by scroll-driven animation. */}
      <div aria-hidden="true" className="hero-wash hero-bg-drift absolute inset-0 pointer-events-none" />

      <div className="max-w-content w-full relative">
        {/* Attribution nameplate — face + name + soft positioning line, so a
            first-time visitor knows whose work this is the moment the hero
            settles. Rest-visible: the wash bloom carries the arrival. */}
        {name && (
          <div
            data-hero-identity
            className={cn(
              'flex items-center gap-4',
              // M-CON-001 B r2 (RC-2 first visual slice): the identity block is
              // a signature, set apart from the kicker group — 40px from 640px up.
              // Phones from 376 to 639px take 20px (owner refinement 2026-10-18):
              // at 40, the 393×852 first screen after Skip showed 6px of the 56px
              // "See the work." pill. 20 is still the widest gap in the phone
              // stack, and with the 12px lead rhythm below it the pill's whole
              // label is on screen. The two shortest portrait widths keep the
              // base 16px: there the measured 375 landing rule (globals.css)
              // promises the whole block AND a complete 56px pill after Skip.
              'mb-5 max-[375px]:mb-4 sm:mb-10',
              // 1280-class desktop only (1280–1439px wide): 8 of the 20px fit
              // budget for the 1280×800 first screen. 1440 and up keep 40.
              'xl:max-[1439px]:mb-8',
            )}
          >
            {avatarSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt={avatarAlt ?? name}
                width={80}
                height={80}
                loading="lazy"
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
              {imprint && (
                <p className="mt-1.5 font-sans text-body-sm leading-snug text-text-meta">
                  {imprint}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Eyebrow + terracotta brand rule */}
        {/* 1280-class desktop only: 8 more of the 20px fit budget (48 → 40). */}
        {/* w-fit (owner refinement 2026-10-18): the group is as wide as the
            eyebrow's own text, so the rule under it spans the whole phrase — a
            fixed 64px rule read as underlining only its first word. max-w-full
            keeps the group inside the column: where the phrase wraps (the 320px
            stress width) the group takes the column and the rule spans it. */}
        <div className="hero-scroll-fade w-fit max-w-full mb-4 sm:mb-12 xl:max-[1439px]:mb-10">
          <p className="font-mono text-label text-text-meta mb-3">
            {eyebrow}
          </p>
          {/* Terracotta horizontal rule — brand anchor, ties to CTA dot pattern */}
          <span aria-hidden="true" className="block h-px w-full bg-terracotta" />
        </div>

        <h1
          className={cn(
            'hero-scroll-translate',
            'font-serif font-light',
            'text-hero',
            'leading-[1.02] sm:leading-[1.0]',
            'ember',
            // Phones: 12px under the headline at every width below 640 (owner
            // refinement 2026-10-18; 376–639 was 16). 1280-class desktop only:
            // the last 4 of the 20px fit budget (28 → 24).
            'mb-3 sm:mb-7 xl:max-[1439px]:mb-6',
            'max-w-[16ch] xl:max-w-[24ch]',
            'text-balance',
            // Narrow phones need a genuine display step, not seven compressed
            // 48px lines. 375px keeps a 40px display; the 320px stress width
            // uses 35px so the same sentence settles into five calm lines.
            // The relative default still respects user font size.
            'max-[375px]:text-[2.5rem] max-[375px]:leading-[1.1] max-[359px]:text-[2.1875rem]',
          )}
        >
          {heading}
        </h1>

        {/* The lead row (RC-2 first visual slice, D-CON-001 B). Below xl this
            wrapper is a plain block and nothing moves. From xl — 1280px, the
            first Tailwind breakpoint where the 545px lead, a 48px gap and the
            ~191px pill fit the rail-narrowed column (936px at 1280) — the lead
            and the pill share one row: lead first in the DOM, pill second, the
            pill's top on the lead's first line. The lead keeps its own classes
            and does not fade; the pill keeps its hero-scroll-fade wrapper. */}
        <div className="xl:flex xl:items-start xl:gap-12">
          <p
            className={cn(
              'font-sans font-light text-step-1 text-ink-muted max-[375px]:text-[1.125rem]',
              'max-w-measure-lead',
              // Phones: 12px to the pill at every width below 640 (owner
              // refinement 2026-10-18; 376–639 was 20).
              'mb-3 sm:mb-16 xl:mb-0',
              'text-pretty',
            )}
          >
            {subhead}
          </p>

          {/* xl:mt-0.5 is B's 2px optical offset of the pill against the lead's
              first line; shrink-0 keeps the pill whole beside the lead. */}
          <div className="hero-scroll-fade flex flex-col items-start gap-12 sm:gap-16 xl:mt-0.5 xl:shrink-0">
            <Button href={ctaHref}>{ctaLabel}</Button>

            {/* Scroll indicator — subtle affordance to continue reading.
                Alex A11y 2026-05-29: was opacity-60 (2.65:1 contrast — WCAG 1.4.3 FAIL).
                SYN-T-010 (2026-10-21): at 0.9 the retuned ink-meta still measured
                4.10–4.24:1 on the light peach hero wash at 320–767px; 0.95 cleared
                the floor at 4.512:1 at 639px (Chromium rendered pixels).
                Owner-approved correction (2026-10-21): the rest state is now
                opacity-100. The changed candidate measured 4.976:1 at 639px
                light (the marginal case) and 7.348:1 at 320px dark; hover remains
                full opacity.
                From xl the pill sits beside the lead and this duplicate of its
                destination is not rendered (display:none, so it also leaves the
                accessibility tree); below xl it stays exactly as it was. */}
            <a
              href="#work"
              aria-label="Explore projects"
              className={cn(
                'inline-flex flex-col items-center gap-1.5',
                'font-mono text-meta tracking-label uppercase text-text-meta',
                'opacity-100 hover:opacity-100',
                'transition-opacity duration-base ease-out',
                'xl:hidden',
              )}
            >
              <span>Explore projects</span>
              <span aria-hidden="true" className="text-cool text-body leading-none">
                {'↓'}
              </span>
            </a>
          </div>
        </div>

        {receipts}
      </div>
    </section>
  );
}
