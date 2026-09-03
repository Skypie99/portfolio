import { describe, expect, it } from 'vitest';

import { absoluteUrl, canonicalFor, SITE_URL } from '@/lib/metadata';

describe('lib/metadata — canonical URL helpers', () => {
  it('SITE_URL is the site\'s real https origin, no trailing slash', () => {
    expect(SITE_URL).toBe('https://skypistudio.com');
    expect(SITE_URL.endsWith('/')).toBe(false);
  });

  it('absoluteUrl resolves a site-relative path against SITE_URL', () => {
    expect(absoluteUrl('/work/flagstone/')).toBe('https://skypistudio.com/work/flagstone/');
    expect(absoluteUrl('/')).toBe('https://skypistudio.com/');
  });

  it('canonicalFor is the same absolute self-URL a route should declare', () => {
    expect(canonicalFor('/about/')).toBe('https://skypistudio.com/about/');
    expect(canonicalFor('/blog/building-flagstone/')).toBe(
      'https://skypistudio.com/blog/building-flagstone/',
    );
  });
});
