/**
 * RailInert tests — defects repair R3 (2026-06-12).
 *
 * RailInert toggles the native `inert` attribute on the desktop rail
 * ([data-rail]) while the homepage's pinned desert stage fully obscures it,
 * deriving the pin state from one IntersectionObserver on the content
 * wrapper (the stage's next in-flow sibling). These tests stub IO and
 * assert the contract:
 *   - inert engages when the content is NOT intersecting (stage covers all)
 *   - inert releases when the content enters the viewport (pin ended)
 *   - unmount cleanup disconnects and removes inert (route changes)
 *   - no-op when the animated stage is absent (reduced-motion static frame)
 *   - no crash when IntersectionObserver is unavailable
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { RailInert } from '@/components/RailInert';

type IOEntry = { isIntersecting: boolean };
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

/** Build the homepage DOM fixtures RailInert queries for. */
function addFixtures({ withStage = true } = {}) {
  if (withStage) {
    const stage = document.createElement('section');
    stage.className = 'cdesert-stage';
    document.body.appendChild(stage);
  }
  const content = document.createElement('div');
  content.className = 'cinematic-content-reveal';
  document.body.appendChild(content);

  const rail = document.createElement('nav');
  rail.setAttribute('data-rail', '');
  document.body.appendChild(rail);
  return rail;
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

describe('RailInert', () => {
  it('engages inert while content is obscured and releases when it enters', () => {
    const rail = addFixtures();
    render(<RailInert />);

    expect(ioCallback).not.toBeNull();
    expect(observedTargets[0]?.className).toBe('cinematic-content-reveal');

    // Top of page: stage fully covers the viewport, content off-screen.
    ioCallback!([{ isIntersecting: false }]);
    expect(rail.hasAttribute('inert')).toBe(true);

    // Scrolled past the pin: content enters from the bottom — release.
    ioCallback!([{ isIntersecting: true }]);
    expect(rail.hasAttribute('inert')).toBe(false);

    // Scrolled back up: re-engage (the stage covers the chrome again).
    ioCallback!([{ isIntersecting: false }]);
    expect(rail.hasAttribute('inert')).toBe(true);
  });

  it('disconnects and removes inert on unmount (client navigation away)', () => {
    const rail = addFixtures();
    const { unmount } = render(<RailInert />);

    ioCallback!([{ isIntersecting: false }]);
    expect(rail.hasAttribute('inert')).toBe(true);

    unmount();
    expect(disconnectCount).toBe(1);
    expect(rail.hasAttribute('inert')).toBe(false);
  });

  it('no-ops when the animated stage is absent (reduced-motion static frame)', () => {
    const rail = addFixtures({ withStage: false });
    render(<RailInert />);

    // Engage gate bails — no observer wired, rail never inert.
    expect(ioCallback).toBeNull();
    expect(observedTargets).toHaveLength(0);
    expect(rail.hasAttribute('inert')).toBe(false);
  });

  it('does not crash when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const rail = addFixtures();
    expect(() => render(<RailInert />)).not.toThrow();
    expect(rail.hasAttribute('inert')).toBe(false);
  });
});
