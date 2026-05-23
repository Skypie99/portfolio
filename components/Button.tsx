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
  'h-14 px-6 ' +
  'rounded-pill ' +
  'font-mono text-label tracking-label uppercase ' +
  'text-near-black ' +
  'border ' +
  'transition-colors duration-base ease-out';

const widthClasses = (full: boolean) =>
  full ? 'w-full' : 'w-full md:w-auto';

const variants: Record<Variant, string> = {
  primary:
    'bg-cream border-border-interactive ' +
    'hover:bg-blush ' +
    'active:bg-peach-cream',
  ghost:
    'bg-transparent border-border-interactive ' +
    'hover:bg-warm-white hover:border-charcoal',
};

function Dot({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block w-2 h-2 rounded-full bg-terracotta',
        'transition-all duration-base ease-out',
        'group-hover:w-2.5 group-hover:h-2.5',
      )}
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
        <Dot visible={showDot} />
        <span>{children}</span>
      </a>
    );
  }

  const {
    variant: _v,
    fullWidth: _f,
    showDot: _s,
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
      <span>{children}</span>
    </button>
  );
});
