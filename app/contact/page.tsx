import type { Metadata } from 'next';
import Link from 'next/link';

import { ContactEmail } from '@/components/ContactEmail';
import { SettleHeading } from '@/components/HeroSettle';
import { ParallaxWash } from '@/components/ParallaxWash';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/cn';
import { getProfile } from '@/lib/content';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  return {
    title: `Contact — ${profile.name}`,
    description: 'Write to Sky Halisky — AI developer based in the Okanagan Valley, British Columbia.',
  };
}

/**
 * /contact — F-08. Minimal mailto-only page (Sky decided no form this cycle).
 *
 * Server Component. Primary CTA opens the user{'s} mail client with a
 * pre-filled subject. Optional secondary list of socials reads from
 * profile.json so it stays in sync with the Sidebar / Footer.
 *
 * Per Alex §4.5: every external link gets target=_blank, rel=noopener
 * noreferrer, AND an sr-only "(opens in new tab)" cue.
 */
export default function ContactPage() {
  const profile = getProfile();
  const linkedin = profile.socials.find((s) => s.platform === 'linkedin');

  return (
    <>
      {/* Page header + primary CTA */}
      <section data-band-anchor className="relative isolate overflow-hidden px-gutter py-24 lg:py-32 world-surface">
        {/* golden-hour light continuity — the invitation reads warm, matching
            every other showcase header (work, certificates). RM → static. */}
        <ParallaxWash depth="far" />
        <div className="relative z-10 max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Let&apos;s talk
          </p>
          <SettleHeading
            className="font-serif font-light text-display ember max-w-3xl mb-12 text-balance"
          >
            Write to me.
          </SettleHeading>
          <p className="font-sans font-light text-prose text-charcoal leading-[1.65] max-w-measure-lead mb-4 text-pretty">
            Accessible technology, built with care. Thoughtful product
            collaborations. Learning out loud, one project at a time. I read
            every message that comes through.
          </p>
          <p className="font-sans font-light text-prose text-charcoal leading-[1.65] max-w-measure-lead mb-16 text-pretty">
            The socials below also work, for everything else.
          </p>

          <ContactEmail />

          {/* L3-03: the quiet career-document pointer — employer-safe wording,
              deliberately NOT a résumé PDF (Sky's quiet-search stance). */}
          {linkedin && (
            <p className="mt-8 font-mono text-meta tracking-label uppercase">
              <a
                href={linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-draw text-near-black hover:text-accent-text transition-colors duration-fast ease-out inline-flex items-center gap-1.5"
              >
                <span>Full history on LinkedIn</span>
                <span aria-hidden="true" className="text-text-meta">
                  {'↗'}
                </span>
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </p>
          )}
        </div>
      </section>

      {/* Socials — Cycle 27 / SP-2: warm-white + a true continuation top
          padding so "Elsewhere" crests the fold; the hairline border-t carries
          the handoff. Top pad renders ≈64/80px (arbitrary rem dodges the
          inverted spacing namespace; §7.4 refactor will rename the plumbing). */}
      {profile.socials.length > 0 && (
        <section
          className={cn(
            // L3-07: trailing pad mirrors the section's own top (16/20) instead
            // of the full 24/32 band — a two-link list doesn't earn a showcase
            // close, and the closer grammar below still carries the air.
            'px-gutter pt-16 lg:pt-20 pb-16 lg:pb-20',
            'world-surface border-t border-border-decorative',
          )}
        >
          <div className="max-w-content mx-auto">
            <Reveal variant="scene" className="mb-24">
              <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                Elsewhere
              </p>
              <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-tight">
                Find me in other quiet corners.
              </h2>
            </Reveal>

            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-2xl">
              {profile.socials.map((s, i) => (
                <li key={s.url} className="group border-t border-border-decorative pt-4">
                  <Reveal index={i} variant="depth">
                    <div className="transition-transform duration-base ease-gh-glide group-hover:translate-x-1">
                      <p className="font-mono text-meta tracking-label uppercase text-sage-text mb-1">
                        {s.platform}
                      </p>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-draw font-sans text-body text-accent-text inline-flex items-center gap-2"
                      >
                        <span>{s.handle}</span>
                        <span aria-hidden="true">{'↗'}</span>
                        <span className="sr-only">(opens in new tab)</span>
                      </a>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Back link — SP-3 unified closer grammar: hairline border-t + ~72px
          symmetric (py-18). world-surface-alt alternates off the socials'
          world-surface above. §7.4 refactor will rename the plumbing. */}
      <section
        className={cn(
          'px-gutter py-18',
          'world-surface-alt border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <Link
            href="/"
            className="group px-1 py-1.5 -mx-1 -my-1.5 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true" className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1">{'←'}</span>
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
