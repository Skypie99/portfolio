import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EditorialPlate, EditorialPortrait, EditorialRise } from '@/components/EditorialPlate';

/**
 * EditorialPlate / EditorialPortrait / EditorialRise — the About + Contact
 * calling-card frame (Fable about + contact creative implementation,
 * 2026-10-18). The invariants under test are the no-JS / hydration-failure /
 * reduced-motion floors: the SSR markup must carry the VISIBLE resting state
 * (no inline opacity or transform, ever — the HeroSettle idiom), and the
 * decorative layers must be invisible to assistive technology.
 */
describe('EditorialPlate', () => {
  it('renders its children in a frame with no inline opacity/transform (REST = VISIBLE)', () => {
    const { container } = render(
      <EditorialPlate arrival="mount">
        <p>Skyler Halisky</p>
      </EditorialPlate>,
    );
    expect(screen.getByText('Skyler Halisky')).toBeInTheDocument();
    for (const el of Array.from(container.querySelectorAll<HTMLElement>('[style]'))) {
      expect(el.getAttribute('style')).not.toMatch(/opacity|transform/);
    }
  });

  it('keeps the wash and the approach-glow out of the accessibility tree', () => {
    const { container } = render(
      <EditorialPlate>
        <p>content</p>
      </EditorialPlate>,
    );
    const decorative = container.querySelectorAll('span[aria-hidden="true"]');
    expect(decorative.length).toBe(2);
    // and they carry no text an AT could stumble on
    decorative.forEach((s) => expect(s.textContent).toBe(''));
  });

  it('arrival="mount" and the resting plate differ only by a class, never by markup', () => {
    const mount = render(
      <EditorialPlate arrival="mount">
        <p>a</p>
      </EditorialPlate>,
    ).container.firstElementChild as HTMLElement;
    const rest = render(
      <EditorialPlate arrival="none">
        <p>a</p>
      </EditorialPlate>,
    ).container.firstElementChild as HTMLElement;
    expect(mount.innerHTML).toBe(rest.innerHTML);
    expect(mount.classList.length).toBe(rest.classList.length + 1);
    expect(mount.getAttribute('style')).toBeNull();
    expect(rest.getAttribute('style')).toBeNull();
  });
});

describe('EditorialPortrait', () => {
  it('is a plain, eager <img> with reserved dimensions and a real alt (CLS 0, no next/image)', () => {
    render(<EditorialPortrait src="/images/headshot.jpg" alt="Skyler Halisky" size={160} arrival="mount" />);
    const img = screen.getByRole('img', { name: 'Skyler Halisky' });
    expect(img).toHaveAttribute('src', '/images/headshot.jpg');
    expect(img).toHaveAttribute('width', '160');
    expect(img).toHaveAttribute('height', '160');
    expect(img).toHaveAttribute('decoding', 'async');
    // first-screen image: never lazy
    expect(img).not.toHaveAttribute('loading');
    expect(img.getAttribute('style')).toBeNull();
  });
});

describe('EditorialRise', () => {
  it('wraps its children without inline styles (the stagger is CSS-only)', () => {
    const { container } = render(
      <EditorialRise timing="late">
        <a href="/contact/">Send me an email</a>
        <p>second</p>
      </EditorialRise>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.children.length).toBe(2);
    expect(container.querySelectorAll('[style]').length).toBe(0);
    expect(screen.getByRole('link', { name: 'Send me an email' })).toHaveAttribute('href', '/contact/');
  });
});
