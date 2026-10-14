import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { SettleHeading } from '@/components/HeroSettle';
import { RunwayIdentity } from '@/components/RunwayIdentity';
import { getProfile } from '@/lib/content';
import { canonicalFor } from '@/lib/metadata';

const LINK_CLASS =
  'text-accent-text underline decoration-accent-text/40 underline-offset-[3px] decoration-1 ' +
  'hover:decoration-accent-text focus-visible:decoration-accent-text ' +
  'transition-[text-decoration-color,color] duration-fast ease-out';

const ERAS = [
  {
    year: '1966',
    image: '/images/tokyo-through-time/1966.webp',
    alt: 'Monochrome traffic approaching an arched tunnel in the imagined 1966 Tokyo sequence.',
    description: 'Monochrome streets and period-inspired traffic lead into a dark tunnel.',
  },
  {
    year: '2026',
    image: '/images/tokyo-through-time/2026.webp',
    alt: 'An illuminated modern city street leading toward an overpass at dusk.',
    description: 'The city emerges in colour at dusk, with an overpass ahead.',
  },
  {
    year: '2086',
    image: '/images/tokyo-through-time/2086.webp',
    alt: 'A luminous fish-like figure above traffic between neon-lit buildings.',
    description: 'An imagined future fills the street with neon and a luminous fish-like figure.',
  },
];

/** Unlisted project page, shared by its own link rather than the public sitemap. */
export function generateMetadata(): Metadata {
  const profile = getProfile();
  const title = `Tokyo Through Time: ${profile.name}`;
  const description =
    'A 30-second independent short film imagining Tokyo in 1966, 2026, and 2086. ' +
    'Visuals and music created in Runway, edited and finished in DaVinci Resolve.';
  const image = {
    url: '/images/tokyo-through-time/share.jpg',
    width: 1200,
    height: 630,
    alt: 'Tokyo Through Time: a luminous fish-like figure above a neon city street.',
  };
  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: canonicalFor('/tokyo-through-time/') },
    openGraph: {
      type: 'website',
      url: '/tokyo-through-time/',
      siteName: `${profile.name}: Senior Technical Support`,
      locale: 'en_CA',
      title,
      description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  };
}

export default function TokyoThroughTimePage() {
  return (
    <>
      <RunwayIdentity variant="page" />

      <section className="px-gutter py-24 lg:py-32 world-surface">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Independent short film
          </p>
          <SettleHeading className="font-serif font-light text-display ember max-w-measure-heading mb-8 text-balance">
            Tokyo Through Time
          </SettleHeading>
          <p className="font-sans font-light text-step-1 text-ink-muted max-w-measure-wide text-pretty mb-12">
            Three imagined versions of Tokyo, connected by a journey through its streets.
            From 1966 to 2026 to 2086, the city changes around a camera that keeps moving forward.
          </p>

          <figure>
            <div className="bg-black rounded-lg overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
              <video
                controls
                playsInline
                preload="none"
                width="1920"
                height="1080"
                poster="/images/tokyo-through-time/poster.jpg"
                aria-label="Tokyo Through Time, a 30 second short film"
                aria-describedby="tokyo-film-caption"
                className="block w-full h-auto"
              >
                <source src="/videos/tokyo-through-time.mp4" type="video/mp4" />
                <track
                  kind="captions"
                  src="/videos/tokyo-through-time.vtt"
                  srcLang="en"
                  label="English music captions"
                />
                Your browser cannot play embedded video.{' '}
                <a href="/videos/tokyo-through-time.mp4" className={LINK_CLASS}>
                  Download Tokyo Through Time
                </a>
                .
              </video>
            </div>
            <figcaption id="tokyo-film-caption" className="font-sans font-light text-sm leading-relaxed text-ink-muted mt-4 max-w-measure-wide">
              <strong className="font-light text-ink">Tokyo Through Time</strong>{' '}
              <span aria-hidden="true">&middot;</span> 30 seconds{' '}
              <span aria-hidden="true">&middot;</span> an independent film by Skyler Halisky.
              <br />
              Visuals and era-specific music created in Runway. Edited and finished in DaVinci Resolve.
            </figcaption>
          </figure>

          <p className="font-sans font-light text-sm text-ink-muted mt-4">
            <a href="#visual-description" className={LINK_CLASS}>Read the visual description</a>
            {' '}or{' '}
            <a href="/videos/tokyo-through-time.mp4" className={LINK_CLASS}>download the film</a>.
          </p>

          <details className="max-w-measure-wide mt-8 border border-border-decorative rounded-lg p-6">
            <summary className="cursor-pointer min-h-11 py-2 font-sans font-light text-prose text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-text">
              Watch with a spoken visual description
            </summary>
            <p className="font-sans font-light text-sm leading-relaxed text-ink-muted mt-4 mb-6">
              This version adds narration describing the scenes, with the music lowered beneath it.
            </p>
            <video
              controls
              playsInline
              preload="none"
              width="1920"
              height="1080"
              poster="/images/tokyo-through-time/poster.jpg"
              aria-label="Tokyo Through Time with spoken visual description, a 30 second short film"
              className="block w-full h-auto rounded-lg bg-black"
            >
              <source src="/videos/tokyo-through-time-described.mp4" type="video/mp4" />
              <track
                kind="captions"
                src="/videos/tokyo-through-time-described.vtt"
                srcLang="en"
                label="English narration and music captions"
              />
              <a href="/videos/tokyo-through-time-described.mp4" className={LINK_CLASS}>
                Download the film with spoken visual description
              </a>
            </video>
          </details>
        </div>
      </section>

      <section className="px-gutter py-24 lg:py-32 world-surface-alt border-t border-border-decorative">
        <div className="max-w-content mx-auto">
          <h2 className="font-serif font-light text-prose-h2 text-ink mb-8">Three eras, one journey</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ERAS.map((era) => (
              <li key={era.year}>
                <figure>
                  <Image
                    src={era.image}
                    alt={era.alt}
                    width={768}
                    height={432}
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="block w-full h-auto rounded-lg"
                  />
                  <figcaption className="mt-4">
                    <h3 className="font-serif font-light text-step-1 text-ink">Tokyo {era.year}</h3>
                    <p className="font-sans font-light text-sm leading-relaxed text-ink-muted mt-2">{era.description}</p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>

          <div className="max-w-measure-wide mt-16 flex flex-col gap-6">
            <h2 className="font-serif font-light text-prose-h2 text-ink">Making the eras feel connected</h2>
            <p className="font-sans font-light text-prose text-ink-muted">
              I wanted the changes in era to feel like part of the same journey. Forward movement
              holds the street scenes together, while darkness inside a tunnel and beneath an
              overpass creates a natural bridge between different versions of the city.
            </p>
            <p className="font-sans font-light text-prose text-ink-muted">
              The visual progression moves from sepia and monochrome into dusk, then into a neon
              future. The final view turns upward, where green points of light form an origami-like bird.
              I created the visuals and audio in Runway and used DaVinci Resolve to edit and finish the film.
            </p>

            <h2 className="font-serif font-light text-prose-h2 text-ink mt-8">From an idea to a finished result</h2>
            <p className="font-sans font-light text-prose text-ink-muted">
              Making something with a creative tool puts me in the user&rsquo;s seat. There is a goal,
              a workflow to learn, and a point where the pieces need to come together.
              In customer support, I care about understanding that goal, explaining the next step,
              and following through until the person can move forward with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="px-gutter py-24 lg:py-32 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto">
          <div className="max-w-measure-wide">
            <h2 id="visual-description" className="font-serif font-light text-prose-h2 text-ink mb-8 scroll-mt-24">
              Visual description
            </h2>
            <p className="font-sans font-light text-prose text-ink-muted mb-6">
              The film follows a visual passage through time, accompanied by era-specific music created in Runway.
            </p>
            <ol className="font-sans font-light text-prose text-ink-muted list-decimal pl-5 flex flex-col gap-4">
              <li><strong className="font-light text-ink">Opening:</strong> a sepia aerial city view labelled Tokyo 1966 cuts to a monochrome street.</li>
              <li><strong className="font-light text-ink">The tunnel:</strong> the camera advances past traffic and pedestrians into a dark arched tunnel.</li>
              <li><strong className="font-light text-ink">The modern city:</strong> an illuminated street appears at dusk, and the camera travels beneath an overpass.</li>
              <li><strong className="font-light text-ink">The future:</strong> neon fills the street and a large luminous fish-like figure floats above the traffic.</li>
              <li><strong className="font-light text-ink">The ending:</strong> the view turns upward toward towers as green points of light form an origami-like bird.</li>
            </ol>
            <p className="font-sans font-light text-prose text-ink-muted mt-12">
              More of what I build is at{' '}
              <Link href="/work/" className={LINK_CLASS}>the work</Link>.
              {' '}Or{' '}
              <Link href="/contact/" className={LINK_CLASS}>write to me</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
