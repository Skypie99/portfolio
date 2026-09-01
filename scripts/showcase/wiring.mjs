/**
 * wiring.mjs — which captured scene fills which deliverables.json media field
 * (consumed by scripts/wire-showcase.mjs; validated via DeliverableSchema at
 * wire time). Alt text defaults to the manifest's careful drafts; captions are
 * authored here and must stay TRUE to the frame they sit under.
 *
 * Curation notes:
 *  - flagstone hero/card = the submitted-era Explore capture supplied by Sky
 *    on 2026-09-01. It is a real dark product screen in both site themes, not a
 *    recoloured light/dark pair.
 *  - shots[0] carries the drawer-spring clip in BOTH themes (poster-first,
 *    RM-safe); the report walk's submission remains NEEDS-DEVICE and is not
 *    embedded.
 */

const suppliedFlagstoneShot = ({ name, alt, caption, lqip, focal, chrome }) => ({
  asset: {
    src: `/showcase/flagstone/${name}.webp`,
    avif: `/showcase/flagstone/${name}.avif`,
    webp: `/showcase/flagstone/${name}.webp`,
    alt,
    lqip,
    ...(caption ? { caption } : {}),
    ...(focal ? { focal } : {}),
    ...(chrome ? { chrome } : {}),
  },
});

const currentExplore = suppliedFlagstoneShot({
  name: 'explore-current.phone',
  alt: "Flagstone's Explore map with an expanded verified Steep grade report, a real barrier photograph, orange map pins, map controls, and bottom navigation.",
  lqip: 'data:image/webp;base64,UklGRqoAAABXRUJQVlA4IJ4AAAAQBgCdASoUACsAPxF6rVKsJ6OiqqwBgCIJQBS78BA+33iL2FhHYeZF7vIaluGgOgikWwVcN5VX4VAA/ZecdcGttJtB54ffqN3sWClvc8ztAHYfya0XDR0FSi1NaQNp154obXLGI0aot5zL+z43ab11jzlMshKMgGa/drMB3MPow7jvcjki3y+jfFfmZoAA+9dFxSdQTnxhDVonvFuQAA==',
  focal: '50% 31%',
  chrome: 'device',
});

export const WIRING = [
  {
    slug: 'flagstone',
    ogTheme: 'dark',
    ogCard: '/showcase/flagstone/og-card.jpg',
    heroShot: currentExplore,
    cardImage: currentExplore,
    heroPlate: {
      severity: 'SEVERITY 3 OF 5 · MODERATE · VERIFIED',
      caption: 'Steep grade: a real barrier report expanded on the map.',
      provenance: 'CURRENT EXPLORE SCREEN · FLAGSTONE',
    },
    shots: [
      {
        preserveExisting: true,
        scene: 'drawer-open',
        viewport: 'phone',
        focal: '50% 24%',
        caption: 'The navigation drawer on spring physics, the material world in motion.',
        video: {
          clip: 'drawer-spring',
          alt: "Flagstone's navigation drawer springing open over the home screen, resting a beat, then sliding away.",
        },
        darkVideo: true,
      },
      {
        asset: {
          src: '/showcase/flagstone/report-current.phone.webp',
          avif: '/showcase/flagstone/report-current.phone.avif',
          webp: '/showcase/flagstone/report-current.phone.webp',
          alt: "Flagstone's Report a flag form showing location, quick-fill templates, category options, severity choices, and a description field.",
          caption: 'Reporting a barrier: quick-fill templates, category, severity, and description.',
          lqip: 'data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAQAwCdASoUABgAPxF8r1MsJ6SiqA1RgCIJZwDPZBhuRJgA/u8jCPFCassXSMzYuzg8fi8zn5+VLgz1KkfWITVwAAA=',
          focal: '50% 50%',
        },
      },
      {
        asset: {
          src: '/showcase/flagstone/community-current.phone.webp',
          avif: '/showcase/flagstone/community-current.phone.avif',
          webp: '/showcase/flagstone/community-current.phone.webp',
          alt: "Flagstone's Review barriers screen showing No ramp and Steep grade reports with severity, descriptions, and Verify, Resolved, and Details actions.",
          caption: 'Community review: neighbours verify barriers and mark resolved reports.',
          lqip: 'data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAACQBACdASoUABYAPwVsrVArpiQisAwBcCCJZQC26VyDCX7+qZW2mTGsjZFa+AAA/sOapayQEYlCwJQItGPtT2bfQZmg8SDKSadBGa3fdUlgeDS2nCq7wHbxuewAAA==',
          focal: '50% 50%',
        },
      },
    ],
  },

  {
    slug: 'prompt-library',
    ogTheme: 'dark',
    ogCard: '/showcase/prompt-library/og-card.jpg',
    heroShot: { scene: 'home', viewport: 'desktop' },
    cardImage: {
      scene: 'home',
      viewport: 'desktop',
      focal: '50% 18%',
      alt: 'The Prompt Library home, with search and category chips over the prompt grid and the featured card leading.',
    },
    shots: [
      {
        scene: 'prompt-detail',
        viewport: 'desktop',
        caption: 'A prompt opened, with variables to fill and the copy control waiting.',
      },
    ],
  },

  {
    slug: 'claude-corp',
    ogTheme: 'dark',
    ogCard: '/showcase/claude-corp/og-card.jpg',
    heroShot: { scene: 'hero-pipeline', viewport: 'desktop' },
    cardImage: {
      scene: 'hero-pipeline',
      viewport: 'desktop',
      focal: '50% 12%',
      alt: 'The Claude Corp front door, with the fifteen-role pipeline under the editorial hero.',
    },
    shots: [
      {
        scene: 'team',
        viewport: 'desktop',
        caption: 'Fifteen roles, one governed main branch.',
      },
    ],
  },

  {
    // Captured from the LIVE deployment (see manifest note) — the deployed truth.
    slug: 'dashboard',
    ogTheme: 'dark',
    ogCard: '/showcase/dashboard/og-card.jpg',
    heroShot: { scene: 'command-center', viewport: 'desktop' },
    cardImage: {
      scene: 'command-center',
      viewport: 'desktop',
      focal: '50% 14%',
      alt: 'The Dashboard command center, showing project health, agent activity and pending decisions on one calm board.',
    },
    shots: [
      {
        scene: 'think-tank',
        viewport: 'desktop',
        caption: 'The Think Tank: ideas triaged into Do it, Later and Skip.',
      },
      {
        scene: 'dispatch',
        viewport: 'desktop',
        caption: 'The Dispatch queue, with agent work lined up alongside its receipts.',
      },
    ],
  },

  {
    // The retrofit: real two-theme target since the light-mode merge; the round
    // clip (seeded PRNG, both themes) supersedes the dark-only proof loop.
    slug: 'ghost-code',
    ogTheme: 'dark',
    ogCard: '/showcase/ghost-code/og-card.jpg',
    heroShot: { scene: 'title', viewport: 'desktop' },
    cardImage: {
      scene: 'board',
      viewport: 'desktop',
      focal: '50% 40%',
      alt: 'A Ghost Code round mid-chase, with the Phantom in the maze and the command prompt waiting below.',
    },
    shots: [
      {
        scene: 'board',
        viewport: 'desktop',
        caption: 'A seeded round in motion: same maze, both themes.',
        video: {
          clip: 'round',
          alt: 'A Ghost Code round in motion, with the Phantom on patrol while the code prompt waits below.',
        },
        darkVideo: true,
      },
    ],
  },
];
