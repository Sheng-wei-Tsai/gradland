---
title: "Chrome's Built-In AI API: Run Gemini Nano In-Browser for Free"
date: "2026-04-27"
excerpt: "Chrome 138 ships a LanguageModel API that runs Gemini Nano on-device — no server, no API key, no per-token cost. Here's what the API looks like and what you can actually build with it."
tags: ["AI", "JavaScript", "Browser APIs", "Chrome"]
coverEmoji: "🧠"
auto_generated: true
source_url: "https://developer.chrome.com/docs/ai/prompt-api"
---

Chrome 138 shipped with Gemini Nano baked in and a new `LanguageModel` API that lets you run it without a server, without an API key, and without paying per token. It went GA recently and the [HN thread today](https://news.ycombinator.com/item?id=) reminded me to actually sit down and test it.

Here's what it can do and where the catches are.

## The API surface

The entry point is `LanguageModel.create()`. No imports, no SDK — it's just a browser global:

```javascript
// Check if the model is ready on this device
const availability = await LanguageModel.availability();
// Returns: "available", "downloadable", "downloading", or "unavailable"

const session = await LanguageModel.create();
const result = await session.prompt('Summarise this in one sentence: ...');
console.log(result);
```

Streaming works as you'd expect:

```javascript
const stream = session.promptStreaming('Explain async/await to a junior dev');
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

Sessions are stateful — they keep conversation context. You can clone them to branch a conversation thread, track usage with `session.contextUsage` / `session.contextWindow`, and clean up with `session.destroy()`.

## Structured output — where it gets useful

The part that makes this genuinely practical is `responseConstraint`. Pass a JSON Schema and the model returns valid JSON matching that shape:

```javascript
const schema = {
  type: "object",
  properties: {
    sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    topics:    { type: "array", items: { type: "string" } }
  },
  required: ["sentiment", "confidence", "topics"]
};

const result = await session.prompt(
  `Analyse this review: "${userReview}"`,
  { responseConstraint: schema }
);

const parsed = JSON.parse(result);
// { sentiment: "positive", confidence: 0.87, topics: ["battery life", "camera"] }
```

No output parsing, no hoping the model follows your instructions. Constrained generation means the JSON is always valid.

The API also accepts images and audio — `HTMLImageElement`, `ImageData`, `AudioBuffer`, `Blob`. You can feed it screenshots, canvas frames, or audio clips alongside text prompts.

## The hardware catch

On-device means the hardware requirements are real:

- 22 GB free storage (model download)
- GPU with 4+ GB VRAM, **or** 16+ GB RAM with a 4-core CPU
- Chrome 138+ on Windows 10/11, macOS 13+, or Linux

No mobile Chrome. No iOS. ChromeOS only on Chromebook Plus.

That's a meaningful constraint if you're thinking about it as a user-facing feature. It covers most developer laptops fine, but not the general public. The right pattern is feature detection with a server-side fallback:

```javascript
async function getAISession() {
  if (typeof LanguageModel === 'undefined') return null;
  const availability = await LanguageModel.availability();
  if (availability === 'unavailable') return null;
  return LanguageModel.create();
}

// Usage
const session = await getAISession();
if (session) {
  result = await session.prompt(query);
  session.destroy();
} else {
  // fallback to your API route
  result = await fetch('/api/ai', {
    method: 'POST',
    body: JSON.stringify({ query })
  }).then(r => r.json());
}
```

Users who can run it locally get zero API cost. Everyone else hits your server. You ship once, the experience scales.

## What I'd build with this

**Privacy-first document assistant.** Long forms — visa applications, tax returns, insurance claims — are painful. A local model reading page content and suggesting field values from an uploaded PDF, with no data leaving the browser. The privacy story is actually a selling point for this use case.

**Client-side input moderation.** Run sentiment or toxicity checks on user-generated content before it hits your API. Faster feedback to the user, lower load on your moderation endpoints, nothing to log or store server-side.

**Smart in-page search.** Instead of `Ctrl+F` word matching, let users type "what does it say about refund policy?" and get a direct answer extracted from the current page. No RAG pipeline, no embedding database — just the page text as context and a structured prompt.

---

Gemini Nano is a small model, so it won't replace a proper LLM for anything complex. But for classification, extraction, summarisation, and simple Q&A — tasks where you need something fast and cheap — having a model available by default in Chrome without any setup cost is a real shift in what's possible on the client side.

The hardware requirements will loosen over time as the model is optimised further. Worth adding to your toolkit now, even if it's a progressive enhancement for a while.
