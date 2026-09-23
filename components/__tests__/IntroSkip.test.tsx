/**
 * IntroSkip tests — P2-6 (Phase B).
 *
 * Unlike the decorative "Scroll" cue, this is a real control and must carry a
 * real href, a real accessible name, and no aria-hidden. Retirement belongs to
 * the substantive identity landing, not the first intersecting pixel of the
 * page-sized content wrapper.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { IntroSkip } from '@/components/IntroSkip';

const introSkipSource = readFileSync(resolve(process.cwd(), 'components/IntroSkip.tsx'), 'utf8');

type IOEntry = { isIntersecting: boolean; intersectionRatio: number };
type IOCallback = (entries: IOEntry[]) => void;

let ioCallback: IOCallback | null = null;
let observedTargets: Element[] = [];
let disconnectCount = 0;
let ioOptions: IntersectionObserverInit | undefined;

class MockIntersectionObserver {
  constructor(cb: IOCallback, options?: IntersectionObserverInit) {
    ioCallback = cb;
    ioOptions = options;
  }
  observe(el: Element) {
    observedTargets.push(el);
  }
  unobserve() {}
  disconnect() {
    disconnectCount += 1;
  }
}

function addIdentityLanding() {
  const identity = document.createElement('div');
  identity.setAttribute('data-hero-identity', '');
  document.body.appendChild(identity);
}

beforeEach(() => {
  ioCallback = null;
  observedTargets = [];
  disconnectCount = 0;
  ioOptions = undefined;
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('IntroSkip — a real control, not decoration', () => {
  it('is a real link to #hero with a real accessible name', () => {
    addIdentityLanding();
    render(<IntroSkip />);
    const link = screen.getByRole('link', { name: /skip intro/i });
    expect(link).toHaveAttribute('href', '#hero');
    expect(link).not.toHaveAttribute('aria-hidden');
    expect(link.tabIndex).toBe(0);
  });

  it('leaves scroll, history, and focus ownership with the native fragment link', () => {
    expect(introSkipSource).not.toMatch(/\bonClick\b/);
    expect(introSkipSource).not.toMatch(/scrollIntoView|window\.scrollTo|\.focus\(/);
  });

  it('observes the substantive identity landing rather than the large content wrapper', () => {
    addIdentityLanding();
    render(<IntroSkip />);
    expect(ioCallback).not.toBeNull();
    expect(observedTargets[0]).toHaveAttribute('data-hero-identity');
    expect(ioOptions?.threshold).toEqual([0, 0.75]);
  });

  it('moves only the mobile retirement boundary while keeping the desktop observer unchanged', () => {
    const matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', matchMedia);
    addIdentityLanding();
    const { unmount } = render(<IntroSkip />);
    expect(ioOptions?.rootMargin).toBe('100000px 0px 80px 0px');
    unmount();

    matchMedia.mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(<IntroSkip />);
    expect(ioOptions?.rootMargin).toBe('100000px 0px 0px 0px');
  });
});

describe('IntroSkip — retirement contract', () => {
  it('retires when most of the identity is visible, and returns before the landing', () => {
    addIdentityLanding();
    render(<IntroSkip />);
    const link = screen.getByRole('link', { name: /skip intro/i });

    ioCallback!([{ isIntersecting: true, intersectionRatio: 0.75 }]);
    expect(link).toHaveAttribute('data-skip-done');

    ioCallback!([{ isIntersecting: false, intersectionRatio: 0 }]);
    expect(link).not.toHaveAttribute('data-skip-done');
  });

  it('stays present for a trivial or partial identity intersection', () => {
    addIdentityLanding();
    render(<IntroSkip />);
    const link = screen.getByRole('link', { name: /skip intro/i });

    ioCallback!([{ isIntersecting: true, intersectionRatio: 0 }]);
    expect(link).not.toHaveAttribute('data-skip-done');

    ioCallback!([{ isIntersecting: true, intersectionRatio: 0.74 }]);
    expect(link).not.toHaveAttribute('data-skip-done');
  });

  it('disconnects the observer on unmount', () => {
    addIdentityLanding();
    const { unmount } = render(<IntroSkip />);
    unmount();
    expect(disconnectCount).toBe(1);
  });

  it('does not crash when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    addIdentityLanding();
    expect(() => render(<IntroSkip />)).not.toThrow();
  });
});
