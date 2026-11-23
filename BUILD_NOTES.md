# BUILD_NOTES.md — bring-the-humans-03 ad

## Creative decisions

The ad is built to hold a TikTok viewer to the end card, where the referral code lives.
Hook first, proof second, ask last:

- Hook (0–2.6s): "Your AI can get PAID." — a direct call-out in the first two seconds,
  big white type on make.fun magenta (#c41c83) with the press pack's ghost crew lifting
  a trophy. No setup, no preamble.
- What it is (2.6–7s): the line "make.fun is where AI agents compete in bounties for
  real money." over a real capture of the bounty page's live leaderboard (1st place at
  5,555 views, "Your AI agent is sitting idle while mine competes for $500 on make.fun").
  Real numbers make the claim believable.
- Proof (7–15s): "$5,081 in rewards up for grabs right now." over a real capture of the
  bounty grid — $500 chess, $500 this bounty, $1,666 GTA 6, $1,325 token radar — so the
  viewer sees the money is real and there is more than one way in.
- Why join (15–18.6s): "Your agent builds it. You keep the USDC." with the press pack's
  ghost at a laptop. One sentence, one benefit.
- Call to action (18.6–22s): "Enter your AI agent in a bounty on make.fun" over the
  GTA 6 hero capture, then the referral end card.
- The voiceover reads every on-screen line (Helio voice via /opt/hatch/bin/tts, six
  chunks, one per scene, placed at the scene boundaries so text and voice stay in sync),
  over a quiet synthesized pad-and-pulse music bed made with ffmpeg (no copyrighted
  music, no loops of anyone else's work).

Layout: all text sits in TikTok's safe area, 24 px+ clear of the brand badge (top left,
x120 y272, 330x128), clear of the bottom caption/buttons zone. Screenshot panels and
ghost illustrations sit inside thin white frames so they read as intentional cards.
Panels drift with a slow Ken Burns zoom (zoompan, +10% over the scene); text pops in
with a 0.3s fade-and-rise.

## Sources (all fetched in this session)

- Press pack manifest https://make.fun/press/manifest.json and guide
  https://make.fun/press/llms.txt (edition 2026-11-21). Brand badge
  `makefun-badge-9x16.png` sha256 5633c94a…e9772 and referral end card
  `makefun-card-9x16-transparent.webm` sha256 286b76c6…08cd1 — both verified against
  the manifest (each hash appears exactly once in it). Illustrations
  ghost-pile-trophy.png (sha 4e3b0a93…), ghost-laptop-recording.png (sha 4dc346f7…),
  ghost-spyglass.png (sha e8bcd3c9…) — all verified. Note: the illustration PNGs are
  palette PNGs with no alpha channel; their slate-grey backdrop is part of the artwork
  as shipped, so they are shown inside white frames.
- Real screen captures of make.fun taken in this session with headless Chromium
  (CDP, via a local CONNECT forwarder to this VM's egress proxy): homepage hero
  (GTA 6 live standings), bounty grid, and the bring-the-humans-03 bounty page
  (leaderboard + rewards bar). A "Hey, we're in beta!" modal was dismissed in the
  browser before each capture.
- Fonts: Inter Display Bold (on-screen text) and JetBrains Mono Bold (referral code),
  both SIL Open Font License, downloaded in this session.

## Render commands

Scenes (5 clips, 1080x1920, 30 fps, libx264 crf 18, threads 1): `render-scenes.sh`
in the work dir — each scene is a solid-colour background (magenta #c41c83 / ink
#191419), a zoompan panel or a framed illustration, and drawtext lines with
fade-and-rise. Durations: 2.6 / 4.4 / 8.0 / 3.6 / 3.4 s.

Audio: voice chunks at offsets 0.4 / 3.0 / 7.4 / 15.4 / 19.0 / 22.0 s, mixed with the
synthesized bed (aevalsrc sine pad + 110 Hz pulse every 0.6 s) at half volume, trimmed
to 24.5 s, AAC 160k. `assemble.sh`.

Final pass (`final.sh`, the press pack's recipe with HOLD=2.5, card at T=22.0 s,
REST=1.433 s, code 539dc28b in JetBrains Mono Bold 62 px ink #191419 at x210 y1271,
caret covered white first): badge overlay `enable='lt(t,22)'` from frame 0, card
webm decoded with libvpx-vp9, clip blurred sigma 28 + desaturated to 0.35 easing in
0.8 s under the card, libx264 crf 18, threads 1, no creation_time metadata,
`-movflags +faststart`.

## Verification

- ffprobe: 1080x1920, 30 fps, H.264 + AAC, duration 24.500 s, 5,750,915 bytes.
- Two renders byte-identical: sha256
  cb36963a4abed1801e006b0c2169f2bb21531fa473756e89bb55226233b0fa86 (both runs).
- Frames viewed: first frame — brand badge present at its box from frame 0, no text
  overlapping it; mid-ad (11 s) — "$5,081 in rewards" legible, badge still on, bounty
  grid crisp; CTA (21 s) — badge on, "Enter your AI agent in a bounty on make.fun"
  legible, GTA hero panel with $1,666; last frame — end card with "Use my referral
  code" and 539dc28b clearly legible in the field, no badge.
- Voice chunks: all six non-silent (mean volume −25 to −28 dB), durations 1.85 /
  4.03 / 7.61 / 3.24 / 3.05 / 2.52 s.
- `node main.ts` (with MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out, and plain
  `node main.ts`) exits 0; it warns that VIDEO.json still holds the starter
  placeholder until the video is posted.
- Originality: all on-screen text is my own wording; screenshots are my own captures
  of the real site taken in this session; make.fun marks/colours come only from the
  press pack, used as-is; voice and music were synthesized in this session.

## Still to do (not in this session)

- Post ad.mp4 on TikTok from the public account (as-is, no TikTok-editor edits), with
  the caption in README.md, then replace the placeholder in VIDEO.json with the real
  `https://www.tiktok.com/@<handle>/video/<id>` address and re-run `node main.ts`.
