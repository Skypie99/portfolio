import { afterAll, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Call from vi.hoisted before importing a page that registers ScrollTrigger.
 * GSAP 3.15 loses its sync-interval handle on ignoreMobileResize-only config;
 * disable() therefore cannot cancel all work. The file owns that work instead.
 * These suites assert synchronous markup, not animation progression.
 */
export function ownGsapTimers() {
  vi.useFakeTimers({
    toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
      'requestAnimationFrame', 'cancelAnimationFrame'],
  });
  let stopped = false;

  async function shutdown() {
    if (stopped) return;
    try {
      cleanup();
      const [{ ScrollTrigger }, { gsap }] = await Promise.all([
        import('gsap/ScrollTrigger'), import('gsap'),
      ]);
      ScrollTrigger.disable();
      gsap.ticker.sleep();
      vi.clearAllTimers();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      // Restore even if cleanup fails; let the failure reach Vitest.
      vi.clearAllTimers();
      vi.useRealTimers();
      stopped = true;
    }
  }

  afterAll(shutdown);
  return shutdown;
}
