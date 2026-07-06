import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidElement } from 'react';

import { CaseStudyCard } from '@/components/CaseStudyCard';
import { SettleHeading } from '@/components/HeroSettle';
import { renderMarkdownProse } from '@/components/MarkdownProse';
import { Reveal } from '@/components/Reveal';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { getAllBlogPostSlugs, getBlogPosts, getDeliverables, getProfile } from '@/lib/content';
import { bindSeparatorDash, bindSoloLetters } from '@/lib/markdown';
import { cardMedia } from '@/lib/media';
import type { BlogPost } from '@/lib/schema';

type RouteParams = { slug: string };

type CaseStudyCategory = 'accessmap' | 'claude-corp' | 'dashboard' | 'prompt-library' | 'ghost' | 'mutual';

/** id → CaseStudyCard category (mirrors app/work/[slug]/page.tsx). */
function toCategory(id: string): CaseStudyCategory {
  const map: Record<string, CaseStudyCategory> = {
    'accessmap': 'accessmap',
    'claude-corp': 'claude-corp',
    'dashboard': 'dashboard',
    'prompt-library': 'prompt-library',
    'ghost-code': 'ghost',
    'mutual-mesh': 'mutual',
  };
  return map[id] ?? 'accessmap';
}

/**
 * ProseFigure (L3-06 / S12) — one product figure in the essay, in a reserved-aspect
 * well so it costs zero CLS, shipped through the site's AVIF/WebP <picture> +
 * inline-LQIP grammar (mirrors ProductReveal's StaticShot). Page-level, not coupled
 * into the shared renderer — the page splices it in at the figure's `afterHeading`.
 */
function ProseFigure({ figure }: { figure: NonNullable<BlogPost['figure']> }) {
  const ratio = figure.width && figure.height ? `${figure.width} / ${figure.height}` : '1315 / 713';
  return (
    <figure className="my-2 flex flex-col gap-3">
      <div
        className="relative overflow-hidden rounded-md border border-border-decorative"
        style={{ aspectRatio: ratio }}
      >
        {figure.lqip && (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${figure.lqip}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
        <picture>
          {figure.avif && <source type="image/avif" srcSet={figure.avif} />}
          {figure.webp && <source type="image/webp" srcSet={figure.webp} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={figure.src}
            alt={figure.alt}
            width={figure.width}
            height={figure.height}
            loading="lazy"
            decoding="async"
            className="relative h-full w-full object-cover"
          />
        </picture>
      </div>
      {figure.caption && (
        <figcaption className="font-mono text-meta tracking-label uppercase text-text-meta">
          {figure.caption}
        </figcaption>
      )}
    </figure>
  );
}

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
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: post.title }],
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

  // S12: splice the product figure in at its seam (the block after the matching
  // `## <heading>` id) without coupling the shared renderer — the figure is a
  // page-level element. Falls back to the end of the prose if the heading moves.
  const content = [...renderedContent];
  if (post.figure) {
    const fig = <ProseFigure key="blog-figure" figure={post.figure} />;
    const seam = post.figure.afterHeading
      ? content.findIndex(
          (el) => isValidElement(el) && (el.props as { id?: string }).id === post.figure!.afterHeading,
        )
      : -1;
    if (seam >= 0) content.splice(seam + 1, 0, fig);
    else content.push(fig);
  }

  // S12: the post hands off to its case study at the close instead of dead-ending.
  const related = post.relatedDeliverable
    ? getDeliverables().find((d) => d.id === post.relatedDeliverable)
    : undefined;

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
              <li aria-current="page" className="text-near-black truncate max-w-[240px] lg:max-w-[420px] xl:max-w-[560px]">
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
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

          {/* Title — L5-05: at md the sidebar (hidden md:flex) narrows the
              column, but --fs-display's 5vw term reads the full viewport and
              skyscrapers the title. Step the tier down to step-5 across the md
              band; the full display size returns at lg where the column is wide.
              Call-site only — the shared --fs-display token (10 titles) is untouched. */}
          <SettleHeading
            className="font-serif font-light text-display md:text-step-5 lg:text-display ember max-w-3xl mb-16 text-balance"
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
            {content}
          </article>
        </div>
      </section>

      {/* Closer — S12: the essay hands off to its case study (the site's own
          "Continue reading." grammar) instead of dead-ending; the "All posts"
          return stays beneath. world-surface alternates off the -alt prose. */}
      <section className="px-gutter py-24 lg:py-32 world-surface border-t border-border-decorative">
        <div className="max-w-content mx-auto">
          {related && (
            <Reveal variant="scene" className="mb-16">
              <p className="font-mono text-label tracking-label uppercase text-accent-ink mb-4 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                Keep reading
              </p>
              <h2 className="font-serif font-light text-step-4 text-near-black max-w-2xl leading-tight mb-12">
                Continue reading.
              </h2>
              {/* One deliberate handoff — a single-column max-width so it reads as
                  one card, not a 2-col grid with a missing pair (avoids L3-08). */}
              <ul className="max-w-xl">
                <li>
                  <CaseStudyCard
                    title={related.title}
                    category={toCategory(related.id)}
                    description={related.summary}
                    href={`/work/${related.id}/`}
                    media={cardMedia(related)}
                    links={related.links}
                  />
                </li>
              </ul>
            </Reveal>
          )}
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
