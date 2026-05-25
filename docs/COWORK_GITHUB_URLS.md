# Cowork Prompt — Wire GitHub URLs into Portfolio

Paste the block below into a Cowork session when you're ready to add real GitHub
links to the project cards. Have the 4 repo URLs handy before you start.

---

## Prompt to paste

```
I have a Next.js portfolio site at ~/Portfolio/ on branch feature/single-scroll-2026-05-24.
I want to add real GitHub repository links to the 4 project deliverables.

Here are the GitHub URLs (fill these in before sending):
- AccessMap:       <GitHub URL>
- Claude Corp:     <GitHub URL>
- Prompt Library:  <GitHub URL>
- Mutual Mesh:     <GitHub URL>

The deliverable schema already supports a `links` array. Each link has:
  { label: string, href: string (https://), type: "github" | "demo" | ... }

Tasks:
1. Open content/deliverables.json
2. Add a `links` array to each of the 4 deliverables with type "github" and the
   corresponding URL above. Example:
   "links": [{ "label": "GitHub", "href": "https://github.com/...", "type": "github" }]

3. Open app/work/[slug]/page.tsx. Find where deliverable detail is rendered.
   Below the tech tags, add a "GitHub →" link that renders when d.links exists and
   has a github-type entry. Use the existing `text-accent-text` token and
   `font-mono text-meta tracking-label uppercase` typography. Open in new tab
   (target="_blank" rel="noopener noreferrer").

4. Run: cd ~/Portfolio && npm run typecheck && npm run lint && npm test && npm run build
   All gates must pass (0 errors, 17/17 tests).

5. Do NOT merge to main. Work stays on feature/single-scroll-2026-05-24.
```
