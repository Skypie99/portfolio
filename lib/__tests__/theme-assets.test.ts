/**
 * Theme asset integrity (CC3) — the light/dark twin pairs defined in
 * lib/caseShowcase.ts must be real, correctly named, and actually oriented the
 * way their names claim.
 *
 * What this locks, and why each half earns its keep:
 *  1. NAME — every twin renders `${stem}.light.<ext>` beside
 *     `${stem}.dark.<ext>`. A renamed or mis-copied file (the failure mode a
 *     build cannot see, because it only requests the path it was told) shows up
 *     here as a missing file rather than a broken image on a case study.
 *  2. EXISTENCE — every src/avif/webp in both halves is a shipped, non-empty
 *     file under public/.
 *  3. ORIENTATION — measured, not assumed: the light file's mean luminance is
 *     higher than its dark twin's. This catches the one genuinely confusing
 *     bug — two files swapped at capture or encode time — which no filename
 *     check can detect.
 *  4. TOOLBAR TINT (CC1) — the hexes ThemeColorSync writes are the same two
 *     colours as the stylesheet's `--rgb-canvas` tokens, so a palette change
 *     can never silently leave browser chrome on the old paint.
 *
 * Sharp is already a devDependency (scripts/encode-proof.mjs uses it); no new
 * tooling was added for this test.
 */
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { CASE_SHOWCASE_IDS, caseShowcaseFor, type ShowcaseImage } from '@/lib/caseShowcase';
import { THEME_COLORS } from '@/lib/theme';

const PUBLIC = join(process.cwd(), 'public');
const CSS = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');

type FileVariant = { src?: string; avif?: string; webp?: string };

/** Every themed image the case-study showcases render. */
function themedImages(): ShowcaseImage[] {
  const out: ShowcaseImage[] = [];
  for (const id of CASE_SHOWCASE_IDS) {
    const spec = caseShowcaseFor(id);
    if (!spec) continue;
    if (spec.hero) out.push(spec.hero.desktop, spec.hero.phone);
    for (const exhibit of spec.exhibits) {
      if (exhibit.desktop) out.push(exhibit.desktop);
      if (exhibit.phone) out.push(exhibit.phone);
    }
  }
  return out.filter((img) => Boolean(img.dark));
}

function filesOf(variant: FileVariant): string[] {
  return [variant.src, variant.avif, variant.webp].filter((p): p is string => Boolean(p));
}

function publicPath(src: string): string {
  return join(PUBLIC, src.replace(/^\//, ''));
}

/** Rec. 709 relative luminance from a file's channel means. */
async function meanLuminance(src: string): Promise<number> {
  const stats = await sharp(publicPath(src)).stats();
  const [r, g, b] = stats.channels.map((c) => c.mean);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe('case-study light/dark asset pairs (CC3)', () => {
  it('finds the twin pairs (the walk is not vacuous)', () => {
    expect(themedImages().length).toBeGreaterThanOrEqual(4);
  });

  it('names both halves .light. and .dark. and keeps one stem', () => {
    for (const img of themedImages()) {
      const dark = img.dark;
      expect(dark, `${img.src} carries a dark twin`).toBeDefined();
      expect(img.src).toContain('.light.');
      expect(dark!.src).toBeDefined();
      expect(dark!.src).toContain('.dark.');
      expect(dark!.src).toBe(img.src.replace('.light.', '.dark.'));
      for (const ext of ['avif', 'webp'] as const) {
        if (!img[ext]) continue;
        expect(img[ext]).toContain('.light.');
        expect(dark![ext]).toBeDefined();
        expect(dark![ext]).toContain('.dark.');
        expect(dark![ext]).toBe((img[ext] as string).replace('.light.', '.dark.'));
      }
    }
  });

  it('ships every light and dark file, non-empty', () => {
    for (const img of themedImages()) {
      for (const variant of [img, img.dark as FileVariant]) {
        for (const src of filesOf(variant)) {
          const stat = statSync(publicPath(src));
          expect(stat.isFile(), src).toBe(true);
          expect(stat.size, src).toBeGreaterThan(0);
        }
      }
    }
  });

  it(
    'is oriented the way the names claim: light is brighter than dark',
    async () => {
      for (const img of themedImages()) {
        const light = await meanLuminance(img.src);
        const dark = await meanLuminance((img.dark as FileVariant).src as string);
        expect(light, `${img.src} should be lighter than ${(img.dark as FileVariant).src}`).toBeGreaterThan(
          dark,
        );
      }
    },
    // Sharp decodes ~10 full-size captures; under the full suite's parallel
    // load that is comfortably over the 5s default on this Intel host.
    60_000,
  );
});

describe('browser-chrome tint matches the real canvas tokens (CC1)', () => {
  const triplets = Array.from(CSS.matchAll(/--rgb-canvas:\s*(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})/g));
  const hex = (rgb: [number, number, number]) =>
    `#${rgb.map((n) => n.toString(16).padStart(2, '0')).join('')}`.toUpperCase();

  it('finds the light and dark canvas triplets', () => {
    expect(triplets.length).toBeGreaterThanOrEqual(2);
  });

  it('light theme-color === light --rgb-canvas', () => {
    const rgb = triplets[0].slice(1, 4).map(Number) as [number, number, number];
    expect(hex(rgb)).toBe(THEME_COLORS.light.toUpperCase());
  });

  it('dark theme-color === dark --rgb-canvas', () => {
    const rgb = triplets[1].slice(1, 4).map(Number) as [number, number, number];
    expect(hex(rgb)).toBe(THEME_COLORS.dark.toUpperCase());
  });
});
