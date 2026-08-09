/**
 * print-layer.test.ts — the @media print layer exists and does the load-bearing
 * things, and stays inert on screen (luxe W2, item 10 `prints-like-a-book`).
 *
 * A source guard, like the other CSS guards here: it reads globals.css and pins
 * the contracts a print regression would quietly break. It does not re-render
 * (the visual proof is the banked print PDFs in
 * design-reviews/luxe-audit/2026-08-07/wave2/captures/), it locks the rules that
 * make those PDFs correct so an edit can't silently undo them.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const CSS = readFileSync(resolve(process.cwd(), 'app', 'globals.css'), 'utf8');

/** Body of the first `@media print { … }` block, brace-matched. */
function printBlock(): string {
  const at = CSS.indexOf('@media print');
  expect(at, 'no @media print block').toBeGreaterThan(-1);
  const open = CSS.indexOf('{', at);
  let i = open + 1;
  let depth = 1;
  while (depth > 0 && i < CSS.length) {
    if (CSS[i] === '{') depth++;
    else if (CSS[i] === '}') depth--;
    i++;
  }
  return CSS.slice(open + 1, i - 1);
}

const PRINT = printBlock();

describe('print layer — inert on screen', () => {
  it('is a single @media print RULE, and @page lives only inside it', () => {
    // The only way this layer can touch the screen render is if a rule escaped
    // the media block. Count the at-rule OPENINGS (`@media print {`), not the
    // word in prose — the section's own docblock mentions it twice.
    expect(CSS.match(/@media print\s*\{/g)?.length).toBe(1);
    expect(CSS.match(/@page\s*\{/g)?.length).toBe(1);
    expect(CSS.indexOf('@media print {')).toBeGreaterThan(-1);
    expect(CSS.indexOf('@page {')).toBeGreaterThan(CSS.indexOf('@media print {'));
  });
});

describe('print layer — the paper contract', () => {
  it('sets @page margins', () => {
    expect(PRINT).toMatch(/@page\s*\{[^}]*margin/);
  });

  it('forces the light palette on BOTH themes (dark-mode ⌘P still prints on paper)', () => {
    expect(PRINT).toMatch(/:root\s*,\s*html\.dark\s*\{/);
    // canvas forced white and the warm accent forced to its paper (dark-enough) ink
    expect(PRINT).toContain('--rgb-canvas: 255 255 255');
    expect(PRINT).toContain('--rgb-accent-ink: 135 71 45');
    // surfaces go fully opaque so translucent world-surfaces don't tint the page
    expect(PRINT).toMatch(/--surface-alpha:\s*1/);
  });

  it('hides the chrome that has no place on paper', () => {
    for (const sel of [
      '.world-backdrop',
      'nav[aria-label="Site navigation"]',
      '.cdesert-stage', // the cinematic intro void
      '.intro-scroll-cue',
      '[data-runway-identity]',
      '#primary-menu',
    ]) {
      expect(PRINT, `print layer must hide ${sel}`).toContain(sel);
    }
    // and those selectors resolve to display:none
    expect(PRINT).toMatch(/display:\s*none\s*!important/);
  });

  it('rescues gradient-clipped display text to solid ink', () => {
    // Same failure mode as forced-colors: strip the gradient and .ember is
    // color:transparent = invisible. On paper it must be the warm accent ink.
    expect(PRINT).toMatch(/\.ember[\s,]/);
    expect(PRINT).toMatch(/-webkit-text-fill-color:\s*rgb\(var\(--rgb-accent-ink\)\)/);
  });

  it('flattens depth and gives glass a real border', () => {
    expect(PRINT).toMatch(/box-shadow:\s*none\s*!important/);
    expect(PRINT).toMatch(/\.glass-card\s*\{[^}]*border:\s*1px solid/s);
  });

  it('reveals external destinations a reader cannot click', () => {
    // Only genuinely off-site links, only in the content column.
    expect(PRINT).toContain('main a[href^="http"]:not([href*="skypistudio.com"])::after');
    expect(PRINT).toContain('content: " (" attr(href) ")"');
  });

  it('neutralises the ambient decorative washes that ride inline gradients', () => {
    // The home hero wash + ambient-drift carry inline gradients the token reset
    // can't reach; their paint must be stripped so the page stays white.
    expect(PRINT).toContain('.ambient-drift');
    expect(PRINT).toMatch(/\[aria-hidden="true"\]\.pointer-events-none\.absolute/);
  });
});
