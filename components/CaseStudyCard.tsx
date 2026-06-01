import Link from 'next/link';

import { cn } from '@/lib/cn';

type CaseStudyCardProps = {
  title: string;
  category: 'accessmap' | 'claude-corp' | 'prompt-library' | 'pacman' | 'mutual';
  imageUrl: string;
  imageAlt: string;
  description: string;
  href: string;
  className?: string;
};

/**
 * CaseStudyCard — Image-backed card with muted tint overlay.
 *
 * Image height: 240px
 * Overlay: terracotta 15% opacity (resting) → 25% on hover (via .case-study-overlay CSS selector)
 * Image hover: scale 1.02 over 520ms (duration-slow)
 * Category-specific tints applied via CSS variables
 *
 * Respects prefers-reduced-motion.
 */
export function CaseStudyCard({
  title,
  category,
  imageUrl,
  imageAlt,
  description,
  href,
  className,
}: CaseStudyCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'case-study-card group block',
        'rounded-lg overflow-hidden',
        'transition-all duration-fast ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
        className,
      )}
      data-category={category}
    >
      {/* Image wrapper with overlay */}
      <div
        className={cn(
          'relative overflow-hidden',
          'w-full transition-all duration-slow ease-out',
        )}
        style={{ height: 'var(--case-study-image-height, 240px)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={imageAlt}
          className={cn(
            'w-full h-full object-cover',
            'transition-all duration-slow ease-out',
            'group-hover:scale-[1.02]',
          )}
          loading="lazy"
        />
        {/* Category-specific tint overlay — hover state handled by .case-study-card:hover .case-study-overlay in tokens-phase2.css */}
        <div
          className={cn(
            'absolute inset-0 case-study-overlay',
            'transition-all duration-slow ease-out',
          )}
          style={{
            backgroundColor: 'var(--case-study-overlay)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div
        className={cn(
          'p-6 flex flex-col gap-3',
          'bg-warm-white border border-stone border-t-0 rounded-b-lg',
          'transition-colors duration-base ease-out',
          'group-hover:bg-blush',
        )}
      >
        <h3 className="font-serif text-lg font-normal text-near-black leading-tight">
          {title}
        </h3>
        <p className="font-sans text-sm text-charcoal leading-relaxed line-clamp-2">
          {description}
        </p>
        <span
          className={cn(
            'inline-flex w-fit',
            'font-mono text-meta tracking-label uppercase text-accent-text',
            'transition-transform duration-base ease-out',
            'group-hover:translate-x-1',
          )}
        >
          Read more <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
