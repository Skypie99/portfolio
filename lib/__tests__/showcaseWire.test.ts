import { describe, expect, it } from 'vitest';

import { applyShowcase, themedShot, type ShowcaseManifest } from '../showcaseWire';

/** Wire-time law: manifest → schema-shaped patches, validated before they can
 *  touch deliverables.json (alt law + path law + themed refines fail HERE). */

const still = (scene: string, theme: string, viewport = 'phone') => ({
  project: 'accessmap',
  scene,
  theme: theme as 'light' | 'dark' | 'matte',
  viewport,
  altText: 'The AccessMap barrier map, severity pins over street tiles',
  files: {
    shipped: [
      { path: `/showcase/accessmap/${scene}.${theme}.${viewport}.avif`, bytes: 30000 },
      { path: `/showcase/accessmap/${scene}.${theme}.${viewport}.webp`, bytes: 45000 },
    ],
    lqip: 'data:image/webp;base64,AAAA',
  },
});

const manifest: ShowcaseManifest = {
  captures: [
    still('map-overview', 'light'),
    still('map-overview', 'dark'),
    {
      project: 'accessmap',
      scene: 'clip:drawer-spring',
      theme: 'dark',
      viewport: 'phone',
      clip: {
        id: 'drawer-spring',
        mp4: { path: '/showcase/accessmap/clips/drawer-spring.dark.phone.mp4', bytes: 90000 },
        webm: null,
        posters: [{ path: '/showcase/accessmap/clips/drawer-spring.dark.phone-poster.avif', bytes: 18000 }],
      },
    },
  ],
};

describe('showcaseWire', () => {
  it('builds a themed shot: light base (webp src) + dark twin', () => {
    const shot = themedShot(manifest, 'accessmap', { scene: 'map-overview' });
    expect(shot.src).toBe('/showcase/accessmap/map-overview.light.phone.webp');
    expect(shot.avif).toContain('.light.');
    expect((shot.dark as { avif?: string }).avif).toContain('.dark.');
    expect(shot.lqip).toContain('data:image/webp');
  });

  it('the alt override (Sky refinement) wins over the manifest draft', () => {
    const shot = themedShot(manifest, 'accessmap', {
      scene: 'map-overview',
      alt: 'Severity-coloured pins across downtown Kelowna at dusk',
    });
    expect(shot.alt).toBe('Severity-coloured pins across downtown Kelowna at dusk');
  });

  it('throws when the dark capture is missing', () => {
    const m: ShowcaseManifest = { captures: [still('tasks', 'light')] };
    expect(() => themedShot(m, 'accessmap', { scene: 'tasks' })).toThrow(/no dark capture/);
  });

  it('wires a clip as base video (poster + mp4, webm omitted when dropped)', () => {
    const shot = themedShot(
      manifest,
      'accessmap',
      { scene: 'map-overview' },
      { video: { clip: 'drawer-spring', alt: 'The navigation drawer springing open and away' } },
    );
    // the drawer clip only exists in dark in this fixture → no light video wired
    expect(shot.video).toBeUndefined();
    const darkWired = themedShot(
      manifest,
      'accessmap',
      { scene: 'map-overview' },
      { video: { clip: 'drawer-spring', alt: 'The navigation drawer springing open and away' }, darkVideo: true },
    );
    expect((darkWired.dark as { video?: { mp4: string; webm?: string; poster: string } }).video?.mp4).toContain('drawer-spring.dark');
    expect((darkWired.dark as { video?: { webm?: string } }).video?.webm).toBeUndefined();
  });

  it('applyShowcase validates patches and rejects an alt-law violation', () => {
    const legacy = [
      {
        id: 'accessmap',
        title: 'AccessMap',
        summary: 'Mobile app for flagging accessibility barriers on a real map.',
        role: 'Solo builder',
        tech: ['Expo'],
        year: 2026,
        heroImage: { src: '/images/deliverables/accessmap/hero.svg', alt: 'Warm AccessMap mockup' },
        tags: ['accessibility'],
        featured: true,
      },
    ];
    const good = applyShowcase(legacy, {
      accessmap: { heroShot: themedShot(manifest, 'accessmap', { scene: 'map-overview' }), ogTheme: 'dark' },
    });
    expect(good[0].heroShot?.dark).toBeTruthy();
    expect(good[0].ogTheme).toBe('dark');

    expect(() =>
      applyShowcase(legacy, {
        accessmap: {
          heroShot: { ...themedShot(manifest, 'accessmap', { scene: 'map-overview' }), alt: 'image of a map' },
        },
      }),
    ).toThrow(/DeliverableSchema/);
  });

  it('untouched entries pass through byte-identical', () => {
    const legacy = [{ id: 'other', anything: true }];
    const out = applyShowcase(legacy, {});
    expect(out[0]).toBe(legacy[0]);
  });
});
