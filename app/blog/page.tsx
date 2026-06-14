import type { Metadata } from 'next';
import Link from 'next/link';

import { SettleHeading } from '@/components/HeroSettle';
import { Reveal } from '@/components/Reveal';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { getBlogPosts, getProfile } from '@/lib/content';
import { bindSoloLetters } from '@/lib/markdown';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description = 'Notes by Sky Halisky on AI, accessibility, and building things.';
  return {
    title: `Notes — ${profile.name}`,
    description,
    openGraph: {
      type: 'website',
      title: `Notes — ${profile.name}`,
      description,
      images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
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
      {/* Page header */}
      <section
        className={cn(
          'px-gutter',
          'py-24 lg:py-32',
          'world-surface',
        )}
      >
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Notes — {posts.length} {posts.length === 1 ? 'entry' : 'entries'}
          </p>
          <SettleHeading
            className="font-serif font-light text-display ember max-w-3xl mb-12 text-balance"
          >
            Notes
          </SettleHeading>
          <p className="font-sans font-light text-prose text-charcoal leading-[1.65] max-w-[640px] text-pretty">
            On accessibility, AI-assisted building, and what it means to
            make things carefully — one project at a time.
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
            <p className="font-serif font-light text-display-s text-charcoal leading-[1.65] max-w-[540px]">
              No posts yet — check back soon.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border-decorative">
              {posts.map((post, idx) => (
                <li key={post.id} className="py-24 first:pt-0">
                  <Reveal index={idx} variant="depth">
                  <Link
                    href={`/blog/${post.id}/`}
                    aria-label={`Read: ${post.title}`}
                    className="group flex flex-col md:flex-row md:items-start gap-8 md:gap-16 text-near-black"
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
                          className="font-mono text-meta tracking-label uppercase text-text-meta"
                        >
                          {new Date(post.publishedDate + 'T12:00:00').toLocaleDateString('en-CA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                        <span aria-hidden="true" className="font-mono text-meta text-stone-strong">·</span>
                        <span className="font-mono text-meta tracking-label uppercase text-text-meta">
                          {post.readingTimeMinutes} min read
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className={cn(
                          'font-serif font-normal md:font-light text-blog-card-title text-balance',
                          'text-near-black group-hover:text-accent-text group-focus-visible:text-accent-text',
                          'transition-colors duration-fast ease-out',
                        )}
                      >
                        {bindSoloLetters(post.title)}
                      </h3>

                      {/* Summary */}
                      <p className="font-sans font-light text-prose text-charcoal leading-[1.65] max-w-[640px] text-pretty">
                        {post.summary}
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
          (py-18). world-surface alternates off the -alt list above. */}
      <section className="px-gutter py-18 world-surface border-t border-border-decorative">
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
