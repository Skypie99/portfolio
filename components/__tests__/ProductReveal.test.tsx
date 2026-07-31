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
  it('renders the exhibit lamp layer on the case-study hero ONLY (R4/BP4 P06)', () => {
    // bare = the hero host (HeroProductReveal). The lamp is a dark-register
    // CSS layer — presence here, visibility owned by html.dark in globals.css.
    const hero = render(
      <ProductReveal
        slug="accessmap"
        title="AccessMap"
        context="hero"
        bare
        media={{ alt: 'AccessMap map view with accessibility pins' }}
      />,
    );
    expect(hero.container.querySelector('.pr-lamp')).not.toBeNull();
    expect(hero.container.querySelector('.pr-lamp')).toHaveAttribute('aria-hidden', 'true');
    cleanup();

    const card = render(
      <ProductReveal
        slug="accessmap"
        title="AccessMap"
        context="card"
        media={{ alt: 'AccessMap map view with accessibility pins' }}
      />,
    );
    expect(card.container.querySelector('.pr-lamp')).toBeNull();
  });

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

  it('shot empty state is the designed silhouette, not a loading skeleton (L3-02)', () => {
    const { container } = render(
      <ProductReveal
        slug="accessmap"
        title="AccessMap"
        context="shot"
        media={{ alt: 'AccessMap report flow' }}
      />,
    );

    // The designed empty state is present — a device silhouette on the lit stage.
    const placeholder = container.querySelector('[data-pr-placeholder="designed"]');
    expect(placeholder).not.toBeNull();
    // It carries no <img> and no wordmark …
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByText('AccessMap')).not.toBeInTheDocument();
    // … and the retired skeleton grammar (window-chrome dots + wireframe text
    // bars, which were <span> Bars) is gone: the designed still has no bars.
    expect(placeholder!.querySelectorAll('span').length).toBe(0);
  });
});

/**
 * Proof pipeline (P2-A) — locks the L7-02 / L3-02 / video capabilities added to
 * the ONE product-media component so P2-B can consume them unchanged:
 *  - the above-fold hero loads eager + fetchpriority=high; in-body shots stay lazy;
 *  - an inline LQIP data-URI is painted (aria-hidden) with NO animation → RM/CLS-safe;
 *  - width-variant srcset engages when provided (single-candidate otherwise);
 *  - a proof video renders poster-first (preload=none, playsInline, controls, a
 *    captions track) and carries NO `autoplay` attribute in the markup — autoplay
 *    is a JS-only enhancement gated on prefers-reduced-motion, never in the SSR/RM
 *    output. Meaning never depends on motion (the poster replaces the image, alt set).
 */
describe('ProductReveal — proof pipeline (P2-A)', () => {
  it('hero real image loads eager + fetchpriority=high (L7-02)', () => {
    render(
      <ProductReveal
        slug="accessmap"
        title="AccessMap"
        context="hero"
        media={{
          src: '/images/deliverables/accessmap/screen-map.png',
          avif: '/images/deliverables/accessmap/screen-map.avif',
          webp: '/images/deliverables/accessmap/screen-map.webp',
          alt: 'AccessMap map with a verified No ramp barrier flagged downtown',
        }}
      />,
    );
    const img = screen.getByRole('img', { name: /accessmap map/i });
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('in-body shot stays lazy with no fetchpriority', () => {
    render(
      <ProductReveal
        slug="dashboard"
        title="Dashboard"
        context="shot"
        media={{
          src: '/images/deliverables/dashboard/screen-home.png',
          alt: 'Dashboard home view with agent activity',
        }}
      />,
    );
    const img = screen.getByRole('img', { name: /dashboard home view/i });
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).not.toHaveAttribute('fetchpriority');
  });

  it('paints an inline LQIP data-URI (aria-hidden, no animation) behind the hero image', () => {
    const lqip = 'data:image/webp;base64,LQIPTESTTOKEN==';
    const { container } = render(
      <ProductReveal
        slug="accessmap"
        title="AccessMap"
        context="hero"
        media={{
          src: '/images/deliverables/accessmap/screen-map.png',
          lqip,
          alt: 'AccessMap map with a verified No ramp barrier flagged downtown',
        }}
      />,
    );
    // The LQIP paints as a background-image on an aria-hidden layer in the well.
    expect(container.innerHTML).toContain('LQIPTESTTOKEN');
    const img = screen.getByRole('img', { name: /accessmap map/i });
    // No blur-to-sharp reveal: the image itself carries no transition/animation.
    expect(img.className).not.toMatch(/transition|animate/);
  });

  it('uses a multi-candidate srcset when width variants are provided', () => {
    const avifSrcset =
      '/images/deliverables/prompt-library/screen.avif 1280w, /images/deliverables/prompt-library/screen-640.avif 640w';
    const { container } = render(
      <ProductReveal
        slug="prompt-library"
        title="Prompt Library"
        context="card"
        media={{
          src: '/images/deliverables/prompt-library/screen.png',
          avif: '/images/deliverables/prompt-library/screen.avif',
          avifSrcset,
          sizes: '(max-width: 700px) 100vw, 640px',
          alt: 'Prompt Library search view filtering by tag',
        }}
      />,
    );
    expect(container.querySelector('source[type="image/avif"]')).toHaveAttribute('srcset', avifSrcset);
    expect(container.querySelector('source[type="image/avif"]')).toHaveAttribute('sizes');
  });

  it('renders a proof video poster-first with NO autoplay attribute (RM-gated, ThemedMotion grammar)', () => {
    const { container } = render(
      <ProductReveal
        slug="ghost-code"
        title="Ghost Code"
        context="shot"
        media={{
          alt: 'Ghost Code round loop',
          video: {
            mp4: '/images/deliverables/ghost-code/loop.mp4',
            webm: '/images/deliverables/ghost-code/loop.webm',
            poster: '/images/deliverables/ghost-code/loop-poster.avif',
            captions: '/images/deliverables/ghost-code/loop.vtt',
            alt: 'Ghost Code round loop — capturing the right command',
          },
        }}
      />,
    );
    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute('poster', '/images/deliverables/ghost-code/loop-poster.avif');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video).toHaveAttribute('playsinline');
    // The a11y floor: autoplay is a JS-only enhancement, never in the markup.
    expect(video).not.toHaveAttribute('autoplay');
    // Post-hydration the native controls yield to ThemedMotion's visible 44px
    // pause/play affordance (SSR keeps `controls` — covered in its own suite).
    expect(video).not.toHaveAttribute('controls');
    expect(
      container.querySelector('button[aria-label*="animation"]'),
    ).not.toBeNull();
    expect(container.querySelector('source[type="video/mp4"]')).not.toBeNull();
    expect(container.querySelector('track[kind="captions"]')).toHaveAttribute('src', '/images/deliverables/ghost-code/loop.vtt');
    // A video replaces the still image entirely.
    expect(container.querySelector('img')).toBeNull();
  });

  it('a placeholder ignores a stray lqip (no data-URI painted, no img/video)', () => {
    const { container } = render(
      <ProductReveal
        slug="mutual-mesh"
        title="Mutual Mesh"
        context="card"
        media={{ alt: 'Mutual Mesh request feed', lqip: 'data:image/webp;base64,SHOULDNOTAPPEAR' }}
      />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('video')).toBeNull();
    expect(container.innerHTML).not.toContain('SHOULDNOTAPPEAR');
  });
});
