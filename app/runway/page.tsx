import type { Metadata } from 'next';
import Link from 'next/link';

import { SettleHeading } from '@/components/HeroSettle';
import { RunwayIdentity } from '@/components/RunwayIdentity';
import { getProfile } from '@/lib/content';
import { canonicalFor } from '@/lib/metadata';
import { OG_CARD } from '@/lib/og';

/**
 * Persistent-underline prose link (WCAG 1.4.1 — a link inside a block of text
 * must never be distinguished by colour alone). Same value as MarkdownProse's
 * PROSE_LINK_CLASS (not exported there), kept local rather than exporting a
 * shared constant for one extra call site.
 */
const LINK_CLASS =
  'text-accent-text underline decoration-accent-text/40 underline-offset-[3px] decoration-1 ' +
  'hover:decoration-accent-text focus-visible:decoration-accent-text ' +
  'transition-[text-decoration-color,color] duration-fast ease-out';

/**
 * /runway — unlisted. A proof-of-use short film made for a specific job
 * application, not a portfolio deliverable: no nav/footer/sitemap entry (see
 * app/sitemap.ts), robots noindex/nofollow. Still declares its own openGraph/
 * twitter block — a leaf openGraph REPLACES the root layout's wholesale, so
 * without one this route would silently wear the homepage's share card and
 * fail the static-integrity guards (mirrors app/archive/page.tsx, the other
 * noindex route).
 */
export function generateMetadata(): Metadata {
  const profile = getProfile();
  const title = `Hi, Runway: ${profile.name}`;
  const description =
    'A short film made in Runway, built while applying for the Consumer Support Specialist role.';
  return {
    title,
    description,
    robots: { index: false, follow: false },
    // F-028: same self-canonical requirement as app/archive/page.tsx —
    // without it this noindex route would silently inherit the root
    // layout's `/` canonical and falsely claim to BE the homepage.
    alternates: {
      canonical: canonicalFor('/runway/'),
    },
    openGraph: {
      type: 'website',
      url: '/runway/',
      siteName: 'Skyler Halisky: Senior Technical Support',
      locale: 'en_CA',
      title,
      description,
      images: [OG_CARD],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function RunwayPage() {
  return (
    <>
      <RunwayIdentity variant="page" />

      <section className="px-gutter py-24 lg:py-32 world-surface">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            For the Runway team
          </p>
          <SettleHeading className="font-serif font-light text-display ember max-w-measure-heading mb-16 text-balance">
            Hi, Runway.
          </SettleHeading>
          <p className="font-sans font-light text-step-1 text-ink-muted max-w-measure-wide text-pretty">
            I made this while applying for the Consumer Support Specialist role. It is a
            proof of use, not a reel. I bought a Pro plan on Saturday, gave myself a real
            assignment instead of a tour, and this is what came out of the weekend.
          </p>
          <p className="font-sans font-light text-prose text-ink-muted max-w-measure-wide text-pretty mt-6">
            I spend my days in technical support, so I did not just take the tour: I
            paid attention to where the product created friction, the way a support
            person can&rsquo;t help but do. That instinct is the part I would bring to
            your team: turning what trips up a brand-new user into something support and
            product can act on.
          </p>
        </div>
      </section>

      <section className="px-gutter py-32 lg:py-50 world-surface-alt border-t border-border-decorative">
        <div className="max-w-content mx-auto">
          <figure className="mb-20">
            <div className="bg-black rounded-lg overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption -- no
                  transcript/.vtt exists yet for this film's sound design; see
                  Sky's report for this route on adding one. */}
              <video
                controls
                playsInline
                preload="metadata"
                poster="/images/runway/poster.jpg"
                aria-label="Amazon Night Flight, a 46 second short film"
                className="block w-full h-auto"
              >
                <source src="/videos/amazon-night-flight.mp4" type="video/mp4" />
                Your browser cannot play embedded video. The file is at{' '}
                <a href="/videos/amazon-night-flight.mp4" className={LINK_CLASS}>
                  /videos/amazon-night-flight.mp4
                </a>
                .
              </video>
            </div>
            <figcaption className="font-sans font-light text-sm leading-relaxed text-ink-muted mt-4 max-w-measure-wide">
              <strong className="font-light text-ink">Amazon Night Flight</strong>{' '}
              <span aria-hidden="true">&middot;</span> 46 seconds{' '}
              <span aria-hidden="true">&middot;</span> first weekend on a Runway Pro plan.
              <br />
              Every moving shot was generated in Runway using Gen-4.5, Gen-4 Turbo,
              Seedance 2.0, and Seedance 2.5, across text-to-video and image-to-video,
              then upscaled. For the title shots, I created the still input plates with
              Claude Cowork, using Python to composite the lettering from duckweed and
              plankton sampled from the film’s own frames. The reversals and colour
              matching were handled with ffmpeg workflows written with Claude Code.
              Final assembly, soundtrack, and titling were done in CapCut once the
              Runway credits ran out.
            </figcaption>
          </figure>

          <div className="max-w-measure-wide flex flex-col gap-8">
            <h2 className="font-serif font-light text-prose-h2 text-ink">
              How the words got there
            </h2>
            <p className="font-sans font-light text-prose text-ink-muted">
              Video models do not spell reliably, so I did not ask the model to generate
              the lettering. I used Claude Cowork to create <strong>HI RUNWAY</strong> and{' '}
              <strong>I’M SKYLER</strong> as still input plates, building the letters from
              duckweed and plankton sampled from the film’s own frames. I then used those
              plates as image-to-video inputs in Runway and prompted them to{' '}
              <em>dissolve</em> apart. I reversed the resulting clips in the edit, so what
              you see assembling was really coming apart.
            </p>
            <p className="font-sans font-light text-prose text-ink-muted">
              Everything else in those shots comes from the models: the river, the
              descent through the canopy, the plunge, the night vision, and the burst
              back into moonlight.
            </p>
          </div>

          {/*
            NOTES FROM A BRAND NEW USER — optional, and the strongest thing that could
            be added here. Uncomment once written: five to eight honest, specific,
            non-whiny observations from the first weekend on Runway. This is the
            section that proves Sky thinks like support, not just like a user.

          <div className="max-w-measure-wide flex flex-col gap-8 mt-16">
            <h2 className="font-serif font-light text-prose-h2 text-ink">
              Notes from a brand new user
            </h2>
            <p className="font-sans font-light text-prose text-ink-muted">
              I kept a log of the friction as I hit it. Not complaints. The things I
              would want in front of me on day one of the job.
            </p>
            <ol className="font-sans font-light text-prose text-ink-muted list-decimal pl-5 flex flex-col gap-3">
              <li></li>
            </ol>
          </div>
          */}
        </div>
      </section>

      <section className="px-gutter py-32 lg:py-50 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto">
          <p className="font-sans font-light text-prose text-ink-muted max-w-measure-wide">
            The rest of what I build is at{' '}
            <Link href="/work/" className={LINK_CLASS}>
              the work
            </Link>
            . Or skip ahead and{' '}
            <Link href="/contact/" className={LINK_CLASS}>
              write to me
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
