/**
 * HamburgerNav smoke tests — Cycle 2 (Gary).
 *
 * These cover the Alex §3 binding patterns the component documents:
 *   - aria-expanded toggles on click
 *   - Escape closes the overlay
 *   - focus returns to the trigger button on close
 *
 * `next/navigation` and `framer-motion` are mocked because:
 *   - usePathname needs the App Router context which jsdom does not provide.
 *   - Framer Motion's <AnimatePresence> exit animations would deferred-mount/
 *     -unmount the overlay and race the assertions; mocking flattens it to
 *     plain divs so `findByRole('dialog')` is deterministic.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, forwardRef, type ReactNode } from 'react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');

  // framer-only props React would warn about as unknown DOM attributes.
  const FRAMER_PROPS = new Set([
    'initial',
    'animate',
    'exit',
    'transition',
    'variants',
    'whileHover',
    'whileTap',
    'whileFocus',
    'whileInView',
    'layout',
    'layoutId',
    'drag',
  ]);

  return {
    ...actual,
    // Strip animation wrappers — render children synchronously so assertions
    // don't depend on Framer Motion timing.
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    // forwardRef so the HamburgerNav's overlayRef binding still works without
    // React's "Function components cannot be given refs" warning.
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) => {
          const Component = forwardRef<
            HTMLElement,
            { children?: ReactNode } & Record<string, unknown>
          >((props, ref) => {
            const { children, ...rest } = props;
            const cleaned: Record<string, unknown> = { ref };
            for (const [k, v] of Object.entries(rest)) {
              if (FRAMER_PROPS.has(k)) continue;
              cleaned[k] = v;
            }
            return createElement(tag, cleaned, children as ReactNode);
          });
          Component.displayName = `motion.${tag}`;
          return Component;
        },
      },
    ),
    useReducedMotion: () => true,
  };
});

import { HamburgerNav } from '@/components/HamburgerNav';

afterEach(() => {
  cleanup();
});

describe('HamburgerNav', () => {
  it('renders the trigger button collapsed by default', () => {
    render(<HamburgerNav />);
    const trigger = screen.getByRole('button', { name: /open navigation menu/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // L2-1 (a11y deep-QA 2026-07-31): collapsed, #primary-menu is not mounted, so
    // aria-controls is absent rather than dangling. The open-state idref is
    // asserted in the dedicated L2-1 test below.
    expect(trigger).not.toHaveAttribute('aria-controls');
  });

  it('toggles aria-expanded when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<HamburgerNav />);
    const trigger = screen.getByRole('button', { name: /open navigation menu/i });

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Accessible name updates to reflect the new toggle state.
    // Two "Close navigation menu" buttons exist while open: the outer trigger
    // and the in-dialog close button (Alex A11y 2026-05-29). Confirm both exist.
    expect(screen.getAllByRole('button', { name: /close navigation menu/i }).length).toBeGreaterThanOrEqual(1);
    expect(trigger).toHaveAttribute('aria-controls', 'primary-menu');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the overlay and returns focus to the trigger on Escape', async () => {
    const user = userEvent.setup();
    render(<HamburgerNav />);
    const trigger = screen.getByRole('button', { name: /open navigation menu/i });

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // The dialog overlay should now be present.
    const dialog = await screen.findByRole('dialog', { name: /primary menu/i });
    expect(dialog).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
    expect(trigger).toHaveFocus();
  });

  // a11y deep-QA 2026-07-31 — L2-1 / L2-2 robustness hardening.
  it('points aria-controls at #primary-menu only while that element exists (L2-1)', async () => {
    const user = userEvent.setup();
    render(<HamburgerNav />);
    const trigger = screen.getByRole('button', { name: /open navigation menu/i });

    // Closed: the dialog is unmounted, so the idref must not dangle.
    expect(document.getElementById('primary-menu')).toBeNull();
    expect(trigger).not.toHaveAttribute('aria-controls');

    await user.click(trigger);
    await screen.findByRole('dialog', { name: /primary menu/i });
    expect(document.getElementById('primary-menu')).not.toBeNull();
    expect(trigger).toHaveAttribute('aria-controls', 'primary-menu');
  });

  it('takes the trigger out of the Tab order while open, yet still returns focus to it (L2-2)', async () => {
    const user = userEvent.setup();
    render(<HamburgerNav />);
    const trigger = screen.getByRole('button', { name: /open navigation menu/i });

    expect(trigger).not.toHaveAttribute('tabindex');

    await user.click(trigger);
    await screen.findByRole('dialog', { name: /primary menu/i });

    // Open: visually gone and pointer-inert, so it must not be a sequential stop
    // outside the dialog's trap.
    expect(trigger).toHaveAttribute('tabindex', '-1');

    // ...but it must remain PROGRAMMATICALLY focusable, because close() focuses it
    // synchronously before React re-renders. `visibility:hidden` or `inert` here
    // would silently break focus-return — this assertion is the tripwire.
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(trigger).toHaveFocus();
    expect(trigger).not.toHaveAttribute('tabindex');
  });

  it('layers trigger and drawer above the pinned stage (R3 z contract)', async () => {
    // The homepage's pinned desert stage is a frozen z-50 stacking context
    // that sits later in the DOM. Both chrome layers must beat it — and the
    // trigger must stay above the overlay so the close position keeps
    // winning the hit-test. (Defects repair R3, 2026-06-12.)
    const user = userEvent.setup();
    render(<HamburgerNav />);
    const trigger = screen.getByRole('button', { name: /open navigation menu/i });
    expect(trigger.className).toContain('z-[90]');

    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: /primary menu/i });
    expect(dialog.className).toContain('z-[80]');
  });

  it('gives the overlay an internal scroll path so the toggle is reachable on short viewports (L5-02)', async () => {
    // Below ~740px tall the centered menu column overflowed with no scroll
    // path, stranding the theme toggle (the only theme control under 768px).
    // The dialog must be its own scroll container so the whole column is
    // reachable. Locks the fix against a future refactor dropping it.
    const user = userEvent.setup();
    render(<HamburgerNav />);
    await user.click(screen.getByRole('button', { name: /open navigation menu/i }));
    const dialog = await screen.findByRole('dialog', { name: /primary menu/i });
    expect(dialog.className).toContain('overflow-y-auto');
  });

  it('locks body scroll when overlay is open and restores it on close', async () => {
    const user = userEvent.setup();
    // Ensure we start with unrestricted scroll (jsdom default).
    document.body.style.overflow = '';

    render(<HamburgerNav />);
    const trigger = screen.getByRole('button', { name: /open navigation menu/i });

    await user.click(trigger);
    // Overlay open — body scroll must be suppressed so the page behind
    // doesn't scroll while the menu is displayed.
    expect(document.body.style.overflow).toBe('hidden');

    // Close via the trigger button (identified by aria-controls, distinct from
    // the in-dialog close button added by Alex A11y 2026-05-29).
    // Two "Close navigation menu" buttons exist when open — use the one with aria-controls.
    const closeButtons = screen.getAllByRole('button', { name: /close navigation menu/i });
    const triggerClose = closeButtons.find((b) => b.hasAttribute('aria-controls'))!;
    await user.click(triggerClose);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
    // Scroll lock must be released when the overlay closes.
    expect(document.body.style.overflow).toBe('');
  });
});
