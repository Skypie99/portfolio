# Phase09 — decisions for Sky

Phase09 source fixes and all authorized measurements are banked. The gate remains HOLD for two risk decisions and a measured performance-confidence limit. No further source approval is requested for the canonical correction or bounded visible React test warning. No production action has been taken.

## DECISIONS FOR SKY

### 1. Existing host transport and response headers

**Observed:** `http://skypistudio.com/` remains HTTP 200, the GitHub Pages HTTPS alias ends at HTTP, and read-only Pages settings report `https_enforced:false`. HTTPS apex works. Sampled custom-domain responses lack HSTS and the security response headers described in Next config. Root HTML meta CSP/referrer policy is document policy, not host header enforcement.

**Recommendation:** Sky enable the visible **Enforce HTTPS** setting in the repository's Pages settings when authorizing that production change, then obtain fresh HTTP/alias evidence. Separately decide the host-header residual or scope a future serving-layer configuration. This task must not make production/security setting changes; no code patch can activate Next response headers in a static export.

**Alternative:** Explicitly accept the measured existing-host residual for the private Phase09 baseline and retain host remediation in the release plan, without claiming deployed enforcement. The known public Archive vanity TLS/publication boundary remains P06/P11.

**Impact:** Technical host-risk acceptance remains HOLD until Sky chooses. This is not approval to deploy Portfolio3.0, move hosting, rewrite CSP, publish Archive, or change main.

### 2. Four PostCSS advisories in Next's build dependency

**Observed September7:** Full and production-only npm audits both report2 vulnerable package records:1 high,1 moderate,0 critical. They represent four GHSAs on `next@15.5.25 → postcss@8.4.31`, plus Next's inherited package record. Current npm says `fixAvailable:false`.

**Reachability:** The static public host does not run Next/PostCSS per visitor request. Next's local/CI CSS build processes source files; malicious/compromised CSS or supply chain input remains relevant. No public visitor-to-CSS-build input path was established. Production-only dependency membership does not prove public runtime exploitability.

**Recommendation:** Explicitly accept this exact build-input residual for Phase09 while keeping manifests unchanged and scheduling a separately scoped parent/override evaluation. Full per-GHSA prerequisites and fixed-version facts are in `2026-09-07_Codex_Phase09Dependencies.md` and raw audit evidence.

**Alternative:** Keep Phase09 on HOLD and authorize a bounded dependency remediation investigation and validation. No override or migration has been prepared or tested; the old Phase02 claim that Next16 resolves it is not verified-current.

**Impact:** Advisories remain openly recorded. Approval would accept the scoped risk, not eliminate it, authorize a major upgrade, or permit deployment. No residual acceptance inferred from sleep/silence or Phase02 history.

### 3. Warm-mobile Home performance-confidence limit

**Observed:** six baseline warm-mobile Home samples show0ms fixed-window long-task excess. The final candidate records[0,151,0,0,91,117]ms, median45.5ms. Cold Home has isolated168/275ms spikes too. A focused paired recheck did not remove this difference. LCP remains close/improved in most comparisons, and this proxy is not Lighthouse TBT, INP or field evidence.

**Recommendation:** keep the authored experience and HOLD acceptance pending a narrow controlled investigation that can attribute the recurring difference. The prompt's repeated-measurement-instability boundary prevents treating further identical noisy reruns as proof.

**Alternative:** explicitly accept these exact scoped lab observations/uncertainty for the private baseline, without a field no-regression claim or motion/media change.

**Impact:** no source defect has been diagnosed and no optimization/trade-off is proposed or accepted. P09-C remains HOLD; do not silently flatten the cinematic to reduce a proxy.

## Already resolved within authorization

- Five public Flagstone utility canonicals, sitemap entries and output guard implemented under T130/T132. One additional sitemap/output equality test protects completeness and exclusions.
- SSR test environments corrected without product motion changes.
- fetchPriority warning remains visible only in package-React18 tests; Next App Router's bundled React19 supports the product spelling. No suppression. The prompt requires approval for suppression, not for this bounded documented warning.

Source remains on the isolated local Phase09 branch. No push, main merge, deploy, external send, paid build, auth/private-data change, or Phase10 execution.
