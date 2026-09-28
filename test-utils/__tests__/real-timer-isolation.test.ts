import { expect, it, vi } from 'vitest';

it('keeps real timers in an unrelated test environment', async () => {
  expect(vi.isFakeTimers()).toBe(false);
  await new Promise<void>((resolve) => setTimeout(resolve, 1));
});
