import Link from 'next/link';

import { CardImage, type CardAccent } from '@/components/CardImage';
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

/** Per-project signature colour — mirrors ProjectCard's spread. */
const ACCENT: Record<CaseStudyCardProps['category'], CardAccent> = {
  'accessmap': 'terracotta',
  'claude-corp': 'lagoon',
  'prompt-library': 'gold',
  'pacman': 'emerald',
  'mutual': 'caramel',
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
        'rounded-lg overflow-hidden bg-warm-white border border-stone',
        'shadow-lg transition-all duration-base ease-out',
        'hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
        className,
      )}
      data-category={category}
    >
      {/* Framed product image — shared premium material (lit-well + scrim +
          parallax). Replaces the old flat terracotta tint over a raw <img>. */}
      <div style={{ height: 'var(--case-study-image-height, 240px)' }}>
        <CardImage src={imageUrl} alt={imageAlt} accent={ACCENT[category]} className="h-full" />
      </div>

      {/* Content */}
      <div
        className={cn(
          'p-6 flex flex-col gap-3',
          'border-t border-stone',
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
