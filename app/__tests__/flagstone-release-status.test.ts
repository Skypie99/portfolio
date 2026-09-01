import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getBlogPosts, getDeliverables } from '@/lib/content';

const prohibitedCurrentClaims = /available on the App Store|released on the App Store|approved by Apple|download(?:able)? from the App Store|live in the App Store/i;

describe('Flagstone App Store submission truth', () => {
  const flagstone = getDeliverables().find((deliverable) => deliverable.id === 'flagstone');

  it('publishes the submitted milestone and its verification date', () => {
    expect(flagstone).toBeDefined();
    expect(flagstone?.status).toBe('App Store review submitted · August 2026');
    expect(flagstone?.verifiedDate).toBe('2026-08-31');
    expect(flagstone?.body).toContain(
      'submitted to Apple for App Store review on August 31, 2026',
    );
  });

  it('does not turn submission into approval or public availability', () => {
    const currentCopy = `${flagstone?.status ?? ''}\n${flagstone?.body ?? ''}`;
    expect(currentCopy).not.toMatch(prohibitedCurrentClaims);
    expect(currentCopy).toContain(
      'Apple approval and public App Store availability have not been established',
    );
  });

  it('exposes the milestone on the homepage and Flagstone product landing page', () => {
    const homepage = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8');
    const productLanding = readFileSync(
      resolve(process.cwd(), 'public/flagstone/index.html'),
      'utf8',
    );

    expect(homepage).toContain('One submitted to Apple for App Store review');
    expect(productLanding).toContain(
      'submitted to Apple for App Store review in August 2026',
    );
    expect(`${homepage}\n${productLanding}`).not.toMatch(prohibitedCurrentClaims);
  });

  it('keeps the older blog status explicitly historical', () => {
    const post = getBlogPosts().find((entry) => entry.id === 'building-flagstone');
    expect(post?.content).toContain('The v1 TestFlight build at the time');
    expect(post?.content).not.toContain('currently in TestFlight');
  });
});
