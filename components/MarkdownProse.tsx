import type { ReactNode } from 'react';
import Link from 'next/link';

import { Reveal } from '@/components/Reveal';
import { INLINE_CODE_CLASS, slugify, smartPunctuation } from '@/lib/markdown';

/**
 * Prose link — a PERSISTENT underline (WCAG 1.4.1: a link inside a block of
 * text must never be distinguished by colour alone), deepening on hover/focus.
 * Distinct from `.link-draw` (nav/meta), whose underline only draws on hover
 * and so is unsafe for body copy.
 */
const PROSE_LINK_CLASS =
  'text-accent-text underline decoration-accent-text/40 underline-offset-[3px] decoration-1 ' +
  'hover:decoration-accent-text focus-visible:decoration-accent-text ' +
  'transition-[text-decoration-color,color] duration-fast ease-out';

/**
 * parseInline — the SINGLE inline parser site-wide (Z7/CO-6). Splits on
 * **bold**, *italic*, `code`, and [text](url), preserving delimiters. Smart
 * punctuation applies to prose + emphasis + link text, never inside `code`.
 * Links: external (http/https) open in a new tab with the sr-only cue + rel
 * guard (Alex §4.5); root-relative use next/link; everything else stays a
 * plain anchor. Every prose link carries a persistent underline (see above).
 */
function parseInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-near-black">{smartPunctuation(part.slice(2, -2))}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className={INLINE_CODE_CLASS}>{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{smartPunctuation(part.slice(1, -1))}</em>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const label = smartPunctuation(link[1]);
      const href = link[2];
      if (/^https?:\/\//i.test(href))
        return (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={PROSE_LINK_CLASS}>
            {label}
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        );
      if (href.startsWith('/'))
        return <Link key={i} href={href} className={PROSE_LINK_CLASS}>{label}</Link>;
      return <a key={i} href={href} className={PROSE_LINK_CLASS}>{label}</a>;
    }
    return smartPunctuation(part);
  });
}

/**
 * Per-surface type scale + heading rhythm. The CHOREOGRAPHY (carve/depth reveal,
 * stagger, drop cap) is shared; only the type tokens differ so each surface keeps
 * its own voice — case studies on the case-h2/h3 display tier, Notes on the
 * prose-h2/h3 reading tier with the polish-pass mt-24/mt-12 (2:1) heading rhythm.
 * Both heading tiers carry `serif-display` (discretionary ligatures) — the quiet
 * "set in metal" finish on the big Cormorant heads.
 */
type ProseVariant = 'case' | 'blog';

const VARIANT_CLASSES: Record<ProseVariant, { h2: string; h3: string; p: string }> = {
  case: {
    h2: 'font-serif font-light text-case-h2 text-near-black mt-24 mb-4 first:mt-0 serif-display',
    h3: 'font-serif font-light text-case-h3 text-near-black mt-12 mb-3 serif-display',
    p: 'font-sans font-light text-prose text-charcoal leading-[1.75] text-pretty nums-oldstyle [hanging-punctuation:first_allow-end]',
  },
  blog: {
    h2: 'font-serif font-light text-prose-h2 text-near-black mt-24 mb-6 first:mt-0 serif-display',
    h3: 'font-serif font-light text-prose-h3 text-near-black mt-12 mb-4 serif-display',
    p: 'font-sans font-light text-prose text-charcoal leading-[1.75] text-pretty nums-oldstyle [hanging-punctuation:first_allow-end]',
  },
};

/**
 * renderMarkdownProse — the ONE long-form renderer (Z7/CO-6). Reading-order
 * choreography (wow 2026-06-04, SM4): each blank-line block self-reveals as it
 * scrolls in. `##` sub-headings CARVE in (blur→sharp focus-pull, echoing the locked
 * intro title's signature resolve); `###` + prose + lists + pull-quotes rise with
 * the depth reveal. The stagger is capped (Math.min(i, 4)) so long bodies never
 * pile up; the first paragraph carries the drop cap. RM / no-JS fall to the final
 * composed state via the .reveal floors in globals.css — no inline opacity:0 ever
 * reaches the SSR HTML.
 *
 * Block grammar: `## ` / `### ` headings; `> ` → pull-quote; a block whose every
 * line is `- `/`* ` → <ul>, or `1. ` → <ol> (mixed blocks fall through to a
 * paragraph and render literally — conservative, no false positives); everything
 * else is a paragraph. Inline: bold / italic / code / links (parseInline).
 *
 * Case studies and Notes SHARE this renderer. For unchanged content the output is
 * byte-identical to before this pass (lists/quotes/links are purely additive) — a
 * vitest snapshot guards it.
 */
export function renderMarkdownProse(markdown: string, variant: ProseVariant): ReactNode[] {
  const c = VARIANT_CLASSES[variant];
  const blocks = markdown.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  let firstPara = true;
  // Stable, unique heading ids for in-page anchors + the article contents
  // index (§8.3). Collisions (repeated heading text) get -2, -3, … suffixes.
  const usedIds = new Set<string>();
  const headingId = (text: string): string => {
    const base = slugify(text) || 'section';
    let id = base;
    for (let n = 2; usedIds.has(id); n += 1) id = `${base}-${n}`;
    usedIds.add(id);
    return id;
  };
  return blocks.map((block, i) => {
    const key = `b-${i}`;
    const index = Math.min(i, 4);
    if (block.startsWith('## ')) {
      const text = block.slice(3);
      return (
        <Reveal key={key} as="h2" id={headingId(text)} variant="carve" index={index} className={`${c.h2} scroll-mt-24`}>
          {text}
        </Reveal>
      );
    }
    if (block.startsWith('### ')) {
      const text = block.slice(4);
      return (
        <Reveal key={key} as="h3" id={headingId(text)} variant="depth" index={index} className={`${c.h3} scroll-mt-24`}>
          {text}
        </Reveal>
      );
    }
    // Pull-quote — unlocks the editorial .pull-quote treatment (globals.css).
    if (block.startsWith('> ')) {
      const text = block.split('\n').map((l) => l.replace(/^>\s?/, '')).join(' ');
      return (
        <Reveal key={key} as="blockquote" variant="depth" index={index} className="pull-quote text-near-black nums-oldstyle text-pretty">
          {parseInline(text)}
        </Reveal>
      );
    }
    // Lists — conservative: every non-empty line must be a marker line, else the
    // block falls through to a paragraph (renders literally — no false positives).
    const lines = block.split('\n').filter(Boolean);
    if (lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l))) {
      return (
        <Reveal key={key} as="ul" variant="depth" index={index} className={`${c.p} prose-list`}>
          {lines.map((l, li) => (
            <li key={li}>{parseInline(l.replace(/^[-*]\s+/, ''))}</li>
          ))}
        </Reveal>
      );
    }
    if (lines.length > 0 && lines.every((l) => /^\d+\.\s+/.test(l))) {
      return (
        <Reveal key={key} as="ol" variant="depth" index={index} className={`${c.p} prose-list prose-list-ordered`}>
          {lines.map((l, li) => (
            <li key={li}>{parseInline(l.replace(/^\d+\.\s+/, ''))}</li>
          ))}
        </Reveal>
      );
    }
    // L2-04: the drop-cap initial is ~3 lines tall. Over a one-line opening
    // paragraph (the colophon's 51-char "Most sites hide how they were made.")
    // it leaves an L-shaped hole. Cap only when the opener wraps ≥3 lines at the
    // prose measure (~60ch/line) so the initial always has text beside it —
    // otherwise it gracefully stands down. Calibrated on the two real openers:
    // colophon 51 chars → no cap; blog ~280 chars → cap. First paragraph only
    // (never migrates to a later one).
    const plainLen = block.replace(/[*_`~[\]()>#]/g, '').trim().length;
    const dropCap = firstPara && plainLen >= 180;
    firstPara = false;
    return (
      <Reveal
        key={key}
        as="p"
        variant="depth"
        index={index}
        className={`${c.p}${dropCap ? ' drop-cap' : ''}`}
      >
        {parseInline(block)}
      </Reveal>
    );
  });
}
