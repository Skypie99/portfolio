# content/

The site is built from these JSON files. Every read goes through `lib/content.ts`, which parses each file with its Zod schema in `lib/schema.ts` at build time. A violation **fails the build**, naming the file, the entry, and the failing fields, so a broken edit cannot deploy (CI gates the deploy).

| File | Drives |
|---|---|
| `deliverables.json` | The five projects: the homepage project index, `/work/`, one case study per entry at `/work/<id>/`, the sidebar's featured project, the sitemap, and share cards. Array order is display order. |
| `profile.json` | Name, wordmark, tagline, location, contact email, and socials used across the layout, sidebar, footer, pages, and feeds. |
| `certificates.json` | `/certificates/` and the homepage credentials. |
| `blog.json` | `/blog/`, each `/blog/<id>/`, `/feed.xml`, `/feed.json`, and the sitemap. |
| `rounds.json` | The calibration record on the homepage and `/colophon/`. Append-only: close a round, never rewrite one. |
| `a11y-receipts.json` | The dated accessibility measurements shown on the homepage and `/accessibility/`. |
| `showcase.manifest.json` | **Generated** by `scripts/capture-showcase.mjs`: the capture record (project SHA, date, hashes, budgets). Not read at runtime. Don't hand-edit it. |

The long-form `/colophon/` and `/accessibility/` statements are authored in `lib/content.ts`, not here.

## Rules the build enforces

- **At most one** deliverable may have `featured: true`.
- Every deliverable needs a `status` line (4 to 48 characters). It is Sky's protected wording, and the recruiter-copy truth guards in `lib/__tests__/` check what it may and may not claim.
- `heroImage.src` must live under `/images/deliverables/<slug>/`; badge images under `/images/certificates/<slug>/`. Product media (`heroShot`, `cardImage`, `shots`) may also live under `/showcase/<slug>/`.
- Alt text is 4 to 200 characters and never starts with "image of", "picture of", or "photo of".
- `scripts/validate-assets.mjs` (the `prebuild` step) fails the build if a certificate badge, a deliverable's declared proof file (AVIF, WebP, or video), a blog figure, or a cinematic plane is missing from `public/`.

## Where assets live

- `public/images/deliverables/<slug>/` and `public/images/certificates/<slug>/`: curated images, often with AVIF and WebP siblings.
- `public/showcase/<slug>/`: product captures made by the capture factory ([`docs/showcase-factory.md`](../docs/showcase-factory.md)).
- Raw masters are never shipped: `proof-masters/` for proof media, and the factory's bank under `design-reviews/showcase-refresh/masters/` (gitignored).

## Changing content safely

1. Edit the JSON. For product media, prefer the pipeline over hand-editing paths: encode with `scripts/encode-proof.mjs`, or re-capture and run `scripts/wire-showcase.mjs`, which validates against the schema as it writes.
2. Run `npm run typecheck && npm run build && npm test`. The build validates content and assets; the post-build tests check links, images, share cards, and public-copy truth.
3. Claims about a project (release status, users, data) must follow [`docs/IDENTITY_AND_CLAIM_CONTRACT.md`](../docs/IDENTITY_AND_CLAIM_CONTRACT.md).
