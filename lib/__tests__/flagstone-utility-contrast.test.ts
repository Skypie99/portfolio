import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

type RGB = [number, number, number];

const ROOT = resolve(process.cwd());
const FLAGSTONE_ROOT = join(ROOT, 'public', 'flagstone');
const CSS = readFileSync(join(FLAGSTONE_ROOT, 'assets', 'site.css'), 'utf8');

const EXPECTED_UTILITY_PAGES = [
  'accessibility/index.html',
  'index.html',
  'privacy/index.html',
  'support/index.html',
  'terms/index.html',
];

function cssBlock(selector: string): string {
  const start = CSS.indexOf(selector);
  expect(start, `CSS selector not found: ${selector}`).toBeGreaterThanOrEqual(0);
  const open = CSS.indexOf('{', start);
  const close = CSS.indexOf('}', open);
  expect(open, `CSS block not opened: ${selector}`).toBeGreaterThan(start);
  expect(close, `CSS block not closed: ${selector}`).toBeGreaterThan(open);
  return CSS.slice(open + 1, close);
}

function declaration(block: string, property: string): string {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = block.match(new RegExp(`(?:^|[;\\n])\\s*${escaped}:\\s*([^;]+)`));
  expect(match, `CSS declaration not found: ${property}`).toBeTruthy();
  return match![1].trim();
}

function rgbToken(block: string, token: string): RGB {
  const value = declaration(block, token);
  const match = value.match(/^#([0-9a-f]{6})$/i);
  expect(match, `${token} must remain a six-digit hex colour`).toBeTruthy();
  const hex = match![1];
  return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)) as RGB;
}

function composite(foreground: RGB, background: RGB, opacity: number): RGB {
  return foreground.map(
    (channel, index) => channel * opacity + background[index] * (1 - opacity),
  ) as RGB;
}

function relativeLuminance([red, green, blue]: RGB): number {
  const linear = (channel: number): number => {
    const value = channel / 255;
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

function contrast(foreground: RGB, background: RGB): number {
  const lightness = [relativeLuminance(foreground), relativeLuminance(background)]
    .sort((a, b) => b - a);
  return (lightness[0] + 0.05) / (lightness[1] + 0.05);
}

function htmlFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [relative(FLAGSTONE_ROOT, path)] : [];
  });
}

describe('Flagstone utility header contrast', () => {
  const root = cssBlock(':root {');
  const dark = cssBlock(':root[data-theme="dark"] {');
  const body = cssBlock('body {');
  const header = cssBlock('header.page {');
  const darkHeader = cssBlock(':root[data-theme="dark"] header.page {');
  const copy = cssBlock('header.page p.tagline,\nheader.page p.meta {');

  it('passes normal-text AA in settled light mode with practical margin', () => {
    expect(declaration(header, 'background')).toBe('var(--brand-deep)');
    expect(declaration(header, 'color')).toBe('var(--brand-ink)');
    expect(declaration(copy, 'color')).toBe('inherit');

    const background = rgbToken(root, '--brand-deep');
    const ink = rgbToken(root, '--brand-ink');
    const opacity = Number(declaration(copy, 'opacity'));
    const effectiveInk = composite(ink, background, opacity);

    expect(declaration(body, 'font-family')).toBe(
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    );
    expect(declaration(copy, 'font-size')).toBe('0.9375rem');
    expect(copy).not.toMatch(/font-weight\s*:/);
    expect(contrast(effectiveInk, background)).toBeGreaterThanOrEqual(5);
  });

  it('would reject the old translucent-white-on-brand pair', () => {
    const oldBackground = rgbToken(root, '--brand');
    const ink = rgbToken(root, '--brand-ink');
    const opacity = Number(declaration(copy, 'opacity'));

    expect(contrast(composite(ink, oldBackground, opacity), oldBackground))
      .toBeLessThan(4.5);
  });

  it('preserves the settled dark header pair and appearance', () => {
    expect(declaration(darkHeader, 'background')).toBe('var(--brand)');

    const background = rgbToken(dark, '--brand');
    const ink = rgbToken(dark, '--brand-ink');
    const opacity = Number(declaration(copy, 'opacity'));

    expect(background).toEqual([110, 163, 255]);
    expect(ink).toEqual([8, 17, 31]);
    expect(contrast(composite(ink, background, opacity), background))
      .toBeGreaterThanOrEqual(4.5);
  });
});

describe('Flagstone utility route inventory', () => {
  it('pins the complete hand-authored utility, legal, support, and accessibility estate', () => {
    expect(htmlFiles(FLAGSTONE_ROOT).sort()).toEqual(EXPECTED_UTILITY_PAGES);
  });

  it.each(EXPECTED_UTILITY_PAGES)('%s receives the shared header correction', (page) => {
    const html = readFileSync(join(FLAGSTONE_ROOT, page), 'utf8');
    const header = html.match(/<header class="page">([\s\S]*?)<\/header>/)?.[1];

    expect(header, `${page} must keep the shared page header`).toBeTruthy();
    expect(header).toMatch(/<p class="(?:tagline|meta)"/);
    expect(html).toMatch(/<link rel="stylesheet" href="(?:\.\.\/)?assets\/site\.css" \/>/);
  });

  it('keeps the generated Flagstone build log outside this utility stylesheet boundary', () => {
    const blog = JSON.parse(readFileSync(join(ROOT, 'content', 'blog.json'), 'utf8')) as {
      id: string;
    }[];
    const generator = readFileSync(join(ROOT, 'app', 'blog', '[slug]', 'page.tsx'), 'utf8');

    expect(blog.some((entry) => entry.id === 'building-flagstone')).toBe(true);
    expect(generator).not.toContain('flagstone/assets/site.css');
    expect(generator).not.toContain('header.page');
  });
});

describe('Flagstone utility tinted-surface text contrast', () => {
  const root = cssBlock(':root {');
  const light = ':root:not([data-theme="dark"]):not([data-contrast="high"])';

  it('keeps normal-size text above AA with margin on both tinted surfaces', () => {
    const roles = ['footer.page a', '.about a', '.contact-card p a', '.callout a', '.about h2', '.callout h2', '.home-card h2', '.a11y-readout'];
    for (const role of roles) {
      expect(declaration(cssBlock(`${light} ${role}`), 'color')).toBe('var(--brand-deep)');
    }
    const ink = rgbToken(root, '--brand-deep');
    for (const surface of ['--surface', '--surface-tint']) {
      const background = rgbToken(root, surface);
      expect(contrast(ink, background)).toBeGreaterThanOrEqual(5.5);
      expect(contrast(rgbToken(root, '--brand'), background)).toBeLessThan(4.5);
    }
  });

  it('keeps each privacy table in a named keyboard-reachable region', () => {
    const html = readFileSync(join(FLAGSTONE_ROOT, 'privacy/index.html'), 'utf8');
    const page = new DOMParser().parseFromString(html, 'text/html');
    const tables = [...page.querySelectorAll('table')];
    expect(tables).toHaveLength(2);
    for (const table of tables) {
      const region = table.parentElement!;
      expect(region.getAttribute('role')).toBe('region');
      expect(region.getAttribute('aria-label')?.trim()).toBeTruthy();
      expect(region.tabIndex).toBe(0);
      expect(table.querySelectorAll('thead th').length).toBeGreaterThan(1);
      expect(table.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
    }
  });
});
