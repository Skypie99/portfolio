import { getBlogPosts, getProfile } from '@/lib/content';
import { markdownToFeedHtml } from '@/lib/markdown';

/**
 * /feed.json — JSON Feed 1.1 for Notes (§8.4).
 *
 * Static Route Handler (see feed.xml/route.ts) — evaluated at build, written to
 * `out/feed.json`. Same non-draft post data as the /blog listing and the RSS
 * feed, so the three never drift. JSON Feed spec: https://www.jsonfeed.org/.
 */
export const dynamic = 'force-static';

const BASE = 'https://skypistudio.com';
const FEED_DESCRIPTION =
  'Notes by Sky Halisky on AI, accessibility, and building things.';

export function GET(): Response {
  const profile = getProfile();
  const posts = getBlogPosts();

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: `Notes — ${profile.name}`,
    home_page_url: `${BASE}/blog/`,
    feed_url: `${BASE}/feed.json`,
    description: FEED_DESCRIPTION,
    language: 'en-CA',
    authors: [{ name: profile.name, url: BASE }],
    items: posts.map((post) => {
      const url = `${BASE}/blog/${post.id}/`;
      return {
        id: url,
        url,
        title: post.title,
        summary: post.summary,
        // C-92: JSON Feed 1.1 items MUST carry content — summary alone was
        // spec-incomplete. The full post as clean semantic HTML.
        content_html: markdownToFeedHtml(post.content),
        date_published: `${post.publishedDate}T12:00:00Z`,
        tags: post.tags,
      };
    }),
  };

  return new Response(`${JSON.stringify(feed, null, 2)}\n`, {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
}
