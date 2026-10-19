import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import FloatPage, { generateMetadata } from '@/app/float/page';

const ROOT = process.cwd();
const read = (path: string): string => readFileSync(resolve(ROOT, path), 'utf8');
const normalize = (value: string | null): string => value?.replace(/\s+/g, ' ').trim() ?? '';

const VIDEO = 'public/videos/hi-float.mp4';
const CAPTIONS = 'public/videos/hi-float.vtt';
const POSTER = 'public/images/float/poster.jpg';
const TIMING = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})$/;

type Cue = { start: number; end: number; lines: string[] };

function parseVtt(source: string): Cue[] {
  const [header, ...blocks] = source.trim().split(/\n\s*\n/);
  expect(header.trim()).toBe('WEBVTT');
  return blocks.map((block) => {
    const [timing, ...lines] = block.split('\n');
    const m = TIMING.exec(timing.trim());
    expect(m, `bad cue timing line: ${timing}`).not.toBeNull();
    const t = m!.slice(1).map(Number);
    return {
      start: t[0] * 3600 + t[1] * 60 + t[2] + t[3] / 1000,
      end: t[4] * 3600 + t[5] * 60 + t[6] + t[7] / 1000,
      lines,
    };
  });
}

/** The bytes of a top-level MP4 box (moov carries all container metadata). */
function topLevelBox(file: Buffer, type: string): Buffer | null {
  let offset = 0;
  while (offset + 8 <= file.length) {
    let size = file.readUInt32BE(offset);
    const boxType = file.toString('latin1', offset + 4, offset + 8);
    if (size === 1) size = Number(file.readBigUInt64BE(offset + 8));
    if (size === 0) size = file.length - offset;
    if (boxType === type) return file.subarray(offset, offset + size);
    offset += size;
  }
  return null;
}

/** Marker bytes of every JPEG header segment before the scan data. */
function jpegSegments(file: Buffer): number[] {
  const markers: number[] = [];
  let offset = 2; // after SOI
  while (offset + 4 <= file.length && file[offset] === 0xff) {
    const marker = file[offset + 1];
    markers.push(marker);
    if (marker === 0xda) break; // start of scan
    offset += 2 + file.readUInt16BE(offset + 2);
  }
  return markers;
}

describe('/float application page', () => {
  it('stays unlisted: noindex, nofollow, self-canonical, own share block', () => {
    const metadata = generateMetadata();

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe('https://skypistudio.com/float/');
    expect(metadata.openGraph?.url).toBe('/float/');
    expect(metadata.openGraph?.siteName).toBeTruthy();
    expect(metadata.openGraph?.locale).toBe('en_CA');
  });

  it('keeps /float out of the sitemap and the public navigation', () => {
    expect(read('app/sitemap.ts')).not.toMatch(/["'`]\/float\//);
    for (const file of [
      'app/page.tsx',
      'app/work/page.tsx',
      'components/Footer.tsx',
      'components/HamburgerNav.tsx',
      'components/Sidebar.tsx',
      'components/SidebarRailLinks.tsx',
    ]) {
      expect(read(file), `${file} publicly links /float`).not.toMatch(/href\s*=\s*["'{`]\/float\/?/);
    }
  });

  it('wires the video with controls, poster, a captions track and download links', () => {
    render(<FloatPage />);

    const video = screen.getByLabelText('Hi, Float: a one minute video from Skyler Halisky');
    expect(video.tagName).toBe('VIDEO');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video).toHaveAttribute('poster', '/images/float/poster.jpg');
    expect(video).toHaveAttribute('width', '1080');
    expect(video).toHaveAttribute('height', '1920');
    expect(video).toHaveAttribute('aria-describedby', 'float-video-caption');
    expect(video.querySelector('source')).toHaveAttribute('src', '/videos/hi-float.mp4');
    expect(video.querySelector('source')).toHaveAttribute('type', 'video/mp4');

    const track = video.querySelector('track');
    expect(track).toHaveAttribute('kind', 'captions');
    expect(track).toHaveAttribute('src', '/videos/hi-float.vtt');
    expect(track).toHaveAttribute('srclang', 'en');

    expect(screen.getByRole('link', { name: 'Download the video (MP4, 20 MB)' })).toHaveAttribute(
      'href',
      '/videos/hi-float.mp4',
    );
    expect(screen.getByRole('link', { name: 'the work' })).toHaveAttribute('href', '/work');
    expect(screen.getByRole('link', { name: 'write to me' })).toHaveAttribute('href', '/contact');
  });

  it('captions are well-formed: ordered, non-overlapping, at most two lines of 42 characters', () => {
    const cues = parseVtt(read(CAPTIONS));

    expect(cues.length).toBeGreaterThan(10);
    cues.forEach((cue, i) => {
      expect(cue.end, `cue ${i} ends before it starts`).toBeGreaterThan(cue.start);
      expect(cue.lines.length, `cue ${i} has more than two lines`).toBeLessThanOrEqual(2);
      for (const line of cue.lines) expect(line.length, `cue ${i}: "${line}"`).toBeLessThanOrEqual(42);
      if (i > 0) expect(cue.start, `cue ${i} overlaps cue ${i - 1}`).toBeGreaterThanOrEqual(cues[i - 1].end);
    });
    expect(cues[cues.length - 1].end).toBeLessThanOrEqual(66.5); // the video runs 66.48 s
  });

  it('the on-page transcript says exactly what the captions say', () => {
    render(<FloatPage />);

    const summary = screen.getByText('Read the transcript');
    const details = summary.closest('details');
    const transcript = [...(details?.querySelectorAll('p') ?? [])].map((p) => normalize(p.textContent));
    const captions = parseVtt(read(CAPTIONS)).flatMap((cue) => cue.lines);

    expect(transcript.length).toBe(3);
    expect(normalize(captions.join(' '))).toBe(transcript.join(' '));
  });

  it('ships no camera metadata: no location, device or timed-metadata in the video or poster', () => {
    const video = readFileSync(resolve(ROOT, VIDEO));
    const moov = topLevelBox(video, 'moov');
    expect(moov, 'expected a moov box').not.toBeNull();
    // Fast start: the metadata box precedes the media data.
    expect(video.indexOf('moov', 0, 'latin1')).toBeLessThan(video.indexOf('mdat', 0, 'latin1'));
    const header = moov!.toString('latin1');
    for (const marker of ['com.apple.quicktime', 'ISO6709', '©xyz', 'iPhone', 'Apple', 'mebx']) {
      expect(header, `moov carries ${marker}`).not.toContain(marker);
    }
    expect(header.match(/trak/g)?.length, 'expected exactly one video and one audio track').toBe(2);

    const markers = jpegSegments(readFileSync(resolve(ROOT, POSTER)));
    expect(markers).toContain(0xda);
    expect(markers, 'poster carries an APP1 (Exif/XMP) block').not.toContain(0xe1);
  });

  it('keeps the rendered copy free of em dashes and double-hyphen substitutes', () => {
    const { container } = render(<FloatPage />);
    const publicCopy = normalize(container.textContent);

    expect(publicCopy).not.toContain('—');
    expect(publicCopy).not.toContain('--');
  });
});
