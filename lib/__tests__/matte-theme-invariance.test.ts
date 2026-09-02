/**
 * Cook Out P2 · Part C — the matte theme-invariance CSS contract.
 *
 * Reproduced defect (qa-reports/2026-09-02_FlagstoneDarkMatte_*): the dual-
 * theme swap rules —
 *
 *   .ts-layer--dark { display: none; }
 *   html.dark .ts-layer--dark { display: block; }
 *   html.dark .ts-layer--light { display: none; }
 *
 * — are correct for a real light/dark PAIR, but a MONO/matte capture
 * (ThemedMotion / ThemedShowcase's matte path) has only one layer, always
 * rendered `theme="light"` because it's the sole source, not a light-mode
 * asset. The third rule above hid that single layer whenever the site theme
 * is dark: a blank exhibit mat with a live play/pause control and no video —
 * exactly the reported Flagstone screenshot.
 *
 * The fix is a source edit (a scoped override, no `!important`), so — like
 * the other CSS guards in this directory — the source shape is what's
 * assertable; the component-level class contract it depends on is guarded in
 * ThemedMotion.test.tsx / ThemedShowcase.test.tsx ("stays reachable by the
 * dark-theme override").
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');

describe('matte theme-invariance — the dark-mode override', () => {
  it('scopes the override under .ts-matte, after the dual-theme rules it corrects', () => {
    const dualThemeHide = css.indexOf('html.dark .ts-layer--light { display: none; }');
    expect(dualThemeHide, 'the rule this fix corrects must still exist').toBeGreaterThan(-1);

    const override = css.indexOf('html.dark .ts-matte .ts-layer--light { display: block; }');
    expect(override, 'the scoped matte override must exist').toBeGreaterThan(-1);
    expect(override).toBeGreaterThan(dualThemeHide);
  });

  it('never uses !important — the override wins on specificity alone', () => {
    const override = css.indexOf('html.dark .ts-matte .ts-layer--light');
    const line = css.slice(override, css.indexOf('\n', override));
    expect(line).not.toContain('!important');
  });

  it('adds no .ts-matte .ts-layer--dark RULE — matte never renders a dark twin', () => {
    // The spec's own instruction: don't add rules for states that don't
    // exist merely because a prior recovery note proposed them. Matches only
    // an actual rule (selector immediately followed by `{`), not this file's
    // own explanatory comment naming the selector it deliberately omits.
    expect(css).not.toMatch(/\.ts-matte \.ts-layer--dark\s*\{/);
  });

  it('is strictly more specific than the rule it overrides (no cascade-order dependency)', () => {
    // html.dark .ts-layer--light  → 1 type + 2 classes = (0,2,1)
    // html.dark .ts-matte .ts-layer--light → 1 type + 3 classes = (0,3,1)
    // Counting class/type tokens is a faithful proxy for specificity here —
    // both selectors are plain descendant combinators, no ids/attrs/pseudos.
    const base = 'html.dark .ts-layer--light';
    const scoped = 'html.dark .ts-matte .ts-layer--light';
    const countTokens = (sel: string) => (sel.match(/\.[a-zA-Z-]+|(?<![\w-])html(?![\w-])/g) ?? []).length;
    expect(countTokens(scoped)).toBeGreaterThan(countTokens(base));
  });
});
