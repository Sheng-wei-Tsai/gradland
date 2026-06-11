---
title: "shadcn/improve: Let Your Best Model Plan, Let Cheaper Models Execute"
date: "2026-06-11"
excerpt: "A new agent skill that audits your codebase with your most capable model and writes self-contained implementation plans for cheaper models to execute. Here's how it works and where I'd use it."
tags: ["AI", "Claude", "Developer Tools", "Code Review"]
coverEmoji: "🔍"
auto_generated: true
source_url: "https://github.com/shadcn/improve"
---

There's a genuinely useful pattern buried inside the new `shadcn/improve` agent skill: don't use your most capable (and expensive) model for *executing* tasks — use it for the part where intelligence actually compounds, which is understanding what's worth doing in the first place.

The tool itself just dropped on GitHub and hit 1000+ stars in a week, which tells you developers have been waiting for something like this.

## What it does

`improve` is an agent skill — think of it like a `/command` you install into Claude Code, Cursor, or any tool that supports the [Agent Skills](https://agentskills.io) format:

```bash
npx skills add shadcn/improve
```

Once installed, running `/improve` in your repo does three things:

1. Maps your entire codebase — dependencies, patterns, problem areas
2. Audits it across categories like bugs, perf, security, tests
3. Writes self-contained Markdown spec files into a `plans/` directory

The key design decision: **the skill never implements anything**. It only produces plans. Then you hand those plans to a cheaper model, a junior dev, or your regular coding agent to execute.

```
you           →  /improve              (Claude Opus 4.8, advises)
plans/        →  001-fix-n-plus-one.md (self-contained specs)
other agent   →  implements + ships    (Claude Haiku or Sonnet, executes)
```

The plan files are plain Markdown — no lock-in, no proprietary format. Any agent that can read a file can pick one up.

## The commands that matter

Beyond the basic `/improve` full audit, a few sub-commands are actually useful day-to-day:

```bash
/improve quick        # cheap pass: only the hotspots, fast
/improve security     # focused on auth, input validation, secrets
/improve branch       # audits only what changed on the current branch
/improve next         # feature suggestions — where to take the project
/improve plan <desc>  # skip the audit, spec a specific thing
/improve execute <plan>  # dispatch a cheaper executor, review its work
```

`/improve branch` is the one I'd reach for most in a PR workflow. Instead of a full-codebase audit burning expensive tokens every time, you focus the expensive model's attention on the delta. That's just sensible cost management.

`/improve plan <description>` is also useful outside the audit context — it's essentially "here's what I want to build, write me a proper spec". Good for when you know *what* you want but want a detailed implementation plan before touching code.

## Why the separation matters

The instinct is to throw your best model at everything. But planning and executing are genuinely different tasks:

- **Planning** needs broad context, good judgement, and the ability to reason about tradeoffs across a whole codebase. That's where Opus-class models earn their cost.
- **Execution** is mostly pattern-following: implement what the spec says, run the tests. Haiku handles that fine, at a fraction of the price.

If you've been running Claude Opus on every autocomplete in your editor, you're probably paying 10× for work that Haiku would have done correctly 90% of the time. The audit + plan + execute split forces you to be intentional about which tasks actually need the heavy model.

## What I'd build with this

**Automated PR review pipeline.** Wire `/improve branch` into a GitHub Actions workflow on every PR. The action drops a `plans/` file into the PR branch with findings. A reviewer comment triggers a separate workflow that runs `/improve execute` on whatever plan items are marked as auto-fixable. The expensive audit runs once; cheap execution runs as many times as needed.

**Weekly codebase health checks.** Schedule a cron job that runs `/improve quick` every Monday morning and opens a GitHub Issue with the output. No manual audit discipline required — the findings just land in your backlog automatically. Pair it with `/improve reconcile` to clean up stale findings over time.

**Onboarding spec generator for new features.** Before starting any significant feature, run `/improve plan <feature description>`. The plan file becomes the implementation ticket — shared context for the whole team, grounded in what the codebase actually looks like right now rather than what it looked like when you last thought about this area.

## My take

The model-tiering idea isn't new — people have been doing "Opus for planning, Haiku for execution" manually for a while. What `shadcn/improve` does is productise that pattern into something you can actually run consistently.

The format discipline matters too. The output is Markdown files in a `plans/` directory — boring, portable, version-controlled. You can review them in a PR, edit them before handing off to an executor, or just implement them yourself. Nothing about the tool requires you to use AI for the execution step at all.

I'd install this in any codebase I'm maintaining solo. The security and N+1 audits alone would surface things I'd otherwise miss until they became a problem. The `/improve branch` pre-push audit is the specific command I'd add to my workflow immediately.

The repo is at [github.com/shadcn/improve](https://github.com/shadcn/improve) — MIT licensed, about 1200 stars as of this week.
