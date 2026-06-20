---
title: "Vercel's eve: Build AI Agents Like You'd Build a Next.js App"
date: "2026-06-20"
excerpt: "Vercel just dropped eve, a filesystem-first framework for durable AI agents. If you already know Next.js conventions, you already know half of this."
tags: ["AI Agents", "Vercel", "TypeScript"]
coverEmoji: "🤖"
auto_generated: true
source_url: "https://github.com/vercel/eve"
---

Vercel dropped [eve](https://github.com/vercel/eve) four days ago and it already has 1700 stars. I've been building agents with raw Anthropic SDK calls for months, and this scratches an itch I didn't know I had: the problem isn't writing the agent loop, it's that every project ends up with a slightly different structure that nobody else can navigate.

Eve's bet is that filesystem conventions fix this — the same way Next.js made React apps predictable by opinionating on where pages, layouts, and API routes live.

## The core idea: files are the interface

An eve agent lives in an `agent/` directory. The structure is rigid on purpose:

```text
my-agent/
└── agent/
    ├── agent.ts            # model + runtime config
    ├── instructions.md     # the system prompt — always in context
    ├── tools/              # TypeScript functions the model can call
    │   └── search_jobs.ts
    ├── skills/             # Markdown procedures loaded on demand
    │   └── analyse_resume.md
    ├── channels/           # HTTP, Slack, Discord message endpoints
    │   └── slack.ts
    └── schedules/          # cron jobs
        └── daily_digest.ts
```

The distinction between **tools** and **skills** is worth understanding. Tools are code — typed TypeScript functions that actually run. Skills are Markdown — procedures the model reads to know how to approach a class of task. Tools do things; skills teach the model to think about things.

This maps well to how I actually reason when building agents. There's the mechanical part (call this API, write to this table) and the judgment part (how to prioritise a candidate's resume, what makes a good cover letter). Separating them keeps the code clean and the prompt cheap.

## Scaffolding and tooling

```bash
npx eve@latest init my-agent
cd my-agent
npm run dev
```

That's a working agent with an interactive terminal UI. To add it to an existing project, just point it at the directory:

```bash
cd myapp
npx eve@latest init .
```

A minimal tool looks like this:

```ts
// agent/tools/search_jobs.ts
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Search for IT jobs matching a role and location.",
  inputSchema: z.object({
    role: z.string(),
    location: z.string().default("Australia"),
  }),
  async execute({ role, location }) {
    const results = await fetchFromJobsAPI(role, location);
    return results.slice(0, 5);
  },
});
```

Zod handles input validation automatically. The model sees the schema description and knows exactly what it can pass. No hand-rolled JSON Schema objects, no fumbling with required arrays.

The model config lives in `agent/agent.ts`:

```ts
import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-sonnet-4-6",
});
```

Note the provider prefix: `anthropic/`, `openai/`, etc. Eve abstracts the provider, so you can swap models without touching tool code.

## What's clever: docs ship in node_modules

One thing I didn't expect: eve bundles its own documentation into `node_modules/eve/docs`. The intention is that your coding agent (Claude Code, Cursor, whatever) can read the framework docs locally without you having to paste them in. The framework is designed to be consumed by AI tooling, not just humans.

That's a neat dogfood loop — an agent framework that optimises for being used by agents.

## Schedules are first-class

The `schedules/` directory is probably the feature I'll reach for most. Right now I'm running daily cron jobs as GitHub Actions workflows, which works but means my agent logic is split between the Actions YAML and whatever script it calls. Eve's schedule pattern keeps it co-located:

```ts
// agent/schedules/daily_digest.ts
import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * *",
  async run(agent) {
    await agent.run("Compile the daily job market digest for Australian IT roles.");
  },
});
```

Whether this deploys to Vercel Functions or runs locally — I haven't dug into the runtime yet — but the model is right.

## What I'd build with this

**Job search agent for visa holders.** An agent that monitors job boards daily, scores listings against a user's visa conditions (482, 485, etc.), and pushes a Slack digest each morning. The skills directory would hold guidance on visa-eligible employers and ACS-accredited roles. The schedule runs at 6am AEST. This is basically Gradland's job feature with an agent brain.

**Resume iteration loop.** A channel that accepts a resume PDF over HTTP, runs it through analysis tools, and returns structured feedback with specific rewrites suggested. Skills define what "strong bullet point" and "ATS-compatible format" mean. The model does judgment; the tools do extraction and formatting.

**Onboarding interviewer.** An HTTP channel that conducts a structured onboarding conversation — collecting role, visa status, skills, goals — and writes the results to Supabase. Currently I do this with a stateless API route and a lot of session juggling. A durable agent handles the multi-turn state properly.

## My take

Eve is in beta and the API will move. I wouldn't put it in production next week. But the design direction is right: agent projects need the same kind of enforced structure that Next.js brought to React apps. Right now everyone's reinventing the same scaffolding.

The filesystem-first model also makes agents inspectable. When something goes wrong, you open `agent/instructions.md` and read the system prompt. You open `agent/tools/` and read what the model can do. No hunting through provider SDK boilerplate.

Worth cloning and poking at this weekend. The concepts will stick even if the API changes.
