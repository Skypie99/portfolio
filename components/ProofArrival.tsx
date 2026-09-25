'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * W4-06 VE04/M1 — one-time evidence-arrival decoration for the Flagstone
 * first proof (the only authorized instance). Owns lifecycle state for the
 * decorative edge ONLY: it draws nothing itself, never gates content, and is
 * a no-op wrapper when disabled. The edge rendering lives in app/globals.css
 * under `.proof-arrival-edge` (dedicated selector, rest state = settled).
 *
 * Lifecycle contract (contracts/VE04_M1_MOTION_POLICY.json):
 *  - consumed is marked AT TRIGGER, never at animation end;
 *  - hash / Back-Forward / reload / repeat / uncertain arrival → settled;
 *  - storage or navigation-type detection unavailable → settled static;
 *  - scroll-away mid-settle finishes the edge to rest and stays consumed;
 *  - sessionStorage holds one boolean/version key only — no activity log,
 *    URL history or identity.
 */

const CONSUMED_KEY = 'w4-06-proof-arrival.v1';

/** Safety bound past the longest CSS settle (420ms desktop band ceiling) so
 *  the state flip to `settled` can never cut a running transition short. */
const SETTLE_SAFETY_MS = 900;

export type ProofArrivalState = 'armed' | 'settling' | 'settled';

function markConsumed(): void {
  try {
    window.sessionStorage.setItem(CONSUMED_KEY, '1');
  } catch {
    /* storage unavailable — the in-memory flag still covers this tab */
  }
}

export function ProofArrival({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const consumedRef = useRef(false);
  const phaseRef = useRef<ProofArrivalState>('armed');
  const timerRef = useRef<number | null>(null);
  const [state, setState] = useState<ProofArrivalState>('armed');

  const apply = (next: ProofArrivalState) => {
    phaseRef.current = next;
    setState(next);
  };

  useEffect(() => {
    if (!enabled) return;
    const host = hostRef.current;
    if (!host) return;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const settleInstant = () => {
      clearTimer();
      consumedRef.current = true;
      markConsumed();
      apply('settled');
    };

    // Reduced motion — immediate final edge (the CSS RM floor enforces this
    // from first paint too; toggling mid-animation is handled there without
    // replay because the consume flag is already latched).
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      settleInstant();
      return;
    }

    // Uncertainty scan. Anything unknown → settled static, never replay.
    let fresh = false;
    try {
      const nav = (
        typeof performance.getEntriesByType === 'function'
          ? performance.getEntriesByType('navigation')[0]
          : undefined
      ) as PerformanceNavigationTiming | undefined;
      fresh =
        !window.location.hash &&
        Boolean(nav) &&
        nav?.type !== 'back_forward' &&
        nav?.type !== 'reload' &&
        window.sessionStorage.getItem(CONSUMED_KEY) !== '1';
    } catch {
      fresh = false;
    }
    if (!fresh) {
      settleInstant();
      return;
    }

    // Restored scroll / proof already in viewport at arrival → settled
    // (direct-entry clause). The beat may only start below the fold.
    const rect = host.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      settleInstant();
      return;
    }

    // Armed — one-time beat on the first ordinary downward viewport entry.
    // With the proof below the fold at mount and no hash/history/restore, the
    // only way it can enter the viewport is an ordinary downward scroll, so
    // IntersectionObserver entry is the trigger. Threshold 0.2: a fifth of
    // the tall 7:8 plate visible — chosen from this proof's current layout,
    // not from any prior source value.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (phaseRef.current === 'settled') continue;
          if (entry.isIntersecting) {
            if (phaseRef.current !== 'armed' || consumedRef.current) continue;
            consumedRef.current = true;
            markConsumed();
            apply('settling');
            clearTimer();
            timerRef.current = window.setTimeout(() => apply('settled'), SETTLE_SAFETY_MS);
          } else if (phaseRef.current === 'settling') {
            // scroll-away / cancellation — finish the edge to rest; consumed
            // stays latched so reentry never replays.
            settleInstant();
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(host);

    // Direct/hash arrival mid-session (e.g. TOC jump) → settled + consume.
    const onHash = () => {
      if (window.location.hash && phaseRef.current !== 'settled') {
        io.disconnect();
        settleInstant();
      }
    };
    window.addEventListener('hashchange', onHash);

    // Back/Forward restore via bfcache → settled + consume.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && phaseRef.current !== 'settled') {
        io.disconnect();
        settleInstant();
      }
    };
    window.addEventListener('pageshow', onPageShow);

    return () => {
      io.disconnect();
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('pageshow', onPageShow);
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  if (!enabled) return <>{children}</>;

  return (
    <div ref={hostRef} data-proof-arrival={state}>
      {children}
    </div>
  );
}
