# OG META TAGS IMPLEMENTATION — Portfolio

**Delegated to:** Peter (Infrastructure/DevOps)  
**Authority:** Morgan autonomous deployment (safe + scoped)  
**Timeline:** 20 min  
**Scope:** Add Open Graph + Twitter meta tags to layout

---

## THE WORK

When Portfolio is shared on LinkedIn, Slack, Twitter, it needs rich preview metadata. Currently missing.

**Goal:** Add OG + Twitter meta tags so shares show title, description, and thumbnail image (Constitution Art. 7 — media sharing support).

---

## EXECUTION SCOPE

1. **Open** `app/layout.tsx` (or root metadata config)
2. **Add OpenGraph metadata:**
   ```
   og:title: "Sky Halisky — Accessibility Builder + Learner"
   og:description: "A portfolio of accessibility projects, learning experiments, and open-source contributions."
   og:image: (choose: portfolio screenshot or your avatar from AccessMap)
   og:url: https://skypie99.github.io/portfolio/
   ```
3. **Add Twitter Card metadata:**
   ```
   twitter:card: summary_large_image
   twitter:title: (same as og:title)
   twitter:description: (same as og:description)
   twitter:image: (same as og:image)
   ```
4. **Verify syntax** (no malformed tags, all URLs absolute)
5. **Build + test** (verify meta tags render in Next.js metadata output)
6. **Commit** with message: "Add OG + Twitter meta tags for social sharing"
7. **Report:** qa-report to `~/portfolio/qa-reports/2026-05-28_Peter_OGMetaTags.md`

---

## SCOPE NOTES

This is **final gate before Sky merge** — no design dependencies. Ship when complete.

---

## NEXT STEP

Add metadata, verify, build, report.

---

**Morgan standing by. Final gate before merge. ✓**
