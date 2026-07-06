---
title: "Stop Lying to Your LLM About Video: Scene-Aware Frame Extraction"
date: "2026-07-06"
excerpt: "Most AI integrations with video are broken by design — fixed FPS sampling misses everything that matters. Here's how to extract only the frames that actually changed."
tags: ["AI", "LLM", "Claude", "Python", "Video"]
coverEmoji: "🎬"
auto_generated: true
source_url: "https://github.com/HUANGCHIHHUNGLeo/claude-real-video"
---

Here's what actually happens when you "give a video to an AI":

- **ChatGPT**: reads the YouTube transcript. Never touches a single frame.
- **Claude**: refuses video files entirely. You'd need to extract frames yourself.
- **Gemini**: can process video natively, but samples at 1 fps by default, blowing past fast cuts.

For a 2-minute product demo with 30+ distinct screens, 1 fps sampling gives you 120 frames — most of them near-identical, missing every quick transition. You've burned a heap of tokens and the model still can't tell you what was on screen at the 0:47 mark.

[claude-real-video](https://github.com/HUANGCHIHHUNGLeo/claude-real-video) landed on the HN front page this week with a cleaner approach: extract frames on *scene change*, not on a clock tick, then deduplicate near-identical ones.

## Why Fixed FPS Is Wrong

Video is not a sequence of equally-spaced moments. It's a sequence of *scenes*, and those scenes don't respect your sampling interval.

A 58-second clip sampled at 1 fps produces 58 frames. The same clip processed by scene-change detection keeps 26 — the ones that actually differ — and packs them into 3 contact sheets for the LLM. Fewer tokens, nothing meaningful missed.

The tool uses perceptual hashing to drop near-duplicate frames. If the camera holds steady on a slide for 8 seconds, you get one frame of that slide, not eight. It also pulls a transcript via Whisper, so the model gets both the visual and audio channels.

## Basic Usage

```bash
pip install claude-real-video

# From a YouTube URL
crv "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# From a local file
crv ./demo.mp4
```

Output lands in `crv-out/`:

```
crv-out/
  frames/         ← scene-change frames as JPEG
  transcript.txt  ← Whisper transcription
  MANIFEST.txt    ← timestamps + frame descriptions
```

Then you drop the frames and `MANIFEST.txt` into your Claude API call:

```python
import anthropic
import base64
from pathlib import Path

client = anthropic.Anthropic()

frames_dir = Path("crv-out/frames")
manifest = Path("crv-out/MANIFEST.txt").read_text()

# Build image content blocks from extracted frames
image_blocks = []
for frame_path in sorted(frames_dir.glob("*.jpg")):
    img_data = base64.b64encode(frame_path.read_bytes()).decode()
    image_blocks.append({
        "type": "image",
        "source": {"type": "base64", "media_type": "image/jpeg", "data": img_data}
    })

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=2048,
    messages=[{
        "role": "user",
        "content": [
            *image_blocks,
            {"type": "text", "text": f"Video manifest:\n{manifest}\n\nDescribe what happens in this video, focusing on the UI flows and key moments."}
        ]
    }]
)

print(response.content[0].text)
```

The MANIFEST includes timestamps, so the model can anchor its observations to specific moments in the original video.

## Wiring It Into a Next.js App

The Python tool is a CLI, but you can shell out to it from a Node.js API route:

```typescript
// app/api/analyze-video/route.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const { videoUrl } = await req.json();
  
  const outputDir = `/tmp/crv-${Date.now()}`;
  
  // Run scene extraction
  await execAsync(`crv "${videoUrl}" --output ${outputDir}`, { timeout: 120_000 });
  
  // Read frames + manifest
  const manifest = await fs.readFile(path.join(outputDir, 'MANIFEST.txt'), 'utf-8');
  const frameFiles = await fs.readdir(path.join(outputDir, 'frames'));
  
  // Build Claude API call with frames...
  // Then clean up outputDir
}
```

For a proper production setup you'd offload the extraction to a background job (the Whisper transcription alone can take 30+ seconds on a cold container), but the pattern is straightforward.

## What I'd Build With This

**1. Interview recording analyser.** Upload a recorded mock interview, extract scene changes (slide transitions, camera moves), and have Claude score both the content and the physical delivery — posture, whether they're reading notes, pacing. More signal than transcript-only analysis.

**2. Product demo reviewer.** Sales teams record Loom demos. Run them through scene extraction, then have Claude flag: did the presenter show the feature they promised? Where did they skip steps? Is the UI in the recording still the current UI? Pipe the output into a review dashboard.

**3. Tutorial quality checker.** If you're building a learning platform (which I am), instructors upload video lessons. Auto-extract the key frames, compare against the lesson outline, flag if the instructor skipped a promised section. The scene-change approach means you're not burning tokens on 60 near-identical frames of someone talking to a webcam.

## My Take

The core insight — sample on scene change, not on time — is one of those obvious-in-hindsight ideas. The token waste from naive 1fps sampling compounds fast once you're processing real content at scale.

The Python CLI is handy for ad-hoc analysis but the real value for web apps is the extraction logic as a library. The repo exposes a Python API if you want to call it directly rather than shell out. For a TypeScript shop, I'd probably wrap it in a small FastAPI service and call it from Next.js rather than spawning Python processes.

Worth keeping an eye on the Pro version too — it adds shot rhythm analysis and emotion detection from audio, which opens up some more interesting analysis angles.
