/**
 * Release 5 project showcases (2026-10-20) — the evidence chapter the four
 * showcase case studies mount (components/CaseShowcase.tsx, driven by
 * lib/caseShowcase.ts).
 *
 * Pins what the candidate claims:
 *   - SPEC: every exhibit points at files the site ships; every alt obeys the
 *     content alt rule; no string carries an em dash (the recruiter-copy guard
 *     bans it on every rendered route); a detail is always labelled as one and
 *     carries the provenance of the capture it was cut from; the only doorway
 *     uses the owner-approved wording on the destination it names;
 *   - DOM: a numbered ordered list of figures, each label → plane → caption,
 *     one image box per width (desktop hidden below md, phone hidden from md),
 *     exactly one accessible name per laid-out image, and an h2 with an id so
 *     the rail can index the chapter;
 *   - PAGE: the chapter mounts only for the routes that carry a spec, between
 *     the title band and the essay, and the in-essay proof block is retired
 *     for exactly those routes (Flagstone's staged body is untouched);
 *   - FLOORS: the module's armed state exists only under html.js inside
 *     no-preference, and every duration is a ramp token.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';

import { CaseShowcase } from '@/components/CaseShowcase';
import { CASE_SHOWCASE_IDS, caseShowcaseFor } from '@/lib/caseShowcase';
import { getDeliverables } from '@/lib/content';
import type { Deliverable } from '@/lib/schema';

const ROOT = process.cwd();
const EM_DASH = '—';
const text = (el: Element | null | undefined) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();

const byId = (id: string): Deliverable => {
  const d = getDeliverables().find((x) => x.id === id);
  if (!d) throw new Error(`deliverable "${id}" is missing`);
  return d;
};

/** Every IntersectionObserver the tree creates, keyed by the element it
 *  observes, so a test can fire exactly the clip host's observer. */
type IOEntry = { isIntersecting: boolean };
type IOCallback = (entries: IOEntry[]) => void;
const observers: { cb: IOCallback; targets: Element[] }[] = [];
class MockIO {
  cb: IOCallback;
  targets: Element[] = [];
  constructor(cb: IOCallback) {
    this.cb = cb;
    observers.push(this);
  }
  observe(el: Element) {
    this.targets.push(el);
  }
  unobserve() {}
  disconnect() {}
}
const observerOf = (el: Element) => observers.find((o) => o.targets.includes(el));
let playSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal('IntersectionObserver', MockIO as unknown as typeof IntersectionObserver);
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  playSpy = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: playSpy });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: vi.fn() });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Release 5 showcase spec', () => {
  it('covers the four showcase routes and nothing else', () => {
    expect([...CASE_SHOWCASE_IDS].sort()).toEqual(
      ['claude-corp', 'dashboard', 'ghost-code', 'prompt-library'].filter((id) => CASE_SHOWCASE_IDS.includes(id)).sort(),
    );
    expect(caseShowcaseFor('flagstone')).toBeUndefined();
    for (const id of CASE_SHOWCASE_IDS) expect(byId(id), `${id} is a real deliverable`).toBeTruthy();
  });

  it('every image path, light and dark, is a file the site ships', () => {
    const missing: string[] = [];
    for (const id of CASE_SHOWCASE_IDS) {
      for (const ex of caseShowcaseFor(id)!.exhibits) {
        for (const img of [ex.desktop, ex.phone]) {
          if (!img) continue;
          for (const p of [img.src, img.avif, img.webp, img.dark?.src, img.dark?.avif, img.dark?.webp]) {
            if (p && !existsSync(join(ROOT, 'public', p))) missing.push(`${id}/${ex.id}: ${p}`);
          }
        }
      }
    }
    expect(missing, missing.join('\n')).toEqual([]);
  });

  it('declares each image at the pixel size of the file it names (WebP header)', () => {
    const webpSize = (buf: Buffer): [number, number] => {
      const chunk = buf.toString('ascii', 12, 16);
      if (chunk === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
      if (chunk === 'VP8L') {
        const bits = buf.readUInt32LE(21);
        return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
      }
      if (chunk === 'VP8X') return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
      throw new Error(`unsupported WebP chunk ${chunk}`);
    };
    for (const id of CASE_SHOWCASE_IDS) {
      for (const ex of caseShowcaseFor(id)!.exhibits) {
        for (const img of [ex.desktop, ex.phone]) {
          if (!img?.webp) continue;
          expect(webpSize(readFileSync(join(ROOT, 'public', img.webp))), `${id}/${ex.id} ${img.webp}`).toEqual([img.width, img.height]);
        }
      }
    }
  });

  it('a showcase hero names the deliverable’s own heroShot and a real phone capture', () => {
    for (const id of CASE_SHOWCASE_IDS) {
      const hero = caseShowcaseFor(id)!.hero;
      if (!hero) continue;
      const d = byId(id);
      expect(hero.desktop.src, `${id}: the desktop hero is the authored heroShot`).toBe(d.heroShot?.src);
      expect(hero.desktop.alt).toBe(d.heroShot?.alt);
      expect(hero.phone.height, `${id}: the phone hero is portrait`).toBeGreaterThan(hero.phone.width);
      for (const p of [hero.phone.src, hero.phone.avif, hero.phone.webp, hero.phone.dark?.src]) {
        if (p) expect(existsSync(join(ROOT, 'public', p)), `${id}: ${p}`).toBe(true);
      }
    }
  });

  it('carries no em dash anywhere, and labels a detail as a detail', () => {
    for (const id of CASE_SHOWCASE_IDS) {
      const spec = caseShowcaseFor(id)!;
      expect(JSON.stringify(spec)).not.toContain(EM_DASH);
      for (const ex of spec.exhibits) {
        if (ex.kind === 'detail') expect(ex.provenance?.detail, `${id}/${ex.id} detail provenance`).toBe(true);
        if (ex.desktop && ex.phone) expect(ex.desktop.alt, `${id}/${ex.id}: the phone image needs its own alt`).not.toBe(ex.phone.alt);
      }
    }
  });

  it('Prompt Library: the doorway is the approved invitation, on the live library itself', () => {
    const spec = caseShowcaseFor('prompt-library')!;
    expect(spec.doorway?.label).toBe('Explore Prompt Library');
    const demo = byId('prompt-library').links?.find((l) => l.type === 'demo');
    expect(spec.doorway?.href).toBe(demo?.href);
  });
});

describe('CaseShowcase — DOM', () => {
  const renderFor = (id: string) => render(<CaseShowcase d={byId(id)} spec={caseShowcaseFor(id)!} />);

  it.each(CASE_SHOWCASE_IDS)('%s: a numbered ordered list of figures, label → plane → caption', (id) => {
    const { container } = renderFor(id);
    const spec = caseShowcaseFor(id)!;
    const section = container.querySelector('section[data-case-showcase]');
    expect(section).toHaveAttribute('data-case-showcase', id);
    const h2 = section!.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2!.id).toBeTruthy();
    expect(section).toHaveAttribute('aria-labelledby', h2!.id);
    expect(text(h2)).toBe(spec.heading);

    const items = Array.from(section!.querySelectorAll(':scope > div > ol > li'));
    expect(items).toHaveLength(spec.exhibits.length);
    // numbering follows the sequence each width lays out, with no gaps
    let dn = 0;
    let pn = 0;
    items.forEach((li, i) => {
      const ex = spec.exhibits[i];
      const figure = li.querySelector('figure')!;
      expect(figure.getAttribute('data-showcase-exhibit')).toBe(ex.id);
      expect(figure.getAttribute('data-showcase-kind')).toBe(ex.kind);
      const kids = Array.from(figure.children);
      expect(kids[0].tagName, 'label first').toBe('P');
      const every = ex.kind === 'ledger' || ex.kind === 'clip';
      const onDesktop = every || Boolean(ex.desktop);
      const onPhone = every || Boolean(ex.phone);
      if (onDesktop) dn += 1;
      if (onPhone) pn += 1;
      const labelText = text(kids[0]);
      if (onDesktop && onPhone && dn === pn) expect(labelText.startsWith(`${String(dn).padStart(2, '0')} · `)).toBe(true);
      else {
        if (onDesktop) expect(text(kids[0].querySelector('.hidden.md\\:inline'))).toBe(String(dn).padStart(2, '0'));
        if (onPhone) expect(text(kids[0].querySelector('.md\\:hidden'))).toBe(String(pn).padStart(2, '0'));
      }
      if (!onDesktop) expect(li.className, `${ex.id} is phone-only`).toContain('md:hidden');
      if (!onPhone) expect(li.className, `${ex.id} is desktop-only`).toContain('hidden md:block');
      if (ex.phoneLabel && ex.desktop && ex.phone) {
        expect(text(kids[0].querySelector('.hidden.md\\:inline:last-child, span.hidden.md\\:inline'))).toContain(ex.label);
        expect(labelText).toContain(ex.phoneLabel);
      } else {
        expect(labelText).toContain(ex.label);
      }
      if (ex.kind === 'ledger') {
        expect(kids[1].tagName, 'the ledger is a list, never a plane').toBe('OL');
        expect(kids[1].querySelector('.ts-float, img')).toBeNull();
        expect(kids[1].querySelectorAll('li')).toHaveLength(ex.rows!.length);
        expect(text(kids[2])).toContain('Typeset from this case study');
      } else if (ex.kind === 'clip') {
        expect(kids[1].querySelector('.ts-float video'), 'the clip plays in the float chrome').not.toBeNull();
        expect(kids[2].querySelector('time')).toHaveAttribute('dateTime', ex.provenance!.capturedDate);
      } else {
        expect(kids[1].querySelector('.ts-float'), 'the plane second').not.toBeNull();
        expect(kids[2].querySelector('time')).toHaveAttribute('dateTime', ex.provenance!.capturedDate);
      }
      expect(kids[2].tagName, 'caption last').toBe('FIGCAPTION');
      expect(text(kids[2])).toContain(ex.caption);
      if (ex.phoneCaption) expect(text(kids[2])).toContain(ex.phoneCaption);
    });
    expect(container.innerHTML).not.toContain(EM_DASH);
  });

  it.each(CASE_SHOWCASE_IDS)('%s: one image box per width, each at its own aspect, with its own alt', (id) => {
    const { container } = renderFor(id);
    for (const ex of caseShowcaseFor(id)!.exhibits) {
      if (ex.kind === 'ledger' || ex.kind === 'clip') continue;
      const figure = container.querySelector(`figure[data-showcase-exhibit="${ex.id}"]`)!;
      const planes = Array.from(figure.querySelectorAll('.ts-float'));
      expect(planes).toHaveLength([ex.desktop, ex.phone].filter(Boolean).length);
      if (ex.desktop && ex.phone) {
        expect(planes[0].className).toContain('hidden md:block');
        expect(planes[1].className).toContain('md:hidden');
      }
      for (const [plane, img] of planes.map((p, i) => [p, [ex.desktop, ex.phone].filter(Boolean)[i]!] as const)) {
        expect((plane as HTMLElement).style.aspectRatio).toBe(`${img.width} / ${img.height}`);
        const imgs = Array.from(plane.querySelectorAll('img'));
        expect(imgs.length).toBe(img.dark ? 2 : 1); // light + dark twin, CSS-gated to one
        for (const el of imgs) {
          expect(el).toHaveAttribute('alt', img.alt);
          expect(el).toHaveAttribute('loading', 'lazy');
        }
      }
    }
  });

  it('Prompt Library: the doorway opens in a new tab with the rel guard and the sr-only cue', () => {
    const { container } = renderFor('prompt-library');
    const a = container.querySelector('a[href="https://prompts.skypistudio.com"]');
    expect(a).not.toBeNull();
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    expect(text(a)).toContain('Explore Prompt Library');
    expect(text(a)).toContain('(opens in new tab)');
  });
});

describe('CaseShowcase — Claude Corp keeps the operating model honest', () => {
  it('typesets the decision ledger from the case study, keeps the merge with Sky, and never calls a role a person', () => {
    const spec = caseShowcaseFor('claude-corp')!;
    const ledger = spec.exhibits.find((e) => e.kind === 'ledger')!;
    expect(ledger.rows!.map((r) => r.title)).toEqual(['Intent', 'Routing', 'Review', 'Release']);
    expect(ledger.rows!.at(-1)!.holder).toBe('Sky');
    expect(ledger.rows!.at(-1)!.text).toMatch(/Merging is Sky/);
    const body = byId('claude-corp').body ?? '';
    // every ledger claim is grounded in the approved prose
    for (const phrase of ['seven-layer design-compile gate', 'Exactly one role may message', 'never on main', 'reviewed quarterly', 'routes decisions to the right lane']) {
      expect(body).toContain(phrase);
    }
    const all = JSON.stringify(spec);
    expect(all).not.toMatch(/employee|staff|colleague|teammate|hired/i);
    expect(all).toMatch(/not people|role names/);
    // the pipeline detail says what it is: a diagram, never telemetry
    expect(spec.exhibits.find((e) => e.id === 'pipeline')!.caption).toMatch(/A diagram on the public site, not telemetry/);
  });
});

describe('CaseShowcase — Ghost Code keeps click-to-play', () => {
  const ghost = () => render(<CaseShowcase d={byId('ghost-code')} spec={caseShowcaseFor('ghost-code')!} />);

  it('plays the authored still-first clip: poster first, nothing on hydration, viewport entry or theme flip', async () => {
    const shot = byId('ghost-code').shots![0];
    expect(shot.video?.autoplay).toBe(false);
    const { container } = ghost();
    const host = container.querySelector('[data-showcase-clip] [data-themed-motion]') as HTMLElement;
    expect(host).not.toBeNull();
    expect(host.dataset.themedMotion).toBe('themed');
    expect(host.dataset.motion).toBe('paused');
    const video = host.querySelector('video') as HTMLVideoElement;
    expect(video).toHaveAttribute('poster', shot.video!.poster);
    expect(video).toHaveAttribute('preload', 'none');
    expect(video).not.toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('aria-label', shot.video!.alt);
    expect(playSpy).not.toHaveBeenCalled();
    act(() => observerOf(host)!.cb([{ isIntersecting: true }]));
    expect(playSpy, 'viewport entry must not start the clip').not.toHaveBeenCalled();
    await act(async () => {
      document.documentElement.classList.add('dark');
      await Promise.resolve();
    });
    expect(playSpy).not.toHaveBeenCalled();
    document.documentElement.classList.remove('dark');
  });

  it('plays only on a deliberate Play, through a 44px control whose name tracks the state', () => {
    const { container, getByRole } = ghost();
    const host = container.querySelector('[data-showcase-clip] [data-themed-motion]') as HTMLElement;
    act(() => observerOf(host)!.cb([{ isIntersecting: true }]));
    const alt = byId('ghost-code').shots![0].video!.alt;
    const button = getByRole('button', { name: `Play animation: ${alt}` });
    expect(button.className).toContain('h-11');
    expect(button.className).toContain('w-11');
    fireEvent.click(button);
    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(host.dataset.motion).toBe('playing');
    expect(getByRole('button', { name: `Pause animation: ${alt}` })).toBe(button);
  });

  it('seats the clip beside its caption at lg and keeps the board on desktop only', () => {
    const { container } = ghost();
    const round = container.querySelector('figure[data-showcase-exhibit="round"]')!;
    expect(round.className).toContain('lg:grid');
    expect(round.querySelector('figcaption')!.className).toContain('lg:col-span-8');
    const board = container.querySelector('figure[data-showcase-exhibit="board"]')!.closest('li')!;
    expect(board.className).toContain('hidden md:block');
    expect(text(round.querySelector('figcaption'))).toMatch(/nothing plays on its own/);
  });
});

describe('CaseShowcase — page scoping and floors', () => {
  const page = readFileSync(resolve(ROOT, 'app/work/[slug]/page.tsx'), 'utf8');
  const css = readFileSync(resolve(ROOT, 'components/caseShowcase.module.css'), 'utf8');

  it('mounts the chapter between the title band and the essay, and retires the in-essay proof for showcase routes only', () => {
    expect(page).toContain('const showcase = caseShowcaseFor(d.id);');
    const mount = page.indexOf('{showcase && <CaseShowcase d={d} spec={showcase} />}');
    const essay = page.indexOf('{/* Case study body — rendered only when body content exists */}');
    expect(mount).toBeGreaterThan(-1);
    expect(mount).toBeLessThan(essay);
    expect(page).toContain("d.id === 'flagstone' ? renderFlagstoneBody(d) : renderCaseBody(d, { proof: !showcase })");
    expect(page).toContain('if (!proof || s.heading !== proofSection) {');
  });

  it('the showcase hero is gated on the spec: capture-true well, in flow, the shared hero otherwise', () => {
    expect(page).toContain('const showcaseHero = showcase?.hero;');
    expect(page).toContain("showcaseHero\n            ? 'aspect-[5/8] sm:aspect-[4/5] md:aspect-[16/10]'\n            : 'aspect-[4/3]'");
    expect(page).toContain("showcaseHero && 'lg:static lg:order-2'");
    expect(page).toContain('{showcaseHero ? (\n        <ShowcaseHeroMedia slug={d.id} hero={showcaseHero} />');
    expect(page).toContain('{showcaseHero && <ShowcaseHeroCaption hero={showcaseHero}');
    // Flagstone's own literals survive untouched (pinned by its tests too).
    expect(page).toContain("stoneExhibit ? 'aspect-[5/8] sm:aspect-[4/5] lg:aspect-[3/4]' : 'aspect-[4/5]'");
    expect(page).toContain("d.id !== 'flagstone' && 'lg:sticky lg:top-24'");
  });

  it('the module arms nothing outside html.js + no-preference, animates opacity only, and reads the ramp', () => {
    const armed = css.indexOf('opacity: 0;');
    expect(armed).toBeGreaterThan(css.indexOf('@media (prefers-reduced-motion: no-preference)'));
    expect(css.slice(armed - 80, armed)).toContain(':global(html.js) .plinth');
    expect(css).not.toMatch(/\b(animation|transition)\s*:[^;]*\d+(\.\d+)?m?s/);
    expect(css).not.toMatch(/transform\s*:/);
    expect(css).toContain(':global(html.reveal-failsafe) .plinth');
    expect(css).toContain(':global(html.reveal-seat) .plinth');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.plinth \{\s*opacity: 1 !important;/);
  });
});

describe.runIf(existsSync(join(ROOT, 'out')))('CaseShowcase — built output', () => {
  const read = (slug: string) => readFileSync(join(ROOT, 'out', 'work', slug, 'index.html'), 'utf8');

  it('ships the chapter on every showcase route, after the hero well, and on no other case study', () => {
    for (const d of getDeliverables()) {
      const html = read(d.id);
      const chapters = html.match(/data-case-showcase="/g)?.length ?? 0;
      if (CASE_SHOWCASE_IDS.includes(d.id)) {
        expect(chapters, d.id).toBe(1);
        expect(html.indexOf('data-case-showcase="'), `${d.id}: chapter after the hero well`).toBeGreaterThan(html.indexOf('hero-settle-img'));
        expect(html.indexOf('data-case-showcase="'), `${d.id}: chapter before the essay`).toBeLessThan(html.indexOf('<article'));
        for (const ex of caseShowcaseFor(d.id)!.exhibits) {
          for (const img of [ex.desktop, ex.phone]) if (img) expect(html, `${d.id}/${ex.id}`).toContain(`src="${img.src}"`);
        }
        const hero = caseShowcaseFor(d.id)!.hero;
        if (hero) {
          expect(html.match(/data-showcase-hero="/g)?.length, `${d.id}: one showcase hero`).toBe(1);
          expect(html).toContain('aspect-[5/8] sm:aspect-[4/5] md:aspect-[16/10]');
          expect(html).not.toMatch(/hero-settle-img[^>]*lg:sticky/);
          expect(html).toContain(`src="${hero.phone.src}"`);
          expect(html).toContain('data-showcase-hero-caption');
        } else {
          expect(html, `${d.id}: shared hero`).not.toContain('data-showcase-hero');
        }
      } else {
        expect(chapters, d.id).toBe(0);
        expect(html, `${d.id}: shared hero`).not.toContain('data-showcase-hero');
      }
    }
  });

  it('Prompt Library: the approved invitation is on the page exactly once (outside the RSC payload)', () => {
    const dom = read('prompt-library').replace(/<script[\s\S]*?<\/script>/g, '');
    expect(dom.match(/Explore Prompt Library/g)?.length).toBe(1);
  });
});
