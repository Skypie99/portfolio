// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';

import { GalleryWall } from '@/components/GalleryWall';
import { getDeliverables } from '@/lib/content';

describe('GalleryWall server floor', () => {
  it('SSR emits every plate visible — no inline opacity:0 (RM/no-JS floor)', () => {
    // A real server has no window. jsdom selects Reveal's browser layout
    // effect at import time and cannot represent this SSR contract.
    const deliverables = getDeliverables();
    const html = renderToString(<GalleryWall deliverables={deliverables} />);
    expect(deliverables.length).toBeGreaterThan(0);
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('opacity: 0');
    for (const deliverable of deliverables) expect(html).toContain(deliverable.title);
  });
});
