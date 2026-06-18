import { getBlogPosts, getProfile } from '@/lib/content';

/**
 * /feed.xml — RSS 2.0 feed for Notes (§8.4).
 *
 * A static Route Handler: `output: 'export'` evaluates this at build time and
 * writes the result to `out/feed.xml`. GET-only, force-static — no runtime,
 * no dynamic functions. Built from the same Zod-validated, non-draft posts as
 * the /blog listing (getBlogPosts), so the feed can never drift from the site.
 */
export const dynamic = 'force-static';

const BASE = 'https://skypistudio.com';
const FEED_DESCRIPTION =
  'Notes by Sky Halisky on AI, accessibility, and building things.';

/** Escape the five XML-significant characters for use in text nodes/attributes. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** ISO date (YYYY-MM-DD) → RFC-822 date string required by RSS pubDate. */
function rfc822(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toUTCString();
}

export function GET(): Response {
  const profile = getProfile();
  const posts = getBlogPosts();
  const title = `Notes — ${profile.name}`;
  const lastBuild = posts[0] ? rfc822(posts[0].publishedDate) : new Date(0).toUTCString();

  const items = posts
    .map((post) => {
      const url = `${BASE}/blog/${post.id}/`;
      const categories = post.tags
        .map((t) => `      <category>${esc(t)}</category>`)
        .join('\n');
      return `    <item>
      <title>${esc(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(post.publishedDate)}</pubDate>
      <description>${esc(post.summary)}</description>
${categories}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(title)}</title>
    <link>${BASE}/blog/</link>
    <description>${esc(FEED_DESCRIPTION)}</description>
    <language>en-CA</language>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
