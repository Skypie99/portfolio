import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type TagPillProps = {
  children: ReactNode;
  className?: string;
};

/**
 * TagPill — Dani §3.8 canonical primitive.
 *
 * Desert spectrum: soft tinted pills spanning teal → gold → terracotta, all
 * token-driven so they flip in dark mode. A deterministic hash of the label
 * keeps each tag a consistent hue everywhere (e.g. "Mobile" is always seafoam,
 * "MCP" always gold) — variety without randomness, per brief §7 (palette in
 * category tags, not rainbowed onto every element).
 *
 * Used for tech stack on cards (ProjectCard, /work/[slug], homepage selected
 * work). If Dani's spec changes, only this file moves.
 */
const TAG_VARIANTS = [
  'bg-cool-soft/45 text-cool-deep',   // seafoam → deep pine
  'bg-gold-glow/40 text-ink',         // gold → ink (a11y: accent-ink missed 4.5:1 on gold in both modes)
  'bg-cool-mid/35 text-cool-deep',    // lagoon → deep pine
  'bg-accent/22 text-ink',            // terracotta wash → ink (a11y: accent-ink missed 4.5:1 on terracotta light)
  'bg-rose/30 text-ink',              // muted clay → ink (a11y: accent-ink missed 4.5:1 on rose light + dark)
  'bg-emerald/25 text-cool-deep',     // emerald → deep pine
] as const;

function hue(node: ReactNode): string {
  const s = typeof node === 'string' ? node : String(node ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TAG_VARIANTS[h % TAG_VARIANTS.length];
}

export function TagPill({ children, className }: TagPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-pill',
        hue(children),
        'font-mono text-meta tracking-label uppercase',
        // tactile-pass: a faint inset edge catches light on hover — tint-agnostic,
        // no CLS (ring is box-shadow), and invisible at rest so the chip is unchanged.
        'ring-1 ring-inset ring-transparent transition-[box-shadow,color,background-color] duration-base ease-out hover:ring-[rgb(var(--rgb-ink)/0.16)]',
        className,
      )}
    >
      {children}
    </span>
  );
}
