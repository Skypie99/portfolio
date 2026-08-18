/**
 * registry.mjs — the capture factory's entire configuration as data.
 *
 * Every project skypistudio.com shows (plus Pet Paradise, banked-only) with:
 * where it lives, which SHA to shoot, how to build/serve it, how its theme is
 * driven (so light/dark are SET deterministically, never hoped for), the scene
 * list with nav steps and REAL alt text (Sky-refinable in the manifest), and
 * the clip specs. Re-runs are deterministic because this file is the run.
 *
 * TRUTH LAW: scenes photograph the app as it is — no fixtures, no staging.
 * SAFETY: the driver refuses any step whose target matches FORBIDDEN_TARGETS
 * (Flagstone talks to production Supabase; reads only, always).
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Masters + receipts bank. Durable across worktrees via env override:
 *  the train runs from a worktree but banks into the main checkout. */
export const BANK_ROOT =
  process.env.SHOWCASE_BANK_ROOT || path.join(REPO_ROOT, 'design-reviews', 'showcase-refresh');
export const MASTERS_ROOT = path.join(BANK_ROOT, 'masters');
export const RECEIPTS_ROOT = path.join(BANK_ROOT, 'receipts');
export const SHIP_ROOT = path.join(REPO_ROOT, 'public', 'showcase');
export const MANIFEST_PATH = path.join(REPO_ROOT, 'content', 'showcase.manifest.json');

export const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
};

/** Stated up front, held in every run (report prints the arithmetic). */
export const BUDGETS = {
  stillAvifKB: 150, // encode-proof ladder 52→36; whale guard exits non-zero
  posterAvifKB: 100,
  clipMp4KB: 800, // retry crf 30 / −1 s once, else MASTERS-ONLY
  clipWebmKB: 800, // or dropped with stated arithmetic
  shipTotalTargetMB: 8,
  shipTotalHardCapMB: 10,
};

/** Terminal mutating controls — any nav/drive step whose target matches throws
 *  before the click. Carried verbatim from the r2 harness's fence. */
export const FORBIDDEN_TARGETS = /submit|vote|comment|sign.?in|sign.?up|delete|post|send feedback/i;

/** Networks: non-GET to Supabase is aborted loudly; ≤1 Nominatim request per run. */
export const NETWORK_FENCES = {
  supabaseWriteFence: /supabase\.co/i,
  nominatimBudgetHost: /nominatim\.openstreetmap\.org/i,
  nominatimMaxPerRun: 1,
};

export const git = (repo, ...args) =>
  execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();

/**
 * Scene fields:
 *  id        stable filename stem (overwrite-in-place law)
 *  viewports subset of VIEWPORTS keys
 *  themes    'both' | 'matte' (mono project — captured once, matted site-side)
 *  nav       DSL steps (driver.mjs); ONE nav per scene, re-run per theme/viewport
 *  settle    extra ms after nav before the shot
 *  ship      false → masters-only (captured for the record, not shipped)
 *  shipKind  'shot' | 'hero' | 'card' → encode-proof budget class
 *  alt       REAL alt text (zod law: 4–200 chars, never "image of…"); Sky-refinable
 *  determinism per-scene override of the project class
 *
 * Clip fields: id, theme(s), pre (nav before recording context settles),
 *  drive (recorded steps; gestureStart/gestureEnd marks bound the trim),
 *  targetS, posterAt ('end' | seconds from gestureStart), flags.
 */
export const PROJECTS = [
  {
    slug: 'accessmap',
    title: 'Flagstone',
    priority: 1,
    repo: '/Users/skypie/AccessMap',
    source: {
      kind: 'worktree',
      ref: 'shipready/3-polish-submission',
      sha: '5ab3f0c', // Sky-pinned 2026-07-31
      fallback: { ref: 'main', sha: '512494a', drops: ['terms'], note: 'proven export route' },
    },
    build: {
      kind: 'expo-export',
      cmd: ['npx', '--no-install', 'expo', 'export', '--platform', 'web', '--output-dir'],
      needsEnv: true, // .env copied mechanically (never read/printed), chmod 600, removed at teardown
      linkNodeModules: true,
      timeoutMs: 15 * 60 * 1000, // ONE exploratory attempt at 5ab3f0c, then fallback
    },
    serve: { kind: 'static', port: 8082, spa: false }, // no rewrite → never deep-URL; navigate in-app
    theme: {
      // Default mode is 'system'; rn-web reads prefers-color-scheme synchronously →
      // context colorScheme is deterministic from first paint. localStorage pin is the belt.
      colorSchemeEmulation: true,
      seeds: (theme) => ({ 'accessmap:appearance': theme, '@accessmap/onboarded_v1': '1' }),
    },
    geolocation: { latitude: 49.8874, longitude: -119.4925 }, // real prod flag ~480 m → banner renders
    determinism: 'structural', // live prod flags + CARTO tiles drift; structure must hold
    readyText: 'Tasks',
    scenes: [
      {
        id: 'map-overview',
        viewports: ['phone', 'desktop'],
        themes: 'both',
        // NearbyFlagsModal auto-opens on FullMap (rn-web isScreenReaderEnabled is
        // hard-true) — Close is optional-click so the scene survives either state.
        nav: [
          { clickLabel: 'Open the full map' },
          { wait: 3500 },
          { clickOpt: 'Close' },
          { wait: 700 },
        ],
        ship: true,
        shipKind: 'hero',
        alt: "Flagstone's full map — severity-coloured barrier pins over street tiles of downtown Kelowna, a nearest-barrier banner up top and rounded zoom controls at the edge.",
      },
      {
        id: 'drawer-open',
        viewports: ['phone'],
        themes: 'both',
        nav: [{ clickLabel: 'Open navigation menu' }, { wait: 800 }],
        ship: true,
        shipKind: 'shot',
        alt: "Flagstone's navigation drawer slid open over the dimmed home screen — frosted-glass rows for Resources, How to help, About and Settings.",
      },
      {
        id: 'nearby-flags-sheet',
        viewports: ['phone'],
        themes: 'both',
        nav: [{ clickLabel: 'Open the full map' }, { wait: 3000 }, { clickOpt: 'Open nearby flags list' }, { wait: 1100 }],
        ship: true,
        shipKind: 'shot',
        alt: 'The Nearby flags sheet raised over the map — grabber bar on top, then barrier cards carrying severity out of 5, status and distance.',
      },
      {
        id: 'report-composed',
        viewports: ['phone'],
        themes: 'both',
        // The report entry lives on HOME at this SHA (aria-dump diagnosis
        // 2026-07-31: the map has no report FAB; the home pill is occluded once
        // the map opens). Compose from Home; category/severity/description are
        // resilient optionals so a copy tweak degrades the composition, never
        // the scene. Ends at the submit CTA — the r2 fence verbatim: NEVER
        // pressed.
        nav: [
          { wait: 2500 },
          { clickLabel: 'Report a barrier' },
          { wait: 3000 },
          { clickLabelOpt: 'Category: Blocked path' },
          { clickTextOpt: 'Blocked path' },
          { wait: 600 },
          { clickLabelOpt: 'Severity 4' },
          { wait: 600 },
          { clickLabelOpt: 'Use my location' },
          { wait: 1200 },
          { fillLabelOpt: { label: 'Description', value: 'Construction hoarding blocks the whole sidewalk.' } },
          { wait: 800 },
        ],
        ship: true,
        shipKind: 'shot',
        alt: 'The Report a barrier sheet fully composed — Blocked path chosen, severity 4 set, a one-line description in place, and the Submit button lit but deliberately unpressed.',
      },
      {
        id: 'tasks',
        viewports: ['phone'],
        themes: 'both',
        nav: [{ tab: 'Tasks' }, { wait: 1600 }],
        ship: true,
        shipKind: 'shot',
        alt: 'The Tasks screen — open barrier reports as frosted-glass rows with category icon, severity, status pill and age, under the filter controls.',
      },
      {
        id: 'guest-profile',
        viewports: ['phone'],
        themes: 'both',
        nav: [{ tab: 'Profile' }, { wait: 1400 }],
        ship: false, // masters-only; strong record, not a site slot yet
        shipKind: 'shot',
        alt: 'The signed-out Profile screen — an editorial header, a sign-in invitation card, and contribution stats held as quiet placeholders.',
      },
      {
        id: 'settings-appearance',
        viewports: ['phone'],
        themes: 'both',
        nav: [{ clickLabel: 'Open navigation menu' }, { wait: 800 }, { clickText: 'Settings' }, { wait: 1400 }],
        ship: true,
        shipKind: 'shot',
        alt: "Flagstone's Appearance setting — a three-segment Light, Dark, System control with the active segment raised: the app documenting its own theming.",
      },
      {
        id: 'terms',
        viewports: ['phone'],
        themes: 'both',
        onlyOn: ['5ab3f0c', 'shipready/3-polish-submission'], // does not exist on main
        nav: [
          { clickLabel: 'Open navigation menu' },
          { wait: 800 },
          { clickText: 'Settings' },
          { wait: 1400 },
          { clickTextOpt: 'Terms & Community Guidelines' },
          { wait: 1200 },
        ],
        ship: false,
        shipKind: 'shot',
        alt: 'The Terms and Community Guidelines sheet — plain-language sections set in the editorial type, scrollable as a full page sheet.',
      },
    ],
    clips: [
      {
        id: 'drawer-spring',
        themes: ['light', 'dark'],
        pre: [{ wait: 1500 }],
        drive: [
          { mark: 'gestureStart' },
          { clickLabel: 'Open navigation menu' },
          { wait: 1400 },
          { press: 'Escape' },
          { wait: 900 },
          { mark: 'gestureEnd' },
        ],
        targetS: 4,
        posterAt: 1.2,
        alt: "Flagstone's navigation drawer springing open over the home screen, resting a beat, then sliding away.",
      },
      {
        id: 'map-browse',
        themes: ['light', 'dark'],
        pre: [{ clickLabel: 'Open the full map' }, { wait: 3500 }, { clickOpt: 'Close' }, { wait: 800 }],
        drive: [
          { mark: 'gestureStart' },
          { drag: { from: [195, 500], to: [255, 330], ms: 650 } },
          { wait: 700 },
          { drag: { from: [200, 380], to: [140, 520], ms: 650 } },
          { wait: 600 },
          { clickLabelOpt: 'Zoom in' },
          { wait: 900 },
          { mark: 'gestureEnd' },
        ],
        targetS: 6,
        posterAt: 'end',
        alt: 'Panning across the Flagstone barrier map and zooming in — severity pins holding their place over the streets.',
      },
      {
        id: 'report-walk',
        themes: ['light'],
        pre: [{ wait: 2000 }], // the report pill lives on Home at this SHA
        drive: [
          { mark: 'gestureStart' },
          { clickLabel: 'Report a barrier' },
          { wait: 2200 },
          { clickLabelOpt: 'Category: Blocked path' },
          { clickTextOpt: 'Blocked path' },
          { wait: 900 },
          { clickLabelOpt: 'Severity 4' },
          { wait: 1200 },
          { mark: 'gestureEnd' },
        ],
        targetS: 8,
        posterAt: 'end', // end frame = composed form at the enabled CTA
        flags: ['submission NEEDS-DEVICE'], // the send itself is only provable on device
        alt: 'Opening the Report a barrier flow, choosing Blocked path and severity 4 — stopping at the ready-to-send form.',
      },
      {
        id: 'theme-flip',
        themes: ['light'], // one clip; it shows both palettes by nature
        pre: [
          { clickLabel: 'Open navigation menu' },
          { wait: 800 },
          { clickText: 'Settings' },
          { wait: 1400 },
        ],
        drive: [
          { mark: 'gestureStart' },
          { clickLabelOpt: 'Dark' },
          { wait: 1600 },
          { clickLabelOpt: 'Light' },
          { wait: 1200 },
          { mark: 'gestureEnd' },
        ],
        targetS: 5,
        posterAt: 0.5,
        alt: "Flagstone's Appearance control flipping the whole app dark and back to light, every surface re-theming in place.",
      },
    ],
    // Registry rows the web cannot prove — recorded honestly, never attempted:
    needsDevice: ['sheet swipe-dismiss (no PanResponder on web; pageSheet is native-only)', 'report submission end-state'],
  },

  {
    slug: 'prompt-library',
    title: 'Prompt Library',
    priority: 2,
    repo: '/Users/skypie/Documents/Claude/Projects/Prompt Library Tool',
    source: { kind: 'inplace', ref: 'main', sha: '052b37a' },
    build: { kind: 'next-build', cmd: ['npx', '--no-install', 'next', 'build'], outDir: 'out', timeoutMs: 10 * 60 * 1000 },
    serve: { kind: 'static', port: 8083, dir: 'out' },
    theme: {
      colorSchemeEmulation: true,
      seeds: (theme) => ({ 'promptlib:theme': theme }),
      assertDarkClass: true,
    },
    determinism: 'byte-expected',
    readySelector: 'main',
    scenes: [
      { id: 'home', viewports: ['phone', 'desktop'], themes: 'both', nav: [{ wait: 1200 }], ship: true, shipKind: 'hero', alt: 'The Prompt Library home — search bar and category chips over a grid of prompt cards, the featured card leading.' },
      // Desktop only: the featured-prompt affordance is not reachable at 390px
      // (failed twice, aria-dumped) — the phone layout collapses the banner.
      { id: 'prompt-detail', viewports: ['desktop'], themes: 'both', nav: [{ wait: 1000 }, { clickLabel: 'Open featured prompt' }, { wait: 900 }], ship: true, shipKind: 'shot', alt: 'A prompt opened in the library — variable fields ready to fill above the monospace prompt preview and its copy control.' },
      { id: 'command-palette', viewports: ['desktop'], themes: 'both', nav: [{ wait: 800 }, { press: 'Meta+K' }, { wait: 600 }], ship: false, shipKind: 'shot', alt: 'The command palette floating over the dimmed library, ready for a keystroke.' },
      { id: 'not-found', viewports: ['desktop'], themes: 'both', path: '/404.html', nav: [{ wait: 800 }], ship: false, shipKind: 'shot', alt: 'The designed 404 page — the library’s type and palette holding even when the route is lost.' },
    ],
    clips: [],
  },

  {
    slug: 'ghost-code',
    title: 'Ghost Code',
    priority: 3,
    repo: '/Users/skypie/Games/pacman-code-trainer',
    source: { kind: 'worktree', ref: 'main', sha: '1e6b963' }, // 2026-07-31: toggle-reachability fix landed on top of the light-mode merge
    build: { kind: 'none' },
    serve: { kind: 'static', port: 8123 },
    theme: {
      colorSchemeEmulation: true,
      // Theme lives INSIDE the gc.v1 JSON blob; the seeded PRNG + reduced-anim
      // seeds are ported from the repo's own light-mode harness (seeded-byte class).
      seedScript: (theme) => `
        (() => {
          try {
            var blob = { theme: '${theme}' };
            localStorage.setItem('gc.v1', JSON.stringify(blob));
          } catch (e) {}
          // mulberry32 — deterministic frames, same seed the repo's own gate uses
          var seed = 1337;
          Math.random = function () {
            seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
            var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
          };
          document.addEventListener('DOMContentLoaded', function () {
            document.documentElement.setAttribute('data-theme', '${theme}');
          });
        })();`,
      postLoadAttr: true, // belt: set data-theme again after load
    },
    // byte-expected, NOT seeded-byte: the seeded PRNG fixes the ROUND's content
    // (maze, tokens, prompt) but the Phantom runs on a time-driven canvas loop —
    // two captures at different wall-clock instants legitimately differ by a
    // few animation pixels. Structure + dimensions must still match exactly.
    determinism: 'byte-expected',
    readySelector: 'body',
    scenes: [
      { id: 'title', viewports: ['desktop'], themes: 'both', nav: [{ waitFonts: true }, { wait: 1200 }], ship: true, shipKind: 'hero', alt: 'Ghost Code’s title screen — the arcade cabinet framing the Phantom mascot, Start and Settings glowing below the wordmark.' },
      { id: 'board', viewports: ['phone', 'desktop'], themes: 'both', nav: [{ waitFonts: true }, { evaluateOpt: 'startGame()' }, { wait: 1200 }], ship: true, shipKind: 'shot', alt: 'A Ghost Code round in play — the maze board mid-chase with the code prompt beneath and score and streak counters keeping pace.' },
      { id: 'gameover', viewports: ['phone', 'desktop'], themes: 'both', nav: [{ waitFonts: true }, { evaluateOpt: 'window.__gcForceGameOver && window.__gcForceGameOver()' }, { wait: 1200 }], ship: false, shipKind: 'shot', alt: 'The results screen after a round — mastery bars per concept and the invitation to run it back.' },
    ],
    clips: [
      {
        // Replaces the dark-only proof loop with BOTH real themes (seeded PRNG
        // keeps the round deterministic). Supersedes loop.mp4/webm at retrofit.
        id: 'round',
        themes: ['light', 'dark'],
        pre: [{ waitFonts: true }, { evaluateOpt: 'startGame()' }, { wait: 800 }],
        drive: [{ mark: 'gestureStart' }, { wait: 4500 }, { mark: 'gestureEnd' }],
        targetS: 5,
        posterAt: 1.0,
        alt: 'A Ghost Code round in motion — the Phantom on patrol while the code prompt waits below.',
      },
    ],
    notes: ['P-6: Phantom renders one-eyed ≤600px (both themes) — no mobile mascot shots.'],
  },

  {
    slug: 'claude-corp',
    title: 'Claude Corp',
    priority: 4,
    repo: '/Users/skypie/Claude_Corp',
    source: { kind: 'inplace', ref: 'main', sha: '7e961a3' },
    build: { kind: 'none' },
    serve: { kind: 'static', port: 8125 },
    theme: {
      colorSchemeEmulation: true,
      seeds: (theme) => ({ 'cc-theme': theme }),
      dataThemeAttr: true, // set pre-paint → the 480 ms .theming fade never engages
    },
    determinism: 'byte-expected',
    readySelector: 'body',
    scenes: [
      { id: 'hero-pipeline', viewports: ['phone', 'desktop'], themes: 'both', nav: [{ wait: 1200 }], ship: true, shipKind: 'hero', alt: 'The Claude Corp front door — the editorial hero over the agent pipeline diagram, fifteen roles feeding one governed main branch.' },
      { id: 'team', viewports: ['phone', 'desktop'], themes: 'both', nav: [{ scrollTo: '#team' }, { wait: 900 }], ship: true, shipKind: 'shot', alt: 'The fifteen-role team grid — each agent card naming its craft, from Quinn on product through Morgan on reporting.' },
      { id: 'proof', viewports: ['desktop'], themes: 'both', nav: [{ scrollTo: '#proof' }, { wait: 900 }], ship: false, shipKind: 'shot', alt: 'The proof section — shipped-work receipts lined up under the governance rules that produced them.' },
      { id: 'not-found', viewports: ['desktop'], themes: 'both', path: '/404.html', nav: [{ wait: 800 }], ship: false, shipKind: 'shot', alt: 'Claude Corp’s designed 404 — the ink-and-cream register holding on the lost-route page.' },
    ],
    clips: [],
  },

  {
    slug: 'dashboard',
    title: 'Dashboard',
    priority: 5,
    repo: '/Users/skypie/Dashboard',
    appDir: 'dashboard-app',
    // LIVE CAPTURE (2026-07-31): main @ b8bd3a9 needs @anthropic-ai/sdk, which
    // was never installed on this machine (installs are forbidden), so a local
    // demo build cannot exist. The public demo at dashboard.skypistudio.com IS
    // the deployed truth (Vercel builds main with its own install) — capture it
    // directly. GET-only navigation; demo mode gates all writes server-side.
    source: { kind: 'live', url: 'https://dashboard.skypistudio.com', shaRef: 'origin/main' },
    build: { kind: 'live' },
    serve: { kind: 'live' },
    theme: {
      colorSchemeEmulation: true,
      seeds: (theme) => ({ 'cc-theme': theme }),
      settleAfterLoadMs: 400, // pre-paint theme-init exists on main; settle is the old-SHA belt
    },
    determinism: 'demo-snapshot',
    readySelector: 'main',
    scenes: [
      { id: 'command-center', viewports: ['phone', 'desktop'], themes: 'both', path: '/', nav: [{ wait: 1500 }], ship: true, shipKind: 'hero', alt: 'The Dashboard command center — project health, agent activity and pending decisions on one calm board.' },
      { id: 'think-tank', viewports: ['phone', 'desktop'], themes: 'both', path: '/think-tank', nav: [{ wait: 1500 }], ship: true, shipKind: 'shot', alt: 'The Think Tank board — ideas triaged into Do it, Later and Skip lanes with their leverage notes.' },
      { id: 'dispatch', viewports: ['phone', 'desktop'], themes: 'both', path: '/dispatch', nav: [{ wait: 1500 }], ship: true, shipKind: 'shot', alt: 'The Dispatch queue — work items lined up with status, owner and the relay controls held safely off.' },
    ],
    clips: [],
  },

  {
    slug: 'pet-paradise',
    title: "Sky's Pet Paradise",
    priority: 6,
    repo: '/Users/skypie/luxury-dog-sitting',
    source: { kind: 'inplace', ref: 'main', sha: 'a343f5c' }, // parked, no remote — bank-only per Sky
    build: { kind: 'none' },
    serve: { kind: 'static', port: 8124 },
    theme: { mono: 'dark-mono' }, // zero prefers-color-scheme, zero localStorage — captured once as `matte`
    determinism: 'byte-expected',
    readySelector: 'body',
    bankOnly: true,
    scenes: [
      { id: 'hero', viewports: ['phone', 'desktop'], themes: 'matte', path: '/#hero', nav: [{ wait: 1000 }], ship: true, shipKind: 'hero', alt: "Sky's Pet Paradise front door — gold serif welcome over a near-black canvas, the Okanagan dog-sitting pitch in one screen." },
      { id: 'services', viewports: ['phone', 'desktop'], themes: 'matte', path: '/#services', nav: [{ scrollTo: '#services' }, { wait: 800 }], ship: true, shipKind: 'shot', alt: 'The services cards — boarding, day care and drop-in visits, each priced and framed in gold on the dark canvas.' },
      { id: 'pricing', viewports: ['desktop'], themes: 'matte', path: '/#pricing', nav: [{ scrollTo: '#pricing' }, { wait: 800 }], ship: false, shipKind: 'shot', alt: 'The pricing grid — rates for overnight and daytime care set in the same quiet gold-on-dark register.' },
      { id: 'gallery', viewports: ['phone'], themes: 'matte', path: '/#gallery', nav: [{ scrollTo: '#gallery' }, { wait: 800 }], ship: false, shipKind: 'shot', alt: 'The gallery — visiting dogs at ease around the property, framed as a simple photo wall.' },
    ],
    clips: [],
  },

  {
    slug: 'mutual-mesh',
    title: 'Mutual Mesh',
    priority: 7,
    repo: '/Users/skypie/MutualMesh',
    source: { kind: 'worktree', ref: 'main', sha: '93f5928' },
    build: {
      kind: 'expo-export',
      cmd: ['npx', '--no-install', 'expo', 'export', '--platform', 'web', '--output-dir'],
      linkNodeModules: true,
      timeoutMs: 10 * 60 * 1000, // ONE timeboxed attempt; on failure → manifest UNCHANGED + reason
    },
    serve: { kind: 'static', port: 8126 },
    theme: { colorSchemeEmulation: true, seeds: () => ({}) },
    determinism: 'structural',
    stretch: true,
    readySelector: 'body',
    scenes: [
      { id: 'home', viewports: ['phone', 'desktop'], themes: 'both', nav: [{ wait: 2000 }], ship: false, shipKind: 'shot', alt: 'Mutual Mesh’s home feed — neighbours’ offers and asks stacked as cards, ready to match.' },
    ],
    clips: [],
  },
];

export const projectBySlug = (slug) => PROJECTS.find((p) => p.slug === slug);
