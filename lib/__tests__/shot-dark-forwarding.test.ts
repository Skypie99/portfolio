/**
 * Cook Out · Dark Shot Forwarding Repair — the `dark` twin of Prompt 2's
 * shot-matte-forwarding guard (shot-matte-forwarding.test.ts).
 *
 * `content/deliverables.json` carries `shots[].dark` — a light/dark twin
 * (src/avif/webp/lqip + an optional dark clip) — for claude-corp, dashboard
 * (×2), prompt-library and ghost-code. The shots-render call site in
 * `app/work/[slug]/page.tsx` built its `ShotProductReveal` media object
 * WITHOUT forwarding it, so `ProductReveal`'s
 * `isThemed = Boolean(media.dark || media.matte)` never fired for those shots:
 *   • the four still shots fell through to the theme-blind TactileMedia path
 *     and kept showing the LIGHT capture in dark theme (wrong variant);
 *   • the ghost-code clip fell through to ThemedMotion's "single" path, whose
 *     lone `ts-layer--light` layer `html.dark .ts-layer--light` hides → a
 *     blank card with a live play/pause control in dark theme.
 * Both reproduced live before the fix — see
 * qa-reports/2026-09-02_PortfolioCookOut_DarkShotForwarding_Receipt.md.
 *
 * Same source-guard shape as the matte test, for the same reason: the field
 * is optional, so dropping it again is a silent no-type-error regression with
 * no visual signal in light theme.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getDeliverables } from '@/lib/content';

const pageSource = readFileSync(join(process.cwd(), 'app', 'work', '[slug]', 'page.tsx'), 'utf8');

/** The `media={{ … }}` object literal passed to the shots-render `<ShotProductReveal`. */
function shotMediaObject(): string {
  const call = pageSource.indexOf('<ShotProductReveal');
  expect(call, 'the shots-render call site must exist').toBeGreaterThan(-1);
  const mediaOpen = pageSource.indexOf('media={{', call);
  expect(mediaOpen, 'ShotProductReveal must build an inline media object').toBeGreaterThan(-1);
  const mediaClose = pageSource.indexOf('}}', mediaOpen);
  return pageSource.slice(mediaOpen, mediaClose);
}

describe('shots → ShotProductReveal media forwarding — the dark twin', () => {
  it('forwards shot.dark into the media object', () => {
    expect(shotMediaObject(), 'ShotProductReveal media object must forward dark').toContain('dark: shot.dark');
  });

  it('still forwards shot.matte alongside it (Prompt 2 · Part C preserved)', () => {
    expect(shotMediaObject()).toContain('matte: shot.matte');
  });

  it('is load-bearing: the shipped content still has shots that carry a dark twin', () => {
    // Guards the guard. If every dark twin were ever removed from the content
    // the two assertions above would still pass while proving nothing — this
    // pins that the forwarded field has real data to route today.
    const darkShots = getDeliverables().flatMap((d) =>
      (d.shots ?? []).filter((s) => s.dark).map((s) => ({ id: d.id, src: s.src, dark: s.dark })),
    );
    expect(darkShots.length).toBeGreaterThan(0);
    for (const s of darkShots) {
      // A dark twin is the dark-theme half of a PAIR: the base (light) src is
      // what the light layer renders, the twin's src/clip what the dark one does.
      expect(s.src, `${s.id}: a dark twin needs a light base src`).toBeTruthy();
      expect(
        s.dark?.src || s.dark?.video?.mp4 || s.dark?.video?.webm,
        `${s.id}: a dark twin needs a dark src or clip`,
      ).toBeTruthy();
    }
  });
});
