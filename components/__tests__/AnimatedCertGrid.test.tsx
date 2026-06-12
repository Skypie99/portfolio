/**
 * AnimatedCertGrid floor tests — defects repair R2 (2026-06-12).
 *
 * The grid's REST state is the VISIBLE state: every card enters via the
 * shared Reveal primitive (CSS/IO, .reveal floors in globals.css), so SSR
 * must never serialize inline opacity:0 — the old framer initial:'hidden'
 * did exactly that, leaving reduced-motion and no-JS visitors an invisible
 * credentials grid. Real components, no mocks: the SSR string is what
 * `next build` emits, which is the defect surface.
 */
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';

import { AnimatedCertGrid } from '@/components/AnimatedCertGrid';
import type { Certificate } from '@/lib/schema';

const certificates: Certificate[] = [
  {
    id: 'test-cert-one',
    title: 'Test Certificate One',
    issuer: 'Test Issuer',
    issuedDate: '2026-01-15',
    credentialUrl: 'https://example.com/verify/one',
    badgeImage: {
      src: '/images/certificates/test-cert-one/badge.png',
      alt: 'Badge for test certificate one',
    },
    tags: ['testing'],
  },
  {
    id: 'test-cert-two',
    title: 'Test Certificate Two',
    issuer: 'Test Issuer',
    issuedDate: '2026-02-20',
    credentialUrl: 'https://example.com/verify/two',
    badgeImage: {
      src: '/images/certificates/test-cert-two/badge.png',
      alt: 'Badge for test certificate two',
    },
    tags: ['testing'],
  },
];

describe('AnimatedCertGrid', () => {
  it('SSR emits every card visible — no inline opacity:0 (RM/no-JS floor)', () => {
    const html = renderToString(<AnimatedCertGrid certificates={certificates} />);
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('opacity: 0');
    expect(html).toContain('Test Certificate One');
    expect(html).toContain('Test Certificate Two');
  });

  it('grid items are Reveal list items carrying the depth register', () => {
    const html = renderToString(<AnimatedCertGrid certificates={certificates} />);
    const liMatches = html.match(/<li[^>]*class="[^"]*reveal[^"]*reveal-depth[^"]*"/g) ?? [];
    expect(liMatches).toHaveLength(certificates.length);
  });
});
