import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { getBlogPosts, getDeliverables } from '@/lib/content';

/**
 * Astra Ultra 01 polish, as the owner approved it on 2026-10-24.
 *
 * Astra's own contract test demanded a Contact reorder ("Open to senior
 * support roles" moved to the top) and a different contribution heading. The
 * owner rejected the first and replaced the second, so this file pins the
 * approved outcome instead: the Contact introduction keeps its published
 * order, and the heading is the owner's preview candidate, word for word.
 */
const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('Astra Ultra 01 integration (owner-approved scope)', () => {
  it('keeps every public sitemap URL and stamps none with a build-time lastModified', () => {
    const expected = [
      '/', '/work/', '/about/', '/certificates/', '/blog/', '/contact/', '/accessibility/', '/colophon/',
      '/flagstone/', '/flagstone/support/', '/flagstone/privacy/', '/flagstone/terms/', '/flagstone/accessibility/',
      ...getDeliverables().map((d) => `/work/${d.id}/`),
      ...getBlogPosts().map((p) => `/blog/${p.id}/`),
    ];
    const entries = sitemap();
    expect(entries.map((e) => e.url).sort()).toEqual(expected.map((p) => `https://skypistudio.com${p}`).sort());
    for (const entry of entries) expect(entry).not.toHaveProperty('lastModified');
    expect(read('app/sitemap.ts')).not.toMatch(/new Date\(/);
  });

  it('leaves the Contact introduction in its published order (the recruiter-first reorder was rejected)', () => {
    const source = read('app/contact/page.tsx');
    const opening = source.indexOf('Accessible technology, built with care.');
    const roles = source.indexOf('Open to senior support roles, and to professional conversations.');
    const socials = source.indexOf('The socials below also work, for everything else.');
    expect(opening).toBeGreaterThan(-1);
    expect(roles).toBeGreaterThan(opening);
    expect(socials).toBeGreaterThan(roles);
  });

  it('names the LinkedIn pointer as a profile, in Contact and in the Footer it moves with', () => {
    for (const path of ['app/contact/page.tsx', 'components/Footer.tsx']) {
      const source = read(path);
      expect(source, path).toContain('<span>View LinkedIn profile</span>');
      expect(source, path).not.toContain('Full history on LinkedIn');
    }
  });

  it('labels the Record defect row as a documented defect, not the latest one', () => {
    const source = read('app/page.tsx');
    expect(source).toContain("figure: 'A documented defect',");
    expect(source).not.toContain("figure: 'Last defect'");
    // The claim stays checkable: the row still links to the case study's account.
    expect(source).toContain('/work/flagstone/#what-went-wrong');
  });

  it('carries the owner-approved contribution heading verbatim', () => {
    const source = read('app/page.tsx');
    expect(source).toContain('I set the direction, make the decisions, and guide AI-assisted implementation.');
    expect(source).not.toContain('I direct AI agents, and I built the system that keeps them honest.');
    expect(source).not.toContain('I set the direction. AI agents do the implementation.');
  });

  it('gives each certificate card a comfortable 16rem floor, capped at three columns', () => {
    expect(read('app/globals.css')).toContain(
      'grid-template-columns: repeat(auto-fit, minmax(min(100%, max(16rem, calc((100% - 8rem) / 3))), 1fr));',
    );
  });

  it.each([
    'app/about/page.tsx',
    'app/accessibility/page.tsx',
    'app/blog/page.tsx',
    'app/certificates/page.tsx',
    'app/colophon/page.tsx',
    'app/contact/page.tsx',
    'app/work/page.tsx',
  ])('%s gives keyboard focus on "Back to home" the same ink shift and arrow glide as hover', (path) => {
    const source = read(path);
    const end = source.indexOf('Back to home');
    const link = source.slice(source.lastIndexOf('href="/"', end), end);
    expect(link).toContain('hover:text-accent-text focus-visible:text-accent-text');
    expect(link).toContain('group-hover:-translate-x-1 group-focus-visible:-translate-x-1');
  });

  it('lights only the TOP rule of an active work-index row, so the last row keeps a neutral closing divider', () => {
    const css = read('app/globals.css');
    const block = css.slice(css.indexOf('/* M2 — the fine active-row rule'), css.indexOf('/* M2 — the existing doorway dot as local cue'));
    const hover = css.slice(css.indexOf('@media (hover: hover) {\n  #work ol > li:has(a:hover)'));
    const hoverBlock = hover.slice(0, hover.indexOf('\n}\n') + 3);
    // The transition is unchanged (it already covers every side's colour).
    expect(block).toContain('transition: border-color var(--dur-fast) ease-out;');
    for (const rules of [block, hoverBlock]) {
      expect(rules).toContain('border-top-color: rgb(var(--rgb-ink) / 0.5);');
      expect(rules).toContain('border-top-color: rgb(var(--rgb-accent) / 0.6);');
      expect(rules).not.toMatch(/^\s*border-color:/m);
    }
    // The last row's closing divider still exists in markup.
    expect(read('app/page.tsx')).toContain('className="group border-t border-border-decorative last:border-b"');
  });

  it('holds the case-study demo pill dot at its own size when a longer label wraps', () => {
    // Measured: "Read system overview" wraps in the 240px details column at
    // 1024, and flex squeezed the 8px dot to 6.98px. The pin lives at the
    // call site so the shared Button stays untouched.
    const source = read('app/work/[slug]/page.tsx');
    const start = source.indexOf('href={demoLink.href}');
    const pill = source.slice(start, source.indexOf('</Button>', start));
    expect(pill).toContain('className="[&>.rounded-full]:shrink-0"');
    expect(pill).toContain('variant="primary"');
  });

  it.each(['components/ProjectCard.tsx', 'components/CaseStudyCard.tsx'])(
    '%s keeps the demo link interaction classes exactly as shipped',
    (path) => {
      // The label change is text only: hover colour, transition timing,
      // focus ring and the one-sided touch extension are the shipped string.
      const source = read(path);
      const start = source.indexOf('href={demoLink.href}');
      const anchor = source.slice(start, source.indexOf('</a>', start));
      for (const cls of [
        'relative', 'px-1', 'py-1', '-mx-1', '-my-1',
        'after:absolute', 'after:inset-x-0', 'after:top-0', 'after:-bottom-[21px]', "after:content-['']",
        'inline-flex', 'items-center', 'gap-1.5', 'rounded-sm', 'font-mono', 'text-meta', 'uppercase', 'tracking-label',
        'text-text-meta', 'transition-colors', 'duration-fast', 'ease-out', 'hover:text-ink',
        'focus-visible:outline-2', 'focus-visible:outline-offset-2', 'focus-visible:outline-accent-primary',
      ]) {
        expect(anchor, `${path} lost ${cls}`).toMatch(new RegExp(`[" ]${cls.replace(/[[\]().*+?^$|\\-]/g, '\\$&')}[" ]`));
      }
      expect(anchor).toContain('{demoLink.label} <span aria-hidden="true">↗</span>');
    },
  );
});
