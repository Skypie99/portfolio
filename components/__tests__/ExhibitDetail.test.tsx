/**
 * ExhibitDetail — the flagship room's detail plate (Creative Release 7
 * candidate, 2026-10-22).
 *
 * Pins the plate's contract: it is decorative by construction (one
 * aria-hidden subtree, an empty alt, nothing focusable), it requests exactly
 * the capture URLs it is given (so it shares the device frame's download),
 * it places the whole capture by the spec's geometry, and its leader and pin
 * exist only from `sm`, where the screen stands beside it.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { ExhibitDetail } from '@/components/ExhibitDetail';
import { CAPTURE_DETAILS, cropGeometry } from '@/lib/captureDetail';

afterEach(cleanup);

const detail = CAPTURE_DETAILS.flagstone;
const sources = {
  src: '/showcase/flagstone/explore-current.phone.webp',
  avif: '/showcase/flagstone/explore-current.phone.avif',
  webp: '/showcase/flagstone/explore-current.phone.webp',
};

describe('ExhibitDetail', () => {
  it('is one aria-hidden subtree with an empty-alt image and nothing focusable', () => {
    const { container } = render(<ExhibitDetail detail={detail} sources={sources} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveAttribute('data-exhibit-detail');
    const imgs = root.querySelectorAll('img');
    expect(imgs).toHaveLength(1);
    expect(imgs[0]).toHaveAttribute('alt', '');
    expect(root.querySelectorAll('a, button, input, select, textarea, [tabindex]')).toHaveLength(0);
  });

  it('requests exactly the capture URLs it is given, AVIF first, lazily', () => {
    const { container } = render(<ExhibitDetail detail={detail} sources={sources} />);
    const sourcesEls = Array.from(container.querySelectorAll('source'));
    expect(sourcesEls.map((s) => [s.getAttribute('type'), s.getAttribute('srcset')])).toEqual([
      ['image/avif', sources.avif],
      ['image/webp', sources.webp],
    ]);
    const img = container.querySelector('img')!;
    expect(img.getAttribute('src')).toBe(sources.src);
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('width', String(detail.width));
    expect(img).toHaveAttribute('height', String(detail.height));
  });

  it('places the whole capture by the spec geometry inside a box of the crop aspect', () => {
    const { container } = render(<ExhibitDetail detail={detail} sources={sources} />);
    const box = container.querySelector('img')!.closest('picture')!.parentElement as HTMLElement;
    const g = cropGeometry(detail);
    expect(box.style.aspectRatio).toBe(g.aspect);
    expect(box.style.getPropertyValue('--crop-scale')).toBe(String(g.scale));
    expect(box.style.getPropertyValue('--crop-x')).toBe(String(g.x));
    expect(box.style.getPropertyValue('--crop-y')).toBe(String(g.y));
    expect(box.className).toMatch(/overflow-hidden/);
  });

  it('carries the leader and its pin inside the hidden subtree, visibility left to the stage rule', () => {
    const { container } = render(<ExhibitDetail detail={detail} sources={sources} />);
    const marks = Array.from(container.querySelectorAll('span.bg-terracotta'));
    expect(marks).toHaveLength(2);
    for (const m of marks) {
      // No viewport utility decides it: exhibitDetail.module.css shows them
      // only in the side-by-side composition (guarded in flagship-exhibit).
      expect(m.className).not.toMatch(/\b(hidden|sm:block)\b/);
      expect(m.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it('names itself for what it is, in the room caption register', () => {
    const { container } = render(<ExhibitDetail detail={detail} sources={sources} />);
    const tag = container.querySelector('p')!;
    expect(tag.textContent).toBe('Detail of the same capture');
    expect(tag.className).toMatch(/font-mono/);
    // The Release 5 caption pair: text-meta measured 3.56:1 over the dark
    // stage light at 393, ink clears it.
    expect(tag.className).toMatch(/\btext-ink-muted\b/);
    expect(tag.className).toMatch(/\bdark:text-ink\b/);
    expect(tag.className).not.toMatch(/text-text-meta/);
  });
});
