import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import FloatPage from '@/app/float/page';
import MotionPage, { generateMetadata } from '@/app/motion/page';

const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, 'out');
const read = (path: string): string => readFileSync(resolve(ROOT, path), 'utf8');
const normalize = (value: string | null): string => value?.replace(/\s+/g, ' ').trim() ?? '';
const sha256 = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex');

const VIDEO = 'public/videos/hi-motion.mp4';
const CAPTIONS = 'public/videos/hi-motion.vtt';
const POSTER = 'public/images/motion/poster.jpg';
const TIMING = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})$/;

/** Cue times in integer milliseconds, so duration checks never meet float error. */
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
      start: ((t[0] * 60 + t[1]) * 60 + t[2]) * 1000 + t[3],
      end: ((t[4] * 60 + t[5]) * 60 + t[6]) * 1000 + t[7],
      lines,
    };
  });
}

type Box = { type: string; start: number; end: number; body: number };

/** The boxes inside [start, end) of an MP4 (the whole file by default). */
function boxes(file: Buffer, start = 0, end = file.length): Box[] {
  const found: Box[] = [];
  let offset = start;
  while (offset + 8 <= end) {
    let size = file.readUInt32BE(offset);
    let header = 8;
    if (size === 1) {
      size = Number(file.readBigUInt64BE(offset + 8));
      header = 16;
    }
    if (size === 0) size = end - offset;
    if (size < header) break;
    found.push({ type: file.toString('latin1', offset + 4, offset + 8), start: offset, end: offset + size, body: offset + header });
    offset += size;
  }
  return found;
}

/** The first box reached by following a path of box types, e.g. ['moov', 'mvhd']. */
function find(file: Buffer, path: string[], within?: Box): Box {
  let box = within;
  for (const type of path) {
    const next = boxes(file, box ? box.body : 0, box ? box.end : file.length).find((b) => b.type === type);
    expect(next, `missing box ${path.join('/')}`).toBeDefined();
    box = next!;
  }
  return box!;
}

/** Duration, timescale and creation time from a movie or media header. */
function header(file: Buffer, box: Box): { seconds: number; creation: number } {
  const version = file[box.body];
  if (version === 1) {
    const timescale = file.readUInt32BE(box.body + 20);
    return {
      seconds: Number(file.readBigUInt64BE(box.body + 24)) / timescale,
      creation: Number(file.readBigUInt64BE(box.body + 4)),
    };
  }
  const timescale = file.readUInt32BE(box.body + 12);
  return { seconds: file.readUInt32BE(box.body + 16) / timescale, creation: file.readUInt32BE(box.body + 4) };
}

/** "1 minute 46 seconds" for 106.13 s: the label the page must show. */
function runtimeLabel(seconds: number): string {
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  const parts = [];
  if (minutes) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  if (rest) parts.push(`${rest} second${rest === 1 ? '' : 's'}`);
  return parts.join(' ');
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

const video = readFileSync(resolve(ROOT, VIDEO));
const moov = find(video, ['moov']);
const movie = header(video, find(video, ['mvhd'], moov));

describe('/motion application page', () => {
  it('stays unlisted: noindex, nofollow, self-canonical, own share block', () => {
    const metadata = generateMetadata();

    expect(metadata).not.toBeInstanceOf(Promise); // static metadata, resolved at build time
    expect(metadata.title).toBe('Hi, Motion: Skyler Halisky');
    expect(metadata.description).toMatch(/Platform Expert application to Motion/);
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe('https://skypistudio.com/motion/');
    expect(metadata.openGraph?.url).toBe('/motion/');
    expect(metadata.openGraph?.siteName).toBe('Skyler Halisky: Senior Technical Support');
    expect(metadata.openGraph?.locale).toBe('en_CA');
  });

  it('keeps /motion out of the sitemap, the public navigation and the project gallery', () => {
    expect(read('app/sitemap.ts')).not.toMatch(/["'`]\/motion\//);
    for (const file of [
      'app/page.tsx',
      'app/work/page.tsx',
      'components/Footer.tsx',
      'components/HamburgerNav.tsx',
      'components/Sidebar.tsx',
      'components/SidebarRailLinks.tsx',
    ]) {
      expect(read(file), `${file} publicly links /motion`).not.toMatch(/href\s*=\s*["'{`]\/motion\/?/);
    }
    expect(read('content/deliverables.json')).not.toMatch(/["']\/motion\/?["']/);
  });

  it('is a static server page: no client directive, no dynamic rendering', () => {
    const source = read('app/motion/page.tsx');
    expect(source).not.toMatch(/^['"]use client['"]/m);
    expect(source).not.toMatch(/export const (dynamic|revalidate)\b/);
  });

  it('wires the native player: controls, no autoplay, poster, captions track and fallbacks', () => {
    render(<MotionPage />);

    const player = screen.getByLabelText('Hi, Motion: a video introduction from Skyler Halisky');
    expect(player.tagName).toBe('VIDEO');
    expect(player).toHaveAttribute('controls');
    expect(player).toHaveAttribute('playsinline');
    expect(player).toHaveAttribute('preload', 'metadata');
    for (const attribute of ['autoplay', 'muted', 'loop']) expect(player).not.toHaveAttribute(attribute);
    expect(player).toHaveAttribute('poster', '/images/motion/poster.jpg');
    expect(player).toHaveAttribute('width', '1080');
    expect(player).toHaveAttribute('height', '1920');
    expect(player).toHaveAttribute('aria-describedby', 'motion-video-caption');
    expect(document.getElementById('motion-video-caption')).toHaveTextContent('captions available in the player');
    expect(player.querySelector('source')).toHaveAttribute('src', '/videos/hi-motion.mp4');
    expect(player.querySelector('source')).toHaveAttribute('type', 'video/mp4');

    const track = player.querySelector('track');
    expect(track).toHaveAttribute('kind', 'captions');
    expect(track).toHaveAttribute('src', '/videos/hi-motion.vtt');
    expect(track).toHaveAttribute('srclang', 'en');
    expect(track).toHaveAttribute('label', 'English captions');
    expect(player.querySelector('a')).toHaveAttribute('href', '/videos/hi-motion.mp4');

    expect(screen.getByRole('link', { name: /^Download the video \(MP4, \d+ MB\)$/ })).toHaveAttribute(
      'href',
      '/videos/hi-motion.mp4',
    );
    expect(screen.getByRole('link', { name: 'Explore Tokyo Through Time' })).toHaveAttribute(
      'href',
      '/tokyo-through-time',
    );
    expect(screen.getByRole('link', { name: 'the work' })).toHaveAttribute('href', '/work');
    expect(screen.getByRole('link', { name: 'write to me' })).toHaveAttribute('href', '/contact');
  });

  it('states the real runtime and file size of the shipped video', () => {
    render(<MotionPage />);

    expect(normalize(document.getElementById('motion-video-caption')!.textContent)).toContain(
      runtimeLabel(movie.seconds),
    );
    const megabytes = Math.round(statSync(resolve(ROOT, VIDEO)).size / 1_000_000);
    expect(screen.getByRole('link', { name: `Download the video (MP4, ${megabytes} MB)` })).toBeInTheDocument();
  });

  it('captions are well-formed: ordered, non-overlapping, readable, inside the video', () => {
    const cues = parseVtt(read(CAPTIONS));

    expect(cues.length).toBeGreaterThan(10);
    expect(cues[0].start).toBeGreaterThanOrEqual(0);
    cues.forEach((cue, i) => {
      expect(cue.end - cue.start, `cue ${i} is on screen for under a second`).toBeGreaterThanOrEqual(1000);
      expect(cue.lines.length, `cue ${i} has more than two lines`).toBeLessThanOrEqual(2);
      for (const line of cue.lines) expect(line.length, `cue ${i}: "${line}"`).toBeLessThanOrEqual(42);
      if (i > 0) expect(cue.start, `cue ${i} overlaps cue ${i - 1}`).toBeGreaterThanOrEqual(cues[i - 1].end);
    });
    expect(cues[cues.length - 1].end / 1000).toBeLessThanOrEqual(movie.seconds);
  });

  it('the on-page transcript says exactly what the captions say', () => {
    render(<MotionPage />);

    const summary = screen.getByText('Read the transcript');
    const details = summary.closest('details');
    const transcript = [...(details?.querySelectorAll('p') ?? [])].map((p) => normalize(p.textContent));
    const captions = parseVtt(read(CAPTIONS)).flatMap((cue) => cue.lines);

    expect(transcript.length).toBe(5);
    expect(normalize(captions.join(' '))).toBe(transcript.join(' '));
    for (const name of ['Skyler', 'Motion', 'Kelowna', 'Tokyo Through Time']) {
      expect(transcript.join(' ')).toContain(name);
    }
  });

  it('ships a web-safe portrait MP4: fast start, H.264 High + AAC, 1080x1920, no rotation', () => {
    const top = boxes(video).map((b) => b.type);
    expect(top.indexOf('moov'), 'moov must precede mdat (fast start)').toBeLessThan(top.indexOf('mdat'));

    const traks = boxes(video, moov.body, moov.end).filter((b) => b.type === 'trak');
    expect(traks.length, 'expected exactly one video and one audio track').toBe(2);
    const handlers = traks.map((trak) => {
      const hdlr = find(video, ['mdia', 'hdlr'], trak);
      return video.toString('latin1', hdlr.body + 8, hdlr.body + 12);
    });
    expect(handlers.sort()).toEqual(['soun', 'vide']);

    for (const trak of traks) {
      const stsd = find(video, ['mdia', 'minf', 'stbl', 'stsd'], trak);
      const entry = video.toString('latin1', stsd.body + 12, stsd.body + 16);
      expect(['avc1', 'mp4a']).toContain(entry);
      if (entry !== 'avc1') continue;

      const avc1 = boxes(video, stsd.body + 8, stsd.end)[0];
      const avcC = boxes(video, avc1.body + 78, avc1.end).find((b) => b.type === 'avcC');
      expect(avcC, 'avc1 without avcC').toBeDefined();
      expect(video[avcC!.body + 1], 'H.264 profile').toBe(100); // High
      expect(video[avcC!.body + 3], 'H.264 level').toBeLessThanOrEqual(40);

      const tkhd = find(video, ['tkhd'], trak);
      expect(video[tkhd.body], 'tkhd version').toBe(0);
      expect(video.readUInt32BE(tkhd.body + 76) / 65536).toBe(1080);
      expect(video.readUInt32BE(tkhd.body + 80) / 65536).toBe(1920);
      // Identity matrix: the pixels are stored upright, nothing rotates them.
      expect([0, 4, 12, 16].map((o) => video.readInt32BE(tkhd.body + 40 + o))).toEqual([65536, 0, 0, 65536]);
    }
  });

  it('ships no camera metadata: no location, device, date or timed metadata in the video or poster', () => {
    const container = video.subarray(moov.start, moov.end).toString('latin1');
    for (const marker of ['com.apple.quicktime', 'ISO6709', '©xyz', 'iPhone', 'Apple', 'mebx', 'Core Media']) {
      expect(container, `moov carries ${marker}`).not.toContain(marker);
    }
    expect(movie.creation, 'the movie header records a creation date').toBe(0);
    for (const trak of boxes(video, moov.body, moov.end).filter((b) => b.type === 'trak')) {
      expect(header(video, find(video, ['mdia', 'mdhd'], trak)).creation).toBe(0);
    }

    const markers = jpegSegments(readFileSync(resolve(ROOT, POSTER)));
    expect(markers).toContain(0xda);
    expect(markers, 'poster carries an APP1 (Exif/XMP) block').not.toContain(0xe1);
    expect(markers, 'poster carries an APP2 (ICC) block').not.toContain(0xe2);
  });

  it('is the Motion recording, and leaves the Float page and its media as they were', () => {
    for (const [mine, float] of [
      [VIDEO, 'public/videos/hi-float.mp4'],
      [CAPTIONS, 'public/videos/hi-float.vtt'],
      [POSTER, 'public/images/float/poster.jpg'],
    ]) {
      expect(sha256(resolve(ROOT, mine)), `${mine} is a copy of ${float}`).not.toBe(sha256(resolve(ROOT, float)));
    }

    render(<FloatPage />);
    const floatVideo = screen.getByLabelText('Hi, Float: a one minute video from Skyler Halisky');
    expect(floatVideo.querySelector('source')).toHaveAttribute('src', '/videos/hi-float.mp4');
    expect(floatVideo.querySelector('track')).toHaveAttribute('src', '/videos/hi-float.vtt');
    expect(floatVideo).toHaveAttribute('poster', '/images/float/poster.jpg');
  });

  it('keeps the rendered copy and captions free of em dashes and double-hyphen substitutes', () => {
    const { container } = render(<MotionPage />);
    const captionText = parseVtt(read(CAPTIONS)).flatMap((cue) => cue.lines).join(' ');
    for (const text of [normalize(container.textContent), captionText]) {
      expect(text).not.toContain('—');
      expect(text).not.toContain('--');
    }
  });
});

describe.skipIf(!existsSync(OUT_DIR))('/motion in the static export', () => {
  const html = existsSync(join(OUT_DIR, 'motion', 'index.html'))
    ? readFileSync(join(OUT_DIR, 'motion', 'index.html'), 'utf8')
    : '';

  it('exports the route as an unlisted page with its own canonical', () => {
    expect(html, 'out/motion/index.html is missing').not.toBe('');
    expect(html).toMatch(/<meta name="robots" content="noindex, nofollow"/);
    expect(html).toContain('<link rel="canonical" href="https://skypistudio.com/motion/"');
    expect(html).toContain('<meta property="og:url" content="https://skypistudio.com/motion/"');
    expect(readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8')).not.toContain('/motion/');
  });

  it('ships the referenced media byte-for-byte', () => {
    for (const asset of [VIDEO, CAPTIONS, POSTER]) {
      const published = asset.replace(/^public\//, '');
      expect(html, `the page does not reference /${published}`).toContain(`/${published}`);
      const exported = join(OUT_DIR, published);
      expect(existsSync(exported), `out/${published} is missing`).toBe(true);
      expect(sha256(exported)).toBe(sha256(resolve(ROOT, asset)));
    }
  });
});
