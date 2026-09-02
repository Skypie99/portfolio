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
 *  - shots[0] carries Sky's current reporting-flow recording (poster-first,
 *    RM-safe) as an honest dark-mono exhibit in both site themes.
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
        asset: {
          src: '/showcase/flagstone/clips/report-flow-current.dark.phone-poster.webp',
          avif: '/showcase/flagstone/clips/report-flow-current.dark.phone-poster.avif',
          webp: '/showcase/flagstone/clips/report-flow-current.dark.phone-poster.webp',
          alt: 'Flagstone reporting flow moving from the Explore map into the Report a flag form, through category selection and back to the updated map.',
          caption: 'From map pin to report form, the current reporting flow in motion.',
          focal: '50% 38%',
          matte: 'dark-mono',
          capturedDate: '2026-09-01',
          video: {
            mp4: '/showcase/flagstone/clips/report-flow-current.dark.phone.mp4',
            webm: '/showcase/flagstone/clips/report-flow-current.dark.phone.webm',
            poster: '/showcase/flagstone/clips/report-flow-current.dark.phone-poster.avif',
            alt: 'Flagstone reporting flow moving from the Explore map into the Report a flag form, through category selection and back to the updated map.',
          },
        },
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
    heroShot: {
      scene: 'home',
      viewport: 'desktop',
      alt: 'The Prompt Library home, with a search bar and category chips over a grid of prompt cards and the featured card leading.',
    },
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
        alt: 'A prompt opened in the library, with variable fields ready to fill above the monospace prompt preview and its copy control.',
        caption: 'A prompt opened, with variables to fill and the copy control waiting.',
      },
    ],
  },

  {
    slug: 'claude-corp',
    ogTheme: 'dark',
    ogCard: '/showcase/claude-corp/og-card.jpg',
    heroShot: {
      scene: 'hero-pipeline',
      viewport: 'desktop',
      alt: 'The Claude Corp front door, with the editorial hero over the agent pipeline diagram and fifteen roles feeding one governed main branch.',
    },
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
        alt: 'The fifteen-role team grid, with each agent card naming its craft from Quinn on product through Morgan on reporting.',
        caption: 'Fifteen roles, one governed main branch.',
      },
    ],
  },

  {
    // Captured from the LIVE deployment (see manifest note) — the deployed truth.
    slug: 'dashboard',
    ogTheme: 'dark',
    ogCard: '/showcase/dashboard/og-card.jpg',
    heroShot: {
      scene: 'command-center',
      viewport: 'desktop',
      alt: 'The Dashboard command center, showing project health, agent activity and pending decisions on one calm board.',
    },
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
        alt: 'The Think Tank board, with ideas triaged into Do it, Later and Skip lanes with their leverage notes.',
        caption: 'The Think Tank: ideas triaged into Do it, Later and Skip.',
      },
      {
        scene: 'dispatch',
        viewport: 'desktop',
        alt: 'The Dispatch queue, with work items lined up with status, owner and the relay controls held safely off.',
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
    heroShot: {
      scene: 'title',
      viewport: 'desktop',
      alt: 'Ghost Code’s title screen: the Phantom mark beside the wordmark, three mastery counters, a one-line how to play, and Press Start with a theme control below.',
    },
    cardImage: {
      scene: 'board',
      viewport: 'desktop',
      focal: '50% 40%',
      alt: 'A Ghost Code round in play, with the Phantom at the centre of four command tokens and the prompt above.',
    },
    shots: [
      {
        scene: 'board',
        viewport: 'desktop',
        alt: 'A Ghost Code round in play, with the Phantom at the centre of four command tokens, the prompt above, and score and streak counters keeping pace.',
        caption: 'A seeded round in motion: the same board, both themes.',
        video: {
          clip: 'round',
          alt: 'A Ghost Code round in motion, with the Phantom moving between four command tokens while the prompt reads above.',
        },
        darkVideo: true,
      },
    ],
  },
];
