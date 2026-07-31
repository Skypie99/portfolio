/**
 * wiring.mjs — which captured scene fills which deliverables.json media field
 * (consumed by scripts/wire-showcase.mjs; validated via DeliverableSchema at
 * wire time). Alt text defaults to the manifest's careful drafts; captions are
 * authored here and must stay TRUE to the frame they sit under.
 *
 * Curation notes:
 *  - accessmap cardImage is deliberately NOT rewired: the ratified "No ramp ·
 *    SEVERITY 4 · VERIFIED" flag crop (FT-1, Sky-picked) stays until Sky says
 *    otherwise — the card-vs-themed-map question rides the mockup gate.
 *  - shots[0] carries the drawer-spring clip in BOTH themes (poster-first,
 *    RM-safe); the report walk's submission remains NEEDS-DEVICE and is not
 *    embedded.
 */

export const WIRING = [
  {
    slug: 'accessmap',
    ogTheme: 'dark',
    heroShot: { scene: 'map-overview', viewport: 'phone' },
    shots: [
      {
        scene: 'drawer-open',
        viewport: 'phone',
        focal: '50% 24%',
        caption: 'The navigation drawer on spring physics — the material world in motion.',
        video: {
          clip: 'drawer-spring',
          alt: "AccessMap's navigation drawer springing open over the home screen, resting a beat, then sliding away.",
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
];
