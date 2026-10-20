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
 *
 * Interaction states (signature-interaction refinement, 2026-10-19 — the same
 * press language as Button.tsx, where the full rationale lives):
 *   REST       canvas fill · line-strong hairline · soft shadow · 6px dot.
 *   HOVER      fine pointers only (`[@media(hover:hover)]`): ink-muted hairline,
 *              blush fill, dot 8px. Gated so a tap never leaves the pill hovered.
 *   FOCUS      the 2px terracotta ring (already explicit here) + dot 8px.
 *   PRESSED    terracotta hairline + 10% terracotta tint, dot contracts to 4px
 *              and embers; half-fast in, base out; no movement (P4 already
 *              removed the lift — the pill holds still under the finger).
 *   CANCELLED  :active drops on pointer-leave / scroll; CSS settles it home.
 * The W4-05 list-side rules (globals.css `#work ol > li:has(…)`) still size
 * this dot from the ROW's own links; the pill's press keeps its `!` so it wins
 * over them and over its own hover, exactly as P4 shipped it.
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
      className="group inline-flex h-11 w-fit items-center gap-2 rounded-pill border border-border-interactive bg-canvas px-4 font-mono text-label tracking-label uppercase text-ink shadow-soft [-webkit-tap-highlight-color:transparent] transition-[background-color,border-color,box-shadow] duration-base ease-out [@media(hover:hover)]:hover:border-ink-muted [@media(hover:hover)]:hover:bg-blush [@media(hover:hover)]:hover:shadow-soft active:!border-accent-primary active:!bg-accent/10 active:duration-[calc(var(--dur-fast)/2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-terracotta transition-[width,height,background-color] duration-base ease-out [@media(hover:hover)]:group-hover:h-2 [@media(hover:hover)]:group-hover:w-2 group-focus-visible:h-2 group-focus-visible:w-2 group-active:!h-1 group-active:!w-1 group-active:!bg-accent-hover group-active:duration-[calc(var(--dur-fast)/2)]"
      />
      View project
      <span aria-hidden="true">{'→'}</span>
    </Link>
  );
}
