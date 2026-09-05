import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getDeliverables } from '@/lib/content';

describe('Phase 04 Flagstone professional relevance and claim boundaries', () => {
  it('keeps one support bridge beside the specific failure evidence and preserves the role partition', () => {
    const flagstone = getDeliverables().find((d) => d.id === 'flagstone')!;
    const body = flagstone.body ?? '';
    const bridge = body.indexOf('This is the support work Flagstone demonstrates:');
    expect(body.match(/This is the support work Flagstone demonstrates:/g)).toHaveLength(1);
    expect(bridge).toBeGreaterThan(body.indexOf('## What went wrong'));
    expect(bridge).toBeLessThan(body.indexOf('## Reflection'));
    for (const evidence of ['**Mine.**', "**The agents'.**", '**What I check.**',
      'renders the parent instead of the child', 'fails against the old arrangement',
      'there is no adoption to report']) {
      expect(body).toContain(evidence);
    }
  });

  it('scopes About accessibility wording to Flagstone and its documented methods and limitations', () => {
    const about = readFileSync(resolve('app/about/page.tsx'), 'utf8');
    expect(about).not.toMatch(/WCAG[^.]*every interface/i);
    expect(about).toContain('Flagstone is built and tested against WCAG 2.2 AA');
    expect(about).toMatch(/methods and\s+limitations documented in its case study/);
    expect(about).not.toMatch(/(?:WCAG.{0,30}certified|accessibility certified)/i);
  });
});
