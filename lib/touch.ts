/**
 * Touch targets (P1) — one class string for the 44px coarse-pointer standard.
 *
 * The pointer query is the point: these links keep their exact desktop resting
 * layout (inline text, no box) and only grow a 44px minimum hit area where the
 * primary input is a finger. `min-h-11` is 2.75rem = 44px, the same number
 * Footer.tsx and HamburgerNav already use.
 *
 * Inline-flex is part of the string because min-height does not apply to a
 * non-replaced inline box — a bare `link-draw` anchor would silently ignore it.
 */
export const TOUCH_TARGET_COARSE =
  '[@media(pointer:coarse)]:inline-flex [@media(pointer:coarse)]:items-center [@media(pointer:coarse)]:min-h-11';

/** For controls that are already inline-flex: only the height is missing. */
export const TOUCH_HEIGHT_COARSE = '[@media(pointer:coarse)]:min-h-11';
