/**
 * ProductReveal smoke tests (Show-the-work 2026-06-04).
 *
 * Locks the core contract of the reusable cinematic product-media component:
 *  - placeholder state emits NO <img> (so a static-export build never carries a
 *    dangling local src, and the "every <img src> resolves" rule holds by
 *    construction);
 *  - a real `src` renders an <img> carrying its alt (a11y), and suppresses the
 *    decorative placeholder wordmark;
 *  - responsive `avif`/`webp` sources render a <picture> (AVIF → WebP → <img>);
 *  - the card placeholder is purely decorative (no wordmark — the inscription
 *    below carries the title).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { ProductReveal } from '@/components/ProductReveal';

afterEach(() => {
  cleanup();
});

describe('ProductReveal', () => {
  it('renders the golden-hour placeholder (no <img>) when no real src is given', () => {
    const { container } = render(
      <ProductReveal
        slug="accessmap"
        title="AccessMap"
        eyebrow="Solo builder"
        context="hero"
        media={{ alt: 'AccessMap map view with accessibility pins' }}
      />,
    );

    // Placeholder paints pure CSS — never an <img>.
    expect(container.querySelector('img')).toBeNull();
    // The hero placeholder draws the product wordmark (decorative; the page's
    // real <h1> lives in the case-study column).
    expect(screen.getByText('AccessMap')).toBeInTheDocument();
  });

  it('renders a real <img> carrying the alt when a src is provided', () => {
    render(
      <ProductReveal
        slug="ghost-code"
        title="Ghost Code"
        context="hero"
        media={{
          src: '/images/deliverables/ghost-code/hero.png',
          alt: 'Ghost Code arcade screen with the Phantom mascot',
        }}
      />,
    );

    const img = screen.getByRole('img', {
      name: /ghost code arcade screen with the phantom mascot/i,
    });
    expect(img).toHaveAttribute('src', '/images/deliverables/ghost-code/hero.png');
    // A real screenshot suppresses the placeholder wordmark.
    expect(screen.queryByText('Ghost Code')).not.toBeInTheDocument();
  });

  it('wraps the image in a <picture> with AVIF/WebP sources when provided', () => {
    const { container } = render(
      <ProductReveal
        slug="prompt-library"
        title="Prompt Library"
        context="card"
        media={{
          src: '/images/deliverables/prompt-library/screen.png',
          avif: '/images/deliverables/prompt-library/screen.avif',
          webp: '/images/deliverables/prompt-library/screen.webp',
          alt: 'Prompt Library search view filtering by tag',
        }}
      />,
    );

    expect(container.querySelector('picture')).not.toBeNull();
    expect(container.querySelector('source[type="image/avif"]')).toHaveAttribute(
      'srcset',
      '/images/deliverables/prompt-library/screen.avif',
    );
    expect(container.querySelector('source[type="image/webp"]')).not.toBeNull();
  });

  it('card placeholder is decorative — no <img> and no product wordmark', () => {
    const { container } = render(
      <ProductReveal
        slug="mutual-mesh"
        title="Mutual Mesh"
        context="card"
        media={{ alt: 'Mutual Mesh request feed' }}
      />,
    );

    expect(container.querySelector('img')).toBeNull();
    // The card band is a pure UI hint — the title lives in the inscription below.
    expect(screen.queryByText('Mutual Mesh')).not.toBeInTheDocument();
  });
});
