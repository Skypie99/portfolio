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

/**
 * ShotImageSchema — product screenshots for the cinematic ProductReveal
 * (Show-the-work 2026-06-04). `src` is OPTIONAL: when absent the component
 * renders the golden-hour placeholder and emits NO <img>; when present it drops
 * a real screenshot into the same reserved frame with zero layout shift. `alt`
 * is REQUIRED even for placeholders so the description is ready the moment a
 * real `src` is added — that's the one-line swap. A present `src` (and the
 * optional `avif`/`webp` responsive siblings) must live under
 * /images/deliverables/<slug>/, the same rule as heroImage.
 */
/** Optional proof VIDEO (P2-A, Sky's motion extension). A short, silent screen
 *  loop. The shipped <video> is poster-first + muted + playsInline with a play
 *  affordance; autoplay is JS-opt-in ONLY when prefers-reduced-motion is unset
 *  (gated in ProductReveal). `poster` + `alt` are REQUIRED so meaning never
 *  depends on motion; `captions` (a .vtt) is optional but wired when present. */
const ProofVideoSchema = z.object({
  mp4: z.string().startsWith('/images/').optional(),
  webm: z.string().startsWith('/images/').optional(),
  poster: z.string().startsWith('/images/'),
  captions: z.string().startsWith('/images/').optional(),
  alt: AltTextSchema,
});

const ShotImageSchema = z
  .object({
    src: z.string().startsWith('/images/').optional(),
    alt: AltTextSchema,
    caption: z.string().max(160).optional(),
    /** CSS object-position for the full-bleed card/shot crop (e.g. "50% 44%").
     *  Lets a tall screenshot be framed on its key content. Ignored by the
     *  device-framed hero, which shows the whole screen (object-contain). */
    focal: z.string().max(24).optional(),
    avif: z.string().startsWith('/images/').optional(),
    webp: z.string().startsWith('/images/').optional(),
    /** Inline LQIP blur placeholder — a base64 data-URI (from encode-proof.mjs).
     *  Painted behind the image inside the reserved-aspect well; the real image
     *  covers it on decode. Zero request, zero CLS, RM-safe (no animation). */
    lqip: z.string().startsWith('data:image/').optional(),
    /** Optional proof video (short silent loop) — see ProofVideoSchema. */
    video: ProofVideoSchema.optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  })
  .refine(
    (img) =>
      [
        img.src,
        img.avif,
        img.webp,
        img.video?.mp4,
        img.video?.webm,
        img.video?.poster,
        img.video?.captions,
      ].every((s) => !s || /^\/images\/deliverables\/[a-z0-9-]+\//.test(s)),
    'shot src/avif/webp + video paths, when present, must live under /images/deliverables/<slug>/',
  );

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
  /** Optional real hero screenshot (Show-the-work 2026-06-04). Absent — or with
   *  no `src` — => the golden-hour placeholder renders in the device frame. The
   *  one-line swap to "show" the product: add this with a real `src` + `alt`. */
  heroShot: ShotImageSchema.optional(),
  /** Optional PRE-CROPPED image for the work-card FRONT (distinct from the
   *  hero/page image). When present, the cards show this exactly (static cover,
   *  no re-zoom); otherwise they fall back to the hero image, focal-cropped. Let
   *  a tall phone hero stay whole while the card shows a wide, framed crop. */
  cardImage: ShotImageSchema.optional(),
  /** Optional 2–3 in-body product shots. Each renders a beautiful placeholder
   *  until its `src` is filled in (drop-in, no layout shift). */
  shots: z.array(ShotImageSchema).max(3).optional(),
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
  body: z.string().min(10).optional(),
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

/**
 * BlogPostSchema — content/blog.json entries.
 *
 * Design: id is the URL slug, content is raw markdown (rendered at page level),
 * draft posts are excluded from all listings and static params at build time.
 * readingTimeMinutes is manually curated (not calculated) for accuracy.
 */
export const BlogPostSchema = z.object({
  id: SlugSchema,
  title: z.string().min(4).max(120),
  summary: z.string().min(10).max(200),
  publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be ISO date YYYY-MM-DD'),
  tags: z.array(z.string().min(2).max(30)).max(6),
  readingTimeMinutes: z.number().int().positive().max(60),
  content: z.string().min(1),
  draft: z.boolean().optional(),
});

export type Deliverable = z.infer<typeof DeliverableSchema>;
export type Certificate = z.infer<typeof CertificateSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;
