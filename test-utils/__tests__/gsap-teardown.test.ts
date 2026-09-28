import { expect, it, vi } from 'vitest';

const { shutdown } = await vi.hoisted(async () => {
  const { ownGsapTimers } = await import('../gsap-teardown');
  return { shutdown: ownGsapTimers() };
});

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

it('owns lost interval generations before imports and restores timers idempotently', async () => {
  expect(vi.isFakeTimers()).toBe(true);
  window.matchMedia = vi.fn().mockImplementation((media: string) => ({
    matches: false, media, addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
  window.scrollTo = vi.fn();
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  ScrollTrigger.disable();
  gsap.ticker.sleep();
  // Negative control: the real plugin's disable/sleep leaves orphaned work.
  expect(vi.getTimerCount()).toBeGreaterThan(0);
  ScrollTrigger.enable();
  ScrollTrigger.config({ ignoreMobileResize: true });
  ScrollTrigger.disable();
  gsap.ticker.sleep();
  expect(vi.getTimerCount()).toBeGreaterThan(1);
  await shutdown();
  expect(vi.isFakeTimers()).toBe(false);
  await shutdown();
  expect(vi.isFakeTimers()).toBe(false);
  // Removing the independent cancellation makes this assertion fail.
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
});
