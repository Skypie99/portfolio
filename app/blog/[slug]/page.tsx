import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SettleHeading } from '@/components/HeroSettle';
import { renderMarkdownProse } from '@/components/MarkdownProse';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { getAllBlogPostSlugs, getBlogPosts, getProfile } from '@/lib/content';
import { bindSeparatorDash, bindSoloLetters } from '@/lib/markdown';

type RouteParams = { slug: string };

/**
 * Static export needs every dynamic route enumerated at build time.
 * We include ALL slugs (even drafts) so Next.js can generate the static file.
 * Draft slugs resolve to notFound() at render time via getBlogPosts() filter.
 */
export function generateStaticParams(): RouteParams[] {
  return getAllBlogPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPosts().find((p) => p.id === slug);
  if (!post) return { title: 'Post not found' };
  const profile = getProfile();
  return {
    title: `${post.title} — ${profile.name}`,
    description: post.summary,
    openGraph: {
      type: 'article',
      title: `${post.title} — ${profile.name}`,
      description: post.summary,
      publishedTime: post.publishedDate,
      images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — ${profile.name}`,
      description: post.summary,
    },
  };
}

/**
 * /blog/[slug] — individual blog post page.
 *
 * Server Component. Static at build time via generateStaticParams.
 * Layout: post header (title, date, reading time, tags) → prose body → back link.
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = getBlogPosts().find((p) => p.id === slug);
  if (!post) notFound();

  const renderedContent = renderMarkdownProse(post.content, 'blog');

  return (
    <>
      {/* Post header */}
      <section className="px-gutter pt-24 lg:pt-32 pb-24 world-surface">
        <div className="max-w-content mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-24">
            <ol className="inline-flex items-center gap-2 font-mono text-meta tracking-label uppercase text-text-meta">
              <li>
                <Link href="/blog/" className="link-draw inline-block text-text-meta">
                  Notes
                </Link>
              </li>
              <li aria-hidden="true" className="text-stone">{'/'}</li>
              <li aria-current="page" className="text-near-black truncate max-w-[240px]">
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
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
          <SettleHeading
            className="font-serif font-light text-display ember max-w-3xl mb-16 text-balance"
          >
            {bindSeparatorDash(bindSoloLetters(post.title))}
          </SettleHeading>

          {/* Summary */}
          <p className="font-sans font-light text-step-1 text-charcoal max-w-measure-wide text-pretty mb-16">
            {post.summary}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <TagPill>{tag}</TagPill>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Prose body */}
      <section
        className={cn(
          'px-gutter',
          'py-32 lg:py-50',
          'world-surface-alt',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          {/* Each block self-reveals in reading order (carve on H2s, depth on
              prose) via the shared renderMarkdownProse — Notes inherits the
              case-study choreography (Z7/CO-6). No outer scene Reveal; the
              .reveal floors in globals.css carry the RM / no-JS rest state. */}
          <article
            aria-label={post.title}
            className="max-w-measure-wide flex flex-col gap-8"
          >
            {renderedContent}
          </article>
        </div>
      </section>

      {/* Back link — SP-3 unified closer grammar: hairline border-t + ~72px
          (py-18). world-surface alternates off the -alt prose above. */}
      <section className="px-gutter py-18 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto">
          <Link
            href="/blog/"
            className="group inline-flex items-center gap-2 font-mono text-label tracking-label uppercase text-near-black hover:text-accent-text transition-colors duration-fast ease-out"
          >
            <span aria-hidden="true" className="inline-block transition-transform duration-base ease-gh-glide group-hover:-translate-x-1">{'←'}</span>
            All posts
          </Link>
        </div>
      </section>
    </>
  );
}
