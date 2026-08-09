/**
 * catalog.ts — the medium vocabulary + the derived lists the tabs render.
 *
 * MEDIA is the prototype's known-14, in its exact order. The upgrade over the
 * prototype (per Sky): mediums are free text, so `mediaPresent` keeps CUSTOM
 * mediums visible (appended after the known ones, alphabetically) and the vault
 * sort places customs after the known 14. Global search (diacritic-folded) is
 * folded into both derived lists.
 */

import { valueOf } from './color';
import { filterArtworks, filterSupplies } from './search';
import type { Artwork, Supply } from './types';

export const MEDIA = [
  'Charcoal',
  'Conté',
  'Chalk',
  'Graphite',
  'Ink',
  'Watercolour',
  'Gouache',
  'Oil pastel',
  'Pastel crayon',
  'Pencil crayon',
  'Marker',
  'Mixed media',
  'Collage',
  'Foraged',
] as const;

const MEDIA_LIST: readonly string[] = MEDIA;

/** Mediums actually present: known-14 (in MEDIA order) then customs (alphabetical). */
export function mediaPresent(items: ReadonlyArray<{ medium: string }>): string[] {
  const present = new Set(items.map((i) => i.medium).filter(Boolean));
  const known = MEDIA.filter((m) => present.has(m));
  const customs = [...present].filter((m) => !MEDIA_LIST.includes(m)).sort((a, b) => a.localeCompare(b));
  return [...known, ...customs];
}

/** Artworks for the gallery: medium filter + global search, always by sort_order. */
export function shownArts(arts: readonly Artwork[], filter: string, query: string): Artwork[] {
  let list = filter === 'All' ? arts.slice() : arts.filter((a) => a.medium === filter);
  if (query.trim()) list = filterArtworks(list, query);
  return list.slice().sort((a, b) => a.sort_order - b.sort_order);
}

function mediumRank(m: string): number {
  const i = MEDIA_LIST.indexOf(m);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

/** Supplies for the vault: medium filter + search; sort = known-14 order then
 *  value descending; customs come after, alphabetical by medium then value desc. */
export function shownSups(supplies: readonly Supply[], filter: string, query: string): Supply[] {
  let list = filter === 'All' ? supplies.slice() : supplies.filter((s) => s.medium === filter);
  if (query.trim()) list = filterSupplies(list, query);
  return list.slice().sort((a, b) => {
    const ra = mediumRank(a.medium);
    const rb = mediumRank(b.medium);
    if (ra !== rb) return ra - rb;
    if (ra === Number.MAX_SAFE_INTEGER && a.medium !== b.medium) return a.medium.localeCompare(b.medium);
    return valueOf(b.hex) - valueOf(a.hex);
  });
}
