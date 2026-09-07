# Phase 09-A SEO / headers receipt

Prompt: SKYPI-PORTFOLIO-3.0-P09-A-SEO-HEADERS. Date: 2026-09-07. **Lane: HOLD; evidence/comment-only commit safe for lead review.** This lane does not issue the parent gate.

## Provenance and scope

Repository: https://github.com/Skypie99/portfolio.git. Isolated worktree `/Users/skypie/Portfolio-codex/portfolio-3.0-p09-a-20260907`; branch `codex/portfolio-3.0-p09-a-20260907`. Exact starting SHA `eb67733403ba434cb8de94003037666f80aa6592`, tree `1746309ac60e57cda3873119d19248a905056896`. Created clean from that SHA. The lead owns final integration/build attribution. Current primary checkout is on local main `7dc04ff2be3d8754516cb218bc4f4a08079dfcd3`; local main versus origin/main is 0 ahead / 3 behind. Historical planning SHA is not a reset target. No primary-checkout writes.

Read primary AGENTS.md then CLAUDE.md and the supplied Phase 09 prompt. Phase 02 receipt confirms helper wiring and explicit prior exclusion of the Flagstone static microsite from its canonical guard. No separate delegated Phase 09 contract was located in the baseline tracked file inventory; supplied prompt approval conditions remain controlling.

The only applied source change is a documentation comment in `lib/metadata.ts`: remove its stale assertion that `/archive` and `/runway` must not use the helper. Their existing implementation already uses self-canonicals while retaining noindex. No runtime metadata, layout, security configuration, auth, privacy code, content, or host setting changed. Historical receipts remain intact.

## T-130 / T-131: canonical and indexing matrix

`phase-09-a/baseline-export-inventory.json` enumerates all 26 HTML files from the pre-existing baseline `out/`. It is discovery evidence, not proof that this pre-existing build was generated from the final candidate. Run the included `scan-export.py` against the lead's freshly built frozen artifact before final acceptance.

| Surface | Current emitted canonical | Indexing / sitemap | Disposition |
|---|---|---|---|
| `/`, `/work/`, `/about/`, `/certificates/`, `/blog/`, `/contact/`, `/accessibility/`, `/colophon/` | Exact HTTPS self URL on skypistudio.com | Indexable; all in sitemap | Existing helper wiring retained |
| `/work/flagstone/`, `/work/claude-corp/`, `/work/dashboard/`, `/work/ghost-code/`, `/work/prompt-library/` | Exact HTTPS self URL | Indexable; all in sitemap | Existing helper wiring retained |
| `/blog/building-flagstone/` | Exact HTTPS self URL | Indexable; in sitemap | Retained |
| `/archive/` | HTTPS self URL | noindex,nofollow; absent sitemap | Private island retained, no auth/data inspection or mutation; noindex is not access control |
| `/runway/` | HTTPS self URL | noindex,nofollow; absent sitemap | Unlisted edition retained |
| `/work/accessmap/` | `/work/flagstone/` destination | Meta refresh; absent sitemap | Correct destination ownership, static redirect rather than HTTP 301 |
| `/work/mutual-mesh/` | `/work/` destination | Meta refresh; absent sitemap | Same |
| `/blog/building-accessmap/` | `/blog/building-flagstone/` destination | Meta refresh; absent sitemap | Same |
| `/404/`, `/404.html` | Inherited home canonical | noindex; absent sitemap | Error documents serve arbitrary missing paths; retain existing explicit guard exclusion |
| `/flagstone/`, `/flagstone/accessibility/`, `/flagstone/privacy/`, `/flagstone/support/`, `/flagstone/terms/` | **Missing** | Currently indexable; all absent sitemap | **P09-A-001 HOLD**, explicit policy choice and banked patch |
| Public Studio Archive at `https://skypie99.github.io/studio-archive/` | Live still declares `https://archive.skypistudio.com` | Live index,follow; separate repository | P06 accepted local fallback remains unpublished; no cross-repository edits or renewed closure claim |

No cross-host canonical was found in the Portfolio export. Fourteen intended app indexable URLs have exact self-canonicals. Five additional publicly reachable microsite pages lack them; the existing static test silently excludes this family by design from Phase 02. Therefore the entire T-130/T-131 scope cannot PASS merely because the existing tests pass.

## T-132: sitemap / robots / feeds / structured data

The inspected export sitemap has 14 URLs, all app indexable routes. Robots permits crawling and identifies the HTTPS sitemap. This permits discovery of noindex directives; robots is not an authorization boundary. No redirect, private Archive or unlisted Runway URL occurs in the sitemap.

RSS XML and JSON Feed parse successfully; each has the same one non-draft post URL and that URL appears in the sitemap. JSON Feed declares 1.1 and RSS 2.0. No route/host repair is needed in either feed. Source `getBlogPosts()` is shared with the blog listing.

HTML JSON-LD parses: Person is emitted by the root layout; five work pages add SoftwareApplication; the blog post adds BlogPosting. Source uses existing profile/content names and dates. No ratings, offers, user counts, adoption or release claims were added. This is a syntax/source inventory, not third-party search rich-result certification. The five utility pages have no JSON-LD, which is not itself a defect. Public Archive metadata belongs to its separate P06/P11 publication boundary.

## T-133: actual production header evidence

`phase-09-a/production-headers.json` records 10 public endpoint GET observations at 2026-09-07 11:01:52–53 UTC, follows redirects, validates TLS normally, and saves only allowlisted response headers. It never saves cookies. `production-public-meta.json` records selected public HTML metadata from three endpoints, measured in the same lane run.

| Policy / behavior | Configured or HTML intent | Actual observation | Scope / conclusion |
|---|---|---|---|
| CSP response header | next.config `frame-ancestors 'none'` | Absent on observed primary HTTPS HTML, robots and sitemap responses | Config is not deployed host enforcement |
| CSP meta | Root layout production meta policy | Present on live homepage; absent on hand-authored `/flagstone/` | Document-level meta delivery; not an HTTP header; no frame-ancestors protection from meta |
| X-Frame-Options | Config DENY | Absent | No measured header-based framing restriction |
| X-Content-Type-Options | Config nosniff | Absent | Do not claim host enforcement |
| Referrer-Policy | Config strict-origin-when-cross-origin and root metadata | HTTP header absent; homepage meta present | Distinguish meta from header; utility HTML has no such meta in sample |
| Permissions-Policy | Config denies feature list | Absent | Do not claim host enforcement |
| X-XSS-Protection | Config legacy policy | Absent | Legacy config is not observed runtime enforcement |
| HSTS | No operator-controlled static-export header mechanism | Absent on primary custom domain; public github.io Archive has max-age=31556952 | GitHub Pages capability and custom-host behavior differ; do not generalize absence across github.io |
| HTTPS transport | HTTPS canonical production URL | HTTPS custom homepage works | Verifies chosen production canonical is reachable, not transport upgrade enforcement |
| HTTP upgrade | No static-export mechanism | `http://skypistudio.com/` remains HTTP 200 | **P09-A-002 HOLD** for host decision; not fixed locally |
| Legacy GitHub Pages alias | Redirects to custom domain | `https://skypie99.github.io/portfolio/` ends at **http** custom homepage | Same host decision |
| www alias | Custom domain redirect | HTTPS www ends at HTTPS apex | Observed good apex destination |
| Hosting/CDN attribution | GitHub Pages static export | Server GitHub.com and Via 1.1 varnish on sampled success responses | Identifies observed serving layer, not administrative configuration |
| Archive vanity | Previously known TLS failure | TLS hostname verification still fails | No insecure TLS bypass; preserve known P06/P11 boundary |

Absence means not returned by these requests; it does not prove behavior of every route or future request. No backend, signed-in Archive, private records, settings or credentials were accessed. The live site remains the existing deployment, not this private 3.0 candidate.

## T-134: documentation truth

README.md already explicitly states that Next `headers()` is documentation and not applied by GitHub Pages. The Colophon body in `lib/content.ts` makes no header-enforcement claim; no public wording was changed.

Two older comments overstate future deployment behavior: `next.config.mjs` says the block will automatically take effect after migrating off Pages, and `app/layout.tsx` says it becomes live the day hosting changes. Correct interpretation: a future serving architecture must actually execute Next's server header configuration or explicitly configure equivalent host headers; moving static files alone is insufficient. This receipt records the correction without changing security configuration/shared layout or making unapproved public security claims. No host enforcement has been accepted as sufficient.

## Banked exact approval candidate

`phase-09-a/APPROVAL_REQUIRED_flagstone-indexing.patch` is **unapplied**. It adds five absolute self-canonicals, five sitemap routes and removes the microsite exclusion from the existing canonical regression guard. No text, legal terms, policy wording, script, CSS, auth, or private Archive code is changed by the proposal.

- Patch base SHA: `eb67733403ba434cb8de94003037666f80aa6592`.
- Base tree: `1746309ac60e57cda3873119d19248a905056896`.
- Prospective patch-only tree: `659f842f842cc435e94a3f70bfa7854718b950b7`.
- SHA-256: `35729e25bff77ee787b497a5a531d587025dca14214160a119d49f739f964eeb`.
- `git apply --check`: PASS.
- Apply to a disposable Git index plus `git write-tree`: PASS; the actual working source and real index were not changed.
- Patch candidate build/tests: **UNRUN**. Policy-sensitive source was not applied; final integration requires owner policy approval then fresh build/static tests. Do not treat structural patch validity as runtime acceptance.

Metadata helper comments are not part of this patch-only tree. The lead must recheck applicability after serialized integration. No gated implementation commit exists.

## Commands and checks

- `python3 qa-reports/phase-09-a/scan-export.py /Users/skypie/Portfolio-3.0-baseline/out qa-reports/phase-09-a/baseline-export-inventory.json`: exit 0; 26 HTML, 14 sitemap URLs, 1 matching feed item, 5 missing indexable canonicals, zero cross-host Portfolio canonicals.
- `python3 qa-reports/phase-09-a/measure-headers.py qa-reports/phase-09-a/production-headers.json`: exit 0; individual endpoint results include one TLS failure, not mistaken for successful access.
- `npx vitest run lib/__tests__/metadata.test.ts`: PASS, 1 file / 3 tests, zero skips; retained log.
- `npm run typecheck`: PASS, exit 0; retained log.
- Full lint/tests/build/static suite: delegated to lead against frozen integration, not redundantly run for this documentation-only applied delta.
- No browser or accessibility certification claimed by this lane. Product behavior is unchanged, preserving first frame, motion, CTA parity, responsive fixes and privacy boundaries by unchanged source.

## DECISIONS FOR SKY

1. **P09-A-001 — Flagstone utility indexing policy.** Recommendation: approve the exact banked self-canonical/sitemap/guard patch for all five existing public utility pages. Why: they already expose indexable public HTML and unique og:url values, but currently lack canonical coverage and discovery entries. Alternative: expressly retain some as unlisted/noindex and define that set before implementation. Impact: approval is needed to close T-130–132; do not infer indexing policy solely from old P02 test exclusions. No policy decision accepted overnight.
2. **P09-A-002 — custom-domain transport/header posture.** Recommendation: Sky review HTTPS enforcement at the hosting layer and decide how to address absent security response headers; obtain fresh evidence after any owner-authorized host change. Why: HTTP currently remains reachable and the GitHub Pages alias ends at HTTP. Alternative: explicitly accept a bounded current-host residual pending later hosting work. Impact: no automatic host/config mutation or residual acceptance is authorized; host/security trade-offs require owner approval. This packet proposes no speculative CSP tightening or hosting migration.
3. **Public Studio Archive delivery.** Existing P06 local fallback repair is not deployed; retain its Phase 11 publication boundary. This is not new permission to push the separate repository or repair DNS. Parent should carry its known host failure without resetting accepted private evidence.

## Integration and rollback

Safe to integrate **evidence and helper-comment commit only** after lead review; **lane completion HOLD**. Branch commit identity is obtained with `git log -1` after this receipt commit; a file cannot embed its own resulting commit/tree. Restore/revert that documentation commit to roll back the applied lane. Delete no prior evidence. Apply no banked patch without approval.

Remote mutations: NONE. Push: NO. Merge to main: NO. Deploy: NO. Phase 10 not started.

## Addendum: prospective candidate validation (2026-09-07)

The lead requested authorized local testing of the exact banked patch without adopting the policy or committing gated source. The exact patch was temporarily applied in this lane only, built and tested, then reversed with `git apply --reverse` after `--reverse --check` passed. `git diff --exit-code -- app/sitemap.ts lib/__tests__/static-integrity.test.ts public/flagstone` then returned 0, proving all seven candidate source files restored to their prior committed state. No gated source commit exists. This supersedes the earlier UNRUN validation entry only; owner indexing/host decisions remain HOLD.

Actual results against the prospective implementation:

- `npm run build`: PASS, exit 0, static export and postbuild complete. Existing `headers` under `output: export` notices retained. See `approval-candidate-build.log`.
- `npx vitest run lib/__tests__/metadata.test.ts lib/__tests__/static-integrity.test.ts lib/__tests__/section-nav-anchors.test.ts`: 3 files passed; **57 passed, 1 existing skip**. See `approval-candidate-tests.log`.
- Fresh export scan: **26 HTML, 19 sitemap entries, zero missing indexable canonicals, zero cross-host canonicals**, RSS/JSON feed parity true. Every indexable route is in sitemap; no redirect/noindex/error route is. Exact emitted HTML digests and matrix: `approval-candidate-export.json`; assertion result `approval-candidate-sitemap.log`.
- `npm run typecheck`: PASS, exit 0. See `approval-candidate-typecheck.log`.

The unchanged patch SHA-256 and patch-only prospective tree above remain authoritative. The generated ignored local `out/` now describes the approval candidate, not the restored source; it must never be reused as the lead's accepted artifact. Final policy remains unapproved, patch remains banked and unapplied, and applied runtime source remains identical to the lane's prior documentation commit. No new scope or policy choice was added.
