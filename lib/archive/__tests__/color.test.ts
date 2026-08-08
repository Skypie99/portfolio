import { describe, expect, it } from 'vitest';

import { hexToRgb, hslOf, isChromatic, isLight, normalizeHex, valueOf } from '@/lib/archive/color';

describe('hexToRgb (verbatim prototype behaviour)', () => {
  it('parses a normal 6-digit hex', () => {
    expect(hexToRgb('#a8542f')).toEqual({ r: 168, g: 84, b: 47 });
  });

  it('expands a 3-digit hex the way the prototype does', () => {
    expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
  });

  it('uses the #888888 default for empty input (→ 136,136,136), not the NaN fallback', () => {
    expect(hexToRgb('')).toEqual({ r: 136, g: 136, b: 136 });
  });

  it('falls back to mid-grey (128) only when the hex is truly unparseable', () => {
    expect(hexToRgb('#zzzzzz')).toEqual({ r: 128, g: 128, b: 128 });
  });
});

describe('valueOf (Rec.601 luma → 0..100)', () => {
  it('matches the plan anchor: #242426 === 14', () => {
    expect(valueOf('#242426')).toBe(14);
  });

  it('hits the extremes', () => {
    expect(valueOf('#000000')).toBe(0);
    expect(valueOf('#ffffff')).toBe(100);
  });

  it('mid-grey #888888 rounds to 53', () => {
    expect(valueOf('#888888')).toBe(53);
  });
});

describe('hslOf', () => {
  it('reports zero saturation and hue for a pure grey', () => {
    const { h, s } = hslOf('#808080');
    expect(h).toBe(0);
    expect(s).toBe(0);
  });

  it('keeps hue in [0,360) — sanguine sits in the warm reds', () => {
    const { h } = hslOf('#a8542f');
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThan(360);
    expect(h).toBeGreaterThan(10);
    expect(h).toBeLessThan(30);
  });
});

describe('isChromatic (threshold s ≥ 16, inclusive)', () => {
  it('treats a pure grey as neutral', () => {
    expect(isChromatic('#888888')).toBe(false);
  });

  it('treats a saturated pigment as chromatic', () => {
    expect(isChromatic('#a8542f')).toBe(true);
  });

  it('straddles the 16-saturation boundary correctly', () => {
    // #6b946b computes to s ≈ 16.08% → chromatic (>= 16 is inclusive).
    expect(hslOf('#6b946b').s).toBeGreaterThanOrEqual(16);
    expect(isChromatic('#6b946b')).toBe(true);
    // #6e916e computes to s ≈ 13.7% → neutral.
    expect(hslOf('#6e916e').s).toBeLessThan(16);
    expect(isChromatic('#6e916e')).toBe(false);
  });

  it('agrees with the raw hslOf threshold for a spread of pigments', () => {
    for (const hex of ['#a8542f', '#1b1b1d', '#f3f0e7', '#3a6ab8', '#a8a49a', '#c7a84f']) {
      expect(isChromatic(hex)).toBe(hslOf(hex).s >= 16);
    }
  });
});

describe('isLight (value > 55)', () => {
  it('is true for white, false for black', () => {
    expect(isLight('#ffffff')).toBe(true);
    expect(isLight('#000000')).toBe(false);
  });

  it('straddles the 55 boundary', () => {
    expect(valueOf('#909090')).toBe(56); // > 55
    expect(isLight('#909090')).toBe(true);
    expect(valueOf('#8a8a8a')).toBe(54); // <= 55
    expect(isLight('#8a8a8a')).toBe(false);
  });
});

describe('normalizeHex (DB-safe, strict ^#[0-9a-f]{6}$)', () => {
  it('passes an already-valid lowercase hex through unchanged', () => {
    expect(normalizeHex('#a8542f')).toBe('#a8542f');
  });

  it('lowercases and adds a missing hash', () => {
    expect(normalizeHex('A8542F')).toBe('#a8542f');
    expect(normalizeHex('  #FFFFFF ')).toBe('#ffffff');
  });

  it('expands a 3-digit hex', () => {
    expect(normalizeHex('#888')).toBe('#888888');
    expect(normalizeHex('#ABC')).toBe('#aabbcc');
  });

  it('falls back to #888888 for anything invalid', () => {
    expect(normalizeHex('#zzz')).toBe('#888888');
    expect(normalizeHex('not a hex')).toBe('#888888');
    expect(normalizeHex('#12345')).toBe('#888888');
    expect(normalizeHex(null)).toBe('#888888');
    expect(normalizeHex(undefined)).toBe('#888888');
  });
});
