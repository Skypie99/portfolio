import type { ReactNode } from 'react';

import { Reveal } from '@/components/Reveal';
import { INLINE_CODE_CLASS, smartPunctuation } from '@/lib/markdown';

/**
 * parseInline — the SINGLE inline parser site-wide (Z7/CO-6). Splits on **bold**,
 * *italic*, and `code`, preserving delimiters. Smart punctuation applies to prose +
 * emphasis, never inside `code`.
 */
function parseInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-near-black">{smartPunctuation(part.slice(2, -2))}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className={INLINE_CODE_CLASS}>{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{smartPunctuation(part.slice(1, -1))}</em>;
    return smartPunctuation(part);
  });
}

/**
 * Per-surface type scale + heading rhythm. The CHOREOGRAPHY (carve/depth reveal,
 * stagger, drop cap) is shared; only the type tokens differ so each surface keeps
 * its own voice — case studies on the case-h2/h3 display tier, Notes on the
 * prose-h2/h3 reading tier with the polish-pass mt-24/mt-12 (2:1) heading rhythm.
 */
type ProseVariant = 'case' | 'blog';

const VARIANT_CLASSES: Record<ProseVariant, { h2: string; h3: string; p: string }> = {
  case: {
    h2: 'font-serif font-light text-case-h2 text-near-black mt-24 mb-4 first:mt-0',
    h3: 'font-serif font-light text-case-h3 text-near-black mt-12 mb-3',
    p: 'font-sans font-light text-prose text-charcoal leading-[1.75] text-pretty nums-oldstyle',
  },
  blog: {
    h2: 'font-serif font-light text-prose-h2 text-near-black mt-24 mb-6 first:mt-0',
    h3: 'font-serif font-light text-prose-h3 text-near-black mt-12 mb-4',
    p: 'font-sans font-light text-prose text-charcoal leading-[1.75] text-pretty nums-oldstyle',
  },
};

/**
 * renderMarkdownProse — the ONE long-form renderer (Z7/CO-6). Reading-order
 * choreography (wow 2026-06-04, SM4): each blank-line block self-reveals as it
 * scrolls in. `##` sub-headings CARVE in (blur→sharp focus-pull, echoing the locked
 * intro title's signature resolve); `###` + prose rise with the depth reveal. The
 * stagger is capped (Math.min(i, 4)) so long bodies never pile up; the first
 * paragraph carries the drop cap. RM / no-JS fall to the final composed state via
 * the .reveal floors in globals.css — no inline opacity:0 ever reaches the SSR HTML.
 *
 * Case studies and Notes SHARE this renderer. Case studies are the source (output
 * stays pixel-identical to the former inline renderer); Notes inherits the same
 * choreography in its own prose type scale — one continuous authored voice across
 * all long-form on the site.
 */
export function renderMarkdownProse(markdown: string, variant: ProseVariant): ReactNode[] {
  const c = VARIANT_CLASSES[variant];
  const blocks = markdown.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  let firstPara = true;
  return blocks.map((block, i) => {
    const key = `b-${i}`;
    const index = Math.min(i, 4);
    if (block.startsWith('## '))
      return (
        <Reveal key={key} as="h2" variant="carve" index={index} className={c.h2}>
          {block.slice(3)}
        </Reveal>
      );
    if (block.startsWith('### '))
      return (
        <Reveal key={key} as="h3" variant="depth" index={index} className={c.h3}>
          {block.slice(4)}
        </Reveal>
      );
    const dropCap = firstPara;
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
