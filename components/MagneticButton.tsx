'use client';

import { type ComponentProps } from 'react';

import { Button } from '@/components/Button';
import { useMagnetic } from '@/lib/motion';

/**
 * MagneticButton — a primary CTA with a faint magnetic cursor-pull (organic-pass
 * 2026-06-03, signature move #4). useMagnetic attaches to the Button element
 * itself and writes a small, capped translate toward the pointer; the spring-home
 * rides Button's own `transition: transform` (ease-out). Fine-pointer only + RM
 * no-op are enforced in the hook, so on touch / reduced-motion it's an ordinary
 * Button (full width on mobile, etc. — the hook simply never transforms it).
 *
 * The magnetic translate replaces the static `hover:-translate-y-px` lift for
 * these CTAs (one transform owner); press feedback survives via the active: bg.
 */
export function MagneticButton(props: ComponentProps<typeof Button>) {
  const ref = useMagnetic<HTMLElement>(0.2, 6);
  return <Button {...props} ref={ref} />;
}
