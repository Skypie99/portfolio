import type { Metadata } from 'next';
import Link from 'next/link';

import { ContactEmail } from '@/components/ContactEmail';
import { cn } from '@/lib/cn';
import { getProfile } from '@/lib/content';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description = `Get in touch with ${profile.name} about AI engineering, accessibility, or thoughtful product collaborations.`;
  return {
    title: `Contact — ${profile.name}`,
    description,
    openGraph: {
      type: 'website',
      title: `Contact — ${profile.name}`,
      description,
      images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: `Contact — ${profile.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Contact — ${profile.name}`,
      description,
      images: ['/og-image.svg'],
    },
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
      <section className="px-gutter py-24 lg:py-32 bg-cream">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Correspond
          </p>
          <h1
            className="font-serif font-light text-[clamp(2.5rem,6vw,4rem)] text-near-black leading-[1.05] max-w-3xl mb-8 text-balance"
            style={{ letterSpacing: '-0.02em' }}
          >
            Write to me.
          </h1>
          <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] max-w-[640px] mb-4 text-pretty">
            AI engineering. Accessibility. Thoughtful product collaborations.
            I reply to most messages within a few days.
          </p>
          <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] max-w-[640px] mb-10 text-pretty">
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
            'reveal-on-scroll',
            'px-gutter pt-16 lg:pt-20 pb-24 lg:pb-32',
            'bg-cream border-t border-border-decorative',
          )}
        >
          <div className="max-w-content mx-auto">
            <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
              <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
              Elsewhere
            </p>
            <h2 className="font-serif font-light text-display-m text-near-black mb-12 max-w-2xl leading-tight">
              Find me in other quiet corners.
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              {profile.socials.map((s) => (
                <li key={s.url} className="border-t border-border-decorative pt-4">
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
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Back link */}
      <section
        className={cn(
          'px-gutter py-24 lg:py-32',
          // Dani wave4: warm-white for the closing section contrast.
          'bg-warm-white border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true">{'←'}</span>
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
