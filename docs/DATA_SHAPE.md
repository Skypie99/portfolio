# DATA_SHAPE.md — Portfolio Content Schema

**Project:** Sky's AI Portfolio Website
**Owner:** Dana (Backend Engineer)
**Cycle:** 2026-05-23 (Day-0, Wave 2)
**Authority:** Sky's intent > CONSTITUTION v1.3 > role files > skills
**Companion docs:** `FEATURES.md` (Quinn), `PROJECT_DESIGN.md` (Dani), `SCAFFOLDING_PLAN.md` (Shamus — in flight)
**Status:** Spec only. NO database, NO migrations, NO live data. Content is file-backed.

---

## 0. What this document is (and isn't)

This is the **single source of truth** for the shape of Sky's portfolio content. Shamus implements `lib/content-schema.ts`, content files, and loaders against this spec. Alex validates alt-text rules against it. Quinn grooms backlog items against it.

**Not in scope here:** runtime database, RLS, migrations, auth, user accounts. The portfolio is a static Next.js export — content is read from the filesystem at build time. Dana's normal toolkit (Supabase, SQL, RLS policies) is **deliberately unused** because the project has no live database and per role definition Dana never touches one anyway.

**Constitution constraints (v1.3) honored here:**
- **Art. 1:** No commits to `main`. This file lands on `cycle/auto-2026-05-23`.
- **Art. 5:** No external sends, no live DB calls, no migration application.
- **Art. 7:** Safety/privacy/accessibility pillars — alt-text is *required* on every image field (Alex enforces).
- **Art. 9:** Findings + escalations land in this file's "Decisions for Sky" section, not in Sky's inbox. Morgan picks them up.

---

## 1. File layout

All content lives under `/content/` at the repo root. Loaders live under `/lib/`. Images live under `/public/images/`.

```
/content/
  profile.json                       # single object — site owner identity
  certificates.json                  # flat JSON array — credential records
  deliverables/                      # one MDX file per deliverable (recommended)
    voice-coach-coaching-agent.mdx
    accessibility-pulse-audit.mdx
    prompt-library-tool.mdx
    ...
  deliverables-index.json            # OPTIONAL — generated at build, do not hand-edit

/public/images/
  deliverables/
    <slug>/
      hero.jpg
      gallery-01.jpg
      gallery-02.jpg
  certificates/
    <slug>/
      badge.png
  profile/
    portrait.jpg                     # used only if F-07 About page includes a portrait

/lib/
  content-schema.ts                  # Zod schemas (Shamus writes; this doc specs)
  content.ts                         # loader functions: getDeliverables(), getCertificates(), getProfile()
```

### MDX vs JSON-only for deliverables

Dana documents **both** options and **recommends MDX** for deliverables. JSON-only is acceptable if Sky prefers structured-only.

| Option | Pros | Cons |
| --- | --- | --- |
| **MDX (recommended)** — one `.mdx` per deliverable, structured frontmatter + free-form Markdown body | Richer detail page (case-study narrative, headings, lists, blockquotes, image captions inline); easier to write than escaping prose into JSON; body renders directly on F-05 detail; lets each deliverable evolve into a real write-up without schema changes | Adds MDX dependency (`@next/mdx` or `next-mdx-remote`); a touch more build wiring; frontmatter must still be schema-validated |
| **JSON-only** — single `/content/deliverables.json` array, all fields including a `longDescription` string field | Zero MDX dependency; entire content tree is a single file diff; trivial to load | Long-form prose in JSON is painful (no headings, no inline images, must escape quotes/newlines); detail page becomes a wall of text; future case-study expansion fights the format |

**Recommendation: MDX.** Quinn's F-05 spec explicitly allows for a richer detail page (image gallery, summary, role/tech metadata, primary external link, future longer write-ups). MDX matches that ambition without forcing a schema migration later. Certificates and profile stay JSON because they're flat metadata records with no narrative body.

For F-04 (the `/work` index), the loader reads each MDX file's frontmatter (no body parsing needed for the card grid) — fast at build time, and the body only loads when F-05 is requested.

---

## 2. Schemas (TypeScript-style interfaces)

Shamus will translate these into `lib/content-schema.ts` using Zod. The shapes below are the contract.

### 2.1 Deliverable

A single piece of AI work. Drives F-04 (Deliverables index) and F-05 (Deliverable detail).

```ts
type Deliverable = {
  // Identity
  id: string;                  // kebab-case slug; matches the filename (e.g. "voice-coach-coaching-agent")
                               // Used as the URL segment at /work/[slug]
                               // Must match /^[a-z0-9][a-z0-9-]*[a-z0-9]$/ and be unique across all deliverables

  // Card + detail header
  title: string;               // Cormorant serif display title, 4-80 chars
  summary: string;             // Plain-text summary; max 160 chars (one editorial sentence)
                               // Shown on F-04 cards (truncated if needed) and at top of F-05 right column

  // Metadata (DM Mono labels in UI)
  role: string;                // Sky's role on the project, e.g. "Designer & Builder", "Research Lead"
                               // 2-60 chars
  tech: string[];              // Primary tech/tools, e.g. ["Next.js", "OpenAI", "Tailwind"]
                               // 1-8 items; each 1-40 chars
  year: number;                // 4-digit year, e.g. 2026
                               // Must be 2015 <= year <= currentYear + 1

  // Imagery
  heroImage: {
    src: string;               // Path under /public, must start with "/images/deliverables/<id>/"
                               // e.g. "/images/deliverables/voice-coach-coaching-agent/hero.jpg"
    alt: string;               // REQUIRED non-empty alt text (Alex enforces; min 4 chars, max 200 chars)
                               // Editorial photography described meaningfully — not "image of X"
    width?: number;            // Optional intrinsic width in px (for next/image)
    height?: number;           // Optional intrinsic height in px (for next/image)
  };
  gallery?: Array<{            // Optional — additional editorial images for F-05 below-the-fold stack
    src: string;               // Same path rule as heroImage.src
    alt: string;               // REQUIRED non-empty alt text
    caption?: string;          // Optional inline caption (Cormorant italic in UI)
    width?: number;
    height?: number;
  }>;                          // Max 8 gallery images per deliverable (perf + scrollability)

  // External links (F-05 primary external link comes from here)
  links?: Array<{
    label: string;             // Visible link text, 2-30 chars
    href: string;              // Must be absolute https URL (validated)
    type: 'github' | 'demo' | 'writeup' | 'video' | 'other';
                               // Used for icon selection in UI
  }>;                          // 0-5 links; only one with type === 'demo' allowed (primary CTA)

  // Discovery
  tags: string[];              // 0-6 tags; each 2-30 chars; lowercase recommended
                               // Free-form for now (see Decision #3 below)

  // Sidebar feature
  featured: boolean;           // Exactly ONE deliverable across the whole corpus has featured: true.
                               // Drives F-02 sidebar "Featured" slot.
                               // Build-time validator enforces uniqueness (see §6).

  // Body (MDX only) — not a JSON field, the MDX body itself is the long-form content.
  // For JSON-only mode, replace with: longDescription?: string  (markdown-allowed string, max 8000 chars)
};
```

### 2.2 Certificate

A credential. Drives F-06 (Certificates section). Flat metadata — no narrative body, so JSON not MDX.

```ts
type Certificate = {
  // Identity
  id: string;                  // kebab-case slug; unique across all certificates
                               // e.g. "anthropic-claude-engineer-2025"

  // Display
  title: string;               // Cert title, e.g. "Claude Engineer Certification"
                               // 4-100 chars
  issuer: string;              // Issuing organization, e.g. "Anthropic"
                               // 2-80 chars

  // Dates (ISO 8601 — YYYY-MM-DD)
  issuedDate: string;          // ISO date, REQUIRED
                               // e.g. "2025-11-14"
  expiresDate?: string;        // Optional ISO date. If set, must be after issuedDate.
                               // See Decision #2 (Sky decides whether to surface expiry in UI)

  // External proof
  credentialUrl: string;       // Absolute https URL to verify the credential (REQUIRED)
                               // F-06 acceptance criteria require a "View credential" link

  // Imagery
  badgeImage: {
    src: string;               // Path under /public, must start with "/images/certificates/<id>/"
                               // e.g. "/images/certificates/anthropic-claude-engineer-2025/badge.png"
    alt: string;               // REQUIRED non-empty alt text
                               // Note Alex's warning in F-06: white-on-white risk on Cream/Blush; alt
                               // must describe the badge meaningfully so a screen reader caries weight
                               // even when the image fails contrast.
    width?: number;
    height?: number;
  };

  // Discovery
  tags: string[];              // 0-6 tags; see Decision #3
};
```

### 2.3 Profile

Single source of truth for Sky's identity. One JSON object, not an array. Used by F-02 sidebar wordmark, F-07 About, F-08 Contact, F-10 Footer.

```ts
type Profile = {
  // Identity
  name: string;                // Sky's full display name, e.g. "Sky Halisky"
                               // 2-60 chars
  wordmarkText: string;        // Text shown as the sidebar/footer wordmark; defaults to `name` if omitted.
                               // Allows a stylized form (e.g. "SKY HALISKY" in DM Mono small-caps)
                               // 2-60 chars

  // Voice
  tagline: string;             // One editorial sentence shown on home/about
                               // Set in Cormorant serif display
                               // Max 120 chars, no terminal punctuation enforced (Sky's call)

  // Place
  location: string;            // City/region, e.g. "Canada"
                               // 2-60 chars
                               // Kept intentionally vague (no street address — privacy pillar Art. 7)

  // Contact (F-08 mailto)
  contactEmail: string;        // Sky's public contact address; validated as RFC-5322-shaped
                               // Note: F-08 acceptance criteria require obfuscation in the rendered
                               // markup. This field holds the *canonical* address; the obfuscation
                               // happens in the component, not in the data.

  // Social links (F-10 footer + F-08 secondary links)
  socials: Array<{
    platform: 'github' | 'linkedin' | 'twitter' | 'mastodon' | 'bluesky' | 'other';
    handle: string;            // Display handle, e.g. "@skyhalisky" or "sky-halisky"
                               // 1-40 chars
    url: string;               // Absolute https URL to the profile (REQUIRED)
  }>;                          // 0-6 entries; Sky picks which to surface publicly (Sky to confirm
                               // pre-launch per F-10 dependencies).
};
```

---

## 3. Example entries

Placeholders — Sky replaces with real content. All examples are **valid against the schemas above** and reflect the ffern-aesthetic warm-editorial voice (no garish copy, no marketing exclamation).

### 3.1 `/content/profile.json`

```json
{
  "name": "Sky Halisky",
  "wordmarkText": "SKY HALISKY",
  "tagline": "Building careful AI work, one calm deliverable at a time.",
  "location": "Canada",
  "contactEmail": "skylerhalisky@gmail.com",
  "socials": [
    {
      "platform": "github",
      "handle": "@skypie99",
      "url": "https://github.com/skypie99"
    },
    {
      "platform": "linkedin",
      "handle": "sky-halisky",
      "url": "https://www.linkedin.com/in/sky-halisky/"
    }
  ]
}
```

### 3.2 `/content/certificates.json`

```json
[
  {
    "id": "anthropic-claude-engineer-2025",
    "title": "Claude Engineer Certification",
    "issuer": "Anthropic",
    "issuedDate": "2025-11-14",
    "credentialUrl": "https://anthropic.com/credentials/example-claude-engineer-2025",
    "badgeImage": {
      "src": "/images/certificates/anthropic-claude-engineer-2025/badge.png",
      "alt": "Anthropic Claude Engineer credential badge, warm-toned crest on cream background"
    },
    "tags": ["ai", "anthropic", "engineering"]
  },
  {
    "id": "deeplearning-ai-prompt-engineering-2024",
    "title": "Prompt Engineering for Developers",
    "issuer": "DeepLearning.AI",
    "issuedDate": "2024-08-02",
    "expiresDate": "2027-08-02",
    "credentialUrl": "https://www.coursera.org/account/accomplishments/example",
    "badgeImage": {
      "src": "/images/certificates/deeplearning-ai-prompt-engineering-2024/badge.png",
      "alt": "DeepLearning.AI Prompt Engineering completion certificate, sage-and-cream layout"
    },
    "tags": ["ai", "prompting", "coursera"]
  },
  {
    "id": "google-ux-design-2023",
    "title": "Google UX Design Certificate",
    "issuer": "Google",
    "issuedDate": "2023-04-19",
    "credentialUrl": "https://www.credly.com/badges/example-google-ux",
    "badgeImage": {
      "src": "/images/certificates/google-ux-design-2023/badge.png",
      "alt": "Google UX Design Professional Certificate, muted neutral palette"
    },
    "tags": ["ux", "design", "google"]
  }
]
```

### 3.3 `/content/deliverables/voice-coach-coaching-agent.mdx`

```mdx
---
id: voice-coach-coaching-agent
title: Voice Coach — Conversational Coaching Agent
summary: A quiet conversational agent that helps speakers rehearse, listen back, and notice the shapes of their own voice.
role: Designer & Builder
tech:
  - Next.js
  - OpenAI Realtime API
  - Tailwind
  - TypeScript
year: 2026
heroImage:
  src: /images/deliverables/voice-coach-coaching-agent/hero.jpg
  alt: A linen-textured desk with a single condenser microphone in soft window light, off-center to the left
gallery:
  - src: /images/deliverables/voice-coach-coaching-agent/gallery-01.jpg
    alt: Close-up of the agent transcript scrolling on a laptop screen, warm dusk light
    caption: The transcript view, paced to the rhythm of the user's speech.
  - src: /images/deliverables/voice-coach-coaching-agent/gallery-02.jpg
    alt: Quiet workspace with a notebook open beside the laptop, handwritten margin notes
links:
  - label: Try the demo
    href: https://voicecoach.example.com
    type: demo
  - label: Source on GitHub
    href: https://github.com/skypie99/voice-coach
    type: github
tags: ["agents", "voice", "realtime"]
featured: true
---

## Why this exists

Most coaching tools talk *at* the speaker. This one listens, waits, and asks one careful question at a time.

## What I designed

The agent's turn-taking is intentionally slow — it leaves a beat of silence before responding,
which is what experienced human coaches do. That single design choice changed the whole feel of the product.

## What I'd do differently

The first version tried to give live feedback mid-sentence. It felt like being interrupted.
Moving feedback to the end of each user turn was the unlock.
```

### 3.4 `/content/deliverables/accessibility-pulse-audit.mdx`

```mdx
---
id: accessibility-pulse-audit
title: Accessibility Pulse — Automated WCAG Audit Pipeline
summary: A lightweight pipeline that runs an opinionated WCAG 2.2 AA audit across every PR and posts the diff inline.
role: Research Lead & Builder
tech:
  - GitHub Actions
  - Playwright
  - axe-core
  - TypeScript
year: 2026
heroImage:
  src: /images/deliverables/accessibility-pulse-audit/hero.jpg
  alt: A printout of a WCAG checklist on a sage-painted desk, marked in soft pencil
links:
  - label: Read the writeup
    href: https://example.com/accessibility-pulse-writeup
    type: writeup
tags: ["accessibility", "ci", "wcag"]
featured: false
---

## The problem

Accessibility regressions slip into PRs the same way visual regressions do — silently, then all at once.

## What this is

A CI step that runs axe-core against every changed route, produces a diff against `main`, and
posts the new findings inline as a PR comment. It refuses to fail the build for pre-existing
issues — only *new* regressions block.
```

(Two examples shown for deliverables — Shamus seeds a third placeholder in the scaffolding so F-04 has a 3-card grid for visual review.)

---

## 4. Asset path conventions

These rules are **enforced by the Zod schema** (rejected at build time if violated).

| Rule | Pattern | Why |
| --- | --- | --- |
| Deliverable images | `/images/deliverables/<id>/...` | Co-locates assets with their content; one folder per deliverable keeps the public/ tree scannable |
| Certificate images | `/images/certificates/<id>/...` | Same convention; one folder per cert |
| Profile portrait | `/images/profile/portrait.jpg` (only if used) | Single profile, single folder |
| Path format | Starts with `/`, no leading `./` or `../`; lowercased | Next.js public path convention; case-sensitive on Linux build hosts |
| File extensions | `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` only | Image-only; SVG handled separately (see below) |
| Alt text | REQUIRED, non-empty, 4-200 chars, **never** matches `/^image of/i` or `/^picture of/i` | Alex's accessibility rule — meaningful description, not redundant prefix |
| SVG logos / wordmarks | Live in `/public/svg/` and are imported as React components, NOT referenced via these schemas | Different lifecycle (design system, not content) |

**Decorative images:** if any image is genuinely decorative (rare for an editorial portfolio), it must use `alt: ""` AND the field must additionally be marked `decorative: true` (this field doesn't exist in v1 — every image needs real alt text per F-04 and F-05 acceptance criteria). If/when needed, add a `decorative: boolean` flag and let it be the ONLY way to allow empty alt.

---

## 5. Build-time validation (Zod)

Shamus implements `/lib/content-schema.ts` with Zod schemas matching §2 above. The loader (`/lib/content.ts`) parses every content file through its schema at build time. **A schema failure fails the build.** This is non-negotiable — the validator is the only thing standing between a content typo and a broken production page.

### Recommended Zod shape (sketch — Shamus owns the real file)

```ts
// /lib/content-schema.ts  (SHAMUS will write; Dana specs)
import { z } from 'zod';

const SlugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'must be kebab-case slug');

const AltTextSchema = z.string()
  .min(4, 'alt text must be at least 4 chars')
  .max(200, 'alt text must be at most 200 chars')
  .refine(s => !/^(image|picture|photo)\s+of\b/i.test(s),
    'alt text must not start with "image of" / "picture of" / "photo of"');

const ImageSchema = z.object({
  src: z.string().startsWith('/images/'),
  alt: AltTextSchema,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const DeliverableSchema = z.object({
  id: SlugSchema,
  title: z.string().min(4).max(80),
  summary: z.string().min(10).max(160),
  role: z.string().min(2).max(60),
  tech: z.array(z.string().min(1).max(40)).min(1).max(8),
  year: z.number().int().min(2015).max(new Date().getFullYear() + 1),
  heroImage: ImageSchema.refine(
    img => /^\/images\/deliverables\/[a-z0-9-]+\//.test(img.src),
    'heroImage.src must live under /images/deliverables/<slug>/'
  ),
  gallery: z.array(ImageSchema.extend({ caption: z.string().max(160).optional() }))
    .max(8).optional(),
  links: z.array(z.object({
    label: z.string().min(2).max(30),
    href: z.string().url().startsWith('https://'),
    type: z.enum(['github', 'demo', 'writeup', 'video', 'other']),
  })).max(5).optional()
    .refine(arr => !arr || arr.filter(l => l.type === 'demo').length <= 1,
      'only one link of type "demo" allowed'),
  tags: z.array(z.string().min(2).max(30)).max(6),
  featured: z.boolean(),
});

export const CertificateSchema = z.object({
  id: SlugSchema,
  title: z.string().min(4).max(100),
  issuer: z.string().min(2).max(80),
  issuedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expiresDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  credentialUrl: z.string().url().startsWith('https://'),
  badgeImage: ImageSchema.refine(
    img => /^\/images\/certificates\/[a-z0-9-]+\//.test(img.src),
    'badgeImage.src must live under /images/certificates/<slug>/'
  ),
  tags: z.array(z.string().min(2).max(30)).max(6),
}).refine(
  c => !c.expiresDate || c.expiresDate > c.issuedDate,
  'expiresDate must be after issuedDate'
);

export const ProfileSchema = z.object({
  name: z.string().min(2).max(60),
  wordmarkText: z.string().min(2).max(60),
  tagline: z.string().min(1).max(120),
  location: z.string().min(2).max(60),
  contactEmail: z.string().email(),
  socials: z.array(z.object({
    platform: z.enum(['github', 'linkedin', 'twitter', 'mastodon', 'bluesky', 'other']),
    handle: z.string().min(1).max(40),
    url: z.string().url().startsWith('https://'),
  })).max(6),
});
```

**Important:** Dana does NOT write this file in this cycle (per "Output" constraint — docs only, no actual schema/zod/seed files). Shamus owns it. The sketch above is the contract.

---

## 6. Featured-slot integrity rule

This is the rule the build-time validator enforces *across* all deliverables, not just within one.

> **Exactly one deliverable in `/content/deliverables/` has `featured: true`.**
> - **If two or more are `true`:** build fails with a clear message listing the offenders, "Multiple featured deliverables: [voice-coach..., accessibility-pulse...]. Set featured: false on all but one."
> - **If zero are `true`:** build does NOT fail, but the F-02 sidebar "Featured" slot **falls back to a generic "Latest Work →" link** pointing to `/work`. This keeps the sidebar from rendering empty if Sky temporarily un-features everything.

Validation pseudocode:

```ts
// /lib/content.ts
function validateFeaturedInvariant(items: Deliverable[]) {
  const featured = items.filter(d => d.featured);
  if (featured.length > 1) {
    throw new Error(
      `Featured-slot invariant violated: ${featured.length} deliverables have featured: true ` +
      `(${featured.map(d => d.id).join(', ')}). Exactly one is allowed.`
    );
  }
  // Zero featured is allowed — sidebar falls back to "Latest Work →".
}
```

Why this matters: F-02's sidebar is the editorial frame of the entire site. A broken or empty Featured slot is more noticeable than any other content bug. The invariant ensures it can never silently render two things or render nothing-but-still-look-broken.

---

## 7. Decisions for Sky

These three need Sky's call. Morgan picks them up for the cycle briefing (per Constitution Art. 9 — Dana does not message Sky directly).

### Decision #1 — MDX vs JSON-only for deliverables
- **Recommendation:** MDX (one `.mdx` per deliverable, frontmatter + body).
- **Why:** F-05 detail pages benefit from real long-form narrative (case-study voice, headings, inline images, blockquotes). MDX gives that without forcing a future schema migration. Certs and profile stay JSON because they're flat metadata.
- **Cost if Sky says yes:** Shamus adds `@next/mdx` (or `next-mdx-remote`) to the Next.js build. Small dependency, well-supported.
- **Cost if Sky says no:** Replace the MDX body with a `longDescription` string field (markdown-allowed, max 8000 chars). Detail pages render that string through a markdown renderer instead. Slightly worse authoring experience; same final UI.

### Decision #2 — Surface certificate `expiresDate` in the UI?
- **Option A (default in this spec):** Store `expiresDate` in the schema (optional) but **do not render it** in F-06. Reasoning: most viewers don't care, and a future-dated "Expires 2027" can read as either reassuring or as a tick of unfreshness. Storing it lets us add UI later without re-migrating data.
- **Option B:** Render "Issued YYYY · Expires YYYY" on every cert that has expiry. More transparent; some certs (e.g. cloud certs) genuinely lapse and viewers may want to know.
- **Quinn's F-06 spec is silent on this — Sky picks.**

### Decision #3 — `tags`: controlled vocabulary or free-form?
- **Option A (default in this spec):** **Free-form** — Sky writes whatever tags they want. Simplest, fastest, no governance.
- **Option B:** **Controlled vocabulary** — Quinn maintains a small list (e.g., `ai`, `agents`, `voice`, `accessibility`, `design`, `ci`, `research`) and the Zod schema rejects anything outside it. Tighter editorial consistency; small governance cost; lets us add a tag-filter UI later (currently out of scope per F-04).
- **Recommendation:** Free-form for v1 (Option A). Revisit only if/when a tag-filter UI is groomed into the backlog. Until then, tags don't drive any filtering, only optional visual labels.

### Decision #4 (carried forward from Quinn) — Which deliverable is `featured: true` at launch?
- Not Dana's call. Surfaced in Quinn's FEATURES.md DECISIONS #4. Listed here so Shamus and Sky know the schema *expects* exactly one. Until Sky decides, the placeholder content in §3.3 sets `voice-coach-coaching-agent` as featured purely to exercise the F-02 sidebar during scaffolding.

---

## 8. What Dana did NOT do (and won't, this cycle)

Per the orchestrator Output constraint and the Dana role definition:

- No migration files (there is no database to migrate).
- No `lib/content-schema.ts` Zod file (Shamus writes it from this spec).
- No `lib/content.ts` loader code.
- No example content files actually placed in `/content/` (Shamus seeds those during F-04 scaffolding using §3 as the template).
- No live database touch (none exists, and Dana wouldn't touch one if it did).
- No commits to `main`, no external sends.

If any of those scope items become needed mid-cycle, Dana stops and escalates to Morgan rather than self-expanding.

---

*Dana, 2026-05-23 — Day-0 spec v1. Re-groom alongside Quinn's next FEATURES.md pass once Sky ratifies Decisions #1 and #3.*
