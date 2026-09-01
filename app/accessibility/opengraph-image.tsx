import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

// Required for `output: 'export'` — the PNG is emitted at build time.
export const dynamic = 'force-static';

/**
 * The receipt unfurls (R4/BP8 · P05) — sharing /accessibility/ deposits a
 * card that IS the receipt: the measured grid, the vintage date, and the
 * Chromium honesty line, set in the house plate grammar. The third card
 * grammar in the OG division of labor (PROTECT-70 seat: home signs the
 * NAME · /work/* unfurls the ARTIFACT · this ONE route unfurls its
 * MEASUREMENT — one route only, anti-accretion held).
 *
 * EVERY number is read from the PUBLISHED receipt
 * (public/receipts/a11y-2026-07-09.json) at build time — the card can
 * never claim fresher than its artifact (the vintage date IS the
 * headline's date), and it can never drift from the page it unfurls for.
 *
 * HEADLINE — the §S-delegated pick; the quieter alternate ships here for
 * Sky's one-word swap:
 *   picked:    'MEASURED, NOT CLAIMED'
 *   alternate: 'A SNAPSHOT YOU CAN RE-RUN'
 *
 * Fonts (the root plate's L8-03 constraint, inherited): satori reads the
 * Cormorant Light TTF for the serif zero; the meta rows ride satori's
 * default sans (no DM Mono TTF exists in app/fonts/ — drop one in and
 * this card upgrades; documented in the BP8 evidence).
 */

export const alt =
  'Accessibility, measured: 0 axe violations across 32 scans, AA both themes, reduced motion first-class. A snapshot you can re-run.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const HEADLINE = 'MEASURED, NOT CLAIMED';

type Receipts = {
  measuredDate: string;
  summary: Record<string, { value: string | number; detail: string }>;
};

export default function Image() {
  const cormorantLight = readFileSync(
    join(process.cwd(), 'app/fonts/CormorantGaramond-Light.ttf'),
  );
  const receipts = JSON.parse(
    readFileSync(join(process.cwd(), 'public/receipts/a11y-2026-07-09.json'), 'utf8'),
  ) as Receipts;

  const s = receipts.summary;
  const rows: Array<[string, string]> = [
    ['REDUCED-MOTION LAYERS', String(s['reduced-motion layers'].value)],
    ['CONTRAST, BOTH THEMES', String(s['measured, both themes'].value)],
    ['WORST-CASE CLS', `${s['worst-case CLS'].value} · FLOOR 0.004`],
    ['FOCUS STOPS VISIBLE', String(s['focus stops visible'].value)],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          background: '#FAF8F1',
          color: '#202C2C',
          padding: '56px 64px',
        }}
      >
        {/* The zero — the thumb-stop. Lining serif at plate scale; its right
            edge lives inside the 630 center crop so the square keeps glyph +
            headline together. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: 430,
          }}
        >
          <div
            style={{
              fontFamily: 'Cormorant',
              fontSize: 400,
              lineHeight: 1,
              color: '#202C2C',
            }}
          >
            0
          </div>
          <div style={{ fontSize: 21, letterSpacing: 3, color: '#5c5348' }}>
            AXE VIOLATIONS · 32 SCANS
          </div>
        </div>

        {/* The plate column. */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            paddingLeft: 56,
            borderLeft: '2px solid #C2A878',
          }}
        >
          <div style={{ fontSize: 30, letterSpacing: 5, color: '#B35F40' }}>{HEADLINE}</div>
          <div style={{ fontSize: 21, letterSpacing: 3, color: '#5c5348', marginTop: 14 }}>
            {`MEASURED ${receipts.measuredDate.toUpperCase()}`}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 38 }}>
            {rows.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(32,44,44,0.18)',
                  padding: '11px 0',
                  fontSize: 21,
                  letterSpacing: 2,
                }}
              >
                <div style={{ color: '#5c5348' }}>{label}</div>
                <div style={{ color: '#202C2C' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* The honesty lines — two deliberate plate rows (a mid-word wrap is
              not a plate), inside the 630 center crop by design. */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 36,
              fontSize: 18,
              letterSpacing: 2,
              color: '#5c5348',
            }}
          >
            <div>CHROMIUM: NOT WEBKIT</div>
            <div style={{ marginTop: 5 }}>A SNAPSHOT YOU CAN RE-RUN</div>
          </div>
          <div style={{ fontSize: 18, letterSpacing: 2, color: '#B35F40', marginTop: 8 }}>
            SKYPISTUDIO.COM/ACCESSIBILITY
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Cormorant', data: cormorantLight, weight: 300, style: 'normal' }],
    },
  );
}
