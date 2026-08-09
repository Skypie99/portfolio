import { describe, expect, it } from 'vitest';

import { quantizePalette, rgbToHex } from '@/lib/archive/media';

/**
 * Build an RGBA byte array whose *sampled* pixels (the quantiser reads every 4th
 * pixel, i += 16 bytes) are exactly `samples`, in order. Each sample is followed
 * by three filler pixels the sampler skips.
 */
function pixelsToRgba(samples: Array<[number, number, number]>): number[] {
  const out: number[] = [];
  for (const [r, g, b] of samples) {
    out.push(r, g, b, 255); // read by the sampler
    out.push(0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255); // three skipped fillers
  }
  return out;
}

describe('rgbToHex', () => {
  it('emits lowercase, zero-padded hex', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    expect(rgbToHex(168, 84, 47)).toBe('#a8542f');
  });
});

describe('quantizePalette', () => {
  const RED: [number, number, number] = [210, 20, 20]; // #d21414
  const GREEN: [number, number, number] = [20, 210, 20]; // #14d214
  const BLUE: [number, number, number] = [20, 20, 210]; // #1414d2

  it('orders colours by population and emits bucket-mean hexes', () => {
    const data = pixelsToRgba([RED, RED, RED, BLUE, BLUE, GREEN]);
    expect(quantizePalette(data)).toEqual(['#d21414', '#1414d2', '#14d214']);
  });

  it('drops a colour within Manhattan distance 70 of one already kept', () => {
    // #c81414 kept; #a01414 (dist 40) dropped; #1414c8 kept.
    const KEEP: [number, number, number] = [200, 20, 20]; // #c81414
    const NEAR: [number, number, number] = [160, 20, 20]; // dist 40 → dropped
    const FAR: [number, number, number] = [20, 20, 200]; // #1414c8
    const data = pixelsToRgba([KEEP, KEEP, KEEP, FAR, FAR, NEAR]);
    const out = quantizePalette(data);
    expect(out).toEqual(['#c81414', '#1414c8']);
    expect(out).toHaveLength(2);
  });

  it('caps the palette at four colours', () => {
    const YELLOW: [number, number, number] = [210, 210, 20]; // #d2d214
    const MAGENTA: [number, number, number] = [210, 20, 210]; // #d214d2 — should be cut
    const data = pixelsToRgba([
      RED, RED, RED, RED, RED,
      GREEN, GREEN, GREEN, GREEN,
      BLUE, BLUE, BLUE,
      YELLOW, YELLOW,
      MAGENTA,
    ]);
    expect(quantizePalette(data)).toEqual(['#d21414', '#14d214', '#1414d2', '#d2d214']);
  });

  it('returns a single hex for a uniform image (never null when a pixel exists)', () => {
    expect(quantizePalette(pixelsToRgba([[171, 205, 239]]))).toEqual(['#abcdef']);
  });

  it('returns null when there are no pixels to read', () => {
    expect(quantizePalette([])).toBeNull();
  });
});
