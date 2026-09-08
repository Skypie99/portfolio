import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type RGB = [number, number, number];

const ROOT = resolve(process.cwd());
const HOME = readFileSync(join(ROOT, 'app', 'page.tsx'), 'utf8');
const CSS = readFileSync(join(ROOT, 'app', 'globals.css'), 'utf8');
const HEADING_TEXT = 'This is the job the projects come from.';
const LIGHT_BACKGROUNDS: readonly RGB[] = [
  [210, 216, 194], // exact failing-state worst backdrop from the retained browser reproduction
  [215, 209, 190], // audited cool-pale binding composite
];
const DARK_BACKGROUNDS: readonly RGB[] = [
  [87, 87, 78], // brightest failing-state backdrop in the first candidate matrix
  [45, 59, 63], // settled reduced-motion backdrop from the first candidate matrix
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

function rgbToken(name: string, scope: ':root' | 'html.dark' = ':root'): RGB {
  const declarations = block(scope);
  const match = new RegExp(`--${name}:\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)`).exec(declarations);
  expect(match, `missing --${name} in ${scope}`).toBeTruthy();
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

describe('P10-CONT-CONTRAST-001 — Support heading owns a scoped contrast repair', () => {
  it('keeps the exact h2 copy and adds the unique class only at the owning call site', () => {
    const heading = new RegExp(`<h2 className="([^"]*\\bsupport-heading-ember\\b[^"]*)">\\s*${HEADING_TEXT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</h2>`)
      .exec(HOME);
    expect(heading, 'the exact Support h2 must own the scoped repair class').toBeTruthy();
    expect(heading![1].split(/\s+/)).toEqual(expect.arrayContaining([
      'font-serif',
      'font-light',
      'text-step-4',
      'ember',
      'support-heading-ember',
      'max-w-measure-heading',
      'leading-heading',
      'text-balance',
    ]));
    expect(HOME.match(/\bsupport-heading-ember\b/g)).toHaveLength(1);
  });

  it('uses only the audited deep warm tokens and clears 4.5:1 on both known light backdrops', () => {
    const tokens = gradientTokens(block('.support-heading-ember'));
    expect(tokens).toEqual(['rgb-accent-ink', 'rgb-link-hover', 'rgb-accent-ink']);
    for (const token of new Set(tokens)) {
      for (const background of LIGHT_BACKGROUNDS) {
        expect(contrast(rgbToken(token), background), `${token} against ${background.join(' ')}`)
          .toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('uses only existing warm/bone tokens and clears 4.5:1 on both known dark backdrops', () => {
    const tokens = gradientTokens(block('html.dark .support-heading-ember'));
    expect(tokens).toEqual(['rgb-link-hover', 'rgb-ink', 'rgb-link-hover']);
    for (const token of new Set(tokens)) {
      for (const background of DARK_BACKGROUNDS) {
        expect(contrast(rgbToken(token, 'html.dark'), background), `${token} against ${background.join(' ')}`)
          .toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('would reject the original light-theme middle stop on the reproduced backdrop', () => {
    expect(contrast(rgbToken('rgb-accent'), LIGHT_BACKGROUNDS[0])).toBeLessThan(3);
  });
});
