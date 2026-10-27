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
 * unlisted application routes (app/float, app/runway, app/tokyo-through-time),
 * kept local as they keep it.
 */
const LINK_CLASS =
  'text-accent-text underline decoration-accent-text/40 underline-offset-[3px] decoration-1 ' +
  '[@media(hover:hover)]:hover:decoration-accent-text focus-visible:decoration-accent-text ' +
  'transition-[text-decoration-color,color] duration-fast ease-out';

/**
 * What is said in the video, clean verbatim (two false starts and one filler
 * dropped, nothing reworded). public/videos/hi-motion.vtt carries the same
 * words as timed captions; app/__tests__/motion-application.test.tsx fails if
 * the two ever drift apart.
 */
const TRANSCRIPT = [
  'Hey, Motion, my name’s Skyler, and I’m making this from Kelowna, BC, Canada. I spent the last ' +
    'couple years working in technical product support, where I really enjoy figuring out what ' +
    'isn’t working, getting to the bottom of it, and helping people understand it, become more ' +
    'confident with the technology that they’re using.',
  'What interests me about Motion is the combination of technical troubleshooting, AI, and ' +
    'creativity. Outside of work, I spend a lot of my free time exploring, creating AI-assisted ' +
    'projects. I recently created an AI-assisted short film called Tokyo Through Time. So the ' +
    'creative side of Motion’s platform generally excites me. I think it’d be exciting and ' +
    'impactful to help people understand how their creative work is performing and while learning ' +
    'the technology behind it.',
  'As for hard feedback to hear, one that really stuck out with me is I can sometimes become a ' +
    'little too technical when explaining escalations to internal partners and external support ' +
    'partners. What was hard to hear about this is that I thought that being so thorough was ' +
    'providing all the information they needed and reducing unnecessary back-and-forth, speeding ' +
    'up resolution time.',
  'But after reflecting, I realized that not everyone understands the terminology and workflows ' +
    'as well as I do. So I started to change my approach to these conversations. I would lead with ' +
    'what the issue is, what we’ve done, and what we need to do next, and only include the ' +
    'technical details when necessary. Very similar to how I go about these issues with clients. ' +
    'That made me realize that communicating effectively and being technically accurate aren’t ' +
    'always the same thing. You really have to adopt who you’re speaking to.',
  'Anyways, thank you for taking the time for watching this application video. I look forward to ' +
    'learning more about Motion and the team. Thanks.',
];

/**
 * /motion — unlisted. A short video recorded for a specific job application
 * (Motion's Platform Expert role), not a portfolio deliverable. Same contract
 * as app/float/page.tsx: no nav/footer/sitemap entry (see app/sitemap.ts),
 * robots noindex/nofollow, a self-canonical, and its own openGraph/twitter
 * block, because a leaf openGraph replaces the root layout's wholesale.
 *
 * The video is portrait (1080x1920), so it uses Float's layout: capped at
 * 22rem, beside the transcript only from xl up (below xl the desktop rail
 * leaves too narrow a second column), stacked under it below xl.
 */
export function generateMetadata(): Metadata {
  const profile = getProfile();
  const title = `Hi, Motion: ${profile.name}`;
  const description =
    'A short video introduction recorded for my Platform Expert application to Motion, with captions and a transcript.';
  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: canonicalFor('/motion/') },
    openGraph: {
      type: 'website',
      url: '/motion/',
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

export default function MotionPage() {
  const profile = getProfile();
  return (
    <>
      <RunwayIdentity variant="page" />
      <RunwayIdentityRelease variant="page" />

      <section className="px-gutter py-24 lg:py-32 world-surface">
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            For the Motion team
          </p>
          <SettleHeading className="font-serif font-light text-display ember max-w-measure-heading mb-8 text-balance">
            Hi, Motion.
          </SettleHeading>
          <p className="font-sans font-light text-step-1 text-ink-muted max-w-measure-wide text-pretty">
            A short introduction recorded for my Platform Expert application.
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
                poster="/images/motion/poster.jpg"
                aria-label={`Hi, Motion: a video introduction from ${profile.name}`}
                aria-describedby="motion-video-caption"
                className="block w-full h-auto"
              >
                <source src="/videos/hi-motion.mp4" type="video/mp4" />
                <track
                  kind="captions"
                  src="/videos/hi-motion.vtt"
                  srcLang="en"
                  label="English captions"
                />
                Your browser cannot play embedded video.{' '}
                <a href="/videos/hi-motion.mp4" className={LINK_CLASS}>
                  Download the video
                </a>
                .
              </video>
            </div>
            <figcaption
              id="motion-video-caption"
              className="font-sans font-light text-sm leading-relaxed text-ink-muted mt-4"
            >
              <strong className="font-light text-ink">Hi, Motion</strong>{' '}
              <span aria-hidden="true">&middot;</span> 1 minute 46 seconds{' '}
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
              <a href="/videos/hi-motion.mp4" className={LINK_CLASS}>
                Download the video (MP4, 31 MB)
              </a>
            </p>
            <p className="font-sans font-light text-sm leading-relaxed text-ink-muted mt-3">
              <Link href="/tokyo-through-time/" className={LINK_CLASS}>
                Explore Tokyo Through Time
              </Link>
              , the independent AI-assisted short film I mention in the video.
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
