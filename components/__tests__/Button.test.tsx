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

/**
 * The press language — signature-interaction refinement (2026-10-19; concept
 * M-CON-002 A r2). jsdom has no layout engine and vitest runs css:false, so the
 * classes are the contract here (the TapTargets guard's idiom); the rendered,
 * measured proof is the playwright rig banked under
 * qa-reports/2026-10-19_InteractionRefinement-evidence/.
 */
const classesOf = (el: Element) => el.className.split(/\s+/).filter(Boolean);
/** Every hover utility that is NOT wrapped in the hover-capable media gate. */
const bareHovers = (el: Element) =>
  classesOf(el).filter((c) => /(^|:)hover:/.test(c) && !c.startsWith('[@media(hover:hover)]:'));
const dotOf = (el: Element) => el.querySelector('span[aria-hidden="true"].rounded-full') as HTMLElement;

describe('Button — the press language', () => {
  it('answers a press with the terracotta hairline, the restrained tint and the half-fast rung', () => {
    render(<Button href="/work/">View work</Button>);
    const el = screen.getByRole('link', { name: /view work/i });
    expect(el).toHaveClass(
      'active:!border-accent-primary',
      'active:!bg-accent/10',
      'active:duration-[calc(var(--dur-fast)/2)]',
    );
    // Release settles on the base rung: the destination state's transition is
    // the one that runs, and the rest state declares duration-base / ease-out.
    expect(el).toHaveClass('duration-base', 'ease-out');
    // Border changes are colour-only (1px stays 1px — no layout shift).
    expect(el.className).not.toMatch(/border-\d/);
  });

  it('never moves its target: the only press transform is the documented 1px settle, gated and never important', () => {
    render(<Button>Press</Button>);
    const el = screen.getByRole('button', { name: /press/i });
    // The settle lives inside the hover gate (only a lifted pill has anything
    // to settle) and carries no `!` — an important transform would snatch the
    // inline magnetic translate MagneticButton owns.
    expect(el).toHaveClass('[@media(hover:hover)]:active:translate-y-0');
    const pressTransforms = classesOf(el).filter((c) => /active:!?-?(translate|scale|rotate)/.test(c));
    expect(pressTransforms).toEqual(['[@media(hover:hover)]:active:translate-y-0']);
  });

  it('gates every hover response to hover-capable pointers (no sticky touch hover)', () => {
    render(<Button variant="ghost" href="/x">Ghost</Button>);
    const el = screen.getByRole('link', { name: /ghost/i });
    expect(bareHovers(el)).toEqual([]);
    expect(el).toHaveClass(
      '[@media(hover:hover)]:hover:-translate-y-px',
      '[@media(hover:hover)]:hover:shadow-soft',
      '[@media(hover:hover)]:hover:bg-canvas-alt',
      '[@media(hover:hover)]:hover:border-ink-muted',
    );
    // The disabled withdrawals ride the same gate, so they keep outranking the
    // hovers they cancel in Tailwind's variant order.
    expect(el).toHaveClass(
      '[@media(hover:hover)]:disabled:hover:bg-transparent',
      '[@media(hover:hover)]:disabled:hover:border-border-interactive',
      '[@media(hover:hover)]:disabled:hover:shadow-none',
      '[@media(hover:hover)]:disabled:hover:translate-y-0',
    );
  });

  it('primary keeps its own gated hover fill and the shared press', () => {
    render(<Button>Primary</Button>);
    const el = screen.getByRole('button', { name: /primary/i });
    expect(bareHovers(el)).toEqual([]);
    expect(el).toHaveClass('[@media(hover:hover)]:hover:bg-blush', '[@media(hover:hover)]:disabled:hover:bg-canvas', 'active:!bg-accent/10');
  });

  it('retires the native tap highlight in favour of the designed press', () => {
    render(<Button>Tap</Button>);
    expect(screen.getByRole('button', { name: /tap/i })).toHaveClass('[-webkit-tap-highlight-color:transparent]');
  });

  it('keeps keyboard focus distinct from the press: focus is the global ring only, never a fill or border', () => {
    render(<Button>Focus</Button>);
    const el = screen.getByRole('button', { name: /focus/i });
    expect(classesOf(el).filter((c) => /^focus(-visible|-within)?:/.test(c))).toEqual([]);
  });

  it('the signature dot answers press (contracts, embers) and focus (grows like hover)', () => {
    render(<Button>Dot</Button>);
    const dot = dotOf(screen.getByRole('button', { name: /dot/i }));
    expect(dot).toHaveClass('w-2', 'h-2', 'bg-terracotta');
    expect(dot).toHaveClass(
      'group-active:!w-1.5',
      'group-active:!h-1.5',
      'group-active:!bg-accent-hover',
      'group-active:duration-[calc(var(--dur-fast)/2)]',
    );
    expect(dot).toHaveClass(
      'group-focus-visible:w-2.5',
      'group-focus-visible:h-2.5',
      '[@media(hover:hover)]:group-hover:w-2.5',
      '[@media(hover:hover)]:group-hover:h-2.5',
    );
    expect(bareHovers(dot)).toEqual([]);
    expect(dot).toHaveClass('transition-[width,height,background-color]');
  });

  it('a per-project dot hue keeps its inline fill: the ember is the default dot’s alone, the contraction still answers', () => {
    render(<Button href="/x" dotColor="rgb(224 150 90)">Hue</Button>);
    const dot = dotOf(screen.getByRole('link', { name: /hue/i }));
    expect(dot).not.toHaveClass('bg-terracotta');
    expect(dot).not.toHaveClass('group-active:!bg-accent-hover');
    expect(dot).toHaveClass('group-active:!w-1.5', 'group-active:!h-1.5');
  });
});
