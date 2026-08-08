/**
 * search.ts — instant, diacritic-folded global search.
 *
 * Folding normalises away accents so `conte` matches `Conté`, `sepia` matches
 * `Sépia`, and so on. A query is split into whitespace tokens; every token must
 * appear (as a substring) in the record's searchable text (logical AND). An
 * empty query matches everything.
 *
 * Supplies are searched over name/brand/notes/medium; artworks over
 * title/note/extras.
 */

import type { Artwork, Supply } from './types';

/** Lowercase + strip combining diacritics (NFD → drop \p{Diacritic}). */
export function foldText(s: string): string {
  return (s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function queryTokens(query: string): string[] {
  return foldText(query).split(/\s+/).filter(Boolean);
}

/** True when every token in `query` is a substring of `haystack` (both folded). */
export function matchesQuery(haystack: string, query: string): boolean {
  const hay = foldText(haystack);
  return queryTokens(query).every((t) => hay.includes(t));
}

export function supplyHaystack(s: Pick<Supply, 'name' | 'brand' | 'notes' | 'medium'>): string {
  return `${s.name} ${s.brand} ${s.notes} ${s.medium}`;
}

export function artworkHaystack(a: Pick<Artwork, 'title' | 'note' | 'extras'>): string {
  return `${a.title} ${a.note} ${a.extras}`;
}

export function filterSupplies(list: readonly Supply[], query: string): Supply[] {
  return list.filter((s) => matchesQuery(supplyHaystack(s), query));
}

export function filterArtworks(list: readonly Artwork[], query: string): Artwork[] {
  return list.filter((a) => matchesQuery(artworkHaystack(a), query));
}
