import Link from 'next/link';

interface ProjectDoorwayButtonProps {
  href: string;
  /** Omit to let the visible "View project" text stand as the accessible name. */
  'aria-label'?: string;
  /**
   * -1 when this doorway shares its destination with an adjacent, already-
   * focusable link (e.g. a row's own title link) so keyboard users get one
   * stop per destination, not two. Omit for a doorway that is the sole or
   * first stop to its destination.
   */
  tabIndex?: number;
}

/**
 * The one homepage "View project" doorway — the shared 44px outlined pill.
 * Used by every homepage work-index row AND the Flagstone flagship room
 * (Portfolio 3.0 Phase 02, F-014 / GATE-FLAGSTONE-CTA-PARITY): no caller may
 * override size, padding, radius, border, shadow, dot, icon, transition,
 * theme or breakpoint — there is deliberately no `className` prop. Only
 * `href`, `aria-label` and `tabIndex` are allowed to vary per instance.
 */
export function ProjectDoorwayButton({
  href,
  'aria-label': ariaLabel,
  tabIndex,
}: ProjectDoorwayButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      className="group inline-flex h-11 w-fit items-center gap-2 rounded-pill border border-border-interactive bg-canvas px-4 font-mono text-label tracking-label uppercase text-ink shadow-soft transition-[background-color,border-color,box-shadow,transform] duration-base ease-out hover:-translate-y-px hover:border-ink-muted hover:bg-blush hover:shadow-soft focus-visible:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-terracotta transition-[width,height] duration-base ease-out group-hover:h-2 group-hover:w-2"
      />
      View project
      <span aria-hidden="true">{'→'}</span>
    </Link>
  );
}
