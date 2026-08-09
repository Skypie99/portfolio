import { describe, expect, it } from 'vitest';

import { initialState, reducer } from '@/components/archive/ArchiveProvider';
import type { Artwork, Supply } from '@/lib/archive/types';

const sup = (id: string, over: Partial<Supply> = {}): Supply => ({
  id,
  name: id,
  brand: '',
  medium: 'Ink',
  hex: '#888888',
  notes: '',
  swatched: false,
  swatch_path: null,
  ...over,
});
const art = (id: string, supplies: string[] = [], over: Partial<Artwork> = {}): Artwork => ({
  id,
  sort_order: 0,
  title: id,
  medium: 'Ink',
  note: '',
  extras: '',
  palette: [],
  supplies,
  photo_path: null,
  ...over,
});

describe('archive reducer', () => {
  it('LOADED populates and marks ready', () => {
    const s = reducer(initialState, { type: 'LOADED', supplies: [sup('a')], arts: [art('x')] });
    expect(s.status).toBe('ready');
    expect(s.supplies).toHaveLength(1);
    expect(s.arts).toHaveLength(1);
  });

  it('UPSERT_SUPPLY adds, then replaces by id in place', () => {
    let s = reducer(initialState, { type: 'UPSERT_SUPPLY', supply: sup('a', { name: 'first' }) });
    expect(s.supplies).toHaveLength(1);
    s = reducer(s, { type: 'UPSERT_SUPPLY', supply: sup('a', { name: 'second' }) });
    expect(s.supplies).toHaveLength(1);
    expect(s.supplies[0].name).toBe('second');
  });

  it('REMOVE_SUPPLY drops the colour AND unlinks it from every artwork', () => {
    const base = reducer(initialState, {
      type: 'LOADED',
      supplies: [sup('a'), sup('b')],
      arts: [art('x', ['a', 'b']), art('y', ['b'])],
    });
    const s = reducer(base, { type: 'REMOVE_SUPPLY', id: 'a' });
    expect(s.supplies.map((x) => x.id)).toEqual(['b']);
    expect(s.arts.find((a) => a.id === 'x')?.supplies).toEqual(['b']);
    expect(s.arts.find((a) => a.id === 'y')?.supplies).toEqual(['b']);
  });

  it('UPSERT_ARTWORK adds/replaces and REMOVE_ARTWORK drops', () => {
    let s = reducer(initialState, { type: 'UPSERT_ARTWORK', artwork: art('x') });
    expect(s.arts).toHaveLength(1);
    s = reducer(s, { type: 'UPSERT_ARTWORK', artwork: art('x', [], { title: 'renamed' }) });
    expect(s.arts).toHaveLength(1);
    expect(s.arts[0].title).toBe('renamed');
    s = reducer(s, { type: 'REMOVE_ARTWORK', id: 'x' });
    expect(s.arts).toHaveLength(0);
  });

  it('tab / filter / query setters', () => {
    expect(reducer(initialState, { type: 'TAB', tab: 'vault' }).tab).toBe('vault');
    expect(reducer(initialState, { type: 'ART_FILTER', medium: 'Ink' }).artFilter).toBe('Ink');
    expect(reducer(initialState, { type: 'SUP_FILTER', medium: 'Charcoal' }).supFilter).toBe('Charcoal');
    expect(reducer(initialState, { type: 'QUERY', query: 'conte' }).query).toBe('conte');
  });

  it('ERROR carries a message and error status', () => {
    const s = reducer(initialState, { type: 'ERROR', error: 'boom' });
    expect(s.status).toBe('error');
    expect(s.error).toBe('boom');
  });
});
