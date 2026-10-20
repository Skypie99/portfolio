import type { CSSProperties } from 'react';

import { ThemedShowcase } from '@/components/ThemedShowcase';
import { cn } from '@/lib/cn';
import type { ShowcaseHero as ShowcaseHeroSpec, ShowcaseProvenance } from '@/lib/caseShowcase';
import { signatureFor } from '@/lib/signature';

/**
 * ShowcaseHero — the capture-true hero of a Release 5 project showcase whose
 * first impression is a desktop screen (/work/ghost-code/, /work/dashboard/).
 *
 * The page's shared hero well (HeroImageSettle, app/work/[slug]/page.tsx)
 * spans the whole content column on these routes and reserves the capture's
 * own aspect from md up, so a 1290×806 screen renders at a size where its
 * text can be read instead of resting at 460px in a two-column grid. Below
 * md the same well turns portrait and the phone-composed capture stands on
 * the stage, 72% wide below sm and 53% from sm (Flagstone's measured phone
 * proportions). Exactly one of the two planes has a box at any width.
 *
 * The stage is the site's own: `.pr-world` + `.pr-horizon` (the golden-hour
 * placeholder paint), the dark-only `.pr-lamp`, and `.pr-hero-lift` for the
 * frame's settle (all in app/globals.css, all RM/no-JS safe). The planes use
 * the site-wide float chrome (`.ts-float`) and ThemedShowcase, so light and
 * dark twins swap inside the theme dissolve. Server Component; no state.
 */
export function ShowcaseHeroMedia({ slug, hero }: { slug: string; hero: ShowcaseHeroSpec }) {
  const sig = signatureFor(slug);
  return (
    <div className="absolute inset-0" style={{ '--pr-sig': sig } as CSSProperties} data-showcase-hero={slug}>
      <div aria-hidden="true" className="pr-world absolute inset-0" />
      <div aria-hidden="true" className="pr-horizon absolute inset-x-0" />
      <div aria-hidden="true" className="pr-lamp pointer-events-none absolute inset-0" />
      <div className="pr-hero-lift absolute inset-0">
        <div
          className="ts-float absolute left-1/2 top-1/2 hidden w-[94%] -translate-x-1/2 -translate-y-1/2 md:block"
          style={{ aspectRatio: `${hero.desktop.width} / ${hero.desktop.height}` }}
        >
          <ThemedShowcase
            light={{ src: hero.desktop.src, avif: hero.desktop.avif, webp: hero.desktop.webp }}
            dark={hero.desktop.dark}
            alt={hero.desktop.alt}
            fit="cover"
            eager
          />
        </div>
        <div
          className="ts-float absolute left-1/2 top-1/2 w-[72%] -translate-x-1/2 -translate-y-1/2 sm:w-[53%] md:hidden"
          style={{ aspectRatio: `${hero.phone.width} / ${hero.phone.height}` }}
        >
          <ThemedShowcase
            light={{ src: hero.phone.src, avif: hero.phone.avif, webp: hero.phone.webp }}
            dark={hero.phone.dark}
            alt={hero.phone.alt}
            fit="cover"
          />
        </div>
      </div>
    </div>
  );
}

function Line({ label, p }: { label: string; p: ShowcaseProvenance }) {
  return (
    <>
      {label}
      {' · '}
      <time dateTime={p.capturedDate}>{p.capturedDate}</time>
      {' · '}
      <span className="normal-case">{p.commit}</span>
      {p.note && <> · {p.note}</>}
    </>
  );
}

/** The one mono line under the showcase hero: what the capture is, when it
 *  was taken and at which commit, per laid-out width. */
export function ShowcaseHeroCaption({ hero, className }: { hero: ShowcaseHeroSpec; className?: string }) {
  return (
    <p className={cn('font-mono text-meta tracking-label uppercase text-ink-muted dark:text-ink', className)} data-showcase-hero-caption="">
      <span className="hidden md:inline">
        <Line label={hero.label} p={hero.provenance} />
      </span>
      <span className="md:hidden">
        <Line label={hero.phoneLabel} p={hero.phoneProvenance} />
      </span>
    </p>
  );
}
