/**
 * ViewTransitions interceptor tests (view-transitions 2026-06-05).
 *
 * The cross-dissolve itself needs a real View Transitions engine (jsdom has
 * none), so these tests cover the part that IS pure DOM/URL reasoning and must
 * be correct: the SKIP LOGIC that decides whether a click is taken over.
 *
 * Signal: an intercepted same-origin click drives navigation through the mocked
 * router (jsdom has no startViewTransition, so it takes the plain `router.push`
 * fallback). So `push` firing ⇒ the click was taken over; `push` NOT firing ⇒
 * the click was left to the browser. A bubble-phase preventer is installed so
 * jsdom never actually follows the un-intercepted anchors (which would only emit
 * harmless "Not implemented: navigation" noise) — it runs AFTER the component's
 * capture-phase listener, so it never changes whether `push` fired.
 *
 * `next/navigation` is mocked because `useRouter` needs App Router context jsdom
 * does not provide (same pattern as HamburgerNav.test.tsx mocking usePathname).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import { ViewTransitions } from '@/components/ViewTransitions';

const suppressNav = (e: Event) => e.preventDefault();

/** Build an <a>, append it, dispatch a plain (or modified) left-click, detach. */
function clickAnchor(attrs: Record<string, string>, init: MouseEventInit = {}): void {
  const a = document.createElement('a');
  for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v);
  a.textContent = 'link';
  document.body.appendChild(a);
  a.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }),
  );
  a.remove();
}

beforeEach(() => {
  pushMock.mockClear();
  render(<ViewTransitions />); // attaches the capture-phase document listener
  // Bubble phase, so jsdom's default navigation is canceled for every test
  // anchor without affecting the capture-phase interceptor's decision.
  document.addEventListener('click', suppressNav);
});

afterEach(() => {
  document.removeEventListener('click', suppressNav);
  cleanup();
  document.body.innerHTML = '';
  window.history.pushState({}, '', '/'); // restore jsdom location between tests
});

describe('ViewTransitions interceptor', () => {
  it('intercepts a plain left-click on a same-origin internal link', () => {
    clickAnchor({ href: '/work/access-map/' });
    expect(pushMock).toHaveBeenCalledWith('/work/access-map/');
  });

  it('preserves the hash + query on an intercepted cross-page link', () => {
    clickAnchor({ href: '/work/?filter=ai#grid' });
    expect(pushMock).toHaveBeenCalledWith('/work/?filter=ai#grid');
  });

  it('still navigates to the homepage (instant-cut path) from another page', () => {
    // From a non-root page, a click to '/' is intercepted and navigates, but
    // takes the instant-cut branch (no View Transition) to protect the cinematic.
    window.history.pushState({}, '', '/work/access-map/');
    clickAnchor({ href: '/' });
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('treats a click to the current URL as a no-op (not intercepted)', () => {
    // jsdom location is http://localhost/ → a link to '/' is the same page.
    clickAnchor({ href: '/' });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept an external link', () => {
    clickAnchor({ href: 'https://github.com/skypie99' });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept a mailto: link', () => {
    clickAnchor({ href: 'mailto:hello@example.com' });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept a target=_blank link', () => {
    clickAnchor({ href: '/work/', target: '_blank' });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept a download link', () => {
    clickAnchor({ href: '/resume.pdf', download: '' });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept a modifier (cmd/ctrl) click', () => {
    clickAnchor({ href: '/work/' }, { metaKey: true });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('does NOT intercept a same-page in-page hash link', () => {
    // jsdom location is http://localhost/ → '/#work' is a same-path fragment.
    clickAnchor({ href: '/#work' });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
