import type { Metadata } from 'next';
import Link from 'next/link';

import { EmptyState } from '@/components/EmptyState';
import { SettleHeading } from '@/components/HeroSettle';
import { ParallaxWash } from '@/components/ParallaxWash';
import { Reveal } from '@/components/Reveal';
import { TagPill } from '@/components/TagPill';
import { RunwayIdentity } from '@/components/RunwayIdentity';
import { cn } from '@/lib/cn';
import { getBlogPosts, getProfile } from '@/lib/content';
import { bindSeparatorDash, bindSoloLetters } from '@/lib/markdown';
import { OG_CARD } from '@/lib/og';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description = 'Notes by Sky Halisky on AI, accessibility, and building things.';
  return {
    title: `Notes — ${profile.name}`,
    description,
    // Feed autodiscovery (§8.4) — browsers/readers find the RSS + JSON feeds.
    alternates: {
      types: {
        'application/rss+xml': '/feed.xml',
        'application/feed+json': '/feed.json',
      },
    },
    openGraph: {
      type: 'website',
      // TA-10: a leaf openGraph REPLACES the root's wholesale (W0-04) — url,
      // siteName and locale restated so they survive on this route's share.
      url: '/blog/',
      siteName: 'Sky Halisky — AI Portfolio',
      locale: 'en_CA',
      title: `Notes — ${profile.name}`,
      description,
      images: [OG_CARD],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Notes — ${profile.name}`,
      description,
    },
  };
}

/**
 * /blog — blog listing page.
 *
 * Server Component. Shows all non-draft posts sorted newest-first.
 * Each card links to /blog/[slug]. Design language follows the site's
 * cream/blush palette, numbered-index editorial style, and DM Mono labels.
 */
export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <>
      {/* UP-38: the mobile brand chip. Measured, this route rendered ZERO
          identity -- visible OR in the a11y tree -- before the footer at
          320/375/414. Same mark home's runway uses; hidden from md up, where
          the rail starts signing. */}
      <RunwayIdentity variant="page" />
      {/* Page header */}
      <section
        className={cn(
          'relative isolate overflow-hidden',
          'px-gutter',
          'py-24 lg:py-32',
          'world-surface',
        )}
      >
        {/* golden-hour light continuity — the quietest entry point is now lit
            like every other showcase header (work, certificates). RM → static. */}
        <ParallaxWash depth="far" />
        <div className="relative z-10 max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Notes — {posts.length} {posts.length === 1 ? 'entry' : 'entries'}
          </p>
          <SettleHeading
            className="font-serif font-light text-display ember max-w-3xl mb-12 text-balance"
          >
            Notes
          </SettleHeading>
          <p className="font-sans font-light text-prose text-ink-muted max-w-measure-lead text-pretty">
            On accessibility, AI-assisted building, and what it means to
            make things carefully — one project at a time.
          </p>
          {/* Quiet feed affordance (§8.4) — follow without an algorithm in the middle. */}
          <p className="mt-8 font-mono text-meta tracking-label uppercase text-text-meta flex items-center gap-3">
            <span>Subscribe</span>
            <a
              href="/feed.xml"
              className="link-draw text-ink hover:text-accent-text transition-colors duration-fast ease-out"
            >
              RSS
            </a>
            <span aria-hidden="true" className="text-stone-strong">·</span>
            <a
              href="/feed.json"
              className="link-draw text-ink hover:text-accent-text transition-colors duration-fast ease-out"
            >
              JSON
            </a>
          </p>
        </div>
      </section>

      {/* Posts list */}
      <section
        className={cn(
          'px-gutter',
          // SP-3: closer is now its own section below; this beat becomes the
          // content-internal gap (~72px) so it doesn't double-stack. §7.4.
          'pb-18',
          'world-surface-alt',
          'border-t border-border-decorative pt-24 lg:pt-32',
        )}
      >
        <div className="max-w-content mx-auto">
          <h2 className="sr-only">Posts</h2>

          {posts.length === 0 ? (
            <EmptyState
              title="No posts yet."
              note="Notes on accessibility, AI-assisted building, and making things carefully are on the way."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border-decorative">
              {/* last:pb-0 (L3-07): the section's own pb-18 carries the close,
                  so a one-entry list doesn't stack ~96px of dead li padding on
                  top of the closer grammar. Dividers between entries keep
                  their py-24 rhythm. */}
              {posts.map((post, idx) => (
                <li key={post.id} className="py-24 first:pt-0 last:pb-0">
                  <Reveal index={idx} variant="depth">
                  <Link
                    href={`/blog/${post.id}/`}
                    /* label-content-name-mismatch: the card link wraps the date,
                       reading time, title, summary, tags and "Read more", so an
                       explicit "Read: <title>" name would omit most of the visible
                       text. Name from content instead — the arrow/index/dot are
                       aria-hidden, so AT hears date · reading time · title · summary
                       · tags · "Read more" in reading order. */
                    className="group flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16 text-ink"
                  >
                    {/* Index number */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'font-mono text-label tracking-label tabular-nums shrink-0 mt-1',
                        'text-text-meta group-hover:text-accent-text group-focus-visible:text-accent-text',
                        'transition-colors duration-fast ease-out',
                      )}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* Card body */}
                    <div className="flex flex-col gap-4 flex-1 min-w-0">
                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-4">
                        <time
                          dateTime={post.publishedDate}
                          className="font-mono text-meta tracking-label uppercase text-text-meta tabular-nums"
                        >
                          {new Date(post.publishedDate + 'T12:00:00').toLocaleDateString('en-CA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                        <span aria-hidden="true" className="font-mono text-meta text-stone-strong">·</span>
                        <span className="font-mono text-meta tracking-label uppercase text-text-meta tabular-nums">
                          {post.readingTimeMinutes} min read
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className={cn(
                          'font-serif font-normal md:font-light text-blog-card-title text-balance',
                          'text-ink group-hover:text-accent-text group-focus-visible:text-accent-text',
                          'transition-colors duration-fast ease-out',
                        )}
                      >
                        {bindSeparatorDash(bindSoloLetters(post.title))}
                      </h3>

                      {/* Summary */}
                      <p className="font-sans font-light text-prose text-ink-muted max-w-measure-lead text-pretty">
                        {bindSeparatorDash(post.summary)}
                      </p>

                      {/* Tags + CTA row */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                        <ul className="flex flex-wrap gap-2" aria-label="Tags">
                          {post.tags.map((tag) => (
                            <li key={tag}>
                              <TagPill>{tag}</TagPill>
                            </li>
                          ))}
                        </ul>
                        <span
                          className={cn(
                            'font-mono text-meta tracking-label uppercase text-accent-text',
                            'inline-flex items-center gap-1',
                            'transition-transform duration-fast ease-out',
                            'group-hover:translate-x-1 group-focus-visible:translate-x-1',
                          )}
                        >
                          Read more
                          <span aria-hidden="true">{'→'}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}

        </div>
      </section>

      {/* Back link — SP-3 unified closer grammar: hairline border-t + ~72px
          (py-18). world-surface alternates off the -alt list above.
          L3-07: a quiet forward action joins the closer so the one-entry
          page has a next step instead of only an exit. */}
      <section className="px-gutter py-18 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <Link
            href="/"
            className="group px-1 py-1.5 -mx-1 -my-1.5 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-ink hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true" className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1">{'←'}</span>
            Back to home
          </Link>
          <Link
            href="/work/"
            className="group px-1 py-1.5 -mx-1 -my-1.5 inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-ink hover:text-accent-text transition-colors duration-fast ease-out"
          >
            Browse the work
            <span aria-hidden="true" className="inline-block transition-transform duration-base ease-gh-glide group-hover:translate-x-1">{'→'}</span>
          </Link>
        </div>
      </section>
    </>
  );
}
