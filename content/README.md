# content/

This directory holds the portfolio content. Edit the JSON files to update what shows on the site.

- `profile.json` — single profile object (name, tagline, location, contact, socials)
- `deliverables.json` — array of AI deliverables (cards on the homepage + future `/work` page)
- `certificates.json` — array of credentials

Drop deliverable images in `/public/images/deliverables/<slug>/hero.jpg` and certificate badges in `/public/images/certificates/<slug>/badge.png`. The current files reference placeholder paths — Sky needs to drop the real assets in before launch.

The build will **fail loudly** if a content file violates the Zod schema in `lib/schema.ts` — that's Dana's design (DATA_SHAPE.md §5). The featured-slot invariant (exactly 0 or 1 deliverable with `featured: true`) is also enforced at build time.
