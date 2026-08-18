# CLOSE-OUT — THE FLAGSTONE RENAME, WEBSITE SIDE
**2026-08-17 · branch `rename/flagstone-site-2026-08-17`, commit `d07c42f` · `main` untouched · nothing pushed.**

The portfolio now reads **Flagstone** everywhere a visitor can see it. The URL, the asset paths and the identifiers still say `accessmap` on purpose — that is a separate job with redirects, specced in `SLUG-MIGRATION-PROMPT.md` next to this file.

## 1 · What moved, because a person reads it

| Surface | File |
|---|---|
| Deliverable title, every alt text + video description | `content/deliverables.json` |
| 13 showcase alt texts | `content/showcase.manifest.json` |
| Blog post title, hero alt, body prose | `content/blog.json` |
| Homepage chip label · home meta description | `app/page.tsx` |
| Site meta description · JSON-LD description | `app/layout.tsx` |
| About page line ("Flagstone exists because…") | `app/about/page.tsx` |
| Colophon signature-hue sentence | `lib/content.ts` |
| Case-study source doc (not rendered anywhere) | `content/case-studies.md` |
| Showcase **generators**, so the next capture run can't regenerate the old name | `scripts/showcase/registry.mjs`, `wiring.mjs` |
| 52 test fixtures + **13 accessible-name regexes** | 14 test files |

## 2 · What deliberately did NOT move

The same identifier/name split the app-side rename made:

- `/work/accessmap/`, the `accessmap` slug, and every id, category union and signature key that keys off it
- every `/images/deliverables/accessmap/` and `/showcase/accessmap/` path
- **`https://github.com/Skypie99/AccessMap`** — the repo kept its name, so the link must too
- **`https://accessmap.skypistudio.com`** — the live host, pinned deliberately app-side (redirect URLs + the `accessmap://` scheme)
- `/Users/skypie/AccessMap`, storage keys, and the `AccessMapTestReceipt` symbol

## 3 · The gates

typecheck **0** · build **0** · **65 files / 643 passed / 1 skipped / 1 todo / 0 failed**

Built-HTML check: every remaining `AccessMap` in `out/` is inside the GitHub repo URL. Rendered page text, `<title>` tags and meta descriptions: **0 occurrences**. `/work/accessmap/` now titles as "Flagstone — Sky Halisky"; the blog post as "Building Flagstone — A Lesson in Shipping Something That Matters".

Lucky break worth recording: **"Flagstone" and "AccessMap" are both 9 characters**, so no headline re-wrapping and the `markdown.ts` NBSP dash-binding behaves identically.

## 4 · ⚑ READ THIS BEFORE YOU MERGE — the screenshots still say AccessMap

Alt text cannot fix a picture. These assets are captures of an app build whose own rename has not merged yet, and the wordmark is legible in them:

- `public/showcase/accessmap/drawer-open.light.phone.{webp,avif}` and the `.dark` pair
- `public/showcase/accessmap/clips/drawer-spring.{light,dark}.phone.{mp4,webm}` + posters

They render as the first in-body shot on `/work/accessmap/`. Everything else was checked and is clean: the OG card, the map overview, Tasks, report-composed and the blog hero carry no wordmark.

**Three ways to close it, your call:**
1. Ship the copy now and re-capture after the app-side rename merges (its BQ-1). Cheapest; leaves a visible mismatch for one visitor-facing shot in the meantime.
2. Drop that one shot from `deliverables.json` until it is re-captured. One small edit, no mismatch, one fewer screenshot.
3. Hold this whole branch until the app rename lands and the capture factory reruns.

## 5 · Also worth knowing

- The **"GitHub" link** on the case study still points at a repo named AccessMap. Normal for a renamed product, and the close-out for the app rename chose to keep the repo name — but a visitor does see it.
- The **"Live map" link** opens `accessmap.skypistudio.com`, where the deployed web build still brands itself AccessMap for the same reason.
- `content/case-studies.md` is not imported by any code. Updated for consistency; it renders nowhere.
