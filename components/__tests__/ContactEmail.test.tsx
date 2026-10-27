/**
 * ContactEmail — D5 no-JavaScript fallback (2026-10-27).
 *
 * The hydrated CTA is unchanged: a runtime-assembled mailto, never present in
 * the static HTML. What changes is only the pre-hydration / no-JS href: it
 * used to be `/contact/`, a circular self-link on the very page it pointed at.
 * It now goes to the contact page's existing public Elsewhere list (GitHub and
 * LinkedIn), which the noscript line already offers — no new copy, no address
 * in the markup, no new destination.
 *
 * SSR is asserted with renderToString (effects do not run), so this is the
 * exact static HTML a no-JS visitor receives.
 */
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ContactPage from '@/app/contact/page';
import { ContactEmail } from '@/components/ContactEmail';
import { getProfile } from '@/lib/content';

describe('ContactEmail — static / no-JS markup', () => {
  const html = renderToString(<ContactEmail />);

  it('never exposes the address or a mailto in static HTML', () => {
    expect(html).not.toContain('mailto:');
    expect(html).not.toContain(getProfile().contactEmail);
  });

  it('points the static CTA at the existing Elsewhere list, not /contact/ itself', () => {
    expect(html).toContain('href="/contact/#elsewhere"');
    expect(html).not.toContain('href="/contact/"');
    expect(html).toContain('Send me an email');
  });

  it('keeps the no-JS social paths the fallback lands on', () => {
    expect(html).toContain('https://github.com/skypie99');
    expect(html).toContain('https://www.linkedin.com/in/skyler-halisky');
  });

  it('the destination section exists on /contact and carries the header offset', () => {
    const { container } = render(<ContactPage />);
    const elsewhere = container.querySelector('#elsewhere');
    expect(elsewhere).not.toBeNull();
    expect(elsewhere?.tagName).toBe('SECTION');
    expect(elsewhere?.className).toContain('scroll-mt-24');
  });

  it('hydrates to the runtime mailto, unchanged', () => {
    render(<ContactEmail />);
    const link = screen.getByRole('link', { name: /Email|Send me an email/i });
    expect(link.getAttribute('href')).toBe(
      `mailto:${getProfile().contactEmail}?subject=${encodeURIComponent('Hello from your portfolio')}`,
    );
  });
});
