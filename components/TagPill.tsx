import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type TagPillProps = {
  children: ReactNode;
  /**
   * L2-05: the hot terracotta wash is reserved for deliberate semantic emphasis
   * and is NOT in the deterministic hash pool, so an arbitrary label (e.g.
   * "VITEST") can no longer land on it and read as false emphasis. Pass `accent`
   * only where a tag is genuinely meant to be highlighted.
   */
  accent?: boolean;
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
// The deterministic hash pool — five desert tints. L2-05: terracotta is NOT in
// this pool (it was index 3); it is reserved as ACCENT_VARIANT for semantic
// emphasis so the hottest wash never lands on an arbitrary label by hash.
const TAG_VARIANTS = [
  'bg-cool-soft/45 text-cool-deep',   // seafoam → deep pine
  'bg-gold-glow/40 text-ink',         // gold → ink (a11y: accent-ink missed 4.5:1 on gold in both modes)
  'bg-cool-mid/35 text-cool-deep',    // lagoon → deep pine
  'bg-rose/30 text-ink',              // muted clay → ink (a11y: accent-ink missed 4.5:1 on rose light + dark)
  'bg-emerald/25 text-cool-deep',     // emerald → deep pine
] as const;

// Reserved semantic wash — the hot terracotta, opted into via the `accent` prop.
// (a11y: accent-ink missed 4.5:1 on terracotta light; /30 matches rose/30's
// measured pill-vs-card weight — /22 read as bare text in both themes.)
const ACCENT_VARIANT = 'bg-accent/30 text-ink';

function hue(node: ReactNode): string {
  const s = typeof node === 'string' ? node : String(node ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TAG_VARIANTS[h % TAG_VARIANTS.length];
}

export function TagPill({ children, accent = false, className }: TagPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-pill',
        accent ? ACCENT_VARIANT : hue(children),
        'font-mono text-meta tracking-label uppercase',
        // IN-4: no hover ring — a decorative chip answering the cursor (while
        // `cursor` stays auto) impersonates a control it isn't. Stillness is the
        // site's honest "not a control"; the affordance returns with the cursor
        // and a destination only if a chip ever becomes a link.
        className,
      )}
    >
      {children}
    </span>
  );
}
