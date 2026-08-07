/**
 * Button smoke tests — Cycle 38 (Gary).
 *
 * Button is polymorphic: renders <a> when href is provided, <button> otherwise.
 * It appears on every page of the portfolio (Hero, Sidebar, about, work/[slug],
 * contact, certificates) so this component is high-value to pin.
 *
 * These tests cover:
 *   1. Anchor rendering when href is provided
 *   2. Button rendering when no href is provided
 *   3. className merge — cn() preserves base classes when className prop passed
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { Button } from '@/components/Button';

afterEach(() => {
  cleanup();
});

describe('Button', () => {
  it('renders an <a> element when href is provided', () => {
    render(<Button href="/work/">View work</Button>);
    const el = screen.getByRole('link', { name: /view work/i });
    expect(el.tagName).toBe('A');
    expect(el).toHaveAttribute('href', '/work/');
  });

  it('renders a <button> element when no href is provided', () => {
    render(<Button>Get in touch</Button>);
    const el = screen.getByRole('button', { name: /get in touch/i });
    expect(el.tagName).toBe('BUTTON');
    // No href attribute on a <button>
    expect(el).not.toHaveAttribute('href');
  });

  it('merges additional className via cn() without dropping base classes', () => {
    render(<Button className="test-extra">Contact</Button>);
    const el = screen.getByRole('button', { name: /contact/i });
    // Custom class is applied…
    expect(el).toHaveClass('test-extra');
    // …and the base design-system classes are preserved.
    expect(el).toHaveClass('bg-canvas');
    expect(el).toHaveClass('rounded-pill');
    expect(el).toHaveClass('font-mono');
  });
});
