import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HorizonRule } from '@/components/HorizonRule';

/**
 * HorizonRule — the drawn `.rule-ember` hairline the About + Contact routes
 * use as their signature motif. It must stay decorative, must keep the
 * estate's rule-ember base classes, and must never carry inline motion state
 * (the armed scaleX(0) lives in CSS under html.js only, so no-JS, dead-JS,
 * print and reduced-motion all rest it drawn).
 */
describe('HorizonRule', () => {
  it.each(['mount', 'reveal', 'none'] as const)('arrival=%s is an aria-hidden rule-ember hairline with no inline style', (arrival) => {
    const { container } = render(<HorizonRule arrival={arrival} className="w-24" />);
    const rule = container.firstElementChild as HTMLElement;
    expect(rule.tagName).toBe('SPAN');
    expect(rule).toHaveAttribute('aria-hidden', 'true');
    expect(rule).toHaveClass('rule-ember', 'block', 'h-px', 'w-24');
    expect(rule.getAttribute('style')).toBeNull();
    expect(rule.textContent).toBe('');
  });

  it('the motion variants only add classes on top of the resting rule', () => {
    const rest = (render(<HorizonRule />).container.firstElementChild as HTMLElement).classList;
    const mount = (render(<HorizonRule arrival="mount" />).container.firstElementChild as HTMLElement).classList;
    const reveal = (render(<HorizonRule arrival="reveal" />).container.firstElementChild as HTMLElement).classList;
    for (const c of Array.from(rest)) {
      expect(mount).toContain(c);
      expect(reveal).toContain(c);
    }
    expect(mount.length).toBe(rest.length + 1);
    expect(reveal.length).toBe(rest.length + 1);
  });
});
