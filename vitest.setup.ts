/**
 * Global Vitest setup — runs once before each test file.
 *
 * Extends Vitest's `expect` with jest-dom's accessibility matchers
 * (toBeInTheDocument, toHaveAttribute, toHaveFocus, etc.).
 */
import '@testing-library/jest-dom/vitest';
