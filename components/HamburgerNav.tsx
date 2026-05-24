'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  { href: '/', label: 'Home' },
  { href: '/work/', label: 'Work' },
  { href: '/certificates/', label: 'Certificates' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
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
    }, reduceMotion ? 0 : 50);

    // Lock body scroll while overlay is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, reduceMotion, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="primary-menu"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed top-4 right-4 z-50',
          'inline-flex items-center justify-center',
          'h-11 w-11', // 44x44 hit area per Alex §3.5 option 1
          'bg-cream/90 backdrop-blur-sm',
          'border border-border-decorative',
          'rounded-pill',
          'text-near-black hover:text-accent-primary',
          'transition-colors duration-fast ease-out',
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
              'fixed inset-0 z-40',
              'bg-cream',
              'flex items-center justify-center',
              'p-8',
            )}
          >
            <nav aria-label="Primary menu" className="w-full max-w-content">
              <ul className="flex flex-col gap-6 items-start">
                {NAV_ITEMS.map((item, i) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname?.startsWith(item.href));
                  return (
                    <motion.li
                      key={item.href}
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.4,
                        delay: reduceMotion ? 0 : 0.04 + i * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'inline-flex items-center gap-4',
                          'font-serif font-normal text-display-m leading-tight',
                          'text-near-black hover:text-accent-text',
                          'transition-colors duration-fast ease-out',
                        )}
                      >
                        {/* Editorial index number — DM Mono eyebrow,
                            terracotta on active, muted meta on inactive */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'font-mono text-meta tracking-label w-6 text-right shrink-0',
                            isActive ? 'text-accent-text' : 'text-text-meta',
                          )}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="inline-block w-2 h-2 rounded-full bg-terracotta"
                          />
                        )}
                        <span>{item.label}</span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
