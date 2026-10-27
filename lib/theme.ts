/**
 * The site's two canvas colours, in the form browser chrome consumes.
 *
 * `theme-color` is a plain hex string; the stylesheet stores the same two
 * values as space-separated RGB triplets (`--rgb-canvas`) in globals.css.
 * Keep the three in lockstep: lib/__tests__/theme-assets.test.ts reads the
 * tokens out of the sheet and fails if these drift.
 *
 * Dark  #15191A = rgb(21 25 26)
 * Light #FAF8F1 = rgb(250 248 241)
 */
export const THEME_COLORS = {
  light: '#FAF8F1',
  dark: '#15191A',
} as const;

export type ResolvedThemeName = keyof typeof THEME_COLORS;
