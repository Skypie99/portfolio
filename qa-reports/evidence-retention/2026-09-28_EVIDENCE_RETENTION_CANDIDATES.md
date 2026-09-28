# Evidence-retention candidate census (2026-09-28)

> **Status: `CENSUS_ONLY`. Nothing here is authorized for removal.** This is a point-in-time, read-only census of the committed evidence estate and a candidate list for any future archival decision. No file listed here was deleted, moved, compressed, or pruned. Any removal requires the prerequisites in [`docs/EVIDENCE_RETENTION.md`](../../docs/EVIDENCE_RETENTION.md) §5, including explicit owner authorization.

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Finding | Audit F-003 (committed evidence mass) |
| Method | Read-only `git ls-files` + file size + SHA-256; commands in [`docs/EVIDENCE_RETENTION.md`](../../docs/EVIDENCE_RETENTION.md) §6 |
| Deletion performed | NONE |
| Owner gate | `OWNER_AUTHORIZATION_REQUIRED_FOR_IRREVERSIBLE_EVIDENCE_REMOVAL` |

## 1. Estate totals (tracked files)

| Surface | Files | Size |
|---|---|---|
| `qa-reports/` | 962 | 198.57 MB |
| `design-reviews/` | 210 | 77.14 MB |
| `cinematic-masters/` | 13 | 91.68 MB |
| `summaries/` | 16 | 0.13 MB |
| **Evidence estate (the four rows above)** | **1,201** | **367.53 MB** |
| `public/` (shipped assets) | 271 | 28.57 MB |
| **Whole repository (tracked)** | **1,816** | **399.05 MB** |

Counts are `git ls-files` as measured on 2026-09-28; they exclude this census and `docs/EVIDENCE_RETENTION.md` (adding this file increments `qa-reports/` by one).

## 2. Review-class summary

| Class | Where | Disposition |
|---|---|---|
| Shipped assets | `public/` | `AUTHORITATIVE_CURRENT` — never a candidate |
| Dated receipts + cited raw evidence | `qa-reports/` | `RELEASE_EVIDENCE` — never a candidate |
| Dated review programs | `design-reviews/` | `HISTORICAL_RECEIPT` — retain |
| June 2026 pass reports | `summaries/` | `HISTORICAL_RECEIPT` — retain |
| Cinematic regeneration masters | `cinematic-masters/` | `REGENERATION_MASTER` — retain |

## 3. Large-file candidates (over 500 KB) — for review only

**187 files, 304.47 MB in total.** The largest are listed to show the shape; none is authorized for removal.

| Size | Path |
|---|---|
| 17.23 MB | `public/videos/amazon-night-flight.mp4` (owner-documented as the noindexed `/runway` page) |
| 10.75 MB | `cinematic-masters/planes/arrival-fg.png` |
| 9.92 MB | `cinematic-masters/planes/mid-mid.png` |
| 9.92 MB | `cinematic-masters/planes/mid-fg.png` |
| 8.97 MB | `cinematic-masters/planes/dawn-fg.png` |
| 8.97 MB | `cinematic-masters/planes/dawn-mid.png` |
| 8.62 MB | `cinematic-masters/planes/arrival-cliff.png` |
| 7.24 MB | `cinematic-masters/source/arrival-cliff.png` |
| 7.17 MB | `cinematic-masters/source/mid-approach.png` |
| 6.77 MB | `cinematic-masters/source/dawn-vista.png` |
| 5.93 MB | `cinematic-masters/source/arrival-cliff-newest.png` |
| 3.76 MB | `qa-reports/phase-07-repair3/portrait-dark-440-first.png` |

Observation: the largest mass is concentrated in the cinematic masters (`cinematic-masters/`, 91.68 MB in 13 files), which are `REGENERATION_MASTER` — they back the protected scene and are the hardest evidence to regenerate off Sky's machine. They are **not** deletion candidates.

## 4. Exact-duplicate candidates (SHA-256) — for review only

**142 byte-identical groups at 1 KB or larger; 211 redundant copies; 42.31 MB of duplicated bytes.**

| Copies | Size each | Example paths |
|---|---|---|
| 3 | 0.95 MB | `qa-reports/phase04-evidence/{before,after}/1440-light-case-study.png`, `qa-reports/phase04-hold-resolution-evidence/after/1440-light-case-study.png` |
| 3 | 0.90 MB | `qa-reports/phase04-evidence/{before,after}/1440-light-flagship.png`, `qa-reports/phase04-hold-resolution-evidence/after/1440-light-flagship.png` |
| 3 | 0.90 MB | `qa-reports/phase04-evidence/{before,after}/1440-dark-case-study.png`, `qa-reports/phase04-hold-resolution-evidence/after/1440-dark-case-study.png` |
| 2 | 1.02 MB | `qa-reports/phase04-evidence/{before,after}/1440-dark-flagship.png` |
| 3 | 0.82 MB | `qa-reports/phase04-evidence/{before,after}/1280-light-case-study.png`, `qa-reports/phase04-hold-resolution-evidence/after/1280-light-case-study.png` |

**Critical caveat:** many of these are byte-identical **before/after pairs that legitimately share a frame** and can be *identical by design* when a pass changed nothing on that surface (the largest groups are exactly `phase04-evidence/before` ≡ `phase04-evidence/after`). Removing one half of a before/after pair would silently break its comparison narrative. A further class, the zero-byte collisions (e.g. `public/.nojekyll` versus empty log files), are placeholders, not duplicates. **No group in this census is safe to collapse on the strength of the hash alone.**

## 5. Deletion prerequisites (checklist)

Before any path above is retired, all of the following must hold and be recorded:

- [ ] Owner authorization recorded for the specific removal.
- [ ] The path is not cited by any surviving receipt or manifest.
- [ ] The content is preserved in git history (no history rewrite).
- [ ] A kept/dropped manifest with SHA-256 is committed with the removal.
- [ ] The retirement is a dedicated, bounded task, not mixed with other work.
- [ ] The path is not a receipt, a banner, or the only copy of unique evidence.

## 6. What this census deliberately does not do

- It does **not** delete, move, re-encode, or prune anything.
- It does **not** rewrite git history.
- It does **not** treat a hash match as proof of redundancy, because the before/after and twin-capture structure is part of the evidence record.

---

*Executed by the post-merge professionalism repair (continuation), 2026-09-28. No remote action.*
