# Portfolio — GitHub Links Cowork Prompt

Paste everything below this line into Cowork. Fill in the 4 GitHub URLs first.

---

You are working on a portfolio site at `~/Portfolio/` on branch `feature/single-scroll-2026-05-24`.

The site is a Next.js 15 static export with a single-scroll homepage showing 4 projects: AccessMap, Claude Corp, Prompt Library, and Mutual Mesh. All pages build, lint, typecheck, and test clean (40/40 tests).

Your only job is to add a GitHub link to each project card on the homepage.

## The 4 GitHub URLs (fill these in before sending)

- AccessMap:      https://github.com/___________
- Claude Corp:    https://github.com/___________
- Prompt Library: https://github.com/___________
- Mutual Mesh:    https://github.com/___________

## Step 1 — Update content/deliverables.json

Add a `links` array to each of the 4 deliverable objects. The schema already supports this field. Example for AccessMap:

```json
{
  "id": "accessmap",
  "title": "AccessMap",
  ...existing fields...,
  "links": [
    { "label": "GitHub", "href": "https://github.com/YOUR_URL_HERE", "type": "github" }
  ]
}
```

Do this for all 4 deliverables using the URLs above.

## Step 2 — Update app/page.tsx

In the Work section, each project article ends with a "Read more →" link (around line 100). Directly after it, add:

```tsx
{d.links?.find((l) => l.type === 'github') && (
  <a
    href={d.links.find((l) => l.type === 'github')!.href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`View ${d.title} source on GitHub`}
    className="mt-1 inline-flex items-center gap-1 font-mono text-meta tracking-label uppercase text-text-meta transition-transform duration-fast ease-out hover:translate-x-1 focus-visible:translate-x-1"
  >
    GitHub
    <span aria-hidden="true">{'→'}</span>
  </a>
)}
```

## Step 3 — Run all gates

```bash
cd ~/Portfolio
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

All must pass: 0 errors, 0 warnings, 40/40 tests, clean build.

## Step 4 — Commit

```bash
git add content/deliverables.json app/page.tsx
git commit -m "feat: wire GitHub links into project cards"
```

Do NOT merge to main. Do NOT push. Sky merges manually.
