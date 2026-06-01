import type { Metadata } from 'next';
import Link from 'next/link';

import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { getBlogPosts, getProfile } from '@/lib/content';

export function generateMetadata(): Metadata {
  const profile = getProfile();
  const description = 'Writing on accessibility, AI tools, and building things carefully — by Sky Halisky.';
  return {
    title: `Blog — ${profile.name}`,
    description,
    openGraph: {
      type: 'website',
      title: `Blog — ${profile.name}`,
      description,
      images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: `Blog — ${profile.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Blog — ${profile.name}`,
      description,
      images: ['/og-image.svg'],
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
          'bg-cream',
        )}
      >
        <div className="max-w-content mx-auto">
          <p className="font-mono text-label tracking-label uppercase text-text-meta mb-4 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            Blog — {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
          <h1
            className="font-serif font-light text-[clamp(2.5rem,6vw,4rem)] text-near-black leading-[1.05] max-w-3xl mb-8 text-balance"
            style={{ letterSpacing: '-0.02em' }}
          >
            Writing
          </h1>
          <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] max-w-[640px] text-pretty">
            Notes on accessibility, AI-assisted building, and what it means to
            make things carefully — one project at a time.
          </p>
        </div>
      </section>

      {/* Posts list */}
      <section
        className={cn(
          'reveal-on-scroll',
          'px-gutter',
          'pb-24 lg:pb-32',
          'bg-warm-white',
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
                <li key={post.id} className="py-12 first:pt-0">
                  <Link
                    href={`/blog/${post.id}/`}
                    aria-label={`Read: ${post.title}`}
                    className="group flex flex-col md:flex-row md:items-start gap-6 md:gap-10 text-near-black"
                  >
                    {/* Index number */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'font-mono text-label tracking-label shrink-0 mt-1',
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
                          'font-serif font-light text-[clamp(1.5rem,3.5vw,2.25rem)] leading-[1.1] text-balance',
                          'text-near-black group-hover:text-accent-text group-focus-visible:text-accent-text',
                          'transition-colors duration-fast ease-out',
                        )}
                        style={{ letterSpacing: '-0.01em' }}
                      >
                        {post.title}
                      </h3>

                      {/* Summary */}
                      <p className="font-sans font-light text-[1.0625rem] text-charcoal leading-[1.65] max-w-[640px] text-pretty">
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
                </li>
              ))}
            </ul>
          )}

          {/* Back link */}
          <div className="mt-20">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
            >
              <span aria-hidden="true">{'←'}</span>
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
