/**
 * Phase 07 narrow-screen intro handoff contract.
 *
 * The measured landing condition belongs to a real browser, not jsdom, so the
 * browser matrix owns the geometry. These source guards protect the mechanism:
 * one CSS-only adjustment scoped below the 768px boundary, with native-anchor
 * fallback preserved rather than a bespoke scroll/focus implementation.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'app/globals.css'), 'utf8');
const home = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8');
const hero = readFileSync(resolve(process.cwd(), 'components/Hero.tsx'), 'utf8');

describe('Phase 07 native intro handoff', () => {
  it('keeps the landing adjustment below the 768px composition boundary', () => {
    const match = css.match(
      /@media \(max-width: 767px\) \{\s*#hero \{([\s\S]*?)\n  \}\n\}/,
    );

    expect(match, 'the narrow #hero landing rule must exist').toBeTruthy();
    expect(match?.[1]).toContain('scroll-margin-top: -360px;');
    expect(match?.[1]).toContain(
      'scroll-margin-top: calc(-360px - env(safe-area-inset-top));',
    );
  });

  it('brings the native handoff into short touch-landscape view without changing pointer desktop geometry', () => {
    const match = css.match(
      /@media \(orientation: landscape\) and \(max-height: 500px\) and \(hover: none\) and \(pointer: coarse\) \{\s*#hero \{([\s\S]*?)\n  \}\n\}/,
    );

    expect(match, 'the short touch-landscape #hero landing rule must exist').toBeTruthy();
    expect(match?.[1]).toContain('scroll-margin-top: -310px;');
    expect(match?.[1]).toContain(
      'scroll-margin-top: calc(-310px - env(safe-area-inset-top));',
    );
  });

  it('keeps the fragment destination reachable without adding a tab stop', () => {
    expect(home).toContain('<div id="hero" tabIndex={-1}>');
  });

  it('gives the focused native destination a visible identity-block cue', () => {
    expect(hero).toContain('data-hero-identity');
    expect(css).toMatch(
      /#hero:focus-visible \[data-hero-identity\] \{\s*outline: 2px solid rgb\(var\(--rgb-accent\)\);\s*outline-offset: 6px;\s*\}/,
    );
  });
});
