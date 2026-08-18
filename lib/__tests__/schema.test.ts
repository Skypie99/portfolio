/**
 * schema.ts unit tests — Wave 3 (Gary).
 *
 * The Zod schemas in lib/schema.ts encode Dana's DATA_SHAPE.md rules and
 * Alex's alt-text mandate (§4.1). lib/content.ts relies on them at build
 * time — a shape error blows up the build. These tests exercise the
 * validators directly with happy-path and edge cases so the rules are
 * legible in one place and regressions surface before a broken build.
 *
 * No mocks, no DOM, no React. Pure Zod validation.
 */
import { describe, expect, it } from 'vitest';

import {
  CertificateSchema,
  DeliverableSchema,
  ProfileSchema,
} from '@/lib/schema';

// ────────────────────────────────────────────────────────────────────────────
// Shared fixtures
// ────────────────────────────────────────────────────────────────────────────

const goodHeroImage = {
  src: '/images/deliverables/flagstone/hero.jpg',
  alt: 'Warm-toned mockup of the Flagstone mobile interface',
};

const goodDeliverable = {
  id: 'flagstone',
  title: 'Flagstone',
  summary: 'A privacy-respecting accessibility-flagging app for disabled users.',
  role: 'Solo builder',
  tech: ['Expo', 'React Native', 'Supabase', 'TypeScript'],
  year: 2026,
  heroImage: goodHeroImage,
  tags: ['accessibility', 'mobile'],
  featured: false,
};

const goodCertificate = {
  id: 'anthropic-cert',
  title: 'Anthropic AI Foundations Certificate',
  issuer: 'Anthropic',
  issuedDate: '2026-01-15',
  credentialUrl: 'https://example.com/cert/abc123',
  badgeImage: {
    src: '/images/certificates/anthropic-cert/badge.png',
    alt: 'Anthropic AI Foundations certificate badge with gold border',
  },
  tags: ['ai', 'ml'],
};

const goodProfile = {
  name: 'Sky Halisky',
  wordmarkText: 'Sky Halisky',
  tagline: 'Building AI tools with care.',
  location: 'Vancouver, BC',
  contactEmail: 'sky@example.com',
  socials: [
    {
      platform: 'github' as const,
      handle: 'Skypie99',
      url: 'https://github.com/Skypie99',
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// DeliverableSchema
// ────────────────────────────────────────────────────────────────────────────

describe('DeliverableSchema — happy path', () => {
  it('accepts a fully valid deliverable', () => {
    expect(DeliverableSchema.safeParse(goodDeliverable).success).toBe(true);
  });

  it('accepts a deliverable with optional gallery and links', () => {
    const extended = {
      ...goodDeliverable,
      gallery: [
        {
          src: '/images/deliverables/flagstone/screen1.jpg',
          alt: 'Screenshot of the map view in Flagstone',
          caption: 'The main map interface.',
        },
      ],
      links: [
        {
          label: 'GitHub',
          href: 'https://github.com/Skypie99/AccessMap',
          type: 'github' as const,
        },
      ],
    };
    expect(DeliverableSchema.safeParse(extended).success).toBe(true);
  });
});

describe('DeliverableSchema — id slug validation', () => {
  it('rejects an id with uppercase letters', () => {
    const bad = { ...goodDeliverable, id: 'Flagstone' };
    expect(DeliverableSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an id with a leading hyphen', () => {
    const bad = { ...goodDeliverable, id: '-flagstone' };
    expect(DeliverableSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an id with a trailing hyphen', () => {
    const bad = { ...goodDeliverable, id: 'flagstone-' };
    expect(DeliverableSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts a valid kebab-case id with numbers', () => {
    const ok = { ...goodDeliverable, id: 'project-v2' };
    expect(DeliverableSchema.safeParse(ok).success).toBe(true);
  });
});

describe('DeliverableSchema — alt text rules (Alex §4.1)', () => {
  it('rejects alt text starting with "image of"', () => {
    const bad = {
      ...goodDeliverable,
      heroImage: { ...goodHeroImage, alt: 'image of the app' },
    };
    expect(DeliverableSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects alt text starting with "picture of"', () => {
    const bad = {
      ...goodDeliverable,
      heroImage: { ...goodHeroImage, alt: 'picture of a screenshot' },
    };
    expect(DeliverableSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects alt text starting with "photo of"', () => {
    const bad = {
      ...goodDeliverable,
      heroImage: { ...goodHeroImage, alt: 'photo of the map screen' },
    };
    expect(DeliverableSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts alt text that contains "image of" mid-sentence', () => {
    const ok = {
      ...goodDeliverable,
      heroImage: { ...goodHeroImage, alt: 'App UI showcasing an image of the city' },
    };
    expect(DeliverableSchema.safeParse(ok).success).toBe(true);
  });

  it('rejects alt text shorter than 4 characters', () => {
    const bad = {
      ...goodDeliverable,
      heroImage: { ...goodHeroImage, alt: 'App' },
    };
    expect(DeliverableSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects alt text longer than 200 characters', () => {
    const bad = {
      ...goodDeliverable,
      heroImage: { ...goodHeroImage, alt: 'A'.repeat(201) },
    };
    expect(DeliverableSchema.safeParse(bad).success).toBe(false);
  });
});

describe('DeliverableSchema — heroImage path rule', () => {
  it('rejects a heroImage src that does not start with /images/', () => {
    const bad = {
      ...goodDeliverable,
      heroImage: { ...goodHeroImage, src: 'images/deliverables/flagstone/hero.jpg' },
    };
    expect(DeliverableSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a heroImage src not under /images/deliverables/<slug>/', () => {
    const bad = {
      ...goodDeliverable,
      heroImage: { ...goodHeroImage, src: '/images/certificates/flagstone/hero.jpg' },
    };
    expect(DeliverableSchema.safeParse(bad).success).toBe(false);
  });
});

describe('DeliverableSchema — links refine (at most one demo)', () => {
  it('rejects two links of type "demo"', () => {
    const bad = {
      ...goodDeliverable,
      links: [
        { label: 'Demo A', href: 'https://demo-a.example.com', type: 'demo' as const },
        { label: 'Demo B', href: 'https://demo-b.example.com', type: 'demo' as const },
      ],
    };
    expect(DeliverableSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts one demo plus one github link', () => {
    const ok = {
      ...goodDeliverable,
      links: [
        { label: 'Live demo', href: 'https://demo.example.com', type: 'demo' as const },
        { label: 'GitHub', href: 'https://github.com/example/repo', type: 'github' as const },
      ],
    };
    expect(DeliverableSchema.safeParse(ok).success).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// CertificateSchema
// ────────────────────────────────────────────────────────────────────────────

describe('CertificateSchema — happy path', () => {
  it('accepts a fully valid certificate without expiresDate', () => {
    expect(CertificateSchema.safeParse(goodCertificate).success).toBe(true);
  });

  it('accepts a certificate with a valid expiresDate after issuedDate', () => {
    const ok = { ...goodCertificate, expiresDate: '2028-01-15' };
    expect(CertificateSchema.safeParse(ok).success).toBe(true);
  });
});

describe('CertificateSchema — date invariant', () => {
  it('rejects expiresDate equal to issuedDate', () => {
    const bad = { ...goodCertificate, expiresDate: '2026-01-15' };
    expect(CertificateSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects expiresDate before issuedDate', () => {
    const bad = { ...goodCertificate, expiresDate: '2025-01-01' };
    expect(CertificateSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects issuedDate with wrong format (DD/MM/YYYY)', () => {
    const bad = { ...goodCertificate, issuedDate: '15/01/2026' };
    expect(CertificateSchema.safeParse(bad).success).toBe(false);
  });
});

describe('CertificateSchema — credentialUrl must be https', () => {
  it('rejects an http:// credential URL', () => {
    const bad = { ...goodCertificate, credentialUrl: 'http://example.com/cert' };
    expect(CertificateSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a non-URL string', () => {
    const bad = { ...goodCertificate, credentialUrl: 'not-a-url' };
    expect(CertificateSchema.safeParse(bad).success).toBe(false);
  });
});

describe('CertificateSchema — badgeImage path rule', () => {
  it('rejects a badgeImage src not under /images/certificates/<slug>/', () => {
    const bad = {
      ...goodCertificate,
      badgeImage: {
        src: '/images/deliverables/anthropic-cert/badge.png',
        alt: 'Anthropic AI Foundations certificate badge in gold and white',
      },
    };
    expect(CertificateSchema.safeParse(bad).success).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// ProfileSchema
// ────────────────────────────────────────────────────────────────────────────

describe('ProfileSchema — happy path', () => {
  it('accepts a fully valid profile', () => {
    expect(ProfileSchema.safeParse(goodProfile).success).toBe(true);
  });

  it('accepts a profile with no socials (empty array)', () => {
    const ok = { ...goodProfile, socials: [] };
    expect(ProfileSchema.safeParse(ok).success).toBe(true);
  });
});

describe('ProfileSchema — contactEmail', () => {
  it('rejects a non-email contactEmail', () => {
    const bad = { ...goodProfile, contactEmail: 'not-an-email' };
    expect(ProfileSchema.safeParse(bad).success).toBe(false);
  });
});

describe('ProfileSchema — socials platform enum', () => {
  it('rejects an unrecognised platform', () => {
    const bad = {
      ...goodProfile,
      socials: [{ platform: 'tiktok', handle: 'sky', url: 'https://tiktok.com/@sky' }],
    };
    expect(ProfileSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts all recognised platforms', () => {
    const platforms = ['github', 'linkedin', 'twitter', 'mastodon', 'bluesky', 'other'] as const;
    for (const platform of platforms) {
      const ok = {
        ...goodProfile,
        socials: [{ platform, handle: 'sky', url: 'https://example.com/sky' }],
      };
      expect(ProfileSchema.safeParse(ok).success, `platform "${platform}" should be accepted`).toBe(true);
    }
  });
});
