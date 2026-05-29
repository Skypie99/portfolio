---
phase: 2
role: sky
date: 2026-05-28
status: draft-skeleton
due: 2026-05-30-for-refinement
note: Rough outlines for Sky to refine. Replace bracketed sections with your voice/insights.
---

# Phase 2 Case Studies — Draft Skeletons

**Status:** Starter drafts. Edit these with your actual experience + voice. Due refined by 2026-05-30.

---

## 1. AccessMap

### The Problem
Disabled residents in Vancouver couldn't report accessibility issues efficiently. When they encountered a broken ramp, missing curb cut, or inaccessible entrance, the feedback loop was broken—they'd have to navigate bureaucratic city websites or hope someone noticed. The community needed a direct, fast way to flag problems and verify each other's reports.

### How I Built It
I chose React Native + Expo because learning on a real project meant I needed to ship cross-platform fast. Supabase handled auth + database + real-time verification without me building a backend from scratch. The tradeoff: steep learning curve, but I owned the entire stack end-to-end. I used Postgres RLS to ensure users could only see/edit their own reports, with a security-first mindset.

### What Happened
Launched with 3 testers in Vancouver. Within weeks, the community started verifying each other's reports—peer review worked better than I expected. I learned that accessibility isn't a solo problem; it's a community infrastructure problem.

### Lessons
- Disabled people want agency and community, not charity
- Peer verification scales when trust is built in
- Privacy is foundational in accessibility spaces

---

## 2. Claude Corp

### The Problem
Multi-agent systems are powerful but chaotic—14 roles with different expertise need coordination, shared decisions, and accountability. Without clear rules, agents waste time debating scope or make conflicting decisions. The team needed a written Constitution governing how they collaborate, plan, and ship safely.

### How I Built It
I drafted a Constitution modeled on governance documents—explicit roles, decision-making authority, escalation paths, and constraints. Each role has clear domain boundaries (design, security, testing, etc.) and the PM routes decisions to domain experts instead of guessing. The system is strict: roles can't self-approve; Morgan (PM) surfaces decisions to Sky (founder) for final say.

### What Happened
The Constitution became the operating system for Claude Corp. Agents know their lanes, decisions are traceable, and the team ships with confidence. The written contract removed ambiguity.

### Lessons
- Governance scales chaos into predictability
- Written authority structures beat implicit trust
- Constraints enable autonomy

---

## 3. Pac-Man Code Trainer

### The Problem
Terminal commands and Claude Code syntax are easy to forget. Flashcards are boring. I needed a fun, arcade-style way to memorize developer tools—something engaging enough that repetition feels like play, not work.

### How I Built It
Retro arcade game mechanics (Pac-Man + ghosts + dots) + flashcard content. Vanilla HTML/CSS/JavaScript, no frameworks. The game rewards right answers (Pac-Man chomps the dot) and penalizes wrong ones (ghost takes a life). Each wrong answer is a chance to learn, not a failure.

### What Happened
Built it in a weekend. It's genuinely fun to play, and people remember commands better when they're tied to game wins. Learned that constraints (no frameworks) force creative problem-solving.

### Lessons
- Learning sticks when it's fun
- Constraints unlock creativity
- Simple mechanics beat complex features

---

## 4. Prompt Library

### The Problem
AI prompts are scattered across docs, notes, and memory. I needed a single source of truth for my prompts—searchable, organized, and private. No cloud backend; I wanted everything stored locally in the browser.

### How I Built It
Next.js + browser-only storage (localStorage). 50+ features shipped: search, tags, favorites, export, import, dark mode. The key constraint: API keys never leave the user's machine. Every feature respects local-first privacy.

### What Happened
Built it to solve my own workflow problem, then open-sourced it. Other AI practitioners adopted it. Solo build taught me that thoughtful constraints (local-first) are features, not limitations.

### Lessons
- Local-first privacy is a competitive advantage
- Solo builds force clarity and intentionality
- Eat your own dog food

---

## 5. Mutual Mesh

### The Problem
Mutual aid networks exist in communities, but centralized platforms create surveillance risks—a database of "what people need" is a database of vulnerability. Neighbors want to help each other without a company profiting or snooping.

### How I Built It
E2E-encrypted Expo app. Neighbors post what they can share and what they need; the platform matches them privately without storing requests. No central record. I used Supabase for auth + real-time matching, but encryption + RLS mean the platform itself can't see the data.

### What Happened
Proof of concept with 2 pilot neighborhoods. The privacy-first model worked—people shared vulnerable asks (childcare, food, housing help) because they knew the platform couldn't surveil them. Learned that trust is earned through constraints.

### Lessons
- Privacy is radical for vulnerable communities
- E2E encryption enables trust
- Technology should serve communities, not the reverse

---

## Notes for Refinement

- Add your own details: what surprised you, what you'd do differently, specific user feedback
- Keep it conversational and honest
- Add metrics if you have them (# of reports, # of users, adoption timeline)
- The "Lessons" bullets should reflect what *you* actually learned, not generic takeaways

Feel free to completely rewrite sections if the voice doesn't match yours. These are starters, not final.

---

**Next:** Will uses these to build full narratives (5–7 days editing). Shamus uses the structure to design case study page layout. Gary validates alt text + markup.
