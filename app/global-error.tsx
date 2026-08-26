'use client';

/**
 * Global error boundary (L7-01 rider, 2026-07-04) — replaces Next's unbranded
 * "Application error: a client-side exception has occurred" cream page on the
 * rarer crash path (an exception during hydration/render that escapes every
 * nested boundary). Mirrors the /404/ designed-dead-end grammar: identity,
 * one reassurance line, ranked exits.
 *
 * DELIBERATELY CSS-INDEPENDENT: this can render at the exact moment a CSS chunk
 * failed to load (the same dropped-resource class the reveal floor guards), so
 * it uses ONLY inline styles with literal brand hex — never Tailwind tokens or
 * the app stylesheet, which may be the thing that didn't arrive. It renders its
 * own <html>/<body> (it replaces the root layout) and shows no stack trace.
 *
 * COPY: RATIFIED 2026-08-26 (THE ROOM Phase J). The eyebrow / heading / body
 * below shipped 2026-07-04 marked "on-brand placeholders … replace with your
 * final wording before merge" — and then merged, and stayed live on every
 * route's crash path for seven weeks while appearing in no ledger. Phase J's
 * sweep for deferred markers found it; Sky read it and adopted it as written,
 * so these are final words now, not scaffolding. Colours, layout, exits, and
 * the CSS-independence remain the load-bearing parts.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Literal brand values (app/globals.css tokens, resolved) — no stylesheet dep.
  const CANVAS = '#FAF8F1'; // --rgb-canvas
  const INK = '#20302C'; // --rgb-ink
  const META = '#5A6B64'; // --rgb-ink-meta
  const ACCENT = '#B96340'; // --rgb-accent (CTA / ≥large text) — fine for the H1 heading below.
  // H3 (THE ROOM Phase H): the "Try again" button pairs CANVAS text on an
  // ACCENT fill at 15px normal — the axe re-audit measured that pairing at
  // 4.02:1, under the 4.5 floor ("≥large text" doesn't cover a button
  // label). ACCENT itself is untouched; this is ACCENT darkened until
  // CANVAS-on-it clears AA (5.26:1), for the button fill only.
  const ACCENT_BUTTON = '#9D5436';
  const LINK = '#A35636'; // --rgb-accent-ink (small links, ≥4.5:1)

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background: CANVAS,
          color: INK,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          boxSizing: 'border-box',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <main style={{ maxWidth: 540, width: '100%' }}>
          <p
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: META,
              margin: '0 0 1.5rem',
            }}
          >
            Sky Halisky
          </p>
          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: 'clamp(2rem, 8vw, 3.25rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: ACCENT,
              margin: '0 0 1rem',
            }}
          >
            Something went sideways.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.65, maxWidth: 460, margin: '0 0 2rem' }}>
            A part of this page didn{'’'}t load. Reloading usually fixes it
            {'—'} and the homepage and the work index are both one tap away.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                font: 'inherit',
                fontSize: 15,
                padding: '0.7rem 1.4rem',
                cursor: 'pointer',
                background: ACCENT_BUTTON,
                color: CANVAS,
                border: 'none',
                borderRadius: 999,
              }}
            >
              Try again
            </button>
            {/* Plain <a> (not next/link) is deliberate here: the boundary renders
                outside the router, and a hard navigation does a full document
                reload that escapes the broken client state — the right behaviour
                for crash recovery, and it keeps this page CSS/router-independent. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" style={{ color: LINK, fontSize: 15 }}>
              Back to the homepage
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/work/" style={{ color: LINK, fontSize: 15 }}>
              Browse the work {'→'}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
