---
title: "larksuite/cli: 200+ Business API Commands, Pre-Wired for AI Agents"
date: "2026-03-30"
excerpt: "larksuite/cli dropped this week with 4,600+ stars and 19 structured AI Agent Skills out of the box. Here's why it's a practical reference for anyone building tool-using assistants right now."
tags: ["AI Agents", "TypeScript", "Go", "Developer Tools", "LLM"]
coverEmoji: "🤖"
auto_generated: true
source_url: "https://github.com/larksuite/cli"
---

larksuite/cli hit GitHub Trending with 4,600+ stars in a single week, and the reason is pretty obvious once you look at it: this isn't another chatbot wrapper. It's a production-grade CLI with 200+ commands across 11 business domains, and 19 pre-built AI Agent Skills designed to be called directly by LLMs. If you've been trying to figure out how to structure tool-calling for real business workflows — not toy demos — this repo is a concrete, working blueprint.

## What the Three-Layer Architecture Actually Means

The CLI exposes three levels of abstraction, and this is the bit worth understanding before you cargo-cult the patterns into your own agent:

- **Shortcuts** — human and AI-friendly aliases (`lark msg send`, `lark cal today`)
- **API Commands** — platform-synced, one-to-one with Lark's REST API
- **Raw API** — full coverage escape hatch when the structured commands don't cut it

For agent use, the shortcuts layer is where you want to operate. The parameters are minimal, the output is structured JSON, and they're designed to maximise LLM call success rates — meaning fewer hallucinated parameters and cleaner responses for your tool-call parser.

Installing it takes about 30 seconds:

```bash
npm install -g @larksuite/cli
lark login
```

After auth, you can immediately test what an agent would call:

```bash
# List today's calendar events — returns structured JSON
lark cal agenda --date today --format json

# Send a message to a chat
lark msg send --chat-id <id> --text "Deploy finished"

# Create a task with a due date
lark task create --title "Review PR #42" --due "2024-12-20"
```

Each command returns clean JSON — no scraping, no markdown parsing.

## Wiring the Skills into a TypeScript Agent

The 19 Agent Skills are defined as structured schemas in `/skills/` — think of them as pre-written tool definitions you'd normally spend a week authoring. You can pull these directly into a `tools` array for OpenAI, Anthropic, or any function-calling-compatible model.

Here's how I'd wire this into a Next.js API route with the Vercel AI SDK:

```typescript
import { openai } from '@ai-sdk/openai';
import { generateText, tool } from 'ai';
import { exec } from 'child_process';
import { promisify } from 'util';
import { z } from 'zod';

const execAsync = promisify(exec);

const larkTools = {
  sendMessage: tool({
    description: 'Send a message to a Lark chat or user',
    parameters: z.object({
      chatId: z.string().describe('The chat or user ID'),
      text: z.string().describe('Message content'),
    }),
    execute: async ({ chatId, text }) => {
      const { stdout } = await execAsync(
        `lark msg send --chat-id ${chatId} --text "${text}" --format json`
      );
      return JSON.parse(stdout);
    },
  }),
  getTodayAgenda: tool({
    description: 'Get the current user calendar agenda for today',
    parameters: z.object({}),
    execute: async () => {
      const { stdout } = await execAsync(
        'lark cal agenda --date today --format json'
      );
      return JSON.parse(stdout);
    },
  }),
  createTask: tool({
    description: 'Create a task with optional due date',
    parameters: z.object({
      title: z.string(),
      due: z.string().optional().describe('ISO date string'),
    }),
    execute: async ({ title, due }) => {
      const dueFlag = due ? `--due ${due}` : '';
      const { stdout } = await execAsync(
        `lark task create --title "${title}" ${dueFlag} --format json`
      );
      return JSON.parse(stdout);
    },
  }),
};

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await generateText({
    model: openai('gpt-4o'),
    tools: larkTools,
    maxSteps: 5,
    prompt,
  });

  return Response.json({ text: result.text, steps: result.steps });
}
```

For a Supabase backend, you'd log each tool invocation to an `agent_actions` table — useful for auditing what the agent actually did and debugging multi-step failures.

```sql
create table agent_actions (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,
  tool_name text not null,
  parameters jsonb,
  result jsonb,
  created_at timestamptz default now()
);
```

## Security Is Not an Afterthought Here

The README calls out input injection protection and OS-native keychain storage explicitly — and for agent use cases this matters a lot. When an LLM is constructing CLI arguments, injection is a real vector. The CLI sanitises terminal output and validates inputs before execution, which is something you'd have to build yourself with a raw HTTP wrapper. Credentials go through the OS keychain, not env vars you might accidentally log.

Still — shell exec in a server context needs care. In production I'd run this in a sandboxed container with a restricted user, and validate any LLM-generated parameters against a schema before they touch the shell.

## What I'd Build With This

**1. Slack-style standup bot for Lark teams** — Agent pulls each team member's completed tasks and calendar events from the previous day, generates a standup summary, and posts it to the team group chat. Fully automated, no human in the loop. The `task list`, `cal agenda`, and `msg send` commands cover the entire workflow.

**2. AI project manager assistant** — A Next.js app where you talk to an agent that can create tasks, schedule meetings, spin up Lark Docs for meeting notes, and invite attendees — all in one conversation. The 19 pre-built Skills map almost directly onto what you'd want from a PM assistant.

**3. Automated incident response workflow** — On a PagerDuty alert webhook, an agent creates a Lark group chat with the on-call team, posts the incident details, creates a tracking task with due dates, and opens a shared doc for the post-mortem. Zero manual coordination during an outage.

The broader pattern here is what I find most useful. Whether or not you're on Lark, this repo is one of the clearest public examples of how to structure a CLI for agent consumption — the three-layer abstraction, the JSON-first output, the pre-defined skill schemas. Fork the pattern, apply it to whatever internal tooling you're wrapping, and you'll save yourself weeks of trial and error figuring out why your agent keeps hallucinating parameters.
