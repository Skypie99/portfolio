import type { ShowcaseChrome } from '@/components/ProductReveal';

/**
 * SHOWCASE_CHROME — the site-wide presentation chrome for themed showcases:
 * how a captured screen sits in the world.
 *
 *   'device' — the DeviceFrame grammar (phone/window/plate).
 *   'float'  — the clean artifact: rounded plane + the site's warm shadow,
 *              no device chrome.
 *   'matte'  — the exhibit mat (.ts-matte): the capture presented as a framed
 *              print on site-token surfaces.
 *
 * THE MOCKUP GATE (Sky decides): all three render over the real Flagstone
 * assets on the real pages; Sky's pick locks this constant in a one-line
 * commit. Until then it stays 'device' — today's look. Per-scene `chrome` in
 * deliverables.json remains the escape hatch either way.
 */
export const SHOWCASE_CHROME: ShowcaseChrome = 'float';
