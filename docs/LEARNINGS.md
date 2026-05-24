# Learnings — AI Portfolio

A running log of things that surprised us, gotchas, decisions revisited, and patterns worth keeping. Each entry is dated. New entries go at the TOP.

---

## 2026-05-23 — Day-0 kickoff + Cycles 2-6 build

Things actually learned shipping the v1 build (not just planned):

- **Next 15.5 forbids `next/dynamic({ ssr: false })` in Server Components.** Discovered when applying Peter's Framer-lazy-load. Solved by extracting `components/HamburgerNavMount.tsx` as a thin `'use client'` wrapper that holds the dynamic-import boundary, then importing the wrapper from the Server `app/layout.tsx`. Cleaner than a downgrade hack — the Server/Client seam is now explicit at the wrapper file, not buried inside a `next/dynamic` option.
- **`images: { unoptimized: true }` is mandatory for static export to GitHub Pages.** `next/image`'s default loader needs a Node server; without `unoptimized` the build still runs but every image 404s in the exported `out/` directory. Trade-off accepted in `next.config.mjs`; perf budget held via `loading="lazy"` + a future `sharp` prebuild pipeline (Peter's Cycle 7+ note).
- **`basePath` is only applied in production.** `next.config.mjs` gates `basePath: '/portfolio'` on `process.env.NODE_ENV === 'production'`. Effect: `npm run dev` serves at `http://localhost:3000` (root) and `npm run build` + `npx serve out` serves under `/portfolio/` — matching what GH Pages will publish. Removing the gate breaks dev (every link 404s) AND removing `basePath` entirely breaks production (every asset 404s).
- **`generateStaticParams` enumerates `[slug]` from `content/deliverables.json` at build time.** `app/work/[slug]/page.tsx` reads `getDeliverables()` and returns `[{ slug: id }, …]`. Result: 5 static HTML files (`out/work/accessmap/index.html`, `…/claude-corp/…`, etc.). Adding a deliverable to JSON automatically prerenders a new page on next build — no route file changes needed.
- **`next/font/google` self-hosts woff2 at build time.** `app/fonts.ts` imports Cormorant Garamond, DM Sans, DM Mono — Next downloads + fingerprints them into `_next/static/media/` during `next build`. Zero runtime CDN requests, ~16 kB total font payload. No license/CORS warnings from GH Pages because nothing reaches out to fonts.google.com.
- **Featured-slot integrity (exactly one `featured: true`) is a build-time invariant enforced in TWO places.** `lib/content.ts` validates the rule when loading deliverables (throws at build if violated, failing CI before production). `lib/__tests__/content.test.ts` reads the real `content/deliverables.json` and re-asserts the same rule via Vitest, so editing the JSON to feature two (or zero) entries fails `npm run test` locally before it ever reaches a build. Belt and suspenders, and the test doubles as living documentation of the contract.
- **`next lint` is deprecated in Next 16 — migration noted as a future cycle item.** Gary flagged it in `qa-reports/2026-05-23_Gary_C4-6_tests.md` §Recommendations: when the Next 16 bump lands, run `npx @next/codemod@canary next-lint-to-eslint-cli .` to swap to the standalone ESLint CLI. Low urgency, just don't get surprised on the next major bump.
- **2 moderate `postcss` CVEs are accepted.** Transitive build-time-only inside Next 15.5's pipeline; `npm audit fix --force` downgrades `next` to 9.x (loses App Router + every Cycle 2-6 feature). Documented in `qa-reports/2026-05-23_Steve_C4-6_security.md`; re-evaluate when Next 15.6+ ships with a patched transitive. PostCSS does not run at runtime on GH Pages — output is static CSS.

---

## 2026-05-23 — Day-0 kickoff

- _(Original placeholder entry — superseded by the build-shipped entry above. Kept as a record of the initial intent: watch for Tailwind config gotchas mapping Dani's tokens, Next.js static export + basePath asset path issues, MDX content-loading edge cases, contrast regressions when adding new colors. All four came up during the build.)_

---

## Patterns worth keeping

_(Populate as we discover them.)_

## Anti-patterns to avoid

_(Populate as we trip on them.)_

## Gotchas Sky needs to remember

_(Populate. Likely first entries: GitHub Pages `basePath` + `next/image`, `.nojekyll`, contrast checks before adding any new color.)_
