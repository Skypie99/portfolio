'use client';

import { type ReactNode, useCallback, useEffect, useRef } from 'react';

function focusables(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

/**
 * A bottom-anchored (centered ≥640px) modal sheet: the editor / panel container.
 * Escape closes; focus is trapped inside and restored to the opener on close.
 * The backdrop does NOT close by default (an editor must not lose edits to a
 * stray tap) — matching the prototype, which closes editors only via a button.
 */
export function Sheet({
  title,
  onClose,
  children,
  closeOnBackdrop = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeOnBackdrop?: boolean;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus();
    return () => {
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const items = focusables(sheetRef.current);
      if (items.length === 0) {
        e.preventDefault();
        sheetRef.current.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === sheetRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  return (
    // Backdrop-click close (opt-in) is a mouse affordance; Escape + the sheet's
    // own buttons serve keyboard/AT, so this div needs no keyboard handler.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="sa-overlay"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={sheetRef}
        className="sa-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="sa-sheet-title">{title}</div>
        <div className="sa-sheetbar" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
