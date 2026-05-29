'use client';

import { cn } from '@/lib/cn';

type FilterPillProps = {
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

/**
 * FilterPill — Interactive category filter with active/inactive states.
 *
 * Resting: transparent, stone border (1px), text-muted
 * Hover: blush bg, stone-strong border (1px), text dark
 * Active: terracotta 8% bg, terracotta border (2px bold), terracotta text, icon stroke 2px
 *
 * Smooth 280ms transitions with ease-out.
 * Respects prefers-reduced-motion.
 */
export function FilterPill({
  label,
  icon,
  isActive,
  onClick,
  disabled = false,
  className,
}: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
      className={cn(
        'pill-base inline-flex items-center gap-2 whitespace-nowrap',
        'rounded-pill font-mono text-meta tracking-label uppercase',
        'transition-all duration-280 ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta rounded-sm',
        // Resting state
        !isActive && !disabled && [
          'bg-transparent border border-[var(--pill-border-resting)] text-[var(--pill-text-resting)]',
          'hover:bg-[var(--pill-bg-hover)] hover:border-[var(--pill-border-hover)] hover:text-[var(--pill-text-hover)]',
        ],
        // Active state
        isActive && [
          'bg-[var(--pill-bg-active)] border-2 border-[var(--pill-border-active)] text-[var(--pill-text-active)]',
        ],
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            'inline-flex',
            isActive ? 'stroke-2' : 'stroke-[1.5]',
            'transition-all duration-280 ease-out',
          )}
        >
          {icon}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
}
