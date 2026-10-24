import type { MetadataRoute } from 'next';

import { getBlogPosts, getDeliverables } from '@/lib/content';

/**
 * Dynamic sitemap — generated at build time so it never goes stale and always
 * lists every live deliverable + (non-draft) blog post. Replaces the old
 * hand-maintained public/sitemap.xml. Static-export friendly (Next emits
 * /sitemap.xml at build). `trailingSlash: true` in next.config → URLs end in /.
 */
const BASE = 'https://skypistudio.com';

// Static export: generate the sitemap at build time (not on-request).
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // No lastModified: a build timestamp is not a content date, and stamping
  // every URL with it told crawlers every page changed on every rebuild.
  // Add per-route dates only when they are maintained from real edits.

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/work/`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/about/`, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE}/certificates/`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/blog/`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/contact/`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/accessibility/`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/colophon/`, changeFrequency: 'yearly', priority: 0.5 },
  ];

  // Public Flagstone utility pages are copied from public/ into the export.
  const flagstone: MetadataRoute.Sitemap = [
    '/flagstone/',
    '/flagstone/accessibility/',
    '/flagstone/privacy/',
    '/flagstone/support/',
    '/flagstone/terms/',
  ].map((path) => ({ url: `${BASE}${path}` }));

  const work: MetadataRoute.Sitemap = getDeliverables().map((d) => ({
    url: `${BASE}/work/${d.id}/`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const posts: MetadataRoute.Sitemap = getBlogPosts().map((p) => ({
    url: `${BASE}/blog/${p.id}/`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...flagstone, ...work, ...posts];
}
