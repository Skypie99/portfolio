import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CountUpStat } from '@/components/CountUpStat';

const motion = vi.hoisted(() => ({ reduced: false, inView: true }));
vi.mock('@/lib/motion', () => ({
  useInViewOnce: () => [{ current: null }, motion.inView] as const,
  usePrefersReducedMotion: () => motion.reduced,
}));
let frames: Map<number, FrameRequestCallback>;
let next: number;
function advance(now: number) {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(now));
  });
}
beforeEach(() => {
  motion.reduced = false;
  motion.inView = true;
  frames = new Map(); next = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++next, callback); return next;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('CountUpStat preference transitions', () => {
  it.each(['100%', '1,680'])('settles %s and cancels frames when reduced motion is enabled mid-count', (value) => {
    const view = render(<CountUpStat value={value} emberClass="ember" label="sample" />);
    advance(10); advance(310);
    const figure = () => view.container.querySelector('p')!;
    expect(figure().textContent).not.toBe(value);
    expect(frames.size).toBe(1);
    motion.reduced = true;
    view.rerender(<CountUpStat value={value} emberClass="ember" label="sample" />);
    expect(figure().textContent).toBe(value);
    expect(figure()).not.toHaveClass('tabular-nums');
    expect(frames.size).toBe(0);
    expect(view.container.querySelector('.sr-only')?.textContent).toBe(`${value} sample`);
    advance(2000);
    motion.reduced = false;
    view.rerender(<CountUpStat value={value} emberClass="ember" label="sample" />);
    expect(figure().textContent).toBe(value);
    expect(frames.size).toBe(0);
  });
  it('does not start a new animation after a cold reduced-motion render', () => {
    motion.reduced = true;
    const view = render(<CountUpStat value="100%" emberClass="ember" label="sample" />);
    expect(view.container.querySelector('p')?.textContent).toBe('100%');
    motion.reduced = false;
    view.rerender(<CountUpStat value="100%" emberClass="ember" label="sample" />);
    expect(frames.size).toBe(0);
  });
  it('retains the normal one-shot completion', () => {
    const view = render(<CountUpStat value="100%" emberClass="ember" label="sample" />);
    advance(10); advance(910);
    expect(view.container.querySelector('p')?.textContent).toBe('100%');
    expect(frames.size).toBe(0);
  });
  it.each([['0','0'],['E2E','E2E'],['2.2 AA','2.2AA'],['0.003','0.003']])('keeps static/final %s intact', (value, visible) => {
    motion.reduced = true;
    const view = render(<CountUpStat value={value} emberClass="ember" label="sample" />);
    expect(view.container.querySelector('p')?.textContent).toBe(visible);
    expect(frames.size).toBe(0);
  });
});
