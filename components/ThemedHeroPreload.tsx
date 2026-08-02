import type { HeroPreload } from '@/lib/media';

/**
 * ThemedHeroPreload — preload exactly ONE hero variant, picked by the same
 * theme signal next-themes reads pre-hydration (showcase/theme-sync).
 *
 * The static `<link rel=preload>` a case-study hero uses today is theme-blind:
 * with a themed hero it would waste the wrong variant's full AVIF for half the
 * visitors and fail the site's own weight law while each image "passed". This
 * server component instead renders one tiny inline script (same pattern and
 * trust level as next-themes' own pre-hydration snippet; the site's meta CSP
 * allows 'unsafe-inline') that resolves the active theme — explicit
 * localStorage choice first, then prefers-color-scheme — and appends a single
 * high-priority preload link for the CORRECT variant. Rendered at the top of
 * the page body, it runs long before the hero <img> is parsed.
 *
 * No-JS: no preload; the visible layer is an in-viewport lazy image and
 * fetches at layout — no-JS is already the site's degraded path.
 */
export function ThemedHeroPreload({ links }: { links: { light: HeroPreload; dark: HeroPreload } }) {
  const js =
    `(function(){try{var t=localStorage.getItem('theme');` +
    `var d=t==='dark'||((!t||t==='system')&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);` +
    `var l=document.createElement('link');l.rel='preload';l.as='image';l.type='image/avif';` +
    `l.setAttribute('fetchpriority','high');` +
    `l.href=d?${JSON.stringify(links.dark.href)}:${JSON.stringify(links.light.href)};` +
    `document.head.appendChild(l);}catch(e){}})();`;
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
