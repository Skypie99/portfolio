import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getBlogPosts, getDeliverables } from '@/lib/content';

/**
 * INVERTED 2026-09-17 (P1.A release-truth repair).
 *
 * This file used to pin the OPPOSITE claim: that Flagstone was submitted and
 * not approved, and it forbade every phrase that would say the app is public.
 * That was correct copy right up until 2026-09-15, when the app went live on
 * the App Store (US and Canada, v4.1.1, free). From that morning the guard was
 * actively holding a false statement onto a public page, which is the exact
 * failure a truth guard exists to prevent. The lesson is not "don't pin status"
 * — it is that a pin on a TIME-BOUND fact has to be inverted the day the fact
 * turns, in the same commit as the copy, or the test becomes the reason the lie
 * survives review.
 *
 * So the shape here is deliberately asymmetric:
 *
 *   · Availability language is now REQUIRED, not prohibited. The page has to
 *     say the app is on the App Store; silence would be the new understatement.
 *   · ADOPTION language is prohibited, and that prohibition is the load-bearing
 *     half. Verified at the source on 2026-09-17: the iTunes lookup for
 *     com.accessmap.app returns userRatingCount 0 in both the US and CA
 *     storefronts. There are no downloads, ratings, rankings or users to cite,
 *     and "we just shipped" is the single most tempting moment to invent some.
 *   · The blog assertions below are UNTOUCHED. That post is dated and its
 *     TestFlight claim was accurate at publication; historical copy stays
 *     historical.
 */

/** Availability is true as of 2026-09-15 and must be stated, not implied. */
const requiredAvailabilityClaim =
  /available on the App Store|on the App Store/i;

/**
 * Adoption claims with no evidence behind them. Nothing here is "probably
 * fine to round up" — the store itself reports zero ratings, so any number of
 * users, downloads, ratings or chart positions on this page would be invented.
 * Kept narrow enough not to catch the page's real, receipted figures (test
 * counts, commit counts, the 48 simulator findings).
 */
const prohibitedAdoptionClaims: RegExp[] = [
  /\b[\d,.]+\+?\s*(?:downloads|installs|active users)\b/i,
  /\b(?:thousands|millions|hundreds) of (?:downloads|installs|users|people)\b/i,
  /\b(?:monthly|daily|weekly) active users\b/i,
  /\b(?:MAU|DAU|WAU)\b/,
  /\b\d[\d,.]*\s*(?:star|stars)\b/i,
  /\b(?:top|no\.?|#)\s*\d+\b[^.]{0,40}\bApp Store\b/i,
  /\bApp Store\b[^.]{0,40}\b(?:chart|ranking|ranked)\b/i,
  /\b[\d,.]+\s*(?:ratings|reviews)\b/i,
  /\bour users\b|\busers love\b|\bgrowing (?:fast|user base)\b/i,
];

describe('Flagstone App Store release truth', () => {
  const flagstone = getDeliverables().find((deliverable) => deliverable.id === 'flagstone');

  it('publishes the live App Store milestone and its verification date', () => {
    expect(flagstone).toBeDefined();
    expect(flagstone?.status).toBe('On the App Store · US and Canada · Sept 2026');
    expect(flagstone?.verifiedDate).toBe('2026-09-17');
    expect(flagstone?.body).toContain('available on the App Store');
    // The storefront scope is part of the claim: the app is NOT worldwide.
    expect(flagstone?.body).toContain('United States and Canada');
  });

  it('carries the App Store doorway as a real, typed link', () => {
    const appStore = flagstone?.links?.find((l) => l.type === 'appstore');
    expect(appStore).toBeDefined();
    expect(appStore?.label).toBe('Get it on the App Store');
    expect(appStore?.href).toBe(
      'https://apps.apple.com/app/flagstone-accessibility-map/id6774709116',
    );
    // The demo link stays: the web build is a separate, still-true proof.
    expect(flagstone?.links?.find((l) => l.type === 'demo')?.label).toBe('Live demo');
  });

  it('states availability rather than leaving the reader to infer it', () => {
    const currentCopy = `${flagstone?.status ?? ''}\n${flagstone?.body ?? ''}`;
    expect(currentCopy).toMatch(requiredAvailabilityClaim);
    // The retired understatements, now false, must never come back.
    expect(currentCopy).not.toMatch(/has not shipped|not yet shipped/i);
    expect(currentCopy).not.toMatch(
      /Apple approval and public App Store availability have not been established/i,
    );
    // Narrow on purpose. A bare /in review/ matched the page's own unrelated
    // sentence about code review ("drift shows up in review"), and
    // "submitted for review on August 31, 2026" is TRUE dated history that the
    // page should keep. Only the present-tense, now-false forms are banned.
    expect(currentCopy).not.toMatch(
      /awaiting (?:Apple )?review|review is (?:still )?pending|currently (?:in|under) review|until that review completes/i,
    );
  });

  it('never converts a fresh launch into adoption it cannot evidence', () => {
    const currentCopy = `${flagstone?.status ?? ''}\n${flagstone?.summary ?? ''}\n${flagstone?.body ?? ''}`;
    const offenders = prohibitedAdoptionClaims
      .filter((re) => re.test(currentCopy))
      .map(String);
    expect(offenders, `unsupported adoption claim: ${offenders.join(', ')}`).toEqual([]);
    // And the page must keep saying so out loud, not just avoid the numbers.
    expect(currentCopy).toContain('not yet meaningful');
  });

  it('exposes the milestone on the homepage and Flagstone product landing page', () => {
    const homepage = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8');
    const productLanding = readFileSync(
      resolve(process.cwd(), 'public/flagstone/index.html'),
      'utf8',
    );

    expect(homepage).toContain('One is on the App Store in the US and Canada');
    expect(productLanding).toContain(
      'on the App Store in the United States and Canada since September 2026',
    );
    expect(`${homepage}\n${productLanding}`).not.toMatch(
      /submitted to Apple for App Store review/i,
    );
    const offenders = prohibitedAdoptionClaims
      .filter((re) => re.test(`${homepage}\n${productLanding}`))
      .map(String);
    expect(offenders, `unsupported adoption claim: ${offenders.join(', ')}`).toEqual([]);
  });

  it('keeps the older blog status explicitly historical', () => {
    const post = getBlogPosts().find((entry) => entry.id === 'building-flagstone');
    expect(post?.content).toContain('The v1 TestFlight build at the time');
    expect(post?.content).not.toContain('currently in TestFlight');
  });
});
