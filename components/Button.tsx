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

const base =
  // group lets the dot react to the parent's hover/focus
  'group inline-flex items-center justify-center gap-3 ' +
  'h-14 px-7 ' +
  'rounded-pill ' +
  'font-mono text-label tracking-label uppercase ' +
  'text-near-black ' +
  'border ' +
  'transition-[background-color,border-color,box-shadow,transform] duration-base ease-out ' +
  'hover:shadow-soft hover:-translate-y-px ' +
  'active:translate-y-0 ' +
  // Alex BLK-3 ratified pick A: disabled state uses charcoal + 50% opacity
  // (~4.3:1 contrast — meets WCAG normal-text minimum) instead of pebble
  // which would have failed contrast. Applies to native <button disabled>.
  'disabled:text-ink-muted disabled:opacity-50 ' +
  'disabled:cursor-not-allowed disabled:hover:bg-canvas disabled:hover:shadow-none disabled:hover:translate-y-0';

const widthClasses = (full: boolean) =>
  full ? 'w-full' : 'w-full md:w-auto';

const variants: Record<Variant, string> = {
  primary:
    'bg-canvas border-border-interactive ' +
    'hover:bg-blush hover:border-ink-muted ' +
    'active:bg-peach-cream',
  ghost:
    'bg-transparent border-border-interactive ' +
    'hover:bg-canvas-alt hover:border-ink-muted ' +
    // disabled ghost stays transparent (override the base's disabled:hover:bg-canvas)
    'disabled:hover:bg-transparent disabled:hover:border-border-interactive',
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
        // Enumerated, not transition-all: the dot only ever animates its size on
        // group-hover and its fill on theme flip. (Button's own element already
        // enumerates — see `base` above.)
        'transition-[width,height,background-color] duration-base ease-out',
        'group-hover:w-2.5 group-hover:h-2.5',
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
