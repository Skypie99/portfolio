import { useEffect, useState } from 'react';

/**
 * SSR-safe `prefers-reduced-motion` hook.
 *
 * Returns `false` on the server and on the first client render (so the markup
 * matches and there's no hydration mismatch), then upgrades to the real value
 * after mount. The cinematic engine reads this to decide between the animated
 * pinned scene and the static arrival frame.
 *
 * We deliberately don't reuse framer-motion's hook here: the GSAP engine is
 * self-contained, and owning the hook keeps its initial-value/SSR contract
 * explicit and testable (the test mocks window.matchMedia directly).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    // addEventListener is the modern API; guard for older Safari (addListener).
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  return reduced;
}
