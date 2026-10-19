// frames.mjs — extract 1 fps frames (+ an mp4 transcode) from a Playwright webm.
//   node frames.mjs --video in.webm --out <dir> [--fps 1] [--scale 720]
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/home/user/portfolio/package.json');
const ffmpeg = require('ffmpeg-static');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter(Boolean));
mkdirSync(args.out, { recursive: true });
const fps = args.fps || '1';
execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', args.video, '-vf', `fps=${fps}`, join(args.out, 'frame-%02d.png')]);
if (args.mp4) execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', args.video, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-preset', 'medium', '-movflags', '+faststart', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', args.mp4]);
console.log('[frames] done');
