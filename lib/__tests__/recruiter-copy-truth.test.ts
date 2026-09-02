/**
 * Recruiter copy truth guards (Portfolio Cook Out · Prompt 3, 2026-09-02).
 *
 * The story/truth refresh replaced or reworded recruiter-facing copy against
 * verified source evidence (docs/PORTFOLIO_TRUTH_MANIFEST.md + the Prompt 3
 * receipt). These guards keep the governance-critical truths from drifting
 * back, one invariant per test, without snapshotting whole paragraphs:
 *
 *   - Flagstone's App Store state stays "submitted", never released/approved.
 *   - Prompt Library's privacy wording names the Anthropic call and never
 *     claims that nothing leaves the browser.
 *   - The Dashboard's public demo stays clearly synthetic.
 *   - Claude Corp's autonomy wording stays bounded.
 *   - The Studio Archive stays unlisted and noindex.
 *   - Current-facing product naming is Flagstone, not AccessMap.
 *   - The Prompt 2 CTA vocabulary (View project / Live demo / GitHub) holds.
 *   - Recruiter-facing copy carries zero em dashes, in source and in the
 *     built output (the renderer also turns `--` into one, so that is banned
 *     in bodies too).
 *
 * The built-output checks read ./out/ and are labeled-skipped when no build
 * exists, the same convention as static-integrity.test.ts.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  getAccessibilityStatement,
  getBlogPosts,
  getColophon,
  getDeliverables,
  getProfile,
} from '@/lib/content';
import type { Deliverable } from '@/lib/schema';
import { UNINDEXED_ROUTES } from '@/lib/sectionNav';

const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, 'out');
const EM_DASH = '—';

const read = (p: string): string => readFileSync(resolve(ROOT, p), 'utf8');

/** Every human-readable string a deliverable ships to a visitor. */
function deliverableStrings(d: Deliverable): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  const push = (where: string, text: string | undefined) => {
    if (typeof text === 'string') out.push({ where: `${d.id}.${where}`, text });
  };
  push('title', d.title);
  push('summary', d.summary);
  push('status', d.status);
  push('role', d.role);
  push('body', d.body);
  push('heroImage.alt', d.heroImage.alt);
  push('heroShot.alt', d.heroShot?.alt);
  push('cardImage.alt', d.cardImage?.alt);
  push('heroPlate.severity', d.heroPlate?.severity);
  push('heroPlate.caption', d.heroPlate?.caption);
  push('heroPlate.provenance', d.heroPlate?.provenance);
  (d.shots ?? []).forEach((s, i) => {
    push(`shots[${i}].alt`, s.alt);
    push(`shots[${i}].caption`, s.caption);
    push(`shots[${i}].video.alt`, s.video?.alt);
  });
  (d.links ?? []).forEach((l, i) => push(`links[${i}].label`, l.label));
  d.tags.forEach((t, i) => push(`tags[${i}]`, t));
  return out;
}

/** Walk ./out/ and return every .html file (absolute paths). */
function collectHtml(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...collectHtml(full));
    else if (entry.endsWith('.html')) results.push(full);
  }
  return results;
}

const routeOf = (file: string): string =>
  file.slice(OUT_DIR.length).replace(/index\.html$/, '').replace(/\\/g, '/') || '/';

/**
 * Rendered routes allowed to carry em dashes: legal source material (the
 * Flagstone privacy policy and terms) and the private, noindex archive. None
 * of them is recruiter-facing portfolio copy, and Prompt 3 did not rewrite
 * them. Anything else on the site must be em-dash free.
 */
const EM_DASH_ALLOWED_ROUTES = new Set(['/flagstone/privacy/', '/flagstone/terms/', '/archive/']);

/** Phrases that must never appear in rendered recruiter copy (case-insensitive). */
const PROHIBITED_CI: RegExp[] = [
  /no users yet/i,
  /nothing to breach/i,
  /never leaves? (?:your|the) (?:browser|machine|computer)/i,
  /nothing leaves (?:your|the) (?:browser|machine|computer)/i,
  /fully autonomous/i,
  /all open source/i,
  /released on the App Store/i,
  /available on the App Store/i,
  /approved by Apple/i,
  /live private data/i,
  /real operational data/i,
];
/** Case-sensitive doorway labels retired by Prompt 2 (the card title's
 *  lowercase "read the case study" accessible name is a P2-accepted pattern). */
const PROHIBITED_CS: RegExp[] = [/Read the case study/, /Live map/];

describe('recruiter copy truth guards (Prompt 3)', () => {
  const deliverables = getDeliverables();
  const byId = (id: string): Deliverable => {
    const d = deliverables.find((x) => x.id === id);
    if (!d) throw new Error(`deliverable "${id}" is missing`);
    return d;
  };

  it('carries no em dash in any deliverable string, profile string, or long-form statement', () => {
    const offenders: string[] = [];
    for (const d of deliverables) {
      for (const s of deliverableStrings(d)) if (s.text.includes(EM_DASH)) offenders.push(s.where);
    }
    const profile = getProfile();
    for (const [k, v] of Object.entries(profile)) {
      if (typeof v === 'string' && v.includes(EM_DASH)) offenders.push(`profile.${k}`);
    }
    if (getColophon().includes(EM_DASH)) offenders.push('getColophon()');
    if (getAccessibilityStatement().includes(EM_DASH)) offenders.push('getAccessibilityStatement()');
    for (const p of getBlogPosts()) {
      if (p.title.includes(EM_DASH)) offenders.push(`blog.${p.id}.title`);
      if (p.summary.includes(EM_DASH)) offenders.push(`blog.${p.id}.summary`);
      if (p.content.includes(EM_DASH)) offenders.push(`blog.${p.id}.content`);
    }
    expect(offenders, `em dash in recruiter copy: ${offenders.join(', ')}`).toEqual([]);
  });

  it('never authors a double hyphen in a body, which the renderer would turn into an em dash', () => {
    const offenders = deliverables.filter((d) => (d.body ?? '').includes('--')).map((d) => d.id);
    expect(offenders).toEqual([]);
    expect(getColophon()).not.toContain('--');
    expect(getAccessibilityStatement()).not.toContain('--');
  });

  it('keeps prohibited claims out of every deliverable string and long-form statement', () => {
    const offenders: string[] = [];
    const texts = [
      ...deliverables.flatMap(deliverableStrings),
      { where: 'getColophon()', text: getColophon() },
      { where: 'getAccessibilityStatement()', text: getAccessibilityStatement() },
      { where: 'app/about/page.tsx', text: read('app/about/page.tsx') },
    ];
    for (const { where, text } of texts) {
      for (const re of [...PROHIBITED_CI, ...PROHIBITED_CS]) {
        if (re.test(text)) offenders.push(`${where} matches ${re}`);
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('Flagstone: submission stays a submission, not an approval or a release', () => {
    const f = byId('flagstone');
    const copy = `${f.status}\n${f.summary}\n${f.body ?? ''}`;
    expect(f.status).toMatch(/submitted/i);
    expect(copy).toMatch(/Apple approval and public App Store availability have not been established/);
    expect(copy).not.toMatch(/approved|released on|available on the App Store|download(?:able)? from the App Store/i);
  });

  it('Flagstone: no unqualified "every finding fixed" claim, and no invented test total in the body', () => {
    const body = byId('flagstone').body ?? '';
    // The 48-finding simulator walk left two findings deliberately open; the
    // body must keep saying so rather than "accounted for every one".
    expect(body).not.toMatch(/accounted for every one/i);
    expect(body).toMatch(/48 findings/);
    expect(body).toMatch(/2 deliberately left open/);
    // The exact test figure lives only in the dated receipt strip on the page.
    expect(body).not.toMatch(/\b\d{1,2},\d{3} tests\b/);
  });

  it('Prompt Library: privacy wording names the Anthropic call and never claims nothing leaves the browser', () => {
    const p = byId('prompt-library');
    const copy = `${p.summary}\n${p.body ?? ''}`;
    expect(copy).toMatch(/Anthropic/);
    expect(copy).toMatch(/browser/);
    expect(copy).toMatch(/no (?:server|backend)/i);
    expect(copy).not.toMatch(/never leaves?|nothing leaves|completely offline|Anthropic receives nothing/i);
    // Roadmap providers are future plans, never current features.
    expect(copy).not.toMatch(/OpenAI|DeepSeek/);
  });

  it('Dashboard: the public demo stays clearly synthetic and the private data stays private', () => {
    const d = byId('dashboard');
    expect(d.status).toMatch(/synthetic/i);
    expect(d.summary).toMatch(/synthetic/i);
    expect(d.body ?? '').toMatch(/synthetic/i);
    expect(d.body ?? '').toMatch(/persists nothing/);
    expect(`${d.summary}\n${d.status}`).not.toMatch(/^live\b/i);
  });

  it('Claude Corp: autonomy stays bounded and merge authority stays human', () => {
    const c = byId('claude-corp');
    const copy = `${c.summary}\n${c.status}\n${c.body ?? ''}`;
    expect(c.summary).toMatch(/bounded/i);
    expect(copy).toMatch(/merging is mine/);
    expect(copy).not.toMatch(/fully autonomous|always[- ]on|24\/7|autonomous backlog|unrestricted merge|deploy freely/i);
  });

  it('Ghost Code: the origin is a learn-by-building first project, with no arcade-era positioning', () => {
    const g = byId('ghost-code');
    const copy = `${g.summary}\n${g.body ?? ''}`;
    expect(copy).toMatch(/first real build/);
    expect(copy).toMatch(/Claude Code/);
    expect(copy).toMatch(/56/);
    expect(copy).not.toMatch(/retro arcade/i);
    // Mastery is a local counter; never oversold as adaptive learning.
    expect(copy).not.toMatch(/spaced repetition|adaptive learning|AI-driven/i);
  });

  it('Studio Archive stays unlisted: not a deliverable, not linked from the public chrome, noindex', () => {
    expect(deliverables.some((d) => /archive/i.test(`${d.id} ${d.title}`))).toBe(false);
    expect(UNINDEXED_ROUTES).toContain('/archive');
    expect(read('app/archive/page.tsx')).toMatch(/index:\s*false/);
    for (const file of [
      'app/page.tsx',
      'app/work/page.tsx',
      'app/about/page.tsx',
      'components/Footer.tsx',
      'components/HamburgerNav.tsx',
      'components/Sidebar.tsx',
      'components/SidebarRailLinks.tsx',
    ]) {
      expect(read(file), `${file} links to /archive`).not.toMatch(/href=["'{`]+\/archive/);
    }
  });

  it('current-facing product naming is Flagstone, never AccessMap', () => {
    for (const d of deliverables) {
      for (const s of deliverableStrings(d)) {
        if (s.where.endsWith('.body')) continue; // bodies may cite the GitHub repo URL by its real name
        expect(s.text, `${s.where}`).not.toContain('AccessMap');
      }
    }
    expect(getColophon()).not.toContain('AccessMap');
    expect(getAccessibilityStatement()).not.toContain('AccessMap');
    expect(read('app/about/page.tsx')).not.toContain('AccessMap');
  });

  it('keeps the Prompt 2 doorway vocabulary: demo links say "Live demo", source links say "GitHub"', () => {
    for (const d of deliverables) {
      for (const l of d.links ?? []) {
        if (l.type === 'demo') expect(l.label, `${d.id} demo label`).toBe('Live demo');
        if (l.type === 'github') expect(l.label, `${d.id} github label`).toBe('GitHub');
      }
    }
  });
});

describe.runIf(!existsSync(OUT_DIR))('recruiter copy truth guards (build-dependent)', () => {
  it.skip('skipped: needs ./out/; run `npm run test:static` (build → test) to exercise these', () => {});
});

describe.runIf(existsSync(OUT_DIR))('rendered recruiter routes (built output)', () => {
  const files = collectHtml(OUT_DIR);

  it('ships zero em dashes on every rendered route outside the legal/private allowlist', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const route = routeOf(file);
      if (EM_DASH_ALLOWED_ROUTES.has(route)) continue;
      const count = readFileSync(file, 'utf8').split(EM_DASH).length - 1;
      if (count > 0) offenders.push(`${route} (${count})`);
    }
    expect(offenders, `em dashes in rendered routes: ${offenders.join(', ')}`).toEqual([]);
  });

  it('ships none of the prohibited claims on any rendered route', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const route = routeOf(file);
      if (route === '/archive/') continue; // private, noindex, not recruiter copy
      const html = readFileSync(file, 'utf8');
      for (const re of [...PROHIBITED_CI, ...PROHIBITED_CS]) {
        if (re.test(html)) offenders.push(`${route} matches ${re}`);
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});
