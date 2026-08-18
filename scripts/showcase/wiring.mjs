/**
 * wiring.mjs — which captured scene fills which deliverables.json media field
 * (consumed by scripts/wire-showcase.mjs; validated via DeliverableSchema at
 * wire time). Alt text defaults to the manifest's careful drafts; captions are
 * authored here and must stay TRUE to the frame they sit under.
 *
 * Curation notes:
 *  - accessmap cardImage = the themed map pair (SKY'S GATE PICK 2026-07-31,
 *    superseding the FT-1 flag crop — the card re-themes with the site).
 *  - shots[0] carries the drawer-spring clip in BOTH themes (poster-first,
 *    RM-safe); the report walk's submission remains NEEDS-DEVICE and is not
 *    embedded.
 */

export const WIRING = [
  {
    slug: 'accessmap',
    ogTheme: 'dark',
    ogCard: '/showcase/accessmap/og-card.jpg',
    heroShot: { scene: 'map-overview', viewport: 'phone' },
    cardImage: {
      scene: 'map-overview',
      viewport: 'phone',
      focal: '50% 30%',
      alt: "Flagstone's live barrier map — severity pins over downtown Kelowna street tiles, the flag count and filter controls up top.",
    },
    shots: [
      {
        scene: 'drawer-open',
        viewport: 'phone',
        focal: '50% 24%',
        caption: 'The navigation drawer on spring physics — the material world in motion.',
        video: {
          clip: 'drawer-spring',
          alt: "Flagstone's navigation drawer springing open over the home screen, resting a beat, then sliding away.",
        },
        darkVideo: true,
      },
      {
        scene: 'report-composed',
        viewport: 'phone',
        focal: '50% 72%',
        caption: 'Reporting a barrier in three taps — anonymity built in.',
      },
      {
        scene: 'tasks',
        viewport: 'phone',
        focal: '50% 30%',
        caption: "Peer verification — neighbours confirm what's still broken.",
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
      alt: 'The Prompt Library home — search and category chips over the prompt grid, the featured card leading.',
    },
    shots: [
      {
        scene: 'prompt-detail',
        viewport: 'desktop',
        caption: 'A prompt opened — variables to fill, the copy control waiting.',
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
      alt: 'The Claude Corp front door — the fifteen-role pipeline under the editorial hero.',
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
      alt: 'The Dashboard command center — project health, agent activity and pending decisions on one calm board.',
    },
    shots: [
      {
        scene: 'think-tank',
        viewport: 'desktop',
        caption: 'The Think Tank — ideas triaged into Do it, Later and Skip.',
      },
      {
        scene: 'dispatch',
        viewport: 'desktop',
        caption: 'The Dispatch queue — agent work lined up with its receipts.',
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
      alt: 'A Ghost Code round mid-chase — the Phantom in the maze with the command prompt waiting below.',
    },
    shots: [
      {
        scene: 'board',
        viewport: 'desktop',
        caption: 'A seeded round in motion — same maze, both themes.',
        video: {
          clip: 'round',
          alt: 'A Ghost Code round in motion — the Phantom on patrol while the code prompt waits below.',
        },
        darkVideo: true,
      },
    ],
  },
];
