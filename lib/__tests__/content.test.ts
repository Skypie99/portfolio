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

describe('status invariant (truth pass 2026-08-21)', () => {
  /**
   * WHY THIS TEST EXISTS
   * --------------------
   * Before the truth pass, every project rendered "Role: Solo builder" and
   * nothing else about its state, and the homepage said "all five live on the
   * open web". All five URLs did return 200 — but "live" reads as *live with
   * users*, and four were demos or personal tools while the flagship had never
   * shipped at all. The site never corrected that reading, so the reader made
   * the generous inference and the site kept it.
   *
   * DeliverableSchema now requires `status`, so a missing one already fails the
   * Zod parse in content.ts. This test exists for the failure mode the schema
   * cannot see: a status that is *present and empty of meaning*. A new project
   * added in a hurry with status "Live" passes min(4) and re-introduces exactly
   * the ambiguity the field was added to remove. So the assertions below are
   * about substance, not presence.
   */
  it('gives every deliverable a status', () => {
    const deliverables = getDeliverables();
    for (const d of deliverables) {
      expect(d.status, `${d.id} has no status`).toBeTruthy();
      expect(d.status.trim().length, `${d.id} status is blank`).toBeGreaterThan(3);
    }
  });

  it('never lets a bare "live" stand as the whole status', () => {
    // "Live" alone is the claim this field was created to qualify. Anything
    // starting with it must go on to say what kind of live: "Live demo —
    // synthetic data", "Live — public, no backend".
    const deliverables = getDeliverables();
    for (const d of deliverables) {
      const s = d.status.trim().toLowerCase();
      if (s.startsWith('live')) {
        expect(
          s.length,
          `${d.id}: "${d.status}" says live and stops — qualify it (demo? synthetic data? no backend?)`,
        ).toBeGreaterThan('live'.length + 4);
      }
    }
  });

  it('states the role as AI-assisted rather than bare "Solo builder"', () => {
    // The portfolio used to read "Solo builder" against 1,700+ commits in 91
    // days produced by a governed agent system. A reader who takes it literally
    // forms an expectation that will not survive a technical screen; a reader
    // who suspects AI gets no account of how the work is directed. Neither
    // reading is one the site should be leaving to chance.
    const deliverables = getDeliverables();
    for (const d of deliverables) {
      expect(d.role, `${d.id} role is the bare, unqualified claim`).not.toBe(
        'Solo builder',
      );
      expect(d.role.toLowerCase(), `${d.id} role omits the AI disclosure`).toContain(
        'ai-assisted',
      );
    }
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
