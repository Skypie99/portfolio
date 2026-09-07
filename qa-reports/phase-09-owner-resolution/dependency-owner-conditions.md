# Phase 09 owner dependency conditions — bounded reconfirmation

Date: 2026-09-07. Scope: ONLY the five conditions in Owner Decision 2 of the supplied hold-resolution prompt. No reopened audit, dependency installation/update, source modification, configuration change, or test/build rerun. This is evidence for the lead, not a parent gate declaration.

Inspected restored evidence tip `59c167987b4b16b9dbec51a6d6f79a5eac570cb7`, tree `72a82e06441c19c9281c053d15672dc285c423dc`. Accepted technical source under review remains `34cdd66fdb376d33fb83a576163a5bb74d4da71c`, tree `a2e30b84ec4ef15b59a7f06daa0cd93947d3521b`. Package/lock/config diff from that source is empty. Digests and proof in `dependency-provenance.json`; fresh public registry metadata fields and timestamps in `dependency-registry.json`.

**DEPENDENCY_RESIDUAL: HOLD — conditional owner acceptance not activated.** Conditions 1, 4 and 5 are reconfirmed. Conditions 2 and 3 cannot truthfully be confirmed from this evidence. Absence of compatibility testing does not establish absence of a safe minor remedy.

## Five-condition result

| Owner condition | Result | Evidence and boundary |
|---|---|---|
| 1. Remaining advisories inherited/nested through current supported Next chain | CONFIRMED | Exact path is `portfolio → next@15.5.25 → postcss@8.4.31`, node `node_modules/next/node_modules/postcss`. Next's official support policy currently lists 15.x Maintenance LTS; fresh npm `backport` tag points to 15.5.25. Registry metadata independently confirms that version pins PostCSS 8.4.31. Supported major does not mean vulnerability-free. |
| 2. No safe patch/minor remediation exists within current architecture | NOT ESTABLISHED | The stored audit's `fixAvailable:false` is not an exhaustive compatibility proof. PostCSS 8.5.28 is a published same-major minor upgrade relative to 8.4.31, already present as the separate root dev copy and outside all four stored affected ranges. npm officially permits parent-scoped overrides. Replacing only Next's nested PostCSS is a concrete bounded remediation candidate whose safety has neither been verified nor ruled out. Existing root-copy success does not validate Next's processor path. |
| 3. Remediation requires Next16 or another materially broader architecture/dependency change | NOT ESTABLISHED | Fresh Next16.3.4 metadata pins patched PostCSS8.5.23, so Next16 is one verified package-level remedy for these ranges. Nothing establishes it is necessary: a same-major parent-scoped PostCSS override remains unevaluated. Calling that automatically a materially broader architecture change would substitute a judgment for the required proof. |
| 4. Phase09 audit establishes no practical production exploit path unique to candidate | CONFIRMED within requested scope | Preserved Phase09 analysis establishes static export on a file host, not request-time Next/PostCSS execution; vulnerable PostCSS processes source CSS in builds. No public visitor-to-processor path was established. Malicious CSS/source/supply-chain input remains a build risk. This is absence of an established candidate-specific exploit path, not a universal non-exploitability claim. |
| 5. Acceptance does not conceal high/moderate severity | CONFIRMED | Exact severities remain visible below and in original raw audit JSON. Two npm vulnerable package records (one high, one moderate) cover four distinct PostCSS GHSA IDs plus inherited Next impact. No downgrade or vulnerability-free claim. |

Sources checked 2026-09-07: [Next support policy](https://nextjs.org/support-policy), [npm parent-scoped overrides](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides). Public registry metadata queried 14:57:20–32 UTC is preserved locally. Its Next `backport` tag identifies an existing maintained release; this limited metadata check is not an exhaustive enumeration of every published patch/minor version.

## Preserved risk register

All four affect `next@15.5.25 → postcss@8.4.31`; full and production-only audit observations remain the preserved 2026-09-07 11:04 UTC audit, **not a new audit run**.

| ID | Severity | Stored affected range | Advisory fixed version |
|---|---|---|---|
| [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) | moderate | <8.5.10 | 8.5.10 |
| [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) | high | <=8.5.11 | 8.5.12 |
| [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) | moderate | <=8.5.22 | 8.5.23 |
| [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) | high | <=8.5.17 | 8.5.18 |

Original detailed prerequisites remain in `qa-reports/2026-09-07_Codex_Phase09Dependencies.md`. Next's own moderate audit record is inherited through PostCSS, not a fifth distinct GHSA. PostCSS8.5.23 or 8.5.28 being outside these four ranges says nothing about advisories beyond the bounded existing audit set.

## Exact contradiction / missing proof

The historical claim that only a Next16 migration can remove the residual overstates what has been demonstrated. Current registry metadata now confirms that Next16.3.4 carries a patched version, but neither that fact nor `fixAvailable:false` excludes a narrower parent-scoped PostCSS minor override. The previously recorded no-fix flag is therefore insufficient for owner conditions 2 and 3. This reconfirmation does not claim the alternative is safe; that is precisely the unrun compatibility investigation.

## DECISIONS FOR SKY

Smallest safe next action: authorize a separate isolated evaluation of a **Next15.5.25-scoped PostCSS8.5.28 override**, with an explicit manifest/lock boundary, no framework/React change, fresh audit, build/test/static-output verification, and rollback by discarding the isolated candidate. Recommendation: investigate that bounded option before deciding a major migration is necessary. Alternative: explicitly accept the existing four-GHSA residual despite the untested narrower option, changing conditions 2 and 3 of the current acceptance. Impact: no immediate dependency change or deployment; the present conditional acceptance cannot activate until the missing proof or revised owner decision exists.

A possible override is an evaluation target, not an applied/verified patch. No package change is authorized or executed in this reconfirmation. Next16 migration remains deferred and NOT AUTHORIZED IN PORTFOLIO 3.0. No remote mutation, publish, push, merge, deployment, secrets, or production access. Original HOLD evidence preserved unchanged; this additive report supersedes no historical observation.
