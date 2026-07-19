/**
 * The exhibit lamp (R4/BP4 · P06) — the CSS contract.
 * Locks the pitch's check-6 cost cell: dark register only, exactly two
 * radials, mix-blend-mode: screen as the ONE compositing effect, NO blur,
 * and the plate hairline's text-shadow scoped to the severity line only
 * (never a wildcard sibling glow).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');

function rule(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `rule present: ${selector}`).toBeGreaterThan(-1);
  const end = css.indexOf('}', start);
  return css.slice(start, end);
}

describe('exhibit lamp — source contract', () => {
  it('hides the lamp outside the dark register', () => {
    expect(rule('.pr-lamp')).toContain('display: none');
  });

  it('lights it dark-only: exactly two radials, screen blend, no blur or filter', () => {
    const lamp = rule('html.dark .pr-lamp');
    expect(lamp.match(/radial-gradient\(/g)?.length).toBe(2);
    expect(lamp).toContain('mix-blend-mode: screen');
    expect(lamp).not.toContain('blur(');
    expect(lamp).not.toContain('filter:');
    expect(lamp).toContain('var(--pr-sig');
  });

  it('scopes the plate warmth to the severity line, dark-only, one text-shadow', () => {
    const plate = rule('html.dark .pr-plate-lit');
    expect(plate.match(/text-shadow:/g)?.length).toBe(1);
    expect(plate).toContain('var(--pr-sig');
    // Never a light-theme plate glow, never an unscoped sibling glow.
    expect(css).not.toMatch(/(?<!html\.dark )\.pr-plate-lit \{/);
    expect(css).not.toContain('.pr-lamp ~');
    expect(css).not.toContain('.pr-lamp +');
  });

  it('ships no animation on the lamp (the default state IS the RM state)', () => {
    const lamp = rule('html.dark .pr-lamp');
    expect(lamp).not.toContain('animation');
    expect(lamp).not.toContain('transition');
  });
});
