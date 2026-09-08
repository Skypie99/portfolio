import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type RGB = [number, number, number];

const ROOT = resolve(process.cwd());
const HOME = readFileSync(join(ROOT, 'app', 'page.tsx'), 'utf8');
const CSS = readFileSync(join(ROOT, 'app', 'globals.css'), 'utf8');
const HEADING_TEXT = 'Have something worth building? Let’s talk about it.';
const LIGHT_BACKGROUNDS: readonly RGB[] = [
  [215, 208, 186], // retained failing-state backdrop
  [215, 209, 190], // audited cool-pale composite
  [210, 216, 194], // nearby moving-surface case
];

function block(selector: string): string {
  const start = CSS.indexOf(`${selector} {`);
  expect(start, `missing ${selector} rule`).toBeGreaterThan(-1);
  const open = CSS.indexOf('{', start);
  let depth = 1;
  let end = open + 1;
  while (depth > 0 && end < CSS.length) {
    if (CSS[end] === '{') depth++;
    else if (CSS[end] === '}') depth--;
    end++;
  }
  return CSS.slice(open + 1, end - 1);
}

function rgbToken(name: string): RGB {
  const declarations = block(':root');
  const match = new RegExp(`--${name}:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)`).exec(declarations);
  expect(match, `missing --${name} in :root`).toBeTruthy();
  return match!.slice(1, 4).map(Number) as RGB;
}

function luminance([r, g, b]: RGB): number {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: RGB, b: RGB): number {
  const [high, low] = [luminance(a), luminance(b)].sort((left, right) => right - left);
  return (high + 0.05) / (low + 0.05);
}

function gradientTokens(rule: string): string[] {
  return [...rule.matchAll(/rgb\(var\(--([^)]+)\)\)/g)].map((match) => match[1]);
}

describe('P10-CONT-CONTRAST-002 — Contact heading owns a scoped contrast repair', () => {
  it('keeps the exact h2 copy and adds the unique class only at the owning call site', () => {
    const heading = /<h2 className="([^"]*\bcontact-heading-ember\b[^"]*)">([\s\S]*?)<\/h2>/.exec(HOME);
    expect(heading, 'the homepage Contact h2 must own the scoped repair class').toBeTruthy();
    expect(heading![1].split(/\s+/)).toEqual(expect.arrayContaining([
      'font-serif',
      'font-light',
      'text-step-4',
      'ember',
      'contact-heading-ember',
      'max-w-measure-heading',
      'leading-heading',
    ]));
    const text = heading![2].replace(/<br\s*\/>/g, ' ').replace(/\s+/g, ' ').trim();
    expect(text).toBe(HEADING_TEXT);
    expect(HOME.match(/\bcontact-heading-ember\b/g)).toHaveLength(1);
  });

  it('uses the established deep warm ramp with practical light-theme margin', () => {
    const tokens = gradientTokens(block('.contact-heading-ember'));
    expect(tokens).toEqual(['rgb-accent-ink', 'rgb-link-hover', 'rgb-accent-ink']);
    for (const token of new Set(tokens)) {
      for (const background of LIGHT_BACKGROUNDS) {
        expect(contrast(rgbToken(token), background), `${token} against ${background.join(' ')}`)
          .toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('uses the already accepted dark ramp for the same surface family', () => {
    expect(gradientTokens(block('html.dark .contact-heading-ember')))
      .toEqual(gradientTokens(block('html.dark .support-heading-ember')));
  });

  it('would reject the original light-theme middle stop on the reproduced backdrop', () => {
    expect(contrast(rgbToken('rgb-accent'), LIGHT_BACKGROUNDS[0])).toBeLessThan(3);
  });
});
