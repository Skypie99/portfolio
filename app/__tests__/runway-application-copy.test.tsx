import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import RunwayPage, { generateMetadata } from '@/app/runway/page';

const ROOT = process.cwd();
const read = (path: string): string => readFileSync(resolve(ROOT, path), 'utf8');
const normalize = (value: string | null): string => value?.replace(/\s+/g, ' ').trim() ?? '';

const CAPTION =
  'Amazon Night Flight · 46 seconds · first weekend on a Runway Pro plan. ' +
  'Every moving shot was generated in Runway using Gen-4.5, Gen-4 Turbo, Seedance 2.0, and Seedance 2.5, across text-to-video and image-to-video, then upscaled. ' +
  'For the title shots, I created the still input plates with Claude Cowork, using Python to composite the lettering from duckweed and plankton sampled from the film’s own frames. ' +
  'The reversals and colour matching were handled with ffmpeg workflows written with Claude Code. ' +
  'Final assembly, soundtrack, and titling were done in CapCut once the Runway credits ran out.';

const WORDS_PARAGRAPHS = [
  'Video models do not spell reliably, so I did not ask the model to generate the lettering. ' +
    'I used Claude Cowork to create HI RUNWAY and I’M SKYLER as still input plates, building the letters from duckweed and plankton sampled from the film’s own frames. ' +
    'I then used those plates as image-to-video inputs in Runway and prompted them to dissolve apart. ' +
    'I reversed the resulting clips in the edit, so what you see assembling was really coming apart.',
  'Everything else in those shots comes from the models: the river, the descent through the canopy, the plunge, the night vision, and the burst back into moonlight.',
];

describe('/runway application copy repair', () => {
  it('renders the exact approved caption and production attribution', () => {
    const { container } = render(<RunwayPage />);
    const caption = container.querySelector('figcaption');
    caption?.querySelector('br')?.replaceWith(' ');

    expect(normalize(caption?.textContent ?? null)).toBe(CAPTION);
    expect(container.textContent).not.toContain('by hand');
  });

  it('renders the exact approved “How the words got there” copy and emphasis', () => {
    render(<RunwayPage />);

    const heading = screen.getByRole('heading', { name: 'How the words got there' });
    const paragraphs = [...(heading.parentElement?.querySelectorAll('p') ?? [])].map((paragraph) =>
      normalize(paragraph.textContent),
    );
    expect(paragraphs).toEqual(WORDS_PARAGRAPHS);
    expect(screen.getByText('HI RUNWAY').tagName).toBe('STRONG');
    expect(screen.getByText('I’M SKYLER').tagName).toBe('STRONG');
    expect(screen.getByText('dissolve').tagName).toBe('EM');
  });

  it('preserves the protected video reference, controls, poster and fallback link', () => {
    render(<RunwayPage />);

    const video = screen.getByLabelText('Amazon Night Flight, a 46 second short film');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video).toHaveAttribute('poster', '/images/runway/poster.jpg');
    expect(video.querySelector('source')).toHaveAttribute(
      'src',
      '/videos/amazon-night-flight.mp4',
    );
    expect(screen.getByRole('link', { name: '/videos/amazon-night-flight.mp4' })).toHaveAttribute(
      'href',
      '/videos/amazon-night-flight.mp4',
    );
  });

  it('preserves the opening application paragraphs and closing invitation', () => {
    render(<RunwayPage />);

    expect(
      screen.getByText(
        /I made this while applying for the Consumer Support Specialist role\. It is a proof of use, not a reel\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/I spend my days in technical support, so I did not just take the tour:/),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'the work' })).toHaveAttribute('href', '/work');
    expect(screen.getByRole('link', { name: 'write to me' })).toHaveAttribute('href', '/contact');
  });

  it('preserves noindex, nofollow and the route-specific canonical', () => {
    const metadata = generateMetadata();

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe('https://skypistudio.com/runway/');
    expect(metadata.openGraph?.url).toBe('/runway/');
  });

  it('keeps /runway out of the sitemap and public navigation', () => {
    expect(read('app/sitemap.ts')).not.toMatch(/["'`]\/runway\//);
    for (const file of [
      'components/Footer.tsx',
      'components/HamburgerNav.tsx',
      'components/Sidebar.tsx',
      'components/SidebarRailLinks.tsx',
    ]) {
      expect(read(file), `${file} publicly links /runway`).not.toMatch(
        /href\s*=\s*["'{`]\/runway\/?/,
      );
    }
  });

  it('keeps public Runway copy free of em dashes and double-hyphen substitutes', () => {
    const { container } = render(<RunwayPage />);
    const publicCopy = normalize(container.textContent);

    expect(publicCopy).not.toContain('—');
    expect(publicCopy).not.toContain('--');
  });
});
