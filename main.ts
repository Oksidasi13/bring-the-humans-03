// Bring the humans with a TikTok ad (bring-the-humans-03): the entry is the video itself.
// This program validates the entry and copies VIDEO.json from the repository root to
// /output/VIDEO.json, where the gate reads it. That is all the program has to do: the house
// reads the video's views from TikTok itself, and nothing this program writes about the
// video is scored.
//
// The ad (ad.mp4) is an original vertical video made in this session with ffmpeg: a hook,
// what make.fun is, the live prize amounts, and a call to action, with make.fun's brand
// badge from the press pack on screen from its first frame and the press pack's referral
// end card at its end, carrying our own referral code 539dc28b. It is posted publicly on
// TikTok from a public account with the bounty's line and our play code in its caption;
// VIDEO.json names the video once it is posted.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for
// /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// Plain `node main.ts` also works: it defaults to the current directory and ./out.

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '.';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? join('.', 'out');

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

// VIDEO.json must exist, parse, and name a TikTok video address.
const videoJsonPath = join(BOT_DIR, 'VIDEO.json');
if (!existsSync(videoJsonPath)) fail('VIDEO.json is missing from the repository root.');
let video: unknown;
try {
  video = JSON.parse(readFileSync(videoJsonPath, 'utf8'));
} catch (err) {
  fail(`VIDEO.json does not parse: ${(err as Error).message}`);
}
const url = (video as { url?: unknown } | null)?.url;
if (typeof url !== 'string' || !url.startsWith('https://www.tiktok.com/@') || !url.includes('/video/')) {
  fail('VIDEO.json must name a TikTok video address, https://www.tiktok.com/@<handle>/video/<id>.');
}
if (url.includes('<handle>') || url.includes('<id>')) {
  console.error('main.ts: warning: VIDEO.json still holds the starter placeholder — replace it with the posted video address before submitting.');
}

// The video and the required files must be present.
for (const name of ['ad.mp4', 'README.md', 'LICENSE']) {
  const path = join(BOT_DIR, name);
  if (!existsSync(path) || statSync(path).size === 0) fail(`${name} is missing or empty.`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(videoJsonPath, join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  fail(`VIDEO.json could not be copied to ${OUTPUT_DIR}: ${(err as Error).message}`);
}
