/**
 * Cook Out P2 · Part C — the actual wiring gap behind the Flagstone defect.
 *
 * `content/deliverables.json` has carried `shots[].matte` correctly all
 * along; the bug was that `app/work/[slug]/page.tsx`'s `ShotProductReveal`
 * call built its `media` object WITHOUT forwarding it. `ProductReveal`'s
 * `isThemed = Boolean(media.dark || media.matte)` check then never fired, so
 * the clip fell through to the theme-blind "single" video path — which still
 * tags its layer `ts-layer--light` and was hidden by the same dark-theme rule
 * as an unfixed matte. The globals.css scoped override (guarded in
 * matte-theme-invariance.test.ts) only ever helps if `matte` actually reaches
 * ProductReveal — this is the source guard for that link in the chain, since
 * a future edit to this call site could silently drop the field again with no
 * type error (the field is optional) and no visual signal in light theme.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(join(process.cwd(), 'app', 'work', '[slug]', 'page.tsx'), 'utf8');

describe('shots → ShotProductReveal media forwarding', () => {
  it('forwards shot.matte into the media object', () => {
    const call = pageSource.indexOf('<ShotProductReveal');
    expect(call, 'the shots-render call site must exist').toBeGreaterThan(-1);
    const mediaOpen = pageSource.indexOf('media={{', call);
    const mediaClose = pageSource.indexOf('}}', mediaOpen);
    const mediaObject = pageSource.slice(mediaOpen, mediaClose);
    expect(mediaObject, 'ShotProductReveal media object must forward matte').toContain('matte: shot.matte');
  });
});
