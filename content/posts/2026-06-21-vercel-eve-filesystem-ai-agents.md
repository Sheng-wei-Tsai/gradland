---
title: "vercel/eve: AI Agents as a Filesystem, Not a Config Object"
date: "2026-06-21"
excerpt: "Vercel just dropped eve — a framework that treats your agent's instructions, tools, and schedules as files on disk, not code buried in a config blob."
tags: ["AI", "TypeScript", "Vercel", "Agents"]
coverEmoji: "🗂️"
auto_generated: true
source_url: "https://github.com/vercel/eve"
---

Vercel shipped [eve](https://github.com/vercel/eve) this week and it already has nearly 2k stars. I've been building AI agents in Next.js Route Handlers for a while now — shoving system prompts into string literals, wiring tools manually, trying to keep everything coherent across files. eve flips the model: your agent's entire personality and capability set lives in a directory you can actually read.

## What eve actually is

The pitch is "filesystem-first framework for durable AI agents." In practice, that means your agent is a folder:

```text
my-agent/
└── agent/
    ├── agent.ts            # model config (optional)
    ├── instructions.md     # always-on system prompt
    ├── tools/              # typed functions the model can call
    │   └── get_weather.ts
    ├── skills/             # procedures loaded on demand
    │   └── plan_a_trip.md
    ├── channels/           # inbound message channels (HTTP, Slack, Discord)
    │   └── slack.ts
    └── schedules/          # recurring cron jobs
        └── weekly_recap.ts
```

Scaffold it with:

```bash
npx eve@latest init my-agent
# or drop it into an existing project
npx eve@latest init .
```

Then `npm run dev` spins up an interactive terminal UI. That's your agent running.

## Tools are just typed functions

This is the part that clicked for me. A tool is a file that exports a `defineTool` call — Zod schema, description, execute function:

```ts
// agent/tools/search_jobs.ts
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Search for IT jobs in Australia by location and role.",
  inputSchema: z.object({
    location: z.string(),
    role: z.string(),
    visaSponsorship: z.boolean().optional(),
  }),
  async execute({ location, role, visaSponsorship }) {
    // your actual implementation
    const results = await fetchJobsFromAPI({ location, role, visaSponsorship });
    return results;
  },
});
```

eve auto-discovers every file in `agent/tools/` and exposes them to the model. No registration, no tool array to maintain — just drop a file in.

## Picking your model

The model config is its own file, not tangled into the tool definitions or the prompt:

```ts
// agent/agent.ts
import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-sonnet-4.6",
});
```

Swap the model string and you're done. Since the instructions are in a separate markdown file, you can test the same prompt against different models without touching anything else — useful when you're deciding whether Haiku is fast enough or you need Sonnet.

## Skills vs Tools

The distinction here is useful. **Tools** are atomic functions the model calls (fetch weather, query a DB). **Skills** are markdown files that describe multi-step procedures — loaded on demand when the task matches:

```md
<!-- agent/skills/visa_checklist.md -->
# Visa Application Checklist Skill

When the user asks about visa requirements, follow this procedure:
1. Identify the visa subclass (482, 485, 189, 190)
2. Retrieve current processing times via the get_processing_times tool
3. List mandatory documents for that subclass
4. Flag any recent policy changes from the last 30 days
```

This is a pattern I wish I'd had earlier — instead of cramming conditional logic into one giant system prompt, you define focused procedures that get pulled in as needed.

## Channels and Schedules

`agent/channels/` lets you wire up inbound messages from Slack, Discord, or HTTP without writing the plumbing yourself. `agent/schedules/` gives you cron jobs as TypeScript files:

```ts
// agent/schedules/daily_visa_digest.ts
export default {
  cron: "0 8 * * *",
  async run(agent) {
    const news = await agent.run("Summarise any visa policy changes from the last 24 hours.");
    await agent.channel("slack").send(news);
  },
};
```

Compared to the GitHub Actions cron + bash script pattern I've been using, this is much cleaner to reason about.

## What I'd build with this

**1. A visa tracker agent** — `instructions.md` scoped to Australian immigration policy, tools for scraping the DOHA processing times page and the Migration Amendment Gazette, a daily schedule that pushes a digest to a Slack channel. The file-per-tool structure means adding a new data source is one file, not a hunt through a 400-line route handler.

**2. A resume review agent with Slack intake** — `channels/slack.ts` accepts a file upload, `tools/parse_resume.ts` extracts structured data, `tools/score_against_role.ts` compares it to a job description. The channel-based intake makes it trivially embeddable in any team Slack workspace.

**3. A local developer CLI agent** — `instructions.md` gives it context about a specific codebase (tech stack, conventions, forbidden patterns), tools for running tests and reading files, a human-in-the-loop prompt before any write operation. eve includes its full docs in `node_modules/eve/docs` so your coding agent can actually read the framework docs — that's a nice touch.

## My take

The framework-of-the-week problem is real, but this one is solving an actual friction point. The thing I keep running into with agent code is that it gets opaque fast — the system prompt, tools, and runtime logic all colocated in one file or scattered across unrelated modules. eve's filesystem layout makes an agent auditable at a glance.

It's five days old (created 2026-06-16) so I'd be cautious putting it in front of production traffic right now. But for internal tools and prototypes it's immediately useful. I'm going to wire it up for a job alert agent this weekend — will post about how that goes.

Repo: [github.com/vercel/eve](https://github.com/vercel/eve) · Docs: [eve.dev/docs](https://eve.dev/docs)
