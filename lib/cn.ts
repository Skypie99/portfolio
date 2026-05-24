import clsx, { type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Custom text colors from tailwind.config.ts. Listed here so
 * tailwind-merge knows `text-umber` is a color, not a font-size,
 * and doesn't collapse it against `text-meta` (which IS a font-size).
 *
 * Cycle 11 (Gary): TagPill test surfaced a silent bug where
 * cn('bg-sand text-umber font-mono text-meta ...') dropped
 * text-umber because twMerge thought both text-* belonged to the
 * same group. Extending the config here fixes it across every
 * component that uses cn().
 *
 * Keep in sync with tailwind.config.ts theme.extend.colors keys.
 */
const CUSTOM_COLOR_TOKENS = [
  // Foundations
  'cream', 'warm-white', 'blush', 'peach-cream',
  // Terracotta scale
  'sand', 'amber', 'terracotta', 'umber', 'bark',
  // Neutrals
  'stone', 'stone-strong', 'pebble', 'sage', 'sage-text', 'charcoal', 'near-black',
  // Semantic (note: 'text-meta' here is the color alias #5C5D54;
  // `text-meta` as a font-size lives in CUSTOM_FONT_SIZES below)
  'text-meta', 'border-decorative', 'border-interactive',
  'accent-primary', 'accent-text', 'link', 'link-hover',
];

/**
 * Custom font-size tokens from tailwind.config.ts fontSize block.
 * Listed so twMerge knows `text-meta` (font-size) lives in the
 * `font-size` group, not `text-color` — that's the actual collapse
 * culprit Cycle 11 surfaced.
 */
const CUSTOM_FONT_SIZES = [
  'display-l', 'display-m', 'display-s',
  'body', 'body-sm', 'label', 'meta',
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'text-color': [{ text: CUSTOM_COLOR_TOKENS }],
      'font-size':  [{ text: CUSTOM_FONT_SIZES }],
      'bg-color':   [{ bg:   CUSTOM_COLOR_TOKENS }],
      'border-color': [{ border: CUSTOM_COLOR_TOKENS }],
    },
  },
});

/**
 * cn() — compose Tailwind class strings safely.
 * `clsx` handles conditionals; `tailwind-merge` (with custom-color
 * extensions above) deduplicates conflicting utilities like p-4/p-6
 * without collapsing custom colors against font-sizes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
