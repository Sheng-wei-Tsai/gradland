---
title: "Give Your AI Agent a Filesystem, Not a Stack of APIs"
date: "2026-05-10"
excerpt: "Mirage mounts S3, Slack, GitHub, and Supabase side-by-side as a single Unix-like tree so your agents use bash instead of juggling N SDKs."
tags: ["AI", "TypeScript", "Agents"]
coverEmoji: "🗂️"
auto_generated: true
source_url: "https://github.com/strukto-ai/mirage"
---

Every AI agent project I've worked on hits the same wall. You start with one integration — say, pulling from S3. Then you add GitHub to read repo context. Then Slack for notifications. Then Supabase for user data. Each one is a different SDK, different auth model, different error surface, and now your agent's tool list looks like a phone book.

[Mirage](https://github.com/strukto-ai/mirage) just hit 1,700 stars in its first week. The idea is deceptively simple: mount all those services as paths in a single virtual filesystem, then let your agent navigate them with ordinary Unix commands.

```ts
const ws = new Workspace({
  '/data':    new RAMResource(),
  '/s3':      new S3Resource({ bucket: 'logs' }),
  '/slack':   new SlackResource({}),
  '/github':  new GitHubResource({}),
  '/supabase': new SupabaseResource({ url, key }),
})

await ws.execute('cat /github/myorg/myrepo/README.md')
await ws.execute('grep error /slack/general/*.json | wc -l')
await ws.execute('cp /s3/report.csv /data/local.csv')
```

That's your agent's entire interface to four different backends.

## Why Filesystems Click for LLMs

The thing Mirage gets right that most agent frameworks miss: LLMs are fluent in bash. Not because they're trained on bash tutorials — because the entire corpus of Unix documentation, Stack Overflow answers, blog posts, and source code is full of `cat`, `grep`, `cp`, `ls`. The vocabulary is already baked in at enormous depth.

Compare that to an arbitrary SDK. Even a well-designed one like the Supabase JS client has a specific query builder syntax your model has seen in a fraction of the training data. Every new API your agent learns is a new vocabulary it has to juggle without forgetting the others.

Mirage bets that one deep vocabulary — Unix — beats N shallow ones. Based on what I've seen, that bet looks right.

## Getting Started in TypeScript

```bash
npm install @struktoai/mirage-node
```

```ts
import { Workspace, RAMResource, S3Resource } from '@struktoai/mirage-node'

const ws = new Workspace({
  '/data': new RAMResource(),
  '/s3':   new S3Resource({ bucket: 'my-bucket', region: 'ap-southeast-2' }),
})

// Agents interact through ws.execute() — plain shell commands
const result = await ws.execute('ls /s3/reports/')
console.log(result.stdout)

// You can also register custom commands
ws.command('summarise', async (args, ctx) => {
  const content = await ctx.read(args[0])
  // ... call Claude here, return summary
})

await ws.execute('summarise /s3/reports/weekly.md')
```

Mirage integrates directly with Vercel AI SDK — which is handy since that's what most Next.js AI projects reach for these days:

```ts
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

const tools = ws.toVercelAITools() // generates tool definitions from your workspace

const { text } = await generateText({
  model: anthropic('claude-sonnet-4-6'),
  tools,
  prompt: 'Check /slack/general for any alerts from the last 24 hours and summarise them',
})
```

The workspace hands the agent a standardised set of filesystem tools. The agent calls them with paths. Mirage dispatches to the right backend. Your code never sees individual SDK calls.

## What I'd Build With This

**Resume analysis pipeline.** Mount the user's uploaded files at `/uploads`, Supabase at `/db`, and an S3 bucket at `/processed`. The agent reads the resume, queries job requirements from the database, writes analysis results back — all with `cat`, `grep`, and `cp`. No bespoke tool definitions, no SDK juggling per step.

**Automated job digest.** Mount GitHub (for tracking open-source job boards), Slack (to post the digest), and a local cache in RAM. A cron-triggered agent greps for AU IT roles, deduplicates against yesterday's results, and pipes the diff to Slack. Three services, zero custom tool schemas.

**Codebase Q&A for onboarding.** Mount your GitHub repo at `/repo` and your Notion wiki at `/docs`. New team members ask natural questions; the agent `grep`s for relevant files, `cat`s them, cross-references the wiki, and returns an answer with file paths. The agent's instructions are basically: "You have a filesystem. Use it."

## My Take

The part I keep coming back to is the snapshot and clone support — you can version an agent's entire workspace state, then replay or branch it. That makes debugging agent runs much less of a guessing game. Right now when an agent does something unexpected you're left reading logs. With a snapshotted workspace you can actually reproduce the run.

It's pre-release on some of the more exotic backends (MongoDB, SSH) but S3, GitHub, Supabase, Slack, and in-memory RAM all work today. For TypeScript apps that's enough surface area to do real work.

Worth keeping an eye on. The unix-as-agent-interface framing feels like it'll stick.
