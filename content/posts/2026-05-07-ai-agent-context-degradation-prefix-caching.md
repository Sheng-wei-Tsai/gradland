---
title: "Why Your AI Agent Gets Dumber Over Time"
date: "2026-05-07"
excerpt: "Attention degradation is why long agent sessions produce worse results — and prefix caching is why they also get expensive. Here's the engineering response to both."
tags: ["AI", "Architecture", "Performance", "Developer Tools"]
coverEmoji: "🧠"
auto_generated: true
source_url: "https://github.com/mattpocock/dictionary-of-ai-coding"
---

You've probably noticed it: start a long AI coding session and early on the agent is sharp, catches subtle things, holds context well. An hour later it's making mistakes it wouldn't have made at the start. You clear the session and suddenly it's good again.

That's not random. It's a specific, predictable property of how transformer models work. Matt Pocock just published a [dictionary of AI coding terminology](https://github.com/mattpocock/dictionary-of-ai-coding) that hit 1,000 GitHub stars this week. Two concepts in it explain both the performance degradation and the cost blowout that goes with it — and point to concrete fixes.

## The attention budget problem

Every token in a context window has a finite "attention budget" — influence to distribute across its relationships with other tokens. When you're early in a session with a small context window, the model can maintain strong attention relationships between the things that matter: your task description, the file you're editing, the error you're debugging.

As the session grows, every token's attention budget gets spread thinner. Irrelevant content — the ten previous attempts, the stdout from commands you don't care about, the files the agent read but didn't use — competes for the same finite budget. The model hasn't become worse. The signal-to-noise ratio has just degraded.

Matt's dictionary calls this the **smart zone** vs the **dumb zone**:

> "Early in a session the agent is sharp and focused. As it grows, it drifts into a dumb zone: sloppier, forgetful, more mistakes."

The fix isn't a better model. It's session management.

## What session management actually means

There are three approaches, and they have different tradeoffs:

**Clearing** is the blunt instrument. End the session, start fresh. You lose everything the agent learned during the session. Only use this when you're genuinely starting a new task.

**Handoff artifacts** are the right answer for multi-session work. Before you clear, have the agent write a document summarising what it knows: what it built, what decisions were made, what's still in progress, what the next step is. The next session reads this document as its first input. You get a fresh context window but carry the meaningful information forward. This is what your AGENTS.md file is for at the project level.

```
Session 1: builds feature, writes HANDOFF.md with current state
Session 2: reads HANDOFF.md, continues from where Session 1 left off
```

**Compaction** is the in-memory version: the harness summarises the session history and starts a new session seeded with that summary. This is what Claude Code's `/compact` command does. It's lossy — detail is traded for headroom — but it's better than hitting the context limit mid-task.

For production AI features (not just local dev sessions), the pattern maps to explicit context management in your API calls:

```ts
// Don't just keep appending messages forever
const messages = conversationHistory.slice(-10); // keep last N turns

// Or summarise old history explicitly
const summary = await summariseHistory(oldMessages);
const messages = [
  { role: 'user', content: summary },
  ...recentMessages,
];
```

## Prefix caching: the cost flip side

There's a counterintuitive wrinkle here. Clearing sessions too aggressively is expensive.

Every model provider request re-sends the full context window. Input tokens cost money. If you have a 50,000-token system prompt and you're making 100 API calls per hour, you're re-billing for that system prompt 100 times — unless prefix caching kicks in.

Prefix caching stores the shared prefix (system prompt, static content) server-side and charges a much lower rate for cache hits. On DeepSeek V4 Pro (currently 75% off until 31 May), cache hits are $0.0036/M tokens vs $0.435/M for a cache miss — a 120x difference. Even on Anthropic's models the difference is substantial.

The implication for how you structure API calls:

```ts
// Put stable content first — it'll be cached
const response = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  system: STATIC_SYSTEM_PROMPT, // large, stable — cache hit after first call
  messages: [
    // Static context next — also cached
    { role: 'user', content: loadedDocumentation },
    // Dynamic content last — always a cache miss, keep it small
    { role: 'assistant', content: previousResponse },
    { role: 'user', content: userMessage },
  ],
});
```

The rule: put static content (system prompt, loaded docs, few-shot examples) at the top of your message list and keep it identical across requests. Dynamic content (the conversation history, the specific user question) goes at the end. The cache prefix stays consistent and you pay cache-hit rates for the expensive part.

This is in direct tension with the attention degradation problem. You want fresh sessions for quality, but session continuity for cache efficiency. The resolution: keep your static context large and stable (worth caching), keep your rolling conversation history short and well-managed.

## What I'd build with this

**Session health monitoring for an AI-powered feature.** Track context window size across a user's conversation session and surface a "start fresh" prompt when it crosses a threshold. Most users don't know why the agent has degraded — giving them a visible signal and a one-click refresh would improve the perceived quality significantly.

**Automatic handoff generation before context limits.** When a user's context window is 80% full, have the model generate a concise state summary, save it, clear the session, and inject the summary as the opening message. Seamless to the user, prevents the dumb zone from ever being hit.

**Cache-aware API client wrapper.** A thin wrapper around the Anthropic/DeepSeek SDK that separates messages into "static prefix" and "dynamic tail" buckets, assembles them in the correct order for maximum cache hits, and logs cache hit/miss ratios. Useful for any production app running high-volume inference.

---

The dictionary Matt published is worth reading in full — it's not long and it gives you clean mental models for things that otherwise accumulate as vague intuitions. The attention degradation and prefix cache concepts in particular are the kind of thing that should inform how you architect AI features from the start, not after you've seen the bill.

The practical summary: manage your session boundaries deliberately, write handoff artifacts for anything multi-session, put stable content first in your messages array, and trim dynamic history aggressively. The model doesn't get worse — you just have to stop feeding it noise.
