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
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/work/`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/about/`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE}/certificates/`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/blog/`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/contact/`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const work: MetadataRoute.Sitemap = getDeliverables().map((d) => ({
    url: `${BASE}/work/${d.id}/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const posts: MetadataRoute.Sitemap = getBlogPosts().map((p) => ({
    url: `${BASE}/blog/${p.id}/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...work, ...posts];
}
