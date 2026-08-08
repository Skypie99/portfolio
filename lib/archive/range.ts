/**
 * range.ts — the "range map" tab's maths, ported verbatim from the prototype.
 *
 * Three read-outs over the supply set:
 *  - the biggest value gap (where the collection is missing a tone),
 *  - the chromatic-vs-neutral hue split,
 *  - a per-medium tally in first-encountered order.
 *
 * The callout strings carry exact glyphs (en-dash U+2013, middle dot U+00B7,
 * multiplication sign U+00D7) that must match the prototype byte-for-byte.
 */

import { isChromatic, valueOf } from './color';

export type ValueGap = { a: number; b: number; size: number };
export type MediumCount = { medium: string; count: number };

/** The fixed value axis ticks the map draws. */
export const VALUE_TICKS = [0, 25, 50, 75, 100] as const;

/**
 * Largest gap in value coverage. Unique sorted values with 0/100 sentinels; the
 * widest strictly-greater interval wins, so ties resolve to the FIRST (darkest)
 * gap — exactly the prototype's `if (s > gap.size)` behaviour.
 */
export function valueGap(items: ReadonlyArray<{ hex: string }>): ValueGap {
  const vals = [...new Set(items.map((i) => valueOf(i.hex)))].sort((a, b) => a - b);
  const pts = [0, ...vals, 100];
  let gap: ValueGap = { a: 0, b: 0, size: -1 };
  for (let i = 0; i < pts.length - 1; i++) {
    const size = pts[i + 1] - pts[i];
    if (size > gap.size) gap = { a: pts[i], b: pts[i + 1], size };
  }
  return gap;
}

export function biggestHoleLabel(gap: ValueGap): string {
  return `biggest hole: V${gap.a} – V${gap.b} · hunt a colour near V${Math.round((gap.a + gap.b) / 2)}`;
}

export function chromaticCount(items: ReadonlyArray<{ hex: string }>): number {
  return items.filter((i) => isChromatic(i.hex)).length;
}

export function hueSpreadLabel(items: ReadonlyArray<{ hex: string }>): string {
  const chrom = chromaticCount(items);
  const neut = items.length - chrom;
  return `${chrom} chromatic colours on the wheel · ${neut} neutrals live off it`;
}

/** Per-medium counts in first-encountered order (Object key insertion order). */
export function mediumCounts(items: ReadonlyArray<{ medium: string }>): MediumCount[] {
  const byM: Record<string, number> = {};
  for (const i of items) byM[i.medium] = (byM[i.medium] ?? 0) + 1;
  return Object.keys(byM).map((medium) => ({ medium, count: byM[medium] }));
}

export function mediumPillLabel(mc: MediumCount): string {
  return `${mc.medium} × ${mc.count}`;
}
