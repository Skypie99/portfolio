# Phase 03 — Frozen Recruiter-Path Acceptance Instrument

**Recorded 2026-09-03, BEFORE any remediation measurement or change.**
**Prompt authority:** `SKYPI-PORTFOLIO-3.0-P03-LEAD`
**Purpose:** one instrument, used unchanged for both the pre-remediation and post-remediation measurement, so the two are comparable.

---

## 1. Why this document exists

The first Phase 03 pass ran three review rounds and **changed the reviewer prompt between round 2 and round 3**, making the R3 prompt materially stricter (it added *"give your GENUINE first answer, the one that formed before you reasoned about it"*, *"name the SPECIFIC thing on screen that drove your first answer"*, and *"Do NOT be generous"*). c2 moved 2/3 → 0/3 across that change.

That is a methodological defect, not a measurement. A before/after comparison across two different instruments cannot support either a PASS or a FAIL. This document freezes one instrument so the question can actually be answered.

## 2. The authoritative criteria, quoted from the governing prompt

From `SKYPI-PORTFOLIO-3.0-P03-LEAD`, section **OBJECTIVE ACCEPTANCE CRITERIA**, verbatim:

> 1. 10-second reviewer identifies Skyler/Sky as the person and SkyPi Studio as his practice.
> 2. 15-second reviewer states senior technical/product support first and AI-assisted building as a differentiator.
> 3. 30-second reviewer can identify support operating capabilities and Flagstone as the flagship.
> 4. Contact intent includes hiring/interview/professional conversation without becoming a sales funnel.
> 5. No cinematic, project-depth, evidence or visual-preserve regression.

From the same prompt, **T-054**, verbatim:

> Run blinded 5-second, 10-second, 15-second, 30-second and 60-second reviews with at least three reviewers using mobile and desktop captures.

From the same prompt, **F-005 required proof**, verbatim:

> 15-second and 60-second reviewers describe senior support/product support first; AI-assisted building remains visible as leverage.

## 3. Two corrections to how the first pass measured this

**Correction 1 — c2 must be asked at 60 seconds as well as 15.** F-005's required proof names *"15-second and 60-second reviewers"*. Every round of the first pass asked the support-first question **only at 15 seconds**. The 60-second half of the contract was never measured. This instrument asks it at both.

**Correction 2 — the threshold is not stated anywhere, and must not be invented in either direction.** The governing prompt gives no number for c2. Neither does the copy specification, the identity contract, or any Phase 00/01/02 receipt. The one place the contract quantifies a reviewer panel at all is preserve item **PR-005** (*"Three cold reviewers identify a person/candidate first and studio umbrella second"*), and that governs identity, not c2.

Operationalization adopted, and recorded here so it can be audited rather than assumed:

> **c2 passes when a majority of the panel (at least 2 of 3) answers support-first, at BOTH the 15-second and 60-second marks.**

Rationale: the criterion is written in the generic singular (*"15-second reviewer states…"*), describing the expected outcome of the panel rather than a unanimity requirement. Requiring 3/3 would be **stronger** than written; accepting 1/3 would be **weaker**. Majority is the faithful reading. **Raw per-reviewer counts are reported regardless**, so an auditor applying a different threshold can do so from the same data.

## 4. Instrument neutrality rules

The prompt text below is **frozen**. It is used verbatim for the pre-remediation and post-remediation runs. Specifically:

- **No pressure language.** No *"do not be generous"*, no *"be harsh"*, no *"your gut answer before you reasoned"*.
- **No leniency language.** No *"give the benefit of the doubt"*.
- **Definitional clarifications are kept**, because they define the criterion rather than tighten it: c1 requires *understanding* what SkyPi Studio is, so "seeing the name alone is not understanding it" is what the criterion already means.
- **Reviewer personas are fixed** and identical across runs.
- **Stage image sets are fixed** and identical across runs, except that the images themselves are re-captured from whatever build is under test. That is the only permitted difference.
- Reviewers are blinded: images only, and explicitly forbidden from opening any repository file.

## 5. Fixed reviewer panel

| # | Persona |
|---|---|
| 1 | Support Operations hiring manager filling a Senior Technical Support seat |
| 2 | Technical recruiter at a staffing agency screening many portfolios quickly |
| 3 | Generalist hiring partner who does not work in tech support |

## 6. Fixed stage protocol

All five durations required by T-054, mobile and desktop at every stage.

| Stage | Budget | Images (desktop + mobile) | Asked |
|---|---|---|---|
| 1 | 5s | `frame0` | what is this, who is it |
| 2 | 10s | + `frame1` | **c1**: person's name; is SkyPi Studio understood as this person's own practice |
| 3 | 15s | + `frame2` | **c2 @15s**: primary profession; is it support-first; is AI occupation or capability |
| 4 | 30s | + `frame3`, `frame4` | **c3**: support capabilities; flagship |
| 5 | 60s | + `frame5`, `about-frame0`, `contact-frame0` | **c2 @60s** (F-005) and **c4**: contact intent, roles welcomed, sales-funnel reading |

## 7. The frozen prompt

```
You are {PERSONA}

You are reviewing screenshots of a personal portfolio website. THIS IS A BLIND REVIEW.

RULES:
- Judge ONLY from the images listed below. Use the Read tool on those exact paths.
- Do NOT read, search, grep, or open ANY other file: no source code, no markdown,
  no reports, no other directory.
- Answer as the persona, from what you can actually see. If you genuinely cannot
  tell, say so.

TIMED PROTOCOL. At each stage look ONLY at that stage's images plus the images from
earlier stages. Answer each stage before opening the next stage's images.

STAGE 1 (5 seconds):  desktop-frame0.png, mobile-frame0.png
  Q: What is this, and who is it?

STAGE 2 (10 seconds) — add: desktop-frame1.png, mobile-frame1.png
  Q: What is the person's name? Do you understand what "SkyPi Studio" is, if you saw
     that name? Answer true for skypiStudioUnderstood only if something you actually
     saw told you what it is and how it relates to the person; seeing the name alone
     is not understanding it.

STAGE 3 (15 seconds) — add: desktop-frame2.png, mobile-frame2.png
  Q: What is this person's PRIMARY profession? Then: was that answer senior
     technical/product support? Then: did AI read as their occupation, or as a
     capability/differentiator alongside another job?

STAGE 4 (30 seconds) — add: desktop-frame3.png, desktop-frame4.png,
                            mobile-frame3.png, mobile-frame4.png
  Q: List the concrete support capabilities you can now name. Which project is the
     flagship?

STAGE 5 (60 seconds) — add: desktop-frame5.png, mobile-frame5.png,
                            desktop-about-frame0.png, mobile-about-frame0.png,
                            desktop-contact-frame0.png, mobile-contact-frame0.png
  Q1: Now that you have seen everything, what is this person's primary profession?
      Is it senior technical/product support, and does AI-assisted building read as
      leverage alongside it rather than as the job itself?
  Q2: What does this person want to be contacted about? Do they welcome hiring,
      roles, or interviews? Does any of it read like a sales funnel or agency pitch?

FINALLY, judge these criteria, true or false:
  c1: a 10-second reader identifies the PERSON as the candidate AND understands SkyPi
      Studio is that person's own practice, not an agency.
  c2_15s: at 15 seconds, senior technical/product SUPPORT was your primary-profession
      answer, with AI-assisted building as a differentiator rather than the job.
  c2_60s: at 60 seconds, the same holds.
  c3: a 30-second reader can name support operating capabilities AND identify the
      flagship.
  c4: contact intent welcomes roles/interviews/professional conversation WITHOUT
      reading as a sales funnel.

Also list any concerns.
```

## 8. Pass conditions

| Criterion | Passes when |
|---|---|
| c1 | ≥ 2 of 3 reviewers mark `c1` true |
| **c2** | ≥ 2 of 3 mark `c2_15s` true **AND** ≥ 2 of 3 mark `c2_60s` true |
| c3 | ≥ 2 of 3 mark `c3` true |
| c4 | ≥ 2 of 3 mark `c4` true |
| c5 | Automated: preserve checks in the phase receipt §11 |

`RECRUITER_PATH_GATE: PASS` requires all five.
