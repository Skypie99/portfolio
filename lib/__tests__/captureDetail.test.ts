/**
 * captureDetail.test.ts — the flagship room's detail plate (Creative Release
 * 7 candidate, 2026-10-22).
 *
 * Guards the truth rules lib/captureDetail.ts states: a detail is a crop of
 * the shipped capture file and nothing else; a spec is measured on ONE file
 * and turns itself off the moment the hero stops being that file; the crop
 * holds its whole subject; and the subject is really there, read back from
 * the file's own pixels (so a re-capture saved under the same name and size
 * fails here instead of shipping a crop of the wrong region).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { CAPTURE_DETAILS, type CaptureDetail, captureDetailFor, cropGeometry } from '@/lib/captureDetail';
import { getDeliverables } from '@/lib/content';
import type { Deliverable } from '@/lib/schema';

const ROOT = process.cwd();
const byId = (id: string) => getDeliverables().find((d) => d.id === id)!;

const webpSize = (buf: Buffer): [number, number] => {
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
  }
  if (chunk === 'VP8X') return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  throw new Error(`unsupported WebP chunk ${chunk}`);
};

describe('CAPTURE_DETAILS — every spec is measured on a real, shipped file', () => {
  for (const [id, spec] of Object.entries(CAPTURE_DETAILS)) {
    it(`${id}: names the deliverable's own hero capture at its own pixel size`, () => {
      const d = byId(id);
      expect(d, `${id} is a deliverable`).toBeDefined();
      expect(spec.src).toBe(d.heroShot?.src);
      expect([spec.width, spec.height]).toEqual([d.heroShot?.width, d.heroShot?.height]);
      expect(webpSize(readFileSync(join(ROOT, 'public', spec.src)))).toEqual([spec.width, spec.height]);
      // The room serves the capture's AVIF and WebP siblings first; the plate
      // must be able to request the same URLs.
      for (const p of [d.heroShot?.avif, d.heroShot?.webp]) {
        expect(p && existsSync(join(ROOT, 'public', p)), `${id}: ${p}`).toBe(true);
      }
    });

    it(`${id}: the crop sits inside the capture and holds its whole subject with a margin`, () => {
      const { box, subject, width, height } = spec;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.w).toBeLessThanOrEqual(width);
      expect(box.y + box.h).toBeLessThanOrEqual(height);
      expect(subject.x).toBeGreaterThan(box.x);
      expect(subject.y).toBeGreaterThan(box.y);
      expect(subject.x + subject.w).toBeLessThan(box.x + box.w);
      expect(subject.y + subject.h).toBeLessThan(box.y + box.h);
    });
  }

  it('flagstone: the subject is the expanded report card, read from the file itself', async () => {
    const spec = CAPTURE_DETAILS.flagstone;
    const { data, info } = await sharp(join(ROOT, 'public', spec.src))
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const px = (x: number, y: number) => {
      const i = (y * info.width + x) * info.channels;
      return [data[i], data[i + 1], data[i + 2]];
    };
    const { x, y, w, h } = spec.subject;
    const midY = Math.round(y + h / 2);
    // The card's orange severity stripe runs down its left edge…
    for (const yy of [y + 120, midY, y + h - 120]) {
      const [r, g, b] = px(x + 6, yy);
      expect(r, `stripe red at y ${yy}`).toBeGreaterThan(200);
      expect(g, `stripe green at y ${yy}`).toBeGreaterThan(90);
      expect(g).toBeLessThan(170);
      expect(b, `stripe blue at y ${yy}`).toBeLessThan(100);
    }
    // …its face is white just inside the stripe and at the right edge…
    for (const [xx, yy] of [[x + 24, y + 16], [x + w - 8, midY]]) {
      expect(Math.min(...px(xx, yy)), `card face at ${xx},${yy}`).toBeGreaterThan(245);
    }
    // …and the map, not the card, lies just outside it on both sides.
    for (const xx of [x - 12, x + w + 12]) {
      expect(Math.min(...px(xx, midY)), `map outside the card at x ${xx}`).toBeLessThan(200);
    }
  });
});

describe('captureDetailFor — renders only while the hero is still the measured file', () => {
  const flagstone = byId('flagstone');
  const shot = flagstone.heroShot!;
  const variant = (patch: Partial<Deliverable>): Deliverable => ({ ...flagstone, ...patch });

  it('returns the spec for the shipped Flagstone hero', () => {
    expect(captureDetailFor(flagstone)).toBe(CAPTURE_DETAILS.flagstone);
  });

  it('returns null for a deliverable without a spec', () => {
    for (const d of getDeliverables().filter((x) => !(x.id in CAPTURE_DETAILS))) {
      expect(captureDetailFor(d), d.id).toBeNull();
    }
  });

  it('turns off when the capture changes file or size, or the slot changes kind', () => {
    expect(captureDetailFor(variant({ heroShot: { ...shot, src: '/showcase/flagstone/tasks.light.phone.webp' } }))).toBeNull();
    expect(captureDetailFor(variant({ heroShot: { ...shot, width: 1179 } }))).toBeNull();
    expect(captureDetailFor(variant({ heroShot: { ...shot, height: undefined } }))).toBeNull();
    expect(captureDetailFor(variant({ heroShot: undefined }))).toBeNull();
    expect(
      captureDetailFor(variant({ heroShot: { ...shot, dark: { src: '/showcase/flagstone/tasks.dark.phone.webp' } } })),
    ).toBeNull();
    expect(captureDetailFor(variant({ heroShot: { ...shot, matte: 'light-mono' } }))).toBeNull();
    expect(
      captureDetailFor(
        variant({
          heroShot: {
            ...shot,
            video: { poster: '/showcase/flagstone/clips/report-flow-current.dark.phone-poster.avif', alt: 'A clip in the slot.' },
          },
        }),
      ),
    ).toBeNull();
    const art = '/images/deliverables/flagstone/concept.webp';
    expect(
      captureDetailFor(
        variant({
          heroArtwork: {
            src: art,
            avif: art.replace('.webp', '.avif'),
            webp: art,
            alt: 'Owner artwork in the slot.',
            label: 'Concept diagram',
            dark: { src: art, avif: art.replace('.webp', '.avif'), webp: art },
          },
        }),
      ),
    ).toBeNull();
  });
});

describe('cropGeometry — the whole capture placed so the box shows exactly the crop', () => {
  it('scales the capture to box-widths and shifts it by the box origin', () => {
    const spec: CaptureDetail = CAPTURE_DETAILS.flagstone;
    const g = cropGeometry(spec);
    expect(g.scale * spec.box.w).toBeCloseTo(spec.width, 9);
    expect(g.x * spec.box.w).toBeCloseTo(spec.box.x, 9);
    expect(g.y * spec.box.h).toBeCloseTo(spec.box.y, 9);
    expect(g.aspect).toBe(`${spec.box.w} / ${spec.box.h}`);
  });
});
