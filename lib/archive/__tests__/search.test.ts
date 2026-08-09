import { describe, expect, it } from 'vitest';

import {
  artworkHaystack,
  filterArtworks,
  filterSupplies,
  foldText,
  matchesQuery,
  supplyHaystack,
} from '@/lib/archive/search';
import type { Artwork, Supply } from '@/lib/archive/types';

const supply = (over: Partial<Supply>): Supply => ({
  id: 'sup-x',
  name: '',
  brand: '',
  medium: '',
  hex: '#888888',
  notes: '',
  swatched: false,
  swatch_path: null,
  ...over,
});

const artwork = (over: Partial<Artwork>): Artwork => ({
  id: 'art-x',
  sort_order: 0,
  title: '',
  medium: '',
  note: '',
  extras: '',
  palette: [],
  supplies: [],
  photo_path: null,
  ...over,
});

describe('foldText', () => {
  it('strips diacritics and lowercases', () => {
    expect(foldText('Conté')).toBe('conte');
    expect(foldText('Sépia')).toBe('sepia');
    expect(foldText('À — çà')).toBe('a — ca'); // punctuation kept, accents dropped
  });
});

describe('matchesQuery', () => {
  it('folds both sides so conte finds Conté', () => {
    expect(matchesQuery('Sanguine Conté à Paris', 'conte')).toBe(true);
    expect(matchesQuery('Sanguine Conté à Paris', 'CONTE')).toBe(true);
  });

  it('requires every whitespace token (logical AND)', () => {
    expect(matchesQuery('Sanguine Conté à Paris', 'conte paris')).toBe(true);
    expect(matchesQuery('Sanguine Conté à Paris', 'conte blue')).toBe(false);
  });

  it('matches everything on an empty or whitespace-only query', () => {
    expect(matchesQuery('anything at all', '')).toBe(true);
    expect(matchesQuery('anything at all', '   ')).toBe(true);
  });
});

describe('haystacks', () => {
  it('supply covers name/brand/notes/medium', () => {
    expect(supplyHaystack(supply({ name: 'Willow', brand: 'Gen', notes: 'airy', medium: 'Charcoal' }))).toBe(
      'Willow Gen airy Charcoal',
    );
  });
  it('artwork covers title/note/extras', () => {
    expect(artworkHaystack(artwork({ title: 'T', note: 'N', extras: 'E' }))).toBe('T N E');
  });
});

describe('filterSupplies', () => {
  const sepia = supply({ id: 'sup-sepia', name: 'Sépia', brand: 'Conté à Paris', medium: 'Conté' });
  const sanguine = supply({ id: 'sup-sang', name: 'Sanguine', brand: 'Conté à Paris', medium: 'Conté' });
  const willow = supply({ id: 'sup-willow', name: 'Willow Charcoal', medium: 'Charcoal', notes: 'lifts easily' });
  const list = [sepia, sanguine, willow];

  it('finds accented records via a plain-ascii query', () => {
    expect(filterSupplies(list, 'conte')).toEqual([sepia, sanguine]);
    expect(filterSupplies(list, 'sepia')).toEqual([sepia]);
  });

  it('searches medium and notes too', () => {
    expect(filterSupplies(list, 'charcoal')).toEqual([willow]);
    expect(filterSupplies(list, 'lifts')).toEqual([willow]);
  });

  it('returns the whole list for an empty query', () => {
    expect(filterSupplies(list, '')).toEqual(list);
  });
});

describe('filterArtworks', () => {
  const a1 = artwork({
    id: 'art-10',
    title: 'Foraged Purple Mountains',
    note: 'Blackberry, fire-pit charcoal',
    extras: 'lake clay',
  });
  const a2 = artwork({ id: 'art-20', title: 'Conté Nocturne on Black', note: 'rust, moss, violet' });
  const list = [a1, a2];

  it('matches across title, note, and extras', () => {
    expect(filterArtworks(list, 'conte')).toEqual([a2]);
    expect(filterArtworks(list, 'clay')).toEqual([a1]);
    expect(filterArtworks(list, 'charcoal')).toEqual([a1]);
    expect(filterArtworks(list, 'purple mountains')).toEqual([a1]);
  });
});
