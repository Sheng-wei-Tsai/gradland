# Feature: Gemini Multimodal — True Video Analysis

**Priority:** 🔴 P2 — AI Quality
**Status:** 🔲 Not started
**Effort:** Small (1–2 days)
**Started:** —
**Shipped:** —

---

## Problem

The current YouTube Learning study guide uses `youtube-transcript` to scrape captions, then sends the transcript text to OpenAI o4-mini. This approach has three critical failure modes:

1. **Fails silently on ~30% of videos** — videos with auto-captions disabled, music-heavy content, or non-English auto-captions return an unhelpful error
2. **Misses all visual content** — code shown on screen, architecture diagrams, terminal output, whiteboard drawings, and slide text are invisible to the model
3. **Wrong model for the task** — Gemini 1.5 Flash accepts a YouTube URL directly as a multimodal input. It watches the video — audio + visual — without any preprocessing. OpenAI cannot do this.

The feature spec said "Gemini multimodal" from day one. What shipped was a workaround.

---

## Goal

Replace the transcript-scraping pipeline with a direct Gemini 1.5 Flash call. The model receives the YouTube URL, watches the video, reads slides and code on screen, hears the narration, and returns a richer study guide — all in a single API call.

---

## How Gemini Multimodal Works

Gemini 1.5 Flash (and Pro) natively accept YouTube URLs as video inputs:

```typescript
// Google Generative AI SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const result = await model.generateContent([
  {
    fileData: {
      mimeType: 'video/mp4',
      fileUri: `https://www.youtube.com/watch?v=${videoId}`,
    },
  },
  { text: systemPrompt },
]);
```

The `@google/generative-ai` package is **already installed** (`package.json` shows it). Zero new dependencies.

---

## What Improves

| Capability | Transcript + OpenAI | Gemini Multimodal |
|-----------|--------------------|--------------------|
| Videos with no captions | ❌ Fails | ✅ Works (uses audio) |
| Code shown on screen | ❌ Invisible | ✅ Reads it |
| Architecture diagrams | ❌ Invisible | ✅ Describes them |
| Slide text | ❌ Invisible | ✅ Reads it |
| Terminal output | ❌ Invisible | ✅ Reads it |
| Non-English videos | ❌ Often fails | ✅ Can handle |
| Package / dependency needed | `youtube-transcript` | None (URL direct) |
| Latency | ~8–15s (transcript fetch + LLM) | ~5–10s (single call) |

---

## Streaming Response

Gemini 1.5 Flash supports streaming. The study guide streams in token-by-token, same UX as today:

```typescript
const stream = await model.generateContentStream([
  { fileData: { mimeType: 'video/mp4', fileUri: youtubeUrl } },
  { text: studyGuidePrompt },
]);

const encoder = new TextEncoder();
const readable = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream.stream) {
      const text = chunk.text();
      if (text) controller.enqueue(encoder.encode(text));
    }
    controller.close();
  },
});
return new Response(readable, { headers: { 'Content-Type': 'text/plain' } });
```

---

## Prompt (unchanged from spec)

The study guide JSON schema is already well-designed. No changes needed. The only change is the input method — YouTube URL instead of extracted transcript text.

```typescript
const studyGuidePrompt = `You are a technical educator helping an Australian developer
learn from this YouTube video. Analyse everything visible and audible in the video.

Return ONLY valid JSON matching this schema (no markdown):
${SCHEMA}

Rules:
- Base all content on what is actually in the video — audio AND visual.
- For architectureNote: describe any diagram, system design, or code structure shown on screen.
- keyConcepts: include terms from both narration and on-screen text/code.
- australianContext: how this technology appears in AU IT job ads.`;
```

---

## Error Handling

| Error | Cause | Response |
|-------|-------|----------|
| `INVALID_ARGUMENT` | Video too long (>2h) | "This video is too long for analysis. Try a specific chapter link, or use NotebookLM." |
| `PERMISSION_DENIED` | Private or age-restricted video | "This video isn't publicly accessible." |
| `RESOURCE_EXHAUSTED` | Gemini free quota (1,500 req/day) hit | "AI analysis is temporarily unavailable — try again in a few hours, or use the NotebookLM panel." |
| Video is music/ambient | No analysable content | Gemini returns a result noting no technical content; UI shows graceful message |

All errors still show the NotebookLM panel as a fallback — users are never stranded.

---

## Cost

| Tier | Rate | Cost per 10-min video |
|------|------|----------------------|
| Gemini 1.5 Flash — free tier | 1,500 req/day | $0 |
| Gemini 1.5 Flash — paid | $0.075/1M input tokens | ~$0.004 |
| OpenAI o4-mini (current) | ~$0.035/call | $0.035 |

**Switching to Gemini reduces cost by ~90% and removes the transcript dependency.**

---

## Migration Plan

1. Update `app/api/learn/analyse/route.ts`:
   - Remove `YoutubeTranscript` import and fetch
   - Replace OpenAI call with Gemini streaming call
   - Keep the same cache-first / cache-write pattern (no change to Supabase logic)
2. Remove `youtube-transcript` from `package.json`
3. Add `GEMINI_API_KEY` to `.env.local` and Vercel environment variables (key is already in `@google/generative-ai`)
4. Update error messages to be Gemini-specific

No frontend changes required — the streaming response format is identical.

---

## Files

| File | Change |
|------|--------|
| `app/api/learn/analyse/route.ts` | Rewrite — Gemini multimodal instead of transcript + OpenAI |
| `package.json` | Remove `youtube-transcript` dependency |

---

## Acceptance Criteria

- [ ] Study guide generates for a video with no manually added captions
- [ ] `architectureNote` field contains descriptions of diagrams when a video has them
- [ ] `keyConcepts` includes terms from on-screen code/slides, not only narration
- [ ] Streaming works — guide appears progressively, not all at once
- [ ] All error states handled gracefully with NotebookLM fallback
- [ ] `youtube-transcript` removed from `package.json` and `node_modules`
- [ ] `GEMINI_API_KEY` documented in `.env.local.example`
- [ ] `npm run check` passes
