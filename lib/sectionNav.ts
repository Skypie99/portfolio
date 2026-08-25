/**
 * sectionNav — what the rail's "On this page" index says, per route (UP-10).
 *
 * The rail used to render the HOMEPAGE's five section links on every non-
 * longform route, so the index lied on /work, /about, /certificates, /colophon,
 * /blog, /accessibility, /contact and the 404 — measured: 5 of 5 entries pointed
 * at ids that route does not contain, and the scroll-spy never lit on any of
 * them. This module is the single place that decides what the index claims.
 *
 * WHY A STATIC MAP AND NOT A DOM READ
 * SidebarArticleNav reads `main h2[id]` client-side, which is right for markdown
 * articles whose headings are authored content — but it costs an SSR-empty
 * index, and paying that here would re-introduce the exact CLS that forced the
 * `.sidebar-toc-reserve` placeholder (see SidebarArticleNav's C-42-rider). These
 * are hand-built pages with fixed sections, the export is static, and a literal
 * map server-renders the real list on first paint, works with JS off, and is
 * drift-proofed by a guard that asserts every id AND every label against the
 * built HTML of its own route (lib/__tests__/section-nav-anchors.test.ts).
 *
 * THE TWO RULES THE MAP FOLLOWS
 *  1. LABELS ARE NEVER INVENTED. Every label below is a string the page itself
 *     renders, byte-for-byte. Pages built on the eyebrow grammar (an eyebrow <p>
 *     naming a band, then its h2) are indexed by their EYEBROWS — that is what
 *     the home rail has always done: its five labels are home's five section
 *     eyebrows, not its h2s. Pages built on the prose grammar (/colophon,
 *     /accessibility, whose bodies come from renderMarkdownProse) are indexed by
 *     their h2s, exactly like SidebarArticleNav does. Each page is named in its
 *     own voice.
 *  2. A ROUTE WITH FEWER THAN TWO NAMED SECTIONS IS NOT INDEXED — it renders
 *     nothing at all, not an empty shell. /work, /certificates and /blog are
 *     single-band listings whose only other heading is sr-only (promoting a
 *     screen-reader-only string into visible rail copy would be new wording);
 *     /contact has exactly one named band under its title band; the 404 has
 *     none. A one-item "on this page" is not an index.
 *  3. A ROUTE'S TITLE BAND IS NOT ONE OF ITS SECTIONS. Every route opens with a
 *     band carrying `data-band-anchor` — the house marker for exactly that, and
 *     the analogue of home's `div#hero`, which this index has always omitted.
 *     Home settles it: `#hero` carries a visible eyebrow of the same grammar
 *     ("Portfolio — 2026", components/Hero.tsx) and is STILL unlisted, so a
 *     visible eyebrow does not by itself earn an entry. The title eyebrow also
 *     names the PAGE, not a band in it — "A Brief Account" is what Footer.tsx
 *     and HamburgerNav.tsx call /about, and "Let's talk" is this very index's
 *     home-route label for /#contact. Listing either would put a page inside
 *     its own table of contents, or print one label twice in the persistent
 *     chrome pointing at two different targets.
 *
 * Curation, not a dump: home carries `div#hero` and `section#showcase` — the
 * latter with a real name ("Shipped") — and lists neither, so the index has
 * always meant "this page's principal sections". A back-link / CTA closer is
 * chrome, not a section.
 *
 * hrefs are route-absolute (`/about/#method`, matching home's `/#work`) so one
 * grammar covers both same-page and cross-page entries and next/link resolves
 * them — including prepending a basePath, if one is ever configured
 * (next.config.mjs sets none today). Never hardcode a base path here.
 */

export type RailSection = {
  /** id of the anchorable element on that route (a <section> or an h2) */
  readonly id: string;
  /** verbatim on-page string that names the section */
  readonly label: string;
  /** route-absolute href — basePath is applied by next/link */
  readonly href: string;
};

/** One entry per route that has a real, multi-section index. */
const ROUTE_SECTIONS = {
  // Home — one label per section eyebrow, verbatim (app/page.tsx), and the ids
  // are its <section> ids. Truth pass 2026-08-21 swapped one for another:
  // `how-i-work` joined, and `process` ("Method" — Discover / Build / Ship &
  // stay curious) was cut, because it restated the new band generically and sat
  // directly beneath it. Rule 1 holds — the label is the eyebrow the band
  // actually renders, byte-for-byte. Order follows the DOM; guard T5 asserts the
  // rendered rail matches this list IN ORDER, and T4 asserts no id'd band on the
  // route is missing from it.
  // (Note /about keeps its OWN `#method` entry — different route, still live.)
  //
  // THE ROOM Phase C (2026-08-25) re-cut the homepage's hierarchy, and this map
  // moved with it band by band, in each band's own commit — the precedent set by
  // round 1 of the truth pass, which hit this same guard:
  //   + `flagship`  C2 — the featured work gets a room, first past the hero
  //   + `record`    C5 — the site's own ledger, above the fold
  //   − `showcase`  C4 — the five stat chips retired into three hero receipts
  //   − `certificates` C6 — demoted to one line inside A Brief Account
  '/': [
    { id: 'flagship', label: 'Featured — the flagship', href: '/#flagship' },
    { id: 'work', label: 'The Work', href: '/#work' },
    { id: 'how-i-work', label: 'How the work gets made', href: '/#how-i-work' },
    { id: 'about', label: 'A Brief Account', href: '/#about' },
    { id: 'certificates', label: 'Credentials', href: '/#certificates' },
    { id: 'contact', label: "Let’s talk", href: '/#contact' },
  ],

  // /about — eyebrow grammar. Four in-page sections. Two bands are curated out,
  // for the two reasons rule 3 (below) names: the opening "A Brief Account"
  // band is the route's TITLE band, and the closing "Want to work together? /
  // Let's talk." band has no name string of its own — labelling it would mean
  // choosing half of a display headline, which is authorship, not quotation.
  // `#work` is on a CONDITIONAL band (`recent.length > 0`), so it would vanish
  // if deliverables.json emptied — which is precisely the drift the built-HTML
  // guard exists to catch, and it would fail loudly rather than ship a dangling
  // anchor.
  '/about': [
    { id: 'method', label: 'Method', href: '/about/#method' },
    { id: 'principles', label: 'Principles', href: '/about/#principles' },
    { id: 'currently', label: 'Currently', href: '/about/#currently' },
    { id: 'work', label: 'The Work', href: '/about/#work' },
  ],

  // /colophon — prose grammar. The five markdown h2s already carry slug ids
  // from renderMarkdownProse; the live specimen and the calibration ledger
  // carry their own hand-written ids.
  '/colophon': [
    { id: 'the-stack', label: 'The stack', href: '/colophon/#the-stack' },
    { id: 'the-type', label: 'The type', href: '/colophon/#the-type' },
    { id: 'the-world', label: 'The world', href: '/colophon/#the-world' },
    { id: 'the-quiet-systems', label: 'The quiet systems', href: '/colophon/#the-quiet-systems' },
    { id: 'how-it-was-made', label: 'How it was made', href: '/colophon/#how-it-was-made' },
    { id: 'type-specimen', label: 'The type, set live', href: '/colophon/#type-specimen' },
    { id: 'calibration', label: 'Calibration record', href: '/colophon/#calibration' },
  ],

  // /accessibility — prose grammar, plus the measured receipts strip that sits
  // between the statement's two halves.
  '/accessibility': [
    {
      id: 'the-standard-i-aim-for',
      label: 'The standard I aim for',
      href: '/accessibility/#the-standard-i-aim-for',
    },
    { id: 'what-i-built-in', label: 'What I built in', href: '/accessibility/#what-i-built-in' },
    { id: 'receipts', label: 'Measured, not claimed', href: '/accessibility/#receipts' },
    {
      id: 'what-i-have-not-done',
      label: 'What I have not done',
      href: '/accessibility/#what-i-have-not-done',
    },
    {
      id: 'found-a-barrier-tell-me',
      label: 'Found a barrier? Tell me.',
      href: '/accessibility/#found-a-barrier-tell-me',
    },
  ],

} as const satisfies Record<string, readonly RailSection[]>;

/** Shared frozen empty result — one stable reference for every unindexed route. */
const NONE: readonly RailSection[] = Object.freeze([]);
const NO_IDS: readonly string[] = Object.freeze([]);

/**
 * Module-stable id arrays, computed once. useActiveSection keys its effect off
 * `ids.join(',')`, so a fresh array per render would be harmless — but its own
 * docblock asks for a stable array, and honouring that keeps the contract true
 * if the hook's dependency ever tightens.
 */
const ROUTE_IDS: Record<string, readonly string[]> = Object.fromEntries(
  Object.entries(ROUTE_SECTIONS).map(([route, sections]) => [
    route,
    Object.freeze(sections.map((s) => s.id)),
  ]),
);

/**
 * Normalize a pathname to a map key. `trailingSlash: true` means routes are
 * served as `/about/`, but usePathname can report either form (and the dev
 * server reports the unslashed one), so both must land on the same entry.
 *
 * An EMPTY pathname deliberately does NOT alias to home. usePathname is typed
 * `string | null` and the caller falls back to '', so aliasing '' to '/' would
 * make an unknown route render the homepage's index with live scroll-spy —
 * a miniature of the exact bug UP-10 removes. Unknown means no index.
 */
function normalize(pathname: string): string {
  if (!pathname) return '';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** The ordered index for a route, or an empty list if it has none. */
export function sectionsForRoute(pathname: string): readonly RailSection[] {
  return (ROUTE_SECTIONS as Record<string, readonly RailSection[]>)[normalize(pathname)] ?? NONE;
}

/** The same route's ids, as one module-stable array (for useActiveSection). */
export function sectionIdsForRoute(pathname: string): readonly string[] {
  return ROUTE_IDS[normalize(pathname)] ?? NO_IDS;
}

/** Every indexed route — the guard sweeps this, so a new route can't be forgotten. */
export const INDEXED_ROUTES = Object.keys(ROUTE_SECTIONS) as readonly string[];

/**
 * Routes that render inside the shell but carry NO "On this page" index. Asserted
 * by the guard (T6): each must be a real built route, and none may ship a rail.
 *
 * /work, /certificates, /blog, /contact mount the rail with too few sections to
 * index. /archive is different in kind — it suppresses the whole site chrome
 * (ChromeGate), so it mounts no rail at all; it is listed here so the guard keeps
 * asserting the route exists and never grows an index.
 */
export const UNINDEXED_ROUTES: readonly string[] = Object.freeze([
  '/work',
  '/certificates',
  '/blog',
  '/contact',
  '/archive',
]);

/**
 * Bands that carry an id but are deliberately kept OUT of the index — the
 * curation, written down. Home's `#showcase` (the "Shipped" strip) has been
 * unlisted since the index shipped, and `#hero` likewise; the index has always
 * meant "this page's principal sections", not "every anchor". `#hero` is a
 * <div>, not a <section>, which is why the guard's band scan matches both.
 *
 * The built-HTML guard asserts that the id'd bands on a route are exactly
 * (mapped ∪ this list), so a NEW id'd band cannot join a page without someone
 * deciding, in writing, whether it belongs in the index.
 */
export const UNINDEXED_SECTION_IDS: Record<string, readonly string[]> = Object.freeze({
  '/': Object.freeze(['hero', 'showcase']),
});

export { ROUTE_SECTIONS };
