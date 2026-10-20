import { forwardRef } from 'react';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost';

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
  /** Renders the terracotta signature dot before the label. Default true. */
  showDot?: boolean;
  /**
   * Optional CSS color for the signature dot's BACKGROUND (e.g. a per-project
   * `--pr-sig` hue like `rgb(224 150 90)`). Recolors ONLY the dot — the pill's
   * terracotta focus ring, border and hover are untouched (we never redefine
   * --rgb-accent). Omit to keep the default terracotta dot.
   */
  dotColor?: string;
  className?: string;
};

type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type Props = AnchorProps | ButtonProps;

/**
 * Interaction states — the one press language, shared with
 * ProjectDoorwayButton and the HamburgerNav controls (signature-interaction
 * refinement, 2026-10-19; concept M-CON-002 A r2):
 *
 *   REST       canvas fill · line-strong hairline · 8px terracotta dot.
 *   HOVER      fine pointers ONLY — every hover utility is wrapped in
 *              `[@media(hover:hover)]`. iOS and Android apply :hover on a tap and
 *              KEEP it, so an ungated hover left a tapped pill sitting lifted,
 *              blushed and enlarged after the finger lifted, after a mailto /
 *              new-tab round trip, and on Back. Gated, a touch pill goes
 *              rest → pressed → rest and nothing sticks.
 *   FOCUS      the global 2px terracotta ring (globals.css `*:focus-visible`,
 *              untouched) + the dot grows exactly as it does on hover, so the
 *              keyboard receives the same invitation the pointer does.
 *   PRESSED    the deliberate border response — the hairline turns terracotta
 *              (colour only; 1px stays 1px, nothing shifts) — over a restrained
 *              10% terracotta tint; the 1px hover lift settles to 0 (the
 *              Button's documented press weight, DECISIONS §D4 — kept
 *              non-important so MagneticButton's inline pull is never
 *              snatched mid-press); the dot
 *              contracts to 6px and embers (accent-hover). Press-in rides HALF
 *              of --dur-fast — the rung the glass press already uses
 *              (globals.css "Glass with mass") — so the answer is immediate;
 *              release settles home on duration-base / ease-out, because the
 *              transition that runs is the one the DESTINATION state declares.
 *              The colour press utilities carry `!`: Tailwind emits
 *              arbitrary-media variants after `active:`, and a press must
 *              beat the hover it is happening inside of. (The doorway dot's
 *              press used the same `!` for the same reason — P4, 2026-09-22.)
 *   CANCELLED  pure CSS — :active drops the moment the pointer leaves or a
 *              scroll begins, and the release transition settles it home. No
 *              listeners, no JS, works with scripting off.
 *   REDUCED    the global reduce floor snaps every duration to 0.01ms: the
 *   MOTION     press is still answered (border, tint, dot), without motion.
 *
 * The native tap highlight is made transparent: the designed press replaces the
 * grey flash rather than stacking under it.
 */
const base =
  // group lets the dot react to the parent's hover / focus / press
  'group inline-flex items-center justify-center gap-3 ' +
  'h-14 px-7 ' +
  'rounded-pill ' +
  'font-mono text-label tracking-label uppercase ' +
  'text-ink ' +
  'border ' +
  '[-webkit-tap-highlight-color:transparent] ' +
  'transition-[background-color,border-color,box-shadow,transform] duration-base ease-out ' +
  '[@media(hover:hover)]:hover:shadow-soft [@media(hover:hover)]:hover:-translate-y-px ' +
  // The settle lives INSIDE the hover gate (only a lifted pill has anything to
  // settle) and carries no `!`: inside one media block `active` already
  // outranks `hover`, and an important transform would snatch the inline
  // magnetic translate MagneticButton owns — a press must never move its target.
  '[@media(hover:hover)]:active:translate-y-0 ' +
  'active:!border-accent-primary active:!bg-accent/10 ' +
  'active:duration-[calc(var(--dur-fast)/2)] ' +
  // Alex BLK-3 ratified pick A: disabled state uses charcoal + 50% opacity
  // (~4.3:1 contrast — meets WCAG normal-text minimum) instead of pebble
  // which would have failed contrast. Applies to native <button disabled>.
  // The hover withdrawals ride the same hover gate as the hovers they cancel,
  // so they keep outranking them in Tailwind's variant order.
  'disabled:text-ink-muted disabled:opacity-50 ' +
  'disabled:cursor-not-allowed ' +
  '[@media(hover:hover)]:disabled:hover:bg-canvas ' +
  '[@media(hover:hover)]:disabled:hover:shadow-none ' +
  '[@media(hover:hover)]:disabled:hover:translate-y-0';

const widthClasses = (full: boolean) =>
  full ? 'w-full' : 'w-full md:w-auto';

const variants: Record<Variant, string> = {
  primary:
    'bg-canvas border-border-interactive ' +
    '[@media(hover:hover)]:hover:bg-blush [@media(hover:hover)]:hover:border-ink-muted',
  ghost:
    'bg-transparent border-border-interactive ' +
    '[@media(hover:hover)]:hover:bg-canvas-alt [@media(hover:hover)]:hover:border-ink-muted ' +
    // disabled ghost stays transparent (override the base's disabled hover fill)
    '[@media(hover:hover)]:disabled:hover:bg-transparent ' +
    '[@media(hover:hover)]:disabled:hover:border-border-interactive',
};

function Dot({ visible, color }: { visible: boolean; color?: string }) {
  if (!visible) return null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block w-2 h-2 rounded-full',
        // Default terracotta unless a per-project hue is threaded in (FT-14) —
        // background only; the accent ring/border stay terracotta.
        !color && 'bg-terracotta',
        // Enumerated, not transition-all: the dot only ever animates its size
        // and its fill. (Button's own element already enumerates — see `base`.)
        'transition-[width,height,background-color] duration-base ease-out',
        // The invitation: grows for a hovering fine pointer and for keyboard
        // focus alike.
        '[@media(hover:hover)]:group-hover:w-2.5 [@media(hover:hover)]:group-hover:h-2.5',
        'group-focus-visible:w-2.5 group-focus-visible:h-2.5',
        // The press: contracts (pressed in) on the half-fast rung, settles back
        // on base. `!` so the press beats a simultaneous hover / focus growth.
        'group-active:!w-1.5 group-active:!h-1.5 group-active:duration-[calc(var(--dur-fast)/2)]',
        // …and deepens to accent-hover. A per-project hue is an inline style,
        // which already outranks any class, so the deepening belongs to the
        // default dot alone; the contraction answers either way.
        !color && 'group-active:!bg-accent-hover',
      )}
      style={color ? { background: color } : undefined}
    />
  );
}

/**
 * Button — primary or ghost. Renders <a> when `href` is provided, else <button>.
 *
 * Always carries the terracotta signature dot unless `showDot={false}`.
 * The dot is graphical-only (aria-hidden) — the label is the accessible name.
 */
export const Button = forwardRef<HTMLElement, Props>(function Button(props, ref) {
  const {
    children,
    variant = 'primary',
    fullWidth = false,
    showDot = true,
    dotColor,
    className,
  } = props;

  const classes = cn(base, widthClasses(fullWidth), variants[variant], className);

  if ('href' in props && props.href !== undefined) {
    const { href, ...rest } = props as AnchorProps;
    // Strip our custom props before forwarding to the DOM.
    const {
      variant: _v,
      fullWidth: _f,
      showDot: _s,
      dotColor: _d,
      className: _c,
      children: _ch,
      ...anchorAttrs
    } = rest;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...anchorAttrs}
      >
        <Dot visible={showDot} color={dotColor} />
        <span className="text-center text-balance">{children}</span>
      </a>
    );
  }

  const {
    variant: _v,
    fullWidth: _f,
    showDot: _s,
    dotColor: _d,
    className: _c,
    children: _ch,
    ...buttonAttrs
  } = props as ButtonProps;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      {...buttonAttrs}
    >
      <Dot visible={showDot} />
      <span className="text-center text-balance">{children}</span>
    </button>
  );
});
