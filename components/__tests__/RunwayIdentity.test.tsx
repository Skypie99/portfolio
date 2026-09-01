import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { RunwayIdentity } from '@/components/RunwayIdentity';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('RunwayIdentity', () => {
  it('renders the recruiter identity as a compact three-line marker', () => {
    render(<RunwayIdentity />);

    expect(screen.getByText('Sky Halisky')).toBeInTheDocument();
    expect(screen.getByText('Technical Support')).toBeInTheDocument();
    expect(screen.getByText('AI-assisted Builder')).toBeInTheDocument();
    expect(screen.queryByText(/AI Builder$/)).not.toBeInTheDocument();
  });
});
