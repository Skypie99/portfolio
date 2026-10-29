import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ProjectCard } from '@/components/ProjectCard';
import { CaseStudyCard } from '@/components/CaseStudyCard';
import { getDeliverables } from '@/lib/content';

afterEach(cleanup);
const labels: Record<string, string> = {
  flagstone: 'Open web app', 'claude-corp': 'Read system overview', dashboard: 'Try synthetic demo',
  'prompt-library': 'Open Prompt Library', 'ghost-code': 'Play Ghost Code',
};
/**
 * Demo-link tab contract (hotfix 2026-10-29, owner decision): the Claude Corp
 * and Dashboard demo actions no longer FORCE a new tab — they keep their
 * genuine destination and label but open in the current tab, like every
 * project-opening control. The other three keep the site's new-tab demo
 * convention. Stated here independently of lib/demoLinks so the guard fails
 * if either side drifts.
 */
const sameTabDemos = new Set(['claude-corp', 'dashboard']);
describe('external project destinations', () => {
  for (const d of getDeliverables()) {
    for (const kind of ['project', 'case'] as const) {
      it(`${kind}: ${d.id} exposes its complete destination label`, () => {
        if (kind === 'project') render(<ProjectCard deliverable={d} />);
        else render(<CaseStudyCard title={d.title} category={d.id === 'ghost-code' ? 'ghost' : d.id as 'flagstone' | 'claude-corp' | 'dashboard' | 'prompt-library'} description={d.summary} href={`/work/${d.id}/`} links={d.links} />);
        const label = labels[d.id];
        const sameTab = sameTabDemos.has(d.id);
        const link = screen.getByRole('link', {
          name: `${label} for ${d.title}${sameTab ? '' : ' (opens in new tab)'}`,
        });
        expect(link.textContent?.trim()).toBe(`${label} ↗`);
        expect(link).toHaveAttribute('href', d.links?.find((l) => l.type === 'demo')?.href);
        if (sameTab) {
          expect(link).not.toHaveAttribute('target');
          expect(link.getAttribute('aria-label') ?? '').not.toContain('opens in new tab');
        } else {
          expect(link).toHaveAttribute('target', '_blank');
        }
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    }
  }
});
