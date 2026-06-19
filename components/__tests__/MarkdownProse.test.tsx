/**
 * renderMarkdownProse tests — polish sweep #2 (editorial renderer completeness).
 *
 * Two jobs:
 *   1. The NEW block grammar (lists, pull-quotes, links) renders correctly and
 *      accessibly (external links get new-tab safety + a persistent underline).
 *   2. REGRESSION: the constructs that existed before this pass (headings,
 *      bold/italic/code, drop-cap on the first paragraph) are untouched, and
 *      prose-only input never sprouts a <ul>/<ol>/<blockquote> — the new
 *      features are purely additive (the case-study "pixel-identical" contract).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';

import { renderMarkdownProse } from '@/components/MarkdownProse';

afterEach(cleanup);

function renderMd(md: string, variant: 'blog' | 'case' = 'blog') {
  return render(<>{renderMarkdownProse(md, variant)}</>);
}

describe('renderMarkdownProse — additive block grammar', () => {
  it('renders an unordered list from "- " lines', () => {
    const { container } = renderMd('- one\n- two\n- three');
    const ul = container.querySelector('ul.prose-list');
    expect(ul).toBeTruthy();
    expect(ul?.querySelectorAll('li')).toHaveLength(3);
    expect(container.querySelector('ol')).toBeNull();
  });

  it('renders an ordered list from "1. " lines', () => {
    const { container } = renderMd('1. first\n2. second');
    const ol = container.querySelector('ol.prose-list.prose-list-ordered');
    expect(ol).toBeTruthy();
    expect(ol?.querySelectorAll('li')).toHaveLength(2);
  });

  it('renders a pull-quote blockquote from "> "', () => {
    const { container } = renderMd('> a quiet truth');
    const bq = container.querySelector('blockquote.pull-quote');
    expect(bq).toBeTruthy();
    expect(bq?.textContent).toContain('a quiet truth');
  });

  it('renders an external link with new-tab safety + sr cue + persistent underline', () => {
    const { container } = renderMd('see [the repo](https://example.com/x) now');
    const a = container.querySelector('a[href="https://example.com/x"]');
    expect(a).toBeTruthy();
    expect(a?.getAttribute('target')).toBe('_blank');
    expect(a?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a?.className).toContain('underline'); // AA: not colour-only
    expect(a?.querySelector('.sr-only')?.textContent).toContain('opens in new tab');
  });

  it('renders an internal link without new-tab', () => {
    // next/link in the test env normalises the trailing slash (restored at
    // build by trailingSlash:true) — match on the path prefix.
    const { container } = renderMd('see [the work](/work/) here');
    const a = container.querySelector('a[href^="/work"]');
    expect(a).toBeTruthy();
    expect(a?.getAttribute('target')).toBeNull();
    expect(a?.className).toContain('underline');
  });

  it('treats a mixed block (not every line a marker) as a paragraph, not a list', () => {
    const { container } = renderMd('Intro line\n- not really a list');
    expect(container.querySelector('ul')).toBeNull();
    expect(container.querySelector('p')).toBeTruthy();
  });
});

describe('renderMarkdownProse — regression: unchanged constructs', () => {
  it('renders headings, emphasis, code, and a drop-cap first paragraph as before', () => {
    const md =
      '## Heading two\n\nFirst paragraph with **bold**, *italic*, and `code`.\n\n### Heading three\n\nSecond paragraph.';
    const { container } = renderMd(md);
    expect(container.querySelector('h2')?.textContent).toBe('Heading two');
    expect(container.querySelector('h3')?.textContent).toBe('Heading three');
    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelector('em')?.textContent).toBe('italic');
    expect(container.querySelector('code')?.textContent).toBe('code');
    // Drop cap only on the FIRST paragraph (unchanged behaviour).
    const paras = container.querySelectorAll('p');
    expect(paras[0].className).toContain('drop-cap');
    expect(paras[1].className).not.toContain('drop-cap');
    // Prose-only input must not sprout any new block construct.
    expect(container.querySelector('ul, ol, blockquote')).toBeNull();
  });

  it('keeps serif-display ligatures on prose headings', () => {
    const { container } = renderMd('## A heading');
    expect(container.querySelector('h2')?.className).toContain('serif-display');
  });
});
