/**
 * IntroSkip tests — P2-6 (Phase B).
 *
 * Mirrors IntroScrollCue's retirement-contract tests (same IntersectionObserver
 * mock, same `.cinematic-content-reveal` target), but asserts the OPPOSITE nav
 * semantics: unlike the decorative "Scroll" cue, this is a real control and
 * must carry a real href, a real accessible name, and no aria-hidden.
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

class MockIntersectionObserver {
  constructor(cb: IOCallback) {
    ioCallback = cb;
  }
  observe(el: Element) {
    observedTargets.push(el);
  }
  unobserve() {}
  disconnect() {
    disconnectCount += 1;
  }
}

function addContentWrapper() {
  const content = document.createElement('div');
  content.className = 'cinematic-content-reveal';
  document.body.appendChild(content);
}

beforeEach(() => {
  ioCallback = null;
  observedTargets = [];
  disconnectCount = 0;
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('IntroSkip — a real control, not decoration', () => {
  it('is a real link to #hero with a real accessible name', () => {
    addContentWrapper();
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

  it('observes the same retirement target IntroScrollCue uses', () => {
    addContentWrapper();
    render(<IntroSkip />);
    expect(ioCallback).not.toBeNull();
    expect(observedTargets[0]?.className).toBe('cinematic-content-reveal');
  });
});

describe('IntroSkip — retirement contract', () => {
  it('retires when content intersects with a real ratio, and returns off-screen', () => {
    addContentWrapper();
    render(<IntroSkip />);
    const link = screen.getByRole('link', { name: /skip intro/i });

    ioCallback!([{ isIntersecting: true, intersectionRatio: 0.5 }]);
    expect(link).toHaveAttribute('data-skip-done');

    ioCallback!([{ isIntersecting: false, intersectionRatio: 0 }]);
    expect(link).not.toHaveAttribute('data-skip-done');
  });

  it('stays present on the exact 0px edge-touch (reduced-motion static frame)', () => {
    addContentWrapper();
    render(<IntroSkip />);
    const link = screen.getByRole('link', { name: /skip intro/i });

    ioCallback!([{ isIntersecting: true, intersectionRatio: 0 }]);
    expect(link).not.toHaveAttribute('data-skip-done');
  });

  it('disconnects the observer on unmount', () => {
    addContentWrapper();
    const { unmount } = render(<IntroSkip />);
    unmount();
    expect(disconnectCount).toBe(1);
  });

  it('does not crash when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    addContentWrapper();
    expect(() => render(<IntroSkip />)).not.toThrow();
  });
});
