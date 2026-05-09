---
title: "Stop Writing Integration Code: Give Your AI Agent a Filesystem"
date: "2026-05-09"
excerpt: "Mirage mounts Slack, S3, GitHub, Supabase, and Gmail side-by-side under a single virtual filesystem. Your agent uses cat, grep, and cp — no new SDKs, no new vocabulary."
tags: ["AI Agents", "TypeScript", "Developer Tools"]
coverEmoji: "🗂️"
auto_generated: true
source_url: "https://github.com/strukto-ai/mirage"
---

Every AI agent I've built eventually hits the same wall. The agent needs to read from S3, check some Slack messages, fetch a GitHub issue, and write results back to a database. So you wire up four different SDKs, write glue code for each, figure out how to pass context between them, and hope the LLM understands your custom tool definitions well enough to use them correctly.

Mirage, which landed on GitHub this week with nearly 1,500 stars in a few days, proposes a different abstraction: instead of giving your agent a pile of SDKs, give it a filesystem.

## What Mirage Actually Does

The core idea is surprisingly simple. You create a `Workspace` and mount different services as directory paths. S3 becomes `/s3`, Slack becomes `/slack`, GitHub becomes `/github`. The agent then interacts with all of them using bash commands it already knows: `cat`, `grep`, `ls`, `cp`.

```typescript
import { Workspace, RAMResource, S3Resource, SlackResource, GitHubResource } from '@struktoai/mirage-node'

const ws = new Workspace({
  '/data':   new RAMResource(),
  '/s3':     new S3Resource({ bucket: 'my-logs' }),
  '/slack':  new SlackResource({}),
  '/github': new GitHubResource({}),
})

// These all work exactly as you'd expect
await ws.execute('grep ERROR /s3/logs/2026-05-09.log | wc -l')
await ws.execute('cat /github/org/repo/issues/42.json')
await ws.execute('cp /s3/report.csv /data/local.csv')
await ws.execute('ls /slack/general/*.json | tail -20')
```

The reason this is clever: LLMs are trained on enormous amounts of Unix documentation, shell scripts, and code. Filesystem semantics are deep in their training data. You don't need to teach Claude what `grep` does. You do need to teach it what `get_slack_messages_from_channel` does — every time, with every model, with every update to your tool schema.

## Wiring It Into an Agent

The TypeScript SDK integrates directly with the Vercel AI SDK, which is what most of us are using for Next.js AI features:

```typescript
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { Workspace, S3Resource, SlackResource } from '@struktoai/mirage-node'

const ws = new Workspace({
  '/logs':  new S3Resource({ bucket: 'prod-logs' }),
  '/slack': new SlackResource({}),
  '/tmp':   new RAMResource(),
})

// Mirage generates the tool definitions the agent needs
const mirageTools = ws.toVercelAITools()

const result = await generateText({
  model: anthropic('claude-sonnet-4-6'),
  tools: mirageTools,
  maxSteps: 10,
  messages: [{
    role: 'user',
    content: 'Check /logs/errors/*.log from today, summarise the top 3 error types, and post a summary to /slack/alerts',
  }],
})
```

The `ws.toVercelAITools()` call generates properly typed tool definitions that tell Claude what filesystem operations are available. The agent works out the sequence of commands itself — you're not wiring up a pipeline, you're defining an environment.

## Custom Commands for Domain Logic

Where it gets interesting is custom commands. You can register domain-specific operations that look like shell commands to the agent:

```typescript
// Override how `cat` works for Parquet files specifically
ws.command('cat', { resource: 's3', filetype: 'parquet' }, async (path) => {
  // Parse Parquet and return JSON instead of raw bytes
  const rows = await readParquet(path)
  return JSON.stringify(rows, null, 2)
})

// Register a custom summarise command
ws.command('summarise', async (path) => {
  const content = await ws.execute(`cat ${path}`)
  const summary = await callClaude(content)
  return summary
})

// Now the agent can do:
// summarise /s3/quarterly-report.parquet
// cat /s3/events/2026-05-09.parquet | jq .user_id | sort | uniq -c
```

This is a nice escape hatch. You keep the filesystem metaphor for the agent while hiding complex logic behind familiar command names. The agent doesn't know or care that `summarise` makes an API call — it just runs a command.

## What I'd Build With This

**Incident response agent.** Mount your CloudWatch logs (`/logs`), PagerDuty alerts (`/alerts`), GitHub repo (`/code`), and Slack (`/slack`). Give an agent a runbook as a prompt and let it grep through logs, read relevant source files, and post a structured incident summary to the right Slack channel. The agent needs no knowledge of four different APIs — just bash.

**Daily standup digest for a Supabase project.** Mirage supports Supabase as a resource. Mount your database tables as paths, mount GitHub for PR history, mount Slack for recent messages. An agent running each morning could `ls /db/tasks | grep status=done`, cross-reference with `/github/prs/merged-yesterday.json`, and write a structured update to `/slack/standup`. No custom integration code for each source.

**Document pipeline with Notion + S3.** Mount Notion pages at `/notion` and S3 at `/s3`. An agent that keeps your S3 documentation in sync with a Notion wiki, using `diff /s3/docs/ /notion/wiki/` to find divergence. The `cp` and `mv` semantics make the intent obvious both to you and the LLM.

## My Take

The reason I find this compelling isn't the specific integrations — it's the abstraction. Most agent tooling today is a collection of typed functions. That works, but it means every new data source adds cognitive load for the LLM (more tool definitions to reason about) and maintenance load for you (more glue code).

A filesystem is a proven abstraction for "things that store data". The operations are finite and well-understood. Composition via pipes (`cat /s3/file | grep pattern | wc -l`) is natural to any LLM that's been trained on shell scripts. And as someone who's spent way too much time writing `get_github_issue` tool definitions, the appeal of just exposing `/github/issues/42.json` is real.

The catch is that it's early. The resource library is growing but not complete, and "virtual filesystem" semantics break down for write operations that don't map cleanly to files (sending an email isn't really `echo "..." > /gmail/sent/new.eml`). But as a mental model for read-heavy agent workflows — monitoring, summarisation, cross-service queries — it's worth experimenting with now.

```bash
npm install @struktoai/mirage-node
```
