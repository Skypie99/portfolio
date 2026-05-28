# 📋 CASEY — PHASE 1 DISPATCH: Certificate Integration

**Date:** 2026-05-28 18:15 UTC  
**Authority:** Morgan (Standing Approval — Safe + Quality + Forward Momentum)  
**Status:** APPROVED & READY FOR PHASE 1 EXECUTION

---

## YOUR PHASE 1 TASK (EXPANDED)

**Original scope:** Expand Portfolio About page (5 min)  
**Updated scope:** Expand About page + integrate real AI certificates (10 min total)

---

## WHAT'S CHANGED

**Certificates have been replaced with 6 real credentials you've earned:**

1. **AI Fluency Framework & Foundations** — Anthropic (May 2026, credential ef3fxd6rptc5)
2. **Introduction to Claude Cowork** — Anthropic (May 2026, credential rgnu9r9tyfoj)
3. **Claude 101** — Anthropic (May 2026, credential 9twktanftgpq)
4. **Google Prompting Essentials Specialization** — Google (Jul 2025, credential MIQJBUVPS86V)
5. **Programming for Everybody (Getting Started with Python)** — University of Michigan (Jun 2025, credential LNNCK1O38M7U)
6. **AI For Everyone** — DeepLearning.AI (Jun 2025, credential 5Z1UGVB7BO2N)

**Updated file:** `/Users/skypie/Portfolio/content/certificates.json` (live, ready to render)

---

## YOUR EXECUTION (10 MIN TOTAL)

### 1. Expand About Page (5 min)
- Add 2–3 new original paragraphs to `/app/about/page.tsx`
- Distinct from homepage bio
- Keep existing direct-nav About accessible
- Content should naturally flow into certificate display (e.g., "Here's what I've studied formally..." → link to /certificates)

### 2. About Page → Certificates Link (2 min)
- Add a natural transition link in the About expanded section pointing users to `/certificates`
- Example: "For a complete list of credentials, see my [certificates page](/certificates)."
- Keep it simple — one sentence, no oversell

### 3. Certificate Page Rendering (design already handled)
- The `/certificates` page already exists at `/app/certificates/page.tsx`
- It renders a beautiful 3-column grid (Blush cards, proper typography, accessibility locked in)
- All 6 credentials now display with:
  - Issuer name
  - Credential title
  - Issued date (formatted "ISSUED MAY 2026")
  - "View credential" link with external arrow indicator
  - Placeholder for badge image (see below)

### 4. Badge Images (User Action Required)
- Badge image files go in `/public/images/certificates/<issuer-id>/badge.png`
- The page expects these paths (currently placeholder references):
  - `/public/images/certificates/anthropic-ai-fluency-2026/badge.png`
  - `/public/images/certificates/anthropic-cowork-intro-2026/badge.png`
  - `/public/images/certificates/anthropic-claude-101-2026/badge.png`
  - `/public/images/certificates/google-prompting-essentials-2025/badge.png`
  - `/public/images/certificates/umich-python-2025/badge.png`
  - `/public/images/certificates/deeplearning-ai-for-everyone-2025/badge.png`

**Action:** You can download badge images from each issuer (Anthropic, Google, UMich, DeepLearning.AI) and drop them in the folders. If images aren't available yet, the page will render with Blush card backgrounds (still looks good — the component is forgiving).

---

## PHASE 1 SEQUENCE

You execute **after Gary validates all 40/40 tests pass** (he runs post-Will's URL merge).

**Your signal:** Gary's test pass notification  
**Your action:** About expansion + cert link  
**Your handoff signal:** "About + cert link merged" → triggers Morgan synthesis  
**Duration:** 10 min  

---

## WHAT MAKES THIS LOOK GOOD

✅ **Existing design system** — The /certificates page already has:
- Typography hierarchy (serif h3 titles, mono metadata, sans body)
- Color palette (Blush cards on Cream background, terracotta accents, proper contrast)
- Spacing rhythm (consistent gaps, breathing room)
- Accessibility (h1 → h2 sr-only → h3 cards; focus states; link indicators)
- Grid responsiveness (3-col md+, 1-col mobile)

✅ **Credential metadata** — All 6 certs include:
- Real issuer names
- Real issued dates
- Real credential IDs (visible in links for verification)
- Direct links to verification on issuer platforms

✅ **About page integration** — Your expanded About naturally leads readers to proof of learning.

---

## CHECKLIST

- [ ] Expand `/app/about/page.tsx` with 2–3 new original paragraphs
- [ ] Add one sentence linking to `/certificates` page
- [ ] (Optional) Drop badge PNGs into `/public/images/certificates/` folders
- [ ] Commit to Phase 1 branch
- [ ] Push and notify Gary/Morgan of merge completion

---

## CONTACT

Once Gary's tests pass, execute this immediately. If you hit any questions on the About content direction or certificate display, reach out to Morgan.

**Status:** ✅ Ready. Awaiting Gary test pass signal (Phase 1 cascade trigger).
