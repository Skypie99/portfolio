'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/cn';

/**
 * HamburgerNav — F-03. Top-right fixed trigger + full-screen overlay.
 *
 * Alex §3 binding patterns implemented:
 *  - aria-expanded/aria-controls/aria-label toggle on the trigger
 *  - hit area >= 44x44 (visual glyph 22px, padding expands to 44 — Alex option 1)
 *  - overlay is role="dialog" aria-modal="true" aria-label="Primary menu"
 *  - first link focused on open; focus trap inside overlay; Escape closes
 *  - focus returns to trigger on close
 *  - active route gets aria-current="page" + an aria-hidden terracotta dot
 *  - useReducedMotion gates the animation (matches prefers-reduced-motion)
 */

type NavItem = { href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: '/',              label: 'Home'         },
  { href: '/#work',         label: 'The Work'        },
  // CO-9: A Brief Account before Credentials — matches the rail's order and the
  // homepage physical order (#work → #about → #certificates).
  { href: '/#about',        label: 'A Brief Account' },
  { href: '/#certificates', label: 'Credentials'     },
  { href: '/blog/',         label: 'Notes'           },
  { href: '/#contact',      label: "Let's talk"      },
];

export function HamburgerNav() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Escape closes; focus first link on open; trap focus inside overlay.
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'Tab' && overlayRef.current) {
        const focusables = overlayRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);

    // Defer focus until the overlay mounts and Framer Motion settles.
    const t = window.setTimeout(() => {
      const firstLink = overlayRef.current?.querySelector<HTMLAnchorElement>('a[href]');
      firstLink?.focus();
      // L5-02: on short/landscape viewports the first item can open clipped at
      // the top edge; pull it into the scroll container's view. No-op when
      // already visible (so ≥812-tall stays byte-identical); instant → RM-safe.
      firstLink?.scrollIntoView?.({ block: 'nearest' });
    }, reduceMotion ? 0 : 50);

    // L5-02 focus belt: keep every trap stop inside the scroll container's view,
    // so keyboard/AT focus can never land on an off-screen control (e.g. the
    // theme toggle sitting below the fold on iPhone-SE-class heights).
    const overlayEl = overlayRef.current;
    const onFocusIn = (e: FocusEvent) => {
      (e.target as HTMLElement | null)?.scrollIntoView?.({ block: 'nearest' });
    };
    overlayEl?.addEventListener('focusin', onFocusIn);

    // Lock body scroll while overlay is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      overlayEl?.removeEventListener('focusin', onFocusIn);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, reduceMotion, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        // L2-1: #primary-menu only exists while the dialog is mounted, so the
        // idref is only pointed at it while it is real. (AT ignores dangling
        // idrefs, but the honest form is the one that never dangles.)
        aria-controls={open ? 'primary-menu' : undefined}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        // L2-2: while the dialog is open this trigger stays mounted (focus must
        // return here on close) but is visually gone and pointer-inert. -1 takes
        // it out of the sequential Tab order too, so it cannot be a trap stop
        // outside the dialog — while staying programmatically focusable, which
        // `visibility:hidden`/`inert` would not be, and close() focuses it
        // synchronously before React re-renders.
        tabIndex={open ? -1 : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          // z-[90]: above the homepage's pinned desert stage (frozen z-50 —
          // a later-in-DOM z-tie left real taps dead at page top), below the
          // pointer-inert film grain (z-100). The frosted bg is designed to
          // sit on anything.
          'fixed top-4 right-4 z-[90]',
          'inline-flex items-center justify-center',
          'h-11 w-11', // 44x44 hit area per Alex §3.5 option 1
          'bg-canvas/90 backdrop-blur-sm',
          'border border-border-decorative',
          'rounded-pill',
          'text-near-black hover:text-accent-primary',
          'transition-colors duration-fast ease-out',
          // Sidebar handles desktop navigation; hamburger is mobile-only.
          'md:hidden',
          // IN-3: while the dialog is open this trigger (z-90) sits directly
          // over the in-dialog close button (z-80) — make it inert so the close
          // button wins the hit-test. Stays mounted so focus returns here on close.
          open && 'pointer-events-none opacity-0',
        )}
      >
        <span aria-hidden="true" className="relative block w-[22px] h-[14px]">
          {/* Dani §3.5 — lines shift to terracotta on hover via bg-current,
              inheriting from the parent button's text-color transition
              (which is duration-fast). The line spans themselves transition
              only transform/top/opacity for the open/close choreography. */}
          <span
            className={cn(
              'absolute left-0 right-0 h-px bg-current ease-out',
              'transition-[transform,top] duration-base',
              open ? 'top-1.5 rotate-45' : 'top-0',
            )}
          />
          <span
            className={cn(
              'absolute left-0 right-0 top-1.5 h-px bg-current ease-out',
              'transition-opacity duration-base',
              open ? 'opacity-0' : 'opacity-100',
            )}
          />
          <span
            className={cn(
              'absolute left-0 right-0 h-px bg-current ease-out',
              'transition-[transform,top] duration-base',
              open ? 'top-1.5 -rotate-45' : 'top-3',
            )}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            id="primary-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Primary menu"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              // z-[80] (--z-overlay): the drawer must beat the pinned desert
              // stage (z-50) too — lifting only the trigger would open an
              // INVISIBLE dialog under the stage at page top, with a live
              // focus trap inside it. Stays below the trigger (z-[90]) so
              // the close position keeps winning the hit-test, and below
              // the pointer-inert grain (z-100).
              'fixed inset-0 z-[80]',
              // Fully opaque so the modal completely occludes the fixed
              // WorldBackdrop (z-index:-1) behind it. A translucent fill let the
              // night-sky gradient bleed through — and the /92 opacity modifier
              // it was tried with generated NO rule at all (92 isn't a Tailwind
              // opacity step), so the drawer rendered with no background and the
              // world showed straight through the blur. `bg-canvas` is the
              // canvas token, flipping cream (light) / near-black (dark) with
              // the theme; gives the nav text a solid, full-AA backdrop.
              'bg-canvas',
              // L5-02 scroll floor: the dialog is the scroll container so the
              // whole column stays reachable at short viewport heights (iPhone
              // SE/8 class, 667/568 tall) and in landscape. Centering + padding
              // move to the inner wrapper below (min-h-svh) so it is byte-
              // identical at ≥812-tall and only scrolls once content overflows.
              // overscroll-contain belts the existing body-scroll lock.
              'overflow-y-auto overscroll-contain',
            )}
          >
            {/* Alex A11y 2026-05-29: Explicit close button inside the dialog trap.
                WCAG 2.1.2 requires dialogs to be closeable via a UI mechanism within
                the modal, not only via keyboard shortcut (Escape). AT users with
                aria-modal="true" may not reach the trigger button outside the dialog. */}
            <button
              type="button"
              onClick={close}
              aria-label="Close navigation menu"
              className={cn(
                // L5-02: fixed (not absolute) so it stays pinned to the viewport
                // top-right while the dialog scrolls — an absolute child of the
                // scroll container would scroll away with the content and become
                // unreachable at the exact short heights this fix targets.
                // Byte-identical at ≥812-tall (no scroll → same origin). Kept
                // below the trigger's z-[90] so the trigger wins the outer hit-test.
                'fixed top-4 right-4 z-[1]',
                'inline-flex items-center justify-center',
                'h-11 w-11',
                'bg-transparent border border-border-decorative rounded-pill',
                'text-near-black hover:text-accent-primary',
                'transition-colors duration-fast ease-out',
              )}
            >
              <span aria-hidden="true" className="text-[1.25rem] leading-none font-light">{'×'}</span>
            </button>

            {/* L5-02 inner wrapper — carries the centering + padding that used to
                live on the dialog. min-h-svh (stable small-viewport height, NOT
                dvh/full: no toolbar resize-jump, survives the framer transform)
                keeps the column centered when it fits and lets it grow + scroll
                when it doesn't. Safe-area block padding keeps the wordmark clear
                of the notch and the theme toggle clear of the home indicator. */}
            <div
              className={cn(
                'min-h-svh flex flex-col items-center justify-center',
                'px-12',
                // Vertical padding floor is 2rem, NOT the horizontal 3rem: the
                // old p-12 dialog overflow-centered the ~740px column in 812,
                // yielding a 36px effective top/bottom gap — a 3rem (48px) floor
                // here would instead top-anchor + shift the column 12px down at
                // 812 (breaking byte-identity). ≤36px keeps it centered at 812;
                // env() still expands to clear a notch / home indicator on device.
                'pt-[max(2rem,env(safe-area-inset-top,0px))]',
                'pb-[max(2rem,env(safe-area-inset-bottom,0px))]',
              )}
            >
            {/* Wordmark — visible inside the overlay so mobile users see the site
                name when the nav is open. Mirrors the Sidebar wordmark treatment.
                aria-hidden: decorative — the dialog aria-label already names this
                as "Primary menu"; the wordmark text adds no navigational meaning. */}
            <p aria-hidden="true" className="font-serif font-normal text-display-s text-near-black mb-16 select-none">
              Sky Halisky
            </p>
            <nav aria-label="Site" className="w-full max-w-content">
              <p className="font-mono text-label tracking-label uppercase text-text-meta mb-16 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
                Menu
              </p>
              <ul className="flex flex-col gap-7 items-start">
                {NAV_ITEMS.map((item, i) => {
                  // Anchor links are all on the homepage; only Home gets aria-current="page"
                  const isActive = item.href === '/' && pathname === '/';
                  return (
                    <motion.li
                      key={item.href}
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        // L4-05: token timings (280ms base / 80ms step) — matches the
                        // dialog transition (0.28 above) and the Reveal stagger step;
                        // was freelancing 400ms/60ms off-token.
                        duration: reduceMotion ? 0 : 0.28,
                        delay: reduceMotion ? 0 : 0.04 + i * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'group inline-flex items-baseline gap-6',
                          'font-serif font-light text-nav-item text-balance',
                          'text-near-black hover:text-accent-text focus-visible:text-accent-text',
                          'transition-colors duration-fast ease-out',
                        )}
                      >
                        {/* Editorial index number */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'font-mono text-label tracking-label w-16 text-right shrink-0',
                            'transition-transform duration-fast ease-out',
                            'group-hover:translate-x-1 group-focus-visible:translate-x-1',
                            isActive ? 'text-accent-text' : 'text-text-meta',
                          )}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="inline-block w-2.5 h-2.5 rounded-full bg-terracotta self-center"
                          />
                        )}
                        <span>{item.label}</span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
              <p className="font-mono text-meta tracking-label uppercase text-text-meta mt-14 text-balance">
                Technology designed with accessibility in mind.
              </p>
              <div className="mt-16">
                <ThemeToggle withLabel />
              </div>
            </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
