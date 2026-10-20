/**
 * Flagstone first proof (2026-10-19) — the capture-fitted hero exhibit.
 *
 * A mobile audit measured the real Explore screenshot at ~156px wide inside the
 * 329px figure at 393: the shared 9/19 phone frame took 90% of a 4/5 well's
 * height, which left the phone at 53% of the column and letterboxed its 19.5:9
 * capture by 3–6px top and bottom. The candidate branch sizes the Flagstone
 * hero frame by width (72% / 53% / 58% of the well below sm / from sm / from
 * lg), fits its screen to the capture's declared pixel size, reserves the well
 * height that frame needs (5/8 · 4/5 · 3/4), and seats the museum plate as the
 * figure's <figcaption>. This file pins the data, the page-level scoping and,
 * when a build exists, the shipped HTML — Flagstone gets the exhibit, every
 * other case study keeps the shared hero.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getDeliverables } from '@/lib/content';

const ROOT = process.cwd();
const OUT = join(ROOT, 'out');

/** Pixel size from a WebP container header: VP8 (lossy), VP8L (lossless) or
 *  VP8X (extended canvas). Enough to keep deliverables.json honest about the
 *  capture it describes without pulling an image library into the tests. */
function webpSize(buf: Buffer): { width: number; height: number } {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('not a WebP container');
  }
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') {
    // payload @20: 3-byte frame tag, 3-byte start code (9d 01 2a), 14-bit width, 14-bit height
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21); // after the 0x2f signature byte
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
  }
  throw new Error(`unsupported WebP chunk ${chunk}`);
}

describe('Flagstone first proof — data and page scoping', () => {
  const flagstone = getDeliverables().find((d) => d.id === 'flagstone');

  it("declares the hero capture's real pixel size, so the device screen holds its exact aspect", () => {
    expect(flagstone?.heroShot?.width).toBe(1290);
    expect(flagstone?.heroShot?.height).toBe(2803);
    // The declaration must match the file it describes: a refreshed capture
    // that changes size without updating these two numbers fails here, not on
    // the live page as a letterboxed or cropped screen.
    const file = readFileSync(join(ROOT, 'public', flagstone!.heroShot!.src!));
    expect(webpSize(file)).toEqual({ width: 1290, height: 2803 });
  });

  it('no other deliverable declares a size it does not need (the exhibit is Flagstone-only today)', () => {
    for (const d of getDeliverables()) {
      if (d.id === 'flagstone') continue;
      expect(d.heroShot?.width, `${d.id}.heroShot.width`).toBeUndefined();
    }
  });

  it('the page sizes the exhibit for Flagstone only and seats the plate as the figure caption', () => {
    const src = readFileSync(resolve(ROOT, 'app/work/[slug]/page.tsx'), 'utf8');
    expect(src).toContain("const stoneExhibit = d.id === 'flagstone';");
    expect(src).toContain("stoneExhibit ? 'aspect-[5/8] sm:aspect-[4/5] lg:aspect-[3/4]' : 'aspect-[4/5]'");
    expect(src).toContain("frameWidth={stoneExhibit ? 'w-[72%] sm:w-[53%] lg:w-[58%]' : undefined}");
    expect(src).toContain('<figure className="order-2 lg:order-none m-0 flex flex-col gap-7 lg:gap-12">');
    expect(src).toContain('as="figcaption"');
    // The well keeps its grid-item order only when it IS the grid item; inside
    // the figure, flex `order` would otherwise seat it below its own caption.
    expect(src).toContain("!d.heroPlate && 'order-2 lg:order-none'");
    // UP-31's two-row machinery is retired with the figure and must not creep
    // back as live classes (the comments may still name it as history).
    expect(src).not.toContain("d.heroPlate && 'lg:grid-rows-[auto_1fr]'");
    expect(src).not.toContain("d.heroPlate && 'lg:row-start-1 lg:row-span-2'");
    expect(src).not.toMatch(/className=\{cn\([^)]*'lg:grid-rows-\[auto_1fr\]'/);
  });

  it('the stylesheet fits the screen to the capture under the scoped class only', () => {
    const css = readFileSync(join(ROOT, 'app/globals.css'), 'utf8');
    expect(css).toMatch(/\.pr-frame--fit-capture > \.pr-screen-phone \{[^}]*flex: 0 0 auto;[^}]*aspect-ratio: var\(--pr-screen-aspect, 9 \/ 19\.5\);/);
    // The shared screen rule still flexes for every other frame.
    expect(css).toMatch(/\.pr-screen \{[^}]*flex: 1 1 auto;/);
  });
});

describe.runIf(existsSync(OUT))('Flagstone first proof — built output', () => {
  const read = (slug: string) => readFileSync(join(OUT, 'work', slug, 'index.html'), 'utf8');

  it('/work/flagstone/ ships one capture-fitted frame inside a figure whose figcaption is the plate', () => {
    const html = read('flagstone');
    expect(html.match(/pr-frame--fit-capture/g)?.length).toBe(1);
    expect(html).toMatch(/--pr-screen-aspect:\s*1290 \/ 2803/);
    expect(html).toContain('w-[72%] sm:w-[53%] lg:w-[58%]');
    expect(html).toContain('aspect-[5/8] sm:aspect-[4/5] lg:aspect-[3/4]');
    const figure = html.indexOf('<figure');
    const well = html.indexOf('hero-settle-img');
    const caption = html.indexOf('<figcaption');
    expect(figure).toBeGreaterThan(-1);
    expect(figure).toBeLessThan(well);
    expect(caption).toBeGreaterThan(well);
    const captionHtml = html.slice(caption, html.indexOf('</figcaption>', caption));
    expect(captionHtml).toContain('SEVERITY 3 OF 5');
    expect(captionHtml).toContain('CURRENT EXPLORE SCREEN');
    // The real image, its alt and the eager/high-priority contract survive.
    expect(html).toMatch(/<img[^>]*src="\/showcase\/flagstone\/explore-current\.phone\.webp"[^>]*alt="Flagstone/);
  });

  it('every other case study keeps the shared well-fitted hero: no capture-fitted frame, no hero figure', () => {
    for (const d of getDeliverables()) {
      if (d.id === 'flagstone') continue;
      const html = read(d.id);
      expect(html, d.id).not.toContain('pr-frame--fit-capture');
      expect(html, d.id).not.toContain('--pr-screen-aspect');
      const well = html.indexOf('hero-settle-img');
      expect(well, `${d.id} has a hero well`).toBeGreaterThan(-1);
      const figure = html.indexOf('<figure');
      if (figure !== -1) expect(figure, `${d.id}: no figure before the hero well`).toBeGreaterThan(well);
    }
  });
});
