import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  BlogPostSchema,
  CertificateSchema,
  DeliverableSchema,
  ProfileSchema,
  type BlogPost,
  type Certificate,
  type Deliverable,
  type Profile,
} from '@/lib/schema';

const CONTENT_DIR = join(process.cwd(), 'content');

function readJson<T>(filename: string): T {
  const raw = readFileSync(join(CONTENT_DIR, filename), 'utf8');
  return JSON.parse(raw) as T;
}

/**
 * getProfile — single profile JSON. Validated; throws loudly on shape errors.
 */
export function getProfile(): Profile {
  const raw = readJson<unknown>('profile.json');
  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `content/profile.json failed validation:\n${JSON.stringify(parsed.error.format(), null, 2)}`,
    );
  }
  return parsed.data;
}

/**
 * getDeliverables — ordered newest-first by year.
 * Enforces the featured-slot invariant from Dana DATA_SHAPE.md §6:
 *  - exactly 0 or 1 deliverable may have featured: true
 *  - 2+ → throw at build (no silent ambiguity in the sidebar)
 *  - 0 → allowed (the sidebar falls back to a generic "Latest" link)
 */
export function getDeliverables(): Deliverable[] {
  const raw = readJson<unknown[]>('deliverables.json');
  const validated: Deliverable[] = [];
  raw.forEach((item, idx) => {
    const parsed = DeliverableSchema.safeParse(item);
    if (!parsed.success) {
      throw new Error(
        `content/deliverables.json[${idx}] failed validation:\n${JSON.stringify(parsed.error.format(), null, 2)}`,
      );
    }
    validated.push(parsed.data);
  });

  const ids = new Set<string>();
  for (const d of validated) {
    if (ids.has(d.id)) {
      throw new Error(`Duplicate deliverable id: "${d.id}". Slugs must be unique.`);
    }
    ids.add(d.id);
  }

  const featured = validated.filter((d) => d.featured);
  if (featured.length > 1) {
    throw new Error(
      `Featured-slot invariant violated: ${featured.length} deliverables have featured: true ` +
        `(${featured.map((d) => d.id).join(', ')}). Exactly one is allowed.`,
    );
  }

  return validated.sort((a, b) => b.year - a.year);
}

/**
 * getFeaturedDeliverable — null if zero are featured (sidebar fallback handles it).
 * Throws if more than one is featured (delegated to getDeliverables).
 */
export function getFeaturedDeliverable(): Deliverable | null {
  const all = getDeliverables();
  return all.find((d) => d.featured) ?? null;
}

/**
 * getBlogPosts — all non-draft posts, ordered newest-first by publishedDate.
 * draft: true posts are excluded at build time so they never appear in listings
 * or static params. Throws loudly on schema violations.
 */
export function getBlogPosts(): BlogPost[] {
  const raw = readJson<unknown[]>('blog.json');
  const validated: BlogPost[] = [];
  raw.forEach((item, idx) => {
    const parsed = BlogPostSchema.safeParse(item);
    if (!parsed.success) {
      throw new Error(
        `content/blog.json[${idx}] failed validation:\n${JSON.stringify(parsed.error.format(), null, 2)}`,
      );
    }
    validated.push(parsed.data);
  });

  const ids = new Set<string>();
  for (const p of validated) {
    if (ids.has(p.id)) {
      throw new Error(`Duplicate blog post id: "${p.id}". Slugs must be unique.`);
    }
    ids.add(p.id);
  }

  return validated
    .filter((p) => !p.draft)
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

/**
 * getAllBlogPostSlugs — returns slugs for ALL posts (including drafts).
 * Used exclusively in generateStaticParams so Next.js static export can
 * enumerate every dynamic route. Draft slugs still resolve to notFound()
 * at render time because getBlogPosts() filters them out.
 */
export function getAllBlogPostSlugs(): string[] {
  const raw = readJson<unknown[]>('blog.json');
  const slugs: string[] = [];
  raw.forEach((item) => {
    const parsed = BlogPostSchema.safeParse(item);
    if (parsed.success) slugs.push(parsed.data.id);
  });
  return slugs;
}

/**
 * getCertificates — ordered newest-first by issuedDate.
 */
export function getCertificates(): Certificate[] {
  const raw = readJson<unknown[]>('certificates.json');
  const validated: Certificate[] = [];
  raw.forEach((item, idx) => {
    const parsed = CertificateSchema.safeParse(item);
    if (!parsed.success) {
      throw new Error(
        `content/certificates.json[${idx}] failed validation:\n${JSON.stringify(parsed.error.format(), null, 2)}`,
      );
    }
    validated.push(parsed.data);
  });

  const ids = new Set<string>();
  for (const c of validated) {
    if (ids.has(c.id)) {
      throw new Error(`Duplicate certificate id: "${c.id}". Slugs must be unique.`);
    }
    ids.add(c.id);
  }

  return validated.sort((a, b) => b.issuedDate.localeCompare(a.issuedDate));
}

/**
 * getAccessibilityStatement — the body copy for the /accessibility page.
 *
 * Static, content-agnostic prose (no data fetch, no slug), so it lives as an
 * inline const here rather than a JSON file + Zod schema. Authored for the
 * shared long-form renderer (components/MarkdownProse.renderMarkdownProse):
 * `##` headings + paragraphs + `**bold**` only — NO bullet lists and NO inline
 * links (the parser supports neither). The page's "report a barrier" link is a
 * JSX <Link> in the closer section, not markdown, for the same reason.
 *
 * Every claim here is grounded in Sky's existing copy AND backed by real code
 * (see summaries/2026-06-14_Portfolio_Feature_AccessibilityPage_Report.md).
 * Sky owns this wording — it is a public claim in Sky's name.
 */
export function getAccessibilityStatement(): string {
  return `This site is built to be used by everyone — including people who navigate with a keyboard, a screen reader, or with motion turned down. This page is the honest record of that work: what I deliberately built in, and what I have not yet done. I would rather tell you exactly where it stands than claim a finish line I have not crossed.

## The standard I aim for

I build to **WCAG 2.2 Level AA**. To be clear about that word: this site has not been through a formal third-party audit, and nothing here is certified. AA is the bar I design and build against — not a badge I have been given. The specific choices below are real, and you can check them yourself.

## What I built in

**Keyboard, end to end.** A "Skip to main content" link is the first thing on the page — hidden until you focus it, then it jumps you past the navigation to the main region. Every control is reachable by keyboard, and the mobile menu is a proper dialog: it keeps focus inside while it is open, closes on Escape, and returns focus to the button that opened it.

**A focus ring you can actually see.** Move through the page by keyboard and the focused element gets a 2px terracotta outline that traces its own shape — pills stay pill-shaped, cards keep their corners. It clears the contrast WCAG asks of a focus indicator, in both the light and dark themes.

**Readable text in both themes.** Every text role — body, captions, links — meets WCAG AA contrast against its background, in light mode and dark mode alike.

**Real structure underneath.** The page is built from honest landmarks — navigation, main, footer — in a sensible reading order, with a heading hierarchy a screen reader can move through. Links that open a new tab say so.

**Motion that respects your settings.** If your system asks for reduced motion, this site listens. The entrance animations, the scroll-linked day-to-night background, the page transitions, the small parallax — all of it holds still and shows you the finished, readable state instead of moving. A site-wide rule backs this up, so nothing decorative can slip past it.

## What I have not done

In the spirit of being honest about what ships:

**No formal audit.** Conformance here is self-assessed against my own code — not certified by a third party, and not validated end to end with assistive technology across every browser and screen reader. I have not run a full manual screen-reader pass on this site. If you rely on one, I would genuinely like to hear how it goes.

**The moving background is decorative.** The day-to-night world that shifts as you scroll is marked as decorative and hidden from screen readers. It carries no information you would miss, and it holds still under reduced motion — but it is the one piece of visual flourish here, and I would rather name it than pretend the page is plain.

## Found a barrier? Tell me.

Accessibility barriers feel lonely when you face them alone. If something here got in your way — a control you could not reach, text you could not read, anything at all — I want to know. Tell me what broke and what you were trying to do. I read every message that comes through, and I will fix it.`;
}
