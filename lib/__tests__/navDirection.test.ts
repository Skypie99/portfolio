/**
 * The enfilade's direction rule (R4/BP1 · P04) — the prefix-parent matrix.
 * Directional meaning exists ONLY when one path is an ancestor of the other;
 * everything else keeps the plain dissolve (null).
 */
import { describe, expect, it } from 'vitest';

import { navDirection } from '@/lib/navDirection';

describe('navDirection (prefix-parent only)', () => {
  it('descends from a section into its child', () => {
    expect(navDirection('/work/', '/work/accessmap/')).toBe('descend');
  });

  it('descends from home into a section (home is the ancestor of everything)', () => {
    expect(navDirection('/', '/work/')).toBe('descend');
  });

  it('descends across more than one level when the ancestor line holds', () => {
    expect(navDirection('/', '/work/accessmap/')).toBe('descend');
  });

  it('ascends back up the same line (the breadcrumb tap)', () => {
    expect(navDirection('/work/accessmap/', '/work/')).toBe('ascend');
  });

  it('ascends from a blog post to the blog index', () => {
    expect(navDirection('/blog/building-accessmap/', '/blog/')).toBe('ascend');
  });

  it('returns null for equal-depth siblings (never fabricate architecture)', () => {
    expect(navDirection('/work/accessmap/', '/work/dashboard/')).toBeNull();
  });

  it('returns null for a cross-section jump', () => {
    expect(navDirection('/work/accessmap/', '/about/')).toBeNull();
  });

  it('returns null for a deeper cross-section pair that shares no line', () => {
    expect(navDirection('/blog/building-accessmap/', '/work/')).toBeNull();
  });

  it('returns null for the identical path', () => {
    expect(navDirection('/work/', '/work/')).toBeNull();
  });

  it('normalizes trailing slashes (dev and hand-typed hrefs may omit them)', () => {
    expect(navDirection('/work', '/work/accessmap')).toBe('descend');
    expect(navDirection('/work/accessmap', '/work/')).toBe('ascend');
  });
});
