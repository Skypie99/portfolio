/**
 * Global Vitest setup — runs once before each test file.
 *
 * Extends Vitest's `expect` with jest-dom's accessibility matchers
 * (toBeInTheDocument, toHaveAttribute, toHaveFocus, etc.).
 */
import '@testing-library/jest-dom/vitest';

import { expect } from 'vitest';

// The direct cinematic suite is protected. Give it the same pre-import owner
// without editing that file or changing clocks in unrelated suites.
if (expect.getState().testPath?.replace(/\\/g, '/').endsWith(
  '/components/cinematic/__tests__/CinematicDesert.test.tsx',
)) {
  const { ownGsapTimers } = await import('./test-utils/gsap-teardown');
  ownGsapTimers();
}
