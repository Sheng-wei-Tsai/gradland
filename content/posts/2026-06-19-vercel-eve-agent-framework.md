---
title: "Vercel's Eve: Filesystem-First AI Agents Done Right"
date: "2026-06-19"
excerpt: "Vercel just dropped 'eve', a framework that treats AI agents like a Next.js app — conventions over config, file structure over boilerplate, and no runtime surprises."
tags: ["AI Agents", "Vercel", "TypeScript", "Next.js"]
coverEmoji: "🤖"
auto_generated: true
source_url: "https://github.com/vercel/eve"
---

Vercel shipped something interesting three days ago: [eve](https://github.com/vercel/eve), a framework for building durable AI agents. It grabbed 1,400 stars in under 72 hours, which is either a sign it's genuinely useful or a sign that anything Vercel touches gets stars. I read the docs to figure out which.

Turns out, it's mostly the former.

## The core idea: the filesystem is the API

Every other agent framework I've used buries the agent's behaviour in constructor arguments, config objects, or some proprietary SDK. Eve does the opposite — it puts everything in a predictable directory structure:

```
my-agent/
└── agent/
    ├── agent.ts          # model config, optional
    ├── instructions.md   # the system prompt, required
    ├── tools/            # typed functions the model can call
    │   └── search_jobs.ts
    ├── skills/           # longer procedures loaded on demand
    │   └── analyse_resume.md
    ├── channels/         # how the agent receives messages
    │   └── slack.ts
    └── schedules/        # cron jobs
        └── daily_report.ts
```

This is dead obvious once you see it. If you've built a Next.js app, the pattern is familiar: drop a file in the right folder and the framework picks it up. No registration, no imports, no ceremony.

The big win here isn't even the conventions — it's that other coding agents (Claude Code, GitHub Copilot, whatever) can read `agent/instructions.md` directly. Your agent's behaviour is inspectable by humans and machines alike, without needing to trace through layers of SDK calls.

## Tools that feel like TypeScript, not DSLs

Tool definitions use Zod for input validation, which means you get type safety and runtime checks from the same schema:

```ts
// agent/tools/check_visa_status.ts
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Look up current processing times for a visa subclass.",
  inputSchema: z.object({
    subclass: z.enum(["482", "485", "189", "190"]),
    state: z.string().optional(),
  }),
  async execute({ subclass, state }) {
    const data = await fetchVisaProcessingTimes(subclass, state);
    return { subclass, processingWeeks: data.median_weeks };
  },
});
```

The model sees the description. Your code sees typed inputs. That's it.

## Skills for longer procedures

Tools handle discrete lookups. Skills handle multi-step procedures — and they're just markdown:

```markdown
<!-- agent/skills/review_resume.md -->
# Resume Review

When asked to review a resume:
1. Extract the candidate's target role from context
2. Call `check_job_market` to get current demand for that role in AU
3. Identify skill gaps between resume and top 5 job listings
4. Return structured feedback: strengths, gaps, specific suggestions
```

This is clever. Skills are prompt fragments the model loads when it decides they're relevant. You get conditional behaviour without branching logic in code. And since it's markdown, you can version-control prompt iterations the same way you version-control code.

## Getting started in two minutes

```bash
npx eve@latest init my-agent
cd my-agent
```

That gives you a working terminal UI with an agent you can start talking to immediately. The CLI is actually pleasant — not the typical "here's a JSON REPL" developer experience.

To add it to an existing project (a Next.js app, say):

```bash
cd myapp
npx eve@latest init .
```

The docs are bundled inside `node_modules/eve/docs`, which means your coding agent can read them locally without hitting the internet. That's a small thing but it shows they've thought about the full developer workflow.

## What I'd build with this

**Career tools assistant for Gradland.** The visa tracker and resume analyser could each be eve agents with domain-specific tools — `check_visa_processing_times`, `compare_resume_to_jd`, `fetch_asx_salaries`. Each tool is self-documenting, each skill handles a complete user interaction. Right now that logic is scattered across API routes; eve would give it structure.

**Automated job market analyst.** A scheduled agent that runs each morning, pulls fresh job listings from the usual sources, cross-references them with a target role and location, and posts a Slack or Discord summary. The `schedules/` directory makes this a one-file addition.

**Interview prep coach.** An agent that knows which questions are common for specific roles and visa subclasses, maintains session state across a practice interview, then summarises weak spots at the end. Skills for "technical screen", "behavioural questions", "system design" — each as a markdown file.

## My take

Eve is early — the npm package launched three days ago — so I'd be cautious about building anything production-critical on it right now. But the design is sound. Filesystem conventions work for Next.js; they'll work for agents too. The fact that it's from Vercel means it'll probably integrate cleanly with edge functions and AI SDK down the track.

The pattern I'll steal immediately, regardless of whether I use eve directly: putting the system prompt in a separate markdown file instead of buried in the code. That alone makes the agent's behaviour auditable without reading TypeScript.

Worth watching.
