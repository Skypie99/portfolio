/**
 * The homepage flagship room as an exhibit (Creative Release 7 candidate,
 * 2026-10-22): the capture on an open stage with a detail plate beside it.
 *
 * Guards what the room now promises: one detail plate, decorative and cut
 * from the very file the device frame shows; the capture itself still the
 * room's one accessible image; the bare hero's slab switched off in this
 * room only; the stage proportions the leader geometry depends on; and the
 * module's motion floors (rest = visible, ramp tokens only, transform only).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render, within } from '@testing-library/react';

// Own timers before GSAP module evaluation, for this file only.
await vi.hoisted(async () => {
  const { ownGsapTimers } = await import('../../test-utils/gsap-teardown');
  ownGsapTimers();
});

import HomePage from '@/app/page';
import { CAPTURE_DETAILS } from '@/lib/captureDetail';

const ROOT = process.cwd();

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(cleanup);

function room(container: HTMLElement) {
  const el = container.querySelector<HTMLElement>('#flagship');
  expect(el).not.toBeNull();
  return el!;
}

describe('Flagship room — the detail plate', () => {
  it('shows exactly one detail plate, cut from the file the device frame shows', () => {
    const { container } = render(<HomePage />);
    const r = room(container);
    const plates = r.querySelectorAll('[data-exhibit-detail]');
    expect(plates).toHaveLength(1);
    const plateImg = plates[0].querySelector('img')!;
    const frameImg = r.querySelector('.pr-screen img')!;
    expect(plateImg.getAttribute('src')).toBe(frameImg.getAttribute('src'));
    expect(plateImg.getAttribute('src')).toBe(CAPTURE_DETAILS.flagstone.src);
    // Same <source> URLs too, so the browser serves both from one request.
    const srcsets = (el: Element) => Array.from(el.querySelectorAll('source')).map((s) => s.getAttribute('srcset'));
    expect(srcsets(plates[0])).toEqual(srcsets(r.querySelector('.pr-screen')!));
  });

  it("keeps the capture the room's one accessible image, with its own alt", () => {
    const { container } = render(<HomePage />);
    const imgs = within(room(container)).getAllByRole('img');
    expect(imgs).toHaveLength(1);
    expect(imgs[0].getAttribute('alt')).toMatch(/^Flagstone's Explore map/);
  });

  it('hides the plate and the stage light from assistive technology', () => {
    const { container } = render(<HomePage />);
    const r = room(container);
    expect(r.querySelector('[data-exhibit-detail]')).toHaveAttribute('aria-hidden', 'true');
    const stage = r.querySelector('[data-exhibit-detail]')!.closest('.relative.isolate')!;
    expect(stage.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('hands the leader the 6% gap, in plate-widths, through --leader-span', () => {
    const { container } = render(<HomePage />);
    const grid = room(container).querySelector('[data-exhibit-detail]')!.parentElement as HTMLElement;
    // 6% of the stage is 12% of a plate that is 50% of it.
    expect(grid.style.getPropertyValue('--leader-span')).toBe('12%');
  });

  it('reserves the capture-fitted frame height (zero letterbox) and fits the frame to it', () => {
    const { container } = render(<HomePage />);
    const r = room(container);
    const frame = r.querySelector('.pr-frame-phone')!;
    expect(frame.className).toMatch(/pr-frame--fit-capture/);
    const spacer = frame.closest('.hero-settle-img')!.firstElementChild as HTMLElement;
    const { width, height } = CAPTURE_DETAILS.flagstone;
    // (width − 1.125rem of frame padding and border) × the capture's aspect,
    // plus that 1.125rem; jsdom may reorder the calc() terms, so read them.
    const padding = spacer.style.paddingTop;
    expect(padding.startsWith('calc(')).toBe(true);
    expect(padding).toContain(String(height / width));
    expect(padding).toContain('(100% - 1.125rem)');
    expect(padding.match(/1\.125rem/g)).toHaveLength(2);
  });

  it('gives the stage the larger lg track when the plate is present', () => {
    const { container } = render(<HomePage />);
    const grid = room(container).querySelector('.grid') as HTMLElement;
    expect(grid.className).toMatch(/lg:grid-cols-\[0\.8fr_1\.2fr\]/);
  });
});

describe('Flagship room — the open stage is scoped to this room', () => {
  const css = readFileSync(join(ROOT, 'app/globals.css'), 'utf8');

  it('switches the bare hero slab, horizon and lamp off under #flagship only', () => {
    expect(css).toMatch(/#flagship \.pr-world,\s*#flagship \.pr-horizon,\s*#flagship \.pr-lamp\s*\{\s*display: none;\s*\}/);
    // Nowhere else are they switched off: every case-study hero keeps them.
    const offRules = css.match(/\.pr-(world|horizon)[^{]*\{[^}]*display:\s*none/g) ?? [];
    expect(offRules.every((rule) => rule.includes('#flagship'))).toBe(true);
  });
});

describe('exhibitDetail.module.css — the stage composition releases by width in em', () => {
  const css = readFileSync(join(ROOT, 'components/exhibitDetail.module.css'), 'utf8');
  const sideBySide = /@media \(min-width: 640px\)\s*\{\s*@container \(min-width: 20em\)\s*\{([\s\S]*?)\n  \}\n\}/.exec(css);

  it('makes the stage a size container and stacks by default, leader hidden', () => {
    expect(css).toMatch(/\.stage\s*\{[^}]*container-type: inline-size;/);
    expect(css).toMatch(/\.grid\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\);/);
    expect(css).toMatch(/\.leader,\s*\.pin\s*\{\s*display: none;\s*\}/);
  });

  it('stands plate beside screen 50 : 44 with a 6% gap only from sm AND at 20em or wider', () => {
    expect(sideBySide, 'the side-by-side block exists inside @media + @container').not.toBeNull();
    const block = sideBySide![1];
    expect(block).toContain('grid-template-columns: minmax(0, 50fr) minmax(0, 44fr);');
    expect(block).toContain('column-gap: 6%;');
    expect(block).toMatch(/\.leader,\s*\.pin\s*\{\s*display: block;/);
    expect(block).toMatch(/\.caption\s*\{[^}]*grid-column: 1 \/ -1;[^}]*text-align: right;/);
  });
});

describe('exhibitDetail.module.css — the leader draws once, and rests drawn for everyone else', () => {
  const css = readFileSync(join(ROOT, 'components/exhibitDetail.module.css'), 'utf8');

  it('arms nothing outside html.js + no-preference', () => {
    const armed = css.indexOf('transform: scaleX(0);');
    expect(armed).toBeGreaterThan(css.indexOf('@media (prefers-reduced-motion: no-preference)'));
    expect(css.slice(armed - 80, armed)).toContain(':global(html.js) .leader');
    expect(css.match(/scaleX\(0\)/g)).toHaveLength(1);
  });

  it('reads the ramp: no literal durations, and never the intro curve', () => {
    expect(css).not.toMatch(/\b(animation|transition)(-duration|-delay)?\s*:[^;]*\d+(\.\d+)?m?s\b/);
    expect(css).not.toContain('--ease-cinematic');
    expect(css).not.toContain('0.83, 0, 0.17, 1');
    expect(css).toContain('var(--dur-scene) var(--ease-gh-glide)');
  });

  it('animates the transform only, and keeps the house failure floors', () => {
    expect(css).not.toMatch(/transition\s*:\s*(opacity|all|width|height|left|top)/);
    expect(css).toContain(':global(html.reveal-failsafe) .leader');
    expect(css).toContain(':global(html.reveal-seat) .leader');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.leader\s*\{\s*transform: none !important;/);
    expect(css).toMatch(/@media print\s*\{\s*\.leader\s*\{\s*transform: none !important;/);
  });
});
