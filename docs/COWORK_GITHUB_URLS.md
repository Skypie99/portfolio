# Cowork Prompt — Add GitHub Links to Portfolio

Paste everything between the dashed lines into a Cowork session.
Fill in the four GitHub URLs before sending.

---

You are working on the portfolio site at ~/Portfolio/ on branch `feature/single-scroll-2026-05-24`.

The homepage is already a single scrollable page with 4 projects: Flagstone, Claude Corp, Prompt Library, Mutual Mesh.

Your job is to wire real GitHub repository links into the project cards. Here are the URLs (Sky fills these in):

- Flagstone:      https://github.com/___________
- Claude Corp:    https://github.com/___________
- Prompt Library: https://github.com/___________
- Mutual Mesh:    https://github.com/___________

## Steps

1. Open `content/deliverables.json`. Add a `links` array to each of the 4 deliverables using the URLs above. Each entry uses this shape (already supported by the schema):

```json
"links": [
  { "label": "GitHub", "href": "https://github.com/...", "type": "github" }
]
```

2. Open `app/page.tsx`. In the Work section, each project article already has a "Read more →" link. Below it, add a "GitHub →" link that renders when the deliverable has a github-type link. Use these exact classes to match the existing style:

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

3. Run all gates — they must all pass before committing:

```bash
cd ~/Portfolio
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
npm test -- --run   # 40/40
npm run build       # 0 errors
```

4. Commit on the existing branch with a message like:
   `feat: wire GitHub links into project cards`

5. Do NOT merge to main and do NOT push. Sky merges manually.

---
