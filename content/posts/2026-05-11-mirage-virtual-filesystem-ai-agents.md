---
title: "Your AI Agent Already Knows Bash — Use It"
date: "2026-05-11"
excerpt: "Mirage mounts S3, Slack, GitHub, Supabase, and Gmail as a single virtual filesystem so your AI agent can grep, cat, and cp across all of them."
tags: ["AI Agents", "TypeScript", "Developer Tools"]
coverEmoji: "🗂️"
auto_generated: true
source_url: "https://github.com/strukto-ai/mirage"
---

Every time I build an AI agent that needs to touch more than one data source, I end up writing the same boilerplate: an S3 adapter, a Slack client wrapper, a GitHub API helper, a Supabase query layer. Each one speaks a different API, has different error shapes, and needs its own authentication config. The agent logic ends up buried under glue code.

[Mirage](https://github.com/strukto-ai/mirage) (7k+ stars this week, from [strukto.ai](https://www.strukto.ai)) takes a different approach: give the agent one filesystem, and mount every service into it.

## What it actually does

Mirage exposes a `Workspace` that you populate with resources. Each resource maps a path prefix to a backend — S3, Slack, GitHub, Gmail, Redis, Supabase, MongoDB, Discord, Notion, and more. The agent then uses a small set of familiar Unix-like commands (`cat`, `grep`, `cp`, `ls`, `wc`) across all of them.

```ts
import { Workspace, S3Resource, SlackResource, GitHubResource, RAMResource } from '@struktoai/mirage-node';

const ws = new Workspace({
  '/data':   new RAMResource(),
  '/s3':     new S3Resource({ bucket: 'my-logs' }),
  '/slack':  new SlackResource({}),
  '/github': new GitHubResource({}),
});

// These work across mounts — the agent doesn't care what's underneath
await ws.execute('grep "ERROR" /slack/general/*.json | wc -l');
await ws.execute('cat /github/myorg/myrepo/README.md');
await ws.execute('cp /s3/report.csv /data/local.csv');
```

The insight is sharp: modern LLMs are trained on enormous amounts of bash and Unix documentation. They already know how to compose commands with pipes, redirect output, and reason about file paths. Mirage makes that vocabulary useful across real services instead of just local disk.

## The command override system

Beyond the standard Unix tools, you can register custom commands and override built-ins for specific resource + filetype combinations:

```ts
// Override cat for parquet files in S3 — returns rows as JSON instead of raw bytes
ws.command('cat', { resource: 's3', filetype: 'parquet' }, async (path) => {
  const rows = await readParquet(path);
  return JSON.stringify(rows, null, 2);
});

// Register a brand-new command available across every mount
ws.command('summarize', async (path) => {
  const content = await ws.execute(`cat ${path}`);
  return callClaude(`Summarise this:\n${content}`);
});

await ws.execute('summarize /github/myorg/myrepo/README.md');
await ws.execute('cat /s3/events/2026-05-06.parquet | jq .user_id');
```

This is where it gets practical. You're not locked into the default tool semantics — you can make `cat` on a CSV return column-aligned output, or make `grep` on a Slack resource search message content rather than raw JSON.

## Portable workspaces

One thing that doesn't show up until you read deeper: workspaces can be cloned, snapshotted, and moved between machines. If you're running agent workflows in GitHub Actions or on Vercel, you can snapshot a workspace state and restore it in the next run without re-fetching everything from source. For long-running research agents that accumulate intermediate results, this is non-trivial.

The TypeScript SDK is on npm (`@struktoai/mirage-node`) and there's a Python SDK too (`mirage-ai` on PyPI). The TypeScript one is what I'd reach for in a Next.js route handler.

## What I'd build with this

**Agent-powered Slack digest.** Mount `/slack` and `/s3` in a Mirage workspace. Run a nightly job that greps for specific keywords across channels, copies the matching messages to S3, then runs a summarise command. No Slack SDK boilerplate, no custom S3 client — just compose the pipeline with familiar tools.

**Multi-source code review bot.** Mount `/github` and `/notion`. When a PR opens, `cat` the diff, cross-reference architecture decisions from `/notion/docs/`, and post a comment. The agent reasons about both sources the same way — no switching mental models between the GitHub API and the Notion API.

**Supabase analytics pipeline.** Mirage supports Supabase as a resource. Mount your Supabase tables at `/db`, your S3-compatible storage at `/storage`, and a RAM workspace at `/output`. An agent can query, transform, and cache results in a single pipeline that reads like a shell script.

---

I've been skeptical of the "give the AI a filesystem" framing before — it felt like it was solving the wrong problem. But the key move Mirage makes is that it's not about making AI agents feel like they're on a computer; it's about giving the agent a single vocabulary that works everywhere. LLMs are fluent in bash. Mirage exploits that fluency.

The project is pre-release and the resource catalogue is still growing, but the TypeScript SDK is usable today. Worth keeping an eye on — the idea is clean enough that it's going to stick around.
