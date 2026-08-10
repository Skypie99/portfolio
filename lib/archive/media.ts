/**
 * media.ts — photo processing + palette extraction, ported from the prototype.
 *
 * The palette quantiser is the load-bearing bit: attaching a photo AUTO-
 * OVERWRITES the artwork's palette with what this reads, so it must stay
 * bit-identical to the prototype's `extractPalette`. It is split into a pure
 * `quantizePalette(pixels)` (unit-tested here) and a thin canvas wrapper.
 *
 * Deviation from the prototype (per Sky): the display image is rendered at
 * 1400px (prototype shipped 1100). Thumb stays 280px. Neither is ever upscaled.
 */

import { hexToRgb } from './color';

export type ProcessedImage = { thumb: string; display: string; palette: string[] | null };

const THUMB = { maxDim: 280, quality: 0.62 };
const DISPLAY = { maxDim: 1400, quality: 0.72 };

/** Lowercase `#rrggbb` from 0–255 channels (prototype uses toString(16)+padStart). */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Pure palette quantiser over raw RGBA bytes.
 * Samples every 4th pixel (`i += 16`), buckets by `round(channel/36)`, takes the
 * eight most-populous buckets, emits each bucket's mean colour, and greedily
 * drops any colour within Manhattan distance 70 of one already kept. At most 4
 * hexes; null when nothing could be read.
 */
export function quantizePalette(data: ArrayLike<number>): string[] | null {
  const buckets: Record<string, { r: number; g: number; b: number; n: number }> = {};
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${Math.round(r / 36)},${Math.round(g / 36)},${Math.round(b / 36)}`;
    if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, n: 0 };
    buckets[key].r += r;
    buckets[key].g += g;
    buckets[key].b += b;
    buckets[key].n++;
  }
  const sorted = Object.values(buckets)
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);
  const hexes: string[] = [];
  for (const bk of sorted) {
    const r = Math.round(bk.r / bk.n);
    const g = Math.round(bk.g / bk.n);
    const b = Math.round(bk.b / bk.n);
    const hx = rgbToHex(r, g, b);
    const close = hexes.some((e) => {
      const a = hexToRgb(e);
      return Math.abs(a.r - r) + Math.abs(a.g - g) + Math.abs(a.b - b) < 70;
    });
    if (!close) hexes.push(hx);
    if (hexes.length >= 4) break;
  }
  return hexes.length ? hexes : null;
}

/** Read a canvas' pixels and quantise them. Browser-only; null on any failure. */
export function extractPalette(canvas: HTMLCanvasElement): string[] | null {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return quantizePalette(data);
  } catch {
    return null;
  }
}

function renderScaled(
  img: HTMLImageElement,
  maxDim: number,
  quality: number,
  format = 'image/jpeg',
): { canvas: HTMLCanvasElement; dataUrl: string } {
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height)); // never upscale
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, dataUrl: canvas.toDataURL(format, quality) };
}

/**
 * Turn a picked File into a thumb + display JPEG (data URLs) and read the thumb's
 * palette. Resolves null if the file could not be decoded. Browser-only.
 */
export function processImage(file: File, opts: { png?: boolean } = {}): Promise<ProcessedImage | null> {
  // PNG keeps transparency (for cut-out object photos that float on the card);
  // JPEG (default) is smaller for opaque swatches/artwork and carries the palette.
  const format = opts.png ? 'image/png' : 'image/jpeg';
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const thumb = renderScaled(img, THUMB.maxDim, THUMB.quality, format);
        const display = renderScaled(img, DISPLAY.maxDim, DISPLAY.quality, format);
        resolve({ thumb: thumb.dataUrl, display: display.dataUrl, palette: opts.png ? null : extractPalette(thumb.canvas) });
      };
      img.onerror = () => resolve(null);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
