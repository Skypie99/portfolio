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
  { href: '/',              label: 'Home'         },
  { href: '/#work',         label: 'Work'         },
  { href: '/#certificates', label: 'Certificates' },
  { href: '/#about',        label: 'About'        },
  { href: '/#contact',      label: 'Contact'      },
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
            {/* Wordmark — visible inside the overlay so mobile users see the site
                name when the nav is open. Mirrors the Sidebar wordmark treatment.
                aria-hidden: decorative — the dialog aria-label already names this
                as "Primary menu"; the wordmark text adds no navigational meaning. */}
            <p aria-hidden="true" className="font-serif font-normal text-display-s text-near-black mb-10 select-none">
              Sky Halisky
            </p>
            <nav aria-label="Primary menu" className="w-full max-w-content">
              <p className="font-mono text-label tracking-label uppercase text-text-meta mb-10 flex items-center gap-2">
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
                          'group inline-flex items-baseline gap-5',
                          'font-serif font-light text-[clamp(2.25rem,7vw,4rem)] leading-[1] text-balance',
                          'text-near-black hover:text-accent-text focus-visible:text-accent-text',
                          'transition-colors duration-fast ease-out',
                        )}
                        style={{ letterSpacing: '-0.02em' }}
                      >
                        {/* Editorial index number */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'font-mono text-label tracking-label w-10 text-right shrink-0',
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
              <p className="font-mono text-meta tracking-label uppercase text-text-meta mt-14 inline-flex items-center gap-2">
                <span aria-hidden="true" className="relative inline-flex h-1.5 w-1.5">
                  <span className="hero-status-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-terracotta" />
                </span>
                Available for work · 2026
              </p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
