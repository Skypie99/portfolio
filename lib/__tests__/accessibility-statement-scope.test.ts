import { describe, expect, it } from 'vitest';

import { getAccessibilityStatement } from '../content';

describe('public accessibility claim boundaries', () => {
  it('states a dated testing scope and target without universal contrast certification', () => {
    const statement = getAccessibilityStatement();
    expect(statement).toMatch(/target WCAG AA contrast/);
    expect(statement).toMatch(/7 September 2026.*20 public content pages.*404 page.*three legacy redirects/);
    expect(statement).not.toMatch(/Every text role.*meets WCAG AA/);
    expect(statement).toContain('not proof of contrast in every visual state or accessibility certification');
    expect(statement).toContain('I have not run a full manual screen-reader pass on this site.');
  });
});
