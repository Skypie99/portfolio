/**
 * color.ts — the Studio Archive's colour maths.
 *
 * Ported VERBATIM from the single-file prototype (studio_archive.html):
 * `hexToRgb`, `valueOf`, `hslOf` are byte-for-byte the same computation the
 * prototype ships, so palettes, V-numbers and the chromatic/neutral split stay
 * bit-identical to what Sky already sees. Do not "improve" the maths — the
 * archive is a record of artistic development and these numbers must not drift.
 *
 * `normalizeHex` is the one addition: the Postgres CHECK constraint on stored
 * hexes is strict (`^#[0-9a-f]{6}$`), so every hex written to the DB passes
 * through here first (invalid → the prototype's `#888888` fallback).
 */

export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

/** Prototype line 283 — lenient on purpose (3-digit expansion, `#888888` on NaN). */
export function hexToRgb(hex: string): RGB {
  const h = (hex || '#888888').replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(f, 16);
  if (Number.isNaN(n)) return { r: 128, g: 128, b: 128 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Prototype line 284 — perceptual value 0–100 off raw sRGB (Rec.601 luma). */
export function valueOf(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return Math.round(((0.299 * r + 0.587 * g + 0.114 * b) / 255) * 100);
}

/** Prototype line 285 — textbook RGB→HSL, s & l returned as 0–100. */
export function hslOf(hex: string): HSL {
  let { r, g, b } = hexToRgb(hex);
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h, s: s * 100, l: l * 100 };
}

/** Prototype range-map rule: a colour is chromatic iff saturation ≥ 16 (inclusive). */
export function isChromatic(hex: string): boolean {
  return hslOf(hex).s >= 16;
}

/** Prototype vault rule: pick a light foreground when value > 55. */
export function isLight(hex: string): boolean {
  return valueOf(hex) > 55;
}

const HEX6 = /^#[0-9a-f]{6}$/;

/**
 * Resolve input to a strict 6-digit lowercase hex, or null if it cannot be.
 * Lowercases, adds a missing hash, expands 3-digit. Returning null (rather than
 * a fallback) lets importers tell a real colour from a rescued one and warn.
 */
export function parseHex(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  let h = input.trim().toLowerCase();
  if (!h.startsWith('#')) h = `#${h}`;
  const body = h.slice(1);
  if (/^[0-9a-f]{3}$/.test(body)) {
    h = `#${body
      .split('')
      .map((c) => c + c)
      .join('')}`;
  }
  return HEX6.test(h) ? h : null;
}

/**
 * DB-safe normalisation: like {@link parseHex} but anything unreadable becomes
 * the prototype's `#888888` fallback — matching the migration's strict
 * `^#[0-9a-f]{6}$` CHECK constraint so every stored hex is valid.
 */
export function normalizeHex(input: unknown): string {
  return parseHex(input) ?? '#888888';
}
