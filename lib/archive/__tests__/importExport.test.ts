import { describe, expect, it } from 'vitest';

import {
  buildExportV2,
  DATA_URL_RE,
  isValidDataUrl,
  MAX_DATA_URL_BYTES,
  normalizeBackup,
  parseBackup,
  serializeExport,
} from '@/lib/archive/importExport';
import type { ArchiveData } from '@/lib/archive/types';

const IMG = 'data:image/jpeg;base64,QUJD'; // valid, tiny
const PNG = 'data:image/png;base64,QUJD';

describe('isValidDataUrl', () => {
  it('accepts jpeg/png/webp base64 data URLs', () => {
    expect(isValidDataUrl(IMG)).toBe(true);
    expect(isValidDataUrl(PNG)).toBe(true);
    expect(isValidDataUrl('data:image/webp;base64,QUJD')).toBe(true);
  });

  it('rejects other schemes, formats, and junk', () => {
    expect(isValidDataUrl('data:image/gif;base64,QUJD')).toBe(false); // gif not allowed
    expect(isValidDataUrl('data:text/html;base64,QUJD')).toBe(false);
    expect(isValidDataUrl('javascript:alert(1)')).toBe(false);
    expect(isValidDataUrl('https://example.com/x.jpg')).toBe(false);
    expect(isValidDataUrl(null)).toBe(false);
    expect(isValidDataUrl(42)).toBe(false);
  });

  it('rejects anything over the size cap', () => {
    const huge = `data:image/jpeg;base64,${'A'.repeat(MAX_DATA_URL_BYTES)}`;
    expect(huge.length).toBeGreaterThan(MAX_DATA_URL_BYTES);
    expect(DATA_URL_RE.test(huge)).toBe(true); // charset is fine…
    expect(isValidDataUrl(huge)).toBe(false); // …but length is not
  });
});

describe('normalizeBackup — bad input', () => {
  it('rejects non-objects and unrecognised shapes with a friendly error', () => {
    expect(() => normalizeBackup(null)).toThrow(/Studio Archive backup/);
    expect(() => normalizeBackup(42)).toThrow(/Studio Archive backup/);
    expect(() => normalizeBackup({ nope: true })).toThrow(/expected a Studio Archive export/);
  });

  it('parseBackup rejects non-JSON text', () => {
    expect(() => parseBackup('{not json')).toThrow(/exact exported text/);
  });
});

describe('v2 import', () => {
  it('maps a clean v2 backup with no warnings', () => {
    const result = normalizeBackup({
      format: 'studio-archive-v2',
      exported_at: '2026-08-08T00:00:00Z',
      supplies: [{ id: 'sup-a', name: 'Sanguine', brand: 'Conté', medium: 'Conté', hex: '#a8542f', notes: '', swatched: true }],
      artworks: [
        {
          id: 'art-10',
          sort_order: 10,
          title: 'Study',
          medium: 'Ink',
          note: 'first',
          extras: 'tape',
          palette: ['#55555a', '#8a8a88'],
          supplies: ['sup-a'],
          photo_path: null,
        },
      ],
      photos: { 'art-10': { thumb: IMG, display: IMG } },
    });
    expect(result.warnings).toEqual([]);
    expect(result.data.supplies[0].swatched).toBe(true);
    expect(result.data.arts[0].sort_order).toBe(10);
    expect(result.data.arts[0].supplies).toEqual(['sup-a']);
    expect(result.photos).toEqual({ 'art-10': { thumb: IMG, display: IMG } });
  });

  it('rescues an unreadable hex to #888888 with a warning', () => {
    const result = normalizeBackup({
      format: 'studio-archive-v2',
      supplies: [{ id: 'sup-bad', name: 'Mystery', hex: '#ZZZ', medium: 'Ink' }],
      artworks: [],
    });
    expect(result.data.supplies[0].hex).toBe('#888888');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/Mystery/);
  });

  it('drops an invalid photo but keeps the valid sibling, with a warning', () => {
    const result = normalizeBackup({
      format: 'studio-archive-v2',
      supplies: [],
      artworks: [{ id: 'art-10', sort_order: 10, title: 'X', medium: 'Ink' }],
      photos: { 'art-10': { thumb: 'javascript:alert(1)', display: IMG } },
    });
    expect(result.photos).toEqual({ 'art-10': { display: IMG } });
    expect(result.warnings.some((w) => /unreadable thumbnail/.test(w))).toBe(true);
  });

  it('trims an over-long palette to 8 with a warning', () => {
    const palette = Array.from({ length: 10 }, (_, i) => `#${i}${i}${i}${i}${i}${i}`);
    const result = normalizeBackup({
      format: 'studio-archive-v2',
      supplies: [],
      artworks: [{ id: 'art-10', sort_order: 10, title: 'X', medium: 'Ink', palette }],
    });
    expect(result.data.arts[0].palette).toHaveLength(8);
    expect(result.warnings.some((w) => /trimmed to 8/.test(w))).toBe(true);
  });
});

describe('legacy import (the prototype format)', () => {
  it('maps order → sort_order, thumb → thumb, fulls → display, and defaults extras', () => {
    const result = normalizeBackup({
      supplies: [{ id: 'sup-a', name: 'Sepia', medium: 'Conté', hex: '#6d4b33' }],
      arts: [
        {
          id: 'art-20',
          order: 20,
          title: 'Beach Tree',
          medium: 'Graphite',
          note: 'plein air',
          palette: ['#5c5c60'],
          supplies: [],
          thumb: IMG,
          hasFull: true,
        },
      ],
      fulls: { 'art-20': PNG },
    });
    expect(result.warnings).toEqual([]);
    expect(result.data.arts[0].sort_order).toBe(20);
    expect(result.data.arts[0].extras).toBe(''); // legacy has no extras
    expect(result.data.arts[0].photo_path).toBeNull();
    expect(result.photos).toEqual({ 'art-20': { thumb: IMG, display: PNG } });
  });

  it('closes the prototype XSS hole: a hostile data URL in a legacy backup is dropped', () => {
    const result = normalizeBackup({
      supplies: [],
      arts: [{ id: 'art-1', order: 10, title: 'Evil', medium: 'Ink', thumb: 'data:text/html;base64,PHNjcmlwdD4=' }],
    });
    expect(result.photos).toEqual({}); // nothing kept
    expect(result.warnings.some((w) => /unreadable thumbnail/.test(w))).toBe(true);
  });
});

describe('export → import round-trip', () => {
  it('is loss-free for data + photos', () => {
    const data: ArchiveData = {
      supplies: [
        { id: 'sup-a', name: 'Sanguine', brand: 'Conté', medium: 'Conté', hex: '#a8542f', notes: 'warm', swatched: true },
      ],
      arts: [
        {
          id: 'art-10',
          sort_order: 10,
          title: 'Study',
          medium: 'Ink',
          note: 'first',
          extras: 'tape',
          palette: ['#55555a', '#8a8a88'],
          supplies: ['sup-a'],
          photo_path: null,
        },
      ],
    };
    const photos = { 'art-10': { thumb: IMG, display: IMG } };

    const round = parseBackup(serializeExport(buildExportV2(data, photos, '2026-08-08T12:00:00Z')));
    expect(round.data).toEqual(data);
    expect(round.photos).toEqual(photos);
    expect(round.warnings).toEqual([]);
  });
});
