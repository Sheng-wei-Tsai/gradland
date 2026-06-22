---
title: "Vercel's Eve Makes AI Agents Feel Like Next.js"
date: "2026-06-22"
excerpt: "Vercel just shipped Eve, a filesystem-first framework for durable AI agents. If you've ever felt like agent code turns into spaghetti fast, this is worth your time."
tags: ["AI", "TypeScript", "Agents"]
coverEmoji: "🤖"
auto_generated: true
source_url: "https://github.com/vercel/eve"
---

Vercel quietly dropped [eve](https://github.com/vercel/eve) last week and it hit 2,000+ GitHub stars almost immediately. The pitch is simple: agents should be structured the same way Next.js structures web apps — conventions over configuration, with the filesystem as the authoring interface.

If you've built anything with agents, you've probably noticed how quickly they turn into a mess. System prompts buried in code strings, tools scattered across files with no real home, no obvious place for scheduled jobs. Eve addresses this directly.

## The Filesystem Is the API

Here's what an eve agent looks like on disk:

```text
my-agent/
└── agent/
    ├── instructions.md     # system prompt — always loaded
    ├── agent.ts            # model config (optional)
    ├── tools/
    │   └── search_jobs.ts  # typed functions the model can call
    ├── skills/
    │   └── write_resume.md # procedures loaded on demand
    ├── channels/
    │   └── slack.ts        # message sources (HTTP, Slack, Discord)
    └── schedules/
        └── weekly_digest.ts # cron jobs
```

This is the thing I immediately appreciated: `instructions.md` is just a Markdown file. Your system prompt lives in version control, diffable, reviewable, not concatenated into a TypeScript string somewhere. Skills are also Markdown — loaded on demand, which keeps the context window lean.

## Defining a Tool

Tools are typed with Zod, which means you get input validation for free and Claude gets a clean schema to work with:

```ts
// agent/tools/search_jobs.ts
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Search for IT job listings in Australia by role and city.",
  inputSchema: z.object({
    role: z.string().min(1),
    city: z.enum(["Sydney", "Melbourne", "Brisbane", "Perth"]),
    visaSponsorship: z.boolean().optional(),
  }),
  async execute({ role, city, visaSponsorship }) {
    // hit your API, return structured data
    const results = await fetchJobs({ role, city, visaSponsorship });
    return results;
  },
});
```

The `defineTool` wrapper handles serialising the schema to pass to the model. You don't write JSON Schema by hand — Zod handles the translation. Clean.

## Scheduling and Channels

The parts that really stood out to me are `schedules/` and `channels/`. Scheduled jobs are first-class:

```ts
// agent/schedules/weekly_digest.ts
import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",  // every Monday 9am
  async run(agent) {
    await agent.chat("Summarise the week's job market movement and post to Slack.");
  },
});
```

And channels let you wire up message sources — so your agent can respond to Slack messages, webhook POSTs, or a chat UI without you writing the plumbing:

```ts
// agent/channels/webhook.ts
import { defineChannel } from "eve/channels";

export default defineChannel({
  type: "http",
  path: "/chat",
  async onMessage({ body, agent }) {
    const reply = await agent.chat(body.message);
    return { reply };
  },
});
```

The model config in `agent.ts` is where you set which model to use:

```ts
import { defineAgent } from "eve";

export default defineAgent({
  model: "claude-sonnet-4-6",
});
```

## What I'd Build with This

**Visa tracker agent** — An agent with a scheduled job that checks DIBP and DOHA feeds weekly, compares against a user's visa subclass, and messages them on Slack if processing times shift more than 2 weeks. The scheduling primitive makes this trivial.

**Interview prep coach** — A Slack channel that lets candidates drop in a job description and get back 10 tailored behavioural questions, stored in a Supabase table via a tool. Because channels abstract the HTTP layer, swapping Slack for a web UI later is just a different channel file.

**Autonomous job scout** — A scheduled agent that runs nightly, pulls new listings from Jora and Seek via tools, filters by visa sponsorship availability, and surfaces the top 5 to a Next.js dashboard. The agent decides what's worth surfacing; you just set the criteria in `instructions.md`.

## My Take

What makes eve click is that it applies the same insight Next.js had in 2016: when the framework owns the conventions, teams stop arguing about where things live and start building. The filesystem layout is immediately greppable, auditable, and deployable without needing to reverse-engineer someone's custom agent scaffolding.

The `skills/` concept is particularly interesting — on-demand Markdown procedures that get loaded into context only when needed. That's a practical solution to the context-stuffing problem that most agent builders deal with by just hoping the model ignores irrelevant instructions.

It's early days and the docs are thin in places, but the underlying model is sound. If you're building agents on TypeScript — especially anything that needs scheduling, multiple input channels, or a team of people editing the system prompt — give it a look.

```bash
npx eve@latest init my-agent
```
