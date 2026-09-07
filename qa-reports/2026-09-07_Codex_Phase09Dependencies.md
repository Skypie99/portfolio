# P09-B — Dependency advisory receipt

Prompt: SKYPI-PORTFOLIO-3.0-P09-B-DEPENDENCY-WARNINGS. Task T-135 / F-031 / RC-010. Status: HOLD for owner residual-risk disposition. This lane does not issue the parent gate.

Repository: https://github.com/Skypie99/portfolio.git. Isolated branch `codex/portfolio-3.0-p09-b-20260907`, worktree `/Users/skypie/Portfolio-codex/portfolio-3.0-p09-b-20260907`. Verified base `eb67733403ba434cb8de94003037666f80aa6592`, tree `1746309ac60e57cda3873119d19248a905056896`. Primary AGENTS.md and CLAUDE.md read; parent independently owns baseline/precondition verification. No manifest, lockfile, runtime dependency, privacy/security configuration, or production change.

## Current audit and method

On 2026-09-07 at 11:04:04–05 UTC, `npm audit --json` and `npm audit --omit=dev --json` both completed with exit 1 because advisories remain. Both report **2 vulnerable package records: 1 high, 1 moderate, 0 critical**. These are **four distinct advisory IDs on one nested PostCSS instance**, plus the affected direct Next.js parent record; package-record counts must not be presented as the number of distinct GHSAs.

Raw responses, stderr, timestamps, tool versions, manifest-lock digest, and paths are in `qa-reports/phase-09-b/audit-{full,production}-final.json`, `audit-provenance.json`, and `dependency-paths.log`. Earlier initial query responses are preserved separately. No audit fix/install/update ran. Existing baseline node_modules is linked read-only for execution; lockfile and resolved versions agree for the relevant packages.

## Complete affected path

`portfolio` → direct production dependency `next@15.5.25` → hard-pinned transitive `postcss@8.4.31` at `node_modules/next/node_modules/postcss`. Next's moderate record is inherited via PostCSS, not another distinct GHSA. Root development PostCSS is `8.5.28`, outside all reported ranges; bumping the root dependency alone cannot repair Next's nested copy.

Production-only npm classification means dependency-graph membership, not execution on the public host. `next.config.mjs` sets `output: 'export'` and unoptimized images. The public deployment serves exported files, with no request-time Next/PostCSS server. The nested processor remains reachable during trusted-source CSS builds/dev; Next's webpack PostCSS loader supplies `from: file` and passes CSS content into `postcssWithPlugins.process`. See `next-postcss-loader-excerpt.txt` and Next's installed `dist/build/webpack/config/blocks/css/index.js:76` for ownership. Targeted app/lib/scripts search found no direct PostCSS processing API. No hostile CSS ingestion path from a site visitor to this build process was established. This is scoped source-based reachability analysis, not proof against a compromised dependency or malicious source change.

## Advisory matrix

All rows share the nested path above and remain unremediated/unaccepted for P09. Source pages inspected 2026-09-07; patched versions are advisory facts, not a claim that npm can safely update Next's pinned copy.

| Advisory / severity | Prerequisites and observed reachability | Package fix / migration cost |
|---|---|---|
| [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93), moderate | Attacker-controlled CSS must be stringified and embedded unescaped in an HTML style context; visitor then renders it. No public CSS submission processor found. Malicious build input remains a prerequisite outside the public request path. | PostCSS 8.5.10; nested 8.4.31 affected. Parent upgrade or explicit override needs compatibility/build verification. |
| [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q), high | Attacker controls CSS sourceMappingURL; Node can read target files; output/error access can disclose content. Next builds process CSS; public visitors do not invoke the processor. Trusted source/supply-chain compromise could supply hostile CSS. | PostCSS 8.5.12 fixed the original arbitrary-file variant; later incomplete-fix advisories mean that version alone is insufficient for this set. |
| [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp), moderate | Later fix bypass when `from` is unset and hostile CSS names an arbitrary .map file. Next loader supplies `from`, so this specific later-version bypass is not evidenced there; installed 8.4.31 predates the guards and remains affected by the broader original flaw. | PostCSS 8.5.23. An override above this floor still requires explicit authorization and final gates. |
| [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849), high | Hostile sourceMappingURL traversal plus readable .map and access to generated map/errors. Relevant to compromised build input, not established as a public-host endpoint. | PostCSS 8.5.18; all four reported ranges require at least 8.5.23 together. |

## Historical acceptance boundary

`2026-09-03_PHASE02_FOUNDATION_GATE_RECEIPT.md` §9/§9a was reviewed. It records the earlier dependency remediation, expressly approved Vitest 3 retention, and a two-record residual characterized as Next16-only remediation. This historical receipt is preserved. **Current npm output says `fixAvailable: false` for both records.** No current Next16 fix was verified; do not repeat the old major-migration remedy as current fact. P02's acceptance does not supply the explicit P09 residual approval required by this prompt.

## DECISIONS FOR SKY

Decision P09-B-DEP-01: accept the exact four-GHSA nested PostCSS residual for this static-export candidate, or authorize a separate bounded dependency remediation investigation. Recommendation: retain the current manifests and accept the documented build-input risk for this phase, with a separate planned parent/override evaluation. Reason: no public visitor-to-PostCSS path is established, npm currently offers no fix, and an untested override or framework migration would breach the dependency approval contract. Alternative: keep P09 on HOLD while authorizing and validating an override/parent upgrade. Impact: no count reduction is claimed; P09 remains HOLD until Sky explicitly chooses. No approval received; no dependency patch is claimed ready or tested.

## Gates, unfinished work, rollback and side effects

Audits and path analysis complete. Warning/test gates are in the separate warning receipt. Full integrated test/build is the lead's responsibility. No dependency changes to roll back; receipts are additive. Remote mutations NONE; npm registry advisory queries only, authorized by task. No push, merge, deployment, auth/security/privacy edits, or secret handling. Safe to integrate this evidence: YES; residual acceptance: NOT GRANTED.
