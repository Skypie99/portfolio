/**
 * Fable polish — the press, hover-gate, touch-target and keyboard-parity
 * contract (P1–P5), locked at the source level.
 *
 * jsdom has no layout engine, no media queries and no pointer, so the things a
 * browser would prove are asserted as the rules and classes that produce them.
 * Each case names the exact failure it prevents; the measured browser evidence
 * (computed colours, effective heights, 390/768/1024 touch emulation) lives in
 * the run's evidence directory.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const CSS = readFileSync(join(ROOT, 'app', 'globals.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

interface Rule {
  selector: string;
  ancestors: string[];
}

function rules(css: string): Rule[] {
  const out: Rule[] = [];
  const stack: string[] = [];
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      const prelude = css.slice(start, i).trim();
      if (!prelude.startsWith('@')) out.push({ selector: prelude, ancestors: [...stack] });
      stack.push(prelude);
      start = i + 1;
    } else if (ch === '}') {
      stack.pop();
      start = i + 1;
    } else if (ch === ';') {
      start = i + 1;
    }
  }
  return out;
}

const ALL = rules(CSS);
const bySelector = (needle: string) => ALL.filter((r) => r.selector.includes(needle));
const gated = (r: Rule) => r.ancestors.some((a) => /^@media\s*\(hover:\s*hover\)/.test(a));

/** The body of a top-level rule, by exact selector. */
function bodyOf(selector: string): string {
  const start = CSS.indexOf(`${selector} {`);
  expect(start, `rule present: ${selector}`).toBeGreaterThan(-1);
  const open = CSS.indexOf('{', start);
  const close = CSS.indexOf('}', open);
  return CSS.slice(open + 1, close);
}

describe('P3 — pressed ink wins and the footer wash eases', () => {
  it('gives the press rule enough specificity to beat a hover utility', () => {
    // Tailwind's hover utilities are emitted AFTER globals.css in the compiled
    // sheet, so a same-specificity :active loses. The doubled class is 0,3,0.
    const press = bySelector('.tactile-link.tactile-link:active');
    expect(press.length).toBeGreaterThan(0);
  });

  it('presses to the intended ink and the 10% warm tint, half-fast', () => {
    const body = bodyOf('.tactile-link.tactile-link:active');
    expect(body).toContain('color: var(--color-link-hover)');
    expect(body).toContain('background-color: rgb(var(--rgb-accent) / 0.1)');
    expect(body).toContain('transition-duration: calc(var(--dur-fast) / 2)');
  });

  it('transitions background-color on the base (release) duration', () => {
    const base = bodyOf('.link-draw,\n.profile-pointer,\n.quiet-link');
    expect(base).toContain('background-color var(--dur-base) var(--ease-out)');
  });

  it('keeps the press-in half the release on the arrow too', () => {
    expect(bodyOf('.tactile-link.tactile-link:active > .tactile-arrow')).toContain(
      'transition-duration: calc(var(--dur-fast) / 2)',
    );
  });
});

describe('P2 — hover is a fine-pointer invitation', () => {
  const hoverSelectors = [
    '.link-draw:hover',
    '.group:hover > .link-draw-group',
    '.method-pair:hover .method-draw',
  ];

  for (const selector of hoverSelectors) {
    it(`gates ${selector} behind @media (hover: hover)`, () => {
      const rule = ALL.find((r) => r.selector.trim() === selector);
      expect(rule, selector).toBeTruthy();
      expect(gated(rule!)).toBe(true);
    });
  }

  it('keeps the keyboard answers ungated', () => {
    expect(ALL.some((r) => r.selector.includes('.link-draw:focus-visible') && !gated(r))).toBe(true);
    expect(ALL.some((r) => r.selector.includes('.group:focus-visible > .link-draw-group') && !gated(r))).toBe(true);
    expect(ALL.some((r) => r.selector.includes('.method-pair:focus-within .method-draw') && !gated(r))).toBe(true);
  });

  it('gates the remaining component hover classes named by Fable', () => {
    const files: Array<[string, string[]]> = [
      ['components/IntroSkip.tsx', ['[@media(hover:hover)]:hover:text-accent']],
      ['components/ThemedMotion.tsx', ['[@media(hover:hover)]:hover:text-accent']],
      ['app/about/page.tsx', ['[@media(hover:hover)]:hover:text-accent-text']],
      ['app/blog/page.tsx', ['[@media(hover:hover)]:group-hover:text-accent-text']],
      ['components/SidebarArticleNav.tsx', ['[@media(hover:hover)]:group-hover:translate-x-0.5']],
      ['components/SidebarSectionNav.tsx', ['[@media(hover:hover)]:hover:text-ink']],
      ['components/TactileMedia.tsx', ['[@media(hover:hover)]:group-hover:scale-[1.05]']],
    ];
    for (const [file, needles] of files) {
      const src = read(file);
      for (const needle of needles) expect(src, `${file} carries ${needle}`).toContain(needle);
    }
  });

  it('does not leave an ungated hover on a link in the blog index', () => {
    const src = read('app/blog/page.tsx');
    // Every hover that changes ink must sit behind the fine-pointer gate.
    for (const line of src.split('\n')) {
      if (!line.includes('hover:text-accent-text')) continue;
      if (line.includes('focus-visible:text-accent-text') && !line.includes('hover:hover')) continue;
      expect(line, line.trim()).toMatch(/\[@media\(hover:hover\)\]:/);
    }
  });
});

describe('P1 — 44px coarse-pointer targets, desktop untouched', () => {
  it('footer nav keeps 44px until a FINE pointer widens the row back out', () => {
    const src = read('components/Footer.tsx');
    expect(src).toContain('md:[@media(pointer:fine)]:min-h-0');
    expect(src).not.toMatch(/md:min-h-0/);
  });

  it('the touch helpers are pointer-scoped, never width-scoped', () => {
    const src = read('lib/touch.ts');
    expect(src).toContain('[@media(pointer:coarse)]:min-h-11');
    expect(src).not.toContain('md:min-h-11');
  });

  it('wires the named targets: blog feeds, contact LinkedIn, breadcrumbs', () => {
    expect(read('app/blog/page.tsx')).toContain('TOUCH_TARGET_COARSE');
    expect(read('app/contact/page.tsx')).toContain('TOUCH_HEIGHT_COARSE');
    const crumbs = read('app/work/[slug]/page.tsx');
    expect(crumbs).toContain('[@media(pointer:coarse)]:min-h-11');
    const blogCrumb = read('app/blog/[slug]/page.tsx');
    expect(blogCrumb).toContain('[@media(pointer:coarse)]:min-h-11');
  });
});

describe('P4 — frosted controls share the approved press language', () => {
  for (const file of ['components/IntroSkip.tsx', 'components/ThemedMotion.tsx']) {
    it(`${file} presses with the inset 10% tint and the accent hairline`, () => {
      const src = read(file);
      expect(src).toContain('active:shadow-[inset_0_0_0_1.5rem_rgb(var(--rgb-accent)/0.1)]');
      expect(src).toContain('active:!border-accent-primary');
      expect(src).toContain('active:duration-[calc(var(--dur-fast)/2)]');
      expect(src).not.toContain('vibrate');
    });
  }

  it('the hamburger keeps its documented inset press and adds no vibration', () => {
    const src = read('components/HamburgerNav.tsx');
    expect(src).toContain('active:shadow-[inset_0_0_0_1.5rem_rgb(var(--rgb-accent)/0.1)]');
    expect(src).not.toContain('vibrate');
  });
});

describe('P5 — keyboard parity inside cards, no motion under reduced motion', () => {
  for (const file of ['components/ProjectCard.tsx', 'components/CaseStudyCard.tsx']) {
    it(`${file} answers focus-within on the numeral and the accent rule`, () => {
      const src = read(file);
      expect(src).toContain('group-focus-within:text-ink/');
      expect(src).toContain('motion-safe:group-focus-within:scale-[1.04]');
      expect(src).toContain('motion-safe:group-focus-within:scale-x-125');
    });

    it(`${file} moves no transform for reduced-motion users`, () => {
      const src = read(file);
      // Every transform that reacts to hover/focus carries motion-safe.
      for (const line of src.split('\n')) {
        if (!line.includes('scale-x-125') && !line.includes('scale-[1.04]')) continue;
        expect(line).toMatch(/motion-safe:/);
      }
    });
  }
});
