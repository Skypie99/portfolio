/**
 * RevealAlive tests — the reveal failure floor's hydration-alive signal (L7-01).
 *
 * The inline <head> guard arms an ~8s watchdog (window.__revealFailsafe) that
 * rescues content to visible if hydration never happens. RevealAlive's layout
 * effect runs only when React actually hydrates, and must clear that watchdog —
 * otherwise a healthy load would flip to the failsafe rest state after 8s and
 * flatten the scroll choreography.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { RevealAlive } from '@/components/RevealAlive';

afterEach(() => {
  cleanup();
  window.__revealFailsafe = undefined;
});

describe('RevealAlive', () => {
  it('renders nothing', () => {
    const { container } = render(<RevealAlive />);
    expect(container).toBeEmptyDOMElement();
  });

  it('clears the reveal-floor watchdog on mount (proves the bundle executed)', () => {
    const spy = vi.spyOn(window, 'clearTimeout');
    window.__revealFailsafe = setTimeout(() => {}, 8000);
    render(<RevealAlive />);
    expect(spy).toHaveBeenCalled();
    expect(window.__revealFailsafe).toBeUndefined();
    spy.mockRestore();
  });

  it('is a no-op when no watchdog is armed', () => {
    window.__revealFailsafe = undefined;
    expect(() => render(<RevealAlive />)).not.toThrow();
    expect(window.__revealFailsafe).toBeUndefined();
  });
});
