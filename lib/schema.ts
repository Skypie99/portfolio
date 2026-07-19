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
  /** Optional "museum plate" beneath the hero well (FT-3/FT-10) — the artifact's
   *  own ledger line at reading size, plus the place it was mapped. Data-gated:
   *  renders only where present (accessmap today). Mono-meta furniture, never
   *  quotation-styled (one pull-quote per essay holds). */
  heroPlate: z
    .object({
      severity: z.string().min(2).max(60),
      caption: z.string().min(2).max(160),
      provenance: z.string().min(2).max(80),
    })
    .optional(),
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
    // C-02: optional AVIF/WebP siblings so the hand-drawn badges ship through the
    // same optimized <picture> pipeline as blog figures (BlogFigureSchema). The PNG
    // stays the universal <img> fallback; modern engines fetch the ~5 KB AVIF. Zod
    // strips undeclared keys, so these MUST be declared or the JSON values vanish.
    badgeImage: ImageSchema.extend({
      avif: z.string().startsWith('/images/').optional(),
      webp: z.string().startsWith('/images/').optional(),
    }).refine(
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
/**
 * BlogFigureSchema (L3-06 / S12) — one optional product figure for a post. Reuses
 * ImageSchema's `/images/` + alt rules; the AVIF/WebP siblings + LQIP let the
 * figure ship through the same optimized <picture> pipeline as the rest of the
 * site (its reserved-aspect well keeps CLS at 0). `afterHeading` is the `## …`
 * heading id after which the figure is spliced, so a real screen lands where the
 * essay describes it.
 */
const BlogFigureSchema = ImageSchema.extend({
  avif: z.string().startsWith('/images/').optional(),
  webp: z.string().startsWith('/images/').optional(),
  lqip: z.string().optional(),
  caption: z.string().max(160).optional(),
  afterHeading: z.string().min(2).max(80).optional(),
});

export const BlogPostSchema = z.object({
  id: SlugSchema,
  title: z.string().min(4).max(120),
  summary: z.string().min(10).max(200),
  publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be ISO date YYYY-MM-DD'),
  tags: z.array(z.string().min(2).max(30)).max(6),
  readingTimeMinutes: z.number().int().positive().max(60),
  content: z.string().min(1),
  draft: z.boolean().optional(),
  /** L3-06 / S12: one optional product figure, spliced at its `afterHeading` seam. */
  figure: BlogFigureSchema.optional(),
  /** L3-06 / S12: the case-study slug this post hands off to at its close (no dead end). */
  relatedDeliverable: SlugSchema.optional(),
});

/**
 * A11yReceiptsSchema — content/a11y-receipts.json (S6 / L6-02 enhancement).
 *
 * The /accessibility/ receipts strip publishes MEASURED numbers from a real
 * verification run — never aspirational claims. `measuredDate` is the ISO date
 * of the run; `evidencePath` points at the static, re-runnable snapshot under
 * public/receipts/. Exactly six receipts close the 3×2 grid (no bare cell).
 * Values are short display strings ("0", "AA", "100%"), rendered through
 * CountUpStat, whose sr-only span carries the stable accessible name.
 */
export const A11yReceiptsSchema = z.object({
  measuredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be ISO date YYYY-MM-DD'),
  evidencePath: z
    .string()
    .startsWith('/receipts/', 'evidence must ship under public/receipts/')
    .endsWith('.json'),
  method: z.array(z.string().min(2).max(90)).min(1).max(8),
  receipts: z
    .array(
      z.object({
        value: z.string().min(1).max(12),
        label: z.string().min(2).max(40),
        sub: z.string().min(2).max(90),
      }),
    )
    .length(6),
});

/** Calibration record (R4/BP7 · P02) — the colophon's round ledger, in the
 *  receipts pattern: small dated JSON, validated at build (a bad row FAILS
 *  the build), APPEND-ONLY by convention — future rounds add a row, never
 *  edit a closed one. One close-date semantic per row: every count/gate a
 *  row carries is that round's OWN close-state (the pitch's CRIT amendment).
 *  At most ONE open round (no `closed` date) — rendered as the terracotta
 *  "open" dot. All strings are Sky-editable data (DECISIONS §S delegation). */
export const RoundSchema = z
  .object({
    numeral: z.string().regex(/^[IVX]{1,4}$/),
    title: z.string().min(2).max(24),
    closed: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    counts: z.array(z.string().min(3).max(64)).min(1).max(4),
  })
  .strict();

export const RoundsSchema = z
  .array(RoundSchema)
  .min(1)
  .refine((rows) => rows.filter((r) => !r.closed).length <= 1, {
    message: 'at most one round may be open (missing `closed`)',
  });

export type Deliverable = z.infer<typeof DeliverableSchema>;
export type Round = z.infer<typeof RoundSchema>;
export type Certificate = z.infer<typeof CertificateSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type A11yReceipts = z.infer<typeof A11yReceiptsSchema>;
