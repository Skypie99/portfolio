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
    expect(trigger).toHaveAttribute('aria-controls', 'primary-menu');
  });

  it('toggles aria-expanded when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<HamburgerNav />);
    const trigger = screen.getByRole('button', { name: /open navigation menu/i });

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Accessible name updates to reflect the new toggle state.
    expect(screen.getByRole('button', { name: /close navigation menu/i })).toBe(trigger);

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
});
