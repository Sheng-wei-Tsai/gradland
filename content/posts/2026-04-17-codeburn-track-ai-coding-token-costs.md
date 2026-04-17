---
title: "codeburn: Finally See What Claude Code Is Actually Costing You"
date: "2026-04-17"
excerpt: "AI coding costs are getting out of hand. codeburn is a TypeScript TUI dashboard that reads your session files directly and tells you exactly where every token dollar went."
tags: ["TypeScript", "AI Tools", "Developer Tooling", "Claude Code"]
coverEmoji: "🔥"
auto_generated: true
source_url: "https://github.com/AgentSeal/codeburn"
---

I've been watching my Claude Code bill creep up for weeks without a clear picture of why. Vague 'token usage' numbers in a web dashboard tell you nothing about whether it was the refactor session at 9am or the test-writing loop at midnight that ate your budget. codeburn fixes that — it reads your local session files directly, no proxy or API keys required, and drops a real-time TUI dashboard in your terminal showing spend by task type, model, tool, and project.

## How It Works (and Why the Approach is Smart)

codeburn reads session data straight from disk. For Claude Code that's `~/.claude/projects/`, for Codex it's `~/.codex/sessions/`, for Pi it's `~/.pi/agent/sessions/`, and so on. No wrapper process sitting between you and your AI tool, no intercepting API calls — just parsing what's already been written locally. Pricing comes from LiteLLM's model list, auto-cached, so it covers basically every model you'd actually use.

Install is one line:

```bash
npm install -g codeburn
```

Or if you just want to try it without committing:

```bash
npx codeburn
```

Requires Node 20+. Cursor and OpenCode support pulls in `better-sqlite3` as an optional dep automatically — you don't need to think about it.

## The Dashboard and What the Data Actually Shows

Running `codeburn` gives you the interactive TUI with gradient charts, responsive panels, and keyboard navigation. The time range commands are where you'll spend most of your time:

```bash
codeburn today                  # what burned today
codeburn month                  # month-to-date
codeburn report -p 30days       # rolling 30-day window
codeburn report -p all          # full history
codeburn report --refresh 60    # live dashboard, refreshes every 60s
```

The breakdown that actually matters is by *activity type* — codeburn tracks one-shot success rate per task category. So you can see that your AI nails boilerplate generation first try but burns 4x the tokens on anything involving test assertions because it keeps looping through edit/test/fix cycles. That's the insight that changes how you work. If a certain task type has a terrible one-shot rate, you stop delegating it blindly and start writing a tighter prompt or just doing it yourself.

For getting data out programmatically:

```bash
codeburn report --format json   # full dashboard as JSON
codeburn status --format json   # compact one-liner, machine-readable
codeburn export -f json         # full export
codeburn export                 # CSV across today, 7-day, 30-day windows
```

There's also `codeburn optimize` which scans for waste patterns and spits out copy-paste fixes. Haven't stress-tested that one yet but the concept is sound — if you're haemorrhaging tokens on a specific project or task type, getting a concrete suggestion is better than staring at a chart.

## Pulling It Into Your Own Tooling

The JSON export format makes it trivial to pipe codeburn data into whatever you're already using for project tracking or cost reporting. A quick example — if you wanted to log daily spend to a file for later analysis:

```bash
#!/bin/bash
# daily_burn.sh — run from cron
DATE=$(date +%Y-%m-%d)
OUTDIR="$HOME/.local/share/codeburn-logs"
mkdir -p "$OUTDIR"
codeburn report -p today --format json > "$OUTDIR/$DATE.json"
```

Or if you want a quick Slack-style status message for your team's daily standup bot:

```bash
codeburn status --format json | jq -r '"AI spend today: \(.today.cost_usd | . * 100 | round / 100 | tostring) USD | Month: \(.month.cost_usd | . * 100 | round / 100 | tostring) USD"'
```

The macOS menu bar widget via SwiftBar is a nice touch too if you want spend visible without opening a terminal.

## What I'd Build With This

**Per-project budget alerts.** Export JSON on a cron, compare project-level spend against a threshold file, push a notification via `ntfy` or Slack when a project blows past its weekly budget. Useful if you're billing AI costs back to clients.

**Sprint retrospective cost attribution.** Pipe the 30-day JSON export into a script that maps sessions to Jira/Linear tickets by timestamp. At the end of a sprint you'd have actual AI cost-per-feature data, which changes prioritisation conversations fast.

**One-shot rate optimisation tracker.** Log the one-shot success rate per task type weekly. If a category's rate drops below 60%, automatically flag it in your team wiki as a prompt that needs reworking. Treat AI efficiency like you'd treat test flakiness — a metric that degrades silently unless you watch it.

The broader picture here is that AI coding spend is about to become a real line item on engineering budgets, and right now most teams are flying blind. Having per-session, per-task, per-model visibility — read directly from local files with no telemetry or account setup — is exactly the kind of tool that should have existed six months ago. I'm adding it to my standard dev environment setup alongside everything else that tells me what my machine is actually doing.
