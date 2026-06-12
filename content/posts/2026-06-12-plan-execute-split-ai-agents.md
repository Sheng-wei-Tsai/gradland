---
title: "Use your best model to plan. Use your cheapest to execute."
date: "2026-06-12"
excerpt: "shadcn's new /improve skill hit 2000 stars in a week by doing one thing: separating codebase understanding from code execution. Here's the pattern and how to wire it into your own AI pipelines."
tags: ["AI", "Architecture", "Claude"]
coverEmoji: "🧠"
auto_generated: true
source_url: "https://github.com/shadcn/improve"
---

A GitHub skill called [improve](https://github.com/shadcn/improve) hit 2000 stars this week by doing exactly one thing: it never writes code. It only writes plans.

You run `/improve` against your codebase. It maps the repo, audits it across categories (security, performance, tech debt, N+1 queries), and drops self-contained markdown specs into a `plans/` directory. Then you hand those specs to a cheaper model — Haiku, mini, whatever — to actually implement.

That's it. But the traction tells me a lot of us have been muddling this up.

## Why intelligence compounds at planning time, not execution time

Opus 4.8 and Haiku 4.5 write basically the same `for` loop. What they don't write the same is the *spec* for what that loop should do.

Understanding a codebase takes real reasoning: following call chains across files, spotting that your auth middleware fires before your rate limiter, noticing that two files have drifted from a shared abstraction. That's where a capable model earns its cost. Once you've written "move rate limiting to run before auth in `middleware.ts`, line 47" — any model can execute that.

The planning stage also has a different frequency profile. You run it occasionally, deliberately. The execution stage runs constantly, one file at a time. If you're paying Opus rates for every `git diff → implement` loop, you're burning money on the boring part.

## How improve's workflow actually runs

```
you          →  /improve                     (expensive model — understands, advises)
plans/001.md →  "Fix N+1 query in posts feed" (self-contained spec)
other agent  →  implements + tests            (cheap model — executes)
```

The specs it produces are deliberately fat — enough context that the executor doesn't need to re-read the whole codebase. File paths, line numbers, the why, the expected diff shape. A cheap model with a good spec beats an expensive model with a vague prompt every time.

There's also `/improve branch` which scopes the audit to only what the current branch changes. That's immediately useful as a pre-PR hook.

## Applying the pattern to your own API routes

If you're building AI features in a Next.js app, you're probably already doing an unconscious version of this. Here's how to make it explicit:

```ts
// Route 1: planning — Sonnet, called once
// app/api/analyse/plan/route.ts
const plan = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2048,
  messages: [{
    role: 'user',
    content: `Analyse this resume. Return JSON with: overall_score, top_3_issues, 
    and for each issue: section, line_quote, improvement_spec.\n\n${resume}`
  }]
});

// Route 2: execution — Haiku, called once per plan item
// app/api/analyse/execute/route.ts
const result = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 512,
  messages: [{
    role: 'user',
    content: `Rewrite this resume bullet per the spec below. Return only the rewritten text.
    
Spec: ${planItem.improvement_spec}
Original: ${planItem.line_quote}`
  }]
});
```

The plan route runs once and is the expensive call. The execution route runs N times — once per bullet point to rewrite — but at Haiku rates that's basically free. Total cost drops 80%+ compared to running Sonnet for every rewrite.

For Gradland's resume analyser I now use exactly this split: Sonnet for the initial analysis and scoring, Haiku for generating the rewritten bullet points. Same output quality, a fraction of the cost.

The key is that the Haiku prompt doesn't need to understand the whole resume — it just needs a tight spec. The expensive model already did that thinking.

## What I'd build with this

**Automated PR review pipeline.** On every PR, a single Sonnet pass identifies which files need attention and writes per-file review specs. Then cheap Haiku agents execute each one in parallel. Total cost: fractions of a cent per PR, with genuinely useful output.

**Content audit tool.** Feed your whole blog to a capable model once, get back a prioritised list of posts that need updating (outdated claims, thin content, broken examples). Then Haiku rewrites each flagged post's summary and intro. One expensive planning pass, many cheap executions.

**Codebase onboarding guide.** New developer joins. Capable model reads the whole repo, writes a "what to read first" guide tailored to their role and experience. Haiku regenerates the guide whenever the architecture changes. Nobody has to maintain it manually.

## My take

The plan-execute split isn't a new idea — it's how senior engineers work with junior ones. Write a tight spec, review the output, iterate on the spec not the code. We're finally getting tooling that makes this pattern explicit for AI agents.

The `/improve` skill is worth installing just to see the plan format it writes. Even if you never use the auto-execute feature, stealing its spec structure for your own pipelines is immediately useful.

```bash
npx skills add shadcn/improve
```
