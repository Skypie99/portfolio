/**
 * ThemeColorSync (CC1) — the toolbar metadata follows the SITE's theme.
 *
 * jsdom cannot paint browser chrome, so this locks the DOM contract that the
 * chrome reader actually consumes: after mount there is exactly ONE
 * `meta[name="theme-color"]`, it has no `media` gate, and its content flips
 * with the `html.dark` class in both directions.
 */
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeColorSync } from '@/components/ThemeColorSync';
import { THEME_COLORS } from '@/lib/theme';

let resolvedTheme = 'light';
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme }),
}));

const metas = () =>
  Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));

beforeEach(() => {
  resolvedTheme = 'light';
  document.head.innerHTML = '';
  document.documentElement.classList.remove('dark');
  for (const media of ['(prefers-color-scheme: light)', '(prefers-color-scheme: dark)']) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.media = media;
    meta.content = media.includes('dark') ? THEME_COLORS.dark : THEME_COLORS.light;
    document.head.appendChild(meta);
  }
});

afterEach(cleanup);

describe('theme-color sync (CC1)', () => {
  it('collapses the OS-media fallback pair into one ungated runtime tag', () => {
    render(<ThemeColorSync />);
    expect(metas()).toHaveLength(1);
    expect(metas()[0].hasAttribute('media')).toBe(false);
    expect(metas()[0].content).toBe(THEME_COLORS.light);
  });

  it('follows the class in BOTH directions', async () => {
    render(<ThemeColorSync />);
    await act(async () => {
      document.documentElement.classList.add('dark');
    });
    expect(metas()[0].content).toBe(THEME_COLORS.dark);

    await act(async () => {
      document.documentElement.classList.remove('dark');
    });
    expect(metas()[0].content).toBe(THEME_COLORS.light);
  });

  it('creates the tag when the head has none', () => {
    document.head.innerHTML = '';
    render(<ThemeColorSync />);
    expect(metas()).toHaveLength(1);
    expect(metas()[0].content).toBe(THEME_COLORS.light);
  });

  it('restores the tag when a client navigation swaps <head> metadata', async () => {
    render(<ThemeColorSync />);
    expect(metas()).toHaveLength(1);
    // What Next's App Router does to the head on an in-site link: the runtime
    // tag is dropped (measured meta count 1 -> 0 on / -> /blog/).
    await act(async () => {
      document.head.innerHTML = '';
    });
    expect(metas()).toHaveLength(1);
    expect(metas()[0].content).toBe(THEME_COLORS.light);
  });

  it('stops observing after unmount', async () => {
    const view = render(<ThemeColorSync />);
    view.unmount();
    document.documentElement.classList.add('dark');
    await Promise.resolve();
    // The tag left behind keeps its last painted value; nothing rewrites it.
    expect(metas()[0].content).toBe(THEME_COLORS.light);
    document.documentElement.classList.remove('dark');
  });
});
