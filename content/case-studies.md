# Case Studies

## 1. Flagstone

**Problem**
I was learning to code by building a real product, which meant I needed both a use case and accountability. Disabled friends in Vancouver were frustrated: when they hit a broken ramp or missing curb cut, reporting it meant navigating the city's bureaucratic feedback forms or hoping someone in power noticed. They had to describe the problem over and over. There was no community loop—no way to signal "this is still broken" or "someone's already fixed it." I saw the gap and knew I could build a faster channel.

**Process**
I chose React Native + Expo specifically to force myself to learn cross-platform code while shipping something real. Supabase handled auth and the database, so I could focus on the domain (accessibility verification) instead of infrastructure. The biggest decision: implementing Postgres RLS so users could only see and edit their own reports. It was a security-first move that taught me privacy isn't a feature you add later—it's a foundation you build from the start.

The hardest part wasn't the code; it was learning to listen. My first designs missed what actually mattered to testers. They wanted community verification, not just a reporting channel. That shifted everything.

**Outcome**
Launched with 3 testers. Within weeks, peer verification kicked in—people weren't just reporting problems; they were confirming them, sharing workarounds, celebrating fixes. That gave me a core insight: accessibility barriers feel lonely when you're facing them alone, but solving them together is powerful. The app is still in use by Vancouver's disability community.

**What I Learned**
- Disabled people want agency and reciprocity, not charity
- Peer verification scales when trust is the foundation
- Privacy is foundational in spaces where people share vulnerability

---

## 2. Claude Corp

**Problem**
I had built Flagstone solo, but bigger projects need more hands. I started working with collaborators and hit the wall immediately: without clear decision rights, we debated scope constantly. One person would start building while another thought we were still in design. No clear escalation path. I realized multi-agent systems need *rules*, not just good intentions.

**Process**
I drafted a Constitution—literally, like a government document. Each role has explicit domain boundaries (design, security, testing, deployment). Morgan (the PM) routes decisions to the domain expert instead of guessing. Sky (me) holds the final call on trade-offs. The system is strict: agents can't self-approve major decisions. It sounds heavyweight, but the rules actually freed people—they knew their lanes and could move fast within them.

The breakthrough was treating governance as infrastructure. Code needs architecture; teams need constitutions.

**Outcome**
Claude Corp went from 3 people debating scope to 15+ agents shipping in parallel. Each person knows exactly what decisions are theirs, what goes to their domain expert, and what escalates to me. The Constitution lives in GitHub and gets updated when we discover new patterns.

**What I Learned**
- Written governance removes ambiguity more powerfully than trust alone
- Constraints enable autonomy instead of limiting it
- Process scales teams; ad-hoc doesn't

---

## 3. Pac-Man Code Trainer

**Problem**
I was constantly forgetting Claude Code commands and macOS shortcuts. Flashcards are the right learning tool, but they're *boring*. I wanted something engaging enough that repetition felt like play, not work—something that rewarded right answers and made wrong ones feel like a chance to learn, not failure.

**Process**
I built it in a weekend using vanilla HTML/CSS/JavaScript. No frameworks. The constraint forced creativity: every feature had to be simple enough to implement in pure JavaScript. The game mechanics (Pac-Man collecting dots, ghosts chasing) aren't decoration—they're the entire learning system. Right answers = Pac-Man chomps the dot. Wrong answers = ghost takes a life. That's it.

The constraint was the design. Frameworks would have added weight and abstraction. Vanilla JavaScript meant I had to think about every feature twice.

**Outcome**
Built it to solve my own problem. Other developers found it useful. The game genuinely works—people remember commands better when they're tied to arcade wins. It's simple enough that it's still easy to maintain and extend.

**What I Learned**
- Constraints unlock creativity, not limit it
- Learning sticks when it's fun
- Simple mechanics outperform complex features
- Eat your own dog food; build for yourself first

---

## 4. Prompt Library

**Problem**
My AI prompts were scattered across notes, docs, and memory. I needed a single source of truth—searchable, organized, and completely private. I didn't want my prompts or API keys touching a cloud backend. Everything had to stay on my machine.

**Process**
Built it in Next.js with browser-only storage (localStorage). That one constraint—"API keys never leave the user's machine"—shaped every feature. Search? localStorage query. Tags? localStorage index. Favorites, export, import, dark mode—all local-first. I shipped 50+ features without a backend.

The local-first approach meant every feature had to be thoughtfully designed. You can't cheat with a server. That discipline made the product better.

**Outcome**
Solved my own workflow problem, then open-sourced it. Other AI practitioners adopted it. Built a small community of users who wanted the same privacy-first approach. It's still the simplest, most trustworthy prompt manager out there.

**What I Learned**
- Local-first privacy is a competitive advantage, not a limitation
- Solo builds force clarity—you own every decision
- Privacy constraints improve design, not burden it

---

## 5. Mutual Mesh

**Problem**
Mutual aid networks exist in communities, but centralized platforms are surveillance risks. When an app stores "what people need," it becomes a database of vulnerability—a target for data breaches, corporate profit, or government oversight. I wanted neighbors to help each other without platforms profiting or snooping. The challenge: how do you enable matching without storing the data?

**Process**
Privacy-first Expo app. Neighbors post what they can share and what they need; the platform matches them privately without keeping a central record of vulnerability. The platform uses Supabase for auth and real-time matching, but encryption + RLS mean the platform itself is blind to the content. Even I can't see the requests.

That constraint—not knowing what people need—felt backward at first. But it's the entire point. Trust comes from limits, not promises.

**Outcome**
Proof of concept with 2 pilot neighborhoods. People shared vulnerable asks (childcare, food, housing help) because they *knew* the platform couldn't surveil them. The privacy-first model worked better than I expected.

**What I Learned**
- Privacy is radical for vulnerable communities
- Trust is earned through constraints, not promises
- Technology should serve communities, not extract from them
- Privacy-first design enables the requests that platforms would suppress

---
