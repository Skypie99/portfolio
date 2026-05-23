import { z } from 'zod';

/**
 * Zod schemas mirror Dana's DATA_SHAPE.md §2 verbatim.
 * Every content file is parsed through these at build time — a violation
 * fails the build, which is exactly the contract Dana's §5 requires.
 *
 * Alt-text rule (Alex §4.1 + Dana §4): must be 4-200 chars and MUST NOT
 * start with "image of" / "picture of" / "photo of".
 */

const SlugSchema = z
  .string()
  .regex(
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
    'must be kebab-case slug (lowercase + hyphens, no leading/trailing hyphen)',
  );

const AltTextSchema = z
  .string()
  .min(4, 'alt text must be at least 4 characters')
  .max(200, 'alt text must be at most 200 characters')
  .refine(
    (s) => !/^(image|picture|photo)\s+of\b/i.test(s),
    'alt text must not start with "image of" / "picture of" / "photo of"',
  );

const ImageSchema = z.object({
  src: z.string().startsWith('/images/'),
  alt: AltTextSchema,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const GalleryImageSchema = ImageSchema.extend({
  caption: z.string().max(160).optional(),
});

export const DeliverableSchema = z.object({
  id: SlugSchema,
  title: z.string().min(4).max(80),
  summary: z.string().min(10).max(160),
  role: z.string().min(2).max(60),
  tech: z.array(z.string().min(1).max(40)).min(1).max(8),
  year: z
    .number()
    .int()
    .min(2015)
    .max(new Date().getFullYear() + 1),
  heroImage: ImageSchema.refine(
    (img) => /^\/images\/deliverables\/[a-z0-9-]+\//.test(img.src),
    'heroImage.src must live under /images/deliverables/<slug>/',
  ),
  gallery: z.array(GalleryImageSchema).max(8).optional(),
  links: z
    .array(
      z.object({
        label: z.string().min(2).max(30),
        href: z.string().url().startsWith('https://'),
        type: z.enum(['github', 'demo', 'writeup', 'video', 'other']),
      }),
    )
    .max(5)
    .optional()
    .refine(
      (arr) => !arr || arr.filter((l) => l.type === 'demo').length <= 1,
      'only one link of type "demo" allowed per deliverable',
    ),
  tags: z.array(z.string().min(2).max(30)).max(6),
  featured: z.boolean(),
});

export const CertificateSchema = z
  .object({
    id: SlugSchema,
    title: z.string().min(4).max(100),
    issuer: z.string().min(2).max(80),
    issuedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be ISO date YYYY-MM-DD'),
    expiresDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be ISO date YYYY-MM-DD')
      .optional(),
    credentialUrl: z.string().url().startsWith('https://'),
    badgeImage: ImageSchema.refine(
      (img) => /^\/images\/certificates\/[a-z0-9-]+\//.test(img.src),
      'badgeImage.src must live under /images/certificates/<slug>/',
    ),
    tags: z.array(z.string().min(2).max(30)).max(6),
  })
  .refine(
    (c) => !c.expiresDate || c.expiresDate > c.issuedDate,
    'expiresDate must be after issuedDate',
  );

export const ProfileSchema = z.object({
  name: z.string().min(2).max(60),
  wordmarkText: z.string().min(2).max(60),
  tagline: z.string().min(1).max(120),
  location: z.string().min(2).max(60),
  contactEmail: z.string().email(),
  socials: z
    .array(
      z.object({
        platform: z.enum([
          'github',
          'linkedin',
          'twitter',
          'mastodon',
          'bluesky',
          'other',
        ]),
        handle: z.string().min(1).max(40),
        url: z.string().url().startsWith('https://'),
      }),
    )
    .max(6),
});

export type Deliverable = z.infer<typeof DeliverableSchema>;
export type Certificate = z.infer<typeof CertificateSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
