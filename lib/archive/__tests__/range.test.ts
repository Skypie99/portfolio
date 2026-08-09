import { describe, expect, it } from 'vitest';

import {
  biggestHoleLabel,
  chromaticCount,
  hueSpreadLabel,
  mediumCounts,
  mediumPillLabel,
  valueGap,
} from '@/lib/archive/range';

// Grayscale fixtures with known valueOf() so gaps are predictable and neutral:
//   #1a1a1a→10  #333333→20  #808080→50  #e5e5e5→90  #000000→0  #ffffff→100
const V = {
  v0: '#000000',
  v10: '#1a1a1a',
  v20: '#333333',
  v50: '#808080',
  v90: '#e5e5e5',
  v100: '#ffffff',
};

describe('valueGap', () => {
  it('finds the single widest interior gap', () => {
    expect(valueGap([{ hex: V.v10 }, { hex: V.v20 }, { hex: V.v90 }])).toEqual({
      a: 20,
      b: 90,
      size: 70,
    });
  });

  it('resolves ties to the first (darkest) gap — strict >', () => {
    // values 0/50/100 → intervals 0→50 and 50→100 both size 50; first wins.
    expect(valueGap([{ hex: V.v0 }, { hex: V.v50 }, { hex: V.v100 }])).toEqual({
      a: 0,
      b: 50,
      size: 50,
    });
  });

  it('uses the 0 sentinel when nothing is dark', () => {
    expect(valueGap([{ hex: V.v90 }])).toEqual({ a: 0, b: 90, size: 90 });
  });

  it('uses the 100 sentinel when nothing is light', () => {
    expect(valueGap([{ hex: V.v10 }])).toEqual({ a: 10, b: 100, size: 90 });
  });

  it('treats an empty collection as one big hole across the whole range', () => {
    expect(valueGap([])).toEqual({ a: 0, b: 100, size: 100 });
  });
});

describe('biggestHoleLabel', () => {
  it('renders the exact callout with en-dash and middle dot', () => {
    expect(biggestHoleLabel({ a: 20, b: 90, size: 70 })).toBe(
      'biggest hole: V20 – V90 · hunt a colour near V55',
    );
  });
});

describe('hue split', () => {
  const items = [{ hex: '#a8542f' }, { hex: '#000000' }, { hex: '#808080' }];

  it('counts chromatic pigments', () => {
    expect(chromaticCount(items)).toBe(1);
  });

  it('renders the exact hue-spread line', () => {
    expect(hueSpreadLabel(items)).toBe('1 chromatic colours on the wheel · 2 neutrals live off it');
  });
});

describe('mediumCounts', () => {
  it('tallies per medium in first-encountered order, preserving unicode', () => {
    const items = [
      { medium: 'Charcoal' },
      { medium: 'Ink' },
      { medium: 'Charcoal' },
      { medium: 'Conté' },
    ];
    expect(mediumCounts(items)).toEqual([
      { medium: 'Charcoal', count: 2 },
      { medium: 'Ink', count: 1 },
      { medium: 'Conté', count: 1 },
    ]);
  });

  it('renders a pill label with the × sign', () => {
    expect(mediumPillLabel({ medium: 'Conté', count: 3 })).toBe('Conté × 3');
  });
});
