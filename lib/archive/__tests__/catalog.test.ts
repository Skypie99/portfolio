import { describe, expect, it } from 'vitest';

import { mediaPresent, shownArts, shownSups } from '@/lib/archive/catalog';
import type { Artwork, Supply } from '@/lib/archive/types';

const sup = (over: Partial<Supply>): Supply => ({
  id: 'x',
  name: '',
  brand: '',
  medium: '',
  hex: '#888888',
  notes: '',
  swatched: false,
  swatch_path: null,
  ...over,
});
const art = (over: Partial<Artwork>): Artwork => ({
  id: 'x',
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

describe('mediaPresent', () => {
  it('lists known mediums in MEDIA order, then customs alphabetically', () => {
    const items = [
      { medium: 'Ink' },
      { medium: 'Charcoal' },
      { medium: 'Zebra' },
      { medium: 'Ink' },
      { medium: 'Apple' },
    ];
    expect(mediaPresent(items)).toEqual(['Charcoal', 'Ink', 'Apple', 'Zebra']);
  });

  it('ignores empty mediums', () => {
    expect(mediaPresent([{ medium: '' }, { medium: 'Ink' }])).toEqual(['Ink']);
  });
});

describe('shownArts', () => {
  const a1 = art({ id: 'a1', sort_order: 20, medium: 'Ink', title: 'Beta' });
  const a2 = art({ id: 'a2', sort_order: 10, medium: 'Ink', title: 'Alpha' });
  const a3 = art({ id: 'a3', sort_order: 30, medium: 'Charcoal', title: 'Gamma Conté' });
  const all = [a1, a2, a3];

  it('sorts by sort_order regardless of input order', () => {
    expect(shownArts(all, 'All', '').map((a) => a.id)).toEqual(['a2', 'a1', 'a3']);
  });

  it('filters by medium', () => {
    expect(shownArts(all, 'Ink', '').map((a) => a.id)).toEqual(['a2', 'a1']);
  });

  it('applies diacritic-folded global search', () => {
    expect(shownArts(all, 'All', 'conte').map((a) => a.id)).toEqual(['a3']);
  });
});

describe('shownSups', () => {
  const s1 = sup({ id: 's1', medium: 'Charcoal', hex: '#000000' }); // V0
  const s2 = sup({ id: 's2', medium: 'Charcoal', hex: '#ffffff' }); // V100
  const s3 = sup({ id: 's3', medium: 'Ink', hex: '#808080' }); // V50
  const s4 = sup({ id: 's4', medium: 'Zebra', hex: '#111111' }); // custom
  const s5 = sup({ id: 's5', medium: 'Apple', hex: '#222222' }); // custom
  const all = [s1, s2, s3, s4, s5];

  it('orders known mediums first (MEDIA order, value desc), then customs alphabetically', () => {
    expect(shownSups(all, 'All', '').map((s) => s.id)).toEqual(['s2', 's1', 's3', 's5', 's4']);
  });

  it('filters by medium', () => {
    expect(shownSups(all, 'Charcoal', '').map((s) => s.id)).toEqual(['s2', 's1']);
  });
});
