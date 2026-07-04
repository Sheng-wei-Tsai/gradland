---
title: "How to Let an LLM Actually Watch a Video"
date: "2026-07-04"
excerpt: "Most 'video AI' is just reading the transcript. Here's a local tool that extracts the frames that actually matter — scene changes, not fixed 1fps sampling — so your LLM sees the video instead of guessing at it."
tags: ["AI", "Claude", "Video Processing", "Python"]
coverEmoji: "🎬"
auto_generated: true
source_url: "https://github.com/HUANGCHIHHUNGLeo/claude-real-video"
---

When someone asks ChatGPT or Claude about a YouTube video, they're usually not getting an answer based on what the video *looks like*. They're getting an answer based on the transcript. That's fine if the content is talk-heavy, but if the video is a demo, a tutorial with code on screen, or anything where the visual is the point — the model is flying blind.

`claude-real-video` (629 GitHub stars in its first week) solves this with a genuinely useful approach: pull out the frames that *actually changed*, not one frame per second.

## The problem with fixed-rate sampling

The naive approach is: grab a frame every N seconds, send them all to the model. Gemini does this by default. For a 10-minute video at 1fps you get 600 frames — most of which are nearly identical to the previous one. You're burning tokens on duplicate information and still missing fast cuts.

The better question is: *when did the picture actually change?* That's what scene-change detection answers.

```bash
pip install claude-real-video

crv "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
# → crv-out/frames/*.jpg
# → crv-out/transcript.txt
# → crv-out/MANIFEST.txt
```

On a 58-second clip, fixed 1fps gives you 58 frames. `crv` keeps 26 — the ones with actual scene changes — and optionally packs them into contact sheets so you're passing 3 images to Claude instead of 26.

Everything runs locally. What hits the LLM API is only what you choose to send.

## Integrating with Claude

The output folder is designed to drop straight into a Claude conversation. The `MANIFEST.txt` tells the model what it's looking at — frame timestamps, whether each came from a scene change or was sampled — so the model has context without you having to explain it.

For a web app, the flow looks like this:

```python
import subprocess, pathlib, anthropic

def analyse_video(url: str, prompt: str) -> str:
    # Run crv, output into a temp dir
    result = subprocess.run(
        ["crv", url, "--output", "/tmp/crv-out", "--grid"],
        capture_output=True, check=True
    )

    out = pathlib.Path("/tmp/crv-out")
    manifest = (out / "MANIFEST.txt").read_text()
    grid_images = sorted(out.glob("grid_*.jpg"))

    # Build the message
    content = [{"type": "text", "text": manifest + "\n\n" + prompt}]
    for img_path in grid_images:
        img_data = img_path.read_bytes()
        import base64
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/jpeg",
                "data": base64.standard_b64encode(img_data).decode()
            }
        })

    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": content}]
    )
    return message.content[0].text
```

The `--grid` flag is the key one for token efficiency. Instead of 20 separate images (each with their own API overhead), it packs them into contact sheets. Less API overhead, lower cost, and Claude handles grids fine.

## What I'd build with this

**Technical interview recorder.** Candidate shares their screen, you record the session. After the interview, pipe the video through `crv` and ask Claude to identify moments where the candidate got stuck, what they googled, and whether their final solution matched their initial approach. Useful for panel debrief without rewatching 90 minutes of footage.

**Course module summariser.** Feed a Udemy or YouTube tutorial through `crv`, ask Claude to produce a condensed written summary with timestamps. The scene-change extraction means code changes on screen get captured properly — not blurred into the "same frame" bucket that fixed sampling would treat them as.

**PR demo validator.** If your team records Loom demos of features before merging, you could automate a pass: extract keyframes, ask Claude whether the demo shows the expected states (form submitted, success toast appeared, URL changed). Not a replacement for real tests but a useful sanity check on demos that would otherwise just sit unreviewed.

## My take

The core insight — that scene-change detection beats fixed-rate sampling — isn't new. Video editing tools have used it for years. What's new is packaging it cleanly for the LLM workflow and making it local-first. No vendor, no upload, processing happens on your machine and you decide what actually goes to the API.

The contact sheet output is the bit I'll actually use. Packing 20 frames into 3 images is the kind of practical token optimisation that's easy to miss when you're just getting something working. Worth adding to any video analysis pipeline.
