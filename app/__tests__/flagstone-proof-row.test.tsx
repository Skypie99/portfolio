/**
 * Flagstone proof row — Version A, three-panel (owner decision 2026-10-18).
 *
 * Pins what the candidate changed and what it must not have changed:
 *   - CONTENT: the reporting-flow clip is click-to-play (`autoplay: false`),
 *     and it is the only clip whose playback setting changed;
 *   - DOM: an ordered list of three windows in shot order, each label →
 *     window → caption, numbered middot labels (never an em dash — the
 *     recruiter-copy guard bans it on every rendered route), the warm caption
 *     rule, and one provenance line that states the repository date only;
 *   - VE04: `.proof-arrival-edge` and the ProofArrival host on window 01 only
 *     (the lifecycle itself is pinned by components/__tests__/ProofArrival.test.tsx);
 *   - PLAYBACK: nothing plays on hydration, on viewport entry or on a theme
 *     flip; Play/Pause is a keyboard-operable button whose accessible name
 *     tracks its state; reduced motion still allows a deliberate play;
 *   - OTHER CASE STUDIES: the two-column gallery renders unchanged;
 *   - CSS: the breakout, mat and control repairs are scoped under the row,
 *     the global focus tokens and the VE04 rules are untouched, and the new
 *     block animates nothing.
 *
 * The CSS assertions read globals.css as text: jsdom does not run the
 * cascade for a stylesheet these components never import, so a computed-
 * style assertion here would be vacuous (the failure mode this repository
 * has documented before).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CaseProof } from '@/app/work/[slug]/page';
import { getDeliverables } from '@/lib/content';
import type { Deliverable } from '@/lib/schema';

const EM_DASH = '—';
const CSS = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');

type IOEntry = { isIntersecting: boolean };
type IOCallback = (entries: IOEntry[]) => void;

/** Every IntersectionObserver the tree creates (Reveal ×3, ProofArrival ×1,
 *  ThemedMotion ×1), keyed by the element it observes, so a test can fire
 *  exactly the clip host's observer. */
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

const matchMediaMock = (reduce: boolean) =>
  vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

const byId = (id: string): Deliverable => {
  const d = getDeliverables().find((x) => x.id === id);
  if (!d) throw new Error(`deliverable "${id}" is missing`);
  return d;
};

const text = (el: Element | null | undefined) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();

let playSpy: ReturnType<typeof vi.fn>;
let pauseSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal('IntersectionObserver', MockIO as unknown as typeof IntersectionObserver);
  window.matchMedia = matchMediaMock(false) as unknown as typeof window.matchMedia;
  playSpy = vi.fn().mockResolvedValue(undefined);
  pauseSpy = vi.fn();
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: playSpy });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: pauseSpy });
  window.sessionStorage.clear();
  document.documentElement.classList.remove('dark');
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.documentElement.classList.remove('dark');
});

describe('Flagstone proof row — content: click-to-play', () => {
  it('the reporting-flow clip is authored click-to-play (autoplay: false)', () => {
    const first = byId('flagstone').shots?.[0];
    expect(first?.video?.mp4).toContain('/report-flow-current.');
    expect(first?.video?.autoplay).toBe(false);
  });

  it('no other clip changed its playback setting', () => {
    const clips = getDeliverables().flatMap((d) =>
      (d.shots ?? []).flatMap((s, i) => (s.video ? [{ id: d.id, i, autoplay: s.video.autoplay }] : [])),
    );
    // The full set of proof clips the site ships, with their authored
    // playback setting. ghost-code was already still-first before this
    // candidate; flagstone[0] is the one authorized change.
    expect(clips).toEqual([
      { id: 'flagstone', i: 0, autoplay: false },
      { id: 'ghost-code', i: 0, autoplay: false },
    ]);
  });
});

describe('Flagstone proof row — DOM', () => {
  const flagstone = byId('flagstone');

  it('renders an ordered list of three windows in shot order: label → window → caption', () => {
    const { container } = render(<CaseProof d={flagstone} />);
    const list = container.querySelector('ol.proof-row');
    expect(list, 'the Flagstone row is an <ol class="proof-row">').not.toBeNull();
    const items = Array.from(list!.children);
    expect(items.map((li) => li.tagName)).toEqual(['LI', 'LI', 'LI']);

    const figures = items.map((li) => li.querySelector('figure')!);
    expect(figures.map((f) => f.getAttribute('data-proof-window'))).toEqual(['01', '02', '03']);
    for (const figure of figures) {
      const kids = Array.from(figure.children);
      expect(kids).toHaveLength(3);
      expect(kids[0].tagName, 'label first').toBe('P');
      expect(kids[1].querySelector('.pr-world'), 'the window second').not.toBeNull();
      expect(kids[2].tagName, 'caption last').toBe('FIGCAPTION');
    }

    expect(figures.map((f) => text(f.children[0]))).toEqual([
      '01 · Reporting flow, in motion.',
      '02 · Report a barrier.',
      '03 · Community review.',
    ]);
    expect(figures.map((f) => text(f.querySelector('figcaption')))).toEqual(
      flagstone.shots!.map((s) => s.caption),
    );
    for (const figure of figures) {
      expect(figure.querySelector('figcaption')!.className).toContain('border-t');
      expect(figure.children[0].className, 'label legible in dark (≥ 4.5:1)').toContain('dark:text-ink');
      // Release 3: light ink-meta labels measured 4.47:1 at worst; ink-muted ≈ 5.7:1.
      expect(figure.children[0].className, 'label legible in light (≥ 4.5:1)').toContain('text-ink-muted');
      expect(figure.children[0].className).not.toContain('text-text-meta');
      // Release 3: the dark ink-muted caption measured 3.98:1 at worst; ink ≈ 6.1:1.
      expect(figure.querySelector('figcaption')!.className, 'caption legible in dark').toContain('dark:text-ink');
    }
  });

  it('keeps the kicker and heading and carries no em dash anywhere', () => {
    const { container } = render(<CaseProof d={flagstone} />);
    expect(text(container)).toContain('Inside the build');
    expect(text(container)).toContain('See it in motion.');
    // Release 3: the dark accent-ink kicker measured 4.28:1 at worst; ink ≈ 6.5:1.
    const kicker = container.firstElementChild!.firstElementChild!;
    expect(text(kicker)).toBe('Inside the build');
    expect(kicker.className).toContain('text-accent-ink');
    expect(kicker.className).toContain('dark:text-ink');
    expect(container.textContent).not.toContain(EM_DASH);
    expect(container.innerHTML).not.toContain(EM_DASH);
  });

  it('frames the three windows as 17:20 thin frames and marks the block as the bounded breakout', () => {
    const { container } = render(<CaseProof d={flagstone} />);
    const frames = Array.from(container.querySelectorAll('ol.proof-row figure > div.group'));
    expect(frames).toHaveLength(3);
    for (const frame of frames) {
      expect(frame.className).toContain('aspect-[17/20]');
      expect(frame.className).toContain('rounded-md');
      expect(frame.className).toContain('border-border-decorative');
      expect(frame.className).not.toContain('aspect-[7/8]');
      expect(frame.className).not.toContain('rounded-lg');
    }
    expect(container.firstElementChild!.className).toContain('proof-breakout');
  });

  it('VE04 stays on window 01 only: one arrival host, one .proof-arrival-edge', () => {
    const { container } = render(<CaseProof d={flagstone} />);
    const items = Array.from(container.querySelectorAll('ol.proof-row > li'));
    expect(items[0].querySelectorAll('[data-proof-arrival]')).toHaveLength(1);
    expect(items[0].querySelectorAll('.proof-arrival-edge')).toHaveLength(1);
    expect(items[1].querySelector('[data-proof-arrival], .proof-arrival-edge')).toBeNull();
    expect(items[2].querySelector('[data-proof-arrival], .proof-arrival-edge')).toBeNull();
    // The host wraps the figure (edge inside it), never the label alone.
    expect(items[0].querySelector('[data-proof-arrival] figure')).not.toBeNull();
  });

  it('states provenance as the verified repository date and never a capture date', () => {
    const { container } = render(<CaseProof d={flagstone} />);
    const provenance = container.querySelector('ol.proof-row + p');
    expect(provenance, 'one provenance line follows the list').not.toBeNull();
    const t = text(provenance);
    expect(t).toContain('captures in this repository since 2026-09-01 (1cfb4b1)');
    expect(t).toMatch(/capture dates not recorded/i);
    expect(t).not.toMatch(/captured\s+\d{4}/i);
    expect(provenance!.querySelector('time')).toHaveAttribute('dateTime', '2026-09-01');
    // dark theme: ink-meta measured 3.2–4.1:1 on the case-study world surface; ink clears 4.5:1
    expect(provenance!.className).toContain('dark:text-ink');
    // light theme: ink-meta measured 4.48:1 at worst; ink-muted ≈ 5.7:1
    expect(provenance!.className).toContain('text-ink-muted');
    expect(provenance!.className).not.toContain('text-text-meta');
    // The three shots still carry no capturedDate, so the figcaption's
    // per-shot provenance span renders nothing (nothing is invented).
    expect(container.querySelector('figcaption time')).toBeNull();
  });
});

describe('Flagstone proof row — playback (click-to-play)', () => {
  const flagstone = byId('flagstone');
  const clipAlt = flagstone.shots![0].video!.alt;

  it('does not play on hydration or on viewport entry; the poster stands', () => {
    const { container } = render(<CaseProof d={flagstone} />);
    const host = container.querySelector('[data-themed-motion]') as HTMLElement;
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(host.dataset.themedMotion).toBe('matte');
    expect(host.dataset.motion).toBe('paused');
    expect(video).toHaveAttribute('poster');
    expect(video).toHaveAttribute('preload', 'none');
    expect(video).not.toHaveAttribute('autoplay');
    expect(playSpy).not.toHaveBeenCalled();

    const io = observerOf(host);
    expect(io, 'ThemedMotion observes its host').toBeTruthy();
    act(() => io!.cb([{ isIntersecting: true }]));
    expect(playSpy, 'viewport entry must not start the clip').not.toHaveBeenCalled();
    expect(host.dataset.motion).toBe('paused');
  });

  it('does not play when the theme flips', async () => {
    const { container } = render(<CaseProof d={flagstone} />);
    const host = container.querySelector('[data-themed-motion]') as HTMLElement;
    act(() => observerOf(host)!.cb([{ isIntersecting: true }]));
    await act(async () => {
      document.documentElement.classList.add('dark');
      await Promise.resolve();
    });
    expect(playSpy).not.toHaveBeenCalled();
    expect(host.dataset.motion).toBe('paused');
  });

  it('plays only on a deliberate Play, pauses and resumes, and the name tracks the state', async () => {
    const user = userEvent.setup();
    const { container, getByRole } = render(<CaseProof d={flagstone} />);
    const host = container.querySelector('[data-themed-motion]') as HTMLElement;
    act(() => observerOf(host)!.cb([{ isIntersecting: true }]));

    const button = getByRole('button', { name: `Play animation: ${clipAlt}` });
    expect(button.className).toContain('h-11');
    expect(button.className).toContain('w-11');
    expect(host.querySelector(':scope > button')).toBe(button); // the selector the scoped CSS targets

    // Keyboard: focus + Enter is a deliberate play.
    button.focus();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(host.dataset.motion).toBe('playing');
    expect(getByRole('button', { name: `Pause animation: ${clipAlt}` })).toBe(button);

    // Enter again pauses; the name flips back.
    await user.keyboard('{Enter}');
    expect(pauseSpy).toHaveBeenCalled();
    expect(host.dataset.motion).toBe('paused');
    expect(getByRole('button', { name: `Play animation: ${clipAlt}` })).toBe(button);

    // Pointer resume.
    fireEvent.click(button);
    expect(playSpy).toHaveBeenCalledTimes(2);
    expect(host.dataset.motion).toBe('playing');
  });

  it('reduced motion: the arrival edge settles at once, nothing autoplays, a deliberate Play still works', () => {
    window.matchMedia = matchMediaMock(true) as unknown as typeof window.matchMedia;
    const { container, getByRole } = render(<CaseProof d={flagstone} />);
    expect(container.querySelector('[data-proof-arrival]')).toHaveAttribute('data-proof-arrival', 'settled');
    const host = container.querySelector('[data-themed-motion]') as HTMLElement;
    act(() => observerOf(host)!.cb([{ isIntersecting: true }]));
    expect(playSpy).not.toHaveBeenCalled();
    fireEvent.click(getByRole('button', { name: `Play animation: ${clipAlt}` }));
    expect(playSpy).toHaveBeenCalledTimes(1);
  });
});

describe('Flagstone proof row — other case studies are untouched', () => {
  it('dashboard keeps the two-column gallery: a <ul>, no labels, no rule, no provenance, 16:10 plates', () => {
    const { container } = render(<CaseProof d={byId('dashboard')} />);
    expect(container.querySelector('.proof-row')).toBeNull();
    expect(container.firstElementChild!.className).not.toContain('proof-breakout');
    const list = container.querySelector('ul');
    expect(list).not.toBeNull();
    expect(list!.className).toContain('lg:grid-cols-2');
    expect(list!.className).toContain('gap-12');
    expect(container.querySelectorAll('li')).toHaveLength(2);
    for (const figure of Array.from(container.querySelectorAll('figure'))) {
      expect(figure.children[0].tagName, 'no label above the plate').not.toBe('P');
      expect(figure.hasAttribute('data-proof-window')).toBe(false);
      const frame = figure.querySelector('div.group')!;
      expect(frame.className).toContain('rounded-lg');
      expect(frame.className).not.toContain('aspect-[17/20]');
      expect(figure.querySelector('figcaption')!.className).not.toContain('border-t');
    }
    expect(container.querySelector('ul + p')).toBeNull();
    expect(container.querySelector('[data-proof-arrival], .proof-arrival-edge')).toBeNull();
    // The Release 3 contrast classes are Flagstone's row only.
    expect(container.firstElementChild!.firstElementChild!.className).toBe(
      'font-mono text-label tracking-label uppercase text-accent-ink mb-6',
    );
    for (const caption of Array.from(container.querySelectorAll('figcaption'))) {
      expect(caption.className).not.toContain('dark:text-ink');
    }
  });

  it('ghost-code keeps its portrait still-first clip in a single column', () => {
    const { container } = render(<CaseProof d={byId('ghost-code')} />);
    expect(container.querySelector('.proof-row')).toBeNull();
    expect(container.querySelector('ul')!.className).toContain('lg:grid-cols-1');
    const frame = container.querySelector('figure div.group')!;
    expect(frame.className).toContain('aspect-[390/844]');
    expect(frame.className).toContain('rounded-lg');
    expect(container.querySelector('[data-themed-motion]')).toHaveAttribute('data-motion', 'paused');
  });
});

describe('Flagstone proof row — CSS scope (globals.css as text)', () => {
  const marker = CSS.indexOf('Flagstone proof row — Version A, three-panel');
  const start = CSS.lastIndexOf('/*', marker); // the block's own banner comment
  const end = CSS.indexOf('Settle-on-arrival (components/HeroSettle.tsx)', marker);
  const block = CSS.slice(start, end);

  it('the block exists, after the VE04 rules and before the settle rules', () => {
    expect(start).toBeGreaterThan(CSS.indexOf('.proof-arrival-edge {'));
    expect(end).toBeGreaterThan(start);
  });

  it('breaks out by container width, never by vw or negative margin', () => {
    expect(block).toContain('.proof-breakout-root {\n  container-type: inline-size;\n}');
    expect(block).toMatch(/@media \(min-width: 1024px\) \{\s*@supports \(width: 1cqw\) \{\s*\.proof-breakout \{\s*width: min\(1068px, 100cqw\);/);
    expect(block).not.toMatch(/\d+vw/);
    expect(block).not.toMatch(/margin[^:]*:\s*-|calc\(-1 \*/);
  });

  it('scopes the mat geometry and the control repairs under .proof-row', () => {
    const rules = block.replace(/\/\*[\s\S]*?\*\//g, ''); // selectors only, comments stripped
    for (const selector of rules.matchAll(/^\s*([^\s@{}][^{}]*)\{/gm)) {
      const sel = selector[1].trim();
      expect(sel, `every selector in the block is scoped to the row: ${sel}`).toMatch(
        /^(\.proof-breakout-root|\.proof-breakout|\.proof-row|html\.dark \.proof-row)/,
      );
    }
    expect(block).toContain('.proof-row .ts-matte-well {');
    expect(block).toContain('.proof-row [data-themed-motion] > button {');
    expect(block).toContain('html.dark .proof-row [data-themed-motion] > button {');
    // Release 3: one ink ring in both themes over the canvas halo (no dark override).
    expect(block).toContain(
      '.proof-row [data-themed-motion] > button:focus-visible {\n' +
        '  outline-color: rgb(var(--rgb-ink));\n' +
        '  box-shadow: 0 0 0 var(--focus-ring-offset, 2px) rgb(var(--rgb-canvas));\n' +
        '}',
    );
    expect(block).not.toContain('html.dark .proof-row [data-themed-motion] > button:focus-visible');
  });

  it('pairs the Play ring and its halo at ≥ 9:1 in both themes, so one band clears 3:1 over any frame', () => {
    const lum = (rgb: number[]) =>
      rgb
        .map((c) => c / 255)
        .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
        .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
    const token = (scope: string, name: string) => {
      const open = CSS.indexOf(`${scope} {`);
      const value = CSS.slice(open, CSS.indexOf('}', open)).match(new RegExp(`--rgb-${name}:\\s*(\\d+) (\\d+) (\\d+);`));
      expect(value, `${scope} --rgb-${name}`).toBeTruthy();
      return value!.slice(1, 4).map(Number);
    };
    for (const scope of [':root', 'html.dark']) {
      const [ring, halo] = [lum(token(scope, 'ink')), lum(token(scope, 'canvas'))];
      const pair = (Math.max(ring, halo) + 0.05) / (Math.min(ring, halo) + 0.05);
      expect(pair, `${scope} ring:halo`).toBeGreaterThanOrEqual(9);
      // The better band against any frame luminance is at least √pair.
      expect(Math.sqrt(pair), `${scope} worst frame`).toBeGreaterThanOrEqual(3.5);
    }
  });

  it('animates nothing and redefines no focus token', () => {
    expect(block).not.toMatch(/\b(animation|transition)\s*:/);
    expect(block).not.toMatch(/--focus-ring-(width|color|offset)\s*:/);
  });

  it('leaves the global focus rule and the VE04 colours and durations byte-identical', () => {
    expect(CSS).toContain(
      '*:focus-visible {\n' +
        '  outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-accent-primary));\n' +
        '  outline-offset: var(--focus-ring-offset, 2px);\n' +
        '}',
    );
    expect(CSS).toContain(
      '.proof-arrival-edge {\n  --proof-arrival-dur: var(--dur-transition);\n  border-color: rgb(var(--rgb-accent) / 0.7);\n}',
    );
    expect(CSS).toContain('html.dark .proof-arrival-edge {\n  border-color: rgb(var(--rgb-accent) / 0.4);\n}');
    expect(CSS).toContain(
      "html.js [data-proof-arrival='settling'] .proof-arrival-edge {\n  border-color: rgb(var(--rgb-accent) / 0.7);\n  transition: border-color var(--proof-arrival-dur) var(--ease-out);\n}",
    );
    expect(CSS).toContain('  .proof-arrival-edge {\n    --proof-arrival-dur: var(--dur-base);\n  }');
    const proofArrival = readFileSync(join(process.cwd(), 'components', 'ProofArrival.tsx'), 'utf8');
    expect(proofArrival).toContain('const SETTLE_SAFETY_MS = 900;');
    expect(proofArrival).toContain('{ threshold: 0.2 }');
    expect(proofArrival).toContain("const CONSUMED_KEY = 'w4-06-proof-arrival.v1';");
  });
});
