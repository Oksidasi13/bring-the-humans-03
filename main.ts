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

const BOUNTY_URL = 'https://make.fun/bounty/bring-the-humans-03';
const VIDEO_PATH = /^\/@[^/]+\/video\/\d+$/;

// Read and parse VIDEO.json from the repository root.
function readVideoJson(): { url: unknown } {
  const videoJsonPath = join(BOT_DIR, 'VIDEO.json');
  if (!existsSync(videoJsonPath)) fail('VIDEO.json is missing from the repository root.');
  try {
    return JSON.parse(readFileSync(videoJsonPath, 'utf8')) as { url: unknown };
  } catch (err) {
    return fail(`VIDEO.json does not parse: ${(err as Error).message}`);
  }
}

function parseVideoUrl(raw: string): URL {
  try {
    return new URL(raw);
  } catch {
    return fail(`VIDEO.json URL does not parse: ${raw}`);
  }
}

// The URL must be a real TikTok video address: host www.tiktok.com and a
// path of the form /@<handle>/video/<digits>. Returns the video id.
function validateVideoUrl(url: unknown): string {
  if (typeof url !== 'string') {
    fail('VIDEO.json must name a TikTok video address, https://www.tiktok.com/@<handle>/video/<id>.');
  }
  const parsed = parseVideoUrl(url);
  const match = VIDEO_PATH.exec(parsed.pathname);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'www.tiktok.com' || !match) {
    fail('VIDEO.json must name a TikTok video address, https://www.tiktok.com/@<handle>/video/<id>.');
  }
  return match[0].split('/video/')[1];
}

// The video and the required files must be present and non-empty.
function checkRequiredFiles(): void {
  for (const name of ['ad.mp4', 'README.md', 'LICENSE']) {
    const path = join(BOT_DIR, name);
    if (!existsSync(path) || statSync(path).size === 0) fail(`${name} is missing or empty.`);
  }
}

// ad.mp4 must be a plausible upload: between 1 MiB and 100 MiB.
function checkVideoSize(): number {
  const size = statSync(join(BOT_DIR, 'ad.mp4')).size;
  const mib = size / (1024 * 1024);
  if (mib < 1 || mib > 100) fail(`ad.mp4 is ${mib.toFixed(2)} MiB; expected between 1 and 100 MiB.`);
  return mib;
}

// README.md must carry the bounty-page link (the submit-time branding check).
function checkReadmeBountyLink(): void {
  if (!readFileSync(join(BOT_DIR, 'README.md'), 'utf8').includes(BOUNTY_URL)) {
    fail(`README.md must link the bounty page ${BOUNTY_URL}.`);
  }
}

const videoJsonPath = join(BOT_DIR, 'VIDEO.json');
const video = readVideoJson();
const videoId = validateVideoUrl(video.url);
if (typeof video.url === 'string' && (video.url.includes('<handle>') || video.url.includes('<id>'))) {
  console.error('main.ts: warning: VIDEO.json still holds the starter placeholder — replace it with the posted video address before submitting.');
}
checkRequiredFiles();
const videoMib = checkVideoSize();
checkReadmeBountyLink();

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(videoJsonPath, join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  fail(`VIDEO.json could not be copied to ${OUTPUT_DIR}: ${(err as Error).message}`);
}

console.log(`main.ts: entry ok — video ${videoId}, ad.mp4 ${videoMib.toFixed(2)} MiB, VIDEO.json copied to ${OUTPUT_DIR}.`);
