import type { Metadata } from 'next';
import Link from 'next/link';

import { SettleHeading } from '@/components/HeroSettle';
import { RunwayIdentity } from '@/components/RunwayIdentity';
import { RunwayIdentityRelease } from '@/components/RunwayIdentityRelease';
import { getProfile } from '@/lib/content';
import { canonicalFor } from '@/lib/metadata';
import { OG_CARD } from '@/lib/og';

/**
 * Persistent-underline prose link (WCAG 1.4.1). Same value as the other
 * unlisted application routes (app/runway, app/tokyo-through-time), kept local
 * as they keep it.
 */
const LINK_CLASS =
  'text-accent-text underline decoration-accent-text/40 underline-offset-[3px] decoration-1 ' +
  'hover:decoration-accent-text focus-visible:decoration-accent-text ' +
  'transition-[text-decoration-color,color] duration-fast ease-out';

/**
 * What is said in the video, clean verbatim. public/videos/hi-float.vtt carries
 * the same words as timed captions; app/__tests__/float-application.test.tsx
 * fails if the two ever drift apart.
 */
const TRANSCRIPT = [
  'Hey, Julia, it’s Skyler from Kelowna, BC, Canada. Float would be a great place for me at this ' +
    'stage in my career because I thrive in a high-trust and high-autonomy environment where taking ' +
    'action, staying curious, and saying the thing is celebrated. This is just how I operate. I’m ' +
    'always looking for new challenges, feedback, new perspectives. I enjoy learning about, building, ' +
    'and mastering software, both inside and outside of the workplace.',
  'What drew me to Float? Well, first it was the software. After researching it, I found it to be ' +
    'interesting and impactful, and something I would enjoy supporting. And then it went a little bit ' +
    'deeper, and I started researching the company as a whole. And I found that Float is a fiercely ' +
    'transparent organization, which excites me. I had the pleasure of reading the public-facing ' +
    'handbook and found that Float’s philosophies and values aligned with me, both on a ' +
    'professional and personal level.',
  'There’s many other things I saw on that handbook and in your hiring process that excited me, ' +
    'and I’d be happy to talk to you about those more in the future. Thank you for your time, and ' +
    'I hope to speak soon. Bye.',
];

/**
 * /float — unlisted. A one-minute video recorded for a specific job
 * application, not a portfolio deliverable: no nav/footer/sitemap entry (see
 * app/sitemap.ts), robots noindex/nofollow, a self-canonical, and its own
 * openGraph/twitter block, because a leaf openGraph replaces the root
 * layout's wholesale (mirrors app/runway/page.tsx).
 *
 * The video is portrait (1080x1920), so it is capped at 22rem instead of
 * spanning the content width. It sits beside the transcript only from xl up:
 * the desktop rail takes ~312px from md, and at md/lg a second column measured
 * as little as 50px wide, so below xl the transcript stacks under the video.
 */
export function generateMetadata(): Metadata {
  const profile = getProfile();
  const title = `Hi, Float: ${profile.name}`;
  const description =
    'A one-minute video recorded for my application to Float, with captions and a transcript.';
  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: canonicalFor('/float/') },
    openGraph: {
      type: 'website',
      url: '/float/',
      siteName: `${profile.name}: Senior Technical Support`,
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

export default function FloatPage() {
  const profile = getProfile();
  return (
    <>
      <RunwayIdentity variant="page" />
      <RunwayIdentityRelease variant="page" />

      <section className="px-gutter py-24 lg:py-32 world-surface">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            For the Float team
          </p>
          <SettleHeading className="font-serif font-light text-display ember max-w-measure-heading mb-8 text-balance">
            Hi, Float.
          </SettleHeading>
          <p className="font-sans font-light text-step-1 text-ink-muted max-w-measure-wide text-pretty">
            A one-minute video, recorded for my application.
          </p>
        </div>
      </section>

      <section className="px-gutter py-24 lg:py-32 world-surface-alt border-t border-border-decorative">
        <div className="max-w-content mx-auto xl:grid xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-16 xl:items-start">
          <figure className="max-w-[22rem]">
            <div className="bg-black rounded-lg overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.4)]">
              <video
                controls
                playsInline
                preload="metadata"
                width="1080"
                height="1920"
                poster="/images/float/poster.jpg"
                aria-label={`Hi, Float: a one minute video from ${profile.name}`}
                aria-describedby="float-video-caption"
                className="block w-full h-auto"
              >
                <source src="/videos/hi-float.mp4" type="video/mp4" />
                <track
                  kind="captions"
                  src="/videos/hi-float.vtt"
                  srcLang="en"
                  label="English captions"
                />
                Your browser cannot play embedded video.{' '}
                <a href="/videos/hi-float.mp4" className={LINK_CLASS}>
                  Download the video
                </a>
                .
              </video>
            </div>
            <figcaption
              id="float-video-caption"
              className="font-sans font-light text-sm leading-relaxed text-ink-muted mt-4"
            >
              <strong className="font-light text-ink">Hi, Float</strong>{' '}
              <span aria-hidden="true">&middot;</span> 66 seconds{' '}
              <span aria-hidden="true">&middot;</span> captions available in the player.
            </figcaption>
          </figure>

          <div className="mt-12 xl:mt-0 max-w-measure-wide">
            <details className="border border-border-decorative rounded-lg p-6">
              <summary className="cursor-pointer min-h-11 py-2 font-sans font-light text-prose text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-text">
                Read the transcript
              </summary>
              <div className="mt-4 flex flex-col gap-4">
                {TRANSCRIPT.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="font-sans font-light text-prose text-ink-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </details>
            <p className="font-sans font-light text-sm text-ink-muted mt-6">
              <a href="/videos/hi-float.mp4" className={LINK_CLASS}>
                Download the video (MP4, 20 MB)
              </a>
            </p>
          </div>
        </div>
      </section>

      <section className="px-gutter py-24 lg:py-32 world-surface border-t border-border-decorative">
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
