/**
 * project-nav-tab-contract — the Claude Corp / Dashboard navigation guard
 * (hotfix 2026-10-29).
 *
 * The owner-reported defect: project-opening controls for Claude Corp and
 * Claude Corp Dashboard "open new tabs or leave the intended SkyPi project-
 * page experience". The contract this file locks:
 *
 *  1. ORDINARY PROJECT NAVIGATION (row titles, card titles, "View project"
 *     pills, related-work cards) is a plain internal anchor to /work/<id>/
 *     with NO target — so a normal click, Enter or tap cannot increase the
 *     tab count, modifier-click still opens a new tab when the visitor
 *     chooses, and history Back returns. Identities:
 *       Flagstone        → /work/flagstone/
 *       Claude Corp      → /work/claude-corp/
 *       Claude Corp Dashboard → /work/dashboard/
 *
 *  2. DEMO LINKS ARE TESTED SEPARATELY (they open demos, not case studies):
 *     the Claude Corp and Dashboard demo actions open in the current tab to
 *     their genuine destinations (owner decision 2026-10-29, lib/demoLinks);
 *     Flagstone, Prompt Library and Ghost Code keep the new-tab convention.
 *
 * The interactive half of the same contract (real clicks, Back, tab counts)
 * is browser-verified in the run's evidence/nav-*.json probes.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

// Own timers before GSAP module evaluation, for this file only.
await vi.hoisted(async () => {
  const { ownGsapTimers } = await import('../../test-utils/gsap-teardown');
  ownGsapTimers();
});

import HomePage from '@/app/page';
import { CaseStudyCard } from '@/components/CaseStudyCard';
import { ProjectCard } from '@/components/ProjectCard';
import { getDeliverables } from '@/lib/content';

const ROOT = resolve(__dirname, '../..');
const OUT_DIR = join(ROOT, 'out');

const PROJECTS: Array<{ id: string; title: string; href: string }> = [
  { id: 'flagstone', title: 'Flagstone', href: '/work/flagstone/' },
  { id: 'claude-corp', title: 'Claude Corp', href: '/work/claude-corp/' },
  { id: 'dashboard', title: 'Claude Corp Dashboard', href: '/work/dashboard/' },
  { id: 'prompt-library', title: 'Prompt Library', href: '/work/prompt-library/' },
  { id: 'ghost-code', title: 'Ghost Code', href: '/work/ghost-code/' },
];

beforeAll(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(cleanup);

/** An anchor's same-tab contract: real internal href, no target attribute. */
function expectSameTabInternal(link: HTMLElement, href: string) {
  const rendered = link.getAttribute('href') ?? '';
  // next/link may drop the trailing slash client-side; the contract is the
  // route identity + the tab behavior, not the slash spelling.
  expect(rendered.replace(/\/$/, '')).toBe(href.replace(/\/$/, ''));
  expect(link).not.toHaveAttribute('target');
  expect(rendered).not.toMatch(/^https?:/);
}

describe('ordinary project navigation opens the internal case study in the same tab', () => {
  it('homepage rows: title and View project for Claude Corp, Dashboard and Flagstone', () => {
    render(<HomePage />);
    for (const { title, href } of PROJECTS) {
      expectSameTabInternal(screen.getByRole('link', { name: `View ${title} project` }), href);
      expectSameTabInternal(screen.getByRole('link', { name: `View project: ${title} case study` }), href);
    }
  });

  it('work gallery + related-work cards: CaseStudyCard title and View project', () => {
    for (const d of getDeliverables()) {
      render(
        <CaseStudyCard
          title={d.title}
          category={d.id === 'ghost-code' ? 'ghost' : d.id as 'flagstone' | 'claude-corp' | 'dashboard' | 'prompt-library'}
          description={d.summary}
          href={`/work/${d.id}/`}
          links={d.links}
        />,
      );
      expectSameTabInternal(screen.getByRole('link', { name: `${d.title}: read the case study` }), `/work/${d.id}/`);
      expectSameTabInternal(screen.getByRole('link', { name: `View project: ${d.title} case study` }), `/work/${d.id}/`);
      cleanup();
    }
  });

  it('ProjectCard title and View project carry the same contract', () => {
    for (const d of getDeliverables()) {
      render(<ProjectCard deliverable={d} />);
      expectSameTabInternal(
        screen.getByRole('link', { name: `${d.title}: ${d.role}, ${d.year}` }),
        `/work/${d.id}/`,
      );
      cleanup();
    }
  });
});

describe('demo links (explicit demo actions — tested separately)', () => {
  it('Claude Corp and Dashboard demo actions keep their destination and label but open in the current tab', () => {
    for (const d of getDeliverables().filter((x) => x.id === 'claude-corp' || x.id === 'dashboard')) {
      const demo = d.links!.find((l) => l.type === 'demo')!;
      render(<ProjectCard deliverable={d} />);
      const link = screen.getByRole('link', { name: `${demo.label} for ${d.title}` });
      expect(link).toHaveAttribute('href', demo.href);
      expect(link).not.toHaveAttribute('target');
      expect(link.getAttribute('aria-label') ?? '').not.toContain('opens in new tab');
      cleanup();
    }
  });

  it('Flagstone, Prompt Library and Ghost Code demo actions keep the new-tab convention', () => {
    for (const d of getDeliverables().filter((x) => !['claude-corp', 'dashboard'].includes(x.id))) {
      const demo = d.links!.find((l) => l.type === 'demo')!;
      render(<ProjectCard deliverable={d} />);
      const link = screen.getByRole('link', { name: `${demo.label} for ${d.title} (opens in new tab)` });
      expect(link).toHaveAttribute('href', demo.href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      cleanup();
    }
  });

  it('keeps GitHub, App Store and external reference links unchanged', () => {
    for (const d of getDeliverables()) {
      for (const l of d.links ?? []) {
        if (l.type === 'demo') continue;
        render(<ProjectCard deliverable={d} />);
        const matches = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === l.href);
        for (const a of matches) {
          if (/^https?:/.test(l.href)) {
            expect(a, `${d.id} ${l.label}`).toHaveAttribute('target', '_blank');
            expect(a).toHaveAttribute('rel', 'noopener noreferrer');
          }
        }
        cleanup();
      }
    }
  });
});

function collectHtmlFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) collectHtmlFiles(p, acc);
    else if (entry.endsWith('.html')) acc.push(p);
  }
  return acc;
}

describe.runIf(!existsSync(OUT_DIR))('built-output navigation census (build-dependent)', () => {
  it.skip('skipped: needs ./out/; run `npm run build` first to exercise these', () => {});
});

describe.runIf(existsSync(OUT_DIR))('built-output navigation census (build-dependent)', () => {
  it('ships no internal anchor with target="_blank" on any rendered route', () => {
    const offenders: string[] = [];
    for (const file of collectHtmlFiles(OUT_DIR)) {
      const html = readFileSync(file, 'utf8');
      for (const m of html.matchAll(/<a\b[^>]*>/g)) {
        const tag = m[0];
        const href = /(?<![a-zA-Z-])href="([^"]*)"/.exec(tag)?.[1] ?? '';
        const target = /(?<![a-zA-Z-])target="([^"]*)"/.exec(tag)?.[1];
        if (target === '_blank' && (href.startsWith('/') || href.startsWith('#'))) {
          offenders.push(`${file.replace(OUT_DIR, '')} → ${href}`);
        }
      }
    }
    expect(offenders, `internal links forced to a new tab: ${offenders.join(', ')}`).toEqual([]);
  });

  it('Claude Corp and Dashboard case studies: the demo action opens in the current tab', () => {
    for (const [file, host] of [
      ['work/claude-corp/index.html', 'claudecorp.skypistudio.com'],
      ['work/dashboard/index.html', 'dashboard.skypistudio.com'],
    ] as const) {
      const html = readFileSync(join(OUT_DIR, file), 'utf8');
      const tag = [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]).find((t) => t.includes(host));
      expect(tag, `${file} demo anchor`).toBeDefined();
      expect(/(?<![a-zA-Z-])target=/.exec(tag!), `${file} demo anchor must carry no target`).toBeNull();
      expect(tag!, `${file} demo anchor keeps its genuine destination`).toContain(`href="https://${host}"`);
    }
  });

  it('Flagstone case study keeps its new-tab demo and App Store actions', () => {
    const html = readFileSync(join(OUT_DIR, 'work/flagstone/index.html'), 'utf8');
    for (const host of ['flagstone.skypistudio.com', 'apps.apple.com']) {
      const tag = [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]).find((t) => t.includes(host) && t.includes('target='));
      expect(tag, `${host} keeps target=_blank`).toBeDefined();
    }
  });
});
