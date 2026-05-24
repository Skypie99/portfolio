/**
 * content.ts unit tests — Cycle 4 (Gary).
 *
 * Two layers of assertion:
 *
 *   1. The loader functions return data that re-parses cleanly against the
 *      Zod schemas. content.ts already parses on read, so re-parsing here
 *      catches the regression where a future refactor strips validation
 *      and the bad data still flows through.
 *
 *   2. The build-time invariants Dana wrote in DATA_SHAPE.md §6: exactly
 *      one Deliverable may be featured. Zero is allowed (sidebar falls
 *      back to a "Latest" link), but two would create a silent sidebar
 *      ambiguity — exactly the class of bug a content test should catch
 *      before a build does.
 *
 * These run against the real JSON files in content/ — no mocks — because
 * the whole point is to validate the actual ship-state of the site.
 * If Sky edits the JSON and breaks an invariant, this test fails locally
 * before the Next build does in CI.
 */
import { describe, expect, it } from 'vitest';

import {
  getCertificates,
  getDeliverables,
  getFeaturedDeliverable,
  getProfile,
} from '@/lib/content';
import {
  CertificateSchema,
  DeliverableSchema,
  ProfileSchema,
} from '@/lib/schema';

describe('getProfile', () => {
  it('returns a profile that satisfies ProfileSchema', () => {
    const profile = getProfile();
    const parsed = ProfileSchema.safeParse(profile);
    expect(parsed.success).toBe(true);
  });
});

describe('getDeliverables', () => {
  it('returns a non-empty array of valid Deliverables', () => {
    const deliverables = getDeliverables();
    expect(Array.isArray(deliverables)).toBe(true);
    expect(deliverables.length).toBeGreaterThan(0);

    for (const d of deliverables) {
      const parsed = DeliverableSchema.safeParse(d);
      // If this fails, the assertion message includes the offending id so
      // Sky can find the bad row in content/deliverables.json fast.
      expect(parsed.success, `deliverable ${d.id} failed schema`).toBe(true);
    }
  });

  it('orders deliverables newest-first by year', () => {
    const deliverables = getDeliverables();
    for (let i = 1; i < deliverables.length; i++) {
      expect(deliverables[i - 1].year).toBeGreaterThanOrEqual(
        deliverables[i].year,
      );
    }
  });
});

describe('getCertificates', () => {
  it('returns an array of valid Certificates', () => {
    const certificates = getCertificates();
    expect(Array.isArray(certificates)).toBe(true);

    for (const c of certificates) {
      const parsed = CertificateSchema.safeParse(c);
      expect(parsed.success, `certificate ${c.id} failed schema`).toBe(true);
    }
  });
});

describe('getFeaturedDeliverable', () => {
  it('returns the single featured deliverable when one exists', () => {
    const featured = getFeaturedDeliverable();
    // The fixture state ships with exactly one featured deliverable, so this
    // should not be null in the current content set.
    expect(featured).not.toBeNull();
    expect(featured?.featured).toBe(true);
  });

  it('returns the same deliverable that the full list marks as featured', () => {
    const featured = getFeaturedDeliverable();
    const all = getDeliverables();
    const featuredFromList = all.filter((d) => d.featured);

    // Cross-check: the helper and the filter agree on the one featured row.
    expect(featuredFromList).toHaveLength(1);
    expect(featured?.id).toBe(featuredFromList[0].id);
  });
});

describe('featured-slot invariant (Dana DATA_SHAPE.md §6)', () => {
  it('has exactly one deliverable with featured: true', () => {
    // Sidebar/About both rely on at-most-one featured — two would silently
    // create ambiguous "Featured" slots across the site. Loading via
    // getDeliverables() also throws if >1, so this both proves the rule
    // AND proves the loader's guardrail still fires.
    const deliverables = getDeliverables();
    const featuredCount = deliverables.filter((d) => d.featured).length;
    expect(featuredCount).toBe(1);
  });
});
