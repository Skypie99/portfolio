# Steve — Cycle 2/3 Security & Robustness Review

**Project:** Portfolio (Next.js 15.1.4 static export → GitHub Pages)
**Branch:** `qa/auto-2026-05-23` (read-only review; no commits)
**Date:** 2026-05-23
**Reviewer:** Steve (Safety Engineer)
**Scope:** Cycle 2/3 build — `app/`, `components/`, `lib/`, `content/`, `next.config.mjs`, `package.json`

---

## 1. TL;DR

**Overall risk rating: MODERATE** — held back from "low" only by the unpatched Next.js 15.1.4 CVEs. The hand-written code itself is **clean**: no injection sinks, no `dangerouslySetInnerHTML`, no `eval`, no committed secrets, no path traversal in `lib/content.ts`, Zod is strict at every JSON trust boundary, all external links carry `rel="noopener noreferrer"`, and `.env*` is gitignored from the first commit.

The static-export posture is a strong baseline — no SSR, no API routes, no cookies, no auth, no remote images, no user inputs — which neutralizes the majority of the dependency CVEs (almost all of them require dev-server, middleware, image-optimizer, or Server Components in runtime mode, none of which apply to a `next build && next export` site served by GH Pages).

**The one P0:** upgrade `next` from 15.1.4 → 15.1.8+ (or the latest 15.x patched, 15.5.18 per `npm audit`) to clear the critical and high CVEs.

---

## 2. `npm audit --omit=dev` summary

| Severity | Count |
|---|---|
| CRITICAL | 1 (package: `next`) |
| HIGH | 0 (rolled up under `next`'s critical) |
| MODERATE | 1 (`postcss`, transitive via `next`) |
| LOW | 0 |
| INFO | 0 |
| **TOTAL** | **2 packages, 26 underlying CVEs** |

### Critical / High CVEs affecting `next@15.1.4`

Shamus's Cycle-2 callout (CVE-2025-66478) shows up in this list. The full critical/high set:

| Severity | CVE | Title | Patched in |
|---|---|---|---|
| **CRITICAL** | GHSA-9qr9-h5gf-34mp | RCE in React flight protocol | `>=15.1.9` |
| **CRITICAL** | GHSA-f82v-jwr5-mffw | Authorization Bypass in Next.js Middleware | `>=15.2.3` |
| HIGH | GHSA-67rr-84xm-4c7r | DoS via cache poisoning | `>=15.1.8` |
| HIGH | GHSA-mwv6-3258-q52c | DoS with Server Components | `>=15.1.10` |
| HIGH | GHSA-h25m-26qc-wcjf | HTTP request deserialization → DoS via RSC | `>=15.1.12` |
| HIGH | GHSA-q4gf-8mx6-v5v3 | DoS with Server Components (variant) | `>=15.5.15` |
| HIGH | GHSA-8h8q-6873-q5fj | DoS with Server Components (variant) | `>=15.5.16` |
| HIGH | GHSA-mg66-mrh9-m8jx | Connection exhaustion DoS in Cache Components | `>=15.5.16` |
| HIGH | GHSA-c4j6-fc7j-m34r | SSRF in WebSocket upgrades | `>=15.5.16` |
| HIGH | GHSA-36qx-fr4f-26g5 | Middleware/Proxy bypass in Pages Router i18n | `>=15.5.16` |

`npm audit` `fixAvailable` reports: **`next@15.5.18`** (non-semver-major — safe upgrade path).

### Moderate

| Package | CVE | Note |
|---|---|---|
| `postcss` (<8.5.10) | GHSA-qx2v-qp2m-jg93 | XSS via unescaped `</style>` in CSS stringify output. Transitive — fixed by upgrading `next`. |

### Exploitability against THIS site (static export → GH Pages)

| CVE family | Applies to this build? | Why |
|---|---|---|
| Dev server CVEs (origin verification, etc.) | Local-only risk | Only active when you run `npm run dev` on your laptop. Don't expose port 3000 to the internet. |
| Middleware / Auth Bypass / Proxy CVEs | NO | No `middleware.ts` exists; no Pages Router. |
| Image Optimizer CVEs | NO | `images.unoptimized: true` — the optimizer route never runs. |
| Server Components / RSC DoS / RCE | NO at runtime | `output: 'export'` pre-renders to static HTML at build time. RSC payloads aren't served. |
| Cache Components / WebSocket SSRF | NO | No runtime server. |
| `postcss` XSS | NO at runtime | PostCSS runs at build time only; output is static CSS. Build-time supply-chain risk only. |

Net: **the only real-world risk vector for this site is the build pipeline itself** (a malicious crafted CSS file fed to `postcss`, or a poisoned cache during `next build`). That's still worth fixing, but it's not "the live site is at risk right now."

---

## 3. Code patterns checked

| Pattern | Result |
|---|---|
| `dangerouslySetInnerHTML` | CLEAN — 0 hits across `app/`, `components/`, `lib/` |
| `eval(` | CLEAN — 0 hits |
| `new Function(` | CLEAN — 0 hits |
| `innerHTML =` | CLEAN — 0 hits |
| `document.write` | CLEAN — 0 hits |
| Plain `http://` URLs in source/content | CLEAN — 0 hits (all socials + credential URLs are `https://`) |
| Hard-coded API keys / tokens / secrets (regex `sk-…`, `ghp_…`, `AKIA…`, `bearer …`, `api[_-]?key`, `password =`) | CLEAN — 0 hits |
| `process.env.*` references | 1 hit — `next.config.mjs:7` reads `NODE_ENV` to gate `basePath`. NODE_ENV is non-sensitive, set by `next build`/`next dev` themselves, not user-supplied. SAFE. |
| `target="_blank"` without `rel="noopener noreferrer"` | CLEAN — only `Footer.tsx:104` uses `_blank`, and `Footer.tsx:105` sets `rel="noopener noreferrer"`. |
| `.env*` files committed to git | CLEAN — `.gitignore` includes `.env*` (allowlist for `.env.example`). `git log --all -- .env*` returns nothing. No `.env*` file exists on disk in the working tree. |

### `lib/content.ts` path-traversal analysis

```ts
const CONTENT_DIR = join(process.cwd(), 'content');
function readJson<T>(filename: string): T {
  const raw = readFileSync(join(CONTENT_DIR, filename), 'utf8');
  return JSON.parse(raw) as T;
}
```

`readJson` is **module-private** (not exported), called from exactly 3 sites — `'profile.json'`, `'deliverables.json'`, `'certificates.json'` — all **hard-coded string literals**. `filename` is never derived from request data, URL params, env vars, or JSON contents. There is no plausible vector by which an attacker could inject `'../../../etc/passwd'`.

That said, this is a static-export Server-Component-only build, so the entire function runs at **build time on Sky's laptop**, not at request time on any server. Even if it could traverse, there's no request flow to exploit. **No risk. No fix needed.** (Defense-in-depth note in §6 P2.)

### User-text-as-HTML check

Every content field that ends up in the DOM (`d.title`, `d.summary`, `d.role`, `d.tech[i]`, `profile.name`, `profile.tagline`, `profile.location`, `profile.contactEmail`) is rendered through React's standard JSX text interpolation — **React escapes it as text by default**. No template flushes it as raw HTML. Mailto hrefs are built from `profile.contactEmail`, which Zod validates as `z.string().email()` at build time. **No XSS vector through content JSON.**

---

## 4. `next.config.mjs` review — headers() under static export

The current config defines a `headers()` block returning `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Frame-Options: DENY`. The accompanying comment correctly documents that **`output: 'export'` makes runtime `headers()` a no-op** — Next.js writes pre-rendered HTML, and GH Pages serves files without consulting `next.config.mjs`.

### GH Pages reality

GitHub Pages does **not** support custom HTTP response headers. There's no way to set CSP, HSTS, Permissions-Policy, Cross-Origin-Opener-Policy, or any of the modern security headers via GH Pages config. The `headers()` block in `next.config.mjs` is purely aspirational documentation for a future hosting layer.

### Partial mitigations available today

1. **`<meta http-equiv="Content-Security-Policy">` in `app/layout.tsx`** — meta-tag CSP works for *most* directives (`default-src`, `script-src`, `style-src`, `img-src`, `connect-src`, `font-src`). It does **NOT** support `frame-ancestors`, `report-uri`, `report-to`, or `sandbox` (those require a real header). For a static portfolio with no auth, no forms, no user inputs, no third-party scripts (fonts are self-hosted via `next/font/google`), a meta CSP is a reasonable partial defense and adds real value against script injection in the unlikely event someone manages to inject content into the JSON.
2. **`<meta name="referrer">`** — works in all browsers, gives you the `Referrer-Policy` equivalent.
3. **`X-Frame-Options` / `X-Content-Type-Options`** — **CANNOT** be set via meta tag. The browser ignores meta versions of these. Real headers only.

Recommendation: add a meta CSP + meta referrer in `app/layout.tsx` for cheap defense-in-depth, and accept (with explicit documentation) that frame-ancestors, MIME sniffing, and HSTS are not available on GH Pages. If Sky wants those, the migration target is Cloudflare Pages (free tier, supports `_headers` file) or Netlify. See §7 Decisions.

---

## 5. Static-export hardening checklist

| Property | Status | Note |
|---|---|---|
| `images.unoptimized: true` | OK | No image optimizer route → no Image-Optimizer CVE surface. No remote images defined in content (only `/images/...` local paths). |
| SSR / Server Actions | None | `output: 'export'` precludes both. No SSRF surface. |
| API routes | None | No `app/api/` directory. No auth, no rate limiting needed. |
| Middleware | None | No `middleware.ts`. Auth-bypass CVE doesn't apply. |
| Cookies / localStorage | None | No client-side state persisted. Only ephemeral `useState` (`open` in `HamburgerNav`). No secrets in storage. |
| Client-side env vars (`NEXT_PUBLIC_*`) | None | Searched — no `NEXT_PUBLIC_` references. Nothing being baked into the bundle that shouldn't be. |
| External network calls from client JS | None | No `fetch(`, no `XMLHttpRequest`, no `WebSocket`, no analytics scripts. The site is purely static after first paint. Framer Motion runs animations locally. |
| Fonts | Self-hosted via `next/font/google` (build-time download, served from `/_next/static/`). No runtime third-party font requests → no font-CDN supply-chain risk and no missing-CSP `font-src` worry. |
| `trailingSlash: true` | OK | Standard GH Pages convention; not a security concern. |
| `basePath: '/portfolio'` (prod) | OK | Tied to `NODE_ENV === 'production'`. Read-only env check, no injection. |
| `reactStrictMode: true` | OK | Catches double-render bugs in dev; small robustness win. |
| `.nojekyll` in `public/` | OK | Prevents GH Pages from trying to interpret `_next/` files via Jekyll — a robustness, not security, item. |
| `tsconfig.json` `strict: true` | OK | Eliminates a class of runtime bugs at compile time. |

---

## 6. Recommended fixes (prioritized)

### P0 — do this week

1. **Upgrade `next` to a patched 15.x release** to clear the critical RCE + critical AuthBypass + 8 high CVEs.
   - Recommended: `next@15.1.12` (closest patched minor; clears all `15.1.x` criticals/highs except the three at `>=15.5.x`). For full coverage, `next@15.5.18` (which `npm audit` flags as `fixAvailable`, non-semver-major).
   - Also bumps `eslint-config-next` to a matching version.
   - Verification: re-run `npm audit --omit=dev` — expected outcome: 0 critical, 0 high. Run `npm run build && npm run typecheck && npm run test` to confirm nothing regresses.
   - **Steve does not run the upgrade. Sky (or a Rory pass) executes** `npm install next@15.5.18 eslint-config-next@15.5.18` **on a fresh branch and verifies the build.**

### P1 — do this month

2. **Add a meta-tag CSP in `app/layout.tsx`**, scoped to what this site actually does:
   ```tsx
   <meta
     httpEquiv="Content-Security-Policy"
     content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'"
   />
   ```
   Caveats to test before shipping: `'unsafe-inline'` for styles is needed because Tailwind ships some inline styles via Next.js, *and* Framer Motion injects inline styles for animations. A nonce-based CSP would be cleaner but is impractical under static export. Test with `prefers-reduced-motion` on and off to confirm no animations break under CSP.
   Add `<meta name="referrer" content="strict-origin-when-cross-origin" />` alongside.

3. **Document the GH Pages header limitation in `README.md`** so future contributors don't waste cycles wondering why the `headers()` block in `next.config.mjs` isn't taking effect. The comment in the file is good; surfacing it in README + linking to this report is better.

### P2 — defer or reconsider

4. **`lib/content.ts` defense-in-depth** — Although there's no current vector, you could constrain the `filename` argument to a literal-string union type (`'profile.json' | 'deliverables.json' | 'certificates.json'`) so a future refactor can't accidentally accept user input. Low value (function is already module-private and the build is static), low cost. Optional.

5. **Consider migrating off GH Pages** to a host that supports custom headers (Cloudflare Pages, Netlify, Vercel). Lets the `headers()` block in `next.config.mjs` actually take effect, enables a real CSP with `frame-ancestors`, `X-Content-Type-Options`, and HSTS. **This is a Sky decision, not a Steve fix.** See §7.

6. **Pin all dependencies** — current `package.json` uses `^` ranges (`"next": "15.1.4"` is actually exact, but `"framer-motion": "^11.18.0"` is not). A bug or backdoor in a 12.x minor of framer-motion could land via `npm install`. Counter-argument: caret ranges + a committed `package-lock.json` is the standard JS pattern; pinning everything trades supply-chain safety for missing security patches. **Recommendation: leave as-is for now**, revisit if Cycle 4+ adds CI auto-update tooling.

7. **Add `npm audit` to CI / pre-commit** so future upgrades that introduce a critical CVE are caught at PR time. This is a Rory / Gary item, not a Steve fix — flagging for awareness.

---

## 7. DECISIONS FOR SKY

Per Constitution Art. 7 (safety-pillar non-negotiable) and Art. 9 (Morgan is the only channel to Sky), Steve writes these here and Morgan surfaces.

### Decision A — Patch Next.js: which target version?

| Option | Pros | Cons | Steve recommends |
|---|---|---|---|
| `next@15.1.12` (closest patched 15.1.x) | Smallest behavioral delta; lowest regression risk | Still has 4 highs that need `>=15.5.x` (all DoS/SSRF/middleware, all inapplicable to static export) | If you want the minimum-risk patch and accept the static-export-immune highs |
| `next@15.5.18` (`fixAvailable` per npm audit) | Clears every critical and high; non-semver-major | Larger behavioral delta; need to re-run build + verify each route renders identically | **Recommended.** The static-export immunity is real but defense-in-depth says fix everything you can without a semver-major bump. |
| `next@16.2.6` (latest) | Future-proofs the dependency | Semver-major; will require code changes (React 19, etc.) | Defer to Cycle 4 |

### Decision B — Stay on GH Pages (no custom headers) or migrate?

| Option | Pros | Cons |
|---|---|---|
| **Stay on GH Pages** | Free, simple, already deployed, already in Rory's DEPLOY_PLAN.md | No `X-Frame-Options`, no `X-Content-Type-Options`, no HSTS, no real CSP. Meta-tag CSP is partial. For a static portfolio with no auth/forms/cookies, real-world exploit risk is low. |
| **Migrate to Cloudflare Pages** | Free, supports `_headers` file → real CSP, HSTS, X-Frame-Options, COOP/CORP, Permissions-Policy. Faster CDN. | Migration work; new deployment pipeline; Rory has to redo DEPLOY_PLAN.md. |

Steve's recommendation: **stay on GH Pages for v1 launch + adopt the meta-tag CSP from §6 P1.** Revisit migration in Cycle 5+ when you have content worth protecting more aggressively (case studies with embedded video, contact form with backend, etc.). Document the accepted limitation in README so the decision is auditable.

### Decision C — Pin all deps?

Steve's recommendation: **no, keep caret ranges + lockfile.** The current pattern is industry-standard. Revisit if Cycle 4 adds a `dependabot` or `renovate` flow that auto-PRs minor bumps.

---

## 8. What was NOT changed

Per role file + Constitution v1.3 Art. 1 / 5: Steve made **no code edits, no git commits, no dependency installs, no merges**. This is a read-only review. The `qa/auto-2026-05-23` branch is untouched at HEAD `713a3da` (Day-0 kickoff). All fixes above are proposals for Sky to authorize and a code-running role (Shamus, Rory, or future Steve invocation with write scope) to apply on a fresh branch.

---

## Appendix A — `npm outdated` (security-relevant rows)

| Package | Current | Latest | Note |
|---|---|---|---|
| `next` | 15.1.4 | 16.2.6 | Patch via 15.5.18 (P0); 16.x = semver-major (defer) |
| `eslint-config-next` | 15.1.4 | 16.2.6 | Bump alongside `next` |
| `react` / `react-dom` | 18.3.1 | 19.2.6 | semver-major; defer |
| `eslint` | 8.57.1 | 10.4.0 | semver-major; defer |
| `framer-motion` | 11.18.2 | 12.40.0 | semver-major; defer |
| `tailwindcss` | 3.4.19 | 4.3.0 | semver-major; defer (Tailwind 4 is a substantial rewrite) |
| `zod` | 3.25.76 | 4.4.3 | semver-major; defer |

None of the "defer" rows carry known critical/high CVEs that the audit flagged — they're feature gaps, not security gaps.

## Appendix B — files reviewed

- `/Users/skypie/Portfolio/package.json`
- `/Users/skypie/Portfolio/package-lock.json` (existence + contents implicit in audit)
- `/Users/skypie/Portfolio/next.config.mjs`
- `/Users/skypie/Portfolio/tsconfig.json`
- `/Users/skypie/Portfolio/.gitignore`
- `/Users/skypie/Portfolio/.eslintrc.json`
- `/Users/skypie/Portfolio/postcss.config.js`
- `/Users/skypie/Portfolio/app/layout.tsx`
- `/Users/skypie/Portfolio/app/page.tsx`
- `/Users/skypie/Portfolio/app/not-found.tsx`
- `/Users/skypie/Portfolio/app/fonts.ts`
- `/Users/skypie/Portfolio/components/Button.tsx`
- `/Users/skypie/Portfolio/components/Footer.tsx`
- `/Users/skypie/Portfolio/components/HamburgerNav.tsx`
- `/Users/skypie/Portfolio/components/Hero.tsx`
- `/Users/skypie/Portfolio/components/NumberedStep.tsx`
- `/Users/skypie/Portfolio/components/Sidebar.tsx`
- `/Users/skypie/Portfolio/components/SkipLink.tsx`
- `/Users/skypie/Portfolio/lib/cn.ts`
- `/Users/skypie/Portfolio/lib/content.ts`
- `/Users/skypie/Portfolio/lib/schema.ts`
- `/Users/skypie/Portfolio/content/profile.json`
- `/Users/skypie/Portfolio/content/deliverables.json`
- `/Users/skypie/Portfolio/content/certificates.json`

---

*End of report. Morgan: please surface Decisions A, B, C to Sky in the next status briefing.*
