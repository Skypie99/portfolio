'use client';

import { CertCard } from '@/components/CertCard';
import { Reveal } from '@/components/Reveal';
import type { Certificate } from '@/lib/schema';

type AnimatedCertGridProps = {
  certificates: Certificate[];
};

/**
 * AnimatedCertGrid — credential cards (CertCard, liquid-glass). Each card
 * enters via the shared Reveal primitive (CSS/IO depth-rise with an index
 * stagger) — the same proven contract as the /work grid. The REST state is
 * the VISIBLE state: reduced-motion and no-JS visitors get the final frame
 * via the .reveal floors in globals.css, and SSR never serializes inline
 * opacity:0 (the old framer initial:'hidden' did, stranding RM visitors
 * with an invisible grid). No framer needed here — no filters, no exits.
 */
export function AnimatedCertGrid({ certificates }: AnimatedCertGridProps) {
  return (
    <ul className="grid grid-cols-1 md:max-lg:gap-8 lg:grid-cols-3 gap-12 lg:gap-16">
      {certificates.map((c, i) => (
        // L4-02: cap the stagger (site idiom, app/page.tsx:160) so the nine-card
        // grid stops at ~4 steps of delay instead of an uncapped 640ms ramp.
        <Reveal key={c.id} as="li" variant="depth" index={Math.min(i, 4)}>
          <CertCard certificate={c} />
        </Reveal>
      ))}
    </ul>
  );
}
