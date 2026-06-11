import type { Metadata } from 'next';
import Link from 'next/link';

import { ContactEmail } from '@/components/ContactEmail';
import { SettleHeading } from '@/components/HeroSettle';
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

  return (
    <>
      {/* Page header + primary CTA */}
      <section className="px-gutter py-24 lg:py-32 world-surface">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Correspond
          </p>
          <SettleHeading
            className="font-serif font-light text-display ember leading-[1.05] max-w-3xl mb-8 text-balance"
          >
            Write to me.
          </SettleHeading>
          <p className="font-sans font-light text-prose text-charcoal leading-[1.65] max-w-[640px] mb-4 text-pretty">
            Accessible technology, built with care. Thoughtful product
            collaborations. Learning out loud, one project at a time. I read
            every message that comes through.
          </p>
          <p className="font-sans font-light text-prose text-charcoal leading-[1.65] max-w-[640px] mb-10 text-pretty">
            The socials below also work, for everything else.
          </p>

          <ContactEmail />
        </div>
      </section>

      {/* Socials — Cycle 27: tightened bg from blush to warm-white +
          smaller top padding so the section reads as a continuation of
          the contact column, not a separate block. The hairline border-t
          already provides the visual handoff. */}
      {profile.socials.length > 0 && (
        <section
          className={cn(
            'px-gutter pt-16 lg:pt-20 pb-24 lg:pb-32',
            'world-surface border-t border-border-decorative',
          )}
        >
          <div className="max-w-content mx-auto">
            <Reveal variant="scene" className="mb-12">
              <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                Elsewhere
              </p>
              <h2 className="font-serif font-light text-step-4 ember max-w-2xl leading-tight">
                Find me in other quiet corners.
              </h2>
            </Reveal>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
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

      {/* Back link — tightened vertical rhythm: a single nav link doesn't
          need a full py-24 section (the hairline border carries the handoff). */}
      <section
        className={cn(
          'px-gutter py-16 lg:py-20',
          // Dani wave4: warm-white for the closing section contrast.
          'world-surface-alt border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true" className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1">{'←'}</span>
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
