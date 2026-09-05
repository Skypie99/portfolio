# Phase 06 repository inventory

**Observed:** 2026-09-04, America/Vancouver

**Method:** read-only GitHub API metadata, fetched remote default refs, and exact local Git object inspection
**Remote mutations:** none

## GitHub profile

| Field | Current logged-out/API truth |
|---|---|
| Login | `Skypie99` |
| Display name | `Sky ` (one trailing space) |
| Bio | `Doing my best to explore how technology can help and not hinder accessibility :)` |
| Link | `www.skypistudio.com` |
| Profile README repository | absent; `Skypie99/Skypie99` returned 404 |
| Explicit pins | none |
| Public repositories | 8 |

## Repository identity and current remote truth

| Repository | Remote default SHA | Tree | Visibility / archived | Current description | Current homepage |
|---|---|---|---|---|---|
| `Skypie99/portfolio` | `19d946c9c48b325bce5d3a9f292d2cb48450cf01` | `ee0be9130c2b4f9de5de956c6cdc33b9d151c682` | public / no | `portfolio` | none |
| `Skypie99/AccessMap` | `70b52a30e9fff0f7d538509b110212bb8d872391` | `847f39f6d8e5d7feb28af0f5da823034ce19f848` | public / no | `AccessMap` | `https://access-map-tau.vercel.app` |
| `Skypie99/Prompt_Library` | `78b961ec6f3dd05c5ffc8dae4c948a76eb1ab8c4` | `b54d88a0654d55cb426d3bf715cc5c93b6cd33a4` | public / no | `Local-first AI prompt manager — your prompts, your API key, your browser.` | `https://skypie99.github.io/Prompt_Library/` |
| `Skypie99/Claude_Corp` | `9612389bdfdb6cab1613f266c207ebfb8eb00c70` | `8f7bdd51194dd6a86a4d7b6957705e100e1ada35` | public / no | `Claude Corp` | `https://claudecorp.skypistudio.com` |
| `Skypie99/ghost-code` | `bb1ba5e708c9547ef50bc9c050c75fba511f409b` | `c4b806ce4900e464bc4b1aa915d99e8ad9eeb3a5` | public / no | `Retro 80s arcade flashcard game for Claude Code + Mac terminal commands` | `https://skypie99.github.io/ghost-code/` |
| `Skypie99/mutual-mesh` | `93f5928c3a5d8607f75d5889f502499033249aae` | `d2519386c0ef650a9a93bef59be60e56e388ccd1` | public / no | `Mutual Mesh — privacy-first mutual-aid app (private)` | `https://mutual-mesh.vercel.app` |
| `Skypie99/studio-archive` | `831c0aa53574aa539d06caac5adeae0bca966c0e` | `0e59f55bb15624f188e6160a04172b72a70b9a15` | public / no | `The Studio Archive — public view-only edition (archive.skypistudio.com)` | none |
| `Skypie99/Ai-portfolio-website` | no commit/ref | no tree | public / no | none | none |

All eight repositories had an empty topic set when observed. GitHub reports `main` as the configured default branch for the empty placeholder, but no default-branch ref or commit exists.

## Phase 06 source anchors

The accepted Portfolio Phase 06 entry source is local commit `2c89a8e24e1b6693bd4c9239a55d796a64ca0355`, tree `49b6d9feb3a348981668d6dad2aa088c03a2df7d`; it intentionally differs from current remote `origin/main` because it is an accepted unpublished candidate.

The AccessMap documentation candidate is anchored to accepted Phase 02 commit `c2e36800b269ee22f29d0be35cfb88dace7c2afc`, tree `7a68541462f0a9e1d55f48d98ea54df0fc0b01b7`, rather than treating current remote `origin/main` as accepted release proof.

## Link observations

`skypistudio.com`, both Flagstone domains, Claude Corp, Prompt Library, Ghost Code, Mutual Mesh, and the Studio Archive GitHub Pages fallback returned HTTP 200. `https://archive.skypistudio.com` failed TLS hostname verification. The public static Studio Archive fallback emits that broken vanity host as its canonical URL. The live private Portfolio `/archive/` route returned HTTP 200 and `noindex,nofollow`; source declares its own portfolio canonical, while the observed live HTML parser did not find a canonical link. Those are separate evidence surfaces.
