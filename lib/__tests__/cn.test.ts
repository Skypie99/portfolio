/**
 * cn() unit tests — Wave 3 (Gary).
 *
 * cn() wraps clsx + tailwind-merge with custom color/font-size group
 * extensions. Cycle 11 surfaced a real bug where `text-umber` (a custom
 * color) was silently dropped by twMerge because it looked like a
 * font-size collision with `text-meta`. The extensions in lib/cn.ts fix
 * that. These tests pin the fix so it can't regress.
 *
 * Tests are pure: no DOM, no JSX, no mocks. Just string-in, string-out.
 */
import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/cn';

describe('cn() — basic merging', () => {
  it('returns an empty string given no arguments', () => {
    expect(cn()).toBe('');
  });

  it('returns a single class unchanged', () => {
    expect(cn('flex')).toBe('flex');
  });

  it('joins multiple classes with a space', () => {
    const result = cn('flex', 'items-center', 'gap-4');
    expect(result).toBe('flex items-center gap-4');
  });

  it('deduplicates conflicting Tailwind utilities (last wins)', () => {
    // tailwind-merge resolves p-4 vs p-6 — the latter wins.
    const result = cn('p-4', 'p-6');
    expect(result).toBe('p-6');
  });

  it('handles conditional clsx values (false/null/undefined dropped)', () => {
    const result = cn('base', false && 'dropped', undefined, null, 'kept');
    expect(result).toBe('base kept');
  });

  it('handles object-style conditional classes', () => {
    const isActive = true;
    const result = cn({ 'text-accent-primary': isActive, 'text-stone': !isActive });
    expect(result).toBe('text-accent-primary');
  });
});

describe('cn() — custom color tokens (Cycle 11 regression)', () => {
  it('preserves custom color class alongside a font-size class (Cycle 11 fix)', () => {
    // This is the exact bug from Cycle 11: text-umber (color) and text-meta
    // (font-size) were incorrectly merged into one class, dropping text-umber.
    const result = cn('text-meta', 'text-umber');
    expect(result).toContain('text-umber');
    expect(result).toContain('text-meta');
  });

  it('keeps bg-sand when followed by another non-conflicting bg', () => {
    // bg-sand and bg-cream are both custom colors; the last one should win.
    const result = cn('bg-sand', 'bg-cream');
    expect(result).toBe('bg-cream');
  });

  it('does not drop text-accent-primary when combined with a font-size', () => {
    const result = cn('text-label', 'text-accent-primary', 'font-mono');
    expect(result).toContain('text-accent-primary');
    expect(result).toContain('text-label');
    expect(result).toContain('font-mono');
  });

  it('does not drop border-terracotta when combined with border-width', () => {
    const result = cn('border', 'border-terracotta');
    expect(result).toContain('border-terracotta');
    expect(result).toContain('border');
  });
});

describe('cn() — custom font-size tokens', () => {
  it('resolves two custom font-size tokens (last wins)', () => {
    const result = cn('text-body', 'text-display-s');
    expect(result).toBe('text-display-s');
  });

  it('deduplicates standard and custom font-size (last wins)', () => {
    const result = cn('text-sm', 'text-meta');
    // text-meta is our custom font-size; it should win over text-sm.
    expect(result).toBe('text-meta');
  });
});

describe('cn() — array and nested clsx inputs', () => {
  it('flattens array inputs from clsx', () => {
    const classes = ['flex', 'items-start'];
    const result = cn(...classes, 'gap-2');
    expect(result).toBe('flex items-start gap-2');
  });

  it('merges duplicate padding from separate arrays (last wins)', () => {
    const result = cn(['px-4', 'py-2'], ['px-8']);
    expect(result).toBe('py-2 px-8');
  });
});
