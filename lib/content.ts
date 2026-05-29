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
