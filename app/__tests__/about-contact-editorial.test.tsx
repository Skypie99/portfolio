import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AboutPage, { generateMetadata as aboutMetadata } from '@/app/about/page';
import ContactPage, { generateMetadata as contactMetadata } from '@/app/contact/page';
import { IDENTITY_ROLES } from '@/components/IdentityLines';
import { getCertificates, getDeliverables, getProfile } from '@/lib/content';

/**
 * /about + /contact editorial upgrade (Fable about + contact creative
 * implementation, 2026-10-18). These pin the things the brief said must not
 * move while the composition did: the owner's copy, the section anchors the
 * rail indexes, the ContactEmail behaviour, the stored contact data, the
 * accessible names and the new-tab cues — and the one structural change the
 * upgrade made on purpose (the contact action now precedes the prose).
 */
const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

/**
 * The ContactEmail link, whichever state it is in. Server markup carries the
 * `/contact/#elsewhere` fallback href (the existing no-JS socials list);
 * testing-library's render runs the component's effect at once, so by the time
 * we query it the runtime mailto is assembled. Either way it is the one link
 * whose href is the fallback or a mailto.
 */
const contactEmailLink = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLAnchorElement>('a')).find((a) => {
    const href = a.getAttribute('href') ?? '';
    return href === '/contact/#elsewhere' || href.startsWith('mailto:');
  });
// Next's <Link> normalises the trailing slash outside a configured build;
// the static-integrity suite checks the real out/ hrefs.
const route = (path: string) => new RegExp(`^${path.replace(/\/$/, '')}/?$`);

describe('/about — editorial opening', () => {
  it('keeps the title, the account and the rail-indexed section bands byte-for-byte', () => {
    const { container } = render(<AboutPage />);
    expect(norm(screen.getByRole('heading', { level: 1 }).textContent)).toBe(
      'Support is the work and inspiration, building tools to solve problems and reduce friction.',
    );
    expect(screen.getByText('I am Skyler Halisky.')).toBeInTheDocument();
    expect(norm(container.querySelector('blockquote')?.textContent)).toBe(
      'Accessibility is not an add-on. It is where you begin.',
    );

    // T4 parity: the only id'd bands are the four lib/sectionNav.ts indexes.
    const ids = Array.from(container.querySelectorAll('section[id], div[id]')).map((el) => el.id);
    expect(ids).toEqual(['method', 'principles', 'currently', 'work']);

    // T2 parity: each band still opens with its byte-exact eyebrow.
    const eyebrowOf = (id: string) => {
      const section = container.querySelector(`#${id}`)!;
      const p = Array.from(section.querySelectorAll('p')).find(
        (el) => el.classList.contains('tracking-label') && el.classList.contains('uppercase'),
      );
      return norm(p?.textContent);
    };
    expect(eyebrowOf('method')).toBe('Method');
    expect(eyebrowOf('principles')).toBe('Principles');
    expect(eyebrowOf('currently')).toBe('Currently');
    expect(eyebrowOf('work')).toBe('The Work');

    const h2s = screen.getAllByRole('heading', { level: 2 }).map((h) => norm(h.textContent));
    expect(h2s).toEqual([
      'How the work gets made is written down once.',
      'Accessibility. Privacy. No shortcuts.',
      'Learning in public. Shipping on purpose.',
      'A handful of things.',
      'Want to work together?Let’s talk.',
    ]);
  });

  it('opens with the public portrait and the identity the runway chip already publishes', () => {
    const profile = getProfile();
    render(<AboutPage />);
    const img = screen.getByRole('img', { name: profile.name });
    expect(img).toHaveAttribute('src', '/images/headshot.jpg');
    expect(img).toHaveAttribute('width', '160');
    expect(img).not.toHaveAttribute('loading');
    // The portrait precedes the title in DOM (and therefore reading) order.
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(img.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    for (const role of IDENTITY_ROLES) {
      expect(screen.getByText((_, el) => el?.tagName === 'P' && norm(el.textContent).includes(role))).toBeInTheDocument();
    }
    expect(IDENTITY_ROLES).toEqual(['Technical Support', 'AI-assisted Builder']);
    // The mobile chip is no longer mounted here — the plate signs the page.
    expect(document.querySelector('[data-runway-identity]')).toBeNull();
  });

  it('reads the record counts from content and links them into the pages that hold them', () => {
    render(<AboutPage />);
    const projects = screen.getByRole('link', { name: `${getDeliverables().length} projects` });
    const credentials = screen.getByRole('link', { name: `${getCertificates().length} credentials` });
    expect(projects.getAttribute('href')).toMatch(route('/work/'));
    expect(credentials.getAttribute('href')).toMatch(route('/certificates/'));
  });

  it('shows each listed project’s own status line, unchanged from content', () => {
    const { container } = render(<AboutPage />);
    const work = container.querySelector('#work')!;
    const all = getDeliverables();
    const featured = all.find((d) => d.featured);
    const recent = (featured ? [featured, ...all.filter((d) => !d.featured)] : all).slice(0, 3);
    for (const d of recent) {
      expect(within(work as HTMLElement).getByText(d.status)).toBeInTheDocument();
    }
  });

  it('carries no inline opacity/transform and keeps every image described', () => {
    const { container } = render(<AboutPage />);
    for (const el of Array.from(container.querySelectorAll<HTMLElement>('[style]'))) {
      expect(el.getAttribute('style')).not.toMatch(/opacity|transform/);
    }
    for (const img of Array.from(container.querySelectorAll('img'))) {
      expect((img.getAttribute('alt') ?? '').length).toBeGreaterThanOrEqual(4);
    }
    expect(aboutMetadata().title).toBe('About: Skyler Halisky');
  });
});

describe('/contact — the calling card', () => {
  it('keeps the invitation copy, the stored contact data and the accessible names', () => {
    const profile = getProfile();
    const { container } = render(<ContactPage />);
    expect(norm(screen.getByRole('heading', { level: 1 }).textContent)).toBe('Write to me.');
    const prose = Array.from(container.querySelectorAll('p')).map((p) => norm(p.textContent));
    expect(prose).toContain(
      'Accessible technology, built with care. Thoughtful product collaborations. Learning out loud, one project at a time. I read every message that comes through.',
    );
    expect(prose).toContain('Open to senior support roles, and to professional conversations.');
    expect(prose).toContain('The socials below also work, for everything else.');

    // ContactEmail is mounted as before — the runtime-assembled mailto to the
    // stored address (behaviour owned by the component, untouched here).
    const email = contactEmailLink(container)!;
    expect(email).toBeDefined();
    expect(email.getAttribute('href')).toMatch(new RegExp(`^(/contact/|mailto:${profile.contactEmail})`));
    expect(norm(email.textContent)).toMatch(/email/i);

    const linkedin = profile.socials.find((s) => s.platform === 'linkedin')!;
    const pointer = screen.getByRole('link', { name: /View LinkedIn profile.*\(opens in new tab\)/ });
    expect(pointer).toHaveAttribute('href', linkedin.url);
    expect(pointer).toHaveAttribute('target', '_blank');
    expect(pointer).toHaveAttribute('rel', 'noopener noreferrer');

    // Every social handle is still a cued external link.
    for (const s of profile.socials) {
      const link = screen.getByRole('link', { name: new RegExp(`${s.handle}.*\\(opens in new tab\\)`) });
      expect(link).toHaveAttribute('href', s.url);
    }
    expect(contactMetadata().title).toBe('Contact: Skyler Halisky');
  });

  it('raises the primary action above the prose (first-screen on phones) without adding a form or a new destination', () => {
    const profile = getProfile();
    const { container } = render(<ContactPage />);
    const email = contactEmailLink(container)!;
    const firstParagraph = screen.getByText(/Accessible technology, built with care\./);
    expect(email.compareDocumentPosition(firstParagraph) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(container.querySelector('form, input, textarea, select, iframe')).toBeNull();
    const allowed = new Set(profile.socials.map((s) => s.url));
    for (const a of Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="http"]'))) {
      expect(allowed.has(a.getAttribute('href') ?? '')).toBe(true);
    }
    expect(document.querySelector('[data-runway-identity]')).toBeNull();
    for (const el of Array.from(container.querySelectorAll<HTMLElement>('[style]'))) {
      expect(el.getAttribute('style')).not.toMatch(/opacity|transform/);
    }
  });
});
