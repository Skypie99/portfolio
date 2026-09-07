# Phase09 release candidate risk register — owner resolution

This additive register carries current dispositions into the eventual release candidate. Phase10 has not started; Phase11 release controls are not completed by this record.

## HOST-HTTPS — mandatory Phase11 control; Phase09 OWNER ACCEPTED

Current production HTTP apex returns200 without redirect; HTTPS works. Sky rejects this as the final production posture but accepts host ownership. Phase11 must verify actual production HTTP→HTTPS enforcement before final production acceptance. The custom-domain/alias and response-header matrix must be checked; Next static-export configuration is not enforcement. See host-disposition.md and host-confirmation.json. No host or deployment changes made.

## DEP-POSTCSS — HOLD; conditional acceptance not activated

Path portfolio → next15.5.25 → nested postcss8.4.31. Current supported Next15 chain confirmed; exact existing audit has2 vulnerable package records (1high,1moderate) and4GHSAs. Severity is retained, not discounted by static hosting. No candidate-specific practical production exploit was established; malicious build input remains relevant.

- GHSA-qx2v-qp2m-jg93: moderate; fixed8.5.10.
- GHSA-6g55-p6wh-862q: high; fixed8.5.12.
- GHSA-fxqj-rqcc-2cmp: moderate; fixed8.5.23.
- GHSA-r28c-9q8g-f849: high; fixed8.5.18.

Conditions2/3 (no safe minor remedy; broader migration necessary) remain unproven. Published PostCSS8.5.28 is outside the four known ranges; a Next15-scoped override is an unevaluated narrower option. npm fixAvailable:false is not compatibility proof. Next16.3.4 carries patched8.5.23, but that establishes an option, not necessity. Next16 migration remains DEFERRED / NOT AUTHORIZED IN PORTFOLIO3.0.

Recommendation: separately authorize and evaluate a scoped PostCSS override with manifest/lock boundary, fresh audit, production build and relevant static/test verification. Alternative: explicitly revise conditional acceptance to accept the residual despite the untested narrower option. No upgrade or compatibility claim is made here. See dependency-owner-conditions.md and primary-source provenance.

## PERF-HOME — OWNER ACCEPTED WITH MEASUREMENT UNCERTAINTY

PERFORMANCE_REGRESSION: NOT ESTABLISHED. Original132-record observation remains: six baseline warm Home samples0ms, candidate median45.5ms with91/117/151ms spikes. One additional32-record confirmation shows inconsistent spikes in both artifacts, paired warm excess median delta0ms, no identifiable consistent candidate cause. New warm baseline values57,0,0,45,25,0,0,966; candidate0,0,0,114,0,152,133,0ms. No outlier discarded. This is not INP/field CWV; no user-interaction performance claim. See performance-disposition.md for exact distributions and attribution limits.
