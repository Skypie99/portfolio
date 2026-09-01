import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { getDeliverables } from '@/lib/content';

describe('Flagstone recruiter first impression', () => {
  const flagstone = getDeliverables().find((deliverable) => deliverable.id === 'flagstone');

  it('leads with the current Explore product capture and truthful context', () => {
    expect(flagstone?.heroShot?.src).toBe('/showcase/flagstone/explore-current.phone.webp');
    expect(flagstone?.cardImage?.src).toBe('/showcase/flagstone/explore-current.phone.webp');
    expect(flagstone?.heroShot?.alt).toContain('real barrier photograph');
    expect(flagstone?.heroPlate?.provenance).toBe('CURRENT EXPLORE SCREEN · FLAGSTONE');
    expect(flagstone?.heroShot?.capturedDate).toBeUndefined();
  });

  it('uses the current reporting flow rather than the retired drawer clip', () => {
    expect(flagstone?.shots?.[0]?.src).toContain('/report-flow-current.');
    expect(flagstone?.shots?.[0]?.video?.mp4).toContain('/report-flow-current.');
    expect(flagstone?.shots?.[0]?.caption).toBe('From map pin to report form, the current reporting flow in motion.');
    expect(flagstone?.shots?.[0]?.capturedDate).toBe('2026-09-01');
    expect(flagstone?.shots?.[0]?.commit).toBeUndefined();
    expect(flagstone?.shots?.[0]?.video?.alt).toContain('Report a flag form');
    expect(flagstone?.shots?.[1]?.src).toBe('/showcase/flagstone/report-current.phone.webp');
    expect(flagstone?.shots?.[1]?.alt).toContain('Report a flag form');
    expect(flagstone?.shots?.[2]?.src).toBe('/showcase/flagstone/community-current.phone.webp');
    expect(flagstone?.shots?.[2]?.alt).toContain('Verify, Resolved, and Details actions');
    expect(flagstone?.shots?.[1]?.capturedDate).toBeUndefined();
    expect(flagstone?.shots?.[2]?.capturedDate).toBeUndefined();
  });

  it('removes the inline defect exhibit and keeps Flagstone hero media in normal flow', () => {
    const caseStudy = readFileSync(resolve(process.cwd(), 'app/work/[slug]/page.tsx'), 'utf8');

    expect(caseStudy).not.toContain('FlagstoneDefectExhibit');
    expect(caseStudy).not.toContain("from '@/components/Exhibit'");
    expect(caseStudy).toContain("d.id !== 'flagstone' && 'lg:sticky lg:top-24'");
    expect(caseStudy).toContain("d.id === 'flagstone' && 'leading-[1.15]'");
  });
});
