# LENS 8 — THE SEAMS (banked 2026-08-07)

**Method:** buffered layout-shift observation on fresh load, img attribute census, icon/meta/OG inventory + exact-URL content-type fetches, feed fetches, 404 walk, OG card render. Live `45f6632`.

## Measured

- **CLS on fresh home load: 0.00000, zero shift entries.** (The estate's own floor is ≤0.004; live sits at zero on this load. Throttled-network CLS remains the one un-instrumented axis this run — pane cannot throttle; prior trains' banked worst-case 0.0003 stands.)
- **Images:** 16 on home — 11 lazy / 4 eager above-fold, 15 async-decoding, 0 empty-src after hydration, dimensioned or container-reserved (CLS 0 is the proof). Pop-in: ThemedShowcase fades via its own opacity layer — graceful, no raw pops observed on painted pages.
- **Console:** one error per route load on live — the meta-CSP `frame-ancestors` complaint. AFU (UP-01, `40c1475`). After the merge the console floor is 0 across 9 routes (verified in P11's re-run).

## The unfurl layer

- **Every route unfurls as itself on live** (og:url + own title verified on /certificates/, /contact/, /work/accessmap/) — **TA-10 is substantially healed on live already** (the showcase OG pass shipped inside `45f6632`); the carried truth commit `e12107e` completes/hardens it (own images+descriptions for certs/contact). Correcting the dedup register's assumption that TA-10 was wholly unmerged.
- **All 6 /work/ OG images: 200, `image/jpeg`** (exact-URL verified; an earlier 404 reading in this run was my own path reconstruction — retracted). Home `opengraph-image.png`: 200 `image/png`. **TA-11's octet-stream risk is not reproducible on live** — extensions + correct types everywhere probed; carried commit `7ac9139` stays harmless belt-and-braces.
- **The OG card is composed brand-ware:** paper gradient, terracotta rule, tracked small-caps URL, serif name, sun-over-horizon mark echoing the favicon. The unfurl is art already. (Mutual Mesh still unfurls its legacy un-themed `card-feed.jpg` — the known showcase-lane gap, Sky's asset queue.)

## Chrome & identity seams

- **Favicon: a drawn SVG sun-over-horizon with an authored comment block** ("golden-hour desert sun cresting the horizon… reads at 16px") — designed, self-documenting, `sizes=any`, plus 180px apple-touch icon. **`theme-color` per scheme** (#FAF8F1 / #15191A) — browser chrome joins the theme. No dark-variant favicon media internally — at 16px the warm mark holds on dark tabs (observed in this pane); no finding.
- **Titles:** every route sampled carries "X — Sky Halisky" + descriptive meta. Craft holds.

## Rooms & states

- **404 is a furnished room:** breadcrumb "HOME / 404", serif "Nothing here.", two exits (homepage pill + "OR BROWSE THE WORK →"), full sidebar/footer chrome, entrance choreography — and its copy uses proper typographic apostrophes, which further evidences the estate's *mixed* punctuation (Lens 2 item).
- **Feeds:** `/feed.xml` 200 `application/xml` + `/feed.json` 200 JSON, correctly advertised from /blog/ (the speculative `/rss.xml` 404s but nothing references it — no finding).
- **humans.txt still ships the "NEEDS-SKY COPY (placeholder — not final)" header to strangers** — known (T18/TA-9, Sky's words; queue stands).
- **TKTK strip live on the flagship** (TA-2) — the loudest seam on the estate; Sky-gated wording; the case-for-action table carries it.

## Lens-8 outputs

- No new ledger item: the seams are the estate's quiet triumph — CLS 0, designed 404, designed favicon, per-scheme chrome, resolving unfurls, valid feeds. What's broken here was already caught (UP-01) or is Sky's wording (TKTK, humans.txt).
- Register corrections recorded: TA-10 substantially healed live · TA-11 not reproducible live · blog card-flag serves 200 today (earlier-train claim of a live 404 not reproducible 2026-08-07).
