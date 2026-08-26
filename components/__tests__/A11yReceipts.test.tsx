/**
 * A11yReceipts floor tests (S6 / L6-02 enhancement).
 *
 * The receipts strip's whole value is honesty — these tests pin the honesty
 * mechanics, not the pixels:
 *  1. content/a11y-receipts.json validates (6 receipts, ISO date, method).
 *  2. The evidence JSON the page links to actually ships under public/ and
 *     agrees with the published numbers (no page/evidence drift).
 *  3. The statement split seats the strip BEFORE "What I have not done" and
 *     drops nothing (built + limits reassemble the full statement).
 *  4. SSR: figures are aria-hidden with sr-only final-value names (the L6-05
 *     CountUpStat contract), and the strip heads itself with a real h2.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';

import { A11yReceipts } from '@/components/A11yReceipts';
import {
  getA11yReceipts,
  getAccessibilityStatement,
  getAccessibilityStatementParts,
} from '@/lib/content';

describe('a11y receipts content', () => {
  it('validates and carries exactly six receipts (the grid closes clean)', () => {
    const data = getA11yReceipts();
    expect(data.receipts).toHaveLength(6);
    expect(data.measuredDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('the linked evidence JSON ships in public/ and matches the published numbers', () => {
    const data = getA11yReceipts();
    const evidence = JSON.parse(
      readFileSync(join(process.cwd(), 'public', data.evidencePath), 'utf8'),
    );
    expect(evidence.measuredDate).toBe(data.measuredDate);
    // Every published receipt value must appear verbatim in the evidence
    // summary — the strip can never show a number the evidence doesn't carry.
    for (const r of data.receipts) {
      expect(evidence.summary, `evidence summary missing "${r.label}"`).toHaveProperty(r.label);
      expect(String(evidence.summary[r.label].value)).toBe(r.value);
    }
  });
});

describe('accessibility statement split (S6 placement contract)', () => {
  it('splits at the limits heading and drops nothing', () => {
    const { built, limits } = getAccessibilityStatementParts();
    expect(built).not.toContain('## What I have not done');
    expect(limits.startsWith('## What I have not done')).toBe(true);
    expect(`${built}\n${limits}`).toBe(getAccessibilityStatement());
  });
});

describe('A11yReceipts SSR', () => {
  const data = getA11yReceipts();
  const html = renderToString(<A11yReceipts data={data} />);

  it('renders every receipt with an sr-only final-value name (L6-05 contract)', () => {
    for (const r of data.receipts) {
      expect(html).toContain(`${r.value} ${r.label}`);
    }
    // The animated figures never reach AT.
    expect(html.match(/aria-hidden="true"/g)!.length).toBeGreaterThanOrEqual(6);
  });

  it('links the evidence JSON and heads itself with an h2', () => {
    expect(html).toContain(`href="${data.evidencePath}"`);
    expect(html).toMatch(/<h2[^>]*>.*Measured, not claimed/i);
    // Honest framing is structural — the strip must carry the run date.
    expect(html).toContain(data.measuredDate);
  });

  it('SSR emits no inline opacity:0 (RM/no-JS floor)', () => {
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('opacity: 0');
  });
});

/**
 * THE ROOM / Phase G · G2 — the method underline, many-to-one.
 *
 * This strip is the one place where six figures share ONE method line, so the
 * pair has to actually CONTAIN both halves for `.method-pair:hover` to reach
 * the anchor. A wrapper that closed in the wrong place would still render
 * fine and silently break the tic — hence the containment assertion rather
 * than a class-presence one.
 */
describe('A11yReceipts — the G2 method underline', () => {
  const data = getA11yReceipts();

  it('one method pair CONTAINS both the figure grid and the evidence anchor', () => {
    const host = document.createElement('div');
    host.innerHTML = renderToString(<A11yReceipts data={data} />);
    const pair = host.querySelector('.method-pair');
    expect(pair).not.toBeNull();

    // Both halves of the relation live inside the same pair.
    expect(pair!.querySelector('.grid')).not.toBeNull();
    const link = pair!.querySelector<HTMLAnchorElement>(`a[href="${data.evidencePath}"]`);
    expect(link).not.toBeNull();
    expect(link!.className).toContain('method-draw');
    expect(link!.className).toContain('link-draw');

    // Every published figure sits inside the pair too — all six, not just the
    // first cell (a wrapper opened one element too late would still pass the
    // grid check above).
    for (const r of data.receipts) expect(pair!.textContent).toContain(r.value);
  });

  it('the evidence door is already open at rest — no hover gating', () => {
    const html = renderToString(<A11yReceipts data={data} />);
    // Rendered as ordinary text, in the a11y tree, with no visibility gate.
    expect(html).toContain('Evidence JSON');
    expect(html).not.toMatch(/class="[^"]*\b(sr-only|invisible|opacity-0)\b[^"]*"[^>]*>\s*Evidence JSON/);
  });

  it('the wrapper is UNSTYLED — .method-pair must never carry layout', () => {
    const host = document.createElement('div');
    host.innerHTML = renderToString(<A11yReceipts data={data} />);
    // Layout-neutrality is the whole reason this extra div was allowed in;
    // a future utility class added here would be a real regression.
    expect(host.querySelector('.method-pair')!.getAttribute('class')).toBe('method-pair');
  });
});
