# Phase 11 remote mutation manifest — prepared by Phase 06

**Prepared:** 2026-09-04, America/Vancouver

**Status:** exact local candidate approved 2026-09-05; remote execution remains unauthorized

**Remote execution authority:** Phase 11 only
**Remote mutations during Phase 06:** none

This manifest records intended values and rollback values. It is not an execution script and authorizes no network write, push, merge, deployment, visibility change, or archive action.

## GitHub profile

| Target | Current value | Proposed value | Source evidence | Owner approved | Rollback value | Remote execution authority |
|---|---|---|---|---|---|---|
| Display name | `Sky ` (one trailing space) | `Skyler Halisky` | Phase 06 identity contract and logged-out capture | yes — local candidate only | `Sky ` | Phase 11 only |
| Bio | `Doing my best to explore how technology can help and not hinder accessibility :)` | `Senior technical/product support · investigation, QA, systems thinking · building Flagstone and practical tools with AI assistance at SkyPi Studio` | accepted Portfolio identity plus candidate review | yes — local candidate only | `Doing my best to explore how technology can help and not hinder accessibility :)` | Phase 11 only |
| Profile URL | `www.skypistudio.com` | `https://skypistudio.com` | verified public endpoint, HTTP 200 | yes — local candidate only | `www.skypistudio.com` | Phase 11 only |
| Profile README | repository absent | exact source at `qa-reports/phase06-candidates/GITHUB_PROFILE_README.md` | three independent simulated-candidate reviews | yes — local candidate only | no safe exact rollback yet; repository creation and rollback require separate Phase 11 approval | Phase 11 only |
| Profile README source SHA | none | blob `2917d6f48b2b48b19f3c7af8740fa087a89a2c60` | Portfolio content commit `3b8ada273cfaf1f75805517d10835657a5da397e` | yes — local candidate only | none | Phase 11 only |

## Pins

| Target | Current value | Proposed value | Source evidence | Owner approved | Rollback value | Remote execution authority |
|---|---|---|---|---|---|---|
| Explicit pinned repositories | none | 1. `AccessMap`; 2. `portfolio`; 3. `Prompt_Library`; 4. `Claude_Corp`; 5. `ghost-code`; sixth slot empty | accepted five-project public narrative and simulated-candidate review | yes — local candidate only | restore an empty explicit pin set | Phase 11 only |

## Primary repository metadata

Current topic sets are empty for every repository below. Visibility and archive state remain public/unarchived.

| Target | Current value | Proposed value | Source evidence | Owner approved | Rollback value | Remote execution authority |
|---|---|---|---|---|---|---|
| `AccessMap` description | `AccessMap` | `Flagstone is a community-powered map for reporting and verifying accessibility barriers. AccessMap is the repository and retained technical identifier.` | accepted Phase 02 source and Phase 04 identity | yes — local candidate only | `AccessMap` | Phase 11 only |
| `AccessMap` homepage | `https://access-map-tau.vercel.app` | `https://flagstone.skypistudio.com` | verified endpoint, HTTP 200 | yes — local candidate only | `https://access-map-tau.vercel.app` | Phase 11 only |
| `AccessMap` topics | empty | `accessibility`, `react-native`, `expo`, `typescript`, `supabase`, `maps` | accepted source stack | yes — local candidate only | empty | Phase 11 only |
| `portfolio` description | `portfolio` | `Skyler Halisky’s support-first portfolio: product investigation, QA, systems thinking, and AI-assisted building.` | accepted Phase 05 candidate | yes — local candidate only | `portfolio` | Phase 11 only |
| `portfolio` homepage | none | `https://skypistudio.com` | verified endpoint, HTTP 200 | yes — local candidate only | none | Phase 11 only |
| `portfolio` topics | empty | `portfolio`, `technical-support`, `product-support`, `accessibility`, `nextjs`, `typescript` | accepted source and identity contract | yes — local candidate only | empty | Phase 11 only |
| `Prompt_Library` description | `Local-first AI prompt manager — your prompts, your API key, your browser.` | `Local-first browser prompt manager with reusable variables and direct, user-initiated Anthropic API calls.` | current default source and accepted Phase 05 evidence | yes — local candidate only | `Local-first AI prompt manager — your prompts, your API key, your browser.` | Phase 11 only |
| `Prompt_Library` homepage | `https://skypie99.github.io/Prompt_Library/` | `https://prompts.skypistudio.com` | verified endpoint, HTTP 200 | yes — local candidate only | `https://skypie99.github.io/Prompt_Library/` | Phase 11 only |
| `Prompt_Library` topics | empty | `prompt-library`, `prompt-management`, `local-first`, `privacy`, `nextjs`, `typescript` | current default source | yes — local candidate only | empty | Phase 11 only |
| `Claude_Corp` description | `Claude Corp` | `A 15-role AI collaboration framework with written governance, bounded delegation, and human release authority.` | current default source and accepted Phase 05 evidence | yes — local candidate only | `Claude Corp` | Phase 11 only |
| `Claude_Corp` homepage | `https://claudecorp.skypistudio.com` | unchanged | verified endpoint, HTTP 200 | yes — local candidate only | unchanged | Phase 11 only |
| `Claude_Corp` topics | empty | `ai-agents`, `multi-agent-systems`, `ai-governance`, `human-in-the-loop`, `software-development` | current default source | yes — local candidate only | empty | Phase 11 only |
| `ghost-code` description | `Retro 80s arcade flashcard game for Claude Code + Mac terminal commands` | `A calm, accessible browser-based command trainer for Claude Code, the macOS terminal, and Git.` | current default source/README | yes — local candidate only | `Retro 80s arcade flashcard game for Claude Code + Mac terminal commands` | Phase 11 only |
| `ghost-code` homepage | `https://skypie99.github.io/ghost-code/` | `https://ghostcode.skypistudio.com` | verified endpoint, HTTP 200 | yes — local candidate only | `https://skypie99.github.io/ghost-code/` | Phase 11 only |
| `ghost-code` topics | empty | `terminal-training`, `command-line`, `git`, `claude-code`, `browser-game`, `javascript` | current default source | yes — local candidate only | empty | Phase 11 only |

## Boundary repositories

Sky approved the recommended local candidate values. They remain non-executable until a separately authorized Phase 11 action.

| Target | Current value | Proposed value | Source evidence | Owner approved | Rollback value | Remote execution authority |
|---|---|---|---|---|---|---|
| `mutual-mesh` description | `Mutual Mesh — privacy-first mutual-aid app (private)` | `Privacy-first mutual-aid app with an auth-gated service and a synthetic, read-only guest demo.` | exact default source boundary review | yes — retain public source; local candidate only | `Mutual Mesh — privacy-first mutual-aid app (private)` | Phase 11 only |
| `mutual-mesh` homepage | `https://mutual-mesh.vercel.app` | `https://mutualmesh.skypistudio.com` | current URL redirects to verified custom endpoint; custom endpoint returned 200 | yes — local candidate only | `https://mutual-mesh.vercel.app` | Phase 11 only |
| `mutual-mesh` topics | empty | `mutual-aid`, `privacy`, `react-native`, `expo`, `supabase`, `accessibility` | exact default source | yes — local candidate only | empty | Phase 11 only |
| `mutual-mesh` visibility | public | public | public-source/private-service/synthetic-demo boundary review | yes — retain public | public | Phase 11 only |
| `studio-archive` description | `The Studio Archive — public view-only edition (archive.skypistudio.com)` | `Public, view-only edition of SkyPi Studio’s archive, separate from private authoring and data.` | exact default static-source review | yes — local candidate only | `The Studio Archive — public view-only edition (archive.skypistudio.com)` | Phase 11 only |
| `studio-archive` homepage | none | `https://skypie99.github.io/studio-archive/` | verified fallback 200; approved local canonical/robots/sitemap fallback repair; vanity host fails TLS | yes — temporary fallback | none | Phase 11 only |
| `studio-archive` topics | empty | `digital-archive`, `static-site`, `view-only`, `skypi-studio` | exact default static-source review | yes — local candidate only | empty | Phase 11 only |
| `Ai-portfolio-website` description | none | `Historical portfolio placeholder; current work lives at SkyPi Studio.` | empty-repository inspection | yes — local candidate only | none | Phase 11 only |
| `Ai-portfolio-website` homepage | none | `https://skypistudio.com` | canonical portfolio endpoint, HTTP 200 | yes — local candidate only | none | Phase 11 only |
| `Ai-portfolio-website` topics | empty | empty | repository has no history | yes — retain empty topics | empty | Phase 11 only |
| `Ai-portfolio-website` archive state | unarchived | archived | empty-repository inspection; pointer metadata retained in this manifest | yes — Phase 11 recommendation only | unarchived | Phase 11 only |

No repository rename, deletion, default-branch change, visibility mutation, archive mutation, profile mutation, pin mutation, metadata mutation, push, merge, or deployment is authorized or performed here.
