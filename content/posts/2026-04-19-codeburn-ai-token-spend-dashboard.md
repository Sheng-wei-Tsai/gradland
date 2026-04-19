---
title: "CodeBurn: Track Your AI Coding Spend Before It Tracks You"
date: "2026-04-19"
excerpt: "Claude Code and Cursor bills are climbing fast and most devs have no idea where the tokens are actually going. CodeBurn is an open-source TUI dashboard that fixes that — here's how to set it up, read the source, and extend it."
tags: ["TypeScript", "AI Tooling", "Developer Tools", "Claude Code", "Open Source"]
coverEmoji: "🔥"
auto_generated: true
source_url: "https://github.com/getagentseal/codeburn"
---

My Claude Code bill last month was higher than my AWS bill. I had no real visibility into which tasks were burning tokens, which models were being called, or where the AI was chewing through retries on the same problem. CodeBurn — 2,800+ stars in a week on GitHub — solves exactly this, and it does it without proxies, API keys, or any middleware. It reads session files directly off disk.

## What It Actually Does

CodeBurn is a terminal UI dashboard written in TypeScript that parses local session data from Claude Code (`~/.claude/projects/`), Cursor, Codex, GitHub Copilot, and a few others. It maps token usage against LiteLLM's pricing data (auto-cached) and gives you breakdowns by task type, model, project, and MCP server.

The one-shot success rate metric is the part I find most useful. It tracks how often the AI nails a task first try versus burning tokens on edit/test/fix retry loops. That's where you actually find waste.

Install and run:

```bash
npm install -g codeburn
codeburn
```

Or if you don't want a global install:

```bash
npx codeburn
```

The default view is 7 days. Arrow keys cycle through Today / 7 Days / 30 Days / Month / All Time. If you want JSON output for scripting:

```bash
codeburn report --format json
codeburn status --format json
```

For continuous monitoring during a heavy coding session:

```bash
codeburn report --refresh 30
```

And when you want to find the actual waste:

```bash
codeburn optimize -p week
```

This gives you copy-paste fixes — not vague advice, specific suggestions based on your actual usage patterns.

## Reading the Source

The architecture is clean. The core read path is roughly: find session files on disk → parse provider-specific formats → normalise into a common shape → price against LiteLLM data → render with Ink (React for terminals).

Provider support is pluggable. If you look at the source, each provider implements a reader interface — that's the extension point. Adding a new AI tool means implementing that interface and registering the provider.

The pricing layer is interesting. Rather than hardcoding costs, it fetches from LiteLLM's model pricing list and caches it locally. This means new models get priced correctly without a package update.

For Cursor and OpenCode, it pulls from SQLite databases rather than JSON files, which is why `better-sqlite3` installs as an optional dependency. The conditional install is handled gracefully — if you're only on Claude Code, you won't even notice it.

## Extending It: A Next.js + Supabase Cost Logger

The `--format json` flag is the hook for building on top of this. Here's a straightforward pattern: run CodeBurn on a schedule, push the output to Supabase, and build a simple Next.js dashboard for team visibility.

First, get the JSON snapshot:

```bash
codeburn report -p 30days --format json > snapshot.json
```

Then push it to Supabase from a Node script or GitHub Action:

```typescript
import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function pushSnapshot() {
  const raw = execSync('codeburn report -p 7days --format json').toString()
  const data = JSON.parse(raw)

  const { error } = await supabase
    .from('ai_cost_snapshots')
    .insert({
      captured_at: new Date().toISOString(),
      period: '7days',
      payload: data,
      total_cost_usd: data.totalCost,
      top_model: data.models?.[0]?.name ?? null,
    })

  if (error) throw error
  console.log('Snapshot pushed')
}

pushSnapshot()
```

Run that as a cron job or GitHub Action nightly. Your Supabase table gives you a time-series of spend, and you can query it in a Next.js route handler for a simple team dashboard. On a shared dev team, this means everyone can see aggregate spend without needing access to anyone's local machine.

The CSV export (`codeburn export`) is also useful here if you want to pipe data into Google Sheets or a BI tool without writing any code.

## What I'd Build With This

**Per-project billing dashboard for freelancers.** Use the project-level breakdowns in the JSON output to attribute AI costs to client work. Automate a weekly report that shows exactly how much Claude spent on Project A vs Project B. Makes invoicing and scope conversations a lot easier.

**Slack alerting on daily spend thresholds.** A lightweight GitHub Action that runs `codeburn status --format json`, checks if `todayCost` exceeds a threshold, and fires a Slack webhook. Zero infrastructure, useful immediately.

**Team leaderboard for one-shot success rate.** If multiple devs on a team each run CodeBurn and push to a shared Supabase instance, you can surface who's getting first-try results and who's in retry hell — useful signal for figuring out where prompt engineering effort is worth spending.

The pace at which AI tooling costs are compounding makes visibility non-negotiable. CodeBurn isn't perfect — the provider coverage has gaps and the macOS menubar app is still rough — but it's the most practical open-source option right now, and the architecture is easy enough to extend that filling those gaps yourself is a half-day job, not a project.
