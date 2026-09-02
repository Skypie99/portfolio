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
        slug="flagstone"
        title="Flagstone"
        context="hero"
        bare
        media={{ alt: 'Flagstone map view with accessibility pins' }}
      />,
    );
    expect(hero.container.querySelector('.pr-lamp')).not.toBeNull();
    expect(hero.container.querySelector('.pr-lamp')).toHaveAttribute('aria-hidden', 'true');
    cleanup();

    const card = render(
      <ProductReveal
        slug="flagstone"
        title="Flagstone"
        context="card"
        media={{ alt: 'Flagstone map view with accessibility pins' }}
      />,
    );
    expect(card.container.querySelector('.pr-lamp')).toBeNull();
  });

  it('renders the golden-hour placeholder (no <img>) when no real src is given', () => {
    const { container } = render(
      <ProductReveal
        slug="flagstone"
        title="Flagstone"
        eyebrow="Solo builder"
        context="hero"
        media={{ alt: 'Flagstone map view with accessibility pins' }}
      />,
    );

    // Placeholder paints pure CSS — never an <img>.
    expect(container.querySelector('img')).toBeNull();
    // The hero placeholder draws the product wordmark (decorative; the page's
    // real <h1> lives in the case-study column).
    expect(screen.getByText('Flagstone')).toBeInTheDocument();
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
        slug="flagstone"
        title="Flagstone"
        context="shot"
        media={{ alt: 'Flagstone report flow' }}
      />,
    );

    // The designed empty state is present — a device silhouette on the lit stage.
    const placeholder = container.querySelector('[data-pr-placeholder="designed"]');
    expect(placeholder).not.toBeNull();
    // It carries no <img> and no wordmark …
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByText('Flagstone')).not.toBeInTheDocument();
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
        slug="flagstone"
        title="Flagstone"
        context="hero"
        media={{
          src: '/images/deliverables/flagstone/screen-map.png',
          avif: '/images/deliverables/flagstone/screen-map.avif',
          webp: '/images/deliverables/flagstone/screen-map.webp',
          alt: 'Flagstone map with a verified No ramp barrier flagged downtown',
        }}
      />,
    );
    const img = screen.getByRole('img', { name: /flagstone map/i });
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
        slug="flagstone"
        title="Flagstone"
        context="hero"
        media={{
          src: '/images/deliverables/flagstone/screen-map.png',
          lqip,
          alt: 'Flagstone map with a verified No ramp barrier flagged downtown',
        }}
      />,
    );
    // The LQIP paints as a background-image on an aria-hidden layer in the well.
    expect(container.innerHTML).toContain('LQIPTESTTOKEN');
    const img = screen.getByRole('img', { name: /flagstone map/i });
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

/**
 * Cook Out · Dark Shot Forwarding Repair — the routing invariant behind the
 * `dark: shot.dark` forwarding fix in app/work/[slug]/page.tsx. The call-site
 * guard (lib/__tests__/shot-dark-forwarding.test.ts) proves the field reaches
 * this component; this block proves what the component DOES with it — a media
 * object carrying `dark` must enter the dual-theme ThemedShowcase/ThemedMotion
 * path with one layer per theme — and that the two paths the fix must not
 * disturb (single-source legacy media, Prompt 2's matte) are unchanged.
 */
describe('ProductReveal — a dark twin routes into the dual-theme path (Cook Out dark-shot forwarding)', () => {
  const still = {
    src: '/showcase/dashboard/think-tank.light.desktop.webp',
    avif: '/showcase/dashboard/think-tank.light.desktop.avif',
    webp: '/showcase/dashboard/think-tank.light.desktop.webp',
    lqip: 'data:image/webp;base64,LIGHTLQIP',
    alt: 'The Think Tank triage board',
  };
  const darkStill = {
    src: '/showcase/dashboard/think-tank.dark.desktop.webp',
    avif: '/showcase/dashboard/think-tank.dark.desktop.avif',
    webp: '/showcase/dashboard/think-tank.dark.desktop.webp',
    lqip: 'data:image/webp;base64,DARKLQIP',
  };
  const clip = {
    mp4: '/showcase/ghost-code/clips/round.light.phone.mp4',
    webm: '/showcase/ghost-code/clips/round.light.phone.webm',
    poster: '/showcase/ghost-code/clips/round.light.phone-poster.avif',
    alt: 'A Ghost Code round in motion',
  };
  const darkClip = {
    mp4: '/showcase/ghost-code/clips/round.dark.phone.mp4',
    webm: '/showcase/ghost-code/clips/round.dark.phone.webm',
    poster: '/showcase/ghost-code/clips/round.dark.phone-poster.avif',
  };

  it('a still with a dark twin renders ThemedShowcase in themed mode: one layer per theme, each sourcing its own variant', () => {
    const { container } = render(
      <ProductReveal slug="dashboard" title="Dashboard" context="shot" media={{ ...still, dark: darkStill }} />,
    );
    expect(container.querySelector('[data-themed-showcase]')).toHaveAttribute('data-themed-showcase', 'themed');
    expect(container.querySelector('[data-themed-motion]')).toBeNull();
    const light = container.querySelector('.ts-layer--light');
    const dark = container.querySelector('.ts-layer--dark');
    expect(light?.querySelector('img')).toHaveAttribute('src', still.src);
    expect(dark?.querySelector('img')).toHaveAttribute('src', darkStill.src);
    expect(dark?.querySelector('source[type="image/avif"]')).toHaveAttribute('srcset', darkStill.avif);
    expect(dark?.innerHTML).toContain('DARKLQIP');
    // Exactly the pair — and never the matte mat, which is for mono captures.
    expect(container.querySelectorAll('img')).toHaveLength(2);
    expect(container.querySelector('.ts-matte')).toBeNull();
  });

  it('a clip with a dark clip renders ThemedMotion in themed mode: the dark <video> sources the dark mp4/webm/poster', () => {
    const { container } = render(
      <ProductReveal
        slug="ghost-code"
        title="Ghost Code"
        context="shot"
        media={{ ...still, alt: clip.alt, video: clip, dark: { ...darkStill, video: darkClip } }}
      />,
    );
    expect(container.querySelector('[data-themed-motion]')).toHaveAttribute('data-themed-motion', 'themed');
    expect(container.querySelectorAll('video')).toHaveLength(2);
    const dark = container.querySelector('.ts-layer--dark video');
    expect(dark).toHaveAttribute('poster', darkClip.poster);
    expect(dark?.querySelector('source[type="video/mp4"]')).toHaveAttribute('src', darkClip.mp4);
    expect(dark?.querySelector('source[type="video/webm"]')).toHaveAttribute('src', darkClip.webm);
    expect(container.querySelector('.ts-layer--light video source[type="video/mp4"]')).toHaveAttribute('src', clip.mp4);
    // A video replaces the still entirely — in BOTH layers.
    expect(container.querySelector('img')).toBeNull();
  });

  it('the dark layer is what the dark-theme CSS gate reveals — a pair always offers a --dark layer to switch TO', () => {
    // globals.css: `.ts-layer--dark { display:none }` / `html.dark .ts-layer--dark
    // { display:block }` / `html.dark .ts-layer--light { display:none }`. The
    // reproduced defect was a lone `ts-layer--light` in dark theme (hidden, no
    // twin) — a real pair must render exactly one light and one dark layer.
    const { container } = render(
      <ProductReveal slug="claude-corp" title="Claude Corp" context="shot" media={{ ...still, dark: darkStill }} />,
    );
    const layers = Array.from(container.querySelectorAll('.ts-layer'));
    expect(layers.map((l) => l.classList.contains('ts-layer--dark'))).toEqual([false, true]);
    expect(layers.map((l) => l.classList.contains('ts-layer--light'))).toEqual([true, false]);
  });

  it('single-source media (no dark, no matte) still takes the legacy path untouched: no themed host, no layers, one <img>', () => {
    const { container } = render(
      <ProductReveal slug="prompt-library" title="Prompt Library" context="shot" media={{ ...still }} />,
    );
    expect(container.querySelector('[data-themed-showcase]')).toBeNull();
    expect(container.querySelector('[data-themed-motion]')).toBeNull();
    expect(container.querySelector('.ts-layer')).toBeNull();
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('img')).toHaveAttribute('src', still.src);
  });

  it('a single-source clip still takes ThemedMotion single mode: one <video>, no dark layer', () => {
    const { container } = render(
      <ProductReveal slug="ghost-code" title="Ghost Code" context="shot" media={{ alt: clip.alt, video: clip }} />,
    );
    expect(container.querySelector('[data-themed-motion]')).toHaveAttribute('data-themed-motion', 'single');
    expect(container.querySelectorAll('video')).toHaveLength(1);
    expect(container.querySelector('.ts-layer--dark')).toBeNull();
  });

  it('matte media still takes the matte path (Prompt 2 · Part C): one layer on the exhibit mat, no dark layer', () => {
    const { container } = render(
      <ProductReveal
        slug="flagstone"
        title="Flagstone"
        context="shot"
        media={{ alt: clip.alt, video: clip, matte: 'dark-mono' }}
      />,
    );
    expect(container.querySelector('[data-themed-motion]')).toHaveAttribute('data-themed-motion', 'matte');
    expect(container.querySelector('.ts-matte .ts-matte-well video')).not.toBeNull();
    expect(container.querySelectorAll('video')).toHaveLength(1);
    expect(container.querySelector('.ts-layer--dark')).toBeNull();
  });
});
