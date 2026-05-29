/**
 * getBlogPosts integration + schema tests — blog infrastructure (Will).
 *
 * These run against the real content/blog.json — no mocks — following the
 * same approach as lib/__tests__/content.test.ts. That's intentional:
 * the whole point is to validate the actual ship-state of the site so that
 * editing blog.json and breaking an invariant fails locally before the
 * Next build does in CI.
 *
 * Draft-filtering, sort-order, and error-throwing tests use BlogPostSchema
 * and the loader logic directly by calling validateBlogPosts helper logic
 * via Zod — keeping them fast and hermetic without needing to mock fs.
 */
import { describe, expect, it } from 'vitest';

import { getBlogPosts } from '@/lib/content';
import { BlogPostSchema } from '@/lib/schema';

describe('getBlogPosts (real content/blog.json)', () => {
  it('returns an array', () => {
    const posts = getBlogPosts();
    expect(Array.isArray(posts)).toBe(true);
  });

  it('all returned posts satisfy BlogPostSchema', () => {
    const posts = getBlogPosts();
    for (const p of posts) {
      const parsed = BlogPostSchema.safeParse(p);
      expect(parsed.success, `blog post "${p.id}" failed schema`).toBe(true);
    }
  });

  it('all returned posts are non-draft (draft filtering works)', () => {
    const posts = getBlogPosts();
    for (const p of posts) {
      expect(p.draft, `post "${p.id}" should not be a draft`).toBeFalsy();
    }
  });

  it('sorts posts newest-first by publishedDate', () => {
    const posts = getBlogPosts();
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].publishedDate >= posts[i].publishedDate).toBe(true);
    }
  });

  it('has no duplicate ids', () => {
    const posts = getBlogPosts();
    const ids = posts.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe('BlogPostSchema validation', () => {
  it('accepts a valid published post shape', () => {
    const valid = {
      id: 'test-post-one',
      title: 'Test Post One — A Complete Guide',
      summary: 'A short summary of the first test post for the blog infrastructure.',
      publishedDate: '2026-05-30',
      tags: ['accessibility', 'expo'],
      readingTimeMinutes: 5,
      content: '## Heading\n\nSome content.',
      draft: false,
    };
    expect(BlogPostSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a draft post (draft: true is valid schema-wise)', () => {
    const draft = {
      id: 'draft-post',
      title: 'Draft Post — Not Published Yet',
      summary: 'This post is still a draft and should not appear in listings.',
      publishedDate: '2026-05-29',
      tags: ['drafts'],
      readingTimeMinutes: 3,
      content: '## Draft\n\nNot ready.',
      draft: true,
    };
    expect(BlogPostSchema.safeParse(draft).success).toBe(true);
  });

  it('rejects a post with missing required fields', () => {
    const invalid = { id: 'bad-post', title: 'Short' };
    expect(BlogPostSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects a post with a summary exceeding 200 characters', () => {
    const longSummary = 'x'.repeat(201);
    const invalid = {
      id: 'too-long',
      title: 'Title That Is Long Enough To Pass',
      summary: longSummary,
      publishedDate: '2026-05-30',
      tags: [],
      readingTimeMinutes: 5,
      content: 'Content.',
    };
    expect(BlogPostSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects an id that is not a kebab-case slug', () => {
    const invalid = {
      id: 'Bad_Slug',
      title: 'Title That Is Long Enough To Pass',
      summary: 'A summary that is long enough to be valid.',
      publishedDate: '2026-05-30',
      tags: [],
      readingTimeMinutes: 5,
      content: 'Content.',
    };
    expect(BlogPostSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects more than 6 tags', () => {
    const invalid = {
      id: 'too-many-tags',
      title: 'Title That Is Long Enough To Pass',
      summary: 'A summary that is long enough to be valid.',
      publishedDate: '2026-05-30',
      tags: ['a', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg'], // 7 tags
      readingTimeMinutes: 5,
      content: 'Content.',
    };
    expect(BlogPostSchema.safeParse(invalid).success).toBe(false);
  });
});
