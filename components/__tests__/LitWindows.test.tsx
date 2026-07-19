/**
 * The lit windows (R4/BP6 · P01) — component + source contract.
 * Six labeled, enterable links in declared DOM order; the lit map bound to
 * the passed litHrefs (the showcase strip's own claim); the dark window
 * enterable and plainly named; visibility/physics CSS-owned (dark-only gate,
 * --day-night rest fallback, no keyframes, 44px hits).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { LitWindows } from '@/components/LitWindows';
import { getDeliverables } from '@/lib/content';

const LIT = [
  '/work/accessmap/',
  '/work/claude-corp/',
  '/work/prompt-library/',
  '/work/ghost-code/',
  '/work/mutual-mesh/',
];

afterEach(() => {
  cleanup();
});

describe('LitWindows', () => {
  const deliverables = getDeliverables();

  it('renders one enterable, labeled link per work in declared DOM order', () => {
    render(<LitWindows deliverables={deliverables} litHrefs={LIT} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(deliverables.length);
    // Next <Link> renders the slashless form in jsdom (trailingSlash applies
    // at build); routing-equivalent, so compare normalized.
    expect(links.map((a) => a.getAttribute('href')?.replace(/\/$/, ''))).toEqual(
      deliverables.map((d) => `/work/${d.id}`),
    );
    for (const a of links) {
      expect(a.getAttribute('aria-label')).toMatch(/ — (lit|dark)$/);
    }
  });

  it('lights exactly the showcase five and leaves the sixth dark — and ENTERABLE', () => {
    render(<LitWindows deliverables={deliverables} litHrefs={LIT} />);
    const links = screen.getAllByRole('link');
    const lit = links.filter((a) => a.hasAttribute('data-lit'));
    const dark = links.filter((a) => !a.hasAttribute('data-lit'));
    expect(lit).toHaveLength(5);
    expect(dark).toHaveLength(1);
    expect(dark[0].getAttribute('href')?.replace(/\/$/, '')).toBe('/work/dashboard');
    expect(dark[0].getAttribute('aria-label')).toBe('Claude Corp Dashboard — dark');
    expect(dark[0].getAttribute('href')).toBeTruthy(); // the dark window opens too
  });

  it('carries each work\'s own signature hue and a horizon seat', () => {
    const { container } = render(<LitWindows deliverables={deliverables} litHrefs={LIT} />);
    for (const a of Array.from(container.querySelectorAll('a'))) {
      const style = a.getAttribute('style') ?? '';
      expect(style).toContain('--lw-sig');
      expect(style).toContain('--lw-x');
    }
  });
});

describe('lit windows — CSS source contract', () => {
  const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');

  it('is dark-register-only and zero-layout', () => {
    expect(css).toMatch(/\.lit-windows\s*\{[^}]*height: 0/);
    expect(css).toMatch(/\.lit-windows\s*\{[^}]*display: none/);
    expect(css).toMatch(/html\.dark \.lit-windows\s*\{[^}]*display: block/);
  });

  it('rides the day-night writer with the house rest fallback — no keyframes', () => {
    expect(css).toMatch(
      /\.lit-window\s*\{[^}]*var\(--day-night, var\(--day-night-rest\)\)/,
    );
    expect(css).not.toContain('@keyframes lit-window');
  });

  it('keeps the 44px hit areas on the link itself', () => {
    const rule = css.slice(css.indexOf('.lit-window {'), css.indexOf('.lit-window::before'));
    expect(rule).toContain('width: 44px');
    expect(rule).toContain('height: 44px');
  });
});
