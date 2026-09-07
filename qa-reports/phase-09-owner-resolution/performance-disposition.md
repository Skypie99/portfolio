# Mobile Home owner confirmation — 2026-09-07

MOBILE_HOME_PERFORMANCE: OWNER ACCEPTED WITH MEASUREMENT UNCERTAINTY

PERFORMANCE_REGRESSION: NOT ESTABLISHED

One predeclared eight-pair confirmation completed:32/32 records, Home/mobile only,16 fresh seeds and16 warm reloads. Exact original baseline348 files and final candidate350 files were independently rehashed before execution, with zero mismatch. Existing Chromium149.0.7827.55 and original local Node serving/4×CPU/150ms network/390×844 DPR3 configuration were reused. Artifact provenance, complete raw rows (lossless gzip), executable harness, protocol, logs and summary are alongside this receipt. No build/test/installation workloads ran during the lab; lightweight documentation and registry reads did run on the shared host. OS scheduling/thermal background load is uncontrolled.

| Measurement | Phase00 baseline | Phase09 candidate |
|---|---|---|
| Warm long-task excess, eight values(ms) | 57,0,0,45,25,0,0,966 | 0,0,0,114,0,152,133,0 |
| Warm long-task median/range(ms) | 12.5 /0–966 | 0 /0–152 |
| Warm LCP median/range(ms) | 486 /308–920 | 518 /356–584 |
| Fresh long-task median/range(ms) | 62 /28–391 | 100.5 /33–242 |
| Fresh LCP median/range(ms) | 7264 /6356–7676 | 6612 /6504–6900 |

Paired warm candidate-minus-baseline excess:[-57,0,0,69,-25,152,133,-966]ms; three positive, three negative, two equal; median0ms. Paired warm LCP deltas:[-116,-24,-76,-4,52,128,256,-480]ms, median-14ms. The difference of group medians (+32ms LCP) is a different statistic; both are retained. All32 CLS values0, no navigation/console/network/HTTP failures. All16 warm rows have0 resource-transfer bytes (main document excluded per original method). No samples were discarded, including the large baseline966ms observation.

The additional long-animation-frame observer was applied equally to both artifacts. It shows occasional blocking frames in both. Some candidate frames list the same two chunk URLs (16a045e0-ff2093c435825769.js and63-9bba43e74bb4f0b2.js), but reported script durations are about5–9ms each and do not account for the whole53–135ms blocking duration. Other frames have no script attribution. Baseline also has unattributed frames and a single264.5ms webpack script event in its largest outlier. These records do not identify a consistent candidate source cause. Frame blockingDuration differs from the post-FCP long-task proxy, so their numbers are not substituted for one another.

Candidate warm spikes recur in3/8 samples, but this run does not reproduce a baseline-always-zero/candidate-consistently-worse distribution. Fresh proxy medians also differ, with broad overlap and baseline spikes up to391ms; fresh LCP is generally faster in the candidate. The evidence remains compatible with local/runtime variance; it does not prove variance is the sole cause or prove absence of all regressions. No consistent candidate-caused user-facing regression with identifiable source ownership is established. Under Sky's explicit decision, uncertainty is accepted. No speculative optimization, code change, further measurement run or Phase10 matrix follows.

## Original limitation retained verbatim in substance

Original local Chromium comparison:132 records. Warm-mobile Home baseline0ms in six samples; candidate[0,151,0,0,91,117]ms, median45.5ms, spikes91/117/151ms. Original full evidence and HOLD-era receipts are preserved. The new32 records are a separate bounded confirmation, not replacements or a reweighted combined score. Both studies use a fixed-window long-task proxy: NOT INP, NOT Lighthouse TBT, NOT field Core Web Vitals. No interaction-response or real-user impact was measured.
