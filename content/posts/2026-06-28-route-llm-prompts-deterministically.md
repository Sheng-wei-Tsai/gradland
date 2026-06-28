---
title: "Route LLM Prompts by Complexity — No Model Call Needed"
date: "2026-06-28"
excerpt: "Wayfinder Router decides whether to send a prompt to your local model or a cloud LLM using pure computation — no API call, no latency, no extra cost to make the routing decision itself."
tags: ["AI", "LLM", "TypeScript", "Cost Optimisation"]
coverEmoji: "🔀"
auto_generated: true
source_url: "https://github.com/itsthelore/wayfinder-router"
---

If you're building AI-powered apps, you've probably noticed your API bill doesn't care whether you asked Claude to debug a complex multi-file refactor or to capitalise the first letter of a string. You pay frontier prices for both.

The obvious fix is to route cheap, simple prompts to a local model (Ollama, llama.cpp) and only escalate to the expensive cloud model when the query actually needs it. The problem: most existing routers make this decision by... calling a model. You pay to ask "is this prompt complex?" before you've even decided which model to call. It's absurd.

Wayfinder Router takes a different approach. It reads the *structure* of the prompt — length, headings, lists, code blocks, mathematical notation — and outputs a complexity score in microseconds, entirely offline. No model call. No API key. No randomness. Same prompt always gets the same score.

## How the routing decision works

Wayfinder scores prompts on structural signals that correlate with difficulty:

- **Length**: longer prompts tend to be more complex
- **Formatting**: bullet lists, numbered steps, markdown headings suggest structured reasoning tasks
- **Code blocks**: presence of code almost always means you want a capable model
- **Hard-constraint language**: words like "proof", "constraint", "exactly N" raise the score

There's also optional lexical scoring for maths and formal reasoning — but the author's own blind-test benchmark showed these signals don't generalise to unseen prompts. They ship turned off by default. The structural score alone is what reliably wins.

You set a threshold (default 0.5). Prompts below it go local, at or above go cloud. That's the whole system.

```toml
# wayfinder-router.toml
[routing]
threshold = 0.5

[gateway.models.local]
base_url = "http://localhost:11434/v1"
model    = "llama3.2"

[gateway.models.cloud]
base_url = "https://api.anthropic.com/v1"
model    = "claude-sonnet-4-6"
```

Run `wayfinder-router serve` and you get an OpenAI-compatible gateway on `localhost:8088`. Your app just changes one URL.

## Integrating it in a Next.js API route

Wayfinder is a Python sidecar — you run it alongside your Node app and point your existing Anthropic/OpenAI SDK calls at it instead. Since it speaks the OpenAI `/chat/completions` format, the integration is literally one config change:

```ts
// lib/ai.ts — before
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// after: point at local Wayfinder gateway
const client = new OpenAI({
  baseURL: process.env.LLM_GATEWAY_URL ?? 'http://localhost:8088/v1',
  apiKey: 'not-used', // Wayfinder handles the real keys
});
```

In production on Vercel, `LLM_GATEWAY_URL` would point at a small always-on instance (Fly.io, Railway) running the Wayfinder gateway. Your Next.js app stays stateless.

For local dev, add to your `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"wayfinder-router serve\" \"next dev\""
  }
}
```

The gateway shows you — in real time — which route each prompt took, the complexity score breakdown, and cumulative savings vs always-cloud. After a day of real traffic you can tune the threshold based on actual usage.

## Calibrating the threshold to your traffic

The default 0.5 is a starting point. What you really want is to run dry-run mode against a sample of your actual prompts and look at the score distribution:

```bash
wayfinder-router chat --dry-run
```

Then pull your last 500 real prompts from your logs and eyeball where the boundary should be. A CRUD app that mostly does "summarise this user's activity" should sit with a lower threshold than a coding assistant routing multi-file refactors.

The benchmark (`make benchmark`) will run Wayfinder against RouterBench and RouterArena and show you exactly where it wins (structured, long prompts) and where it doesn't (short but semantically hard prompts like "what's the 100th prime?"). It doesn't pretend to be perfect — it tells you its failure modes up front.

## What I'd build with this

**Tiered AI features by subscription plan.** Free users always route to local; paid users always go cloud. Replace the routing threshold with a plan check — but keep the structure score as a soft signal to upgrade nudges ("this query would benefit from our pro model").

**Per-endpoint routing config in a Next.js middleware.** Some endpoints (resume analysis, interview feedback) should always hit the cloud model. Others (tag suggestions, reading time estimates) never need to. Match the request path and override Wayfinder's threshold header before forwarding.

**Cost attribution dashboard.** Log which model handled each request alongside the user ID and endpoint. After a week you'll know exactly which features are driving your bill — not just the aggregate total. Often one leaky endpoint is responsible for 60% of spend.

---

The thing I like about Wayfinder is that it's honest about what it can't do. The README explicitly says it loses on short-but-semantically-hard prompts and points you to the benchmark. A router that tells you where not to use it is more useful than one that claims 98% accuracy on cherry-picked evals.

It's also worth noting the key insight here applies beyond just this tool: **use computation instead of inference wherever possible.** A regex beats an LLM for format validation. A simple rule beats a classifier for obvious cases. Wayfinder just applies that principle to routing itself.
