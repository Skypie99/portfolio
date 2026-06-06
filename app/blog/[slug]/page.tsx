import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SettleHeading } from '@/components/HeroSettle';
import { Reveal } from '@/components/Reveal';
import { TagPill } from '@/components/TagPill';
import { cn } from '@/lib/cn';
import { getAllBlogPostSlugs, getBlogPosts, getProfile } from '@/lib/content';
import { INLINE_CODE_CLASS, smartPunctuation } from '@/lib/markdown';

type RouteParams = { slug: string };

/**
 * Static export needs every dynamic route enumerated at build time.
 * We include ALL slugs (even drafts) so Next.js can generate the static file.
 * Draft slugs resolve to notFound() at render time via getBlogPosts() filter.
 */
export function generateStaticParams(): RouteParams[] {
  return getAllBlogPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: RouteParams }): Metadata {
  const post = getBlogPosts().find((p) => p.id === params.slug);
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
 * renderMarkdown — lightweight markdown-to-JSX renderer for blog post content.
 *
 * Handles: ## headings (h2, h3), **bold**, *italic*, blank-line paragraphs.
 * No dependency on react-markdown or remark — keeps the bundle clean and the
 * content model predictable. If posts need tables, code blocks, or lists,
 * extend this renderer or migrate to react-markdown at that point.
 */
function renderMarkdown(markdown: string): React.ReactNode[] {
  const blocks = markdown.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  let firstPara = true;

  return blocks.map((block, blockIdx) => {
    const key = `block-${blockIdx}`;

    // h3 — ### heading
    if (block.startsWith('### ')) {
      return (
        <h3
          key={key}
          className="font-serif font-light text-[clamp(1.25rem,2.5vw,1.75rem)] text-near-black leading-[1.15] mt-10 mb-4"
          style={{ letterSpacing: '-0.01em' }}
        >
          {block.slice(4)}
        </h3>
      );
    }

    // h2 — ## heading
    if (block.startsWith('## ')) {
      return (
        <h2
          key={key}
          className="font-serif font-light text-[clamp(1.5rem,3vw,2.25rem)] text-near-black leading-[1.1] mt-14 mb-5 first:mt-0"
          style={{ letterSpacing: '-0.01em' }}
        >
          {block.slice(3)}
        </h2>
      );
    }

    // Paragraph — inline parsing + oldstyle figures; drop cap on the first.
    const dropCap = firstPara;
    firstPara = false;
    return (
      <p
        key={key}
        className={`font-sans font-light text-prose text-charcoal leading-[1.75] text-pretty nums-oldstyle${dropCap ? ' drop-cap' : ''}`}
      >
        {parseInline(block)}
      </p>
    );
  });
}

/**
 * parseInline — handles **bold** and *italic* within paragraph text.
 */
function parseInline(text: string): React.ReactNode[] {
  // Split on **bold**, *italic*, and `code`, preserving delimiters. Smart
  // punctuation applies to prose + emphasis, never inside `code`.
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-near-black">{smartPunctuation(part.slice(2, -2))}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className={INLINE_CODE_CLASS}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{smartPunctuation(part.slice(1, -1))}</em>;
    }
    return smartPunctuation(part);
  });
}

/**
 * /blog/[slug] — individual blog post page.
 *
 * Server Component. Static at build time via generateStaticParams.
 * Layout: post header (title, date, reading time, tags) → prose body → back link.
 */
export default function BlogPostPage({ params }: { params: RouteParams }) {
  const post = getBlogPosts().find((p) => p.id === params.slug);
  if (!post) notFound();

  const renderedContent = renderMarkdown(post.content);

  return (
    <>
      {/* Post header */}
      <section className="px-gutter pt-24 lg:pt-32 pb-12 world-surface">
        <div className="max-w-content mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-12">
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
          <div className="flex flex-wrap items-center gap-4 mb-8">
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
            className="font-serif font-light text-display ember leading-[1.05] max-w-3xl mb-10 text-balance"
          >
            {post.title}
          </SettleHeading>

          {/* Summary */}
          <p className="font-sans font-light text-prose text-charcoal leading-[1.65] max-w-measure-wide text-pretty mb-10">
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
          'py-16 lg:py-20',
          'world-surface-alt',
          'border-t border-border-decorative',
        )}
      >
        <div className="max-w-content mx-auto">
          <Reveal variant="scene">
            <article
              aria-label={post.title}
              className="max-w-measure-wide flex flex-col gap-6"
            >
              {renderedContent}
            </article>
          </Reveal>
        </div>
      </section>

      {/* Back link */}
      <section className="px-gutter py-16 world-surface border-t border-border-decorative">
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
